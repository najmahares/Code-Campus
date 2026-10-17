import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

const MODEL_ID = "openai/gpt-oss-20b";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const since = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString();

    const [moodRes, gratitudeRes, rantRes, breathingRes] = await Promise.all([
      supabase.from("mood_entries").select("mood_score, note, created_at").gte("created_at", since).order("created_at", { ascending: false }),
      supabase.from("gratitude_entries").select("content, created_at").gte("created_at", since),
      supabase.from("rant_entries").select("content, created_at").gte("created_at", since),
      supabase.from("breathing_sessions").select("duration_seconds, created_at").gte("created_at", since),
    ]);

    const moods = moodRes.data || [];
    const gratitude = gratitudeRes.data || [];
    const rants = rantRes.data || [];
    const breathing = breathingRes.data || [];

    if (moods.length < 5) {
      return NextResponse.json({
        success: true,
        report: null,
        message: "Keep checking in for a few more days to unlock your report.",
      });
    }

    const avg = moods.reduce((a, m) => a + m.mood_score, 0) / moods.length;
    const highDays = moods.filter((m) => m.mood_score >= 4).length;
    const lowDays = moods.filter((m) => m.mood_score <= 2).length;
    const totalBreathSeconds = breathing.reduce((a, b) => a + (b.duration_seconds || 0), 0);

    const moodSample = moods.slice(0, 20).map((m) => `${new Date(m.created_at).toLocaleDateString()}: ${m.mood_score}/5${m.note ? " — " + m.note : ""}`).join("\n");

    const systemPrompt = [
      "You are a warm, grounded wellbeing companion writing a short semester reflection for a software engineering student.",
      "",
      "RULES:",
      "- Output plain prose only. No markdown, no asterisks, no headers, no bullets.",
      "- 3 short paragraphs, 4 to 6 sentences total.",
      "- Paragraph 1: acknowledge their overall trend with warmth.",
      "- Paragraph 2: name one specific strength you see in their data.",
      "- Paragraph 3: gently suggest one thing to try next.",
      "- Do not diagnose. Do not be clinical. Do not use the word 'journey'.",
      "- Write like a thoughtful friend, not a therapist.",
    ].join("\n");

    const userPrompt = [
      "Student data from the last 120 days:",
      "",
      "Total mood check-ins: " + moods.length,
      "Average mood: " + avg.toFixed(1) + "/5",
      "Good days (4-5): " + highDays,
      "Hard days (1-2): " + lowDays,
      "Gratitude entries: " + gratitude.length,
      "Rant entries: " + rants.length,
      "Breathing minutes: " + Math.round(totalBreathSeconds / 60),
      "",
      "Recent mood sample:",
      moodSample,
      "",
      "Write the reflection now.",
    ].join("\n");

    let reflection = "";
    try {
      const { text } = await generateText({
        model: groq(MODEL_ID),
        system: systemPrompt,
        prompt: userPrompt,
      });
      reflection = text;
    } catch {
      reflection = "You have been showing up for yourself. That matters more than any score. Keep checking in, keep breathing, and give yourself permission to rest.";
    }

    return NextResponse.json({
      success: true,
      report: {
        reflection,
        stats: {
          total_checkins: moods.length,
          average_mood: Math.round(avg * 10) / 10,
          good_days: highDays,
          hard_days: lowDays,
          gratitude_entries: gratitude.length,
          rant_entries: rants.length,
          breathing_minutes: Math.round(totalBreathSeconds / 60),
          period_days: 120,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
