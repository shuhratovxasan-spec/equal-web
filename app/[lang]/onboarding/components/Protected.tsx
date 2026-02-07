"use client";

import { useAuth } from "@/lib/useAuth";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function Protected({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/${lang}/auth`);
    }
  }, [user, loading, router, lang]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return null;

  return <>{children}</>;
}
