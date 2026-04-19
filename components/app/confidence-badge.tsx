"use client";

import { useState } from "react";

export type Confidence = {
  overall: number;
  dataGaps: string[];
  explanation: string;
};

/**
 * Visual honesty layer. Every AI output is tagged with a confidence badge
 * that the user can tap to see why the confidence is what it is, plus a
 * specific list of data gaps they can fill to improve future outputs.
 *
 * Color coding:
 *  - Green  (>= 0.8): analysis is well-grounded
 *  - Yellow (0.5-0.8): usable but has gaps
 *  - Red    (< 0.5):  treat with skepticism
 */
export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const [open, setOpen] = useState(false);

  const score = Math.round(confidence.overall * 100);
  const tier: "high" | "med" | "low" =
    confidence.overall >= 0.8
      ? "high"
      : confidence.overall >= 0.5
        ? "med"
        : "low";

  const styles = {
    high: {
      dot: "bg-emerald-400",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/5",
      label: "Yüksek güven",
    },
    med: {
      dot: "bg-amber-400",
      text: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/5",
      label: "Orta güven",
    },
    low: {
      dot: "bg-red-400",
      text: "text-red-400",
      border: "border-red-500/30",
      bg: "bg-red-500/5",
      label: "Düşük güven",
    },
  }[tier];

  return (
    <div className={`rounded-xl border ${styles.border} ${styles.bg} p-4`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${styles.dot}`} />
          <span className={`text-xs font-semibold uppercase tracking-wider ${styles.text}`}>
            {styles.label}
          </span>
          <span className="text-xs text-ink-400">%{score}</span>
        </div>
        <span className="text-xs text-ink-500">
          {open ? "gizle ▲" : "detay ▼"}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-ink-800 pt-3">
          <p className="text-xs leading-relaxed text-ink-300">
            {confidence.explanation}
          </p>
          {confidence.dataGaps.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
                eksik veriler —
              </p>
              <ul className="space-y-1">
                {confidence.dataGaps.map((gap, i) => (
                  <li
                    key={i}
                    className="text-xs text-ink-200 before:mr-2 before:text-brand-500 before:content-['◆']"
                  >
                    {gap}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[10px] italic text-ink-500">
                Bu alanları doldurup tekrar çalıştırırsan AI daha keskin analiz üretir.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
