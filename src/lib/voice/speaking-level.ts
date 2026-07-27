/**
 * SPEAKING-уровень для Konuşma-симуляции (Блок 5) — per-skill, НЕ глобальный
 * уровень профиля (заказ основателя: «студент может быть B1 по чтению и A1
 * по говорению — пускать его в B1-говорение значит завалить»).
 *
 * Источники, по убыванию доверия:
 *  1) среднее последних 3 валидных голосовых разборов — 4 критерия × /5 = /20
 *     (тот же расчёт, что konusmaAvg3 в титулах);
 *  2) Konuşma-балл диагностической пробы (/25, нормируем к /20);
 *  3) данных о говорении нет → дефолт A2 (нижняя ступень симуляции) с
 *     честной пометкой источника — НО если глобальный уровень A0/A1,
 *     гейтим: новичку в симуляции делать нечего.
 *
 * Пороги /20 — ВНУТРЕННЯЯ шкала продукта (официальной публикуемой нет),
 * консервативная: сомнение трактуем ВНИЗ — лучше лёгкая симуляция, чем
 * заваленная.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { KonusmaLevel } from "@/data/konusma-bank";
import type { VoiceReport } from "@/lib/ai/prompts/voice-review";

export type SpeakingAssessment =
  | { kind: "gate"; reason: "beginner" }             // A0/A1 без speaking-данных ИЛИ score ниже A2
  | { kind: "level"; level: KonusmaLevel; source: "voice_reviews" | "diagnostic_probe" | "default_a2"; score20: number | null };

/** score /20 → уровень симуляции (консервативно). */
export function speakingLevelFromScore(score20: number): KonusmaLevel | "below" {
  if (score20 < 6) return "below";
  if (score20 <= 10) return "A2";
  if (score20 <= 14) return "B1";
  if (score20 <= 17) return "B2";
  return "C1";
}

export async function assessSpeakingLevel(
  admin: SupabaseClient,
  userId: string,
  globalLevel: string,
): Promise<SpeakingAssessment> {
  // 1) последние голосовые разборы
  try {
    const { data } = await admin
      .from("voice_sessions")
      .select("report")
      .eq("user_id", userId)
      .not("report", "is", null)
      .order("started_at", { ascending: false })
      .limit(6);
    const reports = ((data ?? []) as { report: VoiceReport | null }[])
      .map((r) => r.report)
      .filter((r): r is VoiceReport => !!r && r.valid)
      .slice(0, 3);
    if (reports.length) {
      const avg =
        reports.reduce(
          (sum, r) => sum + r.criteria.fluency.score + r.criteria.grammar.score + r.criteria.vocab.score + r.criteria.coherence.score,
          0,
        ) / reports.length;
      const lvl = speakingLevelFromScore(avg);
      return lvl === "below" ? { kind: "gate", reason: "beginner" } : { kind: "level", level: lvl, source: "voice_reviews", score20: Math.round(avg * 10) / 10 };
    }
  } catch {
    /* нет данных — следующий источник */
  }

  // 2) Konuşma-балл диагностической пробы (/25 → /20)
  try {
    const { data: prof } = await admin.from("profiles").select("quiz_result").eq("id", userId).maybeSingle();
    const konusma25 = (prof?.quiz_result as { sections?: { konusma?: number | null } } | null)?.sections?.konusma;
    if (typeof konusma25 === "number") {
      const score20 = konusma25 * 0.8;
      const lvl = speakingLevelFromScore(score20);
      return lvl === "below" ? { kind: "gate", reason: "beginner" } : { kind: "level", level: lvl, source: "diagnostic_probe", score20: Math.round(score20 * 10) / 10 };
    }
  } catch {
    /* нет данных */
  }

  // 3) speaking-данных нет вообще
  if (globalLevel === "A0" || globalLevel === "A1") return { kind: "gate", reason: "beginner" };
  return { kind: "level", level: "A2", source: "default_a2", score20: null };
}
