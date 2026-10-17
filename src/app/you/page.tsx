"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home as HomeIcon,
  FileText,
  Calendar,
  Code2,
  Lock,
  Heart,
  Loader2,
  Send,
  Music,
  Wind,
  Sparkles,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  BookHeart,
  MessageCircle,
  History,
  TrendingUp,
  Flower2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoLockup } from "@/components/Logo";
import ConfirmModal from "@/components/ConfirmModal";
import CrisisPanel from "./CrisisPanel";
import AudioPlayer from "./AudioPlayer";
import MeditationPlayer from "./MeditationPlayer";
import BreathingExercise from "./BreathingExercise";
import { useToast } from "@/components/ToastProvider";
import {
  listMoodEntries,
  createMoodEntry,
  getTodaysMood,
  listGratitudeEntries,
  createGratitudeEntry,
  listRantEntries,
  createRantEntry,
  logBreathingSession,
  calculateStreak,
  averageMood,
  getTodaysPrompt,
  MOOD_LABELS,
  fetchBurnout,
  fetchSemesterReport,
  type MoodEntry,
  type GratitudeEntry,
  type RantEntry,
} from "@/lib/wellbeing/store";
import styles from "./wellbeing.module.css";

const navItems = [
  { id: "home", label: "Home", href: "/home", Icon: HomeIcon },
  { id: "today", label: "Today", href: "/today", Icon: Calendar },
  { id: "notes", label: "Notes", href: "/notes", Icon: FileText },
  { id: "projects", label: "Projects", href: "/projects", Icon: Code2 },
  { id: "wellbeing", label: "Wellbeing", href: "/you", Icon: Heart },
  { id: "vault", label: "Vault", href: "/vault", Icon: Lock },
];

type Section = "checkin" | "breathe" | "meditate" | "music" | "gratitude" | "rant" | "history";

const SECTIONS: { id: Section; label: string; sub: string; Icon: any; color: string }[] = [
  { id: "checkin", label: "Check in", sub: "How are you?", Icon: Heart, color: "#E8A0A8" },
  { id: "breathe", label: "Breathe", sub: "2-min reset", Icon: Wind, color: "#A8D4B0" },
  { id: "meditate", label: "Meditate", sub: "Guided sessions", Icon: Flower2, color: "#D4AF37" },
  { id: "music", label: "Music", sub: "Focus & calm", Icon: Music, color: "#A88CE8" },
  { id: "gratitude", label: "Gratitude", sub: "One line a day", Icon: BookHeart, color: "#E8A0A8" },
  { id: "rant", label: "Rant", sub: "Let it out", Icon: MessageCircle, color: "#E86464" },
  { id: "history", label: "History", sub: "Your trends", Icon: TrendingUp, color: "#7BC89A" },
];

const MOOD_FACES = [
  { score: 1, Icon: Angry, color: "#E86464" },
  { score: 2, Icon: Frown, color: "#E8A0A8" },
  { score: 3, Icon: Meh, color: "#D4AF37" },
  { score: 4, Icon: Smile, color: "#A8D4B0" },
  { score: 5, Icon: Laugh, color: "#7BC89A" },
];

