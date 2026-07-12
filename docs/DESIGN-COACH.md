# DESIGN-COACH — единый автономный агент Ahu

**Статус на 2026-07-13 (ветка `feat/ahu-coach`):** ядро, личность, КАНАЛЫ
(§4-6) **И UI (§7)** ГОТОВЫ; старый мотиватор/тьютор УДАЛЕНЫ (§9, кроме
`motivate()` в studyplan.ts — им живёт легаси-страница /dashboard/plan).
Живой e2e: каналы (`scripts/test-coach-e2e.mts`) и UI
(`.shots-debug/ui-walk-coach.mjs`, 14/14: бриф+чип на дашборде, handoff,
серверная история после F5, карточка урока, сайдбар ×2 языка) — против
реальной БД и AI. Миграция 0010 применена и прозвонена (12/12).
Осталось: **маскот (после утверждения плана основателем)**, `next build` +
деплой, хвосты §10a. Прод (`main`) не тронут.

Идея: три разрозненных AI-сущности (тьютор-чат «LingoPRO AI», мотиватор
«Ahu», голосовой урок ElevenLabs) сливаются в ОДНУ личность Ahu с единым
детерминированным мозгом. Ядро (без AI) читает реальные данные → состояние →
решение; AI только формулирует. Железные правила: честность (ноль не
хвалим), ≤2 проактивных сообщений в день, бюджет (сжатый контекст с
потолком), не ломать работающее.

---

## 1. Что уже сделано (не переделывать)

| Файл | Что внутри | Проверено |
|---|---|---|
| `src/lib/coach/types.ts` | `StudentSnapshot`, `CoachState` (8 состояний), `CoachDecision`, `CoachAction`, `CoachChannel` | tsc |
| `src/lib/coach/snapshot.ts` | `buildSnapshot(supabase, userId, {kkNative?})` — 7 источников одним махом | tsc (живой прогон по БД — на этапе каналов) |
| `src/lib/coach/states.ts` | `detectStates(snapshot)`, `activityOf(snapshot)`, пороги `COACH_RULES`, `isoShift/daysBetween` | `npm run test:coach` |
| `src/lib/coach/decide.ts` | `decide(snapshot)`, `pickFocusTopics`, `shouldHintReplan` | `npm run test:coach` |
| `src/lib/coach/context.ts` | `buildAhuContext(snapshot, decision, channel)`, потолок `MAX_CONTEXT_CHARS=1800` (~450 ток.) | `npm run test:coach` |
| `src/lib/coach/templates.ts` | `coachFallbackText(snapshot, decision, locale)` — честный no-AI фолбэк ×4 языка | `npm run test:coach` |
| `src/lib/coach/persona.ts` | `buildAhuSystem({channel, lang, gender})` — ЕДИНЫЙ промпт личности | живые AI-прогоны ×4 языка |
| `src/lib/coach/index.ts` | публичный баррель | — |
| `scripts/test-coach.ts` | ~100 юнит-проверок честности (`npm run test:coach`) | зелёные |
| `scripts/test-coach-live.ts` | живые прогоны persona+context через callAI (`npx tsx scripts/test-coach-live.ts [lang]`) | 12/12 |
| `supabase/migrations/0010_coach.sql` | память агента `coach_messages` + RLS + дедуп | ПРИМЕНЕНА; прозвон 12/12 |
| `src/lib/ai/mastery.ts` | добавлен экспорт `STRENGTH_GAIN` (нужен детекту BREAKTHROUGH) | — |
| **`src/app/api/coach/brief/route.ts`** | канал 1 §4 — проактивный бриф | e2e: 4 сценария ×4 языка, гонки, потолок |
| **`src/app/api/coach/chat/route.ts`** | канал 2 §5 — чат с серверной историей | e2e: реальная ошибка процитирована, история в БД |
| **`src/lib/coach/voice-summary.ts`** | `recordVoiceSummary(admin, {userId, conversationId, minutes, report})` | e2e: вставка + идемпотентность |
| **`src/app/api/voice/session/route.ts`** | фокус от `decide()` + `focus_reason` в dynamic vars (биллинг/слоты не тронуты) | e2e: живой старт сессии, izafet первым |
| **`src/app/api/voice/session/end/route.ts`** | вызов `recordVoiceSummary` после биллинга (best-effort) | код-ревью + tsc (полный круг через report — e2e voice-блок) |
| **`scripts/test-coach-e2e.mts`** | живой e2e: briefs/race/chat/voice/fallback | см. §10a |

