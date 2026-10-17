"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Code2, Calendar, Lock, ArrowRight, Loader2 } from "lucide-react";
import { globalSearch, type SearchResult } from "@/lib/search/store";
import styles from "./GlobalSearch.module.css";

const ICONS = {
  note: FileText,
  project: Code2,
  task: Calendar,
  vault: Lock,
};

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await globalSearch(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.searchBox} onClick={() => setIsOpen(true)}>
        <Search size={18} className={styles.searchIcon} />
        <input
          ref={inputRef}
          className={styles.searchInput}
          placeholder="Search anything..."
          aria-label="Search anything"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {loading ? (
          <Loader2 size={16} className={styles.loader} />
        ) : (
          <span className={styles.searchHint}>⌘K</span>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.length > 0 && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {results.length === 0 && !loading ? (
              <div className={styles.empty}>No results found for &ldquo;{query}&rdquo;</div>
            ) : (
              results.map((r) => {
                const Icon = ICONS[r.type];
                return (
                  <button
                    key={r.type + r.id}
                    className={styles.resultItem}
                    onClick={() => handleSelect(r.href)}
                  >
                    <div className={styles.resultIcon}>
                      <Icon size={16} />
                    </div>
                    <div className={styles.resultInfo}>
                      <div className={styles.resultTitle}>{r.title}</div>
                      <div className={styles.resultSub}>{r.subtitle}</div>
                    </div>
                    <ArrowRight size={14} className={styles.resultArrow} />
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
