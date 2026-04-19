import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  PageHeader,
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

      {/* Hedef skorları — Claude Design InsightCard layout */}
      <section className="mb-12">
        {(targets ?? []).length === 0 ? (
          <EmptyState
            title="Henüz hedef yok"
            description="Bir hedef oluştur, skoru hesaplat, burada analiz edelim."
            action={<ButtonLink href="/targets/new">Hedef oluştur</ButtonLink>}
          />
        ) : (
          <div className="grid gap-4">
            {targets?.map((t) => {
              const score = latestByTarget.get(t.id);
              const strengths =
                (score?.strengths as Array<{ label: string }> | undefined) ?? [];
              const risks =
                (score?.risks as Array<{ label: string }> | undefined) ?? [];

              return (
                <div
                  key={t.id}
                  className="rounded-2xl border border-ink-800 bg-ink-900/40 p-7 backdrop-blur-[8px] transition hover:border-brand-500/30"
                >
                  <div className="grid grid-cols-1 items-center gap-7 md:grid-cols-[1fr_1.1fr]">
                    {/* Left: name + score + sparkline */}
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <p
                          className="font-display text-ink-100"
                          style={{ fontSize: 28 }}
                        >
                          {t.name ?? "İsimsiz"}
                        </p>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-400">
                          {t.relation}
                        </span>
                      </div>
                      {t.personality_type && (
                        <p className="font-display text-[12px] italic text-ink-400">
                          {t.personality_type}
                        </p>
                      )}
                      <div className="mt-[18px] flex items-baseline gap-[14px]">
                        <p
                          className="font-display text-ink-100"
                          style={{
                            fontSize: 72,
                            lineHeight: 0.9,
                            letterSpacing: "-0.03em",
                          }}
                        >
                          {score ? score.compatibility : "—"}
                        </p>
                        <span className="text-[14px] text-ink-400">/ 100</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/targets/${t.id}`}
                          className="rounded-full border border-ink-700 bg-ink-900/60 px-4 py-[6px] text-[12px] text-ink-200 transition hover:border-ink-600"
                        >
                          Detay →
                        </Link>
                        <RecomputeScoreButton
                          targetId={t.id}
                          hasScore={!!score}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Right: strengths + risks */}
                    <div className="grid gap-4">
                      <div>
                        <p
                          className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em]"
                          style={{ color: "#10B981" }}
                        >
                          — güçlü yanlar
                        </p>
                        {strengths.length > 0 ? (
                          <ul className="m-0 grid list-none gap-[6px] p-0">
                            {strengths.slice(0, 3).map((s, i) => (
                              <li
                                key={i}
                                className="flex gap-[10px] text-[14px] text-ink-200"
                              >
                                <span style={{ color: "#10B981" }}>●</span>
                                {s.label}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[13px] text-ink-500">
                            henüz analiz yok
                          </p>
                        )}
                      </div>
                      <div>
                        <p
                          className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em]"
                          style={{ color: "#F87171" }}
                        >
                          — riskler
                        </p>
                        {risks.length > 0 ? (
                          <ul className="m-0 grid list-none gap-[6px] p-0">
                            {risks.slice(0, 3).map((r, i) => (
                              <li
                                key={i}
                                className="flex gap-[10px] text-[14px] text-ink-200"
                              >
                                <span style={{ color: "#F87171" }}>●</span>
                                {r.label}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[13px] text-ink-500">
                            henüz analiz yok
                          </p>
                        )}
                      </div>
                    </div>
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
          <h2
            className="mb-4 font-display text-ink-100"
            style={{ fontSize: 28, letterSpacing: "-0.01em" }}
          >
            Son çatışmalar
          </h2>
          <div className="grid gap-3">
            {recentConflicts.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] text-ink-500">
                    {formatDate(c.created_at)}
                  </span>
                  <span
                    className="rounded-full px-[10px] py-[3px] text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{
                      border: "1px solid rgba(225,29,72,0.3)",
                      background: "rgba(225,29,72,0.1)",
                      color: "#F7A8B8",
                    }}
                  >
                    ciddiyet {c.severity}/5
                  </span>
                </div>
                <p className="line-clamp-2 text-[14px] leading-[1.55] text-ink-200">
                  {c.root_cause}
                </p>
              </div>
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
