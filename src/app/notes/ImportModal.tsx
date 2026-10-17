"use client";

import { useToast } from "@/components/ToastProvider";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  FileType,
  FileCode,
  Globe,
  Loader2,
  ArrowRight,
  Check,
  Camera,
  Upload,
} from "lucide-react";
import {
  uploadNoteFile,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOC_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/notes/upload";
import styles from "./notes.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onImported: (rawBody: string, sourceType: string, aiResult?: any) => Promise<void>;
};

type SourceId = "paste" | "screenshot" | "pdf" | "markdown" | "docx" | "url";

const SOURCES: { id: SourceId; label: string; sub: string; Icon: any }[] = [
  { id: "paste", label: "Paste text", sub: "From clipboard or any text", Icon: FileText },
  { id: "screenshot", label: "Upload screenshot", sub: "PNG, JPG up to 10MB", Icon: Camera },
  { id: "pdf", label: "Upload PDF", sub: "PDF files up to 10MB", Icon: FileType },
  { id: "markdown", label: "Upload Markdown", sub: ".md files", Icon: FileCode },
  { id: "docx", label: "Upload DOCX", sub: "Word documents", Icon: FileText },
  { id: "url", label: "Paste URL", sub: "Web pages and articles", Icon: Globe },
];

function cleanError(raw: string | undefined | null): string {
  if (!raw) return "Something went wrong. Please try again.";

  const firstLine = raw.split("\n")[0].trim();
  if (firstLine.length > 200) return firstLine.slice(0, 197) + "...";

  if (
    firstLine.includes("TURBOPACK") ||
    firstLine.includes("is not a function") ||
    firstLine.match(/^\(0,/)
  ) {
    return "We couldn't process that file. Please try a different format or upload a screenshot.";
  }
  return firstLine;
}

export default function ImportModal({ isOpen, onClose, onImported }: Props) {
  const [source, setSource] = useState<SourceId>("paste");
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [rawText, setRawText] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [refineMode, setRefineMode] = useState<"refine" | "keep" | "both">("refine");
  const [freshness, setFreshness] = useState<"check" | "no">("no");
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setError(null);
    setUploadedUrl(null);
    setUploadedName(null);
  }, [source]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setRawText("");
      setUrlValue("");
      setSource("paste");
      setRefineMode("refine");
      setFreshness("no");
      setError(null);
      setProcessing(false);
      setUploading(false);
      setUploadedUrl(null);
      setUploadedName(null);
    }
  }, [isOpen]);

  const handleFileSelect = async (file: File) => {
    setError(null);
    const isImage = source === "screenshot";
    const allowed = isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_DOC_TYPES;

    if (!allowed.includes(file.type) && !(source === "markdown" && file.name.endsWith(".md"))) {
      setError(`File type not allowed. Accepted: ${allowed.join(", ")}`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum is 10MB.");
      return;
    }

    setUploading(true);
    try {
      const { signedUrl } = await uploadNoteFile(file);
      setUploadedUrl(signedUrl);
      setUploadedName(file.name);

      if (source === "markdown" && file.name.endsWith(".md")) {
        const text = await file.text();
        setRawText(text);
      }
    } catch (err: any) {
      setError(cleanError(err.message) || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleContinue = () => {
    setError(null);
    if (source === "paste" && !rawText.trim()) {
      setError("Paste some text to continue");
      return;
    }
    if (source === "url") {
      if (!urlValue.trim()) {
        setError("Paste a URL to continue");
        return;
      }
      try {
        new URL(urlValue);
      } catch {
        setError("That doesn't look like a valid URL");
        return;
      }
    }
    if (
      (source === "screenshot" || source === "pdf" || source === "docx" || source === "markdown") &&
      !uploadedUrl
    ) {
      setError("Upload a file to continue");
      return;
    }
    setStep(2);
  };

  const handleImport = async () => {
    setProcessing(true);
    setError(null);
    try {
      let body = "";
      let sourceType = source;
      let aiResult: any = null;

      if (source === "paste") {
        body = rawText.trim();
      } else if (source === "screenshot") {
        const visionRes = await fetch("/api/notes/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: uploadedUrl }),
        });
        const visionData = await visionRes.json();
        if (visionRes.ok) {
          aiResult = visionData;
          body = visionData.refined_body;
        } else {
          body = `<p>Screenshot uploaded</p><p><img src="${uploadedUrl}" alt="${uploadedName}" style="max-width:100%; border-radius:0.75rem;" /></p><p><em>AI analysis failed: ${visionData.error || "unknown"}</em></p>`;
        }
      } else {
        const parseRes = await fetch("/api/notes/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: source,
            url: urlValue || undefined,
            signedUrl: uploadedUrl || undefined,
            fileName: uploadedName || undefined,
          }),
        });
        const parseData = await parseRes.json();
        if (!parseRes.ok) throw new Error(parseData.error || "Failed to parse");

        if (parseData.refined) {
          aiResult = parseData.refined;
          body = parseData.refined.refined_body;
        } else {
          body = parseData.raw_text
            .split(/\n\n+/)
            .map((p: string) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
            .join("");
        }
      }

      if (!body.startsWith("<")) {
        body = body
          .split(/\n\n+/)
          .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
          .join("");
      }

      await onImported(body, sourceType, aiResult);
      onClose();
    } catch (err: any) {
      setError(cleanError(err.message));
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  const isFileSource =
    source === "screenshot" || source === "pdf" || source === "markdown" || source === "docx";
  const acceptAttr =
    source === "screenshot"
      ? "image/*"
      : source === "pdf"
        ? "application/pdf"
        : source === "markdown"
          ? ".md,.txt"
          : source === "docx"
            ? ".doc,.docx"
            : "";

  return (
    <AnimatePresence>
      <motion.div
        className={styles.captureBackdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.capturePanel}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "760px" }}
        >
          <div className={styles.captureHeader}>
            <div>
              <div className={styles.captureTitle}>
                {step === 1 ? "Import your content" : "How should I handle it?"}
              </div>
              <div className={styles.captureSub}>
                {step === 1
                  ? "Bring in your notes from anywhere."
                  : "Two quick questions before I process this."}
              </div>
            </div>
            <button className={styles.captureClose} onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className={styles.captureBody}>
            {step === 1 && (
              <>
                <div className={styles.importSourceGrid}>
                  {SOURCES.map((s) => (
                    <button
                      key={s.id}
                      className={`${styles.importSourceCard} ${source === s.id ? styles.importSourceCardActive : ""}`}
                      onClick={() => setSource(s.id)}
                    >
                      <div className={styles.importSourceIcon}>
                        <s.Icon size={18} />
                      </div>
                      <div className={styles.importSourceBody}>
                        <div className={styles.importSourceLabel}>{s.label}</div>
                        <div className={styles.importSourceSub}>{s.sub}</div>
                      </div>
                      {source === s.id && <Check size={14} className={styles.importSourceCheck} />}
                    </button>
                  ))}
                </div>

                {source === "paste" && (
                  <textarea
                    className={styles.importTextarea}
                    placeholder="Paste your content here..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    autoFocus
                  />
                )}

                {source === "url" && (
                  <input
                    type="url"
                    className={styles.importTextarea}
                    placeholder="https://example.com/article"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    autoFocus
                    style={{ minHeight: "auto", padding: "1rem 1.15rem" }}
                  />
                )}

                {isFileSource && (
                  <div className={styles.importUploadArea}>
                    {!uploadedUrl ? (
                      <label
                        htmlFor="import-file-input"
                        className={styles.importUploadZone}
                        style={{
                          pointerEvents: uploading ? "none" : "auto",
                          opacity: uploading ? 0.6 : 1,
                        }}
                      >
                        {uploading ? (
                          <Loader2
                            size={32}
                            className="animate-spin"
                            style={{ color: "#E8A0A8" }}
                          />
                        ) : (
                          <Upload size={32} style={{ color: "#E8A0A8" }} />
                        )}
                        <div className={styles.importUploadLabel}>
                          {uploading ? "Uploading..." : "Drop a file or click to choose"}
                        </div>
                        <div className={styles.importUploadSub}>
                          {source === "screenshot" ? "PNG, JPG, WebP up to 10MB" : "Up to 10MB"}
                        </div>
                        <input
                          id="import-file-input"
                          ref={fileInputRef}
                          type="file"
                          accept={acceptAttr}
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                          disabled={uploading}
                        />
                      </label>
                    ) : (
                      <div className={styles.importUploadedCard}>
                        {source === "screenshot" && (
                          <img
                            src={uploadedUrl}
                            alt="uploaded"
                            className={styles.importUploadedPreview}
                          />
                        )}
                        {source !== "screenshot" && (
                          <div className={styles.importUploadedIconWrap}>
                            <FileText size={28} />
                          </div>
                        )}
                        <div className={styles.importUploadedInfo}>
                          <div className={styles.importUploadedName}>{uploadedName}</div>
                          <div className={styles.importUploadedStatus}>
                            <Check size={12} /> Uploaded securely
                          </div>
                        </div>
                        <button
                          className={styles.importUploadedRemove}
                          onClick={() => {
                            setUploadedUrl(null);
                            setUploadedName(null);
                            setRawText("");
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div key={source} className={styles.captureError}>
                    {cleanError(error)}
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <div className={styles.importQuestions}>
                <div className={styles.importQuestionGroup}>
                  <div className={styles.importQ}>
                    Do you want to keep the original, or let AI restructure it?
                  </div>
                  <div className={styles.radioGroup}>
                    {[
                      { id: "keep", label: "Keep original only" },
                      { id: "refine", label: "Refine into a structured note" },
                      { id: "both", label: "Keep both" },
                    ].map((o) => (
                      <button
                        key={o.id}
                        className={`${styles.radioItem} ${refineMode === o.id ? styles.radioItemActive : ""}`}
                        onClick={() => setRefineMode(o.id as any)}
                      >
                        <span className={styles.radioCircle}>
                          <span className={styles.radioDot} />
                        </span>
                        <span className={styles.radioLabel}>{o.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.importQuestionGroup}>
                  <div className={styles.importQ}>
                    Should I look up current info and suggest updates?
                  </div>
                  <div className={styles.radioGroup}>
                    {[
                      { id: "check", label: "Yes, check for freshness" },
                      { id: "no", label: "No, just restructure" },
                    ].map((o) => (
                      <button
                        key={o.id}
                        className={`${styles.radioItem} ${freshness === o.id ? styles.radioItemActive : ""}`}
                        onClick={() => setFreshness(o.id as any)}
                      >
                        <span className={styles.radioCircle}>
                          <span className={styles.radioDot} />
                        </span>
                        <span className={styles.radioLabel}>{o.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {error && <div className={styles.captureError}>{cleanError(error)}</div>}
              </div>
            )}
          </div>

          <div className={styles.captureFooter}>
            {step === 2 ? (
              <>
                <button
                  className={styles.captureBtnSecondary}
                  onClick={() => setStep(1)}
                  disabled={processing}
                >
                  Back
                </button>
                <button
                  className={styles.captureBtnPrimary}
                  onClick={handleImport}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Importing...
                    </>
                  ) : (
                    <>
                      Import <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button className={styles.captureBtnSecondary} onClick={onClose}>
                  Cancel
                </button>
                <button
                  className={styles.captureBtnPrimary}
                  onClick={handleContinue}
                  disabled={uploading || (isFileSource && !uploadedUrl)}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
