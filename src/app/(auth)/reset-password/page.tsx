"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { z } from "zod";
import { Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password needs an uppercase letter")
      .regex(/[0-9]/, "Password needs a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function getFirstError(error: any): string {
  if (!error) return "Validation failed";
  const issue = (error.issues && error.issues[0]) || (error.errors && error.errors[0]);
  return issue?.message || "Please check your input";
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("This reset link has expired. Please request a fresh one from the login page.");
      }
    };
    checkSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validation = schema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      setError(getFirstError(validation.error));
      return;
    }
    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) throw new Error(authError.message);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "We could not update your password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>
          Almost <span className={styles.formTitleAccent}>there.</span>
        </h1>
        <p className={styles.formSubtitle}>
          Choose a new password that is easy for you to remember but hard to guess.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.formError}
        >
          <AlertCircle size={16} /> {error}
        </motion.div>
      )}

      {success ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.formSuccess}
        >
          <CheckCircle2 size={16} />
          <span>Your password is updated. Sending you to sign in...</span>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>New Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePassword}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Confirm Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className={styles.togglePassword}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className={styles.primaryButton}>
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Update Password <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      )}
    </motion.div>
  );
}
