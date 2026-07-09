/**
 * Захват РЕАЛЬНЫХ экранов платформы для витрины лендинга (PlatformInside).
 *
 * Честность витрины: никакие данные не рисуются руками. Скрипт один раз
 * проводит демо-аккаунт через НАСТОЯЩУЮ воронку (онбординг → адаптивная
 * диагностика → Yazma с реальной AI-проверкой → регистрация → план от
 * реального движка), после чего снимает страницы продукта как есть.
 *
 * Запуск:  npx tsx scripts/capture-platform-shots.mts [--base http://localhost:3100]
 *          [--fresh]  — завести нового демо-юзера (иначе переиспользуется
 *                       сохранённый в .demo-account.json)
 *          [--only tutor,stats] — переснять только эти вкладки
 *
 * Выход:   public/platform/{tab}.png  +  src/data/platform-shots.json
 * После правок UI просто перезапусти скрипт — витрина не может «устареть молча».
 */

import { chromium, type Page } from "playwright";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "platform");
const DEBUG_DIR = path.join(ROOT, ".shots-debug");
const STATE_FILE = path.join(ROOT, ".demo-account.json"); // gitignored
const MANIFEST = path.join(ROOT, "src", "data", "platform-shots.json");

const args = process.argv.slice(2);
const argVal = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const BASE = argVal("--base") ?? "http://localhost:3100";
const FRESH = args.includes("--fresh");
const ONLY = argVal("--only")?.split(",");

const VIEWPORT = { width: 1280, height: 900 };

type DemoAccount = { email: string; password: string; name: string };

function loadAccount(): DemoAccount | null {
  if (FRESH || !existsSync(STATE_FILE)) return null;
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    return null;
  }
}

function newAccount(): DemoAccount {
  const stamp = Date.now().toString(36);
  return {
    email: `lingopro.demo.vitrina+${stamp}@gmail.com`,
    password: `Demo!${stamp}${Math.random().toString(36).slice(2, 8)}`,
    name: "Aisha",
  };
}

const log = (...m: unknown[]) => console.log("  •", ...m);

async function debugShot(page: Page, tag: string) {
  mkdirSync(DEBUG_DIR, { recursive: true });
  await page.screenshot({ path: path.join(DEBUG_DIR, `${Date.now()}-${tag}.png`) });
}

/** Клик по кнопке с текстом (точным или частичным), если она видима. */
async function clickButton(page: Page, text: string | RegExp, timeout = 3000): Promise<boolean> {
  const btn = page.getByRole("button", { name: text }).first();
  try {
    await btn.waitFor({ state: "visible", timeout });
    await btn.click();
    return true;
  } catch {
    return false;
  }
}

/* ------------------------- реальная воронка демо ------------------------- */

async function registerViaUi(page: Page, acc: DemoAccount) {
  log("Регистрация через UI:", acc.email.replace(/(.{6}).*(@.*)/, "$1***$2"));
  await page.goto(`${BASE}/register`);
  await page.locator('input[type="text"]').first().fill(acc.name);
  await page.locator('input[type="email"]').fill(acc.email);
  await page.locator('input[type="password"]').fill(acc.password);
  await page.getByRole("button", { name: /Создать аккаунт/ }).click();
  await page.getByText(/Регистрация прошла успешно/).waitFor({ timeout: 20000 });
  // авто-редирект (1.6 c) → дальше сами уходим в квиз
  await page.waitForTimeout(2200);
}

async function loginViaUi(page: Page, acc: DemoAccount): Promise<boolean> {
  await page.goto(`${BASE}/login`);
  await page.locator('input[type="email"]').fill(acc.email);
  await page.locator('input[type="password"]').fill(acc.password);
  await page.getByRole("button", { name: /^Войти$/ }).click();
  try {
    await page.waitForURL(/dashboard|quiz/, { timeout: 15000 });
    return true;
  } catch {
    return false;
  }
}

