import { NextResponse } from "next/server";
import { GRAMMAR_TASKS } from "@/data/grammar-tasks";
import { canonicalTopic } from "@/data/topic-map";
import { recomputeTopicMastery } from "@/lib/attempts";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Приём одной попытки (Фаза 1: банк грамматики). Правильность судит СЕРВЕР
 * по банку вопросов — клиент присылает только выбранный вариант, наврать
 * is_correct невозможно. Вставка сессией студента (RLS «only own»), после
 * неё — детерминированный пересчёт mastery затронутой темы.
 *
 * Идемпотентность: client_attempt_id генерируется на клике; ретрай той же
 * отправки упирается в уникальный индекс (23505) и честно отвечает saved.
 */

// Фаза 1: только грамматика. Следующие разделы добавляют свои банки сюда.
const QUESTION_BANK = new Map(
  GRAMMAR_TASKS.map((q) => [q.id, { ...q, skill: "grammar" as const }]),
);

const SOURCES = new Set(["free_practice", "daily_plan"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  if (!checkRateLimit(`attempts:${clientKey(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: {
    questionId?: string;
    selected?: number;
    timeSpentMs?: number;
    clientAttemptId?: string;
    source?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const q = typeof body.questionId === "string" ? QUESTION_BANK.get(body.questionId) : undefined;
  const selected = body.selected;
  if (
    !q ||
    !Number.isInteger(selected) ||
    (selected as number) < 0 ||
    (selected as number) >= q.options.length
  ) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const clientAttemptId =
    typeof body.clientAttemptId === "string" && UUID_RE.test(body.clientAttemptId)
      ? body.clientAttemptId
      : null;
  const source = SOURCES.has(body.source ?? "") ? (body.source as string) : "free_practice";
  const timeSpentMs =
    typeof body.timeSpentMs === "number" && Number.isFinite(body.timeSpentMs)
      ? Math.max(0, Math.min(3_600_000, Math.round(body.timeSpentMs)))
      : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  const isCorrect = selected === q.correctAnswer;
  const topic = canonicalTopic(q.topic);

  const { error } = await supabase.from("attempts").insert({
    user_id: user.id,
    question_id: q.id,
    skill: q.skill,
    topic,
    level: q.level,
    is_correct: isCorrect,
    is_self_reported: false,
    source,
    answer: { selected, correct: q.correctAnswer },
    time_spent_ms: timeSpentMs,
    client_attempt_id: clientAttemptId,
  });

  if (error) {
    // ретрай того же клика: строка уже есть — это успех, mastery уже пересчитан
    if (error.code === "23505") {
      return NextResponse.json({ saved: true, correct: isCorrect, duplicate: true });
    }
    console.error("[attempts] insert failed:", error.message);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  // best-effort: сырьё уже в БД; упавший пересчёт догонит recomputeAllMastery
  if (topic) await recomputeTopicMastery(supabase, user.id, topic);

  return NextResponse.json({ saved: true, correct: isCorrect });
}
