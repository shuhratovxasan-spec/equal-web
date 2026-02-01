"use client";

import { useAuth } from "@/lib/useAuth";
import { getUserProfile } from "@/lib/users";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang === "ru" ? "ru" : "en") as "ru" | "en";

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`/${lang}/auth`);
      return;
    }

    (async () => {
      const profile = await getUserProfile(user.uid);

      if (!profile || !profile.name) {
        router.replace(`/${lang}/onboarding`);
      } else {
        router.replace(`/${lang}/users`);
      }
    })();
  }, [user, loading, router, lang]);

  return <div className="p-8">Loading...</div>;
}
