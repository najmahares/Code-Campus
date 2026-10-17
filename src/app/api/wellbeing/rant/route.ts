import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const MODEL_ID = "openai/gpt-oss-20b";

const SYSTEM = [
  "You are a kind, grounded listener for a software engineering student in an intensive bootcamp.",
  "The student just vented about something frustrating. Your job is to make them feel heard.",
  "",
  "RULES:",
  "- Respond in 2 to 4 short sentences. Never longer.",
  "- Validate their feeling first. Do not rush to fix anything.",
  "- Never say 'I understand' or 'I hear you' as the first words. Show it, don't say it.",
  "- Do not offer solutions unless they asked for one.",
  "- Do not use markdown, asterisks, hash signs, or bullet points.",
  "- Warm tone. Human, not clinical.",
  "- If they mention self-harm, hopelessness, or wanting to disappear, gently suggest they talk to a counselor and share the crisis line: Befrienders Kenya, +254 722 178 177.",
].join(String.fromCharCode(10));

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = rateLimit(ip, 10, 60000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute." },
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

    const { content } = await req.json();
    if (!content || content.length < 3) {
      return NextResponse.json({ error: "Say a bit more so I can respond" }, { status: 400 });
    }

    const { text } = await generateText({
      model: groq(MODEL_ID),
      system: SYSTEM,
      prompt: "The student wrote: " + content,
    });

    return NextResponse.json({ success: true, reply: text });
  } catch (err: any) {
    console.error("[rant] error:", err);
    return NextResponse.json({ error: err.message || "Could not respond" }, { status: 500 });
  }
}
