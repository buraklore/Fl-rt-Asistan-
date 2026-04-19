"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import {
  PageHeader,
  Label,
  Input,
  Textarea,
  Button,
  Chip,
  ErrorBanner,
  SectionCard,
} from "@/components/app/ui";

const RELATIONS = [
  { key: "crush", label: "Crush" },
  { key: "match", label: "Eşleşme" },
  { key: "partner", label: "Partner" },
  { key: "ex", label: "Eski sevgili" },
  { key: "friend", label: "Arkadaş" },
] as const;

const GENDERS = [
  { key: "female", label: "Kadın" },
  { key: "male", label: "Erkek" },
  { key: "nonbinary", label: "Non-binary" },
  { key: "unspecified", label: "Belirtmek istemiyorum" },
] as const;

const AGE_RANGES = [
  { key: "18-24", label: "18-24" },
  { key: "25-34", label: "25-34" },
  { key: "35-44", label: "35-44" },
  { key: "45+", label: "45+" },
  { key: "bilmiyorum", label: "Bilmiyorum" },
] as const;

const DYNAMIC_STYLES = [
  { key: "dominant-leading", label: "Dominant & Yönlendiren", desc: "İnisiyatif alan, yönü belirleyen, liderlik doğal gelen." },
  { key: "dominant-caring", label: "Dominant & Destekleyen", desc: "Sorumluluk alan ama koruyarak — kontrol + şefkat." },
  { key: "balanced-mutual", label: "Dengeli & Karşılıklı", desc: "Duruma göre liderlik eden ya da bırakan." },
  { key: "yielding-follower", label: "Takip eden & Teslim olan", desc: "Güvendiği birinin liderliğinde rahat, akışa bırakan." },
  { key: "independent-distant", label: "Bağımsız & Mesafeli", desc: "Alanını koruyan, kendi kendine yeten." },
] as const;

const EXPRESSION_STYLES = [
  { key: "masculine", label: "Eril", desc: "Direkt, koruyucu, aksiyon odaklı." },
  { key: "feminine", label: "Dişil", desc: "Sezgisel, besleyen, duygusal ifadeli." },
  { key: "androgynous", label: "Androjen", desc: "İkisinin esnek dengesi." },
] as const;

const ENERGY_STYLES = [
  { key: "intense-passionate", label: "Tutkulu & Yoğun", desc: "Her şeyi yoğun hisseden." },
  { key: "calm-stable", label: "Sakin & Stabil", desc: "Dengeli, tutarlı, güven veren." },
  { key: "playful-light", label: "Oyuncu & Hafif", desc: "Takılan, güldüren, ciddiyeti kıran." },
  { key: "deep-intellectual", label: "Derin & Entelektüel", desc: "Anlamlı sohbet, zihinsel çekim." },
] as const;

