"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import styles from "./error.module.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.page}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.card}
      >
        <div className={styles.iconWrap}>
          <span className={styles.icon}>♡</span>
        </div>
        <h1 className={styles.title}>Something went wrong.</h1>
        <p className={styles.desc}>
          We hit a small snag loading this page. Your data is safe. Try refreshing, or head back home.
        </p>
        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={() => reset()}>
            Try again <ArrowRight size={16} />
          </button>
          <Link href="/home" className={styles.secondaryBtn}>
            <Home size={16} /> Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
