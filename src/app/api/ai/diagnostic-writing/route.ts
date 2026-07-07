import { NextResponse } from "next/server";
import { callAI, isConfigured, type FeedbackLang } from "@/lib/ai";
import { recordErrors } from "@/lib/ai/mastery";
import {
  buildWritingReviewSystem,
  buildWritingReviewUserMessage,
  validateWritingReview,
} from "@/lib/ai/prompts/writing-review";
import { consumeQuota } from "@/lib/ai/quota";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

/**
 * Deferred Yazma review of the diagnostic (DESIGN-DIAGNOSTIC-V2 §4): same
 * examiner pipeline as /api/ai/writing, but on the `diagnostic` quota
 * (2/day — retake protection), errors recorded with source `diagnostic`,
 * and no XP. Runs from /quiz/result right after the first login.
 */

export const runtime = "nodejs";

const LANGS: FeedbackLang[] = ["ru", "en", "tr", "kk"];
const MAX_TEXT_CHARS = 6000;

export async function POST(req: Request) {
  if (!checkRateLimit(`diagnostic-writing:${clientKey(req)}`, 6, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { text?: string; taskPrompt?: string; feedbackLang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "empty_text" }, { status: 400 });
  if (text.length > MAX_TEXT_CHARS) {
    return NextResponse.json({ error: "text_too_long", max: MAX_TEXT_CHARS }, { status: 400 });
  }
  const taskPrompt =
    typeof body.taskPrompt === "string" && body.taskPrompt.trim()
      ? body.taskPrompt.trim().slice(0, 500)
      : "Serbest konu";
  const lang: FeedbackLang = LANGS.includes(body.feedbackLang as FeedbackLang)
    ? (body.feedbackLang as FeedbackLang)
    : "en";

  if (!isConfigured("diagnostic_analysis", lang)) {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  // session + 2/day, 10/month (src/lib/ai/limits.ts — anti retake-farming)
  const quota = await consumeQuota("diagnostic");
  if (!quota.ok) {
    return NextResponse.json({ error: quota.reason }, { status: quota.status });
  }

  const result = await callAI({
    task: "diagnostic_analysis",
    feedbackLang: lang,
    system: buildWritingReviewSystem(lang),
    messages: [{ role: "user", content: buildWritingReviewUserMessage(taskPrompt, text) }],
    maxTokens: 16000, // reasoning models spend part of the budget thinking
    json: true,
    thinking: true,
  });
  if (!result) return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });

  const review = validateWritingReview(result.parsed);
  if (!review) return NextResponse.json({ error: "bad_ai_response" }, { status: 502 });

  if (review.valid && review.errors.length > 0) {
    const supabase = await createClient();
    await recordErrors(supabase, quota.userId, "diagnostic", review.errors);
  }

  return NextResponse.json({
    review,
    meta: {
      provider: result.provider,
      model: result.model,
      fallbackUsed: result.fallbackUsed,
      usedToday: quota.usedToday,
      usedMonth: quota.usedMonth,
    },
  });
}
