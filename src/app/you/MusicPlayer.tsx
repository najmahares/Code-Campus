"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Play, X } from "lucide-react";
import styles from "./wellbeing.module.css";

type Playlist = {
  id: string;
  name: string;
  description: string;
  youtubeId: string;
  color: string;
  vibe: "focus" | "calm" | "sleep";
};

const PLAYLISTS: Playlist[] = [
  {
    id: "lofi-girl",
    name: "Lofi Girl Radio",
    description: "The classic. Endless lo-fi beats for deep focus.",
    youtubeId: "jfKfPfyJRdk",
    color: "#E8A0A8",
    vibe: "focus",
  },
  {
    id: "chillhop",
    name: "Chillhop Essentials",
    description: "Jazzy, warm, and easy on the ears.",
    youtubeId: "5yx6BWlEVcY",
    color: "#D4AF37",
    vibe: "focus",
  },
  {
    id: "coffee-shop",
    name: "Coffee Shop Ambience",
    description: "Warm cafe chatter and soft jazz for studying.",
    youtubeId: "CqE0L1sy0dY",
    color: "#A88CE8",
    vibe: "focus",
  },
  {
    id: "deep-focus",
    name: "Deep Focus Frequencies",
    description: "Ambient drone for intense problem solving.",
    youtubeId: "hHW1oY26kxQ",
    color: "#E86464",
    vibe: "focus",
  },
  {
    id: "rain-piano",
    name: "Rain & Piano",
    description: "Soft rain with gentle piano. For winding down.",
    youtubeId: "mPZkdNFkNps",
    color: "#7BC89A",
    vibe: "calm",
  },
  {
    id: "forest",
    name: "Forest Sounds",
    description: "Birdsong and wind. Nature in your headphones.",
    youtubeId: "xNN7iTA57jM",
    color: "#A8D4B0",
    vibe: "calm",
  },
];

const VIBES = [
  { id: "all", label: "All" },
  { id: "focus", label: "Focus" },
  { id: "calm", label: "Calm" },
] as const;

export default function MusicPlayer() {
  const [active, setActive] = useState<Playlist | null>(null);
  const [vibe, setVibe] = useState<(typeof VIBES)[number]["id"]>("all");

  const filtered = vibe === "all" ? PLAYLISTS : PLAYLISTS.filter((p) => p.vibe === vibe);

  return (
    <div className={styles.musicWrap}>
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className={styles.nowPlaying}>
              <div className={styles.nowPlayingDot} style={{ background: active.color }} />
              <div className={styles.nowPlayingInfo}>
                <div className={styles.nowPlayingName}>{active.name}</div>
                <div className={styles.nowPlayingSub}>{active.description}</div>
              </div>
              <button className={styles.nowPlayingStop} onClick={() => setActive(null)}>
                <X size={14} /> Close
              </button>
            </div>
            <div className={styles.videoWrap}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${active.youtubeId}?rel=0&modestbranding=1&playsinline=1&mute=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
                title={active.name}
                frameBorder="0"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className={styles.videoHint}>
              Tip: YouTube mutes autoplay by default. Turn the volume up in the player to hear it.
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className={styles.musicHeader}>
              <Music size={20} className={styles.musicIcon} />
              <div>
                <div className={styles.musicTitle}>Choose your sound</div>
                <div className={styles.musicSub}>Curated YouTube streams for focus and rest.</div>
              </div>
            </div>

            <div className={styles.categoryRow}>
              {VIBES.map((v) => (
                <button
                  key={v.id}
                  className={`${styles.categoryBtn} ${vibe === v.id ? styles.categoryBtnActive : ""}`}
                  onClick={() => setVibe(v.id)}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className={styles.playlistGrid}>
              {filtered.map((p) => (
                <motion.button
                  key={p.id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={styles.playlistCard}
                  onClick={() => setActive(p)}
                  style={{ borderColor: `${p.color}33` }}
                >
                  <div className={styles.playlistDot} style={{ background: p.color }} />
                  <div className={styles.playlistName}>{p.name}</div>
                  <div className={styles.playlistDesc}>{p.description}</div>
                  <div className={styles.playlistPlay}>
                    <Play size={14} /> Play
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
