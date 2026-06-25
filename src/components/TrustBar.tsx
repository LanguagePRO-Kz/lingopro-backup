"use client";

import { motion } from "framer-motion";
import { useI18n, type Locale } from "@/lib/i18n";
import { Reveal } from "./ui/Reveal";

type Metric = { value: string; label: string };
type Content = { title: string; metrics: Metric[]; countries: { flag: string; name: string }[]; more: string };

const CONTENT: Record<Locale, Content> = {
  ru: {
    title: "Создано для студентов, поступающих в университеты Турции",
    metrics: [
      { value: "A1 → C1", label: "полный диапазон уровней TÖMER" },
      { value: "~15 мин", label: "на AI-диагностику уровня" },
      { value: "30·60·90", label: "дней персонального плана" },
      { value: "5 навыков", label: "оцениваются с самого старта" },
    ],
    countries: [
      { flag: "🇰🇿", name: "Казахстан" },
      { flag: "🇺🇿", name: "Узбекистан" },
      { flag: "🇰🇬", name: "Кыргызстан" },
      { flag: "🇦🇿", name: "Азербайджан" },
    ],
    more: "и другие страны",
  },
  kk: {
    title: "Түркия университеттеріне түсетін студенттерге арналған",
    metrics: [
      { value: "A1 → C1", label: "TÖMER деңгейлерінің толық ауқымы" },
      { value: "~15 мин", label: "AI деңгей диагностикасына" },
      { value: "30·60·90", label: "жеке жоспар күндері" },
      { value: "5 дағды", label: "ең басынан бағаланады" },
    ],
    countries: [
      { flag: "🇰🇿", name: "Қазақстан" },
      { flag: "🇺🇿", name: "Өзбекстан" },
      { flag: "🇰🇬", name: "Қырғызстан" },
      { flag: "🇦🇿", name: "Әзербайжан" },
    ],
    more: "және басқа елдер",
  },
  en: {
    title: "Built for students applying to universities in Türkiye",
    metrics: [
      { value: "A1 → C1", label: "full range of TÖMER levels" },
      { value: "~15 min", label: "for the AI level diagnostic" },
      { value: "30·60·90", label: "days of a personal plan" },
      { value: "5 skills", label: "assessed from the very start" },
    ],
    countries: [
      { flag: "🇰🇿", name: "Kazakhstan" },
      { flag: "🇺🇿", name: "Uzbekistan" },
      { flag: "🇰🇬", name: "Kyrgyzstan" },
      { flag: "🇦🇿", name: "Azerbaijan" },
    ],
    more: "and other countries",
  },
  tr: {
    title: "Türkiye'deki üniversitelere başvuran öğrenciler için tasarlandı",
    metrics: [
      { value: "A1 → C1", label: "TÖMER seviyelerinin tamamı" },
      { value: "~15 dk", label: "AI seviye tanısı için" },
      { value: "30·60·90", label: "kişisel plan günü" },
      { value: "5 beceri", label: "en baştan değerlendirilir" },
    ],
    countries: [
      { flag: "🇰🇿", name: "Kazakistan" },
      { flag: "🇺🇿", name: "Özbekistan" },
      { flag: "🇰🇬", name: "Kırgızistan" },
      { flag: "🇦🇿", name: "Azerbaycan" },
    ],
    more: "ve diğer ülkeler",
  },
};

export function TrustBar() {
  const { locale } = useI18n();
  const c = CONTENT[locale];

  return (
    <section className="px-4 py-10 sm:py-14">
      <Reveal className="mx-auto max-w-6xl">
        <p className="text-center text-sm font-medium uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {c.title}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {c.metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <div className="text-2xl font-bold tracking-tight text-[var(--color-foreground)] sm:text-3xl">
                {m.value}
              </div>
              <div className="mt-1.5 text-xs leading-snug text-[var(--color-muted)]">{m.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {c.countries.map((country) => (
            <span
              key={country.name}
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/70 px-3.5 py-1.5 text-sm text-[var(--color-foreground)]"
            >
              <span className="text-base leading-none">{country.flag}</span>
              {country.name}
            </span>
          ))}
          <span className="text-sm text-[var(--color-muted)]">{c.more}</span>
        </div>
      </Reveal>
    </section>
  );
}
