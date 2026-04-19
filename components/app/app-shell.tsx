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

// CD Sidebar.jsx:3-17
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
      { href: "/chat", label: "Koç", symbol: "◊" },
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
          Flört<span className="italic text-brand-500"> asistanı</span>
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg border border-ink-700 p-2"
          aria-label="Menü"
        >
          <span className="mb-1 block h-0.5 w-5 bg-ink-100" />
          <span className="mb-1 block h-0.5 w-5 bg-ink-100" />
          <span className="block h-0.5 w-5 bg-ink-100" />
        </button>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar — CD:width 264, border-right, bg-ink-950, flex-col, flex-shrink-0 */}
        <aside
          className={`${
            mobileOpen ? "fixed inset-0 z-40 flex" : "hidden"
          } shrink-0 flex-col border-r border-ink-800 bg-ink-950 md:sticky md:top-0 md:flex md:h-screen`}
          style={{ width: 264 }}
        >
          {/* Logo block — CD: padding 24px 24px 20px, fontSize 22, letterSpacing -0.01em */}
          <div
            className="flex items-center justify-between"
            style={{ padding: "24px 24px 20px" }}
          >
            <Link
              href="/dashboard"
              className="font-display text-ink-100"
              style={{ fontSize: 22, letterSpacing: "-0.01em" }}
              onClick={() => setMobileOpen(false)}
            >
              Flört<span className="italic text-brand-500"> asistanı</span>
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

          {/* Nav — CD: padding 0 12px 16px, flex:1 */}
          <nav
            className="flex-1 overflow-y-auto"
            style={{ padding: "0 12px 16px" }}
          >
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} style={{ marginBottom: 22 }}>
                {/* Section label — CD: fontSize 10, margin 0 0 6px 12px, letterSpacing 0.25em */}
                <p
                  className="font-semibold uppercase text-ink-500"
                  style={{
                    margin: "0 0 6px 12px",
                    fontSize: 10,
                    letterSpacing: "0.25em",
                  }}
                >
                  {section.label}
                </p>
                <ul className="m-0 list-none p-0">
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
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

// CD NavItem — padding 8px 12px, marginBottom 2, borderRadius 10, fontSize 14, symbol fontSize 16
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
        className={`group flex w-full cursor-pointer items-center text-left transition-all duration-[140ms] ${
          active
            ? "bg-ink-900 text-ink-100"
            : "text-ink-300 hover:bg-ink-900/50 hover:text-ink-100"
        }`}
        style={{
          padding: "8px 12px",
          marginBottom: 2,
          borderRadius: 10,
          gap: 12,
          fontSize: 14,
        }}
      >
        <span
          className={`${
            active
              ? "text-brand-500"
              : "text-ink-500 group-hover:text-ink-300"
          }`}
          style={{ fontSize: 16 }}
        >
          {symbol}
        </span>
        <span>{label}</span>
      </Link>
    </li>
  );
}

// CD UserBlock — borderTop ink-800, padding 12
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
    <div className="relative border-t border-ink-800" style={{ padding: 12 }}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center text-left transition hover:bg-ink-900/50"
        style={{
          padding: "8px 8px",
          borderRadius: 10,
          gap: 12,
        }}
      >
        {/* Avatar — CD: 36x36, rounded-full, bg rgba(225,29,72,0.12), color brand-400, fontSize 13, fontWeight 600 */}
        <div
          className="flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-brand-400"
          style={{
            width: 36,
            height: 36,
            background: "rgba(225,29,72,0.12)",
            fontSize: 13,
          }}
        >
          {initials || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="m-0 truncate text-ink-100"
            style={{ fontSize: 14 }}
          >
            {user.displayName ?? user.email.split("@")[0]}
          </p>
          <p
            className="m-0 uppercase text-ink-500"
            style={{ fontSize: 10, letterSpacing: "0.25em" }}
          >
            {user.plan === "premium" ? "premium" : "ücretsiz"}
          </p>
        </div>
        <span className="text-ink-500" style={{ fontSize: 18 }}>
          ⋯
        </span>
      </button>

      {menuOpen && (
        <div
          className="absolute bottom-full mb-1 rounded-[14px] border border-ink-700 bg-ink-900 py-1 shadow-2xl shadow-black/50"
          style={{ left: 12, right: 12 }}
        >
          <Link
            href="/settings"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-ink-200 hover:bg-ink-800"
            style={{ fontSize: 13 }}
          >
            Ayarlar
          </Link>
          {user.plan === "free" && (
            <Link
              href="/pricing"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-brand-400 hover:bg-ink-800"
              style={{ fontSize: 13 }}
            >
              Premium&apos;a yükselt
            </Link>
          )}
          <button
            onClick={logout}
            className="block w-full px-3 py-2 text-left text-red-300 hover:bg-ink-800"
            style={{ fontSize: 13 }}
          >
            Çıkış yap
          </button>
        </div>
      )}
    </div>
  );
}
