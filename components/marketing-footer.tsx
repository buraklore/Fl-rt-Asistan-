import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-ink-800 px-6 py-10 text-[13px] text-ink-500 sm:px-12">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-6">
        <div>
          <div className="font-display text-[18px] text-ink-200">
            Flört<span className="italic text-brand-500"> asistanı</span>
          </div>
          <p className="mt-2">© 2026 · sade bir İstanbul stüdyosu</p>
        </div>
        <div className="flex flex-wrap gap-7">
          <Link href="/legal/privacy" className="text-ink-400 no-underline hover:text-ink-200">
            KVKK
          </Link>
          <Link href="/legal/terms" className="text-ink-400 no-underline hover:text-ink-200">
            Koşullar
          </Link>
          <Link href="/legal/privacy" className="text-ink-400 no-underline hover:text-ink-200">
            Gizlilik
          </Link>
          <a
            href="mailto:merhaba@flortasistani.com"
            className="text-ink-400 no-underline hover:text-ink-200"
          >
            merhaba@flortasistani.com
          </a>
        </div>
      </div>
    </footer>
  );
}
