"use client";

import { motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import styles from "./EmptyState.module.css";

type Props = {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  onSecondaryAction?: () => void;
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  onSecondaryAction,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.wrap}
    >
      <div className={styles.iconWrap}>
        {icon}
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.desc}>{description}</p>

      <div className={styles.actions}>
        {actionLabel && actionHref && (
          <Link href={actionHref} className={styles.primaryBtn}>
            <Plus size={16} strokeWidth={3} /> {actionLabel}
          </Link>
        )}
        {actionLabel && onAction && (
          <button onClick={onAction} className={styles.primaryBtn}>
            <Plus size={16} strokeWidth={3} /> {actionLabel}
          </button>
        )}
        {secondaryLabel && secondaryHref && (
          <Link href={secondaryHref} className={styles.secondaryBtn}>
            {secondaryLabel} <ArrowRight size={14} />
          </Link>
        )}
        {secondaryLabel && onSecondaryAction && (
          <button onClick={onSecondaryAction} className={styles.secondaryBtn}>
            {secondaryLabel} <ArrowRight size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
