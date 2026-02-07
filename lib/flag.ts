// lib/flag.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export async function createFlag(args: {
  toUid: string;
  reason: string;
  comment?: string;
}) {
  const me = auth.currentUser?.uid;
  if (!me) throw new Error("Not signed in");

  await addDoc(collection(db, "flags"), {
    fromUid: me,
    toUid: args.toUid,
    reason: args.reason,
    comment: args.comment ?? "",
    createdAt: serverTimestamp(),
  });
}
