"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, FileText, Calendar, Heart, Sparkles } from "lucide-react";
import styles from "./Onboarding.module.css";

const STORAGE_KEY = "codecampus_onboarded";

const STEPS = [
  {
    title: "Welcome to Code Campus",
    desc: "Your quiet space to learn, build, and take care of yourself while you become a software engineer.",
    icon: <Sparkles size={32} />,
    color: "#E8A0A8",
  },
  {
    title: "Your tools, in one place",
    desc: "Capture ideas in Notes. Plan your week in Today. Build your capstones in Projects. Keep your secrets safe in Vault.",
    icon: <FileText size={32} />,
    color: "#D4AF37",
  },
  {
    title: "Don't forget to breathe",
    desc: "Burnout is real. Check in with your mood, take a 2-minute breathing reset, or talk to Scout when things get heavy.",
    icon: <Heart size={32} />,
    color: "#E86464",
  },
];

export default function Onboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem(STORAGE_KEY);
    if (!hasOnboarded) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      complete();
    }
  };

  const complete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.progress}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`${styles.dot} ${i <= step ? styles.dotActive : ""}`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className={styles.content}
              >
                <div className={styles.iconWrap} style={{ color: STEPS[step].color, background: `${STEPS[step].color}15`, borderColor: `${STEPS[step].color}30` }}>
                  {STEPS[step].icon}
                </div>
                <h2 className={styles.title}>{STEPS[step].title}</h2>
                <p className={styles.desc}>{STEPS[step].desc}</p>
              </motion.div>
            </AnimatePresence>

            <div className={styles.actions}>
              {step < STEPS.length - 1 ? (
                <>
                  <button className={styles.skipBtn} onClick={complete}>Skip</button>
                  <button className={styles.nextBtn} onClick={handleNext}>
                    Continue <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <button className={styles.nextBtn} onClick={handleNext}>
                  <Check size={16} /> Enter Code Campus
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
