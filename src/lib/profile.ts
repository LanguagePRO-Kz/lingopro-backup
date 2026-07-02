/**
 * Supabase-backed user profile — the persistent home for the selected plan,
 * the diagnostic result and the daily plan progress. localStorage stays as a
 * fast synchronous cache; these helpers mirror writes to the DB and hydrate
 * the cache on login (see the dashboard layout).
 */

import { createClient } from "@/lib/supabase/client";
import type { QuizResult } from "./quiz";
import type { Progress } from "./studyplan";

/** Plan is free-form text: a package id ("1m"|"3m"|"6m") or "trial". */
export type Profile = {
  plan: string | null;
  quiz_result: QuizResult | null;
  plan_progress: Progress;
};

/** Read the current user's profile (null if not signed in). */
export async function fetchProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("plan, quiz_result, plan_progress")
    .eq("id", user.id)
    .maybeSingle();

  return {
    plan: (data?.plan as string | null) ?? null,
    quiz_result: (data?.quiz_result as QuizResult | null) ?? null,
    plan_progress: (data?.plan_progress as Progress | null) ?? {},
  };
}

async function upsert(patch: Record<string, unknown>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: (user.user_metadata?.full_name as string) ?? null,
    ...patch,
    updated_at: new Date().toISOString(),
  });
}

export const saveProfilePlan = (plan: string) => upsert({ plan });
export const saveProfileResult = (quiz_result: QuizResult) => upsert({ quiz_result });
export const saveProfileProgress = (plan_progress: Progress) => upsert({ plan_progress });
