/**
 * Unit tests for the plan engine (DESIGN-PLAN-ENGINE §8 acceptance):
 * route validation/fallback, feasibility verdicts on boundary inputs,
 * day layout budget ±10% and the mock schedule.
 *
 * Run: npm run test:plan   (npx tsx scripts/test-plan-engine.ts)
 */

import {
  fallbackRoute,
  validateRoute,
  weeksCount,
  mockPolicyForWeek,
  needsRegen,
  type RouteInputs,
} from "../src/lib/plan/route";
import { assessFeasibility } from "../src/lib/plan/feasibility";
import { buildDay, dueReviews, mocksForDay, type MasteryRow } from "../src/lib/plan/layout";
import { TOPIC_IDS } from "../src/lib/ai/topics";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failures += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const TODAY = "2026-07-08";
const plusDays = (n: number) => {
  const d = new Date(Date.parse(TODAY) + n * 86_400_000);
  return d.toISOString().slice(0, 10);
};

const baseInputs: RouteInputs = {
  level: "A2",
  targetLevel: "B2",
  examDate: plusDays(70),
  minutesDaily: 45,
  weakTopics: ["izafet", "conditionals"],
  routeStartedAt: TODAY,
};

console.log("— weeks / mock schedule —");
check("70 days → 10 weeks", weeksCount(baseInputs, TODAY) === 10, String(weeksCount(baseInputs, TODAY)));
check("horizon 3mo → 13 weeks", weeksCount({ horizonMonths: 3 }, TODAY) === 13);
check("no date → 12 weeks", weeksCount({}, TODAY) === 12);
check("10 days → clamped to 4 weeks", weeksCount({ examDate: plusDays(10) }, TODAY) === 4);
check("week 1 @70d → section", mockPolicyForWeek(1, 70) === "section");
check("week 7 @70d → full (28 left)", mockPolicyForWeek(7, 70) === "full");
check("unknown date → section", mockPolicyForWeek(5, null) === "section");

console.log("— fallback route —");
{
  const r = fallbackRoute(baseInputs, TODAY);
  check("weeks = horizon", r.weeks.length === 10, String(r.weeks.length));
  check("model = fallback", r.model === "fallback");
  check("weak topics first", r.weeks[0].topics.includes("izafet"));
  const all = r.weeks.flatMap((w) => w.topics);
  check("all topics from registry", all.every((t) => TOPIC_IDS.includes(t)));
  check("every week has 2-4 topics", r.weeks.every((w) => w.topics.length >= 2 && w.topics.length <= 4));
  check("no above-target topics", !all.some((t) => ["discourse_connectors", "nominalization_advanced", "register_style"].includes(t)));
}

console.log("— validateRoute —");
{
  check("garbage → null", validateRoute({ weeks: "x" }, baseInputs, TODAY, "m") === null);
  const raw = {
    weeks: [
      { theme: { ru: "Падежи" }, topics: ["izafet", "NOT_A_TOPIC", "ablative"], skillsEmphasis: { grammar: 2, reading: 1 } },
      { theme: { ru: "Времена" }, topics: ["future_acak", "aorist_general"] },
      { theme: { ru: "x" }, topics: ["ONLY_BAD"] }, // dropped entirely
      { theme: { ru: "Залоги" }, topics: ["passive_voice"] },
      { theme: { ru: "Условия" }, topics: ["conditionals"] },
    ],
  };
  const r = validateRoute(raw, baseInputs, TODAY, "test-model");
  check("valid route parsed", r !== null);
  if (r) {
    check("bad topic dropped", !r.weeks[0].topics.includes("NOT_A_TOPIC"));
    check("weights normalized", Math.abs((r.weeks[0].skillsEmphasis.grammar ?? 0) - 0.667) < 0.01);
    check("padded to horizon", r.weeks.length === 10, String(r.weeks.length));
    check("mock schedule enforced", r.weeks[6].mockPolicy === "full");
  }
}

console.log("— needsRegen —");
{
  const r = fallbackRoute(baseInputs, TODAY);
  check("same inputs → false", !needsRegen(r, baseInputs));
  check("minutes changed → true", needsRegen(r, { ...baseInputs, minutesDaily: 15 }));
  check("no route → true", needsRegen(null, baseInputs));
}

