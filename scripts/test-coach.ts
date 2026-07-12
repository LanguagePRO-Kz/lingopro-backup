/**
 * Юнит-тесты ядра единого агента Ahu (src/lib/coach/) — фундамент честности:
 * новичок не получает «пропустил», ноль активности не хвалится, «пропал» —
 * только при реальной прошлой активности, BEHIND — только при реальном
 * дефиците, контекст не превышает потолок, ключ дедупа стабилен.
 *
 * Run: npm run test:coach   (npx tsx scripts/test-coach.ts)
 */

import { detectStates, isoShift, daysBetween } from "../src/lib/coach/states";
import { decide, shouldHintReplan } from "../src/lib/coach/decide";
import { buildAhuContext, MAX_CONTEXT_CHARS } from "../src/lib/coach/context";
import { coachFallbackText } from "../src/lib/coach/templates";
import { buildAhuSystem, matchesFeedbackLang } from "../src/lib/coach/persona";
import type { StudentSnapshot } from "../src/lib/coach/types";
import type { Locale } from "../src/lib/i18n";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failures += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const TODAY = "2026-07-12";
const d = (n: number) => isoShift(TODAY, n); // d(-1) = вчера

const snap = (over: Partial<StudentSnapshot> = {}): StudentSnapshot => ({
  today: TODAY,
  name: "Dana",
  gender: "female",
  level: "A2",
  targetLevel: "B2",
  daysToExam: null,
  minutesDaily: 45,
  routeWeek: null,
  feasibility: null,
  days: [],
  topics: [],
  recentErrors: [],
  lastMock: null,
  prevMock: null,
  lastVoice: null,
  topicsClosed: 0,
  ...over,
});

const day = (date: string, done: number, total = 5) => ({ date, done, total });
const topic = (id: string, strength: number, extra: Partial<StudentSnapshot["topics"][0]> = {}) => ({
  topic: id,
  strength,
  errorCount: 0,
  successCount: 0,
  lastErrorAt: null,
  lastPracticedAt: null,
  updatedAt: null,
  ...extra,
});

const LOCALES: Locale[] = ["ru", "en", "tr", "kk"];
// та же регулярка, что ловила ложь мотиватора новичку (test-motivator, fresh)
const SKIP_LIE = /пропус|kaçır|missed|skip|жіберіп|atlad|ара верд|үзіліс|kayb/i;

/* ------------------------------ date utils ------------------------------- */
console.log("— date utils —");
check("isoShift через границу месяца", isoShift("2026-07-01", -1) === "2026-06-30");
check("daysBetween", daysBetween("2026-07-05", TODAY) === 7);

/* -------------------------------- NEWBIE ---------------------------------- */
console.log("— NEWBIE: новичку нельзя врать про пропуск —");
{
  const s = snap(); // пустая история
  const states = detectStates(s);
  check("пустая история → единственное состояние NEWBIE", states.length === 1 && states[0].id === "NEWBIE");

  const s2 = snap({ days: [day(TODAY, 0)] }); // строка только за сегодня
  check("строка только за сегодня → всё ещё NEWBIE", detectStates(s2)[0].id === "NEWBIE");

  const s3 = snap({ daysToExam: 5 }); // даже с близким экзаменом
  check("NEWBIE перекрывает EXAM_SOON", detectStates(s3)[0].id === "NEWBIE" && detectStates(s3).length === 1);

  const dec = decide(s);
  for (const loc of LOCALES) {
    const text = coachFallbackText(s, dec, loc);
    check(`шаблон NEWBIE (${loc}) без лжи про пропуск`, !SKIP_LIE.test(text), text);
  }
  const ctx = buildAhuContext(s, dec, "proactive");
  check("контекст NEWBIE несёт директиву «Kaçırdın DEME»", ctx.includes("Kaçırdın") && ctx.includes("DEME"));
  check("контекст NEWBIE без «ARA VERDİ»", !ctx.includes("ARA VERDİ"));
}

