import { createClient } from "@/lib/supabase/client";

export type ActivityKind = "note" | "task" | "project" | "vault" | "mood" | "gratitude" | "rant";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  title: string;
  sub: string;
  created_at: string;
};

export async function listRecentActivity(limit = 4): Promise<ActivityItem[]> {
  const supabase = createClient();
  const per = 6;

  const [notes, tasks, projects, vault, moods, gratitude] = await Promise.all([
    supabase
      .from("notes")
      .select("id, title, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(per),
    supabase
      .from("tasks")
      .select("id, title, completed, completed_at, created_at")
      .order("created_at", { ascending: false })
      .limit(per),
    supabase
      .from("projects")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(per),
    supabase
      .from("vault_items")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(per),
    supabase
      .from("mood_entries")
      .select("id, mood_score, created_at")
      .order("created_at", { ascending: false })
      .limit(per),
    supabase
      .from("gratitude_entries")
      .select("id, content, created_at")
      .order("created_at", { ascending: false })
      .limit(per),
  ]);

  const items: ActivityItem[] = [];
  const moodLabels = ["Really struggling", "Running low", "Okay", "Good", "Really good"];

  for (const n of notes.data || []) {
    items.push({
      id: "note-" + n.id,
      kind: "note",
      title: "You added a note",
      sub: n.title || "Untitled",
      created_at: n.created_at,
    });
  }
  for (const t of tasks.data || []) {
    if (t.completed && t.completed_at) {
      items.push({
        id: "task-done-" + t.id,
        kind: "task",
        title: "You completed a task",
        sub: t.title,
        created_at: t.completed_at,
      });
    } else {
      items.push({
        id: "task-" + t.id,
        kind: "task",
        title: "You planned a task",
        sub: t.title,
        created_at: t.created_at,
      });
    }
  }
  for (const p of projects.data || []) {
    items.push({
      id: "proj-" + p.id,
      kind: "project",
      title: "You started a project",
      sub: p.name,
      created_at: p.created_at,
    });
  }
  for (const v of vault.data || []) {
    items.push({
      id: "vault-" + v.id,
      kind: "vault",
      title: "You saved a secret",
      sub: v.title,
      created_at: v.created_at,
    });
  }
  for (const m of moods.data || []) {
    items.push({
      id: "mood-" + m.id,
      kind: "mood",
      title: "You checked in",
      sub: "Mood: " + (moodLabels[m.mood_score - 1] || "—"),
      created_at: m.created_at,
    });
  }
  for (const g of gratitude.data || []) {
    const sub = (g.content || "").slice(0, 60);
    items.push({
      id: "grat-" + g.id,
      kind: "gratitude",
      title: "You wrote gratitude",
      sub,
      created_at: g.created_at,
    });
  }

  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return items.slice(0, limit);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + "d ago";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
