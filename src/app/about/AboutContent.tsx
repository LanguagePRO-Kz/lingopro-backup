"use client";

import Link from "next/link";
import { Background } from "@/components/ui/Background";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

const CONTENT = {
  ru: {
    title: "О LingoPRO",
    paragraphs: [
      "LingoPRO — AI-платформа для подготовки к международным языковым экзаменам. Мы помогаем студентам из Казахстана и Центральной Азии получить языковые сертификаты для поступления в зарубежные университеты и трудоустройства за рубежом.",
      "Платформа сочетает проверенные методики международных экзаменов с возможностями искусственного интеллекта: адаптивные тесты, персональный план подготовки, AI-преподаватель для разговорной практики и детальная обратная связь по каждому ответу.",
      "Наша миссия — сделать качественную подготовку к языковым экзаменам доступной каждому студенту, независимо от города и бюджета. Вместо дорогих офлайн-курсов — умная платформа, которая подстраивается под ваш уровень и ведёт к результату.",
      "LingoPRO основан в 2026 году в Казахстане.",
    ],
    founderRole: "Основатель LingoPRO",
  },
  en: {
    title: "About LingoPRO",
    paragraphs: [
      "LingoPRO is an AI platform for preparing for international language exams. We help students from Kazakhstan and Central Asia earn language certificates for admission to universities abroad and employment overseas.",
      "The platform combines proven international exam methodologies with the power of artificial intelligence: adaptive tests, a personal study plan, an AI tutor for speaking practice, and detailed feedback on every answer.",
      "Our mission is to make quality language exam preparation accessible to every student, regardless of city or budget. Instead of expensive offline courses — a smart platform that adapts to your level and leads to results.",
      "LingoPRO was founded in 2026 in Kazakhstan.",
    ],
    founderRole: "Founder of LingoPRO",
  },
  tr: {
    title: "LingoPRO Hakkında",
    paragraphs: [
      "LingoPRO, uluslararası dil sınavlarına hazırlık için bir AI platformudur. Kazakistan ve Orta Asya'daki öğrencilerin yurt dışındaki üniversitelere kabul ve yurt dışında istihdam için dil sertifikaları almalarına yardımcı oluyoruz.",
      "Platform, kanıtlanmış uluslararası sınav yöntemlerini yapay zekânın olanaklarıyla birleştirir: uyarlanabilir testler, kişisel hazırlık planı, konuşma pratiği için AI öğretmen ve her yanıt için ayrıntılı geri bildirim.",
      "Misyonumuz, kaliteli dil sınavı hazırlığını şehir veya bütçe fark etmeksizin her öğrenci için erişilebilir kılmaktır. Pahalı yüz yüze kurslar yerine — seviyenize uyum sağlayan ve sonuca götüren akıllı bir platform.",
      "LingoPRO 2026 yılında Kazakistan'da kuruldu.",
    ],
    founderRole: "LingoPRO Kurucusu",
  },
  kk: {
    title: "LingoPRO туралы",
    paragraphs: [
      "LingoPRO — халықаралық тілдік емтихандарға дайындалуға арналған AI-платформа. Біз Қазақстан мен Орталық Азия студенттеріне шетелдік университеттерге түсу және шетелде жұмысқа орналасу үшін тілдік сертификаттар алуға көмектесеміз.",
      "Платформа халықаралық емтихандардың дәлелденген әдістемелерін жасанды интеллект мүмкіндіктерімен ұштастырады: бейімделмелі тесттер, жеке дайындық жоспары, сөйлеу практикасына арналған AI-мұғалім және әр жауапқа толық кері байланыс.",
      "Біздің миссиямыз — сапалы тілдік емтихан дайындығын қала мен бюджетке қарамастан әр студентке қолжетімді ету. Қымбат офлайн курстардың орнына — деңгейіңізге бейімделіп, нәтижеге жеткізетін ақылды платформа.",
      "LingoPRO 2026 жылы Қазақстанда құрылды.",
    ],
    founderRole: "LingoPRO негізін қалаушы",
  },
};

export function AboutContent() {
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

        <div className="mt-8 flex flex-col gap-5">
          {c.paragraphs.map((p, i) => (
            <p key={i} className="text-base leading-relaxed text-[var(--color-foreground)]">
              {p}
            </p>
          ))}
        </div>

        <div className="glass mt-12 flex items-center gap-5 rounded-3xl p-6">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ background: "linear-gradient(135deg, #6d5bff, #5b8cff)" }}
            aria-hidden
          >
            VO
          </div>
          <div>
            <p className="text-base font-semibold text-[var(--color-foreground)]">Vadim Obrezkov</p>
            <p className="mt-0.5 text-sm text-[var(--color-muted)]">{c.founderRole}</p>
          </div>
        </div>
      </main>
    </>
  );
}
