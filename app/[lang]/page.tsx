// app/[lang]/chat/[uid]/page.tsx
import ChatClient from "@/components/ChatClient";

export default async function Page(props: any) {
  const p = await props.params;
  const lang = p?.lang === "ru" ? "ru" : "en";
  const otherUid = String(p?.uid || "");
  return <ChatClient lang={lang} otherUid={otherUid} />;
}
