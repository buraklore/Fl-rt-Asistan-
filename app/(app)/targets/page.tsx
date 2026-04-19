import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  PageHeader,
  EmptyState,
  ButtonLink,
} from "@/components/app/ui";

export const dynamic = "force-dynamic";

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

export default async function TargetsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: targets } = await supabase
    .from("target_profiles")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  const list = targets ?? [];

  // Fetch latest scores and message counts for all targets in parallel
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

  // Build lookup maps
  const scoreByTarget = new Map<string, number>();
  (scores ?? []).forEach((s) => {
    if (!scoreByTarget.has(s.target_id)) {
      scoreByTarget.set(s.target_id, s.compatibility);
    }
  });
  const countByTarget = new Map<string, number>();
  (genCounts ?? []).forEach((g) => {
    countByTarget.set(
      g.target_id,
      (countByTarget.get(g.target_id) ?? 0) + 1,
    );
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
      <PageHeader
        kicker="ilişkilerini takip et —"
        title="Hedefler."
        description="İlgilendiğin kişiler. Her birini ayrı ayrı tanı, skoru izle, koçla konuş."
        action={<ButtonLink href="/targets/new">+ Yeni hedef</ButtonLink>}
      />

      {list.length === 0 ? (
        <EmptyState
          title="Henüz hedef yok"
          description="İlk hedefini ekle — koç o kişiye özel cevaplar üretmeye başlasın."
          action={<ButtonLink href="/targets/new">Hedef oluştur</ButtonLink>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((t) => {
            const score = scoreByTarget.get(t.id);
            const genCount = countByTarget.get(t.id) ?? 0;
            const confidence = t.analysis_confidence ?? null;

            return (
              <Link
                key={t.id}
                href={`/targets/${t.id}`}
                className="group relative overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/40 p-6 transition hover:border-brand-500/40 hover:bg-ink-900/60"
              >
                {/* Top — name + score */}
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-2xl leading-tight text-ink-100">
                      {t.name ?? "İsimsiz"}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-500">
                      {RELATION_LABELS[t.relation] ?? t.relation}
                    </p>
                  </div>
                  {score !== undefined ? (
                    <div className="text-right">
                      <p className="font-display text-3xl leading-none text-brand-400">
                        {score}
                      </p>
                      <p className="mt-1 text-[9px] uppercase tracking-widest text-ink-500">
                        / 100 uyum
                      </p>
                    </div>
                  ) : (
                    <span className="text-ink-500 transition group-hover:translate-x-0.5 group-hover:text-brand-400">
                      →
                    </span>
                  )}
                </div>

                {/* Personality type */}
                {t.personality_type ? (
                  <p className="mb-4 font-display italic text-brand-400">
                    {t.personality_type}
                  </p>
                ) : (
                  <p className="mb-4 text-sm italic text-ink-500">
                    henüz analiz edilmedi
                  </p>
                )}

                {/* Bottom stats */}
                <div className="flex flex-wrap items-center gap-2 border-t border-ink-800 pt-4">
                  {t.attachment_style && (
                    <span className="rounded-full border border-brand-500/20 bg-brand-500/5 px-3 py-1 text-[10px] uppercase tracking-widest text-brand-400">
                      {ATTACHMENT_LABELS[t.attachment_style] ?? t.attachment_style}
                    </span>
                  )}
                  <span className="rounded-full border border-ink-700 bg-ink-900/60 px-3 py-1 text-[10px] uppercase tracking-widest text-ink-400">
                    {genCount} mesaj
                  </span>
                  {confidence !== null && (
                    <span className="rounded-full border border-ink-700 bg-ink-900/60 px-3 py-1 text-[10px] uppercase tracking-widest text-ink-400">
                      güven %{Math.round(confidence * 100)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Add new card */}
          <Link
            href="/targets/new"
            className="group flex items-center justify-center rounded-2xl border border-dashed border-ink-700 bg-transparent p-6 text-center text-sm text-ink-400 transition hover:border-brand-500 hover:text-brand-400 min-h-[180px]"
          >
            <span>+ Yeni hedef ekle</span>
          </Link>
        </div>
      )}
    </div>
  );
}
