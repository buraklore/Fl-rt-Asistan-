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
            setError(data.message ?? "Stream hatası");
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
    <div className="flex h-[calc(100vh-4rem)] flex-col md:h-screen">
      <div className="border-b border-ink-800 px-6 py-5 md:px-10">
        <Link
          href="/chat"
          className="mb-3 inline-block text-sm text-ink-400 hover:text-ink-200"
        >
          ← Sohbetler
        </Link>
        {loading ? (
          <div className="h-8 w-48 animate-pulse rounded bg-ink-800" />
        ) : (
          <>
            <p className="font-display italic text-brand-400">
              {session?.target?.name
                ? `${session.target.name} için koç seansı`
                : "koç seansı"}{" "}
              —
            </p>
            <h1 className="font-display text-2xl text-ink-100">
              {session?.title ?? "Yeni sohbet"}
            </h1>
          </>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 md:px-10"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && !streaming && (
            <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/30 p-8 text-center">
              <p className="mb-2 font-display italic text-brand-400">
                koçun dinliyor —
              </p>
              <p className="text-sm text-ink-300">
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
            <div className="flex items-center gap-2 text-ink-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
              <span className="text-sm">koç düşünüyor...</span>
            </div>
          )}

          {error && <ErrorBanner message={error} />}
        </div>
      </div>

      <div className="border-t border-ink-800 bg-ink-950 px-6 py-4 md:px-10">
        <div className="mx-auto flex max-w-3xl gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="mesajını yaz... (Enter = gönder, Shift+Enter = satır)"
            rows={2}
            disabled={streaming}
          />
          <Button
            onClick={send}
            disabled={streaming || !input.trim()}
            className="shrink-0"
          >
            Gönder
          </Button>
        </div>
      </div>
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
        className={`max-w-[80%] rounded-2xl px-5 py-3 ${
          isUser
            ? "bg-brand-500/10 text-ink-100"
            : "bg-ink-900/60 text-ink-100"
        }`}
      >
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
          {content}
          {isStreaming && <span className="ml-1 animate-pulse">▎</span>}
        </p>
      </div>
    </div>
  );
}
