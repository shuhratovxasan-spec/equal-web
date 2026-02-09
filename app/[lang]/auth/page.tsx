"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { auth } from "../../../lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

import BackgroundShell from "../../../components/BackgroundShell";
import BackgroundPicker from "../../../components/BackgroundPicker";
import { BACKGROUNDS, BgId, DEFAULT_BG } from "../../../lib/backgrounds";
import { getLocalBg, setLocalBg, setUserBg } from "../../../lib/userTheme";

type Mode = "email" | "phone";

export default function AuthPage() {
  const router = useRouter();
  const params = useParams() as { lang?: string };
  const lang = params?.lang === "ru" ? "ru" : "en";

  const [mode, setMode] = useState<Mode>("email");

  // Email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState<ConfirmationResult | null>(null);

  // UI
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [err, setErr] = useState<string>("");

  // Theme
  const [bgId, setBgId] = useState<BgId>(DEFAULT_BG);

  // reCAPTCHA
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerId = "recaptcha-container";

  const isAuthed = !!auth.currentUser?.uid;
  const bgSrc = BACKGROUNDS.find((b) => b.id === bgId)?.src ?? BACKGROUNDS[0].src;

  function clearAlerts() {
    setMsg("");
    setErr("");
  }

  // init bg from localStorage
  useEffect(() => {
    setBgId(getLocalBg());
  }, []);

  async function applyBg(nextBg: BgId) {
    setBgId(nextBg);
    setLocalBg(nextBg);

    const uid = auth.currentUser?.uid;
    if (uid) {
      try {
        await setUserBg(uid, nextBg);
      } catch {}
    }
  }

  // --- reCAPTCHA lifecycle ---
  useEffect(() => {
    if (mode !== "phone") return;
    if (recaptchaRef.current) return;

    try {
      clearAlerts();

      recaptchaRef.current = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => setErr("reCAPTCHA expired. Try again."),
      });

      recaptchaRef.current.render().catch(() => {});
    } catch (e: any) {
      setErr(e?.message || "Failed to init reCAPTCHA");
    }

    return () => {
      try {
        recaptchaRef.current?.clear();
      } catch {}
      recaptchaRef.current = null;

      const el = document.getElementById(recaptchaContainerId);
      if (el) el.innerHTML = "";
    };
  }, [mode]);

  async function doEmailSignIn() {
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

  async function doEmailSignUp() {
    clearAlerts();
    setBusy(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);

      const uid = auth.currentUser?.uid;
      if (uid) {
        try {
          await setUserBg(uid, bgId);
        } catch {}
      }

      setMsg("Account created ✅");
      router.push(`/${lang}/onboarding`);
    } catch (e: any) {
      setErr(e?.message || "Email sign-up failed");
    } finally {
      setBusy(false);
    }
  }

  async function doResetPassword() {
    clearAlerts();
    setBusy(true);
    try {
      const em = email.trim();
      if (!em) {
        setErr("Enter your email first.");
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

  async function doSendSms() {
    clearAlerts();
    setBusy(true);
    try {
      const p = phone.trim();
      if (!p.startsWith("+")) {
        setErr("Phone must be in E.164 format, e.g. +1437...");
        return;
      }
      if (!recaptchaRef.current) {
        setErr("reCAPTCHA not ready. Switch tabs and try again.");
        return;
      }

      const confirmation = await signInWithPhoneNumber(auth, p, recaptchaRef.current);
      setConfirm(confirmation);
      setMsg("Code sent ✅");
    } catch (e: any) {
      setErr(e?.message || "Failed to send SMS");

      try {
        recaptchaRef.current?.clear();
      } catch {}
      recaptchaRef.current = null;
      const el = document.getElementById(recaptchaContainerId);
      if (el) el.innerHTML = "";
    } finally {
      setBusy(false);
    }
  }

  async function doVerifyCode() {
    clearAlerts();
    setBusy(true);
    try {
      if (!confirm) {
        setErr("Send code first.");
        return;
      }
      const c = code.trim();
      if (c.length < 4) {
        setErr("Enter the SMS code.");
        return;
      }
      await confirm.confirm(c);

      const uid = auth.currentUser?.uid;
      if (uid) {
        try {
          await setUserBg(uid, bgId);
        } catch {}
      }

      setMsg("Signed in ✅");
      router.push(`/${lang}/users`);
    } catch (e: any) {
      setErr(e?.message || "Invalid code");
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
    <BackgroundShell bgSrc={bgSrc}>
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div
          style={{
            width: "min(560px, 92vw)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 16,
            padding: 22,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(10px)",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <h2 style={{ margin: 0, fontWeight: 700 }}>EQUAL — Sign in</h2>
            {isAuthed ? (
              <button onClick={doLogout} disabled={busy} style={{ padding: "8px 10px", borderRadius: 10 }}>
                Logout
              </button>
            ) : null}
          </div>

          <BackgroundPicker value={bgId} onChange={applyBg} />

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              onClick={() => {
                clearAlerts();
                setMode("email");
                setConfirm(null);
                setCode("");
              }}
              style={{
                flex: 1,
                padding: "10px 12px",
                background: mode === "email" ? "#fff" : "transparent",
                color: mode === "email" ? "#111" : "#fff",
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: 10,
              }}
              disabled={busy}
            >
              Email
            </button>

            <button
              onClick={() => {
                clearAlerts();
                setMode("phone");
                setConfirm(null);
                setCode("");
              }}
              style={{
                flex: 1,
                padding: "10px 12px",
                background: mode === "phone" ? "#fff" : "transparent",
                color: mode === "phone" ? "#111" : "#fff",
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: 10,
              }}
              disabled={busy}
            >
              Phone
            </button>
          </div>

          {msg ? (
            <div
              style={{
                marginTop: 12,
                padding: 10,
                background: "rgba(60,255,140,0.14)",
                border: "1px solid rgba(60,255,140,0.25)",
                borderRadius: 10,
              }}
            >
              {msg}
            </div>
          ) : null}

          {err ? (
            <div
              style={{
                marginTop: 12,
                padding: 10,
                background: "rgba(255,80,80,0.16)",
                border: "1px solid rgba(255,80,80,0.25)",
                borderRadius: 10,
              }}
            >
              {err}
            </div>
          ) : null}

          {mode === "email" ? (
            <div style={{ marginTop: 16 }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(0,0,0,0.25)",
                  color: "#fff",
                }}
                disabled={busy}
              />

              <label style={{ display: "block", fontSize: 13, marginBottom: 6, marginTop: 12 }}>Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(0,0,0,0.25)",
                  color: "#fff",
                }}
                disabled={busy}
              />

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button onClick={doEmailSignIn} disabled={busy || !email.trim() || !password} style={{ flex: 1, padding: "10px 12px", borderRadius: 10 }}>
                  Sign in
                </button>
                <button onClick={doEmailSignUp} disabled={busy || !email.trim() || password.length < 6} style={{ flex: 1, padding: "10px 12px", borderRadius: 10 }}>
                  Sign up
                </button>
              </div>

              <button onClick={doResetPassword} disabled={busy || !email.trim()} style={{ width: "100%", marginTop: 10, padding: "10px 12px", borderRadius: 10 }}>
                Forgot password
              </button>

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>Password must be at least 6 characters.</div>
            </div>
          ) : (
            <div style={{ marginTop: 16 }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Phone (E.164)</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1437..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(0,0,0,0.25)",
                  color: "#fff",
                }}
                disabled={busy}
              />

              <div id={recaptchaContainerId} />

              {!confirm ? (
                <button onClick={doSendSms} disabled={busy || phone.trim().length < 8} style={{ width: "100%", marginTop: 12, padding: "10px 12px", borderRadius: 10 }}>
                  Send code
                </button>
              ) : (
                <>
                  <label style={{ display: "block", fontSize: 13, marginBottom: 6, marginTop: 12 }}>SMS Code</label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.25)",
                      background: "rgba(0,0,0,0.25)",
                      color: "#fff",
                    }}
                    disabled={busy}
                  />
                  <button onClick={doVerifyCode} disabled={busy || code.trim().length < 4} style={{ width: "100%", marginTop: 12, padding: "10px 12px", borderRadius: 10 }}>
                    Verify & sign in
                  </button>

                  <button
                    onClick={() => {
                      clearAlerts();
                      setConfirm(null);
                      setCode("");
                      try {
                        recaptchaRef.current?.clear();
                      } catch {}
                      recaptchaRef.current = null;
                      const el = document.getElementById(recaptchaContainerId);
                      if (el) el.innerHTML = "";
                    }}
                    disabled={busy}
                    style={{ width: "100%", marginTop: 10, padding: "10px 12px", borderRadius: 10 }}
                  >
                    Resend (reset)
                  </button>
                </>
              )}

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>
                Tip: phone must start with <b>+</b> and country code. Example: +1437…
              </div>
            </div>
          )}
        </div>
      </div>
    </BackgroundShell>
  );
}
