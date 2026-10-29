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
  Loader2,
  X,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  KeyRound,
  Terminal,
  Braces,
  FileCode,
  Star,
  Pencil,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoLockup } from "@/components/Logo";
import SidebarLogoutButton from "@/components/SidebarLogoutButton";
import ConfirmModal from "@/components/ConfirmModal";
import EmptyState from "@/components/EmptyState";
import VaultModal from "./VaultModal";
import {
  listVaultItems,
  deleteVaultItem,
  toggleVaultPin,
  recordCopy,
  maskValue,
  type VaultItem,
  type VaultType,
  TYPE_LABELS,
} from "@/lib/vault/store";
import styles from "./vault.module.css";

const navItems = [
  { id: "home", label: "Home", href: "/home", Icon: HomeIcon },
  { id: "today", label: "Today", href: "/today", Icon: Calendar },
  { id: "notes", label: "Notes", href: "/notes", Icon: FileText },
  { id: "projects", label: "Projects", href: "/projects", Icon: Code2 },
  { id: "wellbeing", label: "Wellbeing", href: "/you", Icon: Heart },
  { id: "vault", label: "Vault", href: "/vault", Icon: Lock },
];

const TYPE_ICONS: Record<VaultType, typeof KeyRound> = {
  secret: KeyRound,
  snippet: FileCode,
  command: Terminal,
  env_var: Braces,
};

const TYPE_COLORS: Record<VaultType, string> = {
  secret: "#E8A0A8",
  snippet: "#D4AF37",
  command: "#7BC89A",
  env_var: "#A88CE8",
};

export default function VaultPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<VaultType | "all">("all");
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<VaultItem | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  const askConfirm = (opts: Omit<typeof confirmState, "isOpen">) =>
    setConfirmState({ ...opts, isOpen: true });

  const load = async () => {
    try {
      const data = await listVaultItems();
      setItems(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong.");
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
      await load();
      setLoading(false);
    }
    init();
  }, []);

  const handleCopy = async (item: VaultItem) => {
    try {
      await navigator.clipboard.writeText(item.value);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1600);
      await recordCopy(item.id);
      await load();
    } catch {}
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDelete = (item: VaultItem) => {
    askConfirm({
      title: "Delete this item?",
      message: `"${item.title}" will be permanently removed from your vault.`,
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: async () => {
        await deleteVaultItem(item.id);
        await load();
      },
    });
  };

  const handlePin = async (item: VaultItem) => {
    await toggleVaultPin(item.id, !item.pinned);
    await load();
  };

  const handleCreate = async () => {
    setEditing(null);
    setShowModal(true);
  };

  const filtered = items.filter((item) => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className={styles.page}>
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
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarDecor}>
          <div className={styles.decorQuote}>
            <span className={styles.decorQuoteLine}>What you save</span>
            <span className={`${styles.decorQuoteLine} ${styles.decorQuoteWhite}`}>
              today, saves
            </span>
            <span className={styles.decorQuoteLine}>you tomorrow.</span>
          </div>
        </div>
        <SidebarLogoutButton />
      </aside>

      <div className={styles.main} role="main">
        <div className={styles.content}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Vault</h1>
              <p className={styles.subtitle}>Secrets, snippets, and commands. Encrypted at rest.</p>
            </div>
            <button className={styles.addBtn} onClick={handleCreate}>
              <Plus size={18} strokeWidth={3} /> Add item
            </button>
          </div>

          <div className={styles.searchRow}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search titles, values, tags..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className={styles.searchClear} onClick={() => setSearch("")}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className={styles.filterRow}>
            <button
              className={`${styles.filterTab} ${typeFilter === "all" ? styles.filterTabActive : ""}`}
              onClick={() => setTypeFilter("all")}
            >
              All <span className={styles.filterCount}>{items.length}</span>
            </button>
            {(Object.keys(TYPE_LABELS) as VaultType[]).map((t) => {
              const count = items.filter((i) => i.type === t).length;
              const Icon = TYPE_ICONS[t];
              return (
                <button
                  key={t}
                  className={`${styles.filterTab} ${typeFilter === t ? styles.filterTabActive : ""}`}
                  onClick={() => setTypeFilter(t)}
                >
                  <Icon size={13} style={{ color: TYPE_COLORS[t] }} />
                  {TYPE_LABELS[t]}
                  {count > 0 && <span className={styles.filterCount}>{count}</span>}
                </button>
              );
            })}
          </div>

          {error && <div className={styles.errorBar}>{error}</div>}

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Shield size={32} />}
              title={items.length === 0 ? "Your vault is empty" : "Nothing matches"}
              description={
                items.length === 0
                  ? "Store API keys, terminal commands, code snippets, and environment variables in one secure place."
                  : "Try a different search or filter."
              }
              actionLabel={items.length === 0 ? "Add your first item" : undefined}
              onAction={items.length === 0 ? handleCreate : undefined}
            />
          ) : (
            <div className={styles.list}>
              {filtered.map((item, i) => {
                const Icon = TYPE_ICONS[item.type];
                const color = TYPE_COLORS[item.type];
                const isSecret = item.type === "secret" || item.type === "env_var";
                const revealed = revealedIds.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className={styles.item}
                  >
                    <div
                      className={styles.itemIcon}
                      style={{ color, borderColor: `${color}33`, background: `${color}15` }}
                    >
                      <Icon size={18} />
                    </div>

                    <div className={styles.itemBody}>
                      <div className={styles.itemHeader}>
                        <div className={styles.itemTitleRow}>
                          {item.pinned && (
                            <Star size={12} className={styles.pinIcon} fill="#E8A0A8" />
                          )}
                          <h3 className={styles.itemTitle}>{item.title}</h3>
                          <span
                            className={styles.itemTypeBadge}
                            style={{ color, borderColor: `${color}33` }}
                          >
                            {TYPE_LABELS[item.type]}
                          </span>
                        </div>
                        {item.description && <p className={styles.itemDesc}>{item.description}</p>}
                      </div>

                      <div className={styles.itemValueRow}>
                        <div className={styles.itemValue}>
                          {isSecret && !revealed ? maskValue(item.value) : item.value}
                        </div>
                        {isSecret && (
                          <button
                            className={styles.revealBtn}
                            onClick={() => toggleReveal(item.id)}
                            title={revealed ? "Hide" : "Reveal"}
                          >
                            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>

                      {item.tags.length > 0 && (
                        <div className={styles.itemTags}>
                          {item.tags.map((t) => (
                            <span key={t} className={styles.itemTag}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={styles.itemActions}>
                      <button
                        className={`${styles.copyBtn} ${copiedId === item.id ? styles.copyBtnDone : ""}`}
                        onClick={() => handleCopy(item)}
                        title="Copy value"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check size={14} /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Copy
                          </>
                        )}
                      </button>
                      <button
                        className={styles.iconBtn}
                        onClick={() => handlePin(item)}
                        title={item.pinned ? "Unpin" : "Pin"}
                      >
                        <Star
                          size={14}
                          fill={item.pinned ? "#E8A0A8" : "none"}
                          color={item.pinned ? "#E8A0A8" : "currentColor"}
                        />
                      </button>
                      <button
                        className={styles.iconBtn}
                        onClick={() => {
                          setEditing(item);
                          setShowModal(true);
                        }}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className={styles.iconBtn}
                        onClick={() => handleDelete(item)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <VaultModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
        onSaved={load}
        editing={editing}
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
    </div>
  );
}
