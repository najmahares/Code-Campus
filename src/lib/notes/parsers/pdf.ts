import { getDocumentProxy, extractText } from "unpdf";

const MAX_PDF_SIZE = 15 * 1024 * 1024;

export async function parsePdf(buffer: Buffer): Promise<string> {
  if (buffer.length > MAX_PDF_SIZE) {
    throw new Error("PDF is too large (max 15MB)");
  }

  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const result = await extractText(pdf, { mergePages: true });
  const text = (result.text || "").trim();

  if (!text) {
    throw new Error("This PDF contains no extractable text (it may be a scanned image)");
  }
  return text;
}
