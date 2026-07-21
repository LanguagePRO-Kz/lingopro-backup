"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeStreak, weekCalendar, type DayRow } from "@/lib/daily-plan";
import { LEVELS } from "@/data/types";

/**
 * Real stats for the dashboard /stats page — два РАЗНЫХ источника, которые
 * нельзя смешивать (правило 1.3: отсутствие данных ≠ результат):
 *
 * 1. ОЦЕНКА УРОВНЯ — `profiles.quiz_result.sections` (/25 за секцию):
 *    диагностика + голосовая проба (+ мок через attachKonusmaScore).
 *    Это снимок уровня, НЕ активность — показывается отдельной карточкой.
 * 2. РЕАЛЬНАЯ РАБОТА после диагностики:
 *    - `attempts` (source != 'diagnostic') → счётчики решённых заданий и
 *      точность reading/listening за период — ТОТ ЖЕ источник, куда пишут
 *      разделы, план дня и голосовой разбор; самооценка (is_self_reported)
 *      в точность не входит, в счётчик слов — входит (реальное повторение);
 *    - `essays` status='done' → сколько эссе реально проверено (Блок 3);
 *    - `voice_sessions` (seconds > 0) → сколько голосовых уроков;
 *    - `daily_progress` → стрик и неделя (только реальные выполненные дни).
 *
 * Цель: target_level из профиля; NULL → B2 (порог вуза), НИКОГДА не C1.
 */

export type Skill = "reading" | "listening" | "writing" | "speaking";
export type Period = "week" | "month" | "3mo" | "6mo" | "all";

export type SectionScores = { dinleme: number | null; okuma: number | null; yazma: number | null; konusma: number | null };

export type StatsData = {
  loading: boolean;
  streakDays: number;
  weekDone: boolean[]; // Пн..Вс
  currentLevel: string | null;
  targetLevel: "B2" | "C1";
  goalProgressPct: number;
  /** оценка уровня по секциям (/25) из диагностики/пробы/мока; null = данных нет */
  levelEstimate: SectionScores | null;
  /** точность за период по РЕАЛЬНЫМ заданиям (без диагностики и самооценки) */
  accuracy: { reading: number | null; listening: number | null };
  /** решённое за период: задания/эссе/уроки/слова — реальная работа */
  counts: { reading: number; listening: number; writing: number; speaking: number; vocab: number };
  /** задания по дням за период (для блока «Активность»); пусто = честный 0 */
  activityByDay: { date: string; n: number }[];
};

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
  targetLevel: "B2",
  goalProgressPct: 0,
  levelEstimate: null,
  accuracy: { reading: null, listening: null },
  counts: { reading: 0, listening: 0, writing: 0, speaking: 0, vocab: 0 },
  activityByDay: [],
};

type DbDay = { date: string; tasks: { completed?: boolean }[] | null; completed_count: number; total_count: number };
type QuizResult = { level?: string; sections?: Partial<SectionScores> } | null;

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

      const from = periodStartISO(period);
      const [profileRes, daysRes, attemptsRes, essaysRes, voiceRes] = await Promise.all([
        supabase.from("profiles").select("quiz_result, target_level").eq("id", user.id).maybeSingle(),
        supabase
          .from("daily_progress")
          .select("date, tasks, completed_count, total_count")
          .eq("user_id", user.id)
          .order("date"),
        supabase
          .from("attempts")
          .select("skill, is_correct, is_self_reported, source, answered_at")
          .eq("user_id", user.id)
          .in("skill", ["reading", "listening", "vocabulary"])
          .neq("source", "diagnostic")
          .gte("answered_at", `${from}T00:00:00Z`)
          .order("answered_at", { ascending: false })
          .limit(5000),
        // реальные проверенные эссе (таблица essays, Блок 3) — раньше счётчик
        // складывал СПИСАННУЮ КВОТУ ai_usage и показывал 0 при живых эссе
        supabase
          .from("essays")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("status", "done")
          .gte("created_at", `${from}T00:00:00Z`),
        supabase.from("voice_sessions").select("started_at, seconds").eq("user_id", user.id).gte("started_at", `${from}T00:00:00Z`),
      ]);

      if (cancelled) return;

      // --- daily_progress → стрик/неделя (не зависят от периода) ---
      const days = (daysRes.data as DbDay[] | null) ?? [];
      const history: DayRow[] = days.map((d) => ({
        date: d.date,
        tasks: (d.tasks ?? []) as DayRow["tasks"],
        completedCount: d.completed_count,
        total: d.total_count,
      }));
      const streakDays = computeStreak(history);
      const weekDone = weekCalendar(history).map((w) => w.done);

      // --- attempts (без диагностики) → счётчики + точность + активность ---
      const counts = { reading: 0, listening: 0, writing: 0, speaking: 0, vocab: 0 };
      const acc = { reading: { correct: 0, n: 0 }, listening: { correct: 0, n: 0 } };
      const byDay = new Map<string, number>();
      for (const r of (attemptsRes.data as { skill: string; is_correct: boolean; is_self_reported: boolean; answered_at: string }[] | null) ?? []) {
        const day = (r.answered_at ?? "").slice(0, 10);
        byDay.set(day, (byDay.get(day) ?? 0) + 1);
        if (r.skill === "vocabulary") counts.vocab += 1;
        else if (r.skill === "reading" || r.skill === "listening") {
          counts[r.skill] += 1;
          if (!r.is_self_reported) {
            acc[r.skill].n += 1;
            if (r.is_correct) acc[r.skill].correct += 1;
          }
        }
      }
      counts.writing = ((essaysRes.data as { id: string }[] | null) ?? []).length;
      counts.speaking = ((voiceRes.data as { seconds: number }[] | null) ?? []).filter((v) => (v.seconds ?? 0) > 0).length;
      const pct = (a: { correct: number; n: number }) => (a.n ? Math.round((100 * a.correct) / a.n) : null);
      const activityByDay = [...byDay.entries()].map(([date, n]) => ({ date, n })).sort((a, b) => (a.date < b.date ? -1 : 1));

      // --- quiz_result → оценка уровня (/25) + текущий уровень ---
      const quiz = (profileRes.data?.quiz_result as QuizResult) ?? null;
      const s = quiz?.sections;
      const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
      const levelEstimate: SectionScores | null = s
        ? { dinleme: num(s.dinleme), okuma: num(s.okuma), yazma: num(s.yazma), konusma: num(s.konusma) }
        : null;
      const currentLevel = quiz?.level && LEVELS.includes(quiz.level as (typeof LEVELS)[number]) ? quiz.level : null;

      // --- цель: B2 по умолчанию (порог вуза); C1 только если выбран явно ---
      const targetLevel: "B2" | "C1" = profileRes.data?.target_level === "C1" ? "C1" : "B2";
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
        levelEstimate,
        accuracy: { reading: pct(acc.reading), listening: pct(acc.listening) },
        counts,
        activityByDay,
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
