/**
 * Детект состояний студента — чистые правила над StudentSnapshot, БЕЗ AI.
 *
 * Порядок в PRIORITY — порядок важности: верхнее истинное состояние задаёт
 * тему проактивного сообщения, остальные дают факты второго плана.
 * Каждое правило опирается ТОЛЬКО на реальные строки таблиц; уроки честности
 * мотиватора перенесены сюда правилами: новичку нельзя «пропустил» (NEWBIE
 * перекрывает всё), «пропал» — только при реальной прошлой активности,
 * похвала — только при конкретном измеримом событии.
 */

import { STRENGTH_GAIN } from "@/lib/ai/mastery";
import type { ActivitySummary, CoachState, CoachStateId, StudentSnapshot } from "./types";

/** Пороги правил — КОНФИГ ядра, не физика; правится в одном месте. */
export const COACH_RULES = {
  /** EXAM_SOON: точная дата ближе N дней (месяц — окно мобилизации: за месяц
   * до экзамена слабое звено ещё можно усилить; заказ 20.07) */
  examSoonDays: 30,
  /** STREAK_BROKEN: полных дней без активности (3+ = «пропал», а не выходной) */
  inactivityDays: 3,
  /** BREAKTHROUGH week_streak: серия полных дней кратна этому (неделя плана) */
  weekStreakStep: 7,
  /** TOPIC_FAILED: strength ниже порога… */
  failedStrength: 30,
  /** …или столько ошибок по одной теме за 7 дней */
  failedRecentErrors: 3,
  /** BEHIND: доля выполнения плана за 7 дней ниже порога… */
  behindWeekShare: 0.4,
  /** …при минимум N днях, где план вообще был (1-2 дня не судим) */
  behindMinPlannedDays: 3,
  /** BREAKTHROUGH: новый mock лучше предыдущего на ≥ N баллов */
  breakthroughMockDelta: 10,
  /** PLATEAU: активных дней из последних 7 … */
  plateauActiveDays: 5,
  /** …при слабейшей теме ниже порога … */
  plateauStrengthCap: 45,
  /** …которую не трогали ≥ N дней */
  plateauStaleDays: 5,
  /** replanHint: разрыв последнего mock до барема цели (B2=60, C1=75) */
  replanMockGap: 25,
} as const;

export const STATE_PRIORITY: CoachStateId[] = [
  "NEWBIE",
  "EXAM_SOON",
  "STREAK_BROKEN",
  "TOPIC_FAILED",
  "BEHIND",
  "BREAKTHROUGH",
  "PLATEAU",
  "ON_TRACK",
];

/* ------------------------------ date utils ------------------------------- */

export function isoShift(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000);
}

/** Дата-часть timestamptz (UTC-приближение — для правил свежести хватает). */
const datePart = (ts: string | null | undefined): string | null =>
  ts ? ts.slice(0, 10) : null;

/* ------------------------------ активность ------------------------------- */

/** Производная сводка активности; серия считается как в мотиваторе:
 * полные дни подряд, сегодняшняя незавершённость её не рвёт. */
export function activityOf(s: StudentSnapshot): ActivitySummary {
  const byDate = new Map(s.days.map((d) => [d.date, d]));
  const complete = (d?: SnapshotDayLike) => !!d && d.total > 0 && d.done >= d.total;

  let streak = 0;
  for (let i = 0; i <= 14; i++) {
    const row = byDate.get(isoShift(s.today, -i));
    if (complete(row)) streak += 1;
    else if (i === 0) continue; // сегодня ещё в процессе
    else break;
  }

  const firstDays = s.days.every((d) => d.date >= s.today);
  const activeDates = s.days.filter((d) => d.done > 0).map((d) => d.date).sort();
  const lastActivityDate = activeDates.length ? activeDates[activeDates.length - 1] : null;
  const hadActivity = activeDates.some((d) => d < s.today);
  const daysSinceActivity = lastActivityDate ? daysBetween(lastActivityDate, s.today) : null;

  const todayRow = byDate.get(s.today);
  const yRow = byDate.get(isoShift(s.today, -1));
  const week = { done: 0, total: 0, plannedDays: 0, activeDays: 0 };
  for (let i = 0; i < 7; i++) {
    const row = byDate.get(isoShift(s.today, -i));
    if (!row) continue;
    if (row.total > 0) {
      week.plannedDays += 1;
      week.done += row.done;
      week.total += row.total;
    }
    if (row.done > 0) week.activeDays += 1;
  }

  return {
    firstDays,
    hadActivity,
    lastActivityDate,
    daysSinceActivity,
    streak,
    todayPlan: todayRow ? { done: todayRow.done, total: todayRow.total } : null,
    yesterdayPlan: yRow ? { done: yRow.done, total: yRow.total } : null,
    week,
  };
}

type SnapshotDayLike = { done: number; total: number };

/* -------------------------------- детект --------------------------------- */

const isReal = (topic: string) => topic && topic !== "other";

