import type { ReactNode } from "react";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { SiteNav } from "@/components/SiteNav";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} you-i-shell`}
    >
      <SiteNav />
      {children}
    </div>
  );
}
