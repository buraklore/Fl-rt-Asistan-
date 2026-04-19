"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-950" />}>
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
    router.push(searchParams.get("next") ?? "/generate");
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
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-ink-900 md:block">
        <div className="spotlight absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col p-10">
          <Link
            href="/"
            className="text-xl font-display tracking-tight transition hover:opacity-80"
          >
            Rizz<span className="italic text-brand-500">AI</span>
          </Link>
          <div className="my-auto max-w-sm">
            <blockquote className="font-display text-4xl italic leading-tight text-ink-100">
              &ldquo;Arkadasina danismak gibi — sadece arkadasin senin yerine
              bes saniyede uc farkli cevap hazirlamis.&rdquo;
            </blockquote>
            <p className="mt-6 text-sm text-ink-400">
              — erken beta kullanicisi, 24
            </p>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 bottom-0 font-display italic text-[18rem] leading-none text-brand-500/5">
          rizz
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-block text-xl font-display tracking-tight md:hidden"
          >
            Rizz<span className="italic text-brand-500">AI</span>
          </Link>

          <p className="mb-3 font-display italic text-xl text-brand-400">
            tekrar hos geldin —
          </p>
          <h1 className="mb-10 font-display text-4xl leading-tight sm:text-5xl">
            Giris yap.
          </h1>

          <form className="space-y-4" onSubmit={submit}>
            <Field
              label="E-posta"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="seninposta@x.com"
              required
            />
            <Field
              label="Sifre"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="********"
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
              {loading ? "giris yapiliyor..." : "Giris yap"}
            </button>
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

          <p className="mt-10 text-center text-sm text-ink-300">
            Hesabin yok mu?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-brand-400 hover:text-brand-500"
            >
              Hemen olustur
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