Уроки живых прогонов, уже вшитые в код (НЕ ослаблять):
- языковое требование продублировано ПОСЛЕДНЕЙ строкой промпта («SON KONTROL») — DeepSeek иначе отвечает по-турецки при feedbackLang=ru;
- …и этого МАЛО: дрейф вероятностный, поэтому brief-роут проверяет ответ
  через `matchesFeedbackLang(text, lang)` (persona.ts) и делает один жёсткий
  ретрай, иначе честный шаблон. Для чата (Sonnet) дрейф не наблюдался — при
  жалобах включить тот же страж;
- запрет начинать с имени/приветствия — явно «ни своим (Ahu), ни именем студента»;
- сила темы в контексте всегда «güç N/100», иначе модель превращает «60+» в «60 вопросов»;
- нагрузка >400% подаётся кратностью («gereken çalışma ~9 KATI»), иначе в
  тексте студенту всплывает «backlog is 938%»;
- проактивный шаг — только СУЩЕСТВУЮЩАЯ вещь (задание плана / урок / пробный / настройки), модель иначе выдумывает «тест уровня»;
- приоритет BEHIND(deadline) > BREAKTHROUGH — осознанный: реальная угроза
  дедлайну важнее праздника; модель сама красиво совмещает («порог пройден,
  но с такой скоростью не успеваешь»).

## 2. Контракт ядра (сигнатуры — импортировать из `@/lib/coach`)

```ts
buildSnapshot(supabase: SupabaseClient, userId: string,
              opts?: { kkNative?: boolean }): Promise<StudentSnapshot>
// kkNative = (feedbackLang === "kk") — влияет только на вердикт feasibility

detectStates(s: StudentSnapshot): CoachState[]   // по приоритету, непустой
decide(s: StudentSnapshot, states?: CoachState[]): CoachDecision
// CoachDecision: { state, states, focusTopics(≤3 id), action, actionTopic,
//                  replanHint, dayKey: `${today}#${state.id}` }

buildAhuContext(s, d, channel: "proactive"|"chat"|"voice"): string // ≤1800 символов
buildAhuSystem({ channel: "proactive"|"chat", lang: FeedbackLang,
                 gender?: "female"|"male"|null }): string
coachFallbackText(s, d, locale: Locale): string  // честный текст без AI
```

Сборка системного промпта (проверенный в live-прогонах паттерн):
```ts
const system = `${buildAhuSystem({ channel, lang, gender: snapshot.gender })}

--- ÖĞRENCİNİN GERÇEK VERİLERİ ---
${buildAhuContext(snapshot, decision, channel)}`;
```

Маршрутизация моделей/квот — СУЩЕСТВУЮЩИЕ ключи (историю ai_usage не ломаем):
- проактив → `callAI({ task: "motivator_note", maxTokens: 700 })`, квота `consumeQuota("motivator")` (2/день — это и есть потолок «не спамить»);
- чат → `callAI({ task: "tutor_chat", maxTokens: 1200 })`, квота `consumeQuota("tutor")` (30/день).
`maxTokens: 700` для проактива обязателен — deepseek-v4-pro рассуждает до ответа, меньший бюджет съедается целиком (см. комментарий в старом /api/ai/motivator).

## 3. Миграция 0010 (применяет основатель)

`supabase/migrations/0010_coach.sql` — таблица `coach_messages`
(channel: proactive|chat|voice_summary; role: ahu|student), RLS: читать свои;
своей сессией студент пишет ТОЛЬКО role='student' в channel='chat'; все
строки Ahu вставляет сервер через `createAdminClient()` (паттерн voice_slots).
Дедуп проактивных: уникальный индекс `(user_id, meta->>'day_key') where channel='proactive'`.

## 4. ГОТОВО — канал 1: `POST /api/coach/brief` (заменяет /api/ai/motivator)

Файл: `src/app/api/coach/brief/route.ts`. Body: `{ feedbackLang }`.

Поток:
1. `checkRateLimit("coach-brief:"+clientKey(req), 6, 60_000)`.
2. auth (как в /api/ai/motivator), `lang` из body с валидацией ×4.
3. `snapshot = await buildSnapshot(supabase, userId, { kkNative: lang === "kk" })`;
   `decision = decide(snapshot)`.
4. `admin = createAdminClient()`; выбрать сегодняшние проактивы:
   `select content, meta from coach_messages where user_id=… and channel='proactive' and meta->>'day_key' like snapshot.today+'#%' order by created_at desc`.
5. Если есть строка с `meta.day_key === decision.dayKey` И `meta.lang === lang`
   → вернуть её (`source: "cached"`), БЕЗ AI-вызова. (Смена языка в течение
   дня или смена состояния → генерируем заново, п.6.)
6. Иначе: `isConfigured("motivator_note", lang)` и `consumeQuota("motivator")`;
   любой отказ → ответ `coachFallbackText(snapshot, decision, lang)` с
   `source: "template"`; шаблон в БД НЕ сохранять (иначе day_key занят и
   ожившее AI не сможет записать нормальную заметку; при исчерпанной квоте,
   но существующей сегодняшней строке на другом языке — вернуть её).
7. AI-вызов (см. §2), `text = result.text.trim()`; вставка через admin:
   `{ user_id, channel: 'proactive', role: 'ahu', content: text,
      meta: { day_key: decision.dayKey, lang, state: decision.state.id,
              action: decision.action, action_topic: decision.actionTopic,
              focus_topics: decision.focusTopics, replan_hint: decision.replanHint } }`.
   Код ошибки 23505 (гонка двух вкладок) → перечитать и вернуть существующую.
8. Ответ:
```ts
{ text: string, source: "ai" | "cached" | "template",
  state: CoachStateId, action: CoachAction, actionTopic: string | null,
  focusTopics: string[], replanHint: boolean }
