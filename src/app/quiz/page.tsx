"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { useExam } from "@/lib/exam-context";
import { useI18n, type Locale } from "@/lib/i18n";
import { EXAM_LIST, examLang } from "@/lib/exams";
import {
  GRAMMAR,
  VOCAB,
  READING,
  READING_TEXT,
  WRITING,
  SPEAKING,
  MODULES,
  type MCQuestion,
  type Localized,
  type ModuleId,
  computeResult,
  saveResult,
  saveProgress,
  loadProgress,
  clearProgress,
  scoreMC,
  scoreWriting,
  scoreSpeakingAnswer,
  scoreSpeakingDuration,
  countWords,
  qt,
  type AnswerRecord,
  type QuizTKey,
} from "@/lib/quiz";
import { saveProfileResult } from "@/lib/profile";
import { stashExamPlan } from "@/lib/exam-plan";
import { createClient } from "@/lib/supabase/client";
import { permutation, applyPerm } from "@/lib/shuffle";

/** Shuffle a diagnostic question's options (both universal + localized) once. */
function shuffleMC(q: MCQuestion): MCQuestion {
  const len = (q.options ?? q.opts?.ru ?? []).length;
  if (len < 2) return q;
  const perm = permutation(len);
  const opts = q.opts
    ? (Object.fromEntries(Object.entries(q.opts).map(([k, v]) => [k, applyPerm(v, perm)])) as MCQuestion["opts"])
    : undefined;
  return {
    ...q,
    options: q.options ? applyPerm(q.options, perm) : q.options,
    opts,
    answer: perm.indexOf(q.answer),
  };
}
import { PostQuizAuth } from "@/components/PostQuizAuth";

/* ------------------------------- Speech (TTS) ----------------------------- */
/** Speak Turkish text a touch slower than normal; `onEnd` fires when done. */
function speakTr(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "tr-TR";
  u.rate = 0.85;
  if (onEnd) {
    u.onend = onEnd;
    u.onerror = onEnd;
  }
  window.speechSynthesis.speak(u);
}

function micSupported() {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined"
  );
}

type SpeakStatus = "speaking" | "ready" | "recording" | "processing" | "saved";

/* -------------------------------- Helpers -------------------------------- */
function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Phase = "onboarding" | "transition" | "module" | "signup";

const SELF_LEVELS: { id: string; label: QuizTKey; hint: string }[] = [
  { id: "a1", label: "lvBeginner", hint: "A0–A1" },
  { id: "a2", label: "lvBasic", hint: "A2" },
  { id: "b1", label: "lvMid", hint: "B1" },
  { id: "b2", label: "lvAdvanced", hint: "B2+" },
  { id: "unknown", label: "lvUnknown", hint: "" },
];
const TIMELINES: QuizTKey[] = ["tl1", "tl3", "tl6", "tlOpen"];

