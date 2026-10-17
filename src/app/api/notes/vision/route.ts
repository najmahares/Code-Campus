import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const VisionSchema = z.object({
  title: z.string().describe("Short title, 4-6 words, Title Case"),
  refined_body: z.string().describe("Full study notes in HTML based on the screenshot content"),
  tags: z.array(z.string()).describe("3-6 tags"),
  summary: z.array(z.string()).describe("3 bullet summary"),
  extracted_text: z.string().describe("All text visible in the image, verbatim"),
});

const MODEL_IDS = ["gemini-2.5-flash", "gemini-2.5-pro"];

const SYSTEM_PROMPT = `You are analyzing a screenshot for a software engineering student. The image may contain:
- Code in any language
- Terminal output or errors
- Lecture slides or notes
- Diagrams or UI designs
- Documentation pages

Your job:
1. Read every piece of text in the image
2. Extract the code verbatim if code is present
3. Generate thorough study notes in HTML that a student can revise from

OUTPUT:
- Return ONLY inner HTML in the refined_body. Allowed tags: <p>, <strong>, <em>, <h2>, <h3>, <ul>, <ol>, <li>, <code>, <pre>, <blockquote>, <a href="">.
- Wrap every paragraph in <p>.
- Use <h2> for major sections.
- Use <pre><code> for code blocks.
- Explain what the code or content does, not just transcribe it.
- If the screenshot shows an error, explain the error and how to fix it.
- Title should describe the topic, not "screenshot" or "image".

TONE: Clear, direct, teaching.`;

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

    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });

    const errors: string[] = [];

    for (const modelId of MODEL_IDS) {
      try {
        const { object } = await generateObject({
          model: google(modelId),
          schema: VisionSchema,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this screenshot and generate study notes." },
                { type: "image", image: imageUrl },
              ],
            },
          ],
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
    return NextResponse.json({ error: error?.message || "Vision failed" }, { status: 500 });
  }
}
