"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  PageHeader,
  Textarea,
  Button,
  ErrorBanner,
} from "@/components/app/ui";

type Params = { params: Promise<{ id: string }> };

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

type Session = {
  id: string;
  title: string | null;
  target: { id: string; name: string | null; relation: string } | null;
};

export default function ChatSessionPage({ params }: Params) {
  const { id } = use(params);

  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/chat/sessions/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        const body = await res.json();
        setSession(body.data.session);
        setMessages(body.data.messages);
      } catch {
        setError("Oturum yüklenemedi.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamBuffer]);

  const send = async () => {
    if (!input.trim() || streaming) return;

    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: input.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setStreaming(true);
    setStreamBuffer("");
    setError(null);

    try {
      const res = await fetch(`/api/chat/sessions/${id}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage.content }),
      });

      if (!res.ok || !res.body) {
        const problem = await res.json().catch(() => ({}));
        throw new Error(
          problem.detail ?? problem.title ?? "Mesaj gönderilemedi",
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        // Parse SSE events — split on blank line
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";

        for (const part of parts) {
          const lines = part.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event: "));
          const dataLine = lines.find((l) => l.startsWith("data: "));
          if (!eventLine || !dataLine) continue;

          const eventName = eventLine.slice(7).trim();
          const data = JSON.parse(dataLine.slice(6));

          if (eventName === "delta") {
            acc += data.text;
            setStreamBuffer(acc);
          } else if (eventName === "done") {
            // Replace the buffer with a real message
            setMessages((m) => [
              ...m,
              {
                id: data.messageId ?? `local-${Date.now()}`,
                role: "assistant",
                content: data.fullText ?? acc,
                created_at: new Date().toISOString(),
              },
            ]);
            setStreamBuffer("");
          } else if (eventName === "error") {
            setError(data.message ?? "Akış hatası oluştu.");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir şeyler ters gitti.");
    } finally {
      setStreaming(false);
      setStreamBuffer("");
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col md:h-screen" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Top bar — Claude Design */}
      <div
        className="flex items-center justify-between border-b border-ink-800 backdrop-blur-[12px]"
        style={{
          padding: "16px 32px",
          gap: 16,
          background: "rgba(10,10,15,0.8)",
        }}
      >
        <div className="flex items-center gap-[14px]">
          <Link
            href="/chat"
            className="flex items-center justify-center border border-ink-800 bg-transparent text-ink-300 transition hover:border-ink-700 hover:text-ink-100"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              fontSize: 16,
            }}
          >
            ←
          </Link>
          {loading ? (
            <div className="h-8 w-48 animate-pulse rounded bg-ink-800" />
          ) : (
            <div>
              <p
                className="m-0 font-display text-ink-100"
                style={{ fontSize: 20 }}
              >
                {session?.target?.name ?? "Koç"}
              </p>
              <p
                className="m-0 text-[10px] font-semibold uppercase text-brand-400"
                style={{ letterSpacing: "0.25em" }}
              >
                {session?.target?.relation ?? "KOÇ"} · hafızalı sohbet
              </p>
            </div>
          )}
        </div>
        <button
          className="flex items-center justify-center border border-ink-800 bg-transparent text-ink-300 transition hover:border-ink-700 hover:text-ink-100"
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            fontSize: 16,
          }}
        >
          ⋯
        </button>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ padding: "32px 0" }}
      >
        <div
          className="mx-auto grid"
          style={{ maxWidth: 720, padding: "0 24px", gap: 16 }}
        >
          {messages.length === 0 && !streaming && (
            <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/30 p-8 text-center">
              <p className="mb-2 font-display italic text-brand-400">
                koçun dinliyor —
              </p>
              <p className="text-[14px] text-ink-300">
                Ne konuşmak istersin? Bir mesaj yazmaya takıldın mı, bir durum
                mu çözemiyorsun, ya da sadece fikir mi istiyorsun — sor.
              </p>
            </div>
          )}

          {messages.map((m) => (
            <Bubble key={m.id} role={m.role} content={m.content} />
          ))}

          {streaming && streamBuffer && (
            <Bubble role="assistant" content={streamBuffer} isStreaming />
          )}
          {streaming && !streamBuffer && (
            <div className="flex justify-start">
              <div
                className="flex gap-[6px] border border-ink-800 text-ink-400"
                style={{
                  padding: "14px 18px",
                  borderRadius: 18,
                  background: "rgba(17,17,24,0.7)",
                }}
              >
                <span
                  className="inline-block rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: "#F17A92",
                    animation: "dotPulse 1.2s 0ms infinite ease-in-out",
                  }}
                />
                <span
                  className="inline-block rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: "#F17A92",
                    animation: "dotPulse 1.2s 160ms infinite ease-in-out",
                  }}
                />
                <span
                  className="inline-block rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: "#F17A92",
                    animation: "dotPulse 1.2s 320ms infinite ease-in-out",
                  }}
                />
              </div>
            </div>
          )}

          {error && <ErrorBanner message={error} />}
        </div>
      </div>

      {/* Input bar */}
      <div
        className="border-t border-ink-800 bg-ink-950"
        style={{ padding: "16px 24px 24px" }}
      >
        <div className="mx-auto" style={{ maxWidth: 720 }}>
          <div className="flex items-end gap-[10px]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              disabled={streaming}
              placeholder="koça sor — enter ile gönder"
              className="flex-1 resize-none border border-ink-700 text-ink-100 outline-none"
              style={{
                minHeight: 52,
                maxHeight: 200,
                padding: "16px 18px",
                borderRadius: 16,
                background: "rgba(17,17,24,0.6)",
                fontSize: 15,
                lineHeight: 1.5,
              }}
            />
            <button
              onClick={send}
              disabled={streaming || !input.trim()}
              className="rounded-full bg-brand-500 font-medium text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ height: 52, padding: "0 22px", fontSize: 14 }}
            >
              {streaming ? "…" : "Gönder →"}
            </button>
          </div>
          <p
            className="text-[11px] text-ink-500"
            style={{ margin: "8px 4px 0" }}
          >
            kısa ve olgun cevaplar verir.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes dotPulse {
          0%,
          80%,
          100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function Bubble({
  role,
  content,
  isStreaming,
}: {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={isUser ? "text-white" : "border border-ink-800 text-ink-100"}
        style={{
          maxWidth: "78%",
          padding: "14px 18px",
          borderRadius: 18,
          background: isUser ? "#BE123C" : "rgba(17,17,24,0.7)",
          fontSize: 15,
          lineHeight: 1.55,
          boxShadow: isUser ? "0 10px 24px -10px rgba(225,29,72,0.4)" : "none",
          borderBottomRightRadius: isUser ? 6 : 18,
          borderBottomLeftRadius: isUser ? 18 : 6,
        }}
      >
        <p className="whitespace-pre-wrap">
          {content}
          {isStreaming && <span className="ml-1 animate-pulse">▎</span>}
        </p>
      </div>
    </div>
  );
}
