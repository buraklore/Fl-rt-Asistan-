import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  PageHeader,
  SectionCard,
  ButtonLink,
  EmptyState,
  StatTile,
} from "@/components/app/ui";
import { DashboardHookCard } from "./hook-card";
import { detectRealityCheck } from "@/lib/reality-check";
import { checkProfileCompleteness } from "@/lib/schemas";
import Link from "next/link";
import { CopyButton } from "@/components/app/copy-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: gateProfile } = await supabase
    .from("user_profiles")
    .select(
      "display_name, gender, age_range, interests, communication_style, attachment_style, relationship_goal, raw_bio, own_dynamic_style, own_expression_style, own_relationship_energy, attracted_to_dynamic_styles, attracted_to_expression_styles, attracted_to_energies",
    )
    .eq("id", user.id)
    .maybeSingle();
  const gateCheck = checkProfileCompleteness(gateProfile ?? {});
  if (!gateCheck.complete) redirect("/onboarding");

  const [
    { data: targets },
    { data: recentGenerations },
    { count: totalGenerations },
    realityCheck,
    { count: totalChats },
    { count: totalConflicts },
    { data: allScores },
    { data: latestScores },
  ] = await Promise.all([
    supabase
      .from("target_profiles")
      .select("id, name, relation, updated_at, personality_type, analysis_confidence")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(4),
    supabase
      .from("message_generations")
      .select("id, incoming_message, replies, created_at, target_id, target:target_profiles(name)")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("message_generations")
      .select("*", { count: "exact", head: true }),
    detectRealityCheck(user.id),
    supabase
      .from("chat_sessions")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("conflict_analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase.from("relationship_scores").select("compatibility"),
    supabase
      .from("relationship_scores")
      .select("target_id, compatibility, computed_at")
      .order("computed_at", { ascending: false }),
  ]);

  const avgScore =
    allScores && allScores.length > 0
      ? Math.round(
          allScores.reduce((sum, s) => sum + (s.compatibility ?? 0), 0) /
            allScores.length,
        )
      : null;

  const scoreByTarget = new Map<string, number>();
  (latestScores ?? []).forEach((s) => {
    if (!scoreByTarget.has(s.target_id)) scoreByTarget.set(s.target_id, s.compatibility);
  });

  const userName =
    user.user_metadata?.display_name || user.email?.split("@")[0] || "";

  return (
    <div className="mx-auto max-w-[1120px] px-10 py-12 pb-20">
      <PageHeader
        kicker={`merhaba ${userName} —`}
        title="Dashboard."
        description="Günün dürtmesi, hedeflerin ve son üretimlerin — tek bakışta."
      />

      {/* Reality check — obsessive-usage nudge */}
      {realityCheck.shouldShow && (
        <section className="mb-6">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
            <p className="mb-2 font-display italic text-amber-300">
              bir dakika —
            </p>
            <p className="mb-4 text-[15px] leading-relaxed text-ink-100">
              {realityCheck.message}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href={`/targets/${realityCheck.targetId}`}
                className="text-amber-400 hover:text-amber-300"
              >
                Hedef profiline bak →
              </Link>
              <span className="text-ink-600">·</span>
              <span className="text-ink-400">
                bu uyarı sadece senin göreceğin bir notdur
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Günün Dürtmesi — hero */}
      <section className="mb-11">
        <DashboardHookCard hasTargets={(targets ?? []).length > 0} />
      </section>

      {/* Stats — 4 tile grid */}
      <section className="mb-12 grid grid-cols-2 gap-[14px] md:grid-cols-4">
        <StatTile
          label="hedef"
          value={(targets ?? []).length}
          subtext="aktif profil"
        />
        <StatTile
          label="üretim"
          value={totalGenerations ?? 0}
          subtext="toplam mesaj"
        />
        <StatTile
          label="sohbet"
          value={totalChats ?? 0}
          subtext="koç seansı"
        />
        <StatTile
          label="skor"
          value={avgScore !== null ? avgScore : "—"}
          subtext={avgScore !== null ? "ortalama uyum" : "henüz skor yok"}
        />
      </section>

      {/* Hedeflerin */}
      <section className="mb-12">
        <SectionHeader title="Hedeflerin" linkLabel="tümünü gör →" linkHref="/targets" />

        {(targets ?? []).length === 0 ? (
          <EmptyState
            title="Henüz hedef yok"
            description="İlgilendiğin kişiyi tanıt — daha kişisel cevaplar üretebilsin."
            action={<ButtonLink href="/targets/new">İlk hedefini oluştur</ButtonLink>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {targets?.map((t) => {
              const score = scoreByTarget.get(t.id);
              return (
                <Link
                  key={t.id}
                  href={`/targets/${t.id}`}
                  className="group rounded-2xl border border-ink-800 bg-ink-900/40 p-[22px] transition hover:border-brand-500/40 hover:bg-ink-900/60"
                >
                  <div className="mb-[10px] flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-[26px] leading-tight tracking-tight text-ink-100">
                        {t.name ?? "İsimsiz"}
                      </p>
                      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-ink-400">
                        {RELATION_LABELS[t.relation] ?? t.relation}
                      </p>
                    </div>
                    {score !== undefined ? (
                      <div className="text-right">
                        <p className="font-display text-[30px] leading-none tracking-tight text-brand-400">
                          %{score}
                        </p>
                        <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-ink-500">
                          uyum
                        </p>
                      </div>
                    ) : (
                      <span className="text-[10px] uppercase tracking-[0.2em] text-ink-500">
                        analiz edilmedi
                      </span>
                    )}
                  </div>

                  {t.personality_type ? (
                    <p className="font-display text-[17px] italic leading-snug text-brand-400">
                      {t.personality_type}
                    </p>
                  ) : (
                    <p className="text-[13px] leading-relaxed text-ink-500">
                      henüz yeterli veri yok — profili doldur
                    </p>
                  )}

                  {typeof t.analysis_confidence === "number" && (
                    <div className="mt-[14px]">
                      <span className="inline-block rounded-full border border-ink-800 bg-ink-900/60 px-[10px] py-[4px] text-[9px] font-semibold uppercase tracking-[0.25em] text-ink-300">
                        analiz güveni — %{Math.round(t.analysis_confidence * 100)}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
            <Link
              href="/targets/new"
              className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-ink-700 bg-transparent p-5 text-center text-sm text-ink-400 transition hover:border-brand-500 hover:bg-brand-500/5 hover:text-brand-400"
            >
              + Yeni hedef
            </Link>
          </div>
        )}
      </section>

      {/* Araçlar */}
      <section className="mb-12">
        <SectionHeader title="Araçlar" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <ToolTile
            href="/generate"
            symbol="✻"
            title="Mesaj Üretici"
            desc="Gelen mesaja cevap veya ilk mesajı yaz"
            stat={`${totalGenerations ?? 0} üretim`}
          />
          <ToolTile
            href="/chat"
            symbol="◊"
            title="Koç"
            desc="Hafızalı sohbet asistanı"
            stat={`${totalChats ?? 0} oturum`}
          />
          <ToolTile
            href="/conflicts"
            symbol="⟁"
            title="Çatışma Onarımı"
            desc="Tartışma analizi + onarım mesajı"
            stat={`${totalConflicts ?? 0} analiz`}
          />
          <ToolTile
            href="/insights"
            symbol="◢"
            title="Analiz Paneli"
            desc="Tüm hedeflerinin uyum skorları"
            stat={avgScore !== null ? `ort. %${avgScore}` : "—"}
          />
          <ToolTile
            href="/targets/new"
            symbol="○"
            title="Yeni Hedef"
            desc="Birini tanıt, analiz et"
            stat="3-4 dk"
          />
          <ToolTile
            href="/settings"
            symbol="✦"
            title="Profilim"
            desc="Kendi profilini güncelle"
            stat="ayarlar"
          />
        </div>
      </section>

      {/* Son üretimler */}
      {recentGenerations && recentGenerations.length > 0 && (
        <section>
          <SectionHeader title="Son üretimler" linkLabel="tümünü gör →" linkHref="/generate" />
          <div className="flex flex-col gap-[10px]">
            {recentGenerations.map((g) => {
              const firstReply = Array.isArray(g.replies) ? g.replies[0] : null;
              const targetName =
                (Array.isArray(g.target) ? g.target[0] : g.target)?.name ?? null;
              return (
                <SectionCard key={g.id} className="p-[22px]">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-ink-500">
                      {formatRelativeTime(g.created_at)}
                      {targetName ? ` · ${targetName}` : ""}
                    </span>
                    {firstReply && (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-400">
                        {firstReply.tone}
                      </span>
                    )}
                  </div>
                  <p className="mb-[10px] line-clamp-1 text-[12px] leading-relaxed text-ink-400">
                    <span className="text-ink-500">Gelen:</span>{" "}
                    {g.incoming_message}
                  </p>
                  {firstReply && (
                    <div className="flex items-start justify-between gap-4">
                      <p className="flex-1 text-[15px] leading-[1.55] text-ink-100">
                        {firstReply.text}
                      </p>
                      <CopyButton text={firstReply.text} />
                    </div>
                  )}
                </SectionCard>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  linkLabel,
  linkHref,
}: {
  title: string;
  linkLabel?: string;
  linkHref?: string;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <h2 className="font-display text-[28px] tracking-tight text-ink-100">
        {title}
      </h2>
      {linkLabel && linkHref && (
        <Link
          href={linkHref}
          className="text-[12px] lowercase text-ink-400 hover:text-ink-200"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function ToolTile({
  href,
  symbol,
  title,
  desc,
  stat,
}: {
  href: string;
  symbol: string;
  title: string;
  desc: string;
  stat?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-2xl border border-ink-800 bg-ink-900/40 p-[22px] transition hover:border-brand-500/40 hover:bg-ink-900/60"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="text-[34px] leading-none text-brand-500">{symbol}</span>
        {stat && (
          <span className="rounded-full border border-ink-700 bg-ink-900/60 px-[10px] py-[3px] text-[9px] font-semibold uppercase tracking-[0.22em] text-ink-400">
            {stat}
          </span>
        )}
      </div>
      <p className="font-display text-[22px] leading-tight tracking-tight text-ink-100">
        {title}
      </p>
      <p className="mb-4 mt-[6px] flex-1 text-[13px] leading-[1.5] text-ink-400">
        {desc}
      </p>
      <span className="text-[11px] lowercase text-ink-500 transition group-hover:text-brand-400">
        aç →
      </span>
    </Link>
  );
}

const RELATION_LABELS: Record<string, string> = {
  crush: "Crush",
  partner: "Partner",
  ex: "Eski sevgili",
  match: "Eşleşme",
  friend: "Arkadaş",
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "az önce";
  if (h < 24) return `${h} saat önce`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} gün önce`;
  return new Date(iso).toLocaleDateString("tr-TR");
}
