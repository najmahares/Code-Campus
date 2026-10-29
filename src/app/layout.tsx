import type { Metadata } from "next";
import { Inter, Playfair_Display, Quicksand } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import MobileNav from "@/components/MobileNav";
import ToastProvider from "@/components/ToastProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand" });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Code Campus",
  description: "Your AI-powered sanctuary for software engineering.",
};

const themeScript = `
  (function() {
    try {
      const storedTheme = localStorage.getItem('code-campus-theme');
      const hasStoredTheme = storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'system';
      const preferredTheme = hasStoredTheme ? storedTheme : 'system';
      const media = window.matchMedia('(prefers-color-scheme: light)');
      const resolvedTheme = preferredTheme === 'system' ? (media.matches ? 'light' : 'dark') : preferredTheme;
      document.documentElement.setAttribute('data-theme', resolvedTheme);
    } catch (error) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${quicksand.variable}`}>
        <ToastProvider>
          {children}
          <Analytics />
          <MobileNav />
        </ToastProvider>
      </body>
    </html>
  );
}
