/**
 * Diagnostic v2 engine (DESIGN-DIAGNOSTIC-V2 §3) — deterministic, no AI.
 *
 * Router: an adaptive staircase over the topic-tagged ROUTER bank. Two right
 * in a row → level up, two wrong → level down; stops after ROUTER_MAX
 * questions or once the level is "pinned" (enough questions + enough
 * direction changes). The result level is conservative: most-asked level
 * with ≥50% accuracy, ties break downward.
 *
 * Scoring: honest /25 per section = accuracy × 25, nothing invented. The
 * displayed range is a fixed ± band derived from the binomial standard error
 * of ~26 MC answers (see SCORE_RANGE_* comments), not a marketing number.
 */

import {
  routerByLevel,
  type BankItem,
  type BankLevel,
} from "@/data/diagnostic-bank";
import type { VoiceReport } from "@/lib/ai/prompts/voice-review";
import type { WritingReview } from "@/lib/ai/prompts/writing-review";
import {
  countWords,
  levelFromScore,
  LEVEL_ORDER,
  type AnswerRecord,
  type Level,
  type ModuleId,
  type QuizResult,
  type ResultSections,
  type SkillScore,
} from "@/lib/quiz";

/* ------------------------------ Level helpers ---------------------------- */

const BANK_LEVELS: BankLevel[] = ["A1", "A2", "B1", "B2", "C1"];

function levelIdx(l: BankLevel): number {
  return BANK_LEVELS.indexOf(l);
}

function shiftLevel(l: BankLevel, by: number): BankLevel {
  const i = Math.min(BANK_LEVELS.length - 1, Math.max(0, levelIdx(l) + by));
  return BANK_LEVELS[i];
}

/** Self-assessment card id (quiz onboarding) → staircase start level. */
export function selfLevelToStart(selfId: string | null): BankLevel {
  switch (selfId) {
    case "a1": return "A1";
    case "b1": return "B1";
    case "b2": return "B2";
    default: return "A2"; // "a2", "unknown", null
  }
}

/**
 * Dinleme/Okuma content level: below A2 comprehension can't be measured
 * honestly (we give the A2 block), and C1 is only confirmed by mocks (the
 * C1 candidate gets the B2 block; the UI says so).
 */
export function skillBlockLevel(routerLevel: BankLevel): "A2" | "B1" | "B2" {
  if (routerLevel === "A1" || routerLevel === "A2") return "A2";
  if (routerLevel === "B1") return "B1";
  return "B2";
}

/* --------------------------- Deterministic seed --------------------------- */

/** Tiny stable string hash (FNV-1a) for retake rotation. */
export function hashSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic rotation: same seed → same order, different seed → shifted. */
export function rotated<T>(arr: T[], seed: number): T[] {
  if (arr.length < 2) return [...arr];
  const start = seed % arr.length;
  return [...arr.slice(start), ...arr.slice(0, start)];
}

/* --------------------------------- Router -------------------------------- */

export const ROUTER_MAX = 12;
/** Early stop: level considered pinned after this many questions… */
export const ROUTER_EARLY_MIN = 8;
/** …if the staircase changed direction at least this many times. */
export const ROUTER_EARLY_CHANGES = 2;

export type RouterAnswer = {
  id: string;
  level: BankLevel;
  topic: string;
  correct: boolean;
};

export type RouterState = {
  level: BankLevel;
  asked: string[];
  history: RouterAnswer[];
  correctStreak: number;
  wrongStreak: number;
  lastDir: "up" | "down" | null;
  directionChanges: number;
};

export function initRouter(start: BankLevel): RouterState {
  return {
    level: start,
    asked: [],
    history: [],
    correctStreak: 0,
    wrongStreak: 0,
    lastDir: null,
    directionChanges: 0,
  };
}

export function routerDone(state: RouterState): boolean {
  if (state.asked.length >= ROUTER_MAX) return true;
  return state.asked.length >= ROUTER_EARLY_MIN && state.directionChanges >= ROUTER_EARLY_CHANGES;
}

/**
 * Next unused question at the current level (seed-rotated). If the level's
 * six questions are exhausted, borrows from the nearest level (below first —
 * conservative). Returns null when done or the bank is fully exhausted.
 */
export function nextRouterQuestion(state: RouterState, seed: number): BankItem | null {
  if (routerDone(state)) return null;
  for (const offset of [0, -1, 1, -2, 2, -3, 3, -4, 4]) {
    const idx = levelIdx(state.level) + offset;
    if (idx < 0 || idx >= BANK_LEVELS.length) continue;
    const pool = rotated(routerByLevel(BANK_LEVELS[idx]), seed);
    const q = pool.find((item) => !state.asked.includes(item.id));
    if (q) return q;
  }
  return null;
}

