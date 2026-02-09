"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { auth } from "../../../../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

export default function EmailAuthPage() {
  const router = useRouter();
  const params = useParams() as { lang?: string };
  const lang = params?.lang === "ru" ? "ru" : "en";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const isAuthed = !!auth.currentUser?.uid;

  function clearAlerts() {
    setMsg("");
    setErr("");
  }

  async function doSignIn() {
    clearAlerts();
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setMsg("Signed in ✅");
      router.push(`/${lang}/users`);
    } catch (e: any) {
      setErr(e?.message || "Email sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function doSignUp() {
    clearAlerts();
    setBusy(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      setMsg("Account created ✅");
      router.push(`/${lang}/onboarding`);
    } catch (e: any) {
      setErr(e?.message || "Email sign-up failed");
    } finally {
      setBusy(false);
    }
  }

  async function doLogout() {
    clearAlerts();
    setBusy(true);
    try {
      await signOut(auth);
      setMsg("Signed out.");
    } catch (e: any) {
      setErr(e?.message || "Logout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "min(520px, 92vw)", border: "1px solid #eee", borderRadius: 14, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0 }}>EQUAL — Email</h2>
          {isAuthed ? (
            <button onClick={doLogout} disabled={busy}>Logout</button>
          ) : (
            <button onClick={() => router.push(`/${lang}/auth/phone`)} disabled={busy}>
              Phone →
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={() => router.push(`/${lang}/auth/email`)} disabled={busy} style={{ flex: 1, padding: "10px 12px" }}>
            Email
          </button>
          <button onClick={() => router.push(`/${lang}/auth/phone`)} disabled={busy} style={{ flex: 1, padding: "10px 12px" }}>
            Phone
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

          <label style={{ display: "block", fontSize: 13, marginBottom: 6, marginTop: 12 }}>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
            disabled={busy}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={doSignIn} disabled={busy || !email.trim() || !password} style={{ flex: 1, padding: "10px 12px" }}>
              Sign in
            </button>
            <button onClick={doSignUp} disabled={busy || !email.trim() || password.length < 6} style={{ flex: 1, padding: "10px 12px" }}>
              Sign up
            </button>
          </div>

          <button
            onClick={() => router.push(`/${lang}/auth/reset?email=${encodeURIComponent(email.trim())}`)}
            disabled={busy}
            style={{ width: "100%", marginTop: 10, padding: "10px 12px" }}
          >
            Forgot password
          </button>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>Password must be at least 6 characters.</div>
        </div>
      </div>
    </div>
  );
}

