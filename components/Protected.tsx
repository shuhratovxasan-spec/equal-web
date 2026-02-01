"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter, usePathname } from "next/navigation";

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        // send to auth, keep language
        const parts = (pathname || "").split("/").filter(Boolean);
        const lang = parts[0] === "ru" ? "ru" : "en";
        router.replace(`/${lang}/auth`);
      }
      setReady(true);
    });
    return () => unsub();
  }, [router, pathname]);

  if (!ready) return <div style={{ padding: 24 }}>Loading…</div>;
  return <>{children}</>;
}

