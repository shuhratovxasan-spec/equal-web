"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, limit } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type UserDoc = {
  uid?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  bg?: string;
};

export default function UsersClient() {
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<string | null>(null);
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setMe(u?.uid ?? null);
      setReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!me) {
      setError("Not signed in. Please login first.");
      return;
    }

    const q = query(collection(db, "users"), limit(50));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) }));
        setUsers(list);
        setError("");
      },
      (e) => {
        console.error(e);
        setError(e?.message || "Firestore error");
      }
    );

    return () => unsub();
  }, [ready, me]);

  if (!ready) return <div style={{ padding: 24 }}>Loading auth...</div>;
  if (!me) return <div style={{ padding: 24 }}>Please sign in first.</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Users</h1>
      {error ? <div style={{ color: "red", marginTop: 12 }}>{error}</div> : null}

      <div style={{ marginTop: 16 }}>
        {users.length === 0 ? (
          <div>No users found.</div>
        ) : (
          <ul>
            {users.map((u) => (
              <li key={u.uid}>
                {u.firstName || ""} {u.lastName || ""} — {u.email || u.phone || u.uid}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
