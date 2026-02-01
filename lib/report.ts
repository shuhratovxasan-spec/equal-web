// lib/report.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export async function submitReport(
  reportedUid: string,
  reason: string,
  comment?: string
) {
  const me = auth.currentUser?.uid;

  if (!me) {
    throw new Error("Not signed in");
  }

  await addDoc(collection(db, "reports"), {
    reportedUid,
    reporterUid: me,
    reason,
    comment: comment ?? "",
    createdAt: serverTimestamp(),
  });
}
