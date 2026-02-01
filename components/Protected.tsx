"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";

// IMPORTANT: use RELATIVE import (works on Vercel/Linux)
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
      // If user is NOT logged in -> redirect to /{lang}/auth
      if (!user) {
        const parts = (pathname || "").split("/").filter(Boolean);

        // Detect language prefix: /ru/... or /en/... (default en)
        const lang = parts[0] === "ru" ? "ru" : "en";

        router.replace(`/${lang}/auth`);
        return;
      }

      // User logged in
      setReady(true);
    });

    return () => unsub();
  }, [router, pathname]);

  if (!ready) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return <>{children}</>;
}
