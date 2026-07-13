/**
 * Движок точности по темам (Фаза 1 P0-ядра): attempts (append-only сырьё)
 * → детерминированный пересчёт → topic_mastery (кэш производного значения).
 *
 * Правила (утверждены основателем):
 *  - точность взвешена по свежести: вес попытки затухает экспоненциально,
 *    полураспад 21 день — «ошибался два месяца назад, сегодня отвечает
 *    верно» = тема выучена, а не «слабая 50%»;
 *  - < 3 попыток — статистику НЕ публикуем (мало данных ≠ оценка);
 *    существующий strength (посев диагностики / AI-поток) не трогаем;
 *  - самооценка (is_self_reported) в точность НЕ входит никогда;
 *  - AI-ошибки без знаменателя (эссе/голос/чат из error_events) — штраф
 *    к статистике, общий потолок −20: наказываем за наличие, не за число;
 *  - topic_mastery перестраиваем целиком из attempts (recomputeAllMastery):
 *    derived = можно выкинуть и собрать заново. Темы, у которых есть ТОЛЬКО
 *    AI-события (attempts нет), не трогаем — их из attempts не пересобрать,
 *    ими владеет AI-поток (recordErrors/recordSuccesses).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const MASTERY_WINDOW_DAYS = 90;
export const MASTERY_ATTEMPTS_CAP = 100; // свежайших попыток на тему
export const HALF_LIFE_DAYS = 21;
export const MIN_ATTEMPTS_FOR_STATS = 3;
export const AI_PENALTY = { major: 12, minor: 6 } as const;
export const AI_PENALTY_CAP = 20;
export const AI_PENALTY_WINDOW_DAYS = 14;
/** Старт инкрементальной шкалы и её шаги — как в src/lib/ai/mastery.ts. */
const SPARSE_BASE = 50;
const SPARSE_GAIN = 8;
const SPARSE_DROP = 12;

export type AttemptForMastery = { isCorrect: boolean; answeredAt: string };
export type AiErrorForMastery = { severity: "major" | "minor" };

const DAY_MS = 86_400_000;

/** Взвешенная по свежести точность 0..1; null, если попыток нет. */
export function weightedAccuracy(attempts: AttemptForMastery[], nowMs: number): number | null {
  let wSum = 0;
  let wCorrect = 0;
  for (const a of attempts) {
    const ageDays = Math.max(0, (nowMs - Date.parse(a.answeredAt)) / DAY_MS);
    const w = Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
    wSum += w;
    if (a.isCorrect) wCorrect += w;
  }
  return wSum > 0 ? wCorrect / wSum : null;
}

export type StrengthResult =
  /** ≥3 попыток: статистика правит, strength применяется всегда */
  | { mode: "stats"; strength: number }
  /** <3 попыток: seed применяется, если строкой не владеет посев/AI-поток */
  | { mode: "sparse"; seedStrength: number };

/**
 * Чистая функция strength по теме. attempts — уже отфильтрованные
 * (не self-reported, окно 90 дней, cap), aiErrors — окно 14 дней.
 */
