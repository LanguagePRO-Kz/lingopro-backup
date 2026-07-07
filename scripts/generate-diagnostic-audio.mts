/**
 * One-off generator for the Dinleme audio bank (DESIGN-DIAGNOSTIC-V2 §2).
 *
 * Reads every transcript from src/data/diagnostic-bank.ts, synthesizes each
 * line with ElevenLabs TTS (eleven_multilingual_v2, natural exam-speed 1.0;
 * "AHU:"/"FATİH:" prefixes pick the voice from src/lib/ai/voices.ts) and
 * concatenates the mp3 segments into public/audio/diagnostic/<id>.mp3.
 *
 * Run: npx -y tsx scripts/generate-diagnostic-audio.mts [--force]
 * Requires ELEVENLABS_API_KEY in .env.local. Existing files are skipped
 * unless --force. One full run costs well under $2.
 */

import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DINLEME_AUDIO } from "../src/data/diagnostic-bank";
import { VOICE_OPTIONS } from "../src/lib/ai/voices";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "audio", "diagnostic");
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
  "AHU": voice("ahu")!,
  "FATİH": voice("fatih")!,
  "FATIH": voice("fatih")!,
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

/**
 * Prepare an mp3 segment for raw concatenation: drop the leading ID3v2 tag
 * and a Xing/Info metadata frame if present. Otherwise players trust the
 * first segment's declared duration and cut playback short.
 */
function cleanSegment(buf: Buffer): Buffer {
  let off = 0;
  if (buf.length > 10 && buf.toString("latin1", 0, 3) === "ID3") {
    const size =
      ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    off = 10 + size;
  }
  // first MPEG frame: if its payload carries Xing/Info, skip the whole frame
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

function parseLines(transcript: string): { speaker: string; text: string }[] {
  return transcript
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(AHU|FATİH|FATIH):\s*(.+)$/);
      return m ? { speaker: m[1], text: m[2] } : { speaker: "AHU", text: line };
    });
}

mkdirSync(outDir, { recursive: true });

for (const item of DINLEME_AUDIO) {
  const outFile = join(outDir, `${item.id}.mp3`);
  if (existsSync(outFile) && !force) {
    console.log(`= ${item.id}.mp3 exists, skipping (use --force to regenerate)`);
    continue;
  }
  const lines = parseLines(item.transcript);
  console.log(`→ ${item.id}: ${lines.length} line(s)…`);
  const parts: Buffer[] = [];
  for (const line of lines) {
    parts.push(cleanSegment(await tts(line.text, SPEAKERS[line.speaker])));
  }
  const buf = Buffer.concat(parts);
  writeFileSync(outFile, buf);
  console.log(`  ✓ ${item.id}.mp3 (${Math.round(buf.length / 1024)} KB)`);
}

console.log("done");
