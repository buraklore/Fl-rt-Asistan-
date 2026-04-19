import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";

export default function LandingPage() {
  return (
    <>
      <MarketingNav />

      {/* ============================================================
          HERO — burgundy gradient, big editorial headline
          ============================================================ */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #6B0F2A 0%, #140A10 55%, #140A10 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-32">
          <div className="relative">
            <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-400">
              — beta · sadece davetliye özel
            </p>

            <h1 className="font-display text-display-sm text-balance leading-[0.95] tracking-tightest sm:text-display-md md:text-display-lg">
              Crush&apos;ın ne demek istiyor?
              <br />
              <span className="italic text-brand-400">
                kendisi söylemeyecek.
              </span>
            </h1>

            <p className="mt-10 max-w-xl text-lg leading-relaxed text-ink-200 sm:text-xl">
              İlişki koçun — mesajlarını okur, onu çözer, sana ne diyeceğini
              söyler. <span className="text-ink-100">AI değil, koç.</span>
            </p>

            <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/sign-up"
                className="group rounded-full bg-brand-500 px-7 py-4 text-base font-medium text-white shadow-xl shadow-brand-500/20 transition hover:bg-brand-600 hover:shadow-brand-500/30"
              >
                ücretsiz başla
                <span className="ml-2 inline-block transition group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <span className="text-sm text-ink-400">
                kredi kartı yok · 3 dakikada hazır
              </span>
            </div>

            <div className="mt-16 flex flex-wrap gap-x-12 gap-y-6">
              {[
                ["3.2k+", "aktif kullanıcı"],
                ["48k+", "üretilen mesaj"],
                ["%92", "tekrar kullanım"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="font-display text-3xl text-ink-100">{value}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute -right-20 top-1/2 hidden -translate-y-1/2 select-none font-display italic lg:block"
          style={{
            fontSize: "clamp(280px, 36vw, 520px)",
            color: "#F17A92",
            opacity: 0.05,
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
          }}
        >
          flört
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS — three numbered feature rows, editorial
          ============================================================ */}
      <section className="border-t border-ink-800 bg-ink-950 py-32">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-400">
            — nasıl çalışır
          </p>
          <h2 className="mb-24 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Üç adım —{" "}
            <span className="italic text-brand-400">sonsuz konu.</span>
          </h2>

          <FeatureRow
            num="01"
            title="Hedef analizi"
            desc="Kim olduğunu tanıtırsın. Koç, davranışlarını, tetikleyicilerini ve bağlanma stilini çıkarır — konuşmadığı şeyleri sana söyler."
            bullets={[
              "Big5 kişilik profili",
              "Bağlanma stili",
              "Arketip eşleşmesi",
            ]}
            mockLabel="Hedef Detay · Ayşe"
          />
          <FeatureRow
            num="02"
            title="Mesaj üretimi"
            desc="Gelen mesaja cevap, ilk mesaj veya hook — üç ton seçeneğiyle. Onun diline göre, senin sesinle."
            bullets={[
              "Flörtöz · Sakin · Oyuncu",
              "“neden bu cevap?” açıklama",
              "Tek tıkla kopyala",
            ]}
            mockLabel="Mesaj Üretici · 3 cevap"
            reverse
          />
          <FeatureRow
            num="03"
            title="Çatışma onarımı"
            desc="Tartışma transkripti yükle. Kök sebebi bul, onarım mesajını al — onu daha fazla kaçırmadan."
            bullets={[
              "Ciddiyet ölçümü",
              "Kök sebep analizi",
              "Hazır onarım mesajı",
            ]}
            mockLabel="Çatışma · Sonuç"
          />
        </div>
      </section>

      {/* ============================================================
          FEATURE GRID — 6 smaller capabilities
          ============================================================ */}
      <section className="border-t border-ink-800 bg-ink-950 py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-20 max-w-2xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-400">
              — daha fazla
            </p>
            <h2 className="font-display text-5xl leading-[1.05] tracking-tight">
              Sadece mesaj değil —{" "}
              <span className="italic text-brand-400">bütün akış.</span>
            </h2>
          </div>

          <div className="grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-500/20 bg-brand-500/5 text-xl text-brand-400">
                  {f.symbol}
                </div>
                <h3 className="mb-2 font-display text-2xl leading-tight text-ink-100">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-300">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          PULL QUOTE — editorial moment
          ============================================================ */}
      <section className="border-t border-ink-800 bg-ink-950">
        <div className="mx-auto max-w-4xl px-6 py-32 text-center">
          <div
            aria-hidden
            className="pointer-events-none mx-auto mb-8 select-none font-display italic leading-none text-brand-500"
            style={{
              fontSize: "clamp(120px, 14vw, 200px)",
              opacity: 0.15,
            }}
          >
            &ldquo;
          </div>
          <blockquote className="font-display text-4xl leading-[1.15] text-balance text-ink-100 sm:text-5xl">
            <span className="italic text-brand-400">
              Arkadaşına danışmak gibi —
            </span>{" "}
            sadece arkadaşın senin yerine beş saniyede üç farklı cevap
            hazırlamış.
          </blockquote>
          <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
            — erken beta kullanıcısı, 24
          </p>
        </div>
      </section>

      {/* ============================================================
          ETHICS — important trust section
          ============================================================ */}
      <section className="border-t border-ink-800 bg-ink-950 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div
            className="relative overflow-hidden rounded-3xl border border-brand-500/20 p-10 md:p-16"
            style={{
              background:
                "linear-gradient(145deg, rgba(225,29,72,0.08) 0%, rgba(31,16,35,0.6) 60%)",
            }}
          >
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-400">
              — sınırlarımız
            </p>
            <h3 className="mb-6 max-w-2xl font-display text-4xl leading-tight text-ink-100 sm:text-5xl">
              Manipülasyon değil.{" "}
              <span className="italic text-brand-400">sağlıklı iletişim.</span>
            </h3>
            <p className="max-w-2xl text-base leading-relaxed text-ink-200 sm:text-lg">
              Flört Asistanı reşit olmayan, sarhoş ya da açıkça uzaklaşmış
              birine yönelik içerik üretmez. Sağlıklı iletişim için tasarlandı —
              kısa yol için değil. Mesajın her zaman senin sesinle, senin
              iznin kadar.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          FINAL CTA — big, editorial
          ============================================================ */}
      <section
        className="relative overflow-hidden border-t border-ink-800"
        style={{
          background:
            "linear-gradient(135deg, #881337 0%, #6B0F2A 40%, #1F1023 100%)",
        }}
      >
        <div className="relative mx-auto max-w-4xl px-6 py-32 text-center">
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-300">
            — başla
          </p>
          <h2 className="mb-10 font-display text-5xl leading-[0.98] text-balance sm:text-7xl">
            Bir sonraki cevabın,
            <br />
            <span className="italic text-brand-300">yazılmaya hazır.</span>
          </h2>
          <Link
            href="/sign-up"
            className="inline-block rounded-full bg-brand-500 px-10 py-5 text-base font-medium text-white shadow-xl shadow-brand-500/30 transition hover:bg-brand-600"
          >
            ücretsiz başla →
          </Link>
          <p className="mt-6 text-sm text-ink-300">
            kredi kartı yok · istediğin zaman sil
          </p>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/2 hidden -translate-x-1/2 select-none font-display italic lg:block"
          style={{
            fontSize: "clamp(360px, 48vw, 640px)",
            color: "#F17A92",
            opacity: 0.05,
            letterSpacing: "-0.04em",
            lineHeight: 0.85,
          }}
        >
          flört
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}

// ============================================================
// FeatureRow — numbered, asymmetric, with mockup placeholder
// ============================================================

function FeatureRow({
  num,
  title,
  desc,
  bullets,
  mockLabel,
  reverse = false,
}: {
  num: string;
  title: string;
  desc: string;
  bullets: string[];
  mockLabel: string;
  reverse?: boolean;
}) {
  return (
    <div
      className={`mb-28 grid items-center gap-12 last:mb-0 md:grid-cols-[1.1fr_1fr] md:gap-16 ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div>
        <p className="mb-4 font-display text-6xl italic leading-none text-brand-500/40">
          {num}
        </p>
        <h3 className="mb-6 font-display text-4xl leading-tight text-ink-100 sm:text-5xl">
          {title}
        </h3>
        <p className="mb-8 text-lg leading-relaxed text-ink-300">{desc}</p>
        <ul className="space-y-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-ink-200">
              <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[10px] text-brand-400">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="relative flex h-[360px] flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border border-dashed border-ink-700 p-6"
        style={{
          background:
            "linear-gradient(180deg, rgba(225,29,72,0.06), rgba(31,16,35,0.4))",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent 0 20px, rgba(255,230,240,0.04) 20px 21px)",
          }}
        />
        <p className="relative font-display text-2xl italic text-brand-400">
          ekran önizleme
        </p>
        <p className="relative text-[10px] font-semibold uppercase tracking-[0.3em] text-ink-500">
          {mockLabel}
        </p>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    symbol: "✻",
    title: "Mesaj Üretici",
    desc: "Üç tonda, kopyala-yapıştır hazır cevaplar. Ortalama 1.8 saniye.",
  },
  {
    symbol: "◊",
    title: "Hafızalı Koç",
    desc: "Seninle konuşan, seni ve hedeflerini hatırlayan kişisel koç.",
  },
  {
    symbol: "⟁",
    title: "Çatışma Onarımı",
    desc: "Kimin tırmandırdığı, duygu haritası, onarım mesajı.",
  },
  {
    symbol: "◢",
    title: "İlişki Skoru",
    desc: "Uyum yüzdesi, 3 risk, 3 güç. Zamanla güncellenen trend.",
  },
  {
    symbol: "○",
    title: "Günlük Dürtme",
    desc: "Ne zaman ve ne yazacağını hatırlatan nazik öneriler.",
  },
  {
    symbol: "✦",
    title: "Gizli kalır",
    desc: "Şifreli saklanır. Tek tıkla sil. Kimse okuyamaz.",
  },
];
