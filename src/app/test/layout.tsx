import { Red_Hat_Display } from "next/font/google";
import type { ReactNode } from "react";
import "./slop.css";

const redHat = Red_Hat_Display({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export default function TestLayout({ children }: { children: ReactNode }) {
  return <div className={`${redHat.className} tide`}>{children}</div>;
}
