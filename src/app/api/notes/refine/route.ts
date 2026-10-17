import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const RefineSchema = z.object({
  title: z.string(),
  refined_body: z.string(),
  tags: z.array(z.string()),
  summary: z.array(z.string()),
});

const MODEL_IDS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"];

const SYSTEM_PROMPT = `You are a patient software engineering tutor writing study notes for a student. Your job is to TEACH through the notes, not just format them.

STEP 1 — ASSESS THE STUDENT'S LEVEL
Read the raw notes carefully. Decide: is this a total beginner? Confused about a concept? Intermediate hitting edge cases? Use ONLY context from the raw notes.

STEP 2 — TEACH AT THAT LEVEL
Write notes that answer every question AND fill gaps the student didn't know to ask about. If they ask "What is Python?", teach what it is, why it exists, simple examples. STOP there. Do NOT mention virtual environments, linters, or async.

STEP 3 — BE THOROUGH
Minimum length: equivalent to 2 pages. Structure: short intro (2-3 sentences), 3-5 major sections with <h2>, within each section explain the "what", the "why", and a concrete example. Include 1-2 short code blocks where relevant (2-5 lines each). End with a "Key takeaways" section.

STEP 4 — BE RELEVANT
Every fact must relate to what the student is asking about. If they wrote 5 words, teach those 5 words properly.

RULES:
- ANSWER questions in the notes. Never repeat a question as content.
- DEFINE technical terms the first time they appear, inline.
- EXPAND bare statements into full explanations.
- USE analogies when a concept is abstract.
- INCLUDE code examples when explaining anything that runs.

OUTPUT FORMAT:
- Return ONLY inner HTML. No <html>, <body>, <div>, <span>, no inline styles.
- Allowed tags ONLY: <p>, <strong>, <em>, <h2>, <h3>, <ul>, <ol>, <li>, <code>, <pre>, <blockquote>, <a href="">.
- Wrap every paragraph in <p>.
- Use <h2> for major sections, <h3> for subsections.

TITLE: 4-6 words, Title Case, describes the topic.

TONE: Direct, clear, warm. No filler, no "Great question!".`;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = rateLimit(ip, 10, 60000);
  if (!success) {
    return NextResponse.json(
      { error: "Whoa there! You've hit the limit. Wait a minute and try again." },
      { status: 429 }
    );
  }

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
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rawBody, currentTitle } = await req.json();
    if (!rawBody || rawBody.length < 3) {
      return NextResponse.json({ error: "Note is too short to refine" }, { status: 400 });
    }

    const plainBody = rawBody
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const prompt = currentTitle
      ? `Current title: "${currentTitle}"\n\nStudent's rough notes:\n\n${plainBody}`
      : `Student's rough notes:\n\n${plainBody}`;

    const errors: string[] = [];

    for (const modelId of MODEL_IDS) {
      try {
        const { object } = await generateObject({
          model: groq(modelId),
          schema: RefineSchema,
          system: SYSTEM_PROMPT,
          prompt,
        });
        return NextResponse.json({ success: true, ...object });
      } catch (err: any) {
        errors.push(`${modelId}: ${err?.message || err}`);
        continue;
      }
    }

    return NextResponse.json(
      { error: `All models failed:\n${errors.join("\n")}` },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to refine" }, { status: 500 });
  }
}
