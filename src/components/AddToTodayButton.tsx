"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, Loader2, Plus } from "lucide-react";
import { createTask } from "@/lib/tasks/store";
import styles from "./AddToTodayButton.module.css";

type Props = {
  title: string;
  description?: string;
  linkedNoteId?: string;
};

export default function AddToTodayButton({ title, description, linkedNoteId }: Props) {
  const [open, setOpen] = useState(false);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createTask({
        title: title.slice(0, 200),
        description: description?.slice(0, 500),
        due_date: dueDate,
        priority,
        linked_note_id: linkedNoteId,
      });
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setOpen(false);
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <button className={styles.trigger} onClick={() => setOpen(!open)}>
        <Plus size={14} strokeWidth={3} /> Add to Today
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.popover}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {done ? (
              <div className={styles.doneState}>
                <Check size={20} />
                <span>Added to Today</span>
              </div>
            ) : (
              <>
                <div className={styles.fieldRow}>
                  <label className={styles.label}>
                    <Calendar size={11} />
                    Due
                  </label>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div className={styles.fieldRow}>
                  <label className={styles.label}>Priority</label>
                  <div className={styles.priorities}>
                    {(["low", "medium", "high"] as const).map((p) => (
                      <button
                        key={p}
                        className={`${styles.priBtn} ${priority === p ? styles.priActive : ""}`}
                        onClick={() => setPriority(p)}
                        data-priority={p}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : "Create task"}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