export default function QuizPage() {
  const router = useRouter();
  const { exam, openWaitlist } = useExam();
  const { locale } = useI18n();

  const [phase, setPhase] = useState<Phase>("onboarding");
  const [onbStep, setOnbStep] = useState(0);
  const [, setLevelSelf] = useState<string | null>(null);
  const [targetLevel, setTargetLevel] = useState<"B2" | "C1">("B2");
  const [showDatePick, setShowDatePick] = useState(false);
  const [examDate, setExamDate] = useState("");

  // index into MODULES (0..4); transition shows "module {idx} done → next"
  const [moduleIdx, setModuleIdx] = useState(0);
  const [scores, setScores] = useState<Partial<Record<ModuleId, number>>>({});
  const [writingWords, setWritingWords] = useState(0);
  // per-question answers across modules (honest breakdown + mastery seeding);
  // a mid-quiz refresh loses earlier modules' records — the result degrades
  // to module-level analysis for those, which the UI handles honestly
  const answerLogRef = useRef<AnswerRecord[]>([]);
  // guards the progress-save effect from re-writing a snapshot once the quiz
  // is finished (the async getUser() below yields a render mid-teardown)
  const doneRef = useRef(false);

  const hint = useCallback(
    (l: Localized | undefined) => (l && locale !== "tr" ? l[locale] || l.ru : null),
    [locale],
  );

  /** A module reports its 0–100 score and we advance the flow. */
  const finishModule = useCallback(
    async (score: number, meta?: { words?: number; records?: AnswerRecord[] }) => {
      const id = MODULES[moduleIdx].id;
      const nextScores = { ...scores, [id]: score };
      setScores(nextScores);
      const words = meta?.words ?? writingWords;
      if (meta?.words !== undefined) setWritingWords(meta.words);
      if (meta?.records?.length) answerLogRef.current = [...answerLogRef.current, ...meta.records];

      if (moduleIdx + 1 >= MODULES.length) {
        doneRef.current = true; // block any further progress snapshots
        const result = computeResult(nextScores as Record<ModuleId, number>, {
          writingWords: words,
          answers: answerLogRef.current,
        });
        saveResult(result); // anonymous cache — survives the sign-up hop
        clearProgress(); // quiz is done; drop the in-progress snapshot

        const {
          data: { user },
        } = await createClient().auth.getUser();

        if (user) {
          // already signed in → persist and show the result immediately
          void saveProfileResult(result);
          router.push("/quiz/result");
        } else {
          // guest → the one and only sign-up gate, then /quiz/result
          setPhase("signup");
        }
        return;
      }
      setPhase("transition");
    },
    [moduleIdx, scores, router, writingWords],
  );

  function continueFromTransition() {
    setModuleIdx((i) => i + 1);
    setPhase("module");
  }

  // ── refresh-safe progress ──────────────────────────────────────────────
  // Restore the coarse snapshot on mount (before the save effect can run),
  // then persist it whenever the flow advances. The active module restarts
  // from its first question; completed-module scores are preserved.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const p = loadProgress();
    if (p) {
      setOnbStep(p.onbStep);
      setModuleIdx(p.moduleIdx);
      setScores(p.scores);
      setWritingWords(p.writingWords);
      setPhase(p.phase);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || doneRef.current) return;
    if (phase === "onboarding" || phase === "module" || phase === "transition") {
      saveProgress({ phase, onbStep, moduleIdx, scores, writingWords });
    }
  }, [hydrated, phase, onbStep, moduleIdx, scores, writingWords]);

  /* ------------------------------ Onboarding ----------------------------- */
  if (phase === "onboarding") {
    return (
      <PageShell>
        <div className="w-full max-w-xl">
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-xs text-[var(--color-muted)]">
              <span>{qt(locale, "step")} {onbStep + 1} / 4</span>
              <span>{Math.round(((onbStep + 1) / 4) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
                animate={{ width: `${((onbStep + 1) / 4) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={onbStep}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="glass-strong rounded-3xl p-7 sm:p-8"
            >
              {onbStep === 0 && (
                <>
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{qt(locale, "onbExam")}</h1>
                  <div className="mt-5 grid gap-3">
                    {EXAM_LIST.map((e) => {
                      const active = e.status === "active";
                      return (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => (active ? setOnbStep(1) : openWaitlist(e.id))}
                          className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                            active
                              ? "border-[var(--color-brand)]/40 bg-[var(--color-brand)]/[0.06] hover:border-[var(--color-brand)]"
                              : "border-black/[0.07] bg-black/[0.02] hover:border-black/[0.14]"
                          }`}
                        >
                          <span className="text-xl">{e.flag}</span>
                          <span className="flex flex-col">
                            <span className="text-sm font-semibold text-[var(--color-foreground)]">{e.name}</span>
                            <span className="text-xs text-[var(--color-muted)]">{examLang(e, locale)}</span>
                          </span>
                          <span
                            className={`ml-auto rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                              active
                                ? "bg-[var(--color-brand-2)]/15 text-[var(--color-brand-2)]"
                                : "bg-black/[0.05] text-[var(--color-muted)]"
                            }`}
                          >
                            {active ? qt(locale, "choose") : qt(locale, "soon")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {onbStep === 1 && (
                <>
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{qt(locale, "onbLevel")}</h1>
                  <div className="mt-5 grid gap-3">
                    {SELF_LEVELS.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          setLevelSelf(l.id);
                          setOnbStep(2);
                        }}
                        className="flex items-center justify-between rounded-2xl border border-black/[0.07] bg-black/[0.02] px-4 py-3.5 text-left text-sm transition-all hover:border-[var(--color-brand)]/60 hover:bg-[var(--color-brand)]/[0.05]"
                      >
                        <span className="font-medium text-[var(--color-foreground)]">{qt(locale, l.label)}</span>
                        {l.hint && <span className="text-xs text-[var(--color-muted)]">{l.hint}</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {onbStep === 2 && (
                <>
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{qt(locale, "onbGoal")}</h1>
                  <div className="mt-5 grid gap-3">
                    {(["B2", "C1"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setTargetLevel(g);
                          setOnbStep(3);
                        }}
                        className="flex items-center justify-between rounded-2xl border border-black/[0.07] bg-black/[0.02] px-4 py-3.5 text-left transition-all hover:border-[var(--color-brand)]/60 hover:bg-[var(--color-brand)]/[0.05]"
                      >
                        <span className="flex flex-col">
                          <span className="text-base font-bold text-[var(--color-foreground)]">{g}</span>
                          <span className="text-xs text-[var(--color-muted)]">{qt(locale, g === "B2" ? "goalB2" : "goalC1")}</span>
                        </span>
                        <span className="rounded-full bg-[var(--color-brand)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-brand)]">
                          {qt(locale, "goalThreshold")}: {g === "B2" ? 60 : 75}/100
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {onbStep === 3 && (
                <>
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {qt(locale, "onbWhen")} {exam.name}?
                  </h1>
                  <div className="mt-5 grid gap-3">
                    {TIMELINES.map((tl) => (
                      <button
                        key={tl}
                        type="button"
                        onClick={() => {
                          stashExamPlan({
                            targetLevel,
                            examDateMode: tl === "tlOpen" ? "unknown" : "approx",
                            examHorizonMonths: tl === "tl1" ? 1 : tl === "tl3" ? 3 : tl === "tl6" ? 6 : undefined,
                          });
                          setPhase("module");
                        }}
                        className="rounded-2xl border border-black/[0.07] bg-black/[0.02] px-4 py-3.5 text-left text-sm font-medium text-[var(--color-foreground)] transition-all hover:border-[var(--color-brand)]/60 hover:bg-[var(--color-brand)]/[0.05]"
                      >
                        {qt(locale, tl)}
                      </button>
                    ))}

                    {!showDatePick ? (
                      <button
                        type="button"
                        onClick={() => setShowDatePick(true)}
                        className="rounded-2xl border border-[var(--color-brand)]/40 bg-[var(--color-brand)]/[0.05] px-4 py-3.5 text-left text-sm font-semibold text-[var(--color-brand)] transition-all hover:border-[var(--color-brand)]"
                      >
                        📅 {qt(locale, "tlExact")}
                      </button>
                    ) : (
                      <div className="rounded-2xl border border-[var(--color-brand)]/40 bg-[var(--color-brand)]/[0.05] p-4">
                        <div className="text-xs font-medium text-[var(--color-muted)]">{qt(locale, "tlPickDate")}</div>
                        <div className="mt-2 flex gap-2">
                          <input
                            type="date"
                            value={examDate}
                            min={new Date().toISOString().slice(0, 10)}
                            onChange={(e) => setExamDate(e.target.value)}
                            className="flex-1 rounded-xl border border-black/[0.1] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
                          />
                          <button
                            type="button"
                            disabled={!examDate}
                            onClick={() => {
                              stashExamPlan({ targetLevel, examDateMode: "exact", examDate });
                              setPhase("module");
                            }}
                            className="btn-primary rounded-xl px-4 py-2 text-sm disabled:opacity-40"
                          >
                            {qt(locale, "tlConfirm")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {onbStep > 0 && (
                <button
                  type="button"
                  onClick={() => setOnbStep((s) => s - 1)}
                  className="mt-6 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
                >
                  ← {qt(locale, "back")}
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </PageShell>
    );
  }

  /* ------------------------- Sign-up gate (once) ------------------------- */
  if (phase === "signup") {
    return <PostQuizAuth />;
  }

  /* ------------------------------ Transition ----------------------------- */
  if (phase === "transition") {
    const done = MODULES[moduleIdx];
    const next = MODULES[moduleIdx + 1];
    return (
      <PageShell>
        <motion.div
          key="transition"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="glass-strong w-full max-w-md rounded-3xl p-8 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-2)]/15 text-2xl text-[var(--color-brand-2)]">
            ✓
          </div>
          <h2 className="mt-4 text-lg font-bold tracking-tight">
            {qt(locale, "module")} {moduleIdx + 1} {qt(locale, "moduleDone")}
          </h2>
          <div className="mt-5 rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4 text-left">
            <div className="text-xs text-[var(--color-muted)]">{qt(locale, "nextModule")}</div>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-[var(--color-foreground)]">
              <span>{next.emoji}</span>
              {qt(locale, "module")} {moduleIdx + 2} · {next.name[locale]}
            </div>
            <div className="mt-2 text-xs text-[var(--color-muted)]">
              {qt(locale, "estTime")}: ~{next.minutes} {qt(locale, "min")}
            </div>
          </div>
          <button
            type="button"
            onClick={continueFromTransition}
            className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 text-sm"
          >
            {qt(locale, "continue")} →
          </button>
          <p className="mt-3 text-[11px] text-[var(--color-muted)]">{done.name[locale]} ✓</p>
        </motion.div>
      </PageShell>
    );
  }

  /* -------------------------------- Module ------------------------------- */
  const current = MODULES[moduleIdx];
  return (
    <PageShell>
      <div className="w-full max-w-2xl">
        <SectionProgress activeIdx={moduleIdx} doneIds={Object.keys(scores) as ModuleId[]} locale={locale} />

        {current.id === "grammar" && (
          <MCModule
            key="grammar"
            moduleIdx={moduleIdx}
            questions={GRAMMAR}
            locale={locale}
            hint={hint}
            onDone={finishModule}
          />
        )}
        {current.id === "vocab" && (
          <MCModule
            key="vocab"
            moduleIdx={moduleIdx}
            questions={VOCAB}
            locale={locale}
            hint={hint}
            onDone={finishModule}
          />
        )}
        {current.id === "reading" && (
          <ReadingModule moduleIdx={moduleIdx} locale={locale} hint={hint} onDone={finishModule} />
        )}
        {current.id === "writing" && (
          <WritingModule moduleIdx={moduleIdx} locale={locale} hint={hint} onDone={finishModule} />
        )}
        {current.id === "speaking" && (
          <SpeakingModule moduleIdx={moduleIdx} locale={locale} hint={hint} onDone={finishModule} />
        )}
      </div>
    </PageShell>
  );
}

/* ---------------------------- Top section bar ---------------------------- */
function SectionProgress({
  activeIdx,
  doneIds,
  locale,
}: {
  activeIdx: number;
  doneIds: ModuleId[];
  locale: Locale;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-center gap-1.5">
      {MODULES.map((m, i) => {
        const done = doneIds.includes(m.id);
        const active = i === activeIdx;
        return (
          <div
            key={m.id}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "bg-[var(--color-brand)]/12 text-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/30"
                : done
                  ? "bg-[var(--color-brand-2)]/12 text-[var(--color-brand-2)]"
                  : "bg-black/[0.04] text-[var(--color-muted)]"
            }`}
          >
            <span>{done ? "✓" : m.emoji}</span>
            <span className="hidden sm:inline">{m.name[locale]}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------- Module header ----------------------------- */
function ModuleHeader({
  moduleIdx,
  locale,
  right,
}: {
  moduleIdx: number;
  locale: Locale;
  right?: React.ReactNode;
}) {
  const m = MODULES[moduleIdx];
  return (
    <div className="mb-4 flex items-center justify-between">
      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-brand)]">
        <span>{m.emoji}</span>
        {qt(locale, "module")} {moduleIdx + 1}/5 · {m.name[locale]}
      </span>
      {right}
    </div>
  );
}

type ModuleProps = {
  moduleIdx: number;
  locale: Locale;
  hint: (l: Localized | undefined) => string | null;
  onDone: (score: number, meta?: { words?: number; records?: AnswerRecord[] }) => void;
};

/** Per-question records for the honest breakdown + mastery seeding. */
function mcRecords(moduleIdx: number, qs: MCQuestion[], answers: (number | null)[], locale: Locale): AnswerRecord[] {
  return qs.map((q, i) => ({
    module: MODULES[moduleIdx].id,
    prompt: q.prompt,
    topic: q.topic,
    tag: q.tag,
    level: q.level,
    correct: answers[i] === q.answer,
    correctAnswer: (q.opts ? q.opts[locale] ?? q.opts.ru : q.options ?? [])[q.answer] ?? "",
  }));
}

/* ------------------------- Multiple-choice module ------------------------ */
function MCModule({
  moduleIdx,
  questions: rawQuestions,
  locale,
  hint,
  onDone,
}: ModuleProps & { questions: MCQuestion[] }) {
  const [qs] = useState(() => rawQuestions.map(shuffleMC));
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(qs.length).fill(null));

  const q = qs[step];
  const selected = answers[step];
  const options = q.opts ? q.opts[locale] ?? q.opts.ru : q.options ?? [];
  const progress = ((step + 1) / qs.length) * 100;
  const qHint = hint(q.hint);

  function choose(i: number) {
    setAnswers((prev) => {
      const n = [...prev];
      n[step] = i;
      return n;
    });
  }

  function next() {
    if (step + 1 >= qs.length) {
      onDone(scoreMC(answers, qs), { records: mcRecords(moduleIdx, qs, answers, locale) });
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div className="glass-strong rounded-3xl p-6 sm:p-8">
      <ModuleHeader moduleIdx={moduleIdx} locale={locale} />
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <span>{qt(locale, "question")} {step + 1}/{qs.length}</span>
            <span className="rounded-full bg-black/[0.05] px-2 py-0.5 font-semibold text-[var(--color-brand-2)]">
              {q.level}
            </span>
            {q.tag && <span className="hidden sm:inline">· {q.tag[locale] ?? q.tag.ru}</span>}
          </div>

          <h2 className="mt-3 text-lg font-semibold text-[var(--color-foreground)] sm:text-xl">{q.prompt}</h2>
          {qHint && <p className="mt-1.5 text-sm text-[var(--color-muted)]">{qHint}</p>}

          <div className="mt-5 grid gap-3">
            {options.map((opt, i) => (
              <button
                key={i}
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

      <AnimatePresence>
        {selected !== null && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={next}
            className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 text-sm"
          >
            {step + 1 >= qs.length ? qt(locale, "next") + " →" : qt(locale, "next")}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ Reading module --------------------------- */
function ReadingModule({ moduleIdx, locale, hint, onDone }: ModuleProps) {
  const [rq] = useState(() => READING.map(shuffleMC));
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(rq.length).fill(null));
  const [left, setLeft] = useState(240); // 4 minutes

  const finishRef = useRef(() => {});
  useEffect(() => {
    finishRef.current = () => onDone(scoreMC(answers, rq), { records: mcRecords(moduleIdx, rq, answers, locale) });
  });

  useEffect(() => {
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          finishRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const q = rq[step];
  const selected = answers[step];
  const qHint = hint(q.hint);

  function choose(i: number) {
    setAnswers((prev) => {
      const n = [...prev];
      n[step] = i;
      return n;
    });
  }
  function next() {
    if (step + 1 >= rq.length) onDone(scoreMC(answers, rq), { records: mcRecords(moduleIdx, rq, answers, locale) });
    else setStep((s) => s + 1);
  }

  return (
    <div className="glass-strong rounded-3xl p-6 sm:p-8">
      <ModuleHeader
        moduleIdx={moduleIdx}
        locale={locale}
        right={
          <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-foreground)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-red)]" /> {fmt(left)}
          </span>
        }
      />

      <div className="rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4 text-sm leading-relaxed text-[var(--color-foreground)]">
        {READING_TEXT.split("\n\n").map((p, i) => (
          <p key={i} className={i > 0 ? "mt-3" : ""}>
            {p}
          </p>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
          className="mt-5"
        >
          <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <span>{qt(locale, "question")} {step + 1}/{rq.length}</span>
            <span className="rounded-full bg-black/[0.05] px-2 py-0.5 font-semibold text-[var(--color-brand-2)]">
              {q.level}
            </span>
          </div>
          <h2 className="mt-2 text-base font-semibold text-[var(--color-foreground)] sm:text-lg">{q.prompt}</h2>
          {qHint && <p className="mt-1.5 text-sm text-[var(--color-muted)]">{qHint}</p>}

          <div className="mt-4 grid gap-2.5">
            {(q.options ?? []).map((opt, i) => (
              <button
                key={i}
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

      <AnimatePresence>
        {selected !== null && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={next}
            className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 text-sm"
          >
            {qt(locale, "next")}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ Writing module --------------------------- */
function WritingModule({ moduleIdx, locale, hint, onDone }: ModuleProps) {
  const [text, setText] = useState("");
  const [left, setLeft] = useState(300); // 5 minutes

  const finishRef = useRef(() => {});
  useEffect(() => {
    finishRef.current = () => onDone(scoreWriting(text), { words: countWords(text) });
  });

  useEffect(() => {
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          finishRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const words = countWords(text);
  const sentences = (text.match(/[.!?]+/g) || []).length;
  const canNext = text.trim().length >= 20;
  const wHint = hint(WRITING.hint);

  return (
    <div className="glass-strong rounded-3xl p-6 sm:p-8">
      <ModuleHeader
        moduleIdx={moduleIdx}
        locale={locale}
        right={
          <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-foreground)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-red)]" /> {fmt(left)}
          </span>
        }
      />

      <h2 className="text-base font-semibold text-[var(--color-foreground)] sm:text-lg">{WRITING.prompt}</h2>
      {wHint && <p className="mt-1.5 text-sm text-[var(--color-muted)]">{wHint}</p>}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder={qt(locale, "writePlaceholder")}
        className="mt-4 w-full resize-y rounded-2xl border border-black/[0.08] bg-white/70 p-4 text-sm leading-relaxed text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
      />

      <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>
          {words} {qt(locale, "wordsLabel")}
        </span>
        <span className={sentences >= 5 ? "text-[var(--color-brand-2)]" : ""}>
          {sentences >= 5 ? "✓ " : ""}
          {qt(locale, "minSentences")}
        </span>
      </div>

      <button
        type="button"
        disabled={!canNext}
        onClick={() => onDone(scoreWriting(text), { words })}
        className="btn-primary mt-5 w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        {qt(locale, "next")} →
      </button>
    </div>
  );
}

/* --------------------- Speaking module — AI audio dialogue ---------------- */
function SpeakingModule({ moduleIdx, locale, onDone }: ModuleProps) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<SpeakStatus>("speaking");
  const [recSeconds, setRecSeconds] = useState(0);
  const [durations, setDurations] = useState<number[]>(() => Array(SPEAKING.length).fill(0));
  const [typed, setTyped] = useState<string[]>(() => Array(SPEAKING.length).fill(""));
  const [supported, setSupported] = useState(true);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const startRef = useRef(0);

  // detect mic support on mount (client only)
  useEffect(() => {
    setSupported(micSupported());
  }, []);

  // AI speaks the current question; mic unlocks when it finishes
  useEffect(() => {
    setStatus("speaking");
    const t = setTimeout(() => {
      speakTr(SPEAKING[step].prompt, () => setStatus("ready"));
    }, 450);
    return () => {
      clearTimeout(t);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, [step]);

  // live recording counter
  useEffect(() => {
    if (status !== "recording") return;
    const id = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  // hard cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  function replay() {
    setStatus("speaking");
    speakTr(SPEAKING[step].prompt, () => setStatus("ready"));
  }

  async function startRec() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      rec.start();
      startRef.current = Date.now();
      setRecSeconds(0);
      setStatus("recording");
    } catch {
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
      setSupported(false);
      setStatus("ready");
    }
  }

  function stopRec() {
    const secs = (Date.now() - startRef.current) / 1000;
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    setStatus("processing");
    setTimeout(() => {
      setDurations((prev) => {
        const n = [...prev];
        n[step] = secs;
        return n;
      });
      setStatus("saved");
    }, 800);
  }

  function next() {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (step + 1 >= SPEAKING.length) {
      const arr = SPEAKING.map((_, i) => {
        const d = durations[i];
        if (d && d > 0) return scoreSpeakingDuration(d);
        return scoreSpeakingAnswer(countWords(typed[i] || ""));
      });
      onDone(Math.round(arr.reduce((a, b) => a + b, 0) / arr.length));
    } else {
      setRecSeconds(0);
      setStep((s) => s + 1);
    }
  }

  const statusKey: QuizTKey =
    status === "speaking"
      ? "aiSpeaking"
      : status === "recording"
        ? "listeningYou"
        : status === "processing"
          ? "processing"
          : status === "saved"
            ? "answerSaved"
            : "tapAnswer";

  const speaking = status === "speaking";
  const recording = status === "recording";
  const answered = supported ? status === "saved" : typed[step].trim().length >= 2;
  const micDisabled = speaking || status === "processing";

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 text-white sm:p-9"
      style={{ background: "linear-gradient(165deg,#1b1640 0%,#141233 55%,#0d1030 100%)" }}
    >
      {/* soft glow accents */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-[var(--color-brand)]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -right-8 h-48 w-48 rounded-full bg-[var(--color-brand-2)]/20 blur-3xl" />

      {/* header */}
      <div className="relative mb-5 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
          🎤 {qt(locale, "module")} {moduleIdx + 1}/5 · {MODULES[moduleIdx].name[locale]}
        </span>
        <span className="text-xs font-medium text-white/60">
          {qt(locale, "question")} {step + 1}/{SPEAKING.length}
        </span>
      </div>
      <div className="relative mb-8 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
          animate={{ width: `${((step + 1) / SPEAKING.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          className="relative flex flex-col items-center"
        >
          {/* AI avatar */}
          <div className="relative flex h-[120px] w-[120px] items-center justify-center">
            {speaking && (
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ border: "2px solid rgba(109,91,255,0.5)" }}
                animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <div
              className="flex h-[120px] w-[120px] items-center justify-center rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 30%, #9c8fff, #6d5bff 46%, #3a1d9c 88%)",
                boxShadow: "0 0 60px -8px rgba(109,91,255,0.75)",
              }}
            >
              {speaking ? (
                <div className="flex items-end gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 rounded-full bg-white"
                      animate={{ height: [10, 34, 14, 28, 10] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              ) : (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="text-white">
                  <rect x="5" y="7" width="14" height="11" rx="3.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M12 4v3M9 12h.01M15 12h.01M9.5 15.5c.7.6 3.3.6 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </div>
          </div>

          {/* status */}
          <div className="mt-5 h-5 text-sm font-medium text-white/80">
            {qt(locale, statusKey)}
            {status === "saved" && " ✓"}
          </div>

          {/* "listen again" — only once AI is done and we're not recording */}
          {!speaking && supported && (
            <button
              type="button"
              onClick={replay}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/15"
            >
              🔊 {qt(locale, "listenAgain")}
            </button>
          )}

          {/* mic / fallback */}
          {supported ? (
            <div className="mt-7 flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  if (recording) stopRec();
                  else if (!micDisabled) startRec();
                }}
                disabled={micDisabled}
                className="relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-[0_14px_44px_-8px_rgba(109,91,255,0.7)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: recording
                    ? "linear-gradient(135deg,#ef4444,#b91c1c)"
                    : "linear-gradient(135deg,var(--color-brand),var(--color-brand-2))",
                }}
              >
                {recording && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ border: "2px solid rgba(239,68,68,0.6)" }}
                    animate={{ scale: [1, 1.45], opacity: [0.7, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                {recording ? (
                  <span className="h-6 w-6 rounded-md bg-white" />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 4a3 3 0 013 3v4a3 3 0 11-6 0V7a3 3 0 013-3zM5 11a7 7 0 0014 0M12 18v3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>

              {/* student waveform while recording */}
              <div className="mt-4 flex h-7 items-end gap-1">
                {recording
                  ? [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 rounded-full"
                        style={{ background: "linear-gradient(to top,var(--color-brand),var(--color-brand-2))" }}
                        animate={{ height: [6, 26, 6] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.07, ease: "easeInOut" }}
                      />
                    ))
                  : null}
              </div>

              <div className="mt-1 text-xs font-medium text-white/60">
                {recording ? fmt(recSeconds) : status === "ready" ? qt(locale, "tapAnswer") : ""}
              </div>
            </div>
          ) : (
            <div className="mt-7 w-full text-left">
              <p className="mb-2 text-xs text-white/70">{qt(locale, "speakNoMic")}</p>
              <textarea
                value={typed[step]}
                onChange={(e) =>
                  setTyped((prev) => {
                    const n = [...prev];
                    n[step] = e.target.value;
                    return n;
                  })
                }
                rows={5}
                placeholder={qt(locale, "writePlaceholder")}
                className="w-full resize-y rounded-2xl border border-white/15 bg-white/5 p-4 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-white/40 focus:border-[var(--color-brand-2)] focus:ring-2 focus:ring-[var(--color-brand-2)]/25"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {/* on the last question the "see result" button is always available so
            the diagnostic can be finished even if the recording didn't register */}
        {(answered || step + 1 >= SPEAKING.length) && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={next}
            className="relative mt-8 w-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_36px_-10px_rgba(109,91,255,0.8)] transition-transform active:scale-[0.99]"
          >
            {step + 1 >= SPEAKING.length ? qt(locale, "finish") : qt(locale, "nextQuestion")} →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