/* ------------------------- ноль активности ≠ похвала ---------------------- */
console.log("— ноль активности: не хвалим, не празднуем —");
{
  const s = snap({
    days: [day(d(-6), 0), day(d(-5), 0), day(d(-4), 0), day(d(-3), 0), day(d(-2), 0), day(d(-1), 0), day(TODAY, 0)],
  });
  const states = detectStates(s);
  const dec = decide(s, states);
  check("нет BREAKTHROUGH на нуле", states.every((st) => st.id !== "BREAKTHROUGH"));
  check("action ≠ celebrate на нуле", dec.action !== "celebrate");
  check("нулевая неделя с планом → BEHIND (честный дефицит)", states.some((st) => st.id === "BEHIND"));
  for (const loc of LOCALES) {
    const text = coachFallbackText(s, dec, loc);
    check(
      `шаблон нулевой недели (${loc}) без «молодец/harika/aferin/жарайсың»`,
      !/молодец|harika|aferin|жарайсың|great job|well done/i.test(text),
      text,
    );
  }
}

/* ------------------------------ STREAK_BROKEN ----------------------------- */
console.log("— STREAK_BROKEN только при реальной прошлой активности —");
{
  const never = snap({ days: [day(d(-5), 0), day(d(-4), 0), day(d(-3), 0)] });
  check("никогда не занимался → не STREAK_BROKEN", detectStates(never).every((st) => st.id !== "STREAK_BROKEN"));

  const gap = snap({ days: [day(d(-5), 5), day(TODAY, 0)] });
  const gapStates = detectStates(gap);
  const broken = gapStates.find((st) => st.id === "STREAK_BROKEN");
  check("активность 5 дн. назад, потом тишина → STREAK_BROKEN", !!broken);
  check(
    "…с честным числом дней (5)",
    broken?.id === "STREAK_BROKEN" && broken.daysSinceActivity === 5,
    JSON.stringify(broken),
  );

  const fresh = snap({ days: [day(d(-1), 3), day(TODAY, 0)] });
  check("занимался вчера → не STREAK_BROKEN", detectStates(fresh).every((st) => st.id !== "STREAK_BROKEN"));
}

/* --------------------------------- BEHIND --------------------------------- */
console.log("— BEHIND только при реальном дефиците —");
{
  const notEnough = snap({
    days: [day(d(-1), 5)],
    feasibility: { verdict: "notEnough", loadPct: 140 },
  });
  const st = detectStates(notEnough).find((x) => x.id === "BEHIND");
  check("verdict notEnough → BEHIND(deadline)", st?.id === "BEHIND" && st.reason === "deadline");

  const lowWeek = snap({ days: [day(d(-3), 1), day(d(-2), 1), day(d(-1), 2)] }); // 4/15 = 27%
  const st2 = detectStates(lowWeek).find((x) => x.id === "BEHIND");
  check("27% недели → BEHIND(week_completion)", st2?.id === "BEHIND" && st2.reason === "week_completion");
  check("…с честным процентом 27", st2?.id === "BEHIND" && st2.weekDonePct === 27, JSON.stringify(st2));

  const okWeek = snap({ days: [day(d(-3), 3), day(d(-2), 2), day(d(-1), 3)] }); // 8/15 = 53%
  check("53% недели → не BEHIND", detectStates(okWeek).every((x) => x.id !== "BEHIND"));

  const fewDays = snap({ days: [day(d(-2), 0), day(d(-1), 0)] }); // только 2 плановых дня
  check("2 плановых дня → рано судить, не BEHIND", detectStates(fewDays).every((x) => x.id !== "BEHIND"));
}

