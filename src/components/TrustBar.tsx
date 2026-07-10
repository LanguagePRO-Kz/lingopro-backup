"use client";

import { motion } from "framer-motion";
import { useI18n, type Locale } from "@/lib/i18n";
import { Reveal } from "./ui/Reveal";

type Metric = { value: string; label: string };
type Content = { title: string; metrics: Metric[] };

// honest product facts only — the fake social proof («500+ студентов ·
// 94% довольных») is gone until there are real users to count
const CONTENT: Record<Locale, Content> = {
  ru: {
    title: "Платформа, построенная строго под формат TÖMER",
    metrics: [
      { value: "A1 → C1", label: "полный диапазон уровней TÖMER" },
      { value: "~15 мин", label: "на AI-диагностику уровня" },
      { value: "24/7", label: "AI-преподаватель на связи" },
      { value: "5 навыков", label: "оцениваются с самого старта" },
    ],
  },
  kk: {
    title: "TÖMER форматына арнайы құрылған платформа",
    metrics: [
      { value: "A1 → C1", label: "TÖMER деңгейлерінің толық ауқымы" },
      { value: "~15 мин", label: "AI деңгей диагностикасына" },
      { value: "24/7", label: "AI-мұғалім байланыста" },
      { value: "5 дағды", label: "ең басынан бағаланады" },
    ],
  },
  en: {
    title: "A platform built strictly around the TÖMER format",
    metrics: [
      { value: "A1 → C1", label: "full range of TÖMER levels" },
      { value: "~15 min", label: "for the AI level diagnostic" },
      { value: "24/7", label: "AI tutor available" },
      { value: "5 skills", label: "assessed from the very start" },
    ],
  },
  tr: {
    title: "TÖMER formatına göre inşa edilmiş platform",
    metrics: [
      { value: "A1 → C1", label: "TÖMER seviyelerinin tamamı" },
      { value: "~15 dk", label: "AI seviye tanısı için" },
      { value: "7/24", label: "AI öğretmen erişilebilir" },
      { value: "5 beceri", label: "en baştan değerlendirilir" },
    ],
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

      </Reveal>
    </section>
  );
}
