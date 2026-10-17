"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { z } from "zod";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function getFirstError(error: any): string {
  if (!error) return "Validation failed";
  const issue = (error.issues && error.issues[0]) || (error.errors && error.errors[0]);
  return issue?.message || "Please check your input";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(getFirstError(validation.error));
      return;
    }
    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw new Error(authError.message);
      router.push("/home");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "We could not sign you in. Please check your details and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <Link href="/" className={styles.backLink}>← Back home</Link>

      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>Welcome <span className={styles.formTitleAccent}>back.</span></h1>
        <p className={styles.formSubtitle}>Your notes are exactly where you left them. Pick up right where you stopped.</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.formError}>
          <AlertCircle size={16} /> {error}
        </motion.div>
      )}

      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Email</label>
          <div className={styles.inputWrapper}>
            <Mail size={18} className={styles.inputIcon} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={styles.input} required />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Password</label>
          <div className={styles.inputWrapper}>
            <Lock size={18} className={styles.inputIcon} />
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className={styles.input} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.togglePassword} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.formRow}>
          <label className={styles.checkbox}><input type="checkbox" /> Keep me signed in</label>
          <Link href="/forgot-password" className={styles.textLink}>Forgot password?</Link>
        </div>

        <button type="submit" disabled={isLoading} className={styles.primaryButton}>
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
        </button>
      </form>

      <div className={styles.formFooter}>
        New to Code Campus? <Link href="/register">Create an account</Link>
      </div>
    </motion.div>
  );
}
