/**
 * Единое правило «куда вести студента после входа».
 *
 * Решает ПРОФИЛЬ (база), а не localStorage браузера. Баг 17.08.2026: вход
 * выбирал маршрут по `lingopro:quizResult`, и оплативший студент с давно
 * мигрировавшим результатом каждый раз попадал на страницу диагностики
 * с предложением купить — вместо кабинета.
 *
 * Локальный результат участвует ровно одним числом: временем прохождения.
 * Если он СВЕЖЕЕ профильного (студент прошёл диагностику разлогиненным),
 * ведём на /quiz/result — там результат мигрирует в БД и не потеряется.
 * Во всех остальных случаях — в кабинет; доступ к нему дальше проверяет
 * гейт в src/app/dashboard/layout.tsx (нет плана → /pricing).
 *
 * @param remoteTakenAt profiles.quiz_result.takenAt (0 — результата в БД нет)
 * @param localTakenAt  takenAt из localStorage (0 — локального результата нет)
 */
export function postAuthDestination(remoteTakenAt: number, localTakenAt: number): string {
  return remoteTakenAt > 0 && remoteTakenAt >= localTakenAt ? "/dashboard" : "/quiz/result";
}
