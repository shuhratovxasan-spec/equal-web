import Link from "next/link";
import { BACKGROUNDS, BgId, DEFAULT_BG } from "@/lib/backgrounds";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = lang === "ru" ? "ru" : "en";

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">EQUAL</h1>
      <p className="mt-3 text-gray-600">
        Platform for mutual help and trust.
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/${l}/users`}
          className="rounded bg-black px-4 py-2 text-white"
        >
          {l === "ru" ? "Пользователи" : "Users"}
        </Link>

        <Link
          href={`/${l}/requests`}
          className="rounded border px-4 py-2"
        >
          {l === "ru" ? "Запросы" : "Requests"}
        </Link>
      </div>
    </main>
  );
}
