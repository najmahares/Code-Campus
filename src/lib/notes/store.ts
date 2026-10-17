import { createClient } from "@/lib/supabase/client";

export type Note = {
  id: string;
  user_id: string;
  title: string;
  raw_body: string;
  refined_body: string | null;
  tags: string[];
  status: string;
  source_type: string;
  bucket_id: string | null;
  pinned: boolean;
  archived: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NoteFilter = "active" | "archived" | "all";

export async function listNotes(filter: NoteFilter = "active"): Promise<Note[]> {
  const supabase = createClient();
  let q = supabase.from("notes").select("*").is("deleted_at", null);
  if (filter === "active") {
    q = q.or("archived.eq.false,archived.is.null");
  } else if (filter === "archived") {
    q = q.eq("archived", true);
  }
  const { data, error } = await q
    .order("pinned", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createNote(params: {
  title?: string;
  raw_body: string;
  source_type?: string;
  bucket_id?: string | null;
}): Promise<Note> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: params.title || "Untitled",
      raw_body: params.raw_body,
      source_type: params.source_type || "typed",
      bucket_id: params.bucket_id || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
}

export async function refineNote(rawBody: string, currentTitle?: string) {
  const res = await fetch("/api/notes/refine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawBody, currentTitle }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Refine failed" }));
    throw new Error(err.error || "Refine failed");
  }
  return res.json() as Promise<{
    success: boolean;
    title: string;
    refined_body: string;
    tags: string[];
    summary: string[];
  }>;
}

export async function uploadAttachment(file: File, noteId: string): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const path = `${user.id}/${noteId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from("note-attachments")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;

  const { data } = await supabase.storage.from("note-attachments").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAudio(blob: Blob, noteId: string): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const path = `${user.id}/${noteId}/${Date.now()}.webm`;
  const { error } = await supabase.storage
    .from("note-audio")
    .upload(path, blob, { cacheControl: "3600", upsert: false, contentType: "audio/webm" });
  if (error) throw error;

  const { data } = await supabase.storage.from("note-audio").createSignedUrl(path, 3600);
  return data?.signedUrl || "";
}

export function generateTitle(rawBody: string): string {
  const plain = rawBody
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return "Untitled Note";

  const firstSentence = plain.split(/[.!?]/)[0].trim();
  if (firstSentence.length < 4) return plain.slice(0, 50);

  if (firstSentence.length <= 50) {
    return firstSentence
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  const words = firstSentence.split(" ").slice(0, 8).join(" ");
  return (
    words
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ") + "..."
  );
}

export type QuizAttempt = {
  id: string;
  user_id: string;
  note_id: string;
  topic: string | null;
  difficulty: string;
  settings: any;
  questions: any[];
  answers: any[];
  score: number;
  total: number;
  created_at: string;
};

export async function saveQuizAttempt(params: {
  noteId: string;
  topic: string;
  difficulty: string;
  settings: any;
  questions: any[];
  answers: any[];
  score: number;
  total: number;
}): Promise<QuizAttempt> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      note_id: params.noteId,
      topic: params.topic,
      difficulty: params.difficulty,
      settings: params.settings,
      questions: params.questions,
      answers: params.answers,
      score: params.score,
      total: params.total,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listQuizAttempts(noteId: string): Promise<QuizAttempt[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("note_id", noteId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function togglePin(id: string, pinned: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("notes")
    .update({ pinned, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function softDeleteNote(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("notes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function restoreNote(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("notes").update({ deleted_at: null }).eq("id", id);
  if (error) throw error;
}

export async function hardDeleteNote(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkArchive(ids: string[], archived: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("notes")
    .update({ archived, updated_at: new Date().toISOString() })
    .in("id", ids);
  if (error) throw error;
}

export async function saveVersion(
  noteId: string,
  body: string,
  versionType: string
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("note_versions").insert({
    note_id: noteId,
    user_id: user.id,
    body,
    version_type: versionType,
  });
}

export async function listVersions(noteId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("note_versions")
    .select("*")
    .eq("note_id", noteId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data || [];
}

export async function countNotes(): Promise<{ active: number; archived: number; total: number }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { active: 0, archived: 0, total: 0 };

  const { count: active } = await supabase
    .from("notes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .or("archived.eq.false,archived.is.null")
    .is("deleted_at", null);

  const { count: archived } = await supabase
    .from("notes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("archived", true)
    .is("deleted_at", null);

  return {
    active: active || 0,
    archived: archived || 0,
    total: (active || 0) + (archived || 0),
  };
}
