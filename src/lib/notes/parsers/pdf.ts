const MAX_PDF_SIZE = 15 * 1024 * 1024;

export async function parsePdf(buffer: Buffer): Promise<string> {
  if (buffer.length > MAX_PDF_SIZE) {
    throw new Error("PDF is too large (max 15MB)");
  }

  const pdfParse = require("pdf-parse") as (b: Buffer) => Promise<{ text: string }>;

  try {
    const data = await pdfParse(buffer);
    const text = (data.text || "").trim();

    if (!text) {
      throw new Error(
        "This PDF has no readable text. It may be a scanned image. Try uploading it as a screenshot instead."
      );
    }

    return text;
  } catch (err: any) {
    if (err.message?.includes("no readable text") || err.message?.includes("too large")) {
      throw err;
    }
    console.error("[pdf] parse failed:", err?.message);
    throw new Error("We couldn't read this PDF. Try re-saving it, or upload a screenshot instead.");
  }
}
