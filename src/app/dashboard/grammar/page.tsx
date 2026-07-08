"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { GRAMMAR_TASKS } from "@/data/grammar-tasks";
import { shuffleOptions } from "@/lib/shuffle";
import type { Level } from "@/data/types";
import { SectionBack } from "@/components/SectionBack";
import { SectionHint } from "@/components/SectionHint";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

const T = {
  ru: { title: "Грамматика турецкого", total: "заданий", done: "пройдено", all: "Все", unfinished: "Непройденные", allLevels: "Все уровни", explanation: "Объяснение", empty: "Нет заданий по выбранным фильтрам." },
  en: { title: "Turkish grammar", total: "tasks", done: "done", all: "All", unfinished: "Unfinished", allLevels: "All levels", explanation: "Explanation", empty: "No tasks match the selected filters." },
  tr: { title: "Türkçe dil bilgisi", total: "soru", done: "tamamlandı", all: "Tümü", unfinished: "Tamamlanmamış", allLevels: "Tüm seviyeler", explanation: "Açıklama", empty: "Seçilen filtrelere uygun soru yok." },
  kk: { title: "Түрік грамматикасы", total: "тапсырма", done: "орындалды", all: "Барлығы", unfinished: "Орындалмаған", allLevels: "Барлық деңгей", explanation: "Түсіндірме", empty: "Таңдалған сүзгілерге сай тапсырма жоқ." },
};

export default function GrammarPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [level, setLevel] = useState<Level | "all">("all");
  const [onlyUnfinished, setOnlyUnfinished] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // shuffle options once per mount → correct answer lands on varying positions
  const shuffled = useMemo(() => {
    const m: Record<string, { options: string[]; answer: number }> = {};
    for (const q of GRAMMAR_TASKS) {
      const s = shuffleOptions(q.options, q.correctAnswer);
      m[q.id] = { options: s.shuffled, answer: s.newCorrectIndex };
    }
    return m;
  }, []);

  const doneCount = useMemo(
    () => GRAMMAR_TASKS.filter((q) => answers[q.id] === shuffled[q.id].answer).length,
    [answers, shuffled],
  );

  const filtered = useMemo(
    () =>
      GRAMMAR_TASKS.filter((q) => {
        const byLevel = level === "all" || q.level === level;
        const correct = answers[q.id] === shuffled[q.id].answer;
        const byStatus = !onlyUnfinished || !correct;
        return byLevel && byStatus;
      }),
    [level, onlyUnfinished, answers, shuffled],
  );

  return (
    <div>
      <SectionBack />
      <SectionHint id="grammar" />
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>

      {/* counter */}
      <div className="mt-2 text-sm text-[var(--color-muted)]">
        <span className="font-semibold text-[var(--color-brand)]">{doneCount}</span> / {GRAMMAR_TASKS.length} {c.done}
      </div>

      {/* level filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <FilterBtn active={level === "all"} onClick={() => setLevel("all")}>{c.allLevels}</FilterBtn>
        {LEVELS.map((l) => (
          <FilterBtn key={l} active={level === l} onClick={() => setLevel(l)}>{l}</FilterBtn>
        ))}
      </div>

      {/* all / unfinished */}
      <div className="mt-2 flex flex-wrap gap-2">
        <FilterBtn active={!onlyUnfinished} onClick={() => setOnlyUnfinished(false)}>{c.all}</FilterBtn>
        <FilterBtn active={onlyUnfinished} onClick={() => setOnlyUnfinished(true)}>{c.unfinished}</FilterBtn>
      </div>

      <div className="mt-3 text-sm text-[var(--color-muted)]">{filtered.length} {c.total}</div>

      {/* questions */}
      <div className="mt-3 flex flex-col gap-3">
        {filtered.map((q) => {
          const sel = answers[q.id];
          const answered = sel !== undefined;
          return (
            <div key={q.id} className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white/60 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[var(--color-muted)]">{q.topic}</span>
                <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-brand-2)]">{q.level}</span>
              </div>
              <div className="mt-2 text-sm font-medium text-[var(--color-foreground)]">{q.question}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {shuffled[q.id].options.map((opt, oi) => {
                  let cls = "border-black/[0.1] bg-black/[0.02] text-[var(--color-foreground)] hover:border-black/[0.18]";
                  if (answered && oi === shuffled[q.id].answer) cls = "border-[#16a34a] bg-[#16a34a]/[0.08]";
                  else if (answered && oi === sel) cls = "border-[#dc2626] bg-[#dc2626]/[0.06]";
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={answered}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-all disabled:cursor-default ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence initial={false}>
                {answered && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-3 rounded-xl bg-[var(--color-brand)]/[0.05] p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-brand)]">{c.explanation}</div>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--color-foreground)]">{q.explanation}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="rounded-2xl border border-black/[0.07] bg-white/60 px-5 py-8 text-center text-sm text-[var(--color-muted)]">{c.empty}</div>}
      </div>
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${active ? "bg-[var(--color-brand)]/12 text-[var(--color-brand)]" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}>
      {children}
    </button>
  );
}
