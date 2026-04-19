"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Kopyala" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={copy}
      className={`shrink-0 rounded-full border px-[14px] py-[5px] text-[12px] transition ${
        copied
          ? "border-brand-500 text-brand-400"
          : "border-ink-700 text-ink-200 hover:border-ink-600"
      }`}
    >
      {copied ? "Kopyalandı ✓" : label}
    </button>
  );
}
