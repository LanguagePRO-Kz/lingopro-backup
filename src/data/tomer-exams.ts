/**
 * TÖMER exam bank loader — the single bridge between the content files
 * (content/tomer/*, reviewed by a native speaker) and the mock runner.
 * Content is imported statically so the bundler ships it with the page;
 * the runner never fabricates questions — everything comes from the bank.
 */

import { READING_TASKS } from "./reading-tasks";
import { LISTENING_TASKS } from "./listening-tasks";
import LISTENING_AUDIO from "./listening-audio.json";
import okumaA1001 from "../../content/tomer/okuma/okuma-a1-001.json";
import okumaA2001 from "../../content/tomer/okuma/okuma-a2-001.json";
import okumaB1001 from "../../content/tomer/okuma/okuma-b1-001.json";
import okumaB2001 from "../../content/tomer/okuma/okuma-b2-001.json";
import okumaB2002 from "../../content/tomer/okuma/okuma-b2-002.json";
import okumaB2003 from "../../content/tomer/okuma/okuma-b2-003.json";
import okumaC1001 from "../../content/tomer/okuma/okuma-c1-001.json";
import dinlemeA1001 from "../../content/tomer/dinleme/dinleme-a1-001.json";
import dinlemeA2001 from "../../content/tomer/dinleme/dinleme-a2-001.json";
import dinlemeB1001 from "../../content/tomer/dinleme/dinleme-b1-001.json";
import dinlemeB2001 from "../../content/tomer/dinleme/dinleme-b2-001.json";
import dinlemeB2002 from "../../content/tomer/dinleme/dinleme-b2-002.json";
import dinlemeC1001 from "../../content/tomer/dinleme/dinleme-c1-001.json";
import yazmaA1001 from "../../content/tomer/yazma/yazma-a1-001.json";
import yazmaA1002 from "../../content/tomer/yazma/yazma-a1-002.json";
import yazmaA2001 from "../../content/tomer/yazma/yazma-a2-001.json";
import yazmaA2002 from "../../content/tomer/yazma/yazma-a2-002.json";
import yazmaB1001 from "../../content/tomer/yazma/yazma-b1-001.json";
import yazmaB1002 from "../../content/tomer/yazma/yazma-b1-002.json";
import yazmaB2001 from "../../content/tomer/yazma/yazma-b2-001.json";
import yazmaB2002 from "../../content/tomer/yazma/yazma-b2-002.json";
import yazmaC1001 from "../../content/tomer/yazma/yazma-c1-001.json";
import yazmaC1002 from "../../content/tomer/yazma/yazma-c1-002.json";
import konusmaA1001 from "../../content/tomer/konusma/konusma-a1-001.json";
import konusmaA2001 from "../../content/tomer/konusma/konusma-a2-001.json";
import konusmaB1001 from "../../content/tomer/konusma/konusma-b1-001.json";
import konusmaB2001 from "../../content/tomer/konusma/konusma-b2-001.json";
import konusmaC1001 from "../../content/tomer/konusma/konusma-c1-001.json";
import examA1001 from "../../content/tomer/exams/tomer-a1-001.json";
import examA2001 from "../../content/tomer/exams/tomer-a2-001.json";
import examB1001 from "../../content/tomer/exams/tomer-b1-001.json";
import examB2001 from "../../content/tomer/exams/tomer-b2-001.json";
import examC1001 from "../../content/tomer/exams/tomer-c1-001.json";

export type TomerSection = "dinleme" | "okuma" | "yazma" | "konusma";

export type TomerQuestion = {
  id: string;
  type: string; // detail | inference | main_idea | vocab_in_context | not_true
  prompt: string;
  options: string[];
  /** index BEFORE shuffling — the runner shuffles presentation itself */
  answer: number;
  /** reviewer-facing note; never shown to students */
  rationale?: string;
};

export type TomerUnit = {
  id: string;
  source: string; // "original" | "official-<slug>"
  license: string | null;
  skill: TomerSection;
  level: string;
  title: string;
  body: string;
  audioSrc: string | null;
  questions: TomerQuestion[];
  constraints?: { minWords: number; maxWords: number; genre: string };
};

export type TomerExam = {
  id: string;
  source: string;
  level: string;
  title: string;
  sections: Record<TomerSection, string[]>;
};

