/**
 * Live test of the daily Ahu note (motivator block 3) through the REAL
 * callAI pipeline: two honesty-critical scenarios × 4 languages.
 *
 *   zero  — nothing done yesterday, streak 0: the note must name the skip
 *           plainly (no "молодец" for zero activity — founder's condition);
 *   solid — real progress: the note must cite the real numbers.
 *
 * Run: npx tsx scripts/test-motivator.ts [lang]
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// .env.local → process.env BEFORE the dynamic import reads the keys
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
  const { buildMotivatorSystem, buildMotivatorUserMessage } = await import("../src/lib/ai/prompts/motivator");

  const scenarios = {
    zero: {
      yesterday: { done: 0, total: 5 },
      streak: 0,
      daysToExam: 113,
      weakTopicTr: "İsim tamlaması (izafet)",
      topicsClosed: 2,
      level: "A2",
      targetLevel: "B2",
    },
    solid: {
      yesterday: { done: 5, total: 5 },
      streak: 4,
      daysToExam: 87,
      weakTopicTr: "Dolaylı anlatım",
      topicsClosed: 7,
      level: "B1",
      targetLevel: "C1",
    },
  } as const;

  const only = process.argv[2] as (typeof LANGS)[number] | undefined;
  let failures = 0;

  for (const lang of only ? [only] : LANGS) {
    for (const [name, facts] of Object.entries(scenarios)) {
      const res = await callAI({
        task: "motivator_note",
        feedbackLang: lang,
        system: buildMotivatorSystem(lang, lang === "ru" ? "female" : null),
        messages: [{ role: "user", content: buildMotivatorUserMessage(facts) }],
        // reasoning model: the budget must cover reasoning + the note itself
        maxTokens: 700,
      });
      const text = res?.text?.trim() ?? "";
      const problems: string[] = [];
      if (!text) problems.push("пустой ответ");
      if (text.length > 400) problems.push(`слишком длинно (${text.length})`);
      if (/[*#|`]|^- /m.test(text)) problems.push("markdown в ответе");
      if (name === "zero" && /молодец|harika|great job|жарайсың|керемет/i.test(text)) problems.push("похвала при нуле активности");

      const status = problems.length ? "✗" : "✓";
      if (problems.length) failures += 1;
      console.log(`\n${status} [${lang}/${name}] via ${res?.provider}/${res?.model}${problems.length ? " — " + problems.join(", ") : ""}`);
      console.log(`  ${text.replace(/\n/g, "\n  ")}`);
    }
  }

  console.log(failures ? `\n${failures} FAILED` : "\nall passed");
  process.exit(failures ? 1 : 0);
}

void main();
