import Link from "next/link";

const NAV_ITEMS = [
  { href: "/how-it-works", label: "Nasıl çalışır" },
  { href: "/pricing", label: "Ücretlendirme" },
  { href: "/blog", label: "Blog" },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-800/50 bg-ink-950/70 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xl font-display tracking-tight transition hover:opacity-80"
        >
          Flört<span className="italic text-brand-500"> asistanı</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink-300 transition hover:text-ink-100"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden text-sm text-ink-300 transition hover:text-ink-100 sm:inline-block"
          >
            Giriş yap
          </Link>
          <Link
            href="/generate"
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Ücretsiz dene
          </Link>
        </div>
      </nav>
    </header>
  );
}
