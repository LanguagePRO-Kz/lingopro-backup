import { NextResponse } from "next/server";
import { requireActivePlan } from "@/lib/access";
import { DINLEME, OKUMA, ROUTER } from "@/data/diagnostic-bank";
import { GRAMMAR_TASKS } from "@/data/grammar-tasks";
import { READING_TASKS } from "@/data/reading-tasks";
import { LISTENING_TASKS } from "@/data/listening-tasks";
import { canonicalTopic } from "@/data/topic-map";
import { deterministicUuid, recomputeTopicMastery } from "@/lib/attempts";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Приём одной попытки. Правильность судит СЕРВЕР по банку вопросов —
 * клиент присылает только выбранный вариант, наврать is_correct невозможно.
 * Вставка сессией студента (RLS «only own»), после неё — детерминированный
 * пересчёт mastery затронутой темы.
 *
 * Самооценка (selfReport, флэшкарты словаря) — отдельная ветка: сервер не
 * может судить «знаю/не знаю», строка пишется с is_self_reported = true и
 * исключена из всех расчётов точности/mastery по построению.
 *
 * Идемпотентность: client_attempt_id генерируется на клике; ретрай той же
 * отправки упирается в уникальный индекс (23505) и честно отвечает saved.
 */

type BankEntry = {
  id: string;
  options: string[];
  correctAnswer: number;
  skill: "grammar" | "reading" | "listening";
  level: string;
  topic: string | null;
};

// единый банк: грамматика + вопросы текстов чтения/аудирования (id вопросов
// уникальны между банками — держит тест). Темы текстов — ситуативная лексика
// («Tanışma», «Restoranda sipariş»), в грамматическом реестре канона нет →
// честный null: такие попытки двигают только точность навыка.
const QUESTION_BANK = new Map<string, BankEntry>();
for (const q of GRAMMAR_TASKS) {
  QUESTION_BANK.set(q.id, {
    id: q.id,
    options: q.options,
    correctAnswer: q.correctAnswer,
    skill: "grammar",
    level: q.level,
    topic: canonicalTopic(q.topic),
  });
}
for (const t of READING_TASKS) {
  for (const q of t.questions) {
    QUESTION_BANK.set(q.id, { id: q.id, options: q.options, correctAnswer: q.correctAnswer, skill: "reading", level: t.level, topic: null });
  }
}
for (const t of LISTENING_TASKS) {
  for (const q of t.questions) {
    QUESTION_BANK.set(q.id, { id: q.id, options: q.options, correctAnswer: q.correctAnswer, skill: "listening", level: t.level, topic: null });
  }
}

// диагностический банк (v3): router — грамматика с темами реестра,
// dinleme/okuma — понимание (тема ситуативная → отражаем skill'ом)
type DiagEntry = BankEntry & { module: "grammar" | "listening" | "reading" };
const DIAG_BANK = new Map<string, DiagEntry>();
for (const q of ROUTER) {
  DIAG_BANK.set(q.id, {
    id: q.id, options: q.options, correctAnswer: q.answer, skill: "grammar", level: q.level,
    topic: q.topic !== "other" ? q.topic : null, module: "grammar",
  });
}
for (const q of DINLEME) {
  DIAG_BANK.set(q.id, {
    id: q.id, options: q.options, correctAnswer: q.answer, skill: "listening", level: q.level,
    topic: q.topic !== "other" ? q.topic : null, module: "listening",
  });
}
for (const q of OKUMA) {
  DIAG_BANK.set(q.id, {
    id: q.id, options: q.options, correctAnswer: q.answer, skill: "reading", level: q.level,
    topic: q.topic !== "other" ? q.topic : null, module: "reading",
  });
}

