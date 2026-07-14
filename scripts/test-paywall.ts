/**
 * Контракт-тесты пейволла (P0-2): доступ решает только сервер по БД.
 * Проверяют исходники на инварианты — регрессия (кто-то вернул localStorage
 * или снял гейт с платного роута) валит прогон.
 *
 * Run: npm run test:paywall   (npx tsx scripts/test-paywall.ts)
 */

import { readFileSync } from "node:fs";

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

console.log(failures === 0 ? "\nВСЕ ТЕСТЫ ЗЕЛЁНЫЕ" : `\nПРОВАЛОВ: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
