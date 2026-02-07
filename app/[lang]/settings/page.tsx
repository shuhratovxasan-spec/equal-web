"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { BACKGROUNDS } from "@/lib/backgrounds";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams() as { lang?: string };
  const lang = params?.lang === "ru" ? "ru" : "en";

  const uid = auth.currentUser?.uid;

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [coverId, setCoverId] = useState<(typeof BACKGROUNDS)[number]["id"]>("bg1");

  useEffect(() => {
    (async () => {
      if (!uid) return;
      const snap = await getDoc(doc(db, "users", uid));
      const data = snap.data() as any;
      if (data?.coverId) setCoverId(data.coverId);
    })();
  }, [uid]);

  const bg = useMemo(() => BACKGROUNDS.find((b) => b.id === coverId)?.src || "/backgrounds/bg1.png", [coverId]);

  async function save() {
    setErr("");
    if (!uid) {
      setErr("Not signed in.");
      return;
    }
    setBusy(true);
    try {
      await setDoc(
        doc(db, "users", uid),
        { coverId, updatedAt: serverTimestamp() },
        { merge: true }
      );
      router.push(`/${lang}/users`);
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "min(760px, 94vw)", background: "rgba(0,0,0,0.55)", color: "#fff", borderRadius: 16, padding: 18 }}>
        <h2 style={{ margin: 0 }}>Settings</h2>
        <div style={{ opacity: 0.8, marginTop: 6 }}>Change your cover.</div>

        {err ? <div style={{ marginTop: 12, padding: 10, background: "#3b0d0d", borderRadius: 10 }}>{err}</div> : null}

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              onClick={() => setCoverId(b.id)}
              disabled={busy}
              style={{
                height: 70,
                borderRadius: 12,
                border: coverId === b.id ? "2px solid #fff" : "1px solid rgba(255,255,255,0.25)",
                backgroundImage: `url(${b.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ))}
        </div>

        <button onClick={save} disabled={busy} style={{ marginTop: 14, width: "100%", padding: "12px 14px", borderRadius: 12 }}>
          Save
        </button>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
          Privacy Policy / Terms — можно добавить отдельными страницами позже.
        </div>
      </div>
    </div>
  );
}
