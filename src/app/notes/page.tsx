"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home as HomeIcon,
  FileText,
  Calendar,
  Code2,
  Lock,
  Heart,
  Search,
  Plus,
  FileDown,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  MoreVertical,
  Loader2,
  X,
  ArrowRight,
  Trash2,
  Camera,
  ImageIcon,
  Star,
  History,
  Pin,
  Archive,
  Check,
  Pencil,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoLockup } from "@/components/Logo";
import RichTextEditor from "@/components/RichTextEditor";
import ImportModal from "./ImportModal";
import VoiceRecorder from "./VoiceRecorder";
import ConfirmModal from "@/components/ConfirmModal";
import EmptyState from "@/components/EmptyState";
import AddToTodayButton from "@/components/AddToTodayButton";
import VersionHistory from "./VersionHistory";
import SummaryTab from "./SummaryTab";
import QuizTab from "./QuizTab";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  createNote,
  updateNote,
  deleteNote,
  refineNote,
  generateTitle,
  togglePin,
  softDeleteNote,
  restoreNote,
  bulkArchive,
  saveVersion,
  type Note,
} from "@/lib/notes/store";
import styles from "./notes.module.css";

const navItems = [
  { id: "home", label: "Home", href: "/home", Icon: HomeIcon },
  { id: "today", label: "Today", href: "/today", Icon: Calendar },
  { id: "notes", label: "Notes", href: "/notes", Icon: FileText },
  { id: "projects", label: "Projects", href: "/projects", Icon: Code2 },
  { id: "wellbeing", label: "Wellbeing", href: "/you", Icon: Heart },
  { id: "vault", label: "Vault", href: "/vault", Icon: Lock },
];

const SOURCE_GROUPS: Record<string, string[]> = {
  "My Notes": ["typed"],
  Pasted: ["paste"],
  Screenshots: ["screenshot", "image"],
  Links: ["url"],
  Docs: ["pdf", "docx", "markdown"],
};

const NOTES_PER_PAGE = 12;

