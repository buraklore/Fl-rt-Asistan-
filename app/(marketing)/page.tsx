import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";

export default function LandingPage() {
  return (
    <>
      <MarketingNav />

      {/* Hero — editorial, asymmetric */}
      <section className="relative spotlight overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-32">
          <div className="stagger">
            <p className="mb-8 font-display italic text-xl text-brand-400 sm:text-2xl">
              özel bir şey söyle —
            </p>

            <h1 className="font-display text-display-sm text-balance leading-[0.95] tracking-tightest sm:text-display-md md:text-display-lg">
              Ne yazacağını
              <br />
              <span className="italic text-brand-500">zaten</span> biliyor.
            </h1>

            <p className="mt-10 max-w-xl text-lg leading-relaxed text-ink-200 sm:text-xl">
              RizzAI, crush&apos;ından gelen mesajı okur ve üç farklı tonda
              kopyala-yapıştır hazır cevaplar üretir.{" "}
              <span className="text-ink-100">
                Düşünmeyi bırak, yaz.
              </span>
            </p>

            <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/generate"
                className="group rounded-full bg-brand-500 px-7 py-4 text-base font-medium text-white shadow-xl shadow-brand-500/20 transition hover:bg-brand-600 hover:shadow-brand-500/30"
              >
                Şimdi dene
                <span className="ml-2 inline-block transition group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link
                href="/how-it-works"
                className="text-sm text-ink-300 transition hover:text-ink-100"
              >
                Nasıl çalıştığını gör
              </Link>
            </div>

            <p className="mt-6 text-xs text-ink-400">
              Kayıt gerekmez · 3 üretim ücretsiz · İstediğin zaman sil
            </p>
          </div>
        </div>

        {/* Floating editorial detail — decorative serif */}
        <div className="pointer-events-none absolute -right-20 top-1/2 hidden -translate-y-1/2 font-display italic text-[14rem] text-brand-500/5 lg:block">
          rizz
        </div>
      </section>

      {/* Three-act product story */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-400">
            üç hareket
          </p>
          <h2 className="font-display text-display-sm text-balance leading-tight tracking-tight sm:text-5xl">
            İlişkinin her aşamasında{" "}
            <span className="italic">yanında.</span>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {ACTS.map((act, i) => (
            <article
              key={act.title}
              className="group relative overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/40 p-8 transition hover:border-ink-700"
            >
              <div className="mb-6 font-display text-5xl italic text-brand-500/40">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mb-3 font-display text-2xl leading-tight">
                {act.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-300">
                {act.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Feature grid — denser, editorial */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="divider mb-20" />

        <div className="grid gap-x-12 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div className="mb-4 text-2xl">{f.emoji}</div>
              <h3 className="mb-2 font-display text-xl leading-tight">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-300">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pull quote — big editorial moment */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <blockquote className="font-display text-3xl leading-[1.15] text-balance text-ink-100 sm:text-5xl">
          <span className="italic text-brand-400">"Arkadaşına danışmak
          gibi — </span>sadece arkadaşın senin yerine beş saniyede üç farklı
          cevap hazırlamış."
        </blockquote>
        <p className="mt-8 text-sm text-ink-400">
          — erken beta kullanıcısı, 24
        </p>
      </section>

      {/* Trust / ethics — important in this category */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/40 p-10 text-center md:p-14">
          <div className="pointer-events-none absolute -left-8 -top-8 font-display text-[12rem] italic text-brand-500/5">
            "
          </div>
          <h3 className="relative mb-4 font-display text-2xl italic text-brand-400 sm:text-3xl">
            Sınırlarımız var.
          </h3>
          <p className="relative mx-auto max-w-2xl text-base leading-relaxed text-ink-200">
            RizzAI manipülasyon aracı değil. Reşit olmayan, sarhoş ya da
            açıkça uzaklaşmış birine yönelik içerik üretmiyoruz. Sağlıklı
            iletişim için tasarlandı — kısa yol için değil.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="mb-8 font-display text-display-sm text-balance leading-[0.95] sm:text-display-md">
          Bir sonraki cevabın,
          <br />
          <span className="italic text-brand-500">yazılmaya hazır.</span>
        </h2>
        <Link
          href="/generate"
          className="inline-block rounded-full bg-brand-500 px-8 py-4 text-base font-medium text-white shadow-xl shadow-brand-500/20 transition hover:bg-brand-600"
        >
          Şimdi ücretsiz dene
        </Link>
      </section>

      <MarketingFooter />
    </>
  );
}

const ACTS = [
  {
    title: "Çekim",
    desc: "Eşleşme sonrası ne yazarsın? Gelen her mesajın üç farklı tonda cevabı, saniyeler içinde. Overthinking biter.",
  },
  {
    title: "Sürdürme",
    desc: "Sohbetin ritmini kaybetmeden devam et. Hafızalı AI koç onun kişiliğini öğrenir, senin tarzını tanır.",
  },
  {
    title: "Onarım",
    desc: "Tartıştınız mı? Transkripti yapıştır. Kimin tırmandırdığını, kök nedeni, onarım mesajını gör.",
  },
];

const FEATURES = [
  {
    emoji: "💬",
    title: "Mesaj Üretici",
    desc: "Üç tonda, kopyala-yapıştır hazır cevaplar. Ortalama 1.8 saniye.",
  },
  {
    emoji: "🧠",
    title: "Kişi Analizörü",
    desc: "Kişilik tipi, bağlanma stili, çekim tetikleyicileri — yapılandırılmış profil.",
  },
  {
    emoji: "🛠️",
    title: "Çatışma Onarımı",
    desc: "Kimin tırmandırdığı, duygu haritası, onarım mesajı.",
  },
  {
    emoji: "📈",
    title: "İlişki Skoru",
    desc: "Uyum yüzdesi, 3 risk, 3 güç. Zamanla güncellenen trend.",
  },
  {
    emoji: "🔔",
    title: "Günlük Hook",
    desc: "Ne zaman ve ne yazacağını hatırlatan nazik dürtmeler.",
  },
  {
    emoji: "🔒",
    title: "Gizli kalır",
    desc: "Şifreli saklanır. Tek tıkla sil. Kimse okuyamaz.",
  },
];
