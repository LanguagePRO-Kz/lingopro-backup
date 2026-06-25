"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

type SkillId = "reading" | "listening" | "writing" | "speaking" | "grammar";

const SKILLS: { id: SkillId; emoji: string; count: number; min: number; href: string }[] = [
  { id: "reading", emoji: "📖", count: 15, min: 15, href: "/dashboard/reading" },
  { id: "listening", emoji: "🎧", count: 15, min: 15, href: "/dashboard/listening" },
  { id: "writing", emoji: "✍️", count: 10, min: 10, href: "/dashboard/writing" },
  { id: "speaking", emoji: "🎤", count: 10, min: 10, href: "/dashboard/speaking" },
  { id: "grammar", emoji: "📝", count: 20, min: 15, href: "/dashboard/grammar" },
];

// demo results (skill -> test number -> level)
const RESULTS: Partial<Record<SkillId, Record<number, string>>> = {
  reading: { 1: "B1" },
  grammar: { 2: "A2" },
};

const T = {
  ru: {
    title: "Пробные тесты TÖMER", sub: "Выберите тип теста и начните практику",
    all: "Все", unfinished: "Только непройденные",
    random: "Случайный тест", randomHint: "Сначала непройденные, затем давно пройденные", randomStart: "Начать",
    test: "Тест", startTest: "Начать тест", result: "Результат", min: "мин",
    names: { reading: "Чтение", listening: "Аудир.", writing: "Письмо", speaking: "Говор.", grammar: "Грамм." },
    full: { reading: "Чтение", listening: "Аудирование", writing: "Письмо", speaking: "Говорение", grammar: "Грамматика" },
  },
  en: {
    title: "Mock TÖMER tests", sub: "Pick a test type and start practising",
    all: "All", unfinished: "Unfinished only",
    random: "Random test", randomHint: "Unfinished first, then long unattempted", randomStart: "Start",
    test: "Test", startTest: "Start test", result: "Result", min: "min",
    names: { reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking", grammar: "Grammar" },
    full: { reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking", grammar: "Grammar" },
  },
  tr: {
    title: "Deneme TÖMER testleri", sub: "Bir test türü seç ve pratiğe başla",
    all: "Tümü", unfinished: "Sadece tamamlanmamış",
    random: "Rastgele test", randomHint: "Önce tamamlanmamış, sonra eski", randomStart: "Başla",
    test: "Test", startTest: "Teste başla", result: "Sonuç", min: "dk",
    names: { reading: "Okuma", listening: "Dinleme", writing: "Yazma", speaking: "Konuşma", grammar: "Dil bilgisi" },
    full: { reading: "Okuma", listening: "Dinleme", writing: "Yazma", speaking: "Konuşma", grammar: "Dil bilgisi" },
  },
  kk: {
    title: "Сынақ TÖMER тесттері", sub: "Тест түрін таңда да практиканы баста",
    all: "Барлығы", unfinished: "Тек аяқталмаған",
    random: "Кездейсоқ тест", randomHint: "Алдымен аяқталмаған, сосын ескілер", randomStart: "Бастау",
    test: "Тест", startTest: "Тестті бастау", result: "Нәтиже", min: "мин",
    names: { reading: "Оқу", listening: "Тыңд.", writing: "Жазу", speaking: "Сөйлеу", grammar: "Грамм." },
    full: { reading: "Оқу", listening: "Тыңдалым", writing: "Жазу", speaking: "Сөйлеу", grammar: "Грамматика" },
  },
};

export default function MockPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [tab, setTab] = useState<SkillId>("reading");
  const [onlyUnfinished, setOnlyUnfinished] = useState(false);

  const skill = SKILLS.find((s) => s.id === tab)!;
  const tests = useMemo(() => {
    const arr = Array.from({ length: 5 }, (_, i) => {
      const num = i + 1;
      return { num, result: RESULTS[tab]?.[num] };
    });
    return onlyUnfinished ? arr.filter((t) => !t.result) : arr;
  }, [tab, onlyUnfinished]);

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{c.sub}</p>

      {/* skill tabs */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SKILLS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setTab(s.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === s.id ? "bg-[var(--color-brand)] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"
            }`}
          >
            <span>{s.emoji}</span>
            {c.names[s.id]} <span className={tab === s.id ? "text-white/70" : "opacity-60"}>({s.count})</span>
          </button>
        ))}
      </div>

      {/* filters */}
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => setOnlyUnfinished(false)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!onlyUnfinished ? "bg-[var(--color-brand)]/12 text-[var(--color-brand)]" : "bg-black/[0.05] text-[var(--color-muted)]"}`}>
          {c.all}
        </button>
        <button type="button" onClick={() => setOnlyUnfinished(true)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${onlyUnfinished ? "bg-[var(--color-brand)]/12 text-[var(--color-brand)]" : "bg-black/[0.05] text-[var(--color-muted)]"}`}>
          {c.unfinished}
        </button>
      </div>

      {/* random test */}
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-[var(--color-brand)]/30 bg-gradient-to-br from-[var(--color-brand)]/[0.06] to-[var(--color-brand-2)]/[0.06] p-5">
        <div>
          <div className="text-sm font-semibold text-[var(--color-foreground)]">🔀 {c.random}</div>
          <div className="mt-0.5 text-xs text-[var(--color-muted)]">{c.randomHint}</div>
        </div>
        <Link href={skill.href} className="btn-primary shrink-0 rounded-full px-5 py-2.5 text-sm">
          🔀 {c.randomStart}
        </Link>
      </div>

      {/* tests grid */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tests.map((t) => (
          <motion.div key={t.num} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Link href={skill.href} className="glass card-glow flex h-full flex-col rounded-2xl p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand)]/10 text-xl">{skill.emoji}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-sm text-[var(--color-brand)]">▶</span>
              </div>
              <div className="mt-3 text-sm font-semibold text-[var(--color-foreground)]">
                TÖMER · {c.full[tab]} · {c.test} {t.num}
              </div>
              <div className="mt-1 text-xs text-[var(--color-muted)]">~{skill.min} {c.min}</div>
              <div className="mt-3">
                {t.result ? (
                  <span className="rounded-full bg-[#16a34a]/12 px-3 py-1 text-xs font-semibold text-[#16a34a]">{c.result}: {t.result}</span>
                ) : (
                  <span className="rounded-full bg-black/[0.05] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">{c.startTest}</span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