export function applyRouterAnswer(state: RouterState, item: BankItem, correct: boolean): RouterState {
  const next: RouterState = {
    ...state,
    asked: [...state.asked, item.id],
    history: [...state.history, { id: item.id, level: item.level, topic: item.topic, correct }],
  };

  if (correct) {
    next.correctStreak = state.correctStreak + 1;
    next.wrongStreak = 0;
    if (next.correctStreak >= 2 && state.level !== "C1") {
      next.level = shiftLevel(state.level, 1);
      next.correctStreak = 0;
      if (state.lastDir === "down") next.directionChanges = state.directionChanges + 1;
      next.lastDir = "up";
    }
  } else {
    next.wrongStreak = state.wrongStreak + 1;
    next.correctStreak = 0;
    if (next.wrongStreak >= 2 && state.level !== "A1") {
      next.level = shiftLevel(state.level, -1);
      next.wrongStreak = 0;
      if (state.lastDir === "up") next.directionChanges = state.directionChanges + 1;
      next.lastDir = "down";
    }
  }
  return next;
}

/**
 * Working level = the level with the most asked questions among those with
 * ≥50% accuracy; ties break to the LOWER level (conservative). If no level
 * clears 50%, the lowest asked level is returned.
 */
export function routerResult(state: RouterState): BankLevel {
  const byLevel = new Map<BankLevel, { asked: number; correct: number }>();
  for (const h of state.history) {
    const s = byLevel.get(h.level) ?? { asked: 0, correct: 0 };
    s.asked += 1;
    if (h.correct) s.correct += 1;
    byLevel.set(h.level, s);
  }

  let best: BankLevel | null = null;
  let bestAsked = -1;
  for (const level of BANK_LEVELS) {
    // ascending order + strict ">" ⇒ ties resolve to the lower level
    const s = byLevel.get(level);
    if (!s || s.correct / s.asked < 0.5) continue;
    if (s.asked > bestAsked) {
      best = level;
      bestAsked = s.asked;
    }
  }
  if (best) return best;

  for (const level of BANK_LEVELS) {
    if (byLevel.has(level)) return level;
  }
  return "A1";
}

/* -------------------------------- Scoring -------------------------------- */

/** Honest section score: share of correct answers on a /25 scale. */
export function score25(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 25);
}

/**
 * Displayed range around totalKnown. With ~26 MC answers behind the score,
 * one binomial standard error ≈ sqrt(0.5·0.5/26) ≈ 10% ≈ 7 points on the
 * summed scale — hence −7. The upside is capped tighter (+5): a short
 * diagnostic overestimates more often than it underestimates.
 */
export const SCORE_RANGE_BELOW = 7;
export const SCORE_RANGE_ABOVE = 5;

/** Konuşma /25 from a voice-lesson report (avg of four 0–5 criteria). */
export function konusma25(report: VoiceReport): number | null {
  if (!report?.valid || !report.criteria) return null;
  const c = report.criteria;
  const scores = [c.fluency?.score, c.grammar?.score, c.vocab?.score, c.coherence?.score];
  if (scores.some((s) => typeof s !== "number" || Number.isNaN(s))) return null;
  const avg = (scores as number[]).reduce((a, b) => a + b, 0) / scores.length;
  return Math.round((avg / 5) * 25);
}

/**
 * Overall CEFR = router level, corrected downward when comprehension badly
 * lags grammar: combined dinleme+okuma accuracy < 40% → one level lower.
 * Upward corrections never happen here — growth is proven by mocks.
 */
export function overallCefr(
  routerLevel: BankLevel,
  dinleme: { correct: number; total: number } | null,
  okuma: { correct: number; total: number } | null,
): Level {
  const correct = (dinleme?.correct ?? 0) + (okuma?.correct ?? 0);
  const total = (dinleme?.total ?? 0) + (okuma?.total ?? 0);
  if (total > 0 && correct / total < 0.4) return shiftLevel(routerLevel, -1);
  return routerLevel;
}

export function levelAtLeast(level: Level, floor: Level): boolean {
  return LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(floor);
}

/* ----------------------------- Result assembly --------------------------- */

export type ResultInputV3 = {
  routerState: RouterState;
  /** All per-question records (router + dinleme + okuma), topic-tagged */
  answers: AnswerRecord[];
  dinleme: { correct: number; total: number } | null;
  okuma: { correct: number; total: number } | null;
  writingText: string;
  yazmaPromptId: string;
  minutesDaily: number;
  gender?: "female" | "male" | null;
};

