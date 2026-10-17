"use client";

import { Check, Clock, MoreVertical, Pencil, Trash2, Star } from "lucide-react";
import { motion } from "framer-motion";
import { isOverdue, formatDueDate, type Task } from "@/lib/tasks/store";
import styles from "./today.module.css";

type Props = {
  task: Task;
  isTopFocus: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onSnooze: (id: string, days: number) => void;
};

export default function TaskCard({
  task,
  isTopFocus,
  onToggle,
  onEdit,
  onDelete,
  onSnooze,
}: Props) {
  const overdue = isOverdue(task);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${styles.taskCard} ${task.completed ? styles.taskCardCompleted : ""} ${isTopFocus ? styles.taskCardFocus : ""} ${overdue ? styles.taskCardOverdue : ""}`}
    >
      <button
        className={`${styles.taskCheckbox} ${task.completed ? styles.taskCheckboxChecked : ""}`}
        onClick={() => onToggle(task.id, !task.completed)}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            <Check size={14} strokeWidth={3} />
          </motion.div>
        )}
      </button>

      <div className={styles.taskBody}>
        <div className={styles.taskHeader}>
          <h3 className={styles.taskTitle}>
            {isTopFocus && <Star size={12} className={styles.taskFocusStar} fill="#E8A0A8" />}
            {task.title}
          </h3>
          <span
            className={`${styles.taskPriority} ${styles[`taskPriority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`]}`}
          >
            {task.priority}
          </span>
        </div>

        {task.description && <p className={styles.taskDescription}>{task.description}</p>}

        <div className={styles.taskMeta}>
          {task.due_date && (
            <span className={`${styles.taskDue} ${overdue ? styles.taskDueOverdue : ""}`}>
              <Clock size={11} />
              {overdue ? `Overdue · ${formatDueDate(task.due_date)}` : formatDueDate(task.due_date)}
            </span>
          )}
          {task.snoozed_until && <span className={styles.taskSnoozed}>Snoozed</span>}
        </div>
      </div>

      <div className={styles.taskActions}>
        {!task.completed && task.due_date && (
          <div className={styles.snoozeRow}>
            <button
              className={styles.snoozeBtn}
              onClick={() => onSnooze(task.id, 1)}
              title="Snooze 1 day"
            >
              +1d
            </button>
            <button
              className={styles.snoozeBtn}
              onClick={() => onSnooze(task.id, 7)}
              title="Snooze 1 week"
            >
              +7d
            </button>
          </div>
        )}
        <button className={styles.taskActionBtn} onClick={onEdit} title="Edit">
          <Pencil size={14} />
        </button>
        <button className={styles.taskActionBtn} onClick={onDelete} title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
