"use client";

import Link from "next/link";
import BadgePill, { Badge } from "@/components/BadgePill";
import { badgeFromTrust } from "@/lib/trust";

type Props = {
  lang: "en" | "ru";
  user: {
    uid: string;
    name?: string;
    city?: string;
    languages?: string[];
    skills?: string[];
    bio?: string;

    ratingAvg?: number;
    ratingCount?: number;
    trustScore?: number;
    badge?: Badge;
    isBanned?: boolean;
  };
};

export default function UserCard({ user, lang }: Props) {
  const b = (user.badge ??
    badgeFromTrust({
      isBanned: user.isBanned,
      trustScore: user.trustScore,
      ratingCount: user.ratingCount,
    })) as Badge;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">
            {user.name || (lang === "ru" ? "Без имени" : "Unknown")}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span>{user.city || "—"}</span>
            <BadgePill badge={b} />
            {typeof user.trustScore === "number" && (
              <span className="text-xs text-gray-500">
                Trust: {user.trustScore}/100
              </span>
            )}
          </div>

          {typeof user.ratingAvg === "number" && (
            <div className="mt-1 text-sm text-gray-600">
              ⭐ {user.ratingAvg.toFixed(2)} ({user.ratingCount || 0})
            </div>
          )}
        </div>

        <div className="text-xs text-gray-400">{user.uid.slice(0, 6)}…</div>
      </div>

      {user.bio && <p className="mt-3 text-sm text-gray-800">{user.bio}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {(user.skills || []).slice(0, 6).map((s) => (
          <span key={s} className="rounded-full border px-2 py-1 text-xs">
            {s}
          </span>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {(user.languages || []).slice(0, 6).map((l) => (
          <span key={l} className="rounded-full bg-gray-100 px-2 py-1 text-xs">
            {l}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/${lang}/chat/${user.uid}`}
          className="rounded-lg bg-black px-4 py-2 text-white text-sm"
        >
          {lang === "ru" ? "Написать" : "Message"}
        </Link>
      </div>
    </div>
  );
}
