/**
 * Единый агент Ahu — типы ядра (слой 1, БЕЗ AI).
 *
 * StudentSnapshot — сырые РЕАЛЬНЫЕ данные студента, собранные одним махом
 * (snapshot.ts). Всё остальное ядро (states / decide / context / templates) —
 * чистые функции над снапшотом: детерминированные, юнит-тестируемые, ни
 * одного выдуманного факта. AI (слой 2) получает только их вывод и может
 * лишь переформулировать.
 */

import type { PlanVerdict } from "@/lib/plan/feasibility";

/* ------------------------------- снапшот -------------------------------- */

export type SnapshotDay = {
  /** YYYY-MM-DD */
  date: string;
  done: number;
  total: number;
};

export type SnapshotTopic = {
  topic: string;
  strength: number;
  errorCount: number;
  successCount: number;
  lastErrorAt: string | null;
  lastPracticedAt: string | null;
  updatedAt: string | null;
};

export type SnapshotError = {
  quote: string;
  correction: string;
  topic: string;
  source: string;
  createdAt: string;
};

export type SnapshotMock = {
  /** /100, null пока не все секции оценены */
  total: number | null;
  createdAt: string;
};

export type SnapshotVoice = {
  endedAt: string | null;
  minutes: number;
  /** темы, реально отработанные на уроке (report.topics_worked) */
  topicsWorked: string[];
  errorCount: number;
  /** сумма 4 критериев Konuşma-ревью, 0–20; null = ревью не было/невалидно */
  criteriaTotal: number | null;
};

export type StudentSnapshot = {
  /** YYYY-MM-DD в таймзоне студента — единственное «сегодня» ядра */
  today: string;
  name: string | null;
  gender: "female" | "male" | null;
  /** сырой уровень диагностики (A0..C1) */
  level: string;
  targetLevel: "B2" | "C1";
  /** только при exam_date_mode='exact' (как в мотиваторе) */
  daysToExam: number | null;
  minutesDaily: number | null;
  /** текущая неделя маршрута (study_route), null = маршрута нет */
  routeWeek: { index: number; total: number; themeTr: string; topics: string[] } | null;
  /** честный вердикт feasibility.assessPlan, null = нечего считать */
  feasibility: { verdict: PlanVerdict; loadPct: number | null } | null;
  /** daily_progress за ≤14 дней, по возрастанию даты */
  days: SnapshotDay[];
  /** topic_mastery по возрастанию strength (слабые первыми), ≤40 строк */
  topics: SnapshotTopic[];
  /** error_events за 7 дней, новые первыми, ≤10 */
  recentErrors: SnapshotError[];
  lastMock: SnapshotMock | null;
  prevMock: SnapshotMock | null;
  lastVoice: SnapshotVoice | null;
  /** закрытые темы (strength ≥ 60) внутри пролёта уровень→цель */
  topicsClosed: number;
};

/* ------------------------- активность (производное) ---------------------- */

export type ActivitySummary = {
  /** до сегодняшнего дня не существовало ни одной строки прогресса */
  firstDays: boolean;
  /** была ли РЕАЛЬНАЯ активность (done>0) до сегодня — без неё «пропустил» = ложь */
  hadActivity: boolean;
  /** последняя дата с done>0 (включая сегодня), null = никогда */
  lastActivityDate: string | null;
  /** полных дней без активности; null = активности не было вовсе */
  daysSinceActivity: number | null;
  /** серия полностью закрытых дней; сегодняшняя незавершённость не рвёт её */
  streak: number;
  todayPlan: { done: number; total: number } | null;
  yesterdayPlan: { done: number; total: number } | null;
  /** выполнение плана за последние 7 дней (только дни, где план был) */
  week: { done: number; total: number; plannedDays: number; activeDays: number };
};

/* ------------------------------- состояния ------------------------------- */

export type CoachStateId =
  | "NEWBIE"
  | "EXAM_SOON"
  | "STREAK_BROKEN"
  | "TOPIC_FAILED"
  | "BEHIND"
  | "BREAKTHROUGH"
  | "PLATEAU"
  | "ON_TRACK";

export type CoachState =
  | { id: "NEWBIE" }
  | { id: "EXAM_SOON"; daysToExam: number; lastMockTotal: number | null }
  | { id: "STREAK_BROKEN"; daysSinceActivity: number; lastActivityDate: string }
  | { id: "TOPIC_FAILED"; topic: string; strength: number; recentErrors: number }
  | {
      id: "BEHIND";
      reason: "deadline" | "week_completion";
      loadPct: number | null;
      /** % выполнения плана за 7 дней, null при reason='deadline' */
      weekDonePct: number | null;
    }
  | {
      id: "BREAKTHROUGH";
      kind: "topic_closed" | "mock_jump";
      topic?: string;
      mockDelta?: number;
      mockTotal?: number;
    }
  | { id: "PLATEAU"; topic: string; strength: number; daysSincePracticed: number }
  | { id: "ON_TRACK" };

/* -------------------------------- решение -------------------------------- */

export type CoachAction =
  | "none"
  | "suggest_task" // к первой невыполненной задаче дня
  | "suggest_voice" // голосовой урок по actionTopic
  | "suggest_mock" // пробный TÖMER
  | "warn_pace" // темп не бьётся с датой → настройки
  | "celebrate";

export type CoachDecision = {
  /** верхнее (главное) состояние — тема проактивного сообщения */
  state: CoachState;
  /** все состояния по приоритету (для фактов второго плана) */
  states: CoachState[];
  /** ≤3 id из реестра тем: фокус голосового урока и акцент чата */
  focusTopics: string[];
  action: CoachAction;
  /** тема, на которую направлено действие (для deep-link) */
  actionTopic: string | null;
  /** большой разрыв mock↔цель → предложить перегенерацию маршрута
   * СУЩЕСТВУЮЩИМ POST /api/ai/route (ядро само план не переписывает) */
  replanHint: boolean;
  /** ключ дедупликации проактивного сообщения: `${today}#${state.id}` —
   * уникальный индекс в coach_messages пропускает 1 сообщение на состояние
   * в день; жёсткий потолок 2/день держит квота `motivator` */
  dayKey: string;
};

export type CoachChannel = "proactive" | "chat" | "voice";
