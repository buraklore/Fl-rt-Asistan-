"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import {
  PageHeader,
  SectionCard,
  Label,
  Textarea,
  Button,
  ErrorBanner,
  InfoBanner,
} from "@/components/app/ui";

type Target = { id: string; name: string | null; relation: string };

type Emotion = { label: string; intensity: number; evidence: string };

type AnalysisResult = {
  whoEscalated: string;
  emotions: { user?: Emotion[]; target?: Emotion[] } | null;
  rootCause: string;
  fixMessage: string;
  severity: number;
};

const ESCALATED_LABELS: Record<string, string> = {
  user: "Sen",
  target: "O",
  both: "İkiniz de",
  neither: "Hiçbiri",
};

export default function ConflictsPage() {
  return (
    <Suspense fallback={<div />}>
      <ConflictsContent />
    </Suspense>
  );
}

function ConflictsContent() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("targetId");

  const [targets, setTargets] = useState<Target[]>([]);
  const [targetId, setTargetId] = useState<string | null>(preselected);
  const [chatLog, setChatLog] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

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

  const submit = async () => {
    if (!chatLog.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.analyzeConflict({
        chatLog,
        targetId: targetId || undefined,
      });
      // Server returns the saved conflict record; extract analysis fields
      const data = res.data as AnalysisResult & { fix_message?: string };
      setResult({
        whoEscalated: (data as never as { who_escalated?: string }).who_escalated ?? data.whoEscalated,
        emotions: data.emotions,
        rootCause: (data as never as { root_cause?: string }).root_cause ?? data.rootCause,
        fixMessage: (data as never as { fix_message?: string }).fix_message ?? data.fixMessage,
        severity: data.severity,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 402
            ? "Haftalık çatışma analizi limitin doldu. Premium sınırsız."
            : err.problem.detail ?? err.problem.title,
        );
      } else {
        setError("Analiz başarısız oldu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.fixMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-10">
      <PageHeader
        kicker="tartışma mı oldu —"
        title="Çatışma Onarımı"
        description="Transkripti yapıştır. AI kimin tırmandırdığını, altta yatan sebebi ve onarım mesajını çıkarır."
      />

      {!result && (
        <SectionCard className="space-y-6 p-6">
          <div>
            <Label>Kim için? (opsiyonel)</Label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTargetId(null)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  targetId === null
                    ? "border-brand-500 bg-brand-500/10 text-brand-400"
                    : "border-ink-700 bg-ink-900/40 text-ink-200"
                }`}
              >
                Genel
              </button>
              {targets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTargetId(t.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    targetId === t.id
                      ? "border-brand-500 bg-brand-500/10 text-brand-400"
                      : "border-ink-700 bg-ink-900/40 text-ink-200"
                  }`}
                >
                  {t.name ?? "İsimsiz"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label required>Mesajlaşma transkripti</Label>
            <Textarea
              value={chatLog}
              onChange={(e) => setChatLog(e.target.value)}
              placeholder={
                "Her satıra kim ne yazmış yaz, örn:\n\nBen: bu akşam müsait misin?\nO: yine mi soruyorsun ya\nBen: sadece merak ettim\nO: boşver gelmem"
              }
              rows={10}
              maxLength={10000}
            />
            <p className="mt-1 text-xs text-ink-500">
              {chatLog.length} / 10000
            </p>
          </div>

          <Button onClick={submit} disabled={loading || !chatLog.trim()} fullWidth>
            {loading ? "analiz ediliyor..." : "Çatışmayı analiz et →"}
          </Button>

          {error && <ErrorBanner message={error} />}
        </SectionCard>
      )}

      {result && (
        <div className="space-y-6">
          <div className="flex items-baseline justify-between">
            <p className="font-display italic text-brand-400">analiz —</p>
            <button
              onClick={() => {
                setResult(null);
                setChatLog("");
              }}
              className="text-sm text-ink-400 hover:text-ink-200"
            >
              ← Yeni analiz
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <SectionCard className="p-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
                ciddiyet
              </p>
              <p className="font-display text-4xl text-brand-400">
                {result.severity}
                <span className="text-xl text-ink-500"> / 5</span>
              </p>
            </SectionCard>
            <SectionCard className="p-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
                kim tırmandırdı
              </p>
              <p className="font-display text-xl italic text-ink-100">
                {ESCALATED_LABELS[result.whoEscalated] ?? result.whoEscalated}
              </p>
            </SectionCard>
            <SectionCard className="p-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
                duygular
              </p>
              <div className="flex flex-wrap gap-1">
                {[
                  ...(result.emotions?.user ?? []),
                  ...(result.emotions?.target ?? []),
                ]
                  .slice(0, 4)
                  .map((e, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-ink-800 px-2 py-0.5 text-xs text-ink-200"
                      title={e.evidence}
                    >
                      {e.label}
                    </span>
                  ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard className="p-6">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-brand-400">
              kök sebep
            </p>
            <p className="text-base leading-relaxed text-ink-100">
              {result.rootCause}
            </p>
          </SectionCard>

          <SectionCard className="border-brand-500/30 bg-gradient-to-br from-brand-500/5 to-transparent p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-400">
                onarım mesajı
              </p>
              <button
                onClick={copy}
                className="rounded-full border border-brand-500/40 px-3 py-1 text-xs text-brand-400 hover:bg-brand-500/10"
              >
                {copied ? "Kopyalandı ✓" : "Kopyala"}
              </button>
            </div>
            <p className="font-display text-xl leading-relaxed text-ink-100">
              {result.fixMessage}
            </p>
          </SectionCard>

          <InfoBanner>
            Bu mesajı direkt göndermek zorunda değilsin — tonu düşünüp
            kelimeleri kendi ağzınla söyle. Başlangıç noktası olarak kullan.
          </InfoBanner>
        </div>
      )}
    </div>
  );
}
