"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type User = {
  id: string;
  email: string;
  displayName: string | null;
  plan: "free" | "premium";
};

const NAV_SECTIONS = [
  {
    label: "ana",
    items: [
      { href: "/dashboard", label: "Panel", symbol: "◐" },
      { href: "/targets", label: "Hedefler", symbol: "○" },
    ],
  },
  {
    label: "araçlar",
    items: [
      { href: "/generate", label: "Mesaj Üretici", symbol: "✻" },
      { href: "/chat", label: "AI Koç", symbol: "◊" },
      { href: "/conflicts", label: "Çatışma Onarımı", symbol: "⟁" },
      { href: "/insights", label: "Analiz", symbol: "◢" },
    ],
  },
  {
    label: "hesap",
    items: [{ href: "/settings", label: "Ayarlar", symbol: "⚙" }],
  },
] as const;

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-800 bg-ink-950/80 px-4 py-3 backdrop-blur-lg md:hidden">
        <Link href="/dashboard" className="font-display text-lg">
          Rizz<span className="italic text-brand-500">AI</span>
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg border border-ink-700 p-2"
          aria-label="Menü"
        >
          <span className="block h-0.5 w-5 bg-ink-100 mb-1" />
          <span className="block h-0.5 w-5 bg-ink-100 mb-1" />
          <span className="block h-0.5 w-5 bg-ink-100" />
        </button>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`${
            mobileOpen ? "fixed inset-0 z-40 flex" : "hidden"
          } w-72 shrink-0 flex-col border-r border-ink-800 bg-ink-950 md:sticky md:top-0 md:flex md:h-screen`}
        >
          <div className="flex items-center justify-between px-6 py-6">
            <Link
              href="/dashboard"
              className="font-display text-xl tracking-tight"
              onClick={() => setMobileOpen(false)}
            >
              Rizz<span className="italic text-brand-500">AI</span>
            </Link>
            {mobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="text-ink-400 md:hidden"
                aria-label="Kapat"
              >
                ✕
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-4">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="mb-6">
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-500">
                  {section.label}
                </p>
                <ul>
                  {section.items.map((item) => (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      symbol={item.symbol}
                      onClick={() => setMobileOpen(false)}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <UserBlock user={user} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  label,
  symbol,
  onClick,
}: {
  href: string;
  label: string;
  symbol: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className={`group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
          active
            ? "bg-ink-900 text-ink-100"
            : "text-ink-300 hover:bg-ink-900/50 hover:text-ink-100"
        }`}
      >
        <span
          className={`text-base ${
            active ? "text-brand-500" : "text-ink-500 group-hover:text-ink-300"
          }`}
        >
          {symbol}
        </span>
        <span>{label}</span>
      </Link>
    </li>
  );
}

function UserBlock({ user }: { user: User }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  const initials = (user.displayName ?? user.email)
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="relative border-t border-ink-800 p-3">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-ink-900/50"
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-400">
          {initials || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm text-ink-100">
            {user.displayName ?? user.email.split("@")[0]}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-ink-500">
            {user.plan === "premium" ? "premium" : "ücretsiz"}
          </p>
        </div>
        <span className="text-ink-500">⋯</span>
      </button>

      {menuOpen && (
        <div className="absolute bottom-full left-3 right-3 mb-1 rounded-xl border border-ink-700 bg-ink-900 py-1 shadow-2xl shadow-black/50">
          <Link
            href="/settings"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm text-ink-200 hover:bg-ink-800"
          >
            Ayarlar
          </Link>
          {user.plan === "free" && (
            <Link
              href="/pricing"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm text-brand-400 hover:bg-ink-800"
            >
              Premium'a yükselt
            </Link>
          )}
          <button
            onClick={logout}
            className="block w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-ink-800"
          >
            Çıkış yap
          </button>
        </div>
      )}
    </div>
  );
}
