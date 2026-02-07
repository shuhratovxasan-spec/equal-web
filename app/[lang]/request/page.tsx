"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Protected from "@/components/Protected";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/users";
import { createRequest } from "@/lib/request";

export default function NewRequestPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang === "ru" ? "ru" : "en") as "ru" | "en";

  const t = useMemo(() => {
    return lang === "ru"
      ? {
          title: "Новый запрос",
          titleLabel: "Заголовок",
          detailsLabel: "Описание",
          skillsLabel: "Навыки (через запятую)",
          cityLabel: "Город",
          publish: "Опубликовать",
          needLogin: "Нужно войти заново",
        }
      : {
          title: "New request",
          titleLabel: "Title",
          detailsLabel: "Details",
          skillsLabel: "Skills (comma separated)",
          cityLabel: "City",
          publish: "Publish",
          needLogin: "Please sign in again",
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
      setMsg(t.needLogin);
      router.push(`/${lang}/auth`);
      return;
    }

    const safeTitle = title.trim();
    const safeDetails = details.trim();

    if (!safeTitle || !safeDetails) {
      setMsg(lang === "ru" ? "Заполни заголовок и описание" : "Please fill title and details");
      return;
    }

    setLoading(true);
    try {
      const profile = await getUserProfile(me.uid);

      const id = await createRequest({
        ownerUid: me.uid,
        ownerName: profile?.name ?? me.email ?? null,
        ownerCity: profile?.city ?? null,
        title: safeTitle,
        details: safeDetails,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        city: (city || profile?.city || "").trim(),
      });

      router.push(`/${lang}/requests`);
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
              <span className="text-sm">{t.detailsLabel}</span>
              <textarea
                className="rounded-lg border p-2 min-h-28"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm">{t.skillsLabel}</span>
              <input className="rounded-lg border p-2" value={skills} onChange={(e) => setSkills(e.target.value)} />
            </label>

            <label className="grid gap-1">
              <span className="text-sm">{t.cityLabel}</span>
              <input className="rounded-lg border p-2" value={city} onChange={(e) => setCity(e.target.value)} />
            </label>

            <button
              onClick={onPublish}
              disabled={loading}
              className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
            >
              {t.publish}
            </button>

            {msg && <div className="rounded-lg border p-3 text-sm">{msg}</div>}
          </div>
        </div>
      </main>
    </Protected>
  );
}
