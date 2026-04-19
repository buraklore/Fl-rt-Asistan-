"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { DailyHookDto } from "@/lib/schemas";
import { Button } from "@/components/app/ui";
import Link from "next/link";

/**
 * Dashboard's hero card showing today's "hook" — a proactive suggestion
 * for something the user can send to one of their targets.
 *
 * Two optimization layers:
 *  1. If the user has NO targets, we don't even call the API — we render
 *     the empty state immediately with zero network roundtrip.
 *  2. When we DO call the API, the first hit of the day triggers an AI
 *     generation (3-5sec). We show an engaging "preparing" state instead
 *     of a dead skeleton so the wait doesn't feel like a hang.
 */
export function DashboardHookCard({ hasTargets }: { hasTargets: boolean }) {
  const [hook, setHook] = useState<DailyHookDto | null>(null);
  const [loading, setLoading] = useState(hasTargets); // only load if targets exist
  const [loadingPhase, setLoadingPhase] = useState<"reading" | "thinking" | "writing">(
    "reading",
  );
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Fast path — no targets, nothing to fetch
    if (!hasTargets) {
      setLoading(false);
      return;
    }

    // Progressive loading messages so 3-5sec wait feels purposeful
    const t1 = setTimeout(() => setLoadingPhase("thinking"), 800);
    const t2 = setTimeout(() => setLoadingPhase("writing"), 2400);

    (async () => {
      try {
        const res = await api.getTodayHook();
        setHook(res.data);
      } catch (err) {
        if (!(err instanceof ApiError)) console.error(err);
      } finally {
        setLoading(false);
        clearTimeout(t1);
        clearTimeout(t2);
      }
    })();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [hasTargets]);

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

  // No targets → clear, zero-delay empty state
  if (!hasTargets) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-500/5 via-ink-900/60 to-ink-900/60 p-8">
        <div className="pointer-events-none absolute -right-8 -top-8 font-display text-[10rem] italic leading-none text-brand-500/5">
          ✻
        </div>
        <div className="relative">
          <p className="mb-3 font-display text-lg italic text-brand-400">
            günlük dürtme —
          </p>
          <h3 className="mb-3 font-display text-2xl text-ink-100">
            Önce bir hedef oluştur.
          </h3>
          <p className="mb-6 max-w-md text-sm leading-relaxed text-ink-300">
            Hedef ekledikten sonra her sabah sana özel bir açılış mesajı
            önerisi burada görünür.
          </p>
          <Link
            href="/targets/new"
            className="inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Hedef oluştur →
          </Link>
        </div>
      </div>
    );
  }

  // Loading — engaging progressive state
  if (loading) {
    const phaseText = {
      reading: "profilini okuyor…",
      thinking: "sana uygun bir açılış düşünüyor…",
      writing: "yazıyor…",
    }[loadingPhase];

    return (
      <div
        className="relative overflow-hidden rounded-[20px] border border-brand-500/20 px-10 pb-8 pt-[34px] backdrop-blur-[8px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(225,29,72,0.12) 0%, rgba(225,29,72,0.04) 42%, rgba(17,17,24,0.5) 100%)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute select-none font-display italic leading-none text-brand-400"
          style={{
            top: -34,
            right: 28,
            fontSize: 280,
            opacity: 0.1,
          }}
        >
          &rdquo;
        </span>
        <div className="relative">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-400">
            günün hook&apos;u
          </p>
          <p className="mb-2 font-display text-[32px] italic leading-snug text-ink-300">
            hazırlanıyor
            <span className="inline-block animate-pulse">…</span>
          </p>
          <p className="text-sm italic text-ink-500">{phaseText}</p>
        </div>
      </div>
    );
  }

  if (!hook) {
    return (
      <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-8">
        <p className="mb-3 font-display italic text-lg text-brand-400">
          günlük dürtme —
        </p>
        <p className="text-sm text-ink-300">
          Bugün için hazırlanmadı. Daha sonra tekrar dene.
        </p>
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
    <div
      className="relative overflow-hidden rounded-[20px] border border-brand-500/35 px-10 pb-8 pt-[34px] backdrop-blur-[8px]"
      style={{
        background:
          "linear-gradient(135deg, rgba(225,29,72,0.24) 0%, rgba(225,29,72,0.08) 42%, rgba(17,17,24,0.5) 100%)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute select-none font-display italic leading-none text-brand-400"
        style={{
          top: -34,
          right: 28,
          fontSize: 280,
          opacity: 0.1,
        }}
      >
        &rdquo;
      </span>

      <button
        onClick={dismiss}
        aria-label="Kapat"
        className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-ink-700 bg-ink-900/70 text-[12px] text-ink-300 transition hover:border-ink-600 hover:text-ink-100"
      >
        ✕
      </button>

      <div className="relative mb-5 flex flex-wrap items-center gap-[10px] pr-[60px]">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-400">
          GÜNÜN HOOK&apos;U
        </span>
        <span className="text-[10px] text-ink-600">·</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-400">
          {CATEGORY_LABELS[hook.category] ?? hook.category}
        </span>
        {hook.targetName && (
          <>
            <span className="text-[10px] text-ink-600">·</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-400">
              {hook.targetName} için
            </span>
          </>
        )}
      </div>

      <p
        className="relative mb-7 max-w-[760px] font-display italic leading-[1.15] tracking-tight text-ink-100"
        style={{ fontSize: 42 }}
      >
        {hook.text}
      </p>

      <div className="relative flex flex-wrap items-center gap-[18px]">
        <button
          onClick={copy}
          className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600"
        >
          {copied ? "Kopyalandı ✓" : "Kopyala"}
        </button>
        <Link
          href="/generate"
          className="text-[13px] text-ink-200 hover:text-ink-100"
        >
          veya üret →
        </Link>
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
