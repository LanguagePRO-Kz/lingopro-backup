import { NextResponse } from "next/server";
import { callAI, isConfigured } from "@/lib/ai";
import { buildRoutePlanSystem, buildRoutePlanUserMessage } from "@/lib/ai/prompts/route-plan";
import { consumeQuota } from "@/lib/ai/quota";
import { contentLevel } from "@/lib/daily-plan";
import {
  fallbackRoute,
  validateRoute,
  weeksCount,
  type RouteInputs,
  type StudyRoute,
} from "@/lib/plan/route";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

/**
 * Study-route generation (DESIGN-PLAN-ENGINE §3). Event-driven only: first
 * dashboard visit after the diagnostic, a confirmed settings change, or an
 * explicit "rebuild" after a big mock gap. Never on a schedule.
 *
 * The product works without an AI key: when the model is unavailable or its
 * reply is invalid, the deterministic fallbackRoute is stored instead —
 * honest, just less personal (route.model === "fallback").
 */

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!checkRateLimit(`route:${clientKey(req)}`, 6, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // session + 3/day, 10/month (src/lib/ai/limits.ts)
  const quota = await consumeQuota("route");
  if (!quota.ok) {
    return NextResponse.json({ error: quota.reason }, { status: quota.status });
  }

  const supabase = await createClient();
  const [profileRes, masteryRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("quiz_result, target_level, exam_date, exam_date_mode, exam_horizon_months, study_minutes_daily")
      .eq("id", quota.userId)
      .maybeSingle(),
    supabase
      .from("topic_mastery")
      .select("topic, strength")
      .eq("user_id", quota.userId)
      .lt("strength", 60)
      .order("strength")
      .limit(20),
  ]);

  const p = profileRes.data ?? {};
  const quiz = (p as { quiz_result?: { level?: string } | null }).quiz_result;
  const weakDetails = ((masteryRes.data ?? []) as { topic: string; strength: number }[]);

  const today = new Date().toISOString().slice(0, 10);
  const inputs: Omit<RouteInputs, "routeStartedAt"> = {
    level: contentLevel(quiz?.level),
    targetLevel: (p as { target_level?: string }).target_level === "C1" ? "C1" : "B2",
    examDate:
      (p as { exam_date_mode?: string }).exam_date_mode === "exact"
        ? ((p as { exam_date?: string | null }).exam_date ?? undefined)
        : undefined,
    horizonMonths:
      (p as { exam_date_mode?: string }).exam_date_mode === "approx"
        ? ((p as { exam_horizon_months?: number | null }).exam_horizon_months ?? undefined)
        : undefined,
    minutesDaily: (p as { study_minutes_daily?: number | null }).study_minutes_daily ?? 30,
    weakTopics: weakDetails.map((w) => w.topic),
  };
  const fullInputs: RouteInputs = { ...inputs, routeStartedAt: today };

  let route: StudyRoute | null = null;
  let fallbackUsed = false;

  if (isConfigured("route_plan", "en")) {
    const result = await callAI({
      task: "route_plan",
      feedbackLang: "en",
      system: buildRoutePlanSystem(),
      messages: [
        { role: "user", content: buildRoutePlanUserMessage(inputs, weakDetails, weeksCount(inputs, today)) },
      ],
      maxTokens: 16000,
      json: true,
      thinking: true,
    });
    if (result) {
      route = validateRoute(result.parsed, fullInputs, today, result.model);
    }
  }

  if (!route) {
    route = fallbackRoute(fullInputs, today);
    fallbackUsed = true;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ study_route: route })
    .eq("id", quota.userId);
  if (error) {
    // most likely migration 0003 not applied — surface honestly
    return NextResponse.json({ error: "route_not_saved", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({
    route,
    meta: { fallbackUsed, usedToday: quota.usedToday, usedMonth: quota.usedMonth },
  });
}
