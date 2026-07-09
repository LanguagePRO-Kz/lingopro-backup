/**
 * Dinleme audio for the TÖMER content bank (DESIGN-CONTENT-TOMER):
 * reads every content/tomer/dinleme/*.json, synthesizes the `body` script
 * line by line with ElevenLabs TTS ("AHU:"/"FATİH:" prefixes pick the voice)
 * and concatenates the mp3 segments into public/audio/tomer/<id>.mp3.
 * Same segment cleaning as the diagnostic generator (ID3/Xing stripped so
 * players report the full duration).
 *
 * Run: npx -y tsx scripts/generate-tomer-audio.mts [--force]
 */

import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { VOICE_OPTIONS } from "../src/lib/ai/voices";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "content", "tomer", "dinleme");
const outDir = join(root, "public", "audio", "tomer");
const force = process.argv.includes("--force");

function envKey(): string {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const envFile = join(root, ".env.local");
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf8").split("\n")) {
      const m = line.match(/^ELEVENLABS_API_KEY=(.+)$/);
      if (m) return m[1].trim();
    }
  }
  console.error("ELEVENLABS_API_KEY not found (env or .env.local)");
  process.exit(1);
}

const API_KEY = envKey();
const voice = (id: string) => VOICE_OPTIONS.find((v) => v.id === id)?.elevenVoiceId;
const SPEAKERS: Record<string, string> = {
  AHU: voice("ahu")!,
  "FATİH": voice("fatih")!,
  FATIH: voice("fatih")!,
};

async function tts(text: string, voiceId: string): Promise<Buffer> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  );
  if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Strip ID3v2 / Xing so raw-concatenated mp3s report the full duration. */
function cleanSegment(buf: Buffer): Buffer {
  let off = 0;
  if (buf.length > 10 && buf.toString("latin1", 0, 3) === "ID3") {
    const size =
      ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    off = 10 + size;
  }
  if (buf[off] === 0xff && (buf[off + 1] & 0xe0) === 0xe0) {
    const BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
    const RATES = [44100, 48000, 32000, 0];
    const bitrate = BITRATES[(buf[off + 2] >> 4) & 0x0f] * 1000;
    const sampleRate = RATES[(buf[off + 2] >> 2) & 0x03];
    const padding = (buf[off + 2] >> 1) & 0x01;
    if (bitrate && sampleRate) {
      const frameLen = Math.floor((144 * bitrate) / sampleRate) + padding;
      const head = buf.toString("latin1", off, off + frameLen);
      if (head.includes("Xing") || head.includes("Info")) off += frameLen;
    }
  }
  return buf.subarray(off);
}

function parseLines(script: string): { speaker: string; text: string }[] {
  return script
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(AHU|FATİH|FATIH):\s*(.+)$/);
      return m ? { speaker: m[1], text: m[2] } : { speaker: "AHU", text: line };
    });
}

mkdirSync(outDir, { recursive: true });

for (const file of readdirSync(srcDir).filter((f) => f.endsWith(".json"))) {
  const unit = JSON.parse(readFileSync(join(srcDir, file), "utf8")) as { id: string; body: string };
  const outFile = join(outDir, `${unit.id}.mp3`);
  if (existsSync(outFile) && !force) {
    console.log(`= ${unit.id}.mp3 exists, skipping (use --force to regenerate)`);
    continue;
  }
  const lines = parseLines(unit.body);
  console.log(`→ ${unit.id}: ${lines.length} line(s)…`);
  const parts: Buffer[] = [];
  for (const line of lines) {
    parts.push(cleanSegment(await tts(line.text, SPEAKERS[line.speaker])));
  }
  const buf = Buffer.concat(parts);
  writeFileSync(outFile, buf);
  console.log(`  ✓ ${unit.id}.mp3 (${Math.round(buf.length / 1024)} KB)`);
}

console.log("done");
