/**
 * Exam goal & date chosen during quiz onboarding (block D). The quiz runs
 * pre-auth, so the choice is cached in localStorage and persisted to
 * profiles on the first authed visit to /quiz/result. Editable in settings.
 */

import { createClient } from "./supabase/client";

export type ExamDateMode = "exact" | "approx" | "unknown";

export type ExamPlan = {
  targetLevel: "B2" | "C1";
  examDateMode: ExamDateMode;
  examDate?: string; // YYYY-MM-DD, mode = exact
  examHorizonMonths?: 1 | 3 | 6; // mode = approx
};

const KEY = "lingopro:examPlan";

export function stashExamPlan(p: ExamPlan) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function loadStashedExamPlan(): ExamPlan | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ExamPlan) : null;
  } catch {
    return null;
  }
}

export function clearStashedExamPlan() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Best-effort profile write; safe to call repeatedly. */
export async function saveExamPlanToProfile(p: ExamPlan): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({
        target_level: p.targetLevel,
        exam_date_mode: p.examDateMode,
        exam_date: p.examDateMode === "exact" ? (p.examDate ?? null) : null,
        exam_horizon_months: p.examDateMode === "approx" ? (p.examHorizonMonths ?? null) : null,
      })
      .eq("id", user.id);
  } catch {
    /* best-effort */
  }
}

export async function fetchExamPlan(): Promise<(ExamPlan & { hasProfile: boolean }) | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("target_level, exam_date, exam_date_mode, exam_horizon_months")
      .eq("id", user.id)
      .maybeSingle();
    if (!data) return null;
    return {
      hasProfile: true,
      targetLevel: data.target_level === "B2" ? "B2" : "C1",
      examDateMode: (["exact", "approx", "unknown"].includes(data.exam_date_mode as string)
        ? data.exam_date_mode
        : "unknown") as ExamDateMode,
      examDate: (data.exam_date as string | null) ?? undefined,
      examHorizonMonths: ([1, 3, 6].includes(data.exam_horizon_months as number)
        ? data.exam_horizon_months
        : undefined) as 1 | 3 | 6 | undefined,
    };
  } catch {
    return null;
  }
}

/** Days until the exam (mode exact only), null otherwise/past. */
export function daysToExam(p: Pick<ExamPlan, "examDateMode" | "examDate"> | null): number | null {
  if (!p || p.examDateMode !== "exact" || !p.examDate) return null;
  const diff = Math.ceil((Date.parse(p.examDate) - Date.now()) / 86_400_000);
  return diff >= 0 ? diff : null;
}
