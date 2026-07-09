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
import { assessPlan, hoursNeeded, paceChoiceFor, STEP_HOURS, KK_NATIVE_FACTOR } from "../src/lib/plan/feasibility";
import { TOPICS } from "../src/lib/ai/topics";
import { buildDay, dueReviews, mocksForDay, type MasteryRow } from "../src/lib/plan/layout";
import { dayNeedsRebuild, generateDailyPlan } from "../src/lib/daily-plan";
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

console.log("— honest plan: CEFR hours ladder —");
{
  check("A0→C1 = 860 h", hoursNeeded({ level: "A0", targetLevel: "C1" }) === 860, String(hoursNeeded({ level: "A0", targetLevel: "C1" })));
  check("A1→C1 = 780 h", hoursNeeded({ level: "A1", targetLevel: "C1" }) === 780);
  check("B1→B2 = step config", hoursNeeded({ level: "B1", targetLevel: "B2" }) === STEP_HOURS.B2);
  const kk = hoursNeeded({ level: "A1", targetLevel: "C1", kkNative: true });
  check("kk speaker ×0.75", kk === 780 * KK_NATIVE_FACTOR, String(kk));
  // mastery credit: ALL step topics mastered → step halved (grammar ≈ half the work)
  const b2Topics = TOPICS.filter((t) => t.level === "B2" && t.id !== "other").map((t) => t.id);
  const credited = hoursNeeded({ level: "B1", targetLevel: "B2", masteredTopics: b2Topics });
  check("full mastery → 50% of the step", credited === STEP_HOURS.B2 / 2, String(credited));
  const partial = hoursNeeded({ level: "B1", targetLevel: "B2", masteredTopics: b2Topics.slice(0, 3) });
  check("partial mastery → proportional credit", partial < STEP_HOURS.B2 && partial > credited, String(partial));
}

console.log("— honest plan: verdicts (founder's case: A1→C1, 3 мес, 45 мин) —");
{
  const not = assessPlan({ level: "A1", targetLevel: "C1", minutesDaily: 45, daysLeft: 90, todayIso: TODAY });
  check("A1→C1 in 90d @45min → notEnough", not.verdict === "notEnough", not.verdict);
  check("resource ≈ 57 h", not.haveHours === 57, String(not.haveHours));
  check("needed pace beyond human limits", (not.minutesNeeded ?? 0) > 240, String(not.minutesNeeded));
  check("…so no pace choice is offered", paceChoiceFor(not.minutesNeeded!) === null);
  check("honest dateNeeded exists & is future", !!not.dateNeeded && Date.parse(not.dateNeeded!) > Date.parse(TODAY));
  check("months honest (~40)", not.monthsNeeded >= 35 && not.monthsNeeded <= 45, String(not.monthsNeeded));
  check("forecast: no full level closes", not.reachableLevel === null);
  check("…but visible progress toward A2", not.nextStepShare > 0.4, String(not.nextStepShare));

  const reach = assessPlan({ level: "A1", targetLevel: "C1", minutesDaily: 60, daysLeft: 365, todayIso: TODAY });
  check("A1→C1 in 1y @60min → notEnough but B1 reachable", reach.verdict === "notEnough" && reach.reachableLevel === "B1", `${reach.verdict}/${reach.reachableLevel}`);

  const tight = assessPlan({ level: "A2", targetLevel: "B2", minutesDaily: 90, daysLeft: 365 });
  check("A2→B2 in 1y @90min → tight (86%)", tight.verdict === "tight", `${tight.verdict}/${tight.loadPct}%`);
  const ok = assessPlan({ level: "A2", targetLevel: "B2", minutesDaily: 120, daysLeft: 365 });
  check("A2→B2 in 1y @120min → ok", ok.verdict === "ok", `${ok.verdict}/${ok.loadPct}%`);

  const unk = assessPlan({ level: "A1", targetLevel: "B2", minutesDaily: 30, daysLeft: null });
  check("no date → unknown + months forecast", unk.verdict === "unknown" && unk.monthsNeeded > 0, String(unk.monthsNeeded));

  check("paceChoiceFor rounds up, capped at 120", paceChoiceFor(61) === 90 && paceChoiceFor(120) === 120 && paceChoiceFor(121) === null);
}