export function computeStrength(
  attempts: AttemptForMastery[],
  aiErrors: AiErrorForMastery[],
  nowMs: number,
): StrengthResult {
  const correct = attempts.filter((a) => a.isCorrect).length;
  const wrong = attempts.length - correct;

  if (attempts.length < MIN_ATTEMPTS_FOR_STATS) {
    return {
      mode: "sparse",
      seedStrength: clamp(SPARSE_BASE + SPARSE_GAIN * correct - SPARSE_DROP * wrong),
    };
  }

  const acc = weightedAccuracy(attempts, nowMs) ?? 0;
  let penalty = 0;
  for (const e of aiErrors) penalty += AI_PENALTY[e.severity];
  penalty = Math.min(AI_PENALTY_CAP, penalty);

  return { mode: "stats", strength: clamp(Math.round(acc * 100) - penalty) };
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/* ------------------------------ БД-обвязка ------------------------------ */

const isoDaysAgo = (nowMs: number, days: number) => new Date(nowMs - days * DAY_MS).toISOString();

type MasteryRow = {
  strength: number;
  success_count: number;
  error_count: number;
  last_error_at: string | null;
  last_practiced_at: string | null;
};

/** Данные одной темы для пересчёта, уже выбранные из БД. */
type TopicBundle = {
  attempts: AttemptForMastery[]; // окно, cap, без self-reported, свежие первыми
  aiErrors: AiErrorForMastery[];
  existing: MasteryRow | null;
  /** есть error_events по теме (за всю историю) — тему трогал посев/AI */
  hasAiEvidence: boolean;
};

function buildMasteryUpsert(
  userId: string,
  topic: string,
  b: TopicBundle,
  nowMs: number,
): Record<string, unknown> | null {
  const res = computeStrength(b.attempts, b.aiErrors, nowMs);
  if (res.mode === "sparse" && b.existing == null && b.attempts.length === 0) return null;

  const correct = b.attempts.filter((a) => a.isCorrect).length;
  const wrong = b.attempts.length - correct;
  const lastPracticed = b.attempts[0]?.answeredAt ?? null;
  const lastError = b.attempts.find((a) => !a.isCorrect)?.answeredAt ?? null;
  const maxIso = (a: string | null, b2: string | null) =>
    a && b2 ? (a > b2 ? a : b2) : (a ?? b2);

  // sparse: если тему трогал посев диагностики / AI-поток (след — error_events),
  // strength и счётчиками владеет он; строку, рождённую самими попытками,
  // честно пересчитываем (иначе первая же ошибка исчезала из счётчиков —
  // поймано живым прогоном 13.07)
  const keepExisting = res.mode === "sparse" && b.existing != null && b.hasAiEvidence;
  const strength =
    res.mode === "stats" ? res.strength : keepExisting ? b.existing!.strength : res.seedStrength;

  return {
    user_id: userId,
    topic,
    strength,
    // счётчики за окно пересчёта; для тем с ≥3 попытками владелец этот код
    success_count: keepExisting ? b.existing!.success_count : correct,
    error_count: keepExisting ? b.existing!.error_count : wrong,
    last_practiced_at: maxIso(b.existing?.last_practiced_at ?? null, lastPracticed),
    last_error_at: maxIso(b.existing?.last_error_at ?? null, lastError),
    updated_at: new Date(nowMs).toISOString(),
  };
}

/**
 * Пересчёт одной темы после вставки попытки. Best-effort: сбой пересчёта не
 * ломает сохранение попытки (сырьё уже в БД, recomputeAllMastery догонит).
 */
export async function recomputeTopicMastery(
  supabase: SupabaseClient,
  userId: string,
  topic: string,
  nowMs = Date.now(),
): Promise<void> {
  try {
    const [attemptsRes, errorsRes, existingRes] = await Promise.all([
      supabase
        .from("attempts")
        .select("is_correct, answered_at")
        .eq("user_id", userId)
        .eq("topic", topic)
        .eq("is_self_reported", false)
        .gte("answered_at", isoDaysAgo(nowMs, MASTERY_WINDOW_DAYS))
        .order("answered_at", { ascending: false })
        .limit(MASTERY_ATTEMPTS_CAP),
      // вся история: свежие (окно штрафа) считаем в коде, само наличие —
      // признак, что темой владеет посев/AI-поток
      supabase
        .from("error_events")
        .select("severity, created_at")
        .eq("user_id", userId)
        .eq("topic", topic)
        .limit(500),
      supabase
        .from("topic_mastery")
        .select("strength, success_count, error_count, last_error_at, last_practiced_at")
        .eq("user_id", userId)
        .eq("topic", topic)
        .maybeSingle(),
    ]);

    const penaltySince = isoDaysAgo(nowMs, AI_PENALTY_WINDOW_DAYS);
    const allErrors = errorsRes.data ?? [];
    const bundle: TopicBundle = {
      attempts: (attemptsRes.data ?? []).map((r) => ({
        isCorrect: r.is_correct as boolean,
        answeredAt: r.answered_at as string,
      })),
      aiErrors: allErrors
        .filter((r) => (r.created_at as string) >= penaltySince)
        .map((r) => ({ severity: r.severity === "major" ? "major" : "minor" })),
      existing: (existingRes.data as MasteryRow | null) ?? null,
      hasAiEvidence: allErrors.length > 0,
    };

    const row = buildMasteryUpsert(userId, topic, bundle, nowMs);
    if (!row) return;
    const { error } = await supabase
      .from("topic_mastery")
      .upsert(row, { onConflict: "user_id,topic" });
    if (error) console.error("[attempts] mastery upsert failed:", error.message);
  } catch (e) {
    console.error("[attempts] recompute failed:", e instanceof Error ? e.message : e);
  }
}

/**
 * Полная пересборка derived-части topic_mastery из attempts — страховка на
 * случай упавшего единичного пересчёта (сеть, деплой посреди запроса).
 * Темы без attempts (AI-only: эссе/голос) не трогаются.
 */
export async function recomputeAllMastery(
  supabase: SupabaseClient,
  userId: string,
  nowMs = Date.now(),
): Promise<{ topics: string[] }> {
  const [attemptsRes, errorsRes, existingRes] = await Promise.all([
    supabase
      .from("attempts")
      .select("topic, is_correct, answered_at")
      .eq("user_id", userId)
      .eq("is_self_reported", false)
      .not("topic", "is", null)
      .gte("answered_at", isoDaysAgo(nowMs, MASTERY_WINDOW_DAYS))
      .order("answered_at", { ascending: false })
      .limit(5000),
    supabase
      .from("error_events")
      .select("topic, severity, created_at")
      .eq("user_id", userId)
      .limit(2000),
    supabase
      .from("topic_mastery")
      .select("topic, strength, success_count, error_count, last_error_at, last_practiced_at")
      .eq("user_id", userId),
  ]);

  const byTopic = new Map<string, TopicBundle>();
  for (const r of attemptsRes.data ?? []) {
    const t = r.topic as string;
    let b = byTopic.get(t);
    if (!b) {
      b = { attempts: [], aiErrors: [], existing: null, hasAiEvidence: false };
      byTopic.set(t, b);
    }
    if (b.attempts.length < MASTERY_ATTEMPTS_CAP) {
      b.attempts.push({ isCorrect: r.is_correct as boolean, answeredAt: r.answered_at as string });
    }
  }
  const penaltySince = isoDaysAgo(nowMs, AI_PENALTY_WINDOW_DAYS);
  for (const r of errorsRes.data ?? []) {
    const b = byTopic.get(r.topic as string);
    if (!b) continue;
    b.hasAiEvidence = true;
    if ((r.created_at as string) >= penaltySince) {
      b.aiErrors.push({ severity: r.severity === "major" ? "major" : "minor" });
    }
  }
  for (const r of existingRes.data ?? []) {
    const b = byTopic.get(r.topic as string);
    if (b) b.existing = r as unknown as MasteryRow;
  }

  const rows: Record<string, unknown>[] = [];
  for (const [topic, b] of byTopic) {
    const row = buildMasteryUpsert(userId, topic, b, nowMs);
    if (row) rows.push(row);
  }
  if (rows.length > 0) {
    const { error } = await supabase
      .from("topic_mastery")
      .upsert(rows, { onConflict: "user_id,topic" });
    if (error) throw new Error(`recomputeAllMastery upsert failed: ${error.message}`);
  }
  return { topics: [...byTopic.keys()] };
}
