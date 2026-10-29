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
  Plus,
  Check,
  Loader2,
  X,
  Sparkles,
  Sun,
  Clock,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoLockup } from "@/components/Logo";
import SidebarLogoutButton from "@/components/SidebarLogoutButton";
import ConfirmModal from "@/components/ConfirmModal";
import EmptyState from "@/components/EmptyState";
import TaskModal from "./TaskModal";
import TaskCard from "./TaskCard";
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  snoozeTask,
  getTodayString,
  isOverdue,
  isDueToday,
  isUpcoming,
  formatDueDate,
  type Task,
} from "@/lib/tasks/store";
import styles from "./today.module.css";

const navItems = [
  { id: "home", label: "Home", href: "/home", Icon: HomeIcon },
  { id: "today", label: "Today", href: "/today", Icon: Calendar },
  { id: "notes", label: "Notes", href: "/notes", Icon: FileText },
  { id: "projects", label: "Projects", href: "/projects", Icon: Code2 },
  { id: "wellbeing", label: "Wellbeing", href: "/you", Icon: Heart },
  { id: "vault", label: "Vault", href: "/vault", Icon: Lock },
];

type ViewFilter = "today" | "upcoming" | "completed" | "all";

type Briefing = {
  focus_order: string[];
  top_focus: string[];
  message: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Something went wrong.";
}

