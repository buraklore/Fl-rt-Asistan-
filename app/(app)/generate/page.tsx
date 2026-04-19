"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Reply, Tone } from "@/lib/schemas";
import { PageHeader } from "@/components/app/ui";
import { ConfidenceBadge } from "@/components/app/confidence-badge";

const ALL_TONES: { key: Tone; label: string; desc: string }[] = [
  { key: "cool", label: "Sakin", desc: "dengeli, hafif nükteli" },
  { key: "flirty", label: "Flörtöz", desc: "oyuncu, hafif tahrik" },
  { key: "confident", label: "Kendinden emin", desc: "direkt, özür dilemez" },
];

type TargetOption = { id: string; name: string | null; relation: string };

const RELATION_LABELS: Record<string, string> = {
  crush: "crush",
  partner: "partner",
  ex: "eski sevgili",
  match: "eşleşme",
  friend: "arkadaş",
};

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
  const [targetId, setTargetId] = useState<string | null>(preselectedTargetId);
  const [mode, setMode] = useState<"reply" | "opener">("reply");
  const [incoming, setIncoming] = useState("");
  const [situation, setSituation] = useState("");
  const [context, setContext] = useState("");
  const [tones, setTones] = useState<Tone[]>(["cool", "flirty", "confident"]);
  const [replies, setReplies] = useState<Reply[] | null>(null);
  const [openers, setOpeners] = useState<
    Array<{ tone: string; text: string; hook: string; rationale: string }> | null
  >(null);
  const [confidence, setConfidence] = useState<{
    overall: number;
    dataGaps: string[];
    explanation: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.listTargets();
        setTargets(res.data ?? []);
      } catch {
        /* ignore */
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
    setConfidence(null);
    try {
      const res = await api.generateMessage({
        incomingMessage: incoming,
        context: context || undefined,
        tones,
        targetId: targetId || undefined,
      });
      setReplies(res.data.replies);
      setConfidence(res.data.confidence ?? null);
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

  const submitOpener = async () => {
    if (!targetId || tones.length === 0) return;
    setLoading(true);
    setError(null);
    setOpeners(null);
    setConfidence(null);
    try {
      const res = await api.generateOpener({
        targetId,
        situation: situation.trim() ? situation : undefined,
        tones,
      });
      setOpeners(res.data.openers);
      setConfidence(res.data.confidence ?? null);
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

  const copy = (i: number, text: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const selectedTarget = targets.find((t) => t.id === targetId);
  const resultList: Array<{ tone: string; text: string; hook?: string; rationale?: string }> | null =
    mode === "reply"
      ? (replies?.map((r) => ({ tone: r.tone, text: r.text, rationale: r.rationale })) ?? null)
      : openers;

  return (
    <div className="mx-auto max-w-[1120px] px-10 py-12 pb-20">
      <PageHeader
        kicker={mode === "reply" ? "gelen mesaja cevap —" : "ilk adımı sen at —"}
        title="Mesaj Üretici"
        description={
          mode === "reply"
            ? "Gelen mesajı yapıştır, üç farklı tonda cevap al. Kopyala, gönder, bitti."
            : "Hedef seç, senin sesinle açılış mesajı çıksın."
        }
      />

      {/* Mode tabs — pill */}
      <div className="mb-7 inline-flex rounded-full border border-ink-800 bg-ink-900/60 p-1">
        {[
          { k: "reply", l: "Cevap ver" },
          { k: "opener", l: "İlk mesajı yaz" },
        ].map((o) => (
          <button
            key={o.k}
            type="button"
            onClick={() => {
              setMode(o.k as "reply" | "opener");
              setError(null);
              setReplies(null);
              setOpeners(null);
            }}
            className={`rounded-full px-6 py-[10px] text-[14px] transition ${
              mode === o.k
                ? "bg-brand-500 text-white"
                : "text-ink-300 hover:text-ink-100"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* LEFT COLUMN — form + results */}
        <div className="flex flex-col gap-6">
          {/* Form card */}
          <div className="flex flex-col gap-[22px] rounded-2xl border border-ink-800 bg-ink-900/40 p-7">
            {mode === "opener" && (
              <div
                className="rounded-[12px] border px-4 py-3 text-[14px] leading-[1.5]"
                style={{
                  borderColor: "rgba(225,29,72,0.3)",
                  background: "rgba(225,29,72,0.08)",
                  color: "#F7A8B8",
                }}
              >
                <span className="text-brand-400">ℹ</span> İlk mesaj için{" "}
                <strong className="text-ink-100">hedef seçilmeli</strong> — koç
                onun arketipine göre açılış kurar.
              </div>
            )}

            {mode === "reply" ? (
              <>
                <Field label="Gelen mesaj" required>
                  <textarea
                    value={incoming}
                    onChange={(e) => setIncoming(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder="örn: lol rastgele bir soru, niye soruyorsun?"
                    className="w-full resize-y rounded-[14px] border border-ink-700 bg-ink-900/60 px-4 py-3 text-[16px] leading-[1.55] text-ink-100 placeholder-ink-500 outline-none transition focus:border-brand-500"
                  />
                  <p className="mt-1 text-[14px] text-ink-500">
                    {incoming.length} / 2000
                  </p>
                </Field>

                <Field label="Bağlam (opsiyonel)">
                  <input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="örn: 2 gün önce eşleştik"
                    className="w-full rounded-[14px] border border-ink-700 bg-ink-900/60 px-4 py-3 text-[16px] leading-[1.55] text-ink-100 placeholder-ink-500 outline-none transition focus:border-brand-500"
                  />
                </Field>
              </>
            ) : (
              <Field label="Durum notu (opsiyonel)">
                <textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  rows={3}
                  placeholder="nerede tanıştınız, son ne oldu, hedefin neresi…"
                  className="w-full resize-y rounded-[14px] border border-ink-700 bg-ink-900/60 px-4 py-3 text-[16px] leading-[1.55] text-ink-100 placeholder-ink-500 outline-none transition focus:border-brand-500"
                />
              </Field>
            )}

            {/* Tones — 3 col */}
            <Field label="Tonlar">
              <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-3">
                {ALL_TONES.map((t) => {
                  const active = tones.includes(t.key);
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => toggleTone(t.key)}
                      className={`rounded-[14px] border p-[14px] text-left transition ${
                        active
                          ? "border-brand-500"
                          : "border-ink-700 hover:border-ink-600"
                      }`}
                      style={{
                        background: active
                          ? "rgba(225,29,72,0.12)"
                          : "rgba(17,17,24,0.4)",
                      }}
                    >
                      <div
                        className={`mb-1 font-display italic ${
                          active ? "text-brand-400" : "text-ink-100"
                        }`}
                        style={{ fontSize: 20 }}
                      >
                        {t.label}
                      </div>
                      <div className="text-[13px] text-ink-400">{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            </Field>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={mode === "reply" ? submit : submitOpener}
              disabled={
                loading ||
                tones.length === 0 ||
                (mode === "reply" && !incoming.trim()) ||
                (mode === "opener" && !targetId)
              }
              className="w-full rounded-[14px] bg-brand-500 font-medium text-white shadow-[0_10px_20px_-8px_rgba(225,29,72,0.4)] transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ padding: "14px 24px", fontSize: 16 }}
            >
              {loading
                ? "üretiliyor…"
                : mode === "reply"
                ? "Cevapları üret →"
                : "Açılış mesajlarını üret →"}
            </button>
          </div>

          {/* Results */}
          {resultList && resultList.length > 0 && (
            <section>
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <p
                  className="font-display italic text-brand-400"
                  style={{ fontSize: 22 }}
                >
                  işte {resultList.length} cevap —
                </p>
                {selectedTarget && (
                  <span className="text-[11px] uppercase tracking-[0.25em] text-ink-500">
                    {selectedTarget.name ?? "?"} için
                  </span>
                )}
              </div>

              {confidence && (
                <div className="mb-4">
                  <ConfidenceBadge confidence={confidence} />
                </div>
              )}

              <div className="flex flex-col gap-3">
                {resultList.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 transition hover:border-brand-500/40"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-baseline gap-[14px]">
                        <span
                          className="font-display italic text-brand-400"
                          style={{ fontSize: 22 }}
                        >
                          {r.tone}
                        </span>
                        {r.hook && (
                          <span className="text-[11px] uppercase tracking-[0.25em] text-ink-500">
                            · hook: {r.hook}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => copy(i, r.text)}
                        className={`shrink-0 rounded-full border px-[14px] py-[6px] text-[12px] transition ${
                          copiedIdx === i
                            ? "border-brand-500 text-brand-400"
                            : "border-ink-700 text-ink-200 hover:border-ink-600"
                        }`}
                      >
                        {copiedIdx === i ? "Kopyalandı ✓" : "Kopyala"}
                      </button>
                    </div>
                    <p
                      className="mb-4 text-ink-100"
                      style={{ fontSize: 18, lineHeight: 1.55 }}
                    >
                      {r.text}
                    </p>
                    {r.rationale && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded(expanded === i ? null : i)
                          }
                          className={`border-none bg-transparent p-0 text-[12px] transition ${
                            expanded === i
                              ? "text-brand-400"
                              : "text-ink-400 hover:text-ink-200"
                          }`}
                        >
                          {expanded === i
                            ? "− açıklamayı gizle"
                            : "+ neden bu cevap?"}
                        </button>
                        {expanded === i && (
                          <p
                            className="mt-[14px] border-t border-ink-800 pt-[14px] italic text-ink-300"
                            style={{ fontSize: 15, lineHeight: 1.6 }}
                          >
                            {r.rationale}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="flex flex-col gap-[14px]">
          {/* Target picker */}
          <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-400">
              Kim için?
            </label>
            <div className="flex flex-col gap-[2px]">
              <TargetPickerRow
                label="Belirsiz (genel)"
                sub={null}
                active={targetId == null}
                onClick={() => setTargetId(null)}
              />
              {targets.map((t) => (
                <TargetPickerRow
                  key={t.id}
                  label={t.name ?? "İsimsiz"}
                  sub={RELATION_LABELS[t.relation] ?? t.relation}
                  active={targetId === t.id}
                  onClick={() => setTargetId(t.id)}
                />
              ))}
            </div>
            {selectedTarget && (
              <p className="mt-[14px] border-t border-ink-800 pt-[14px] text-[12px] leading-[1.5] text-ink-400">
                Cevaplar{" "}
                <span className="text-brand-400">{selectedTarget.name}</span>{" "}
                için kişiselleşecek — bağlanma stili ve çekim tetikleyicileri
                dikkate alınıyor.
              </p>
            )}
          </div>

          {/* Quota */}
          {usageRemaining !== null && (
            <div
              className="rounded-2xl border border-ink-800 p-5 backdrop-blur-[8px]"
              style={{ background: "rgba(17,17,24,0.4)" }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-500">
                kalan kota
              </p>
              <p
                className="mb-[2px] mt-[10px] font-display tracking-tight text-ink-100"
                style={{
                  fontSize: 48,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {usageRemaining}
              </p>
              <p className="text-[14px] text-ink-300">üretim kaldı bugün</p>
              <div className="mt-[14px] h-1 overflow-hidden rounded-full bg-ink-800">
                <div
                  className="h-full bg-brand-500 transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, (usageRemaining / 20) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
            <p
              className="mb-3 font-display italic text-brand-400"
              style={{ fontSize: 16 }}
            >
              daha iyi cevap için —
            </p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {[
                "Mesajı birebir yapıştır, özetleme",
                "Bağlam: nerede, kaç gündür, ilişki evresi",
                "Hedef profili oluştur — kişiselleşir",
                "Emoji varsa bırak, yoksa ekleme",
              ].map((l, i) => (
                <li
                  key={i}
                  className="text-[12px] leading-[1.55] text-ink-300"
                >
                  <span className="mr-2 text-brand-500">◆</span>
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-2 block font-semibold uppercase text-ink-300"
        style={{ fontSize: 10, letterSpacing: "0.25em" }}
      >
        {label}
        {required && <span className="ml-1 text-brand-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function TargetPickerRow({
  label,
  sub,
  active,
  onClick,
}: {
  label: string;
  sub: string | null;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-[10px] px-3 py-[10px] text-left text-[14px] transition ${
        active
          ? "text-brand-400"
          : "text-ink-200 hover:bg-ink-900/60"
      }`}
      style={{
        background: active ? "rgba(225,29,72,0.14)" : "transparent",
      }}
    >
      <span>{label}</span>
      {sub && (
        <span
          className={`text-[11px] uppercase tracking-[0.25em] ${
            active ? "text-brand-400" : "text-ink-500"
          }`}
        >
          {sub}
        </span>
      )}
    </button>
  );
}
