/**
 * Single source of truth for AI model routing.
 *
 * Model choices come from the live bake-off of 07.07.2026
 * (docs/RECON-2-AI-CORE.md §2.3–2.4, approved by the founder):
 *  - bulk text review (writing, diagnostics) → DeepSeek V4 Pro (~$0.004/check,
 *    100% recall of critical errors on seeded Turkish essays);
 *  - Kazakh feedback → Claude Sonnet (noticeably more precise KK wording);
 *  - dialogue / voice review / plan routing → Claude Sonnet (fast streaming).
 *
 * Global override: set AI_PROVIDER + AI_MODEL env vars to force every task
 * onto one model — the founder's "swap the model in one place" switch.
 */

export type AiTask =
  | "speaking_chat" // existing push-to-talk speaking coach (/api/speaking)
  | "tutor_chat"
  | "writing_review"
  | "diagnostic_analysis"
  | "voice_review"
  | "route_plan"
  | "motivator_note"; // daily one-liner from Ahu on the dashboard

export type AiProvider = "anthropic" | "deepseek";
export type FeedbackLang = "ru" | "en" | "tr" | "kk";

export type ModelChoice = { provider: AiProvider; model: string };

const SONNET: ModelChoice = { provider: "anthropic", model: "claude-sonnet-4-6" };
// Explicit id — the "deepseek-chat" alias is deprecated on 2026-07-24.
const DEEPSEEK_PRO: ModelChoice = { provider: "deepseek", model: "deepseek-v4-pro" };

const TASK_MODELS: Record<AiTask, ModelChoice> = {
  speaking_chat: SONNET,
  tutor_chat: SONNET,
  voice_review: SONNET,
  route_plan: SONNET,
  writing_review: DEEPSEEK_PRO,
  diagnostic_analysis: DEEPSEEK_PRO,
  motivator_note: DEEPSEEK_PRO, // 1 short line/day — the cheap path
};

// Language quality beats price here: writing is capped at 3/day anyway.
const LANG_OVERRIDES: Partial<Record<AiTask, Partial<Record<FeedbackLang, ModelChoice>>>> = {
  writing_review: { kk: SONNET },
  diagnostic_analysis: { kk: SONNET },
  motivator_note: { kk: SONNET },
};

/** When the primary provider fails or returns garbage, retry once here. */
export const FALLBACK: Record<AiProvider, ModelChoice | null> = {
  deepseek: SONNET,
  anthropic: null,
};

export function resolveModel(task: AiTask, lang?: FeedbackLang): ModelChoice {
  const provider = process.env.AI_PROVIDER as AiProvider | undefined;
  const model = process.env.AI_MODEL;
  if (provider && model) return { provider, model };
  return (lang && LANG_OVERRIDES[task]?.[lang]) || TASK_MODELS[task];
}

export function apiKeyFor(provider: AiProvider): string | undefined {
  return provider === "anthropic" ? process.env.ANTHROPIC_API_KEY : process.env.DEEPSEEK_API_KEY;
}

/** True if the task can be served (primary or fallback has a key). */
export function isConfigured(task: AiTask, lang?: FeedbackLang): boolean {
  const primary = resolveModel(task, lang);
  if (apiKeyFor(primary.provider)) return true;
  const fb = FALLBACK[primary.provider];
  return !!(fb && apiKeyFor(fb.provider));
}
