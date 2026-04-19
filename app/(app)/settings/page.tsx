import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/ui";
import { ProfileForm } from "./profile-form";
import { SettingsTabs } from "./settings-tabs";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab ?? "profil";

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
    <div className="mx-auto" style={{ maxWidth: 860, padding: "48px 40px 80px" }}>
      <PageHeader
        kicker="senin hakkında —"
        title="Ayarlar."
        description="Profil ayarların koçun mesaj ürettiğinde senin sesini taklit etmesi için kullanılır."
      />

      <SettingsTabs current={tab} />

      <div className="mt-8">
        {tab === "profil" && <ProfileForm />}
        {tab === "hesap" && <HesapTab user={user} />}
        {tab === "bildirim" && <BildirimTab />}
        {tab === "premium" && <PremiumTab isPremium={isPremium} />}
      </div>
    </div>
  );
}

function HesapTab({ user }: { user: { email: string | undefined; created_at: string | undefined } }) {
  return (
    <div className="grid gap-5">
      <AccountCard label="e-posta" value={user.email ?? "—"} buttonLabel="e-postayı değiştir" />
      <AccountCard
        label="şifre"
        value={`son güncelleme: ${
          user.created_at
            ? new Date(user.created_at).toLocaleDateString("tr-TR", { month: "long", year: "numeric" })
            : "—"
        }`}
        buttonLabel="şifreyi değiştir"
      />
      <div className="rounded-2xl border border-ink-800 bg-ink-900/40 backdrop-blur-[8px]" style={{ padding: 24 }}>
        <p className="text-[11px] font-semibold uppercase text-brand-400" style={{ letterSpacing: "0.3em" }}>
          oturum
        </p>
        <div className="flex gap-[10px]" style={{ marginTop: 16 }}>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="rounded-full border border-ink-700 bg-ink-900/60 px-4 py-2 text-[13px] text-ink-200 transition hover:border-ink-600"
            >
              Çıkış yap
            </button>
          </form>
          <button className="rounded-full bg-red-500 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-red-600">
            Hesabı sil
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountCard({
  label,
  value,
  buttonLabel,
}: {
  label: string;
  value: string;
  buttonLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 backdrop-blur-[8px]" style={{ padding: 24 }}>
      <p className="text-[11px] font-semibold uppercase text-brand-400" style={{ letterSpacing: "0.3em" }}>
        {label}
      </p>
      <p className="text-[16px] text-ink-100" style={{ margin: "8px 0 16px" }}>
        {value}
      </p>
      <button className="rounded-full border border-ink-700 bg-ink-900/60 px-4 py-2 text-[13px] text-ink-200 transition hover:border-ink-600">
        {buttonLabel}
      </button>
    </div>
  );
}

function BildirimTab() {
  const items = [
    ["gunluk", "Günün hook'u", "her sabah 10:00 — yeni dürtme önerisi"],
    ["mesaj", "Mesaj hatırlatma", "cevap verilmemiş mesajlar için 24 saat sonra"],
    ["catisma", "Çatışma uyarısı", "tartışma ifadesi içeren transkriptlerde"],
    ["haftalik", "Haftalık rapor", "pazar akşamı — tüm hedefler özet"],
  ] as const;

  return (
    <div className="grid gap-[10px]">
      {items.map(([k, t, d]) => (
        <div
          key={k}
          className="rounded-2xl border border-ink-800 bg-ink-900/40 backdrop-blur-[8px]"
          style={{ padding: 18 }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[15px] text-ink-100">{t}</p>
              <p className="text-[13px] text-ink-400" style={{ marginTop: 4 }}>
                {d}
              </p>
            </div>
            {/* Static toggle placeholder — backend'i eklendikçe interaktif olur */}
            <div
              className="relative cursor-pointer rounded-full transition"
              style={{
                width: 44,
                height: 26,
                background: k === "catisma" ? "#2A1830" : "#E11D48",
              }}
            >
              <span
                className="absolute rounded-full bg-white transition-all"
                style={{
                  top: 3,
                  left: k === "catisma" ? 3 : 21,
                  width: 20,
                  height: 20,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PremiumTab({ isPremium }: { isPremium: boolean }) {
  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-ink-800 bg-ink-900/40 backdrop-blur-[8px]" style={{ padding: 24 }}>
        <p
          className="text-[11px] font-semibold uppercase text-ink-400"
          style={{ letterSpacing: "0.3em" }}
        >
          mevcut plan
        </p>
        <div
          className="flex items-baseline justify-between"
          style={{ marginTop: 10 }}
        >
          <p className="font-display" style={{ fontSize: 28 }}>
            {isPremium ? "Premium" : "Ücretsiz"}
          </p>
          <span className="text-[13px] text-ink-400">
            {isPremium
              ? "sınırsız üretim · sınırsız hedef"
              : "12 üretim / ay · 1 aktif hedef analizi"}
          </span>
        </div>
      </div>

      {!isPremium && (
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: 24,
            padding: 36,
            background:
              "linear-gradient(145deg, #881337, #6B0F2A 55%, #111118)",
            border: "1px solid rgba(225,29,72,0.35)",
            boxShadow: "0 30px 60px -20px rgba(225,29,72,0.35)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute select-none font-display italic"
            style={{
              right: -30,
              top: -20,
              fontSize: 220,
              color: "#F7A8B8",
              opacity: 0.08,
              lineHeight: 0.85,
            }}
          >
            premium
          </div>
          <p
            className="text-[11px] font-semibold uppercase"
            style={{ letterSpacing: "0.3em", color: "#FBCFD8" }}
          >
            — sınırsızlar açılır
          </p>
          <h3
            className="font-display"
            style={{ margin: "12px 0 8px", fontSize: 40, letterSpacing: "-0.02em" }}
          >
            Premium
            <span className="italic" style={{ color: "#F7A8B8" }}>
              .
            </span>
          </h3>
          <p
            className="text-[15px] text-ink-200"
            style={{ maxWidth: 460 }}
          >
            Sınırsız üretim, sınırsız hedef, koç hafızası ve çatışma onarımı —
            aylık 149 TL.
          </p>
          <ul
            className="relative m-0 grid list-none p-0"
            style={{ margin: "20px 0", gap: 6, zIndex: 1 }}
          >
            {[
              "sınırsız mesaj üretimi",
              "sınırsız hedef analiz",
              "çatışma onarımı & history",
              "koç hafızası (1 yıl)",
              "öncelikli yanıt",
            ].map((s) => (
              <li
                key={s}
                className="flex gap-[10px] text-[14px] text-ink-100"
              >
                <span style={{ color: "#FDE68A" }}>✦</span>
                {s}
              </li>
            ))}
          </ul>
          <button
            className="rounded-full px-5 py-3 text-[14px] font-medium transition hover:opacity-90"
            style={{ background: "#F3EFF1", color: "#881337" }}
          >
            Premium&apos;a geç — 149 TL / ay
          </button>
        </div>
      )}
    </div>
  );
}
