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
  LogOut,
  Check,
  Loader2,
  User,
  Bell,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoLockup } from "@/components/Logo";
import ConfirmModal from "@/components/ConfirmModal";
import {
  getProfile,
  updateProfile,
  avatarUrl,
  AVATAR_SEEDS,
  type Profile,
} from "@/lib/profile/store";
import styles from "./settings.module.css";

const navItems = [
  { id: "home", label: "Home", href: "/home", Icon: HomeIcon },
  { id: "today", label: "Today", href: "/today", Icon: Calendar },
  { id: "notes", label: "Notes", href: "/notes", Icon: FileText },
  { id: "projects", label: "Projects", href: "/projects", Icon: Code2 },
  { id: "wellbeing", label: "Wellbeing", href: "/you", Icon: Heart },
  { id: "vault", label: "Vault", href: "/vault", Icon: Lock },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draftName, setDraftName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [email, setEmail] = useState("");
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

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setEmail(user.email || "");
      const p = await getProfile();
      setProfile(p);
      setDraftName(p?.display_name || "");
      setPendingAvatar(p?.avatar_seed || "amani");
      setLoading(false);
    }
    load();
  }, []);

  const saveName = async () => {
    if (!draftName.trim() || nameSaving) return;
    setNameSaving(true);
    try {
      const next = await updateProfile({ display_name: draftName.trim() });
      setProfile(next);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 1600);
    } catch (err) {
      console.error(err);
    } finally {
      setNameSaving(false);
    }
  };

  const selectAvatar = (seed: string) => {
    if (avatarSaving) return;
    setPendingAvatar(seed);
  };

  const saveAvatar = async () => {
    if (!profile || !pendingAvatar) return;
    if (pendingAvatar === profile.avatar_seed) return;
    setAvatarSaving(true);
    try {
      const next = await updateProfile({ avatar_seed: pendingAvatar });
      if (next) setProfile(next);
    } catch (err) {
      console.error("Avatar save failed:", err);
    } finally {
      setAvatarSaving(false);
    }
  };

  const cancelAvatar = () => {
    if (!profile) return;
    setPendingAvatar(profile.avatar_seed);
  };

  const handleSignOut = () => {
    setConfirmState({
      isOpen: true,
      title: "Sign out?",
      message: "You will need to sign in again to access your workspace.",
      confirmLabel: "Sign out",
      destructive: false,
      onConfirm: async () => {
        await supabase.auth.signOut();
        router.push("/login");
      },
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading settings...</div>;
  }

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <LogoLockup size={42} />
        </div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <item.Icon size={20} strokeWidth={2} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarQuote}>
          <span className={styles.sidebarQuoteLine}>You&apos;re doing</span>
          <span className={`${styles.sidebarQuoteLine} ${styles.sidebarQuoteLineWhite}`}>
            hard things.
          </span>
          <span className={`${styles.sidebarQuoteLine} ${styles.sidebarQuoteLineGold}`}>
            And it shows.
          </span>
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.content}>
          <Link href="/home" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={styles.header}
          >
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.subtitle}>Make this space feel like yours.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className={styles.section}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <User size={18} />
              </div>
              <div>
                <div className={styles.sectionTitle}>Profile</div>
                <div className={styles.sectionSub}>How you show up in Code Campus.</div>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Display name</label>
              <div className={styles.inlineRow}>
                <input
                  type="text"
                  className={styles.input}
                  value={draftName}
                  onChange={(e) => {
                    setDraftName(e.target.value);
                    setNameSaved(false);
                  }}
                  placeholder="Your name"
                  maxLength={40}
                />
                <button
                  className={styles.saveBtn}
                  onClick={saveName}
                  disabled={
                    nameSaving || !draftName.trim() || draftName.trim() === profile?.display_name
                  }
                >
                  {nameSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : nameSaved ? (
                    <Check size={14} />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input type="text" className={styles.input} value={email} disabled />
              <span className={styles.hint}>Your email is used only for sign in.</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className={styles.section}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <Heart size={18} />
              </div>
              <div className={styles.sectionHeaderText}>
                <div className={styles.sectionTitle}>Avatar</div>
                <div className={styles.sectionSub}>Pick one to represent you.</div>
              </div>
              {pendingAvatar && profile && pendingAvatar !== profile.avatar_seed && (
                <div className={styles.avatarActions}>
                  <button
                    className={styles.avatarCancelBtn}
                    onClick={cancelAvatar}
                    disabled={avatarSaving}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.avatarSaveBtn}
                    onClick={saveAvatar}
                    disabled={avatarSaving}
                  >
                    {avatarSaving ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Check size={13} />
                    )}
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className={styles.avatarHero}>
              <img src={avatarUrl(pendingAvatar || profile?.avatar_seed || "amani", 256)} alt="" />
            </div>

            <div className={styles.avatarGrid}>
              {AVATAR_SEEDS.map((seed) => {
                const isActive = pendingAvatar === seed;
                return (
                  <button
                    key={seed}
                    type="button"
                    className={
                      styles.avatarChoice + " " + (isActive ? styles.avatarChoiceActive : "")
                    }
                    onClick={() => selectAvatar(seed)}
                    disabled={avatarSaving}
                    aria-label={"Choose avatar " + seed}
                  >
                    <img src={avatarUrl(seed, 128)} alt="" className={styles.avatarImg} />
                    {isActive && (
                      <span className={styles.avatarCheck}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={styles.section}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <Bell size={18} />
              </div>
              <div>
                <div className={styles.sectionTitle}>Notifications</div>
                <div className={styles.sectionSub}>
                  You will see the bell in the top bar light up when there is something new.
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={styles.section}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <Shield size={18} />
              </div>
              <div>
                <div className={styles.sectionTitle}>Account</div>
                <div className={styles.sectionSub}>Sign out or leave Code Campus.</div>
              </div>
            </div>

            <button className={styles.signOutBtn} onClick={handleSignOut}>
              <LogOut size={16} /> Sign out
            </button>
          </motion.div>
        </div>
      </div>

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
