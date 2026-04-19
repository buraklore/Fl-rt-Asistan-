import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Şartları — Flört Asistanı",
  description:
    "Flört Asistanı'yi kullanırken geçerli kurallar, haklar ve sorumluluklar.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20 md:px-8">
      <p className="mb-3 font-display italic text-brand-400">
        anlaşalım —
      </p>
      <h1 className="mb-4 font-display text-5xl leading-tight sm:text-6xl">
        Kullanım Şartları
      </h1>
      <p className="mb-12 text-sm text-ink-400">
        Yürürlük: 19 Nisan 2026
      </p>

      <div className="space-y-10 text-[15px] leading-relaxed text-ink-200">
        <Section title="Kabul">
          <p>
            Flört Asistanı&apos;yi kullanarak bu şartları kabul etmiş olursun. Kabul
            etmezsen, uygulamayı kullanmamalısın.
          </p>
        </Section>

        <Section title="Yaş sınırı">
          <p>
            Hizmeti kullanmak için en az 18 yaşında olmalısın. 18 yaşın altında
            isen bu uygulamayı kullanmak için yasal izin yok.
          </p>
        </Section>

        <Section title="Hesabın ve güvenliğin">
          <p>
            Hesabını güvende tutmak senin sorumluluğundadır. Güçlü bir şifre
            seç, şifreni kimseyle paylaşma. Hesabındaki tüm etkinlikten sen
            sorumlusun.
          </p>
        </Section>

        <Section title="İçerik ve kullanım">
          <p>
            Flört Asistanı sana mesaj önerileri, ilişki analizi ve koçluk tavsiyeleri
            üretir. Bu çıktılar koç tarafından üretilir; profesyonel
            psikolojik, hukuki veya tıbbi tavsiye yerine geçmez. Kritik
            kararlar için yetkili uzmanlara danış.
          </p>
          <p>
            Aşağıdaki amaçlarla kullanamazsın:
          </p>
          <ul className="ml-6 list-disc space-y-1 text-ink-300">
            <li>18 yaşın altındaki bireyleri hedef alan içerik üretmek</li>
            <li>
              Sarhoş, rızası olmayan veya açıkça uzaklaşan birini manipüle
              etmek
            </li>
            <li>Kimlik, yaş, ilişki durumu hakkında yalan söylemek</li>
            <li>Taciz, tehdit, zorbalık veya küçük düşürme</li>
            <li>Stalking veya sürekli izleme</li>
            <li>Yasadışı amaçlarla kullanmak</li>
          </ul>
          <p>
            Bu kuralları ihlal eden hesaplar uyarısız kapatılabilir.
          </p>
        </Section>

        <Section title="Ücretsiz ve premium kullanım">
          <p>
            Ücretsiz katman, günlük ve haftalık belirli limitler içerir.
            Premium abonelik sınırsız kullanım sunar. Abonelik ücretleri
            sayfada listelenir; Apple App Store veya Google Play üzerinden
            satın alınan abonelikler, ilgili mağazanın kurallarına tabidir.
          </p>
          <p>
            Aboneliğini istediğin zaman iptal edebilirsin; iptal, mevcut
            ödeme döneminin sonunda yürürlüğe girer. Geri ödeme talepleri
            ilgili mağazanın politikalarına göre işlenir.
          </p>
        </Section>

        <Section title="Fikri mülkiyet">
          <p>
            Flört Asistanı ürünü, markası, kodu ve tasarımı bu uygulamayı
            geliştiren taraf tarafından sahiplenilir.
            Uygulamayı geri mühendislik yapmaya, kopyalamaya veya izinsiz
            dağıtmaya çalışamazsın.
          </p>
          <p>
            koç tarafından üretilen çıktılar senin kullanımın içindir — onları
            kopyalayıp kullanabilir, düzenleyebilirsin. Ancak bu çıktıların
            tescilli, benzersiz veya telif hakkıyla korunduğunu iddia edemezsin.
          </p>
        </Section>

        <Section title="Sorumluluk sınırı">
          <p>
            Flört Asistanı &quot;olduğu gibi&quot; sunulur. Çıktıların doğruluğu, uygunluğu
            veya belirli bir amaca uygunluğu garanti edilmez. İlişkisel
            sonuçlardan — mesaj göndermek, bir tartışmayı çözmek, bir ilişkiyi
            bitirmek — sen sorumlusun. Yasal olarak izin verilen en geniş
            ölçüde, hizmetin kullanımından doğan zararlardan sorumlu değiliz.
          </p>
        </Section>

        <Section title="Hesap kapatma">
          <p>
            Hesabını istediğin zaman Ayarlar sayfasından silebilirsin. Biz de
            bu şartları veya topluluk kurallarını ihlal ettiğinde hesabını
            kapatma hakkını saklı tutarız.
          </p>
        </Section>

        <Section title="Değişiklikler">
          <p>
            Bu şartları güncellediğimizde bildireceğiz. Uygulamayı kullanmaya
            devam etmen, güncel şartları kabul ettiğin anlamına gelir.
          </p>
        </Section>

        <Section title="Geçerli hukuk">
          <p>
            Bu şartlar Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlıklar
            İstanbul mahkemelerinde görülür.
          </p>
        </Section>

        <Section title="İletişim">
          <p>
            Sorularını{" "}
            <a
              href="mailto:destek@flortasistani.app"
              className="text-brand-400 underline"
            >
              destek@flortasistani.app
            </a>{" "}
            adresine gönder.
          </p>
        </Section>
      </div>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-2xl italic text-ink-100">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
