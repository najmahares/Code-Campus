"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Volume2,
  VolumeX,
  Music,
  ListMusic,
  Repeat,
  Repeat1,
} from "lucide-react";
import { TRACKS, type Track } from "@/lib/wellbeing/tracks";
import styles from "./wellbeing.module.css";

type Mood = "all" | "focus" | "calm" | "sleep";
type LoopMode = "off" | "all" | "one";

const MOODS: { id: Mood; label: string }[] = [
  { id: "all", label: "All" },
  { id: "focus", label: "Focus" },
  { id: "calm", label: "Calm" },
  { id: "sleep", label: "Sleep" },
];

function fmt(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ":" + String(sec).padStart(2, "0");
}

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mood, setMood] = useState<Mood>("all");
  const [queue, setQueue] = useState<Track[]>(TRACKS);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [loopMode, setLoopMode] = useState<LoopMode>("off");
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const track = queue[index];

  useEffect(() => {
    const filtered = mood === "all" ? TRACKS : TRACKS.filter((t) => t.mood === mood);
    setQueue(filtered);
    setIndex(0);
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
  }, [mood]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.src = track.src;
    audio.load();
    setError(null);
    if (playing) audio.play().catch(() => setPlaying(false));
  }, [track?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.play().catch(() => {
        setError("Tap play again to start audio");
        setPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [playing]);

  const next = () => {
    if (queue.length === 0) return;
    if (shuffle) {
      let n = index;
      while (n === index && queue.length > 1) n = Math.floor(Math.random() * queue.length);
      setIndex(n);
    } else {
      setIndex((i) => (i + 1) % queue.length);
    }
    setPlaying(true);
  };

  const prev = () => {
    if (queue.length === 0) return;
    setIndex((i) => (i - 1 + queue.length) % queue.length);
    setPlaying(true);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const v = Number(e.target.value);
    audio.currentTime = v;
    setCurrent(v);
  };

  const handleEnded = () => {
    if (loopMode === "one") {
      const a = audioRef.current;
      if (a) {
        a.currentTime = 0;
        a.play();
      }
    } else if (loopMode === "all") {
      next();
    } else {
      if (index < queue.length - 1) {
        next();
      } else {
        setPlaying(false);
      }
    }
  };

  const cycleLoop = () => {
    setLoopMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  };

  const counts = useMemo(
    () =>
      ({
        all: TRACKS.length,
        focus: TRACKS.filter((t) => t.mood === "focus").length,
        calm: TRACKS.filter((t) => t.mood === "calm").length,
        sleep: TRACKS.filter((t) => t.mood === "sleep").length,
      }) as Record<Mood, number>,
    []
  );

  if (!track) return <div className={styles.audioEmpty}>No tracks in this category.</div>;

  return (
    <div className={styles.audioWrap}>
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrent((e.target as HTMLAudioElement).currentTime)}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
        onEnded={handleEnded}
        onError={() => setError("Could not load " + track.src)}
        preload="metadata"
      />

      <div className={styles.audioMoodTabs}>
        {MOODS.map((m) => (
          <button
            key={m.id}
            className={`${styles.categoryBtn} ${mood === m.id ? styles.categoryBtnActive : ""}`}
            onClick={() => setMood(m.id)}
          >
            {m.label}
            <span className={styles.audioMoodCount}>{counts[m.id]}</span>
          </button>
        ))}
      </div>

      <div className={styles.audioPlayer}>
        <div className={styles.audioArtWrap}>
          <motion.div
            className={styles.audioArt}
            animate={{ rotate: playing ? 360 : 0 }}
            transition={{ duration: 20, repeat: playing ? Infinity : 0, ease: "linear" }}
          >
            <Music size={42} />
          </motion.div>
        </div>

        <div className={styles.audioInfo}>
          <div className={styles.audioTitle}>{track.title}</div>
          <div className={styles.audioArtist}>{track.artist}</div>
        </div>

        <div className={styles.audioSeekRow}>
          <span className={styles.audioTime}>{fmt(current)}</span>
          <input
            type="range"
            className={styles.audioSeek}
            min={0}
            max={duration || 0}
            value={current}
            onChange={seek}
            step={0.1}
          />
          <span className={styles.audioTime}>{fmt(duration)}</span>
        </div>

        <div className={styles.audioControls}>
          <button
            className={`${styles.audioIconBtn} ${shuffle ? styles.audioIconBtnActive : ""}`}
            onClick={() => setShuffle((s) => !s)}
            title="Shuffle"
          >
            <Shuffle size={16} />
          </button>
          <button className={styles.audioIconBtn} onClick={prev} title="Previous">
            <SkipBack size={18} />
          </button>
          <button className={styles.audioMainBtn} onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button className={styles.audioIconBtn} onClick={next} title="Next">
            <SkipForward size={18} />
          </button>
          <button
            className={`${styles.audioIconBtn} ${loopMode !== "off" ? styles.audioIconBtnActive : ""}`}
            onClick={cycleLoop}
            title={loopMode === "off" ? "Loop off" : loopMode === "all" ? "Loop all" : "Loop one"}
          >
            {loopMode === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
          <button
            className={`${styles.audioIconBtn} ${muted ? styles.audioIconBtnActive : ""}`}
            onClick={() => setMuted((m) => !m)}
            title="Mute"
          >
            {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        <div className={styles.audioVolumeRow}>
          <Volume2 size={13} className={styles.audioVolumeIcon} />
          <input
            type="range"
            className={styles.audioVolume}
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              setMuted(false);
            }}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              className={styles.audioError}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.audioQueue}>
        <div className={styles.audioQueueHeader}>
          <ListMusic size={14} />
          <span>Up next</span>
        </div>
        {queue.map((t, i) => (
          <button
            key={t.id}
            className={`${styles.audioQueueItem} ${i === index ? styles.audioQueueItemActive : ""}`}
            onClick={() => {
              setIndex(i);
              setPlaying(true);
            }}
          >
            <div className={styles.audioQueueNum}>{String(i + 1).padStart(2, "0")}</div>
            <div className={styles.audioQueueBody}>
              <div className={styles.audioQueueTitle}>{t.title}</div>
              <div className={styles.audioQueueArtist}>{t.artist}</div>
            </div>
            <div className={styles.audioQueueMood}>{t.mood}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
