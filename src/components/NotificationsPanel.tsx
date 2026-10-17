"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  FileText,
  Calendar,
  Code2,
  Lock,
  Heart,
  Sparkles,
  Check,
} from "lucide-react";
import { listRecentActivity, timeAgo, type ActivityItem } from "@/lib/activity/store";
import styles from "./NotificationsPanel.module.css";

const SEEN_KEY = "codecampus_notifications_seen";

function iconFor(kind: string) {
  switch (kind) {
    case "note": return { Icon: FileText, gold: false };
    case "task": return { Icon: Calendar, gold: false };
    case "project": return { Icon: Code2, gold: false };
    case "vault": return { Icon: Lock, gold: true };
    case "mood": return { Icon: Heart, gold: false };
    case "gratitude": return { Icon: Heart, gold: false };
    default: return { Icon: Sparkles, gold: false };
  }
}

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>("");
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEEN_KEY);
      if (stored) setLastSeen(stored);
    } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listRecentActivity(8).then((data) => {
      setItems(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const unreadCount = lastSeen
    ? items.filter((i) => new Date(i.created_at) > new Date(lastSeen)).length
    : items.length;

  const markAllRead = () => {
    const now = new Date().toISOString();
    try {
      localStorage.setItem(SEEN_KEY, now);
      setLastSeen(now);
    } catch {}
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        className={styles.bellButton}
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className={styles.bellDot} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.panelTitle}>Notifications</div>
                <div className={styles.panelSub}>
                  {unreadCount > 0 ? unreadCount + " new" : "You are all caught up"}
                </div>
              </div>
              <div className={styles.panelHeaderActions}>
                {unreadCount > 0 && (
                  <button className={styles.markReadBtn} onClick={markAllRead} title="Mark all read">
                    <Check size={14} />
                  </button>
                )}
                <button className={styles.closeBtn} onClick={() => setOpen(false)}>
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className={styles.list}>
              {loading ? (
                <div className={styles.empty}>Loading...</div>
              ) : items.length === 0 ? (
                <div className={styles.empty}>
                  <Sparkles size={22} />
                  <div>Nothing yet</div>
                  <div className={styles.emptySub}>Activity from your tools shows up here.</div>
                </div>
              ) : (
                items.map((item) => {
                  const { Icon, gold } = iconFor(item.kind);
                  const unread = lastSeen ? new Date(item.created_at) > new Date(lastSeen) : true;
                  return (
                    <div key={item.id} className={`${styles.item} ${unread ? styles.itemUnread : ""}`}>
                      <div className={`${styles.itemIcon} ${gold ? styles.itemIconGold : ""}`}>
                        <Icon size={16} strokeWidth={2} />
                      </div>
                      <div className={styles.itemBody}>
                        <div className={styles.itemTitle}>{item.title}</div>
                        <div className={styles.itemSub}>{item.sub}</div>
                      </div>
                      <div className={styles.itemTime}>{timeAgo(item.created_at)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
