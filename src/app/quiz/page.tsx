"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { useExam } from "@/lib/exam-context";
import { useI18n, type Locale } from "@/lib/i18n";
import { EXAM_LIST, examLang } from "@/lib/exams";
import {
  clearProgress,
  countWords,
  loadProgress,
  qt,
  saveProgress,
  saveResult,
  type AnswerRecord,
  type Localized,
  type QuizTKey,
  type StageId,
} from "@/lib/quiz";
import {
  dinlemeSets,
  okumaSets,
  yazmaByLevel,
  type BankAudio,
  type BankItem,
  type BankLevel,
  type BankText,
  type YazmaPrompt,
} from "@/data/diagnostic-bank";
import {
  applyRouterAnswer,
  computeResultV3,
  hashSeed,
  initRouter,
  nextRouterQuestion,
  routerDone,
  routerResult,
  rotated,
  ROUTER_MAX,
  selfLevelToStart,
  skillBlockLevel,
  type RouterState,
} from "@/lib/diagnostic/engine";
import { saveProfileResult } from "@/lib/profile";
import { stashExamPlan } from "@/lib/exam-plan";
import { createClient } from "@/lib/supabase/client";
import { permutation, applyPerm } from "@/lib/shuffle";
import { PostQuizAuth } from "@/components/PostQuizAuth";

/**
 * Diagnostic v2 (DESIGN-DIAGNOSTIC-V2): onboarding (5 steps) → adaptive
 * level router → Dinleme (audio, 2 plays max) → Okuma → Yazma (essay, AI
 * review deferred to /quiz/result). Konuşma is assessed on the first live
 * lesson, never here. All answers are recorded per question for the honest
 * breakdown + mastery seeding.
 */

/* ------------------------------ Shuffled item ----------------------------- */

type ShuffledItem = { item: BankItem; options: string[]; answer: number };

function shuffleItem(item: BankItem): ShuffledItem {
  const perm = permutation(item.options.length);
  return { item, options: applyPerm(item.options, perm), answer: perm.indexOf(item.answer) };
}

function toRecord(s: ShuffledItem, module: AnswerRecord["module"], chosen: number): AnswerRecord {
  return {
    module,
    prompt: s.item.prompt,
    topic: s.item.topic !== "other" ? s.item.topic : undefined,
    level: s.item.level,
    correct: chosen === s.answer,
    correctAnswer: s.options[s.answer] ?? "",
  };
}

/* -------------------------------- Stage meta ------------------------------ */

const STAGES: { id: StageId; emoji: string; nameKey: QuizTKey; minutes: number }[] = [
  { id: "router", emoji: "🧭", nameKey: "stRouter", minutes: 6 },
  { id: "dinleme", emoji: "🎧", nameKey: "stDinleme", minutes: 6 },
  { id: "okuma", emoji: "📖", nameKey: "stOkuma", minutes: 7 },
  { id: "yazma", emoji: "✍️", nameKey: "stYazma", minutes: 7 },
];

const stageIdx = (id: StageId) => STAGES.findIndex((s) => s.id === id);

/* -------------------------------- Constants ------------------------------ */

const MINUTE_OPTIONS: { minutes: number; labelKey: QuizTKey }[] = [
  { minutes: 15, labelKey: "min15" },
  { minutes: 30, labelKey: "min30" },
  { minutes: 45, labelKey: "min45" },
  { minutes: 60, labelKey: "min60" },
];

const SELF_LEVELS: { id: string; label: QuizTKey; hint: string }[] = [
  { id: "a1", label: "lvBeginner", hint: "A0–A1" },
  { id: "a2", label: "lvBasic", hint: "A2" },
  { id: "b1", label: "lvMid", hint: "B1" },
  { id: "b2", label: "lvAdvanced", hint: "B2+" },
  { id: "unknown", label: "lvUnknown", hint: "" },
];
const TIMELINES: QuizTKey[] = ["tl1", "tl3", "tl6", "tlOpen"];
const ONB_STEPS = 5;

const RETAKE_KEY = "lingopro:quizRetakes";

