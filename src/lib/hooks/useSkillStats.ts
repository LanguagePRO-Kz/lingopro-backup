"use client";

/**
 * Статистика раздела из attempts — ТОГО ЖЕ источника, куда раздел пишет
 * (один источник правды). Самооценка отфильтрована. ДИАГНОСТИКА тоже:
 * это оценка уровня, не практика раздела — свежий юзер с 30 ответами
 * диагностики видел «отвечено: 10 · точность 30%» и думал, что это баг
 * (рецидив 19.07). available=false = данных нет — UI обязан показывать
 * «—», не ноль: отсутствие данных ≠ ноль.
 */

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ACCURACY_WINDOW_DAYS = 90;

export type SkillStats = {
  available: boolean;
  /** всего проверенных попыток за всю историю */
  answered: number;
  /** 0..100 за окно 90 дней; null = нечего оценивать */
  accuracy: number | null;
  /** темы слабее порога (по topic_mastery) */
  weakTopics: number;
  /** id вопросов, на которые есть хотя бы одна ВЕРНАЯ попытка (вся история) */
  correctIds: Set<string>;
  /** id вопросов, на которые есть хоть какая-то попытка */
  answeredIds: Set<string>;
};

const EMPTY: SkillStats = {
  available: false,
  answered: 0,
  accuracy: null,
  weakTopics: 0,
  correctIds: new Set(),
  answeredIds: new Set(),
};

export function useSkillStats(skill: "grammar" | "reading" | "listening", weakStrength = 60) {
  const [stats, setStats] = useState<SkillStats | null>(null);

  const reload = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setStats(EMPTY);
        return;
      }
      const since = new Date(Date.now() - ACCURACY_WINDOW_DAYS * 86_400_000).toISOString();
      const [attemptsRes, weakRes] = await Promise.all([
        supabase
          .from("attempts")
          .select("question_id, is_correct, answered_at")
          .eq("user_id", user.id)
          .eq("skill", skill)
          .eq("is_self_reported", false)
          .neq("source", "diagnostic")
          .order("answered_at", { ascending: false })
          .limit(5000),
        supabase
          .from("topic_mastery")
          .select("topic")
          .eq("user_id", user.id)
          .lt("strength", weakStrength)
          .neq("topic", "other"),
      ]);
      if (attemptsRes.error) {
        setStats(EMPTY);
        return;
      }
      const rows = attemptsRes.data ?? [];
      const inWindow = rows.filter((r) => (r.answered_at as string) >= since);
      const correct = inWindow.filter((r) => r.is_correct).length;
      setStats({
        available: true,
        answered: rows.length,
        accuracy: inWindow.length > 0 ? Math.round((100 * correct) / inWindow.length) : null,
        weakTopics: (weakRes.data ?? []).length,
        correctIds: new Set(rows.filter((r) => r.is_correct).map((r) => r.question_id as string)),
        answeredIds: new Set(rows.map((r) => r.question_id as string)),
      });
    } catch {
      setStats(EMPTY);
    }
  }, [skill, weakStrength]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { stats, reload };
}
