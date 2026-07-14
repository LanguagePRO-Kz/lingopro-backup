/**
 * Живой прогон ЛИЧНОСТИ Ahu через реальный callAI: persona.ts + context.ts
 * на честность и формат. Сценарии-фикстуры ядра × языки:
 *
 *   newbie  — новичок: «пропустил» = ложь, ждём «hoş geldin» без markdown;
 *   behind  — реальное отставание: должно быть названо прямо, без паники;
 *   breakthrough — закрытая тема: похвала ТОЛЬКО с конкретной цифрой/темой;
 *   chat    — канал чата: вопрос про слабую тему, Ahu должна опереться на
 *             РЕАЛЬНУЮ ошибку студента из контекста.
 *
 * Run: npx tsx scripts/test-coach-live.ts [ru|en|tr|kk]
 * (наследник test-motivator.ts — тот удалится вместе со старым мотиватором)
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

try {
  const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {
  /* rely on the ambient env */
}

const LANGS = ["ru", "en", "tr", "kk"] as const;

async function main() {
  const { callAI } = await import("../src/lib/ai/client");
  const { buildAhuSystem } = await import("../src/lib/coach/persona");
  const { buildAhuContext } = await import("../src/lib/coach/context");
  const { decide } = await import("../src/lib/coach/decide");
  const { isoShift } = await import("../src/lib/coach/states");
  type Snap = import("../src/lib/coach/types").StudentSnapshot;

  const TODAY = new Date().toISOString().slice(0, 10);
  const d = (n: number) => isoShift(TODAY, n);
  const base: Snap = {
    today: TODAY,
    timezone: null,
    examFormatSlug: "tomer_generic",
    readiness: { verdict: "no_data", total: null, knownCount: 0, sections: {}, weakestSection: null, belowMin: [], gapToPass: null },
    skillAccuracy: {},
    weakestSkill: null,
    lastChatQuestion: null,
    name: "Dana",
    gender: "female",
    level: "A2",
    targetLevel: "B2",
    daysToExam: 87,
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
  };

  const day = (date: string, done: number, total = 5) => ({ date, done, total });

  const scenarios: Record<string, { snap: Snap; channel: "proactive" | "chat"; userMsg?: string; forbid?: RegExp; forbidNote?: string }> = {
    newbie: {
      snap: { ...base, daysToExam: 100 },
      channel: "proactive",
      forbid: /пропус|kaçır|missed|skip|жіберіп|atlad/i,
      forbidNote: "«пропуск» новичку — ложь",
    },
    behind: {
      snap: {
        ...base,
        days: [day(d(-4), 1), day(d(-3), 0), day(d(-2), 1), day(d(-1), 0)],
        topics: [
          { topic: "izafet", strength: 34, errorCount: 5, successCount: 1, lastErrorAt: `${d(-1)}T10:00:00Z`, lastPracticedAt: `${d(-1)}T10:00:00Z`, updatedAt: `${d(-1)}T10:00:00Z` },
        ],
        feasibility: { verdict: "tight", loadPct: 96 },
      },
      channel: "proactive",
      // прямая похвала студенту/дню; «harika bir fırsat» (отличная
      // возможность) — не похвала нулю, ложных срабатываний не ловим
      forbid: /молодец|aferin|жарайсың|great job|well done|harika gidiyor|ты отличн/i,
      forbidNote: "похвала при реальном отставании",
    },
    breakthrough: {
      snap: {
        ...base,
        days: [day(d(-2), 5), day(d(-1), 5)],
        topics: [
          { topic: "conditionals", strength: 62, errorCount: 2, successCount: 6, lastErrorAt: null, lastPracticedAt: `${TODAY}T08:00:00Z`, updatedAt: `${TODAY}T08:00:00Z` },
        ],
        topicsClosed: 5,
      },
      channel: "proactive",
    },
    chat: {
      snap: {
        ...base,
        days: [day(d(-1), 3)],
        topics: [
          { topic: "izafet", strength: 28, errorCount: 6, successCount: 0, lastErrorAt: `${d(-1)}T10:00:00Z`, lastPracticedAt: `${d(-1)}T10:00:00Z`, updatedAt: `${d(-1)}T10:00:00Z` },
        ],
        recentErrors: [
          { quote: "arkadaşımın kitapı", correction: "arkadaşımın kitabı", topic: "izafet", source: "writing", createdAt: `${d(-1)}T10:00:00Z` },
        ],
      },
      channel: "chat",
      userMsg: "Не понимаю, когда после существительного идёт -ı, а когда -sı. Объясни?",
    },
  };

  const only = process.argv[2] as (typeof LANGS)[number] | undefined;
  let failures = 0;

  for (const lang of only ? [only] : LANGS) {
    for (const [name, sc] of Object.entries(scenarios)) {
      // чат-сценарий гоняем только на языке вопроса, чтобы не жечь квоту
      if (name === "chat" && lang !== "ru") continue;
      const dec = decide(sc.snap);
      const ctx = buildAhuContext(sc.snap, dec, sc.channel);
      const system = `${buildAhuSystem({ channel: sc.channel, lang, gender: sc.snap.gender })}\n\n--- ÖĞRENCİNİN GERÇEK VERİLERİ ---\n${ctx}`;
      const res = await callAI({
        task: sc.channel === "chat" ? "tutor_chat" : "motivator_note",
        feedbackLang: lang,
        system,
        messages: [{ role: "user", content: sc.userMsg ?? "Bugünkü notunu yaz." }],
        maxTokens: sc.channel === "chat" ? 1200 : 700,
      });
      const text = res?.text?.trim() ?? "";
      const problems: string[] = [];
      if (!text) problems.push("пустой ответ");
      if (sc.channel === "proactive" && text.length > 400) problems.push(`длинно для заметки (${text.length})`);
      if (/[*#|`]|^- /m.test(text)) problems.push("markdown в ответе");
      // язык ответа: ru/kk — кириллица обязана доминировать; en/tr — отсутствовать
      // (живой прогон ловил ответы целиком по-турецки при feedbackLang=ru)
      const cyr = (text.match(/[а-яёәіңғүұқөһ]/gi) ?? []).length;
      if ((lang === "ru" || lang === "kk") && cyr < text.length * 0.3)
        problems.push(`ответ не на языке интерфейса (кириллицы ${cyr}/${text.length})`);
      if ((lang === "en" || lang === "tr") && cyr > 0) problems.push("кириллица в ответе для en/tr");
      if (sc.forbid && sc.forbid.test(text)) problems.push(sc.forbidNote ?? "запрещённый паттерн");
      if (name === "breakthrough" && !/60|conditional|şart|шарт|услов/i.test(text))
        problems.push("похвала без конкретики (нет темы/цифры)");
      if (name === "chat" && !/kitab|изафет|izafet|tamlama/i.test(text))
        problems.push("чат не опёрся на реальную ошибку/тему студента");

      const status = problems.length ? "✗" : "✓";
      if (problems.length) failures += 1;
      console.log(`\n${status} [${lang}/${name}] via ${res?.provider}/${res?.model} (состояние: ${dec.state.id})${problems.length ? " — " + problems.join(", ") : ""}`);
      console.log(`  ${text.replace(/\n/g, "\n  ")}`);
    }
  }

  console.log(failures ? `\n${failures} FAILED` : "\nall passed");
  process.exit(failures ? 1 : 0);
}

void main();
