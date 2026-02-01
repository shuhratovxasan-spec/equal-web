"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";

// ✅ Use RELATIVE import to avoid alias issues on Vercel
import { auth } from "../lib/firebase";

export default function Protected({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // detect language from url: /ru/... or /en/...
        const parts = (pathname || "").split("/").filter(Boolean);
        const lang = parts[0] === "ru" ? "ru" : "en";
        router.replace(`/${lang}/auth`);
        return;
      }

      setReady(true);
    });

    return () => unsub();
  }, [router, pathname]);

  if (!ready) return <div style={{ padding: 24 }}>Loading...</div>;
  return <>{children}</>;
}