/** Все истинные состояния по приоритету; пусто не бывает (дефолт ON_TRACK). */
export function detectStates(s: StudentSnapshot): CoachState[] {
  const act = activityOf(s);

  // Новичок перекрывает всё: истории нет — любое «пропустил/отстаёшь» ложь.
  if (act.firstDays) return [{ id: "NEWBIE" }];

  const list: CoachState[] = [];

  if (s.daysToExam != null && s.daysToExam <= COACH_RULES.examSoonDays) {
    list.push({ id: "EXAM_SOON", daysToExam: s.daysToExam, lastMockTotal: s.lastMock?.total ?? null });
  }

  if (
    act.hadActivity &&
    act.daysSinceActivity != null &&
    act.daysSinceActivity >= COACH_RULES.inactivityDays &&
    act.lastActivityDate
  ) {
    list.push({
      id: "STREAK_BROKEN",
      daysSinceActivity: act.daysSinceActivity,
      lastActivityDate: act.lastActivityDate,
    });
  }

  // TOPIC_FAILED: совсем слабая тема ИЛИ серия свежих ошибок по одной теме
  {
    const errsByTopic = new Map<string, number>();
    for (const e of s.recentErrors) {
      if (!isReal(e.topic)) continue;
      errsByTopic.set(e.topic, (errsByTopic.get(e.topic) ?? 0) + 1);
    }
    const weakest = s.topics.find((t) => isReal(t.topic) && t.strength < COACH_RULES.failedStrength);
    const errTopic = [...errsByTopic.entries()]
      .filter(([, n]) => n >= COACH_RULES.failedRecentErrors)
      .sort((a, b) => b[1] - a[1])[0];
    if (weakest) {
      list.push({
        id: "TOPIC_FAILED",
        topic: weakest.topic,
        strength: weakest.strength,
        recentErrors: errsByTopic.get(weakest.topic) ?? 0,
      });
    } else if (errTopic) {
      const row = s.topics.find((t) => t.topic === errTopic[0]);
      list.push({
        id: "TOPIC_FAILED",
        topic: errTopic[0],
        strength: row?.strength ?? 50,
        recentErrors: errTopic[1],
      });
    }
  }

  // BEHIND: честный дефицит — вердикт feasibility или реальное невыполнение
  if (s.feasibility?.verdict === "notEnough") {
    list.push({ id: "BEHIND", reason: "deadline", loadPct: s.feasibility.loadPct, weekDonePct: null });
  } else if (
    act.week.plannedDays >= COACH_RULES.behindMinPlannedDays &&
    act.week.total > 0 &&
    act.week.done / act.week.total < COACH_RULES.behindWeekShare
  ) {
    list.push({
      id: "BEHIND",
      reason: "week_completion",
      loadPct: s.feasibility?.loadPct ?? null,
      weekDonePct: Math.round((act.week.done / act.week.total) * 100),
    });
  }

  // BREAKTHROUGH: тема пересекла 60 СЕГОДНЯ (ловится только в день пересечения —
  // истории strength нет, честное ограничение) или свежий скачок mock
  {
    const closedToday = s.topics.find(
      (t) =>
        isReal(t.topic) &&
        t.strength >= 60 &&
        t.strength < 60 + STRENGTH_GAIN &&
        datePart(t.updatedAt) === s.today,
    );
    const mockFresh =
      s.lastMock &&
      s.prevMock &&
      s.lastMock.total != null &&
      s.prevMock.total != null &&
      (datePart(s.lastMock.createdAt) ?? "") >= isoShift(s.today, -1) &&
      s.lastMock.total - s.prevMock.total >= COACH_RULES.breakthroughMockDelta;
    // week_streak: план выполнен неделю ПОДРЯД (серия кратна 7) — ловим в день
    // достижения кратности, иначе бы праздновали каждый день после седьмого
    const weekStreak =
      act.streak > 0 &&
      act.streak % COACH_RULES.weekStreakStep === 0 &&
      // именно сегодня закрыл неделю (сегодняшний план выполнен), не «висит с ночи»
      !!act.todayPlan &&
      act.todayPlan.total > 0 &&
      act.todayPlan.done >= act.todayPlan.total;
    if (closedToday) {
      list.push({
        id: "BREAKTHROUGH",
        kind: "topic_closed",
        topic: closedToday.topic,
        strength: closedToday.strength,
      });
    } else if (mockFresh && s.lastMock) {
      list.push({
        id: "BREAKTHROUGH",
        kind: "mock_jump",
        mockDelta: s.lastMock.total! - s.prevMock!.total!,
        mockTotal: s.lastMock.total!,
      });
    } else if (weekStreak) {
      list.push({ id: "BREAKTHROUGH", kind: "week_streak", streakDays: act.streak });
    }
  }

  // PLATEAU: стабильно занимается, а слабейшая тема лежит нетронутой
  {
    const weakest = s.topics.find((t) => isReal(t.topic) && t.strength < COACH_RULES.plateauStrengthCap);
    const staleDays = weakest?.lastPracticedAt
      ? daysBetween(datePart(weakest.lastPracticedAt)!, s.today)
      : weakest
        ? Number.POSITIVE_INFINITY
        : 0;
    if (
      weakest &&
      act.week.activeDays >= COACH_RULES.plateauActiveDays &&
      staleDays >= COACH_RULES.plateauStaleDays
    ) {
      list.push({
        id: "PLATEAU",
        topic: weakest.topic,
        strength: weakest.strength,
        daysSincePracticed: Number.isFinite(staleDays) ? staleDays : 99,
      });
    }
  }

  const order = new Map(STATE_PRIORITY.map((id, i) => [id, i]));
  list.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
  return list.length ? list : [{ id: "ON_TRACK" }];
}