function routerAccuracyPct(state: RouterState): number {
  if (state.history.length === 0) return 0;
  return Math.round((state.history.filter((h) => h.correct).length / state.history.length) * 100);
}

const pct = (s: { correct: number; total: number } | null): number | null =>
  s && s.total > 0 ? Math.round((s.correct / s.total) * 100) : null;

/**
 * Legacy fields (skills/byWeakness/strengths/plan) are an APPROXIMATION kept
 * for pre-v3 consumers (plan page, pricing): grammar/vocab mirror the router,
 * reading mirrors okuma; writing/speaking fall back to the router percent
 * until their real sections arrive. The v3 UI reads `sections` instead.
 */
function legacyShim(input: {
  routerPct: number;
  okumaPct: number | null;
  yazmaPct: number | null;
  konusmaPct: number | null;
}): Pick<QuizResult, "skills" | "strengths" | "weaknesses" | "byWeakness"> {
  const values: Record<Exclude<ModuleId, "listening">, number> = {
    grammar: input.routerPct,
    vocab: input.routerPct,
    reading: input.okumaPct ?? input.routerPct,
    writing: input.yazmaPct ?? input.routerPct,
    speaking: input.konusmaPct ?? input.routerPct,
  };
  const skills: SkillScore[] = (Object.keys(values) as (keyof typeof values)[]).map((id) => ({
    id,
    percent: values[id],
    level: levelFromScore(values[id]),
  }));
  const sorted = [...skills].sort((a, b) => b.percent - a.percent);
  const byWeakness = [...skills].sort((a, b) => a.percent - b.percent).map((s) => s.id);
  const strengths = sorted.filter((s) => s.percent >= 50).slice(0, 2).map((s) => s.id);
  return {
    skills,
    strengths: strengths.length ? strengths : [sorted[0].id],
    weaknesses: byWeakness.slice(0, 2),
    byWeakness,
  };
}

function totals(sections: ResultSections): { totalKnown: number; knownCount: number } {
  const known = [sections.dinleme, sections.okuma, sections.yazma, sections.konusma].filter(
    (v): v is number => typeof v === "number",
  );
  return { totalKnown: known.reduce((a, b) => a + b, 0), knownCount: known.length };
}

export function computeResultV3(input: ResultInputV3): QuizResult {
  const routerLevel = routerResult(input.routerState);
  const level = overallCefr(routerLevel, input.dinleme, input.okuma);

  const sections: ResultSections = {
    dinleme: input.dinleme ? score25(input.dinleme.correct, input.dinleme.total) : null,
    okuma: input.okuma ? score25(input.okuma.correct, input.okuma.total) : null,
    yazma: null, // deferred AI review (post-login)
    konusma: null, // first live lesson
  };
  const { totalKnown } = totals(sections);

  // the only honest ballpark before a mock: share of correct MC answers
  const mc = input.answers;
  const overall = mc.length ? Math.round((mc.filter((a) => a.correct).length / mc.length) * 100) : 0;

  const shim = legacyShim({
    routerPct: routerAccuracyPct(input.routerState),
    okumaPct: pct(input.okuma),
    yazmaPct: null,
    konusmaPct: null,
  });

  return {
    level,
    overall,
    predictedScore: overall,
    ...shim,
    plan: overall < 30 ? "beginner" : overall <= 60 ? "a2" : "advanced",
    writingWords: countWords(input.writingText),
    takenAt: Date.now(),
    answers: input.answers,
    version: 3,
    routerLevel,
    sections,
    totalKnown,
    writingText: input.writingText,
    yazmaPromptId: input.yazmaPromptId,
    minutesDaily: input.minutesDaily,
    gender: input.gender ?? null,
  };
}

/** Merge the deferred AI essay review into a v3 result (drops the raw text). */
export function withYazmaReview(result: QuizResult, review: WritingReview): QuizResult {
  if (result.version !== 3 || !result.sections) return result;
  const sections: ResultSections = {
    ...result.sections,
    yazma: review.valid ? Math.max(0, Math.min(25, Math.round(review.score_total_25))) : null,
  };
  const next: QuizResult = { ...result, sections, yazmaReview: review, totalKnown: totals(sections).totalKnown };
  if (review.valid) delete next.writingText;
  return next;
}

/** Attach the Konuşma score once the first reviewed live lesson exists. */
export function withKonusma(result: QuizResult, report: VoiceReport): QuizResult | null {
  if (result.version !== 3 || !result.sections || result.sections.konusma != null) return null;
  const score = konusma25(report);
  if (score == null) return null;
  const sections: ResultSections = { ...result.sections, konusma: score };
  return { ...result, sections, totalKnown: totals(sections).totalKnown };
}
