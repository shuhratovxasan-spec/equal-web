"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams() as { lang?: string };
  const search = useSearchParams();

  const lang = params?.lang === "ru" ? "ru" : "en";

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const fromQuery = search.get("email") || "";
    if (fromQuery) setEmail(fromQuery);
  }, [search]);

  function clearAlerts() {
    setMsg("");
    setErr("");
  }

  async function doReset() {
    clearAlerts();
    setBusy(true);
    try {
      const em = email.trim();
      if (!em) {
        setErr("Enter your email.");
        return;
      }
      await sendPasswordResetEmail(auth, em);
      setMsg("Password reset email sent ✅ Check inbox/spam.");
    } catch (e: any) {
      setErr(e?.message || "Reset password failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "min(520px, 92vw)", border: "1px solid #eee", borderRadius: 14, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Reset password</h2>
          <button onClick={() => router.push(`/${lang}/auth/email`)} disabled={busy}>
            Back
          </button>
        </div>

        {msg ? (
          <div style={{ marginTop: 12, padding: 10, background: "#f4fff4", border: "1px solid #cce8cc", borderRadius: 10 }}>
            {msg}
          </div>
        ) : null}

        {err ? (
          <div style={{ marginTop: 12, padding: 10, background: "#fff4f4", border: "1px solid #f0caca", borderRadius: 10 }}>
            {err}
          </div>
        ) : null}

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
            disabled={busy}
          />

          <button onClick={doReset} disabled={busy || !email.trim()} style={{ width: "100%", marginTop: 12, padding: "10px 12px" }}>
            Send reset email
          </button>
        </div>
      </div>
    </div>
  );
}
