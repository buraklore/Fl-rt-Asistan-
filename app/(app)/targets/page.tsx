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

export default async function TargetsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: targets } = await supabase
    .from("target_profiles")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  const list = targets ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
      <PageHeader
        kicker="kim — hangi bağlam —"
        title="Hedefler."
        description="İlgilendiğin her kişi için ayrı bir profil. Flört Asistanı cevaplarını onun kişiliğine göre kalibre eder."
        action={
          <ButtonLink href="/targets/new">+ Yeni hedef</ButtonLink>
        }
      />

      {list.length === 0 ? (
        <EmptyState
          title="Henüz hedef yok"
          description="İlk hedefini ekle — koç o kişiye özel cevaplar üretmeye başlasın."
          action={<ButtonLink href="/targets/new">Hedef oluştur</ButtonLink>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <Link
              key={t.id}
              href={`/targets/${t.id}`}
              className="group rounded-2xl border border-ink-800 bg-ink-900/40 p-6 transition hover:border-brand-500/40"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="font-display text-2xl leading-tight">
                    {t.name ?? "İsimsiz"}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-ink-400">
                    {RELATION_LABELS[t.relation] ?? t.relation}
                  </p>
                </div>
                <span className="text-ink-500 transition group-hover:translate-x-0.5 group-hover:text-brand-400">
                  →
                </span>
              </div>

              {t.personality_type ? (
                <div className="space-y-2">
                  <p className="font-display italic text-brand-400">
                    {t.personality_type}
                  </p>
                  {t.attachment_style && (
                    <p className="text-xs text-ink-400">
                      {t.attachment_style} bağlanma
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-ink-500">Analiz edilmemiş</p>
              )}

              {t.context_notes && (
                <p className="mt-4 line-clamp-2 text-xs text-ink-400">
                  {t.context_notes}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
