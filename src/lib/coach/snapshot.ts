/**
 * Сборка StudentSnapshot — ЕДИНСТВЕННАЯ точка чтения данных агента
 * (server-only: вызывается из роутов с сессионным supabase-клиентом, RLS
 * отдаёт только свои строки). Два раунда запросов: профиль (даёт таймзону →
 * «сегодня»), затем всё остальное параллельно. Ошибки отдельных таблиц не
 * валят снапшот — соответствующая секция честно пустеет.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { todayInTimezone } from "@/lib/ai/limits";
import { examFormat } from "@/lib/exam/format";
import { examReadiness, mergeSectionEstimates } from "./readiness";
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
  const [{ data: profile }, { data: genderRow }, { data: fmtRow }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "quiz_result, target_level, exam_date, exam_date_mode, timezone, study_minutes_daily, study_route, full_name, handle",
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("profiles").select("gender").eq("id", userId).maybeSingle(),
    // изолированно: колонка едет миграцией 0017 — не валит остальное
    supabase.from("profiles").select("exam_format").eq("id", userId).maybeSingle(),
  ]);

  const today = todayInTimezone((profile?.timezone as string | null) ?? null);

  // раунд 2: всё остальное параллельно
  const [daysRes, masteryRes, errorsRes, mocksRes, voiceRes, attemptsRes, chatRes] = await Promise.all([
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
      .select("total, section_scores, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("voice_sessions")
      .select("ended_at, seconds, report")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(1),
    // per-skill точность за 30 дней (8.2): слабейший НАВЫК, не среднее;
    // диагностика исключена — это оценка уровня (агент видит её через
    // readiness-секции), а не практика
    supabase
      .from("attempts")
      .select("skill, is_correct")
      .eq("user_id", userId)
      .eq("is_self_reported", false)
      .neq("source", "diagnostic")
      .gte("answered_at", `${isoShift(today, -30)}T00:00:00Z`)
      .limit(2000),
    // единая память (8, п.1): бриф ПОМНИТ, о чём студент спрашивал в чате
    supabase
      .from("coach_messages")
      .select("content, created_at")
      .eq("user_id", userId)
      .eq("channel", "chat")
      .eq("role", "student")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const quiz = (profile?.quiz_result as { level?: string; minutesDaily?: number } | null) ?? null;
  const level = quiz?.level ?? "A2";
  // B2 — цель по умолчанию (порог вуза); C1 только если выбран явно
  const targetLevel: "B2" | "C1" = profile?.target_level === "C1" ? "C1" : "B2";

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

  const mocks = (mocksRes.data ?? [])
    .filter((r) => r.total != null)
    .map((r) => ({
      total: (r.total as number | null) ?? null,
      createdAt: r.created_at as string,
    }));

  // готовность к экзамену — главное число (8.2): секции из моков (свежее)
  // и диагностики, вердикт против формата ЕГО центра. Считает код.
  const fmt = examFormat((fmtRow?.exam_format as string | null) ?? null);
  const quizFull = profile?.quiz_result as {
    sections?: Partial<Record<"dinleme" | "okuma" | "yazma" | "konusma", number | null>>;
    takenAt?: number;
  } | null;
  const sectionEstimates = mergeSectionEstimates({
    mockRows: (mocksRes.data ?? []).map((r) => ({
      section_scores: (r.section_scores as Partial<Record<"dinleme" | "okuma" | "yazma" | "konusma", number>> | null) ?? null,
      created_at: r.created_at as string,
    })),
    diagnosticSections: quizFull?.sections ?? null,
    diagnosticAt: quizFull?.takenAt ? new Date(quizFull.takenAt).toISOString() : null,
  });
  const readiness = examReadiness(fmt, sectionEstimates);

  // per-skill точность (30д): агент бьёт в слабейший НАВЫК, не в среднее
  const skillAgg = new Map<string, { n: number; correct: number }>();
  for (const r of attemptsRes.data ?? []) {
    const s = r.skill as string;
    const cur = skillAgg.get(s) ?? { n: 0, correct: 0 };
    cur.n += 1;
    if (r.is_correct) cur.correct += 1;
    skillAgg.set(s, cur);
  }
  const skillAccuracy: Record<string, { n: number; pct: number }> = {};
  let weakestSkill: string | null = null;
  for (const [s, agg] of skillAgg) {
    if (agg.n < 5) continue; // мало данных ≠ оценка
    const pct = Math.round((100 * agg.correct) / agg.n);
    skillAccuracy[s] = { n: agg.n, pct };
    if (weakestSkill == null || pct < skillAccuracy[weakestSkill].pct) weakestSkill = s;
  }

  const lastChatRow = (chatRes.data ?? [])[0] as { content: string; created_at: string } | undefined;
  const lastChatQuestion = lastChatRow
    ? { text: lastChatRow.content.slice(0, 160), at: lastChatRow.created_at }
    : null;

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
        // невалидный разбор: Ahu должна ПОМНИТЬ причину («говорил по-русски»)
        invalidReason:
          voiceRow.report && !voiceRow.report.valid ? (voiceRow.report.invalid_reason ?? null) : null,
        // обещание прошлого урока — следующий обязан его вспомнить
        nextSteps: (report?.next_steps ?? []).slice(0, 2),
        pronunciationNote: report?.pronunciation_note || null,
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
  // закрытые ЗА НЕДЕЛЮ (для конкретной похвалы): сильная тема со свежим
  // апдейтом mastery — приближение «закрылась недавно» без отдельной таблицы
  const weekAgoIso = `${isoShift(today, -7)}T00:00:00Z`;
  const recentClosedTopics = topics
    .filter((t) => t.strength >= 60 && t.topic !== "other" && (t.updatedAt ?? "") >= weekAgoIso)
    .map((t) => t.topic)
    .slice(0, 3);

  return {
    today,
    // таймзона нужна потребителям, датирующим таймстампы («вчера/сегодня»
    // считается в сутках СТУДЕНТА, не в UTC — правило 1.3)
    timezone: (profile?.timezone as string | null) ?? null,
    examFormatSlug: fmt.slug,
    readiness,
    skillAccuracy,
    weakestSkill,
    lastChatQuestion,
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
    recentClosedTopics,
  };
}
