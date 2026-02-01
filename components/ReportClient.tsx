"use client";

import React, { useState } from "react";
import Protected from "@/components/Protected";
import { createFlag } from "@/lib/flag";
import { useRouter } from "next/navigation";

export default function ReportClient({ lang, reportedUid }: { lang: string; reportedUid: string }) {
  const router = useRouter();
  const safeLang = lang === "ru" ? "ru" : "en";

  const [reason, setReason] = useState("Harassment");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit() {
    setErr("");
    try {
      setBusy(true);
      await createFlag({ toUid: reportedUid, reason, comment });
      router.push(`/${safeLang}/chat/${reportedUid}`);
    } catch (e: any) {
      setErr(e?.message || "Failed to submit report");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Protected>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Report</h2>
        <div style={{ opacity: 0.7, marginBottom: 12 }}>UID: {reportedUid}</div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Reason</div>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={busy}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            <option>Harassment</option>
            <option>Scam</option>
            <option>Spam</option>
            <option>Hate</option>
            <option>Other</option>
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Comment (optional)</div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={busy}
            style={{ width: "100%", minHeight: 120, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </div>

        <button onClick={onSubmit} disabled={busy} style={{ marginTop: 14, width: "100%", padding: 12, borderRadius: 12 }}>
          Submit
        </button>

        {err ? (
          <div style={{ marginTop: 12, padding: 10, background: "#fff4f4", border: "1px solid #f0caca", borderRadius: 10 }}>
            {err}
          </div>
        ) : null}
      </div>
    </Protected>
  );
}
