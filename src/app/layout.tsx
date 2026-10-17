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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
