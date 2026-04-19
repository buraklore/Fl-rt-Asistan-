"use client";

import Link from "next/link";

const TABS = [
  { id: "profil", label: "Profilim" },
  { id: "hesap", label: "Hesap" },
  { id: "bildirim", label: "Bildirimler" },
  { id: "premium", label: "Premium" },
];

export function SettingsTabs({ current }: { current: string }) {
  return (
    <div
      className="flex border-b border-ink-800"
      style={{ gap: 4, marginBottom: 32 }}
    >
      {TABS.map((t) => {
        const active = current === t.id;
        const href = t.id === "profil" ? "/settings" : `/settings?tab=${t.id}`;
        return (
          <Link
            key={t.id}
            href={href}
            className={`text-[14px] transition ${
              active ? "text-ink-100" : "text-ink-400 hover:text-ink-200"
            }`}
            style={{
              padding: "10px 16px",
              borderBottom: `2px solid ${active ? "#E11D48" : "transparent"}`,
              marginBottom: -1,
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
