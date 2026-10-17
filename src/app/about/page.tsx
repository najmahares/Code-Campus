"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { LogoLockup } from "@/components/Logo";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.backBtn}><ArrowLeft size={16} /> Back to home</Link>
          <LogoLockup size={28} />
          <div style={{ width: 100 }} />
        </div>
      </nav>

      <main className={styles.main}>
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.hero}
        >
          <h1 className={styles.title}>We got tired of jumping between five different apps.</h1>
          <p className={styles.subtitle}>
            Code Campus started as a tool for our own coursework. We were spending more time organizing our tools than actually writing code. So we built something better.
          </p>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={styles.philosophy}
        >
          <div className={styles.philosophyInner}>
            <h2 className={styles.sectionTitle}>Built for the way you actually work.</h2>
            <p className={styles.text}>
              You're a student, not a machine. Tech school is intense. We built this app to handle the organization, so you have the headspace to focus on the code. Whether you're shipping a capstone or just trying to pass a tough class, this is the setup we wished we had.
            </p>
          </div>
        </motion.section>
      </main>

      <footer className={styles.footer}>
        <LogoLockup size={24} />
      </footer>
    </div>
  );
}
