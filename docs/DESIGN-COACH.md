# DESIGN-COACH — единый автономный агент Ahu

**Статус на 2026-07-12 (ветка `feat/ahu-coach`):** слой 1 (ядро) и слой 2
(личность) ГОТОВЫ и проверены; каналы и UI — TODO по этому чертежу.
Прод (`main`) не тронут: всё в ветке, старые тьютор/мотиватор работают как раньше.

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
| `supabase/migrations/0010_coach.sql` | память агента `coach_messages` + RLS + дедуп | ждёт применения основателем |
| `src/lib/ai/mastery.ts` | добавлен экспорт `STRENGTH_GAIN` (нужен детекту BREAKTHROUGH) | — |

Уроки живых прогонов, уже вшитые в persona/context (НЕ ослаблять):
- языковое требование продублировано ПОСЛЕДНЕЙ строкой промпта («SON KONTROL») — DeepSeek иначе отвечает по-турецки при feedbackLang=ru;
- запрет начинать с имени/приветствия — явно «ни своим (Ahu), ни именем студента»;
- сила темы в контексте всегда «güç N/100», иначе модель превращает «60+» в «60 вопросов»;
- проактивный шаг — только СУЩЕСТВУЮЩАЯ вещь (задание плана / урок / пробный / настройки), модель иначе выдумывает «тест уровня».

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

## 4. TODO-канал 1: `POST /api/coach/brief` (заменяет /api/ai/motivator)

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

## 5. TODO-канал 2: `POST /api/coach/chat` (заменяет /api/ai/tutor)

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

## 6. TODO-канал 3: голос (два точечных врезания, роуты НЕ переименовывать)

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

## 7. TODO-UI

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

## 9. Что удалить ПОСЛЕ приземления каналов (не раньше)

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

## 13. Для следующей модели — контекст проекта

- ВАЖНО: AGENTS.md — «This is NOT the Next.js you know», перед роутами читать
  `node_modules/next/dist/docs/`. Существующие роуты в `src/app/api/ai/*` —
  рабочие образцы стиля (rate-limit → body-валидация → quota → supabase → callAI).
- Правила основателя: никаких фейков (честные нули), значения ключей в чат не
  печатать, миграции — SQL основателю на ручное применение, «готово» только
  после живой проверки (реальные AI-вызовы, скриншоты глазами).
- Ветка `feat/ahu-coach`; прод — `main` (= backup/2026-07-02), НЕ пушить в main
  без команды основателя.
