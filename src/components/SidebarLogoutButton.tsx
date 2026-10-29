"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./SidebarLogoutButton.module.css";

export default function SidebarLogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <button type="button" className={styles.logoutButton} onClick={handleLogout}>
      <LogOut size={18} strokeWidth={2} aria-hidden="true" />
      <span>Log out</span>
    </button>
  );
}
