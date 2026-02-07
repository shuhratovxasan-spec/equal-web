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
        title: "Условия использования",
        updated: "Дата обновления: 2026-01-24",
        intro:
          "EQUAL — платформа взаимной помощи и обмена навыками. Мы не являемся работодателем, агентством, банком, юридической фирмой или медицинской организацией. Пользователи взаимодействуют между собой самостоятельно.",
        sections: [
          {
            h: "1) Кто мы",
            p: "EQUAL — проект/платформа для общения и взаимной поддержки. Мы предоставляем техническую возможность находить людей, общаться и оценивать взаимодействие."
          },
          {
            h: "2) Важный отказ от ответственности",
            p: "Любые советы (юридические, финансовые, медицинские, строительные и т.д.) предоставляются пользователями. Мы не гарантируем точность, безопасность или результат. Вы принимаете решения на свой страх и риск."
          },
          {
            h: "3) Запрещённые действия",
            p: "Запрещены: мошенничество, вымогательство, угрозы, спам, травля, дискриминация, продажа запрещённых товаров/услуг, публикация чужих персональных данных без согласия, попытки обойти блокировки."
          },
          {
            h: "4) Рейтинги и доверие",
            p: "Рейтинги и Trust Score — автоматическая/социальная метрика, которая не является гарантией качества. Мы можем изменять алгоритм расчёта."
          },
          {
            h: "5) Блокировки",
            p: "Мы можем ограничить доступ или заблокировать аккаунт при подозрении на скам/нарушения. Блокировки могут быть без предварительного уведомления."
          },
          {
            h: "6) Контент пользователей",
            p: "Вы несёте ответственность за то, что публикуете и отправляете. Не размещайте конфиденциальные данные (паспорт, банковские карты и т.п.)."
          },
          {
            h: "7) Ограничение ответственности",
            p: "В пределах, разрешённых законом, EQUAL не несёт ответственности за убытки, возникшие из-за взаимодействия пользователей между собой."
          },
          {
            h: "8) Изменения условий",
            p: "Мы можем обновлять условия. Продолжая пользоваться платформой после обновления, вы принимаете изменения."
          }
        ],
        links: {
          privacy: "Политика конфиденциальности",
          rules: "Правила сообщества",
          home: "На главную"
        }
      }
    : {
        title: "Terms of Use",
        updated: "Last updated: 2026-01-24",
        intro:
          "EQUAL is a mutual-help and skill-exchange platform. We are not an employer, agency, bank, law firm, or medical provider. Users interact independently at their own risk.",
        sections: [
          {
            h: "1) What we are",
            p: "EQUAL provides tools to discover people, chat, and rate interactions."
          },
          {
            h: "2) Important Disclaimer",
            p: "Any advice (legal, financial, medical, construction, etc.) is provided by users. We do not guarantee accuracy, safety, or outcomes. You act at your own risk."
          },
          {
            h: "3) Prohibited Conduct",
            p: "No fraud, extortion, threats, spam, harassment, discrimination, illegal goods/services, doxxing, or attempts to bypass bans."
          },
          {
            h: "4) Ratings & Trust",
            p: "Ratings and Trust Score are social/automated signals and not guarantees. We may change the scoring algorithm."
          },
          {
            h: "5) Bans",
            p: "We may restrict or ban accounts suspected of scams or violations, with or without notice."
          },
          {
            h: "6) User Content",
            p: "You are responsible for what you post/send. Do not share sensitive personal data (IDs, cards, etc.)."
          },
          {
            h: "7) Limitation of Liability",
            p: "To the extent permitted by law, EQUAL is not liable for losses arising from user-to-user interactions."
          },
          {
            h: "8) Changes",
            p: "We may update these terms. Continued use after updates means acceptance."
          }
        ],
        links: {
          privacy: "Privacy Policy",
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
          {t.sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-semibold">{s.h}</h2>
              <p className="mt-1 text-gray-800">{s.p}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link className="underline" href={`/${l}/privacy`}>{t.links.privacy}</Link>
          <Link className="underline" href={`/${l}/rules`}>{t.links.rules}</Link>
          <Link className="underline" href={`/${l}`}>{t.links.home}</Link>
        </div>
      </div>
    </main>
  );
}
