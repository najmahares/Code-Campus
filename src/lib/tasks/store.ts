import { createClient } from "@/lib/supabase/client";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  completed: boolean;
  completed_at: string | null;
  snoozed_until: string | null;
  linked_note_id: string | null;
  linked_project_id: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export async function listTasks(): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("completed", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Task[];
}

export async function createTask(params: {
  title: string;
  description?: string;
  due_date?: string | null;
  priority?: "low" | "medium" | "high";
  linked_note_id?: string | null;
  linked_project_id?: string | null;
}): Promise<Task> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: params.title,
      description: params.description || null,
      due_date: params.due_date || null,
      priority: params.priority || "medium",
      linked_note_id: params.linked_note_id || null,
      linked_project_id: params.linked_project_id || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Task;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleTaskComplete(id: string, completed: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function snoozeTask(id: string, untilDate: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      snoozed_until: untilDate,
      due_date: untilDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function isOverdue(task: Task): boolean {
  if (task.completed || !task.due_date) return false;
  return task.due_date < getTodayString();
}

export function isDueToday(task: Task): boolean {
  if (task.completed || !task.due_date) return false;
  return task.due_date === getTodayString();
}

export function isUpcoming(task: Task): boolean {
  if (task.completed || !task.due_date) return false;
  return task.due_date > getTodayString();
}

export function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const today = getTodayString();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  const d = new Date(dateStr + "T00:00:00");
  const diffDays = Math.floor((d.getTime() - new Date(today + "T00:00:00").getTime()) / 86400000);
  if (diffDays > 0 && diffDays < 7) {
    return d.toLocaleDateString("en-US", { weekday: "long" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
