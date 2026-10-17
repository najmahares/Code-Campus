import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const QuizSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string().describe("Unique id like q1, q2"),
      type: z.enum(["multiple_choice", "true_false", "short_answer"]),
      question: z.string(),
      options: z
        .array(z.string())
        .describe(
          "For multiple_choice: exactly 4 options. For true_false: ['True', 'False']. For short_answer: empty array []."
        ),
      correct_answer: z.string(),
      explanation: z.string(),
      memory_tip: z.string(),
    })
  ),
});

const MODEL_IDS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"];

function buildSystemPrompt(length: number, type: string, difficulty: string) {
  const typeRules =
    type === "multiple_choice"
      ? "All questions must be type 'multiple_choice' with exactly 4 options in the options array."
      : type === "true_false"
        ? 'All questions must be type \'true_false\' with options exactly ["True", "False"].'
        : type === "short_answer"
          ? "All questions must be type 'short_answer' with an empty options array [] and a concise correct_answer (max 15 words)."
          : 'Mix question types. multiple_choice questions have 4 options, true_false have ["True", "False"], short_answer have an empty options array [].';

  const difficultyRules: Record<string, string> = {
    easy: "Focus on basic recall and definitions. Simple, direct questions.",
    medium: "Focus on understanding. Test whether they actually get the concept.",
    hard: "Focus on application and edge cases. Include scenario-based questions.",
  };

  return `You are generating a quiz for a software engineering student.

REQUIREMENTS:
- Generate exactly ${length} questions.
- ${typeRules}
- Difficulty: ${difficulty}. ${difficultyRules[difficulty] || difficultyRules.medium}
- Every question must be answerable from the notes alone.
- No trick questions, no gotchas.
- The options array is ALWAYS required. Never omit it. Use [] for short_answer.

EXPLANATIONS:
- explanation: 1-2 sentences on why the correct answer is right
- memory_tip: a mnemonic, analogy, or vivid comparison that helps the student remember it. Do NOT just repeat the explanation.

Order: start easier, end harder.`;
}

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

    const {
      noteBody,
      length = 5,
      type = "mixed",
      difficulty = "medium",
      topic = "",
    } = await req.json();
    if (!noteBody || noteBody.length < 10) {
      return NextResponse.json({ error: "Note is too short to quiz" }, { status: 400 });
    }

    const safeLength = Math.min(Math.max(Number(length) || 5, 3), 20);
    const plainBody = noteBody
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const errors: string[] = [];

    for (const modelId of MODEL_IDS) {
      try {
        const { object } = await generateObject({
          model: groq(modelId),
          schema: QuizSchema,
          system: buildSystemPrompt(safeLength, type, difficulty),
          prompt: topic
            ? `Focus this quiz on: "${topic}"\n\nNotes:\n\n${plainBody}`
            : `Notes:\n\n${plainBody}`,
        });
        return NextResponse.json({ success: true, ...object });
      } catch (err: any) {
        const msg = err?.message || String(err);
        errors.push(`${modelId}: ${msg}`);
        continue;
      }
    }

    return NextResponse.json(
      { error: `All models failed:\n${errors.join("\n")}` },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
