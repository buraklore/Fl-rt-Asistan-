"use client";

import { useState } from "react";

export type Confidence = {
  overall: number;
  dataGaps: string[];
  explanation: string;
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const [open, setOpen] = useState(false);

  const score = confidence.overall;
  const tier: "high" | "med" | "low" =
    score >= 0.8 ? "high" : score >= 0.5 ? "med" : "low";

  const conf = {
    high: {
      color: "#34d399",
      border: "rgba(16,185,129,0.3)",
      bg: "rgba(16,185,129,0.05)",
      label: "Yüksek güven",
    },
    med: {
      color: "#fbbf24",
      border: "rgba(245,158,11,0.3)",
      bg: "rgba(245,158,11,0.05)",
      label: "Orta güven",
    },
    low: {
      color: "#f87171",
      border: "rgba(239,68,68,0.3)",
      bg: "rgba(239,68,68,0.05)",
      label: "Düşük güven",
    },
  }[tier];

  return (
    <div
      className="rounded-[14px] border"
      style={{
        borderColor: conf.border,
        background: conf.bg,
        padding: 14,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-inherit"
        style={{ gap: 12 }}
      >
        <div className="flex items-center" style={{ gap: 8 }}>
          <span
            className="rounded-full"
            style={{
              width: 8,
              height: 8,
              background: conf.color,
            }}
          />
          <span
            className="font-semibold uppercase"
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              color: conf.color,
            }}
          >
            {conf.label}
          </span>
          <span className="text-ink-400" style={{ fontSize: 12 }}>
            %{Math.round(score * 100)}
          </span>
        </div>
        <span className="text-ink-500" style={{ fontSize: 11 }}>
          {open ? "gizle ▲" : "detay ▼"}
        </span>
      </button>

      {open && (
        <div
          className="border-t border-ink-800"
          style={{ marginTop: 12, paddingTop: 12 }}
        >
          <p
            className="m-0 text-ink-300"
            style={{ fontSize: 13, lineHeight: 1.55 }}
          >
            {confidence.explanation}
          </p>
          {confidence.dataGaps.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <p
                className="m-0 font-semibold uppercase text-ink-400"
                style={{
                  marginBottom: 6,
                  fontSize: 10,
                  letterSpacing: "0.25em",
                }}
              >
                eksik veriler —
              </p>
              <ul className="m-0 list-none p-0">
                {confidence.dataGaps.map((g, i) => (
                  <li
                    key={i}
                    className="text-ink-200"
                    style={{ fontSize: 12, marginBottom: 4 }}
                  >
                    <span className="text-brand-500" style={{ marginRight: 8 }}>
                      ◆
                    </span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