/* ------------------------------ BREAKTHROUGH ------------------------------ */
console.log("— BREAKTHROUGH: только измеримое событие —");
{
  const closed = snap({
    days: [day(d(-1), 5)],
    topics: [topic("izafet", 64, { updatedAt: `${TODAY}T10:00:00Z` })],
  });
  const st = detectStates(closed).find((x) => x.id === "BREAKTHROUGH");
  check("тема 64 (60+8 окно), обновлена сегодня → topic_closed", st?.id === "BREAKTHROUGH" && st.kind === "topic_closed");

  const old = snap({
    days: [day(d(-1), 5)],
    topics: [topic("izafet", 76, { updatedAt: `${TODAY}T10:00:00Z` })],
  });
  check("тема давно 76 → не BREAKTHROUGH", detectStates(old).every((x) => x.id !== "BREAKTHROUGH"));

  const jump = snap({
    days: [day(d(-1), 5)],
    lastMock: { total: 65, createdAt: `${TODAY}T09:00:00Z` },
    prevMock: { total: 50, createdAt: `${d(-6)}T09:00:00Z` },
  });
  const st2 = detectStates(jump).find((x) => x.id === "BREAKTHROUGH");
  check("mock 50→65 сегодня → mock_jump(+15)", st2?.id === "BREAKTHROUGH" && st2.kind === "mock_jump" && st2.mockDelta === 15);

  const small = snap({
    days: [day(d(-1), 5)],
    lastMock: { total: 58, createdAt: `${TODAY}T09:00:00Z` },
    prevMock: { total: 50, createdAt: `${d(-6)}T09:00:00Z` },
  });
  check("+8 балла → не BREAKTHROUGH (порог 10)", detectStates(small).every((x) => x.id !== "BREAKTHROUGH"));

  const stale = snap({
    days: [day(d(-1), 5)],
    lastMock: { total: 65, createdAt: `${d(-5)}T09:00:00Z` },
    prevMock: { total: 50, createdAt: `${d(-9)}T09:00:00Z` },
  });
  check("скачок 5 дней назад → уже не событие дня", detectStates(stale).every((x) => x.id !== "BREAKTHROUGH"));
}

/* --------------------------------- PLATEAU -------------------------------- */
console.log("— PLATEAU: стабильная активность + лежащая слабая тема —");
{
  const active5 = [day(d(-5), 3), day(d(-4), 3), day(d(-3), 3), day(d(-2), 3), day(d(-1), 3)];
  const plateau = snap({
    days: active5,
    topics: [topic("conditionals", 40, { lastPracticedAt: `${d(-6)}T10:00:00Z` })],
  });
  const st = detectStates(plateau).find((x) => x.id === "PLATEAU");
  check("5 активных дней + тема 40 лежит 6 дн. → PLATEAU", st?.id === "PLATEAU" && st.daysSincePracticed === 6);

  const touched = snap({
    days: active5,
    topics: [topic("conditionals", 40, { lastPracticedAt: `${d(-1)}T10:00:00Z` })],
  });
  check("тему трогали вчера → не PLATEAU", detectStates(touched).every((x) => x.id !== "PLATEAU"));

  const lazy = snap({
    days: [day(d(-1), 3), day(d(-2), 3)],
    topics: [topic("conditionals", 40, { lastPracticedAt: `${d(-6)}T10:00:00Z` })],
  });
  check("2 активных дня → не PLATEAU (мало данных)", detectStates(lazy).every((x) => x.id !== "PLATEAU"));
}

/* ------------------------------- приоритеты ------------------------------- */
console.log("— приоритет состояний детерминирован —");
{
  const s = snap({
    daysToExam: 10,
    days: [day(d(-5), 4), day(d(-4), 0), day(d(-3), 0), day(d(-2), 0), day(d(-1), 0)],
    topics: [topic("izafet", 20, { lastErrorAt: `${d(-2)}T10:00:00Z` })],
  });
  const ids = detectStates(s).map((x) => x.id);
  check(
    "EXAM_SOON > STREAK_BROKEN > TOPIC_FAILED > BEHIND",
    JSON.stringify(ids) === JSON.stringify(["EXAM_SOON", "STREAK_BROKEN", "TOPIC_FAILED", "BEHIND"]),
    ids.join(","),
  );
  check("dayKey = today#topState", decide(s).dayKey === `${TODAY}#EXAM_SOON`);
}

