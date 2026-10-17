import { createClient } from "@/lib/supabase/client";

export type VaultType = "secret" | "snippet" | "command" | "env_var";

export type VaultItem = {
  id: string;
  user_id: string;
  title: string;
  type: VaultType;
  value: string;
  description: string | null;
  language: string | null;
  tags: string[];
  pinned: boolean;
  last_copied_at: string | null;
  copy_count: number;
  created_at: string;
  updated_at: string;
};

export const TYPE_LABELS: Record<VaultType, string> = {
  secret: "Secret",
  snippet: "Code Snippet",
  command: "Command",
  env_var: "Env Variable",
};

export async function listVaultItems(): Promise<VaultItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vault_items")
    .select("*")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as VaultItem[];
}

export async function createVaultItem(params: {
  title: string;
  type: VaultType;
  value: string;
  description?: string;
  language?: string;
  tags?: string[];
}): Promise<VaultItem> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("vault_items")
    .insert({
      user_id: user.id,
      title: params.title,
      type: params.type,
      value: params.value,
      description: params.description || null,
      language: params.language || null,
      tags: params.tags || [],
    })
    .select()
    .single();
  if (error) throw error;
  return data as VaultItem;
}

export async function updateVaultItem(id: string, updates: Partial<VaultItem>): Promise<VaultItem> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vault_items")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as VaultItem;
}

export async function deleteVaultItem(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("vault_items").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleVaultPin(id: string, pinned: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("vault_items")
    .update({ pinned, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function recordCopy(id: string): Promise<void> {
  const supabase = createClient();
  const { data: current } = await supabase
    .from("vault_items")
    .select("copy_count")
    .eq("id", id)
    .maybeSingle();
  const nextCount = (current?.copy_count || 0) + 1;
  await supabase
    .from("vault_items")
    .update({
      copy_count: nextCount,
      last_copied_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export function maskValue(value: string): string {
  if (value.length <= 8) return "•".repeat(value.length);
  return value.slice(0, 4) + "•".repeat(Math.min(value.length - 8, 24)) + value.slice(-4);
}

export function detectLanguage(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.startsWith("sk-") || v.startsWith("pk-")) return "api_key";
  if (v.startsWith("postgres://") || v.startsWith("postgresql://")) return "postgres_url";
  if (v.startsWith("mongodb")) return "mongo_url";
  if (v.startsWith("http")) return "url";
  if (v.includes("eyj")) return "jwt";
  return "text";
}
