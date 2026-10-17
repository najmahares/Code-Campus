"use client";

import { useToast } from "@/components/ToastProvider";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Calendar, Flag, FileText } from "lucide-react";
import type { Task } from "@/lib/tasks/store";
import styles from "./today.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (params: {
    title: string;
    description?: string;
    due_date?: string | null;
    priority: "low" | "medium" | "high";
  }) => void | Promise<void>;
  mode: "create" | "edit";
  initial?: Task;
};

export default function TaskModal({ isOpen, onClose, onSave, mode, initial }: Props) {
  const [title, setTitle] = useState(initial?.title || "");
  const { toast } = useToast();
  const [description, setDescription] = useState(initial?.description || "");
  const [dueDate, setDueDate] = useState(initial?.due_date || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    initial?.priority || "medium"
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate || null,
        priority,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className={styles.modalBackdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>{mode === "create" ? "New task" : "Edit task"}</div>
            <div className={styles.modalSub}>
              {mode === "create" ? "What needs to get done?" : "Update the details"}
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Title</label>
            <input
              type="text"
              className={styles.fieldInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              autoFocus
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Description <span className={styles.fieldOptional}>(optional)</span>
            </label>
            <textarea
              className={styles.fieldTextarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any details..."
              rows={3}
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <Calendar size={12} style={{ display: "inline", marginRight: "0.3rem" }} />
                Due date
              </label>
              <input
                type="date"
                className={styles.fieldInput}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <Flag size={12} style={{ display: "inline", marginRight: "0.3rem" }} />
                Priority
              </label>
              <div className={styles.priorityRow}>
                {(["low", "medium", "high"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`${styles.priorityBtn} ${priority === p ? styles[`priority${p.charAt(0).toUpperCase() + p.slice(1)}Active`] : ""}`}
                    onClick={() => setPriority(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={saving || !title.trim()}>
              {saving ? "Saving..." : mode === "create" ? "Create task" : "Save changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
