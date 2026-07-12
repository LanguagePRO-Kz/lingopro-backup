/**
 * Error memory (RECON-2 §2.1): persists AI-found mistakes as evidence rows
 * and applies the deterministic mastery update. Shared by writing, tutor,
 * voice review and mocks. Server-side, runs with the user's own session
 * (RLS: insert/update own rows only). Best-effort: a failed write must never
 * break the review response.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type ErrorEvidence = {
  quote: string;
  correction: string;
  rule: string;
  explanation: string;
  topic: string;
  severity: "major" | "minor";
};

const STRENGTH_HIT = { major: 12, minor: 6 } as const;
/** Exported: the coach core detects "topic crossed 60 today" by this step. */
export const STRENGTH_GAIN = 8; // per session where the topic was worked error-free

/**
 * Topics practiced without errors get stronger — this is how a topic
 * eventually leaves the lesson focus (strength ≥ 60) instead of sticking
 * forever. Same read-modify-write pattern as recordErrors.
 */
export async function recordSuccesses(
  supabase: SupabaseClient,
  userId: string,
  topics: string[],
): Promise<void> {
  const unique = [...new Set(topics)].filter((t) => t && t !== "other");
  if (unique.length === 0) return;
  try {
    const { data: existing } = await supabase
      .from("topic_mastery")
      .select("topic, strength, success_count")
      .eq("user_id", userId)
      .in("topic", unique);
    const current = new Map((existing ?? []).map((r) => [r.topic as string, r]));

    const now = new Date().toISOString();
    await supabase.from("topic_mastery").upsert(
      unique.map((topic) => {
        const prev = current.get(topic);
        return {
          user_id: userId,
          topic,
          strength: Math.min(100, ((prev?.strength as number) ?? 50) + STRENGTH_GAIN),
          success_count: (((prev?.success_count as number) ?? 0) + 1),
          last_practiced_at: now,
          updated_at: now,
        };
      }),
      { onConflict: "user_id,topic" },
    );
  } catch (e) {
    console.error("[mastery] success persist failed:", e instanceof Error ? e.message : e);
  }
}

export async function recordErrors(
  supabase: SupabaseClient,
  userId: string,
  source: "writing" | "tutor" | "voice" | "mock" | "diagnostic",
  errors: ErrorEvidence[],
): Promise<void> {
  if (errors.length === 0) return;
  try {
    await supabase.from("error_events").insert(
      errors.map((e) => ({
        user_id: userId,
        source,
        quote: e.quote,
        correction: e.correction,
        rule: e.rule,
        explanation: e.explanation,
        topic: e.topic,
        severity: e.severity,
      })),
    );

    // aggregate hits per topic, then read-modify-write mastery rows
    const hits = new Map<string, { drop: number; count: number }>();
    for (const e of errors) {
      const h = hits.get(e.topic) ?? { drop: 0, count: 0 };
      h.drop += STRENGTH_HIT[e.severity];
      h.count += 1;
      hits.set(e.topic, h);
    }
    const topics = [...hits.keys()];

    const { data: existing } = await supabase
      .from("topic_mastery")
      .select("topic, strength, error_count")
      .eq("user_id", userId)
      .in("topic", topics);
    const current = new Map((existing ?? []).map((r) => [r.topic as string, r]));

    const now = new Date().toISOString();
    await supabase.from("topic_mastery").upsert(
      topics.map((topic) => {
        const prev = current.get(topic);
        const h = hits.get(topic)!;
        return {
          user_id: userId,
          topic,
          strength: Math.max(0, ((prev?.strength as number) ?? 50) - h.drop),
          error_count: (((prev?.error_count as number) ?? 0) + h.count),
          last_error_at: now,
          last_practiced_at: now,
          updated_at: now,
        };
      }),
      { onConflict: "user_id,topic" },
    );
  } catch (e) {
    console.error("[mastery] persist failed:", e instanceof Error ? e.message : e);
  }
}
