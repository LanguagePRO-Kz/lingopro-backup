"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { READING_TASKS } from "@/data/reading-tasks";
import type { Level, ReadingTask } from "@/data/types";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

const T = {
  ru: { title: "Тренировка чтения", back: "К текстам", correct: "Верно!", wrong: "Неверно", answer: "Правильный ответ", explanation: "Объяснение", questions: "вопросов", synonyms: "Синонимы", done: "пройдено", all: "Все", unfinished: "Непройденные", allLevels: "Все уровни", empty: "Нет текстов по выбранным фильтрам." },
  en: { title: "Reading practice", back: "To texts", correct: "Correct!", wrong: "Wrong", answer: "Correct answer", explanation: "Explanation", questions: "questions", synonyms: "Synonyms", done: "done", all: "All", unfinished: "Unfinished", allLevels: "All levels", empty: "No texts match the selected filters." },
  tr: { title: "Okuma pratiği", back: "Metinlere dön", correct: "Doğru!", wrong: "Yanlış", answer: "Doğru cevap", explanation: "Açıklama", questions: "soru", synonyms: "Eş anlamlılar", done: "tamamlandı", all: "Tümü", unfinished: "Tamamlanmamış", allLevels: "Tüm seviyeler", empty: "Seçilen filtrelere uygun metin yok." },
  kk: { title: "Оқу жаттығуы", back: "Мәтіндерге", correct: "Дұрыс!", wrong: "Қате", answer: "Дұрыс жауап", explanation: "Түсіндірме", questions: "сұрақ", synonyms: "Синонимдер", done: "орындалды", all: "Барлығы", unfinished: "Орындалмаған", allLevels: "Барлық деңгей", empty: "Таңдалған сүзгілерге сай мәтін жоқ." },
};

export default function ReadingPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [level, setLevel] = useState<Level | "all">("all");
  const [onlyUnfinished, setOnlyUnfinished] = useState(false);
  const [active, setActive] = useState<ReadingTask | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const isDone = useMemo(
    () => (t: ReadingTask) => t.questions.every((q) => answers[q.id] === q.correctAnswer),
    [answers],
  );

  const doneCount = useMemo(() => READING_TASKS.filter(isDone).length, [isDone]);

  const list = useMemo(
    () =>
      READING_TASKS.filter((t) => {
        const byLevel = level === "all" || t.level === level;
        const byStatus = !onlyUnfinished || !isDone(t);
        return byLevel && byStatus;
      }),
    [level, onlyUnfinished, isDone],
  );

  if (active) return <Reader text={active} c={c} answers={answers} setAnswers={setAnswers} onBack={() => setActive(null)} />;

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>
      <div className="mt-2 text-sm text-[var(--color-muted)]">
        <span className="font-semibold text-[var(--color-brand)]">{doneCount}</span> / {READING_TASKS.length} {c.done}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <FilterBtn active={level === "all"} onClick={() => setLevel("all")}>{c.allLevels}</FilterBtn>
        {LEVELS.map((l) => (
          <FilterBtn key={l} active={level === l} onClick={() => setLevel(l)}>{l}</FilterBtn>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <FilterBtn active={!onlyUnfinished} onClick={() => setOnlyUnfinished(false)}>{c.all}</FilterBtn>
        <FilterBtn active={onlyUnfinished} onClick={() => setOnlyUnfinished(true)}>{c.unfinished}</FilterBtn>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {list.map((t) => (
          <button key={t.id} type="button" onClick={() => setActive(t)} className="glass flex items-center justify-between rounded-2xl p-4 text-left transition-shadow hover:shadow-md">
            <span className="flex items-center gap-3">
              <span className="text-lg">{isDone(t) ? "✅" : "📖"}</span>
              <span className="text-sm font-medium text-[var(--color-foreground)]">{t.title}</span>
            </span>
            <span className="text-xs text-[var(--color-muted)]">{t.level} · {t.questions.length} {c.questions}</span>
          </button>
        ))}
        {list.length === 0 && <div className="rounded-2xl border border-black/[0.07] bg-white/60 px-5 py-8 text-center text-sm text-[var(--color-muted)]">{c.empty}</div>}
      </div>
    </div>
  );
}

function Reader({ text, c, answers, setAnswers, onBack }: { text: ReadingTask; c: (typeof T)["ru"]; answers: Record<string, number>; setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>; onBack: () => void }) {
  return (
    <div>
      <button type="button" onClick={onBack} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">← {c.back}</button>

      <div className="glass mt-4 rounded-3xl p-6">
        <h2 className="text-lg font-bold text-[var(--color-foreground)]">{text.title}</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--color-foreground)]">{text.text}</p>
        {text.synonyms && text.synonyms.length > 0 && (
          <div className="mt-4 rounded-xl bg-black/[0.03] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-brand-2)]">{c.synonyms}</div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-muted)]">
              {text.synonyms.map((s) => (
                <span key={s.word}>{s.word} → {s.synonym}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {text.questions.map((q) => {
          const sel = answers[q.id];
          const answered = sel !== undefined;
          return (
            <div key={q.id} className="glass rounded-2xl p-5">
              <div className="text-sm font-semibold text-[var(--color-foreground)]">{q.question}</div>
              <div className="mt-3 grid gap-2">
                {q.options.map((opt, oi) => {
                  let cls = "border-black/[0.08] bg-black/[0.02] text-[var(--color-foreground)] hover:border-black/[0.16]";
                  if (answered && oi === q.correctAnswer) cls = "border-[#16a34a] bg-[#16a34a]/[0.08]";
                  else if (answered && oi === sel) cls = "border-[#dc2626] bg-[#dc2626]/[0.06]";
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={answered}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className={`rounded-xl border px-4 py-2.5 text-left text-sm transition-all disabled:cursor-default ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs">
                  <div className="font-medium">
                    {sel === q.correctAnswer ? (
                      <span className="text-[#16a34a]">✅ {c.correct}</span>
                    ) : (
                      <span className="text-[#dc2626]">❌ {c.wrong} · {c.answer}: {q.options[q.correctAnswer]}</span>
                    )}
                  </div>
                  <p className="mt-1 leading-relaxed text-[var(--color-muted)]">{q.explanation}</p>
                </motion.div>
              )}
            </div>
          );
        })}
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
