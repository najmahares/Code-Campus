import mammoth from "mammoth";

const MAX_DOCX_SIZE = 15 * 1024 * 1024;

export async function parseDocx(buffer: Buffer): Promise<string> {
  if (buffer.length > MAX_DOCX_SIZE) {
    throw new Error("DOCX is too large (max 15MB)");
  }
  const result = await mammoth.extractRawText({ buffer });
  const text = (result.value || "").trim();
  if (!text) {
    throw new Error("This DOCX contains no extractable text");
  }
  return text;
}
