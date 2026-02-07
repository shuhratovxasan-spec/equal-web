"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Protected from "@/components/Protected";
import { auth } from "@/lib/firebase";
import { acceptRequest, listenOpenRequests, HelpRequest } from "@/lib/request";
import { getOrCreateChat } from "@/lib/chat";

export default function RequestsPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang === "ru" ? "ru" : "en") as "ru" | "en";

  const t = useMemo(() => {
    return lang === "ru"
      ? {
          title: "Запросы помощи",
          new: "Создать запрос",
          accept: "Принять",
          openChat: "Открыть чат",
          mine: "Это ваш запрос",
          empty: "Пока нет открытых запросов",
        }
      : {
          title: "Help requests",
          new: "Create request",
          accept: "Accept",
          openChat: "Open chat",
          mine: "This is yours",
          empty: "No open requests yet",
        };
  }, [lang]);

  const [items, setItems] = useState<HelpRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const me = auth.currentUser;

  useEffect(() => {
    const unsub = listenOpenRequests(setItems, 100);
    return () => unsub();
  }, []);

  async function onAccept(r: HelpRequest) {
    if (!me) {
      router.push(`/${lang}/auth`);
      return;
    }
    if (!r.id) return;
    if (r.ownerUid === me.uid) return;

    setBusyId(r.id);
    try {
      await acceptRequest({ requestId: r.id, helperUid: me.uid });

      // create chat and go
      await getOrCreateChat(me.uid, r.ownerUid);
      router.push(`/${lang}/chat/${r.ownerUid}`);
    } catch (e: any) {
      alert(e?.message ?? "Error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Protected>
      <main className="min-h-screen p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t.title}</h1>

          <Link
            href={`/${lang}/requests/new`}
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            {t.new}
          </Link>
        </div>

        <div className="mt-6 grid gap-4">
          {items.length === 0 && (
            <div className="rounded-xl border bg-white p-4 text-sm">
              {t.empty}
            </div>
          )}

          {items.map((r) => (
            <div key={r.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{r.title}</div>
                  <div className="text-sm text-gray-600">
                    {r.city || r.ownerCity || "—"} • {r.ownerName || r.ownerUid.slice(0, 6) + "…"}
                  </div>
                </div>

                <div className="flex gap-2">
                  {me && r.ownerUid === me.uid ? (
                    <div className="text-xs text-gray-500">{t.mine}</div>
                  ) : (
                    <button
                      className="rounded-lg border px-3 py-2 text-sm disabled:opacity-60"
                      disabled={busyId === r.id}
                      onClick={() => onAccept(r)}
                    >
                      {t.accept}
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">{r.details}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {(r.skills || []).slice(0, 12).map((s) => (
                  <span key={s} className="rounded-full border px-2 py-1 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </Protected>
  );
}
