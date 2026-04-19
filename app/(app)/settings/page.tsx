import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  PageHeader,
  SectionCard,
} from "@/components/app/ui";
import { SignOutButton } from "./signout-button";
import { DeleteAccountButton } from "./delete-account-button";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium = sub?.status === "active";

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <PageHeader
        kicker="senin hesabın —"
        title="Ayarlar"
      />

      <div className="space-y-6">
        {/* Account */}
        <SectionCard className="p-6">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
            hesap
          </p>
          <div className="space-y-3">
            <Row label="Ad" value={profile?.display_name ?? "—"} />
            <Row label="E-posta" value={user.email ?? "—"} />
            <Row
              label="Dil"
              value={profile?.locale === "tr" ? "Türkçe" : profile?.locale ?? "Türkçe"}
            />
            <Row
              label="Kayıt tarihi"
              value={
                user.created_at
                  ? new Date(user.created_at).toLocaleDateString("tr-TR")
                  : "—"
              }
            />
          </div>
        </SectionCard>

        {/* Subscription */}
        <SectionCard className="p-6">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
            abonelik
          </p>
          {isPremium ? (
            <div>
              <p className="mb-2 font-display text-2xl italic text-brand-400">
                Premium
              </p>
              <p className="mb-4 text-sm text-ink-300">
                Sınırsız üretim, sohbet ve analiz. İyi seçimler.
              </p>
              {sub?.current_period_end && (
                <p className="text-xs text-ink-400">
                  Yenileme:{" "}
                  {new Date(sub.current_period_end).toLocaleDateString("tr-TR")}
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="mb-2 font-display text-2xl text-ink-100">
                Ücretsiz plan
              </p>
              <p className="mb-4 text-sm text-ink-300">
                Günde 3 üretim, 5 sohbet, haftada 1 çatışma analizi.
              </p>
              <Link
                href="/pricing"
                className="inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
              >
                Premium&apos;a yükselt →
              </Link>
            </div>
          )}
        </SectionCard>

        {/* Data & Privacy */}
        <SectionCard className="p-6">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
            veri ve gizlilik
          </p>
          <div className="space-y-3">
            <Link
              href="/legal/privacy"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-ink-200 hover:bg-ink-900"
            >
              <span>Gizlilik Politikası</span>
              <span className="text-ink-500">↗</span>
            </Link>
            <Link
              href="/legal/terms"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-ink-200 hover:bg-ink-900"
            >
              <span>Kullanım Şartları</span>
              <span className="text-ink-500">↗</span>
            </Link>
            <Link
              href="/legal/safety"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-ink-200 hover:bg-ink-900"
            >
              <span>Güvenlik ve Etik</span>
              <span className="text-ink-500">↗</span>
            </Link>
          </div>
        </SectionCard>

        {/* Session */}
        <SectionCard className="p-6">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
            oturum
          </p>
          <SignOutButton />
        </SectionCard>

        {/* Danger zone — GDPR / KVKK right to erasure */}
        <SectionCard className="border-red-500/20 p-6">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-red-400">
            tehlikeli bölge
          </p>
          <p className="mb-4 text-sm text-ink-300">
            Hesabını ve tüm verilerini kalıcı olarak sil. Bu işlem geri
            alınamaz.
          </p>
          <DeleteAccountButton />
        </SectionCard>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-ink-800/50 py-2 last:border-0">
      <span className="text-xs uppercase tracking-widest text-ink-400">
        {label}
      </span>
      <span className="text-sm text-ink-100">{value}</span>
    </div>
  );
}
