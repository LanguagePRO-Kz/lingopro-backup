/**
 * Unit tests for the diagnostic v2 engine (DESIGN-DIAGNOSTIC-V2 §8 acceptance):
 * the staircase converges within ROUTER_MAX questions on synthetic profiles.
 *
 * Run: npm run test:engine   (npx tsx scripts/test-diagnostic-engine.ts)
 */

import {
  applyRouterAnswer,
  computeResultV3,
  initRouter,
  nextRouterQuestion,
  routerDone,
  routerResult,
  ROUTER_MAX,
  score25,
  selfLevelToStart,
  skillBlockLevel,
  overallCefr,
  type RouterState,
} from "../src/lib/diagnostic/engine";
import type { BankItem, BankLevel } from "../src/data/diagnostic-bank";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failures += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

/** Simulate a student who answers correctly iff item.level ≤ trueLevel (+noise). */
function runRouter(
  start: BankLevel,
  answerFn: (item: BankItem, idx: number) => boolean,
  seed = 1,
): RouterState {
  let state = initRouter(start);
  let i = 0;
  while (!routerDone(state)) {
    const q = nextRouterQuestion(state, seed);
    if (!q) break;
    state = applyRouterAnswer(state, q, answerFn(q, i));
    i += 1;
    if (i > ROUTER_MAX + 5) throw new Error("router did not terminate");
  }
  return state;
}

const ORDER: BankLevel[] = ["A1", "A2", "B1", "B2", "C1"];
const atMost = (item: BankItem, level: BankLevel) => ORDER.indexOf(item.level) <= ORDER.indexOf(level);

console.log("— staircase convergence —");
{
  const s = runRouter("A2", (q) => atMost(q, "A2"));
  check("clean A2 → A2", routerResult(s) === "A2", `got ${routerResult(s)} after ${s.asked.length} q`);
  check("clean A2 stops ≤ 12", s.asked.length <= ROUTER_MAX, String(s.asked.length));
}
{
  const s = runRouter("A2", () => true);
  check("all correct → C1", routerResult(s) === "C1", `got ${routerResult(s)}`);
}
{
  const s = runRouter("A2", () => false);
  check("all wrong → A1", routerResult(s) === "A1", `got ${routerResult(s)}`);
}
{
  // ragged B1: solid through A2, coin-flip-ish at B1 (deterministic alternation)
  const s = runRouter("B1", (q, i) => (q.level === "B1" ? i % 2 === 0 : atMost(q, "A2")));
  const r = routerResult(s);
  check("ragged B1 → A2..B1 (conservative)", r === "B1" || r === "A2", `got ${r}`);
}
{
  const s = runRouter("B2", (q) => atMost(q, "B1"));
  check("self-overrated B2 start → B1", routerResult(s) === "B1", `got ${routerResult(s)}`);
}
{
  const s1 = runRouter("A2", (q) => atMost(q, "B1"), 1);
  const s2 = runRouter("A2", (q) => atMost(q, "B1"), 2);
  check("different seeds → different questions", s1.asked.join() !== s2.asked.join());
  check("same result across seeds", routerResult(s1) === routerResult(s2));
}

console.log("— level helpers —");
check("self a1 → A1", selfLevelToStart("a1") === "A1");
check("self unknown → A2", selfLevelToStart("unknown") === "A2");
check("block clamp: A1 → A2", skillBlockLevel("A1") === "A2");
check("block clamp: C1 → B2", skillBlockLevel("C1") === "B2");

console.log("— scoring —");
check("score25: 6/8 → 19", score25(6, 8) === 19, String(score25(6, 8)));
check("score25: 0/8 → 0", score25(0, 8) === 0);
check("score25: 10/10 → 25", score25(10, 10) === 25);
check(
  "cefr correction: weak comprehension drops a level",
  overallCefr("B1", { correct: 1, total: 8 }, { correct: 2, total: 10 }) === "A2",
);
check(
  "cefr correction: decent comprehension keeps level",
  overallCefr("B1", { correct: 5, total: 8 }, { correct: 6, total: 10 }) === "B1",
);

console.log("— result assembly —");
{
  const s = runRouter("A2", (q) => atMost(q, "B1"));
  const res = computeResultV3({
    routerState: s,
    answers: s.history.map((h) => ({
      module: "grammar" as const,
      prompt: h.id,
      topic: h.topic,
      level: h.level,
      correct: h.correct,
      correctAnswer: "",
    })),
    dinleme: { correct: 6, total: 8 },
    okuma: { correct: 7, total: 10 },
    writingText: "Ben İstanbul'da yaşamak istiyorum çünkü deniz var.",
    yazmaPromptId: "y-b1-01",
    minutesDaily: 30,
  });
  check("v3 marker", res.version === 3);
  check("router level B1", res.routerLevel === "B1", String(res.routerLevel));
  check("dinleme 19/25", res.sections?.dinleme === 19, String(res.sections?.dinleme));
  check("okuma 18/25", res.sections?.okuma === 18, String(res.sections?.okuma));
  check("yazma pending", res.sections?.yazma === null);
  check("konusma pending", res.sections?.konusma === null);
  check("totalKnown = 37", res.totalKnown === 37, String(res.totalKnown));
  check("legacy skills has 5 modules", res.skills.length === 5);
  check("byWeakness has no 'listening'", !res.byWeakness.includes("listening"));
  check("writing text kept for deferred review", !!res.writingText);
}

console.log(failures ? `\n${failures} FAILED` : "\nall passed");
process.exit(failures ? 1 : 0);