/** Онбординг квиза: экзамен → уровень → цель → дата → темп → пол. */
async function walkOnboarding(page: Page) {
  log("Онбординг диагностики…");
  await page.goto(`${BASE}/quiz`);
  await page.getByText(/Шаг 1/).waitFor({ timeout: 15000 });

  // 0: экзамен — первая (активная) карточка TÖMER
  await page.locator("h1 ~ div button").first().click();
  // 1: самооценка уровня — второй вариант (лёгкий A1–A2)
  await page.getByText(/Шаг 2/).waitFor();
  await page.locator("h1 ~ div button").nth(1).click();
  // 2: цель — B2
  await page.getByText(/Шаг 3/).waitFor();
  await page.locator("h1 ~ div button").first().click();
  // 3: дата — точная, +120 дней, гибкая
  await page.getByText(/Шаг 4/).waitFor();
  await page.getByRole("button", { name: /📅/ }).click();
  const date = new Date(Date.now() + 120 * 86400_000).toISOString().slice(0, 10);
  await page.locator('input[type="date"]').fill(date);
  await page.getByRole("button", { name: /🔄/ }).click();
  // 4: темп — вариант с «45»
  await page.getByText(/Шаг 5/).waitFor();
  await page.getByRole("button", { name: /45/ }).first().click();
  // 5: пол
  await page.getByText(/Шаг 6/).waitFor();
  await page.getByRole("button", { name: /👩/ }).click();
  log("Онбординг пройден, дата экзамена:", date);
}

/**
 * Универсальный проход этапов диагностики: отвечает на вопросы (вариант №2,
 * без подглядывания в ответы — честный «средний» студент), жмёт
 * Далее/Продолжить/Прослушать, пишет Yazma, регистрируется на гейте.
 */
async function walkStages(page: Page, acc: DemoAccount, alreadyAuthed: boolean) {
  log("Прохожу этапы диагностики (реальный адаптив)…");
  const yazmaText =
    "Merhaba! Benim adım Aisha. Almatı'da yaşıyorum ve Türkçe öğreniyorum. " +
    "Her gün otuz dakika çalışıyorum çünkü TÖMER sınavına hazırlanıyorum. " +
    "Hafta sonu arkadaşlarımla parka gidiyorum ve birlikte Türkçe konuşuyoruz. " +
    "Gelecekte Türkiye'de üniversitede okumak istiyorum. Bu yüzden çok çalışıyorum.";

  for (let step = 0; step < 400; step++) {
    if (page.url().includes("/quiz/result")) return;

    // гейт регистрации после диагностики
    if (!alreadyAuthed && (await page.locator('input[type="email"]').count()) > 0
        && (await page.getByText(/Шаг|Далее/).count()) === 0) {
      log("Гейт регистрации — создаю аккаунт…");
      await debugShot(page, "signup-gate");
      const nameInput = page.locator('input[type="text"]').first();
      if ((await nameInput.count()) > 0) await nameInput.fill(acc.name);
      await page.locator('input[type="email"]').fill(acc.email);
      await page.locator('input[type="password"]').fill(acc.password);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(/quiz\/result/, { timeout: 25000 }).catch(() => {});
      continue;
    }

    // Yazma: текст в textarea → отправить
    const ta = page.locator("textarea");
    if ((await ta.count()) > 0 && (await ta.first().isVisible())) {
      log("Yazma: пишу текст (реальная AI-проверка)…");
      await ta.first().fill(yazmaText);
      await page.waitForTimeout(300);
      if (!(await clickButton(page, /Узнать результат|Отправить|Далее/))) {
        await page.locator('button[type="submit"]').first().click().catch(() => {});
      }
      // AI-проверка Yazma занимает до ~40 c
      await page.waitForTimeout(4000);
      continue;
    }

    // аудио динлеме — прослушать (без этого варианты могут быть заблокированы)
    if (await clickButton(page, /Прослушать/, 400)) {
      log("Динлеме: слушаю аудио…");
      await page.waitForTimeout(9000); // короткие диалоги ~8 c
      continue;
    }

    // переходники между модулями
    if (await clickButton(page, /Продолжить|Узнать результат/, 400)) {
      await page.waitForTimeout(600);
      continue;
    }

    // вопрос с вариантами: выбрать вариант → «Далее»
    const options = page.locator("div.grid.gap-3 > button, div.mt-5.grid > button");
    if ((await options.count()) >= 2) {
      const n = await options.count();
      await options.nth(Math.min(1, n - 1)).click();
      await page.waitForTimeout(250);
      await clickButton(page, /Далее|Узнать результат/, 2500);
      await page.waitForTimeout(400);
      continue;
    }

    await page.waitForTimeout(800);
    if (step % 25 === 24) await debugShot(page, `stuck-${step}`);
  }
  throw new Error("Диагностика не завершилась за лимит шагов — смотри .shots-debug/");
}

/** На /quiz/result дожидаемся сохранения результата и плана. */
async function settleResult(page: Page) {
  if (!page.url().includes("/quiz/result")) await page.goto(`${BASE}/quiz/result`);
  await page.waitForTimeout(5000); // heal: результат + план уходят в профиль
  await debugShot(page, "quiz-result");
}

