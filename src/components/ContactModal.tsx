"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Send, Check } from "lucide-react";
import { LogoLockup } from "./Logo";
import modalStyles from "./ContactModal.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ContactModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSent(true);
    setTimeout(() => {
      onClose();
      setSent(false);
      setName("");
      setEmail("");
      setMessage("");
    }, 1800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={modalStyles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={modalStyles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={modalStyles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>

            {sent ? (
              <div className={modalStyles.successWrap}>
                <div className={modalStyles.successIcon}>
                  <Check size={32} />
                </div>
                <h2 className={modalStyles.successTitle}>Message sent</h2>
                <p className={modalStyles.successText}>We&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <>
                <div className={modalStyles.header}>
                  <LogoLockup size={36} />
                </div>

                <h2 className={modalStyles.title}>Contact Us</h2>
                <p className={modalStyles.subtitle}>
                  We welcome questions, critique, and practitioner input.
                </p>

                <form className={modalStyles.form} onSubmit={handleSubmit}>
                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Full name</label>
                    <input
                      type="text"
                      className={modalStyles.input}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Email</label>
                    <input
                      type="email"
                      className={modalStyles.input}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className={modalStyles.field}>
                    <label className={modalStyles.label}>Message</label>
                    <textarea
                      className={modalStyles.textarea}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className={modalStyles.submitBtn} disabled={sending}>
                    {sending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send size={16} /> Send message
                      </>
                    )}
                  </button>
                </form>

                <p className={modalStyles.directEmail}>
                  Or email us directly at{" "}
                  <a href="mailto:haresnajma@gmail.com">haresnajma@gmail.com</a>
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
