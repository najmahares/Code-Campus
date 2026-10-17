"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home as HomeIcon,
  FileText,
  Calendar,
  Code2,
  Lock,
  Heart,
  Search,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
  Check,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import NotificationsPanel from "@/components/NotificationsPanel";
import GlobalSearch from "@/components/GlobalSearch";
import Onboarding from "@/components/Onboarding";
import { getProfile, avatarUrl } from "@/lib/profile/store";
import { LogoLockup } from "@/components/Logo";
import {
  listTasks,
  createTask,
  formatDueDate,
  isOverdue,
  isDueToday,
  type Task,
} from "@/lib/tasks/store";
import { listProjects, type Project } from "@/lib/projects/store";
import { getTodaysMood, createMoodEntry, MOOD_LABELS, type MoodEntry } from "@/lib/wellbeing/store";
import { createNote } from "@/lib/notes/store";
import { createVaultItem } from "@/lib/vault/store";
import { listRecentActivity, timeAgo, type ActivityItem } from "@/lib/activity/store";
import styles from "./home.module.css";

type CaptureStatus = "idle" | "saving" | "done" | "error";

function classifyCapture(input: string): "task" | "vault" | "note" {
  const s = input.trim();
  const lower = s.toLowerCase();

  if (/^(todo|task|remind|reminder)\s*[:\-]/i.test(s)) return "task";

  const taskVerbs = [
    "buy",
    "call",
    "email",
    "submit",
    "finish",
    "fix",
    "review",
    "prepare",
    "ship",
    "deploy",
    "send",
    "draft",
  ];
  if (taskVerbs.some((v) => lower.startsWith(v + " "))) return "task";

  const secretPatterns = [
    /^sk-/,
    /^pk-/,
    /^ghp_/,
    /^eyJ/,
    /^AIza/,
    /api[_\s-]?key/i,
    /secret/i,
    /\btoken\b/i,
    /password/i,
  ];
  if (secretPatterns.some((rx) => rx.test(s))) return "vault";

  return "note";
}

function activityIconFor(kind: string): { Icon: any; gold: boolean } {
  switch (kind) {
    case "note":
      return { Icon: FileText, gold: false };
    case "task":
      return { Icon: Calendar, gold: false };
    case "project":
      return { Icon: Code2, gold: false };
    case "vault":
      return { Icon: Lock, gold: true };
    case "mood":
      return { Icon: Heart, gold: false };
    case "gratitude":
      return { Icon: Heart, gold: false };
    default:
      return { Icon: Sparkles, gold: false };
  }
}

