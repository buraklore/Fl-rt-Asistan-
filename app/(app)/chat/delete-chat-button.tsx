"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

/**
 * Small icon button on chat session rows to delete the whole conversation
 * (including semantic memory). Confirm-then-delete pattern, no modal needed.
 */
export function DeleteChatButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "confirm" | "deleting">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (state === "idle") {
      setState("confirm");
      setTimeout(() => {
        setState((s) => (s === "confirm" ? "idle" : s));
      }, 3000);
      return;
    }

    if (state === "confirm") {
      setState("deleting");
      try {
        await api.deleteChatSession(sessionId);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.problem.detail ?? err.problem.title ?? "Silinemedi."
            : "Silinemedi.",
        );
        setState("idle");
      }
    }
  };

  const label =
    state === "deleting"
      ? "siliniyor..."
      : state === "confirm"
        ? "emin misin?"
        : "sil";

  return (
    <button
      onClick={handleClick}
      title={error ?? undefined}
      className={`rounded-full px-3 py-1 text-xs transition ${
        state === "confirm"
          ? "bg-red-500/20 text-red-400"
          : "text-ink-500 hover:text-red-400"
      } ${error ? "text-red-500" : ""}`}
    >
      {label}
    </button>
  );
}
