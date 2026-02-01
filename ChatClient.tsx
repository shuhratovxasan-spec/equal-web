"use client";

import React, { useEffect, useRef, useState } from "react";
import Protected from "@/components/Protected";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getOrCreateChat, listenMessages, sendMessage } from "@/lib/chat";
import { uploadChatFile } from "@/lib/upload";
import { hasRated, submitRating } from "@/lib/rating";
import { useRouter } from "next/navigation";

type Msg =
  | { id: string; from: string; to: string; type: "text"; text: string; createdAt?: any }
  | {
      id: string;
      from: string;
      to: string;
      type: "file";
      text: string;
      fileUrl: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      createdAt?: any;
    };

export default function ChatClient({ lang, otherUid }: { lang: string; otherUid: string }) {
  const router = useRouter();
  const safeLang = lang === "ru" ? "ru" : "en";

  const [me, setMe] = useState("");
  const [chatId, setChatId] = useState("");
  const [items, setItems] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [rated, setRated] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setMe(u?.uid ?? ""));
  }, []);

  useEffect(() => {
    if (!me || !otherUid) return;
    let unsub: undefined | (() => void);

    (async () => {
      try {
        setErr("");
        const res = await getOrCreateChat(me, otherUid);
        setChatId(res.chatId);

        unsub = listenMessages(
          res.chatId,
          (rows) => setItems(rows as any),
          (e) => setErr(e?.message || "Failed to load messages")
        );

        try {
          setRated(await hasRated(me, otherUid, res.chatId));
        } catch {}
      } catch (e: any) {
        setErr(e?.message || "Chat init failed");
      }
    })();

    return () => unsub?.();
  }, [me, otherUid]);

  async function onSend() {
    setErr("");
    try {
      if (!chatId) return;
      const t = text.trim();
      if (!t) return;

      setBusy(true);
      await sendMessage(chatId, { from: me, to: otherUid, type: "text", text: t });
      setText("");
    } catch (e: any) {
      setErr(e?.message || "Send failed");
    } finally {
      setBusy(false);
    }
  }

  function onPickFile() {
    fileRef.current?.click();
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    setErr("");
    try {
      if (!chatId) return;
      const f = e.target.files?.[0];
      if (!f) return;

      setBusy(true);
      const up = await uploadChatFile({ chatId, file: f });

      await sendMessage(chatId, {
        from: me,
        to: otherUid,
        type: "file",
        text: "",
        fileUrl: up.url,
        fileName: up.name,
        fileType: up.contentType,
        fileSize: up.size,
      });

      e.target.value = "";
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmitRating() {
    setErr("");
    try {
      if (!chatId) return;
      setBusy(true);
      await submitRating({ fromUid: me, toUid: otherUid, chatId, stars, comment });
      setRated(true);
    } catch (e: any) {
      setErr(e?.message || "Rating failed");
    } finally {
      setBusy(false);
    }
  }

  function onReport() {
    router.push(`/${safeLang}/report/${otherUid}`);
  }

  function onComplete() {
    alert("Complete ✅");
  }

  return (
    <Protected>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Chat</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onReport} disabled={!me || busy}>Report</button>
            <button onClick={onComplete} disabled={busy}>Complete</button>
          </div>
        </div>

        {err ? (
          <div style={{ marginTop: 12, padding: 10, background: "#fff4f4", border: "1px solid #f0caca", borderRadius: 10 }}>
            {err}
          </div>
        ) : null}

        <div style={{ marginTop: 16, border: "1px solid #eee", borderRadius: 14, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Rate this user</div>

          {rated ? (
            <div style={{ opacity: 0.75 }}>You already rated ✅</div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setStars(n)}
                    disabled={busy}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      border: "1px solid #ddd",
                      background: stars === n ? "#111" : "#fff",
                      color: stars === n ? "#fff" : "#111",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comment (optional)"
                style={{ width: "100%", marginTop: 10, minHeight: 70, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                disabled={busy}
              />

              <button onClick={onSubmitRating} disabled={busy || !me || !chatId} style={{ marginTop: 10 }}>
                Submit rating
              </button>
            </>
          )}
        </div>

        <div style={{ marginTop: 16, border: "1px solid #eee", borderRadius: 14, padding: 16, minHeight: 340 }}>
          {items.length === 0 ? (
            <div style={{ opacity: 0.6 }}>No messages yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.from === me ? "flex-end" : "flex-start",
                    maxWidth: "70%",
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 10,
                    background: m.from === me ? "#111" : "#fff",
                    color: m.from === me ? "#fff" : "#111",
                  }}
                >
                  {m.type === "text" ? (
                    <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{m.fileName}</div>
                      <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{ color: m.from === me ? "#cfe3ff" : "#0b57d0" }}>
                        Open file
                      </a>
                      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
                        {m.fileType} • {(m.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={onPickFile} disabled={busy || !chatId || !me} title="Upload image/pdf/doc">
            +
          </button>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={!me ? "Signing in…" : !chatId ? "Loading chat…" : "Message..."}
            style={{ flex: 1, padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd" }}
            disabled={busy || !chatId || !me}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />

          <button onClick={onSend} disabled={busy || !chatId || !me || !text.trim()}>
            Send
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            style={{ display: "none" }}
            onChange={onFileSelected}
          />
        </div>
      </div>
    </Protected>
  );
}
