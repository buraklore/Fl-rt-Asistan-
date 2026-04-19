import Link from "next/link";
import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";

export const metadata: Metadata = {
  title: "Nasıl çalışır",
  description:
    "Flört Asistanı'nin hafıza odaklı koçluk sistemi, kişilik analizörü ve mesaj üreticisi nasıl çalışıyor?",
};

export default function HowItWorksPage() {
  return (
    <>
      <MarketingNav />

      {/* Header */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-20 sm:pt-28">
        <p className="mb-6 font-display italic text-xl text-brand-400">
          perde arkası —
        </p>
        <h1 className="font-display text-display-sm text-balance leading-[0.95] tracking-tightest sm:text-display-lg">
          Hafıza odaklı.
          <br />
          <span className="italic">Chatbot değil.</span>
        </h1>
        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-200">
          Benzer asistanlar her konuşmayı sıfırdan başlatır. Flört Asistanı öyle değil. Her
          etkileşim iki profili zenginleştirir:{" "}
          <span className="callout">seni</span> ve{" "}
          <span className="callout">onu</span>. Uzun kullandıkça daha iyi tanır.
        </p>
      </section>

      {/* Steps — numbered, editorial */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        {STEPS.map((step, i) => (
          <article
            key={step.title}
            className="relative grid gap-8 border-t border-ink-800 py-16 md:grid-cols-12"
          >
            {/* Step number — huge, editorial */}
            <div className="md:col-span-4">
              <div className="font-display text-8xl italic leading-none text-brand-500/30 md:text-9xl">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-brand-400">
                {step.tag}
              </div>
            </div>

            <div className="md:col-span-8">
              <h2 className="mb-4 font-display text-3xl leading-tight sm:text-4xl">
                {step.title}
              </h2>
              <p className="mb-6 text-base leading-relaxed text-ink-200">
                {step.body}
              </p>

              {step.detail && (
                <div className="rounded-xl border border-ink-800 bg-ink-900/40 p-5 text-sm leading-relaxed text-ink-300">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-ink-400">
                    nasıl yapıyoruz
                  </span>
                  {step.detail}
                </div>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* Principles — brief editorial block */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="divider mb-20" />
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-400">
            değerlerimiz
          </p>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">
            Neye <span className="italic">evet</span>, neye{" "}
            <span className="italic text-brand-500">hayır</span> diyoruz.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <PrincipleCard
            kind="yes"
            title="Sağlıklı iletişim"
            desc="Düşüncelerini netleştirmene, nüansı yakalamaya, gerginliği onarmana yardım eder."
          />
          <PrincipleCard
            kind="yes"
            title="Özgünlüğünü korumak"
            desc="Senin tarzını öğrenir. Sonuçlar sana benzer, bir koça değil."
          />
          <PrincipleCard
            kind="no"
            title="Manipülasyon"
            desc="'Hayır' diyen, uzaklaşan, incinmiş birini ikna etmeye yardım etmiyoruz."
          />
          <PrincipleCard
            kind="no"
            title="Yalan söylemek"
            desc="Yaş, kimlik, ilişki durumu — hiçbirinde aldatma için kullanılmaz."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="mb-8 font-display text-5xl leading-tight sm:text-6xl">
          Kendin dene.
          <br />
          <span className="italic text-brand-500">30 saniye.</span>
        </h2>
        <Link
          href="/generate"
          className="inline-block rounded-full bg-brand-500 px-8 py-4 text-base font-medium text-white shadow-xl shadow-brand-500/20 transition hover:bg-brand-600"
        >
          Mesaj Üretici'yi aç
        </Link>
        <p className="mt-4 text-xs text-ink-400">Kayıt gerekmez</p>
      </section>

      <MarketingFooter />
    </>
  );
}

function PrincipleCard({
  kind,
  title,
  desc,
}: {
  kind: "yes" | "no";
  title: string;
  desc: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        kind === "yes"
          ? "border-ink-800 bg-ink-900/40"
          : "border-red-500/20 bg-red-500/5"
      }`}
    >
      <div className="mb-3 text-xs font-semibold uppercase tracking-widest">
        <span className={kind === "yes" ? "text-emerald-400" : "text-red-400"}>
          {kind === "yes" ? "✓ evet" : "✗ hayır"}
        </span>
      </div>
      <h3 className="mb-2 font-display text-xl">{title}</h3>
      <p className="text-sm leading-relaxed text-ink-300">{desc}</p>
    </div>
  );
}

const STEPS = [
  {
    tag: "profil",
    title: "Önce ikinizi tanır.",
    body: "Sen hakkında: iletişim tarzın, hedefin, senaryon. Onun hakkında: ilgi alanları, davranışları, nasıl tanıştığınız. Toplamda 90 saniye.",
    detail:
      "Verileri yapılandırılmış olarak saklarız — kişilik tipi, bağlanma stili, iletişim stili, çekim tetikleyicileri. Her koçluk sürecinde bu profiller bağlam olarak gönderilir. Modele 'kim' ve 'kim için' yazdığımızı söyler.",
  },
  {
    tag: "üretim",
    title: "Mesajı okur, üç tonda cevap verir.",
    body: "Crush'ından gelen mesajı yapıştır. Cool, flirty, confident — üç tonda, ortalama 1.8 saniyede, gerçekten insan gibi yazılmış cevaplar.",
    detail:
      "Claude'un en iyi modelini kullanıyoruz, sıkı sistem prompt'larıyla ve çıktı şema doğrulamasıyla. Her cevap 1–2 cümle, emoji ancak gelen mesajda varsa kullanılır, gelen mesajın ritmine uyum sağlar.",
  },
  {
    tag: "hafıza",
    title: "Her etkileşim onu daha iyi hale getirir.",
    body: "Hangi tonu kopyaladığını, hangi mesajın işe yaradığını, sohbetin nasıl evrildiğini hatırlar. Zamanla, sana özel hale gelir.",
    detail:
      "Semantik hafıza (pgvector embeddings) + son-N verbatim turlar + eski geçmişin otomatik özeti. Token bütçesini aşmadan hedefle olan tüm tarihçeni koçluk sürecine aktarırız.",
  },
  {
    tag: "onarım",
    title: "Tartıştıysanız — analiz eder.",
    body: "Tartışmanın transkriptini yapıştır. Kimin tırmandırdığını, hangi duygunun ateşlendiğini, kök nedeni ve tek bir onarım mesajını gösterir.",
    detail:
      "Çatışma Analizörü her iki tarafın duygusal haritasını çıkarır, tırmanışın kimden geldiğini kanıtla gösterir, ve kullanıcının kendi tarzında — aşırı terapi diline kaymayan — tek bir onarım mesajı önerir.",
  },
  {
    tag: "güvenlik",
    title: "Sınırların arkasında.",
    body: "Reşit olmayan, sarhoş, açıkça uzaklaşmış birine yönelik içerik üretmez. Manipülasyon aracı değil, iletişim yardımcısı.",
    detail:
      "Üç katmanlı güvenlik: çağrı öncesi pattern taraması, sistem promptuna gömülü sert kurallar, çağrı sonrası çıktı denetimi. Kullanım örüntün takıntıya işaret etmeye başlarsa nazik bir 'geri çekil' dürtmesi alırsın.",
  },
];
