"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { z } from "zod";
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

const registerSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(80),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password needs an uppercase letter").regex(/[0-9]/, "Password needs a number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function getFirstError(error: any): string {
  if (!error) return "Validation failed";
  const issue = (error.issues && error.issues[0]) || (error.errors && error.errors[0]);
  return issue?.message || "Please check your input";
}

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function getStrengthLabel(score: number) {
  if (score <= 1) return "Too short";
  if (score === 2) return "Getting there";
  if (score === 3) return "Looks good";
  return "Very strong";
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const strength = getStrength(password);

  const requirements = [
    { id: "length", label: "8+ characters", met: password.length >= 8 },
    { id: "uppercase", label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { id: "lowercase", label: "Lowercase letter", met: /[a-z]/.test(password) },
    { id: "number", label: "Number", met: /[0-9]/.test(password) },
    { id: "special", label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];
  const metCount = requirements.filter(r => r.met).length;
  const strengthClass = metCount <= 2 ? styles.passwordStrengthBarWeak : metCount <= 4 ? styles.passwordStrengthBarMedium : styles.passwordStrengthBarStrong;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validation = registerSchema.safeParse({ name, email, password, confirmPassword });
    if (!validation.success) {
      setError(getFirstError(validation.error));
      return;
    }
    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (authError) throw new Error(authError.message);
      router.push("/onboarding");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "We could not create your account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <Link href="/" className={styles.backLink}>← Back home</Link>

      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>Let us get you <span className={styles.formTitleAccent}>started.</span></h1>
        <p className={styles.formSubtitle}>One account. Ten tech stacks. A much calmer quarter ahead.</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.formError}>
          <AlertCircle size={16} /> {error}
        </motion.div>
      )}

      <form onSubmit={handleRegister} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Full Name</label>
          <div className={styles.inputWrapper}>
            <User size={18} className={styles.inputIcon} />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={styles.input} required />
          </div>
        </div>

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
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              placeholder="Create a password"
              className={styles.input}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.togglePassword} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordFocused && (
            <>
              <div className={styles.passwordStrength}>
                <div className={`${styles.passwordStrengthBar} ${metCount >= 1 ? strengthClass : ""}`} />
                <div className={`${styles.passwordStrengthBar} ${metCount >= 2 ? strengthClass : ""}`} />
                <div className={`${styles.passwordStrengthBar} ${metCount >= 3 ? strengthClass : ""}`} />
                <div className={`${styles.passwordStrengthBar} ${metCount >= 4 ? strengthClass : ""}`} />
                <div className={`${styles.passwordStrengthBar} ${metCount >= 5 ? strengthClass : ""}`} />
              </div>
              <div className={styles.passwordStrengthText}>
                {password.length === 0 ? "Enter a password" : `${getStrengthLabel(metCount)} (${metCount}/5)`}
              </div>
              <div className={styles.requirementsList}>
                {requirements.map((req) => (
                  <div key={req.id} className={`${styles.requirementItem} ${req.met ? styles.requirementMet : ""}`}>
                    <span className={styles.requirementDot} />
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Confirm Password</label>
          <div className={styles.inputWrapper}>
            <Lock size={18} className={styles.inputIcon} />
            <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" className={styles.input} required />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className={styles.togglePassword} aria-label="Toggle confirm password visibility">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className={styles.primaryButton}>
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
        </button>
      </form>

      <div className={styles.formFooter}>
        Already have an account? <Link href="/login">Sign in</Link>
      </div>
    </motion.div>
  );
}
