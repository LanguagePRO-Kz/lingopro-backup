"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { Background } from "@/components/ui/Background";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

const CONTENT = {
  ru: {
    title: "Гарантия повышения уровня",
    introBefore:
      "Мы уверены в качестве нашей платформы. Если после 3 месяцев подготовки с LingoPRO ваш уровень не вырос минимум на 1 ступень (например, с A2 до B1), мы вернём ",
    refundBold: "100% стоимости подписки",
    introAfter: ".",
    conditionsTitle: "Условия гарантии",
    conditions: [
      "Пройдите входную диагностику при регистрации — это зафиксирует ваш начальный уровень.",
      "Занимайтесь на платформе не менее 3 месяцев.",
      "Выполните минимум 90% заданий в вашем персональном плане.",
      "Пройдите финальный тест по окончании подготовки.",
    ],
    contactBefore: "Если при соблюдении всех условий ваш уровень не повысился — напишите нам на ",
    contactAfter:
      " с темой «Гарантия возврата — [Ваше имя]». Укажите email аккаунта. Мы проверим вашу активность на платформе и оформим возврат в течение 14 рабочих дней.",
    importantTitle: "Важно",
    important: [
      "Гарантия распространяется на подписки от 3 месяцев.",
      "Возврат ограничен стоимостью подписки.",
      "Платформа фиксирует прогресс автоматически — мы видим, сколько заданий вы выполнили.",
    ],
    cta: "Начать подготовку →",
  },
  en: {
    title: "Level-Up Guarantee",
    introBefore:
      "We're confident in the quality of our platform. If after 3 months of preparation with LingoPRO your level hasn't risen by at least 1 step (for example, from A2 to B1), we'll refund ",
    refundBold: "100% of the subscription cost",
    introAfter: ".",
    conditionsTitle: "Guarantee conditions",
    conditions: [
      "Take the initial diagnostic at sign-up — it records your starting level.",
      "Study on the platform for at least 3 months.",
      "Complete at least 90% of the tasks in your personal plan.",
      "Take the final test at the end of your preparation.",
    ],
    contactBefore: "If you've met all the conditions and your level hasn't improved — email us at ",
    contactAfter:
      " with the subject “Refund guarantee — [Your name]”. Include your account email. We'll review your activity on the platform and process the refund within 14 business days.",
    importantTitle: "Important",
    important: [
      "The guarantee applies to subscriptions of 3 months or longer.",
      "The refund is limited to the subscription cost.",
      "The platform records progress automatically — we can see how many tasks you've completed.",
    ],
    cta: "Start preparing →",
  },
  tr: {
    title: "Seviye Yükseltme Garantisi",
    introBefore:
      "Platformumuzun kalitesine güveniyoruz. LingoPRO ile 3 aylık hazırlıktan sonra seviyeniz en az 1 kademe yükselmezse (örneğin A2'den B1'e), abonelik ücretinin ",
    refundBold: "%100'ünü",
    introAfter: " iade ederiz.",
    conditionsTitle: "Garanti koşulları",
    conditions: [
      "Kayıt sırasında giriş tanı testini yapın — bu başlangıç seviyenizi kaydeder.",
      "Platformda en az 3 ay çalışın.",
      "Kişisel planınızdaki görevlerin en az %90'ını tamamlayın.",
      "Hazırlığın sonunda final testini yapın.",
    ],
    contactBefore: "Tüm koşulları yerine getirdiğiniz halde seviyeniz yükselmediyse — bize şu adresten yazın: ",
    contactAfter:
      " konu satırına “İade garantisi — [Adınız]” yazarak. Hesap e-postanızı belirtin. Platformdaki aktivitenizi kontrol edip iadeyi 14 iş günü içinde gerçekleştireceğiz.",
    importantTitle: "Önemli",
    important: [
      "Garanti 3 ay ve üzeri aboneliklerde geçerlidir.",
      "İade, abonelik ücretiyle sınırlıdır.",
      "Platform ilerlemeyi otomatik olarak kaydeder — kaç görev tamamladığınızı görüyoruz.",
    ],
    cta: "Hazırlığa başla →",
  },
  kk: {
    title: "Деңгейді көтеру кепілдігі",
    introBefore:
      "Біз платформамыздың сапасына сенімдіміз. LingoPRO-мен 3 ай дайындықтан кейін деңгейіңіз кемінде 1 сатыға көтерілмесе (мысалы, A2-ден B1-ге), жазылым құнының ",
    refundBold: "100%-ын",
    introAfter: " қайтарамыз.",
    conditionsTitle: "Кепілдік шарттары",
    conditions: [
      "Тіркелу кезінде кіріс диагностикасынан өтіңіз — бұл бастапқы деңгейіңізді тіркейді.",
      "Платформада кемінде 3 ай айналысыңыз.",
      "Жеке жоспарыңыздағы тапсырмалардың кемінде 90%-ын орындаңыз.",
      "Дайындық соңында қорытынды тесттен өтіңіз.",
    ],
    contactBefore: "Барлық шарттарды орындағаныңызбен деңгейіңіз көтерілмесе — бізге мына мекенжайға жазыңыз: ",
    contactAfter:
      " «Қайтару кепілдігі — [Атыңыз]» тақырыбымен. Аккаунт email-ін көрсетіңіз. Платформадағы белсенділігіңізді тексеріп, қайтаруды 14 жұмыс күні ішінде рәсімдейміз.",
    importantTitle: "Маңызды",
    important: [
      "Кепілдік 3 айдан бастап жазылымдарға қолданылады.",
      "Қайтару жазылым құнымен шектеледі.",
      "Платформа прогресті автоматты түрде тіркейді — қанша тапсырма орындағаныңызды көреміз.",
    ],
    cta: "Дайындықты бастау →",
  },
};

export function GuaranteeContent() {
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
        <Link
          href="/"
          className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
        >
          ← {t.pages.back}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-8 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
            <Shield size={32} />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{c.title}</h1>
        </div>

        <div className="glass mt-10 rounded-3xl p-6 sm:p-8">
          <p className="text-base leading-relaxed text-[var(--color-foreground)]">
            {c.introBefore}
            <span className="font-semibold text-[var(--color-brand)]">{c.refundBold}</span>
            {c.introAfter}
          </p>

          <h2 className="mt-8 text-lg font-semibold text-[var(--color-foreground)]">{c.conditionsTitle}</h2>
          <ol className="mt-4 flex flex-col gap-3">
            {c.conditions.map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-foreground)] sm:text-base">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/12 text-xs font-bold text-[var(--color-brand)]">
                  {i + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>

          <p className="mt-8 text-sm leading-relaxed text-[var(--color-foreground)] sm:text-base">
            {c.contactBefore}
            <a href="mailto:lingopro2026@gmail.com" className="font-medium text-[var(--color-brand)] hover:underline">
              lingopro2026@gmail.com
            </a>
            {c.contactAfter}
          </p>

          <div className="mt-8 rounded-2xl border border-[var(--color-brand-2)]/25 bg-[var(--color-brand-2)]/[0.06] p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-brand-2)]">
              {c.importantTitle}
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {c.important.map((text, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--color-foreground)]">
                  <span className="mt-0.5 text-[var(--color-brand-2)]">•</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/login" className="btn-primary rounded-full px-8 py-3.5 text-sm">
            {c.cta}
          </Link>
        </div>
      </main>
    </>
  );
}
