"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home as HomeIcon,
  FileText,
  Calendar,
  Code2,
  Lock,
  Heart,
  Plus,
  Loader2,
  X,
  FolderKanban,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoLockup } from "@/components/Logo";
import SidebarLogoutButton from "@/components/SidebarLogoutButton";
import { listProjects, createProject, type Project } from "@/lib/projects/store";
import styles from "./projects.module.css";

const navItems = [
  { id: "home", label: "Home", href: "/home", Icon: HomeIcon },
  { id: "today", label: "Today", href: "/today", Icon: Calendar },
  { id: "notes", label: "Notes", href: "/notes", Icon: FileText },
  { id: "projects", label: "Projects", href: "/projects", Icon: Code2 },
  { id: "wellbeing", label: "Wellbeing", href: "/you", Icon: Heart },
  { id: "vault", label: "Vault", href: "/vault", Icon: Lock },
];

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const load = async () => {
    try {
      const data = await listProjects();
      setProjects(data);
    } catch {}
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

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const p = await createProject({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
      });
      setShowNew(false);
      setNewName("");
      setNewDesc("");
      router.push(`/projects/${p.id}`);
    } catch {
    } finally {
      setSaving(false);
    }
  };

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
              <item.Icon size={20} strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarDecor}>
          <div className={styles.decorQuote}>
            <span className={styles.decorQuoteLine}>Build the</span>
            <span className={`${styles.decorQuoteLine} ${styles.decorQuoteWhite}`}>thing you</span>
            <span className={styles.decorQuoteLine}>want to see.</span>
          </div>
        </div>
        <SidebarLogoutButton />
      </aside>

      <div className={styles.main} role="main">
        <div className={styles.content}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Projects</h1>
              <p className={styles.subtitle}>
                Upload project specs, then use Scout to turn them into clarity, decisions, and next
                steps.
              </p>
            </div>
            <button className={styles.addBtn} onClick={() => setShowNew(true)}>
              <Plus size={18} strokeWidth={3} /> New project
            </button>
          </div>

          <div className={styles.valuePanel}>
            <div className={styles.valueBadge}>Scout reads your project brief</div>
            <h2 className={styles.valueTitle}>
              Upload specs and let Scout make sense of the whole build.
            </h2>
            <p className={styles.valueText}>
              Drop in PDFs, screenshots, notes, and design files. Scout reads what matters, connects
              the details, and helps you understand what to build, what to fix, and what to
              prioritise next.
            </p>
            <ul className={styles.valueList}>
              <li>Ask what to build first</li>
              <li>Check whether a decision matches the brief</li>
              <li>Break the project into architecture, tasks, and risks</li>
              <li>Review specs, gaps, and missing requirements</li>
            </ul>
          </div>

          {projects.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <FolderKanban size={40} />
              </div>
              <h2 className={styles.emptyTitle}>No projects yet.</h2>
              <p className={styles.emptyText}>
                Create a project, upload your specs, and ask Scout to analyse them for direction,
                decisions, risks, and next steps.
              </p>
              <button className={styles.emptyBtn} onClick={() => setShowNew(true)}>
                <Plus size={16} strokeWidth={3} /> Create your first project
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className={styles.card}
                  prefetch={false}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon}>
                      <FolderKanban size={20} />
                    </div>
                    <span
                      className={`${styles.status} ${styles[`status${p.status.charAt(0).toUpperCase() + p.status.slice(1)}`]}`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{p.name}</h3>
                  {p.description && <p className={styles.cardDesc}>{p.description}</p>}
                  <div className={styles.cardMeta}>
                    Updated {new Date(p.updated_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {showNew && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowNew(false)}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>New project</div>
                <div className={styles.modalSub}>Give it a name and a short description.</div>
              </div>
              <button className={styles.modalClose} onClick={() => setShowNew(false)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Project name</label>
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. ToS Risk Scanner"
                  autoFocus
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Description <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  className={styles.fieldTextarea}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What is this project about?"
                  rows={3}
                />
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.btnSecondary} onClick={() => setShowNew(false)}>
                  Cancel
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={handleCreate}
                  disabled={saving || !newName.trim()}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : "Create project"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