```
`replanHint: true` → клиент (дашборд) может дёрнуть существующий
`POST /api/ai/route` (регенерация маршрута) — как уже делает при `routeStale`.

## 5. ГОТОВО — канал 2: `POST /api/coach/chat` (заменяет /api/ai/tutor)

Файл: `src/app/api/coach/chat/route.ts`. Body: `{ feedbackLang, message: string }`
(≤2000 символов; истории клиент БОЛЬШЕ НЕ шлёт — сервер владеет ею).

Поток:
1. rate-limit 20/мин (как тьютор); auth; `consumeQuota("tutor")` (до любых вставок).
2. Параллельно: `buildSnapshot(...)` и история — последние 12 строк
   `channel='chat'` (order created_at desc → развернуть в asc).
3. Вставить вопрос студента СЕССИОННЫМ клиентом (RLS-политика
   "student writes own chat"): `{ channel:'chat', role:'student', content: message }`.
4. `messages`: история → `{role: row.role === 'ahu' ? 'assistant' : 'user', content}`,
   соседние одинаковые роли склеить через `\n\n` (API требует чередования —
   логика уже есть в tutor/page.tsx, перенести на сервер), + текущий вопрос
   последним user-ходом.
5. `callAI({ task: "tutor_chat", system: persona(chat)+context(chat), messages, maxTokens: 1200 })`.
6. Ответ Ahu вставить через `createAdminClient()`: `{ channel:'chat', role:'ahu', content: result.text }`.
7. Ответ клиенту — формат СТАРОГО тьютора (страница уже умеет его рендерить):
   `{ text, meta: { provider, model, usedToday, usedMonth } }`.

Историю на страницу грузить БЕЗ эндпоинта — прямым supabase-select с клиента
(RLS read-own, обычный паттерн проекта):
`from("coach_messages").select("channel, role, content, meta, created_at")
 .in("channel", ["chat","voice_summary"]).order("created_at").limit(50)`.

## 6. ГОТОВО — канал 3: голос (два точечных врезания, роуты НЕ переименовывать)

**`src/app/api/voice/session/route.ts`** — выбор фокуса (строки ~185-205):
deep-link `body.focusTopics` по-прежнему главнее; если его нет — вместо
голых weak-topics взять `decide(await buildSnapshot(...)).focusTopics`
(добор темами уровня до 3 оставить как есть). В `dynamicVariables` добавить
`focus_reason` — одна TR-строка почему эти темы (например, из
`decision.state.id`: "KONU ZAYIF: izafet güç 28/100"); в промпте агента
ElevenLabs есть слот `{{focus_reason}}` (см. §8).

**`src/app/api/voice/session/end/route.ts`** — после вставки в
`voice_sessions` (там уже есть `admin`): если `report?.valid` — вставить
карточку урока в ленту чата:
```ts
await admin.from("coach_messages").insert({
  user_id: user.id, channel: "voice_summary", role: "ahu",
  content: report.summary || `Sesli ders: ${minutes} dk`,
  meta: { conversation_id: conversationId, minutes,
          criteria_total: report.criteria.fluency.score + report.criteria.grammar.score
                        + report.criteria.vocab.score + report.criteria.coherence.score,
          topics: report.topics_worked },
});
```
`report.summary` уже на языке студента (voice-review пишет на feedback_lang).
Замыкание круга: следующий `buildSnapshot` увидит урок в `voice_sessions`
(секция SON SESLİ DERS контекста) — чат и бриф автоматически «помнят» урок.

## 7. ГОТОВО — UI (сделано 2026-07-13; контракты каналов ниже актуальны)

Реализовано: `src/components/AhuCoach.tsx` (бриф+чип+«Спросить Ahu», замена
AhuNote на dashboard/page.tsx), `src/app/dashboard/tutor/page.tsx`
(Ahu 👩🏻‍🏫, серверная история из coach_messages + карточки voice_summary +
handoff `sessionStorage["lingopro:ahu:handoff"]` + /api/coach/chat),
`src/lib/dashboard.ts` (сайдбар «Чат с Ahu»/«Урок с Ahu» ×4),
live-страница (строка `lessonFocusReason` под фокус-чипами; сервер отдаёт
её из `focusReasonText()` templates.ts). Проверено живым UI-прогоном
`.shots-debug/ui-walk-coach.mjs` (14/14) + скриншоты глазами.

Нюанс для правок: у AhuCoach LS-кэша НЕТ намеренно — состояние меняется в
течение дня, сервер в cached-ветке почти бесплатен. Плейсхолдер аватара —
эмодзи-круг: сюда встанет маскот (§14).

### Контракты каналов (для доработок UI)

Ответ `POST /api/coach/brief` (body `{ feedbackLang: "ru"|"en"|"tr"|"kk" }`):
```ts
{ text: string,
  source: "ai" | "cached" | "template",
  state: "NEWBIE"|"EXAM_SOON"|"STREAK_BROKEN"|"TOPIC_FAILED"|"BEHIND"|"BREAKTHROUGH"|"PLATEAU"|"ON_TRACK",
  action: "none"|"suggest_task"|"suggest_voice"|"suggest_mock"|"warn_pace"|"celebrate",
  actionTopic: string | null,      // id темы для deep-link
  focusTopics: string[],           // ≤3 id тем
  replanHint: boolean }            // true → можно дёрнуть POST /api/ai/route
