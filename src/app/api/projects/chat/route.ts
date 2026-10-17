import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const MODEL_ID = "openai/gpt-oss-20b";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = rateLimit(ip, 10, 60000);
  if (!success) {
    return NextResponse.json({ error: "Whoa there! You've hit the limit. Wait a minute and try again." }, { status: 429 });
  }


  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, message, history } = await req.json();
    if (!projectId || !message) {
      return NextResponse.json({ error: "Missing projectId or message" }, { status: 400 });
    }

    const [projectRes, specsRes] = await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).maybeSingle(),
      supabase.from("project_specs").select("name, extracted_text").eq("project_id", projectId),
    ]);

    const project = projectRes.data;
    const specs = specsRes.data;
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const MAX_SPEC_CHARS = 12000;
    let specContext = "";
    let used = 0;
    for (const s of specs || []) {
      if (!s.extracted_text) continue;
      const chunk = "\n\n[SPEC: " + s.name + "]\n" + s.extracted_text;
      if (used + chunk.length > MAX_SPEC_CHARS) break;
      specContext += chunk;
      used += chunk.length;
    }

    const recent = (history || []).slice(-4);
    const conversation = recent
      .map((m: any) => (m.role === "user" ? "Student" : "Scout") + ": " + m.content)
      .join("\n\n");

    const systemPrompt = [
      "You are Scout, a project copilot for a software engineering student.",
      "",
      "PROJECT: " + project.name,
      "STATUS: " + project.status,
      "DESCRIPTION: " + (project.description || "none"),
      "",
      "SPECS:" + (specContext || " none uploaded yet"),
      "",
      "FORMATTING RULES:",
      "- Write in plain prose. Never use asterisks for bold, hash signs for headers, or backticks for code.",
      "- Use blank lines between paragraphs. This is essential for readability.",
      "- Start each paragraph on a new line with a blank line between.",
      "- Use plain transitions like 'First,' or 'Second,' at the start of a sentence.",
      "- Never use dashes, asterisks, or hashes at the start of a line.",
      "- For code, indent with 4 spaces on its own lines.",
      "- No em dashes.",
      "",
      "CONTENT RULES:",
      "- Be direct, warm, practical. No filler.",
      "- Reference specific specs when relevant.",
      "- Break long answers into 2 to 4 paragraph chunks.",
      "- Keep replies short unless asked to be thorough.",
    ].join(String.fromCharCode(10));

    const fullPrompt = conversation
      ? conversation + "\n\nStudent: " + message
      : "Student: " + message;

    const result = streamText({
      model: groq(MODEL_ID),
      system: systemPrompt,
      prompt: fullPrompt,
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error("[scout] error:", err);
    return NextResponse.json({ error: err.message || "Scout failed" }, { status: 500 });
  }
}
