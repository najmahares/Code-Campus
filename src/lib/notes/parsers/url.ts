import * as cheerio from "cheerio";

const MAX_HTML_SIZE = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 12000;

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local")) return true;
  if (h === "metadata.google.internal") return true;
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [_, a, b] = ipv4.map(Number);
    if (a === 10 || a === 127 || a === 0 || a >= 224) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  if (h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) return true;
  return false;
}

export type ParsedUrl = {
  title: string;
  description: string;
  content: string;
  url: string;
};

async function fetchDirect(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Upgrade-Insecure-Requests": "1",
      },
    });
    clearTimeout(timeout);

    if (res.status === 401 || res.status === 403) throw new Error("BLOCKED");
    if (res.status === 404) throw new Error("That page doesn't exist. Check the link.");
    if (res.status === 429) throw new Error("The site is rate-limiting us. Try again.");
    if (!res.ok) throw new Error(`The site returned an error (${res.status}).`);

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html") && !ct.includes("text/plain")) {
      throw new Error("That URL is not a web page.");
    }

    const html = await res.text();
    if (html.length > MAX_HTML_SIZE) throw new Error("That page is too large.");

    const $ = cheerio.load(html);
    $("script, style, noscript, iframe, nav, footer, header, aside, form, svg").remove();

    const title = ($("title").first().text() || $("h1").first().text() || "").trim();
    const description = ($('meta[name="description"]').attr("content") || "").trim();
    const main =
      $("article").length > 0
        ? $("article")
        : $("main").length > 0
          ? $("main")
          : $('[role="main"]').length > 0
            ? $('[role="main"]')
            : $("body");

    const content = main.text().replace(/\s+/g, " ").trim().slice(0, 20000);
    if (content.length < 150) throw new Error("BLOCKED");

    return JSON.stringify({ title, description, content });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") throw new Error("TIMEOUT");
    throw err;
  }
}

async function fetchViaJina(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      signal: controller.signal,
      headers: { Accept: "text/plain", "User-Agent": "CodeCampus/1.0" },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Jina returned ${res.status}`);
    const text = await res.text();
    if (!text || text.length < 150) throw new Error("No content from Jina");

    const lines = text.split("\n");
    let title = url;
    let content = text;
    const titleMatch = text.match(/^Title:\s*(.+)$/m);
    if (titleMatch) title = titleMatch[1].trim();
    const contentStart = text.indexOf("Markdown Content:");
    if (contentStart > -1) content = text.slice(contentStart + 17).trim();

    return JSON.stringify({
      title: title.slice(0, 200),
      description: "",
      content: content.slice(0, 20000),
    });
  } catch (err: any) {
    clearTimeout(timeout);
    throw err;
  }
}

export async function parseUrl(rawUrl: string): Promise<ParsedUrl> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https links are supported.");
  }
  if (isPrivateHost(parsed.hostname)) {
    throw new Error("That URL points to a private network and cannot be fetched.");
  }

  try {
    const result = JSON.parse(await fetchDirect(parsed.toString()));
    return { ...result, url: parsed.toString() };
  } catch (err: any) {
    if (
      err.message === "That page doesn't exist. Check the link." ||
      err.message === "The site is rate-limiting us. Try again." ||
      err.message === "That URL is not a web page." ||
      err.message === "That page is too large."
    ) {
      throw err;
    }
  }

  try {
    const result = JSON.parse(await fetchViaJina(parsed.toString()));
    return { ...result, url: parsed.toString() };
  } catch {
    throw new Error(
      "This site blocks automated readers. Try copying the article text and using Paste text instead."
    );
  }
}
