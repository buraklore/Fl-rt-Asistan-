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
  const [kvkk, setKvkk] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kvkk) return;
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

    if (!data.session) {
      setSentEmail(true);
      return;
    }
    router.push("/onboarding");
    router.refresh();
  };

  if (sentEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 px-6">
        <div className="max-w-md text-center">
          <p className="mb-4 font-display text-2xl italic text-brand-400">
            e-postana bak —
          </p>
          <h1 className="mb-4 font-display text-4xl">Onay bekliyoruz.</h1>
          <p className="text-ink-300">
            <span className="text-ink-100">{email}</span> adresine onay
            bağlantısı gönderdik. Tıkla, seni uygulamanın içinde yakalayalım.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[1.1fr_1fr]">
      {/* Left — burgundy gradient poster */}
      <aside
        className="relative hidden overflow-hidden md:flex md:flex-col md:justify-between md:p-16"
        style={{
          background:
            "linear-gradient(145deg, #881337 0%, #6B0F2A 40%, #1F1023 100%)",
        }}
      >
        <Link
          href="/"
          className="relative z-10 font-display text-2xl tracking-tight text-ink-100 transition hover:opacity-80"
        >
          Flört<span className="italic text-brand-300"> asistanı</span>
        </Link>

        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-10 select-none font-display italic leading-[0.85] text-brand-300"
          style={{
            fontSize: "clamp(360px, 52vw, 680px)",
            opacity: 0.05,
            letterSpacing: "-0.04em",
          }}
        >
          flört
        </div>

        <div className="relative z-10 max-w-lg">
          <h1
            className="font-display leading-tight tracking-tight text-ink-100"
            style={{ fontSize: "clamp(44px, 5vw, 72px)", lineHeight: 1.02 }}
          >
            Birini anlamak —{" "}
            <span className="italic text-brand-300">ilk sen başla.</span>
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink-200">
            3 dakikada arketipin ve iletişim sesin hazır — sonra hedeflerine geç.
          </p>
        </div>

        <ul className="relative z-10 space-y-3 text-sm text-ink-200">
          {[
            "Mesaj Üretici — 3 ton seçeneği",
            "Kişi Analizörü — Big5 + bağlanma",
            "Günlük dürtme notları",
            "İstediğin zaman sil, her zaman senin",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-brand-400 text-[10px] font-semibold text-ink-950">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </aside>

      {/* Right — form */}
      <main className="flex items-center justify-center bg-ink-950 px-6 py-12 md:px-10">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-block font-display text-xl tracking-tight md:hidden"
          >
            Flört<span className="italic text-brand-500"> asistanı</span>
          </Link>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-400">
            — kayıt ol
          </p>
          <h2 className="mb-8 font-display text-4xl leading-tight tracking-tight">
            Ücretsiz başla.
          </h2>

          <form className="space-y-4" onSubmit={submit}>
            <Field
              label="takma ad"
              type="text"
              value={displayName}
              onChange={setDisplayName}
              placeholder="ne dememizi istersin?"
            />
            <Field
              label="e-posta"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="sen@ornek.com"
              required
            />
            <Field
              label="şifre"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="en az 8 karakter"
              required
            />

            <label className="flex cursor-pointer items-start gap-3 pt-2 text-sm leading-relaxed text-ink-300">
              <input
                type="checkbox"
                checked={kvkk}
                onChange={(e) => setKvkk(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-500"
              />
              <span>
                KVKK kapsamında verilerimin işlenmesini ve{" "}
                <Link href="/legal/terms" className="text-brand-400 hover:text-brand-300">
                  hizmet şartlarını
                </Link>{" "}
                kabul ediyorum.
              </span>
            </label>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || password.length < 8 || !kvkk}
              className="w-full rounded-xl bg-brand-500 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "hesabın oluşturuluyor…" : "Ücretsiz hesap aç →"}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-ink-400">
            hesabın var mı?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-brand-400 hover:text-brand-300"
            >
              giriş yap →
            </Link>
          </p>
        </div>
      </main>
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
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-ink-100 placeholder-ink-500 outline-none transition focus:border-brand-500 focus:bg-ink-900"
      />
    </label>
  );
}
