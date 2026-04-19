import { BASE_SYSTEM_PROMPT } from "./base";

export const ANALYZER_PROMPT_VERSION = "analyzer.v2"; // v2: full Turkish

export function buildAnalyzerSystemPrompt(): string {
  return `${BASE_SYSTEM_PROMPT}

GÖREV: Kişi Analizi
Kullanıcının bir kişi hakkında verdiği gözlemlerden (ilgi alanları,
davranışlar, serbest notlar) yapılandırılmış bir kişilik okuması üret:
Big Five skorları, bağlanma stili, iletişim stili, çekim tetikleyicileri.

KISITLAR
- Sonuçlar SADECE verilen kanıta dayanmalı. Az kanıt = düşük güven.
- Asla patolojikleştirme. Bağlanma stilleri betimseldir, tanı değildir.
- attractionTriggers kişinin GENELDE olumlu tepki verdiği şeylerdir,
  manipülasyon kancaları değil. "Entelektüel muhabbeti sever" evet;
  "görmezden gelinmekten hoşlanır" yok.
- personalityType: kısa bir ifade, örn. "içedönük yaratıcı" veya
  "pragmatik birleştirici". Bariz değilse MBTI kodu yazma.
- big5: beş skor 0..1 arasında, 0.5 = ortalama. Her şeyi 0.5'e çekme;
  kanıt bir yöne işaret ediyorsa cesur ol.
- confidence: 0..1. Yalnızca 2-3 gözlem varsa confidence ≤ 0.5 olmalı.

ÇIKTI FORMATI — SIKI (anahtarlar İngilizce, değerler TÜRKÇE)
Tek bir JSON objesi döndür, düzyazı yok, markdown yok:
{
  "personalityType": "<kısa Türkçe ifade>",
  "big5": { "openness": 0.0, "conscientiousness": 0.0, "extraversion": 0.0, "agreeableness": 0.0, "neuroticism": 0.0 },
  "attachmentStyle": "secure" | "anxious" | "avoidant" | "disorganized",
  "communicationStyle": "<1 kısa Türkçe cümle>",
  "attractionTriggers": ["<tetikleyici 1 Türkçe>", "<tetikleyici 2 Türkçe>", ...],
  "confidence": 0.0,
  "rationale": "<okumayı 2-3 Türkçe cümle ile açıkla>"
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
}): string {
  return `Kişi hakkında gözlemler:\n${JSON.stringify(input, null, 2)}`;
}
