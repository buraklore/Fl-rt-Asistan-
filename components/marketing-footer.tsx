import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="mt-32 border-t border-ink-800">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="mb-4 text-2xl font-display tracking-tight">
              Rizz<span className="italic text-brand-500">AI</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-ink-300">
              Yapay zeka ilişki koçu.{" "}
              <span className="callout">Ne yazacağını bilen arkadaş.</span>
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-400">
              Ürün
            </h4>
            <ul className="space-y-2 text-sm">
              <FooterLink href="/how-it-works">Nasıl çalışır</FooterLink>
              <FooterLink href="/pricing">Ücretlendirme</FooterLink>
              <FooterLink href="/generate">Mesaj Üretici</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-400">
              Yasal
            </h4>
            <ul className="space-y-2 text-sm">
              <FooterLink href="/legal/privacy">Gizlilik</FooterLink>
              <FooterLink href="/legal/terms">Şartlar</FooterLink>
              <FooterLink href="/legal/safety">Güvenlik</FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-ink-800 pt-8 text-xs text-ink-400 sm:flex-row sm:items-center">
          <span>© 2026 RizzAI. Sınırlarımızla birlikte.</span>
          <span className="font-display italic">
            yapılırken kahvesiz içilmedi.
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-ink-300 transition hover:text-ink-100"
      >
        {children}
      </Link>
    </li>
  );
}
