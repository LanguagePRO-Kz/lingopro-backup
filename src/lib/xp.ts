import { createClient } from "@/lib/supabase/client";

/** XP values (starting balance — tune later). */
export const XP = {
  DIAGNOSTIC: 500,
  READING_TEST: 100,
  LISTENING_TEST: 100,
  WRITING_TEST: 150,
  SPEAKING_TEST: 150,
  GRAMMAR_TEST: 100,
  VOCAB_WORD: 5,
  DAILY_PLAN_BONUS: 200,
  STREAK_DAY_BONUS: 50,
  LEVEL_UP: 1000,
} as const;

export type XpReason =
  | "diagnostic"
  | "reading_test"
  | "listening_test"
  | "writing_test"
  | "speaking_test"
  | "grammar_test"
  | "vocab_word"
  | "daily_plan_bonus"
  | "streak_day_bonus"
  | "level_up";

/** Per-skill XP for a completed test, by skill id used across the app. */
export const SKILL_XP: Record<string, { reason: XpReason; amount: number }> = {
  reading: { reason: "reading_test", amount: XP.READING_TEST },
  listening: { reason: "listening_test", amount: XP.LISTENING_TEST },
  writing: { reason: "writing_test", amount: XP.WRITING_TEST },
  speaking: { reason: "speaking_test", amount: XP.SPEAKING_TEST },
  grammar: { reason: "grammar_test", amount: XP.GRAMMAR_TEST },
};

type AwardOptions = {
  /**
   * A stable key for once-only awards (diagnostic, daily-plan bonus, streak
   * day). A unique index on (user_id, metadata->>'dedup_key') makes a repeat
   * insert a no-op instead of double-counting. Omit for repeatable awards
   * (every test / every word counts, no cap).
   */
  dedupKey?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Record an XP event. Call after an action is successfully completed.
 * Append-only, no per-day cap — extra work beyond the daily plan still earns
 * full XP. Best-effort: never throws, never blocks the UI.
 */
export async function awardXp(
  reason: XpReason,
  amount: number,
  options: AwardOptions = {},
): Promise<{ ok: boolean }> {
  try {
    if (!Number.isFinite(amount) || amount <= 0) return { ok: false };
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false };

    const metadata = {
      ...(options.metadata ?? {}),
      ...(options.dedupKey ? { dedup_key: options.dedupKey } : {}),
    };

    // once-only награда: сперва проверяем, не начислена ли уже — повторный
    // insert бился об уникальный индекс и красил консоль 409-ом на каждом
    // визите /quiz/result (данные были целы, но «ошибка» на странице продажи)
    if (options.dedupKey) {
      const { data: existing } = await supabase
        .from("xp_events")
        .select("id")
        .eq("user_id", user.id)
        .eq("metadata->>dedup_key", options.dedupKey)
        .limit(1);
      if (existing && existing.length > 0) return { ok: true };
    }

    const { error } = await supabase.from("xp_events").insert({
      user_id: user.id,
      amount: Math.round(amount),
      reason,
      metadata,
    });

    // 23505 = unique_violation → гонка двух вкладок добежала до insert
    // одновременно; награда уже существует — не ошибка
    if (error && error.code !== "23505") {
      console.error("[awardXp]", error);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("[awardXp]", err);
    return { ok: false };
  }
}

/** XP for finishing a test of the given skill (repeatable). */
export function awardSkillTest(skill: string, metadata: Record<string, unknown> = {}) {
  const cfg = SKILL_XP[skill];
  if (!cfg) return Promise.resolve({ ok: false });
  return awardXp(cfg.reason, cfg.amount, { metadata });
}
