"use client";

import { useState } from "react";

export type CoachingAdviceData = {
  doNow: Array<{ action: string; why: string }>;
  avoid: Array<{ what: string; why: string }>;
  growthAreas: string[];
  redFlags: Array<{ signal: string; meaning: string }>;
};

/**
 * Personalized coaching advice panel shown on target detail pages.
 * Data is produced by the analyzer prompt and stored in target_profiles.coaching_advice.
 *
 * Four sections, each a collapsible block:
 *  🎯 Şimdi yap    — 2-4 concrete actions
 *  ⚠️ Kaçın        — 2-4 don't-do items
 *  🌱 Gelişim      — 2-4 long-term skills
 *  🚩 Kırmızı bayrak — 0-4 concerning signals (optional)
 */
export function CoachingAdvicePanel({
  advice,
}: {
  advice: CoachingAdviceData;
}) {
  return (
    <div className="space-y-4">
      {advice.doNow && advice.doNow.length > 0 && (
        <Section
          icon="🎯"
          title="Şimdi ne yap"
          accent="emerald"
          count={advice.doNow.length}
        >
          <ul className="space-y-4">
            {advice.doNow.map((item, i) => (
              <li key={i} className="border-l-2 border-emerald-500/40 pl-4">
                <p className="mb-1 text-sm leading-relaxed text-ink-100">
                  {item.action}
                </p>
                <p className="text-xs italic leading-relaxed text-ink-400">
                  {item.why}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {advice.avoid && advice.avoid.length > 0 && (
        <Section
          icon="⚠️"
          title="Kaçın"
          accent="amber"
          count={advice.avoid.length}
        >
          <ul className="space-y-4">
            {advice.avoid.map((item, i) => (
              <li key={i} className="border-l-2 border-amber-500/40 pl-4">
                <p className="mb-1 text-sm leading-relaxed text-ink-100">
                  {item.what}
                </p>
                <p className="text-xs italic leading-relaxed text-ink-400">
                  {item.why}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {advice.growthAreas && advice.growthAreas.length > 0 && (
        <Section
          icon="🌱"
          title="Uzun vade — gelişim alanların"
          accent="brand"
          count={advice.growthAreas.length}
        >
          <ul className="space-y-3">
            {advice.growthAreas.map((item, i) => (
              <li
                key={i}
                className="text-sm leading-relaxed text-ink-100 before:mr-2 before:text-brand-500 before:content-['◆']"
              >
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {advice.redFlags && advice.redFlags.length > 0 && (
        <Section
          icon="🚩"
          title="Kırmızı bayraklar"
          accent="red"
          count={advice.redFlags.length}
        >
          <ul className="space-y-4">
            {advice.redFlags.map((item, i) => (
              <li key={i} className="border-l-2 border-red-500/60 pl-4">
                <p className="mb-1 text-sm font-medium leading-relaxed text-red-300">
                  {item.signal}
                </p>
                <p className="text-xs italic leading-relaxed text-ink-400">
                  {item.meaning}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  accent,
  count,
  children,
}: {
  icon: string;
  title: string;
  accent: "emerald" | "amber" | "brand" | "red";
  count: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(accent !== "red"); // red flags default closed

  const accentMap = {
    emerald: "border-emerald-500/30 bg-emerald-500/5",
    amber: "border-amber-500/30 bg-amber-500/5",
    brand: "border-brand-500/30 bg-brand-500/5",
    red: "border-red-500/40 bg-red-500/5",
  };

  return (
    <div className={`rounded-2xl border ${accentMap[accent]} p-5`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h3 className="font-display text-lg text-ink-100">{title}</h3>
          <span className="rounded-full border border-ink-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-400">
            {count}
          </span>
        </div>
        <span className="text-xs text-ink-500">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}
