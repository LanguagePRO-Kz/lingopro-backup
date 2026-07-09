/**
 * TÖMER exam bank loader — the single bridge between the content files
 * (content/tomer/*, reviewed by a native speaker) and the mock runner.
 * Content is imported statically so the bundler ships it with the page;
 * the runner never fabricates questions — everything comes from the bank.
 */

import okumaB2001 from "../../content/tomer/okuma/okuma-b2-001.json";
import okumaB2002 from "../../content/tomer/okuma/okuma-b2-002.json";
import okumaB2003 from "../../content/tomer/okuma/okuma-b2-003.json";
import dinlemeB2001 from "../../content/tomer/dinleme/dinleme-b2-001.json";
import dinlemeB2002 from "../../content/tomer/dinleme/dinleme-b2-002.json";
import yazmaB2001 from "../../content/tomer/yazma/yazma-b2-001.json";
import yazmaB2002 from "../../content/tomer/yazma/yazma-b2-002.json";
import konusmaB2001 from "../../content/tomer/konusma/konusma-b2-001.json";
import examB2001 from "../../content/tomer/exams/tomer-b2-001.json";

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
  okumaB2001,
  okumaB2002,
  okumaB2003,
  dinlemeB2001,
  dinlemeB2002,
  yazmaB2001,
  yazmaB2002,
  konusmaB2001,
] as TomerUnit[];

export const TOMER_EXAMS: TomerExam[] = [examB2001] as TomerExam[];

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
