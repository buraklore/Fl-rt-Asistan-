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

/**
 * RizzAI Onboarding — 7 mandatory steps, no skipping.
 *
 * Steps:
 *   [1/7] Basics  — display name + gender + age range
 *   [2/7] Goal    — relationship goal
 *   [3/7] Comm    — communication style (textarea, min 50 char)
 *   [4/7] Attach  — attachment style (5 options incl. "not sure" → quiz)
 *   [5/7] Interests — at least 3, each 4+ chars
 *   [6/7] Archetype — own + attracted-to (3 axes)
 *   [7/7] Bio     — free bio, min 100 char
 */

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const GENDERS = [
  { key: "male", label: "Erkek" },
  { key: "female", label: "Kadın" },
  { key: "nonbinary", label: "Non-binary" },
  { key: "unspecified", label: "Belirtmek istemiyorum" },
] as const;

const AGE_RANGES = [
  { key: "18-24", label: "18-24" },
  { key: "25-34", label: "25-34" },
  { key: "35-44", label: "35-44" },
  { key: "45+", label: "45+" },
] as const;

const GOALS = [
  { key: "dating", label: "Yeni biriyle tanışmak" },
  { key: "long-term", label: "Uzun vadeli ilişki" },
  { key: "reconnect", label: "Eski bağlantıyı canlandırmak" },
  { key: "conflict", label: "Tartışmayı onarmak" },
  { key: "friend", label: "Arkadaşlık geliştirmek" },
] as const;

const ATTACHMENT_STYLES = [
  {
    key: "secure",
    label: "Güvenli",
    desc: "Rahatsın, yakınlık da bağımsızlık da iyi geliyor.",
  },
  {
    key: "anxious",
    label: "Kaygılı",
    desc: "Onay ararsın, cevap beklerken içsel sesler devreye girer.",
  },
  {
    key: "avoidant",
    label: "Kaçıngan",
    desc: "Bağımsızlığını çok korursun, yakınlık artınca geri çekilirsin.",
  },
  {
    key: "disorganized",
    label: "Düzensiz",
    desc: "Yakınlık + mesafe arasında gidip geliyorsun.",
  },
  {
    key: "unknown",
    label: "Emin değilim",
    desc: "3 soruyla beraber bulalım.",
  },
] as const;

const ATTACHMENT_QUIZ: {
  q: string;
  options: { label: string; style: "secure" | "anxious" | "avoidant" | "disorganized" }[];
}[] = [
  {
    q: "Sevdiğin biri mesajına birkaç saat cevap vermedi. Hissin?",
    options: [
      { label: "Kendi işime bakarım, er geç yazar", style: "secure" },
      { label: "İçim kıpır kıpır olur, ne yaptım acaba düşünürüm", style: "anxious" },
      { label: "Ben de uzaklaşırım, ihtiyacım yok sonuçta", style: "avoidant" },
      { label: "Bazen üzülürüm, bazen umursamam — değişir", style: "disorganized" },
    ],
  },
  {
    q: "Birisi sana 'seni seviyorum' dese kısa bir tanışma sonrası:",
    options: [
      { label: "Hoşuma gider, karşılık veririm", style: "secure" },
      { label: "Çok mutlu olurum, ciddiye almazlar diye kaygılanırım", style: "anxious" },
      { label: "Sıkışırım, uzaklaşmak istemeye başlarım", style: "avoidant" },
      { label: "Hem isterim hem korkarım", style: "disorganized" },
    ],
  },
  {
    q: "Tartıştıktan sonra ilk içgüdün:",
    options: [
      { label: "Sakin sakin konuşalım, hallederiz", style: "secure" },
      { label: "Hemen düzeltmek isterim, ayrılacak mıyız diye korkarım", style: "anxious" },
      { label: "Yalnız kalmam lazım, ortalık yatışsın", style: "avoidant" },
      { label: "Aynı anda hem yaklaşmak hem kaçmak isterim", style: "disorganized" },
    ],
  },
];