const UNITS: TomerUnit[] = [
  okumaA1001,
  okumaA2001,
  okumaB1001,
  okumaB2001,
  okumaB2002,
  okumaB2003,
  okumaC1001,
  dinlemeA1001,
  dinlemeA2001,
  dinlemeB1001,
  dinlemeB2001,
  dinlemeB2002,
  dinlemeC1001,
  yazmaA1001,
  yazmaA1002,
  yazmaA2001,
  yazmaA2002,
  yazmaB1001,
  yazmaB1002,
  yazmaB2001,
  yazmaB2002,
  yazmaC1001,
  yazmaC1002,
  konusmaA1001,
  konusmaA2001,
  konusmaB1001,
  konusmaB2001,
  konusmaC1001,
] as TomerUnit[];

/** Level order = presentation order: A1 → C1. */
export const TOMER_EXAMS: TomerExam[] = [examA1001, examA2001, examB1001, examB2001, examC1001] as TomerExam[];

const byId = new Map(UNITS.map((u) => [u.id, u]));

const LISTENING_AUDIO_MAP: Record<string, string> = LISTENING_AUDIO as Record<string, string>;

export function tomerUnit(id: string): TomerUnit | null {
  return byId.get(id) ?? null;
}

export function sectionUnits(exam: TomerExam, section: TomerSection): TomerUnit[] {
  return exam.sections[section].map((id) => byId.get(id)).filter((u): u is TomerUnit => !!u);
}

/* ---------------- добор секции до объёма формата (19.07.2026) ----------------
 * Выбор формата (TYS: Okuma 40, Dinleme 30) раньше НИЧЕГО не менял — секция
 * всегда была банковским объёмом. Теперь okuma/dinleme добираются задачами
 * того же уровня из банков разделов: чтение — целиком, аудирование — только
 * задачи с настоящим студийным mp3 (текст вместо записи — не аудирование).
 * Не хватило — интерфейс честно показывает «N из M». */

function readingUnit(t: (typeof READING_TASKS)[number]): TomerUnit {
  return {
    id: `bank:${t.id}`,
    source: "original",
    license: null,
    skill: "okuma",
    level: t.level,
    title: t.title,
    body: t.text,
    audioSrc: null,
    questions: t.questions.map((q) => ({
      id: q.id,
      type: "detail",
      prompt: q.question,
      options: q.options,
      answer: q.correctAnswer,
    })),
  };
}

function listeningUnit(t: (typeof LISTENING_TASKS)[number]): TomerUnit | null {
  const audioSrc = LISTENING_AUDIO_MAP[t.id];
  if (!audioSrc) return null; // без записи это не аудирование
  return {
    id: `bank:${t.id}`,
    source: "original",
    license: null,
    skill: "dinleme",
    level: t.level,
    title: t.title,
    body: "", // текст записи студенту не показываем
    audioSrc,
    questions: (t.questions ?? []).map((q) => ({
      id: q.id,
      type: "detail",
      prompt: q.question,
      options: q.options,
      answer: q.correctAnswer,
    })),
  };
}

export type SectionBuild = {
  units: TomerUnit[];
  questionCount: number;
  /** целевой объём формата; null = формат объём не публикует */
  target: number | null;
};

/** Секция под формат: базовые TOMER-юниты + добор банками того же уровня
 * (+ extraUnits, напр. одобренные generated_tasks) до target вопросов. */
export function buildSectionUnits(
  exam: TomerExam,
  section: TomerSection,
  target: number | null = null,
  extraUnits: TomerUnit[] = [],
): SectionBuild {
  const base = sectionUnits(exam, section);
  const count = (us: TomerUnit[]) => us.reduce((n, u) => n + u.questions.length, 0);
  if ((section !== "okuma" && section !== "dinleme") || target == null || count(base) >= target) {
    return { units: base, questionCount: count(base), target };
  }
  const pool: TomerUnit[] =
    section === "okuma"
      ? [...extraUnits, ...READING_TASKS.filter((t) => t.level === exam.level).map(readingUnit)]
      : LISTENING_TASKS.filter((t) => t.level === exam.level)
          .map(listeningUnit)
          .filter((u): u is TomerUnit => !!u);
  const units = [...base];
  for (const u of pool) {
    if (count(units) >= target) break;
    if (!units.some((x) => x.id === u.id)) units.push(u);
  }
  return { units, questionCount: count(units), target };
}

/** Honest /25: share of correct answers on the official 25-point scale. */
export function scoreOutOf25(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 25);
}