export default function TodayPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<ViewFilter>("today");
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
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
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const askConfirm = (opts: Omit<typeof confirmState, "isOpen">) =>
    setConfirmState({ ...opts, isOpen: true });

  const loadTasks = async () => {
    try {
      const data = await listTasks();
      setTasks(data);
    } catch (error) {
      setError(getErrorMessage(error));
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
      await loadTasks();
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    async function loadBriefing() {
      if (loading) return;

      const todayTasks = tasks.filter((t) => !t.completed && (isDueToday(t) || isOverdue(t)));
      if (todayTasks.length === 0) {
        if (isSubscribed) setBriefing(null);
        return;
      }

      if (isSubscribed) setBriefingLoading(true);

      try {
        const response = await fetch("/api/tasks/briefing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tasks: todayTasks.map((t) => ({
              id: t.id,
              title: t.title,
              priority: t.priority,
              due_date: t.due_date,
              description: t.description,
            })),
          }),
        });

        const data = await response.json();
        if (!isSubscribed) return;
        if (data.success) setBriefing(data);
        else setBriefing(null);
      } catch {
        if (isSubscribed) setBriefing(null);
      } finally {
        if (isSubscribed) setBriefingLoading(false);
      }
    }

    void loadBriefing();
    return () => {
      isSubscribed = false;
    };
  }, [tasks, loading]);

  const handleCreate = async (params: {
    title: string;
    description?: string;
    due_date?: string | null;
    priority: "low" | "medium" | "high";
  }) => {
    try {
      await createTask(params);
      await loadTasks();
      setShowTaskModal(false);
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Task>) => {
    try {
      await updateTask(id, updates);
      await loadTasks();
      setEditingTask(null);
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await toggleTaskComplete(id, completed);
      await loadTasks();
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const handleSnooze = async (id: string, days: number) => {
    const until = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
    try {
      await snoozeTask(id, until);
      await loadTasks();
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const handleDelete = (id: string, title: string) => {
    askConfirm({
      title: "Delete this task?",
      message: `"${title}" will be removed permanently.`,
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: async () => {
        await deleteTask(id);
        await loadTasks();
      },
    });
  };

  const todayString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const timeOfDay = (() => {
    const h = new Date().getHours();
    if (h < 5) return "Late night";
    if (h < 12) return "Morning";
    if (h < 17) return "Afternoon";
    if (h < 21) return "Evening";
    return "Late night";
  })();

  const todaysTasks = tasks.filter((t) => !t.completed && (isDueToday(t) || isOverdue(t)));
  const upcomingTasks = tasks.filter((t) => isUpcoming(t));
  const completedTasks = tasks.filter((t) => t.completed);
  const noDateTasks = tasks.filter((t) => !t.completed && !t.due_date);

  const filtered = (() => {
    if (view === "today") return [...todaysTasks, ...noDateTasks];
    if (view === "upcoming") return upcomingTasks;
    if (view === "completed") return completedTasks;
    return tasks;
  })();

  const ordered =
    briefing && (view === "today" || view === "all")
      ? [...filtered].sort((a, b) => {
          const ai = briefing.focus_order.indexOf(a.id) - briefing.focus_order.indexOf(b.id);
          if (ai !== 0) return ai;
          return 0;
        })
      : filtered;

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
            <span className={styles.decorQuoteLine}>One thing</span>
            <span className={`${styles.decorQuoteLine} ${styles.decorQuoteWhite}`}>at a</span>
            <span className={styles.decorQuoteLine}>time.</span>
          </div>
        </div>{" "}
        <SidebarLogoutButton />{" "}
      </aside>

      <div className={styles.main} role="main">
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>Today</h1>
              <p className={styles.subtitle}>
                {timeOfDay} · {todayString}
              </p>
            </div>
            <button className={styles.addBtn} onClick={() => setShowTaskModal(true)}>
              <Plus size={18} strokeWidth={3} /> Add task
            </button>
          </div>

          {error && <div className={styles.errorBar}>{error}</div>}

          {briefing && todaysTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={styles.briefingCard}
            >
              <div className={styles.briefingGlow} />
              <div className={styles.briefingHeader}>
                <div className={styles.briefingGreeting}>
                  <span className={styles.briefingGreetingText}>
                    {timeOfDay}, let&apos;s focus.
                  </span>
                </div>
                {briefingLoading && (
                  <Loader2 size={14} className="animate-spin" style={{ color: "#E8A0A8" }} />
                )}
              </div>
              <div className={styles.briefingMessage}>{briefing.message}</div>
              {briefing.top_focus.length > 0 && (
                <div className={styles.briefingFocusList}>
                  {briefing.top_focus.slice(0, 3).map((id, i) => {
                    const t = tasks.find((x) => x.id === id);
                    if (!t) return null;
                    return (
                      <div key={id} className={styles.briefingFocusRow}>
                        <span className={styles.briefingFocusNum}>{i + 1}</span>
                        <span className={styles.briefingFocusTitle}>{t.title}</span>
                        {t.due_date && (
                          <span className={styles.briefingFocusDue}>
                            {formatDueDate(t.due_date)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          <div className={styles.tabs}>
            {(
              [
                { id: "today", label: "Today", count: todaysTasks.length + noDateTasks.length },
                { id: "upcoming", label: "Upcoming", count: upcomingTasks.length },
                { id: "completed", label: "Completed", count: completedTasks.length },
                { id: "all", label: "All", count: tasks.length },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                className={`${styles.tab} ${view === t.id ? styles.tabActive : ""}`}
                onClick={() => setView(t.id)}
              >
                {t.label}
                {t.count > 0 && <span className={styles.tabCount}>{t.count}</span>}
              </button>
            ))}
          </div>

          <div className={styles.taskList}>
            {ordered.length === 0 ? (
              <div style={{ padding: "2rem 0" }}>
                <EmptyState
                  icon={<Calendar size={32} />}
                  title={view === "all" ? "No tasks yet" : "All clear"}
                  description={
                    view === "all"
                      ? "Add a task to get started. Keep it small and specific."
                      : "Nothing to do here. Take a breath."
                  }
                  actionLabel="Add a task"
                  onAction={() => {
                    setShowTaskModal(true);
                  }}
                />
              </div>
            ) : (
              ordered.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isTopFocus={briefing?.top_focus.includes(task.id) || false}
                  onToggle={handleToggle}
                  onEdit={() => setEditingTask(task)}
                  onDelete={() => handleDelete(task.id, task.title)}
                  onSnooze={handleSnooze}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTaskModal && (
          <TaskModal
            isOpen={showTaskModal}
            onClose={() => setShowTaskModal(false)}
            onSave={handleCreate}
            mode="create"
          />
        )}
        {editingTask && (
          <TaskModal
            isOpen={!!editingTask}
            onClose={() => setEditingTask(null)}
            onSave={(params) => handleUpdate(editingTask.id, params)}
            mode="edit"
            initial={editingTask}
          />
        )}
      </AnimatePresence>

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
