"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, X, Phone, Globe, MessageCircle, Pencil, Check, Trash2, Copy,
} from "lucide-react";
import styles from "./wellbeing.module.css";

type Contact = { name: string; phone: string };

const STORAGE_KEY = "codecampus_emergency_contact";

const isMobile = () => {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
};

function whatsappLink(phone: string) {
  return "https://wa.me/" + phone.replace(/[^\d]/g, "");
}

export default function CrisisPanel() {
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name && parsed?.phone) setContact(parsed);
      }
    } catch {}
  }, []);

  const copyNumber = async (label: string, phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } catch {}
  };

  const callNumber = (phone: string) => {
    if (isMobile()) {
      window.location.href = "tel:" + phone;
    } else {
      copyNumber(phone, phone);
    }
  };

  const saveContact = () => {
    const name = draftName.trim();
    const phone = draftPhone.trim().replace(/\s+/g, "");
    if (!name) { setError("Enter a name"); return; }
    if (!phone || !/^[+\d][\d\s\-()]{4,}$/.test(draftPhone.trim())) {
      setError("Enter a valid phone number");
      return;
    }
    const next = { name, phone };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setContact(next);
    setEditing(false);
    setError(null);
    setDraftName("");
    setDraftPhone("");
  };

  const removeContact = () => {
    localStorage.removeItem(STORAGE_KEY);
    setContact(null);
    setEditing(false);
  };

  const startEdit = () => {
    setDraftName(contact?.name || "");
    setDraftPhone(contact?.phone || "");
    setEditing(true);
    setError(null);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError(null);
    setDraftName("");
    setDraftPhone("");
  };

  return (
    <>
      <button className={styles.crisisFab} onClick={() => setOpen(true)} title="Need help now?">
        <Heart size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className={styles.crisisBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className={styles.crisisPanel}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.crisisHeader}>
                <div>
                  <div className={styles.crisisTitle}>You are not alone</div>
                  <div className={styles.crisisSub}>
                    Talk or text, free and confidential. Choose whichever feels easier.
                  </div>
                </div>
                <button className={styles.crisisClose} onClick={() => setOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className={styles.crisisList}>
                <div className={styles.crisisRow}>
                  <a
                    href={whatsappLink("+254722178177")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.crisisItem + " " + styles.crisisItemBtn}
                  >
                    <div className={styles.crisisIcon}><MessageCircle size={16} /></div>
                    <div className={styles.crisisInfo}>
                      <div className={styles.crisisName}>Befrienders Kenya</div>
                      <div className={styles.crisisDetail}>WhatsApp +254 722 178 177 · 24/7</div>
                    </div>
                  </a>
                  <button
                    className={styles.crisisCopyBtn}
                    onClick={() => callNumber("+254722178177")}
                    title={isMobile() ? "Call" : "Copy number"}
                  >
                    <Phone size={14} />
                  </button>
                </div>

                <div className={styles.crisisRow}>
                  <button className={styles.crisisItem + " " + styles.crisisItemBtn} onClick={() => callNumber("999")}>
                    <div className={styles.crisisIcon}><Phone size={16} /></div>
                    <div className={styles.crisisInfo}>
                      <div className={styles.crisisName}>Kenya Emergency</div>
                      <div className={styles.crisisDetail}>999 or 112 · immediate danger</div>
                    </div>
                  </button>
                  <button
                    className={styles.crisisCopyBtn}
                    onClick={() => copyNumber("emergency", "999")}
                    title="Copy number"
                  >
                    {copied === "emergency" ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className={styles.crisisItem}>
                  <div className={styles.crisisIcon}><Globe size={16} /></div>
                  <div className={styles.crisisInfo}>
                    <div className={styles.crisisName}>Find A Helpline</div>
                    <div className={styles.crisisDetail}>findahelpline.com · any country</div>
                  </div>
                </a>

                <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank" rel="noopener noreferrer" className={styles.crisisItem}>
                  <div className={styles.crisisIcon}><Globe size={16} /></div>
                  <div className={styles.crisisInfo}>
                    <div className={styles.crisisName}>IASP Crisis Centres</div>
                    <div className={styles.crisisDetail}>iasp.info · worldwide</div>
                  </div>
                </a>

                {!editing && contact && (
                  <div className={styles.crisisRow}>
                    <a
                      href={whatsappLink(contact.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.crisisItem + " " + styles.crisisItemBtn}
                    >
                      <div className={styles.crisisIcon}><MessageCircle size={16} /></div>
                      <div className={styles.crisisInfo}>
                        <div className={styles.crisisName}>{contact.name}</div>
                        <div className={styles.crisisDetail}>{contact.phone} · WhatsApp</div>
                      </div>
                    </a>
                    <button
                      className={styles.crisisCopyBtn}
                      onClick={() => callNumber(contact.phone)}
                      title={isMobile() ? "Call" : "Copy number"}
                    >
                      <Phone size={14} />
                    </button>
                    <button className={styles.crisisCopyBtn} onClick={startEdit} title="Edit">
                      <Pencil size={14} />
                    </button>
                  </div>
                )}

                {!editing && !contact && (
                  <button className={styles.crisisItem + " " + styles.crisisAddItem} onClick={startEdit}>
                    <div className={styles.crisisIcon}><MessageCircle size={16} /></div>
                    <div className={styles.crisisInfo}>
                      <div className={styles.crisisName}>Add someone you trust</div>
                      <div className={styles.crisisDetail}>A friend, a lecturer, or family</div>
                    </div>
                  </button>
                )}

                {editing && (
                  <div className={styles.crisisForm}>
                    <div className={styles.crisisFormLabel}>Someone you trust</div>
                    <input
                      className={styles.crisisInput}
                      placeholder="Name (e.g. Mum, Brian)"
                      value={draftName}
                      onChange={(e) => { setDraftName(e.target.value); setError(null); }}
                      autoFocus
                    />
                    <input
                      className={styles.crisisInput}
                      placeholder="Phone (+254 7XX XXX XXX)"
                      value={draftPhone}
                      onChange={(e) => { setDraftPhone(e.target.value); setError(null); }}
                      inputMode="tel"
                    />
                    {error && <div className={styles.crisisError}>{error}</div>}
                    <div className={styles.crisisFormActions}>
                      <button className={styles.crisisBtnGhost} onClick={cancelEdit}>Cancel</button>
                      {contact && (
                        <button className={styles.crisisBtnDanger} onClick={removeContact} title="Remove">
                          <Trash2 size={13} />
                        </button>
                      )}
                      <button className={styles.crisisBtnPrimary} onClick={saveContact}>
                        <Check size={13} /> Save
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.crisisFooter}>
                WhatsApp opens with the number ready. On mobile, the phone icon dials. On desktop, it copies.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
