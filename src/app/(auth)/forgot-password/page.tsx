"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

function getFirstError(error: any): string {
  if (!error) return "Validation failed";
  const issue = (error.issues && error.issues[0]) || (error.errors && error.errors[0]);
  return issue?.message || "Please check your input";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validation = schema.safeParse({ email });
    if (!validation.success) {
      setError(getFirstError(validation.error));
      return;
    }
    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (authError) throw new Error(authError.message);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "We could not send the reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <Link href="/login" className={styles.backLink}><ArrowLeft size={16} /> Back to sign in</Link>

      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>Let us help you <span className={styles.formTitleAccent}>back in.</span></h1>
        <p className={styles.formSubtitle}>Pop your email below and we will send a link to reset your password.</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.formError}>
          <AlertCircle size={16} /> {error}
        </motion.div>
      )}

      {success ? (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.formSuccess}>
          <CheckCircle2 size={16} />
          <span>Check your inbox. We sent a reset link to <strong>{email}</strong>.</span>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Email</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={styles.input} required />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className={styles.primaryButton}>
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Send Reset Link <ArrowRight size={18} /></>}
          </button>
        </form>
      )}

      <div className={styles.formFooter}>
        Remembered it after all? <Link href="/login">Sign in</Link>
      </div>
    </motion.div>
  );
}