/* --------------------------------- decide --------------------------------- */
console.log("— решения —");
{
  const failed = snap({
    days: [day(d(-1), 5)],
    topics: [topic("izafet", 20), topic("conditionals", 45), topic("accusative", 50), topic("ablative", 55)],
    routeWeek: { index: 2, total: 10, themeTr: "Şart kipi", topics: ["conditionals", "participles"] },
  });
  const dec = decide(failed);
  check("TOPIC_FAILED → suggest_voice по теме", dec.action === "suggest_voice" && dec.actionTopic === "izafet");
  check(
    "фокус: тема состояния → слабые∩неделя → слабые (кап 3)",
    JSON.stringify(dec.focusTopics) === JSON.stringify(["izafet", "conditionals", "accusative"]),
    dec.focusTopics.join(","),
  );

  const onTrackDone = snap({ days: [day(d(-1), 5), day(TODAY, 5, 5)] });
  check("ON_TRACK, день закрыт → action none", decide(onTrackDone).action === "none");
  const onTrackMid = snap({ days: [day(d(-1), 5), day(TODAY, 1, 5)] });
  check("ON_TRACK, день не закрыт → suggest_task", decide(onTrackMid).action === "suggest_task");

  check(
    "replanHint: mock 30 при цели B2 (бар 60, разрыв 30) без даты → true",
    shouldHintReplan(snap({ lastMock: { total: 30, createdAt: `${d(-1)}T09:00:00Z` } })) === true,
  );
  check(
    "replanHint: разрыв 10 → false",
    shouldHintReplan(snap({ lastMock: { total: 50, createdAt: `${d(-1)}T09:00:00Z` } })) === false,
  );
  check(
    "replanHint: у самой даты (20 дн.) → false",
    shouldHintReplan(snap({ daysToExam: 20, lastMock: { total: 30, createdAt: `${d(-1)}T09:00:00Z` } })) === false,
  );
}

/* --------------------------------- контекст -------------------------------- */
console.log("— контекст: потолок и честные секции —");
{
  const longQuote = "Ben dün okulda çok uzun bir cümle kurdum ve içinde birçok hata vardı çünkü izafet zincirini hiç anlamıyorum ".repeat(2);
  const fat = snap({
    name: "Очень Длинное Имя Студента Для Проверки Потолка",
    daysToExam: 45,
    routeWeek: { index: 3, total: 12, themeTr: "İsim tamlaması ve zincirleri", topics: ["izafet", "conditionals"] },
    feasibility: { verdict: "tight", loadPct: 92 },
    days: [day(d(-3), 2), day(d(-2), 3), day(d(-1), 1), day(TODAY, 1)],
    topics: [
      topic("izafet", 22, { errorCount: 7 }),
      topic("conditionals", 35, { errorCount: 4 }),
      topic("accusative", 41, { errorCount: 2 }),
      topic("participles", 55),
    ],
    recentErrors: Array.from({ length: 10 }, (_, i) => ({
      quote: longQuote,
      correction: longQuote,
      topic: "izafet",
      source: "writing",
      createdAt: `${d(-1)}T1${i % 10}:00:00Z`,
    })),
    lastMock: { total: 55, createdAt: `${d(-2)}T09:00:00Z` },
    prevMock: { total: 48, createdAt: `${d(-9)}T09:00:00Z` },
    lastVoice: { endedAt: `${d(-1)}T18:00:00Z`, minutes: 9, topicsWorked: ["izafet", "conditionals"], errorCount: 3, criteriaTotal: 12 },
    topicsClosed: 4,
  });
  const dec = decide(fat);
  const ctx = buildAhuContext(fat, dec, "chat");
  check(`жирный снапшот ≤ потолка (${MAX_CONTEXT_CHARS})`, ctx.length <= MAX_CONTEXT_CHARS, `len=${ctx.length}`);
  check("обязательные секции выжили: ÖĞRENCİ/DURUM/PLAN/KARAR", ["ÖĞRENCİ", "DURUM", "PLAN", "KARAR"].every((k) => ctx.includes(k)));

  const empty = snap({ days: [day(d(-1), 2)] });
  const ctxEmpty = buildAhuContext(empty, decide(empty), "proactive");
  check("пустые секции опущены (нет ZAYIF/HATA/DENEME/SESLİ)", ["ZAYIF", "HATA", "DENEME", "SESLİ"].every((k) => !ctxEmpty.includes(k)));
  check("канальная строка proactive", ctxEmpty.includes("BUGÜNKÜ kısa notunu"));
  check("канальная строка chat", ctx.includes("arka plan bilgisi"));
}

