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

export default async function TargetDetailPage({ params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

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

  const hasAnalysis =
    target.personality_type &&
    target.big5 &&
    target.attachment_style &&
    target.communication_style;

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

      {/* Recompute score trigger */}
      <section className="mb-10 flex items-center justify-between rounded-2xl border border-ink-800 bg-ink-900/40 px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400">
            ilişki skoru
          </p>
          <p className="mt-1 text-sm text-ink-300">
            {score
              ? `Son hesaplama: ${new Date(score.computed_at).toLocaleDateString("tr-TR")}`
              : "Henüz skor hesaplanmadı."}
          </p>
        </div>
        <RecomputeScoreButton targetId={target.id} hasScore={!!score} size="md" />
      </section>

      {/* Analysis */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl">Kişilik Analizi</h2>
        {hasAnalysis ? (
          <SectionCard className="space-y-6 p-8">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-brand-400">
                kişilik tipi
              </p>
              <p className="font-display text-3xl italic leading-tight text-ink-100">
                {target.personality_type}
              </p>
            </div>

            {target.big5 && <Big5Display big5={target.big5 as never} />}

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
        ) : (
          <SectionCard className="p-8 text-center">
            <p className="mb-3 font-display italic text-brand-400">
              henüz analiz yok —
            </p>
            <p className="mb-6 text-sm text-ink-300">
              AI&apos;ya bu kişiyi çözdür: Big5 kişilik, bağlanma stili,
              iletişim tarzı ve çekim tetikleyicileri.
            </p>
          </SectionCard>
        )}
      </section>

      {/* Context notes */}
      {target.context_notes && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-2xl">Notlar</h2>
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
                davranışlar
              </p>
              <ul className="space-y-1">
                {(target.behaviors as string[]).map((b, i) => (
                  <li key={i} className="text-sm text-ink-200">
                    — {b}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </section>
      )}

      {/* Quick actions */}
      <section>
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
    </div>
  );
}
