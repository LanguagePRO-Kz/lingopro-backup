import { NextResponse } from "next/server";
import { AI_COST_ESTIMATE_USD, AI_LIMITS, todayInTimezone } from "@/lib/ai/limits";
import { recordErrors, recordSuccesses } from "@/lib/ai/mastery";
import { type VoiceReport } from "@/lib/ai/prompts/voice-review";
import { recordVoiceSummary } from "@/lib/coach/voice-summary";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  fetchConversation,
  generateVoiceReport,
  isFinalized,
  maturePendingReport,
  persistSpeakingAttempts,
  studentLineCount,
  tooShortReport,
  transcriptLines,
  type ConvSnapshot,
  type ReportState,
} from "@/lib/voice/report";

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

  // урок завершён — освобождаем слот одновременных уроков сразу (очередь
  // голосовых, миграция 0008); TTL подстрахует, если этот вызов не случится
  {
    const slotAdmin = createAdminClient();
    if (slotAdmin) void slotAdmin.from("voice_slots").delete().eq("user_id", user.id);
  }

  // ElevenLabs finalizes the call record a few seconds AFTER the WebRTC
  // disconnect. Poll for the TERMINAL status — duration>0 arrives earlier
  // than the transcript and is NOT readiness (that shortcut froze 8 live
  // sessions with an empty transcript). If the record isn't final in ~15s we
  // still settle the billing with the metadata we have; the review then
  // matures via the retry/webhook path.
  let conv: ConvSnapshot | null = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    conv = await fetchConversation(conversationId, apiKey);
    if (conv && isFinalized(conv)) break;
    if (attempt < 5) await new Promise((r) => setTimeout(r, 2500));
  }
  if (!conv) return NextResponse.json({ error: "conversation_not_found" }, { status: 404 });
  // биллинг требует хотя бы метаданных с длительностью; совсем сырая запись —
  // честный отказ, клиент ретраит (ничего ещё не списано и не зафиксировано)
  if (!isFinalized(conv) && (conv.metadata?.call_duration_secs ?? 0) <= 0) {
    return NextResponse.json({ error: "settle_not_ready" }, { status: 503 });
  }

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

  // idempotency: a retry of the same conversation must not double-bill.
  // Терминальна ЗАПИСЬ РАЗБОРА, а не сессия: report IS NULL → повторный
  // вызов ДОЗРЕВАЕТ разбор (прежняя версия возвращала null навсегда, и
  // кнопка «Получить разбор» была декорацией — 8 живых сессий заморожены).
  if (admin) {
    const { data: existing } = await admin
      .from("voice_sessions")
      .select("id, seconds, report")
      .eq("user_id", user.id)
      .eq("transcript->>conversation_id", conversationId)
      .maybeSingle();
    if (existing) {
      let report = (existing.report as VoiceReport | null) ?? null;
      let reportState: ReportState = report ? (report.valid ? "ready" : "too_short") : "pending_transcript";
      if (!report) {
        const { data: genderRow } = await supabase.from("profiles").select("gender").eq("id", user.id).maybeSingle();
        const matured = await maturePendingReport(admin, {
          sessionId: existing.id as string,
          userId: user.id,
          conversationId,
          conv,
          gender: (genderRow?.gender as "female" | "male" | null) ?? null,
          minutes: Math.ceil(((existing.seconds as number | null) ?? 0) / 60),
        });
        report = matured.report;
        reportState = matured.state;
      }
      // minutes: null → the client shows the stored report without re-stating
      // a spend that happened on the first settle
      return NextResponse.json({
        alreadySettled: true,
        seconds: existing.seconds,
        minutes: null,
        fromBase: 0,
        fromCredits: 0,
        report,
        reportState,
      });
    }
  }

  // profile serves both billing (timezone) and the review (gendered address);
  // gender is read in ISOLATION — the column ships with migration 0006, and
  // bundled here a missing column would 400 the timezone (billing day) too
  const [{ data: profile }, { data: genderRow }] = await Promise.all([
    supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle(),
    supabase.from("profiles").select("gender").eq("id", user.id).maybeSingle(),
  ]);

  let settle: { ok?: boolean; from_base?: number; from_credits?: number; uncovered?: number } = {};
  if (minutes > 0) {
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
  // Терминальное состояние ТОЛЬКО при реальных данных (правило 1.3):
  //  запись финализирована + речи мало  → too_short (терминально);
  //  запись финализирована + речь есть  → генерация (null = failed, повтор);
  //  запись НЕ финализирована           → pending, дозреет ретраем/вебхуком.
  const lines = transcriptLines(conv);
  const finalized = isFinalized(conv);

  let report: VoiceReport | null = null;
  let reportState: ReportState = "pending_transcript";
  if (finalized) {
    if (studentLineCount(lines) < 2) {
      report = tooShortReport();
      reportState = "too_short";
    } else {
      report = await generateVoiceReport(lines, dynVars, (genderRow?.gender as "female" | "male" | null) ?? null);
      reportState = report ? (report.valid ? "ready" : "too_short") : "failed";
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
    if (report?.valid) {
      // разбор → attempts: Speaking виден в статистике как реальные попытки
      await persistSpeakingAttempts(admin, user.id, conversationId, report, String(dynVars.level ?? "A2"));
      // единый агент: карточка-итог урока в ленту Ahu (best-effort, после
      // биллинга — сбой не ломает завершение; DESIGN-COACH §6)
      await recordVoiceSummary(admin, { userId: user.id, conversationId, minutes, report });
    }
  }

  return NextResponse.json({
    seconds,
    minutes,
    fromBase: settle.from_base ?? 0,
    fromCredits: settle.from_credits ?? 0,
    report,
    reportState,
  });
}
