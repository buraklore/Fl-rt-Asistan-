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

      {/* Hedef skorları — Claude Design InsightCard layout birebir */}
      <section className="mb-12">
        {(targets ?? []).length === 0 ? (
          <EmptyState
            title="Henüz hedef yok"
            description="Bir hedef oluştur, skoru hesaplat, burada analiz edelim."
            action={<ButtonLink href="/targets/new">Hedef oluştur</ButtonLink>}
          />
        ) : (
          <div className="grid" style={{ gap: 16 }}>
            {targets?.map((t) => {
              const score = latestByTarget.get(t.id);
              const strengths =
                (score?.strengths as Array<{ label: string }> | undefined) ?? [];
              const risks =
                (score?.risks as Array<{ label: string }> | undefined) ?? [];

              // Seeded sparkline data — 30 day trend placeholder
              const seed = (t.name ?? "?").charCodeAt(0);
              const baseScore = score?.compatibility ?? 50;
              const points = Array.from({ length: 30 }, (_, i) => {
                const wave = Math.sin(i / 4 + seed) * 8;
                const drift = (i - 15) * (seed % 3 === 0 ? -0.2 : 0.25);
                return Math.max(20, Math.min(100, baseScore + wave + drift));
              });
              const delta = Math.round(points[points.length - 1] - points[0]);
              const up = delta >= 0;

              return (
                <div
                  key={t.id}
                  className="rounded-[20px] border border-ink-800 bg-ink-900/40 backdrop-blur-[8px] transition-all duration-[160ms] hover:border-brand-500/30"
                  style={{ padding: 28 }}
                >
                  <div
                    className="grid grid-cols-1 items-center md:grid-cols-[1fr_1.1fr]"
                    style={{ gap: 28 }}
                  >
                    {/* Left: name + score + sparkline */}
                    <div>
                      <div
                        className="flex items-center justify-between"
                        style={{ marginBottom: 4 }}
                      >
                        <p
                          className="m-0 font-display text-ink-100"
                          style={{ fontSize: 28 }}
                        >
                          {t.name ?? "İsimsiz"}
                        </p>
                        <span
                          className="uppercase text-brand-400"
                          style={{
                            fontSize: 10,
                            letterSpacing: "0.25em",
                          }}
                        >
                          {t.relation}
                        </span>
                      </div>
                      {t.personality_type && (
                        <p
                          className="m-0 font-display italic text-ink-400"
                          style={{ fontSize: 12 }}
                        >
                          {t.personality_type}
                        </p>
                      )}
                      <div
                        className="flex items-baseline"
                        style={{ gap: 14, marginTop: 18 }}
                      >
                        <p
                          className="m-0 font-display text-ink-100"
                          style={{
                            fontSize: 72,
                            lineHeight: 0.9,
                            letterSpacing: "-0.03em",
                          }}
                        >
                          {score ? score.compatibility : "—"}
                        </p>
                        <span
                          className="text-ink-400"
                          style={{ fontSize: 15 }}
                        >
                          / 100
                        </span>
                        {score && (
                          <span
                            className="font-semibold uppercase"
                            style={{
                              fontSize: 12,
                              letterSpacing: "0.2em",
                              color: up ? "#10B981" : "#F87171",
                            }}
                          >
                            {up ? "↑" : "↓"} {Math.abs(delta)} · 30g
                          </span>
                        )}
                      </div>
                      {score && <Sparkline points={points} up={up} />}
                      <div
                        className="flex"
                        style={{ gap: 8, marginTop: 14 }}
                      >
                        <Link
                          href={`/targets/${t.id}`}
                          className="rounded-[14px] border border-ink-700 bg-ink-900/60 text-ink-100 hover:border-ink-600"
                          style={{
                            padding: "6px 14px",
                            fontSize: 15,
                          }}
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
                    <div className="grid" style={{ gap: 16 }}>
                      <div>
                        <p
                          className="m-0 font-semibold uppercase"
                          style={{
                            marginBottom: 8,
                            fontSize: 10,
                            letterSpacing: "0.3em",
                            color: "#10B981",
                          }}
                        >
                          — güçlü yanlar
                        </p>
                        {strengths.length > 0 ? (
                          <ul
                            className="m-0 grid list-none p-0"
                            style={{ gap: 6 }}
                          >
                            {strengths.slice(0, 3).map((s, i) => (
                              <li
                                key={i}
                                className="flex text-ink-200"
                                style={{ gap: 10, fontSize: 15 }}
                              >
                                <span style={{ color: "#10B981" }}>●</span>
                                {s.label}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p
                            className="m-0 text-ink-500"
                            style={{ fontSize: 13 }}
                          >
                            henüz analiz yok
                          </p>
                        )}
                      </div>
                      <div>
                        <p
                          className="m-0 font-semibold uppercase"
                          style={{
                            marginBottom: 8,
                            fontSize: 10,
                            letterSpacing: "0.3em",
                            color: "#F87171",
                          }}
                        >
                          — riskler
                        </p>
                        {risks.length > 0 ? (
                          <ul
                            className="m-0 grid list-none p-0"
                            style={{ gap: 6 }}
                          >
                            {risks.slice(0, 3).map((r, i) => (
                              <li
                                key={i}
                                className="flex text-ink-200"
                                style={{ gap: 10, fontSize: 15 }}
                              >
                                <span style={{ color: "#F87171" }}>●</span>
                                {r.label}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p
                            className="m-0 text-ink-500"
                            style={{ fontSize: 13 }}
                          >
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
                  <span className="text-[12px] text-ink-500">
                    {formatDate(c.created_at)}
                  </span>
                  <span
                    className="rounded-full px-[10px] py-[3px] text-[11px] font-semibold uppercase tracking-[0.2em]"
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

// CD birebir Sparkline — InsightsScreen.jsx:106-124
function Sparkline({ points, up }: { points: number[]; up: boolean }) {
  const W = 360;
  const H = 54;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - ((p - min) / range) * H;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = path + ` L${W},${H} L0,${H} Z`;
  const color = up ? "#10B981" : "#E11D48";
  const fill = up ? "rgba(16,185,129,0.14)" : "rgba(225,29,72,0.14)";
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      style={{ marginTop: 14, display: "block" }}
    >
      <path d={area} fill={fill} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
