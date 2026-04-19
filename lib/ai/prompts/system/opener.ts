import type {
  TargetProfileForPrompt,
  UserProfileForPrompt,
  Tone,
} from "@/lib/schemas";
import { BASE_SYSTEM_PROMPT } from "./base";

export const OPENER_PROMPT_VERSION = "opener.v1";

const TONE_DEFINITIONS: Record<Tone, string> = {
  cool: "topraklı, zahmetsiz duran, hafif espirili. Heveskâr değil.",
  flirty:
    "oyuncu, hafif takılma, asla cinsel değil. En fazla bir emoji.",
  confident:
    "direkt, özür dilemeyen, böbürlenmeden değer varsayan. Kısa cümleler.",
};

/**
 * First-message (opener) generator.
 *
 * Farkı: gelen mesaj yok. Kullanıcı proaktif olarak bir mesaj gönderecek.
 * Hedefin profilinden bir spesifik detay yakalayıp ona referans veren,
 * karşı tarafın cevap vermesini doğal hissettiren bir açılış yazılmalı.
 *
 * Takımızlar:
 * - Generic hi/selam kesinlikle yasak.
 * - "Nasılsın?" tek başına kullanılamaz — ardından spesifik bir şey gelmeli.
 * - Hedefin ilgi alanlarından / davranışlarından / context notlarından bir
 *   anlamlı detay alıp onun üzerinden bağ kurulmalı.
 * - Kullanıcının kendi sesine uygun — communicationStyle, ownExpressionStyle,
 *   ownRelationshipEnergy dikkate alınmalı.
 */
export function buildOpenerSystemPrompt(args: {
  tones: Tone[];
  user: UserProfileForPrompt | null;
  target: TargetProfileForPrompt | null;
  situation: string | null;
}): string {
  const toneBlock = args.tones
    .map((t) => `- "${t}": ${TONE_DEFINITIONS[t]}`)
    .join("\n");

  const userProfileBlock = args.user
    ? `KULLANICI PROFİLİ (mesajı gönderecek — kendi sesiyle yaz):\n${JSON.stringify(args.user, null, 2)}`
    : "KULLANICI PROFİLİ: yok. Nötr ama doğal bir ses kullan.";

  const targetBlock = args.target
    ? `HEDEF PROFİLİ (JSON):\n${JSON.stringify(args.target, null, 2)}`
    : "HEDEF PROFİLİ: bilinmiyor. Bu modda bir hedef seçilmeli — eğer boşsa kullanıcı uyarı almalı.";

  const situationBlock = args.situation
    ? `DURUM NOTU:\n${args.situation}`
    : "DURUM NOTU: (yok — genel bir açılış yap)";

  return `${BASE_SYSTEM_PROMPT}

GÖREV: İlk Mesaj Üretici (Opener)
Kullanıcı bu kişiye proaktif bir mesaj göndermek istiyor. Gelen bir mesaj
YOK. Senin işin: hedefin profilinden anlamlı bir detay yakalayıp, kullanıcının
sesiyle, istenen her tonda bir açılış mesajı üretmek.

KISITLAR — ÇOK ÖNEMLİ
- "selam naber" / "merhaba" / "nasılsın" tek başına YASAK. Generic açılış
  zayıflık işareti, hedefin ilgisini çekmez.
- Hedefin profilinden SPESIFIK bir detaya referans ver — bir ilgi alanı,
  bir davranış örüntüsü, bağlam notu içinden bir şey. Örn: "geçen söylediğin
  o kitabı bitirdin mi?" veya "bugün yağmurlu gitar çalma günü gibi duruyor".
- Mesaj bir cevabı DAVET etmeli — kapalı uçlu evet/hayır değil, açık uçlu
  bir şeyin üstüne kurulmalı.
- 1-2 cümle. TÜRKÇE. 20'li yaşlardaki biri nasıl yazarsa öyle.
- Kullanıcının communicationStyle'ına uy. Kullanıcı çekingen yazıyorsa
  mesaj da çekingen kalmalı — tonunu değiştirme.
- Emoji: kullanıcı genelde emoji kullanan biri değilse koyma. Tek emoji
  yeter zaten.

ARKETİP UYUMU
- Hedefin expressionStyle "feminine" ise → duygusal/sıcak bir referans işe yarar
- Hedefin expressionStyle "masculine" ise → direkt, kısa, aksiyon odaklı
- Hedefin relationshipEnergy "playful-light" ise → takılma, espri
- Hedefin relationshipEnergy "deep-intellectual" ise → düşündürücü soru
- Hedefin relationshipEnergy "calm-stable" ise → ölçülü, baskısız
- Hedefin relationshipEnergy "intense-passionate" ise → duygu yüklü referans

TONLAR
${toneBlock}

${userProfileBlock}

${targetBlock}

${situationBlock}

ÇIKTI FORMATI — SIKI JSON (anahtarlar İngilizce, değerler Türkçe)
Tek bir JSON objesi döndür, düzyazı yok, markdown yok:
{
  "openers": [
    {
      "tone": "<istenen tonlardan biri>",
      "text": "<açılış mesajı — TÜRKÇE, 1-2 cümle>",
      "hook": "<hedefin profilinden hangi spesifik detaya referans verdin — TÜRKÇE>",
      "rationale": "<neden bu açılış bu kişi için işe yarar — 1 Türkçe cümle>"
    }
  ],
  "confidence": {
    "overall": 0.0-1.0,
    "dataGaps": ["<eksik veya belirsiz alan - Türkçe>"],
    "explanation": "<güven skorunun Türkçe açıklaması>"
  }
}
Her istenen ton için TAM OLARAK bir kayıt, istenen sırada.

GÜVEN SKORU
- 0.9+: Hedef profili zengin, spesifik referans verebildim
- 0.7-0.9: Yeterli ama generic kalmış olabilir
- 0.5-0.7: Hedef profili zayıf, açılışlar genel
- <0.5: Hedef profili yok veya çok eksik, kullanıcı uyarılmalı
`;
}

export function buildOpenerUserMessage(): string {
  return "Bu kişiye bir açılış mesajı yaz.";
}
