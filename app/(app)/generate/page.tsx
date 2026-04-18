"use client";

import { useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Reply, Tone } from "@/lib/schemas";

const ALL_TONES: Tone[] = ["cool", "flirty", "confident"];
const TONE_LABELS: Record<Tone, string> = {
  cool: "Cool",
  flirty: "Flirty",
  confident: "Confident",
};
const TONE_DESCRIPTIONS: Record<Tone, string> = {
  cool: "dengeli, hafif nükteli",
  flirty: "oyuncu, hafif tahrik",
  confident: "direkt, özür dilemez",
};

export default function GeneratePage() {
  const [incoming, setIncoming] = useState("");
  const [context, setContext] = useState("");
  const [tones, setTones] = useState<Tone[]>(ALL_TONES);
  const [replies, setReplies] = useState<Reply[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTone = (t: Tone) => {
    setTones((curr) =>
      curr.includes(t) ? curr.filter((x) => x !== t) : [...curr, t],
    );
  };

  const submit = async () => {
    if (!incoming.trim() || tones.length === 0) return;
    setLoading(true);
    setError(null);
    setReplies(null);
    try {
      const res = await api.generateMessage({
        incomingMessage: incoming,
        context: context || undefined,
        tones,
      });
      setReplies(res.data.replies);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.problem.detail ?? err.problem.title);
      } else {
        setError("Bir şeyler ters gitti. Tekrar dene.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Minimal nav — focus stays on the tool */}
      <nav className="border-b border-ink-800/50">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-display tracking-tight transition hover:opacity-80"
          >
            Rizz<span className="italic text-brand-500">AI</span>
          </Link>
          <Link
            href="/sign-up"
            className="text-sm text-ink-300 transition hover:text-ink-100"
          >
            Hesap oluştur →
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
        {/* Header */}
        <p className="mb-3 font-display italic text-xl text-brand-400">
          önce mesajı göster —
        </p>
        <h1 className="mb-3 font-display text-display-sm leading-[0.95] tracking-tightest sm:text-5xl">
          Mesaj Üretici
        </h1>
        <p className="mb-12 text-lg text-ink-200">
          Gelen mesajı yapıştır. Üç tonda cevap al.
        </p>

        <div className="space-y-6">
          <Field label="Gelen mesaj">
            <textarea
              value={incoming}
              onChange={(e) => setIncoming(e.target.value)}
              placeholder="örn: lol rastgele bir soru, niye soruyorsun?"
              rows={3}
              className="w-full resize-none rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-ink-100 placeholder-ink-500 outline-none transition focus:border-brand-500"
            />
          </Field>

          <Field label="Bağlam (opsiyonel)">
            <input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="örn: 2 gün önce hinge'de eşleştik, geç cevap veriyor"
              className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-ink-100 placeholder-ink-500 outline-none transition focus:border-brand-500"
            />
          </Field>

          <Field label="Tonlar">
            <div className="grid grid-cols-3 gap-2">
              {ALL_TONES.map((t) => {
                const active = tones.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTone(t)}
                    className={`rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-brand-500 bg-brand-500/10"
                        : "border-ink-700 bg-ink-900/40 hover:border-ink-600"
                    }`}
                  >
                    <div
                      className={`mb-1 font-display text-lg ${
                        active ? "text-brand-400" : "text-ink-100"
                      }`}
                    >
                      {TONE_LABELS[t]}
                    </div>
                    <div className="text-[11px] text-ink-400">
                      {TONE_DESCRIPTIONS[t]}
                    </div>
                  </button>
                );
              })}
            </div>
          </Field>

          <button
            onClick={submit}
            disabled={loading || !incoming.trim() || tones.length === 0}
            className="w-full rounded-xl bg-brand-500 px-6 py-4 font-medium text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "düşünüyor…" : "Cevapları üret →"}
          </button>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {replies && (
            <div className="pt-4">
              <div className="divider mb-6" />
              <p className="mb-6 font-display italic text-brand-400">
                işte üç cevap —
              </p>
              <div className="space-y-3">
                {replies.map((r, i) => (
                  <ReplyCard key={i} reply={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-ink-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function ReplyCard({ reply }: { reply: Reply }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(reply.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group rounded-2xl border border-ink-800 bg-ink-900/40 p-5 transition hover:border-ink-700">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-lg italic text-brand-400">
          {TONE_LABELS[reply.tone]}
        </span>
        <button
          onClick={copy}
          className="rounded-full border border-ink-700 px-3 py-1 text-xs text-ink-200 transition hover:border-brand-500 hover:text-brand-400"
        >
          {copied ? "Kopyalandı ✓" : "Kopyala"}
        </button>
      </div>
      <p className="mb-4 text-base leading-relaxed text-ink-100">
        {reply.text}
      </p>
      <p className="text-xs italic text-ink-400">→ {reply.rationale}</p>
    </div>
  );
}
