/**
 * Ядро единого агента Ahu — публичный API.
 * Чистая часть (states/decide/context/templates) тестируется без БД;
 * snapshot.ts — server-only сборка данных. Личность — persona.ts.
 */

export * from "./types";
export { activityOf, detectStates, COACH_RULES, STATE_PRIORITY, isoShift, daysBetween } from "./states";
export { decide, pickFocusTopics, shouldHintReplan } from "./decide";
export { buildAhuContext, MAX_CONTEXT_CHARS } from "./context";
export { coachFallbackText } from "./templates";
export { buildAhuSystem } from "./persona";
export { buildSnapshot } from "./snapshot";
