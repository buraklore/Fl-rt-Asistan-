import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  PageHeader,
  SectionCard,
  EmptyState,
  ButtonLink,
  StatTile,
} from "@/components/app/ui";
import { RecomputeScoreButton } from "@/components/app/recompute-score-button";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const supabase = await createSupabaseServerClient();

  // Load all targets with their latest scores + conflict counts
  const { data: targets } = await supabase
    .from("target_profiles")
    .select("id, name, relation, personality_type, attachment_style")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  const targetIds = (targets ?? []).map((t) => t.id);

  type ScoreRow = {
    id: string;
    target_id: string;
    compatibility: number;
    risks: unknown;
    strengths: unknown;
    computed_at: string;
    summary?: string | null;
  };

  const { data: scores } =
    targetIds.length > 0
      ? await supabase
          .from("relationship_scores")
          .select("*")
          .in("target_id", targetIds)
          .order("computed_at", { ascending: false })
      : { data: [] as ScoreRow[] };

  // Pick latest score per target
  const latestByTarget = new Map<string, ScoreRow>();
  for (const s of (scores ?? []) as ScoreRow[]) {
    if (!latestByTarget.has(s.target_id)) latestByTarget.set(s.target_id, s);
  }

  const { data: recentConflicts } = await supabase
    .from("conflict_analyses")
    .select("id, severity, root_cause, created_at, target_id")
    .order("created_at", { ascending: false })
    .limit(5);

  // Aggregate stats
  const scoresWithCompat = Array.from(latestByTarget.values());
  const avgCompat =
    scoresWithCompat.length > 0
      ? Math.round(
          scoresWithCompat.reduce((s, r) => s + r.compatibility, 0) /
            scoresWithCompat.length,
        )
      : null;

  return (
    <div className="mx-auto max-w-[1040px] px-10 py-12 pb-20">
      <PageHeader
        kicker="zamanla —"
        title="Analiz Paneli."
        description="Her hedefin için son 30 günün skoru, riskleri ve güçlü yanları tek bakışta."
      />

      {/* Aggregate stats — 3 col Claude Design */}
      <section className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatTile
          label="Toplam hedef"
          value={(targets ?? []).length}
          subtext={`${(targets ?? []).filter((t) => t.personality_type).length} analiz edildi`}
        />
        <StatTile
          label="Ortalama skor"
          value={avgCompat !== null ? `${avgCompat} / 100` : "—"}
          subtext={
            avgCompat !== null
              ? avgCompat >= 70
                ? "sağlıklı aralık"
                : "gelişim alanı"
              : "henüz skor yok"
          }
        />
        <StatTile
          label="Aktif çatışma"
          value={recentConflicts?.[0]?.severity ? `${recentConflicts[0].severity}` : "—"}
          subtext={
            recentConflicts?.[0]
              ? `ciddiyet ${recentConflicts[0].severity}/5`
              : "yok"
          }
        />
      </section>

      {/* Scores per target */}
      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl">Hedef skorları</h2>
        {(targets ?? []).length === 0 ? (
          <EmptyState
            title="Henüz hedef yok"
            description="Bir hedef oluştur, skoru hesaplat, burada analiz edelim."
            action={<ButtonLink href="/targets/new">Hedef oluştur</ButtonLink>}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {targets?.map((t) => {
              const score = latestByTarget.get(t.id);
              return (
                <div
                  key={t.id}
                  className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/40 transition hover:border-brand-500/40"
                >
                  <Link
                    href={`/targets/${t.id}`}
                    className="group block p-6"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <p className="font-display text-xl">
                          {t.name ?? "İsimsiz"}
                        </p>
                        <p className="text-xs uppercase tracking-widest text-ink-400">
                          {t.relation}
                        </p>
                      </div>
                      {score ? (
                        <div className="text-right">
                          <p className="font-display text-3xl text-brand-400">
                            {score.compatibility}
                          </p>
                          <p className="text-[10px] text-ink-500">/ 100 uyum</p>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-500">skor yok</span>
                      )}
                    </div>
                    {t.personality_type && (
                      <p className="mb-2 text-sm italic text-brand-400">
                        {t.personality_type}
                      </p>
                    )}
                    {score?.risks && (score.risks as unknown[]).length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-ink-500">
                          riskler
                        </p>
                        {(score.risks as Array<{ label: string }>)
                          .slice(0, 2)
                          .map((r, i) => (
                            <p key={i} className="text-xs text-ink-300">
                              ◆ {r.label}
                            </p>
                          ))}
                      </div>
                    )}
                  </Link>
                  <div className="flex items-center justify-end gap-2 border-t border-ink-800/60 bg-ink-950/30 px-5 py-3">
                    <RecomputeScoreButton
                      targetId={t.id}
                      hasScore={!!score}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent conflicts */}
      {recentConflicts && recentConflicts.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl">Son çatışmalar</h2>
          <div className="space-y-3">
            {recentConflicts.map((c) => (
              <SectionCard key={c.id} className="p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-ink-500">
                    {formatDate(c.created_at)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                      c.severity >= 7
                        ? "bg-red-500/10 text-red-300"
                        : c.severity >= 4
                          ? "bg-brand-500/10 text-brand-400"
                          : "bg-ink-800 text-ink-400"
                    }`}
                  >
                    ciddiyet {c.severity}/10
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-ink-200">
                  {c.root_cause}
                </p>
              </SectionCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
