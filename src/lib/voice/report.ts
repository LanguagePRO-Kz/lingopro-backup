/**
 * Общий конвейер письменного разбора голосового урока: чтение разговора из
 * ElevenLabs, генерация отчёта, запись attempts. Используется тремя путями:
 * settle-роутом (/api/voice/session/end), post-call вебхуком ElevenLabs и
 * бэкфилл-скриптом сломанных сессий.
 *
 * Правило 1.3: транскрипт — истина только при ТЕРМИНАЛЬНОМ статусе записи.
 * Прежний settle брал duration>0 за готовность — метаданные приходят раньше
 * транскрипта, и 8 живых сессий легли в БД с items=0 при seconds до 181
 * (проверено по проду 14.07.2026): «урок без ошибок», которого не было.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { callAI, type FeedbackLang } from "@/lib/ai";
import { recordErrors, recordSuccesses } from "@/lib/ai/mastery";
import {
  buildVoiceReviewSystem,
  buildVoiceReviewUserMessage,
  validateVoiceReport,
  type VoiceReport,
} from "@/lib/ai/prompts/voice-review";
import { topicById } from "@/lib/ai/topics";
import { deterministicUuid, recomputeTopicMastery } from "@/lib/attempts";
import { recordVoiceSummary } from "@/lib/coach/voice-summary";

/** Снимок разговора из API ElevenLabs (нужные поля). */
export type ConvSnapshot = {
  agent_id?: string;
  status?: string;
  metadata?: {
    call_duration_secs?: number;
    start_time_unix_secs?: number;
    dynamic_variables?: Record<string, string>;
  };
  conversation_initiation_client_data?: { dynamic_variables?: Record<string, string> };
  transcript?: { role?: string; message?: string | null }[];
};

/**
 * Состояние письменного разбора в ответе клиенту:
 *  ready              — разбор есть;
 *  too_short          — разговор финализирован, студент сказал <2 реплик (терминально);
 *  pending_transcript — ElevenLabs ещё не финализировал запись, повтор даст разбор;
 *  failed             — транскрипт есть, но AI-генерация не удалась, повтор разрешён.
 */
export type ReportState = "ready" | "too_short" | "pending_transcript" | "failed";

