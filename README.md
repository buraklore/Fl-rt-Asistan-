# RizzAI

Yapay zeka ilişki koçu. Next.js 15 + Supabase + Anthropic Claude.

> **Mimari:** Tek Next.js uygulaması. Marketing sayfaları, auth, UI ve tüm backend mantığı aynı projede. Vercel'e deploy et, Supabase'e bağla, çalışır. Ayrı backend servisi yok.

---

## Hızlı başlangıç (5 dakika)

### 1. Supabase projesini kur

1. [supabase.com](https://supabase.com) → **New Project**
2. Proje adı: `rizzai`, güçlü bir DB şifresi seç, bölge: `Frankfurt` (Türkiye için en yakın)
3. 2-3 dakika bekle, DB hazırlansın
4. **Project Settings → API** sekmesine git, şu üçünü kopyala:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY` (bu sır, asla clientta kullanma)

### 2. Veritabanı şemasını yükle

**SQL Editor**'ı aç (sol menü). Aşağıdakileri sırayla çalıştır:

1. `supabase/migrations/001_schema.sql` içeriğini kopyala-yapıştır-run
2. `supabase/migrations/002_rls.sql` içeriğini kopyala-yapıştır-run

İkisi de "Success" demeli. Bu iki migration:
- Tüm tabloları oluşturur (users, targets, messages, scores, hooks, subscriptions…)
- pgvector extension'ı açar
- Her tabloya RLS (row-level security) policy'leri ekler — kullanıcılar sadece kendi verilerini görebilir
- Atomic quota enforcement için `increment_usage` RPC'sini oluşturur
- Auth trigger'ı kurar — her yeni kullanıcı için otomatik profil satırı

### 3. Anthropic API anahtarını al

[console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key. Kopyala: `ANTHROPIC_API_KEY`.

### 4. Lokal geliştirme

```bash
unzip rizzai-web.zip && cd rizzai-web
npm install
cp .env.example .env.local
# .env.local içindeki 4 anahtarı doldur:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   ANTHROPIC_API_KEY

npm run dev
# → http://localhost:3000
```

### 5. Test et

- `http://localhost:3000` — landing
- `http://localhost:3000/sign-up` → hesap oluştur
- `http://localhost:3000/generate` → Mesaj Üretici dene

---

## Vercel'e deploy

### 1. Projeyi GitHub'a yükle

```bash
cd rizzai-web
git init
git add .
git commit -m "initial commit"
# GitHub'da yeni repo oluştur, sonra:
git remote add origin https://github.com/KULLANICI-ADIN/rizzai.git
git branch -M main
git push -u origin main
```

### 2. Vercel'e bağla

1. [vercel.com](https://vercel.com) → **Add New → Project**
2. GitHub'daki `rizzai` repo'sunu seç → **Import**
3. **Environment Variables** alanında şunları ekle:

   | Key | Değer |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
   | `ANTHROPIC_API_KEY` | Claude API key |
   | `NEXT_PUBLIC_SITE_URL` | `https://SENIN-PROJE-ADI.vercel.app` (sonradan gerçek domain) |

4. **Deploy** → 1-2 dakika sonra site yayında

### 3. Supabase'de Vercel URL'ini OAuth redirect listesine ekle

Google/Apple giriş kullanacaksan:

1. Supabase Dashboard → **Authentication → URL Configuration**
2. **Site URL**: `https://SENIN-PROJE.vercel.app`
3. **Redirect URLs**: `https://SENIN-PROJE.vercel.app/auth/callback`

---

## Proje yapısı

```
rizzai/
├── app/
│   ├── (marketing)/           public sayfalar — landing, pricing, blog, how-it-works
│   ├── (auth)/                sign-in, sign-up, /auth/callback
│   ├── (app)/                 middleware ile korunan — /generate
│   ├── api/                   ***tüm backend mantığı burada***
│   │   ├── messages/generate/ Mesaj Üretici
│   │   ├── profiles/          Hedef CRUD + Analyzer
│   │   ├── chat/              Sohbet koçu (SSE streaming)
│   │   ├── conflicts/         Çatışma Analizörü
│   │   ├── scores/            İlişki Skoru
│   │   ├── hooks/today/       Günlük hook
│   │   └── health/            health check
│   ├── layout.tsx
│   ├── globals.css
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/                marketing-nav, marketing-footer
├── content/blog/              MDX yazılar
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts          createServerClient + service role
│   │   └── client.ts          createBrowserClient
│   ├── ai/                    LLM orkestrasyonu — provider, promptlar, memory, safety
│   ├── schemas/               Zod şemaları (API sözleşmesi)
│   ├── auth.ts                requireUser helper
│   ├── quota.ts               free tier metering (RPC ile atomic)
│   ├── http.ts                response envelope + Zod validation
│   ├── api.ts                 client-side fetcher
│   └── blog.ts                MDX loader
│
├── supabase/migrations/
│   ├── 001_schema.sql         TÜM DB şeması
│   └── 002_rls.sql            RLS policy'leri
│
├── middleware.ts              Supabase session refresh + auth gating
├── next.config.ts, tailwind.config.ts, tsconfig.json
└── .env.example
```

---

## Nasıl çalışıyor

### Auth akışı

```
Kullanıcı /sign-up'a gider
   ↓
Supabase Auth hesap oluşturur + onay e-postası gönderir
   ↓
Kullanıcı e-postadaki linke tıklar → /auth/callback
   ↓
Callback route session cookie'lerini set eder
   ↓
Kullanıcı /generate'e yönlendirilir
   ↓
Middleware her istekte session'ı refresh eder
```

Tüm oturum yönetimi **httpOnly cookie'ler** üzerinden — JavaScript token'a erişemez. Süper güvenli.

### API istekleri

```
Client: api.generateMessage(...) çağrılır
   ↓
fetch("/api/messages/generate", { credentials: "include" })
   ↓ (Supabase cookie'leri otomatik gider)
Server: route handler çalışır
   ↓
requireUser() session'ı doğrular, user döner
   ↓
enforceQuota() RPC ile atomic kota kontrolü (free tier)
   ↓
Supabase query'leri RLS ile otomatik filtrelenir
   ↓
AI çağrısı → DB'ye kaydet → response
```

### Güvenlik katmanları

1. **Middleware** — session refresh + route gating
2. **requireUser** — her API route'ta auth kontrolü
3. **RLS policies** — DB seviyesinde; user sadece kendi satırlarını görür
4. **Pre-call moderation** — LLM'e gitmeden önce keyword/pattern taraması
5. **System prompt hard rules** — LLM'in kendi iç güvenliği
6. **Zod schema validation** — hem request body'de hem LLM çıktısında

---

## Endpoint referansı

| Method | Path | Auth | Kota | Açıklama |
|---|---|---|---|---|
| POST | `/api/messages/generate` | ✅ | 3/gün | Mesaj Üretici |
| POST | `/api/profiles` | ✅ | — | Hedef oluştur |
| GET | `/api/profiles` | ✅ | — | Hedefleri listele |
| GET/PATCH/DELETE | `/api/profiles/[id]` | ✅ | — | Tek hedef |
| POST | `/api/profiles/[id]/analyze` | ✅ | 2/gün | Kişi Analizörü |
| POST | `/api/chat/sessions/[id]/messages` | ✅ | 5/gün | SSE stream |
| POST | `/api/conflicts/analyze` | ✅ | 1/hafta | Çatışma Analizörü |
| GET | `/api/scores/[targetId]` | ✅ | — | Son skor |
| POST | `/api/scores/[targetId]` | ✅ | — | Yeniden hesapla |
| GET | `/api/hooks/today` | ✅ | — | Bugünün hook'u |
| GET | `/api/health` | ❌ | — | Health check |

---

## Blog yazısı eklemek

`content/blog/` altına `.mdx` dosyası oluştur:

```mdx
---
title: "Yazı başlığı"
description: "Meta description için 1-2 cümle."
date: "2026-04-20"
tags: ["flört", "mesajlaşma"]
---

# Ana başlık

Normal markdown...
```

Sayfa otomatik olarak `/blog/dosya-adi` adresinde görünür. Sitemap otomatik günceller.

---

## Prod'a çıkmadan önce

- [ ] Vercel'de `NEXT_PUBLIC_SITE_URL`'i gerçek domain'e çevir
- [ ] Supabase → Authentication → URL Configuration'da callback URL'i güncelle
- [ ] Google OAuth için Supabase Dashboard → Authentication → Providers → Google'ı aç, Google Cloud Console'dan OAuth client oluştur
- [ ] E-posta onay template'ini özelleştir (Supabase → Authentication → Email Templates)
- [ ] Rate limiting için [Upstash](https://upstash.com) ya da Vercel WAF kullan
- [ ] Sentry kur — hata takibi
- [ ] PostHog kur — funnel analitiği
- [ ] Stripe ürünlerini oluştur, billing modülünü aktive et
- [ ] RLS'i prod'da tekrar test et (yeni hesap aç, başka kullanıcıların verilerini görebiliyor musun kontrol et)

## Sorun giderme

**"Invalid API key" hatası:** `.env.local` dosyası doğru mu? Key'lerde boşluk/tırnak işareti var mı? Geliştirme sunucusunu yeniden başlat.

**"Could not find function increment_usage":** Migration'lar yürütülmemiş. `supabase/migrations/001_schema.sql`'i çalıştır.

**"Row-level security policy violation":** RLS migration'ı yürüttün mü? `002_rls.sql` zorunlu.

**OAuth callback "oauth_failed":** Supabase Dashboard'da redirect URL'i doğru mu? `https://SENIN-DOMAIN/auth/callback` tam olarak.

**Vercel build "Module not found":** `npm install` çalıştırıp lockfile'ı commit ettin mi?
