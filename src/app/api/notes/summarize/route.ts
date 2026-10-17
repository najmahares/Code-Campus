import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SummarySchema = z.object({
  bullets: z.array(z.string()),
});

const MODEL_IDS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"];

const SYSTEM_PROMPT = `You are summarizing study notes for a software engineering student. Produce a revision-ready summary they can scan in 30 seconds before an exam.

RULES:
- 4 to 6 bullets MAX.
- Each bullet is one complete thought, max 2 sentences.
- Focus on the most important facts, definitions, and rules.
- Use plain text. No markdown, no HTML.
- Include key terms the student must remember.

Output: a JSON array of bullet strings.`;

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
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { noteBody } = await req.json();
    if (!noteBody || noteBody.length < 10) {
      return NextResponse.json({ error: "Note is too short to summarize" }, { status: 400 });
    }

    const plainBody = noteBody
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const errors: string[] = [];

    for (const modelId of MODEL_IDS) {
      try {
        const { object } = await generateObject({
          model: groq(modelId),
          schema: SummarySchema,
          system: SYSTEM_PROMPT,
          prompt: `Summarize these notes:\n\n${plainBody}`,
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
    return NextResponse.json({ error: error?.message || "Failed to summarize" }, { status: 500 });
  }
}
