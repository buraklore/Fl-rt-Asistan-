"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button, ErrorBanner } from "@/components/app/ui";

/**
 * GDPR / KVKK account deletion with a two-step confirmation flow.
 * Irreversible: deletes auth.users + cascades every user-owned row.
 */
export function DeleteAccountButton() {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirming" | "deleting">("idle");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const CONFIRM_WORD = "SİL";

  const deleteAccount = async () => {
    if (confirmText !== CONFIRM_WORD) {
      setError(`Doğrulamak için '${CONFIRM_WORD}' yaz.`);
      return;
    }
    setStep("deleting");
    setError(null);

    try {
      const res = await fetch("/api/me", {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 204) {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
        return;
      }

      const problem = await res.json().catch(() => ({}));
      setError(
        problem.detail ??
          problem.title ??
          "Hesap silinemedi. Daha sonra tekrar dene.",
      );
      setStep("confirming");
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar dene.");
      setStep("confirming");
    }
  };

  if (step === "idle") {
    return (
      <button
        onClick={() => setStep("confirming")}
        className="text-sm text-red-400 hover:text-red-300"
      >
        Hesabımı kalıcı olarak sil
      </button>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
      <div>
        <p className="mb-2 font-display text-lg italic text-red-300">
          geri alınamaz —
        </p>
        <p className="text-sm text-ink-200">
          Bu işlem; tüm hedef profillerini, sohbet geçmişini, analizleri,
          üretilmiş mesajları ve hesabını kalıcı olarak silecek. 30 gün
          içinde yedeklerden de temizlenir.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-widest text-ink-400">
          Doğrulamak için{" "}
          <code className="rounded bg-ink-800 px-1.5 py-0.5 text-red-300">
            {CONFIRM_WORD}
          </code>{" "}
          yaz
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={step === "deleting"}
          className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 focus:border-red-500 focus:outline-none"
          placeholder={CONFIRM_WORD}
        />
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex items-center gap-3">
        <Button
          variant="danger"
          size="sm"
          onClick={deleteAccount}
          disabled={step === "deleting" || confirmText !== CONFIRM_WORD}
        >
          {step === "deleting" ? "siliniyor..." : "Hesabı sil"}
        </Button>
        <button
          onClick={() => {
            setStep("idle");
            setConfirmText("");
            setError(null);
          }}
          disabled={step === "deleting"}
          className="text-sm text-ink-400 hover:text-ink-200 disabled:opacity-50"
        >
          vazgeç
        </button>
      </div>
    </div>
  );
}
