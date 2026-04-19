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

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Profile completeness gate — incomplete profiles can't use the app
  const { data: gateProfile } = await supabase
    .from("user_profiles")
    .select(
      "display_name, gender, age_range, interests, communication_style, attachment_style, relationship_goal, raw_bio, own_dynamic_style, own_expression_style, own_relationship_energy, attracted_to_dynamic_styles, attracted_to_expression_styles, attracted_to_energies",
    )
    .eq("id", user.id)
    .maybeSingle();
  const gateCheck = checkProfileCompleteness(gateProfile ?? {});
  if (!gateCheck.complete) redirect("/onboarding");

  // Load initial data server-side for fast first render
  const [
    { data: targets },
    { data: recentGenerations },
    { count: totalGenerations },
    realityCheck,
    { data: myProfile },
  ] = await Promise.all([
    supabase
      .from("target_profiles")
      .select("id, name, relation, updated_at, personality_type")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(4),
    supabase
      .from("message_generations")
      .select("id, incoming_message, replies, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("message_generations")
      .select("*", { count: "exact", head: true }),
    detectRealityCheck(user.id),
    supabase
      .from("user_profiles")
      .select("raw_bio, attachment_style, relationship_goal, communication_style")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  // Profile is complete at this point (we redirected otherwise).
  // The nudge below is kept for legacy compatibility but should never trigger.
  const profileEmpty = false;

  const userName =
    user.user_metadata?.display_name || user.email?.split("@")[0] || "";

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
      <PageHeader
        kicker={`merhaba ${userName} —`}
        title="Dashboard."
        description="Günün hook'u, hedeflerin ve son üretimlerin — tek bakışta."
      />

      {/* Profilini doldur — kullanıcı kendisini tanıtmadan AI çıktıları genel kalıyor */}
      {profileEmpty && (
        <section className="mb-6">
          <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-ink-900/60 to-ink-900/60 p-6">
            <p className="mb-2 font-display italic text-brand-400">
              önce seni tanıyalım —
            </p>
            <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-ink-100">
              Uyum skoru ve mesaj önerileri senin profiline göre kalibreleniyor.
              Birkaç dakikanı ayır, AI sana çok daha doğru cevaplar versin.
            </p>
            <Link
              href="/settings"
              className="inline-flex rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Profilimi doldur →
            </Link>
          </div>
        </section>
      )}

      {/* Reality check — obsessive-usage nudge (§14) */}
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

      {/* Daily Hook — hero */}
      <section className="mb-10">
        <DashboardHookCard />
      </section>

      {/* Stats row */}
      <section className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
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
        <StatTile label="sohbet" value="—" subtext="koç seansı" />
        <StatTile label="skor" value="—" subtext="ortalama uyum" />
      </section>

      {/* Targets */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">Hedeflerin</h2>
          <Link
            href="/targets"
            className="text-sm text-ink-400 hover:text-ink-200"
          >
            tümünü gör →
          </Link>
        </div>

        {(targets ?? []).length === 0 ? (
          <EmptyState
            title="Henüz hedef yok"
            description="İlgilendiğin kişiyi tanıt — RizzAI daha kişisel cevaplar üretebilir."
            action={
              <ButtonLink href="/targets/new">İlk hedefini oluştur</ButtonLink>
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {targets?.map((t) => (
              <Link
                key={t.id}
                href={`/targets/${t.id}`}
                className="group rounded-2xl border border-ink-800 bg-ink-900/40 p-5 transition hover:border-ink-700"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-display text-xl">
                      {t.name ?? "İsimsiz"}
                    </p>
                    <p className="mt-0.5 text-xs uppercase tracking-widest text-ink-400">
                      {RELATION_LABELS[t.relation] ?? t.relation}
                    </p>
                  </div>
                  <span className="text-ink-500 transition group-hover:translate-x-0.5 group-hover:text-brand-400">
                    →
                  </span>
                </div>
                {t.personality_type ? (
                  <p className="text-sm text-ink-300">
                    <span className="italic text-brand-400">
                      {t.personality_type}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-ink-500">Henüz analiz edilmedi</p>
                )}
              </Link>
            ))}
            <Link
              href="/targets/new"
              className="flex items-center justify-center rounded-2xl border border-dashed border-ink-700 bg-transparent p-5 text-center text-sm text-ink-400 transition hover:border-brand-500 hover:text-brand-400"
            >
              + Yeni hedef
            </Link>
          </div>
        )}
      </section>

      {/* Quick tool access */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-2xl">Araçlar</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <ToolTile
            href="/generate"
            symbol="✻"
            title="Mesaj Üretici"
            desc="Üç tonda cevap üret"
          />
          <ToolTile
            href="/chat"
            symbol="◊"
            title="AI Koç"
            desc="Hafızalı sohbet asistanı"
          />
          <ToolTile
            href="/conflicts"
            symbol="⟁"
            title="Çatışma Onarımı"
            desc="Tartışma analizi + onarım mesajı"
          />
          <ToolTile
            href="/insights"
            symbol="◢"
            title="Analiz"
            desc="İlişki skoru ve derinlemesine analiz"
          />
          <ToolTile
            href="/targets/new"
            symbol="○"
            title="Yeni Hedef"
            desc="Birini tanıt, analiz et"
          />
        </div>
      </section>

      {/* Recent generations */}
      {recentGenerations && recentGenerations.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl">Son üretimler</h2>
          <div className="space-y-3">
            {recentGenerations.map((g) => {
              const firstReply = Array.isArray(g.replies) ? g.replies[0] : null;
              return (
                <SectionCard key={g.id} className="p-5">
                  <p className="mb-2 text-xs text-ink-500">
                    {formatRelativeTime(g.created_at)}
                  </p>
                  <p className="mb-3 line-clamp-1 text-sm text-ink-300">
                    <span className="text-ink-500">Gelen:</span>{" "}
                    {g.incoming_message}
                  </p>
                  {firstReply && (
                    <p className="text-sm text-ink-100">
                      <span className="text-xs font-semibold uppercase tracking-widest text-brand-400">
                        {firstReply.tone}
                      </span>
                      <span className="mx-2 text-ink-500">·</span>
                      {firstReply.text}
                    </p>
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

function ToolTile({
  href,
  symbol,
  title,
  desc,
}: {
  href: string;
  symbol: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-ink-800 bg-ink-900/40 p-5 transition hover:border-brand-500/50"
    >
      <p className="mb-3 text-3xl text-brand-500">{symbol}</p>
      <p className="mb-1 font-display text-lg text-ink-100">{title}</p>
      <p className="text-sm text-ink-400">{desc}</p>
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
