// lib/rating.ts
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export async function submitRating(args: {
  fromUid: string;
  toUid: string;
  chatId: string;
  stars: number;
  comment?: string;
}) {
  const me = auth.currentUser?.uid;
  if (!me) throw new Error("Not signed in");

  await addDoc(collection(db, "ratings"), {
    raterUid: me,
    ratedUid: args.toUid,
    chatId: args.chatId,
    value: args.stars,
    comment: args.comment ?? "",
    createdAt: serverTimestamp(),
  });
}

export async function hasRated(me: string, otherUid: string, chatId: string) {
  const q = query(
    collection(db, "ratings"),
    where("raterUid", "==", me),
    where("ratedUid", "==", otherUid),
    where("chatId", "==", chatId)
  );

  const snap = await getDocs(q);
  return !snap.empty;
}