console.log("— feasibility —");
{
  // 10 topics × 90 min / (45 × 0.7) = 900/31.5 ≈ 29 days needed
  const ok = assessFeasibility({ remainingTopics: 10, minutesDaily: 45, daysLeft: 60 });
  check("plenty of time → ok", ok.verdict === "ok", ok.verdict);
  const tight = assessFeasibility({ remainingTopics: 10, minutesDaily: 45, daysLeft: 30 });
  check("just fits → tight", tight.verdict === "tight", tight.verdict);
  const not = assessFeasibility({ remainingTopics: 10, minutesDaily: 15, daysLeft: 30, todayIso: TODAY });
  check("15 min & 30 days → notEnough", not.verdict === "notEnough", not.verdict);
  check("offers minutesNeeded", not.verdict === "notEnough" && (not.minutesNeeded ?? 0) > 15);
  check("offers dateNeeded", not.verdict === "notEnough" && !!not.dateNeeded);
  const unk = assessFeasibility({ remainingTopics: 10, minutesDaily: 30, daysLeft: null });
  check("no date → unknown verdict", unk.verdict === "unknown");
}

console.log("— day layout —");
{
  const route = fallbackRoute(baseInputs, TODAY);
  const mastery: MasteryRow[] = [
    { topic: "izafet", strength: 30, error_count: 3, last_error_at: plusDays(-10), last_practiced_at: null },
    { topic: "conditionals", strength: 45, error_count: 1, last_error_at: plusDays(-2), last_practiced_at: null },
    { topic: "ablative", strength: 80, error_count: 1, last_error_at: plusDays(-30), last_practiced_at: null },
  ];

  const due = dueReviews(mastery, TODAY);
  check("strong topic not due", !due.some((m) => m.topic === "ablative"));
  check("weakest review first", due[0]?.topic === "izafet");

  // day 2 (dow 2): no voice (45 min → days 1/3/5), no mock (@70d → dow 3/6? no: >60 → dow 6)
  const day2 = buildDay({ route, date: plusDays(1), dayNumber: 2, mastery, history: [], minutesDaily: 45, locale: "ru" });
  const spent = day2.reduce((s, t) => s + t.estimatedMinutes, 0);
  check("regular day within budget ±10%", spent >= 40 && spent <= 50, `${spent} min`);
  check("reviews come first", day2[0].id.startsWith("rep-"));
  check("no voice lesson on day 2", !day2.some((t) => t.kind === "voice_lesson"));

  // day 1: voice lesson with the week's focus
  const day1 = buildDay({ route, date: TODAY, dayNumber: 1, mastery, history: [], minutesDaily: 45, locale: "ru" });
  const voice = day1.find((t) => t.kind === "voice_lesson");
  check("voice lesson on day 1", !!voice);
  check("voice focus ⊆ week topics", !!voice && voice.focusTopics!.every((t) => route.weeks[0].topics.includes(t)));
  check("voice mode bolum1 (week 1)", voice?.voiceMode === "bolum1");

  // mock schedule far from the exam: 1 section on dow 6
  check("day 6 has a section mock", mocksForDay(6, 70).includes("section"));
  check("day 2 has no mock", mocksForDay(2, 70).length === 0);
  check("finale: mock every other day", mocksForDay(10, 10).length === 1 && mocksForDay(11, 10).length === 0);

  // finale day: only reviews + mocks, no week-topic/filler tasks
  const finaleRoute = fallbackRoute({ ...baseInputs, examDate: plusDays(10) }, TODAY);
  const finaleDay = buildDay({ route: finaleRoute, date: plusDays(1), dayNumber: 2, mastery, history: [], minutesDaily: 45, locale: "ru" });
  check(
    "finale day = reviews + mock only",
    finaleDay.every((t) => t.id.startsWith("rep-") || t.kind === "mock_full" || t.kind === "mock_section" || t.kind === "voice_lesson"),
    finaleDay.map((t) => t.id).join(","),
  );
  check("finale day includes a mock", finaleDay.some((t) => t.kind === "mock_full" || t.kind === "mock_section"));
}

console.log(failures ? `\n${failures} FAILED` : "\nall passed");
process.exit(failures ? 1 : 0);
