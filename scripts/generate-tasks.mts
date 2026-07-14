/**
 * Фоновый генератор заданий + QA-проход (Фаза 7.5).
 *
 * Пайплайн: Sonnet генерит N вопросов по теме/уровню → структурная валидация
 * → «злой экзаменатор» (DeepSeek, ДРУГОЙ провайдер) судит КАЖДЫЙ вопрос по
 * чек-листу (ровно один верный / уровень / ключ=объяснению / естественность)
 * → approved уходит в generated_tasks, rejected хранится для аудита.
 *
 * ⚠️ С флагом --apply ПИШЕТ В БД из .env.local и тратит AI-вызовы.
 * Без флага — печатает результат, в БД не пишет.
 *
 * Run: npx tsx scripts/generate-tasks.mts --topic <id> --level A2 --count 5 [--apply]
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
for (const [k, v] of Object.entries(env)) process.env[k] ??= v as string;

const { callAI } = await import("../src/lib/ai");
const { resolveModel } = await import("../src/lib/ai/models");
const { topicById } = await import("../src/lib/ai/topics");
const { buildTaskGenSystem, buildTaskQASystem, validateGeneratedTasks, validateQaVerdict } = await import(
  "../src/lib/ai/prompts/task-gen"
);

function arg(name: string): string | null {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? (process.argv[i + 1] ?? null) : null;
}
const topicId = arg("topic");
const level = arg("level") ?? "A2";
const count = Math.min(10, Math.max(1, Number(arg("count") ?? 5)));
const apply = process.argv.includes("--apply");

if (!topicId || !topicById(topicId)) {
  console.error("Usage: npx tsx scripts/generate-tasks.mts --topic <реестровый id> --level A1..C1 --count N [--apply]");
  process.exit(1);
}

async function main() {
  console.log(`тема=${topicId} уровень=${level} count=${count} · режим: ${apply ? "APPLY (пишет!)" : "dry-run"}\n`);

  const genModel = resolveModel("task_gen");
  const qaModel = resolveModel("task_qa");

  const gen = await callAI({
    task: "task_gen",
    feedbackLang: "ru",
    system: buildTaskGenSystem({ topicId: topicId!, level, count }),
    messages: [{ role: "user", content: `${count} soru üret.` }],
    maxTokens: 4000,
    json: true,
  });
  const tasks = validateGeneratedTasks(gen?.parsed, topicId!, level);
  console.log(`сгенерировано структурно валидных: ${tasks.length}/${count}\n`);
  if (tasks.length === 0) process.exit(1);

  const admin = apply
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false },
      })
    : null;

  let approved = 0;
  let rejected = 0;
  for (const t of tasks) {
    const qa = await callAI({
      task: "task_qa",
      feedbackLang: "ru",
      system: buildTaskQASystem(level),
      messages: [
        {
          role: "user",
          content: `Soru: ${t.question}\nŞıklar: ${t.options.map((o, i) => `${i}) ${o}`).join(" | ")}\nDoğru cevap indeksi: ${t.correctAnswer}\nAçıklama: ${t.explanation}`,
        },
      ],
      maxTokens: 1500,
      json: true,
    });
    const verdict = validateQaVerdict(qa?.parsed);
    // судья недоступен/ответил мусором → НЕ одобряем (сомнение = red)
    const ok = verdict?.approved === true;
    if (ok) approved += 1;
    else rejected += 1;
    console.log(
      `${ok ? "✓ APPROVED" : "✗ REJECTED"} «${t.question.slice(0, 70)}»` +
        (verdict && !ok ? ` — ${verdict.problems.join("; ").slice(0, 140) || "флаги: " + JSON.stringify(verdict)}` : "") +
        (!verdict ? " — QA-судья не ответил" : ""),
    );
    if (admin) {
      const { error } = await admin.from("generated_tasks").insert({
        skill: "grammar",
        level,
        topic: topicId,
        payload: { question: t.question, options: t.options, correctAnswer: t.correctAnswer, explanation: t.explanation },
        qa: verdict ?? { approved: false, problems: ["qa_unavailable"] },
        status: ok ? "approved" : "rejected",
        gen_model: `${genModel.provider}/${genModel.model}`,
        qa_model: `${qaModel.provider}/${qaModel.model}`,
      });
      if (error) console.error("  [insert failed]", error.message);
    }
  }
  console.log(`\nитог: approved=${approved}, rejected=${rejected}${apply ? " (записано в generated_tasks)" : " (dry-run, БД не тронута)"}`);
}

await main();
