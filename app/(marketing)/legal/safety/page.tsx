import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Güvenlik ve Etik — RizzAI",
  description:
    "Manipülasyon değil, iletişim aracı. Koyduğumuz sınırlar ve nedenleri.",
};

export default function SafetyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20 md:px-8">
      <p className="mb-3 font-display italic text-brand-400">
        sorumlu kalalım —
      </p>
      <h1 className="mb-4 font-display text-5xl leading-tight sm:text-6xl">
        Güvenlik ve Etik
      </h1>
      <p className="mb-12 text-lg text-ink-300">
        RizzAI manipülasyon aracı değil. İletişim yardımcısı.
      </p>

      <div className="space-y-10 text-[15px] leading-relaxed text-ink-200">
        <Section title="Yapmadıklarımız">
          <p>
            Aşağıdaki istekleri sistem otomatik olarak reddeder:
          </p>
          <ul className="ml-6 list-disc space-y-2 text-ink-300">
            <li>
              <strong className="text-ink-100">18 yaş altı hedefler</strong> —
              küçükleri içeren hiçbir içerik üretilmez. Hedef profilinde reşit
              olmadığına dair işaret varsa talep reddedilir.
            </li>
            <li>
              <strong className="text-ink-100">Rıza dışı durumlar</strong> —
              sarhoş, sıkıntıda olan, açıkça &quot;hayır&quot; demiş ya da
              uzaklaşmış birini ikna etmeye yönelik cevaplar üretilmez.
            </li>
            <li>
              <strong className="text-ink-100">Yalan</strong> — kimlik, yaş
              veya ilişki durumu hakkında yalan söylemeni önermez.
            </li>
            <li>
              <strong className="text-ink-100">Alay, küçük düşürme</strong> —
              hedefi aşağılayan, tehdit eden veya utandıran mesajlar
              üretilmez.
            </li>
          </ul>
        </Section>

        <Section title="Bu sınırlar nerede uygulanır">
          <p>
            <strong className="text-ink-100">Çağrı öncesi:</strong> girdi
            moderasyon katmanından geçer. Açıkça tehlikeli istekler AI&apos;ye
            bile gönderilmez.
          </p>
          <p>
            <strong className="text-ink-100">Çağrı sırası:</strong> AI sistem
            promptları bu kuralları kodlar. Model, talimatların aksine bir
            şey üretmeye çalışıldığında reddeder.
          </p>
          <p>
            <strong className="text-ink-100">Çağrı sonrası:</strong> çıktılar
            şema doğrulamasından ve bayraklı içerik için ek güvenlik
            kontrolünden geçer.
          </p>
        </Section>

        <Section title="Şeffaflık">
          <p>
            Her önerilen mesajın yanında &quot;neden bu cevap?&quot; açıklaması
            var. Kara kutu yok — mantığı görebilirsin, katılmazsan kullanma.
          </p>
          <p>
            İlerde belirli bir hedefte tekrar eden ve umutsuz görünen kullanım
            örüntüleri gösterirsen (örn. 48 saat içinde cevap vermeyen birine
            20+ üretim), uygulama seni nazikçe bir adım geri atmaya davet
            edecek. Bu bir cezalandırma değil; kendi iyiliğin için bir
            hatırlatma.
          </p>
        </Section>

        <Section title="Verilerin senin">
          <p>
            Ayarlar sayfasından hesabını ve tüm ilişkilendirilmiş veriyi tek
            tıkla silebilirsin. Verilerinin bir kopyasını isteme hakkın
            saklıdır.
          </p>
        </Section>

        <Section title="Neden bu sınırlar?">
          <p>
            Bu kategorideki ürünler — rizz asistanları, mesaj üreticileri —
            sık sık &quot;manipülasyonu kolaylaştıran&quot; olarak
            eleştiriliyor. Haklı eleştiriler. Biz bu ürünü, şöhretli olmanın
            daha zor olduğu kişiler için yaptık: içine kapanık, sosyal
            kaygılı, otizm spektrumunda, ana dili olmayan, iletişimde
            takıldığını hisseden insanlar için. Bu insanlar zaten dezavantajlı;
            onlara sahte bir kişilik takmak yerine, iletişim becerilerinde
            yardım etmek istiyoruz.
          </p>
          <p>
            Yukarıdaki sınırlar bunun somut karşılığı. Bir gün ihlal edildiğini
            fark edersen{" "}
            <a
              href="mailto:safety@rizzai.app"
              className="text-brand-400 underline"
            >
              safety@rizzai.app
            </a>{" "}
            adresine bildir.
          </p>
        </Section>

        <Section title="Eğer zarar görüyorsan">
          <p>
            Eğer şu an birinden zarar görüyorsan, bir yakınlık ilişkisinden
            çıkamıyorsan veya kendinle ilgili endişeli hissediyorsan, RizzAI
            bunun için doğru araç değil. Türkiye&apos;de{" "}
            <strong className="text-ink-100">183 (Alo Sosyal Destek)</strong>{" "}
            hattını arayabilir veya{" "}
            <a
              href="https://www.morcati.org.tr"
              target="_blank"
              rel="noreferrer"
              className="text-brand-400 underline"
            >
              Mor Çatı
            </a>{" "}
            gibi uzman kuruluşlara başvurabilirsin.
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
