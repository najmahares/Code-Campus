"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  FileText,
  Code2,
  Calendar,
  Heart,
  Lock,
  ArrowRight,
  Sparkles,
  GitBranch,
  Globe,
  Zap,
  Cpu,
  Plus,
  Minus,
  Terminal,
  Database,
  Layout,
} from "lucide-react";
import { LogoLockup } from "@/components/Logo";
import styles from "./page.module.css";

const HERO_PHRASES = [
  "classes, projects, and sanity.",
  "specs, deadlines, and code.",
  "notes, tasks, and focus.",
];

const STATS = [
  { value: "5+", label: "Tools juggled daily" },
  { value: "10h", label: "Average screen time" },
  { value: "73%", label: "Report burnout" },
  { value: "1", label: "Workspace to fix it" },
];

const USERS = [
  {
    title: "CS Students",
    desc: "Navigating heavy course loads, complex projects, and endless deadlines.",
    icon: FileText,
  },
  {
    title: "Bootcamp Grads",
    desc: "Moving fast, building portfolios, and trying to keep their head above water.",
    icon: Zap,
  },
  {
    title: "Self-Taught Devs",
    desc: "Managing their own curriculum, avoiding burnout, and shipping real work.",
    icon: Cpu,
  },
];

const FEATURES = [
  {
    title: "Intelligent Notes",
    desc: "Drop PDFs and links. AI turns them into study-ready notes.",
    icon: FileText,
    color: "#E8A0A8",
  },
  {
    title: "Scout AI Copilot",
    desc: "Upload specs. Scout helps you architect and plan the build.",
    icon: Code2,
    color: "#D4AF37",
  },
  {
    title: "Today",
    desc: "A focused list of exactly what needs to ship today.",
    icon: Calendar,
    color: "#A88CE8",
  },
  {
    title: "Wellbeing",
    desc: "Mood tracking, breathing resets, and a safe space to vent.",
    icon: Heart,
    color: "#E86464",
  },
  {
    title: "Encrypted Vault",
    desc: "Keep your API keys and code snippets secure.",
    icon: Lock,
    color: "#7BC89A",
  },
];

const FAQS = [
  {
    q: "Is Code Campus free for students?",
    a: "Yes. The core workspace, including Notes, Today, and Wellbeing, is entirely free for students. We offer a Pro tier for advanced AI features and unlimited project storage.",
  },
  {
    q: "How does the AI copilot work?",
    a: "When you upload a project spec or a lecture PDF, our AI reads it and indexes it. You can then chat with Scout to ask questions, generate code structures, or create study guides based on your exact documents.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. Your notes, tasks, and API keys are encrypted at rest. We use Supabase for secure authentication and row-level security, meaning only you can access your data.",
  },
  {
    q: "Can I use this for non-CS classes?",
    a: "Yes. While we built it with engineers in mind, the Notes and Today tools are perfect for any heavy academic workload.",
  },
];

const floatingVariants: Variants = {
  animate: (custom: any) => ({
    y: [0, -10, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: custom * 0.2 },
  }),
};

