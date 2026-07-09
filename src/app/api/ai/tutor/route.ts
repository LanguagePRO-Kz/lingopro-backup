import { NextResponse } from "next/server";
import { callAI, isConfigured, type FeedbackLang } from "@/lib/ai";
import { buildTutorSystem } from "@/lib/ai/prompts/tutor";
import { consumeQuota } from "@/lib/ai/quota";
import { topicById } from "@/lib/ai/topics";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/lib/ai/client";

/**
 * Chat tutor (quota `tutor`: 30/day, 500/month). Stateless: the client sends
 * the visible history, the server caps it and personalizes the system prompt
 * with the student's level/goal/weak topics.
 */

export const runtime = "nodejs";

const LANGS: FeedbackLang[] = ["ru", "en", "tr", "kk"];
const MAX_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 2000;

export async function POST(req: Request) {
  if (!checkRateLimit(`tutor:${clientKey(req)}`, 20, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { messages?: unknown; feedbackLang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const messages: ChatMessage[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m): m is { role: string; content: string } =>
        !!m && typeof m === "object" && typeof (m as { content?: unknown }).content === "string",
    )
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content.slice(0, MAX_MESSAGE_CHARS),
    }))
    .slice(-MAX_MESSAGES);
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "empty_message" }, { status: 400 });
  }

  const lang: FeedbackLang = LANGS.includes(body.feedbackLang as FeedbackLang)
    ? (body.feedbackLang as FeedbackLang)
    : "en";

  if (!isConfigured("tutor_chat", lang)) {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  // session + 30/day, 500/month (src/lib/ai/limits.ts)
  const quota = await consumeQuota("tutor");
  if (!quota.ok) {
    return NextResponse.json({ error: quota.reason }, { status: quota.status });
  }

  const supabase = await createClient();
  const [{ data: profile }, { data: weak }] = await Promise.all([
    supabase
      .from("profiles")
      .select("quiz_result, target_level, gender")
      .eq("id", quota.userId)
      .maybeSingle(),
    supabase
      .from("topic_mastery")
      .select("topic")
      .eq("user_id", quota.userId)
      .lt("strength", 60)
      .order("strength")
      .limit(5),
  ]);
  const quiz = (profile?.quiz_result as { level?: string } | null) ?? null;
  const weakTopicsTr = (weak ?? [])
    .map((w) => topicById(w.topic as string)?.label.tr)
    .filter(Boolean)
    .join(", ");

  const result = await callAI({
    task: "tutor_chat",
    feedbackLang: lang,
    system: buildTutorSystem({
      gender: (profile?.gender as "female" | "male" | null) ?? null,
      lang,
      level: quiz?.level ?? "A2",
      targetLevel: (profile?.target_level as string | null) ?? "B2",
      weakTopicsTr,
    }),
    messages,
    maxTokens: 1200,
  });
  if (!result?.text) return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });

  return NextResponse.json({
    text: result.text,
    meta: {
      provider: result.provider,
      model: result.model,
      usedToday: quota.usedToday,
      usedMonth: quota.usedMonth,
    },
  });
}
