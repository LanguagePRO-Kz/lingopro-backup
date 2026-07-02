"use client";

import Link from "next/link";
import { Background } from "@/components/ui/Background";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

type Section = { heading: string; body: string[] };
type PageContent = { title: string; effective: string; intro: string; sections: Section[] };

const CONTENT: { ru: PageContent; en: PageContent; tr: PageContent; kk: PageContent } = {
  ru: {
    title: "Условия использования",
    effective: "Дата вступления в силу: 1 июля 2026 г.",
    intro:
      "Настоящие Условия использования регулируют отношения между ИП Бисенов, ИИН 070513550171 (далее — Администрация) и пользователем платформы LingoPRO (далее — Пользователь).",
    sections: [
      { heading: "1. Общие положения", body: ["LingoPRO — онлайн-платформа для подготовки к международным языковым экзаменам. Регистрируясь на Платформе, Пользователь принимает настоящие Условия в полном объёме."] },
      { heading: "2. Регистрация", body: ["Для доступа к Платформе необходимо создать аккаунт. Пользователь обязуется предоставить достоверные данные при регистрации. Аккаунт является личным и не подлежит передаче третьим лицам."] },
      { heading: "3. Описание услуги", body: ["Платформа предоставляет: диагностику уровня владения языком, тренировочные тесты в формате международных экзаменов, AI-преподавателя для разговорной и письменной практики, персональный план подготовки, статистику прогресса и аналитику."] },
      { heading: "4. Оплата и подписка", body: ["Стоимость подписки указана на странице тарифов в тенге (KZT). Оплата производится через Kaspi Pay. Подписка активируется с момента оплаты и действует в течение выбранного периода (1, 3 или 6 месяцев). Автоматическое продление отсутствует."] },
      { heading: "5. Возврат средств", body: ["Гарантия повышения уровня: если при выполнении 90% заданий и прохождении входного и финального тестов уровень не повысился минимум на 1 ступень за 3 месяца — полный возврат стоимости подписки. Заявка на возврат направляется на lingopro2026@gmail.com."] },
      { heading: "6. Интеллектуальная собственность", body: ["Все материалы Платформы (тексты, тесты, дизайн, программный код) являются собственностью Администрации. Копирование, распространение или коммерческое использование материалов без письменного согласия Администрации запрещено."] },
      { heading: "7. Изменение условий", body: ["Администрация вправе изменять настоящие Условия. Актуальная версия всегда доступна на данной странице. Продолжая использовать Платформу после внесения изменений, Пользователь принимает их в полном объёме."] },
    ],
  },
  en: {
    title: "Terms of Use",
    effective: "Effective date: July 1, 2026",
    intro:
      "These Terms of Use govern the relationship between IE Bisenov, IIN 070513550171 (the “Administration”) and the user of the LingoPRO platform (the “User”).",
    sections: [
      { heading: "1. General provisions", body: ["LingoPRO is an online platform for preparing for international language exams. By registering on the Platform, the User fully accepts these Terms."] },
      { heading: "2. Registration", body: ["To access the Platform, you must create an account. The User undertakes to provide accurate information at registration. The account is personal and may not be transferred to third parties."] },
      { heading: "3. Service description", body: ["The Platform provides: language proficiency diagnostics, practice tests in the format of international exams, an AI tutor for speaking and writing practice, a personal study plan, progress statistics, and analytics."] },
      { heading: "4. Payment and subscription", body: ["Subscription prices are listed on the pricing page in tenge (KZT). Payment is made via Kaspi Pay. The subscription is activated upon payment and is valid for the selected period (1, 3, or 6 months). There is no automatic renewal."] },
      { heading: "5. Refunds", body: ["Level-up guarantee: if you complete 90% of the tasks and take the initial and final tests but your level has not risen by at least 1 step in 3 months — a full refund of the subscription cost. Refund requests are sent to lingopro2026@gmail.com."] },
      { heading: "6. Intellectual property", body: ["All Platform materials (texts, tests, design, source code) are the property of the Administration. Copying, distribution, or commercial use of the materials without the written consent of the Administration is prohibited."] },
      { heading: "7. Changes to the terms", body: ["The Administration may amend these Terms. The current version is always available on this page. By continuing to use the Platform after changes are made, the User fully accepts them."] },
    ],
  },
  tr: {
    title: "Kullanım Koşulları",
    effective: "Yürürlük tarihi: 1 Temmuz 2026",
    intro:
      "Bu Kullanım Koşulları, IE Bisenov, IIN 070513550171 (bundan sonra “Yönetim”) ile LingoPRO platformu kullanıcısı (bundan sonra “Kullanıcı”) arasındaki ilişkiyi düzenler.",
    sections: [
      { heading: "1. Genel hükümler", body: ["LingoPRO, uluslararası dil sınavlarına hazırlık için bir çevrimiçi platformdur. Platforma kaydolarak Kullanıcı bu Koşulları tam olarak kabul eder."] },
      { heading: "2. Kayıt", body: ["Platforma erişmek için bir hesap oluşturmanız gerekir. Kullanıcı, kayıt sırasında doğru bilgi vermeyi taahhüt eder. Hesap kişiseldir ve üçüncü taraflara devredilemez."] },
      { heading: "3. Hizmetin tanımı", body: ["Platform şunları sunar: dil yeterlilik tanısı, uluslararası sınav formatında alıştırma testleri, konuşma ve yazma pratiği için AI öğretmen, kişisel hazırlık planı, ilerleme istatistikleri ve analitik."] },
      { heading: "4. Ödeme ve abonelik", body: ["Abonelik ücretleri fiyatlar sayfasında tenge (KZT) olarak belirtilmiştir. Ödeme Kaspi Pay ile yapılır. Abonelik ödeme anında etkinleşir ve seçilen süre boyunca (1, 3 veya 6 ay) geçerlidir. Otomatik yenileme yoktur."] },
      { heading: "5. Para iadesi", body: ["Seviye yükseltme garantisi: görevlerin %90'ını tamamlar, giriş ve final testlerine girer ancak seviyeniz 3 ayda en az 1 kademe yükselmezse — abonelik ücretinin tamamı iade edilir. İade talepleri lingopro2026@gmail.com adresine gönderilir."] },
      { heading: "6. Fikri mülkiyet", body: ["Tüm Platform materyalleri (metinler, testler, tasarım, kaynak kodu) Yönetimin mülkiyetindedir. Materyallerin Yönetimin yazılı izni olmadan kopyalanması, dağıtılması veya ticari amaçla kullanılması yasaktır."] },
      { heading: "7. Koşulların değiştirilmesi", body: ["Yönetim bu Koşulları değiştirebilir. Güncel sürüm her zaman bu sayfada mevcuttur. Değişikliklerden sonra Platformu kullanmaya devam eden Kullanıcı bunları tam olarak kabul eder."] },
    ],
  },
  kk: {
    title: "Пайдалану шарттары",
    effective: "Күшіне ену күні: 2026 жылғы 1 шілде",
    intro:
      "Осы Пайдалану шарттары ЖК Бисенов, ЖСН 070513550171 (бұдан әрі — Әкімшілік) мен LingoPRO платформасы пайдаланушысы (бұдан әрі — Пайдаланушы) арасындағы қатынастарды реттейді.",
    sections: [
      { heading: "1. Жалпы ережелер", body: ["LingoPRO — халықаралық тілдік емтихандарға дайындалуға арналған онлайн-платформа. Платформаға тіркелу арқылы Пайдаланушы осы Шарттарды толық көлемде қабылдайды."] },
      { heading: "2. Тіркелу", body: ["Платформаға қол жеткізу үшін аккаунт құру қажет. Пайдаланушы тіркелу кезінде дұрыс деректер беруге міндеттенеді. Аккаунт жеке болып табылады және үшінші тұлғаларға берілмейді."] },
      { heading: "3. Қызмет сипаттамасы", body: ["Платформа мыналарды ұсынады: тіл меңгеру деңгейінің диагностикасы, халықаралық емтихан форматындағы жаттығу тесттері, сөйлеу және жазу практикасына арналған AI-мұғалім, жеке дайындық жоспары, прогресс статистикасы және аналитика."] },
      { heading: "4. Төлем және жазылым", body: ["Жазылым құны тарифтер бетінде теңгемен (KZT) көрсетілген. Төлем Kaspi Pay арқылы жүргізіледі. Жазылым төлем жасалған сәттен бастап іске қосылады және таңдалған кезең ішінде (1, 3 немесе 6 ай) жарамды. Автоматты түрде ұзарту жоқ."] },
      { heading: "5. Қаражатты қайтару", body: ["Деңгейді көтеру кепілдігі: тапсырмалардың 90%-ын орындап, кіріс және қорытынды тесттерден өтіп, деңгейіңіз 3 айда кемінде 1 сатыға көтерілмесе — жазылым құны толық қайтарылады. Қайтару өтінімі lingopro2026@gmail.com мекенжайына жіберіледі."] },
      { heading: "6. Зияткерлік меншік", body: ["Платформаның барлық материалдары (мәтіндер, тесттер, дизайн, бағдарламалық код) Әкімшіліктің меншігі болып табылады. Материалдарды Әкімшіліктің жазбаша келісімінсіз көшіру, тарату немесе коммерциялық мақсатта пайдалану тыйым салынған."] },
      { heading: "7. Шарттарды өзгерту", body: ["Әкімшілік осы Шарттарды өзгерте алады. Өзекті нұсқасы әрдайым осы бетте қолжетімді. Өзгерістерден кейін Платформаны пайдалануды жалғастыра отырып, Пайдаланушы оларды толық көлемде қабылдайды."] },
    ],
  },
};

export function TermsContent() {
  const { t, locale } = useI18n();
  const c = pick(locale, CONTENT);

  return (
    <>
      <Background />

      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight">
            Lingo<span className="text-gradient">PRO</span>
          </span>
        </Link>
        <Link href="/" className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]">
          ← {t.pages.back}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-8 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.title}</h1>
        <p className="mt-3 text-sm text-[var(--color-muted)]">{c.effective}</p>

        <p className="mt-8 text-base leading-relaxed text-[var(--color-foreground)]">{c.intro}</p>

        <div className="mt-8 flex flex-col gap-8">
          {c.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-3 text-sm leading-relaxed text-[var(--color-foreground)] sm:text-base">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
