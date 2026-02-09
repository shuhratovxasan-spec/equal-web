// lib/request.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type CreateRequestArgs = {
  // keep requesterUid if some pages use it
  requesterUid?: string;

  // your page is sending these:
  ownerUid: string;
  ownerName?: string | null;
  ownerCity?: string | null;

  title?: string;
  details?: string;

  // add more optional fields if you already store them
  // category?: string | null;
  // lang?: "en" | "ru";
};

export async function createRequest(args: CreateRequestArgs) {
  const {
    requesterUid,
    ownerUid,
    ownerName = null,
    ownerCity = null,
    title = "",
    details = "",
  } = args;

  // back-compat: if requesterUid is used elsewhere, we keep it in doc
  const docData = {
    ownerUid,
    ownerName,
    ownerCity,
    requesterUid: requesterUid ?? ownerUid,
    title,
    details,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "requests"), docData);
  return ref.id;
}
