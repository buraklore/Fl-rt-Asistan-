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
    <div className="mx-auto max-w-[1120px] px-10 py-8 pb-20">
      <Link
        href="/targets"
        className="mb-6 inline-block text-[14px] text-ink-400 hover:text-ink-200"
      >
        ← Hedefler
      </Link>

      <PageHeader
        kicker={(RELATION_LABELS[target.relation] ?? target.relation).toLowerCase()}
        title={target.name ?? "İsimsiz"}
        action={<TargetActions targetId={target.id} hasAnalysis={!!hasAnalysis} />}
      />

      {/* Quick stats — 4 tile grid */}
      <section className="mb-8 grid grid-cols-2 gap-[14px] md:grid-cols-4">
        <StatTile
          label="uyum"
          value={score ? `${score.compatibility}` : "—"}
          subtext={
            score
              ? `/100 · ${formatRel(score.computed_at)}`
              : "henüz yok"
          }
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
          subtext="analiz"
        />
      </section>

      {/* Big score card — pixel-perfect Claude Design */}
      <section className="mb-10">
        <div
          className="relative grid grid-cols-1 items-center gap-8 overflow-hidden rounded-[20px] border px-10 py-[34px] backdrop-blur-[8px] sm:grid-cols-[1fr_auto]"
          style={{
            borderColor: "rgba(225,29,72,0.3)",
            background:
              "linear-gradient(135deg, rgba(225,29,72,0.18) 0%, rgba(225,29,72,0.06) 38%, rgba(17,17,24,0.6) 100%)",
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute select-none font-display italic leading-none text-brand-400"
            style={{
              bottom: -56,
              right: 140,
              fontSize: 280,
              opacity: 0.06,
            }}
          >
            &rdquo;
          </span>

          <div className="relative">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-400">
              ilişki uyum skoru —
            </p>
            <p
              className="font-display tracking-tight text-ink-100"
              style={{ fontSize: 120, lineHeight: 0.92, letterSpacing: "-0.04em" }}
            >
              {score ? score.compatibility : "—"}
              <span className="text-ink-500" style={{ fontSize: 48 }}>
                {" "}
                /100
              </span>
            </p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.25em] text-ink-500">
              Son hesaplama:{" "}
              {score
                ? new Date(score.computed_at).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
            {score?.summary && (
              <p
                className="mt-[18px] max-w-[560px] font-display italic leading-[1.4] text-ink-200"
                style={{ fontSize: 20 }}
              >
                &ldquo;{score.summary}&rdquo;
              </p>
            )}
          </div>
          <div className="relative">
            <RecomputeScoreButton
              targetId={target.id}
              hasScore={!!score}
              size="md"
            />
          </div>
        </div>
      </section>

      {/* Archetype + compatibility grid */}
      {hasArchetype && (
        <section className="mb-12">
          <h2 className="m-0 font-display text-ink-100" style={{ fontWeight: 400, fontSize: 28, letterSpacing: "-0.01em", marginBottom: 16 }}>Arketip</h2>
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
        <h2 className="m-0 font-display text-ink-100" style={{ fontWeight: 400, fontSize: 28, letterSpacing: "-0.01em", marginBottom: 16 }}>Kişilik Analizi</h2>
        {hasAnalysis ? (
          <div className="space-y-4">
            {target.confidence_detail && (
              <ConfidenceBadge confidence={target.confidence_detail as never} />
            )}

            <SectionCard className="space-y-8 p-8">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-brand-400">
                  kişilik tipi
                </p>
                <p className="font-display text-3xl italic leading-tight text-ink-100">
                  {target.personality_type}
                </p>
              </div>

              {target.big5 && <Big5Display big5={target.big5 as never} />}

              {target.attachment_style && (
                <div
                  className="rounded-[14px] border p-5"
                  style={{
                    borderColor: "rgba(225,29,72,0.3)",
                    background:
                      "linear-gradient(135deg, rgba(225,29,72,0.12), rgba(225,29,72,0.03))",
                  }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-400">
                    bağlanma stili
                  </p>
                  <p
                    className="mb-[10px] mt-2 font-display italic text-ink-100"
                    style={{ fontSize: 26 }}
                  >
                    {ATTACHMENT_LABELS[target.attachment_style] ??
                      target.attachment_style}
                  </p>
                  <p className="text-[14px] leading-[1.6] text-ink-200">
                    {ATTACHMENT_DESCRIPTIONS[target.attachment_style] ??
                      "Açıklama yok."}
                  </p>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {target.communication_style && (
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-400">
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
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-400">
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
            <h2 className="m-0 font-display text-ink-100" style={{ fontWeight: 400, fontSize: 28, letterSpacing: "-0.01em" }}>Sana Özel Koçluk</h2>
            <p className="text-xs italic text-ink-500">
              senin profiline göre üretildi
            </p>
          </div>
          <CoachingAdvicePanel advice={coachingAdvice} />
        </section>
      )}

      {/* Quick actions */}
      <section className="mb-12">
        <h2 className="m-0 font-display text-ink-100" style={{ fontWeight: 400, fontSize: 28, letterSpacing: "-0.01em", marginBottom: 16 }}>Hızlı eylem</h2>
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
          <h2 className="m-0 font-display text-ink-100" style={{ fontWeight: 400, fontSize: 28, letterSpacing: "-0.01em", marginBottom: 16 }}>Bağlam notları</h2>
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
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-400">
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
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-400">
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
      <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5 opacity-40">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-500">
          {axis}
        </p>
        <p className="mt-[14px] font-display italic text-ink-500" style={{ fontSize: 22 }}>
          belirsiz
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5 backdrop-blur-[8px]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-500">
        {axis}
      </p>
      <div className="mt-[14px] flex items-center justify-between">
        <p
          className="font-display italic text-ink-100"
          style={{ fontSize: 22 }}
        >
          {value}
        </p>
        <span
          className="inline-block h-[10px] w-[10px] rounded-full"
          style={{
            background: match ? "#34d399" : "#6A5070",
            boxShadow: match ? "0 0 12px rgba(52,211,153,0.5)" : "none",
          }}
        />
      </div>
    </div>
  );
}

function formatRel(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "bugün";
  if (days < 7) return `${days} gün önce`;
  if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}
