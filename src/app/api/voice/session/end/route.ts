import { NextResponse } from "next/server";
import { callAI, type FeedbackLang } from "@/lib/ai";
import { AI_COST_ESTIMATE_USD, AI_LIMITS, todayInTimezone } from "@/lib/ai/limits";
import { recordErrors, recordSuccesses } from "@/lib/ai/mastery";
import {
  buildVoiceReviewSystem,
  buildVoiceReviewUserMessage,
  validateVoiceReport,
  type VoiceReport,
} from "@/lib/ai/prompts/voice-review";
import { topicById } from "@/lib/ai/topics";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Settles a finished voice session. Billing trusts ElevenLabs' own call
 * record, not the client: we fetch the conversation, verify it belongs to
 * our agent AND to this user (user_id dynamic variable), then charge actual
 * minutes (base quota first, then purchased credits).
 */
export async function POST(req: Request) {
  if (!checkRateLimit(`voice-end:${clientKey(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "voice_unavailable" }, { status: 503 });

  let body: { conversationId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
  if (!/^[A-Za-z0-9_]+$/.test(conversationId)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  // ElevenLabs finalizes the call record a few seconds AFTER the WebRTC
  // disconnect — an immediate fetch 404s or returns no duration/transcript,
  // which used to leave the student with a bare "lesson finished" and no
  // review. Poll until the record is ready (or give up and let the client
  // retry; settling is idempotent).
  let conv: {
    agent_id?: string;
    status?: string;
    metadata?: { call_duration_secs?: number; start_time_unix_secs?: number; dynamic_variables?: Record<string, string> };
    conversation_initiation_client_data?: { dynamic_variables?: Record<string, string> };
    transcript?: { role?: string; message?: string | null }[];
  } | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    conv = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`, {
      headers: { "xi-api-key": apiKey },
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    const ready = !!conv && (conv.status === "done" || conv.status === "failed" || (conv.metadata?.call_duration_secs ?? 0) > 0);
    if (ready) break;
    if (attempt < 4) await new Promise((r) => setTimeout(r, 2500));
  }
  if (!conv) return NextResponse.json({ error: "conversation_not_found" }, { status: 404 });

  if (conv.agent_id !== process.env.ELEVENLABS_AGENT_ID) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const dynVars =
    conv.conversation_initiation_client_data?.dynamic_variables ??
    conv.metadata?.dynamic_variables ??
    {};
  if (dynVars.user_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const seconds: number = Math.max(0, Math.round(conv.metadata?.call_duration_secs ?? 0));

  const admin = createAdminClient();

  // Billing cutoff: the moment the student pressed "end lesson" (stamped by
  // /api/voice/session/wrap). The oral wrap-up and disconnect lag are free —
  // not a second is billed past the press. Anti-abuse: if the call kept going
  // for more than the grace window after the stamp (a real wrap-up is <60s),
  // the stamp is ignored and the full duration is billed.
  const WRAP_GRACE_SECONDS = 120;
  let billedSeconds = seconds;
  if (admin) {
    const { data: mark } = await admin
      .from("voice_wrap_marks")
      .select("requested_at")
      .eq("user_id", user.id)
      .eq("conversation_id", conversationId)
      .maybeSingle();
    const startMs = conv.metadata?.start_time_unix_secs ? conv.metadata.start_time_unix_secs * 1000 : null;
    if (mark && startMs) {
      const cutoffSec = Math.round((new Date(mark.requested_at).getTime() - startMs) / 1000);
      const overrun = seconds - cutoffSec; // time the call ran past the press
      if (cutoffSec >= 0 && overrun >= 0 && overrun <= WRAP_GRACE_SECONDS) {
        billedSeconds = Math.min(seconds, cutoffSec);
      }
    }
    // the mark has served its purpose either way
    await admin.from("voice_wrap_marks").delete().eq("user_id", user.id).eq("conversation_id", conversationId);
  }
  const minutes = billedSeconds > 10 ? Math.ceil(billedSeconds / 60) : 0; // <10s connects are free

  // idempotency: a retry of the same conversation must not double-bill;
  // return the stored report so the client can re-render it
  if (admin) {
    const { data: existing } = await admin
      .from("voice_sessions")
      .select("id, seconds, report")
      .eq("user_id", user.id)
      .eq("transcript->>conversation_id", conversationId)
      .maybeSingle();
    if (existing) {
      // minutes: null → the client shows the stored report without re-stating
      // a spend that happened on the first settle
      return NextResponse.json({ alreadySettled: true, seconds: existing.seconds, minutes: null, fromBase: 0, fromCredits: 0, report: existing.report ?? null });
    }
  }

  let settle: { ok?: boolean; from_base?: number; from_credits?: number; uncovered?: number } = {};
  if (minutes > 0) {
    const { data: profile } = await supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle();
    const day = todayInTimezone((profile?.timezone as string | null) ?? null);
    const { data, error } = await supabase.rpc("consume_voice_minutes", {
      p_day: day,
      p_minutes: minutes,
      p_daily_base: AI_LIMITS.voice.dailyBaseMinutes,
      p_cost_usd: minutes * AI_COST_ESTIMATE_USD.voiceMinute,
    });
    if (error) console.error("[voice] settle failed:", error.message);
    settle = (data as typeof settle) ?? {};
  }

  // --- written review (C5): transcript → TÖMER Konuşma report ---
  const rawItems: { role?: string; message?: string | null }[] = Array.isArray(conv.transcript) ? conv.transcript : [];
  const lines = rawItems
    .filter((t) => typeof t.message === "string" && t.message.trim())
    .map((t) => ({
      role: (t.role === "user" ? "student" : "teacher") as "student" | "teacher",
      text: (t.message as string).trim(),
    }));
  const studentLines = lines.filter((l) => l.role === "student").length;

  let report: VoiceReport | null = null;
  if (studentLines >= 2) {
    const lang = (["ru", "en", "tr", "kk"].includes(dynVars.feedback_lang_code)
      ? dynVars.feedback_lang_code
      : "en") as FeedbackLang;
    const lessonFocusTr = String(dynVars.lesson_focus_ids ?? "")
      .split(",")
      .map((id) => topicById(id.trim())?.label.tr)
      .filter(Boolean)
      .join(", ");
    const result = await callAI({
      task: "voice_review",
      feedbackLang: lang,
      system: buildVoiceReviewSystem(lang),
      messages: [
        {
          role: "user",
          content: buildVoiceReviewUserMessage({
            transcriptLines: lines,
            lessonFocusTr,
            level: String(dynVars.level ?? "A2"),
            targetLevel: String(dynVars.target_level ?? "C1"),
          }),
        },
      ],
      maxTokens: 12000,
      json: true,
      thinking: true,
    });
    report = result ? validateVoiceReport(result.parsed) : null;
    if (report?.valid) {
      if (report.errors.length > 0) {
        await recordErrors(supabase, user.id, "voice", report.errors);
      }
      // topics worked without a single error grow stronger and eventually
      // leave the lesson focus
      const erredTopics = new Set(report.errors.map((e) => e.topic));
      await recordSuccesses(supabase, user.id, report.topics_worked.filter((t) => !erredTopics.has(t)));
    }
  }

  if (admin) {
    const startedAt = conv.metadata?.start_time_unix_secs
      ? new Date(conv.metadata.start_time_unix_secs * 1000).toISOString()
      : new Date(Date.now() - seconds * 1000).toISOString();
    await admin.from("voice_sessions").insert({
      user_id: user.id,
      mode: dynVars.mode ?? null,
      seconds,
      started_at: startedAt,
      ended_at: new Date().toISOString(),
      transcript: { conversation_id: conversationId, items: conv.transcript ?? [] },
      report,
    });
  }

  return NextResponse.json({
    seconds,
    minutes,
    fromBase: settle.from_base ?? 0,
    fromCredits: settle.from_credits ?? 0,
    report,
  });
}
