"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flower2, Play, X, Clock } from "lucide-react";
import styles from "./wellbeing.module.css";

type Meditation = {
  id: string;
  name: string;
  teacher: string;
  duration: string;
  category: string;
  youtubeId: string;
  color: string;
  description: string;
};

const MEDITATIONS: Meditation[] = [
  {
    id: "5-min-reset",
    name: "5-Minute Reset",
    teacher: "Goodful",
    duration: "5 min",
    category: "reset",
    youtubeId: "inpok4MKVLM",
    color: "#E8A0A8",
    description: "A quick reset for between classes.",
  },
  {
    id: "yoga-adriene-calm",
    name: "Instant Calm",
    teacher: "Yoga with Adriene",
    duration: "5 min",
    category: "anxiety",
    youtubeId: "O-6f5wQXSu8",
    color: "#D4AF37",
    description: "Breathwork for a fast calm-down.",
  },
  {
    id: "headspace-focus",
    name: "Focus & Motivation",
    teacher: "Headspace",
    duration: "10 min",
    category: "focus",
    youtubeId: "6TH2hY1s-Oc",
    color: "#A88CE8",
    description: "Guided meditation before deep work.",
  },
];

export default function MeditationPlayer() {
  const [active, setActive] = useState<Meditation | null>(null);

  return (
    <div className={styles.meditationWrap}>
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={styles.meditationPlaying}
          >
            <div className={styles.nowPlaying}>
              <div className={styles.nowPlayingDot} style={{ background: active.color }} />
              <div className={styles.nowPlayingInfo}>
                <div className={styles.nowPlayingName}>{active.name}</div>
                <div className={styles.nowPlayingSub}>{active.teacher} · {active.duration}</div>
              </div>
              <button className={styles.nowPlayingStop} onClick={() => setActive(null)}>
                <X size={14} /> Close
              </button>
            </div>
            <div className={styles.videoWrap}>
              <iframe
                width="100%"
                height="100%"
                src={"https://www.youtube.com/embed/" + active.youtubeId + "?rel=0&modestbranding=1&playsinline=1&origin=" + (typeof window !== "undefined" ? window.location.origin : "")}
                title={active.name}
                frameBorder="0"
                referrerPolicy="origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className={styles.meditationDescription}>{active.description}</div>
          </motion.div>
        ) : (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className={styles.meditationHeader}>
              <Flower2 size={22} className={styles.meditationHeaderIcon} />
              <div>
                <div className={styles.meditationHeaderTitle}>Guided meditations</div>
                <div className={styles.meditationHeaderSub}>
                  Curated sessions to help you reset, focus, or calm down.
                </div>
              </div>
            </div>

            <div className={styles.meditationGrid} style={{ marginTop: "1.5rem" }}>
              {MEDITATIONS.map((m) => (
                <motion.button
                  key={m.id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={styles.meditationCard}
                  onClick={() => setActive(m)}
                  style={{ borderColor: m.color + "33" }}
                >
                  <div className={styles.meditationCardTop}>
                    <div className={styles.meditationCardDot} style={{ background: m.color }} />
                    <span className={styles.meditationDuration}>
                      <Clock size={11} /> {m.duration}
                    </span>
                  </div>
                  <div className={styles.meditationCardTitle}>{m.name}</div>
                  <div className={styles.meditationCardTeacher}>{m.teacher}</div>
                  <div className={styles.meditationCardDesc}>{m.description}</div>
                  <div className={styles.meditationPlay}>
                    <Play size={12} /> Play
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
