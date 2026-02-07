import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { HelpRequest } from "./request";

export async function getRequestByUsers(a: string, b: string): Promise<HelpRequest | null> {
  const q = query(
    collection(db, "requests"),
    where("status", "==", "accepted")
  );

  const snap = await getDocs(q);

  for (const d of snap.docs) {
    const r = d.data() as HelpRequest;
    if (
      (r.ownerUid === a && r.helperUid === b) ||
      (r.ownerUid === b && r.helperUid === a)
    ) {
      return { id: d.id, ...r };
    }
  }

  return null;
}