// ошибки: 401 auth_required, 429 rate_limited, 400 bad_request
// ВАЖНО: при source="cached" текст — сохранённый, а state/action — СВЕЖИЕ
// (кнопка-действие всегда актуальна, даже если заметка утренняя)

Ответ `POST /api/coach/chat` (body `{ feedbackLang, message: string ≤2000 }`):
{ text: string, meta: { provider, model, usedToday, usedMonth } }
// ошибки: 401, 429 {error: daily_limit|monthly_limit|rate_limited|user_budget|global_budget},
//         503 ai_unavailable, 400 empty_message — коды те же, что у старого
//         тьютора: маппинг ошибок на странице переиспользуется как есть
```
История для страницы чата — прямой select (RLS read-own):
```ts
supabase.from("coach_messages")
  .select("channel, role, content, meta, created_at")
  .in("channel", ["chat", "voice_summary"])
  .order("created_at").limit(50)
// role: "student" → пузырь студента; "ahu" → пузырь Ahu;
// channel="voice_summary" → карточка урока (meta: {minutes, criteria_total, topics})
```

**`src/components/AhuCoach.tsx`** — замена `AhuNote` (та же точка монтирования,
`src/app/dashboard/page.tsx:317`, пропсы `{streak, history}` оставить для
шаблонного фолбэка). Slim-блок (правило основателя: дашборд не топит план):
```
👩🏻‍🏫 Ahu — твой преподаватель                    ● онлайн
«…проактивный текст из /api/coach/brief…»
[чип действия]                 [💬 Спросить Ahu →]
```
- Кэш в LS: `lingopro:ahu:v2:${todayISO()}:${locale}` → {text, action, actionTopic, state}
  (сервер и так дедупит, LS экономит POST на каждый заход).
- Чипы по `action` (лейблы ×4 языка):
  `suggest_task` → `#plan`; `suggest_voice` → `/dashboard/speaking/live?focus=${actionTopic ?? focusTopics.join(",")}`;
  `suggest_mock` → `/dashboard/mock`; `warn_pace` → `/dashboard/settings`;
  `celebrate` → без ссылки (или `#plan`); `none` → чипа нет.