function retakeSeed(): number {
  try {
    return hashSeed(`retake:${window.localStorage.getItem(RETAKE_KEY) ?? "0"}`);
  } catch {
    return 1;
  }
}

function bumpRetakeCount() {
  try {
    const n = parseInt(window.localStorage.getItem(RETAKE_KEY) ?? "0", 10) || 0;
    window.localStorage.setItem(RETAKE_KEY, String(n + 1));
  } catch {
    /* ignore */
  }
}

/* ================================== Page ================================== */

type Phase = "onboarding" | "stage" | "transition" | "signup";

export default function QuizPage() {
  const router = useRouter();
  const { exam, openWaitlist } = useExam();
  const { locale } = useI18n();

  const [phase, setPhase] = useState<Phase>("onboarding");
  const [onbStep, setOnbStep] = useState(0);
  const [levelSelf, setLevelSelf] = useState<string | null>(null);
  const [targetLevel, setTargetLevel] = useState<"B2" | "C1">("B2");
  const [showDatePick, setShowDatePick] = useState(false);
  const [examDate, setExamDate] = useState("");
  const [minutesDaily, setMinutesDaily] = useState<number | null>(null);

  const [stage, setStage] = useState<StageId>("router");
  const [routerState, setRouterState] = useState<RouterState | null>(null);
  const [routerLevel, setRouterLevel] = useState<BankLevel | null>(null);
  const [seed, setSeed] = useState(1);
  const [dinlemeAgg, setDinlemeAgg] = useState<{ correct: number; total: number } | null>(null);
  const [okumaAgg, setOkumaAgg] = useState<{ correct: number; total: number } | null>(null);

  const answerLogRef = useRef<AnswerRecord[]>([]);
  const doneRef = useRef(false);

  const hint = useCallback(
    (l: Localized | undefined) => (l && locale !== "tr" ? l[locale] || l.ru : null),
    [locale],
  );

  /* ── refresh-safe progress ─────────────────────────────────────────────── */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setSeed(retakeSeed());
    const p = loadProgress();
    if (p) {
      setOnbStep(p.onbStep);
      setStage(p.stage);
      setRouterState((p.router as RouterState | null) ?? null);
      setRouterLevel(p.routerLevel as BankLevel | null);
      setSeed(p.seed);
      setMinutesDaily(p.minutesDaily);
      answerLogRef.current = p.answers ?? [];
      setDinlemeAgg(p.dinleme);
      setOkumaAgg(p.okuma);
      setPhase(p.phase === "stage" ? "stage" : "onboarding");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || doneRef.current) return;
    if (phase === "onboarding" || phase === "stage" || phase === "transition") {
      saveProgress({
        v: 3,
        phase: phase === "onboarding" ? "onboarding" : "stage",
        onbStep,
        stage,
        router: routerState,
        routerLevel,
        seed,
        minutesDaily,
        answers: answerLogRef.current,
        dinleme: dinlemeAgg,
        okuma: okumaAgg,
      });
    }
  }, [hydrated, phase, onbStep, stage, routerState, routerLevel, seed, minutesDaily, dinlemeAgg, okumaAgg]);

  /* ── stage flow ────────────────────────────────────────────────────────── */

  const finishRouter = useCallback((state: RouterState, records: AnswerRecord[]) => {
    answerLogRef.current = [...answerLogRef.current, ...records];
    setRouterState(state);
    setRouterLevel(routerResult(state));
    setStage("dinleme");
    setPhase("transition");
  }, []);

  const finishDinleme = useCallback((agg: { correct: number; total: number }, records: AnswerRecord[]) => {
    answerLogRef.current = [...answerLogRef.current, ...records];
    setDinlemeAgg(agg);
    setStage("okuma");
    setPhase("transition");
  }, []);

  const finishOkuma = useCallback((agg: { correct: number; total: number }, records: AnswerRecord[]) => {
    answerLogRef.current = [...answerLogRef.current, ...records];
    setOkumaAgg(agg);
    setStage("yazma");
    setPhase("transition");
  }, []);

  const finishYazma = useCallback(
    async (writingText: string, promptId: string) => {
      if (!routerState) return;
      doneRef.current = true;
      const result = computeResultV3({
        routerState,
        answers: answerLogRef.current,
        dinleme: dinlemeAgg,
        okuma: okumaAgg,
        writingText,
        yazmaPromptId: promptId,
        minutesDaily: minutesDaily ?? 30,
      });
      saveResult(result); // anonymous cache — survives the sign-up hop
      clearProgress();
      bumpRetakeCount(); // next run rotates to different bank questions

      const {
        data: { user },
      } = await createClient().auth.getUser();
      if (user) {
        void saveProfileResult(result);
        router.push("/quiz/result");
      } else {
        setPhase("signup");
      }
    },
    [routerState, dinlemeAgg, okumaAgg, minutesDaily, router],
  );

  /* ------------------------------ Onboarding ----------------------------- */
  if (phase === "onboarding") {
    return (
      <PageShell>
        <div className="w-full max-w-xl">
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-xs text-[var(--color-muted)]">
              <span>{qt(locale, "step")} {onbStep + 1} / {ONB_STEPS}</span>
              <span>{Math.round(((onbStep + 1) / ONB_STEPS) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
                animate={{ width: `${((onbStep + 1) / ONB_STEPS) * 100}%` }}
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
                          setOnbStep(4);
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
                              setOnbStep(4);
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

              {onbStep === 4 && (
                <>
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{qt(locale, "onbMinutes")}</h1>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{qt(locale, "minutesNote")}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {MINUTE_OPTIONS.map((m) => (
                      <button
                        key={m.minutes}
                        type="button"
                        onClick={() => {
                          setMinutesDaily(m.minutes);
                          setStage("router");
                          setPhase("stage");
                        }}
                        className="flex flex-col items-start rounded-2xl border border-black/[0.07] bg-black/[0.02] px-4 py-3.5 text-left transition-all hover:border-[var(--color-brand)]/60 hover:bg-[var(--color-brand)]/[0.05]"
                      >
                        <span className="text-base font-bold text-[var(--color-foreground)]">
                          {m.minutes === 60 ? "60+" : m.minutes} {qt(locale, "minPerDay")}
                        </span>
                        <span className="text-xs text-[var(--color-muted)]">{qt(locale, m.labelKey)}</span>
                      </button>
                    ))}
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
    const next = STAGES[stageIdx(stage)];
    const done = STAGES[stageIdx(stage) - 1];
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
            {done ? `${qt(locale, done.nameKey)} ${qt(locale, "moduleDone")}` : qt(locale, "continue")}
          </h2>
          {stage === "dinleme" && routerLevel && (
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {qt(locale, "stRouter")}: <span className="font-semibold text-[var(--color-foreground)]">{routerLevel}</span>
            </p>
          )}
          <div className="mt-5 rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4 text-left">
            <div className="text-xs text-[var(--color-muted)]">{qt(locale, "nextModule")}</div>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-[var(--color-foreground)]">
              <span>{next.emoji}</span>
              {qt(locale, next.nameKey)}
            </div>
            <div className="mt-2 text-xs text-[var(--color-muted)]">
              {qt(locale, "estTime")}: ~{next.minutes} {qt(locale, "min")}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPhase("stage")}
            className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 text-sm"
          >
            {qt(locale, "continue")} →
          </button>
        </motion.div>
      </PageShell>
    );
  }

  /* --------------------------------- Stage -------------------------------- */
  const blockLevel = routerLevel ? skillBlockLevel(routerLevel) : "A2";
  const yazmaLevel: BankLevel = routerLevel === "A1" ? "A2" : (routerLevel ?? "A2");

  return (
    <PageShell>
      <div className="w-full max-w-2xl">
        <StageProgress active={stage} locale={locale} />

        {stage === "router" && (
          <RouterStage
            key="router"
            initial={routerState ?? initRouter(selfLevelToStart(levelSelf))}
            seed={seed}
            locale={locale}
            hint={hint}
            onProgress={setRouterState}
            onDone={finishRouter}
          />
        )}
        {stage === "dinleme" && (
          <SetStage
            key="dinleme"
            module="listening"
            sets={dinlemeSets(blockLevel).map((s) => ({ audio: s.audio, questions: s.questions }))}
            seed={seed}
            locale={locale}
            onDone={finishDinleme}
          />
        )}
        {stage === "okuma" && (
          <SetStage
            key="okuma"
            module="reading"
            sets={okumaSets(blockLevel).map((s) => ({ text: s.text, questions: s.questions }))}
            seed={seed}
            locale={locale}
            onDone={finishOkuma}
          />
        )}
        {stage === "yazma" && (
          <YazmaStage key="yazma" level={yazmaLevel} seed={seed} locale={locale} hint={hint} onDone={finishYazma} />
        )}
      </div>
    </PageShell>
  );
}

/* ------------------------------ Stage top bar ----------------------------- */

function StageProgress({ active, locale }: { active: StageId; locale: Locale }) {
  const activeIdx = stageIdx(active);
  return (
    <div className="mb-5 flex flex-wrap items-center justify-center gap-1.5">
      {STAGES.map((s, i) => (
        <div
          key={s.id}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            i === activeIdx
              ? "bg-[var(--color-brand)]/12 text-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/30"
              : i < activeIdx
                ? "bg-[var(--color-brand-2)]/12 text-[var(--color-brand-2)]"
                : "bg-black/[0.04] text-[var(--color-muted)]"
          }`}
        >
          <span>{i < activeIdx ? "✓" : s.emoji}</span>
          <span className="hidden sm:inline">{qt(locale, s.nameKey)}</span>
        </div>
      ))}
    </div>
  );
}

function StageHeader({ stage, locale, right }: { stage: StageId; locale: Locale; right?: React.ReactNode }) {
  const s = STAGES[stageIdx(stage)];
  return (
    <div className="mb-4 flex items-center justify-between">
      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-brand)]">
        <span>{s.emoji}</span>
        {qt(locale, "stage")} {stageIdx(stage) + 1}/4 · {qt(locale, s.nameKey)}
      </span>
      {right}
    </div>
  );
}

/* ----------------------------- Option buttons ----------------------------- */

function OptionList({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: number | null;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="mt-5 grid gap-3">
      {options.map((opt, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
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
  );
}

/* ------------------------------ Router stage ------------------------------ */

function RouterStage({
  initial,
  seed,
  locale,
  hint,
  onProgress,
  onDone,
}: {
  initial: RouterState;
  seed: number;
  locale: Locale;
  hint: (l: Localized | undefined) => string | null;
  onProgress: (s: RouterState) => void;
  onDone: (s: RouterState, records: AnswerRecord[]) => void;
}) {
  const [state, setState] = useState<RouterState>(initial);
  const [current, setCurrent] = useState<ShuffledItem | null>(() => {
    const q = nextRouterQuestion(initial, seed);
    return q ? shuffleItem(q) : null;
  });
  const [selected, setSelected] = useState<number | null>(null);
  const recordsRef = useRef<AnswerRecord[]>([]);

  function next() {
    if (!current || selected === null) return;
    const correct = selected === current.answer;
    recordsRef.current = [...recordsRef.current, toRecord(current, "grammar", selected)];
    const nextState = applyRouterAnswer(state, current.item, correct);
    onProgress(nextState);

    const q = routerDone(nextState) ? null : nextRouterQuestion(nextState, seed);
    if (!q) {
      onDone(nextState, recordsRef.current);
      return;
    }
    setState(nextState);
    setCurrent(shuffleItem(q));
    setSelected(null);
  }

  if (!current) return null;
  const qHint = current.item.level === "A1" || current.item.level === "A2" ? hint(current.item.hint) : null;
  const progress = Math.min(100, ((state.asked.length + 1) / ROUTER_MAX) * 100);

  return (
    <div className="glass-strong rounded-3xl p-6 sm:p-8">
      <StageHeader stage="router" locale={locale} />
      <p className="mb-4 text-xs text-[var(--color-muted)]">{qt(locale, "routerIntro")}</p>
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.item.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <span>{qt(locale, "question")} {state.asked.length + 1}</span>
            <span className="rounded-full bg-black/[0.05] px-2 py-0.5 font-semibold text-[var(--color-brand-2)]">
              {current.item.level}
            </span>
          </div>

          <h2 className="mt-3 text-lg font-semibold text-[var(--color-foreground)] sm:text-xl">{current.item.prompt}</h2>
          {qHint && <p className="mt-1.5 text-sm text-[var(--color-muted)]">{qHint}</p>}

          <OptionList options={current.options} selected={selected} onSelect={setSelected} />
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

/* ------------------------- Dinleme / Okuma stage -------------------------- */
/** A sequence of sets; each set = (audio | text) + its questions. */

type StageSet = { audio?: BankAudio; text?: BankText; questions: BankItem[] };

function SetStage({
  module,
  sets,
  seed,
  locale,
  onDone,
}: {
  module: AnswerRecord["module"];
  sets: StageSet[];
  seed: number;
  locale: Locale;
  onDone: (agg: { correct: number; total: number }, records: AnswerRecord[]) => void;
}) {
  // seed rotates which set comes first on a retake; questions keep bank order
  const [ordered] = useState(() => rotated(sets, seed));
  const [shuffled] = useState(() =>
    ordered.map((s) => s.questions.map((q) => shuffleItem(q))),
  );
  const [setIdx, setSetIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const recordsRef = useRef<AnswerRecord[]>([]);
  const correctRef = useRef(0);

  const totalQuestions = shuffled.reduce((n, s) => n + s.length, 0);
  const answered = shuffled.slice(0, setIdx).reduce((n, s) => n + s.length, 0) + qIdx;

  const set = ordered[setIdx];
  const q = shuffled[setIdx][qIdx];
  const stage: StageId = module === "listening" ? "dinleme" : "okuma";

  function next() {
    if (selected === null) return;
    if (selected === q.answer) correctRef.current += 1;
    recordsRef.current = [...recordsRef.current, toRecord(q, module, selected)];
    setSelected(null);

    if (qIdx + 1 < shuffled[setIdx].length) {
      setQIdx(qIdx + 1);
    } else if (setIdx + 1 < ordered.length) {
      setSetIdx(setIdx + 1);
      setQIdx(0);
    } else {
      onDone({ correct: correctRef.current, total: totalQuestions }, recordsRef.current);
    }
  }

  return (
    <div className="glass-strong rounded-3xl p-6 sm:p-8">
      <StageHeader stage={stage} locale={locale} />
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
          animate={{ width: `${((answered + 1) / totalQuestions) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {set.audio && <AudioPlayer key={set.audio.id} audio={set.audio} locale={locale} />}
      {set.text && (
        <div className="rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4 text-sm leading-relaxed text-[var(--color-foreground)]">
          <div className="mb-2 text-xs font-semibold text-[var(--color-muted)]">{set.text.title}</div>
          {set.text.body.split("\n\n").map((p, i) => (
            <p key={i} className={i > 0 ? "mt-3" : ""}>
              {p}
            </p>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={q.item.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
          className="mt-5"
        >
          <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <span>{qt(locale, "question")} {answered + 1}/{totalQuestions}</span>
            <span className="rounded-full bg-black/[0.05] px-2 py-0.5 font-semibold text-[var(--color-brand-2)]">
              {q.item.level}
            </span>
          </div>
          <h2 className="mt-2 text-base font-semibold text-[var(--color-foreground)] sm:text-lg">{q.item.prompt}</h2>
          <OptionList options={q.options} selected={selected} onSelect={setSelected} />
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

/* ------------------------------ Audio player ------------------------------ */
/** Exam-honest player: play only, no scrubbing, two full plays max. The
 *  counter lives in sessionStorage keyed by audio id, so neither re-renders,
 *  refreshes nor stage restarts can hand out extra plays. */

const MAX_PLAYS = 2;

function playsUsed(audioId: string): number {
  try {
    return parseInt(window.sessionStorage.getItem(`lingopro:plays:${audioId}`) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

function recordPlay(audioId: string): number {
  const used = playsUsed(audioId) + 1;
  try {
    window.sessionStorage.setItem(`lingopro:plays:${audioId}`, String(used));
  } catch {
    /* ignore */
  }
  return used;
}

function AudioPlayer({ audio, locale }: { audio: BankAudio; locale: Locale }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playsLeft, setPlaysLeft] = useState(() => Math.max(0, MAX_PLAYS - playsUsed(audio.id)));
  const [playing, setPlaying] = useState(false);

  // re-sync when the set (audio id) changes and stop playback on unmount
  useEffect(() => {
    setPlaysLeft(Math.max(0, MAX_PLAYS - playsUsed(audio.id)));
    const el = ref.current;
    return () => el?.pause();
  }, [audio.id]);

  function play() {
    // storage is the source of truth — state is only the display
    if (playsUsed(audio.id) >= MAX_PLAYS || playing || !ref.current) return;
    const used = recordPlay(audio.id);
    setPlaysLeft(Math.max(0, MAX_PLAYS - used));
    setPlaying(true);
    ref.current.currentTime = 0;
    void ref.current.play().catch(() => setPlaying(false));
  }

  return (
    <div className="rounded-2xl border border-[var(--color-brand)]/25 bg-[var(--color-brand)]/[0.04] p-4">
      <audio ref={ref} src={audio.src} preload="auto" onEnded={() => setPlaying(false)} />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={play}
          disabled={playsLeft <= 0 || playing}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] text-white shadow-md transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {playing ? (
            <span className="flex items-end gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 rounded-full bg-white"
                  animate={{ height: [6, 16, 8, 14, 6] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--color-foreground)]">
            {playing ? qt(locale, "playing") : `🎧 ${qt(locale, "play")}`}
          </div>
          <div className="text-xs text-[var(--color-muted)]">
            {qt(locale, "playsLeft")}: {playsLeft} · {qt(locale, "audioRule")}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Yazma stage ------------------------------ */

function YazmaStage({
  level,
  seed,
  locale,
  hint,
  onDone,
}: {
  level: BankLevel;
  seed: number;
  locale: Locale;
  hint: (l: Localized | undefined) => string | null;
  onDone: (text: string, promptId: string) => void;
}) {
  const [prompt] = useState<YazmaPrompt>(() => rotated(yazmaByLevel(level), seed)[0]);
  const [text, setText] = useState("");

  const words = countWords(text);
  const sentences = (text.match(/[.!?]+/g) || []).length;
  const canNext = text.trim().length >= 20;
  const wHint = hint(prompt.hint);

  return (
    <div className="glass-strong rounded-3xl p-6 sm:p-8">
      <StageHeader stage="yazma" locale={locale} />

      <h2 className="text-base font-semibold text-[var(--color-foreground)] sm:text-lg">{prompt.prompt}</h2>
      {wHint && <p className="mt-1.5 text-sm text-[var(--color-muted)]">{wHint}</p>}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={9}
        placeholder={qt(locale, "writePlaceholder")}
        className="mt-4 w-full resize-y rounded-2xl border border-black/[0.08] bg-white/70 p-4 text-sm leading-relaxed text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
      />

      <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>
          {words} {qt(locale, "wordsLabel")}
        </span>
        <span className={sentences >= prompt.minSentences ? "text-[var(--color-brand-2)]" : ""}>
          {sentences >= prompt.minSentences ? "✓ " : ""}
          {sentences}/{prompt.minSentences}
        </span>
      </div>

      <p className="mt-3 text-xs text-[var(--color-muted)]">💡 {qt(locale, "yazmaAiNote")}</p>

      <button
        type="button"
        disabled={!canNext}
        onClick={() => onDone(text, prompt.id)}
        className="btn-primary mt-5 w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        {qt(locale, "finish")} →
      </button>
    </div>
  );
}
