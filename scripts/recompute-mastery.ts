/**
 * Страховка derived-инварианта: полная пересборка topic_mastery из attempts
 * для одного пользователя (recomputeAllMastery). Нужна, если единичный
 * пересчёт после вставки упал (сеть, деплой посреди запроса) и mastery
 * разошёлся с сырьём.
 *
 * ⚠️ ПИШЕТ В БД, НА КОТОРУЮ СМОТРИТ .env.local. Не запускать без явного
 * согласия основателя. Темы без attempts (AI-only: эссе/голос) не трогает.
 *
 * Run: npx tsx scripts/recompute-mastery.ts <user_id>
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { recomputeAllMastery } from "../src/lib/attempts";

const userId = process.argv[2];
if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
  console.error("Usage: npx tsx scripts/recompute-mastery.ts <user_id (uuid)>");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY не найдены в .env.local");
  process.exit(1);
}

async function main() {
  console.log(`БД: ${new URL(url).host}`);
  console.log(`Пересборка topic_mastery из attempts для ${userId}…`);

  const db = createClient(url, key, { auth: { persistSession: false } });
  const { topics } = await recomputeAllMastery(db, userId);
  console.log(
    topics.length > 0
      ? `Пересчитаны темы (${topics.length}): ${topics.join(", ")}`
      : "У пользователя нет попыток с темами — нечего пересчитывать.",
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
