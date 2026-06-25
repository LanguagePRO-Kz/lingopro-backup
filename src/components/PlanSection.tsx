"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

type Plan = {
  id: string;
  name: string;
  range: string;
  meta: string;
  desc: string;
  minutes: number;
  perWeek: number;
  focus: string;
  bars: number[];
};

type Content = {
  title: string;
  subtitle: string;
  note: string;
  metricLoad: string;
  metricFocus: string;
  perWeekLabel: string;
  minLabel: string;
  plans: Plan[];
};

const CONTENT: { ru: Content; en: Content; tr: Content; kk: Content } = {
  ru: {
    title: "Персональный план подготовки",
    subtitle: "Любой маршрут ведёт к уровню C1. Темп и срок зависят от твоей точки старта.",
    note: "Точный срок и нагрузку AI рассчитает после диагностики",
    metricLoad: "Нагрузка в день",
    metricFocus: "Фокус недели",
    perWeekLabel: "занятий в неделю",
    minLabel: "мин",
    plans: [
      {
        id: "sprint",
        name: "Финальный рывок",
        range: "B1 → C1",
        meta: "4–6 недель · ~60 мин/день",
        desc: "Ты уже знаешь язык — осталось отточить слабые зоны и формат экзамена.",
        minutes: 60,
        perWeek: 6,
        focus: "Слабые зоны и формат TÖMER",
        bars: [80, 92, 72, 95, 85, 78, 60],
      },
      {
        id: "confident",
        name: "Уверенная подготовка",
        range: "A2 → C1",
        meta: "3–5 месяцев · ~45 мин/день",
        desc: "Системная работа над всеми навыками с фокусом на экзаменационные задания.",
        minutes: 45,
        perWeek: 5,
        focus: "Все навыки + экзаменационные задания",
        bars: [60, 55, 70, 58, 66, 50, 45],
      },
      {
        id: "scratch",
        name: "С нуля до сертификата",
        range: "A0 → C1",
        meta: "6–12 месяцев · ~30 мин/день",
        desc: "Полный курс: от алфавита до уверенного владения и сертификата TÖMER.",
        minutes: 30,
        perWeek: 4,
        focus: "От алфавита до уверенного C1",
        bars: [40, 36, 46, 38, 42, 32, 35],
      },
    ],
  },
  en: {
    title: "Personal preparation plan",
    subtitle: "Every route leads to C1. Pace and timeline depend on your starting point.",
    note: "AI will calculate the exact timeline and load after the diagnostic",
    metricLoad: "Load per day",
    metricFocus: "Focus of the week",
    perWeekLabel: "sessions per week",
    minLabel: "min",
    plans: [
      { id: "sprint", name: "Final sprint", range: "B1 → C1", meta: "4–6 weeks · ~60 min/day", desc: "You already know the language — just polish weak areas and the exam format.", minutes: 60, perWeek: 6, focus: "Weak areas & TÖMER format", bars: [80, 92, 72, 95, 85, 78, 60] },
      { id: "confident", name: "Confident prep", range: "A2 → C1", meta: "3–5 months · ~45 min/day", desc: "Systematic work on all skills with a focus on exam tasks.", minutes: 45, perWeek: 5, focus: "All skills + exam tasks", bars: [60, 55, 70, 58, 66, 50, 45] },
      { id: "scratch", name: "From zero to certificate", range: "A0 → C1", meta: "6–12 months · ~30 min/day", desc: "Full course: from the alphabet to confident fluency and a TÖMER certificate.", minutes: 30, perWeek: 4, focus: "From alphabet to confident C1", bars: [40, 36, 46, 38, 42, 32, 35] },
    ],
  },
  tr: {
    title: "Kişisel hazırlık planı",
    subtitle: "Her yol C1 seviyesine çıkar. Tempo ve süre başlangıç noktana bağlı.",
    note: "Kesin süreyi ve yükü AI tanıdan sonra hesaplar",
    metricLoad: "Günlük yük",
    metricFocus: "Haftanın odağı",
    perWeekLabel: "haftada ders",
    minLabel: "dk",
    plans: [
      { id: "sprint", name: "Son sprint", range: "B1 → C1", meta: "4–6 hafta · ~60 dk/gün", desc: "Dili zaten biliyorsun — sadece zayıf noktaları ve sınav formatını cilala.", minutes: 60, perWeek: 6, focus: "Zayıf noktalar ve TÖMER formatı", bars: [80, 92, 72, 95, 85, 78, 60] },
      { id: "confident", name: "Emin hazırlık", range: "A2 → C1", meta: "3–5 ay · ~45 dk/gün", desc: "Tüm becerilerde sınav görevlerine odaklı sistematik çalışma.", minutes: 45, perWeek: 5, focus: "Tüm beceriler + sınav görevleri", bars: [60, 55, 70, 58, 66, 50, 45] },
      { id: "scratch", name: "Sıfırdan sertifikaya", range: "A0 → C1", meta: "6–12 ay · ~30 dk/gün", desc: "Tam kurs: alfabeden akıcı kullanıma ve TÖMER sertifikasına.", minutes: 30, perWeek: 4, focus: "Alfabeden emin C1'e", bars: [40, 36, 46, 38, 42, 32, 35] },
    ],
  },
  kk: {
    title: "Жеке дайындық жоспары",
    subtitle: "Кез келген маршрут C1 деңгейіне жеткізеді. Қарқын мен мерзім бастапқы деңгейіңе байланысты.",
    note: "Нақты мерзім мен жүктемені AI диагностикадан кейін есептейді",
    metricLoad: "Күндік жүктеме",
    metricFocus: "Апта фокусы",
    perWeekLabel: "аптасына сабақ",
    minLabel: "мин",
    plans: [
      { id: "sprint", name: "Финалдық серпін", range: "B1 → C1", meta: "4–6 апта · ~60 мин/күн", desc: "Тілді білесің — тек әлсіз тұстар мен емтихан форматын жетілдіру қалды.", minutes: 60, perWeek: 6, focus: "Әлсіз тұстар және TÖMER форматы", bars: [80, 92, 72, 95, 85, 78, 60] },
      { id: "confident", name: "Сенімді дайындық", range: "A2 → C1", meta: "3–5 ай · ~45 мин/күн", desc: "Барлық дағдылар бойынша емтихан тапсырмаларына баса назар аударып жүйелі жұмыс.", minutes: 45, perWeek: 5, focus: "Барлық дағдылар + емтихан тапсырмалары", bars: [60, 55, 70, 58, 66, 50, 45] },
      { id: "scratch", name: "Нөлден сертификатқа", range: "A0 → C1", meta: "6–12 ай · ~30 мин/күн", desc: "Толық курс: әліппеден сенімді меңгеруге және TÖMER сертификатына дейін.", minutes: 30, perWeek: 4, focus: "Әліппеден сенімді C1-ге", bars: [40, 36, 46, 38, 42, 32, 35] },
    ],
  },
};

