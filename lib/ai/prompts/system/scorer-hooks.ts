import type {
  TargetProfileForPrompt,
  UserProfileForPrompt,
} from "@/lib/schemas";
import { BASE_SYSTEM_PROMPT } from "./base";

// ---------- Relationship Score ----------

export const SCORER_PROMPT_VERSION = "scorer.v3"; // v3: full Turkish

export function buildScorerSystemPrompt(args: {
  user: UserProfileForPrompt | null;
  target: TargetProfileForPrompt | null;
  recentActivity: {
    generationsLast7Days: number;
    conflictsLast30Days: number;
    averageResponseLagHours: number | null;
  };
}): string {
  return `${BASE_SYSTEM_PROMPT}

GÖREV: İlişki Skoru — KULLANICI ile HEDEF arasındaki uyum.
0-100 arası bir uyum skoru üret. En kritik 3 risk ve en kritik 3 güçlü yönü
her iki profilin ve son aktivite sinyallerinin kanıtına dayanarak belirle.
Bu iki taraflı bir skor: bu iki spesifik insanın uyumu hakkında, sadece
hedefin genel cazibesi değil.

SKORLAMA KURALLARI
- 80-100: bağlanma stili, iletişim, hedefler, değerlerde güçlü uyum.
- 60-79:  uyumlu ama bir boyutta (bağlanma/hedef/tempo) anlamlı uyumsuzluk.
- 40-59:  açık çabayla yürüyebilir; birden fazla boyutta sürtüşme.
- 20-39:  yapısal uyumsuzluk (örn. kaygılı ↔ kaçıngan, farklı hedefler).
- 0-19:   ciddi uyumsuzluk; geri adım atmayı öner.

UYUM HEURİSTİKLERİ — profiller güçlü şekilde aksini söylemedikçe:
- Kaygılı ↔ kaçıngan çifti: risk olarak işaretle ama anlaşma-bozucu değil.
- Uyumsuz ilişki hedefleri (örn. "yeni tanışmak" ↔ "uzun vadeli"): büyük risk.
- Örtüşen ilgi alanları: hafif güç; tek başına nadiren belirleyici.
- İletişim stili uyumsuzluğu (direkt ↔ dolaylı): orta şiddette risk.

- Riskler mutlaka profil veya aktiviteden KANIT alıntılamalı.
- Veri uydurma. Profiller büyük ölçüde boşsa, güveni düşük tut ve bunu
  özette belirt.

${
  args.user
    ? `KULLANICI PROFİLİ (JSON) — soru soran kişi:\n${JSON.stringify(args.user, null, 2)}`
    : "KULLANICI PROFİLİ: yok. Düşük güvenle skorla, kullanıcı tarafı risk/güç atlama."
}

${
  args.target
    ? `HEDEF PROFİLİ (JSON):\n${JSON.stringify(args.target, null, 2)}`
    : "HEDEF PROFİLİ: bilinmiyor (orta skor, düşük güvenli dil kullan)."
}

SON AKTİVİTE:
${JSON.stringify(args.recentActivity, null, 2)}

ÇIKTI — SIKI JSON (anahtarlar İngilizce, değerler Türkçe):
{
  "compatibility": 0-100,
  "risks":    [{ "label": "<Türkçe>", "severity": 1-5, "evidence": "<Türkçe>" }],
  "strengths":[{ "label": "<Türkçe>", "evidence": "<Türkçe>" }],
  "summary": "<uyumun tek cümlelik Türkçe okunuşu>"
}
`;
}

// ---------- Daily Hooks ----------

export const HOOKS_PROMPT_VERSION = "hooks.v2"; // v2: full Turkish

export function buildHooksSystemPrompt(args: {
  target: TargetProfileForPrompt | null;
  daysSinceLastContact: number | null;
  recentHookCategories: string[];
}): string {
  return `${BASE_SYSTEM_PROMPT}

GÖREV: Günün Hook'u
Bugün kullanıcının hedefe gönderebileceği TEK BİR küçük, spesifik,
kopyala-yapıştır'a hazır açılış mesajı üret. Kategoriler:
- "reignite" — sessizlik sonrası hafif yeniden bağlanma
- "curiosity" — hedefin sadece cevap vermesini değil paylaşmasını davet
  eden soru
- "vulnerability" — karşılık davet eden küçük paylaşım (travma dökümü DEĞİL)
- "playful" — takılma, ortak espri, hafif meydan okuma

KISITLAR
- "text" GÖNDERİLMEYE HAZIR bir mesaj olmalı, 1-2 cümle maksimum, TÜRKÇE.
- Son gördüğü kategorileri tekrar etme: ${args.recentHookCategories.join(", ") || "(yok)"}.
- Mevcutsa hedef profilinden spesifik bir detaya referans ver.
- Hedef belirgin şekilde çekilmiş görünüyorsa: bunun yerine "curiosity"
  kategorisinde nötr bir metin üret.

${
  args.target
    ? `HEDEF PROFİLİ (JSON):\n${JSON.stringify(args.target, null, 2)}`
    : "HEDEF PROFİLİ: bilinmiyor — genel oyuncu bir hook üret."
}

Son temas üzerinden geçen gün: ${args.daysSinceLastContact ?? "bilinmiyor"}

ÇIKTI — SIKI JSON (anahtarlar İngilizce, değerler Türkçe):
{
  "category": "reignite" | "curiosity" | "vulnerability" | "playful",
  "text": "<gönderilmeye hazır açılış — TÜRKÇE>",
  "rationale": "<bu kişi için neden işe yaradığını açıklayan 1 kısa cümle — TÜRKÇE>"
}
`;
}
