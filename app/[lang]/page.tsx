"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BACKGROUNDS } from "@/lib/backgrounds";

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams() as { lang?: string };
  const lang = params?.lang === "ru" ? "ru" : "en";

  const uid = auth.currentUser?.uid;

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [coverId, setCoverId] = useState<(typeof BACKGROUNDS)[number]["id"]>("bg1");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(auth.currentUser?.phoneNumber || "");
  const [email, setEmail] = useState(auth.currentUser?.email || "");
  const [address, setAddress] = useState("");
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");

  const bg = useMemo(() => BACKGROUNDS.find((b) => b.id === coverId)?.src || "/backgrounds/bg1.png", [coverId]);

  async function save() {
    setErr("");
    if (!uid) {
      setErr("Not signed in.");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setErr("First name and last name are required.");
      return;
    }

    setBusy(true);
    try {
      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          languages: languages
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          coverId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      router.push(`/${lang}/users`);
    } catch (e: any) {
      setErr(e?.message || "Failed to save profile");
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
        <h2 style={{ margin: 0 }}>Finish profile</h2>
        <div style={{ opacity: 0.8, marginTop: 6 }}>Choose cover + fill your details.</div>

        {err ? (
          <div style={{ marginTop: 12, padding: 10, background: "#3b0d0d", borderRadius: 10 }}>{err}</div>
        ) : null}

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>Choose cover</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
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
                  cursor: "pointer",
                }}
                aria-label={b.id}
              />
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <Field label="First name" value={firstName} onChange={setFirstName} disabled={busy} />
          <Field label="Last name" value={lastName} onChange={setLastName} disabled={busy} />
          <Field label="Email" value={email} onChange={setEmail} disabled={busy} />
          <Field label="Phone" value={phone} onChange={setPhone} disabled={busy} />
          <Field label="Home address (optional)" value={address} onChange={setAddress} disabled={busy} full />
          <Field label="Skills (comma separated)" value={skills} onChange={setSkills} disabled={busy} full />
          <Field label="Languages (comma separated)" value={languages} onChange={setLanguages} disabled={busy} full />
        </div>

        <button onClick={save} disabled={busy} style={{ marginTop: 14, width: "100%", padding: "12px 14px", borderRadius: 12 }}>
          Continue
        </button>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  full?: boolean;
}) {
  return (
    <div style={{ gridColumn: props.full ? "1 / -1" : "auto" }}>
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>{props.label}</div>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        disabled={props.disabled}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.25)" }}
      />
    </div>
  );
}
