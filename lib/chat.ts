// lib/chat.ts
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function makeChatId(a: string, b: string) {
  const x = (a || "").trim();
  const y = (b || "").trim();
  if (!x || !y) throw new Error("makeChatId: missing uid");
  return [x, y].sort().join("_");
}

export async function getOrCreateChat(me: string, otherUid: string) {
  const chatId = makeChatId(me, otherUid);
  const chatRef = doc(db, "chats", chatId);

  const snap = await getDoc(chatRef);

  if (!snap.exists()) {
    await setDoc(
      chatRef,
      {
        participants: [me, otherUid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: "",
      },
      { merge: true }
    );
  } else {
    await setDoc(chatRef, { updatedAt: serverTimestamp() }, { merge: true });
  }

  return { chatId };
}

export function listenMessages(
  chatId: string,
  onRows: (rows: any[]) => void,
  onErr?: (e: any) => void
): Unsubscribe {
  const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));

  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      onRows(rows);
    },
    (e) => onErr?.(e)
  );
}

export async function sendMessage(
  chatId: string,
  msg:
    | { from: string; to: string; type: "text"; text: string }
    | {
        from: string;
        to: string;
        type: "file";
        text: string;
        fileUrl: string;
        fileName: string;
        fileType: string;
        fileSize: number;
      }
) {
  if (!chatId) throw new Error("sendMessage: missing chatId");
  if (!msg?.from) throw new Error("sendMessage: missing from");
  if (!msg?.to) throw new Error("sendMessage: missing to");

  await addDoc(collection(db, "chats", chatId, "messages"), {
    ...msg,
    createdAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, "chats", chatId),
    {
      updatedAt: serverTimestamp(),
      lastMessage: msg.type === "text" ? msg.text : `[file] ${msg.fileName}`,
    },
    { merge: true }
  );
}
