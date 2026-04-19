"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/app/ui";

type Target = { id: string; name: string | null; relation: string };

export function NewChatButton({ targets }: { targets: Target[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const start = async (targetId: string) => {
    setLoading(targetId);
    try {
      const res = await api.createChatSession({ targetId });
      router.push(`/chat/${res.data.id}`);
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.problem.detail ?? err.problem.title
          : "Sohbet başlatılamadı.",
      );
      setLoading(null);
    }
  };

  if (!open) {
    return <Button onClick={() => setOpen(true)}>+ Yeni sohbet</Button>;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(420px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-xl">Kim için koç seansı?</h3>
          <button
            onClick={() => setOpen(false)}
            className="text-ink-400 hover:text-ink-100"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
        <div className="space-y-1">
          {targets.map((t) => (
            <button
              key={t.id}
              onClick={() => start(t.id)}
              disabled={loading !== null}
              className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition hover:bg-ink-800 disabled:opacity-50"
            >
              <div>
                <p className="font-medium text-ink-100">
                  {t.name ?? "İsimsiz"}
                </p>
                <p className="text-xs text-ink-400">{t.relation}</p>
              </div>
              {loading === t.id ? (
                <span className="text-xs text-brand-400">başlatılıyor...</span>
              ) : (
                <span className="text-ink-500">→</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
