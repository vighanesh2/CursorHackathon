import Link from "next/link";

export function SiteNav() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Link
        href="/"
        className="font-display text-[13px] font-semibold uppercase tracking-[0.28em] text-ink"
      >
        You-i
      </Link>
      <nav className="flex gap-5 font-display text-[12px] font-semibold uppercase tracking-[0.14em]">
        <Link href="/" className="text-mute hover:text-ink">
          Studio
        </Link>
        <Link href="/collection" className="text-mute hover:text-ink">
          Collection
        </Link>
        <Link href="/test" className="text-mute hover:text-ink">
          Test
        </Link>
      </nav>
    </header>
  );
}
