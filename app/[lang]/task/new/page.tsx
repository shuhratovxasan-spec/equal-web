"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Protected from "@/components/Protected";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/users";
import { createTask } from "@/lib/tasks";

export default function NewTaskPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang === "ru" ? "ru" : "en") as "ru" | "en";

  const t = useMemo(() => {
    return lang === "ru"
      ? {
          title: "Новое задание",
          titleLabel: "Заголовок",
          details: "Описание",
          skills: "Навыки (через запятую)",
          city: "Город",
          publish: "Опубликовать",
        }
      : {
          title: "New task",
          titleLabel: "Title",
          details: "Details",
          skills: "Skills (comma separated)",
          city: "City",
          publish: "Publish",
        };
  }, [lang]);

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [skills, setSkills] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onPublish() {
    setMsg(null);
    const me = auth.currentUser;
    if (!me) {
      router.push(`/${lang}/auth`);
      return;
    }

    if (!title.trim() || !details.trim()) {
      setMsg(lang === "ru" ? "Заполни заголовок и описание" : "Fill title and details");
      return;
    }

    setLoading(true);
    try {
      const profile = await getUserProfile(me.uid);

      await createTask({
        ownerUid: me.uid,
        ownerName: profile?.name ?? me.email ?? null,
        title: title.trim(),
        details: details.trim(),
        city: (city || profile?.city || "").trim(),
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      });

      router.push(`/${lang}/tasks`);
    } catch (e: any) {
      setMsg(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Protected>
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="w-full max-w-xl rounded-xl border p-6 bg-white">
          <h1 className="text-2xl font-bold">{t.title}</h1>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm">{t.titleLabel}</span>
              <input className="rounded-lg border p-2" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>

            <label className="grid gap-1">
              <span className="text-sm">{t.details}</span>
              <textarea className="rounded-lg border p-2 min-h-28" value={details} onChange={(e) => setDetails(e.target.value)} />
            </label>

            <label className="grid gap-1">
              <span className="text-sm">{t.skills}</span>
              <input className="rounded-lg border p-2" value={skills} onChange={(e) => setSkills(e.target.value)} />
            </label>

            <label className="grid gap-1">
              <span className="text-sm">{t.city}</span>
              <input className="rounded-lg border p-2" value={city} onChange={(e) => setCity(e.target.value)} />
            </label>

            <button onClick={onPublish} disabled={loading} className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60">
              {t.publish}
            </button>

            {msg && <div className="rounded-lg border p-3 text-sm">{msg}</div>}
          </div>
        </div>
      </main>
    </Protected>
  );
}