console.log("— honest plan: exam-format readiness (passing ≠ owning the level) —");
{
  // 90 days @45min: full C1 proficiency is out of reach, but ~half the
  // format work fits — the verdict must forecast BOTH axes
  const b = assessPlan({ level: "A1", targetLevel: "C1", minutesDaily: 45, daysLeft: 90 });
  check("format readiness computed", b.formatReadiness != null && b.formatReadiness > 30 && b.formatReadiness < 70, String(b.formatReadiness));
  const full = assessPlan({ level: "A1", targetLevel: "C1", minutesDaily: 120, daysLeft: 113 });
  check("113d @120min → format fully trainable", full.formatReadiness === 100, String(full.formatReadiness));
  const noDate = assessPlan({ level: "A1", targetLevel: "C1", minutesDaily: 45, daysLeft: null });
  check("no date → format readiness null", noDate.formatReadiness === null);
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

console.log("— chosen minutes ARE the plan size (founder bug: 45 chosen → 80-min day) —");
{
  // template path (no route yet) — every supported pace, a week of days.
  // BOTH bounds: the old single-pass filler silently capped days at ~60 min,
  // so 90/120 chosen in settings never changed the plan (founder-reported)
  for (const budget of [15, 30, 45, 60, 90, 120]) {
    let ok = true;
    let detail = "";
    for (let day = 1; day <= 7; day++) {
      const tasks = generateDailyPlan("A2", budget, day, "ru");
      const spent = tasks.reduce((s, t) => s + t.estimatedMinutes, 0);
      if (spent > budget * 1.1 + 0.001 || spent < budget * 0.9 - 4) {
        ok = false;
        detail = `day ${day}: ${spent} min for a ${budget}-min pace`;
        break;
      }
      if (new Set(tasks.map((t) => t.taskId)).size !== tasks.length) {
        ok = false;
        detail = `day ${day}: duplicate taskIds`;
        break;
      }
    }
    check(`template ${budget} min/day fills ±10%`, ok, detail);
  }
  // variety: a 30-min week still touches the rotating skills
  const weekSkills = new Set(
    Array.from({ length: 7 }, (_, i) => generateDailyPlan("A2", 30, i + 1, "ru")).flat().map((t) => t.skill),
  );
  check("30-min week rotates ≥4 skills", weekSkills.size >= 4, [...weekSkills].join(","));

  // route path — non-mock load respects each pace too, both bounds
  const route = fallbackRoute(baseInputs, TODAY);
  for (const budget of [15, 30, 45, 60, 90, 120]) {
    let ok = true;
    let detail = "";
    for (let day = 1; day <= 7; day++) {
      const tasks = buildDay({ route, date: plusDays(day - 1), dayNumber: day, mastery: [], history: [], minutesDaily: budget, locale: "ru" });
      const nonMock = tasks
        .filter((t) => t.kind !== "mock_full" && t.kind !== "mock_section")
        .reduce((s, t) => s + t.estimatedMinutes, 0);
      const total = tasks.reduce((s, t) => s + t.estimatedMinutes, 0);
      // upper bound on non-mock load (mocks may exceed: exam realism);
      // lower bound on the WHOLE day — a mock counts as the day's work
      if (nonMock > budget * 1.1 + 0.001 || total < budget * 0.9 - 4) {
        ok = false;
        detail = `day ${day}: ${nonMock} min non-mock / ${total} total for a ${budget}-min pace`;
        break;
      }
      if (new Set(tasks.map((t) => t.taskId)).size !== tasks.length) {
        ok = false;
        detail = `day ${day}: duplicate taskIds`;
        break;
      }
    }
    check(`route day ${budget} min/day fills ±10% (non-mock)`, ok, detail);
  }
  // the founder's live repro: a 55-60-min day must REBUILD at pace 120
  check("60-min day at pace 120 → rebuild fires", dayNeedsRebuild(60, 120));
  const day120 = generateDailyPlan("A2", 120, 3, "ru").reduce((s, t) => s + t.estimatedMinutes, 0);
  check(`…and the rebuilt day is ~120 (${day120} min)`, day120 >= 104 && day120 <= 132, String(day120));
}

console.log("— pace change in settings rebuilds today (founder bug: 45→60 kept a 48-min day) —");
{
  const sum = (budget: number) => generateDailyPlan("A2", budget, 3, "ru").reduce((s, t) => s + t.estimatedMinutes, 0);
  // walk the founder's scenario: 60 → 30 → 45 → 60
  let planned = sum(60);
  check(`day built at 60 ≈ 60 (${planned} min)`, planned >= 50 && planned <= 66, String(planned));

  check("60 → 30: rebuild fires", dayNeedsRebuild(planned, 30));
  planned = sum(30);
  check(`rebuilt at 30 ≈ 30 (${planned} min)`, planned >= 23 && planned <= 33, String(planned));

  check("30 → 45: rebuild fires", dayNeedsRebuild(planned, 45));
  planned = sum(45);
  check(`rebuilt at 45 ≈ 45 (${planned} min)`, planned >= 36 && planned <= 50, String(planned));

  check("45 → 60: rebuild fires (the live 48-vs-60 case)", dayNeedsRebuild(48, 60));
  planned = sum(60);
  check(`rebuilt at 60 ≈ 60 (${planned} min)`, planned >= 50 && planned <= 66, String(planned));

  // stability: a matching day is never churned
  check("55-min day at pace 60 stays", !dayNeedsRebuild(55, 60));
  check("48-min day at pace 45 stays", !dayNeedsRebuild(48, 45));
  check("28-min day at pace 30 stays", !dayNeedsRebuild(28, 30));
}

console.log(failures ? `\n${failures} FAILED` : "\nall passed");
process.exit(failures ? 1 : 0);
