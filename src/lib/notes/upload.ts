import { createClient } from "@/lib/supabase/client";

const BUCKET = "note-attachments";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365;

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

export async function uploadNoteFile(file: File): Promise<{ path: string; signedUrl: string }> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("You must be signed in to upload files");

  const userId = session.user.id;
  const path = `${userId}/${Date.now()}-${sanitize(file.name)}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });

  if (uploadError) throw new Error(uploadError.message);

  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);

  if (signError || !signed?.signedUrl) throw new Error("Failed to sign URL");

  return { path, signedUrl: signed.signedUrl };
}

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];
export const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/markdown",
  "text/plain",
];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
