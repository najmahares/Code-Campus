export function generateTitle(rawBody: string): string {
  const plain = rawBody
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) return "Untitled Note";

  // Split into sentences, take the most meaningful one
  const sentences = plain.split(/[.!?\n]/).map((s) => s.trim()).filter((s) => s.length > 3);
  let chosen = sentences[0] || plain;

  // If first sentence is a question or too long, take the second
  if ((chosen.endsWith("?") || chosen.length > 60) && sentences[1]) {
    chosen = sentences[1];
  }

  // Take max 6 words
  const words = chosen.split(/\s+/).slice(0, 6).join(" ");

  // Trim trailing punctuation and capitalize
  const cleaned = words.replace(/[,;:.\-]+$/, "").trim();
  return cleaned
    .split(" ")
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w.toLowerCase()))
    .join(" ");
}
