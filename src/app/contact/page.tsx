"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Check } from "lucide-react";
import { LogoLockup } from "@/components/Logo";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus("sending");
    setTimeout(() => setStatus("done"), 1200);
  };

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={16} /> Back to home
          </Link>
          <LogoLockup size={28} />
          <div style={{ width: 100 }} />
        </div>
      </nav>

      <main className={styles.main}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={styles.formContainer}
        >
          <h1 className={styles.title}>Say hello.</h1>
          <p className={styles.subtitle}>
            Got a question, a bug report, or just want to show us what you're building? Drop us a
            message. We read everything.
          </p>

          {status === "done" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.successState}
            >
              <div className={styles.successIcon}>
                <Check size={24} />
              </div>
              <h3>Message sent</h3>
              <p>We usually reply within a day.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Your name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Your email</label>
                <input
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>How can we help?</label>
                <textarea
                  className={styles.textarea}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={status === "sending"}>
                {status === "sending" ? (
                  "Sending..."
                ) : (
                  <>
                    <Send size={16} /> Send message
                  </>
                )}
              </button>
              <p className={styles.footerNote}>We usually reply within a day.</p>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}
