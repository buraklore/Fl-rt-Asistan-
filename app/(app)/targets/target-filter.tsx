"use client";

import Link from "next/link";

const FILTERS = [
  { k: "all", l: "Tümü" },
  { k: "crush", l: "Crush" },
  { k: "partner", l: "Partner" },
  { k: "ex", l: "Ex" },
  { k: "match", l: "Match" },
  { k: "friend", l: "Arkadaş" },
];

export function TargetsFilter({ current }: { current: string }) {
  return (
    <>
      {FILTERS.map((f) => {
        const active = current === f.k;
        const href = f.k === "all" ? "/targets" : `/targets?filter=${f.k}`;
        return (
          <Link
            key={f.k}
            href={href}
            className={`rounded-full border px-[14px] py-[5px] text-[12px] transition ${
              active
                ? "border-brand-500 bg-brand-500/12 text-brand-400"
                : "border-ink-700 bg-ink-900/40 text-ink-300 hover:border-ink-600 hover:text-ink-100"
            }`}
          >
            {f.l}
          </Link>
        );
      })}
    </>
  );
}
