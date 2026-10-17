import Link from "next/link";
import Image from "next/image";
import { LogoLockup } from "@/components/Logo";
import styles from "./auth.module.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.authContainer}>
      <div className={styles.bgGrid} />

      <nav className={styles.nav}>
        <Link href="/" className={styles.logoWrap}>
          <LogoLockup size={42} />
        </Link>
      </nav>

      <div className={styles.mainContent}>
        <div className={styles.formSide}>
          <div className={styles.formCard}>{children}</div>
        </div>

        <div className={styles.sceneSide}>
          <Image
            src="/sign up.png"
            alt="A calm morning scene"
            fill
            priority
            className={styles.illustrationImage}
          />
          <div className={styles.sceneOverlay} />
          <div className={styles.sceneTextBlock}>
            <h1 className={styles.sceneTitle}>
              <span className={styles.sceneTitleLine}>Study smarter.</span>
              <span className={`${styles.sceneTitleLine} ${styles.sceneTitleAccent}`}>
                Not harder.
              </span>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
