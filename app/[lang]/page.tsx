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
        title: "Политика конфиденциальности",
        updated: "Дата обновления: 2026-01-24",
        intro:
          "Мы собираем минимум данных для работы сервиса: профиль, сообщения, рейтинги и технические логи. Мы не продаём персональные данные.",
        items: [
          {
            h: "1) Какие данные мы храним",
            p: "Профиль: имя, город, языки, навыки, bio. Контакты: email/телефон (если вы их используете для входа). Сообщения и рейтинги — для работы платформы."
          },
          {
            h: "2) Зачем мы это делаем",
            p: "Чтобы обеспечивать вход, поиск людей, чат, систему доверия/рейтингов и безопасность (анти-скам)."
          },
          {
            h: "3) Передача третьим лицам",
            p: "Мы используем инфраструктуру Firebase/Google Cloud для хранения и обработки данных. Мы не продаём ваши данные."
          },
          {
            h: "4) Публичность",
            p: "Часть профиля может быть видна другим пользователям (имя, город, навыки, языки, bio, trust/badge/ratings). Сообщения видны только участникам чата."
          },
          {
            h: "5) Безопасность",
            p: "Мы применяем правила доступа и можем блокировать аккаунты за подозрительную активность. Не отправляйте в чат паспорт/карты/пароли."
          },
          {
            h: "6) Удаление аккаунта",
            p: "Вы можете запросить удаление аккаунта (в будущем добавим кнопку). До этого — через поддержку/контакт."
          },
          {
            h: "7) Изменения политики",
            p: "Мы можем обновлять политику. Продолжая пользоваться сервисом после обновления, вы принимаете изменения."
          }
        ],
        links: {
          terms: "Условия использования",
          rules: "Правила сообщества",
          home: "На главную"
        }
      }
    : {
        title: "Privacy Policy",
        updated: "Last updated: 2026-01-24",
        intro:
          "We collect minimal data needed to run the service: profile, messages, ratings, and technical logs. We do not sell personal data.",
        items: [
          {
            h: "1) Data we store",
            p: "Profile: name, city, languages, skills, bio. Contacts: email/phone (if used for sign-in). Messages and ratings to operate the platform."
          },
          {
            h: "2) Why we store it",
            p: "Authentication, user discovery, chat, trust/ratings, and safety (anti-scam)."
          },
          {
            h: "3) Sharing with third parties",
            p: "We use Firebase/Google Cloud infrastructure for hosting and data processing. We do not sell your data."
          },
          {
            h: "4) Public visibility",
            p: "Some profile fields may be visible to others (name, city, skills, languages, bio, trust/badge/ratings). Messages are only visible to chat participants."
          },
          {
            h: "5) Security",
            p: "We use access rules and may ban accounts for suspicious behavior. Do not share IDs/cards/passwords in chat."
          },
          {
            h: "6) Account deletion",
            p: "You can request account deletion (we’ll add an in-app option later). Until then, contact support."
          },
          {
            h: "7) Changes",
            p: "We may update this policy. Continued use after updates means acceptance."
          }
        ],
        links: {
          terms: "Terms of Use",
          rules: "Community Rules",
          home: "Home"
        }
      };

  return (
    <main className="min-h-screen p-6 bg-zinc-50">
      <div className="mx-auto max-w-3xl rounded-xl border bg-white p-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <div className="mt-1 text-sm text-gray-500">{t.updated}</div>

        <p className="mt-4 text-gray-800">{t.intro}</p>

        <div className="mt-6 space-y-5">
          {t.items.map((s) => (
            <section key={s.h}>
              <h2 className="font-semibold">{s.h}</h2>
              <p className="mt-1 text-gray-800">{s.p}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link className="underline" href={`/${l}/terms`}>{t.links.terms}</Link>
          <Link className="underline" href={`/${l}/rules`}>{t.links.rules}</Link>
          <Link className="underline" href={`/${l}`}>{t.links.home}</Link>
        </div>
      </div>
    </main>
  );
}
