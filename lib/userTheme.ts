import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BgId, DEFAULT_BG } from "@/lib/backgrounds";

const LS_KEY = "equal_bgId";

export function getLocalBg(): BgId {
  if (typeof window === "undefined") return DEFAULT_BG;
  const v = window.localStorage.getItem(LS_KEY) as BgId | null;
  return v ?? DEFAULT_BG;
}

export function setLocalBg(bgId: BgId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, bgId);
}

export async function getUserBg(uid: string): Promise<BgId> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const bgId = (snap.exists() ? (snap.data()?.bgId as BgId | undefined) : undefined) ?? DEFAULT_BG;
  return bgId;
}

export async function setUserBg(uid: string, bgId: BgId) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, { bgId }, { merge: true });
  } else {
    await updateDoc(ref, { bgId });
  }
}
