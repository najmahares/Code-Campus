"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, AlertCircle } from "lucide-react";
import styles from "./notes.module.css";

type Props = {
  onTranscript: (text: string) => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionConstructor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export default function VoiceRecorder({ onTranscript }: Props) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const SR =
      (window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor })
        .SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: SpeechRecognitionConstructor })
        .webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const start = () => {
    setError(null);
    const SR =
      (window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor })
        .SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: SpeechRecognitionConstructor })
        .webkitSpeechRecognition;
    if (!SR) {
      setError("Voice recognition isn't supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalText = "";

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalText += transcript + " ";
        } else {
          interimText += transcript;
        }
      }
      setInterim(finalText + interimText);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEventLike) => {
      if (e.error === "no-speech") return;
      if (e.error === "not-allowed") {
        setError("Microphone access denied. Please allow it in your browser settings.");
      } else {
        setError(`Voice error: ${e.error}`);
      }
      stop();
    };

    recognition.onend = () => {
      if (finalText.trim()) {
        onTranscript(finalText.trim());
      }
      setRecording(false);
      setInterim("");
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const stop = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
  };

  if (!supported) {
    return (
      <div className={styles.voicePlaceholder}>
        <AlertCircle size={32} />
        <p>Voice capture isn't supported in this browser.</p>
        <p className={styles.voicePlaceholderSub}>
          Try Chrome, Edge, or Safari for voice transcription.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.voiceRecorder}>
      <button
        className={`${styles.voiceButton} ${recording ? styles.voiceButtonRecording : ""}`}
        onClick={recording ? stop : start}
      >
        {recording ? <Square size={28} fill="currentColor" /> : <Mic size={32} />}
      </button>

      <div className={styles.voiceStatus}>
        {recording ? (
          <>
            <span className={styles.voiceRecording}>
              <span className={styles.voiceDot} /> Recording
            </span>
            <span className={styles.voiceTimer}>
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </span>
          </>
        ) : (
          <span className={styles.voiceIdle}>Tap to start recording</span>
        )}
      </div>

      {interim && (
        <div className={styles.voiceTranscript}>
          {interim}
          <span className={styles.voiceCursor}>|</span>
        </div>
      )}

      {error && <div className={styles.captureError}>{error}</div>}
    </div>
  );
}