const DYNAMIC_STYLES = [
  { key: "dominant-leading", label: "Dominant & Yönlendiren", desc: "İnisiyatif alırsın, yönü sen belirlersin, liderlik doğal gelir." },
  { key: "dominant-caring", label: "Dominant & Destekleyen", desc: "Sorumluluk alırsın ama koruyarak, besleyerek — kontrol + şefkat." },
  { key: "balanced-mutual", label: "Dengeli & Karşılıklı", desc: "Duruma göre liderlik eder ya da bırakırsın — eşit bir dans." },
  { key: "yielding-follower", label: "Takip eden & Teslim olan", desc: "Güvendiğin birinin liderliğinde rahatsın, akışa bırakırsın." },
  { key: "independent-distant", label: "Bağımsız & Mesafeli", desc: "Alanını korursun, kendi kendine yetersin." },
] as const;

const EXPRESSION_STYLES = [
  { key: "masculine", label: "Eril", desc: "Direkt, koruyucu, aksiyon odaklı. Sözünü tutan." },
  { key: "feminine", label: "Dişil", desc: "Sezgisel, besleyen, duygusal ifadeli. Zarif." },
  { key: "androgynous", label: "Androjen", desc: "İkisinin esnek dengesi, duruma göre değişen." },
] as const;

const ENERGY_STYLES = [
  { key: "intense-passionate", label: "Tutkulu & Yoğun", desc: "Her şeyi yoğun hissedersin — aşk, öfke, neşe tam dozda." },
  { key: "calm-stable", label: "Sakin & Stabil", desc: "Dengeli, tutarlı, güven veren. Drama senin için değil." },
  { key: "playful-light", label: "Oyuncu & Hafif", desc: "Takılırsın, güldürürsün, ciddiyeti kırarsın." },
  { key: "deep-intellectual", label: "Derin & Entelektüel", desc: "Anlamlı sohbet, fikir değişimi, zihinsel çekim." },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [communicationStyle, setCommunicationStyle] = useState("");
  const [attachmentStyle, setAttachmentStyle] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [interestsRaw, setInterestsRaw] = useState("");
  const [rawBio, setRawBio] = useState("");

  // Archetype — own
  const [ownDynamic, setOwnDynamic] = useState<string | null>(null);
  const [ownExpression, setOwnExpression] = useState<string | null>(null);
  const [ownEnergy, setOwnEnergy] = useState<string | null>(null);
  // Archetype — attracted-to (multi-select, 1-3)
  const [attractedDynamic, setAttractedDynamic] = useState<string[]>([]);
  const [attractedExpression, setAttractedExpression] = useState<string[]>([]);
  const [attractedEnergy, setAttractedEnergy] = useState<string[]>([]);

  const interests = interestsRaw
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter((s) => s.length >= 4);

  const canAdvance = (() => {
    switch (step) {
      case 1:
        return displayName.trim().length >= 2 && gender && ageRange;
      case 2:
        return !!goal;
      case 3:
        return communicationStyle.trim().length >= 50;
      case 4:
        return !!attachmentStyle && attachmentStyle !== "unknown";
      case 5:
        return interests.length >= 3;
      case 6:
        return (
          !!ownDynamic &&
          !!ownExpression &&
          !!ownEnergy &&
          attractedDynamic.length >= 1 &&
          attractedExpression.length >= 1 &&
          attractedEnergy.length >= 1
        );
      case 7:
        return rawBio.trim().length >= 100;
    }
  })();

  const toggleFromSet = (
    value: string,
    set: string[],
    setter: (next: string[]) => void,
    max: number,
  ) => {
    if (set.includes(value)) {
      setter(set.filter((v) => v !== value));
    } else if (set.length < max) {
      setter([...set, value]);
    }
  };

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.updateMyProfile({
        displayName: displayName.trim(),
        gender: gender as "male" | "female" | "nonbinary" | "unspecified",
        ageRange: ageRange as "18-24" | "25-34" | "35-44" | "45+",
        interests,
        communicationStyle: communicationStyle.trim(),
        attachmentStyle: attachmentStyle as
          | "secure"
          | "anxious"
          | "avoidant"
          | "disorganized",
        relationshipGoal: goal as
          | "dating"
          | "long-term"
          | "reconnect"
          | "conflict"
          | "friend",
        rawBio: rawBio.trim(),
        ownDynamicStyle: ownDynamic as never,
        ownExpressionStyle: ownExpression as never,
        ownRelationshipEnergy: ownEnergy as never,
        attractedToDynamicStyles: attractedDynamic as never[],
        attractedToExpressionStyles: attractedExpression as never[],
        attractedToEnergies: attractedEnergy as never[],
      });
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.problem.detail ?? err.problem.title ?? "Kaydedilemedi."
          : "Bir şeyler ters gitti. Tekrar dene.",
      );
      setLoading(false);
    }
  };

  const handleQuizSubmit = () => {
    if (quizAnswers.length !== ATTACHMENT_QUIZ.length) return;
    const counts: Record<string, number> = {};
    for (const ans of quizAnswers) counts[ans] = (counts[ans] ?? 0) + 1;
    const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0];
    setAttachmentStyle(top ?? "secure");
    setQuizOpen(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 md:px-10">
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition ${
              n <= step ? "bg-brand-500" : "bg-ink-800"
            }`}
          />
        ))}
      </div>

      <p className="mb-3 font-display italic text-brand-400">adım {step}/7 —</p>

      {step === 1 && (
        <>
          <h1 className="mb-4 font-display text-4xl sm:text-5xl">Seni tanıyalım.</h1>
          <p className="mb-10 text-ink-300">
            AI&apos;nin sana göre doğru analiz yapabilmesi için bütün alanlar zorunlu.
          </p>
          <SectionCard className="space-y-6 p-6">
            <div>
              <Label required>Takma adın</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Arkadaşların sana nasıl hitap ediyor"
                maxLength={40}
              />
              <p className="mt-1 text-xs text-ink-500">En az 2 karakter.</p>
            </div>
            <div>
              <Label required>Cinsiyet</Label>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <Chip key={g.key} active={gender === g.key} onClick={() => setGender(g.key)}>
                    {g.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <Label required>Yaş aralığı</Label>
              <div className="flex flex-wrap gap-2">
                {AGE_RANGES.map((a) => (
                  <Chip key={a.key} active={ageRange === a.key} onClick={() => setAgeRange(a.key)}>
                    {a.label}
                  </Chip>
                ))}
              </div>
            </div>
            <Button onClick={() => setStep(2)} disabled={!canAdvance} fullWidth>
              Devam →
            </Button>
          </SectionCard>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="mb-4 font-display text-4xl sm:text-5xl">Ne peşindesin?</h1>
          <p className="mb-10 text-ink-300">
            Ana hedefin AI&apos;nin tavsiyelerinin çerçevesini belirler.
          </p>
          <SectionCard className="space-y-4 p-6">
            {GOALS.map((g) => (
              <button
                key={g.key}
                onClick={() => setGoal(g.key)}
                className={`w-full rounded-xl border px-5 py-4 text-left transition ${
                  goal === g.key
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-ink-700 bg-ink-900/40 hover:border-ink-600"
                }`}
              >
                <span className={`font-display text-lg ${goal === g.key ? "text-brand-400" : "text-ink-100"}`}>
                  {g.label}
                </span>
              </button>
            ))}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                ← Geri
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canAdvance} className="flex-[2]">
                Devam →
              </Button>
            </div>
          </SectionCard>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="mb-4 font-display text-4xl sm:text-5xl">Nasıl iletişim kurarsın?</h1>
          <p className="mb-10 text-ink-300">
            Direkt mi dolaylı mı, espirili mi ciddi mi, kısa mı uzun mu yazan
            birisin? AI senin sesinle mesaj üretebilmek için bilmek zorunda.
          </p>
          <SectionCard className="space-y-4 p-6">
            <div>
              <Label required>İletişim stilin</Label>
              <Textarea
                value={communicationStyle}
                onChange={(e) => setCommunicationStyle(e.target.value)}
                placeholder="Örn: Genelde kısa ve direkt yazıyorum. Espirili olurum ama çok abartmam. Duygusal konularda biraz çekingenim, açılmak zor oluyor."
                rows={6}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-ink-500">
                {communicationStyle.length} / 500 — en az 50 karakter
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                ← Geri
              </Button>
              <Button onClick={() => setStep(4)} disabled={!canAdvance} className="flex-[2]">
                Devam →
              </Button>
            </div>
          </SectionCard>
        </>
      )}

      {step === 4 && (
        <>
          <h1 className="mb-4 font-display text-4xl sm:text-5xl">Bağlanma stilin.</h1>
          <p className="mb-10 text-ink-300">
            İlişkilerde nasıl hissedersin? Emin değilsen son kartı seç, 3 soruyla bulalım.
          </p>
          <SectionCard className="space-y-4 p-6">
            {ATTACHMENT_STYLES.map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  if (s.key === "unknown") {
                    setQuizOpen(true);
                    setQuizAnswers([]);
                  } else {
                    setAttachmentStyle(s.key);
                  }
                }}
                className={`w-full rounded-xl border px-5 py-4 text-left transition ${
                  attachmentStyle === s.key
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-ink-700 bg-ink-900/40 hover:border-ink-600"
                }`}
              >
                <p className={`font-display text-lg ${attachmentStyle === s.key ? "text-brand-400" : "text-ink-100"}`}>
                  {s.label}
                </p>
                <p className="mt-1 text-sm text-ink-400">{s.desc}</p>
              </button>
            ))}

            {quizOpen && (
              <div className="mt-4 space-y-6 rounded-xl border border-brand-500/30 bg-brand-500/5 p-5">
                <p className="font-display italic text-brand-400">mini test — 3 soru</p>
                {ATTACHMENT_QUIZ.map((q, qIdx) => (
                  <div key={qIdx}>
                    <p className="mb-3 text-sm font-medium text-ink-100">
                      {qIdx + 1}. {q.q}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((o, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => {
                            const next = [...quizAnswers];
                            next[qIdx] = o.style;
                            setQuizAnswers(next);
                          }}
                          className={`w-full rounded-lg border px-4 py-2 text-left text-sm transition ${
                            quizAnswers[qIdx] === o.style
                              ? "border-brand-500 bg-brand-500/10 text-brand-400"
                              : "border-ink-700 bg-ink-950 text-ink-200 hover:border-ink-600"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <Button
                  onClick={handleQuizSubmit}
                  disabled={quizAnswers.filter(Boolean).length !== ATTACHMENT_QUIZ.length}
                  fullWidth
                >
                  Sonucu göster
                </Button>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(3)} className="flex-1">
                ← Geri
              </Button>
              <Button onClick={() => setStep(5)} disabled={!canAdvance} className="flex-[2]">
                Devam →
              </Button>
            </div>
          </SectionCard>
        </>
      )}

      {step === 5 && (
        <>
          <h1 className="mb-4 font-display text-4xl sm:text-5xl">İlgi alanların.</h1>
          <p className="mb-10 text-ink-300">
            En az 3 tane yaz. Ortak zeminleri bulmak için kullanılacak.
          </p>
          <SectionCard className="space-y-4 p-6">
            <div>
              <Label required>İlgi alanların (virgülle ayır)</Label>
              <Textarea
                value={interestsRaw}
                onChange={(e) => setInterestsRaw(e.target.value)}
                placeholder="Örn: fotoğraf, akustik gitar, eski film izlemek, uzun yürüyüşler, yemek yapmak"
                rows={4}
                maxLength={600}
              />
              <p className="mt-1 text-xs text-ink-500">
                {interests.length} geçerli ilgi — en az 3 gerekli, her biri 4+ karakter olmalı
              </p>
              {interests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {interests.map((i, idx) => (
                    <span key={idx} className="rounded-full bg-brand-500/10 px-3 py-1 text-xs text-brand-400">
                      {i}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(4)} className="flex-1">
                ← Geri
              </Button>
              <Button onClick={() => setStep(6)} disabled={!canAdvance} className="flex-[2]">
                Devam →
              </Button>
            </div>
          </SectionCard>
        </>
      )}

      {/* STEP 6 — ARCHETYPE */}
      {step === 6 && (
        <>
          <h1 className="mb-4 font-display text-4xl sm:text-5xl">Arketipin.</h1>
          <p className="mb-10 text-ink-300">
            Üç boyutta — hem <span className="text-brand-400">kendin</span>,
            hem <span className="text-brand-400">hoşlandığın tip</span>. AI bu eşleşmeyi
            uyum analizinde direkt kullanır.
          </p>
          <SectionCard className="space-y-8 p-6">
            {/* DYNAMIC */}
            <div>
              <Label required>Dinamik tarzın — sen</Label>
              <p className="mb-3 text-xs text-ink-500">
                İlişkilerde genelde sen nasılsın? Tek seçim.
              </p>
              <div className="space-y-2">
                {DYNAMIC_STYLES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setOwnDynamic(s.key)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                      ownDynamic === s.key
                        ? "border-brand-500 bg-brand-500/10"
                        : "border-ink-700 bg-ink-900/40 hover:border-ink-600"
                    }`}
                  >
                    <p className={`font-medium ${ownDynamic === s.key ? "text-brand-400" : "text-ink-100"}`}>
                      {s.label}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label required>Dinamik tarz — hoşlandığın tip(ler)</Label>
              <p className="mb-3 text-xs text-ink-500">1-3 seçim yapabilirsin.</p>
              <div className="flex flex-wrap gap-2">
                {DYNAMIC_STYLES.map((s) => (
                  <Chip
                    key={s.key}
                    active={attractedDynamic.includes(s.key)}
                    onClick={() => toggleFromSet(s.key, attractedDynamic, setAttractedDynamic, 3)}
                  >
                    {s.label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* EXPRESSION */}
            <div>
              <Label required>İfade tarzın — sen</Label>
              <p className="mb-3 text-xs text-ink-500">Romantik enerjini nasıl gösterirsin? Tek seçim.</p>
              <div className="space-y-2">
                {EXPRESSION_STYLES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setOwnExpression(s.key)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                      ownExpression === s.key
                        ? "border-brand-500 bg-brand-500/10"
                        : "border-ink-700 bg-ink-900/40 hover:border-ink-600"
                    }`}
                  >
                    <p className={`font-medium ${ownExpression === s.key ? "text-brand-400" : "text-ink-100"}`}>
                      {s.label}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label required>İfade tarz — hoşlandığın tip(ler)</Label>
              <p className="mb-3 text-xs text-ink-500">1-2 seçim.</p>
              <div className="flex flex-wrap gap-2">
                {EXPRESSION_STYLES.map((s) => (
                  <Chip
                    key={s.key}
                    active={attractedExpression.includes(s.key)}
                    onClick={() => toggleFromSet(s.key, attractedExpression, setAttractedExpression, 2)}
                  >
                    {s.label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* ENERGY */}
            <div>
              <Label required>Enerjin — sen</Label>
              <p className="mb-3 text-xs text-ink-500">İlişki temponla ilgili. Tek seçim.</p>
              <div className="space-y-2">
                {ENERGY_STYLES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setOwnEnergy(s.key)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                      ownEnergy === s.key
                        ? "border-brand-500 bg-brand-500/10"
                        : "border-ink-700 bg-ink-900/40 hover:border-ink-600"
                    }`}
                  >
                    <p className={`font-medium ${ownEnergy === s.key ? "text-brand-400" : "text-ink-100"}`}>
                      {s.label}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label required>Enerji — hoşlandığın tip(ler)</Label>
              <p className="mb-3 text-xs text-ink-500">1-2 seçim.</p>
              <div className="flex flex-wrap gap-2">
                {ENERGY_STYLES.map((s) => (
                  <Chip
                    key={s.key}
                    active={attractedEnergy.includes(s.key)}
                    onClick={() => toggleFromSet(s.key, attractedEnergy, setAttractedEnergy, 2)}
                  >
                    {s.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(5)} className="flex-1">
                ← Geri
              </Button>
              <Button onClick={() => setStep(7)} disabled={!canAdvance} className="flex-[2]">
                Devam →
              </Button>
            </div>
          </SectionCard>
        </>
      )}

      {step === 7 && (
        <>
          <h1 className="mb-4 font-display text-4xl sm:text-5xl">Kendin hakkında.</h1>
          <p className="mb-10 text-ink-300">
            Kim olduğun, neye değer verdiğin, nasıl bir ilişki aradığın — serbest yaz.
            Her AI çağrısında sana özel kalibrasyon için kullanılır.
          </p>
          <SectionCard className="space-y-4 p-6">
            <div>
              <Label required>Kısa bio</Label>
              <Textarea
                value={rawBio}
                onChange={(e) => setRawBio(e.target.value)}
                placeholder="Örn: İstanbul'da yaşıyorum, 3 yıldır mimarlık okuyorum. İlişkilerde dürüst olmayı önemserim ama güvenmek zor. Son ilişkim 1 yıl önce bitti, artık ciddi bir şey arıyorum."
                rows={8}
                maxLength={2000}
              />
              <p className="mt-1 text-xs text-ink-500">
                {rawBio.length} / 2000 — en az 100 karakter
              </p>
            </div>
            {error && <ErrorBanner message={error} />}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(6)} className="flex-1" disabled={loading}>
                ← Geri
              </Button>
              <Button onClick={submit} disabled={!canAdvance || loading} className="flex-[2]">
                {loading ? "kaydediliyor..." : "Bitir & devam →"}
              </Button>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
