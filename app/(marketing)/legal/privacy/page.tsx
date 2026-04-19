import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — RizzAI",
  description:
    "Hangi verileri topluyoruz, nasıl kullanıyoruz, nasıl koruyoruz. Şeffaf ve sade.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20 md:px-8">
      <p className="mb-3 font-display italic text-brand-400">
        şeffaf kalalım —
      </p>
      <h1 className="mb-4 font-display text-5xl leading-tight sm:text-6xl">
        Gizlilik Politikası
      </h1>
      <p className="mb-12 text-sm text-ink-400">
        Yürürlük: 19 Nisan 2026 · Son güncelleme: 19 Nisan 2026
      </p>

      <div className="space-y-10 text-[15px] leading-relaxed text-ink-200">
        <Section title="Kısa özet">
          <p>
            RizzAI ilişki koçluğu aracıdır. Sana yardımcı olmak için senin
            yazdıklarını, oluşturduğun hedef profillerini ve sohbet
            geçmişini saklar. Bu veriler sadece seninle ilişkilendirilmiş
            şekilde, sana hizmet sunmak için kullanılır. Üçüncü taraflara
            satılmaz.
          </p>
        </Section>

        <Section title="Topladığımız veriler">
          <p>
            <strong className="text-ink-100">Hesap bilgileri:</strong> e-posta
            adresi, ad (isteğe bağlı), dil tercihi.
          </p>
          <p>
            <strong className="text-ink-100">Kullanıcı içeriği:</strong>{" "}
            oluşturduğun hedef profiller, yazdığın bağlam notları, sohbet
            mesajları, mesaj üretici girdileri, çatışma transkriptleri.
          </p>
          <p>
            <strong className="text-ink-100">Kullanım verileri:</strong> hangi
            özellikleri ne zaman kullandığın, günlük kota sayaçların. Bu
            veriler ürünü iyileştirmek ve ücretsiz/premium sınırlarını
            uygulamak için gereklidir.
          </p>
          <p>
            <strong className="text-ink-100">Teknik veriler:</strong> IP adresi
            (güvenlik için geçici olarak), tarayıcı/cihaz bilgisi, hata
            günlükleri.
          </p>
        </Section>

        <Section title="Verileri nasıl kullanıyoruz">
          <p>
            Girdiğin bilgileri AI sağlayıcımıza (Anthropic) gönderiyoruz. Bu,
            ürünün çalışması için zorunludur; içeriğin AI tarafından işlenmeden
            cevap üretemeyiz. Anthropic, API aracılığıyla gönderilen verileri
            model eğitimi için kullanmama taahhüdü altındadır.
          </p>
          <p>
            Verilerini asla reklam veya pazarlama amacıyla üçüncü taraflara
            satmıyoruz.
          </p>
        </Section>

        <Section title="Ne kadar süre saklıyoruz">
          <p>
            Hesabın aktif olduğu sürece verilerin saklanır. Hesabını sildiğinde
            tüm kişisel veriler ve içeriğin 30 gün içinde kalıcı olarak
            silinir. Bazı zorunlu finansal/yasal kayıtlar (faturalar, denetim
            logları) mevzuatın gerektirdiği süreler boyunca saklanabilir.
          </p>
        </Section>

        <Section title="Hakların (KVKK / GDPR)">
          <p>
            Erişim, düzeltme, silme, taşıma ve işleme itiraz hakkına sahipsin.
            Hesabını ayarlar sayfasından tek tıkla silebilirsin; bu,
            verilerinin kalıcı olarak silineceği bir talep başlatır.
            Sorularını veya taleplerini{" "}
            <a
              href="mailto:privacy@rizzai.app"
              className="text-brand-400 underline"
            >
              privacy@rizzai.app
            </a>{" "}
            adresine gönderebilirsin.
          </p>
        </Section>

        <Section title="Güvenlik">
          <p>
            Verilerin TLS ile aktarımda şifrelenir ve dinlemede (at-rest)
            Supabase üzerinde AES-256 ile şifrelenir. Row Level Security (RLS)
            sayesinde hiçbir kullanıcı başkasının verisini görmez — bu erişim
            kontrolü veritabanı düzeyinde zorunlu kılınır, uygulama kodundaki
            bir hata bu korumayı delmez.
          </p>
        </Section>

        <Section title="Çocuklar">
          <p>
            RizzAI 18 yaşın altındaki bireyler için tasarlanmamıştır. 18
            yaşından küçük olduğunu fark edersek hesabını kapatır ve verilerini
            sileriz. Uygulamayı kullanırken hedef profil olarak 18 yaş altı
            bireyleri tanımlayamazsın; bu tür istekler sistem tarafından
            reddedilir.
          </p>
        </Section>

        <Section title="Değişiklikler">
          <p>
            Bu politikayı güncellediğimizde e-posta ile veya uygulamada
            göstererek sana bildiririz. Devam eden kullanım, güncellenmiş
            politikayı kabul ettiğin anlamına gelir.
          </p>
        </Section>

        <Section title="İletişim">
          <p>
            Her türlü gizlilik sorusu için:{" "}
            <a
              href="mailto:privacy@rizzai.app"
              className="text-brand-400 underline"
            >
              privacy@rizzai.app
            </a>
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
