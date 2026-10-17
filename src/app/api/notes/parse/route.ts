import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { parseUrl } from "@/lib/notes/parsers/url";
import { parsePdf } from "@/lib/notes/parsers/pdf";
import { parseDocx } from "@/lib/notes/parsers/docx";

const RefineSchema = z.object({
  title: z.string().describe("4-6 word Title Case title"),
  refined_body: z.string().describe("Full HTML study notes"),
  tags: z.array(z.string()).describe("3-6 tags"),
  summary: z.array(z.string()).describe("3 bullet summary"),
});

const MODEL_IDS = ["gemini-2.5-flash", "gemini-2.0-flash-exp"];

function friendly(message: string): string {
  return message;
}

async function refineWithAI(rawText: string, source: string) {
  const system = `You are a study partner for a software engineering student. Turn imported content into clear, structured, teaching HTML notes.

RULES:
- Return ONLY inner HTML. Allowed tags: <p>, <strong>, <em>, <h2>, <h3>, <ul>, <ol>, <li>, <code>, <pre>, <blockquote>, <a href="">.
- Wrap every paragraph in <p>.
- Use <h2> for major sections, <h3> for subsections.
- Preserve all factual content. Do NOT invent.
- Answer any questions in the source. Do NOT repeat questions.
- Include <pre><code> blocks for code.
- End with a "Key takeaways" <ul> list.

TITLE: 4-6 words, Title Case.
TONE: Direct, teaching, no filler.`;

  const truncated = rawText.slice(0, 30000);

  for (const modelId of MODEL_IDS) {
    try {
      const { object } = await generateObject({
        model: google(modelId),
        schema: RefineSchema,
        system,
        prompt: `Source: ${source}\n\nContent:\n\n${truncated}`,
      });
      return object;
    } catch (err: any) {
      console.error(`[parse] ${modelId} refine failed:`, err?.message);
      continue;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to import content" }, { status: 401 });
    }

    const { type, url, signedUrl, fileName } = await req.json();

    let extractedText = "";
    let source = type;

    if (type === "url") {
      try {
        const parsed = await parseUrl(url);
        extractedText = `# ${parsed.title}\n\n${parsed.description ? parsed.description + "\n\n" : ""}${parsed.content}`;
        source = `url: ${parsed.url}`;
      } catch (err: any) {
        console.error("[parse] URL parse failed:", err?.message);

        return NextResponse.json(
          { error: err.message || "We couldn't read that URL" },
          { status: 400 }
        );
      }
    } else if (type === "pdf" || type === "docx" || type === "markdown") {
      if (!signedUrl) {
        return NextResponse.json({ error: "Please upload a file first" }, { status: 400 });
      }

      let res: Response;
      try {
        res = await fetch(signedUrl);
      } catch (err: any) {
        console.error("[parse] download failed:", err?.message);
        return NextResponse.json(
          { error: "We couldn't download your file. Please try again." },
          { status: 500 }
        );
      }

      if (!res.ok) {
        console.error("[parse] download status:", res.status);
        return NextResponse.json(
          { error: "We couldn't download your file. Please try again." },
          { status: 500 }
        );
      }

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        if (type === "pdf") {
          extractedText = await parsePdf(buffer);
        } else if (type === "docx") {
          extractedText = await parseDocx(buffer);
        } else {
          extractedText = buffer.toString("utf-8");
        }
      } catch (err: any) {
        console.error("[parse] file extraction failed:", err?.message);
        return NextResponse.json(
          {
            error: err.message || "We couldn't read this file. Try a different format.",
          },
          { status: 400 }
        );
      }

      source = `${type}: ${fileName || "file"}`;
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json(
        {
          error:
            "This file has almost no readable content. It may be an image-based PDF or an empty document.",
        },
        { status: 400 }
      );
    }

    const refined = await refineWithAI(extractedText, source);

    return NextResponse.json({
      success: true,
      raw_text: extractedText,
      refined,
    });
  } catch (err: any) {
    console.error("[parse] unexpected:", err);
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
