"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import {
  PageHeader,
  EmptyState,
  SectionCard,
  ErrorBanner,
} from "@/components/app/ui";

type Conflict = {
  id: string;
  target_id: string | null;
  who_escalated: string;
  root_cause: string;
  severity: number;
  created_at: string;
  target: { id: string; name: string | null } | null;
};

const ESCALATED_LABELS: Record<string, string> = {
  user: "Sen",
  target: "O",
  both: "İkiniz de",
  neither: "Hiçbiri",
};

export default function ConflictsHistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api.listConflicts();
      setItems(res.data ?? []);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.problem.detail ?? err.problem.title ?? "Yüklenemedi."
          : "Yüklenemedi.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirmingId !== id) {
      setConfirmingId(id);
      setTimeout(() => {
        setConfirmingId((current) => (current === id ? null : current));
      }, 3000);
      return;
    }

    setDeleting(id);
    try {
      await api.deleteConflict(id);
      setItems((list) => list.filter((c) => c.id !== id));
      setConfirmingId(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.problem.detail ?? err.problem.title ?? "Silinemedi."
          : "Silinemedi.",
      );
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[900px] px-10 py-12 pb-20">
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-2xl bg-ink-800" />
          <div className="h-24 animate-pulse rounded-2xl bg-ink-800" />
          <div className="h-24 animate-pulse rounded-2xl bg-ink-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-10 py-12 pb-20">
      <Link
        href="/conflicts"
        className="text-[13px] text-ink-400 hover:text-ink-200"
      >
        ← yeni analiz
      </Link>
      <div className="mt-3">
        <PageHeader
          kicker="kayıtlar —"
          title="Çatışma Kayıtların."
          description="Tüm geçmiş analizlerin burada. Her biri onarım mesajını ve kök sebep özetini saklar."
        />
      </div>

      {error && <ErrorBanner message={error} />}

      {items.length === 0 ? (
        <EmptyState
          title="Henüz çatışma analizi yok"
          description="Bir tartışma yaşadığında transkripti yapıştır, beraber çözümü çıkaralım."
        />
      ) : (
        <div className="grid gap-3">
          {items.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-ink-800 bg-ink-900/40 p-[22px]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-[10px] flex flex-wrap items-center gap-3">
                    <p
                      className="font-display text-ink-100"
                      style={{ fontSize: 22 }}
                    >
                      {c.target?.name ?? "Genel"}
                    </p>
                    <span className="text-[12px] text-ink-500">
                      · {formatDate(c.created_at)}
                    </span>
                    <span
                      className="rounded-full px-[10px] py-[3px] text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-300"
                      style={{
                        border: "1px solid rgba(225,29,72,0.3)",
                        background: "rgba(225,29,72,0.1)",
                      }}
                    >
                      ciddiyet {c.severity}/5
                    </span>
                  </div>
                  <p className="text-[14px] leading-[1.55] text-ink-300">
                    {c.root_cause}
                  </p>
                </div>
                {confirmingId === c.id ? (
                  <div className="flex shrink-0 gap-[6px]">
                    <button
                      onClick={() => setConfirmingId(null)}
                      className="rounded-full border border-ink-700 px-3 py-[6px] text-[12px] text-ink-300"
                    >
                      iptal
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deleting === c.id}
                      className="rounded-full px-3 py-[6px] text-[12px] text-white"
                      style={{ background: "#EF4444" }}
                    >
                      {deleting === c.id ? "…" : "sil"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="shrink-0 rounded-[8px] border border-ink-800 px-[10px] py-[6px] text-[12px] text-ink-400 transition hover:border-ink-700 hover:text-ink-200"
                  >
                    sil
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
