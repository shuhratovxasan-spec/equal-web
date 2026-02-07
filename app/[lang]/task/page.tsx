"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Protected from "@/components/Protected";
import { auth } from "@/lib/firebase";
import { listenOpenTasks, Task, acceptTask } from "@/lib/tasks";
import { getOrCreateChat } from "@/lib/chat";

export default function TasksPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang === "ru" ? "ru" : "en") as "ru" | "en";

  const t = useMemo(() => {
    return lang === "ru"
      ? { title: "Задания", new: "Создать", accept: "Принять", empty: "Пока нет открытых заданий" }
      : { title: "Tasks", new: "Create", accept: "Accept", empty: "No open tasks yet" };
  }, [lang]);

  const [items, setItems] = useState<Task[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const unsub = listenOpenTasks(setItems, 100);
    return () => unsub();
  }, []);

  async function onAccept(task: Task) {
    const me = auth.currentUser;
    if (!me) {
      router.push(`/${lang}/auth`);
      return;
    }
    if (!task.id) return;

    setBusy(task.id);
    try {
      await acceptTask(task.id, me.uid);
      await getOrCreateChat(me.uid, task.ownerUid);
      router.push(`/${lang}/chat/${task.ownerUid}`);
    } catch (e: any) {
      alert(e?.message ?? "Error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Protected>
      <main className="min-h-screen p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <Link href={`/${lang}/tasks/new`} className="rounded-lg bg-black px-4 py-2 text-white">
            {t.new}
          </Link>
        </div>

        <div className="mt-6 grid gap-4">
          {items.length === 0 && (
            <div className="rounded-xl border bg-white p-4 text-sm">{t.empty}</div>
          )}

          {items.map((task) => (
            <div key={task.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{task.title}</div>
                  <div className="text-sm text-gray-600">
                    {task.city || "—"} • {task.ownerName || task.ownerUid.slice(0, 6) + "…"}
                  </div>
                </div>

                <button
                  disabled={busy === task.id}
                  onClick={() => onAccept(task)}
                  className="rounded-lg border px-3 py-2 text-sm disabled:opacity-60"
                >
                  {t.accept}
                </button>
              </div>

              <p className="mt-3 text-sm whitespace-pre-wrap">{task.details}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {(task.skills || []).slice(0, 12).map((s) => (
                  <span key={s} className="rounded-full border px-2 py-1 text-xs">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </Protected>
  );
}
