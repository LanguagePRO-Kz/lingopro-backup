"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  computeStreak,
  weekCalendar,
  type DailyTask,
  type DayRow,
} from "@/lib/daily-plan";
import { LEVELS } from "@/data/types";

/**
 * Real stats for the dashboard /stats page. Everything is derived from the
 * tables that actually exist in this project:
 *   - `daily_progress` (date, tasks[], completed/total) → streak, week, per-skill
 *     completed counts and words learned;
 *   - `task_results`   (skill, score, max_score)        → per-skill score %;
 *   - `profiles.quiz_result.level`                      → current CEFR level.
 * The goal is the platform's fixed target (C1).
 *
 * Note: streak and the week strip are always "current" (period-independent).
 * The period selector filters the per-skill counts / words. Score % is all-time
 * because `task_results` has no reliable timestamp column.
 */

export type Skill = "reading" | "listening" | "writing" | "speaking";
export type Period = "week" | "month" | "3mo" | "6mo" | "all";

export type StatsData = {
  loading: boolean;
  streakDays: number;
  weekDone: boolean[]; // Пн..Вс
  currentLevel: string | null;
  targetLevel: string | null;
  goalProgressPct: number;
  scores: Record<Skill, number | null>;
  counts: { reading: number; listening: number; writing: number; speaking: number; vocab: number };
};

const TARGET_LEVEL = "C1";
const CEFR: Record<string, number> = { A0: 0, A1: 0, A2: 1, B1: 2, B2: 3, C1: 4 };

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function periodStartISO(period: Period): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === "week") d.setDate(d.getDate() - 6);
  else if (period === "month") d.setMonth(d.getMonth() - 1);
  else if (period === "3mo") d.setMonth(d.getMonth() - 3);
  else if (period === "6mo") d.setMonth(d.getMonth() - 6);
  else d.setFullYear(2000);
  return iso(d);
}

const INITIAL: StatsData = {
  loading: true,
  streakDays: 0,
  weekDone: [false, false, false, false, false, false, false],
  currentLevel: null,
  targetLevel: TARGET_LEVEL,
  goalProgressPct: 0,
  scores: { reading: null, listening: null, writing: null, speaking: null },
  counts: { reading: 0, listening: 0, writing: 0, speaking: 0, vocab: 0 },
};

type DbDay = { date: string; tasks: DailyTask[] | null; completed_count: number; total_count: number };
type DbResult = { skill: string; score: number; max_score: number };
type QuizResult = { level?: string } | null;

export function useStats(period: Period): StatsData {
  const [state, setState] = useState<StatsData>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
        return;
      }

      const [profileRes, daysRes, resultsRes] = await Promise.all([
        supabase.from("profiles").select("quiz_result, target_level").eq("id", user.id).maybeSingle(),
        supabase
          .from("daily_progress")
          .select("date, tasks, completed_count, total_count")
          .eq("user_id", user.id)
          .order("date"),
        supabase.from("task_results").select("skill, score, max_score").eq("user_id", user.id),
      ]);

      if (cancelled) return;

      // --- daily_progress → streak / week / period counts ---
      const days = (daysRes.data as DbDay[] | null) ?? [];
      const history: DayRow[] = days.map((d) => ({
        date: d.date,
        tasks: d.tasks ?? [],
        completedCount: d.completed_count,
        total: d.total_count,
      }));

      const streakDays = computeStreak(history);
      const weekDone = weekCalendar(history).map((w) => w.done);

      const from = periodStartISO(period);
      const counts = { reading: 0, listening: 0, writing: 0, speaking: 0, vocab: 0 };
      for (const day of history) {
        if (day.date < from) continue;
        for (const t of day.tasks) {
          if (!t.completed) continue;
          if (t.skill === "vocabulary") counts.vocab += t.count || 0;
          else if (t.skill in counts) counts[t.skill as Skill] += 1;
        }
      }

      // --- task_results → per-skill score % (all-time) ---
      const acc: Record<Skill, { sum: number; n: number }> = {
        reading: { sum: 0, n: 0 }, listening: { sum: 0, n: 0 }, writing: { sum: 0, n: 0 }, speaking: { sum: 0, n: 0 },
      };
      for (const r of (resultsRes.data as DbResult[] | null) ?? []) {
        if (!(r.skill in acc) || !r.max_score) continue;
        acc[r.skill as Skill].sum += (r.score / r.max_score) * 100;
        acc[r.skill as Skill].n += 1;
      }
      const avg = (a: { sum: number; n: number }) => (a.n ? Math.round(a.sum / a.n) : null);
      const scores = {
        reading: avg(acc.reading), listening: avg(acc.listening), writing: avg(acc.writing), speaking: avg(acc.speaking),
      };

      // --- profile → level + goal progress (goal is the student's B2/C1 choice) ---
      const quiz = (profileRes.data?.quiz_result as QuizResult) ?? null;
      const targetLevel = profileRes.data?.target_level === "B2" ? "B2" : TARGET_LEVEL;
      const currentLevel = quiz?.level && LEVELS.includes(quiz.level as (typeof LEVELS)[number]) ? quiz.level : null;
      const goalProgressPct = currentLevel
        ? Math.max(0, Math.min(100, Math.round(((CEFR[currentLevel] ?? 0) / CEFR[targetLevel]) * 100)))
        : 0;

      setState({
        loading: false,
        streakDays,
        weekDone,
        currentLevel,
        targetLevel,
        goalProgressPct,
        scores,
        counts,
      });
    })().catch((err) => {
      console.error("[useStats]", err);
      if (!cancelled) setState((s) => ({ ...s, loading: false }));
    });

    return () => {
      cancelled = true;
    };
  }, [period]);

  return state;
}
