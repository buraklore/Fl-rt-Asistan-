import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  PageHeader,
  EmptyState,
  ButtonLink,
  SectionCard,
} from "@/components/app/ui";
import { NewChatButton } from "./new-chat-button";

export const dynamic = "force-dynamic";

export default async function ChatListPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: sessions }, { data: targets }] = await Promise.all([
    supabase
      .from("chat_sessions")
      .select("*, target:target_profiles(id, name, relation)")
      .order("created_at", { ascending: false }),
    supabase
      .from("target_profiles")
      .select("id, name, relation")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
  ]);

  const list = sessions ?? [];
  const targetList = targets ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:px-10">
      <PageHeader
        kicker="hafızalı sohbet —"
        title="AI Koç"
        description="Her hedef için kalıcı bir oturum. Koç, önceki konuşmalarınızı hatırlar ve kişiye göre öneri verir."
        action={
          targetList.length > 0 ? (
            <NewChatButton targets={targetList} />
          ) : (
            <ButtonLink href="/targets/new">Önce hedef oluştur</ButtonLink>
          )
        }
      />

      {list.length === 0 ? (
        <EmptyState
          title="Henüz sohbet yok"
          description={
            targetList.length === 0
              ? "Önce bir hedef oluştur, sonra koçla konuşmaya başla."
              : "Üstteki butonu kullanarak bir hedefi seç ve sohbete başla."
          }
          action={
            targetList.length === 0 ? (
              <ButtonLink href="/targets/new">Hedef oluştur</ButtonLink>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {list.map((s) => {
            const target = s.target as {
              id: string;
              name: string | null;
              relation: string;
            } | null;
            return (
              <Link
                key={s.id}
                href={`/chat/${s.id}`}
                className="group block rounded-2xl border border-ink-800 bg-ink-900/40 p-5 transition hover:border-brand-500/40"
              >
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="font-display text-lg text-ink-100">
                    {target?.name ?? "İsimsiz"}
                  </span>
                  <span className="text-xs text-ink-500">
                    {formatDate(s.created_at)}
                  </span>
                </div>
                {s.title ? (
                  <p className="line-clamp-1 text-sm text-ink-300">
                    {s.title}
                  </p>
                ) : (
                  <p className="text-sm italic text-ink-500">
                    başlık henüz yok
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}