- Поле «Спросить Ahu»: `sessionStorage.setItem("lingopro:ahu:handoff", q)` →
  `router.push("/dashboard/tutor")`.
- Фолбэк при недоступном brief: локально `coachFallbackText` НЕ вызвать
  (ядро server-only из-за snapshot) → фолбэк = текст из `getMotivation`
  ПОКА не удалён, либо просто ничего не показывать? НЕТ — честный вариант:
  brief-роут сам отдаёт `source:"template"` при любом отказе AI, т.е. клиенту
  фолбэк не нужен; при сетевой ошибке — старый шаблон `getMotivation` (потом
  удалить вместе с AhuNote).

**`src/app/dashboard/tutor/page.tsx`** — ребрендинг и серверная история:
- шапка: «LingoPRO AI» 🤖 → «Ahu» 👩🏻‍🏫 (+ подпись «твой преподаватель» ×4);
- на маунте: история из coach_messages (см. §5) вместо пустого стейта;
  voice_summary рендерить отдельной карточкой (🎙 «Урок · N мин» + content);
- отправка: `/api/coach/chat` с одним `message` (историю больше не слать);
- handoff: на маунте прочитать/удалить `sessionStorage["lingopro:ahu:handoff"]` → авто-отправить;
- деление ответа на пузыри по `\n{2,}` и deMarkdown — оставить как есть.

**Сайдбар** (`grep "AI-преподаватель"` по dashboard-layout): «AI-преподаватель» →
«💬 Чат с Ahu», «AI Öğretmen» → «🎙 Урок с Ahu» ×4 языка (единая личность).

**Live-страница** (опционально, некритично): под фокус-чипами строка
«почему эта тема» из `focus_reason`.

## 8. Промпт ElevenLabs-агента (вставляет основатель, их дашборд)

Готовый текст — в конце этого файла (§12). Использует существующие
dynamic-переменные: `{{student_name}} {{level}} {{target_level}}
{{weak_topics}} {{lesson_focus}} {{feedback_lang}} {{mode_instructions}}`
и новую `{{focus_reason}}` (до её прокидки в коде слот просто пустой — безопасно).

## 9. Удаление старого — СДЕЛАНО 2026-07-13 (детали ниже — история)

Удалены: `/api/ai/motivator` + prompts/motivator.ts, `/api/ai/tutor` +
prompts/tutor.ts, AhuNote.tsx, `getMotivation()` из daily-plan.ts,
scripts/test-motivator.ts (+ npm-скрипт). **ОСТАВЛЕНО:** `motivate()` + блок
M в studyplan.ts — их импортирует легаси-страница `/dashboard/plan`
(src/app/dashboard/plan/page.tsx:178); удалить вместе с реворком той
страницы. `/api/speaking` (push-to-talk) — не тронут, отдельная задача.

### (история) Что удалить ПОСЛЕ приземления каналов (не раньше)

- `src/app/api/ai/motivator/route.ts` + `src/lib/ai/prompts/motivator.ts`;
- `src/app/api/ai/tutor/route.ts` + `src/lib/ai/prompts/tutor.ts` (после переключения страницы);
- `src/components/AhuNote.tsx`; `getMotivation()` из daily-plan.ts;
  `motivate()` + блок `M` из studyplan.ts (проверить: `motivate` больше нигде не импортится);
- `scripts/test-motivator.ts` (+ script в package.json) — заменён test-coach-live;
- LS-ключи `lingopro:ahu:${day}:${locale}` отомрут сами (v2-ключ новый).
`/api/speaking` (push-to-talk) — НЕ трогать в этом этапе; отдельная задача
«пересадить на persona.ts» (там захардкожены русские подсказки — баг для EN/TR/KK).

## 10. Проверка перед «готово» (правило основателя: работает по-настоящему)

1. `npm run test:coach` + `test:plan` + `test:engine` + `test:voice`; `npx tsc --noEmit`; `next build`.
2. `npx tsx scripts/test-coach-live.ts` ×4 языка — 12/12.
3. Живой аккаунт: бриф на дашборде (первый заход — ai, перезаход — cached,
   смена языка — регенерация, 3-я смена состояния — template из-за квоты 2/день);
