/**
 * Post-diagnostic result maintenance (client side, RLS: own rows).
 *
 * attachKonusmaScore — DESIGN-DIAGNOSTIC-V2 §4: the diagnostic never records
 * speech; the Konuşma /25 arrives from the first live lesson's report
 * (voice_sessions.report → criteria avg → /25). Called from the result page;
 * idempotent (does nothing once the score exists).
 */

import type { VoiceReport } from "@/lib/ai/prompts/voice-review";
import { saveResult, type QuizResult } from "@/lib/quiz";
import { createClient } from "@/lib/supabase/client";
import { withKonusma } from "./engine";

export async function attachKonusmaScore(): Promise<QuizResult | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("quiz_result")
      .eq("id", user.id)
      .maybeSingle();
    const result = (profile?.quiz_result as QuizResult | null) ?? null;
    if (!result || result.version !== 3 || !result.sections || result.sections.konusma != null) return null;

    // earliest reviewed lesson after the diagnostic = the placement lesson
    const { data: sessions } = await supabase
      .from("voice_sessions")
      .select("report, created_at")
      .eq("user_id", user.id)
      .not("report", "is", null)
      .order("created_at", { ascending: true })
      .limit(5);

    const report = (sessions ?? [])
      .map((s) => s.report as VoiceReport)
      .find((r) => r?.valid);
    if (!report) return null;

    const updated = withKonusma(result, report);
    if (!updated) return null;

    await supabase.from("profiles").update({ quiz_result: updated }).eq("id", user.id);
    saveResult(updated);
    return updated;
  } catch (e) {
    console.error("[attachKonusmaScore]", e instanceof Error ? e.message : e);
    return null;
  }
}
