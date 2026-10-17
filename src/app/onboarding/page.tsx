"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { LogoLockup } from "@/components/Logo";
import styles from "./onboarding.module.css";

function SceneWelcome() {
  return (
    <svg viewBox="0 0 500 500" className={styles.illustrationSvg} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="welcomeGlow">
          <stop offset="0%" stopColor="#E8A0A8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#050505" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="250" cy="250" r="230" fill="url(#welcomeGlow)" />
      <g className={styles.spinSlow}>
        <circle cx="250" cy="250" r="210" fill="none" stroke="#E8A0A8" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="4 8" />
      </g>
      <g className={styles.spinReverse}>
        <circle cx="250" cy="250" r="175" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="2 6" />
      </g>
      <circle cx="250" cy="250" r="140" fill="none" stroke="#E8A0A8" strokeWidth="2" strokeOpacity="0.4" />
      <image href="/deer.svg" x="110" y="130" width="280" height="260" />
    </svg>
  );
}

function SceneChaos() {
  return (
    <svg viewBox="0 0 500 500" className={styles.illustrationSvg} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="chaosGlow">
          <stop offset="0%" stopColor="#8B1C24" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#050505" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="250" cy="250" r="230" fill="url(#chaosGlow)" />
      <g className={styles.bob} transform="translate(100, 140) rotate(-15)">
        <rect width="130" height="170" rx="10" fill="#0D0D0D" stroke="#E8A0A8" strokeWidth="2" strokeOpacity="0.6" />
        <line x1="20" y1="35" x2="110" y2="35" stroke="#E8A0A8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="20" y1="60" x2="90" y2="60" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="20" y1="85" x2="105" y2="85" stroke="#E8A0A8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="20" y1="110" x2="70" y2="110" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="20" y1="135" x2="100" y2="135" stroke="#E8A0A8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      </g>
      <g className={styles.bobSlow} transform="translate(280, 170) rotate(12)">
        <rect width="130" height="170" rx="10" fill="#0D0D0D" stroke="#D4AF37" strokeWidth="2" strokeOpacity="0.6" />
        <line x1="20" y1="35" x2="100" y2="35" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="20" y1="60" x2="110" y2="60" stroke="#E8A0A8" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="20" y1="85" x2="80" y2="85" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="20" y1="110" x2="105" y2="110" stroke="#E8A0A8" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="20" y1="135" x2="65" y2="135" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      </g>
      <g className={styles.bob} transform="translate(180, 280) rotate(-5)" style={{ animationDelay: "1s" }}>
        <rect width="140" height="120" rx="10" fill="#0D0D0D" stroke="#E8A0A8" strokeWidth="2" strokeOpacity="0.5" />
        <line x1="20" y1="30" x2="120" y2="30" stroke="#E8A0A8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="20" y1="55" x2="100" y2="55" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="20" y1="80" x2="115" y2="80" stroke="#E8A0A8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      </g>
    </svg>
  );
}

function SceneRefinery() {
  return (
    <svg viewBox="0 0 500 500" className={styles.illustrationSvg} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="refineryGlow">
          <stop offset="0%" stopColor="#E8A0A8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#050505" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="250" cy="250" r="230" fill="url(#refineryGlow)" />
      <g transform="translate(60, 180)">
        <rect width="160" height="220" rx="12" fill="#0D0D0D" stroke="#E8A0A8" strokeWidth="2" strokeOpacity="0.4" />
        <line x1="20" y1="40" x2="140" y2="40" stroke="#E8A0A8" strokeWidth="2" strokeLinecap="round" opacity="0.4" strokeDasharray="4 6" />
        <line x1="20" y1="70" x2="120" y2="70" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" opacity="0.3" strokeDasharray="4 6" />
        <line x1="20" y1="100" x2="140" y2="100" stroke="#E8A0A8" strokeWidth="2" strokeLinecap="round" opacity="0.4" strokeDasharray="4 6" />
        <line x1="20" y1="130" x2="90" y2="130" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" opacity="0.3" strokeDasharray="4 6" />
        <line x1="20" y1="160" x2="130" y2="160" stroke="#E8A0A8" strokeWidth="2" strokeLinecap="round" opacity="0.4" strokeDasharray="4 6" />
        <line x1="20" y1="190" x2="70" y2="190" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" opacity="0.3" strokeDasharray="4 6" />
      </g>
      <g className={styles.bobSlow} transform="translate(230, 230)">
        <path d="M0 0 L20 -15 L40 0 L40 30 L20 15 L0 30 Z" fill="#D4AF37" />
      </g>
      <g transform="translate(280, 180)">
        <rect width="160" height="220" rx="12" fill="#0D0D0D" stroke="#E8A0A8" strokeWidth="2" strokeOpacity="0.6" />
        <line x1="20" y1="40" x2="140" y2="40" stroke="#E8A0A8" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <line x1="20" y1="70" x2="110" y2="70" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <line x1="20" y1="100" x2="140" y2="100" stroke="#E8A0A8" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <line x1="20" y1="130" x2="90" y2="130" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <line x1="20" y1="160" x2="130" y2="160" stroke="#E8A0A8" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <line x1="20" y1="190" x2="100" y2="190" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      </g>
    </svg>
  );
}

