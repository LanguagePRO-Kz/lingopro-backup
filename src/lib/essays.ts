/**
 * Серверная запись эссе (таблица essays, миграция 0023) — «работа студента
 * не исчезает»: строка создаётся ДО квоты и ДО вызова AI, статус честно
 * отражает исход (pending/done/failed/quota). Пишет service-роль: статус и
 * review судит только сервер, клиент таблицу лишь читает (RLS select own).
 *
 * Все функции best-effort: отсутствие таблицы (миграция ещё не применена)
 * или сбой записи НЕ должны валить проверку — сама проверка ценнее следа.
 */

import type { WritingReview } from "@/lib/ai/prompts/writing-review";
import { createAdminClient } from "@/lib/supabase/admin";

export type EssaySource = "practice" | "diagnostic";
export type EssayStatus = "pending" | "done" | "failed" | "quota";

export async function insertEssay(args: {
  userId: string;
  source: EssaySource;
  taskId?: string | null;
  taskPrompt: string;
  text: string;
}): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data, error } = await admin
    .from("essays")
    .insert({
      user_id: args.userId,
      source: args.source,
      task_id: args.taskId ?? null,
      task_prompt: args.taskPrompt,
      text: args.text,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) {
    console.error("[essays] insert failed:", error.message);
    return null;
  }
  return (data?.id as string) ?? null;
}

export async function updateEssayStatus(
  id: string | null,
  status: EssayStatus,
  review?: WritingReview,
): Promise<void> {
  if (!id) return;
  const admin = createAdminClient();
  if (!admin) return;
  const { error } = await admin
    .from("essays")
    .update({
      status,
      ...(review ? { review, score: review.valid ? review.score_total_25 : null } : {}),
      ...(status === "done" ? { reviewed_at: new Date().toISOString() } : {}),
    })
    .eq("id", id);
  if (error) console.error("[essays] update failed:", error.message);
}

/** Эссе для перепроверки: только своё и только не-done (done не пережигаем). */
export async function fetchEssayForRetry(
  id: string,
  userId: string,
): Promise<{ id: string; text: string; taskPrompt: string; taskId: string | null; source: EssaySource } | null> {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("essays")
    .select("id, text, task_prompt, task_id, source, status")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data || data.status === "done") return null;
  return {
    id: data.id as string,
    text: data.text as string,
    taskPrompt: (data.task_prompt as string | null) ?? "Serbest konu",
    taskId: (data.task_id as string | null) ?? null,
    source: (data.source as EssaySource) ?? "practice",
  };
}
