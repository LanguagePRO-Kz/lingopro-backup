/**
 * E2E живая проверка каналов единого агента Ahu (DESIGN-COACH §4-6, §10)
 * против ЛОКАЛЬНОГО сервера и РЕАЛЬНОЙ БД/AI:
 *
 *   1. бриф: сценарии новичок/отставание/прорыв/сломанная серия ×4 языка —
 *      честность в каждом состоянии, source=ai → cached, строка в БД;
 *   2. гонки дедупа: 5 параллельных запросов → ровно 1 строка дня;
 *   3. потолок: смена языка = regeneration, 3-й AI-вызов дня → cached/template;
 *   4. чат: ответ ссылается на РЕАЛЬНУЮ ошибку из error_events; вопрос и
 *      ответ сохранены (история переживает перезагрузку по построению);
 *   5. круг голоса: voice_sessions(report) → snapshot → чат знает об уроке;
 *      + recordVoiceSummary против реальной таблицы (вставка + идемпотентность);
 *   6. фолбэк: сервер без AI-ключей → честные шаблоны, не пустота.
 *
 * Требует: .env.local, .demo-account.json, свободные порты 3100/3101.
 * Run: npx tsx scripts/test-coach-e2e.mts            (~10-15 минут)
 *      npx tsx scripts/test-coach-e2e.mts briefs     (только блок 1)
 * Сеет и чистит данные ТОЛЬКО демо-аккаунта. Ключи не печатает.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { chromium, type Page } from "playwright";
import { recordVoiceSummary } from "../src/lib/coach/voice-summary";
import type { VoiceReport } from "../src/lib/ai/prompts/voice-review";

/* ------------------------------- env / clients ---------------------------- */
const env: Record<string, string> = {};
for (const line of readFileSync(resolve(process.cwd(), ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !SERVICE) throw new Error("нет Supabase URL/service-ключа в .env.local");
const admin: SupabaseClient = createClient(URL_, SERVICE);
const acc = JSON.parse(readFileSync(resolve(process.cwd(), ".demo-account.json"), "utf8")) as {
  email: string;
  password: string;
};

/**
 * E2E_BASE      — использовать УЖЕ поднятый сервер (например, дев-сервер
 *                 основателя на :3000) вместо запуска собственного;
 * E2E_NOAI_BASE — уже поднятый сервер БЕЗ AI-ключей для блока fallback.
 * Без переменных скрипт сам поднимает/гасит серверы на 3100/3101
 * (требует, чтобы другой next dev в этой папке НЕ работал).
 */
const EXTERNAL = process.env.E2E_BASE;
const BASE = EXTERNAL ?? "http://localhost:3100";
const BASE_NOAI = process.env.E2E_NOAI_BASE ?? "http://localhost:3101";
const LANGS = ["ru", "en", "tr", "kk"] as const;
const only = process.argv[2]; // briefs | race | chat | voice | fallback

let failures = 0;
const ok = (name: string, cond: boolean, detail = "") => {
  console.log(`  ${cond ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!cond) failures += 1;
};

/* ------------------------------- date helpers ----------------------------- */
function todayInTz(tz: string | null): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz || "UTC", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}
const isoShift = (iso: string, delta: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
};

/* --------------------------------- server --------------------------------- */
function startServer(port: number, extraEnv: Record<string, string> = {}): Promise<ChildProcess> {
  const child = spawn("npx", ["next", "dev", "-p", String(port)], {
    cwd: process.cwd(),
    env: { ...process.env, ...extraEnv },
    stdio: "ignore",
    detached: true,
  });
  return new Promise((res, rej) => {
    const t0 = Date.now();
    const poll = async () => {
      try {
        const r = await fetch(`http://localhost:${port}/api/payments/status?currency=kzt`);
        if (r.ok) return res(child);
      } catch { /* ещё поднимается */ }
      if (Date.now() - t0 > 120_000) return rej(new Error(`сервер :${port} не поднялся за 120с`));
      setTimeout(poll, 1000);
    };
    void poll();
  });
}
const stopServer = (child: ChildProcess) => {
  try { if (child.pid) process.kill(-child.pid, "SIGTERM"); } catch { /* уже мёртв */ }
};