const SOURCES = new Set(["free_practice", "daily_plan", "diagnostic"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Один элемент батча диагностики: выбор в оригинальном порядке банка
 *  или skipped=true («Не знаю») — правильность судит сервер. */
type DiagAnswer = { questionId?: string; selected?: number | null; skipped?: boolean };

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
    selfReport?: boolean;
    itemId?: string;
    known?: boolean;
    /** батч диагностики: ключ прохода (takenAt результата) + ответы */
    diagnosticBatch?: { takenAt?: number; answers?: DiagAnswer[] };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const clientAttemptId =
    typeof body.clientAttemptId === "string" && UUID_RE.test(body.clientAttemptId)
      ? body.clientAttemptId
      : null;
  const source = SOURCES.has(body.source ?? "") ? (body.source as string) : "free_practice";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  // диагностика — бесплатный вход в продукт (решение основателя, P0-2);
  // остальные источники — только активная подписка/триал
  if (source !== "diagnostic") {
    const access = await requireActivePlan(supabase);
    if (!access.ok) return NextResponse.json({ error: access.reason }, { status: access.status });
  }

  /* ---------------------- батч диагностики (Фаза 4) ----------------------- */
  // Аноним проходит квиз без записи; на первом authed-визите /quiz/result
  // ответы уезжают сюда ОДНИМ батчем. Сервер судит по диагностическому банку
  // сам; «Не знаю» → skipped=true (незнание ≠ угадывание). Дедуп повторных
  // визитов — детерминированный client_attempt_id (diag:takenAt:questionId).
  if (body.diagnosticBatch) {
    const takenAt = Number(body.diagnosticBatch.takenAt);
    const answers = Array.isArray(body.diagnosticBatch.answers) ? body.diagnosticBatch.answers : [];
    if (!Number.isFinite(takenAt) || answers.length === 0 || answers.length > 60) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    const rows = [];
    for (const a of answers) {
      const q = typeof a.questionId === "string" ? DIAG_BANK.get(a.questionId) : undefined;
      if (!q) continue; // незнакомый id — молча пропускаем, не валим батч
      const skipped = a.skipped === true;
      const selected =
        !skipped && Number.isInteger(a.selected) && (a.selected as number) >= 0 && (a.selected as number) < q.options.length
          ? (a.selected as number)
          : null;
      if (!skipped && selected === null) continue; // ни выбора, ни пропуска — мусор
      rows.push({
        user_id: user.id,
        question_id: q.id,
        skill: q.skill,
        topic: q.topic,
        level: q.level,
        is_correct: !skipped && selected === q.correctAnswer,
        is_self_reported: false,
        source: "diagnostic",
        skipped,
        answer: skipped ? null : { selected, correct: q.correctAnswer },
        client_attempt_id: deterministicUuid(`diag:${takenAt}:${q.id}`),
      });
    }
    if (rows.length === 0) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    const { error } = await supabase.from("attempts").insert(rows);
    if (error && error.code === "23505") {
      // повторный визит result-страницы: попытки этого прохода уже записаны
      return NextResponse.json({ saved: true, duplicate: true, count: rows.length });
    }
    if (error) {
      console.error("[attempts] diagnostic batch insert failed:", error.message);
      return NextResponse.json({ error: "save_failed" }, { status: 500 });
    }
    const topics = [...new Set(rows.map((r) => r.topic).filter((t): t is string => !!t))];
    await Promise.all(topics.map((t) => recomputeTopicMastery(supabase, user.id, t)));
    return NextResponse.json({ saved: true, count: rows.length });
  }

  /* ------------------------- самооценка (словарь) ------------------------- */
  if (body.selfReport === true) {
    const itemId = typeof body.itemId === "string" ? body.itemId.trim().slice(0, 80) : "";
    if (!itemId || typeof body.known !== "boolean") {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    const { error } = await supabase.from("attempts").insert({
      user_id: user.id,
      question_id: `vocab:${itemId}`,
      skill: "vocabulary",
      topic: null,
      level: null,
      is_correct: body.known,
      is_self_reported: true,
      source,
      client_attempt_id: clientAttemptId,
    });
    if (error && error.code !== "23505") {
      console.error("[attempts] self-report insert failed:", error.message);
      return NextResponse.json({ error: "save_failed" }, { status: 500 });
    }
    // mastery не трогаем: самооценка в расчёты не входит по построению
    return NextResponse.json({ saved: true });
  }

  /* --------------------------- проверяемый ответ -------------------------- */
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
  const timeSpentMs =
    typeof body.timeSpentMs === "number" && Number.isFinite(body.timeSpentMs)
      ? Math.max(0, Math.min(3_600_000, Math.round(body.timeSpentMs)))
      : null;

  const isCorrect = selected === q.correctAnswer;

  const { error } = await supabase.from("attempts").insert({
    user_id: user.id,
    question_id: q.id,
    skill: q.skill,
    topic: q.topic,
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
  if (q.topic) await recomputeTopicMastery(supabase, user.id, q.topic);

  return NextResponse.json({ saved: true, correct: isCorrect });
}
