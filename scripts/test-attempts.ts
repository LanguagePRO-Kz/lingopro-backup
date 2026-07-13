/**
 * Юнит-тесты движка попыток (Фаза 1 P0-ядра): маппинг тем тотален,
 * точность взвешена по свежести (полураспад 21 день), <3 попыток не
 * публикует статистику, потолок AI-штрафа −20, самооценка не считается.
 *
 * Run: npm run test:attempts   (npx tsx scripts/test-attempts.ts)
 */

import { readFileSync } from "node:fs";
import { GRAMMAR_TASKS } from "../src/data/grammar-tasks";
import { GRAMMAR_TOPIC_MAP, canonicalTopic } from "../src/data/topic-map";
import { TOPIC_IDS } from "../src/lib/ai/topics";
import {
  AI_PENALTY_CAP,
  computeStrength,
  HALF_LIFE_DAYS,
  MIN_ATTEMPTS_FOR_STATS,
  weightedAccuracy,
  type AttemptForMastery,
} from "../src/lib/attempts";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failures += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const NOW = Date.parse("2026-07-13T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString();
const attempt = (correct: boolean, ageDays: number): AttemptForMastery => ({
  isCorrect: correct,
  answeredAt: daysAgo(ageDays),
});

/* ------------------------- маппинг тем: тотальность ------------------------- */

console.log("\nМаппинг тем грамматики:");
{
  const known = new Set(TOPIC_IDS);
  const unmapped = [...new Set(GRAMMAR_TASKS.map((q) => q.topic))].filter(
    (t) => !(t in GRAMMAR_TOPIC_MAP),
  );
  check(
    "каждая topic-строка банка присутствует в словаре",
    unmapped.length === 0,
    `нет в словаре: ${unmapped.join(", ")}`,
  );

  const badTargets = Object.entries(GRAMMAR_TOPIC_MAP).filter(
    ([, id]) => id !== null && !known.has(id),
  );
  check(
    "каждый канонический id существует в реестре",
    badTargets.length === 0,
    badTargets.map(([k, v]) => `${k}→${v}`).join(", "),
  );

  check(
    "'other' в качестве цели запрещён (null вместо угадывания)",
    Object.values(GRAMMAR_TOPIC_MAP).every((v) => v !== "other"),
  );

  check("известная строка маппится", canonicalTopic("var / yok") === "var_yok");
  check("неизвестная строка → null, не 'other'", canonicalTopic("нет такой темы") === null);

  const nullCount = Object.values(GRAMMAR_TOPIC_MAP).filter((v) => v === null).length;
  console.log(`  (немаппированных концептов: ${nullCount} — осознанные null)`);
}

/* ------------------- взвешенная точность: свежесть решает ------------------- */

console.log("\nВзвешенная точность (полураспад 21 день):");
{
  check("нет попыток → null, не 0 и не 100", weightedAccuracy([], NOW) === null);

  // кейс основателя: 5 ошибок два месяца назад + 5 верных сегодня —
  // тема ВЫУЧЕНА, агент не должен долбить её «50%»
  const learned = [
    ...Array.from({ length: 5 }, () => attempt(false, 60)),
    ...Array.from({ length: 5 }, () => attempt(true, 0)),
  ];
  const accLearned = weightedAccuracy(learned, NOW)!;
  check(
    "выучил тему: старые ошибки перевешены свежими успехами (acc > 0.8)",
    accLearned > 0.8,
    `acc=${accLearned.toFixed(3)}`,
  );
  const res = computeStrength(learned, [], NOW);
  check(
    "выучил тему: strength ≥ 80, тема не «слабая»",
    res.mode === "stats" && res.strength >= 80,
    JSON.stringify(res),
  );

  // зеркальный кейс: старые успехи, свежие ошибки — тема просела СЕЙЧАС
  const regressed = [
    ...Array.from({ length: 5 }, () => attempt(true, 60)),
    ...Array.from({ length: 5 }, () => attempt(false, 0)),
  ];
  const resReg = computeStrength(regressed, [], NOW);
  check(
    "регресс: свежие ошибки роняют strength ниже 30",
    resReg.mode === "stats" && resReg.strength < 30,
    JSON.stringify(resReg),
  );

  // симметрия распада: попытка возрастом ровно в полураспад весит 0.5
  const half = weightedAccuracy([attempt(true, 0), attempt(false, HALF_LIFE_DAYS)], NOW)!;
  check("вес попытки возрастом 21 день = половина свежей (acc = 2/3)", Math.abs(half - 2 / 3) < 1e-9, `acc=${half}`);

  // плоская картина: всё сегодня, 50/50 → ровно 50
  const flat = computeStrength(
    [attempt(true, 0), attempt(false, 0), attempt(true, 0), attempt(false, 0)],
    [],
    NOW,
  );
  check("50/50 одним днём → strength 50", flat.mode === "stats" && flat.strength === 50, JSON.stringify(flat));
}

/* --------------------- мало данных ≠ оценка (правило 1.3) ------------------- */

console.log("\nМало данных (<3 попыток):");
{
  check("константа порога = 3", MIN_ATTEMPTS_FOR_STATS === 3);

  const two = computeStrength([attempt(true, 0), attempt(true, 1)], [], NOW);
  check("2 верных → режим sparse, статистика НЕ публикуется", two.mode === "sparse");
  check(
    "2 верных → seed 66 (50+8+8), не 100%",
    two.mode === "sparse" && two.seedStrength === 66,
    JSON.stringify(two),
  );

  const oneWrong = computeStrength([attempt(false, 0)], [], NOW);
  check(
    "1 ошибка → seed 38 (50−12), как посев диагностики",
    oneWrong.mode === "sparse" && oneWrong.seedStrength === 38,
    JSON.stringify(oneWrong),
  );

  const three = computeStrength([attempt(true, 0), attempt(true, 0), attempt(true, 0)], [], NOW);
  check("3 попытки → уже статистика", three.mode === "stats");
}

/* ------------------------- потолок AI-штрафа: −20 --------------------------- */

console.log("\nШтраф за AI-ошибки:");
{
  const perfect = Array.from({ length: 10 }, () => attempt(true, 1));

  const sixMajor = computeStrength(
    perfect,
    Array.from({ length: 6 }, () => ({ severity: "major" as const })),
    NOW,
  );
  check(
    "6 major (−72 без потолка) → штраф капится: 100−20=80",
    sixMajor.mode === "stats" && sixMajor.strength === 100 - AI_PENALTY_CAP,
    JSON.stringify(sixMajor),
  );

  const oneMinor = computeStrength(perfect, [{ severity: "minor" }], NOW);
  check("1 minor → 100−6=94", oneMinor.mode === "stats" && oneMinor.strength === 94, JSON.stringify(oneMinor));

  const floor = computeStrength(
    Array.from({ length: 5 }, () => attempt(false, 0)),
    Array.from({ length: 3 }, () => ({ severity: "major" as const })),
    NOW,
  );
  check("пол нуля: 0 − штраф не уходит в минус", floor.mode === "stats" && floor.strength === 0, JSON.stringify(floor));
}

/* --------- владение sparse-строкой (поймано живым прогоном 13.07) ---------- */

console.log("\nВладение sparse-строкой topic_mastery:");
{
  // доступ к внутренней сборке через recomputeAllMastery невозможен без БД —
  // проверяем контракт через исходник: keepExisting требует hasAiEvidence
  const src = readFileSync("src/lib/attempts.ts", "utf8");
  check(
    "sparse сохраняет существующую строку ТОЛЬКО при следе посева/AI (hasAiEvidence)",
    src.includes('res.mode === "sparse" && b.existing != null && b.hasAiEvidence'),
  );
  check(
    "наличие AI-следа определяется по error_events за всю историю, не за окно штрафа",
    src.includes("hasAiEvidence: allErrors.length > 0"),
  );
  // сама seed-формула: 1 верная + 1 неверная = 50+8−12 = 46, ошибка не исчезает
  const mixed = computeStrength([attempt(true, 0), attempt(false, 0)], [], NOW);
  check(
    "строка, рождённая попытками: 1 верная + 1 ошибка → seed 46 (ошибка видна)",
    mixed.mode === "sparse" && mixed.seedStrength === 46,
    JSON.stringify(mixed),
  );
}

/* -------------- самооценка: фильтруется ДО расчёта (по контракту) ----------- */

console.log("\nСамооценка (is_self_reported):");
{
  // computeStrength принимает уже отфильтрованные попытки — контракт держат
  // recomputeTopicMastery/recomputeAllMastery (.eq is_self_reported false) и
  // шапка грамматики. Здесь фиксируем сам контракт: флэшкарты не добавляют
  // попыток в расчёт → режим остаётся sparse.
  const onlyVerified = computeStrength([attempt(true, 0), attempt(true, 0)], [], NOW);
  check(
    "2 проверенных + N самооценок = всё ещё sparse (самооценки не в выборке)",
    onlyVerified.mode === "sparse",
  );
  const src = readFileSync("src/lib/attempts.ts", "utf8");
  check(
    "recompute-запросы фильтруют is_self_reported = false",
    (src.match(/\.eq\("is_self_reported", false\)/g) ?? []).length >= 2,
  );
  const hook = readFileSync("src/lib/hooks/useSkillStats.ts", "utf8");
  check("счётчик разделов (useSkillStats) фильтрует is_self_reported", hook.includes('.eq("is_self_reported", false)'));
  const stats = readFileSync("src/lib/hooks/useStats.ts", "utf8");
  check("страница статистики (useStats) фильтрует is_self_reported", stats.includes('.eq("is_self_reported", false)'));
  for (const page of ["grammar", "reading", "listening"] as const) {
    const src2 = readFileSync(`src/app/dashboard/${page}/page.tsx`, "utf8");
    check(`${page} читает счётчик через useSkillStats`, src2.includes("useSkillStats"));
  }
}

/* --------------------------------- итог ------------------------------------ */

console.log(failures === 0 ? "\nВСЕ ТЕСТЫ ЗЕЛЁНЫЕ" : `\nПРОВАЛОВ: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