function SceneVault() {
  return (
    <svg viewBox="0 0 500 500" className={styles.illustrationSvg} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="vaultGlow">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#050505" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="250" cy="250" r="230" fill="url(#vaultGlow)" />
      <g transform="translate(250, 250)">
        <path d="M-40 -100 L0 -130 L40 -100 L40 -40 L0 -10 L-40 -40 Z" fill="none" stroke="#E8A0A8" strokeWidth="6" strokeLinejoin="round" />
        <rect x="-110" y="-60" width="220" height="200" rx="20" fill="#0D0D0D" stroke="#E8A0A8" strokeWidth="3" strokeOpacity="0.7" />
        <rect x="-90" y="-40" width="180" height="160" rx="12" fill="none" stroke="#D4AF37" strokeWidth="2" strokeOpacity="0.4" strokeDasharray="4 6" />
        <g className={styles.spinSlow}>
          <circle r="45" fill="none" stroke="#D4AF37" strokeWidth="4" />
          <circle r="30" fill="none" stroke="#E8A0A8" strokeWidth="2" strokeOpacity="0.6" />
          <line x1="0" y1="-45" x2="0" y2="-30" stroke="#E8A0A8" strokeWidth="4" strokeLinecap="round" />
          <line x1="45" y1="0" x2="30" y2="0" stroke="#E8A0A8" strokeWidth="4" strokeLinecap="round" />
          <line x1="0" y1="45" x2="0" y2="30" stroke="#E8A0A8" strokeWidth="4" strokeLinecap="round" />
          <line x1="-45" y1="0" x2="-30" y2="0" stroke="#E8A0A8" strokeWidth="4" strokeLinecap="round" />
        </g>
        <circle r="12" fill="#D4AF37" />
        <circle r="5" fill="#050505" />
      </g>
    </svg>
  );
}

function SceneCalm() {
  return (
    <svg viewBox="0 0 500 500" className={styles.illustrationSvg} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="calmGlow">
          <stop offset="0%" stopColor="#E8A0A8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#050505" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="250" cy="250" r="230" fill="url(#calmGlow)" />
      <g className={styles.spinSlow}>
        <circle cx="250" cy="250" r="200" fill="none" stroke="#E8A0A8" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 10" />
      </g>
      <g className={styles.spinReverse}>
        <circle cx="250" cy="250" r="160" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="2 8" />
      </g>
      <g transform="translate(180, 280)">
        <ellipse cx="70" cy="120" rx="90" ry="14" fill="#E8A0A8" opacity="0.15" />
        <rect x="0" y="0" width="140" height="110" rx="12" fill="#0D0D0D" stroke="#E8A0A8" strokeWidth="2" strokeOpacity="0.5" />
        <rect x="0" y="0" width="140" height="20" rx="10" fill="#E8A0A8" />
        <path d="M140 30 Q170 30 170 60 Q170 90 140 90" fill="none" stroke="#E8A0A8" strokeWidth="6" strokeLinecap="round" />
        <g>
          <path className={styles.steam} d="M45 -5 Q40 -20 50 -30" stroke="#E8A0A8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
          <path className={styles.steam} d="M70 -5 Q65 -25 75 -40" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" style={{ animationDelay: "0.5s" }} />
          <path className={styles.steam} d="M95 -5 Q90 -20 100 -30" stroke="#E8A0A8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" style={{ animationDelay: "1s" }} />
        </g>
      </g>
    </svg>
  );
}

