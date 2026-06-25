"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

type Content = { eyebrow: string; title: string; subtitle: string; items: { q: string; a: string }[] };

const CONTENT: { ru: Content; en: Content; tr: Content; kk: Content } = {
  ru: {
    eyebrow: "Вопросы",
    title: "Частые вопросы",
    subtitle: "Коротко о главном — без громких обещаний.",
    items: [
      {
        q: "Чем LingoPRO отличается от других платформ?",
        a: "Большинство платформ — это просто тесты. У нас AI разбирает каждый ответ, строит персональный план, адаптирует программу под слабые зоны и ведёт до результата C1.",
      },
      {
        q: "Точно ли AI оценивает как реальный экзаменатор?",
        a: "AI обучен на реальных экзаменационных материалах TÖMER. На Writing и Speaking ты получаешь детальный разбор по критериям с конкретными рекомендациями.",
      },
      {
        q: "Можно ли подготовиться с нуля?",
        a: "Да. Платформа строит маршрут от A0 до C1. Срок зависит от интенсивности: от 6 месяцев при 30 минутах в день.",
      },
      {
        q: "Какие экзамены доступны?",
        a: "Сейчас доступна подготовка к TÖMER (турецкий). TOPIK, HSK, JLPT, DELF и TestDaF — в разработке. Оставьте email, чтобы узнать о запуске первыми.",
      },
      {
        q: "Можно ли отменить подписку?",
        a: "Да, в любой момент в личном кабинете. Доступ остаётся до конца оплаченного периода.",
      },
      {
        q: "LingoPRO — официальный партнёр TÖMER?",
        a: "Да, LingoPRO является официальным партнёром TÖMER. Мы работаем с экзаменационными материалами и стандартами оценки TÖMER.",
      },
    ],
  },
  en: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    subtitle: "The essentials — without overblown promises.",
    items: [
      { q: "How is LingoPRO different from other platforms?", a: "Most platforms are just tests. Our AI breaks down every answer, builds a personal plan, adapts the program to weak areas and guides you to a C1 result." },
      { q: "Does the AI really score like a real examiner?", a: "The AI is trained on real TÖMER exam materials. For Writing and Speaking you get a detailed criterion-by-criterion breakdown with concrete recommendations." },
      { q: "Can I prepare from scratch?", a: "Yes. The platform builds a route from A0 to C1. The timeline depends on intensity: from 6 months at 30 minutes a day." },
      { q: "Which exams are available?", a: "TÖMER (Turkish) prep is available now. TOPIK, HSK, JLPT, DELF and TestDaF are in development. Leave your email to be the first to know about the launch." },
      { q: "Can I cancel my subscription?", a: "Yes, anytime in your account. Access remains until the end of the paid period." },
      { q: "Is LingoPRO an official TÖMER partner?", a: "Yes, LingoPRO is an official partner of TÖMER. We work with TÖMER exam materials and scoring standards." },
    ],
  },
  tr: {
    eyebrow: "SSS",
    title: "Sık sorulan sorular",
    subtitle: "Önemli noktalar — abartılı vaatler olmadan.",
    items: [
      { q: "LingoPRO diğer platformlardan nasıl farklı?", a: "Çoğu platform sadece testtir. Bizim AI her cevabı analiz eder, kişisel plan oluşturur, programı zayıf alanlara uyarlar ve seni C1 sonucuna götürür." },
      { q: "AI gerçekten gerçek bir sınav görevlisi gibi mi puanlıyor?", a: "AI gerçek TÖMER sınav materyalleriyle eğitildi. Writing ve Speaking'de kriter bazında ayrıntılı bir analiz ve somut öneriler alırsın." },
      { q: "Sıfırdan hazırlanabilir miyim?", a: "Evet. Platform A0'dan C1'e bir rota oluşturur. Süre yoğunluğa bağlıdır: günde 30 dakikada 6 aydan itibaren." },
      { q: "Hangi sınavlar mevcut?", a: "Şu anda TÖMER (Türkçe) hazırlığı mevcut. TOPIK, HSK, JLPT, DELF ve TestDaF geliştiriliyor. Lansmanı ilk öğrenmek için e-postanı bırak." },
      { q: "Aboneliğimi iptal edebilir miyim?", a: "Evet, hesabından istediğin zaman. Erişim ödenen dönemin sonuna kadar devam eder." },
      { q: "LingoPRO resmi bir TÖMER ortağı mı?", a: "Evet, LingoPRO TÖMER'in resmi ortağıdır. TÖMER sınav materyalleri ve değerlendirme standartlarıyla çalışıyoruz." },
    ],
  },
  kk: {
    eyebrow: "Сұрақтар",
    title: "Жиі қойылатын сұрақтар",
    subtitle: "Ең бастысы туралы қысқаша — артық уәдесіз.",
    items: [
      { q: "LingoPRO басқа платформалардан несімен ерекшеленеді?", a: "Көп платформа — жай тесттер. Бізде AI әр жауапты талдайды, жеке жоспар құрады, бағдарламаны әлсіз тұстарға бейімдейді және C1 нәтижесіне жеткізеді." },
      { q: "AI шынымен нағыз емтихан қабылдаушыдай бағалай ма?", a: "AI нақты TÖMER емтихан материалдарында оқытылған. Writing және Speaking бойынша критерийлер негізінде нақты ұсыныстармен егжей-тегжейлі талдау аласың." },
      { q: "Нөлден дайындалуға бола ма?", a: "Иә. Платформа A0-ден C1-ге дейін маршрут құрады. Мерзім қарқынға байланысты: күніне 30 минуттан 6 айдан бастап." },
      { q: "Қандай емтихандар қолжетімді?", a: "Қазір TÖMER (түрік) дайындығы қолжетімді. TOPIK, HSK, JLPT, DELF және TestDaF әзірленуде. Іске қосу туралы бірінші болып білу үшін email қалдыр." },
      { q: "Жазылымнан бас тартуға бола ма?", a: "Иә, кез келген уақытта жеке кабинетте. Қолжетімділік төленген кезең аяқталғанша сақталады." },
      { q: "LingoPRO — TÖMER-дің ресми серіктесі ме?", a: "Иә, LingoPRO TÖMER-дің ресми серіктесі болып табылады. Біз TÖMER емтихан материалдары мен бағалау стандарттарымен жұмыс істейміз." },
    ],
  },
};

export function FAQ() {
  const { locale } = useI18n();
  const c = pick(locale, CONTENT);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} />

        <Reveal className="mt-12 flex flex-col gap-3">
          {c.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="glass overflow-hidden rounded-2xl">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-[var(--color-foreground)] sm:text-base">{item.q}</span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/[0.04] text-[var(--color-brand)] transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--color-muted)]">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
