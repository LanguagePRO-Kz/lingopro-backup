/**
 * Seeds the error memory from diagnostic answers (B2 → adaptive loop):
 * wrong tagged answers become error_events + lower topic strength, correct
 * ones raise it — so the very first voice lesson already has a personal
 * focus. Client-side (RLS: own rows), runs once per user.
 */

import { createClient } from "../supabase/client";
import { recordErrors, recordSuccesses } from "./mastery";
import type { QuizResult } from "../quiz";

export async function seedMasteryFromDiagnostic(result: QuizResult): Promise<void> {
  const tagged = (result.answers ?? []).filter((a) => a.topic);
  if (tagged.length === 0) return;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // once per user: retakes don't re-seed (lessons keep mastery current)
    const { data: existing } = await supabase
      .from("error_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("source", "diagnostic")
      .limit(1);
    if (existing && existing.length > 0) return;

    const wrong = tagged.filter((a) => !a.correct);
    const right = tagged.filter((a) => a.correct);

    await recordErrors(
      supabase,
      user.id,
      "diagnostic",
      wrong.map((a) => ({
        quote: a.prompt,
        correction: a.correctAnswer || "—",
        rule: a.tag?.ru ?? a.topic!,
        explanation: "",
        topic: a.topic!,
        severity: "major" as const,
      })),
    );
    await recordSuccesses(supabase, user.id, right.map((a) => a.topic!));
  } catch (e) {
    console.error("[diagnostic-seed] failed:", e instanceof Error ? e.message : e);
  }
}