/* ----------------------------------- seed --------------------------------- */
let uid = "";
let TODAY = "";
const d = (n: number) => isoShift(TODAY, n);
const dayRow = (date: string, done: number, total = 5) => ({
  user_id: uid, date, tasks: [], completed_count: done, total_count: total,
});
const masteryRow = (topic: string, strength: number, extra: Record<string, unknown> = {}) => ({
  user_id: uid, topic, strength, success_count: 0, error_count: 0, updated_at: new Date().toISOString(), ...extra,
});

async function wipeStudentData() {
  for (const t of ["coach_messages", "daily_progress", "topic_mastery", "error_events", "mock_results", "voice_sessions"]) {
    const { error } = await admin.from(t).delete().eq("user_id", uid);
    if (error) throw new Error(`wipe ${t}: ${error.message}`);
  }
  // детерминированный профиль (сценарий может переопределить в seed)
  await admin.from("profiles").update({
    study_minutes_daily: 45, target_level: "B2", exam_date: isoShift(TODAY, 87), exam_date_mode: "exact",
  }).eq("id", uid);
}
/** сброс дневных AI-квот тестового аккаунта (гигиена теста, не прода) */
async function resetQuota() {
  await admin.from("ai_usage").delete().eq("user_id", uid).in("feature", ["motivator", "tutor"]);
}

const SCENARIOS: Record<string, { seed: () => Promise<void>; expectState: string; forbid?: RegExp; forbidNote?: string; expect?: RegExp; expectNote?: string }> = {
  newbie: {
    seed: async () => { /* пусто: истории нет вовсе */ },
    expectState: "NEWBIE",
    forbid: /пропус|kaçır|missed|skip|жіберіп|atlad|ара верд|үзіліс/i,
    forbidNote: "«пропуск» новичку — ложь",
  },
  streak_broken: {
    seed: async () => {
      await admin.from("daily_progress").insert([dayRow(d(-5), 5)]);
    },
    expectState: "STREAK_BROKEN",
    forbid: /молодец|aferin|жарайсың|great job|well done/i,
    forbidNote: "похвала пропавшему",
  },
  behind: {
    seed: async () => {
      await admin.from("daily_progress").insert([dayRow(d(-4), 1), dayRow(d(-3), 0), dayRow(d(-2), 0), dayRow(d(-1), 1)]);
      await admin.from("topic_mastery").insert([masteryRow("izafet", 34, { error_count: 2 })]);
    },
    expectState: "BEHIND",
    forbid: /молодец|aferin|жарайсың|great job|well done|harika gidiyor/i,
    forbidNote: "похвала при отставании",
  },
  breakthrough: {
    seed: async () => {
      // без даты экзамена: BEHIND(deadline) у A1→B2 честно перекрыл бы праздник
      await admin.from("profiles").update({ exam_date: null, exam_date_mode: "unknown" }).eq("id", uid);
      await admin.from("daily_progress").insert([dayRow(d(-1), 5), dayRow(TODAY, 2)]);
      await admin.from("topic_mastery").insert([masteryRow("conditionals", 62, { success_count: 4 })]);
    },
    expectState: "BREAKTHROUGH",
    expect: /62|şart|шарт|услов|conditional/i,
    expectNote: "похвала должна нести конкретику (тема/62)",
  },
};

/* ------------------------------- HTTP helpers ------------------------------ */
// rate-limit ключуется по x-forwarded-for (на Vercel его ставит платформа) —
// e2e-бурст получает уникальный тестовый IP на запрос, прод-защита не слабеет
let reqNo = 0;
async function postJson(page: Page, url: string, body: unknown): Promise<{ status: number; json: Record<string, unknown> }> {
  reqNo += 1;
  const r = await page.request.post(url, {
    data: body as Record<string, unknown>,
    timeout: 150_000,
    headers: { "x-forwarded-for": `10.99.${Math.floor(reqNo / 250)}.${(reqNo % 250) + 1}` },
  });
  const json = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: r.status(), json };
}

