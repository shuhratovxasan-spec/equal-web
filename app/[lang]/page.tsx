import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = lang === "ru" ? "ru" : "en";

  const t = l === "ru"
    ? {
        title: "Правила сообщества",
        updated: "Дата обновления: 2026-01-24",
        intro:
          "EQUAL строится на доверии. Эти правила нужны, чтобы платформа оставалась безопасной и честной.",
        rules: [
          "Будь уважителен. Никаких угроз, травли, дискриминации.",
          "Никакого скама, вымогательства, ‘инвестиций’, просьб о деньгах.",
          "Не запрашивай и не отправляй паспорт/карты/коды/пароли.",
          "Не спамь и не навязывай услуги. Нет массовых рассылок.",
          "Не публикуй чужие персональные данные без согласия.",
          "Если видишь мошенничество — жми Report.",
          "Нарушения могут привести к блокировке."
        ],
        links: {
          terms: "Условия использования",
          privacy: "Политика конфиденциальности",
          home: "На главную"
        }
      }
    : {
        title: "Community Rules",
        updated: "Last updated: 2026-01-24",
        intro:
          "EQUAL is built on trust. These rules keep the platform safe and honest.",
        rules: [
          "Be respectful. No threats, harassment, or discrimination.",
          "No scams, extortion, ‘investments’, or requests for money.",
          "Do not request/share IDs, cards, codes, or passwords.",
          "No spam or mass outreach.",
          "No posting personal data of others without consent.",
          "If you see fraud — use Report.",
          "Violations may result in a ban."
        ],
        links: {
          terms: "Terms of Use",
          privacy: "Privacy Policy",
          home: "Home"
        }
      };

  return (
    <main className="min-h-screen p-6 bg-zinc-50">
      <div className="mx-auto max-w-3xl rounded-xl border bg-white p-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <div className="mt-1 text-sm text-gray-500">{t.updated}</div>

        <p className="mt-4 text-gray-800">{t.intro}</p>

        <ul className="mt-6 list-disc space-y-2 pl-6 text-gray-800">
          {t.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link className="underline" href={`/${l}/terms`}>{t.links.terms}</Link>
          <Link className="underline" href={`/${l}/privacy`}>{t.links.privacy}</Link>
          <Link className="underline" href={`/${l}`}>{t.links.home}</Link>
        </div>
      </div>
    </main>
  );
}
