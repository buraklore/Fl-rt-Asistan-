import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      <MarketingNav />

      {/* ================================================================
          HERO
          ================================================================ */}
      <section
        className="relative overflow-hidden px-6 sm:px-12"
        style={{
          minHeight: "calc(100vh - 73px)",
          background:
            "linear-gradient(135deg, #6B0F2A 0%, #0A0A0F 55%, #0A0A0F 100%)",
        }}
      >
        {/* Decorative giant italic "flört" */}
        <div
          aria-hidden
          className="pointer-events-none absolute select-none font-display italic"
          style={{
            right: -80,
            top: 40,
            fontSize: "clamp(280px, 36vw, 520px)",
            lineHeight: 0.9,
            color: "#F17A92",
            opacity: 0.05,
            letterSpacing: "-0.04em",
          }}
        >
          flört
        </div>

        <div className="relative z-[2] mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-12 py-16 lg:grid-cols-[1.3fr_1fr] lg:py-0">
          <div className="max-w-[720px] pr-0 lg:pr-6">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-400">
              — beta · sadece davetliye özel
            </p>

            <h1
              className="font-display font-normal tracking-tight"
              style={{
                fontSize: "clamp(48px, 6vw, 88px)",
                lineHeight: 0.98,
                letterSpacing: "-0.03em",
              }}
            >
              Crush&apos;ın ne demek istiyor?{" "}
              <span className="italic text-brand-400">
                kendisi söylemeyecek.
              </span>
            </h1>

            <p className="mb-9 mt-7 max-w-[520px] text-[17px] leading-[1.55] text-ink-300">
              İlişki koçun — mesajlarını okur, onu çözer, sana ne diyeceğini
              söyler.
              <span className="text-ink-100"> AI değil, koç.</span>
            </p>

            <div className="flex flex-wrap items-center gap-[14px]">
              <Link
                href="/sign-up"
                className="rounded-full bg-brand-500 px-7 py-4 text-[15px] font-medium text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600"
              >
                ücretsiz başla →
              </Link>
              <span className="text-[13px] text-ink-400">
                kredi kartı yok · 3 dakikada hazır
              </span>
            </div>

            {/* Trust row */}
            <div className="mt-14 flex flex-wrap gap-8">
              {[
                ["3.2k+", "aktif kullanıcı"],
                ["48k+", "üretilen mesaj"],
                ["%92", "tekrar kullanım"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-[32px] text-ink-100">{v}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                    {l}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right mockup */}
          <div className="relative z-[2] hidden justify-center lg:flex">
            <MockupPlaceholder label="Mesaj Üretici — cevap" width={380} height={460} />
          </div>
        </div>
      </section>

      {/* ================================================================
          FEATURE ROWS
          ================================================================ */}
      <section className="border-t border-ink-800 px-6 py-[120px] sm:px-12">
        <div className="mx-auto max-w-[1200px]">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-400">
            — nasıl çalışır
          </p>
          <h2
            className="mb-20 max-w-[720px] font-display tracking-tight"
            style={{ fontSize: 52, lineHeight: 1.05, letterSpacing: "-0.02em" }}
          >
            Üç adım —{" "}
            <span className="italic text-brand-400">sonsuz konu</span>.
          </h2>

          <FeatureRow
            num="01"
            title="Hedef analizi"
            desc="Kim olduğunu tanıtırsın. Koç, davranışlarını, tetikleyicilerini ve bağlanma stilini çıkarır — konuşmadığı şeyleri sana söyler."
            bullets={["Big5 kişilik profili", "Bağlanma stili", "Arketip eşleşmesi"]}
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
            last
          />
        </div>
      </section>

      {/* ================================================================
          SOCIAL PROOF — topluluk
          ================================================================ */}
      <section
        className="border-t border-ink-800 px-6 py-[100px] sm:px-12"
        style={{
          background: "linear-gradient(180deg, #0A0A0F, #111118)",
        }}
      >
        <div className="mx-auto max-w-[1200px] text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-400">
            — topluluk
          </p>
          <h2
            className="font-display"
            style={{ fontSize: 48, letterSpacing: "-0.02em" }}
          >
            3 binden fazla{" "}
            <span className="italic text-brand-400">kullanıcı</span>.
          </h2>

          <div className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-4">
            {[
              ["3.2k", "kullanıcı"],
              ["48k", "üretilen mesaj"],
              ["1.9k", "hedef analiz"],
              ["%92", "tekrar kullanım"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="rounded-2xl border border-ink-800 bg-ink-900/40 p-7 text-left"
              >
                <p
                  className="font-display text-ink-100"
                  style={{ fontSize: 52, lineHeight: 1 }}
                >
                  {v}
                </p>
                <p className="mt-[10px] text-[12px] font-semibold uppercase tracking-[0.25em] text-ink-400">
                  {l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

// ============================================================
// FeatureRow — birebir Claude Design
// ============================================================

function FeatureRow({
  num,
  title,
  desc,
  bullets,
  mockLabel,
  reverse = false,
  last = false,
}: {
  num: string;
  title: string;
  desc: string;
  bullets: string[];
  mockLabel: string;
  reverse?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`grid items-center gap-12 md:grid-cols-2 md:gap-[72px] ${
        last ? "pb-0 mb-0" : "pb-24 mb-24 border-b border-ink-800"
      }`}
    >
      <div className={reverse ? "md:order-2" : "md:order-1"}>
        <MockupPlaceholder label={mockLabel} width={460} height={320} />
      </div>
      <div className={reverse ? "md:order-1" : "md:order-2"}>
        <p
          className="font-display italic text-brand-400"
          style={{ fontSize: 56, opacity: 0.4, lineHeight: 1 }}
        >
          {num}
        </p>
        <h3
          className="mb-5 mt-3 font-display tracking-tight"
          style={{ fontSize: 40, letterSpacing: "-0.02em" }}
        >
          {title}
          <span className="text-brand-500">.</span>
        </h3>
        <p className="max-w-[480px] text-[16px] leading-[1.65] text-ink-300">
          {desc}
        </p>
        <ul className="mt-6 list-none space-y-0 p-0">
          {bullets.map((b, i) => (
            <li
              key={b}
              className={`flex gap-3 py-[10px] text-[14px] text-ink-200 ${
                i > 0 ? "border-t border-ink-800" : "border-t border-ink-800"
              }`}
            >
              <span className="text-brand-500">◆</span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ============================================================
// MockupPlaceholder — birebir Claude Design
// ============================================================

function MockupPlaceholder({
  label,
  width = 400,
  height = 480,
}: {
  label: string;
  width?: number;
  height?: number;
}) {
  return (
    <div
      className="relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] border border-dashed border-ink-700 p-6"
      style={{
        maxWidth: width,
        height,
        background:
          "linear-gradient(180deg, rgba(225,29,72,0.06), rgba(17,17,24,0.4))",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          opacity: 0.25,
          background:
            "repeating-linear-gradient(45deg, transparent 0 20px, rgba(255,230,240,0.03) 20px 21px)",
        }}
      />
      <p className="z-[1] font-display italic text-brand-400" style={{ fontSize: 22 }}>
        ekran önizleme
      </p>
      <p className="z-[1] text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-500">
        {label}
      </p>
    </div>
  );
}
