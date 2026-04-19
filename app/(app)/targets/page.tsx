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
    <div className="mx-auto max-w-[820px] px-10 py-12 pb-20">
      <Link href="/targets" className="text-[13px] text-ink-400 hover:text-ink-200">
        ← Hedefler
      </Link>
      <div className="mt-4">
        <PageHeader
          kicker="yeni analiz —"
          title="Yeni hedef oluştur."
          description="Ne kadar bilgi verirsen analiz o kadar güvenilir olur. En az bağlam 80 karakter, 3 davranış gözlemi önerilir."
        />
      </div>

      <div className="grid gap-8">
        {/* BASICS */}
        <Section title="temel">
          <div className="grid gap-4">
            <div>
              <Label required>isim (takma olabilir)</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ayşe"
                maxLength={40}
              />
            </div>

            <div>
              <Label required>ilişki türü</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {RELATIONS.map((r) => (
                  <MiniCard
                    key={r.key}
                    active={relation === r.key}
                    onClick={() => setRelation(r.key)}
                  >
                    {r.label}
                  </MiniCard>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>cinsiyet</Label>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((g) => (
                    <Chip
                      key={g.key}
                      active={gender === g.key}
                      onClick={() => setGender(g.key)}
                    >
                      {g.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <Label>yaş aralığı</Label>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((a) => (
                    <Chip
                      key={a.key}
                      active={ageRange === a.key}
                      onClick={() => setAgeRange(a.key)}
                    >
                      {a.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* INTERESTS */}
        <Section title="ilgi alanları" hint="en az 3 ekle — koç konu önerileri üretir">
          <Textarea
            value={interestsRaw}
            onChange={(e) => setInterestsRaw(e.target.value)}
            placeholder="Virgülle ayır: matcha, vintage, gece yürüyüşü, psikoloji..."
            rows={3}
            maxLength={600}
          />
          <p className="mt-2 text-[11px] text-ink-500">
            {interests.length} geçerli — en az 3 gerekli, her biri 4+ karakter
          </p>
          {interests.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {interests.map((i, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-brand-700 bg-brand-500/10 px-[12px] py-[6px] text-[13px] text-brand-300"
                >
                  {i}
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* BEHAVIORS */}
        <Section
          title="davranış kalıpları"
          hint="en az 3 gözlem — ne yapar, nasıl tepki verir"
        >
          <Textarea
            value={behaviorsRaw}
            onChange={(e) => setBehaviorsRaw(e.target.value)}
            placeholder={"Her satıra bir tane:\nmesaja geç cevap verir, önce üç nokta\ntartışmada sessizleşir\nhafta sonları sosyal, hafta içi içine kapanık"}
            rows={6}
            maxLength={2000}
          />
          <p className="mt-2 text-[11px] text-ink-500">
            {behaviors.length} geçerli davranış — en az 3 gerekli, her biri 15+
            karakter
          </p>
          {behaviors.length > 0 && (
            <div className="mt-3 grid gap-2">
              {behaviors.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-[12px] border border-ink-800 bg-ink-900/40 px-[14px] py-[10px]"
                >
                  <span className="text-brand-500">◆</span>
                  <span className="flex-1 text-[14px] text-ink-200">{p}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* CONTEXT */}
        <Section
          title="bağlam notları"
          hint="min 80 karakter — nerede tanıştınız, son ne oldu, ne hissediyorsun"
        >
          <Textarea
            value={contextNotes}
            onChange={(e) => setContextNotes(e.target.value)}
            placeholder="bir arkadaş ortamında tanıştık. 3 haftadır konuşuyoruz, 2 kez buluştuk. son buluşmadan sonra mesajları soğudu…"
            rows={5}
            maxLength={2000}
          />
          <p
            className="mt-2 text-[11px]"
            style={{
              color: contextNotes.length < 80 ? "#fbbf24" : "#10B981",
            }}
          >
            {contextNotes.length} / 80 karakter{" "}
            {contextNotes.length < 80 ? "· biraz daha" : "· yeterli"}
          </p>
        </Section>

        {/* ARCHETYPE */}
        <Section title="arketip (onu tarif et)">
          <div className="grid gap-5">
            <div>
              <Label required>dinamik</Label>
              <div className="space-y-2">
                {DYNAMIC_STYLES.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setDynamicStyle(s.key)}
                    className={`w-full rounded-[12px] border px-4 py-3 text-left transition ${
                      dynamicStyle === s.key
                        ? "border-brand-500 bg-brand-500/10"
                        : "border-ink-700 bg-ink-900/40 hover:border-ink-600"
                    }`}
                  >
                    <p
                      className={`text-[14px] font-medium ${
                        dynamicStyle === s.key ? "text-brand-400" : "text-ink-100"
                      }`}
                    >
                      {s.label}
                    </p>
                    <p className="mt-1 text-[12px] text-ink-400">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label required>ifade</Label>
              <div className="grid grid-cols-3 gap-2">
                {EXPRESSION_STYLES.map((s) => (
                  <MiniCard
                    key={s.key}
                    active={expressionStyle === s.key}
                    onClick={() => setExpressionStyle(s.key)}
                  >
                    {s.label}
                  </MiniCard>
                ))}
              </div>
              {expressionStyle && (
                <p className="mt-2 text-[12px] text-ink-400">
                  {EXPRESSION_STYLES.find((s) => s.key === expressionStyle)?.desc}
                </p>
              )}
            </div>

            <div>
              <Label required>enerji</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ENERGY_STYLES.map((s) => (
                  <MiniCard
                    key={s.key}
                    active={relationshipEnergy === s.key}
                    onClick={() => setRelationshipEnergy(s.key)}
                  >
                    {s.label}
                  </MiniCard>
                ))}
              </div>
              {relationshipEnergy && (
                <p className="mt-2 text-[12px] text-ink-400">
                  {ENERGY_STYLES.find((s) => s.key === relationshipEnergy)?.desc}
                </p>
              )}
            </div>
          </div>
        </Section>

        {/* Auto-analyze */}
        <label className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-ink-700 bg-ink-900/40 p-4">
          <input
            type="checkbox"
            checked={autoAnalyze}
            onChange={(e) => setAutoAnalyze(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand-500"
          />
          <div>
            <p className="text-[14px] font-medium text-ink-100">
              Kaydettikten sonra otomatik analiz et
            </p>
            <p className="mt-1 text-[12px] text-ink-400">
              Koç Big5, bağlanma stili ve iletişim tarzını otomatik çıkarır. ~4
              saniye.
            </p>
          </div>
        </label>

        {error && <ErrorBanner message={error} />}

        <div className="flex gap-3">
          <Link
            href="/targets"
            className="rounded-full border border-ink-700 bg-ink-900/40 px-5 py-3 text-[14px] text-ink-200 transition hover:border-ink-600"
          >
            İptal
          </Link>
          <Button onClick={submit} disabled={!canSubmit || loading} fullWidth>
            {analyzing
              ? "analiz ediliyor…"
              : loading
              ? "kaydediliyor…"
              : "Oluştur & analiz et →"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Section wrapper — Claude Design style
// ============================================================
function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-400">
          — {title}
        </p>
        {hint && <p className="mt-[6px] text-[13px] text-ink-400">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

// ============================================================
// MiniCard
// ============================================================
function MiniCard({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[12px] border px-3 py-[10px] text-[13px] transition ${
        active
          ? "border-brand-500 bg-brand-500/10 text-brand-400"
          : "border-ink-700 bg-ink-900/40 text-ink-200 hover:border-ink-600 hover:text-ink-100"
      }`}
    >
      {children}
    </button>
  );
}
