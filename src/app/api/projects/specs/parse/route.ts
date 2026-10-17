import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { parsePdf } from "@/lib/notes/parsers/pdf";

const MODEL_ID = "gemini-2.5-flash";

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

    const { type, signedUrl, fileType } = await req.json();
    if (!signedUrl) return NextResponse.json({ error: "Missing signedUrl" }, { status: 400 });

    const res = await fetch(signedUrl);
    if (!res.ok) return NextResponse.json({ error: "Failed to download" }, { status: 500 });
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extracted = "";

    if (type === "pdf" || fileType === "application/pdf") {
      extracted = await parsePdf(buffer);
    } else if (
      fileType === "text/plain" ||
      fileType === "text/markdown" ||
      fileType === "text/x-markdown"
    ) {
      extracted = buffer.toString("utf-8");
    } else if (fileType?.startsWith("image/")) {
      const base64 = buffer.toString("base64");
      const { text } = await generateText({
        model: google(MODEL_ID),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text and describe any diagrams, tables, or visual information in this image. Be thorough — the output will be used as project spec context for an AI assistant.",
              },
              { type: "image", image: `data:${fileType};base64,${base64}` },
            ],
          },
        ],
      });
      extracted = text;
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    if (!extracted || extracted.length < 5) {
      return NextResponse.json({ error: "No readable content found" }, { status: 400 });
    }

    return NextResponse.json({ success: true, extracted_text: extracted.slice(0, 100000) });
  } catch (err: any) {
    console.error("[spec parse]", err);
    return NextResponse.json({ error: err.message || "Failed to parse spec" }, { status: 500 });
  }
}