export default function LandingPage() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />
      <div className={styles.bgGlow3} />

      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logoLink}>
            <LogoLockup size={36} />
          </Link>
          <div className={styles.navLinks}>
            <Link href="/login" className={styles.navBtnGhost}>
              Sign in
            </Link>
            <Link href="/register" className={styles.navBtnPrimary}>
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <section className={styles.hero}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.heroContent}
          >
            <motion.div
              variants={floatingVariants}
              animate="animate"
              custom={1}
              className={styles.badge}
            >
              <Sparkles size={14} className={styles.badgeIcon} />
              <span>POWERED BY SCOUT AI</span>
            </motion.div>

            <h1 className={styles.headline}>
              One workspace for
              <div className={styles.kineticContainer}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phraseIndex}
                    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={styles.headlineAccent}
                  >
                    {HERO_PHRASES[phraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className={styles.subheadline}
            >
              Stop duct-taping five different apps together. Code Campus unifies your notes,
              projects, tasks, and mental clarity into one high-performance system.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className={styles.heroActions}
            >
              <Link href="/register" className={styles.ctaButton}>
                <span>Start building</span>
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        <section className={styles.statsSection}>
          <div className={styles.container}>
            <div className={styles.statsGrid}>
              {STATS.map((stat, i) => (
                <motion.div
                  key={i}
                  className={styles.statItem}
                  variants={floatingVariants}
                  animate="animate"
                  custom={i}
                >
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.problemSection}>
          <div className={styles.container}>
            <motion.div
              className={styles.problemContent}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className={styles.problemTitle}>Your brain is full.</h2>
              <p className={styles.problemText}>
                You have a PDF open for one class, a Figma file for a capstone, a terminal window
                for debugging, and a to-do list that's out of control. The context switching is
                relentless. We built Code Campus to pull all of that into one clean, glowing
                workspace.
              </p>
            </motion.div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.sectionTitle}>Built for the ones who ship.</h2>
            </motion.div>
            <div className={styles.usersGrid}>
              {USERS.map((user, i) => (
                <motion.div
                  key={i}
                  className={styles.userCard}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgba(232, 160, 168, 0.4)" }}
                >
                  <div className={styles.userIcon}>
                    <user.icon size={24} />
                  </div>
                  <h3 className={styles.userTitle}>{user.title}</h3>
                  <p className={styles.userDesc}>{user.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.sectionTitle}>Everything in one system.</h2>
              <p className={styles.sectionSub}>No more tab switching.</p>
            </motion.div>
            <div className={styles.featuresGrid}>
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={i}
                  className={styles.featureCard}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ rotateX: 5, rotateY: 5, scale: 1.02 }}
                  style={{ "--glow-color": feature.color } as React.CSSProperties}
                >
                  <div className={styles.featureCardGlow} />
                  <div
                    className={styles.featureIconWrap}
                    style={{ color: feature.color, background: `${feature.color}15` }}
                  >
                    <feature.icon size={20} />
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDesc}>{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.testimonialSection}>
          <div className={styles.container}>
            <motion.div
              className={styles.testimonialContent}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <p className={styles.quoteText}>
                "I used to have 20 tabs open just to start an assignment. Now everything is right
                here. I can actually just focus on coding."
              </p>
              <div className={styles.quoteAuthor}>
                <img
                  src="https://api.dicebear.com/9.x/micah/svg?seed=amina&backgroundColor=f5c5cb&skinColor=ae5d29,8d5524,614335,d08b5b&hairColor=2c1b18,4a312c,724133&radius=50"
                  alt="Amina"
                  className={styles.quoteAvatarImg}
                />
                <div>
                  <div className={styles.quoteName}>Amina W.</div>
                  <div className={styles.quoteRole}>CS Senior</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.sectionTitle}>Plays well with others.</h2>
            </motion.div>
            <div className={styles.integrationsGrid}>
              <motion.div
                className={styles.integrationItem}
                whileHover={{ scale: 1.1, color: "#E8A0A8" }}
              >
                <GitBranch size={28} /> GitHub
              </motion.div>
              <motion.div
                className={styles.integrationItem}
                whileHover={{ scale: 1.1, color: "#D4AF37" }}
              >
                <Layout size={28} /> Figma
              </motion.div>
              <motion.div
                className={styles.integrationItem}
                whileHover={{ scale: 1.1, color: "#7BC89A" }}
              >
                <Database size={28} /> Supabase
              </motion.div>
              <motion.div
                className={styles.integrationItem}
                whileHover={{ scale: 1.1, color: "#A88CE8" }}
              >
                <Terminal size={28} /> VS Code
              </motion.div>
              <motion.div
                className={styles.integrationItem}
                whileHover={{ scale: 1.1, color: "#FFFFFF" }}
              >
                <Globe size={28} /> Vercel
              </motion.div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <motion.div
              className={styles.sectionHeader}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className={styles.sectionTitle}>Questions?</h2>
            </motion.div>
            <div className={styles.faqList}>
              {FAQS.map((faq, i) => (
                <motion.div
                  key={i}
                  className={styles.faqItem}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  whileHover={{ borderColor: "rgba(232, 160, 168, 0.5)" }}
                >
                  <div className={styles.faqQuestion}>
                    <span>{faq.q}</span>
                    {openFaq === i ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                    className={styles.faqAnswer}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ paddingTop: "1rem" }}>{faq.a}</div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.megaCtaSection}>
          <div className={styles.megaCtaGlow} />
          <motion.div
            className={styles.megaCtaContent}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={styles.megaCtaTitle}>Ready to begin?</h2>
            <p className={styles.megaCtaSub}>
              Join the engineers who treat their tools like infrastructure.
            </p>
            <Link href="/register" className={styles.ctaButton}>
              <span>Join Code Campus</span>
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrandCol}>
              <LogoLockup size={28} />
              <p className={styles.footerBrandDesc}>
                The high-performance workspace for modern engineering students.
              </p>
            </div>
            <div className={styles.footerLinksCol}>
              <h4 className={styles.footerColTitle}>Product</h4>
              <Link href="/login" className={styles.footerLink}>
                Sign in
              </Link>
              <Link href="/register" className={styles.footerLink}>
                Create account
              </Link>
            </div>
            <div className={styles.footerLinksCol}>
              <h4 className={styles.footerColTitle}>Legal</h4>
              <Link href="/privacy" className={styles.footerLink}>
                Privacy Policy
              </Link>
              <Link href="/terms" className={styles.footerLink}>
                Terms of Service
              </Link>
            </div>
            <div className={styles.footerLinksCol}>
              <h4 className={styles.footerColTitle}>Social</h4>
              <a
                href="https://github.com/najmahares"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLinkSocial}
              >
                <GitBranch size={16} /> GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/najma-hares/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLinkSocial}
              >
                <Globe size={16} /> LinkedIn
              </a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span className={styles.footerCopyright}>
              © {new Date().getFullYear()} Code Campus. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
