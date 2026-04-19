"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { UpdateUserProfileRequest } from "@/lib/schemas";
import {
  Label,
  Input,
  Textarea,
  Button,
  Chip,
  ErrorBanner,
} from "@/components/app/ui";

const GENDERS = [
  { key: "female", label: "Kadın" },
  { key: "male", label: "Erkek" },
  { key: "nonbinary", label: "Non-binary" },
  { key: "unspecified", label: "Belirtmek istemiyorum" },
] as const;

const AGE_RANGES = ["18-24", "25-34", "35-44", "45+"];

const ATTACHMENT_STYLES = [
  { key: "secure", label: "Güvenli", desc: "Rahat, dengeli bağlanma" },
  { key: "anxious", label: "Kaygılı", desc: "Cevap beklerken tedirgin olursun" },
  { key: "avoidant", label: "Kaçıngan", desc: "Bağımsızlığı çok korursun" },
  { key: "disorganized", label: "Düzensiz", desc: "Yakınlık + mesafe arada gidip geliyor" },
] as const;

const GOALS = [
  { key: "dating", label: "Yeni biriyle tanışmak" },
  { key: "long-term", label: "Uzun vadeli ilişki" },
  { key: "reconnect", label: "Eski bağlantıyı canlandırmak" },
  { key: "conflict", label: "Tartışmayı onarmak" },
  { key: "friend", label: "Arkadaşlık geliştirmek" },
] as const;

/**
 * Profile editor that loads existing values and saves diffs.
 * Invisible until data loads; skeleton while loading.
 */
export function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [interestsText, setInterestsText] = useState("");
  const [communicationStyle, setCommunicationStyle] = useState("");
  const [attachmentStyle, setAttachmentStyle] = useState<string | null>(null);
  const [relationshipGoal, setRelationshipGoal] = useState<string | null>(null);
  const [rawBio, setRawBio] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getMyProfile();
        const p = res.data;
        setDisplayName(p.display_name ?? "");
        setGender(p.gender ?? null);
        setAgeRange(p.age_range ?? null);
        setInterestsText((p.interests ?? []).join(", "));
        setCommunicationStyle(p.communication_style ?? "");
        setAttachmentStyle(p.attachment_style ?? null);
        setRelationshipGoal(p.relationship_goal ?? null);
        setRawBio(p.raw_bio ?? "");
      } catch (err) {
        if (!(err instanceof ApiError)) console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const body: UpdateUserProfileRequest = {
        displayName: displayName.trim() || undefined,
        gender: (gender ?? undefined) as UpdateUserProfileRequest["gender"],
        ageRange: ageRange ?? undefined,
        interests: interestsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        communicationStyle: communicationStyle.trim() || undefined,
        attachmentStyle: (attachmentStyle ??
          undefined) as UpdateUserProfileRequest["attachmentStyle"],
        relationshipGoal: relationshipGoal ?? undefined,
        rawBio: rawBio.trim() || undefined,
      };
      await api.updateMyProfile(body);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.problem.detail ?? err.problem.title ?? "Kaydedilemedi."
          : "Kaydedilemedi.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-10 animate-pulse rounded bg-ink-800" />
        <div className="h-24 animate-pulse rounded bg-ink-800" />
        <div className="h-10 animate-pulse rounded bg-ink-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-300">
        Kendini ne kadar iyi tanıtırsan, AI sana o kadar iyi yardım eder.
        Uyum skoru ve mesaj önerileri senin stiline göre kalibrelenir.
        Her alan opsiyonel.
      </p>

      <div>
        <Label>Takma ad</Label>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Sana nasıl hitap etmemizi istersin"
        />
      </div>

      <div>
        <Label>Cinsiyet</Label>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <Chip
              key={g.key}
              active={gender === g.key}
              onClick={() => setGender(gender === g.key ? null : g.key)}
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
              onClick={() => setAgeRange(ageRange === r ? null : r)}
            >
              {r}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Label>İlgi alanların</Label>
        <Input
          value={interestsText}
          onChange={(e) => setInterestsText(e.target.value)}
          placeholder="virgülle ayır: müzik, tırmanış, film, felsefe"
        />
        <p className="mt-1 text-xs text-ink-500">En fazla 20</p>
      </div>

      <div>
        <Label>İlişkideki hedefin</Label>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g) => (
            <Chip
              key={g.key}
              active={relationshipGoal === g.key}
              onClick={() =>
                setRelationshipGoal(relationshipGoal === g.key ? null : g.key)
              }
            >
              {g.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Label>Bağlanma stilin</Label>
        <p className="mb-3 text-xs text-ink-500">
          Kendi düşüncen, bir test değil. Emin değilsen boş bırak.
        </p>
        <div className="space-y-2">
          {ATTACHMENT_STYLES.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() =>
                setAttachmentStyle(attachmentStyle === a.key ? null : a.key)
              }
              className={`w-full rounded-xl border p-3 text-left transition ${
                attachmentStyle === a.key
                  ? "border-brand-500 bg-brand-500/10"
                  : "border-ink-700 hover:border-ink-600"
              }`}
            >
              <span className="text-sm font-medium text-ink-100">{a.label}</span>
              <span className="ml-2 text-xs text-ink-400">— {a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>İletişim stilin</Label>
        <Input
          value={communicationStyle}
          onChange={(e) => setCommunicationStyle(e.target.value)}
          placeholder="direkt / dolaylı / şakacı / yazılı olarak daha iyi ifade ederim..."
        />
      </div>

      <div>
        <Label>Kendin hakkında</Label>
        <Textarea
          value={rawBio}
          onChange={(e) => setRawBio(e.target.value)}
          placeholder="Kim olduğun, ne önemsediğin, nasıl bir ilişki aradığın — serbest yaz. AI bunu okur ve sana göre ayarlar."
          rows={5}
        />
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "kaydediliyor..." : "Kaydet"}
        </Button>
        {saved && (
          <span className="text-sm text-brand-400">✓ kaydedildi</span>
        )}
      </div>
    </div>
  );
}
