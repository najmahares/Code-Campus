import { createClient } from "@/lib/supabase/client";

export type SearchResult = {
  id: string;
  type: "note" | "project" | "task" | "vault";
  title: string;
  subtitle: string;
  href: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];
  const supabase = createClient();
  const q = `%${query}%`;

  const [notes, projects, tasks, vault] = await Promise.all([
    supabase
      .from("notes")
      .select("id, title, raw_body")
      .is("deleted_at", null)
      .ilike("title", q)
      .limit(4),
    supabase.from("projects").select("id, name, description").ilike("name", q).limit(4),
    supabase.from("tasks").select("id, title, completed").ilike("title", q).limit(4),
    supabase.from("vault_items").select("id, title, description").ilike("title", q).limit(4),
  ]);

  const results: SearchResult[] = [];

  (notes.data || []).forEach((n) => {
    results.push({
      id: n.id,
      type: "note",
      title: n.title || "Untitled",
      subtitle: n.raw_body ? n.raw_body.slice(0, 50) + "..." : "Note",
      href: `/notes?id=${n.id}`,
    });
  });

  (projects.data || []).forEach((p) => {
    results.push({
      id: p.id,
      type: "project",
      title: p.name,
      subtitle: p.description || "Project",
      href: `/projects/${p.id}`,
    });
  });

  (tasks.data || []).forEach((t) => {
    results.push({
      id: t.id,
      type: "task",
      title: t.title,
      subtitle: t.completed ? "Completed task" : "Active task",
      href: `/today`,
    });
  });

  (vault.data || []).forEach((v) => {
    results.push({
      id: v.id,
      type: "vault",
      title: v.title,
      subtitle: v.description || "Vault item",
      href: `/vault`,
    });
  });

  return results;
}
