import { NextResponse } from "next/server";
import { requireActivePlan } from "@/lib/access";
import { callAI, isConfigured, type FeedbackLang } from "@/lib/ai";
import { recordErrors } from "@/lib/ai/mastery";
import {
  buildWritingReviewSystem,
  buildWritingReviewUserMessage,
  validateWritingReview,
} from "@/lib/ai/prompts/writing-review";
import { consumeQuota } from "@/lib/ai/quota";
import { fetchEssayForRetry, insertEssay, updateEssayStatus } from "@/lib/essays";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const LANGS: FeedbackLang[] = ["ru", "en", "tr", "kk"];
const MAX_TEXT_CHARS = 6000;

/**
 * Проверка эссе раздела Yazma. Эссе — персистентная сущность (Блок 3):
 * строка в essays создаётся ДО квоты и ДО AI, так что любой исход честен:
 *  - квота исчерпана → status='quota', текст сохранён, 429 + essayId;
 *  - AI упал/мусор → status='failed', можно повторить, 5xx + essayId;
 *  - успех → status='done' + review; клиент ушёл, не дождавшись — сервер
 *    дорабатывает и запись дозревает, разбор ждёт в истории.
 * Повторная проверка: body { essayId } без text — перепроверяет СВОЁ
 * не-done эссе, новую строку не плодит.
 */
export async function POST(req: Request) {
  if (!checkRateLimit(`writing:${clientKey(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { text?: string; taskPrompt?: string; taskId?: string; feedbackLang?: string; essayId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const retryId = typeof body.essayId === "string" && body.essayId ? body.essayId : null;
  let text = typeof body.text === "string" ? body.text.trim() : "";
  if (!retryId) {
    if (!text) return NextResponse.json({ error: "empty_text" }, { status: 400 });
    if (text.length > MAX_TEXT_CHARS) {
      return NextResponse.json({ error: "text_too_long", max: MAX_TEXT_CHARS }, { status: 400 });
    }
  }
  let taskPrompt =
    typeof body.taskPrompt === "string" && body.taskPrompt.trim()
      ? body.taskPrompt.trim().slice(0, 500)
      : "Serbest konu";
  const taskId = typeof body.taskId === "string" && body.taskId ? body.taskId.slice(0, 80) : null;
  const lang: FeedbackLang = LANGS.includes(body.feedbackLang as FeedbackLang)
    ? (body.feedbackLang as FeedbackLang)
    : "en";

  if (!isConfigured("writing_review", lang)) {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  // платная фича: подписка ДО квоты (P0-2)
  const access = await requireActivePlan();
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: access.status });

  // эссе в БД ДО квоты и ДО AI — работа студента не исчезает ни при каком исходе
  let essayId: string | null;
  if (retryId) {
    const saved = await fetchEssayForRetry(retryId, access.userId);
    if (!saved) return NextResponse.json({ error: "essay_not_found" }, { status: 404 });
    essayId = saved.id;
    text = saved.text;
    taskPrompt = saved.taskPrompt;
    await updateEssayStatus(essayId, "pending");
  } else {
    essayId = await insertEssay({ userId: access.userId, source: "practice", taskId, taskPrompt, text });
  }

  // session + 3/day, 60/month (src/lib/ai/limits.ts)
  const quota = await consumeQuota("writing");
  if (!quota.ok) {
    await updateEssayStatus(essayId, "quota");
    return NextResponse.json({ error: quota.reason, essayId, saved: essayId != null }, { status: quota.status });
  }

  const result = await callAI({
    task: "writing_review",
    feedbackLang: lang,
    system: buildWritingReviewSystem(lang),
    messages: [{ role: "user", content: buildWritingReviewUserMessage(taskPrompt, text) }],
    maxTokens: 16000, // reasoning models spend part of the budget thinking
    json: true,
    thinking: true,
  });
  if (!result) {
    await updateEssayStatus(essayId, "failed");
    return NextResponse.json({ error: "ai_unavailable", essayId, saved: essayId != null }, { status: 503 });
  }

  const review = validateWritingReview(result.parsed);
  if (!review) {
    await updateEssayStatus(essayId, "failed");
    return NextResponse.json({ error: "bad_ai_response", essayId, saved: essayId != null }, { status: 502 });
  }

  await updateEssayStatus(essayId, "done", review);

  if (review.valid && review.errors.length > 0) {
    const supabase = await createClient();
    await recordErrors(supabase, access.userId, "writing", review.errors);
  }

  return NextResponse.json({
    review,
    essayId,
    meta: {
      provider: result.provider,
      model: result.model,
      fallbackUsed: result.fallbackUsed,
      usedToday: quota.usedToday,
      usedMonth: quota.usedMonth,
    },
  });
}
