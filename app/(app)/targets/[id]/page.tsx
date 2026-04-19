import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  PageHeader,
  SectionCard,
  ButtonLink,
  StatTile,
} from "@/components/app/ui";
import { TargetActions } from "./actions";
import { Big5Display } from "./big5-display";
import { RecomputeScoreButton } from "@/components/app/recompute-score-button";
import { ConfidenceBadge } from "@/components/app/confidence-badge";
import {
  CoachingAdvicePanel,
  type CoachingAdviceData,
} from "@/components/app/coaching-advice-panel";
import {
  DYNAMIC_LABELS,
  EXPRESSION_LABELS,
  ENERGY_LABELS,
} from "@/lib/schemas";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const RELATION_LABELS: Record<string, string> = {
  crush: "Crush",
  partner: "Partner",
  ex: "Eski sevgili",
  match: "Eşleşme",
  friend: "Arkadaş",
};

const ATTACHMENT_LABELS: Record<string, string> = {
  secure: "Güvenli",
  anxious: "Kaygılı",
  avoidant: "Kaçıngan",
  disorganized: "Düzensiz",
};

const ATTACHMENT_DESCRIPTIONS: Record<string, string> = {
  secure:
    "Yakınlık ve bağımsızlık arasında rahat, çatışmalarda yapıcı. Sağlam zemin.",
  anxious:
    "Onay ihtiyacı yüksek, belirsizlikte tetiklenir. Sürekli temas arar.",
  avoidant:
    "Bağımsızlığı çok korur, yakınlık arttıkça doğal olarak geri çekilir.",
  disorganized:
    "Yakınlık ve mesafe arasında çelişkili. İster-korkar örüntüsü gösterir.",
};

