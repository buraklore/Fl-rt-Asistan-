"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/app/ui";

export function TargetActions({
  targetId,
  hasAnalysis,
}: {
  targetId: string;
  hasAnalysis: boolean;
}) {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const analyze = async () => {
    setAnalyzing(true);
    try {
      await api.analyzeTarget(targetId);
      router.refresh();
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.problem.detail ?? err.problem.title
          : "Analiz başarısız oldu.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      // DELETE /api/profiles/[id]
      await fetch(`/api/profiles/${targetId}`, {
        method: "DELETE",
        credentials: "include",
      });
      router.push("/targets");
      router.refresh();
    } catch {
      alert("Silinemedi, tekrar dene.");
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={hasAnalysis ? "secondary" : "primary"}
        size="sm"
        onClick={analyze}
        disabled={analyzing}
      >
        {analyzing
          ? "analiz ediliyor..."
          : hasAnalysis
            ? "Yeniden analiz et"
            : "Analiz et"}
      </Button>
      {confirm ? (
        <>
          <Button variant="danger" size="sm" onClick={remove} disabled={deleting}>
            {deleting ? "siliniyor..." : "Sildiğime eminim"}
          </Button>
          <button
            onClick={() => setConfirm(false)}
            className="text-xs text-ink-400 hover:text-ink-200"
          >
            vazgeç
          </button>
        </>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setConfirm(true)}>
          Sil
        </Button>
      )}
    </div>
  );
}
