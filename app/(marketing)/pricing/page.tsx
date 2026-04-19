import Link from "next/link";
import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";

export const metadata: Metadata = {
  title: "Ücretlendirme",
  description:
    "Flört Asistanı ücretsiz başlar. Premium aylık 149 TL, yıllık 699 TL. İstediğin zaman iptal et.",
};

export default function PricingPage() {
  return (
    <>
      <MarketingNav />

      {/* Header */}
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-20 text-center sm:pt-28">
        <p className="mb-6 font-display italic text-xl text-brand-400">
          basit. dürüst. gerektiğinde.
        </p>
        <h1 className="font-display text-display-sm text-balance leading-[0.95] tracking-tightest sm:text-display-md">
          İki plan.
          <br />
          <span className="italic text-brand-500">Bir kararan.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-lg text-ink-200">
          Ücretsiz olarak dene. İşe yarıyorsa yükselt. Yaramıyorsa iptal et —
          iki tık, soru sormadan.
        </p>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-2xl border border-ink-800 bg-ink-900/40 p-8">
            <div className="mb-6">
              <h3 className="mb-2 font-display text-3xl">Ücretsiz</h3>
              <p className="text-sm text-ink-400">
                Başlamak için yeterince.
              </p>
            </div>

            <div className="mb-8">
              <span className="font-display text-6xl tracking-tight">0₺</span>
              <span className="ml-2 text-sm text-ink-400">/ her zaman</span>
            </div>

            <ul className="mb-10 space-y-3 text-sm">
              <Feature>Günde 3 mesaj üretimi</Feature>
              <Feature>Günde 5 koç sohbeti</Feature>
              <Feature>Haftada 1 çatışma analizi</Feature>
              <Feature>1 hedef profili</Feature>
              <Feature>Temel kişilik analizi</Feature>
            </ul>

            <Link
              href="/sign-up"
              className="mt-auto rounded-full border border-ink-700 px-6 py-3 text-center text-sm font-medium text-ink-100 transition hover:border-ink-600 hover:bg-ink-800"
            >
              Ücretsiz başla
            </Link>
          </div>

          {/* Premium */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-brand-500/40 bg-gradient-to-br from-brand-500/5 via-ink-900/40 to-ink-900/60 p-8">
            <div className="absolute right-6 top-6 rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">
              Popüler
            </div>

            <div className="mb-6">
              <h3 className="mb-2 font-display text-3xl">
                Premium
                <span className="ml-2 italic text-brand-400">sınırsız</span>
              </h3>
              <p className="text-sm text-ink-400">
                Ciddiysen. Hem iyi bir ciddiyet.
              </p>
            </div>

            <div className="mb-2">
              <span className="font-display text-6xl tracking-tight">149₺</span>
              <span className="ml-2 text-sm text-ink-400">/ ay</span>
            </div>
            <p className="mb-8 text-xs text-ink-300">
              Veya yıllık{" "}
              <span className="text-brand-400">699₺</span> · %61 tasarruf
            </p>

            <ul className="mb-10 space-y-3 text-sm">
              <Feature highlight>Sınırsız mesaj üretimi</Feature>
              <Feature highlight>Sınırsız koç sohbeti</Feature>
              <Feature highlight>Sınırsız çatışma analizi</Feature>
              <Feature highlight>Sınırsız hedef profili</Feature>
              <Feature highlight>Derinlemesine kişilik analizi</Feature>
              <Feature highlight>İlişki skoru + trend</Feature>
              <Feature highlight>Günlük özel hook'lar</Feature>
              <Feature highlight>Öncelikli destek</Feature>
            </ul>

            <Link
              href="/sign-up?plan=premium"
              className="mt-auto rounded-full bg-brand-500 px-6 py-3 text-center text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600"
            >
              Premium'a başla
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-ink-400">
          Tüm planlar KDV dahil · İstediğin zaman iptal et ·{" "}
          <Link href="/legal/terms" className="underline hover:text-ink-200">
            Şartlar
          </Link>
        </p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="divider mb-16" />
        <h2 className="mb-12 text-center font-display text-4xl sm:text-5xl">
          Sıkça sorulanlar
        </h2>

        <div className="space-y-8">
          {FAQS.map((faq, i) => (
            <details key={i} className="group border-b border-ink-800 pb-6">
              <summary className="flex cursor-pointer items-center justify-between text-lg font-medium text-ink-100 hover:text-brand-400">
                <span>{faq.q}</span>
                <span className="text-2xl text-ink-400 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="mt-4 text-sm leading-relaxed text-ink-300">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}

function Feature({
  children,
  highlight,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] ${
          highlight
            ? "bg-brand-500 text-white"
            : "bg-ink-800 text-ink-300"
        }`}
      >
        ✓
      </span>
      <span className={highlight ? "text-ink-100" : "text-ink-200"}>
        {children}
      </span>
    </li>
  );
}

const FAQS = [
  {
    q: "Gerçekten ücretsiz mi başlayabilirim?",
    a: "Evet. Kredi kartı istemeden. Günde 3 mesaj üretimi, günde 5 koç sohbeti ve haftada 1 çatışma analizi hakkı tanıyoruz. Bu limitler yarın tekrar sıfırlanır — birçok kişi için ücretsiz kata yeterli.",
  },
  {
    q: "İstediğim zaman iptal edebilir miyim?",
    a: "Evet, iki tıkla. Ne müşteri hizmetleri, ne anket, ne 'gitme lütfen' maili. Dönem sonuna kadar premium özellikler açık kalır, sonra ücretsiz plana düşersin.",
  },
  {
    q: "Mobilde ve webde aynı hesap mı?",
    a: "Evet. iOS, Android ve webde aynı hesapla giriş yaparsın. Premium aboneliğin her üçünde geçerlidir.",
  },
  {
    q: "Sohbetlerim güvende mi?",
    a: "Her şey şifrelenir. Kimsenin sohbetlerini okumuyoruz. Hesap ayarlarından tek tıkla tüm veriyi sildirip çıkabilirsin — GDPR uyumlu gerçek silme.",
  },
  {
    q: "Yıllık planı aldım, iade mümkün mü?",
    a: "İlk 7 gün içinde koşulsuz iade. Sonrasında iptal edebilirsin ama kullanılan süre için iade vermiyoruz.",
  },
  {
    q: "Takım / arkadaş grubu planınız var mı?",
    a: "Şu an yok. Ürün özel — arkadaşlarının sohbetlerini görmek istersen muhtemelen yanlış uygulamadasın.",
  },
];
