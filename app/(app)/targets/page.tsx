import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState, ButtonLink } from "@/components/app/ui";
import { TargetsFilter } from "./targets-filter";

export const dynamic = "force-dynamic";

const RELATION_LABELS: Record<string, string> = {
  crush: "CRUSH",
  partner: "PARTNER",
  ex: "EX",
  match: "MATCH",
  friend: "ARKADAŞ",
};

const ATTACHMENT_LABELS: Record<string, string> = {
  secure: "Güvenli",
  anxious: "Kaygılı",
  avoidant: "Kaçıngan",
  disorganized: "Düzensiz",
};

export default async function TargetsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: targets } = await supabase
    .from("target_profiles")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  const list = targets ?? [];
  const targetIds = list.map((t) => t.id);

  const [{ data: scores }, { data: genCounts }] = await Promise.all([
    targetIds.length > 0
      ? supabase
          .from("relationship_scores")
          .select("target_id, compatibility, computed_at")
          .in("target_id", targetIds)
          .order("computed_at", { ascending: false })
      : { data: [] },
    targetIds.length > 0
      ? supabase
          .from("message_generations")
          .select("target_id")
          .in("target_id", targetIds)
      : { data: [] },
  ]);

  const scoreByTarget = new Map<string, number>();
  const lastAnalyzedByTarget = new Map<string, string>();
  (scores ?? []).forEach((s) => {
    if (!scoreByTarget.has(s.target_id)) {
      scoreByTarget.set(s.target_id, s.compatibility);
      lastAnalyzedByTarget.set(s.target_id, s.computed_at);
    }
  });
  const countByTarget = new Map<string, number>();
  (genCounts ?? []).forEach((g) => {
    countByTarget.set(g.target_id, (countByTarget.get(g.target_id) ?? 0) + 1);
  });

  const filter = params.filter ?? "all";
  const filtered =
    filter === "all" ? list : list.filter((t) => t.relation === filter);

  return (
    <div className="mx-auto max-w-[1120px] px-10 py-12 pb-20">
      <PageHeader
        kicker="ilişkilerini takip et —"
        title="Hedefler."
        description="İlgilendiğin kişiler. Her birini ayrı ayrı tanı, skoru izle, koçla konuş."
        action={<ButtonLink href="/targets/new">+ Yeni hedef</ButtonLink>}
      />

      {/* Filter chips */}
      <div className="mb-7 flex flex-wrap items-center gap-2">
        <TargetsFilter current={filter} />
        <span className="ml-auto text-[11px] uppercase tracking-[0.25em] text-ink-500">
          {filtered.length} hedef
        </span>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="Henüz hedef yok"
          description="İlk hedefini ekle — koç o kişiye özel cevaplar üretmeye başlasın."
          action={<ButtonLink href="/targets/new">Hedef oluştur</ButtonLink>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
          {filtered.map((t) => {
            const score = scoreByTarget.get(t.id);
            const messageCount = countByTarget.get(t.id) ?? 0;
            const lastAnalyzed = lastAnalyzedByTarget.get(t.id);
            const confidence = t.analysis_confidence ?? null;
            const scored = score !== undefined;

            return (
              <Link
                key={t.id}
                href={`/targets/${t.id}`}
                className="group relative overflow-hidden rounded-[20px] border border-ink-800 bg-ink-900/40 p-6 backdrop-blur-[8px] transition-all duration-200 hover:border-brand-500/45 hover:bg-ink-900/60 hover:shadow-[0_0_0_1px_rgba(225,29,72,0.15),0_24px_40px_-24px_rgba(225,29,72,0.25)]"
              >
                {/* Top row: name + score */}
                <div className="mb-[14px] flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p
                      className="break-words font-display tracking-tight text-ink-100"
                      style={{ fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.02em" }}
                    >
                      {t.name ?? "İsimsiz"}
                    </p>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-400 transition-colors group-hover:text-brand-400">
                      {RELATION_LABELS[t.relation] ?? t.relation.toUpperCase()}
                    </p>
                  </div>
                  {scored ? (
                    <div className="flex-shrink-0 text-right">
                      <p
                        className="font-display text-ink-100 transition-all duration-200 group-hover:text-brand-400 group-hover:[text-shadow:0_0_24px_rgba(225,29,72,0.35)]"
                        style={{ fontSize: 28, lineHeight: 1, letterSpacing: "-0.03em" }}
                      >
                        {score}
                        <span className="text-[13px] text-ink-500">/100</span>
                      </p>
                      {confidence !== null && (
                        <span className="mt-2 inline-block whitespace-nowrap rounded-full border border-ink-800 bg-ink-900/60 px-[9px] py-[3px] text-[9px] font-semibold uppercase tracking-[0.22em] text-ink-300">
                          %{Math.round(confidence * 100)} güven
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex-shrink-0 text-right">
                      <p
                        className="font-display italic text-ink-500"
                        style={{ fontSize: 22 }}
                      >
                        —
                      </p>
                      <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-ink-500">
                        henüz analiz yok
                      </span>
                    </div>
                  )}
                </div>

                {/* Personality */}
                {t.personality_type ? (
                  <p
                    className="mb-[18px] font-display italic leading-snug text-brand-400"
                    style={{ fontSize: 19 }}
                  >
                    {t.personality_type}
                  </p>
                ) : (
                  <p className="mb-[18px] text-[14px] leading-[1.6] text-ink-500">
                    profil yeterli veri içermiyor — koçluğa başlamak için birkaç
                    mesaj ekle.
                  </p>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 border-t border-ink-800 pt-4">
                  <MiniStat label="mesaj" value={String(messageCount)} />
                  <MiniStat
                    label="son analiz"
                    value={lastAnalyzed ? formatShortDate(lastAnalyzed) : "—"}
                  />
                  <MiniStat
                    label="bağlanma"
                    value={
                      t.attachment_style
                        ? ATTACHMENT_LABELS[t.attachment_style] ?? t.attachment_style
                        : "—"
                    }
                    badge={!!t.attachment_style}
                  />
                </div>
              </Link>
            );
          })}

          {/* New target card */}
          <Link
            href="/targets/new"
            className="group flex min-h-[160px] items-center justify-center rounded-[20px] border border-dashed border-ink-700 p-5 text-center text-[14px] text-ink-400 transition-all duration-200 hover:border-brand-500 hover:bg-brand-500/5 hover:text-brand-400"
          >
            + Yeni hedef
          </Link>
        </div>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-ink-500">
        {label}
      </p>
      {badge ? (
        <span className="mt-[6px] inline-block rounded-full border border-ink-700 bg-ink-900/60 px-[10px] py-[2px] text-[11px] font-medium text-ink-200">
          {value}
        </span>
      ) : (
        <p className="mt-[6px] text-[13px] text-ink-200">{value}</p>
      )}
    </div>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "bugün";
  if (days < 7) return `${days}g önce`;
  if (days < 30) return `${Math.floor(days / 7)}h önce`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}
