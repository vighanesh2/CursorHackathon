import { Bodoni_Moda } from "next/font/google";
import type { ReactNode } from "react";
import "./slop.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export default function TestLayout({ children }: { children: ReactNode }) {
  return <div className={`${bodoni.className} hearth`}>{children}</div>;
}
