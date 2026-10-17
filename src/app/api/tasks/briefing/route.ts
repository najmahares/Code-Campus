import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const BriefingSchema = z.object({
  focus_order: z.array(z.string()).describe("Task IDs in priority order, most important first"),
  top_focus: z.array(z.string()).describe("Top 1-3 task IDs the student should do first"),
  message: z.string().describe("One short encouraging sentence for the student (max 20 words)"),
});

const MODEL_IDS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"];

const SYSTEM_PROMPT = `You are a calm productivity coach for a software engineering student in an intensive bootcamp. You help them decide what to focus on today.

You'll receive a list of tasks. For each, consider:
- Priority level (high/medium/low)
- Due date (overdue is critical, today is important)
- Whether it's blocked or quick

Your job:
1. Return the task IDs in priority order (most important first)
2. Identify the top 1-3 tasks they should do FIRST today
3. Write one short encouraging sentence (max 20 words)

Rules:
- Never invent tasks
- Never drop tasks — all IDs must appear in focus_order
- Be honest about what matters
- The message should be calm, not pushy`;

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

    const { tasks } = await req.json();
    if (!tasks || tasks.length === 0) {
      return NextResponse.json({
        success: true,
        focus_order: [],
        top_focus: [],
        message: "Nothing on your plate today. Enjoy the calm.",
      });
    }

    const summary = tasks
      .map(
        (t: any) =>
          `ID: ${t.id}\nTitle: ${t.title}\nPriority: ${t.priority}\nDue: ${t.due_date || "no date"}\nDescription: ${t.description || "none"}`
      )
      .join("\n\n---\n\n");

    const errors: string[] = [];
    for (const modelId of MODEL_IDS) {
      try {
        const { object } = await generateObject({
          model: groq(modelId),
          schema: BriefingSchema,
          system: SYSTEM_PROMPT,
          prompt: `Today's tasks:\n\n${summary}`,
        });
        return NextResponse.json({ success: true, ...object });
      } catch (err: any) {
        errors.push(`${modelId}: ${err?.message || err}`);
        continue;
      }
    }

    return NextResponse.json({ error: errors.join("\n") }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate briefing" },
      { status: 500 }
    );
  }
}
