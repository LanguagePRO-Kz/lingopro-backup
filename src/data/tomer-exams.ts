/**
 * TÖMER exam bank loader — the single bridge between the content files
 * (content/tomer/*, reviewed by a native speaker) and the mock runner.
 * Content is imported statically so the bundler ships it with the page;
 * the runner never fabricates questions — everything comes from the bank.
 */

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

export function tomerUnit(id: string): TomerUnit | null {
  return byId.get(id) ?? null;
}

export function sectionUnits(exam: TomerExam, section: TomerSection): TomerUnit[] {
  return exam.sections[section].map((id) => byId.get(id)).filter((u): u is TomerUnit => !!u);
}

/** Honest /25: share of correct answers on the official 25-point scale. */
export function scoreOutOf25(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 25);
}
