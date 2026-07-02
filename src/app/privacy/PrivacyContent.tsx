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
    title: "Политика конфиденциальности",
    effective: "Дата вступления в силу: 1 июля 2026 г.",
    intro:
      "Настоящая Политика конфиденциальности описывает порядок сбора, использования и защиты персональных данных пользователей платформы LingoPRO (далее — Платформа), предоставляемой ИП Бисенов, ИИН 070513550171 (далее — Оператор).",
    sections: [
      { heading: "1. Какие данные мы собираем", body: ["При регистрации: имя, адрес электронной почты, номер телефона. При использовании платформы: результаты тестов, прогресс обучения, статистика активности. Автоматически: IP-адрес, тип браузера, время посещения, файлы cookie."] },
      { heading: "2. Цели сбора данных", body: ["Предоставление доступа к Платформе и её функциям. Персонализация обучения и составление индивидуального плана подготовки. Обработка платежей. Улучшение качества сервиса. Связь с пользователем: уведомления, техническая поддержка."] },
      { heading: "3. Хранение и защита данных", body: ["Персональные данные хранятся на защищённых серверах (EU, Франкфурт). При передаче данных применяется шифрование SSL/TLS. Доступ к персональным данным имеют только уполномоченные сотрудники Оператора. Срок хранения данных — в течение действия аккаунта пользователя и 1 год после его удаления."] },
      { heading: "4. Передача данных третьим лицам", body: ["Оператор не продаёт и не передаёт персональные данные третьим лицам, за исключением случаев: обработки платежей через платёжные системы, исполнения требований законодательства Республики Казахстан, обеспечения технической работы сервиса (хостинг, аналитика)."] },
      { heading: "5. Файлы cookie", body: ["Платформа использует файлы cookie для обеспечения авторизации и сбора аналитики. Пользователь может отключить cookie в настройках браузера, однако это может ограничить функциональность Платформы."] },
      { heading: "6. Права пользователя", body: ["Пользователь имеет право: запросить доступ к своим персональным данным, потребовать исправления или удаления данных, отозвать согласие на обработку данных, удалить свой аккаунт. Для реализации указанных прав направьте запрос на lingopro2026@gmail.com."] },
      { heading: "7. Изменения", body: ["Оператор вправе обновлять настоящую Политику. Актуальная версия всегда доступна на данной странице."] },
    ],
  },
  en: {
    title: "Privacy Policy",
    effective: "Effective date: July 1, 2026",
    intro:
      "This Privacy Policy describes how the personal data of users of the LingoPRO platform (the “Platform”), provided by IE Bisenov, IIN 070513550171 (the “Operator”), is collected, used, and protected.",
    sections: [
      { heading: "1. What data we collect", body: ["At registration: name, email address, phone number. While using the platform: test results, learning progress, activity statistics. Automatically: IP address, browser type, visit time, cookies."] },
      { heading: "2. Purposes of data collection", body: ["Providing access to the Platform and its features. Personalizing learning and building an individual study plan. Processing payments. Improving service quality. Communicating with the user: notifications, technical support."] },
      { heading: "3. Data storage and protection", body: ["Personal data is stored on secure servers (EU, Frankfurt). SSL/TLS encryption is used for data transfer. Only authorized employees of the Operator have access to personal data. Data is retained for the duration of the user's account and for 1 year after its deletion."] },
      { heading: "4. Sharing data with third parties", body: ["The Operator does not sell or share personal data with third parties, except for: processing payments through payment systems, complying with the laws of the Republic of Kazakhstan, and ensuring the technical operation of the service (hosting, analytics)."] },
      { heading: "5. Cookies", body: ["The Platform uses cookies to enable authentication and collect analytics. The user can disable cookies in the browser settings, but this may limit the functionality of the Platform."] },
      { heading: "6. User rights", body: ["The user has the right to: request access to their personal data, request correction or deletion of data, withdraw consent to data processing, and delete their account. To exercise these rights, send a request to lingopro2026@gmail.com."] },
      { heading: "7. Changes", body: ["The Operator may update this Policy. The current version is always available on this page."] },
    ],
  },
  tr: {
    title: "Gizlilik Politikası",
    effective: "Yürürlük tarihi: 1 Temmuz 2026",
    intro:
      "Bu Gizlilik Politikası, IE Bisenov, IIN 070513550171 (bundan sonra “Operatör”) tarafından sağlanan LingoPRO platformu (bundan sonra “Platform”) kullanıcılarının kişisel verilerinin toplanması, kullanılması ve korunması usulünü açıklar.",
    sections: [
      { heading: "1. Hangi verileri topluyoruz", body: ["Kayıt sırasında: ad, e-posta adresi, telefon numarası. Platformu kullanırken: test sonuçları, öğrenme ilerlemesi, aktivite istatistikleri. Otomatik olarak: IP adresi, tarayıcı türü, ziyaret zamanı, çerezler."] },
      { heading: "2. Veri toplamanın amaçları", body: ["Platforma ve özelliklerine erişim sağlamak. Öğrenmeyi kişiselleştirmek ve bireysel hazırlık planı oluşturmak. Ödemeleri işlemek. Hizmet kalitesini artırmak. Kullanıcıyla iletişim: bildirimler, teknik destek."] },
      { heading: "3. Verilerin saklanması ve korunması", body: ["Kişisel veriler güvenli sunucularda (AB, Frankfurt) saklanır. Veri aktarımında SSL/TLS şifrelemesi kullanılır. Kişisel verilere yalnızca Operatörün yetkili çalışanları erişebilir. Veriler, kullanıcının hesabı süresince ve silinmesinden sonra 1 yıl boyunca saklanır."] },
      { heading: "4. Verilerin üçüncü taraflarla paylaşılması", body: ["Operatör, aşağıdaki durumlar dışında kişisel verileri üçüncü taraflara satmaz veya aktarmaz: ödeme sistemleri aracılığıyla ödemelerin işlenmesi, Kazakistan Cumhuriyeti mevzuatının gereklerinin yerine getirilmesi, hizmetin teknik işleyişinin sağlanması (barındırma, analitik)."] },
      { heading: "5. Çerezler", body: ["Platform, kimlik doğrulamayı sağlamak ve analitik toplamak için çerezler kullanır. Kullanıcı çerezleri tarayıcı ayarlarından devre dışı bırakabilir, ancak bu Platformun işlevselliğini sınırlayabilir."] },
      { heading: "6. Kullanıcı hakları", body: ["Kullanıcı şu haklara sahiptir: kişisel verilerine erişim talep etmek, verilerin düzeltilmesini veya silinmesini talep etmek, veri işlemeye ilişkin onayı geri çekmek, hesabını silmek. Bu hakları kullanmak için lingopro2026@gmail.com adresine bir talep gönderin."] },
      { heading: "7. Değişiklikler", body: ["Operatör bu Politikayı güncelleyebilir. Güncel sürüm her zaman bu sayfada mevcuttur."] },
    ],
  },
  kk: {
    title: "Құпиялылық саясаты",
    effective: "Күшіне ену күні: 2026 жылғы 1 шілде",
    intro:
      "Осы Құпиялылық саясаты ЖК Бисенов, ЖСН 070513550171 (бұдан әрі — Оператор) ұсынатын LingoPRO платформасы (бұдан әрі — Платформа) пайдаланушыларының дербес деректерін жинау, пайдалану және қорғау тәртібін сипаттайды.",
    sections: [
      { heading: "1. Қандай деректерді жинаймыз", body: ["Тіркелу кезінде: аты, электрондық пошта мекенжайы, телефон нөмірі. Платформаны пайдалану кезінде: тест нәтижелері, оқу прогресі, белсенділік статистикасы. Автоматты түрде: IP-мекенжай, браузер түрі, кіру уақыты, cookie файлдары."] },
      { heading: "2. Деректерді жинау мақсаттары", body: ["Платформаға және оның функцияларына қол жеткізуді қамтамасыз ету. Оқуды дараландыру және жеке дайындық жоспарын құру. Төлемдерді өңдеу. Қызмет сапасын жақсарту. Пайдаланушымен байланыс: хабарламалар, техникалық қолдау."] },
      { heading: "3. Деректерді сақтау және қорғау", body: ["Дербес деректер қорғалған серверлерде (EU, Франкфурт) сақталады. Деректерді беру кезінде SSL/TLS шифрлауы қолданылады. Дербес деректерге тек Оператордың уәкілетті қызметкерлері қол жеткізе алады. Деректерді сақтау мерзімі — пайдаланушы аккаунты жұмыс істеп тұрған кезде және ол жойылғаннан кейін 1 жыл."] },
      { heading: "4. Деректерді үшінші тұлғаларға беру", body: ["Оператор дербес деректерді үшінші тұлғаларға сатпайды және бермейді, мыналардан басқа: төлем жүйелері арқылы төлемдерді өңдеу, Қазақстан Республикасы заңнамасының талаптарын орындау, қызметтің техникалық жұмысын қамтамасыз ету (хостинг, аналитика)."] },
      { heading: "5. Cookie файлдары", body: ["Платформа авторизацияны қамтамасыз ету және аналитиканы жинау үшін cookie файлдарын пайдаланады. Пайдаланушы cookie файлдарын браузер параметрлерінде өшіре алады, бірақ бұл Платформаның функционалдығын шектеуі мүмкін."] },
      { heading: "6. Пайдаланушы құқықтары", body: ["Пайдаланушының құқығы бар: өз дербес деректеріне қол жеткізуді сұрау, деректерді түзетуді немесе жоюды талап ету, деректерді өңдеуге келісімін кері қайтару, аккаунтын жою. Осы құқықтарды жүзеге асыру үшін lingopro2026@gmail.com мекенжайына сұрау жіберіңіз."] },
      { heading: "7. Өзгерістер", body: ["Оператор осы Саясатты жаңарта алады. Өзекті нұсқасы әрдайым осы бетте қолжетімді."] },
    ],
  },
};

export function PrivacyContent() {
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
