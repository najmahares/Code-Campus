"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home as HomeIcon,
  FileText,
  Calendar,
  Code2,
  Lock,
  Heart,
  ArrowLeft,
  Plus,
  Loader2,
  Trash2,
  Upload,
  X,
  FileText as FileIcon,
  Copy,
  RotateCcw,
  Check,
  ThumbsUp,
  ThumbsDown,
  Image as ImageIcon,
  Link2,
  Sparkles,
  MessageSquare,
  Send,
  Eraser,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoLockup } from "@/components/Logo";
import ConfirmModal from "@/components/ConfirmModal";
import DeerLoader from "@/components/DeerLoader";
import {
  getProject,
  updateProject,
  listProjectSpecs,
  deleteProjectSpec,
  uploadProjectFile,
  listProjectChats,
  saveProjectChat,
  clearProjectChats,
  SUPPORTED_SPEC_TYPES,
  type Project,
  type ProjectSpec,
  type ProjectChat,
} from "@/lib/projects/store";
import styles from "./project.module.css";

const navItems = [
  { id: "home", label: "Home", href: "/home", Icon: HomeIcon },
  { id: "today", label: "Today", href: "/today", Icon: Calendar },
  { id: "notes", label: "Notes", href: "/notes", Icon: FileText },
  { id: "projects", label: "Projects", href: "/projects", Icon: Code2 },
  { id: "wellbeing", label: "Wellbeing", href: "/you", Icon: Heart },
  { id: "vault", label: "Vault", href: "/vault", Icon: Lock },
];

