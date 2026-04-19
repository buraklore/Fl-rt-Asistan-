import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState, ButtonLink } from "@/components/app/ui";
import { NewChatButton } from "./new-chat-button";
import { DeleteChatButton } from "./delete-chat-button";

export const dynamic = "force-dynamic";

const RELATION_LABELS: Record<string, string> = {
  crush: "CRUSH",
  partner: "PARTNER",
  ex: "EX",
  match: "MATCH",
  friend: "ARKADAŞ",
};

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
    <div
      className="mx-auto"
      style={{ maxWidth: 960, padding: "48px 40px 80px" }}
    >
      <PageHeader
        kicker="hafızalı sohbet —"
        title="Koç."
        description="Her oturum bir hedefe bağlı. Koç geçmiş analizlerini ve eski mesaj kalıplarını hatırlar."
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
        <div className="grid gap-[10px]">
          {list.map((s) => {
            const target = s.target as {
              id: string;
              name: string | null;
              relation: string;
            } | null;
            return (
              <div
                key={s.id}
                className="group relative grid items-center rounded-[16px] border border-ink-800 bg-ink-900/40 transition-all duration-[160ms] hover:border-brand-500/35 hover:bg-ink-900/70"
                style={{
                  gridTemplateColumns: "180px 1fr auto",
                  gap: 20,
                  padding: "18px 22px",
                }}
              >
                <Link href={`/chat/${s.id}`} className="contents">
                  <div>
                    <p
                      className="font-display text-ink-100"
                      style={{ fontSize: 22, margin: 0 }}
                    >
                      {target?.name ?? "İsimsiz"}
                    </p>
                    <p
                      className="text-[10px] font-semibold uppercase text-brand-400"
                      style={{
                        letterSpacing: "0.25em",
                        marginTop: 2,
                      }}
                    >
                      {target?.relation
                        ? RELATION_LABELS[target.relation] ?? target.relation.toUpperCase()
                        : "KOÇ"}
                    </p>
                  </div>
                  <p
                    className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] text-ink-300"
                    style={{ lineHeight: 1.5 }}
                  >
                    {s.title ?? "başlık henüz yok"}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-ink-500">
                      {formatDate(s.created_at)}
                    </span>
                  </div>
                </Link>
                <div className="pointer-events-none absolute right-[22px] top-1/2 -translate-y-1/2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
                  <DeleteChatButton sessionId={s.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return `bugün · ${d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;
  if (days === 1) return `dün · ${d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;
  if (days < 7) return `${days} gün önce`;
  if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}
