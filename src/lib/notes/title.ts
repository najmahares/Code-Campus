export function generateTitle(rawBody: string): string {
  const plain = rawBody
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) return "Untitled Note";

  const sentences = plain
    .split(/[.!?\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
  let chosen = sentences[0] || plain;

  if ((chosen.endsWith("?") || chosen.length > 60) && sentences[1]) {
    chosen = sentences[1];
  }

  const words = chosen.split(/\s+/).slice(0, 6).join(" ");

  const cleaned = words.replace(/[,;:.\-]+$/, "").trim();
  return cleaned
    .split(" ")
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w.toLowerCase()))
    .join(" ");
}