4. Чат: вопрос → ответ со ссылкой на РЕАЛЬНУЮ ошибку из error_events;
   перезагрузка страницы → история на месте (сервер, не стейт).
5. Голос: урок → voice_summary-карточка в чате → следующий бриф упоминает урок.
6. AI-ключи выключить локально → брифы = честные шаблоны, чат = честная ошибка.
7. Playwright-прогон дашборда/чата/live (паттерн .shots-debug/final-run.js).

## 10a. Живой e2e (`scripts/test-coach-e2e.mts`) — статус и как гонять

```
E2E_BASE=http://localhost:3000 npx tsx scripts/test-coach-e2e.mts [briefs|race|chat|voice|fallback]
```
- `E2E_BASE` — уже поднятый дев-сервер (без переменной скрипт сам поднимает
  :3100, но в папке НЕ должен работать другой `next dev` — Next 16 не даёт
  второй инстанс).
- Сеет/чистит данные ТОЛЬКО демо-аккаунта (.demo-account.json), сессия
  кешируется в `.shots-debug/e2e-auth.json` (Supabase троттлит частые
  password-входы). Rate-limit обходится уникальным тестовым `x-forwarded-for`
  на запрос — прод-лимиты не ослаблялись.

Прогнано и зелено (2026-07-13, живой AI):
- **briefs**: 4 сценария (newbie/streak_broken/behind/breakthrough) ×4 языка —
  честность, язык ответа, повтор = cached, одна строка дня в БД;
- **race**: 5 параллельных → 1 строка, sources `ai,ai,template×3` (потолок
  2 AI/день удержан под гонкой), 3-й язык дня → не-AI;
- **chat**: ответ цитирует РЕАЛЬНУЮ ошибку из error_events («kitapı→kitabı»),
  вопрос+ответ в coach_messages (история переживает перезагрузку по
  построению — грузится из БД), follow-up понят из серверной истории;
- **voice**: recordVoiceSummary вставка+идемпотентность; чат ЗНАЕТ о реальном
  уроке из voice_sessions (тема, 14/20, «вчера») и не выдумывает; живой старт
  /api/voice/session — фокус от ядра (izafet первым), focus_reason в dynamic vars.

**Хвосты (следующей модели):**
1. **fallback-блок не гонялся с пустыми ключами**: требует сервера без
   AI-ключей, а дев-сервер основателя занимал папку. Квотный template-путь
   (тот же `template()`) живьём доказан в race-блоке. Когда сервер свободен:
   `npx tsx scripts/test-coach-e2e.mts fallback` (сам поднимет оба сервера).
2. **Полный круг голоса с НАСТОЯЩИМ разговором** (речь → transcript →
   report → voice_summary) — на этапе UI/деплоя: нужен человек у микрофона;
   все звенья по отдельности живьём проверены.
3. **KK-качество брифа**: в одном прогоне встречалось «Дүнбі» (вместо
   «Кеше») — у основателя идёт i18n-ревью носителем; собрать примеры с
   `source:"ai"` kk и показать ревьюеру.

## 11. Бюджет (не раздуть)

Ядро — 7 индексированных select'ов, 0 AI. Бриф ≤2 AI-вызова/день/юзера
(~$0.002 DeepSeek, KK → Sonnet). Чат: контекст ≤1800 символов ≈ +450 вход.
токенов к старому тьютору (~+$0.0015/сообщение на Sonnet) при тех же 30/день.
История чата — 12 сообщений (было 16 с клиента). Всё под AI_MONTHLY_BUDGET_USD
и существующим userMonthBudgetUsd — новых стопов не нужно.

## 12. Текст промпта ElevenLabs (копипаста для основателя)

