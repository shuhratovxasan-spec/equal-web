import { doc, getDoc, collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type PublicUser = {
  uid: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  bgId?: string;
  skills?: string[];
  languages?: string[];
  createdAt?: number | null; // ms
};

function toMillisSafe(ts: any): number | null {
  if (!ts) return null;
  if (typeof ts === "number") return ts;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  return null;
}

// ✅ This is the function RedirectGate is importing
export async function getUserProfile(uid: string): Promise<PublicUser | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as any;
  return {
    uid: snap.id,
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",
    photoURL: data.photoURL ?? "",
    bgId: data.bgId ?? "",
    skills: Array.isArray(data.skills) ? data.skills : [],
    languages: Array.isArray(data.languages) ? data.languages : [],
    createdAt: toMillisSafe(data.createdAt),
  };
}

export async function listUsers(max = 50): Promise<PublicUser[]> {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      uid: d.id,
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      photoURL: data.photoURL ?? "",
      bgId: data.bgId ?? "",
      skills: Array.isArray(data.skills) ? data.skills : [],
      languages: Array.isArray(data.languages) ? data.languages : [],
      createdAt: toMillisSafe(data.createdAt),
    };
  });
}

export async function listUsersBySkill(skill: string, max = 50): Promise<PublicUser[]> {
  const q = query(
    collection(db, "users"),
    where("skills", "array-contains", skill),
    limit(max)
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      uid: d.id,
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      photoURL: data.photoURL ?? "",
      bgId: data.bgId ?? "",
      skills: Array.isArray(data.skills) ? data.skills : [],
      languages: Array.isArray(data.languages) ? data.languages : [],
      createdAt: toMillisSafe(data.createdAt),
    };
  });
}

