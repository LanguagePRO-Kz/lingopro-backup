/**
 * Контракт-тесты пейволла (P0-2): доступ решает только сервер по БД.
 * Проверяют исходники на инварианты — регрессия (кто-то вернул localStorage
 * или снял гейт с платного роута) валит прогон.
 *
 * Run: npm run test:paywall   (npx tsx scripts/test-paywall.ts)
 */

import { readFileSync } from "node:fs";

import { trialDaysLeft, trialLeftLabel } from "../src/lib/trial";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failures += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}
const src = (p: string) => readFileSync(p, "utf8");

console.log("\nСерверный гейт страниц:");
{
  const layout = src("src/app/dashboard/layout.tsx");
  check("layout дашборда — серверный компонент (нет 'use client')", !layout.includes('"use client"'));
  check("layout читает plan + plan_expires_at из БД", layout.includes("plan, plan_expires_at"));
  check("нет плана → redirect на /pricing", layout.includes('redirect("/pricing")'));
  check("нет сессии → redirect на /login", layout.includes('redirect("/login")'));

  const shell = src("src/app/dashboard/DashboardShell.tsx");
  check("шелл не читает localStorage-план", !shell.includes("loadPlan") && !shell.includes("lingopro:plan"));
  check("баннер триала присутствует", shell.includes('plan === "trial"'));
}

console.log("\n402-гейты платных API:");
{
  const GATED = [
    "src/app/api/coach/brief/route.ts",
    "src/app/api/coach/chat/route.ts",
    "src/app/api/voice/session/route.ts",
    "src/app/api/speaking/route.ts",
    "src/app/api/ai/writing/route.ts",
    "src/app/api/ai/route/route.ts",
    "src/app/api/attempts/route.ts",
  ];
  for (const f of GATED) {
    check(`${f.replace("src/app/api/", "")} требует requireActivePlan`, src(f).includes("requireActivePlan"));
  }
  const attempts = src("src/app/api/attempts/route.ts");
  check("attempts: диагностика проходит БЕЗ плана", attempts.includes('source !== "diagnostic"'));

  // бесплатные по решению основателя — гейта быть НЕ должно
  const FREE = [
    "src/app/api/ai/diagnostic-writing/route.ts",
    "src/app/api/voice/session/end/route.ts",
    "src/app/api/voice/session/wrap/route.ts",
    "src/app/api/payments/checkout/route.ts",
  ];
  for (const f of FREE) {
    check(`${f.replace("src/app/api/", "")} НЕ гейтится (воронка/сеттл/покупка)`, !src(f).includes("requireActivePlan"));
  }
}

console.log("\nКлиент не решает и не пишет доступ:");
{
  const billing = src("src/lib/billing.ts");
  check("savePlan/loadPlan удалены из billing.ts", !billing.includes("savePlan") || !billing.includes("localStorage"));
  const profile = src("src/lib/profile.ts");
  check("saveProfilePlan удалён (клиент не пишет plan)", !profile.includes("export const saveProfilePlan"));
  const modal = src("src/components/CheckoutModal.tsx");
  check("CheckoutModal не пишет план сам (триал выдаёт RPC)", !modal.includes("saveProfilePlan") && !modal.includes("savePlan("));
  check("кнопка оплаты отключается при провайдере off", modal.includes('payState === "off"') && modal.includes("paySoon"));
  const access = src("src/lib/access.ts");
  check("requireActivePlan проверяет срок (plan_expires_at > now)", access.includes("Date.parse(expiresAt) <= Date.now()"));
}

console.log("\nЧестный остаток триала (правило 1.3: не завышать):");
{
  const H = 3_600_000;
  const eq = (name: string, got: string, want: string) =>
    check(name, got === want, `got «${got}», want «${want}»`);

  // главный кейс бага: часы БД на секунды впереди сервера рендера —
  // сразу после выдачи 3-дневного триала остаток 72ч00м30с, НЕ «4 дня»
  eq("72ч + 30с перекоса → «осталось 3 дня» (не 4!)", trialLeftLabel(72 * H + 30_000, "ru"), "осталось 3 дня");
  eq("71ч → «осталось 3 дня» (допуск +1ч к границе суток)", trialLeftLabel(71 * H, "ru"), "осталось 3 дня");
  eq("70ч → «осталось 2 дня» (дальше допуска — вниз)", trialLeftLabel(70 * H, "ru"), "осталось 2 дня");
  eq("25ч → «остался 1 день» (не «2 дня»)", trialLeftLabel(25 * H, "ru"), "остался 1 день");
  eq("20ч → «осталось меньше суток» (не «1 день», не «0 дней»)", trialLeftLabel(20 * H, "ru"), "осталось меньше суток");
  eq("2ч → «осталось 2 часа»", trialLeftLabel(2 * H, "ru"), "осталось 2 часа");
  eq("1ч05м → «остался 1 час»", trialLeftLabel(H + 5 * 60_000, "ru"), "остался 1 час");
  eq("30 мин → «осталось меньше часа»", trialLeftLabel(30 * 60_000, "ru"), "осталось меньше часа");
  eq("7 суток → «осталось 7 дней» (plural)", trialLeftLabel(7 * 24 * H, "ru"), "осталось 7 дней");
  eq("21 сутки → «остался 21 день» (plural)", trialLeftLabel(21 * 24 * H, "ru"), "остался 21 день");
  check("допуск не длиннее часа: 70ч59м ещё «2 дня»", trialDaysLeft(71 * H - 60_000) === 2);
  eq("en: 72ч+30с → «3 days left»", trialLeftLabel(72 * H + 30_000, "en"), "3 days left");
  eq("tr: 72ч+30с → «3 gün kaldı»", trialLeftLabel(72 * H + 30_000, "tr"), "3 gün kaldı");
  eq("kk: 72ч+30с → «3 күн қалды»", trialLeftLabel(72 * H + 30_000, "kk"), "3 күн қалды");

  // системный инвариант: показанные дни НИКОГДА не превышают реальный
  // остаток больше чем на 1 час (перебор с шагом 10 минут на 8 сутках)
  let honest = true;
  for (let ms = 0; ms <= 8 * 24 * H; ms += 10 * 60_000) {
    if (trialDaysLeft(ms) * 24 * H > ms + H) { honest = false; break; }
  }
  check("инвариант: дни × 24ч ≤ остаток + 1ч на всей шкале 0–8 суток", honest);
}

console.log(failures === 0 ? "\nВСЕ ТЕСТЫ ЗЕЛЁНЫЕ" : `\nПРОВАЛОВ: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
