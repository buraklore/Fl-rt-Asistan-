"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

type Props = {
  targetId: string;
  hasScore: boolean;
  size?: "sm" | "md";
};

/**
 * Triggers POST /api/scores/[targetId] and refreshes the page.
 * Used on the target detail page and in the insights list.
 */
export function RecomputeScoreButton({
  targetId,
  hasScore,
  size = "sm",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const recompute = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await api.recomputeScore(targetId);
      router.refresh();
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.problem.detail ?? err.problem.title
          : "Skor hesaplanamadı.",
      );
    } finally {
      setLoading(false);
    }
  };

  const label = loading
    ? "hesaplanıyor..."
    : hasScore
      ? "Yeniden hesapla"
      : "Skoru hesapla";

  const sizeCls =
    size === "sm"
      ? "px-3 py-1 text-xs"
      : "px-4 py-2 text-sm";

  return (
    <button
      onClick={recompute}
      disabled={loading}
      className={`${sizeCls} rounded-full border border-brand-500/40 font-medium text-brand-400 transition hover:bg-brand-500/10 disabled:opacity-50`}
    >
      {label}
    </button>
  );
}
