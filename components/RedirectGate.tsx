"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { getUserProfile } from "@/lib/users";

export default function RedirectGate() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // not logged in
    if (!user) {
      router.replace("/login");
      return;
    }

    // optional: if route has uid param, check it exists
    const uid = (params?.uid as string | undefined) ?? user.uid;

    (async () => {
      const profile = await getUserProfile(uid);
      if (!profile) {
        router.replace("/onboarding");
      }
    })();
  }, [loading, user, params, router]);

  return null;
}
