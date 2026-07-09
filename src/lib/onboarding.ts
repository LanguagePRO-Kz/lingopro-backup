/**
 * Onboarding: the "getting started" checklist + first-visit section hints.
 *
 * Checklist progress is NEVER stored — it is recomputed from real data
 * (daily_progress totals, voice_sessions, ai_usage), so it cannot drift from
 * the truth. Only the dismissal flag persists: profiles.onboarded_at
 * (migration 0005) with a localStorage mirror so an unapplied migration
 * degrades to once-per-device instead of breaking anything.
 */

import { createClient } from "./supabase/client";

const LS_ONBOARDED = "lingopro:onboarded";
const LS_HINT_PREFIX = "lingopro:hint:";

/** Section-hint ids double as localStorage keys. */
export const HINT_IDS = [
  "grammar",
  "vocabulary",
  "reading",
  "listening",
  "writing",
  "mock",
  "tutor",
  "stats",
] as const;
export type HintId = (typeof HINT_IDS)[number];

export function hintSeen(id: HintId): boolean {
  try {
    return window.localStorage.getItem(LS_HINT_PREFIX + id) === "1";
  } catch {
    return true; // storage unavailable → don't nag
  }
}

export function dismissHint(id: HintId) {
  try {
    window.localStorage.setItem(LS_HINT_PREFIX + id, "1");
  } catch {
    /* ignore */
  }
}

export function resetHints() {
  try {
    for (const id of HINT_IDS) window.localStorage.removeItem(LS_HINT_PREFIX + id);
  } catch {
    /* ignore */
  }
}

/**
 * Was the checklist closed? LS answers first (fast, works pre-migration);
 * the profile column is read in ISOLATION — one bad column may only kill
 * this query, never a shared one (the phantom study_intensity lesson).
 */
export async function fetchOnboarded(): Promise<boolean> {
  try {
    if (window.localStorage.getItem(LS_ONBOARDED) === "1") return true;
  } catch {
    /* fall through to the profile */
  }
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data, error } = await supabase.from("profiles").select("onboarded_at").eq("id", user.id).maybeSingle();
    if (error) return false; // column not migrated yet → LS-only behaviour
    // NB: deliberately NO caching to LS here. The old auto-cache raced the
    // settings reset (LS cleared → profile null-write still in flight → read
    // saw the stale timestamp → re-cached "1") and buried the checklist
    // FOREVER (founder-reported). LS is written only by an explicit dismiss.
    return !!data?.onboarded_at;
  } catch {
    return false;
  }
}

/** Close (true) or re-open (false) the checklist; hints reset on re-open. */
export async function setOnboarded(done: boolean): Promise<void> {
  try {
    if (done) window.localStorage.setItem(LS_ONBOARDED, "1");
    else window.localStorage.removeItem(LS_ONBOARDED);
  } catch {
    /* ignore */
  }
  if (!done) resetHints();
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ onboarded_at: done ? new Date().toISOString() : null })
      .eq("id", user.id);
    if (error) console.error("[onboarding] flag save failed:", error.message);
  } catch {
    /* best-effort */
  }
}

export type ChecklistProgress = {
  /** first voice lesson settled (voice_sessions row exists) */
  voiceLesson: boolean;
  /** first essay sent to review (ai_usage feature=writing) */
  essay: boolean;
  /** first tutor question (ai_usage feature=tutor) */
  tutor: boolean;
};

/** Real completion signals from the student's own rows (RLS read-own). */
export async function fetchChecklistProgress(): Promise<ChecklistProgress> {
  const none: ChecklistProgress = { voiceLesson: false, essay: false, tutor: false };
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return none;
    const [voiceRes, usageRes] = await Promise.all([
      supabase.from("voice_sessions").select("id").limit(1),
      supabase.from("ai_usage").select("feature").in("feature", ["writing", "tutor"]),
    ]);
    const features = new Set((usageRes.data ?? []).map((r) => r.feature as string));
    return {
      voiceLesson: (voiceRes.data ?? []).length > 0,
      essay: features.has("writing"),
      tutor: features.has("tutor"),
    };
  } catch {
    return none;
  }
}
