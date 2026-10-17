"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Calendar, Code2, Heart } from "lucide-react";
import styles from "./MobileNav.module.css";

const items = [
  { id: "home", href: "/home", Icon: Home, label: "Home" },
  { id: "notes", href: "/notes", Icon: FileText, label: "Notes" },
  { id: "today", href: "/today", Icon: Calendar, label: "Today" },
  { id: "projects", href: "/projects", Icon: Code2, label: "Projects" },
  { id: "wellbeing", href: "/you", Icon: Heart, label: "Wellbeing" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={styles.item + " " + (isActive ? styles.active : "")}
          >
            <item.Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
