"use client";

import { useToast } from "@/components/ToastProvider";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, KeyRound, Terminal, Braces, FileCode } from "lucide-react";
import {
  createVaultItem,
  updateVaultItem,
  type VaultItem,
  type VaultType,
  TYPE_LABELS,
} from "@/lib/vault/store";
import styles from "./vault.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
  editing: VaultItem | null;
};

const TYPE_ICONS: Record<VaultType, any> = {
  secret: KeyRound,
  snippet: FileCode,
  command: Terminal,
  env_var: Braces,
};

export default function VaultModal({ isOpen, onClose, onSaved, editing }: Props) {
  const [title, setTitle] = useState("");
  const { toast } = useToast();
  const [type, setType] = useState<VaultType>("secret");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editing) {
        setTitle(editing.title);
        setType(editing.type);
        setValue(editing.value);
        setDescription(editing.description || "");
        setLanguage(editing.language || "");
        setTagsInput(editing.tags.join(", "));
      } else {
        setTitle("");
        setType("secret");
        setValue("");
        setDescription("");
        setLanguage("");
        setTagsInput("");
      }
      setError(null);
    }
  }, [isOpen, editing]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim() || !value.trim()) {
      setError("Title and value are required");
      return;
    }
    setSaving(true);
    setError(null);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    try {
      if (editing) {
        await updateVaultItem(editing.id, {
          title: title.trim(),
          type,
          value: value.trim(),
          description: description.trim() || null,
          language: language.trim() || null,
          tags,
        });
      } else {
        await createVaultItem({
          title: title.trim(),
          type,
          value: value.trim(),
          description: description.trim() || undefined,
          language: language.trim() || undefined,
          tags,
        });
      }
      await onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
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
            <div className={styles.modalTitle}>{editing ? "Edit item" : "New vault item"}</div>
            <div className={styles.modalSub}>
              {editing ? "Update the details" : "What are you saving?"}
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Title</label>
            <input
              type="text"
              className={styles.fieldInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. OpenAI API Key"
              autoFocus
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Type</label>
            <div className={styles.typeRow}>
              {(Object.keys(TYPE_LABELS) as VaultType[]).map((t) => {
                const Icon = TYPE_ICONS[t];
                return (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.typeBtn} ${type === t ? styles.typeBtnActive : ""}`}
                    onClick={() => setType(t)}
                  >
                    <Icon size={14} />
                    {TYPE_LABELS[t]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Value</label>
            <textarea
              className={styles.fieldTextarea}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                type === "secret"
                  ? "sk-..."
                  : type === "command"
                    ? "git rebase -i HEAD~3"
                    : type === "snippet"
                      ? "paste your code"
                      : "DATABASE_URL=postgres://..."
              }
              rows={5}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Description <span className={styles.optional}>(optional)</span>
            </label>
            <input
              type="text"
              className={styles.fieldInput}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this used for?"
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Language <span className={styles.optional}>(optional)</span>
              </label>
              <input
                type="text"
                className={styles.fieldInput}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="javascript, python, bash"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Tags <span className={styles.optional}>(comma-separated)</span>
              </label>
              <input
                type="text"
                className={styles.fieldInput}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="api, auth, stripe"
              />
            </div>
          </div>

          {error && <div className={styles.modalError}>{error}</div>}

          <div className={styles.modalFooter}>
            <button className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button
              className={styles.btnPrimary}
              onClick={handleSave}
              disabled={saving || !title.trim() || !value.trim()}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : editing ? (
                "Save changes"
              ) : (
                "Add to vault"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
