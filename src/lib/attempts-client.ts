/**
 * Клиентская отправка попыток в POST /api/attempts — общая для всех входов
 * (разделы, план дня). Сервер сам судит правильность по банку вопросов;
 * clientAttemptId делает сетевой ретрай безопасным (та же строка).
 * Ложных успехов нет: false = «не сохранено», и UI обязан это показать.
 */

export type AttemptSaveStatus = "saving" | "saved" | "failed";

export type AttemptSource = "free_practice" | "daily_plan";

export async function submitAttempt(input: {
  questionId: string;
  /** выбранный вариант в ОРИГИНАЛЬНОЙ нумерации банка (до перетасовки) */
  selected: number;
  source: AttemptSource;
  timeSpentMs?: number | null;
  clientAttemptId: string;
}): Promise<boolean> {
  try {
    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Самооценка (флэшкарты «знаю/не знаю»): пишется с is_self_reported = true,
 * ни в какую точность и mastery не входит — это мнение, не проверка. */
export async function submitSelfReport(input: {
  itemId: string;
  known: boolean;
  source: AttemptSource;
  clientAttemptId: string;
}): Promise<boolean> {
  try {
    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ selfReport: true, ...input }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
