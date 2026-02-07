// app/[lang]/users/page.tsx
import Protected from "@/components/Protected";
import UserCard from "@/components/UserCard";
import { listUsers } from "@/lib/users";

export default async function UsersPage(props: any) {
  // ✅ Next 16: params may be a Promise
  const p = await props.params;
  const l = p?.lang === "ru" ? "ru" : "en";

  const users = await listUsers(50);

  return (
    <Protected>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
        <h2 style={{ margin: 0 }}>Users</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {users.map((u: any) => (
            <UserCard key={u.uid} user={u} lang={l} />
          ))}
        </div>
      </div>
    </Protected>
  );
}