/* ----------------------------------- main ---------------------------------- */
async function main() {
  let server: ChildProcess | null = null;
  if (EXTERNAL) console.log(`использую внешний сервер: ${BASE}`);
  else {
    console.log("поднимаю dev-сервер :3100 …");
    server = await startServer(3100);
  }
  const browser = await chromium.launch();
  const page = await (await browser.newContext()).newPage();

  try {
    // логин демо-аккаунтом через UI (куки сессии для page.request);
    // ретрай: Supabase временами троттлит частые входы подряд
    let loggedIn = false;
    for (let attempt = 1; attempt <= 3 && !loggedIn; attempt++) {
      await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
      await page.locator('input[type="email"]').fill(acc.email);
      await page.locator('input[type="password"]').fill(acc.password);
      await page.getByRole("button", { name: /Войти|Sign in|Giriş|Кіру/i }).click();
      loggedIn = await page.waitForURL(/dashboard|quiz/, { timeout: 25_000 }).then(() => true).catch(() => false);
      if (!loggedIn) {
        console.log(`  логин: попытка ${attempt} не прошла, жду 15с…`);
        await page.waitForTimeout(15_000);
      }
    }
    if (!loggedIn) throw new Error("логин демо-аккаунтом не удался за 3 попытки");
    console.log("логин OK:", new URL(page.url()).pathname);
    // парковка: живая вкладка кабинета самолечит данные (upsert mastery/plan)
    // и гонится с посевом сценариев — куки уже в контексте, страница не нужна
    await page.goto("about:blank");

    const { data: users } = await admin.auth.admin.listUsers({ perPage: 200 });
    uid = users?.users?.find((u) => u.email === acc.email)?.id ?? "";
    if (!uid) throw new Error("демо-аккаунт не найден");
    const { data: prof } = await admin.from("profiles").select("timezone").eq("id", uid).maybeSingle();
    TODAY = todayInTz((prof?.timezone as string | null) ?? null);

    /* ---------------- 1. брифы: сценарии × языки ---------------- */
    if (!only || only === "briefs") {
      for (const [name, sc] of Object.entries(SCENARIOS)) {
        console.log(`\n— бриф: ${name} —`);
        await wipeStudentData();
        await sc.seed();
        for (const lang of LANGS) {
          await resetQuota(); // каждый язык честно получает свой AI-вызов
          await admin.from("coach_messages").delete().eq("user_id", uid); // чистый день
          const { status, json } = await postJson(page, `${BASE}/api/coach/brief`, { feedbackLang: lang });
          const text = String(json.text ?? "");
          const problems: string[] = [];
          if (status !== 200) problems.push(`HTTP ${status}`);
          if (json.source !== "ai") problems.push(`source=${json.source}`);
          if (json.state !== sc.expectState) problems.push(`state=${json.state}, ждали ${sc.expectState}`);
          if (!text) problems.push("пустой текст");
          if (/[*#|`]/.test(text)) problems.push("markdown");
          const cyr = (text.match(/[а-яёәіңғүұқөһ]/gi) ?? []).length;
          if ((lang === "ru" || lang === "kk") && cyr < text.length * 0.3) problems.push("не на языке интерфейса");
          if ((lang === "en" || lang === "tr") && cyr > 0) problems.push("кириллица в en/tr");
          if (sc.forbid?.test(text)) problems.push(sc.forbidNote!);
          if (sc.expect && !sc.expect.test(text)) problems.push(sc.expectNote!);
          ok(`[${lang}] честный AI-бриф (${json.state})`, problems.length === 0, problems.join("; ") || text.slice(0, 70));
          if (problems.length) console.log(`    «${text}»`);

          // повторный запрос того же языка → cached, БЕЗ нового AI-вызова
          const again = await postJson(page, `${BASE}/api/coach/brief`, { feedbackLang: lang });
          ok(`[${lang}] повтор → cached, тот же текст`, again.json.source === "cached" && again.json.text === text, `source=${again.json.source}`);
        }
        // ровно одна строка дня в БД (языки обновляли её, не плодили)
        const { data: rows } = await admin.from("coach_messages").select("id").eq("user_id", uid).eq("channel", "proactive");
        ok("строка проактива одна", (rows ?? []).length === 1, `строк: ${rows?.length}`);
      }
    }

    /* ---------------- 2. гонки дедупа + потолок дня ---------------- */
    if (!only || only === "race") {
      console.log("\n— гонки дедупа (5 параллельных) —");
      await wipeStudentData();
      await SCENARIOS.behind.seed();
      await resetQuota();
      const five = await Promise.all(
        Array.from({ length: 5 }, () => postJson(page, `${BASE}/api/coach/brief`, { feedbackLang: "ru" })),
      );
      ok("все 5 ответили 200 с непустым текстом", five.every((r) => r.status === 200 && r.json.text));
      const { data: rows } = await admin.from("coach_messages").select("content").eq("user_id", uid).eq("channel", "proactive");
      ok("в БД ровно 1 строка дня (гонка не размножила)", (rows ?? []).length === 1, `строк: ${rows?.length}`);
      const sources = five.map((r) => r.json.source).sort().join(",");
      console.log(`    sources: ${sources} (ai/cached/template — все честные пути)`);

      // потолок: квота motivator = 2/день; ru уже съел 1-2 → en может съесть остаток,
      // третий язык дня обязан отдать cached/template, НЕ пятый AI-вызов
      await postJson(page, `${BASE}/api/coach/brief`, { feedbackLang: "en" });
      const third = await postJson(page, `${BASE}/api/coach/brief`, { feedbackLang: "tr" });
      ok("3-й язык дня → cached|template (потолок 2 AI/день держит)", third.json.source !== "ai", `source=${third.json.source}`);
    }

    /* ---------------- 3. чат: реальная ошибка + серверная история ---------------- */
    if (!only || only === "chat") {
      console.log("\n— чат: контекст и история —");
      await wipeStudentData();
      await resetQuota();
      await admin.from("topic_mastery").insert([masteryRow("izafet", 28, { error_count: 6 })]);
      await admin.from("error_events").insert({
        user_id: uid, source: "writing", topic: "izafet", severity: "major",
        quote: "arkadaşımın kitapı", correction: "arkadaşımın kitabı",
        rule: "İsim tamlaması + ünsüz yumuşaması", explanation: "p→b",
      });
      await admin.from("daily_progress").insert([dayRow(d(-1), 3)]);

      const q1 = await postJson(page, `${BASE}/api/coach/chat`, {
        feedbackLang: "ru",
        message: "Не понимаю, когда после существительного идёт -ı, а когда -sı. Объясни?",
      });
      const t1 = String(q1.json.text ?? "");
      ok("чат ответил 200, без markdown", q1.status === 200 && !!t1 && !/[*#`]/.test(t1), `HTTP ${q1.status}`);
      ok("ответ опирается на РЕАЛЬНУЮ ошибку/тему студента", /kitab|kitapı|изафет|izafet|tamlama/i.test(t1), t1.slice(0, 80));
      console.log(`    «${t1.slice(0, 160).replace(/\n+/g, " ")}…»`);

      const { data: hist1 } = await admin.from("coach_messages").select("role, content").eq("user_id", uid).eq("channel", "chat").order("created_at");
      ok("вопрос и ответ сохранены на сервере (история)", hist1?.length === 2 && hist1[0].role === "student" && hist1[1].role === "ahu", `строк: ${hist1?.length}`);

      // follow-up с опорой на историю: сервер сам поднимает прошлые реплики
      const q2 = await postJson(page, `${BASE}/api/coach/chat`, { feedbackLang: "ru", message: "Дай ещё два примера на это же правило." });
      const t2 = String(q2.json.text ?? "");
      ok("follow-up понят из серверной истории (примеры по теме)", q2.status === 200 && /(-s[ıiuü]|s[ıiuü]$|tamlama|изафет|-ı|kitab)/im.test(t2), t2.slice(0, 80));

      const { data: hist2 } = await admin.from("coach_messages").select("id").eq("user_id", uid).eq("channel", "chat");
      ok("история накапливается (4 реплики)", (hist2 ?? []).length === 4, `строк: ${hist2?.length}`);
    }

    /* ---------------- 4. круг голоса ---------------- */
    if (!only || only === "voice") {
      console.log("\n— круг голоса: урок → снапшот → Ahu знает —");
      await wipeStudentData();
      await resetQuota();
      const report: VoiceReport = {
        valid: true, invalid_reason: null,
        summary: "Урок по изафету: хорошо строишь простые цепочки, дважды потерялось смягчение p→b. Продолжай с притяжательными парами.",
        criteria: { fluency: { score: 3, comment: "" }, grammar: { score: 3, comment: "" }, vocab: { score: 4, comment: "" }, coherence: { score: 4, comment: "" } },
        errors: [], topics_worked: ["izafet"], next_steps: [],
      };
      await admin.from("voice_sessions").insert({
        user_id: uid, mode: "free", seconds: 480,
        started_at: new Date(Date.now() - 86_400_000).toISOString(),
        ended_at: new Date(Date.now() - 86_400_000 + 480_000).toISOString(),
        transcript: { conversation_id: "e2etest_conv_1", items: [] }, report,
      });
      await admin.from("daily_progress").insert([dayRow(d(-1), 4)]);

      // helper против реальной таблицы: вставка + идемпотентность
      await recordVoiceSummary(admin, { userId: uid, conversationId: "e2etest_conv_1", minutes: 8, report });
      await recordVoiceSummary(admin, { userId: uid, conversationId: "e2etest_conv_1", minutes: 8, report });
      const { data: sums } = await admin.from("coach_messages").select("content, meta").eq("user_id", uid).eq("channel", "voice_summary");
      ok("voice_summary вставлен и идемпотентен (1 строка)", sums?.length === 1 && String(sums[0].content).includes("изафету"), `строк: ${sums?.length}`);
      ok("meta несёт минуты и темы", (sums?.[0]?.meta as Record<string, unknown>)?.minutes === 8 && JSON.stringify(sums?.[0]?.meta).includes("izafet"));

      const q = await postJson(page, `${BASE}/api/coach/chat`, { feedbackLang: "ru", message: "Как прошёл мой последний голосовой урок? Что тренировать дальше?" });
      const t = String(q.json.text ?? "");
      ok("Ahu знает о реальном уроке (тема/минуты из БД)", q.status === 200 && /изафет|izafet|tamlama|8 мин|вчера|dün/i.test(t), t.slice(0, 100));
      ok("Ahu не выдумала «урока не было»", !/не было|нет урок|henüz ders|no lesson/i.test(t), t.slice(0, 80));
      console.log(`    «${t.slice(0, 160).replace(/\n+/g, " ")}…»`);

      // бриф тоже видит урок в снапшоте (контекст SON SESLİ DERS) — smoke
      const b = await postJson(page, `${BASE}/api/coach/brief`, { feedbackLang: "ru" });
      ok("бриф после урока жив и честен", b.status === 200 && !!b.json.text, `HTTP ${b.status}`);
    }

    /* ---------------- 5. фолбэк без AI-ключей ---------------- */
    if ((!only || only === "fallback") && EXTERNAL && !process.env.E2E_NOAI_BASE) {
      console.log("\n— фолбэк: ПРОПУЩЕН (внешний сервер занят; подними без ключей и передай E2E_NOAI_BASE) —");
    } else if (!only || only === "fallback") {
      console.log("\n— фолбэк: сервер без AI-ключей —");
      let noai: ChildProcess | null = null;
      if (!process.env.E2E_NOAI_BASE) {
        if (server) stopServer(server);
        server = null;
        await new Promise((r) => setTimeout(r, 3000)); // .next освобождается
        noai = await startServer(3101, { ANTHROPIC_API_KEY: "", DEEPSEEK_API_KEY: "" });
      }
      try {
        await wipeStudentData();
        await resetQuota();
        await SCENARIOS.streak_broken.seed();
        for (const lang of LANGS) {
          const { status, json } = await postJson(page, `${BASE_NOAI}/api/coach/brief`, { feedbackLang: lang });
          const text = String(json.text ?? "");
          ok(`[${lang}] бриф без AI → честный шаблон`, status === 200 && json.source === "template" && text.length > 10, `source=${json.source}`);
        }
        const chat = await postJson(page, `${BASE_NOAI}/api/coach/chat`, { feedbackLang: "ru", message: "test" });
        ok("чат без AI → честная 503 ai_unavailable", chat.status === 503 && chat.json.error === "ai_unavailable", `HTTP ${chat.status}`);
        const { data: rows } = await admin.from("coach_messages").select("id").eq("user_id", uid).eq("channel", "proactive");
        ok("шаблоны НЕ сохранены в БД (день свободен для ожившего AI)", (rows ?? []).length === 0, `строк: ${rows?.length}`);
      } finally {
        if (noai) stopServer(noai);
      }
    }
  } finally {
    await browser.close();
    if (server) stopServer(server);
    // уборка: тестовые данные демо-аккаунта не оставляем
    if (uid) { await wipeStudentData(); await resetQuota(); }
  }

  console.log(failures === 0 ? "\nE2E: ВСЁ ЗЕЛЁНОЕ ✅" : `\nE2E: ПРОВАЛОВ ${failures} ❌`);
  process.exit(failures === 0 ? 0 : 1);
}

void main().catch((e) => {
  console.error("E2E упал:", e);
  process.exit(1);
});
