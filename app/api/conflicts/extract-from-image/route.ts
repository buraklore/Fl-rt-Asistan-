import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { requireUser } from "@/lib/auth";
import { requireCompleteProfile } from "@/lib/profile-gate";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/conflicts/extract-from-image
 *
 * Accepts a messaging-app screenshot as base64, uses GPT-4o Vision to
 * transcribe it into a chat transcript, returns the text.
 *
 * Intentionally does NOT persist the image — we transcribe and drop.
 * User can review the transcript before committing to analysis.
 *
 * Input:  multipart/form-data with field "image" (File)
 * Output: { data: { transcript: string } }
 */

const ACCEPTED_MIME = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const EXTRACTION_PROMPT = `Bu bir mesajlaşma uygulamasından alınmış ekran görüntüsü.
Tüm konuşmayı transkript olarak çıkar.

KURALLAR
- Her satıra "Ben: ..." veya "O: ..." formatında yaz.
  - Kullanıcının gönderdiği (genelde sağda, farklı renkte) mesajlar "Ben:"
  - Karşı tarafın mesajları "O:"
- Emoji'leri olduğu gibi koru.
- Zaman damgalarını ATLA, saat yok sadece mesaj içeriği.
- Okunaksız veya kısmen görünen kısımları [...] olarak işaretle.
- Hiç yorum ekleme, açıklama yazma. SADECE transkripti döndür.
- Ekran görüntüsünde Türkçe değilse, transkripti ORİJİNAL dilde bırak
  (sonra analizci doğru dile göre çalışsın).
- Profil fotoğrafları, okundu işaretleri, menü öğeleri vs. transkripte DAHİL ETME.

ÇIKTI FORMATI — düzyazı şeklinde, satır satır:
Ben: selam naber
O: iyi ya sen?
Ben: ben de iyi. hafta sonu ne yapıyorsun?
O: bilmem daha`;

export async function POST(request: NextRequest) {
  const authed = await requireUser();
  if (authed instanceof Response) return authed;
  const { user } = authed;

  const profileCheck = await requireCompleteProfile(user.id);
  if (!profileCheck.complete) {
    return fail(
      412,
      "Profil Tamamlanmamış",
      `Ekran görüntüsü analizi için önce profilini tamamla. Eksikler: ${profileCheck.missingFields.join(", ")}`,
      { missingFields: profileCheck.missingFields },
    );
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return fail(
      500,
      "Yapılandırma Hatası",
      "AI servisi hazır değil. Daha sonra tekrar dene.",
    );
  }

  // Parse multipart form
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return fail(
      400,
      "Geçersiz İstek",
      "Form verisi okunamadı. Ekran görüntüsünü tekrar ekleyip dene.",
    );
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return fail(400, "Eksik Dosya", "Ekran görüntüsü bulunamadı.");
  }

  if (file.size > MAX_BYTES) {
    return fail(
      400,
      "Dosya Çok Büyük",
      `Ekran görüntüsü en fazla 5 MB olabilir. Seninki ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
    );
  }

  if (!ACCEPTED_MIME.includes(file.type)) {
    return fail(
      400,
      "Desteklenmeyen Format",
      "PNG, JPEG veya WEBP formatında bir görüntü yükle.",
    );
  }

  // Convert to base64 for Vision API
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  try {
    const openai = new OpenAI({ apiKey: openaiKey });
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_VISION_MODEL ?? "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: EXTRACTION_PROMPT },
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1, // deterministic transcription
    });

    const transcript = response.choices[0]?.message?.content?.trim();
    if (!transcript || transcript.length < 10) {
      return fail(
        422,
        "Transkript Çıkarılamadı",
        "Görüntüden mesajları çözemedik. Daha net bir ekran görüntüsü deneyebilir veya manuel yazabilirsin.",
      );
    }

    return ok({
      transcript,
      telemetry: {
        model: response.model,
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    });
  } catch (err) {
    console.error("[extract-from-image] failed:", { userId: user.id, err });
    const msg =
      err instanceof Error
        ? err.message
        : "AI sağlayıcısı cevap vermedi.";
    return fail(502, "AI Sağlayıcı Hatası", msg);
  }
}

// Disable body size limit for this route (multipart)
export const config = {
  api: { bodyParser: false },
};
