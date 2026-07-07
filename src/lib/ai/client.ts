/**
 * Provider-agnostic text-AI client. Server-only (reads secret keys).
 *
 * One entry point — callAI(). It resolves the model from models.ts
 * (task × feedback language × env override), calls the provider and, if the
 * primary fails or returns unparseable JSON, retries once on the configured
 * fallback (DeepSeek → Claude Sonnet). Keys are never logged.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  FALLBACK,
  apiKeyFor,
  resolveModel,
  type AiTask,
  type FeedbackLang,
  type ModelChoice,
} from "./models";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type CallOptions = {
  task: AiTask;
  system: string;
  messages: ChatMessage[];
  feedbackLang?: FeedbackLang;
  maxTokens?: number;
  /** Parse the reply as JSON (fence-tolerant); parse failure triggers fallback. */
  json?: boolean;
  /** Let the model think before answering (validated for writing review). */
  thinking?: boolean;
};

export type AiResult = {
  text: string;
  /** Present when options.json = true and parsing succeeded. */
  parsed?: unknown;
  provider: ModelChoice["provider"];
  model: string;
  fallbackUsed: boolean;
};

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_TIMEOUT_MS = 120_000; // v4-pro reasons for ~1 min on long inputs

async function callAnthropic(model: string, key: string, o: CallOptions): Promise<string | null> {
  const client = new Anthropic({ apiKey: key });
  const msg = await client.messages.create({
    model,
    max_tokens: o.maxTokens ?? 2048,
    system: o.system,
    messages: o.messages,
    ...(o.thinking ? { thinking: { type: "adaptive" as const } } : {}),
  });
  const text = msg.content
    .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return text || null;
}

async function callDeepSeek(model: string, key: string, o: CallOptions): Promise<string | null> {
  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: o.system }, ...o.messages],
      max_tokens: o.maxTokens ?? 2048,
      ...(o.json ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(DEEPSEEK_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  return text || null;
}

/** Tolerant JSON extraction: strips markdown fences, falls back to outer {…}. */
export function parseModelJson(text: string): unknown | null {
  const cleaned = text.replace(/```(?:json)?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {}
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch {}
  }
  return null;
}

async function tryOne(choice: ModelChoice, o: CallOptions): Promise<Omit<AiResult, "fallbackUsed"> | null> {
  const key = apiKeyFor(choice.provider);
  if (!key) return null;
  try {
    const text =
      choice.provider === "anthropic"
        ? await callAnthropic(choice.model, key, o)
        : await callDeepSeek(choice.model, key, o);
    if (!text) return null;
    if (o.json) {
      const parsed = parseModelJson(text);
      if (parsed === null) return null; // garbage JSON → let the fallback try
      return { text, parsed, provider: choice.provider, model: choice.model };
    }
    return { text, provider: choice.provider, model: choice.model };
  } catch (e) {
    console.error(`[ai] ${choice.provider}/${choice.model} failed:`, e instanceof Error ? e.message : e);
    return null;
  }
}

/** Returns null only when both the primary and its fallback are unavailable. */
export async function callAI(options: CallOptions): Promise<AiResult | null> {
  const primary = resolveModel(options.task, options.feedbackLang);
  const first = await tryOne(primary, options);
  if (first) return { ...first, fallbackUsed: false };

  const fb = FALLBACK[primary.provider];
  if (!fb) return null;
  const second = await tryOne(fb, options);
  return second ? { ...second, fallbackUsed: true } : null;
}