export async function fetchConversation(conversationId: string, apiKey: string): Promise<ConvSnapshot | null> {
  return fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`, {
    headers: { "xi-api-key": apiKey },
  })
    .then((r) => (r.ok ? (r.json() as Promise<ConvSnapshot>) : null))
    .catch(() => null);
}

/** Запись финализирована провайдером — транскрипту можно верить. */
export function isFinalized(conv: ConvSnapshot): boolean {
  return conv.status === "done" || conv.status === "failed";
}

export function transcriptLines(conv: ConvSnapshot): { role: "student" | "teacher"; text: string }[] {
  const rawItems = Array.isArray(conv.transcript) ? conv.transcript : [];
  return rawItems
    .filter((t) => typeof t.message === "string" && t.message.trim())
    .map((t) => ({
      role: (t.role === "user" ? "student" : "teacher") as "student" | "teacher",
      text: (t.message as string).trim(),
    }));
}

export function dynVarsOf(conv: ConvSnapshot): Record<string, string> {
  return (
    conv.conversation_initiation_client_data?.dynamic_variables ?? conv.metadata?.dynamic_variables ?? {}
  );
}

/** Детерминированный uuid для client_attempt_id — дедуп повторной генерации. */
const detUuid = deterministicUuid;

/** Терминальная отметка «речи не хватило» — хранится вместо NULL, чтобы
 *  идемпотентность отличала «нечего разбирать» от «разбор ещё не построен». */
export function tooShortReport(): VoiceReport {
  return {
    valid: false,
    invalid_reason: "too_short",
    summary: "",
    criteria: {
      fluency: { score: 0, comment: "" },
      grammar: { score: 0, comment: "" },
      vocab: { score: 0, comment: "" },
      coherence: { score: 0, comment: "" },
    },
    errors: [],
    topics_worked: [],
    next_steps: [],
  };
}

/**
 * Разбор → attempts (source='voice_lesson'): ошибки — неверные попытки по
 * своим темам, темы без единой ошибки — верные. Дедуп повторной генерации —
 * детерминированный client_attempt_id (частичный уникальный индекс 0012).
 */
export async function persistSpeakingAttempts(
  admin: SupabaseClient,
  userId: string,
  conversationId: string,
  report: VoiceReport,
  level: string,
): Promise<void> {
  try {
    const erred = new Set(report.errors.map((e) => e.topic));
    const rows = [
      ...report.errors.map((e, i) => ({
        user_id: userId,
        question_id: `voice:${conversationId}:err:${i}`,
        skill: "speaking",
        topic: e.topic && e.topic !== "other" ? e.topic : null,
        level,
        is_correct: false,
        is_self_reported: false,
        source: "voice_lesson",
        answer: { quote: e.quote, correction: e.correction, rule: e.rule },
        client_attempt_id: detUuid(`voice:${conversationId}:err:${i}`),
      })),
      ...report.topics_worked
        .filter((t) => !erred.has(t))
        .map((t) => ({
          user_id: userId,
          question_id: `voice:${conversationId}:ok:${t}`,
          skill: "speaking",
          topic: t,
          level,
          is_correct: true,
          is_self_reported: false,
          source: "voice_lesson",
          answer: null,
          client_attempt_id: detUuid(`voice:${conversationId}:ok:${t}`),
        })),
    ];
    if (rows.length === 0) return;
    const { error } = await admin.from("attempts").insert(rows);
    // 23505 — повторная генерация уже вставила эти попытки; не ошибка
    if (error && error.code !== "23505") {
      console.error("[voice] speaking attempts persist failed:", error.message);
      return;
    }
    const topics = [...new Set(rows.map((r) => r.topic).filter((t): t is string => !!t))];
    await Promise.all(topics.map((t) => recomputeTopicMastery(admin, userId, t)));
  } catch (e) {
    console.error("[voice] speaking attempts persist failed:", e instanceof Error ? e.message : e);
  }
}

/** Генерация письменного разбора по готовому транскрипту (null = AI недоступен). */
export async function generateVoiceReport(
  lines: { role: "student" | "teacher"; text: string }[],
  dynVars: Record<string, string>,
  gender: "female" | "male" | null,
): Promise<VoiceReport | null> {
  const lang = (["ru", "en", "tr", "kk"].includes(dynVars.feedback_lang_code)
    ? dynVars.feedback_lang_code
    : "en") as FeedbackLang;
  const lessonFocusTr = String(dynVars.lesson_focus_ids ?? "")
    .split(",")
    .map((id) => topicById(id.trim())?.label.tr)
    .filter(Boolean)
    .join(", ");
  const result = await callAI({
    task: "voice_review",
    feedbackLang: lang,
    system: buildVoiceReviewSystem(lang, gender),
    messages: [
      {
        role: "user",
        content: buildVoiceReviewUserMessage({
          transcriptLines: lines,
          lessonFocusTr,
          level: String(dynVars.level ?? "A2"),
          targetLevel: String(dynVars.target_level ?? "B2"),
        }),
      },
    ],
    maxTokens: 12000,
    json: true,
    thinking: true,
  });
  return result ? validateVoiceReport(result.parsed) : null;
}

/** Число реплик студента — порог осмысленного разбора. */
export function studentLineCount(lines: { role: "student" | "teacher"; text: string }[]): number {
  return lines.filter((l) => l.role === "student").length;
}

/**
 * Дозревание разбора для СУЩЕСТВУЮЩЕЙ строки voice_sessions с report IS NULL
 * (вызывают settle-ретрай, вебхук и бэкфилл; биллинг здесь не трогается).
 * Возвращает состояние + отчёт; при готовом разборе строка обновлена, побочные
 * записи (error_events, attempts, coach-карточка) сделаны.
 */
export async function maturePendingReport(
  admin: SupabaseClient,
  input: {
    sessionId: string;
    userId: string;
    conversationId: string;
    conv: ConvSnapshot;
    gender: "female" | "male" | null;
    minutes: number;
  },
): Promise<{ state: ReportState; report: VoiceReport | null }> {
  const { conv } = input;
  if (!isFinalized(conv)) return { state: "pending_transcript", report: null };

  const lines = transcriptLines(conv);
  const dynVars = dynVarsOf(conv);

  if (studentLineCount(lines) < 2) {
    const report = tooShortReport();
    await admin
      .from("voice_sessions")
      .update({ transcript: { conversation_id: input.conversationId, items: conv.transcript ?? [] }, report })
      .eq("id", input.sessionId);
    return { state: "too_short", report };
  }

  const report = await generateVoiceReport(lines, dynVars, input.gender);
  if (!report) return { state: "failed", report: null };

  await admin
    .from("voice_sessions")
    .update({ transcript: { conversation_id: input.conversationId, items: conv.transcript ?? [] }, report })
    .eq("id", input.sessionId);

  if (report.valid) {
    if (report.errors.length > 0) await recordErrors(admin, input.userId, "voice", report.errors);
    const erredTopics = new Set(report.errors.map((e) => e.topic));
    await recordSuccesses(
      admin,
      input.userId,
      report.topics_worked.filter((t) => !erredTopics.has(t)),
    );
    await persistSpeakingAttempts(admin, input.userId, input.conversationId, report, String(dynVars.level ?? "A2"));
    await recordVoiceSummary(admin, {
      userId: input.userId,
      conversationId: input.conversationId,
      minutes: input.minutes,
      report,
    });
  }
  return { state: report.valid ? "ready" : "too_short", report };
}
