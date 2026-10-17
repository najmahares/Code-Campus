import { createClient } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_seed: string;
  notification_prefs: Record<string, boolean>;
  created_at: string;
  updated_at: string;
};

export const AVATAR_SEEDS = [
  "amani",
  "zuri",
  "nia",
  "imani",
  "amara",
  "sanaa",
  "tumaini",
  "neema",
  "aisha",
  "zainabu",
  "kofi",
  "jabari",
];

export const AVATAR_BG = "f5c5cb";

const SKIN_PALETTE = "ae5d29,8d5524,614335,d08b5b";
const HAIR_PALETTE = "2c1b18,4a312c,724133,0e0e0e,562306,ac6651";

export function avatarUrl(seed: string, size = 128): string {
  return (
    "https://api.dicebear.com/9.x/micah/svg" +
    "?seed=" + encodeURIComponent(seed) +
    "&backgroundColor=" + AVATAR_BG +
    "&skinColor=" + SKIN_PALETTE +
    "&hairColor=" + HAIR_PALETTE +
    "&baseColor=" + SKIN_PALETTE +
    "&radius=50" +
    "&size=" + size
  );
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    const fallback: Profile = {
      id: user.id,
      display_name:
        (user.user_metadata?.full_name as string) ||
        user.email?.split("@")[0] ||
        null,
      avatar_seed: "amani",
      notification_prefs: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await supabase.from("profiles").upsert(fallback, { onConflict: "id" });
    return fallback;
  }

  return data as Profile;
}

export async function updateProfile(
  updates: Partial<Pick<Profile, "display_name" | "avatar_seed" | "notification_prefs">>
): Promise<Profile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function getDisplayName(): Promise<string> {
  const profile = await getProfile();
  if (profile?.display_name) return profile.display_name.split(" ")[0];
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    (user?.user_metadata?.full_name as string)?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "friend"
  );
}