export default function NotesPage() {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [counts, setCounts] = useState({ active: 0, archived: 0, total: 0 });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"raw" | "refined" | "summary" | "quiz">("raw");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCapture, setShowCapture] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [captureMode, setCaptureMode] = useState<"type" | "voice" | "screenshot">("type");
  const [captureText, setCaptureText] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingBody, setEditingBody] = useState(false);
  const [bodyDraft, setBodyDraft] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showVersions, setShowVersions] = useState(false);
  const [undoItem, setUndoItem] = useState<{ id: string; title: string } | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    destructive: boolean;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    destructive: false,
    onConfirm: () => {},
  });

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const debouncedSearch = useDebounce(searchInput, 250);

  const activeNote = activeNoteId ? (notes.find((n) => n.id === activeNoteId) ?? null) : null;

  const loadNotes = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error: err } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("pinned", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false });
      if (err) throw err;
      const all = (data || []) as Note[];
      const archivedCount = all.filter((n) => n.archived).length;
      setNotes(all);
      setCounts({
        active: all.length - archivedCount,
        archived: archivedCount,
        total: all.length,
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setLoading(true);
      await loadNotes();
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (activeNoteId && !notes.find((n) => n.id === activeNoteId)) {
      setActiveNoteId(null);
    }
  }, [notes, activeNoteId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, sourceFilter, debouncedSearch, showArchived]);

  const askConfirm = (opts: Omit<typeof confirmState, "isOpen">) =>
    setConfirmState({ ...opts, isOpen: true });

  const clearSelection = () => setSelectedIds([]);
  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSave = async (shouldRefine = false) => {
    if (!captureText.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const plain = captureText
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const note = await createNote({
        raw_body: captureText,
        title: generateTitle(captureText),
        source_type:
          captureMode === "screenshot" ? "screenshot" : captureMode === "voice" ? "typed" : "typed",
      });
      if (shouldRefine) {
        setRefining(true);
        try {
          const result = await refineNote(captureText, note.title);
          await updateNote(note.id, {
            title: result.title,
            refined_body: result.refined_body,
            tags: result.tags,
          });
        } catch (e: any) {
          console.error("Refine failed:", e);
        } finally {
          setRefining(false);
        }
      }
      await loadNotes();
      setShowCapture(false);
      setCaptureText("");
      setScreenshotPreview(null);
      setActiveNoteId(note.id);
      setActiveTab(shouldRefine ? "refined" : "raw");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRefine = async () => {
    if (!activeNote) return;
    setRefining(true);
    setError(null);
    try {
      if (activeNote.refined_body)
        await saveVersion(activeNote.id, activeNote.refined_body, "pre-refine");
      const result = await refineNote(activeNote.raw_body, activeNote.title);
      await saveVersion(activeNote.id, result.refined_body, "refined");
      await updateNote(activeNote.id, {
        title: result.title,
        refined_body: result.refined_body,
        tags: result.tags,
      });
      await loadNotes();
      setActiveTab("refined");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRefining(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!activeNote || !titleDraft.trim()) {
      setEditingTitle(false);
      return;
    }
    try {
      await updateNote(activeNote.id, { title: titleDraft });
      await loadNotes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEditingTitle(false);
    }
  };

  const startEditingBody = () => {
    if (!activeNote) return;
    setBodyDraft(
      activeTab === "refined" && activeNote.refined_body
        ? activeNote.refined_body
        : activeNote.raw_body
    );
    setEditingBody(true);
  };

  const saveBody = async () => {
    if (!activeNote) return;
    try {
      const oldBody = activeTab === "refined" ? activeNote.refined_body : activeNote.raw_body;
      if (oldBody) await saveVersion(activeNote.id, oldBody, `pre-edit-${activeTab}`);
      if (activeTab === "refined") await updateNote(activeNote.id, { refined_body: bodyDraft });
      else await updateNote(activeNote.id, { raw_body: bodyDraft });
      await loadNotes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEditingBody(false);
    }
  };

  const addTag = async () => {
    if (!activeNote || !newTag.trim()) return;
    const cleaned = newTag.trim().replace(/^#/, "");
    if (activeNote.tags.includes(cleaned)) {
      setNewTag("");
      return;
    }
    try {
      await updateNote(activeNote.id, { tags: [...activeNote.tags, cleaned] });
      await loadNotes();
      setNewTag("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const removeTag = async (tag: string) => {
    if (!activeNote) return;
    try {
      await updateNote(activeNote.id, { tags: activeNote.tags.filter((t) => t !== tag) });
      await loadNotes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleArchiveToggle = async (id: string, archived: boolean) => {
    await bulkArchive([id], archived);
    setActiveNoteId(null);
    await loadNotes();
  };

  const handleSoftDelete = (id: string, title: string) => {
    askConfirm({
      title: "Delete this note?",
      message: `"${title}" will be moved to trash. You can undo for a few seconds.`,
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: async () => {
        await softDeleteNote(id);
        setActiveNoteId(null);
        await loadNotes();
        setUndoItem({ id, title });
        setTimeout(() => setUndoItem(null), 6000);
      },
    });
  };

  const handleUndoDelete = async () => {
    if (!undoItem) return;
    await restoreNote(undoItem.id);
    setUndoItem(null);
    await loadNotes();
  };

  const handleBulkDelete = () => {
    const count = selectedIds.length;
    askConfirm({
      title: `Delete ${count} note${count > 1 ? "s" : ""}?`,
      message: `${count} note${count > 1 ? "s" : ""} will be moved to trash. You can undo for a few seconds.`,
      confirmLabel: "Delete all",
      destructive: true,
      onConfirm: async () => {
        for (const id of selectedIds) await softDeleteNote(id);
        setSelectedIds([]);
        await loadNotes();
        setUndoItem({ id: selectedIds[0], title: `${count} notes` });
        setTimeout(() => setUndoItem(null), 6000);
      },
    });
  };

  const handleBulkArchive = async (archived: boolean) => {
    await bulkArchive(selectedIds, archived);
    setSelectedIds([]);
    await loadNotes();
  };

  const handlePin = async (id: string, pinned: boolean) => {
    await togglePin(id, !pinned);
    await loadNotes();
  };

  const handleRestoreVersion = async (body: string) => {
    if (!activeNote) return;
    const currentBody = activeTab === "refined" ? activeNote.refined_body : activeNote.raw_body;
    if (currentBody) await saveVersion(activeNote.id, currentBody, "pre-restore");
    if (activeTab === "refined") await updateNote(activeNote.id, { refined_body: body });
    else await updateNote(activeNote.id, { raw_body: body });
    await loadNotes();
  };

  const handleImported = async (body: string, sourceType: string, aiResult?: any) => {
    try {
      const note = await createNote({
        raw_body: body,
        title: aiResult?.title || generateTitle(body),
        source_type: sourceType,
      });
      if (aiResult?.tags || aiResult?.refined_body) {
        await updateNote(note.id, {
          tags: aiResult.tags || [],
          refined_body: aiResult.refined_body || null,
          title: aiResult.title || note.title,
        });
      }
      await loadNotes();
      setActiveNoteId(note.id);
      setActiveTab(aiResult?.refined_body ? "refined" : "raw");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum is 10MB.");
      return;
    }
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in");
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
      const path = `${user.id}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("note-attachments")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage
        .from("note-attachments")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (!signed?.signedUrl) throw new Error("Failed to sign URL");
      setScreenshotPreview(signed.signedUrl);
      setCaptureText(
        `<p><img src="${signed.signedUrl}" alt="${safeName}" style="max-width:100%; border-radius:0.75rem; margin:1rem 0;" /></p>`
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className={styles.loading}>Loading notes...</div>;

  const tagFilters = Array.from(new Set(notes.flatMap((n) => n.tags))).sort();

  const filteredNotes = notes.filter((n) => {
    if (showArchived) {
      if (!n.archived) return false;
    } else if (sourceFilter !== "All") {
      const allowed = SOURCE_GROUPS[sourceFilter] || [];
      if (!allowed.includes(n.source_type)) return false;
    }
    if (activeFilter !== "All" && !n.tags.includes(activeFilter)) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.raw_body.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / NOTES_PER_PAGE));
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * NOTES_PER_PAGE,
    currentPage * NOTES_PER_PAGE
  );

  const Sidebar = () => (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <LogoLockup size={40} />
      </div>
      <nav className={styles.sidebarNav}>
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ""}`}
          >
            <item.Icon size={20} strokeWidth={2} aria-hidden="true" />
            <span>{item.label}</span>
            {(item as any).badge && <span className={styles.navBadge}>{(item as any).badge}</span>}
          </Link>
        ))}
      </nav>
      <div className={styles.sidebarDecor}>
        <div className={styles.decorQuote}>
          <span className={styles.decorQuoteLine}>Small steps</span>
          <span className={`${styles.decorQuoteLine} ${styles.decorQuoteWhite}`}>build</span>
          <span className={styles.decorQuoteLine}>big dreams</span>
        </div>
      </div>
    </aside>
  );

  if (activeNote) {
    return (
      <div className={styles.page}>
        <Sidebar />
        <div className={styles.detailView}>
          <div className={styles.detailHeader}>
            <button
              className={styles.backBtn}
              onClick={() => {
                setActiveNoteId(null);
                setError(null);
              }}
            >
              <ArrowLeft size={16} /> All notes
            </button>
            <div className={styles.detailActions}>
              <button
                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                onClick={handleRefine}
                disabled={refining}
              >
                {refining ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {refining ? "Refining..." : activeNote.refined_body ? "Re-refine" : "Refine"}
              </button>
              <AddToTodayButton
                title={activeNote.title}
                description={(activeNote.refined_body || activeNote.raw_body)
                  .replace(/<[^>]*>/g, "")
                  .slice(0, 300)}
                linkedNoteId={activeNote.id}
              />
              <button className={styles.actionBtn} onClick={() => setActiveTab("summary")}>
                <FileText size={14} /> Summary
              </button>
              <button className={styles.actionBtn} onClick={() => setActiveTab("quiz")}>
                <HelpCircle size={14} /> Quiz
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => handlePin(activeNote.id, activeNote.pinned)}
                title={activeNote.pinned ? "Unpin" : "Pin"}
              >
                <Star
                  size={14}
                  fill={activeNote.pinned ? "#E8A0A8" : "none"}
                  color={activeNote.pinned ? "#E8A0A8" : "currentColor"}
                />
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => setShowVersions(true)}
                title="History"
              >
                <History size={14} />
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => handleArchiveToggle(activeNote.id, !activeNote.archived)}
                title={activeNote.archived ? "Restore" : "Archive"}
              >
                <Archive size={14} />
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => handleSoftDelete(activeNote.id, activeNote.title)}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className={styles.detailBody}>
            {editingTitle ? (
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                className={styles.detailTitleInput}
                autoFocus
              />
            ) : (
              <h1
                className={styles.detailTitle}
                onClick={() => {
                  setTitleDraft(activeNote.title);
                  setEditingTitle(true);
                }}
              >
                {activeNote.title}
              </h1>
            )}

            <div className={styles.tagEditor}>
              <span className={styles.metaChip}>
                <FileText size={12} className={styles.metaIcon} /> {activeNote.source_type}
              </span>
              {activeNote.tags.map((t) => (
                <span key={t} className={styles.tagChip}>
                  {t}
                  <button
                    className={styles.tagRemove}
                    onClick={() => removeTag(t)}
                    aria-label={`Remove ${t}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                className={styles.tagAddInput}
                placeholder="+ tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                onBlur={addTag}
              />
            </div>

            <div className={styles.detailTimeline}>
              <span className={styles.timelineItem}>
                <Calendar size={12} className={styles.metaIcon} /> Created{" "}
                {new Date(activeNote.created_at).toLocaleDateString()}
              </span>
              <span className={styles.timelineItem}>
                <Calendar size={12} className={styles.metaIcon} /> Updated{" "}
                {new Date(activeNote.updated_at).toLocaleString()}
              </span>
            </div>

            <div className={styles.detailTabs}>
              <button
                className={`${styles.tab} ${activeTab === "raw" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("raw")}
              >
                Raw
              </button>
              <button
                className={`${styles.tab} ${activeTab === "refined" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("refined")}
                disabled={!activeNote.refined_body}
              >
                Refined
              </button>
              <button
                className={`${styles.tab} ${activeTab === "summary" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("summary")}
              >
                Summary
              </button>
              <button
                className={`${styles.tab} ${activeTab === "quiz" ? styles.tabActive : ""}`}
                onClick={() => setActiveTab("quiz")}
              >
                Quiz
              </button>
              {(activeTab === "raw" || activeTab === "refined") && (
                <button
                  className={`${styles.editToggle} ${editingBody ? styles.editToggleActive : ""}`}
                  onClick={() => (editingBody ? saveBody() : startEditingBody())}
                  style={{ marginLeft: "auto" }}
                >
                  {editingBody ? (
                    <>
                      <Check size={14} /> Save
                    </>
                  ) : (
                    <>
                      <Pencil size={14} /> Edit
                    </>
                  )}
                </button>
              )}
            </div>

            {error && (
              <div className={styles.captureError} style={{ marginBottom: "1.5rem" }}>
                {error}
              </div>
            )}

            {activeTab === "raw" &&
              (editingBody ? (
                <textarea
                  className={styles.editableBody}
                  value={bodyDraft}
                  onChange={(e) => setBodyDraft(e.target.value)}
                />
              ) : (
                <div
                  className={styles.renderedNote}
                  dangerouslySetInnerHTML={{ __html: activeNote.raw_body }}
                />
              ))}
            {activeTab === "refined" &&
              (editingBody ? (
                <textarea
                  className={styles.editableBody}
                  value={bodyDraft}
                  onChange={(e) => setBodyDraft(e.target.value)}
                />
              ) : activeNote.refined_body ? (
                <div
                  className={styles.renderedNote}
                  dangerouslySetInnerHTML={{ __html: activeNote.refined_body }}
                />
              ) : (
                <div className={styles.placeholderContent}>
                  Click "Refine" to generate an AI-structured version.
                </div>
              ))}
            {activeTab === "summary" && (
              <SummaryTab noteBody={activeNote.refined_body || activeNote.raw_body} />
            )}
            {activeTab === "quiz" && (
              <QuizTab
                noteBody={activeNote.refined_body || activeNote.raw_body}
                noteId={activeNote.id}
              />
            )}
          </div>
        </div>

        <VersionHistory
          noteId={activeNote.id}
          isOpen={showVersions}
          onClose={() => setShowVersions(false)}
          onRestore={handleRestoreVersion}
        />

        <ConfirmModal
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          destructive={confirmState.destructive}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState((s) => ({ ...s, isOpen: false }))}
        />

        {undoItem && (
          <div className={styles.undoBar}>
            <span>Deleted &ldquo;{undoItem.title}&rdquo;</span>
            <button className={styles.undoButton} onClick={handleUndoDelete}>
              Undo
            </button>
          </div>
        )}
      </div>
    );
  }

  if (counts.total === 0) {
    return (
      <div className={styles.page}>
        <Sidebar />
        <div className={styles.emptyCol}>
          <EmptyState
            icon={<FileText size={32} />}
            title="No notes yet."
            description="Capture your thoughts, import your files, or let AI help you organize everything."
            actionLabel="Capture a note"
            onAction={() => setShowCapture(true)}
            secondaryLabel="Import files"
            onSecondaryAction={() => setShowImport(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Sidebar />
      <div className={styles.main} role="main">
        <div className={styles.listView}>
          <div className={styles.listHeader}>
            <div className={styles.listHeaderLeft}>
              <h1 className={styles.listTitle}>Notes</h1>
              <p className={styles.listSub}>
                Capture. Organize. Learn. <Heart size={16} fill="#E8A0A8" stroke="none" />
              </p>
            </div>
            <div className={styles.listActions}>
              <button className={styles.importBtn} onClick={() => setShowImport(true)}>
                <FileDown size={16} /> Import
              </button>
              <button className={styles.captureBtn} onClick={() => setShowCapture(true)}>
                <Plus size={16} strokeWidth={3} /> Capture
              </button>
            </div>
          </div>

          <div className={styles.filterRowConsolidated}>
            {["All", ...Object.keys(SOURCE_GROUPS)].map((s) => (
              <button
                key={s}
                className={`${styles.filterTab} ${!showArchived && sourceFilter === s ? styles.filterTabActive : ""}`}
                onClick={() => {
                  setSourceFilter(s);
                  setShowArchived(false);
                  setActiveFilter("All");
                }}
              >
                {s}
              </button>
            ))}
            <button
              className={`${styles.filterTab} ${showArchived ? styles.filterTabActive : ""}`}
              onClick={() => {
                setShowArchived(true);
                setSourceFilter("All");
                setActiveFilter("All");
              }}
            >
              <Archive size={12} /> Archived
              {counts.archived > 0 && <span className={styles.filterCount}>{counts.archived}</span>}
            </button>
            {tagFilters.length > 0 && !showArchived && (
              <div className={styles.tagFilterWrap}>
                <select
                  className={styles.tagSelect}
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                >
                  <option value="All">Filter by tag</option>
                  {tagFilters.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              {showArchived
                ? "Archived notes"
                : sourceFilter === "All"
                  ? "All notes"
                  : sourceFilter}
            </span>
            <span className={styles.sectionCount}>
              {filteredNotes.length === 0
                ? "0 notes"
                : `${(currentPage - 1) * NOTES_PER_PAGE + 1}–${Math.min(currentPage * NOTES_PER_PAGE, filteredNotes.length)} of ${filteredNotes.length}`}
            </span>
          </div>

          <div className={styles.notesGrid}>
            {paginatedNotes.map((n) => (
              <div
                key={n.id}
                className={`${styles.noteCardWrap} ${selectedIds.includes(n.id) ? styles.noteCardWrapSelected : ""}`}
              >
                <button
                  type="button"
                  className={`${styles.selectCheckbox} ${selectedIds.includes(n.id) ? styles.selectCheckboxActive : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(n.id);
                  }}
                  aria-label={selectedIds.includes(n.id) ? "Deselect" : "Select"}
                >
                  {selectedIds.includes(n.id) && <Check size={12} />}
                </button>
                <div
                  className={`${styles.noteCard} ${n.pinned ? styles.noteCardPinned : ""}`}
                  onClick={() => {
                    setActiveNoteId(n.id);
                    setActiveTab(n.refined_body ? "refined" : "raw");
                  }}
                >
                  <div className={styles.noteCardTop}>
                    <div className={styles.noteIcon}>
                      <Code2 size={20} strokeWidth={2} />
                    </div>
                    {n.pinned && <Pin size={12} className={styles.pinIcon} fill="#E8A0A8" />}
                    <span className={styles.noteTime}>
                      {new Date(n.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className={styles.noteTitle}>
                    {n.title}
                    {n.archived && !showArchived && (
                      <span className={styles.archivedBadge}>Archived</span>
                    )}
                  </h3>
                  <p className={styles.noteDesc}>
                    {(n.refined_body || n.raw_body).replace(/<[^>]*>/g, "").slice(0, 140)}
                  </p>
                  {n.tags.length > 0 && (
                    <div className={styles.noteTags}>
                      {n.tags.slice(0, 3).map((t) => (
                        <span key={t} className={styles.noteTag}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    className={styles.noteMenuBtn}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div style={{ padding: "2rem 0" }}>
              <EmptyState
                icon={<FileText size={28} />}
                title="No notes here"
                description={
                  activeFilter === "archived"
                    ? "No notes in this view. Check your Archived tab."
                    : "No notes match that filter."
                }
              />
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationBtn}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ArrowLeft size={16} /> Previous
              </button>
              <span className={styles.paginationInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className={styles.paginationBtn}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>{selectedIds.length} selected</span>
          {showArchived ? (
            <button className={styles.bulkBtn} onClick={() => handleBulkArchive(false)}>
              <Archive size={12} /> Restore
            </button>
          ) : (
            <button className={styles.bulkBtn} onClick={() => handleBulkArchive(true)}>
              <Archive size={12} /> Archive
            </button>
          )}
          <button className={styles.bulkBtn} onClick={handleBulkDelete}>
            <Trash2 size={12} /> Delete
          </button>
          <button className={styles.bulkBtn} onClick={clearSelection}>
            Cancel
          </button>
        </div>
      )}

      <AnimatePresence>
        {showCapture && (
          <motion.div
            className={styles.captureBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCapture(false)}
          >
            <motion.div
              className={styles.capturePanel}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.captureHeader}>
                <div>
                  <div className={styles.captureTitle}>Capture anything</div>
                  <div className={styles.captureSub}>
                    Notes, code, questions, feelings... it all goes here.
                  </div>
                </div>
                <button className={styles.captureClose} onClick={() => setShowCapture(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className={styles.captureBody}>
                <div className={styles.captureTabs}>
                  <button
                    className={`${styles.captureTab} ${captureMode === "type" ? styles.captureTabActive : ""}`}
                    onClick={() => setCaptureMode("type")}
                  >
                    <FileText size={14} /> Type
                  </button>
                  <button
                    className={`${styles.captureTab} ${captureMode === "voice" ? styles.captureTabActive : ""}`}
                    onClick={() => setCaptureMode("voice")}
                  >
                    <Sparkles size={14} /> Voice
                  </button>
                  <button
                    className={`${styles.captureTab} ${captureMode === "screenshot" ? styles.captureTabActive : ""}`}
                    onClick={() => setCaptureMode("screenshot")}
                  >
                    <Camera size={14} /> Screenshot
                  </button>
                </div>

                {captureMode === "type" && (
                  <RichTextEditor
                    content={captureText}
                    onChange={setCaptureText}
                    placeholder="Start typing..."
                    minHeight={220}
                  />
                )}

                {captureMode === "voice" && (
                  <VoiceRecorder
                    onTranscript={(text) => {
                      setCaptureText((prev) => prev + `<p>${text}</p>`);
                      setCaptureMode("type");
                    }}
                  />
                )}

                {captureMode === "screenshot" && (
                  <div className={styles.captureScreenshotZone}>
                    {screenshotPreview ? (
                      <div className={styles.screenshotPreviewWrap}>
                        <img
                          src={screenshotPreview}
                          alt="screenshot preview"
                          className={styles.screenshotPreviewImg}
                        />
                        <button
                          className={styles.screenshotRemove}
                          onClick={() => {
                            setScreenshotPreview(null);
                            setCaptureText("");
                          }}
                        >
                          <X size={14} /> Remove
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="screenshot-input" className={styles.screenshotDropZone}>
                        <Camera size={36} className={styles.screenshotIcon} />
                        <div className={styles.screenshotLabel}>
                          Drop a screenshot or click to choose
                        </div>
                        <div className={styles.screenshotSub}>PNG, JPG up to 10MB</div>
                        <input
                          id="screenshot-input"
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          style={{ display: "none" }}
                        />
                      </label>
                    )}
                  </div>
                )}

                {error && <div className={styles.captureError}>{error}</div>}
              </div>
              <div className={styles.captureFooter}>
                <button
                  className={styles.captureBtnSecondary}
                  onClick={() => setShowCapture(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.captureBtnSecondary}
                  onClick={() => handleSave(false)}
                  disabled={saving || !captureText.trim()}
                >
                  {saving && !refining ? "Saving..." : "Save"}
                </button>
                <button
                  className={styles.captureBtnPrimary}
                  onClick={() => handleSave(true)}
                  disabled={saving || !captureText.trim()}
                >
                  <Sparkles size={16} /> {refining ? "Refining..." : "Save & Refine"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImported={handleImported}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        destructive={confirmState.destructive}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((s) => ({ ...s, isOpen: false }))}
      />

      {undoItem && (
        <div className={styles.undoBar}>
          <span>Deleted &ldquo;{undoItem.title}&rdquo;</span>
          <button className={styles.undoButton} onClick={handleUndoDelete}>
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