const scenes = [
  {
    id: "welcome",
    eyebrow: "01 · Welcome",
    titleTop: "Deep breath.",
    titleAccent: "You're in.",
    description: "Ten stacks. Three months. One brain. Bootcamp is going to test every corner of it. We're here to make sure the logistics do not break you.",
    accent: "gradient",
    Illustration: SceneWelcome,
  },
  {
    id: "problem",
    eyebrow: "02 · The Reality",
    titleTop: "Real talk.",
    titleAccent: "This gets messy.",
    description: "Your notes live in three apps. Your API keys are in a Slack DM to yourself. You have five folders named test and none of them are the right one.",
    accent: "outline",
    Illustration: SceneChaos,
  },
  {
    id: "refinery",
    eyebrow: "03 · The Refinery",
    titleTop: "Dump it.",
    titleAccent: "We'll sort it.",
    description: "Throw your chaos at us. Voice memos, error screenshots, half-finished thoughts. You get back clean notes, tagged by tech stack, ready to revise.",
    accent: "gradient",
    Illustration: SceneRefinery,
  },
  {
    id: "vault",
    eyebrow: "04 · The Vault",
    titleTop: "Everything.",
    titleAccent: "Locked in.",
    description: "API keys, terminal commands, snippets you keep Googling. Encrypted. Searchable in half a second. Right where you left them.",
    accent: "outline",
    Illustration: SceneVault,
  },
  {
    id: "calm",
    eyebrow: "05 · The Guardian",
    titleTop: "And we watch",
    titleAccent: "your back.",
    description: "Five-second check-ins. When you're running on empty, the app slows down. Deadlines shift. Lo-fi starts playing. You get to be a person.",
    accent: "gradient",
    Illustration: SceneCalm,
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const router = useRouter();
  const scene = scenes[current];

  const goNext = () => {
    if (current < scenes.length - 1) {
      setDirection(1);
      setCurrent(current + 1);
    } else {
      document.cookie = "cc_onboarded=true; path=/; max-age=31536000";
      router.push("/home");
    }
  };

  const goBack = () => {
    if (current > 0) {
      setDirection(-1);
      setCurrent(current - 1);
    }
  };

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const titleAccentClass = scene.accent === "gradient" ? styles.gradientText : styles.outlineText;

  return (
    <div className={styles.container}>
      <div className={styles.bgGrid} />
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />

      <nav className={styles.nav}>
        <LogoLockup size={48} />
        <button onClick={() => router.push("/login")} className={styles.skipBtn}>
          Skip for now
        </button>
      </nav>

      <div className={styles.sceneContainer}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={scene.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={styles.sceneInner}
          >
            <div className={styles.sceneIllustration}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <scene.Illustration />
              </motion.div>
            </div>

            <div className={styles.sceneText}>
              <div className={styles.sceneEyebrow}>{scene.eyebrow}</div>
              <h1 className={styles.sceneTitle}>
                <span className={styles.sceneTitleLine}>{scene.titleTop}</span>
                <span className={`${styles.sceneTitleLine} ${titleAccentClass}`}>{scene.titleAccent}</span>
              </h1>
              <p className={styles.sceneDescription}>{scene.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.controls}>
        <div className={styles.dots}>
          {scenes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className={`${styles.dot} ${i === current ? styles.dotActive : ""} ${i < current ? styles.dotDone : ""}`}
              aria-label={`Go to scene ${i + 1}`}
            />
          ))}
        </div>
        <div className={styles.navBtns}>
          <button onClick={goBack} disabled={current === 0} className={styles.backBtn}>
            <ArrowLeft size={18} /> Back
          </button>
          <motion.button
            key={`next-${current}`}
            onClick={goNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={styles.nextBtn}
          >
            {current === scenes.length - 1 ? "Get Started" : "Next"} <ArrowRight size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
