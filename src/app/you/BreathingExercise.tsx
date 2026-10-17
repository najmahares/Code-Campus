"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Wind } from "lucide-react";
import styles from "./wellbeing.module.css";

type Pattern = {
  id: string;
  name: string;
  description: string;
  steps: { phase: "in" | "hold" | "out" | "holdOut"; seconds: number }[];
};

const PATTERNS: Pattern[] = [
  {
    id: "box",
    name: "Box Breathing",
    description: "Quick reset. 3 in, 3 hold, 3 out, 3 hold.",
    steps: [
      { phase: "in", seconds: 3 },
      { phase: "hold", seconds: 3 },
      { phase: "out", seconds: 3 },
      { phase: "holdOut", seconds: 3 },
    ],
  },
  {
    id: "478",
    name: "4-7-8 Breathing",
    description: "Deep relaxation. 4 in, 4 hold, 6 out.",
    steps: [
      { phase: "in", seconds: 4 },
      { phase: "hold", seconds: 4 },
      { phase: "out", seconds: 6 },
    ],
  },
  {
    id: "calm",
    name: "Calm Breath",
    description: "Gentle and easy. 3 in, 5 out.",
    steps: [
      { phase: "in", seconds: 3 },
      { phase: "out", seconds: 5 },
    ],
  },
];

type Props = {
  onComplete: (pattern: string, seconds: number) => void;
};

export default function BreathingExercise({ onComplete }: Props) {
  const [picked, setPicked] = useState<Pattern>(PATTERNS[0]);
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const start = () => {
    setRunning(true);
    setPhaseIndex(0);
    setElapsed(0);
    setCycles(0);
    startTimeRef.current = Date.now();
    setCountdown(picked.steps[0].seconds);

    let currentStep = 0;
    let currentCountdown = picked.steps[0].seconds;

    timerRef.current = setInterval(() => {
      currentCountdown -= 1;
      setElapsed(Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000));

      if (currentCountdown <= 0) {
        currentStep = (currentStep + 1) % picked.steps.length;
        if (currentStep === 0) setCycles((c) => c + 1);
        setPhaseIndex(currentStep);
        currentCountdown = picked.steps[currentStep].seconds;
      }
      setCountdown(currentCountdown);
    }, 1000);
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    if (elapsed > 10) onComplete(picked.id, elapsed);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setPhaseIndex(0);
    setCountdown(picked.steps[0].seconds);
    setElapsed(0);
    setCycles(0);
  };

  const phase = picked.steps[phaseIndex]?.phase || "in";
  const total = picked.steps[phaseIndex]?.seconds || 4;
  const progress = (total - countdown) / total;

  const scale = phase === "in" ? 0.6 + progress * 0.6 :
                phase === "out" ? 1.2 - progress * 0.6 :
                phase === "hold" ? 1.2 : 0.6;

  const phaseLabel = phase === "in" ? "Breathe in" :
                     phase === "out" ? "Breathe out" :
                     phase === "hold" ? "Hold" : "Hold";

  return (
    <div className={styles.breathingWrap}>
      <div className={styles.patternRow}>
        {PATTERNS.map((p) => (
          <button
            key={p.id}
            className={`${styles.patternBtn} ${picked.id === p.id ? styles.patternBtnActive : ""}`}
            onClick={() => { reset(); setPicked(p); }}
            disabled={running}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className={styles.breathingStage}>
        <motion.div
          className={styles.breathingOrb}
          animate={{ scale, opacity: running ? 0.9 : 0.6 }}
          transition={{ duration: phase === "hold" || phase === "holdOut" ? 0.3 : 1, ease: "easeInOut" }}
        />
        <div className={styles.breathingInner}>
          <AnimatePresence mode="wait">
            {running ? (
              <motion.div
                key={phaseLabel}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className={styles.breathingLabel}
              >
                {phaseLabel}
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.breathingReady}
              >
                <Wind size={32} />
              </motion.div>
            )}
          </AnimatePresence>
          {running && <div className={styles.breathingCount}>{countdown}</div>}
        </div>
      </div>

      <div className={styles.breathingStats}>
        <div className={styles.breathingStat}>
          <div className={styles.breathingStatValue}>{cycles}</div>
          <div className={styles.breathingStatLabel}>cycles</div>
        </div>
        <div className={styles.breathingStat}>
          <div className={styles.breathingStatValue}>
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
          </div>
          <div className={styles.breathingStatLabel}>elapsed</div>
        </div>
      </div>

      <div className={styles.breathingControls}>
        {running ? (
          <button className={styles.breathingBtnStop} onClick={stop}>
            <Pause size={16} /> Finish
          </button>
        ) : (
          <button className={styles.breathingBtn} onClick={start}>
            <Play size={16} /> Begin
          </button>
        )}
        <button className={styles.breathingBtnGhost} onClick={reset}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className={styles.breathingDescription}>{picked.description}</div>
    </div>
  );
}
