/**
 * Карточка-итог голосового урока в ленте единого агента (coach_messages,
 * channel='voice_summary'). Вызывается из /api/voice/session/end ПОСЛЕ
 * биллинга и записи voice_sessions — строго best-effort: сбой здесь не
 * имеет права сломать завершение урока (деньги/минуты уже посчитаны).
 *
 * content = report.summary — он уже на языке интерфейса студента
 * (voice-review пишет на feedback_lang). Защита от повтора: один итог на
 * conversation_id (ретраи settle-роута идемпотентны и сюда не доходят,
 * но страхуемся и от «упал между вставками»).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { VoiceReport } from "@/lib/ai/prompts/voice-review";

export async function recordVoiceSummary(
  admin: SupabaseClient,
  input: { userId: string; conversationId: string; minutes: number; report: VoiceReport },
): Promise<void> {
  const r = input.report;
  if (!r.valid) return; // нечего показывать — честно ничего не пишем
  try {
    const { data: existing } = await admin
      .from("coach_messages")
      .select("id")
      .eq("user_id", input.userId)
      .eq("channel", "voice_summary")
      .eq("meta->>conversation_id", input.conversationId)
      .maybeSingle();
    if (existing) return;

    await admin.from("coach_messages").insert({
      user_id: input.userId,
      channel: "voice_summary",
      role: "ahu",
      content: r.summary || `Sesli ders: ${input.minutes} dk`,
      meta: {
        conversation_id: input.conversationId,
        minutes: input.minutes,
        criteria_total:
          r.criteria.fluency.score + r.criteria.grammar.score + r.criteria.vocab.score + r.criteria.coherence.score,
        topics: r.topics_worked,
      },
    });
  } catch (e) {
    console.error("[coach] voice summary persist failed:", e instanceof Error ? e.message : e);
  }
}