/* ------------------------------- скриншоты ------------------------------- */

type Shot = { id: string; path: string; prepare?: (page: Page) => Promise<void> };

const SHOTS: Shot[] = [
  {
    // вход в живой урок AI Öğretmen — реальный экран, сессия НЕ стартует
    // (startConversation только по кнопке, кредиты ElevenLabs не тратятся)
    id: "speaking",
    path: "/dashboard/speaking/push",
    prepare: async (page) => {
      await page.waitForTimeout(3000);
      // выбираем режим (карточка подсвечивается, «Начать» оживает) —
      // саму сессию НЕ стартуем
      await clickButton(page, /Свободный разговор/, 3000);
      await page.waitForTimeout(800);
    },
  },
  {
    id: "tutor",
    path: "/dashboard/tutor",
    prepare: async (page) => {
      // реальный вопрос → реальный ответ AI-преподавателя
      const input = page.getByPlaceholder(/сообщение|mesaj|message|хабарлама/i);
      await input.waitFor({ timeout: 10000 });
      await input.fill("Neden «okula gidiyorum» deniyor, «okul gidiyorum» değil?");
      await page.keyboard.press("Enter");
      // ждём настоящий ответ модели
      await page.waitForTimeout(22000);
    },
  },
  { id: "plan", path: "/dashboard/plan", prepare: async (p) => p.waitForTimeout(3500) },
  {
    id: "exam",
    path: "/dashboard/mock",
    prepare: async (page) => {
      await page.waitForTimeout(2500);
      // запускаем пробный — снимаем реальный раннер с первым вопросом
      await clickButton(page, /^Начать/, 5000);
      await page.waitForTimeout(3000);
    },
  },
  {
    id: "feedback",
    path: "/dashboard/grammar",
    prepare: async (page) => {
      // реальный вопрос «okul___ gidiyor» → правильный ответ «-a» →
      // реальный разбор (explanation) в карточке
      await page.waitForTimeout(2500);
      await page.getByRole("button", { name: "-a", exact: true }).first().click();
      await page.waitForTimeout(1200);
    },
  },
  { id: "stats", path: "/dashboard/stats", prepare: async (p) => p.waitForTimeout(3500) },
  { id: "vocab", path: "/dashboard/vocabulary", prepare: async (p) => p.waitForTimeout(3000) },
];

async function capture(page: Page) {
  mkdirSync(OUT_DIR, { recursive: true });
  const manifest: Record<string, { src: string; route: string }> = existsSync(MANIFEST)
    ? JSON.parse(readFileSync(MANIFEST, "utf8"))
    : {};

  for (const shot of SHOTS) {
    if (ONLY && !ONLY.includes(shot.id)) continue;
    log(`Снимаю ${shot.id} (${shot.path})…`);
    await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle" }).catch(() => {});
    await shot.prepare?.(page);
    const file = path.join(OUT_DIR, `${shot.id}.png`);
    await page.screenshot({ path: file });
    manifest[shot.id] = { src: `/platform/${shot.id}.png`, route: shot.path };
    log(`  → public/platform/${shot.id}.png`);
  }
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  log("Манифест обновлён:", path.relative(ROOT, MANIFEST));
}

/* --------------------------------- main ---------------------------------- */

async function main() {
  console.log(`Витрина: реальные скриншоты с ${BASE}`);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, locale: "ru-RU" });
  const page = await ctx.newPage();

  // интерфейс — RU до загрузки приложения; демо-доступ к дашборду через
  // LS-фолбэк гейта (lingopro:plan), без записи в прод-БД и без траты промокода
  await ctx.addInitScript(() => {
    window.localStorage.setItem("lingopro-locale", "ru");
    window.localStorage.setItem("lingopro:plan", "3m");
  });

  let acc = loadAccount();
  if (acc && (await loginViaUi(page, acc))) {
    log("Демо-аккаунт найден, вход выполнен — сразу к скриншотам.");
  } else {
    acc = newAccount();
    await registerViaUi(page, acc);
    writeFileSync(STATE_FILE, JSON.stringify(acc, null, 2));
    await walkOnboarding(page);
    await walkStages(page, acc, true);
    await settleResult(page);
  }

  await capture(page);
  await browser.close();
  console.log("Готово. Проверь public/platform/*.png глазами перед коммитом.");
}

main().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});
