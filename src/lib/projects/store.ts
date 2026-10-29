import { createClient } from "@/lib/supabase/client";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: "planning" | "active" | "paused" | "done";
  github_url: string | null;
  local_path: string | null;
  figma_url: string | null;
  deployed_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectSpec = {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  file_type: string | null;
  file_url: string | null;
  file_size: number | null;
  extracted_text: string | null;
  created_at: string;
};

export type ProjectChat = {
  id: string;
  project_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export async function listProjects(): Promise<Project[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data as Project | null;
}

export async function createProject(params: {
  name: string;
  description?: string;
  status?: "planning" | "active" | "paused" | "done";
}): Promise<Project> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: params.name,
      description: params.description || null,
      status: params.status || "active",
    })
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw error;
}

export async function listProjectSpecs(projectId: string): Promise<ProjectSpec[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("project_specs")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as ProjectSpec[];
}

export async function deleteProjectSpec(id: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("project_specs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}

export async function listProjectChats(projectId: string): Promise<ProjectChat[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("project_chats")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as ProjectChat[];
}

export async function saveProjectChat(
  projectId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("project_chats").insert({
    project_id: projectId,
    user_id: user.id,
    role,
    content,
  });
}

export async function clearProjectChats(projectId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("project_chats").delete().eq("project_id", projectId);
}

export async function uploadProjectFile(
  file: File,
  projectId: string
): Promise<{ path: string; signedUrl: string }> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  const path = `${session.user.id}/${projectId}/${Date.now()}-${safeName}`;

  const { error: upErr } = await supabase.storage.from("project-specs").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (upErr) throw upErr;

  const { data: signed, error: signErr } = await supabase.storage
    .from("project-specs")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  if (signErr || !signed?.signedUrl) throw new Error("Failed to sign URL");

  return { path, signedUrl: signed.signedUrl };
}

export const SUPPORTED_SPEC_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "text/plain",
  "text/markdown",
];