export default function NewTargetPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [relation, setRelation] = useState<(typeof RELATIONS)[number]["key"] | null>(null);
  const [gender, setGender] = useState<(typeof GENDERS)[number]["key"] | null>(null);
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [interestsRaw, setInterestsRaw] = useState("");
  const [behaviorsRaw, setBehaviorsRaw] = useState("");
  const [contextNotes, setContextNotes] = useState("");
  const [dynamicStyle, setDynamicStyle] = useState<string | null>(null);
  const [expressionStyle, setExpressionStyle] = useState<string | null>(null);
  const [relationshipEnergy, setRelationshipEnergy] = useState<string | null>(null);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interests = interestsRaw
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter((s) => s.length >= 4);

  const behaviors = behaviorsRaw
    .split(/\n/g)
    .map((s) => s.trim())
    .filter((s) => s.length >= 15);

  const canSubmit =
    name.trim().length >= 2 &&
    !!relation &&
    !!gender &&
    !!ageRange &&
    interests.length >= 3 &&
    behaviors.length >= 3 &&
    contextNotes.trim().length >= 80 &&
    !!dynamicStyle &&
    !!expressionStyle &&
    !!relationshipEnergy;

  const submit = async () => {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.createTarget({
        name: name.trim(),
        relation: relation!,
        gender: gender!,
        ageRange: ageRange as never,
        interests,
        behaviors,
        contextNotes: contextNotes.trim(),
        dynamicStyle: dynamicStyle as never,
        expressionStyle: expressionStyle as never,
        relationshipEnergy: relationshipEnergy as never,
      });
      const targetId = (res.data as { id: string }).id;

      if (autoAnalyze) {
        setAnalyzing(true);
        try {
          await api.analyzeTarget(targetId);
        } catch {
          // Non-fatal — user can analyze manually later
        }
      }
      router.push(`/targets/${targetId}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.problem.detail ?? err.problem.title ?? "Hedef oluşturulamadı."
          : "Bir şeyler ters gitti.",
      );
      setLoading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <div className="mb-6">
        <Link href="/targets" className="text-sm text-ink-400 hover:text-brand-400">
          ← hedefler
        </Link>
      </div>
      <PageHeader
        kicker="yeni hedef"
        title="Kim bu?"
        description="Ne kadar çok detay verirsen, analiz o kadar keskin olur. Her alan zorunlu — doğru analiz için zengin veriye ihtiyaç duyar."
      />

      <SectionCard className="space-y-8 p-6 md:p-8">
        {/* BASICS */}
        <div>
          <Label required>İsim veya takma ad</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn: Ayşe"
            maxLength={40}
          />
          <p className="mt-1 text-xs text-ink-500">En az 2 karakter.</p>
        </div>

        <div>
          <Label required>Bu kişiyle ilişkin</Label>
          <div className="flex flex-wrap gap-2">
            {RELATIONS.map((r) => (
              <Chip key={r.key} active={relation === r.key} onClick={() => setRelation(r.key)}>
                {r.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <Label required>Cinsiyeti</Label>
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

        {/* INTERESTS */}
        <div>
          <Label required>İlgi alanları (virgülle ayır)</Label>
          <Textarea
            value={interestsRaw}
            onChange={(e) => setInterestsRaw(e.target.value)}
            placeholder="Örn: yoga, gitar çalmak, kedisi Pamuk, arkeoloji, seyahat"
            rows={3}
            maxLength={600}
          />
          <p className="mt-1 text-xs text-ink-500">
            {interests.length} geçerli — en az 3 gerekli, her biri 4+ karakter
          </p>
          {interests.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {interests.map((i, idx) => (
                <span key={idx} className="rounded-full bg-brand-500/10 px-3 py-1 text-xs text-brand-400">
                  {i}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* BEHAVIORS */}
        <div>
          <Label required>Davranış gözlemleri (her satıra bir tane)</Label>
          <Textarea
            value={behaviorsRaw}
            onChange={(e) => setBehaviorsRaw(e.target.value)}
            placeholder={"Örn:\nKişisel konularda açılmayı zor buluyor\nHafta sonları sosyal olmayı seviyor, hafta içi içine kapanık\nKariyerine çok odaklı, iş konusunda tutkulu"}
            rows={6}
            maxLength={2000}
          />
          <p className="mt-1 text-xs text-ink-500">
            {behaviors.length} geçerli davranış — en az 3 gerekli, her biri 15+ karakter
          </p>
        </div>

        {/* CONTEXT */}
        <div>
          <Label required>Nasıl tanıştınız, bağlam</Label>
          <Textarea
            value={contextNotes}
            onChange={(e) => setContextNotes(e.target.value)}
            placeholder="Örn: Geçen ay bir arkadaşımın doğum gününde tanıştık. 3 haftadır konuşuyoruz, birkaç kez randevuya çıktık. İlk izlenim iyiydi ama son zamanlarda mesajları seyrekleşti."
            rows={5}
            maxLength={2000}
          />
          <p className="mt-1 text-xs text-ink-500">
            {contextNotes.length} / 2000 — en az 80 karakter
          </p>
        </div>

        {/* ARCHETYPE */}
        <div className="space-y-6 rounded-xl border border-brand-500/20 bg-brand-500/5 p-5">
          <div>
            <p className="font-display italic text-brand-400 mb-2">arketip gözlemin —</p>
            <p className="text-xs text-ink-400">
              Bu kişiyi 3 boyutta tanımla. uyum analizinde senin profilin ile karşılaştırır.
            </p>
          </div>

          <div>
            <Label required>Dinamik tarzı</Label>
            <div className="space-y-2">
              {DYNAMIC_STYLES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setDynamicStyle(s.key)}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                    dynamicStyle === s.key
                      ? "border-brand-500 bg-brand-500/10"
                      : "border-ink-700 bg-ink-900/40 hover:border-ink-600"
                  }`}
                >
                  <p className={`text-sm font-medium ${dynamicStyle === s.key ? "text-brand-400" : "text-ink-100"}`}>
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label required>İfade tarzı</Label>
            <div className="flex flex-wrap gap-2">
              {EXPRESSION_STYLES.map((s) => (
                <Chip
                  key={s.key}
                  active={expressionStyle === s.key}
                  onClick={() => setExpressionStyle(s.key)}
                >
                  {s.label}
                </Chip>
              ))}
            </div>
            {expressionStyle && (
              <p className="mt-2 text-xs text-ink-400">
                {EXPRESSION_STYLES.find((s) => s.key === expressionStyle)?.desc}
              </p>
            )}
          </div>

          <div>
            <Label required>Enerjisi</Label>
            <div className="flex flex-wrap gap-2">
              {ENERGY_STYLES.map((s) => (
                <Chip
                  key={s.key}
                  active={relationshipEnergy === s.key}
                  onClick={() => setRelationshipEnergy(s.key)}
                >
                  {s.label}
                </Chip>
              ))}
            </div>
            {relationshipEnergy && (
              <p className="mt-2 text-xs text-ink-400">
                {ENERGY_STYLES.find((s) => s.key === relationshipEnergy)?.desc}
              </p>
            )}
          </div>
        </div>

        {/* AUTO-ANALYZE */}
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink-700 bg-ink-900/40 p-4">
          <input
            type="checkbox"
            checked={autoAnalyze}
            onChange={(e) => setAutoAnalyze(e.target.checked)}
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium text-ink-100">Kaydettikten sonra otomatik analiz et</p>
            <p className="mt-1 text-xs text-ink-400">
              Koç Big5, bağlanma stili ve iletişim tarzını otomatik çıkarır. ~4 saniye.
            </p>
          </div>
        </label>

        {error && <ErrorBanner message={error} />}

        <Button onClick={submit} disabled={!canSubmit || loading} fullWidth>
          {analyzing
            ? "analiz ediliyor..."
            : loading
              ? "kaydediliyor..."
              : "Hedefi oluştur & analiz et →"}
        </Button>
      </SectionCard>
    </div>
  );
}
