"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
} from "firebase/auth";

export default function PhoneAuthPage() {
  const router = useRouter();
  const params = useParams() as { lang?: string };
  const lang = params?.lang === "ru" ? "ru" : "en";

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState<ConfirmationResult | null>(null);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerId = "recaptcha-container";

  const isAuthed = !!auth.currentUser?.uid;

  function clearAlerts() {
    setMsg("");
    setErr("");
  }

  // init reCAPTCHA once; cleanup on unmount -> no DUPE
  useEffect(() => {
    if (recaptchaRef.current) return;

    try {
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
  }, []);

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
        setErr("reCAPTCHA not ready. Refresh page.");
        return;
      }

      const confirmation = await signInWithPhoneNumber(auth, p, recaptchaRef.current);
      setConfirm(confirmation);
      setMsg("Code sent ✅");
    } catch (e: any) {
      setErr(e?.message || "Failed to send SMS");

      // reset verifier on failure (prevents stuck state)
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

  async function doVerify() {
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
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "min(520px, 92vw)", border: "1px solid #eee", borderRadius: 14, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0 }}>EQUAL — Phone</h2>
          {isAuthed ? (
            <button onClick={doLogout} disabled={busy}>Logout</button>
          ) : (
            <button onClick={() => router.push(`/${lang}/auth/email`)} disabled={busy}>
              ← Email
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
          <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Phone (E.164)</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1437..."
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
            disabled={busy}
          />

          <div id={recaptchaContainerId} />

          {!confirm ? (
            <button onClick={doSendSms} disabled={busy || phone.trim().length < 8} style={{ width: "100%", marginTop: 12, padding: "10px 12px" }}>
              Send code
            </button>
          ) : (
            <>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6, marginTop: 12 }}>SMS Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
                disabled={busy}
              />
              <button onClick={doVerify} disabled={busy || code.trim().length < 4} style={{ width: "100%", marginTop: 12, padding: "10px 12px" }}>
                Verify & sign in
              </button>

              <button
                onClick={() => {
                  clearAlerts();
                  setConfirm(null);
                  setCode("");
                  // quick “resend” flow: just reset local state
                }}
                disabled={busy}
                style={{ width: "100%", marginTop: 10, padding: "10px 12px" }}
              >
                Send again (enter phone again if needed)
              </button>
            </>
          )}

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Tip: phone must start with <b>+</b> and country code. Example: +1437…
          </div>
        </div>
      </div>
    </div>
  );
}
