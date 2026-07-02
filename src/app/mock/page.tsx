"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { useExam } from "@/lib/exam-context";
import { GRAMMAR, VOCAB, READING, READING_TEXT, levelFromScore, type MCQuestion } from "@/lib/quiz";
import { pluralize } from "@/lib/localized";

type Section = { name: string; minutes: number; questions: MCQuestion[] };

const SECTIONS: Section[] = [
  { name: "Грамматика", minutes: 10, questions: GRAMMAR },
  { name: "Чтение", minutes: 15, questions: READING },
  { name: "Лексика", minutes: 8, questions: VOCAB },
];

const TOTAL = SECTIONS.reduce((s, sec) => s + sec.questions.length, 0);

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Phase = "intro" | "section" | "done";

export default function MockPage() {
  const { exam } = useExam();
  const [phase, setPhase] = useState<Phase>("intro");
  const [sIdx, setSIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);

  const section = SECTIONS[sIdx];

  // (re)start the countdown whenever we enter a section
  useEffect(() => {
    if (phase !== "section") return;
    setSecondsLeft(SECTIONS[sIdx].minutes * 60);
  }, [phase, sIdx]);

  // tick
  useEffect(() => {
    if (phase !== "section") return;
    if (secondsLeft <= 0) {
      advanceSection();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase]);

  function advanceSection() {
    if (sIdx + 1 >= SECTIONS.length) {
      setPhase("done");
    } else {
      setSIdx((s) => s + 1);
      setQIdx(0);
    }
  }

  function choose(i: number) {
    setPicked((p) => ({ ...p, [`${sIdx}-${qIdx}`]: i }));
  }

  function nextQuestion() {
    if (qIdx + 1 >= section.questions.length) {
      advanceSection();
    } else {
      setQIdx((q) => q + 1);
    }
  }

  /* ------------------------------- Intro ------------------------------- */
  if (phase === "intro") {
    return (
      <PageShell>
        <div className="glass-strong w-full max-w-lg rounded-3xl p-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-2xl">
            📝
          </div>
          <h1 className="text-center text-2xl font-bold tracking-tight">Пробный экзамен {exam.name}</h1>
          <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
            Симуляция в формате экзамена. Для каждой секции — отдельный таймер.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {SECTIONS.map((s, i) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-2xl border border-black/[0.06] bg-black/[0.02] px-4 py-3"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-[var(--color-foreground)]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-brand)]/[0.1] text-xs font-bold text-[var(--color-brand)]">
                    {i + 1}
                  </span>
                  {s.name}
                </span>
                <span className="text-xs text-[var(--color-muted)]">
                  {s.questions.length} {pluralize(s.questions.length, "вопрос", "вопроса", "вопросов")} · {s.minutes} мин
                </span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-center text-xs leading-relaxed text-[var(--color-muted)]">
            Тренировочные задания на основе экзаменационных материалов и стандартов оценки TÖMER. LingoPRO —
            официальный партнёр TÖMER.
          </p>

          <button
            type="button"
            onClick={() => setPhase("section")}
            className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 text-sm"
          >
            Начать пробный экзамен
          </button>
        </div>
      </PageShell>
    );
  }

  /* -------------------------------- Done ------------------------------- */
  if (phase === "done") {
    let correct = 0;
    const perSection = SECTIONS.map((s, si) => {
      const c = s.questions.reduce((acc, q, qi) => acc + (picked[`${si}-${qi}`] === q.answer ? 1 : 0), 0);
      correct += c;
      return { name: s.name, correct: c, total: s.questions.length };
    });
    const percent = Math.round((correct / TOTAL) * 100);
    const level = levelFromScore(percent);

    return (
      <PageShell>
        <div className="glass-strong w-full max-w-lg rounded-3xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand-2)] to-[var(--color-brand)] text-2xl text-white">
            ✓
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Пробный экзамен завершён</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Вот предварительный разбор результата.</p>

          <div className="mt-6 flex items-center justify-center gap-6">
            <div>
              <div className="text-4xl font-bold text-gradient">{level}</div>
              <div className="text-xs text-[var(--color-muted)]">уровень</div>
            </div>
            <div className="h-10 w-px bg-black/[0.08]" />
            <div>
              <div className="text-4xl font-bold text-[var(--color-foreground)]">{percent}%</div>
              <div className="text-xs text-[var(--color-muted)]">{correct} из {TOTAL} верно</div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 text-left">
            {perSection.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-xl bg-black/[0.03] px-4 py-2.5 text-sm">
                <span className="text-[var(--color-foreground)]">{s.name}</span>
                <span className="font-medium text-[var(--color-muted)]">
                  {s.correct} / {s.total}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary flex-1 rounded-full px-6 py-3.5 text-center text-sm">
              Начать подготовку
            </Link>
            <Link href="/dashboard" className="btn-ghost flex-1 rounded-full px-6 py-3.5 text-center text-sm font-medium">
              В личный кабинет
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  /* ------------------------------ Section ------------------------------ */
  const q = section.questions[qIdx];
  const key = `${sIdx}-${qIdx}`;
  const selected = picked[key];
  const low = secondsLeft <= 30;

  return (
    <PageShell>
      <div className="w-full max-w-2xl">
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <span className="rounded-full bg-[var(--color-brand)]/[0.1] px-3 py-1 text-xs font-medium text-[var(--color-brand)]">
              Секция {sIdx + 1}/{SECTIONS.length} · {section.name}
            </span>
            <span
              className={`flex items-center gap-1.5 text-sm font-semibold ${
                low ? "text-[var(--color-red)]" : "text-[var(--color-foreground)]"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${low ? "animate-ping bg-[var(--color-red)]" : "bg-[var(--color-brand-2)]"}`} />
              {fmt(secondsLeft)}
            </span>
          </div>

          <div className="mb-5 flex gap-1.5">
            {section.questions.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < qIdx ? "bg-[var(--color-brand)]" : i === qIdx ? "bg-[var(--color-brand)]/50" : "bg-black/[0.06]"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={key}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
            >
              {section.name === "Чтение" && (
                <p className="mb-3 rounded-2xl bg-black/[0.03] px-4 py-3 text-sm leading-relaxed text-[var(--color-foreground)]">
                  {READING_TEXT}
                </p>
              )}
              <h2 className="text-lg font-semibold text-[var(--color-foreground)] sm:text-xl">{q.prompt}</h2>
              <div className="mt-5 grid gap-3">
                {(q.options ?? q.opts?.ru ?? []).map((opt, i) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => choose(i)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                      selected === i
                        ? "border-[var(--color-brand)] bg-[var(--color-brand)]/[0.1] text-[var(--color-foreground)]"
                        : "border-black/[0.07] bg-black/[0.02] text-[var(--color-foreground)] hover:border-black/[0.14]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={nextQuestion}
            disabled={selected === undefined}
            className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            {qIdx + 1 >= section.questions.length
              ? sIdx + 1 >= SECTIONS.length
                ? "Завершить экзамен"
                : "Следующая секция"
              : "Далее"}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
