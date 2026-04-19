"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { DailyHookDto } from "@/lib/schemas";
import { Button } from "@/components/app/ui";
import Link from "next/link";

export function DashboardHookCard() {
  const [hook, setHook] = useState<DailyHookDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getTodayHook();
        setHook(res.data);
      } catch (err) {
        if (!(err instanceof ApiError)) console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const copy = async () => {
    if (!hook) return;
    await navigator.clipboard.writeText(hook.text);
    setCopied(true);
    api.ackHook(hook.id, "copied").catch(() => undefined);
    setTimeout(() => setCopied(false), 1500);
  };

  const dismiss = async () => {
    if (!hook) return;
    api.ackHook(hook.id, "dismissed").catch(() => undefined);
    setDismissed(true);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-8">
        <div className="h-4 w-24 animate-pulse rounded bg-ink-800" />
        <div className="mt-4 h-8 w-3/4 animate-pulse rounded bg-ink-800" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-ink-800" />
      </div>
    );
  }

  if (!hook) {
    return (
      <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-8">
        <p className="mb-3 font-display italic text-lg text-brand-400">
          günlük dürtme —
        </p>
        <h3 className="mb-3 font-display text-2xl text-ink-100">
          Önce bir hedef oluştur.
        </h3>
        <p className="mb-6 text-sm text-ink-300">
          Hedef ekledikten sonra her sabah sana özel bir açılış mesajı önerisi
          burada görünür.
        </p>
        <Link
          href="/targets/new"
          className="inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Hedef oluştur →
        </Link>
      </div>
    );
  }

  if (dismissed) {
    return (
      <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-8">
        <p className="mb-3 font-display italic text-lg text-ink-400">
          kapatıldı —
        </p>
        <p className="text-sm text-ink-300">
          Yarın yeni bir hook hazırlayacağız.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-ink-900/60 to-ink-900/60 p-8">
      <button
        onClick={dismiss}
        aria-label="Kapat"
        className="absolute right-4 top-4 z-10 text-ink-500 transition hover:text-ink-200"
      >
        ✕
      </button>
      <div className="pointer-events-none absolute -right-8 -top-8 font-display text-[10rem] italic leading-none text-brand-500/10">
        &ldquo;
      </div>
      <div className="relative">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-brand-400">
          günün hook&apos;u · {CATEGORY_LABELS[hook.category] ?? hook.category}
          {hook.targetName && (
            <>
              <span className="mx-2 text-ink-500">·</span>
              <span className="text-ink-300 normal-case tracking-normal">
                {hook.targetName} için
              </span>
            </>
          )}
        </p>
        <p className="mb-6 font-display text-2xl leading-snug text-ink-100 sm:text-3xl">
          {hook.text}
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={copy} size="sm" variant="primary">
            {copied ? "Kopyalandı ✓" : "Kopyala"}
          </Button>
          <Link
            href="/generate"
            className="text-sm text-ink-400 hover:text-ink-200"
          >
            veya üret →
          </Link>
        </div>
      </div>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  reignite: "yeniden yak",
  curiosity: "merak",
  vulnerability: "kırılganlık",
  playful: "oyuncu",
};
