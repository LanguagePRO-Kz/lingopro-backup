/**
 * Сборка StudentSnapshot — ЕДИНСТВЕННАЯ точка чтения данных агента
 * (server-only: вызывается из роутов с сессионным supabase-клиентом, RLS
 * отдаёт только свои строки). Два раунда запросов: профиль (даёт таймзону →
 * «сегодня»), затем всё остальное параллельно. Ошибки отдельных таблиц не
 * валят снапшот — соответствующая секция честно пустеет.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { todayInTimezone } from "@/lib/ai/limits";
import { contentLevel } from "@/lib/daily-plan";
import { assessPlan, type StudentLevel } from "@/lib/plan/feasibility";
import { currentWeekIndex, topicsForSpan, type StudyRoute } from "@/lib/plan/route";
import type { VoiceReport } from "@/lib/ai/prompts/voice-review";
import type { SnapshotError, SnapshotTopic, StudentSnapshot } from "./types";
import { isoShift } from "./states";

const DAYS_WINDOW = 14;
const ERRORS_WINDOW_DAYS = 7;
const ERRORS_CAP = 10;
const TOPICS_CAP = 40;

export async function buildSnapshot(
  supabase: SupabaseClient,
  userId: string,
  opts?: {
    /** KK-носитель (интерфейс kk) — влияет только на вердикт feasibility */
    kkNative?: boolean;
  },
): Promise<StudentSnapshot> {
  // раунд 1: профиль (таймзона → «сегодня»); gender — изолированно, как во
  // всех роутах: колонка едет миграцией 0006 и не должна валить остальное
  const [{ data: profile }, { data: genderRow }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "quiz_result, target_level, exam_date, exam_date_mode, timezone, study_minutes_daily, study_route, full_name, handle",
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("profiles").select("gender").eq("id", userId).maybeSingle(),
  ]);

  const today = todayInTimezone((profile?.timezone as string | null) ?? null);

  // раунд 2: всё остальное параллельно
  const [daysRes, masteryRes, errorsRes, mocksRes, voiceRes] = await Promise.all([
    supabase
      .from("daily_progress")
      .select("date, completed_count, total_count")
      .eq("user_id", userId)
      .gte("date", isoShift(today, -DAYS_WINDOW))
      .order("date", { ascending: true }),
    supabase
      .from("topic_mastery")
      .select("topic, strength, error_count, success_count, last_error_at, last_practiced_at, updated_at")
      .eq("user_id", userId)
      .order("strength", { ascending: true })
      .limit(TOPICS_CAP),
    supabase
      .from("error_events")
      .select("quote, correction, topic, source, created_at")
      .eq("user_id", userId)
      .gte("created_at", `${isoShift(today, -ERRORS_WINDOW_DAYS)}T00:00:00Z`)
      .order("created_at", { ascending: false })
      .limit(ERRORS_CAP),
    supabase
      .from("mock_results")
      .select("total, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("voice_sessions")
      .select("ended_at, seconds, report")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(1),
  ]);

  const quiz = (profile?.quiz_result as { level?: string; minutesDaily?: number } | null) ?? null;
  const level = quiz?.level ?? "A2";
  const targetLevel: "B2" | "C1" = profile?.target_level === "B2" ? "B2" : "C1";

  const daysToExam =
    profile?.exam_date_mode === "exact" && profile?.exam_date
      ? Math.max(0, Math.ceil((Date.parse(profile.exam_date as string) - Date.parse(today)) / 86_400_000))
      : null;

  // темп: колонка → выбор из онбординга → null; кламп 120 как в daily-plan
  let minutesDaily = (profile?.study_minutes_daily as number | null) ?? quiz?.minutesDaily ?? null;
  if (minutesDaily != null && minutesDaily > 120) minutesDaily = 120;

  const days = (daysRes.data ?? []).map((r) => ({
    date: r.date as string,
    done: (r.completed_count as number | null) ?? 0,
    total: (r.total_count as number | null) ?? 0,
  }));

  const topics: SnapshotTopic[] = (masteryRes.data ?? []).map((r) => ({
    topic: r.topic as string,
    strength: (r.strength as number | null) ?? 50,
    errorCount: (r.error_count as number | null) ?? 0,
    successCount: (r.success_count as number | null) ?? 0,
    lastErrorAt: (r.last_error_at as string | null) ?? null,
    lastPracticedAt: (r.last_practiced_at as string | null) ?? null,
    updatedAt: (r.updated_at as string | null) ?? null,
  }));

  const recentErrors: SnapshotError[] = (errorsRes.data ?? []).map((r) => ({
    quote: (r.quote as string | null) ?? "",
    correction: (r.correction as string | null) ?? "",
    topic: (r.topic as string | null) ?? "other",
    source: (r.source as string | null) ?? "unknown",
    createdAt: r.created_at as string,
  }));

  const mocks = (mocksRes.data ?? []).map((r) => ({
    total: (r.total as number | null) ?? null,
    createdAt: r.created_at as string,
  }));

  // последний голосовой урок: минуты честные (биллинговая логика — Ceil)
  const voiceRow = (voiceRes.data ?? [])[0] as
    | { ended_at: string | null; seconds: number | null; report: VoiceReport | null }
    | undefined;
  const report = voiceRow?.report && voiceRow.report.valid ? voiceRow.report : null;
  const lastVoice = voiceRow
    ? {
        endedAt: voiceRow.ended_at ?? null,
        minutes: Math.ceil(Math.max(0, voiceRow.seconds ?? 0) / 60),
        topicsWorked: report?.topics_worked ?? [],
        errorCount: report?.errors.length ?? 0,
        criteriaTotal: report
          ? report.criteria.fluency.score +
            report.criteria.grammar.score +
            report.criteria.vocab.score +
            report.criteria.coherence.score
          : null,
      }
    : null;

  // маршрут: та же валидация формы, что в daily-plan.ts
  const routeRaw = profile?.study_route as StudyRoute | null | undefined;
  const route =
    routeRaw && routeRaw.version === 1 && Array.isArray(routeRaw.weeks) && routeRaw.weeks.length > 0
      ? routeRaw
      : null;
  const weekIdx = route ? currentWeekIndex(route, today) : 0;
  const week = route ? route.weeks[weekIdx - 1] : null;

  // честный вердикт по датам/темпу; A0 поддержан лестницей StudentLevel
  const mastered = topics.filter((t) => t.strength >= 60).map((t) => t.topic);
  const levelForLadder: StudentLevel = (["A0", "A1", "A2", "B1", "B2", "C1"] as const).includes(
    level as StudentLevel,
  )
    ? (level as StudentLevel)
    : "A2";
  const feasibility =
    minutesDaily != null
      ? (() => {
          const p = assessPlan({
            level: levelForLadder,
            targetLevel,
            masteredTopics: mastered,
            minutesDaily,
            daysLeft: daysToExam,
            kkNative: opts?.kkNative,
            todayIso: today,
          });
          return { verdict: p.verdict, loadPct: p.loadPct };
        })()
      : null;

  const span = new Set(topicsForSpan(contentLevel(level), targetLevel));
  const topicsClosed = topics.filter((t) => t.strength >= 60 && span.has(t.topic)).length;

  return {
    today,
    // таймзона нужна потребителям, датирующим таймстампы («вчера/сегодня»
    // считается в сутках СТУДЕНТА, не в UTC — правило 1.3)
    timezone: (profile?.timezone as string | null) ?? null,
    name: (profile?.full_name as string | null) ?? (profile?.handle as string | null) ?? null,
    gender: (genderRow?.gender as "female" | "male" | null) ?? null,
    level,
    targetLevel,
    daysToExam,
    minutesDaily,
    routeWeek: route && week ? { index: weekIdx, total: route.weeks.length, themeTr: week.theme.tr, topics: week.topics } : null,
    feasibility,
    days,
    topics,
    recentErrors,
    lastMock: mocks[0] ?? null,
    prevMock: mocks[1] ?? null,
    lastVoice,
    topicsClosed,
  };
}