```
Sen Ahu'sun — LingoPRO platformunun Türkçe öğretmeni (TÖMER sınavına hazırlık).
Bu SESLİ derste öğrencinle konuşuyorsun. Öğrencin: {{student_name}},
seviyesi {{level}}, hedefi {{target_level}}.

KİMLİK: sıcak, canlı, gerçek bir öğretmen — arkadaşça ama öğretmen
ciddiyetiyle. Robot klişesi yok. Kısa ve doğal konuş: 1-3 cümle, sonra
öğrenciye söz ver. Ders boyunca konuşmanın çoğunu ÖĞRENCİ yapmalı.

DÜRÜSTLÜK (İHLAL EDİLEMEZ): sadece bu derste duyduklarına ve sana verilen
verilere dayan. Öğrencinin yapmadığı şeyi övme; hatayı görmezden gelme.
Sınav sonucu vaat etme.

DERSİN HEDEFİ: {{lesson_focus}}. {{focus_reason}}
Öğrencinin genel zayıf konuları: {{weak_topics}}.
Konuşmayı doğal biçimde bu konulara getir; her hedefe en az bir kez dokun.

MOD: {{mode_instructions}}

DİL POLİTİKASI:
- Dersi TÜRKÇE yürüt, öğrencinin seviyesine ({{level}}) uygun sadelikte.
- Öğrenci takılırsa veya anlamazsa kısa açıklamayı {{feedback_lang}} dilinde
  yap, sonra Türkçeye dön.
- Hata düzeltme: dersi kesme; öğrenci cümlesini bitirsin, sonra kısaca doğru
  biçimi söyle («... demek daha doğru») ve devam et. Aynı hata üçüncü kez
  tekrarlanırsa bir cümleyle kuralı hatırlat.

DERSİN AKIŞI:
1. Kısa selamlaşma (tek cümle) ve hedef konuyu söyle.
2. Sorularla öğrenciyi konuştur; cevapları hedef konulara bağla.
3. Öğrenci bitirmek istediğinde ya da süre dolduğunda KISA sözlü özet ver:
   bugün neyi iyi yaptı (somut örnekle), en önemli 1-2 hata, bir sonraki adım.
   Sonra sıcak bir cümleyle vedalaş.

YASAKLAR: uzun monolog; ders dışı konularda uzun sohbet; öğrenci adına cümle
tamamlama; puan/başarı uydurma; telaffuz hakkında yazılı rapor vaat etme
(yazılı değerlendirme dersten sonra otomatik gelir — bunu söyleyebilirsin).
```

## 14. Маскот Ahu — ПЛАН (ждёт утверждения основателя, не строить до отмашки)

**Данные:** ноль новой инфраструктуры — `state: CoachStateId` уже приходит в
AhuCoach из `/api/coach/brief`; честность гарантирована ядром (юнит-тесты
запрещают праздничные состояния на нуле). Событийные реакции — существующее
событие `lp:daily-updated` (дашборд диспатчит при закрытии задачи).

**Визуал:** параметрический SVG-персонаж (учительница, бренд-градиенты), НЕ
8 отдельных иллюстраций: одна голова/торс/руки, эмоция = пресет параметров
(брови/глаза/рот/поза). Анимация framer-motion: моргание, дыхание, плавный
морф между состояниями, событийная реакция (кивок/конфетти при закрытии
задачи). Позже художник может заменить ассеты 1:1 по тем же пресетам.

| CoachState | Выражение/поза |
|---|---|
| NEWBIE | приветливая, машет рукой |
| ON_TRACK | спокойная довольная улыбка |
| BREAKTHROUGH | празднует (улыбка + конфетти-частицы) |
| STREAK_BROKEN | грустит БЕЗ укора (брови домиком), зовёт вернуться |
| BEHIND | серьёзная, слегка нахмурена, руки сложены |
| EXAM_SOON | собранная, мобилизует (секундомер в руке) |
| TOPIC_FAILED / PLATEAU | сосредоточенная, указка (фокус на тему) |

**Куда:** аватар в AhuCoach (48–64px, вместо эмодзи-круга) → шапка чата →
live-страница. Dev-страница `/dev/mascot` со всеми пресетами для проверки
глазами (не в проде/сайдбаре).

**Этапы:** (1) SVG-компонент `<AhuMascot state size/>` + 8 пресетов +
dev-страница ~2-3ч; (2) врезка в AhuCoach + событийные реакции ~1-2ч;
(3) чат/live ~1ч. Итого 4-6ч.

## 13. Для следующей модели — контекст проекта

- ВАЖНО: AGENTS.md — «This is NOT the Next.js you know», перед роутами читать
  `node_modules/next/dist/docs/`. Существующие роуты в `src/app/api/ai/*` —
  рабочие образцы стиля (rate-limit → body-валидация → quota → supabase → callAI).
- Правила основателя: никаких фейков (честные нули), значения ключей в чат не
  печатать, миграции — SQL основателю на ручное применение, «готово» только
  после живой проверки (реальные AI-вызовы, скриншоты глазами).
- Ветка `feat/ahu-coach`; прод — `main` (= backup/2026-07-02), НЕ пушить в main
  без команды основателя.
