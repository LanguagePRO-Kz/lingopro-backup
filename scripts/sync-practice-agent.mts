/**
 * Агент ПРАКТИКИ в ElevenLabs (Блок 1 от 16.08.2026).
 *
 * Отдельный агент, а не режим урочного: платформа запрещает override промпта
 * (platform_settings.overrides…prompt.prompt = false), и разрешать его нельзя —
 * промпт ушёл бы на клиент, где студент может подменить его на что угодно.
 * Поэтому минимальный промпт живёт в своём агенте.
 *
 * Голосовые/ASR-настройки скопированы с урочного агента — студент не должен
 * слышать разницу в голосе между режимами.
 *
 *   npx tsx scripts/sync-practice-agent.mts          # дифф (создание не делает)
 *   npx tsx scripts/sync-practice-agent.mts --apply  # создать/обновить агента
 *
 * После создания скрипт печатает ELEVENLABS_PRACTICE_AGENT_ID — его нужно
 * положить в .env.local и в переменные Vercel.
 */
import { readFileSync } from "node:fs";
import { PRACTICE_PROMPT, PRACTICE_SETTINGS } from "../src/lib/voice/practice-prompt";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const headers = { "xi-api-key": env.ELEVENLABS_API_KEY as string, "content-type": "application/json" };
const apply = process.argv.includes("--apply");
const practiceId = env.ELEVENLABS_PRACTICE_AGENT_ID || "";

/** Конфиг агента практики. Слоты подставляются из dynamicVariables на старте. */
const config = {
  name: "LingoPRO Pratik (sohbet)",
  conversation_config: {
    agent: {
      prompt: {
        prompt: PRACTICE_PROMPT,
        llm: PRACTICE_SETTINGS.llm,
        temperature: PRACTICE_SETTINGS.temperature,
        max_tokens: PRACTICE_SETTINGS.maxTokens,
        // платформа иначе клеит свою личность поверх нашего промпта каждый ход
        ignore_default_personality: PRACTICE_SETTINGS.ignoreDefaultPersonality,
      },
      language: "tr",
      first_message: "Merhaba! Nasılsın?", // перекрывается override'ом на старте
    },
    turn: { turn_timeout: PRACTICE_SETTINGS.turnTimeoutSeconds, turn_model: "turn_v3" },
    asr: { quality: "high", provider: "scribe_realtime", user_input_audio_format: "pcm_16000" },
    tts: {
      model_id: "eleven_flash_v2_5",
      voice_id: "xyqF3vGMQlPk3e7yA4DI", // Ahu — как у урочного агента
      stability: 0.5,
      speed: 0.9,
      similarity_boost: 0.8,
      agent_output_audio_format: "pcm_16000",
      optimize_streaming_latency: 3,
    },
    conversation: { max_duration_seconds: 900 },
  },
  platform_settings: {
    overrides: {
      conversation_config_override: {
        agent: { first_message: true },
        tts: { voice_id: true },
      },
    },
  },
};

async function main() {
  console.log("=== АГЕНТ ПРАКТИКИ ===");
  console.log("промпт:", PRACTICE_PROMPT.length, "символов ≈", Math.round(PRACTICE_PROMPT.length / 4), "токенов (шаблон, без подстановки)");
  console.log("llm:", PRACTICE_SETTINGS.llm, "| max_tokens:", PRACTICE_SETTINGS.maxTokens, "| ignore_default_personality:", PRACTICE_SETTINGS.ignoreDefaultPersonality);

  if (!practiceId) {
    console.log("\nELEVENLABS_PRACTICE_AGENT_ID не задан → агент будет СОЗДАН");
    if (!apply) {
      console.log("(dry-run; создать — с --apply)");
      return;
    }
    const res = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
      method: "POST",
      headers,
      body: JSON.stringify(config),
    });
    if (!res.ok) {
      console.error("создание не удалось:", res.status, await res.text());
      process.exit(1);
    }
    const { agent_id } = (await res.json()) as { agent_id: string };
    console.log("\n✓ агент создан:", agent_id);
    console.log("\nДОБАВЬ В .env.local И В VERCEL:");
    console.log(`ELEVENLABS_PRACTICE_AGENT_ID=${agent_id}`);
    return;
  }

  const API = "https://api.elevenlabs.io/v1/convai/agents/" + practiceId;
  const agent = (await fetch(API, { headers }).then((r) => r.json())) as {
    conversation_config?: { agent?: { prompt?: { prompt?: string; llm?: string; max_tokens?: number } } };
  };
  const current = agent?.conversation_config?.agent?.prompt?.prompt ?? "";
  console.log("\nагент:", practiceId);
  console.log("промпт совпадает:", current === PRACTICE_PROMPT ? "ДА" : `НЕТ (в консоли ${current.length}, канон ${PRACTICE_PROMPT.length})`);
  console.log("llm:", agent?.conversation_config?.agent?.prompt?.llm, "→ канон:", PRACTICE_SETTINGS.llm);
  console.log("max_tokens:", agent?.conversation_config?.agent?.prompt?.max_tokens, "→ канон:", PRACTICE_SETTINGS.maxTokens);

  if (!apply) {
    console.log("\n(dry-run; запись — с --apply)");
    return;
  }
  const res = await fetch(API, { method: "PATCH", headers, body: JSON.stringify(config) });
  if (!res.ok) {
    console.error("PATCH failed:", res.status, await res.text());
    process.exit(1);
  }
  const after = (await fetch(API, { headers }).then((r) => r.json())) as typeof agent;
  const ok = after?.conversation_config?.agent?.prompt?.prompt === PRACTICE_PROMPT;
  console.log(ok ? "\n✓ агент практики синхронизирован" : "\n✗ верификация после PATCH не сошлась");
  process.exit(ok ? 0 : 1);
}

void main();