export default async function TargetDetailPage({ params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: target } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!target) notFound();

  const { data: score } = await supabase
    .from("relationship_scores")
    .select("*")
    .eq("target_id", id)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { count: genCount } = await supabase
    .from("message_generations")
    .select("*", { count: "exact", head: true })
    .eq("target_id", id);

  // Load user profile for sen-vs-o archetype comparison
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select(
      "own_dynamic_style, own_expression_style, own_relationship_energy, attracted_to_dynamic_styles, attracted_to_expression_styles, attracted_to_energies",
    )
    .eq("id", user.id)
    .maybeSingle();

  const hasAnalysis =
    target.personality_type &&
    target.big5 &&
    target.attachment_style &&
    target.communication_style;

  const hasArchetype =
    target.dynamic_style ||
    target.expression_style ||
    target.relationship_energy;

  const coachingAdvice = target.coaching_advice as CoachingAdviceData | null;

  // Archetype match signals
  const dynMatch =
    userProfile?.attracted_to_dynamic_styles &&
    target.dynamic_style &&
    (userProfile.attracted_to_dynamic_styles as string[]).includes(
      target.dynamic_style,
    );
  const expMatch =
    userProfile?.attracted_to_expression_styles &&
    target.expression_style &&
    (userProfile.attracted_to_expression_styles as string[]).includes(
      target.expression_style,
    );
  const nrgMatch =
    userProfile?.attracted_to_energies &&
    target.relationship_energy &&
    (userProfile.attracted_to_energies as string[]).includes(
      target.relationship_energy,
    );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:px-10">
      <Link
        href="/targets"
        className="mb-6 inline-block text-sm text-ink-400 hover:text-ink-200"
      >
        ← Hedefler
      </Link>

      <PageHeader
        kicker={RELATION_LABELS[target.relation] ?? target.relation}
        title={target.name ?? "İsimsiz"}
        action={<TargetActions targetId={target.id} hasAnalysis={!!hasAnalysis} />}
      />

      {/* Quick stats */}
      <section className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="uyum"
          value={score ? `${score.compatibility}` : "—"}
          subtext={score ? "/ 100" : "henüz yok"}
        />
        <StatTile label="üretim" value={genCount ?? 0} subtext="mesaj" />
        <StatTile
          label="bağlanma"
          value={
            target.attachment_style
              ? ATTACHMENT_LABELS[target.attachment_style] ?? "—"
              : "—"
          }
          subtext={target.attachment_style ? "stil" : "henüz yok"}
        />
        <StatTile
          label="güven"
          value={
            target.analysis_confidence
              ? `%${Math.round(target.analysis_confidence * 100)}`
              : "—"
          }
          subtext="analiz güveni"
        />
      </section>

      {/* Score card */}
      <section className="mb-12 overflow-hidden rounded-2xl border border-ink-800 bg-gradient-to-br from-ink-900/80 to-ink-950/80">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-400">
              ilişki skoru
            </p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-display text-6xl leading-none text-ink-100">
                {score ? score.compatibility : "—"}
              </span>
              <span className="text-xl text-ink-500">/ 100</span>
            </div>
            <p className="mt-2 text-sm text-ink-400">
              {score
                ? `Son hesaplama: ${new Date(score.computed_at).toLocaleDateString("tr-TR")}`
                : "Henüz skor hesaplanmadı."}
            </p>
            {score?.summary && (
              <p className="mt-3 max-w-lg text-sm italic leading-relaxed text-ink-200">
                &ldquo;{score.summary}&rdquo;
              </p>
            )}
          </div>
          <RecomputeScoreButton
            targetId={target.id}
            hasScore={!!score}
            size="md"
          />
        </div>
      </section>

      {/* Archetype + compatibility grid */}
      {hasArchetype && (
        <section className="mb-12">
          <h2 className="mb-4 font-display text-2xl">Arketip</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <ArchetypeCard
              axis="Dinamik"
              value={
                target.dynamic_style
                  ? DYNAMIC_LABELS[
                      target.dynamic_style as keyof typeof DYNAMIC_LABELS
                    ]
                  : null
              }
              match={!!dynMatch}
            />
            <ArchetypeCard
              axis="İfade"
              value={
                target.expression_style
                  ? EXPRESSION_LABELS[
                      target.expression_style as keyof typeof EXPRESSION_LABELS
                    ]
                  : null
              }
              match={!!expMatch}
            />
            <ArchetypeCard
              axis="Enerji"
              value={
                target.relationship_energy
                  ? ENERGY_LABELS[
                      target.relationship_energy as keyof typeof ENERGY_LABELS
                    ]
                  : null
              }
              match={!!nrgMatch}
            />
          </div>
          <p className="mt-3 text-xs text-ink-500">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
            yeşil = senin hoşlandığın tiple örtüşüyor
          </p>
        </section>
      )}

      {/* Analysis */}
      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl">Kişilik Analizi</h2>
        {hasAnalysis ? (
          <div className="space-y-4">
            {target.confidence_detail && (
              <ConfidenceBadge confidence={target.confidence_detail as never} />
            )}

            <SectionCard className="space-y-8 p-8">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-brand-400">
                  kişilik tipi
                </p>
                <p className="font-display text-3xl italic leading-tight text-ink-100">
                  {target.personality_type}
                </p>
              </div>

              {target.big5 && <Big5Display big5={target.big5 as never} />}

              {target.attachment_style && (
                <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-5">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-brand-400">
                    bağlanma stili —{" "}
                    {ATTACHMENT_LABELS[target.attachment_style] ?? target.attachment_style}
                  </p>
                  <p className="text-sm leading-relaxed text-ink-200">
                    {ATTACHMENT_DESCRIPTIONS[target.attachment_style] ??
                      "Açıklama yok."}
                  </p>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {target.communication_style && (
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
                      iletişim stili
                    </p>
                    <p className="text-sm leading-relaxed text-ink-200">
                      {target.communication_style}
                    </p>
                  </div>
                )}
                {target.attraction_triggers &&
                  (target.attraction_triggers as string[]).length > 0 && (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
                        çekim tetikleyicileri
                      </p>
                      <ul className="space-y-1">
                        {(target.attraction_triggers as string[]).map((t, i) => (
                          <li
                            key={i}
                            className="text-sm text-ink-200 before:mr-2 before:text-brand-500 before:content-['◆']"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </SectionCard>
          </div>
        ) : (
          <SectionCard className="p-8 text-center">
            <p className="mb-3 font-display italic text-brand-400">
              henüz analiz yok —
            </p>
            <p className="mb-6 text-sm text-ink-300">
              Koça bu kişiyi çözdür: Big5 kişilik, bağlanma stili,
              iletişim tarzı, çekim tetikleyicileri ve sana özel koçluk
              tavsiyeleri üretilir.
            </p>
          </SectionCard>
        )}
      </section>

      {/* Coaching Advice — THE NEW PANEL */}
      {coachingAdvice && (
        <section className="mb-12">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl">Sana Özel Koçluk</h2>
            <p className="text-xs italic text-ink-500">
              senin profiline göre üretildi
            </p>
          </div>
          <CoachingAdvicePanel advice={coachingAdvice} />
        </section>
      )}

      {/* Quick actions */}
      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl">Hızlı eylem</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <ButtonLink href={`/generate?targetId=${target.id}`} variant="primary">
            ✻ Mesaj üret
          </ButtonLink>
          <ButtonLink href={`/chat?targetId=${target.id}`} variant="secondary">
            ◊ Koçla konuş
          </ButtonLink>
          <ButtonLink
            href={`/conflicts?targetId=${target.id}`}
            variant="secondary"
          >
            ⟁ Çatışma onar
          </ButtonLink>
        </div>
      </section>

      {/* Context notes */}
      {target.context_notes && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-2xl">Bağlam notları</h2>
          <SectionCard className="p-6">
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-200">
              {target.context_notes}
            </p>
          </SectionCard>
        </section>
      )}

      {/* Tags */}
      {((target.interests as string[])?.length > 0 ||
        (target.behaviors as string[])?.length > 0) && (
        <section className="mb-10 grid gap-4 md:grid-cols-2">
          {(target.interests as string[])?.length > 0 && (
            <SectionCard className="p-6">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
                ilgi alanları
              </p>
              <div className="flex flex-wrap gap-2">
                {(target.interests as string[]).map((i) => (
                  <span
                    key={i}
                    className="rounded-full border border-ink-700 bg-ink-900/60 px-3 py-1 text-xs text-ink-200"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}
          {(target.behaviors as string[])?.length > 0 && (
            <SectionCard className="p-6">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
                davranış gözlemleri
              </p>
              <ul className="space-y-1">
                {(target.behaviors as string[]).map((b, i) => (
                  <li key={i} className="text-sm leading-relaxed text-ink-200">
                    — {b}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </section>
      )}
    </div>
  );
}

function ArchetypeCard({
  axis,
  value,
  match,
}: {
  axis: string;
  value: string | null;
  match: boolean;
}) {
  if (!value) {
    return (
      <SectionCard className="p-5 opacity-40">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-500">
          {axis}
        </p>
        <p className="mt-2 font-display text-lg italic text-ink-500">
          belirsiz
        </p>
      </SectionCard>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        match
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-ink-800 bg-ink-900/40"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400">
          {axis}
        </p>
        {match && (
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
        )}
      </div>
      <p className="font-display text-lg leading-tight text-ink-100">{value}</p>
      {match && (
        <p className="mt-2 text-xs italic text-emerald-400">
          hoşlandığın tiple örtüşüyor
        </p>
      )}
    </div>
  );
}
