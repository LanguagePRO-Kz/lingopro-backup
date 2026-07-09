/**
 * Audio for the listening practice bank (src/data/listening-tasks.ts):
 * per-line ElevenLabs TTS with role-based voices — female names/roles →
 * Ahu/Gökçe, male → Fatih, generic roles (Sunucu, Müşteri…) rotate for
 * dialogue contrast. Natural pauses via a leading <break/> tag on every
 * line after the first. Segments are ID3/Xing-cleaned and concatenated
 * into public/audio/listening/<id>.mp3 (generated ONCE — students play the
 * static file, zero credits at study time). The manifest
 * src/data/listening-audio.json tells the page which tasks have real audio
 * (the rest keep the Web Speech fallback until generated).
 *
 * Run:
 *   npx -y tsx scripts/generate-listening-audio.mts --only l-a1-01   # sample
 *   npx -y tsx scripts/generate-listening-audio.mts                  # whole bank
 *   flags: --force (regenerate) · --model flash (0.5 cr/char; default multilingual v2)
 */

import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LISTENING_TASKS } from "../src/data/listening-tasks";
import { VOICE_OPTIONS } from "../src/lib/ai/voices";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "audio", "listening");
const manifestFile = join(root, "src", "data", "listening-audio.json");

const force = process.argv.includes("--force");
const onlyIdx = process.argv.indexOf("--only");
const only = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;
const MODEL = process.argv.includes("--model") && process.argv[process.argv.indexOf("--model") + 1] === "flash"
  ? "eleven_flash_v2_5"
  : "eleven_multilingual_v2";

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

const voiceId = (id: string) => VOICE_OPTIONS.find((v) => v.id === id)!.elevenVoiceId;
const FATIH = voiceId("fatih");
const AHU = voiceId("ahu");
const GOKCE = voiceId("gokce");

/** Named speakers with a clear gender (native reviewer's sanity: a Zeynep
 * must not speak with Fatih's voice). Extend as the bank grows. */
const FEMALE = new Set(["zeynep", "maria", "elif", "ayşe", "ayse", "merve", "selin", "kadın", "kadin", "gökçe", "gokce", "ahu"]);
const MALE = new Set(["ali", "can", "hasan", "burak", "kaan", "deniz", "fatih", "hasan"]);

/** Per-task voice assignment: named speakers by gender, generic roles by
 * rotation (first → Fatih, second → Ahu, third → Gökçe) skipping taken ones. */
function assignVoices(speakers: string[]): Map<string, string> {
  const map = new Map<string, string>();
  const rotation = [FATIH, AHU, GOKCE];
  // pass 1: gendered names
  let femaleUsed = 0;
  for (const s of speakers) {
    const key = s.toLowerCase();
    if (FEMALE.has(key)) {
      map.set(s, femaleUsed === 0 ? AHU : GOKCE);
      femaleUsed += 1;
    } else if (MALE.has(key)) {
      map.set(s, FATIH);
    }
  }
  // pass 2: generic roles take the next free rotation slot
  for (const s of speakers) {
    if (map.has(s)) continue;
    const taken = new Set(map.values());
    map.set(s, rotation.find((v) => !taken.has(v)) ?? rotation[map.size % rotation.length]);
  }
  return map;
}

async function tts(text: string, voice: string): Promise<Buffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Strip ID3v2 / Xing so raw-concatenated mp3s report the full duration. */
function cleanSegment(buf: Buffer): Buffer {
  let off = 0;
  if (buf.length > 10 && buf.toString("latin1", 0, 3) === "ID3") {
    const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
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

type Line = { speaker: string; text: string };
function parseLines(script: string): Line[] {
  return script
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([^:]{1,24}):\s*(.+)$/);
      return m ? { speaker: m[1].trim(), text: m[2] } : { speaker: "Anlatıcı", text: line };
    });
}

mkdirSync(outDir, { recursive: true });
const manifest: Record<string, string> = existsSync(manifestFile)
  ? (JSON.parse(readFileSync(manifestFile, "utf8")) as Record<string, string>)
  : {};

let generated = 0;
let credits = 0;
const CREDITS_PER_CHAR = MODEL === "eleven_flash_v2_5" ? 0.5 : 1;

for (const task of LISTENING_TASKS) {
  if (only && task.id !== only) continue;
  const outFile = join(outDir, `${task.id}.mp3`);
  if (existsSync(outFile) && !force) {
    manifest[task.id] = `/audio/listening/${task.id}.mp3`;
    console.log(`= ${task.id}.mp3 exists, skipping`);
    continue;
  }

  const lines = parseLines(task.text);
  const voices = assignVoices([...new Set(lines.map((l) => l.speaker))]);
  console.log(
    `→ ${task.id} (${task.level}) «${task.title}»: ${lines.length} репл., голоса: ${[...voices.keys()]
      .map((s) => `${s}→${voices.get(s) === FATIH ? "Fatih" : voices.get(s) === AHU ? "Ahu" : "Gökçe"}`)
      .join(", ")}`,
  );

  const parts: Buffer[] = [];
  for (const [i, line] of lines.entries()) {
    // the leading break gives a natural gap between turns (segment
    // boundaries alone are too abrupt); the first line starts clean
    const text = i === 0 ? line.text : `<break time="0.5s" /> ${line.text}`;
    credits += text.length * CREDITS_PER_CHAR;
    parts.push(cleanSegment(await tts(text, voices.get(line.speaker)!)));
  }
  const buf = Buffer.concat(parts);
  writeFileSync(outFile, buf);
  manifest[task.id] = `/audio/listening/${task.id}.mp3`;
  generated += 1;
  const durationSec = Math.round((buf.length * 8) / 128_000);
  console.log(`  ✓ ${task.id}.mp3 — ${Math.round(buf.length / 1024)} KB, ~${durationSec} c`);
}

writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nготово: ${generated} файл(ов), ~${Math.ceil(credits)} кредитов потрачено (${MODEL}), манифест: ${Object.keys(manifest).length} записей`);
