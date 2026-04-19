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
  { key: "FEMALE", label: "Kadın" },
  { key: "MALE", label: "Erkek" },
  { key: "NONBINARY", label: "Non-binary" },
  { key: "UNSPECIFIED", label: "Belirtmek istemiyorum" },
] as const;

const AGE_RANGES = ["18-24", "25-34", "35-44", "45+"] as const;

export default function NewTargetPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [relation, setRelation] =
    useState<(typeof RELATIONS)[number]["key"] | null>(null);
  const [gender, setGender] =
    useState<(typeof GENDERS)[number]["key"] | null>(null);
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [interests, setInterests] = useState("");
  const [behaviors, setBehaviors] = useState("");
  const [contextNotes, setContextNotes] = useState("");
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = relation !== null && !loading;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relation) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.createTarget({
        name: name.trim() || undefined,
        relation,
        gender: gender ?? undefined,
        ageRange: ageRange ?? undefined,
        interests: interests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        behaviors: behaviors
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        contextNotes: contextNotes.trim() || undefined,
      });
      const targetId = res.data.id;

      if (autoAnalyze) {
        // Fire-and-forget; user can view the page while this runs
        api.analyzeTarget(targetId).catch(() => undefined);
      }

      router.push(`/targets/${targetId}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.problem.detail ?? err.problem.title : "Bir şeyler ters gitti.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <Link
        href="/targets"
        className="mb-6 inline-block text-sm text-ink-400 hover:text-ink-200"
      >
        ← Hedefler
      </Link>

      <PageHeader
        kicker="yeni profil —"
        title="Kim bu?"
        description="Ne kadar çok detay verirsen, analiz o kadar keskin olur. Hiçbir alan zorunlu değil, en azı yeter."
      />

      <form onSubmit={submit} className="space-y-6">
        <SectionCard className="space-y-6 p-6">
          <div>
            <Label>Takma ad (opsiyonel)</Label>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Cinsiyet</Label>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <Chip
                    key={g.key}
                    active={gender === g.key}
                    onClick={() =>
                      setGender((c) => (c === g.key ? null : g.key))
                    }
                  >
                    {g.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <Label>Yaş aralığı</Label>
              <div className="flex flex-wrap gap-2">
                {AGE_RANGES.map((r) => (
                  <Chip
                    key={r}
                    active={ageRange === r}
                    onClick={() =>
                      setAgeRange((c) => (c === r ? null : r))
                    }
                  >
                    {r}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="space-y-6 p-6">
          <div>
            <Label>İlgi alanları</Label>
            <Input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="virgülle ayır — örn: mimari, ramen, kedi"
            />
            <p className="mt-2 text-xs text-ink-500">
              En az bir, en fazla 15
            </p>
          </div>

          <div>
            <Label>Davranışlar</Label>
            <Textarea
              value={behaviors}
              onChange={(e) => setBehaviors(e.target.value)}
              placeholder={
                "her satıra bir davranış\n\nörn:\nderin konulardan kaçınıyor\nkısa cevaplar yazıyor\nmorning-person"
              }
              rows={5}
            />
          </div>

          <div>
            <Label>Serbest not</Label>
            <Textarea
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="örn: hinge'de eşleştik, 2 kez buluştuk, iyi sohbet ettik ama sonra soğudu"
              rows={3}
              maxLength={1000}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={autoAnalyze}
              onChange={(e) => setAutoAnalyze(e.target.checked)}
              className="mt-1 h-4 w-4 accent-brand-500"
            />
            <span className="text-sm text-ink-200">
              <span className="font-medium text-ink-100">
                Otomatik analiz et
              </span>
              <span className="mt-0.5 block text-xs text-ink-400">
                Kaydetme sonrası AI kişilik analizi başlatılır (Big5, bağlanma
                stili, çekim tetikleyicileri). Birkaç saniye sürer.
              </span>
            </span>
          </label>
        </SectionCard>

        {error && <ErrorBanner message={error} />}

        <div className="flex gap-3">
          <Button type="submit" disabled={!canSubmit}>
            {loading ? "kaydediliyor..." : "Oluştur"}
          </Button>
          <Link
            href="/targets"
            className="rounded-xl px-5 py-3 text-sm text-ink-300 hover:text-ink-100"
          >
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}
