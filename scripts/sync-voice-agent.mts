/**
 * Синк конфига голосового агента ElevenLabs с каноном из репо
 * (src/lib/voice/agent-prompt.ts). Dry-run по умолчанию: показывает дифф
 * промпта/настроек; запись ТОЛЬКО с --apply (меняет прод-агента сразу!).
 *
 *   npx tsx scripts/sync-voice-agent.mts          # посмотреть дифф
 *   npx tsx scripts/sync-voice-agent.mts --apply  # применить
 */
import { readFileSync } from "node:fs";
import { AGENT_PROMPT, AGENT_SETTINGS } from "../src/lib/voice/agent-prompt";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const API = "https://api.elevenlabs.io/v1/convai/agents/" + env.ELEVENLABS_AGENT_ID;
const headers = { "xi-api-key": env.ELEVENLABS_API_KEY as string, "content-type": "application/json" };
const apply = process.argv.includes("--apply");

async function main() {
  const agent = (await fetch(API, { headers }).then((r) => r.json())) as {
    conversation_config?: {
      agent?: { prompt?: { prompt?: string }; first_message?: string };
      turn?: { turn_timeout?: number };
    };
    platform_settings?: { overrides?: { conversation_config_override?: { agent?: { first_message?: boolean } } } };
  };
  const current = agent?.conversation_config?.agent?.prompt?.prompt ?? "";
  const turnTimeout = agent?.conversation_config?.turn?.turn_timeout;
  const fmOverride =
    agent?.platform_settings?.overrides?.conversation_config_override?.agent?.first_message ?? false;

  console.log("=== СРАВНЕНИЕ С КАНОНОМ ===");
  console.log("промпт совпадает:", current === AGENT_PROMPT ? "ДА" : `НЕТ (в консоли ${current.length} байт, канон ${AGENT_PROMPT.length})`);
  console.log("turn_timeout:", turnTimeout, "→ канон:", AGENT_SETTINGS.turnTimeoutSeconds);
  console.log("first_message override разрешён:", fmOverride, "→ канон:", AGENT_SETTINGS.allowFirstMessageOverride);

  if (!apply) {
    console.log("\n(dry-run; запись — с --apply)");
    return;
  }

  const patch = {
    conversation_config: {
      agent: { prompt: { prompt: AGENT_PROMPT } },
      turn: { turn_timeout: AGENT_SETTINGS.turnTimeoutSeconds },
    },
    platform_settings: {
      overrides: {
        conversation_config_override: {
          agent: { first_message: AGENT_SETTINGS.allowFirstMessageOverride },
          tts: { voice_id: true },
        },
      },
    },
  };
  const res = await fetch(API, { method: "PATCH", headers, body: JSON.stringify(patch) });
  if (!res.ok) {
    console.error("PATCH failed:", res.status, await res.text());
    process.exit(1);
  }
  const after = (await fetch(API, { headers }).then((r) => r.json())) as typeof agent;
  const ok =
    after?.conversation_config?.agent?.prompt?.prompt === AGENT_PROMPT &&
    after?.conversation_config?.turn?.turn_timeout === AGENT_SETTINGS.turnTimeoutSeconds;
  console.log(ok ? "\n✓ агент синхронизирован с каноном" : "\n✗ верификация после PATCH не сошлась");
  process.exit(ok ? 0 : 1);
}

void main();
