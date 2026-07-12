/**
 * Решение агента — чистая функция (snapshot + состояния) → CoachDecision.
 *
 * Ядро решает ЧТО делать (фокус урока, действие-кнопка, намёк на
 * перегенерацию маршрута) и оставляет AI только КАК сказать. План студенту
 * ядро само не переписывает: replanHint лишь предлагает дёрнуть существующий
 * event-driven POST /api/ai/route — молчаливая перестройка плана запрещена.
 */

import type { CoachAction, CoachDecision, CoachState, StudentSnapshot } from "./types";
import { activityOf, COACH_RULES, detectStates } from "./states";

/** Баремы TÖMER (см. tutor-промпт): B2 = 60/100, C1 = 75/100. */
const TARGET_BAR: Record<"B2" | "C1", number> = { B2: 60, C1: 75 };

const MAX_FOCUS = 3;

const isReal = (topic: string) => !!topic && topic !== "other";

/**
 * Фокус урока/чата: тема главного состояния → слабые темы текущей недели
 * маршрута → остальные слабые по возрастанию strength. ≤3, без дублей.
 * Пусто допустимо — voice-роут доберёт темы уровня (существующий фолбэк).
 */
export function pickFocusTopics(s: StudentSnapshot, top: CoachState): string[] {
  const focus: string[] = [];
  const push = (t: string | undefined | null) => {
    if (t && isReal(t) && !focus.includes(t) && focus.length < MAX_FOCUS) focus.push(t);
  };

  if (top.id === "TOPIC_FAILED" || top.id === "PLATEAU") push(top.topic);

  const weak = s.topics.filter((t) => isReal(t.topic) && t.strength < 60);
  const weekTopics = new Set(s.routeWeek?.topics ?? []);
  for (const t of weak) if (weekTopics.has(t.topic)) push(t.topic);
  for (const t of weak) push(t.topic);
  return focus;
}

function pickAction(s: StudentSnapshot, top: CoachState): { action: CoachAction; actionTopic: string | null } {
  const act = activityOf(s);
  const todayIncomplete = !act.todayPlan || act.todayPlan.done < act.todayPlan.total;

  switch (top.id) {
    case "NEWBIE":
      return { action: "suggest_task", actionTopic: null };
    case "EXAM_SOON": {
      // свежий mock уже есть → к плану; нет — самое ценное сейчас пробный
      const mockFresh = s.lastMock && s.lastMock.createdAt.slice(0, 10) >= isoShiftLocal(s.today, -7);
      return mockFresh
        ? { action: "suggest_task", actionTopic: null }
        : { action: "suggest_mock", actionTopic: null };
    }
    case "STREAK_BROKEN":
      return { action: "suggest_task", actionTopic: null };
    case "TOPIC_FAILED":
      return { action: "suggest_voice", actionTopic: top.topic };
    case "BEHIND":
      return top.reason === "deadline"
        ? { action: "warn_pace", actionTopic: null }
        : { action: "suggest_task", actionTopic: null };
    case "BREAKTHROUGH":
      return { action: "celebrate", actionTopic: top.kind === "topic_closed" ? (top.topic ?? null) : null };
    case "PLATEAU":
      return { action: "suggest_voice", actionTopic: top.topic };
    case "ON_TRACK":
      return todayIncomplete ? { action: "suggest_task", actionTopic: null } : { action: "none", actionTopic: null };
  }
}

// локальная копия isoShift, чтобы не тянуть states-импорт в сигнатуру —
// правило свежести mock здесь и в states обязано совпадать
function isoShiftLocal(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

/** Большой разрыв последнего mock до барема цели → предложить перегенерацию
 * маршрута (докрутка существующего механизма, НЕ новая перестройка). */
export function shouldHintReplan(s: StudentSnapshot): boolean {
  if (!s.lastMock || s.lastMock.total == null) return false;
  const gap = TARGET_BAR[s.targetLevel] - s.lastMock.total;
  if (gap < COACH_RULES.replanMockGap) return false;
  // у самой даты экзамена маршрут уже не спасти — не дёргаем
  return s.daysToExam == null || s.daysToExam > 30;
}

export function decide(s: StudentSnapshot, states?: CoachState[]): CoachDecision {
  const ranked = states ?? detectStates(s);
  const top = ranked[0];
  const { action, actionTopic } = pickAction(s, top);
  return {
    state: top,
    states: ranked,
    focusTopics: pickFocusTopics(s, top),
    action,
    actionTopic,
    replanHint: shouldHintReplan(s),
    dayKey: `${s.today}#${top.id}`,
  };
}