export default function HomePage() {
  const [userName, setUserName] = useState<string>("");
  const [profileAvatar, setProfileAvatar] = useState<string>("blossom");
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [todaysMood, setTodaysMood] = useState<MoodEntry | null>(null);
  const [moodSaving, setMoodSaving] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [priorityIndex, setPriorityIndex] = useState(0);
  const [captureValue, setCaptureValue] = useState("");
  const [captureStatus, setCaptureStatus] = useState<CaptureStatus>("idle");
  const [captureFeedback, setCaptureFeedback] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const loadAll = async () => {
    const [t, p, m, a] = await Promise.all([
      listTasks(),
      listProjects(),
      getTodaysMood(),
      listRecentActivity(4),
    ]);
    setTasks(t);
    setProjects(p);
    setTodaysMood(m);
    setActivity(a);
  };

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const fullName =
        (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "friend";
      setUserName(fullName.split(" ")[0]);
      try {
        const p = await getProfile();
        if (p?.display_name) setUserName(p.display_name.split(" ")[0]);
        if (p?.avatar_seed) setProfileAvatar(p.avatar_seed);
      } catch {}
      try {
        await loadAll();
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, []);

  const openTasks = useMemo(() => {
    const list = tasks.filter((t) => !t.completed);
    list.sort((a, b) => {
      const ad = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const bd = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      if (ad !== bd) return ad - bd;
      const w = { high: 3, medium: 2, low: 1 } as const;
      return w[b.priority] - w[a.priority];
    });
    return list;
  }, [tasks]);

  const priorityPool = openTasks.slice(0, 4);
  const priority =
    priorityPool.length > 0 ? priorityPool[priorityIndex % priorityPool.length] : null;
  const linkedProject = priority?.linked_project_id
    ? projects.find((p) => p.id === priority.linked_project_id) || null
    : null;

  const todayCount = useMemo(() => {
    return tasks.filter((t) => !t.completed && (isOverdue(t) || isDueToday(t))).length;
  }, [tasks]);

  const navItems = useMemo(
    () => [
      {
        id: "home",
        label: "Home",
        href: "/home",
        Icon: HomeIcon,
        badge: undefined as number | undefined,
      },
      { id: "notes", label: "Notes", href: "/notes", Icon: FileText, badge: undefined },
      {
        id: "today",
        label: "Today",
        href: "/today",
        Icon: Calendar,
        badge: todayCount > 0 ? todayCount : undefined,
      },
      { id: "projects", label: "Projects", href: "/projects", Icon: Code2, badge: undefined },
      { id: "vault", label: "Vault", href: "/vault", Icon: Lock, badge: undefined },
      { id: "wellbeing", label: "Wellbeing", href: "/you", Icon: Heart, badge: undefined },
    ],
    [todayCount]
  );

  const handleMoodClick = async (index: number) => {
    if (moodSaving) return;
    const score = index + 1;
    if (todaysMood?.mood_score === score) return;
    setMoodSaving(true);
    try {
      const entry = await createMoodEntry(score);
      setTodaysMood(entry);
      const a = await listRecentActivity(4);
      setActivity(a);
    } catch (err) {
      console.error(err);
    } finally {
      setMoodSaving(false);
    }
  };

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = captureValue.trim();
    if (!text || captureStatus === "saving") return;

    setCaptureStatus("saving");
    const kind = classifyCapture(text);

    try {
      if (kind === "task") {
        const cleanTitle =
          text.replace(/^(todo|task|remind|reminder)\s*[:\-]\s*/i, "").trim() || text;
        await createTask({ title: cleanTitle.slice(0, 200) });
        setCaptureFeedback("Added to Today");
      } else if (kind === "vault") {
        await createVaultItem({ title: text.slice(0, 40), type: "secret", value: text });
        setCaptureFeedback("Saved to Vault");
      } else {
        await createNote({ raw_body: text, source_type: "typed" });
        setCaptureFeedback("Saved to Notes");
      }

      setCaptureValue("");
      setCaptureStatus("done");

      const [t, a] = await Promise.all([listTasks(), listRecentActivity(4)]);
      setTasks(t);
      setActivity(a);

      setTimeout(() => {
        setCaptureStatus("idle");
        setCaptureFeedback("");
      }, 1800);
    } catch (err: any) {
      console.error(err);
      setCaptureStatus("error");
      setCaptureFeedback(err?.message || "Failed to save");
      setTimeout(() => {
        setCaptureStatus("idle");
        setCaptureFeedback("");
      }, 2400);
    }
  };

  const cyclePriority = () => {
    if (priorityPool.length === 0) return;
    setPriorityIndex((i) => (i + 1) % priorityPool.length);
  };

  if (loading) {
    return <div className={styles.loading}>Preparing your space...</div>;
  }

  const moodIndex = todaysMood ? todaysMood.mood_score - 1 : -1;
  const moodNoteText = todaysMood ? MOOD_LABELS[todaysMood.mood_score] + " ♡" : "You got this ♡";

  return (
    <div className={styles.page}>
      <Onboarding />
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <LogoLockup size={42} />
        </div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <item.Icon size={20} strokeWidth={2} aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge !== undefined && <span className={styles.navBadge}>{item.badge}</span>}
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarQuote}>
          <span className={styles.sidebarQuoteLine}>You&apos;re doing</span>
          <span className={`${styles.sidebarQuoteLine} ${styles.sidebarQuoteLineWhite}`}>
            hard things.
          </span>
          <span className={`${styles.sidebarQuoteLine} ${styles.sidebarQuoteLineGold}`}>
            And it shows.
          </span>
        </div>
      </aside>

      <div className={styles.mainArea} role="main">
        <div className={styles.topBar}>
          <GlobalSearch />
          <div className={styles.topBarRight}>
            <NotificationsPanel />
            <Link href="/settings" className={styles.userAvatar} aria-label="Settings">
              <img src={avatarUrl(profileAvatar, 128)} alt="" className={styles.userAvatarImg} />
            </Link>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.centerCol}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={styles.greeting}
            >
              <h1 className={styles.greetingTitle}>
                Good evening, {userName}
                <Heart size={26} className={styles.greetingHeart} fill="#E8A0A8" stroke="none" />
              </h1>
              <p className={styles.greetingSub}>Another day of progress. You&apos;ve got this.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={styles.priorityCard}
            >
              <div className={styles.priorityLeft}>
                <span className={styles.priorityEyebrow}>
                  <Sparkles size={16} />
                  Today&apos;s Priority
                </span>

                {priorityPool.length > 1 && (
                  <button
                    className={styles.priorityRefresh}
                    aria-label="Refresh priority"
                    onClick={cyclePriority}
                  >
                    <RefreshCw size={17} />
                  </button>
                )}

                {priority ? (
                  <>
                    <h2 className={styles.priorityHeadline}>{priority.title}</h2>
                    <p className={styles.prioritySub}>
                      {priority.description
                        ? priority.description
                        : priority.due_date
                          ? "Due " + formatDueDate(priority.due_date) + ". Keep the momentum going."
                          : "No deadline set. Pick a moment and knock it out."}
                    </p>
                    <div className={styles.priorityMeta}>
                      <span className={styles.metaTag}>
                        <Code2 size={14} className={styles.metaIcon} />
                        Project: {linkedProject?.name || "General"}
                      </span>
                      <span className={styles.metaTag}>
                        <Calendar size={14} className={styles.metaIcon} />
                        Due: {priority.due_date ? formatDueDate(priority.due_date) : "No deadline"}
                      </span>
                    </div>
                    <div className={styles.priorityActions}>
                      <Link href="/today" className={styles.priorityPrimary}>
                        Go to task <ArrowRight size={17} />
                      </Link>
                      {priorityPool.length > 1 && (
                        <button className={styles.prioritySecondary} onClick={cyclePriority}>
                          Not now
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className={styles.priorityHeadline}>All caught up</h2>
                    <p className={styles.prioritySub}>
                      No open tasks right now. Add one to keep the streak alive.
                    </p>
                    <div className={styles.priorityActions}>
                      <Link href="/today" className={styles.priorityPrimary}>
                        <Plus size={17} /> Add a task
                      </Link>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.priorityRight}>
                <img src="/campus-home.png" alt="" className={styles.priorityImg} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={styles.recentSection}
            >
              <div className={styles.recentHeader}>
                <span className={styles.recentTitle}>Recent activity</span>
                <Link href="/notes" className={styles.viewAll}>
                  View all <ArrowRight size={13} />
                </Link>
              </div>

              <div className={styles.recentGrid}>
                <div className={styles.recentList}>
                  {activity.length === 0 ? (
                    <div className={styles.recentItem}>
                      <div className={styles.recentIcon}>
                        <Sparkles size={19} strokeWidth={2} />
                      </div>
                      <div className={styles.recentContent}>
                        <span className={styles.recentItemTitle}>Nothing yet today</span>
                        <span className={styles.recentItemSub}>
                          Add a note or a task to get started
                        </span>
                      </div>
                      <span className={styles.recentTime}>now</span>
                    </div>
                  ) : (
                    activity.map((item) => {
                      const { Icon, gold } = activityIconFor(item.kind);
                      return (
                        <div key={item.id} className={styles.recentItem}>
                          <div
                            className={`${styles.recentIcon} ${gold ? styles.recentIconGold : ""}`}
                          >
                            <Icon size={19} strokeWidth={2} />
                          </div>
                          <div className={styles.recentContent}>
                            <span className={styles.recentItemTitle}>{item.title}</span>
                            <span className={styles.recentItemSub}>{item.sub}</span>
                          </div>
                          <span className={styles.recentTime}>{timeAgo(item.created_at)}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className={styles.recentQuote}>
                  <div className={styles.recentQuoteSun} />
                  <svg
                    viewBox="0 0 260 260"
                    className={styles.recentQuoteMountainPeak}
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 210 L70 130 L120 175 L180 105 L260 210 L260 260 L0 260 Z"
                      fill="#1a0e1a"
                      opacity="0.6"
                    />
                    <path
                      d="M0 235 L85 165 L140 210 L200 155 L260 235 L260 260 L0 260 Z"
                      fill="#0a0510"
                      opacity="0.8"
                    />
                  </svg>
                  <span className={styles.recentQuoteText}>
                    Same you,
                    <br />
                    just <span className={styles.recentQuoteTextPink}>closer</span> to
                    <br />
                    your goals
                    <Heart
                      size={16}
                      fill="#E8A0A8"
                      stroke="none"
                      style={{ display: "inline", marginLeft: "0.3rem", verticalAlign: "middle" }}
                    />
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className={styles.rightCol}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className={styles.moodCard}
            >
              <span className={styles.moodTitle}>How are you feeling today?</span>
              <div className={styles.moodFaces}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    className={`${styles.moodFace} ${moodIndex === i ? styles.moodFaceActive : ""}`}
                    onClick={() => handleMoodClick(i)}
                    disabled={moodSaving}
                    aria-label={`Mood ${i + 1}`}
                  >
                    <MoodFace index={i} active={moodIndex === i} />
                  </button>
                ))}
              </div>
              <span className={styles.moodNote}>{moodNoteText}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={styles.captureCard}
            >
              <div className={styles.captureHeader}>
                <div className={styles.captureIcon}>
                  <Plus size={16} strokeWidth={3} />
                </div>
                <span className={styles.captureTitle}>Quick Capture</span>
              </div>
              <span className={styles.captureSub}>Throw anything in. AI will file it.</span>
              <form className={styles.captureInputWrap} onSubmit={handleCapture}>
                <input
                  type="text"
                  className={styles.captureInput}
                  placeholder="Note, task, code, question..."
                  value={captureValue}
                  onChange={(e) => setCaptureValue(e.target.value)}
                  disabled={captureStatus === "saving"}
                />
                <button
                  type="submit"
                  className={styles.captureSubmit}
                  aria-label="Capture"
                  disabled={captureStatus === "saving" || !captureValue.trim()}
                >
                  {captureStatus === "saving" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : captureStatus === "done" ? (
                    <Check size={16} />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </button>
              </form>
              {captureFeedback && (
                <span
                  className={`${styles.captureFeedback} ${captureStatus === "error" ? styles.captureFeedbackError : ""}`}
                >
                  {captureFeedback}
                </span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={styles.vaseCard}
            >
              <img src="/vase.png" alt="" className={styles.vaseImg} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoodFace({ index, active }: { index: number; active: boolean }) {
  const stroke = active ? "#050505" : "#E8A0A8";
  const paths = [
    "M11 21 Q16 17 21 21",
    "M11 20 Q16 18 21 20",
    "M11 19 L21 19",
    "M11 17 Q16 21 21 17",
    "M11 16 Q16 22 21 16",
  ];
  return (
    <svg viewBox="0 0 32 32" className={styles.moodFaceSvg} xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="11" fill="none" stroke={stroke} strokeWidth="2" />
      <circle cx="12.5" cy="13" r="1.2" fill={stroke} />
      <circle cx="19.5" cy="13" r="1.2" fill={stroke} />
      <path d={paths[index]} stroke={stroke} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}
