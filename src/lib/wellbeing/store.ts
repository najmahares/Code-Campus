import { createClient } from "@/lib/supabase/client";

export type MoodEntry = {
  id: string;
  user_id: string;
  mood_score: number;
  note: string | null;
  created_at: string;
};

export type GratitudeEntry = {
  id: string;
  user_id: string;
  prompt: string;
  content: string;
  created_at: string;
};

export type RantEntry = {
  id: string;
  user_id: string;
  content: string;
  ai_response: string | null;
  created_at: string;
};

export type BreathingSession = {
  id: string;
  user_id: string;
  pattern: string;
  duration_seconds: number;
  created_at: string;
};

export const MOOD_LABELS: Record<number, string> = {
  1: "Really struggling",
  2: "Running low",
  3: "Okay",
  4: "Good",
  5: "Really good",
};

export const GRATITUDE_PROMPTS = [
  "What is one small win from today?",
  "Who made your day a little brighter?",
  "What did your body do well for you today?",
  "What is something you learned that surprised you?",
  "What is one thing your past self would be proud of?",
  "What is a small comfort you noticed today?",
  "Where did you see kindness today?",
  "What is one thing you are looking forward to?",
  "What is something you did just for yourself today?",
  "What is a sound, smell, or taste you enjoyed?",
  "What is one thing that went right, even if small?",
  "Who would you like to thank silently right now?",
  "What is a place where you felt calm today?",
  "What is something your hands made or fixed today?",
  "What is a moment of rest you gave yourself?",
];

export function getTodaysPrompt(): string {
  const day = new Date().getDate() + new Date().getMonth() * 31;
  return GRATITUDE_PROMPTS[day % GRATITUDE_PROMPTS.length];
}

export async function listMoodEntries(limit = 90): Promise<MoodEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as MoodEntry[];
}

export async function createMoodEntry(score: number, note?: string): Promise<MoodEntry> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("mood_entries")
    .insert({ user_id: user.id, mood_score: score, note: note || null })
    .select()
    .single();
  if (error) throw error;
  return data as MoodEntry;
}

export async function getTodaysMood(): Promise<MoodEntry | null> {
  const supabase = createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .gte("created_at", start.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data as MoodEntry | null;
}

export async function listGratitudeEntries(limit = 30): Promise<GratitudeEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gratitude_entries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as GratitudeEntry[];
}

export async function createGratitudeEntry(prompt: string, content: string): Promise<GratitudeEntry> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("gratitude_entries")
    .insert({ user_id: user.id, prompt, content })
    .select()
    .single();
  if (error) throw error;
  return data as GratitudeEntry;
}

export async function listRantEntries(limit = 30): Promise<RantEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rant_entries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as RantEntry[];
}

export async function createRantEntry(content: string, aiResponse?: string): Promise<RantEntry> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("rant_entries")
    .insert({ user_id: user.id, content, ai_response: aiResponse || null })
    .select()
    .single();
  if (error) throw error;
  return data as RantEntry;
}

export async function logBreathingSession(pattern: string, seconds: number): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("breathing_sessions").insert({
    user_id: user.id,
    pattern,
    duration_seconds: seconds,
  });
}

export function calculateStreak(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;
  const days = new Set(entries.map((e) => new Date(e.created_at).toDateString()));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function averageMood(entries: MoodEntry[], days = 7): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const recent = entries.filter((e) => new Date(e.created_at) >= cutoff);
  if (recent.length === 0) return 0;
  const sum = recent.reduce((acc, e) => acc + e.mood_score, 0);
  return Math.round((sum / recent.length) * 10) / 10;
}

export type BurnoutResult = {
  score: number;
  level: "low" | "moderate" | "high" | "insufficient";
  factors: string[];
  message: string;
  avg_mood_7d?: number;
  avg_mood_prev_7d?: number;
  check_ins_7d?: number;
};

export type SemesterReport = {
  reflection: string;
  stats: {
    total_checkins: number;
    average_mood: number;
    good_days: number;
    hard_days: number;
    gratitude_entries: number;
    rant_entries: number;
    breathing_minutes: number;
    period_days: number;
  };
};

export async function fetchBurnout(): Promise<BurnoutResult | null> {
  try {
    const res = await fetch("/api/wellbeing/burnout");
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export async function fetchSemesterReport(): Promise<{ report: SemesterReport | null; message?: string }> {
  try {
    const res = await fetch("/api/wellbeing/report", { method: "POST" });
    if (!res.ok) return { report: null };
    const data = await res.json();
    return data;
  } catch {
    return { report: null };
  }
}