type Tab = "specs" | "overview";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [specs, setSpecs] = useState<ProjectSpec[]>([]);
  const [tab, setTab] = useState<Tab>("specs");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, name: "" });
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Project>>({});
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

  const [chatOpen, setChatOpen] = useState(false);
  const [chats, setChats] = useState<ProjectChat[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const askConfirm = (opts: Omit<typeof confirmState, "isOpen">) =>
    setConfirmState({ ...opts, isOpen: true });

  const loadAll = async () => {
    try {
      const [p, s, c] = await Promise.all([
        getProject(projectId),
        listProjectSpecs(projectId),
        listProjectChats(projectId),
      ]);
      if (!p) {
        router.push("/projects");
        return;
      }
      setProject(p);
      setSpecs(s);
      setChats(c);
      setDraft(p);
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
      await loadAll();
      setLoading(false);
    }
    init();
  }, [projectId]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chats, chatOpen]);

  const uploadOne = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) throw new Error(`${file.name} is too large (max 15MB)`);
    if (!SUPPORTED_SPEC_TYPES.includes(file.type) && !file.name.endsWith(".md")) {
      throw new Error(`${file.name}: unsupported file type`);
    }

    const { signedUrl } = await uploadProjectFile(file, projectId);

    const parseRes = await fetch("/api/projects/specs/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: file.type.split("/")[0], signedUrl, fileType: file.type }),
    });
    const parseData = await parseRes.json();
    const extracted = parseRes.ok ? parseData.extracted_text : null;

    const { error: insErr } = await supabase.from("project_specs").insert({
      project_id: projectId,
      user_id: (await supabase.auth.getUser()).data.user!.id,
      name: file.name,
      file_type: file.type || "unknown",
      file_url: signedUrl,
      file_size: file.size,
      extracted_text: extracted,
    });
    if (insErr) throw insErr;
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setUploading(true);
    setError(null);
    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress({ current: i + 1, total: files.length, name: files[i].name });
        try {
          await uploadOne(files[i]);
        } catch (err: any) {
          console.warn(`Skipped ${files[i].name}:`, err.message);
        }
      }
      await loadAll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0, name: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (folderInputRef.current) folderInputRef.current.value = "";
    }
  };

  const handleDeleteSpec = (id: string, name: string) => {
    askConfirm({
      title: "Remove this spec?",
      message: `"${name}" will be removed from this project.`,
      confirmLabel: "Remove",
      destructive: true,
      onConfirm: async () => {
        await deleteProjectSpec(id);
        await loadAll();
      },
    });
  };

  const handleSave = async () => {
    if (!project) return;
    try {
      await updateProject(project.id, draft);
      await loadAll();
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput("");
    setSending(true);
    setError(null);

    const tempUserId = "temp-user-" + Date.now();
    const tempAssistantId = "temp-assistant-" + Date.now();

    setChats((prev) => [
      ...prev,
      {
        id: tempUserId,
        project_id: projectId,
        user_id: "",
        role: "user",
        content: userMsg,
        created_at: new Date().toISOString(),
      },
      {
        id: tempAssistantId,
        project_id: projectId,
        user_id: "",
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
      },
    ]);

    try {
      const historyForApi = chats.map((c) => ({ role: c.role, content: c.content }));

      const res = await fetch("/api/projects/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, message: userMsg, history: historyForApi }),
      });

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Scout failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setChats((prev) =>
          prev.map((c) => (c.id === tempAssistantId ? { ...c, content: fullText } : c))
        );
      }

      await saveProjectChat(projectId, "user", userMsg);
      await saveProjectChat(projectId, "assistant", fullText);
      await loadAll();
    } catch (err: any) {
      setChats((prev) => prev.filter((c) => c.id !== tempAssistantId));
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = () => {
    askConfirm({
      title: "Clear conversation?",
      message: "All chat history for this project will be removed.",
      confirmLabel: "Clear",
      destructive: true,
      onConfirm: async () => {
        await clearProjectChats(projectId);
        await loadAll();
      },
    });
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {}
  };

  const handleRetry = async () => {
    const lastUser = [...chats].reverse().find((c) => c.role === "user");
    if (!lastUser) return;
    setChats((prev) => {
      const idx = prev.findIndex((c) => c.id === prev[prev.length - 1]?.id);
      if (prev[prev.length - 1]?.role === "assistant") {
        return prev.slice(0, -1);
      }
      return prev;
    });
    setInput(lastUser.content);
  };

  const handleFeedback = async (messageId: string, kind: "up" | "down") => {
    setChats((prev) =>
      prev.map((c) => (c.id === messageId ? ({ ...c, feedback: kind } as any) : c))
    );
  };

  if (loading) return <div className={styles.loading}>Loading project...</div>;
  if (!project) return null;

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <LogoLockup size={40} />
        </div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ""}`}
            >
              <item.Icon size={20} strokeWidth={2} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className={styles.sidebarDecor}>
          <div className={styles.decorQuote}>
            <span className={styles.decorQuoteLine}>Build the</span>
            <span className={`${styles.decorQuoteLine} ${styles.decorQuoteWhite}`}>thing you</span>
            <span className={styles.decorQuoteLine}>want to see.</span>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.topbar}>
          <a href="/projects" className={styles.backBtn}>
            <ArrowLeft size={16} /> All projects
          </a>
          <button className={styles.copilotBtn} onClick={() => setChatOpen(true)}>
            <Sparkles size={16} /> Ask Scout
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.projectHeader}>
            <div className={styles.projectTitleRow}>
              {editing ? (
                <input
                  className={styles.projectTitleInput}
                  value={draft.name || ""}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              ) : (
                <h1 className={styles.projectTitle}>{project.name}</h1>
              )}
              <span
                className={`${styles.statusPill} ${styles[`status${project.status.charAt(0).toUpperCase() + project.status.slice(1)}`]}`}
              >
                {project.status}
              </span>
            </div>
            {editing ? (
              <textarea
                className={styles.projectDescInput}
                value={draft.description || ""}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={2}
              />
            ) : (
              project.description && <p className={styles.projectDesc}>{project.description}</p>
            )}
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === "specs" ? styles.tabActive : ""}`}
              onClick={() => setTab("specs")}
            >
              Specs <span className={styles.tabCount}>{specs.length}</span>
            </button>
            <button
              className={`${styles.tab} ${tab === "overview" ? styles.tabActive : ""}`}
              onClick={() => setTab("overview")}
            >
              Overview
            </button>
          </div>

          {error && <div className={styles.errorBar}>{error}</div>}

          {tab === "specs" && (
            <>
              <div className={styles.uploadArea}>
                <label className={styles.uploadZone}>
                  <Upload size={28} />
                  <div className={styles.uploadLabel}>
                    {uploading
                      ? `Uploading ${uploadProgress.current} / ${uploadProgress.total}`
                      : "Drop files here or click to choose"}
                  </div>
                  <div className={styles.uploadSub}>PDF, PNG, JPG, TXT, MD · up to 15MB each</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
                    onChange={(e) => handleFiles(e.target.files)}
                    style={{ display: "none" }}
                    disabled={uploading}
                  />
                </label>
                <label className={styles.uploadFolderZone}>
                  <Upload size={18} />
                  <span>Upload whole folder</span>
                  <input
                    ref={folderInputRef}
                    type="file"

                    {...{ webkitdirectory: "", directory: "" } as any}
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    style={{ display: "none" }}
                    disabled={uploading}
                  />
                </label>
              </div>

              {specs.length === 0 ? (
                <div className={styles.emptySpecs}>
                  No specs yet. Upload the files that define this project.
                </div>
              ) : (
                <div className={styles.specsList}>
                  {specs.map((s) => (
                    <motion.div
                      key={s.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={styles.specRow}
                    >
                      <div className={styles.specIcon}>
                        {s.file_type?.startsWith("image/") ? (
                          <ImageIcon size={16} />
                        ) : (
                          <FileIcon size={16} />
                        )}
                      </div>
                      <div className={styles.specInfo}>
                        <div className={styles.specName}>{s.name}</div>
                        <div className={styles.specMeta}>
                          {s.file_type} ·{" "}
                          {s.file_size ? `${Math.round(s.file_size / 1024)} KB` : ""} ·{" "}
                          {s.extracted_text
                            ? `${s.extracted_text.length} chars extracted`
                            : "not parsed"}
                        </div>
                      </div>
                      <button
                        className={styles.specDelete}
                        onClick={() => handleDeleteSpec(s.id, s.name)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "overview" && (
            <div className={styles.overviewGrid}>
              <div className={styles.overviewField}>
                <label className={styles.overviewLabel}>GitHub URL</label>
                <input
                  className={styles.overviewInput}
                  value={editing ? draft.github_url || "" : project.github_url || ""}
                  onChange={(e) => setDraft({ ...draft, github_url: e.target.value })}
                  placeholder="https://github.com/..."
                  disabled={!editing}
                />
              </div>
              <div className={styles.overviewField}>
                <label className={styles.overviewLabel}>Local Path</label>
                <input
                  className={styles.overviewInput}
                  value={editing ? draft.local_path || "" : project.local_path || ""}
                  onChange={(e) => setDraft({ ...draft, local_path: e.target.value })}
                  placeholder="/Users/you/Projects/..."
                  disabled={!editing}
                />
              </div>
              <div className={styles.overviewField}>
                <label className={styles.overviewLabel}>Figma URL</label>
                <input
                  className={styles.overviewInput}
                  value={editing ? draft.figma_url || "" : project.figma_url || ""}
                  onChange={(e) => setDraft({ ...draft, figma_url: e.target.value })}
                  placeholder="https://figma.com/..."
                  disabled={!editing}
                />
              </div>
              <div className={styles.overviewField}>
                <label className={styles.overviewLabel}>Deployed URL</label>
                <input
                  className={styles.overviewInput}
                  value={editing ? draft.deployed_url || "" : project.deployed_url || ""}
                  onChange={(e) => setDraft({ ...draft, deployed_url: e.target.value })}
                  placeholder="https://yourapp.vercel.app"
                  disabled={!editing}
                />
              </div>
              <div className={styles.overviewField}>
                <label className={styles.overviewLabel}>Status</label>
                <select
                  className={styles.overviewInput}
                  value={editing ? draft.status || "active" : project.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as any })}
                  disabled={!editing}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className={styles.overviewActions}>
                {editing ? (
                  <>
                    <button
                      className={styles.btnSecondary}
                      onClick={() => {
                        setDraft(project);
                        setEditing(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button className={styles.btnPrimary} onClick={handleSave}>
                      Save changes
                    </button>
                  </>
                ) : (
                  <button className={styles.btnPrimary} onClick={() => setEditing(true)}>
                    Edit details
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div
              className={styles.chatBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
            />
            <motion.div
              className={styles.chatPanel}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className={styles.chatHeader}>
                <div>
                  <div className={styles.chatTitle}>
                    <Sparkles size={16} /> Scout
                  </div>
                  <div className={styles.chatSub}>
                    {project.name} · reading {specs.length} spec{specs.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className={styles.chatHeaderActions}>
                  <button
                    className={styles.chatIconBtn}
                    onClick={handleClearChat}
                    title="Clear chat"
                  >
                    <Eraser size={14} />
                  </button>
                  <button className={styles.chatIconBtn} onClick={() => setChatOpen(false)}>
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className={styles.chatMessages} ref={chatScrollRef}>
                {chats.length === 0 && (
                  <div className={styles.chatEmpty}>
                    <Sparkles size={28} />
                    <div className={styles.chatEmptyTitle}>Hey, I&apos;m Scout.</div>
                    <div className={styles.chatEmptyText}>
                      I&apos;ve read your specs. Ask me anything about this project — what to build
                      first, whether a decision matches the brief, or how to fix something
                      that&apos;s broken.
                    </div>
                  </div>
                )}
                {chats.map((c, idx) => {
                  const isLast = idx === chats.length - 1;
                  const isStreaming =
                    sending && isLast && c.role === "assistant" && c.content.length > 0;
                  if (c.role === "user") {
                    return (
                      <div key={c.id} className={styles.chatMsgUser}>
                        <div className={styles.chatMsgUserBubble}>{c.content}</div>
                      </div>
                    );
                  }
                  return (
                    <div key={c.id} className={styles.chatMsgAssistant}>
                      <div className={styles.chatMsgAssistantText}>
                        {c.content}
                        {isStreaming && <span className={styles.streamingCursor}>|</span>}
                      </div>
                      {!sending && c.content && (
                        <div className={styles.chatMsgActions}>
                          <button
                            className={styles.chatMsgAction}
                            onClick={() => handleCopy(c.content, c.id)}
                            title="Copy"
                          >
                            {copiedId === c.id ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                          {isLast && (
                            <button
                              className={styles.chatMsgAction}
                              onClick={handleRetry}
                              title="Retry"
                            >
                              <RotateCcw size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className={styles.chatInputArea}>
                <textarea
                  className={styles.chatInput}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask about this project..."
                  rows={2}
                />
                <button
                  className={styles.chatSend}
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                >
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        destructive={confirmState.destructive}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((s) => ({ ...s, isOpen: false }))}
      />
    </div>
  );
}
