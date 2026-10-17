"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle, Loader2, ArrowRight, Check, X, RotateCcw, Trophy,
  History, ChevronRight, Lightbulb, ArrowLeft,
} from "lucide-react";
import { saveQuizAttempt, listQuizAttempts, type QuizAttempt } from "@/lib/notes/store";
import styles from "./notes.module.css";

type Question = {
  id: string;
  type: "multiple_choice" | "true_false" | "short_answer";
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  memory_tip: string;
};

type Props = {
  noteBody: string;
  noteId: string;
};

type Stage = "setup" | "generating" | "taking" | "results" | "history" | "viewing_attempt";

export default function QuizTab({ noteBody, noteId }: Props) {
  const [stage, setStage] = useState<Stage>("setup");
  const [length, setLength] = useState(5);
  const [type, setType] = useState<"mixed" | "multiple_choice" | "true_false" | "short_answer">("mixed");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [viewingAttempt, setViewingAttempt] = useState<QuizAttempt | null>(null);
  const hasBody = noteBody && noteBody.replace(/<[^>]*>/g, "").trim().length > 10;

  useEffect(() => {
    loadHistory();
  }, [noteId]);

  const loadHistory = async () => {
    try {
      const data = await listQuizAttempts(noteId);
      setHistory(data);
    } catch {}
  };

  const generate = async (overrideDifficulty?: "easy" | "medium" | "hard") => {
    setStage("generating");
    setError(null);
    const useDifficulty = overrideDifficulty || difficulty;
    if (overrideDifficulty) setDifficulty(overrideDifficulty);
    try {
      const res = await fetch("/api/notes/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteBody, noteId, length, type, difficulty: useDifficulty, topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz");
      setQuestions(data.questions);
      setUserAnswers(new Array(data.questions.length).fill(""));
      setCurrentIndex(0);
      setCurrentInput("");
      setStage("taking");
    } catch (err: any) {
      setError(err.message);
      setStage("setup");
    }
  };

  const submitAnswer = () => {
    if (!currentInput.trim()) return;
    const next = [...userAnswers];
    next[currentIndex] = currentInput.trim();
    setUserAnswers(next);
    setCurrentInput("");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz(next);
    }
  };

  const skipQuestion = () => {
    const next = [...userAnswers];
    next[currentIndex] = "";
    setUserAnswers(next);
    setCurrentInput("");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz(next);
    }
  };

  const finishQuiz = async (answers: string[]) => {
    const score = questions.reduce((acc, q, i) => {
      const ua = (answers[i] || "").trim().toLowerCase();
      const ca = q.correct_answer.trim().toLowerCase();
      return acc + (ua === ca ? 1 : 0);
    }, 0);
    try {
      await saveQuizAttempt({
        noteId,
        topic,
        difficulty,
        settings: { length, type },
        questions,
        answers,
        score,
        total: questions.length,
      });
      await loadHistory();
    } catch (err) {
      console.error("Failed to save attempt:", err);
    }
    setStage("results");
  };

  const retakeSameQuiz = () => {
    setUserAnswers(new Array(questions.length).fill(""));
    setCurrentIndex(0);
    setCurrentInput("");
    setStage("taking");
  };

  const reset = () => {
    setStage("setup");
    setQuestions([]);
    setUserAnswers([]);
    setCurrentIndex(0);
    setCurrentInput("");
    setError(null);
    setViewingAttempt(null);
  };

  const openAttempt = (attempt: QuizAttempt) => {
    setViewingAttempt(attempt);
    setStage("viewing_attempt");
  };

  // --- SETUP ---
  if (!hasBody) {
    return (
      <div className={styles.tabEmptyState}>
        <p className={styles.tabEmptyText}>This note is empty. Add some content before generating a quiz.</p>
      </div>
    );
  }

  if (stage === "setup") {
    return (
      <div className={styles.quizSetup}>
        {error && <div className={styles.tabErrorText}>{error}</div>}

        <div className={styles.quizSetupGroup}>
          <label className={styles.quizLabel}>How many questions?</label>
          <div className={styles.quizPills}>
            {[3, 5, 10, 15, 20].map((n) => (
              <button
                key={n}
                className={`${styles.quizPill} ${length === n ? styles.quizPillActive : ""}`}
                onClick={() => setLength(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.quizSetupGroup}>
          <label className={styles.quizLabel}>Question type</label>
          <div className={styles.quizPills}>
            {[
              { id: "mixed", label: "Mixed" },
              { id: "multiple_choice", label: "Multiple choice" },
              { id: "true_false", label: "True / False" },
              { id: "short_answer", label: "Typed answer" },
            ].map((t) => (
              <button
                key={t.id}
                className={`${styles.quizPill} ${type === t.id ? styles.quizPillActive : ""}`}
                onClick={() => setType(t.id as any)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.quizSetupGroup}>
          <label className={styles.quizLabel}>Difficulty</label>
          <div className={styles.quizPills}>
            {[
              { id: "easy", label: "Easy" },
              { id: "medium", label: "Medium" },
              { id: "hard", label: "Hard" },
            ].map((d) => (
              <button
                key={d.id}
                className={`${styles.quizPill} ${difficulty === d.id ? styles.quizPillActive : ""}`}
                onClick={() => setDifficulty(d.id as any)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.quizSetupGroup}>
          <label className={styles.quizLabel}>Focus topic (optional)</label>
          <input
            className={styles.quizInput}
            placeholder="e.g. functions, error handling, decorators"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className={styles.quizSetupActions}>
          <button className={styles.tabPrimaryBtn} onClick={() => generate()}>
            <HelpCircle size={16} /> Generate Quiz
          </button>
          {history.length > 0 && (
            <button className={styles.tabSecondaryBtn} onClick={() => setStage("history")}>
              <History size={14} /> Past attempts ({history.length})
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- GENERATING ---
  if (stage === "generating") {
    return (
      <div className={styles.tabLoadingState}>
        <Loader2 size={32} className="animate-spin" />
        <p>Building your quiz...</p>
      </div>
    );
  }

  // --- TAKING ---
  if (stage === "taking" && questions[currentIndex]) {
    const q = questions[currentIndex];
    const progress = (currentIndex / questions.length) * 100;
    return (
      <div className={styles.quizTake}>
        <div className={styles.quizProgressBar}>
          <div className={styles.quizProgressFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.quizTakeHeader}>
          <span className={styles.quizTakeCounter}>Question {currentIndex + 1} of {questions.length}</span>
          <span className={styles.quizTakeTag}>{q.type.replace("_", " ")}</span>
        </div>

        <h3 className={styles.quizTakeQuestion}>{q.question}</h3>

        {q.type === "short_answer" ? (
          <input
            className={styles.quizInput}
            placeholder="Type your answer..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
            autoFocus
          />
        ) : (
          <div className={styles.quizOptions}>
            {(q.options || []).map((opt, i) => (
              <button
                key={i}
                className={`${styles.quizOption} ${currentInput === opt ? styles.quizOptionSelected : ""}`}
                onClick={() => setCurrentInput(opt)}
              >
                <span className={styles.quizOptionLetter}>{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
        )}

        <div className={styles.quizTakeFooter}>
          <button className={styles.tabSecondaryBtn} onClick={skipQuestion}>Skip</button>
          <button className={styles.tabPrimaryBtn} onClick={submitAnswer} disabled={!currentInput.trim()}>
            {currentIndex === questions.length - 1 ? "Finish" : "Next"} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // --- RESULTS ---
  if (stage === "results") {
    const score = questions.reduce((acc, q, i) => {
      const ua = (userAnswers[i] || "").trim().toLowerCase();
      const ca = q.correct_answer.trim().toLowerCase();
      return acc + (ua === ca ? 1 : 0);
    }, 0);
    const pct = Math.round((score / questions.length) * 100);
    const wrong = questions.filter((q, i) => (userAnswers[i] || "").trim().toLowerCase() !== q.correct_answer.trim().toLowerCase());

    return (
      <div className={styles.quizResults}>
        <div className={styles.quizScoreCard}>
          <div className={styles.quizScoreCircle}>
            <span className={styles.quizScoreValue}>{pct}%</span>
            <span className={styles.quizScoreLabel}>{score} / {questions.length}</span>
          </div>
          <div className={styles.quizScoreText}>
            <h3>{pct >= 80 ? "Great work." : pct >= 50 ? "Solid effort." : "Keep going."}</h3>
            <p>
              {wrong.length === 0
                ? "You got everything right. Try a harder quiz to keep growing."
                : `You missed ${wrong.length} question${wrong.length > 1 ? "s" : ""}. Review the explanations and memory tricks below.`}
            </p>
          </div>
        </div>

        {wrong.length > 0 && (
          <div className={styles.quizReviewSection}>
            <h4 className={styles.quizReviewTitle}>Review what you missed</h4>
            {wrong.map((q, idx) => {
              const originalIndex = questions.indexOf(q);
              return (
                <div key={idx} className={styles.quizReviewCard}>
                  <div className={styles.quizReviewQ}>{q.question}</div>
                  <div className={styles.quizReviewRow}>
                    <span className={styles.quizReviewLabelWrong}>Your answer</span>
                    <span className={styles.quizReviewWrong}>{userAnswers[originalIndex] || "— skipped —"}</span>
                  </div>
                  <div className={styles.quizReviewRow}>
                    <span className={styles.quizReviewLabelRight}>Correct answer</span>
                    <span className={styles.quizReviewRight}>{q.correct_answer}</span>
                  </div>
                  <div className={styles.quizReviewExplanation}>
                    <strong>Why:</strong> {q.explanation}
                  </div>
                  <div className={styles.quizReviewMemory}>
                    <Lightbulb size={14} />
                    <span><strong>Remember it:</strong> {q.memory_tip}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.quizResultActions}>
          <button className={styles.tabSecondaryBtn} onClick={retakeSameQuiz}>
            <RotateCcw size={14} /> Retake same quiz
          </button>
          <button className={styles.tabPrimaryBtn} onClick={() => generate(difficulty === "hard" ? "medium" : "hard")}>
            {difficulty === "hard" ? "Try medium instead" : "Try harder questions"} <ArrowRight size={16} />
          </button>
          <button className={styles.tabSecondaryBtn} onClick={reset}>
            New quiz
          </button>
        </div>
      </div>
    );
  }

  // --- HISTORY (list of attempts) ---
  if (stage === "history") {
    return (
      <div className={styles.quizHistory}>
        <div className={styles.quizHistoryHeader}>
          <h3 className={styles.quizHistoryTitle}>Your quiz attempts</h3>
          <button className={styles.tabSecondaryBtn} onClick={() => setStage("setup")}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
        {history.length === 0 ? (
          <div className={styles.tabEmptyState}>
            <p className={styles.tabEmptyText}>No attempts yet. Take a quiz to get started.</p>
          </div>
        ) : (
          <div className={styles.quizHistoryList}>
            {history.map((a) => (
              <button
                key={a.id}
                className={styles.quizHistoryItem}
                onClick={() => openAttempt(a)}
              >
                <div className={styles.quizHistoryLeft}>
                  <Trophy size={18} className={styles.quizHistoryIcon} />
                  <div>
                    <div className={styles.quizHistoryScore}>
                      {a.score} / {a.total} ({Math.round((a.score / a.total) * 100)}%)
                    </div>
                    <div className={styles.quizHistoryMeta}>
                      {a.difficulty} · {a.topic || "General"} · {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className={styles.quizHistoryArrow} />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- VIEWING A HISTORIC ATTEMPT ---
  if (stage === "viewing_attempt" && viewingAttempt) {
    const attempt = viewingAttempt;
    const pct = Math.round((attempt.score / attempt.total) * 100);
    const questions = attempt.questions as Question[];
    const answers = attempt.answers as string[];

    return (
      <div className={styles.quizResults}>
        <div className={styles.quizHistoryHeader}>
          <h3 className={styles.quizHistoryTitle}>Attempt review</h3>
          <button className={styles.tabSecondaryBtn} onClick={() => { setViewingAttempt(null); setStage("history"); }}>
            <ArrowLeft size={14} /> Back to history
          </button>
        </div>

        <div className={styles.quizScoreCard}>
          <div className={styles.quizScoreCircle}>
            <span className={styles.quizScoreValue}>{pct}%</span>
            <span className={styles.quizScoreLabel}>{attempt.score} / {attempt.total}</span>
          </div>
          <div className={styles.quizScoreText}>
            <h3>{new Date(attempt.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</h3>
            <p>
              {attempt.difficulty} difficulty · {attempt.topic || "General"} ·{" "}
              {questions.length} question{questions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className={styles.quizReviewSection}>
          <h4 className={styles.quizReviewTitle}>All questions</h4>
          {questions.map((q, i) => {
            const userAnswer = answers[i] || "";
            const isCorrect = userAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
            return (
              <div key={i} className={styles.quizReviewCard}>
                <div className={styles.quizReviewHeaderRow}>
                  <span className={styles.quizReviewQNumber}>Q{i + 1}</span>
                  <span className={isCorrect ? styles.quizReviewBadgeRight : styles.quizReviewBadgeWrong}>
                    {isCorrect ? "Correct" : "Wrong"}
                  </span>
                </div>
                <div className={styles.quizReviewQ}>{q.question}</div>
                <div className={styles.quizReviewRow}>
                  <span className={styles.quizReviewLabelWrong}>Your answer</span>
                  <span className={isCorrect ? styles.quizReviewRight : styles.quizReviewWrong}>
                    {userAnswer || "— skipped —"}
                  </span>
                </div>
                {!isCorrect && (
                  <div className={styles.quizReviewRow}>
                    <span className={styles.quizReviewLabelRight}>Correct answer</span>
                    <span className={styles.quizReviewRight}>{q.correct_answer}</span>
                  </div>
                )}
                <div className={styles.quizReviewExplanation}>
                  <strong>Why:</strong> {q.explanation}
                </div>
                <div className={styles.quizReviewMemory}>
                  <Lightbulb size={14} />
                  <span><strong>Remember it:</strong> {q.memory_tip}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.quizResultActions}>
          <button className={styles.tabSecondaryBtn} onClick={() => { setViewingAttempt(null); setStage("history"); }}>
            <ArrowLeft size={14} /> Back to history
          </button>
          <button className={styles.tabPrimaryBtn} onClick={() => { setViewingAttempt(null); reset(); }}>
            New quiz
          </button>
        </div>
      </div>
    );
  }

  return null;
}
