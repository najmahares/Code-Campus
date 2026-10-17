import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function computeBurnout(moods: { mood_score: number; created_at: string }[]) {
  if (moods.length < 3) {
    return {
      score: 0,
      level: "insufficient" as const,
      factors: [],
      message: "Track a few more days to see your burnout risk.",
    };
  }

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const last7 = moods.filter((m) => now - new Date(m.created_at).getTime() < 7 * DAY);
  const prev7 = moods.filter((m) => {
    const t = now - new Date(m.created_at).getTime();
    return t >= 7 * DAY && t < 14 * DAY;
  });

  if (last7.length === 0) {
    return {
      score: 0,
      level: "insufficient" as const,
      factors: [],
      message: "No check-ins in the last week.",
    };
  }

  const avgNow = last7.reduce((a, m) => a + m.mood_score, 0) / last7.length;
  const avgPrev =
    prev7.length > 0 ? prev7.reduce((a, m) => a + m.mood_score, 0) / prev7.length : avgNow;

  let score = ((5 - avgNow) / 4) * 60;

  const decline = avgPrev - avgNow;
  if (decline > 0) score += Math.min(decline * 10, 20);

  const consistency = Math.min(last7.length / 7, 1);
  score += (1 - consistency) * 20;

  if (last7.length > 2) {
    const variance =
      last7.reduce((a, m) => a + Math.pow(m.mood_score - avgNow, 2), 0) / last7.length;
    score += Math.min(variance * 5, 10);
  }

  score = Math.min(Math.max(Math.round(score), 0), 100);

  let level: "low" | "moderate" | "high";
  if (score >= 70) level = "high";
  else if (score >= 45) level = "moderate";
  else level = "low";

  const factors: string[] = [];
  if (avgNow < 2.5) factors.push("Your mood has been low this week");
  if (decline > 0.5) factors.push("Your mood has declined compared to last week");
  if (consistency < 0.6) factors.push("You have checked in less often than usual");

  return {
    score,
    level,
    factors,
    message:
      level === "high"
        ? "Your signals suggest high burnout risk. Please slow down and reach out to someone."
        : level === "moderate"
          ? "You are showing some strain. Take a real break today."
          : "You are doing okay. Keep the check-ins going.",
    avg_mood_7d: Math.round(avgNow * 10) / 10,
    avg_mood_prev_7d: Math.round(avgPrev * 10) / 10,
    check_ins_7d: last7.length,
  };
}

export async function GET() {
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

    const { data: moods } = await supabase
      .from("mood_entries")
      .select("mood_score, created_at")
      .order("created_at", { ascending: false })
      .limit(60);

    const result = computeBurnout(moods || []);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
