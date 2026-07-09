import { NextResponse } from "next/server";
import { callAI, isConfigured, type FeedbackLang } from "@/lib/ai";
import { buildMotivatorSystem, buildMotivatorUserMessage, type MotivatorFacts } from "@/lib/ai/prompts/motivator";
import { consumeQuota } from "@/lib/ai/quota";
import { todayInTimezone } from "@/lib/ai/limits";
import { topicById } from "@/lib/ai/topics";
import { topicsForSpan } from "@/lib/plan/route";
import { contentLevel } from "@/lib/daily-plan";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

/**
 * Daily Ahu note (quota `motivator`: 2/day, 40/month; the client caches per
 * day). Every fact in the prompt is computed HERE from the student's real
 * rows — the model is only allowed to rephrase them (founder's honesty
 * condition: no invented praise, zero activity named plainly).
 */

export const runtime = "nodejs";

const LANGS: FeedbackLang[] = ["ru", "en", "tr", "kk"];

const dayShift = (iso: string, delta: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return dt.toISOString().slice(0, 10);
};

export async function POST(req: Request) {
  if (!checkRateLimit(`motivator:${clientKey(req)}`, 6, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { feedbackLang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const lang: FeedbackLang = LANGS.includes(body.feedbackLang as FeedbackLang)
    ? (body.feedbackLang as FeedbackLang)
    : "en";

  if (!isConfigured("motivator_note", lang)) {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  const quota = await consumeQuota("motivator");
  if (!quota.ok) {
    return NextResponse.json({ error: quota.reason }, { status: quota.status });
  }

  const supabase = await createClient();
  const [{ data: profile }, { data: mastery }] = await Promise.all([
    supabase
      .from("profiles")
      .select("quiz_result, target_level, exam_date, exam_date_mode, timezone, gender")
      .eq("id", quota.userId)
      .maybeSingle(),
    supabase.from("topic_mastery").select("topic, strength").eq("user_id", quota.userId).order("strength"),
  ]);

  const today = todayInTimezone((profile?.timezone as string | null) ?? null);
  const { data: days } = await supabase
    .from("daily_progress")
    .select("date, completed_count, total_count")
    .eq("user_id", quota.userId)
    .gte("date", dayShift(today, -14))
    .order("date", { ascending: false });

  // real streak: consecutive complete days; today's incompleteness doesn't break it
  const byDate = new Map((days ?? []).map((r) => [r.date as string, r]));
  const complete = (d?: { completed_count: number | null; total_count: number | null }) =>
    !!d && (d.total_count ?? 0) > 0 && (d.completed_count ?? 0) >= (d.total_count ?? 0);
  let streak = 0;
  for (let i = 0; i <= 14; i++) {
    const row = byDate.get(dayShift(today, -i));
    if (complete(row)) streak += 1;
    else if (i === 0) continue; // today still in progress
    else break;
  }

  const yRow = byDate.get(dayShift(today, -1));
  const level = ((profile?.quiz_result as { level?: string } | null)?.level as string | undefined) ?? "A2";
  const targetLevel = profile?.target_level === "B2" ? "B2" : "C1";
  const daysToExam =
    profile?.exam_date_mode === "exact" && profile?.exam_date
      ? Math.max(0, Math.ceil((Date.parse(profile.exam_date as string) - Date.parse(today)) / 86_400_000))
      : null;

  const rows = (mastery ?? []) as { topic: string; strength: number }[];
  const span = new Set(topicsForSpan(contentLevel(level), targetLevel));
  const topicsClosed = rows.filter((r) => r.strength >= 60 && span.has(r.topic)).length;
  const weakest = rows.find((r) => r.strength < 60);

  const facts: MotivatorFacts = {
    yesterday: yRow ? { done: yRow.completed_count ?? 0, total: yRow.total_count ?? 0 } : null,
    streak,
    daysToExam,
    weakTopicTr: weakest ? (topicById(weakest.topic)?.label.tr ?? null) : null,
    topicsClosed,
    level,
    targetLevel,
  };

  const result = await callAI({
    task: "motivator_note",
    feedbackLang: lang,
    system: buildMotivatorSystem(lang, (profile?.gender as "female" | "male" | null) ?? null),
    messages: [{ role: "user", content: buildMotivatorUserMessage(facts) }],
    // deepseek-v4-pro reasons before answering — a tight cap eats the whole
    // budget as reasoning and returns empty content (then Sonnet fallback
    // fires and the note costs 10× more). 700 covers reasoning + 2 lines.
    maxTokens: 700,
  });
  if (!result?.text) return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });

  return NextResponse.json({ text: result.text.trim() });
}
