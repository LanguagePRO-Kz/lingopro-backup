# TODO: что осталось после сессии 08.07.2026 (диагностика v2 + ядро движка)

Статус: **диагностика v2 реализована целиком** (банк, движок, аудио, UI, отложенная
Yazma-проверка, Konuşma-досчёт). **Плановый движок: ядро готово** (route, layout,
feasibility, промпт, API `/api/ai/route` — всё с юнит-тестами `npm run test:plan`).
Осталась UI-интеграция движка и мелочи. Каждый пункт ссылается на раздел чертежа.

## 0. Основателю — перед тестом (блокер)

- [ ] **Применить миграцию** `supabase/migrations/0003_diagnostic_v2.sql` в Supabase
      SQL Editor (колонки `profiles.study_minutes_daily` и `profiles.study_route`).
      Без неё: минуты из онбординга не сохранятся, `/api/ai/route` вернёт 500
      `route_not_saved`.

## 1. Плановый движок — UI-интеграция (DESIGN-PLAN-ENGINE §7 п.7–11)

- [ ] **п.7 `src/lib/daily-plan.ts`**: `loadDashboardData` — добавить в `Promise.all`
      загрузку `profiles.study_route` и `topic_mastery`; при наличии route строить
      день через `buildDay()` из `src/lib/plan/layout.ts` вместо `generateDailyPlan`
      (fallback на старый путь без route — миграционный период). LS-ключ плана → v4
      (см. `isPlanValid`), чтобы старые кэши дней отбросились.
- [ ] **п.8 `src/app/dashboard/page.tsx`**: если у юзера нет `study_route` —
      триггернуть `POST /api/ai/route` (fire-and-forget → после ответа перестроить
      сегодня, паттерн из фикса интенсивности). Рендер задач с `kind`:
      `voice_lesson` → ссылка `/dashboard/speaking/live?mode={voiceMode}&focus={focusTopics.join(",")}`;
      `mock_section`/`mock_full` → в мок-раннер (пока `/dashboard/mock`).
- [ ] **п.9 `src/app/dashboard/speaking/live/page.tsx`**: читать `?mode&focus` из
      query → передавать в тело `/api/voice/session`; сервер (`/api/voice/session`)
      валидирует `focus ⊆ TOPIC_IDS` и использует вместо автофокуса.
- [ ] **п.10 `src/app/dashboard/settings/page.tsx`**: редактируемые «минуты в день»
      (уже есть цель/дата из блока D) + **модалка осуществимости §6**: перед
      сохранением вызвать `assessFeasibility()` (`src/lib/plan/feasibility.ts`),
      показать вердикт ok/tight/notEnough с вариантами (+минуты / сдвиг даты /
      цель B2 / «оставить как есть» с бейджем «напряжённый»). Подтверждение →
      `POST /api/ai/route` → перестроить сегодня. НИКАКИХ молчаливых перестроек.
- [ ] **п.11 `src/app/dashboard/plan/page.tsx`**: витрина маршрута — недели/темы/
      вехи из `study_route` вместо `studyplan.ts` (после этого `studyplan.ts` — на выпил).

## 2. Диагностика v2 — хвосты (DESIGN-DIAGNOSTIC-V2)

- [ ] **§8 контент**: нейтив-ревью банка `src/data/diagnostic-bank.ts` по чек-листу
      DESIGN-CONTENT-TOMER §4 (драфт AI; роутер — в первую очередь). Уровни вопросов
      калибровать по реальной решаемости (`answers` уже пишутся в quiz_result).
- [ ] **§7 п.9** (опционально): таймеры секций для экзаменационного реализма —
      сознательно НЕ делались в v1.
- [ ] Прослушать 6 mp3 в `public/audio/diagnostic/` (основатель) — регенерация:
      `npx -y tsx scripts/generate-diagnostic-audio.mts --force`.
- [ ] `attachKonusmaScore` вызывается только на `/quiz/result` — добавить вызов
      на дашборде после первого голосового урока (§4 «вызов на дашборде/результатах»).

## 3. Мелочи, отложенные основателем «на Opus»

- [ ] «N дней до экзамена» в сайдбаре (`daysToExam()` из `src/lib/exam-plan.ts` готов).
- [ ] `/dashboard/plan`: заголовок «до C1» → реальная цель из профиля.
- [ ] Тегирование банков задач (grammar/vocab) темами реестра — тогда `buildDay`
      сможет фильтровать контент по `focusTopics` (сейчас метаданные, честно
      помечено в layout.ts). Blueprint Б §7 п.5.
- [ ] Снос мёртвого ProductShowcase (фейковые «68%»).
- [ ] C6 до релиза голоса: тест STT на акцентах + iPhone/Safari.

## Как проверять

1. `npm run test:engine && npm run test:plan` — 70 юнит-тестов.
2. Диагностика: пройти `/quiz` (5 шагов онбординга, адаптивный роутер, аудио
   с 2 прослушиваниями, эссе) → после логина на результате: секции /25, Yazma
   «проверяется…» → балл, Konuşma pending с CTA на урок.
3. Маршрут: `curl -X POST localhost:3000/api/ai/route` (с кукой сессии) → JSON
   недель; без AI-ключей — `model: "fallback"` (продукт работает без AI).
