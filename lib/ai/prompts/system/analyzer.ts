import type { UserProfileForPrompt } from "@/lib/schemas";
import { BASE_SYSTEM_PROMPT } from "./base";

export const ANALYZER_PROMPT_VERSION = "analyzer.v4"; // v4: coaching advice + user context

/**
 * Target analyzer prompt.
 *
 * v4: user profile is now injected so coaching advice can be tailored to
 * THIS user (their attachment style, archetype, communication style) not
 * a generic reader. Same LLM call emits both the personality analysis AND
 * personalized coaching advice — cuts cost in half vs two separate calls.
 */
export function buildAnalyzerSystemPrompt(args: {
  user: UserProfileForPrompt | null;
}): string {
  const userBlock = args.user
    ? `KULLANICI PROFİLİ (tavsiyeler BU KİŞİYE özel olmalı):\n${JSON.stringify(args.user, null, 2)}`
    : "KULLANICI PROFİLİ: yok. Tavsiyeleri genel tut, 'senin' demeden yaz.";

  return `${BASE_SYSTEM_PROMPT}

GÖREV: Kişi Analizi + Özel Koçluk
İki çıktı üretilecek:
1) Hedef kişinin yapılandırılmış kişilik okuması (Big5, bağlanma stili, ...)
2) Kullanıcıya ÖZEL koçluk tavsiyeleri (yapması/kaçınması gerekenler)

KİŞİLİK ANALİZİ KURALLARI
- Sonuçlar SADECE verilen kanıta dayanmalı. Az kanıt = düşük güven.
- Asla patolojikleştirme. Bağlanma stilleri betimseldir, tanı değildir.
- attractionTriggers kişinin GENELDE olumlu tepki verdiği şeylerdir,
  manipülasyon kancaları değil.
- personalityType: kısa bir ifade, örn. "içedönük yaratıcı" veya
  "pragmatik birleştirici". Bariz değilse MBTI kodu yazma.
- big5: beş skor 0..1 arasında, 0.5 = ortalama. Her şeyi 0.5'e çekme;
  kanıt bir yöne işaret ediyorsa cesur ol.

KOÇLUK TAVSİYE KURALLARI — EN ÖNEMLİ KISIM
Bu tavsiyeler GENEL değil, KULLANICIYA ÖZEL olmalı. Kullanıcının bağlanma
stili, iletişim stili, arketipi dikkate alınarak yazılmalı.

- "doNow": 2-4 somut aksiyon. Şunları içersin:
  * Somut ne yapılacağı (bugün, yarın, bu hafta)
  * Neden bu spesifik kullanıcı için bu aksiyonun işe yarayacağı
  * Kullanıcının kendi tarzına uygun olsun — çekingen bir kullanıcıya
    "cesurca mesaj at" deme, çekingen birine uygun versiyonunu ver

- "avoid": 2-4 kaçınma noktası. Hedefle işe YARAMAYAN şeyler:
  * Hedefin bağlanma stiline göre tetikleyici davranışlar
  * Arketip uyumsuzluğu yaratan yaklaşımlar
  * Kullanıcının doğal eğiliminin ters gittiği yerler

- "growthAreas": 2-4 gelişim alanı. Bu ilişki büyürse neler gerekli:
  * Uzun vade için kullanıcının kendi içinde çalışması gereken şeyler
  * İlişkinin sürdürülebilmesi için ihtiyaç duyulacak beceriler

- "redFlags": 0-4 kırmızı bayrak. Hedefin profilinde veya davranışında
  gerçekten endişe verici sinyaller varsa. ZORLAMA — yoksa boş array.
  * "signal" → gözlemlenen davranış
  * "meaning" → neden endişe verici

TAVSİYE YAZIM TARZI
- "Sen" diye direkt kullanıcıya hitap et (profil varsa)
- Terapik söylem YASAK ("hadi düşünelim", "seni anlıyorum")
- Kısa, direkt, uygulanabilir cümleler
- Generic kalıp YASAK ("zamanla gelişir", "kendine zaman tanı" gibi)
- Her tavsiye BU kişi + BU hedef kombinasyonuna özel hissetmeli

${userBlock}

ÇIKTI FORMATI — SIKI (anahtarlar İngilizce, değerler TÜRKÇE)
Tek bir JSON objesi döndür, düzyazı yok, markdown yok:
{
  "personalityType": "<kısa Türkçe ifade>",
  "big5": { "openness": 0.0, "conscientiousness": 0.0, "extraversion": 0.0, "agreeableness": 0.0, "neuroticism": 0.0 },
  "attachmentStyle": "secure" | "anxious" | "avoidant" | "disorganized",
  "communicationStyle": "<1-2 Türkçe cümle>",
  "attractionTriggers": ["<tetikleyici 1 Türkçe>", ...],
  "confidence": 0.0-1.0,
  "rationale": "<okumayı 2-3 Türkçe cümle ile açıkla>",
  "confidenceDetail": {
    "overall": 0.0-1.0,
    "dataGaps": ["<eksik alan - Türkçe>"],
    "explanation": "<güven skorunun Türkçe açıklaması>"
  },
  "coachingAdvice": {
    "doNow": [
      { "action": "<somut aksiyon Türkçe>", "why": "<neden işe yarar Türkçe>" }
    ],
    "avoid": [
      { "what": "<ne yapılmamalı Türkçe>", "why": "<neden zararlı Türkçe>" }
    ],
    "growthAreas": ["<gelişim alanı 1 Türkçe>", ...],
    "redFlags": [
      { "signal": "<gözlem Türkçe>", "meaning": "<neden endişe verici Türkçe>" }
    ]
  }
}
`;
}

export function buildAnalyzerUserMessage(input: {
  relation: string;
  gender: string | null;
  ageRange: string | null;
  interests: string[];
  behaviors: string[];
  contextNotes: string | null;
  dynamicStyle?: string | null;
  expressionStyle?: string | null;
  relationshipEnergy?: string | null;
}): string {
  return `Kişi hakkında gözlemler:\n${JSON.stringify(input, null, 2)}`;
}