export function PlanSection() {
  const { locale } = useI18n();
  const c = pick(locale, CONTENT);
  const [active, setActive] = useState("confident");
  const plan = c.plans.find((p) => p.id === active) ?? c.plans[1];

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={c.title} subtitle={c.subtitle} />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* plan cards */}
          <Reveal className="flex flex-col gap-3">
            {c.plans.map((p) => {
              const isActive = p.id === active;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActive(p.id)}
                  className={`card-glow rounded-3xl p-5 text-left transition-all ${
                    isActive ? "border-gradient" : "glass"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base font-bold text-[var(--color-foreground)]">{p.name}</span>
                    <span className="rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-2.5 py-1 text-[11px] font-bold text-white">
                      {p.range}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-medium text-[var(--color-brand)]">{p.meta}</div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{p.desc}</p>
                </button>
              );
            })}
          </Reveal>

          {/* adaptive panel */}
          <Reveal delay={0.1}>
            <div className="glass-strong flex h-full flex-col gap-6 rounded-3xl p-7">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{c.metricLoad}</div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="mt-1 text-3xl font-bold text-[var(--color-foreground)]"
                    >
                      ~{plan.minutes}
                      <span className="text-base font-normal text-[var(--color-muted)]"> {c.minLabel}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="rounded-full bg-black/[0.04] px-3 py-1.5 text-xs text-[var(--color-muted)]">
                  {plan.perWeek} {c.perWeekLabel}
                </div>
              </div>

              <div className="flex items-end gap-2.5">
                {plan.bars.map((h, i) => (
                  <motion.div
                    key={`${active}-${i}`}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-[var(--color-brand)]/40 to-[var(--color-brand-2)]"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.5, delay: i * 0.04, ease: "easeOut" }}
                    style={{ minHeight: 8 }}
                  />
                ))}
              </div>

              <div className="h-px w-full bg-black/[0.06]" />
              <div>
                <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{c.metricFocus}</div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-1 text-base font-medium text-[var(--color-foreground)]"
                  >
                    {plan.focus}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-6 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-black/[0.04] px-4 py-2 text-sm text-[var(--color-muted)]">
            <span className="text-[var(--color-brand)]">✦</span> {c.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
