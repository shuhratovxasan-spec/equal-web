// app/[lang]/report/[uid]/page.tsx
import ReportClient from "@/components/ReportClient";

export default async function Page(props: any) {
  const p = await props.params;
  const lang = p?.lang === "ru" ? "ru" : "en";
  const reportedUid = String(p?.uid || "");
  return <ReportClient lang={lang} reportedUid={reportedUid} />;
}
