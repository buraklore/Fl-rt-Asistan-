import Link from "next/link";

export function MarketingNav() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-ink-800 backdrop-blur-[14px]"
      style={{ background: "rgba(20,10,16,0.75)" }}
    >
      <nav className="flex items-center justify-between px-6 py-[18px] sm:px-12">
        <Link
          href="/"
          className="font-display text-[22px] tracking-tight transition hover:opacity-80"
        >
          Flört<span className="italic text-brand-500"> asistanı</span>
        </Link>

        <div className="flex items-center gap-[10px]">
          <Link
            href="/sign-in"
            className="rounded-full px-4 py-2 text-sm text-ink-200 transition hover:bg-ink-900 hover:text-ink-100"
          >
            Giriş
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Başla →
          </Link>
        </div>
      </nav>
    </header>
  );
}
