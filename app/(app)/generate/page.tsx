"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Reply, Tone } from "@/lib/schemas";
import {
  PageHeader,
  SectionCard,
  Label,
  Input,
  Textarea,
  Button,
  Chip,
  ErrorBanner,
  InfoBanner,
} from "@/components/app/ui";

const ALL_TONES: { key: Tone; label: string; desc: string }[] = [
  { key: "cool", label: "Sakin", desc: "dengeli, hafif nükteli" },
  { key: "flirty", label: "Flörtöz", desc: "oyuncu, hafif tahrik" },
  { key: "confident", label: "Kendinden emin", desc: "direkt, özür dilemez" },
];

type TargetOption = { id: string; name: string | null; relation: string };

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <GenerateContent />
    </Suspense>
  );
}

function GenerateContent() {
  const searchParams = useSearchParams();
  const preselectedTargetId = searchParams.get("targetId");

  const [targets, setTargets] = useState<TargetOption[]>([]);
  const [targetId, setTargetId] = useState<string | null>(
    preselectedTargetId,
  );
  const [incoming, setIncoming] = useState("");
  const [context, setContext] = useState("");
  const [tones, setTones] = useState<Tone[]>(["cool", "flirty", "confident"]);
  const [replies, setReplies] = useState<Reply[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null);

  // Load target list for picker
  useEffect(() => {
    (async () => {
      try {
        const res = await api.listTargets();
        setTargets(res.data ?? []);
      } catch {
        // Silently ignore — target picker is optional
      }
    })();
  }, []);

  const toggleTone = (t: Tone) => {
    setTones((c) => (c.includes(t) ? c.filter((x) => x !== t) : [...c, t]));
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
        targetId: targetId || undefined,
      });
      setReplies(res.data.replies);
      if (res.meta?.usage?.remaining !== undefined) {
        setUsageRemaining(res.meta.usage.remaining ?? null);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 402) {
          setError(
            (err.problem.detail ?? "Günlük limit doldu.") +
              " Premium'a yükselerek sınırsız kullan.",
          );
        } else {
          setError(err.problem.detail ?? err.problem.title);
        }
      } else {
        setError("Bir şeyler ters gitti. Tekrar dene.");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedTarget = targets.find((t) => t.id === targetId);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-10">
      <PageHeader
        kicker="önce mesajı göster —"
        title="Mesaj Üretici"
        description="Gelen mesajı yapıştır, üç farklı tonda cevap al. Kopyala, gönder, bitti."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main form */}
        <div className="space-y-6">
          <SectionCard className="space-y-6 p-6">
            <div>
              <Label required>Gelen mesaj</Label>
              <Textarea
                value={incoming}
                onChange={(e) => setIncoming(e.target.value)}
                placeholder="örn: lol rastgele bir soru, niye soruyorsun?"
                rows={4}
                maxLength={2000}
              />
              <p className="mt-1 text-xs text-ink-500">
                {incoming.length} / 2000
              </p>
            </div>

            <div>
              <Label>Bağlam (opsiyonel)</Label>
              <Input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="örn: 2 gün önce hinge'de eşleştik, geç cevap veriyor"
                maxLength={1000}
              />
            </div>

            <div>
              <Label>Tonlar</Label>
              <div className="grid grid-cols-3 gap-2">
                {ALL_TONES.map((t) => {
                  const active = tones.includes(t.key);
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => toggleTone(t.key)}
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
                        {t.label}
                      </div>
                      <div className="text-[11px] text-ink-400">{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={submit}
              disabled={loading || !incoming.trim() || tones.length === 0}
              fullWidth
            >
              {loading ? "düşünüyor..." : "Cevapları üret →"}
            </Button>

            {error && <ErrorBanner message={error} />}
          </SectionCard>

          {/* Replies */}
          {replies && replies.length > 0 && (
            <section>
              <p className="mb-4 font-display italic text-brand-400">
                işte {replies.length} cevap —
              </p>
              <div className="space-y-3">
                {replies.map((r, i) => (
                  <ReplyCard key={i} reply={r} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar: target picker + tips */}
        <aside className="space-y-4">
          <SectionCard className="p-5">
            <Label>Kim için?</Label>
            <div className="space-y-1">
              <button
                onClick={() => setTargetId(null)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  targetId === null
                    ? "bg-brand-500/10 text-brand-400"
                    : "text-ink-300 hover:bg-ink-900"
                }`}
              >
                Belirsiz (genel)
              </button>
              {targets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTargetId(t.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    targetId === t.id
                      ? "bg-brand-500/10 text-brand-400"
                      : "text-ink-300 hover:bg-ink-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{t.name ?? "İsimsiz"}</span>
                    <span className="text-xs text-ink-500">
                      {t.relation}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {targets.length === 0 && (
              <p className="mt-2 text-xs text-ink-500">
                Hedef profili ekle, AI kişiye özel cevaplar üretsin.
              </p>
            )}
            {selectedTarget && (
              <p className="mt-3 border-t border-ink-800 pt-3 text-xs text-ink-400">
                Cevaplar{" "}
                <span className="text-brand-400">
                  {selectedTarget.name ?? "bu kişi"}
                </span>{" "}
                için kişiselleşecek.
              </p>
            )}
          </SectionCard>

          {usageRemaining !== null && (
            <InfoBanner>
              <span className="font-display text-2xl italic text-brand-400">
                {usageRemaining}
              </span>{" "}
              üretim hakkın kaldı (bugün).
            </InfoBanner>
          )}

          <SectionCard className="p-5">
            <p className="mb-3 font-display italic text-brand-400">
              daha iyi cevap için —
            </p>
            <ul className="space-y-2 text-xs leading-relaxed text-ink-300">
              <li>◆ Mesajı birebir yapıştır, özetleme</li>
              <li>◆ Bağlam alanı: nerede, kaç gündür, ilişki evresi</li>
              <li>◆ Hedef profili oluştur — kişiselleşir</li>
              <li>◆ Emoji varsa bırak, emoji yoksa ekleme</li>
            </ul>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}

function ReplyCard({ reply, index }: { reply: Reply; index: number }) {
  const [copied, setCopied] = useState(false);
  const [showRationale, setShowRationale] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(reply.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="group rounded-2xl border border-ink-800 bg-ink-900/40 p-6 transition hover:border-ink-700"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-xl italic text-brand-400">
          {TONE_LABELS[reply.tone] ?? reply.tone}
        </span>
        <button
          onClick={copy}
          className="rounded-full border border-ink-700 px-3 py-1 text-xs text-ink-200 transition hover:border-brand-500 hover:text-brand-400"
        >
          {copied ? "Kopyalandı ✓" : "Kopyala"}
        </button>
      </div>
      <p className="mb-4 text-lg leading-relaxed text-ink-100">{reply.text}</p>
      <button
        onClick={() => setShowRationale((v) => !v)}
        className="text-xs text-ink-400 hover:text-ink-200"
      >
        {showRationale ? "− açıklamayı gizle" : "+ neden bu cevap?"}
      </button>
      {showRationale && (
        <p className="mt-3 border-t border-ink-800 pt-3 text-xs italic leading-relaxed text-ink-400">
          {reply.rationale}
        </p>
      )}
    </div>
  );
}

const TONE_LABELS: Record<string, string> = {
  cool: "Sakin",
  flirty: "Flörtöz",
  confident: "Kendinden emin",
};
