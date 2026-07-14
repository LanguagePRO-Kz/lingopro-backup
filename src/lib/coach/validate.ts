/**
 * Валидатор ФАКТОВ на выходе Ahu (Фаза 3.1): до показа студенту сообщение
 * проверяется детерминированным кодом. Не прошло → честный статичный шаблон
 * (лучше скучно, чем врать — у продукта гарантия возврата денег).
 *
 * Проверки:
 *  1. ЧИСЛА: все значимые числа в тексте обязаны существовать в контексте,
 *     который видела модель («13 заданий» из воздуха — классика галлюцинации).
 *  2. ТЕМЫ: упомянутые термины реестра тем — только из истории/решения ядра.
 *  3. ВРЕМЯ: пустая история → никаких отсылок к прошлому («вчера», «N дней
 *     назад», «в прошлый раз»).
 */

import { TOPICS } from "@/lib/ai/topics";
import type { CoachDecision, StudentSnapshot } from "./types";

export type FactCheck = { ok: true } | { ok: false; reason: string };

/** Числа 0–5 разрешены всегда: «первый шаг», «2-3 предложения» — стилистика,
 *  не метрики. Всё крупнее должно быть в контексте. */
const SMALL_NUMBER_MAX = 5;

/** Маркеры отсылок к прошлому (ru/en/tr/kk) — запрещены при пустой истории. */
const PAST_MARKERS =
  /вчера|позавчера|дня назад|дней назад|недел[юие] назад|прошл(?:ый|ая|ой|ую)|yesterday|days ago|last week|last time|dün|geçen hafta|önceki gün|gün önce|кеше|алдыңғы күні|өткен апта|күн бұрын/i;

function numbersIn(text: string): Set<string> {
  // 45%, 13, 3/5, 72 — берём числовые токены; даты внутри ISO-строк тоже
  return new Set(text.match(/\d+/g) ?? []);
}

/**
 * Темы, которые Ahu имеет право называть: решение ядра + маршрут недели +
 * всё, что реально есть в истории студента (mastery-строки, свежие ошибки,
 * последний урок).
 */
export function allowedTopicIds(s: StudentSnapshot, d: CoachDecision): Set<string> {
  return new Set(
    [
      ...d.focusTopics,
      d.actionTopic ?? "",
      ...(s.routeWeek?.topics ?? []),
      ...s.topics.map((t) => t.topic),
      ...s.recentErrors.map((e) => e.topic),
      ...(s.lastVoice?.topicsWorked ?? []),
    ].filter(Boolean),
  );
}

/**
 * Проверка текста Ahu против снапшота. contextStr — ровно та строка фактов,
 * которую видела модель (buildAhuContext): её числа — «белый список».
 */
export function validateAhuFacts(input: {
  text: string;
  contextStr: string;
  snapshot: StudentSnapshot;
  decision: CoachDecision;
}): FactCheck {
  const { text, contextStr, snapshot, decision } = input;

  // 1. числа: каждое значимое число текста должно существовать в контексте
  const allowed = numbersIn(contextStr);
  for (const n of numbersIn(text)) {
    if (Number(n) <= SMALL_NUMBER_MAX) continue;
    if (!allowed.has(n)) return { ok: false, reason: `число «${n}» отсутствует в контексте` };
  }

  // 2. темы: турецкие label реестра, которых нет в истории/решении.
  // Модель обычно оставляет термины по-турецки; переведённые названия этот
  // фильтр не ловит — числа и время выше закрывают основной риск.
  const allowedTopics = allowedTopicIds(snapshot, decision);
  const lower = text.toLowerCase();
  for (const t of TOPICS) {
    if (t.id === "other" || allowedTopics.has(t.id)) continue;
    const label = t.label.tr.toLowerCase();
    if (label.length >= 5 && lower.includes(label)) {
      return { ok: false, reason: `тема «${t.label.tr}» не из истории студента` };
    }
  }

  // 3. пустая история → запрещены отсылки к прошлому
  const hasHistory =
    snapshot.days.some((d) => d.done > 0 && d.date < snapshot.today) ||
    snapshot.recentErrors.length > 0 ||
    !!snapshot.lastVoice?.endedAt ||
    snapshot.lastMock?.total != null;
  if (!hasHistory && PAST_MARKERS.test(text)) {
    return { ok: false, reason: "отсылка к прошлому при пустой истории" };
  }

  return { ok: true };
}
