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
import { ConfidenceBadge } from "@/components/app/confidence-badge";

type Target = { id: string; name: string | null; relation: string };

type Emotion = { label: string; intensity: number; evidence: string };

type AnalysisResult = {
  whoEscalated: string;
  emotions: { user?: Emotion[]; target?: Emotion[] } | null;
  rootCause: string;
  fixMessage: string;
  severity: number;
  confidence?: {
    overall: number;
    dataGaps: string[];
    explanation: string;
  } | null;
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
  const [contextNote, setContextNote] = useState("");
  const [copied, setCopied] = useState(false);
  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);

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
        contextNote,
        targetId: targetId || undefined,
      });
      // Server returns the saved conflict record; extract analysis fields
      const data = res.data as AnalysisResult & {
        fix_message?: string;
        confidence?: AnalysisResult["confidence"];
      };
      setResult({
        whoEscalated: (data as never as { who_escalated?: string }).who_escalated ?? data.whoEscalated,
        emotions: data.emotions,
        rootCause: (data as never as { root_cause?: string }).root_cause ?? data.rootCause,
        fixMessage: (data as never as { fix_message?: string }).fix_message ?? data.fixMessage,
        severity: data.severity,
        confidence: data.confidence ?? null,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    setUploadedFilename(file.name);
    try {
      const res = await api.extractTranscriptFromImage(file);
      const newText = res.data.transcript.trim();
      // If textarea already had content, append; else replace
      setChatLog((prev) => (prev.trim() ? `${prev}\n${newText}` : newText));
    } catch (err) {
      setUploadError(
        err instanceof ApiError
          ? err.problem.detail ?? err.problem.title ?? "Görüntü işlenemedi."
          : "Görüntü işlenemedi. Tekrar dene veya manuel yaz.",
      );
      setUploadedFilename(null);
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-uploaded if needed
      e.target.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-[820px] px-10 py-12 pb-20">
      <a
        href="/conflicts/history"
        className="text-[13px] text-ink-400 hover:text-ink-200"
      >
        geçmiş kayıtları →
      </a>
      <div className="mt-3">
        <PageHeader
          kicker="onarım —"
          title="Çatışma Onarımı."
          description="Tartışmayı yükle, koç kök sebebi bulup onarım mesajını yazsın."
        />
      </div>

      {!result && (
        <div className="space-y-6">
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
            <Label required>Bağlam — ne hakkında tartıştınız?</Label>
            <Textarea
              value={contextNote}
              onChange={(e) => setContextNote(e.target.value)}
              placeholder="Örn: Hafta sonu planı yapıyorduk, ben evde kalmak istiyordum o dışarı çıkmak istiyordu. Aslında son zamanlarda bu konuda sürtüşme yaşıyoruz — ben enerjimi toplamaya çalışıyorum, o sıkıldığını söylüyor."
              rows={3}
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-ink-500">
              {contextNote.length} / 1000 — en az 40 karakter. Transkript dışı bağlam analizini keskinleştirir.
            </p>
          </div>

          <div>
            <Label required>Mesajlaşma transkripti</Label>

            {/* Image upload zone — screenshot to transcript */}
            <div className="mb-4 rounded-xl border border-dashed border-ink-700 bg-ink-900/30 p-4">
              <p className="mb-3 text-xs text-ink-300">
                Tartışmanın ekran görüntüsü var mı? otomatik çıkarılsın.
              </p>
              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs transition ${
                  uploading
                    ? "cursor-wait border-ink-700 bg-ink-900 text-ink-500"
                    : "border-brand-500/40 bg-brand-500/5 text-brand-400 hover:bg-brand-500/10"
                }`}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                {uploading
                  ? "okunuyor..."
                  : uploadedFilename
                    ? "Başka ekran görüntüsü ekle"
                    : "📷 Ekran görüntüsü yükle"}
              </label>
              {uploadedFilename && !uploading && (
                <p className="mt-2 text-xs text-ink-400">
                  ✓ <span className="text-ink-200">{uploadedFilename}</span>{" "}
                  — transkript aşağıya eklendi. Düzenleyebilirsin.
                </p>
              )}
              {uploadError && (
                <p className="mt-2 text-xs text-red-400">{uploadError}</p>
              )}
              <p className="mt-2 text-[10px] text-ink-500">
                PNG, JPEG veya WEBP · Maks 5 MB · Görüntü saklanmaz
              </p>
            </div>

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
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <div className="flex items-baseline justify-between">
            <p className="font-display italic text-brand-400" style={{ fontSize: 22 }}>
              analiz —
            </p>
            <button
              onClick={() => {
                setResult(null);
                setChatLog("");
                setContextNote("");
              }}
              className="text-[13px] text-ink-400 hover:text-ink-200"
            >
              ← Yeni analiz
            </button>
          </div>

          {result.confidence && (
            <ConfidenceBadge confidence={result.confidence} />
          )}

          {/* 3 stat tiles */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-400">
                ciddiyet
              </p>
              <p
                className="font-display text-ink-100"
                style={{ fontSize: 26, lineHeight: 1.1, letterSpacing: "-0.02em" }}
              >
                {result.severity}
                <span className="text-ink-500"> / 5</span>
              </p>
              <p className="mt-2 text-[12px] text-ink-400">
                {result.severity >= 4
                  ? "yüksek"
                  : result.severity >= 3
                  ? "orta-yüksek"
                  : "orta"}
              </p>
            </div>
            <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-400">
                tetikleyen
              </p>
              <p
                className="font-display text-ink-100"
                style={{ fontSize: 26, lineHeight: 1.1, letterSpacing: "-0.02em" }}
              >
                {ESCALATED_LABELS[result.whoEscalated] ?? result.whoEscalated}
              </p>
              <p className="mt-2 text-[12px] text-ink-400">
                {result.whoEscalated === "both" ? "karşılıklı yük" : "yük taşıyan"}
              </p>
            </div>
            <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-400">
                duygu yoğunluğu
              </p>
              <p
                className="font-display text-ink-100"
                style={{ fontSize: 26, lineHeight: 1.1, letterSpacing: "-0.02em" }}
              >
                {[
                  ...(result.emotions?.user ?? []),
                  ...(result.emotions?.target ?? []),
                ].length}{" "}
                tema
              </p>
              <p className="mt-2 text-[12px] leading-[1.4] text-ink-400">
                {[
                  ...(result.emotions?.user ?? []),
                  ...(result.emotions?.target ?? []),
                ]
                  .slice(0, 3)
                  .map((e) => e.label)
                  .join(" · ") || "—"}
              </p>
            </div>
          </div>

          {/* Kök sebep — italic 28px */}
          <div
            className="rounded-[20px] border p-7"
            style={{
              borderColor: "rgba(225,29,72,0.25)",
              background:
                "linear-gradient(145deg, rgba(225,29,72,0.08), rgba(17,17,24,0.6))",
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-400">
              — kök sebep
            </p>
            <p
              className="mt-[14px] font-display italic text-ink-100"
              style={{ fontSize: 28, lineHeight: 1.2, letterSpacing: "-0.01em" }}
            >
              {result.rootCause}
            </p>
          </div>

          {/* Onarım mesajı — gold accent gradient */}
          <div
            className="rounded-[20px] border p-7"
            style={{
              borderColor: "rgba(245,158,11,0.25)",
              background:
                "linear-gradient(145deg, rgba(245,158,11,0.08), rgba(17,17,24,0.7))",
            }}
          >
            <div className="mb-[14px] flex items-center justify-between gap-3">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.3em]"
                style={{ color: "#F59E0B" }}
              >
                — onarım mesajı
              </p>
              <button
                onClick={copy}
                className="rounded-full border border-ink-700 bg-ink-900/60 px-[14px] py-[6px] text-[12px] text-ink-200 transition hover:border-ink-600"
              >
                {copied ? "Kopyalandı ✓" : "Kopyala"}
              </button>
            </div>
            <p
              className="text-ink-100"
              style={{ fontSize: 16, lineHeight: 1.7 }}
            >
              {result.fixMessage}
            </p>
            <p className="mt-3 text-[12px] italic text-ink-400">
              tonu ayarla → sakin · sıcak · net · suç yüklemeden
            </p>
          </div>

          <InfoBanner>
            Bu mesajı direkt göndermek zorunda değilsin — tonu düşünüp
            kelimeleri kendi ağzınla söyle. Başlangıç noktası olarak kullan.
          </InfoBanner>
        </div>
      )}
    </div>
  );
}
