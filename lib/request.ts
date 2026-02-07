// lib/request.ts
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type HelpRequestStatus = "open" | "accepted" | "completed" | "cancelled";

export type HelpRequest = {
  id: string;
  createdAt?: any;
  status: HelpRequestStatus;
  requesterUid: string;
  helperUid?: string;
  title?: string;
  details?: string;
};

const col = collection(db, "requests");

export async function createRequest(args: {
  requesterUid: string;
  title?: string;
  details?: string;
}) {
  await addDoc(col, {
    status: "open",
    requesterUid: args.requesterUid,
    title: args.title ?? "",
    details: args.details ?? "",
    createdAt: serverTimestamp(),
  });
}

export async function acceptRequest(args: { requestId: string; helperUid: string }) {
  const ref = doc(db, "requests", args.requestId);
  await updateDoc(ref, {
    status: "accepted",
    helperUid: args.helperUid,
  });
}

export async function completeRequest(args: { requestId: string }) {
  const ref = doc(db, "requests", args.requestId);
  await updateDoc(ref, { status: "completed" });
}

// ✅ То, что ожидает твоя page.tsx
export function listenOpenRequests(cb: (items: HelpRequest[]) => void): Unsubscribe {
  const q = query(col, where("status", "==", "open"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items: HelpRequest[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    cb(items);
  });
}