/* -------------------------------- шаблоны --------------------------------- */
console.log("— шаблоны: все состояния ×4 языка —");
{
  const cases: [string, StudentSnapshot][] = [
    ["NEWBIE", snap()],
    ["EXAM_SOON", snap({ daysToExam: 7, days: [day(d(-1), 3)] })],
    ["STREAK_BROKEN", snap({ days: [day(d(-4), 3)] })],
    ["TOPIC_FAILED", snap({ days: [day(d(-1), 3)], topics: [topic("izafet", 20)] })],
    [
      "BEHIND",
      snap({ days: [day(d(-3), 1), day(d(-2), 0), day(d(-1), 1)] }),
    ],
    [
      "BREAKTHROUGH",
      snap({ days: [day(d(-1), 5)], topics: [topic("izafet", 62, { updatedAt: `${TODAY}T10:00:00Z` })] }),
    ],
    [
      "PLATEAU",
      snap({
        days: [day(d(-5), 3), day(d(-4), 3), day(d(-3), 3), day(d(-2), 3), day(d(-1), 3)],
        topics: [topic("conditionals", 40, { lastPracticedAt: `${d(-7)}T10:00:00Z` })],
      }),
    ],
    ["ON_TRACK", snap({ days: [day(d(-1), 5), day(TODAY, 2)] })],
  ];
  for (const [expected, s] of cases) {
    const dec = decide(s);
    check(`фикстура даёт ${expected}`, dec.state.id === expected, dec.state.id);
    for (const loc of LOCALES) {
      const text = coachFallbackText(s, dec, loc);
      check(`шаблон ${expected} (${loc}) непустой и без markdown`, text.length > 10 && !/[*#_`]/.test(text), text.slice(0, 60));
    }
  }
}

/* --------------------------- язык ответа (guard) --------------------------- */
console.log("— matchesFeedbackLang: страж языка ответа —");
{
  check("турецкий текст при ru → false", !matchesFeedbackLang("Şart kipi bugün kapandı, tebrikler.", "ru"));
  check("русский текст при ru → true", matchesFeedbackLang("Тема закрыта — 62 из 100, отличный шаг.", "ru"));
  check("казахский при kk → true", matchesFeedbackLang("Тақырып жабылды — күш 62/100, жақсы қадам.", "kk"));
  check("русский при en → false (кириллица)", !matchesFeedbackLang("Тема закрыта.", "en"));
  check("англ. с турецкой цитатой при en → true", matchesFeedbackLang('"Şart kipi" closed at 62/100 — solid.', "en"));
  check("пустой текст → false", !matchesFeedbackLang("", "ru"));
}

/* -------------------------------- persona --------------------------------- */
console.log("— persona: единая личность —");
{
  const sys = buildAhuSystem({ channel: "chat", lang: "ru", gender: "female" });
  check("это Ahu", sys.includes("Sen Ahu'sun"));
  check("честность: раздел İHLAL EDİLEMEZ", sys.includes("İHLAL EDİLEMEZ"));
  check("запрет markdown", sys.includes("MARKDOWN KESİNLİKLE YASAK"));
  check("гендерная форма (жен.)", sys.includes("dişil"));
  check("язык ответа RUSÇA", sys.includes("RUSÇA"));
  const pro = buildAhuSystem({ channel: "proactive", lang: "kk", gender: null });
  check("канал proactive: ≤35 слов", pro.includes("35 kelime"));
  check("канал proactive: KAZAKÇA", pro.includes("KAZAKÇA"));
  check("proactive не содержит чат-формата", !pro.includes("2-4 KISA mesaja"));
}

/* ---------------------------------- итог ---------------------------------- */
console.log(failures === 0 ? "\nВСЕ ТЕСТЫ ЗЕЛЁНЫЕ ✅" : `\nПРОВАЛОВ: ${failures} ❌`);
process.exit(failures === 0 ? 0 : 1);
