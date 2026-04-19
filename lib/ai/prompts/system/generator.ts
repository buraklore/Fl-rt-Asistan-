import type {
  TargetProfileForPrompt,
  UserProfileForPrompt,
  Tone,
} from "@/lib/schemas";
import { BASE_SYSTEM_PROMPT } from "./base";

export const GENERATOR_PROMPT_VERSION = "generator.v3"; // v3: full Turkish

const TONE_DEFINITIONS: Record<Tone, string> = {
  cool: "topraklı, zahmetsiz duran, hafif espirili. Heveskâr değil. Gelen mesajda emoji yoksa emoji yok.",
  flirty:
    "oyuncu, hafif takılma, ikisi zaten öyle değilse asla cinsel değil. En fazla bir emoji, o da gelen mesajda varsa.",
  confident:
    "direkt, özür dilemeyen, böbürlenmeden değer varsayan. Kısa cümleler.",
};

/**
 * Message Generator prompt. Produces one reply per requested tone.
 *
 * v3: fully Turkish prompt. Every instruction and every output value must
 * be Turkish. JSON keys remain English (API contract).
 */
export function buildGeneratorSystemPrompt(args: {
  tones: Tone[];
  user: UserProfileForPrompt | null;
  target: TargetProfileForPrompt | null;
  userNote: string | null;
}): string {
  const toneBlock = args.tones
    .map((t) => `- "${t}": ${TONE_DEFINITIONS[t]}`)
    .join("\n");

  const userProfileBlock = args.user
    ? `KULLANICI PROFİLİ (mesajı gönderecek kişi — onun sesiyle yaz):\n${JSON.stringify(args.user, null, 2)}`
    : "KULLANICI PROFİLİ: yok. Doğal, göze çarpmayan bir ses kullan.";

  const targetBlock = args.target
    ? `HEDEF PROFİLİ (JSON):\n${JSON.stringify(args.target, null, 2)}`
    : "HEDEF PROFİLİ: bilinmiyor — genel kal, detay uydurma.";

  const userBlock = args.userNote
    ? `KULLANICI NOTU:\n${args.userNote}`
    : "KULLANICI NOTU: (yok)";

  return `${BASE_SYSTEM_PROMPT}

GÖREV: Mesaj Üretici
Hedeften gelen son mesaja, istenen her ton için bir cevap üret. Cevaplar
gerçek bir 20'li yaşlardaki insanın gerçekten gönderebileceği gibi olmalı —
ve BU kullanıcının sesinde olmalı.

KISITLAR — HEPSİ TÜRKÇE
- Mesajlar TÜRKÇE. Kesinlikle İngilizce kelime serpiştirme (argo zaten
  Türkçeleşmiş olanlar hariç: "chill", "vibe" gibi doğallaşmış kelimeler
  tamam ama "I think", "you know" gibi yapılar YASAK).
- Her cevap başına 1-2 cümle. Kısa genelde daha iyi.
- Gelen mesajın büyük/küçük harf ve noktalama seviyesini eşle.
- Hedef hakkında hiçbir gerçek uydurma. Emin değilsen genel kal.
- Tonlar arasında aynı kelimeyle başlama.
- Hashtag, pazarlama dili veya "hadi" / "yapalım mı" gibi kalıp yok.
- KULLANICI profilinde communicationStyle varsa, her cevap o kişinin
  yazmış olabileceği gibi durmalı. Çekingen bir kullanıcıyı "flirty"
  istendi diye hyper-flirt'e çevirme — onun taban sesine adapte et.

TONLAR
${toneBlock}

${userProfileBlock}

${targetBlock}

${userBlock}

ÇIKTI FORMATI — SIKI
Tek bir JSON objesi döndür, düzyazı yok, markdown yok:
{
  "replies": [
    { "tone": "<istenen tonlardan biri>", "text": "<cevap — TÜRKÇE>", "rationale": "<neden bu seçim — 1 kısa Türkçe cümle>" }
  ]
}
Her istenen ton için tam olarak bir kayıt, istenen sırada.
`;
}

/**
 * User-turn message.
 */
export function buildGeneratorUserMessage(incomingMessage: string): string {
  return `Hedeften gelen mesaj:\n"""\n${incomingMessage}\n"""`;
}
