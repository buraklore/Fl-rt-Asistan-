"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import {
  SectionCard,
  Label,
  Input,
  Textarea,
  Button,
  Chip,
  ErrorBanner,
} from "@/components/app/ui";

type Step = 1 | 2 | 3;

const GOALS = [
  { key: "dating", label: "Yeni biriyle tanışmak" },
  { key: "long-term", label: "Uzun vadeli ilişki" },
  { key: "reconnect", label: "Eski bağlantıyı canlandırmak" },
  { key: "conflict", label: "Tartışmayı onarmak" },
];

const RELATIONS = [
  { key: "crush", label: "Crush" },
  { key: "match", label: "Eşleşme" },
  { key: "partner", label: "Partner" },
  { key: "ex", label: "Eski sevgili" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [goal, setGoal] = useState<string | null>(null);
  const [userBio, setUserBio] = useState("");

  // Step 2
  const [skipTarget, setSkipTarget] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] =
    useState<(typeof RELATIONS)[number]["key"] | null>(null);
  const [contextNotes, setContextNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!skipTarget && relation) {
        const res = await api.createTarget({
          name: name.trim() || undefined,
          relation,
          contextNotes: contextNotes.trim() || undefined,
          interests: [],
          behaviors: [],
        });
        // fire-and-forget analysis
        api.analyzeTarget(res.data.id).catch(() => undefined);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.problem.detail ?? err.problem.title
          : "Bir şeyler ters gitti.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="mx-auto max-w-2xl px-6 py-12 md:py-20">
        {/* Progress */}
        <div className="mb-10 flex items-center gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-0.5 flex-1 rounded-full transition ${
                step >= (n as Step) ? "bg-brand-500" : "bg-ink-800"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <>
            <p className="mb-3 font-display italic text-brand-400">
              adım 1/3 — sen
            </p>
            <h1 className="mb-4 font-display text-4xl sm:text-5xl">
              Ne peşindesin?
            </h1>
            <p className="mb-10 text-ink-300">
              Ana hedefin, AI&apos;nin sana nasıl yardım edeceğini belirler.
            </p>
            <SectionCard className="space-y-6 p-6">
              <div>
                <Label required>Birincil hedef</Label>
                <div className="flex flex-col gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.key}
                      onClick={() => setGoal(g.key)}
                      className={`rounded-xl border p-4 text-left transition ${
                        goal === g.key
                          ? "border-brand-500 bg-brand-500/10"
                          : "border-ink-700 bg-ink-900/40 hover:border-ink-600"
                      }`}
                    >
                      <span
                        className={
                          goal === g.key ? "text-brand-400" : "text-ink-100"
                        }
                      >
                        {g.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Seni tanımlayan kısa not (opsiyonel)</Label>
                <Textarea
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  placeholder="örn: içine kapanık ama açılınca konuşkan, mizah önemli"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <Button onClick={() => setStep(2)} disabled={!goal} fullWidth>
                Devam →
              </Button>
            </SectionCard>
          </>
        )}

        {step === 2 && (
          <>
            <p className="mb-3 font-display italic text-brand-400">
              adım 2/3 — o kişi
            </p>
            <h1 className="mb-4 font-display text-4xl sm:text-5xl">
              Aklındaki kişi.
            </h1>
            <p className="mb-10 text-ink-300">
              İsteğe bağlı — sonra da ekleyebilirsin.
            </p>

            {skipTarget ? (
              <SectionCard className="p-6 text-center">
                <p className="mb-4 text-ink-300">
                  Tamam, sonra ekleyebilirsin. Hemen uygulamayı görelim.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setSkipTarget(false)}
                    className="text-sm text-ink-400 hover:text-ink-200"
                  >
                    geri dön
                  </button>
                  <Button onClick={() => setStep(3)}>Devam →</Button>
                </div>
              </SectionCard>
            ) : (
              <SectionCard className="space-y-6 p-6">
                <div>
                  <Label>Ne dememizi istersin?</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="örn: 'M' veya 'Ayşe'"
                    maxLength={40}
                  />
                </div>

                <div>
                  <Label required>İlişki türü</Label>
                  <div className="flex flex-wrap gap-2">
                    {RELATIONS.map((r) => (
                      <Chip
                        key={r.key}
                        active={relation === r.key}
                        onClick={() => setRelation(r.key)}
                      >
                        {r.label}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Bağlam</Label>
                  <Textarea
                    value={contextNotes}
                    onChange={(e) => setContextNotes(e.target.value)}
                    placeholder="örn: hinge'de eşleştik, 2 kez buluştuk, son zamanlarda soğudu"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSkipTarget(true)}
                    className="text-sm text-ink-400 hover:text-ink-200"
                  >
                    şimdilik atla
                  </button>
                  <Button onClick={() => setStep(3)} disabled={!relation}>
                    Devam →
                  </Button>
                </div>
              </SectionCard>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <p className="mb-3 font-display italic text-brand-400">
              son adım —
            </p>
            <h1 className="mb-4 font-display text-4xl sm:text-5xl">
              Hazırız.
            </h1>
            <p className="mb-10 text-ink-300">
              Aşağıda bir özet — devam dediğinde dashboard&apos;ına
              düşürüyoruz.
            </p>
            <SectionCard className="space-y-4 p-6">
              <Summary
                label="Hedef"
                value={
                  GOALS.find((g) => g.key === goal)?.label ?? "—"
                }
              />
              {!skipTarget && relation && (
                <>
                  <Summary
                    label="İlk kişi"
                    value={
                      (name || "İsimsiz") +
                      " · " +
                      (RELATIONS.find((r) => r.key === relation)?.label ?? "")
                    }
                  />
                  <Summary
                    label="Otomatik analiz"
                    value="arka planda başlatılacak"
                  />
                </>
              )}

              {error && <ErrorBanner message={error} />}

              <Button onClick={finish} disabled={loading} fullWidth>
                {loading ? "başlatılıyor..." : "Dashboard&apos;a götür →"}
              </Button>
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-ink-800/50 py-2 last:border-0">
      <span className="text-xs uppercase tracking-widest text-ink-400">
        {label}
      </span>
      <span className="text-sm text-ink-100">{value}</span>
    </div>
  );
}
