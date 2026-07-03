"use client";

import { motion } from "framer-motion";
import { useI18n, type Locale } from "@/lib/i18n";
import { Reveal } from "./ui/Reveal";

type Metric = { value: string; label: string };
type Content = { title: string; metrics: Metric[]; social: string };

const CONTENT: Record<Locale, Content> = {
  ru: {
    title: "Нам доверяют студенты, готовящиеся к TÖMER по всему миру",
    metrics: [
      { value: "A1 → C1", label: "полный диапазон уровней TÖMER" },
      { value: "~15 мин", label: "на AI-диагностику уровня" },
      { value: "30·60·90", label: "дней персонального плана" },
      { value: "5 навыков", label: "оцениваются с самого старта" },
    ],
    social: "500+ студентов · 12 стран · 94% довольных",
  },
  kk: {
    title: "Бүкіл әлемде TÖMER-ге дайындалатын студенттер бізге сенеді",
    metrics: [
      { value: "A1 → C1", label: "TÖMER деңгейлерінің толық ауқымы" },
      { value: "~15 мин", label: "AI деңгей диагностикасына" },
      { value: "30·60·90", label: "жеке жоспар күндері" },
      { value: "5 дағды", label: "ең басынан бағаланады" },
    ],
    social: "500+ студент · 12 ел · 94% қанағаттану деңгейі",
  },
  en: {
    title: "Trusted by students preparing for TÖMER worldwide",
    metrics: [
      { value: "A1 → C1", label: "full range of TÖMER levels" },
      { value: "~15 min", label: "for the AI level diagnostic" },
      { value: "30·60·90", label: "days of a personal plan" },
      { value: "5 skills", label: "assessed from the very start" },
    ],
    social: "500+ students · 12 countries · 94% satisfaction rate",
  },
  tr: {
    title: "Dünya genelinde TÖMER'e hazırlanan öğrenciler bize güveniyor",
    metrics: [
      { value: "A1 → C1", label: "TÖMER seviyelerinin tamamı" },
      { value: "~15 dk", label: "AI seviye tanısı için" },
      { value: "30·60·90", label: "kişisel plan günü" },
      { value: "5 beceri", label: "en baştan değerlendirilir" },
    ],
    social: "500+ öğrenci · 12 ülke · %94 memnuniyet oranı",
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

        {/* social proof — mock figures, international */}
        <p className="mt-8 text-center text-xs text-[var(--color-muted)]">{c.social}</p>
      </Reveal>
    </section>
  );
}
