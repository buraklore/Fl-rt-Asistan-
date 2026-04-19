"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || null },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // If email confirmation is enabled (default), user.session will be null
    if (!data.session) {
      setSentEmail(true);
      return;
    }
    router.push("/onboarding");
    router.refresh();
  };

  if (sentEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="mb-4 font-display text-2xl italic text-brand-400">
            e-postana bak —
          </p>
          <h1 className="mb-4 font-display text-4xl">Onay bekliyoruz.</h1>
          <p className="text-ink-300">
            <span className="text-ink-100">{email}</span> adresine onay
            bağlantısı gönderdik. Tıkla, seni uygulamanın içinde
            yakalayalım.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <main className="flex items-center justify-center px-6 py-12 md:order-1">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-block text-xl font-display tracking-tight md:hidden"
          >
            Rizz<span className="italic text-brand-500">AI</span>
          </Link>

          <p className="mb-3 font-display italic text-xl text-brand-400">
            başlayalım —
          </p>
          <h1 className="mb-4 font-display text-4xl leading-tight sm:text-5xl">
            Hesabını oluştur.
          </h1>
          <p className="mb-10 text-sm text-ink-300">
            Ücretsiz. Kredi kartı istemez. 60 saniye.
          </p>

          <form className="space-y-4" onSubmit={submit}>
            <Field
              label="Takma ad (opsiyonel)"
              type="text"
              value={displayName}
              onChange={setDisplayName}
              placeholder="ne dememizi istersin?"
            />
            <Field
              label="E-posta"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="seninposta@x.com"
              required
            />
            <Field
              label="Şifre"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="en az 8 karakter"
              required
            />

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || password.length < 8}
              className="w-full rounded-xl bg-brand-500 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 disabled:opacity-50"
            >
              {loading ? "hesabın oluşturuluyor…" : "Hesabı oluştur"}
            </button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-ink-400">
            Devam ederek Şartlar ve Gizlilik Politikası&apos;nı kabul etmiş
            sayılırsın.
          </p>

          <p className="mt-8 text-center text-sm text-ink-300">
            Zaten üye misin?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-brand-400 hover:text-brand-500"
            >
              Giriş yap
            </Link>
          </p>
        </div>
      </main>

      <aside className="relative hidden overflow-hidden bg-ink-900 md:order-2 md:block">
        <div className="spotlight absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col p-10">
          <div className="my-auto max-w-sm">
            <p className="mb-6 font-display italic text-xl text-brand-400">
              bekleyen seni —
            </p>
            <h2 className="mb-8 font-display text-5xl leading-[1.05]">
              Günlük 3 <span className="italic">üretim,</span> kayıt anında
              açılır.
            </h2>
            <ul className="space-y-3">
              {[
                "Mesaj Üretici sınırsız deneme",
                "Kişi Analizörü — 1 hedef profili",
                "Günlük hook notları",
                "İstediğin zaman sil",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-ink-200"
                >
                  <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-ink-300">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-ink-100 placeholder-ink-500 outline-none transition focus:border-brand-500"
      />
    </label>
  );
}
