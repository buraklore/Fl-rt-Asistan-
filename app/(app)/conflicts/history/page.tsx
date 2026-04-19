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
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-10">
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-2xl bg-ink-800" />
          <div className="h-24 animate-pulse rounded-2xl bg-ink-800" />
          <div className="h-24 animate-pulse rounded-2xl bg-ink-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-10">
      <PageHeader
        kicker="geçmiş —"
        title="Çatışma Kayıtların"
        description="Daha önce analiz ettiğin tartışmalar. Dilediğini silebilirsin."
      />

      {error && <ErrorBanner message={error} />}

      {items.length === 0 ? (
        <EmptyState
          title="Henüz çatışma analizi yok"
          description="Bir tartışma yaşadığında transkripti yapıştır, beraber çözümü çıkaralım."
        />
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <SectionCard key={c.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex flex-wrap items-baseline gap-3">
                    <span className="font-display text-lg text-ink-100">
                      {c.target?.name ?? "Genel"}
                    </span>
                    <span className="text-xs text-ink-500">
                      {formatDate(c.created_at)}
                    </span>
                    <span className="rounded-full border border-ink-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-400">
                      tırmandıran: {ESCALATED_LABELS[c.who_escalated] ?? c.who_escalated}
                    </span>
                    <span className="rounded-full border border-brand-500/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-brand-400">
                      {c.severity} / 5 ciddiyet
                    </span>
                  </div>
                  <p className="text-sm text-ink-300">{c.root_cause}</p>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deleting === c.id}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs transition ${
                    confirmingId === c.id
                      ? "bg-red-500/20 text-red-400"
                      : "border border-ink-700 text-ink-400 hover:border-red-500/40 hover:text-red-400"
                  }`}
                >
                  {deleting === c.id
                    ? "siliniyor..."
                    : confirmingId === c.id
                      ? "emin misin?"
                      : "sil"}
                </button>
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/conflicts"
          className="text-sm text-brand-400 hover:text-brand-300"
        >
          → Yeni çatışma analiz et
        </Link>
      </div>
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
