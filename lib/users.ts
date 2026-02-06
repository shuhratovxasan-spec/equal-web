// lib/users.ts
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
export async function getUserProfile(...) { ... }

export type PublicUser = {
  uid: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  bgId?: string;
  skills?: string[];
  languages?: string[];
  createdAt?: number | null; // ✅ plain number (ms) or null
};

function toMillisSafe(ts: any): number | null {
  if (!ts) return null;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  return null;
}

export async function listUsers(max = 50): Promise<PublicUser[]> {
  const q = query(
    collection(db, "users"),
    orderBy("createdAt", "desc"),
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
      createdAt: toMillisSafe(data.createdAt), // ✅ now plain
    };
  });
}

export async function listUsersBySkill(skill: string, max = 50) {
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
      ...data,
      createdAt: toMillisSafe(data.createdAt),
    };
  });
}

