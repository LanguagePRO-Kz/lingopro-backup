/**
 * 25 full TÖMER-style mock exams, assembled from the existing skill banks
 * (grammar / reading / listening / writing / speaking). Reusing bank items
 * across exams is intentional and matches real prep practice.
 *
 *   Exams 1–8   → A1–A2
 *   Exams 9–18  → B1–B2
 *   Exams 19–25 → C1
 */

import type { Level, MockExam } from "./types";
import { GRAMMAR_TASKS } from "./grammar-tasks";
import { READING_TASKS } from "./reading-tasks";
import { LISTENING_TASKS } from "./listening-tasks";
import { WRITING_TASKS } from "./writing-tasks";
import { SPEAKING_TASKS } from "./speaking-tasks";

type Band = { levels: Level[]; primary: Level; label: string };

const BANDS: { range: [number, number]; band: Band }[] = [
  { range: [1, 8], band: { levels: ["A1", "A2"], primary: "A2", label: "A1–A2" } },
  { range: [9, 18], band: { levels: ["B1", "B2"], primary: "B2", label: "B1–B2" } },
  { range: [19, 25], band: { levels: ["C1"], primary: "C1", label: "C1" } },
];

function bandForExam(n: number): Band {
  const found = BANDS.find(({ range }) => n >= range[0] && n <= range[1]);
  return (found ?? BANDS[0]).band;
}

/** Safe cyclic access for reusing bank items across many exams. */
function at<T>(arr: T[], i: number): T {
  return arr[((i % arr.length) + arr.length) % arr.length];
}

/** Rotate a list so consecutive exams open with different questions. */
function rotate<T>(arr: T[], offset: number): T[] {
  if (arr.length === 0) return arr;
  const k = ((offset % arr.length) + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

function buildExam(n: number): MockExam {
  const band = bandForExam(n);
  const inBand = <T extends { level: Level }>(arr: T[]) =>
    arr.filter((x) => band.levels.includes(x.level));

  const grammarPool = inBand(GRAMMAR_TASKS);
  const readingPool = inBand(READING_TASKS);
  const listeningPool = inBand(LISTENING_TASKS);
  const writingPool = inBand(WRITING_TASKS);
  const speakingPool = inBand(SPEAKING_TASKS);
  const idx = n - 1;

  // Okuma-Anlama bölümü: en fazla 40 dilbilgisi sorusu, sınavdan sınava döner.
  const grammar = rotate(grammarPool, idx * 4).slice(0, 40);

  return {
    id: `mock-${String(n).padStart(2, "0")}`,
    level: band.primary,
    title: `${band.label} Deneme Sınavı ${n}`,
    grammar,
    reading: at(readingPool, idx),
    listening: at(listeningPool, idx),
    writing: at(writingPool, idx),
    speaking: at(speakingPool, idx),
    timeMinutes: 180,
  };
}

export const MOCK_EXAMS: MockExam[] = Array.from({ length: 25 }, (_, i) => buildExam(i + 1));

export const MOCK_BY_LEVEL = (lvl: Level) => MOCK_EXAMS.filter((m) => m.level === lvl);
