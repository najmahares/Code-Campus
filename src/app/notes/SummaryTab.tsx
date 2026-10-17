"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import styles from "./notes.module.css";

type Props = {
  noteBody: string;
};

export default function SummaryTab({ noteBody }: Props) {
  const [bullets, setBullets] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const hasBody = noteBody && noteBody.replace(/<[^>]*>/g, "").trim().length > 10;
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notes/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to summarize");
      setBullets(data.bullets);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasBody) {
    return (
      <div className={styles.tabEmptyState}>
        <p className={styles.tabEmptyText}>This note is empty. Add some content to generate a summary.</p>
      </div>
    );
  }

  if (!bullets && !loading && !error) {
    return (
      <div className={styles.tabEmptyState}>
        <div className={styles.tabEmptyIcon}><Sparkles size={28} /></div>
        <h3 className={styles.tabEmptyTitle}>Generate a quick summary</h3>
        <p className={styles.tabEmptyText}>
          Get 4-6 revision-ready bullets from this note. Perfect for exam review.
        </p>
        <button className={styles.tabPrimaryBtn} onClick={generate}>
          <Sparkles size={16} /> Summarize this note
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.tabLoadingState}>
        <Loader2 size={32} className="animate-spin" />
        <p>Distilling your notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.tabEmptyState}>
        <p className={styles.tabErrorText}>{error}</p>
        <button className={styles.tabPrimaryBtn} onClick={generate}>
          <RefreshCw size={16} /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.summaryWrap}>
      <div className={styles.summaryHeader}>
        <span className={styles.summaryEyebrow}>Quick Revision</span>
        <button className={styles.tabSecondaryBtn} onClick={generate}>
          <RefreshCw size={14} /> Regenerate
        </button>
      </div>
      <ul className={styles.summaryList}>
        {bullets?.map((b, i) => (
          <li key={i} className={styles.summaryItem}>
            <span className={styles.summaryBullet} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