export default function WellbeingPage() {
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>("checkin");
  const [showMobileSections, setShowMobileSections] = useState(false);

  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [gratitudes, setGratitudes] = useState<GratitudeEntry[]>([]);
  const [rants, setRants] = useState<RantEntry[]>([]);
  const [todaysMood, setTodaysMood] = useState<MoodEntry | null>(null);

  const [pickedMood, setPickedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [savingMood, setSavingMood] = useState(false);

  const [gratitudeContent, setGratitudeContent] = useState("");
  const [savingGratitude, setSavingGratitude] = useState(false);

  const [rantContent, setRantContent] = useState("");
  const [rantResponse, setRantResponse] = useState<string | null>(null);
  const [sendingRant, setSendingRant] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [burnout, setBurnout] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    destructive: boolean;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    destructive: false,
    onConfirm: () => {},
  });

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { toast } = useToast();

  const load = async () => {
    try {
      const [m, g, r, tm] = await Promise.all([
        listMoodEntries(),
        listGratitudeEntries(),
        listRantEntries(),
        getTodaysMood(),
      ]);
      setMoods(m);
      setGratitudes(g);
      setRants(r);
      setTodaysMood(tm);
      setBurnout(await fetchBurnout());
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      await load();
      setLoading(false);
    }
    init();
  }, []);

  const handleSaveMood = async () => {
    if (!pickedMood) return;
    setSavingMood(true);
    try {
      await createMoodEntry(pickedMood, moodNote.trim() || undefined);
      await load();
      setPickedMood(null);
      setMoodNote("");
      toast("Mood saved.", "success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingMood(false);
    }
  };

  const handleSaveGratitude = async () => {
    if (!gratitudeContent.trim()) return;
    setSavingGratitude(true);
    try {
      await createGratitudeEntry(getTodaysPrompt(), gratitudeContent.trim());
      setGratitudeContent("");
      await load();
      toast("Gratitude saved.", "success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingGratitude(false);
    }
  };

  const handleSendRant = async () => {
    if (!rantContent.trim() || sendingRant) return;
    setSendingRant(true);
    setRantResponse(null);
    try {
      const userText = rantContent.trim();
      const res = await fetch("/api/wellbeing/rant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scout could not respond");
      setRantResponse(data.reply);
      await createRantEntry(userText, data.reply);
      setRantContent("");
      await load();
      toast("Scout heard you.", "success");
    } catch (err: any) {
      setError(err.message);
      toast(err.message || "Scout couldn't respond right now.", "error");
    } finally {
      setSendingRant(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading your space...</div>;

  const streak = calculateStreak(moods);
  const weekAvg = averageMood(moods, 7);
  const checkedInToday = !!todaysMood;

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <LogoLockup size={40} />
        </div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ""}`}
            >
              <item.Icon size={20} strokeWidth={2} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarDecor}>
          <div className={styles.decorQuote}>
            <span className={styles.decorQuoteLine}>You are not</span>
            <span className={`${styles.decorQuoteLine} ${styles.decorQuoteWhite}`}>a machine.</span>
            <span className={styles.decorQuoteLine}>Rest is part of it.</span>
          </div>
        </div>
      </aside>

      <div className={styles.main} role="main">
        <div className={styles.content}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Wellbeing</h1>
              <p className={styles.subtitle}>
                {checkedInToday
                  ? "You checked in today. Well done."
                  : "How are you, really? Take 30 seconds."}
              </p>
            </div>
            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <div className={styles.statValue}>{streak}</div>
                <div className={styles.statLabel}>day streak</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>{weekAvg || "-"}</div>
                <div className={styles.statLabel}>7-day avg</div>
              </div>
            </div>
          </div>

          {error && <div className={styles.errorBar}>{error}</div>}

          <button
            className={styles.mobileSectionToggle}
            onClick={() => setShowMobileSections(!showMobileSections)}
          >
            <span>{SECTIONS.find((s) => s.id === section)?.label || "Change Activity"}</span>
            {showMobileSections ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <div
            className={`${styles.sectionGridWrap} ${showMobileSections ? styles.sectionGridOpen : ""}`}
          >
            <div className={styles.sectionGrid}>
              {SECTIONS.map((s) => {
                const isActive = section === s.id;
                const isCheckinUrgent = s.id === "checkin" && !checkedInToday;
                return (
                  <motion.button
                    key={s.id}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSection(s.id);
                      setShowMobileSections(false);
                    }}
                    className={`${styles.sectionCard} ${isActive ? styles.sectionCardActive : ""}`}
                    style={isActive ? { borderColor: s.color, background: `${s.color}12` } : {}}
                  >
                    <div
                      className={styles.sectionIcon}
                      style={{
                        color: s.color,
                        background: `${s.color}15`,
                        borderColor: `${s.color}33`,
                      }}
                    >
                      <s.Icon size={20} />
                    </div>
                    <div className={styles.sectionInfo}>
                      <div className={styles.sectionLabel}>
                        {s.label}
                        {isCheckinUrgent && <span className={styles.sectionDot} />}
                      </div>
                      <div className={styles.sectionSub}>{s.sub}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div style={{ display: section === "music" ? "block" : "none" }}>
            <AudioPlayer />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={styles.sectionBody}
            >
              {section === "checkin" && (
                <>
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <Heart size={16} className={styles.cardIcon} />
                      <span>How are you feeling today?</span>
                    </div>

                    {todaysMood ? (
                      <div className={styles.checkedInState}>
                        <div className={styles.checkedInScore}>
                          {(() => {
                            const face = MOOD_FACES.find((m) => m.score === todaysMood.mood_score);
                            if (!face) return null;
                            const Icon = face.Icon;
                            return <Icon size={48} color={face.color} />;
                          })()}
                        </div>
                        <div className={styles.checkedInLabel}>
                          {MOOD_LABELS[todaysMood.mood_score]}
                        </div>
                        {todaysMood.note && (
                          <div className={styles.checkedInNote}>
                            &ldquo;{todaysMood.note}&rdquo;
                          </div>
                        )}
                        <div className={styles.checkedInTime}>
                          Checked in at{" "}
                          {new Date(todaysMood.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.moodRow}>
                          {MOOD_FACES.map((m) => (
                            <motion.button
                              key={m.score}
                              whileHover={{ scale: 1.1, y: -4 }}
                              whileTap={{ scale: 0.95 }}
                              className={`${styles.moodFace} ${pickedMood === m.score ? styles.moodFaceActive : ""}`}
                              onClick={() => setPickedMood(m.score)}
                              style={
                                pickedMood === m.score
                                  ? { borderColor: m.color, background: `${m.color}20` }
                                  : {}
                              }
                            >
                              <m.Icon size={28} color={m.color} />
                            </motion.button>
                          ))}
                        </div>
                        <div className={styles.moodLabel}>
                          {pickedMood ? MOOD_LABELS[pickedMood] : "Tap a face"}
                        </div>
                        {pickedMood && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                          >
                            <textarea
                              className={styles.noteInput}
                              placeholder="Want to say more? (optional)"
                              value={moodNote}
                              onChange={(e) => setMoodNote(e.target.value)}
                              rows={2}
                            />
                            <button
                              className={styles.saveBtn}
                              onClick={handleSaveMood}
                              disabled={savingMood}
                            >
                              {savingMood ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                "Save check-in"
                              )}
                            </button>
                          </motion.div>
                        )}
                      </>
                    )}
                  </div>

                  {burnout && burnout.level !== "insufficient" && (
                    <div className={styles.burnoutCard}>
                      <div className={styles.burnoutHeader}>
                        <span className={styles.burnoutLabel}>Burnout risk</span>
                        <span
                          className={`${styles.burnoutBadge} ${styles["burnout" + burnout.level.charAt(0).toUpperCase() + burnout.level.slice(1)]}`}
                        >
                          {burnout.level}
                        </span>
                      </div>
                      <div className={styles.burnoutScoreRow}>
                        <div className={styles.burnoutScore}>{burnout.score}</div>
                        <div className={styles.burnoutMeter}>
                          <div
                            className={styles.burnoutMeterFill}
                            style={{ width: burnout.score + "%" }}
                          />
                        </div>
                      </div>
                      <div className={styles.burnoutMessage}>{burnout.message}</div>
                      {burnout.factors && burnout.factors.length > 0 && (
                        <div className={styles.burnoutFactors}>
                          {burnout.factors.map((f: string, i: number) => (
                            <div key={i} className={styles.burnoutFactor}>
                              {f}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {section === "breathe" && (
                <BreathingExercise
                  onComplete={(pattern, sec) => logBreathingSession(pattern, sec)}
                />
              )}

              {section === "meditate" && <MeditationPlayer />}
              {section === "music" && <div style={{ display: "none" }} />}

              {section === "gratitude" && (
                <div className={styles.journalWrap}>
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <BookHeart size={16} className={styles.cardIcon} />
                      <span>Today&apos;s prompt</span>
                    </div>
                    <div className={styles.prompt}>{getTodaysPrompt()}</div>
                    <textarea
                      className={styles.noteInput}
                      placeholder="Write a line or two..."
                      value={gratitudeContent}
                      onChange={(e) => setGratitudeContent(e.target.value)}
                      rows={4}
                    />
                    <button
                      className={styles.saveBtn}
                      onClick={handleSaveGratitude}
                      disabled={savingGratitude || !gratitudeContent.trim()}
                    >
                      {savingGratitude ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Save gratitude"
                      )}
                    </button>
                  </div>
                  <div className={styles.entryList}>
                    <div className={styles.entryListHeader}>Past entries</div>
                    {gratitudes.length === 0 ? (
                      <div className={styles.entryEmpty}>
                        Nothing yet. One line a day builds the habit.
                      </div>
                    ) : (
                      gratitudes.map((g) => (
                        <div key={g.id} className={styles.entryCard}>
                          <div className={styles.entryPrompt}>{g.prompt}</div>
                          <div className={styles.entryContent}>{g.content}</div>
                          <div className={styles.entryDate}>
                            {new Date(g.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {section === "rant" && (
                <div className={styles.rantWrap}>
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <MessageCircle size={16} className={styles.cardIcon} />
                      <span>The rant room</span>
                    </div>
                    <p className={styles.rantIntro}>
                      Nothing here is judged. Say the thing. Scout will listen.
                    </p>
                    <textarea
                      className={styles.rantInput}
                      placeholder="What is frustrating you right now?"
                      value={rantContent}
                      onChange={(e) => setRantContent(e.target.value)}
                      rows={5}
                    />
                    <button
                      className={styles.saveBtn}
                      onClick={handleSendRant}
                      disabled={sendingRant || !rantContent.trim()}
                    >
                      {sendingRant ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Scout is reading...
                        </>
                      ) : (
                        <>
                          <Send size={14} /> Let it out
                        </>
                      )}
                    </button>
                    <AnimatePresence>
                      {rantResponse && (
                        <motion.div
                          className={styles.rantResponse}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className={styles.rantResponseLabel}>
                            <Sparkles size={12} /> Scout
                          </div>
                          <div className={styles.rantResponseText}>{rantResponse}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {rants.length > 0 && (
                    <div className={styles.entryList}>
                      <div className={styles.entryListHeader}>Past rants</div>
                      {rants.slice(0, 8).map((r) => (
                        <div key={r.id} className={styles.entryCard}>
                          <div className={styles.entryContent}>{r.content}</div>
                          {r.ai_response && (
                            <div className={styles.rantPastResponse}>
                              <Sparkles size={11} /> {r.ai_response}
                            </div>
                          )}
                          <div className={styles.entryDate}>
                            {new Date(r.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {section === "history" && (
                <div className={styles.historyWrap}>
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <TrendingUp size={16} className={styles.cardIcon} />
                      <span>Mood over the last 30 days</span>
                    </div>
                    <MoodChart entries={moods.slice(0, 30)} />
                  </div>
                  <div className={styles.reportCard}>
                    <div className={styles.reportHeader}>
                      <span className={styles.reportTitle}>Semester report</span>
                      {!report && !reportLoading && (
                        <button
                          className={styles.reportBtn}
                          onClick={async () => {
                            setReportLoading(true);
                            try {
                              const data = await fetchSemesterReport();
                              setReport(data);
                              if (!data.report) toast("Not enough data for a report yet.", "info");
                            } catch (err: any) {
                              toast(err.message || "Failed to generate report", "error");
                            } finally {
                              setReportLoading(false);
                            }
                          }}
                        >
                          Generate
                        </button>
                      )}
                    </div>
                    {reportLoading && (
                      <div className={styles.reportLoading}>Scout is reading your semester...</div>
                    )}
                    {report && report.report && (
                      <>
                        <div className={styles.reportReflection}>{report.report.reflection}</div>
                        <div className={styles.reportStats}>
                          <div className={styles.reportStat}>
                            <div className={styles.reportStatValue}>
                              {report.report.stats.average_mood}
                            </div>
                            <div className={styles.reportStatLabel}>avg mood</div>
                          </div>
                          <div className={styles.reportStat}>
                            <div className={styles.reportStatValue}>
                              {report.report.stats.total_checkins}
                            </div>
                            <div className={styles.reportStatLabel}>check-ins</div>
                          </div>
                          <div className={styles.reportStat}>
                            <div className={styles.reportStatValue}>
                              {report.report.stats.good_days}
                            </div>
                            <div className={styles.reportStatLabel}>good days</div>
                          </div>
                          <div className={styles.reportStat}>
                            <div className={styles.reportStatValue}>
                              {report.report.stats.breathing_minutes}
                            </div>
                            <div className={styles.reportStatLabel}>breath min</div>
                          </div>
                        </div>
                      </>
                    )}
                    {report && !report.report && (
                      <div className={styles.reportLoading}>{report.message}</div>
                    )}
                  </div>
                  <div className={styles.entryList}>
                    <div className={styles.entryListHeader}>Recent check-ins</div>
                    {moods.length === 0 ? (
                      <div className={styles.entryEmpty}>No check-ins yet.</div>
                    ) : (
                      moods.slice(0, 20).map((m) => {
                        const face = MOOD_FACES.find((f) => f.score === m.mood_score);
                        if (!face) return null;
                        const Icon = face.Icon;
                        return (
                          <div key={m.id} className={styles.moodHistoryRow}>
                            <Icon size={20} color={face.color} />
                            <div className={styles.moodHistoryBody}>
                              <div className={styles.moodHistoryLabel}>
                                {MOOD_LABELS[m.mood_score]}
                              </div>
                              {m.note && <div className={styles.moodHistoryNote}>{m.note}</div>}
                            </div>
                            <div className={styles.moodHistoryDate}>
                              {new Date(m.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <CrisisPanel />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        destructive={confirmState.destructive}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((s) => ({ ...s, isOpen: false }))}
      />
    </div>
  );
}

function MoodChart({ entries }: { entries: MoodEntry[] }) {
  if (entries.length === 0) {
    return <div className={styles.chartEmpty}>Track a few days to see your trend.</div>;
  }
  const reversed = [...entries].reverse();
  const width = 100;
  const height = 100;
  const stepX = width / Math.max(reversed.length - 1, 1);
  const points = reversed
    .map((e, i) => {
      const x = i * stepX;
      const y = height - ((e.mood_score - 1) / 4) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <div className={styles.chartWrap}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className={styles.chartSvg}
      >
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
          />
        ))}
        <polyline
          points={points}
          fill="none"
          stroke="#E8A0A8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {reversed.map((e, i) => {
          const x = i * stepX;
          const y = height - ((e.mood_score - 1) / 4) * height;
          return <circle key={e.id} cx={x} cy={y} r="1.5" fill="#E8A0A8" />;
        })}
      </svg>
      <div className={styles.chartLabels}>
        <span>low</span>
        <span>high</span>
      </div>
    </div>
  );
}
