"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  };

  const signInWithGoogle = async () => {
    const supabase = createSupabaseBrowserClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${siteUrl}/auth/callback` },
    });
  };

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

        {/* Decorative giant italic word */}
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
            Geri döndün —{" "}
            <span className="italic text-brand-300">devam edelim.</span>
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink-200">
            Hafızalı koçun seni bekliyor — konuşmanın kaldığın yerde.
          </p>
        </div>

        <p className="relative z-10 text-xs uppercase tracking-[0.3em] text-ink-300 opacity-60">
          istanbul · olgun romantizm
        </p>
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
            — giriş
          </p>
          <h2 className="mb-8 font-display text-4xl leading-tight tracking-tight">
            Giriş yap.
          </h2>

          <form className="space-y-4" onSubmit={submit}>
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
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-500 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 disabled:opacity-50"
            >
              {loading ? "giriş yapılıyor…" : "Giriş →"}
            </button>

            <p className="pt-2 text-center text-sm text-ink-400">
              <a className="cursor-pointer hover:text-ink-200">
                Şifremi unuttum?
              </a>
            </p>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-ink-800" />
            <span className="text-xs text-ink-400">veya</span>
            <div className="h-px flex-1 bg-ink-800" />
          </div>

          <button
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-ink-700 bg-ink-900/40 py-3 text-sm text-ink-100 transition hover:border-ink-600 hover:bg-ink-800"
          >
            <span className="h-4 w-4 rounded-sm bg-ink-700" />
            Google ile devam et
          </button>

          <p className="mt-10 text-center text-sm text-ink-400">
            hesabın yok mu?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-brand-400 hover:text-brand-300"
            >
              kayıt ol →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function SignInFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-sm text-ink-400">yükleniyor...</div>
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
