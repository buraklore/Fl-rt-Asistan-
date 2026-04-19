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

const DYNAMIC_STYLES = [
  { key: "dominant-leading", label: "Dominant & Yönlendiren" },
  { key: "dominant-caring", label: "Dominant & Destekleyen" },
  { key: "balanced-mutual", label: "Dengeli & Karşılıklı" },
  { key: "yielding-follower", label: "Takip eden & Teslim olan" },
  { key: "independent-distant", label: "Bağımsız & Mesafeli" },
] as const;

const EXPRESSION_STYLES = [
  { key: "masculine", label: "Eril" },
  { key: "feminine", label: "Dişil" },
  { key: "androgynous", label: "Androjen" },
] as const;

const ENERGY_STYLES = [
  { key: "intense-passionate", label: "Tutkulu & Yoğun" },
  { key: "calm-stable", label: "Sakin & Stabil" },
  { key: "playful-light", label: "Oyuncu & Hafif" },
  { key: "deep-intellectual", label: "Derin & Entelektüel" },
] as const;

export function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [interestsText, setInterestsText] = useState("");
  const [communicationStyle, setCommunicationStyle] = useState("");
  const [attachmentStyle, setAttachmentStyle] = useState<string | null>(null);
  const [relationshipGoal, setRelationshipGoal] = useState<string | null>(null);
  const [rawBio, setRawBio] = useState("");
  const [ownDynamic, setOwnDynamic] = useState<string | null>(null);
  const [ownExpression, setOwnExpression] = useState<string | null>(null);
  const [ownEnergy, setOwnEnergy] = useState<string | null>(null);
  const [attractedDynamic, setAttractedDynamic] = useState<string[]>([]);
  const [attractedExpression, setAttractedExpression] = useState<string[]>([]);
  const [attractedEnergy, setAttractedEnergy] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getMyProfile();
        const p = res.data as Record<string, unknown>;
        setDisplayName((p.display_name as string) ?? "");
        setGender((p.gender as string) ?? null);
        setAgeRange((p.age_range as string) ?? null);
        setInterestsText(((p.interests as string[]) ?? []).join(", "));
        setCommunicationStyle((p.communication_style as string) ?? "");
        setAttachmentStyle((p.attachment_style as string) ?? null);
        setRelationshipGoal((p.relationship_goal as string) ?? null);
        setRawBio((p.raw_bio as string) ?? "");
        setOwnDynamic((p.own_dynamic_style as string) ?? null);
        setOwnExpression((p.own_expression_style as string) ?? null);
        setOwnEnergy((p.own_relationship_energy as string) ?? null);
        setAttractedDynamic((p.attracted_to_dynamic_styles as string[]) ?? []);
        setAttractedExpression((p.attracted_to_expression_styles as string[]) ?? []);
        setAttractedEnergy((p.attracted_to_energies as string[]) ?? []);
      } catch (err) {
        if (!(err instanceof ApiError)) console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const body: UpdateUserProfileRequest = {
        displayName: displayName.trim() || undefined,
        gender: (gender ?? undefined) as UpdateUserProfileRequest["gender"],
        ageRange: (ageRange ?? undefined) as UpdateUserProfileRequest["ageRange"],
        interests: interestsText
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length >= 4),
        communicationStyle: communicationStyle.trim() || undefined,
        attachmentStyle: (attachmentStyle ??
          undefined) as UpdateUserProfileRequest["attachmentStyle"],
        relationshipGoal: (relationshipGoal ??
          undefined) as UpdateUserProfileRequest["relationshipGoal"],
        rawBio: rawBio.trim() || undefined,
        ownDynamicStyle: (ownDynamic ??
          undefined) as UpdateUserProfileRequest["ownDynamicStyle"],
        ownExpressionStyle: (ownExpression ??
          undefined) as UpdateUserProfileRequest["ownExpressionStyle"],
        ownRelationshipEnergy: (ownEnergy ??
          undefined) as UpdateUserProfileRequest["ownRelationshipEnergy"],
        attractedToDynamicStyles:
          attractedDynamic.length > 0
            ? (attractedDynamic as never[])
            : undefined,
        attractedToExpressionStyles:
          attractedExpression.length > 0
            ? (attractedExpression as never[])
            : undefined,
        attractedToEnergies:
          attractedEnergy.length > 0
            ? (attractedEnergy as never[])
            : undefined,
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
        Profili istediğin zaman güncelleyebilirsin. Her değişiklik AI çıktılarını
        daha doğru hale getirir.
      </p>

      <div>
        <Label>Takma ad</Label>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Sana nasıl hitap etmemizi istersin"
          maxLength={40}
        />
      </div>

      <div>
        <Label>Cinsiyet</Label>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <Chip key={g.key} active={gender === g.key} onClick={() => setGender(g.key)}>
              {g.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Label>Yaş aralığı</Label>
        <div className="flex flex-wrap gap-2">
          {AGE_RANGES.map((a) => (
            <Chip key={a} active={ageRange === a} onClick={() => setAgeRange(a)}>
              {a}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Label>İlgi alanların (virgülle ayır)</Label>
        <Textarea
          value={interestsText}
          onChange={(e) => setInterestsText(e.target.value)}
          placeholder="fotoğraf, gitar, eski filmler, yürüyüş"
          rows={3}
          maxLength={600}
        />
      </div>

      <div>
        <Label>İletişim stilin</Label>
        <Textarea
          value={communicationStyle}
          onChange={(e) => setCommunicationStyle(e.target.value)}
          placeholder="Direkt mi, dolaylı mı? Espirili mi, ciddi mi? Kısa mı, uzun mu?"
          rows={4}
          maxLength={500}
        />
      </div>

      <div>
        <Label>Bağlanma stilin</Label>
        <div className="space-y-2">
          {ATTACHMENT_STYLES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setAttachmentStyle(s.key)}
              className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                attachmentStyle === s.key
                  ? "border-brand-500 bg-brand-500/10"
                  : "border-ink-700 bg-ink-900/40"
              }`}
            >
              <p className={`text-sm font-medium ${attachmentStyle === s.key ? "text-brand-400" : "text-ink-100"}`}>
                {s.label}
              </p>
              <p className="mt-0.5 text-xs text-ink-400">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>İlişki hedefi</Label>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g) => (
            <Chip key={g.key} active={relationshipGoal === g.key} onClick={() => setRelationshipGoal(g.key)}>
              {g.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* ARCHETYPE */}
      <div className="space-y-6 rounded-xl border border-brand-500/20 bg-brand-500/5 p-5">
        <p className="font-display italic text-brand-400">arketipin —</p>

        <div>
          <Label>Dinamik tarzın</Label>
          <div className="flex flex-wrap gap-2">
            {DYNAMIC_STYLES.map((s) => (
              <Chip key={s.key} active={ownDynamic === s.key} onClick={() => setOwnDynamic(s.key)}>
                {s.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <Label>Hoşlandığın dinamik tarz(lar) — 1-3 seçim</Label>
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

        <div>
          <Label>İfade tarzın</Label>
          <div className="flex flex-wrap gap-2">
            {EXPRESSION_STYLES.map((s) => (
              <Chip key={s.key} active={ownExpression === s.key} onClick={() => setOwnExpression(s.key)}>
                {s.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <Label>Hoşlandığın ifade tarz(lar) — 1-2 seçim</Label>
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

        <div>
          <Label>Enerjin</Label>
          <div className="flex flex-wrap gap-2">
            {ENERGY_STYLES.map((s) => (
              <Chip key={s.key} active={ownEnergy === s.key} onClick={() => setOwnEnergy(s.key)}>
                {s.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <Label>Hoşlandığın enerji — 1-2 seçim</Label>
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
      </div>

      <div>
        <Label>Kendin hakkında</Label>
        <Textarea
          value={rawBio}
          onChange={(e) => setRawBio(e.target.value)}
          placeholder="Kim olduğun, ne önemsediğin, nasıl bir ilişki aradığın — serbest yaz. AI bunu okur ve sana göre ayarlar."
          rows={6}
          maxLength={2000}
        />
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex items-center gap-4">
        <Button onClick={save} disabled={saving}>
          {saving ? "kaydediliyor..." : "Değişiklikleri kaydet"}
        </Button>
        {saved && (
          <p className="text-sm text-brand-400">✓ kaydedildi</p>
        )}
      </div>
    </div>
  );
}
