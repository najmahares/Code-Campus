"use client";

import { useEffect, useState } from "react";
import { X, History, RotateCcw, Loader2 } from "lucide-react";
import { listVersions } from "@/lib/notes/store";
import styles from "./notes.module.css";

type Props = {
  noteId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (body: string) => Promise<void>;
};

export default function VersionHistory({ noteId, isOpen, onClose, onRestore }: Props) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      listVersions(noteId)
        .then(setVersions)
        .catch(() => setVersions([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen, noteId]);

  if (!isOpen) return null;

  const handleRestore = async (body: string, id: string) => {
    setRestoring(id);
    try {
      await onRestore(body);
      onClose();
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div className={styles.drawerBackdrop} onClick={onClose}>
      <div className={styles.versionPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.versionHeader}>
          <div>
            <div className={styles.versionTitle}><History size={18} /> Version history</div>
            <div className={styles.versionSub}>{versions.length} saved version{versions.length !== 1 ? "s" : ""}</div>
          </div>
          <button className={styles.captureClose} onClick={onClose}><X size={18} /></button>
        </div>

        <div className={styles.versionBody}>
          {loading ? (
            <div className={styles.tabLoadingState}><Loader2 size={24} className="animate-spin" /></div>
          ) : versions.length === 0 ? (
            <div className={styles.tabEmptyState}>
              <p className={styles.tabEmptyText}>No saved versions yet. Versions are saved automatically when you refine or edit.</p>
            </div>
          ) : (
            versions.map((v) => (
              <div key={v.id} className={styles.versionItem}>
                <div className={styles.versionMeta}>
                  <span className={styles.versionType}>{v.version_type}</span>
                  <span className={styles.versionDate}>{new Date(v.created_at).toLocaleString()}</span>
                </div>
                <div className={styles.versionPreview}>
                  {v.body.replace(/<[^>]*>/g, "").slice(0, 160)}
                  {v.body.length > 160 ? "..." : ""}
                </div>
                <button
                  className={styles.versionRestore}
                  onClick={() => handleRestore(v.body, v.id)}
                  disabled={restoring !== null}
                >
                  {restoring === v.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                  Restore this version
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
