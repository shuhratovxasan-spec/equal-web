import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type TaskStatus = "open" | "accepted" | "completed";

export type Task = {
  id?: string;

  ownerUid: string;
  ownerName?: string | null;

  title: string;
  details: string;

  skills: string[];
  city: string;

  status: TaskStatus;
  helperUid?: string | null;
  progress?: number; // 0..100

  createdAt?: any;
  updatedAt?: any;
  completedAt?: any;
};

export async function createTask(input: Omit<Task, "id" | "status" | "helperUid" | "progress" | "createdAt" | "updatedAt" | "completedAt">) {
  const payload: Task = {
    ...input,
    title: input.title.trim(),
    details: input.details.trim(),
    skills: (input.skills || []).map((s) => s.trim()).filter(Boolean),
    city: input.city.trim(),
    status: "open",
    helperUid: null,
    progress: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "tasks"), payload);
  return ref.id;
}

export function listenOpenTasks(cb: (items: Task[]) => void, max = 80) {
  const q = query(
    collection(db, "tasks"),
    where("status", "==", "open"),
    orderBy("createdAt", "desc"),
    limit(max)
  );

  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}

export async function acceptTask(taskId: string, helperUid: string) {
  const ref = doc(db, "tasks", taskId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Task not found");

  const data = snap.data() as Task;
  if (data.status !== "open") throw new Error("Task is not open");
  if (data.ownerUid === helperUid) throw new Error("You cannot accept your own task");

  await updateDoc(ref, {
    status: "accepted",
    helperUid,
    updatedAt: serverTimestamp(),
  });
}

export async function updateTaskProgress(taskId: string, uid: string, progress: number) {
  const ref = doc(db, "tasks", taskId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Task not found");

  const data = snap.data() as Task;
  if (data.ownerUid !== uid && data.helperUid !== uid) throw new Error("Not allowed");

  const p = Math.max(0, Math.min(100, Math.round(progress)));

  await updateDoc(ref, {
    progress: p,
    updatedAt: serverTimestamp(),
  });
}

export async function completeTask(taskId: string, uid: string) {
  const ref = doc(db, "tasks", taskId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Task not found");

  const data = snap.data() as Task;
  if (data.ownerUid !== uid && data.helperUid !== uid) throw new Error("Not allowed");
  if (data.status !== "accepted") throw new Error("Task must be accepted first");

  await updateDoc(ref, {
    status: "completed",
    progress: 100,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getTask(taskId: string): Promise<Task | null> {
  const ref = doc(db, "tasks", taskId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) };
}
