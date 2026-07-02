/**
 * Shared content types for all TÖMER preparation material (src/data/*).
 * Turkish text lives in `question` / `text` / `prompt`; every explanation is
 * written in Russian for the learner.
 */

export type Level = "A1" | "A2" | "B1" | "B2" | "C1";
export type Skill = "grammar" | "reading" | "listening" | "writing" | "speaking";

export const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

/** A single multiple-choice question (grammar, reading, listening). */
export interface Question {
  id: string;
  level: Level;
  question: string;
  options: string[];
  correctAnswer: number; // index into options
  explanation: string; // на русском
  topic: string;
}

/** A reading OR listening task: a Turkish text/transcript + its questions. */
export interface ReadingTask {
  id: string;
  level: Level;
  title: string;
  text: string; // турецкий текст / транскрипт
  questions: Question[];
  topic: string;
  /** word-from-text → synonym pairs for eşleştirme practice */
  synonyms?: { word: string; synonym: string }[];
}

export interface WritingTask {
  id: string;
  level: Level;
  title: string;
  prompt: string; // задание на турецком
  promptRu: string; // перевод задания
  minWords: number;
  criteria: { name: string; maxScore: number }[];
  sampleAnswer?: string; // пример хорошего ответа
}

export interface SpeakingTask {
  id: string;
  level: Level;
  title: string;
  parts: { instruction: string; instructionRu: string; timeMinutes: number }[];
  topic: string;
}

export interface MockExam {
  id: string;
  level: Level;
  title: string;
  grammar: Question[];
  reading: ReadingTask;
  listening: ReadingTask;
  writing: WritingTask;
  speaking: SpeakingTask;
  timeMinutes: number;
}

/** Vocabulary entry shown in /dashboard/vocabulary. */
export interface VocabWord {
  word: string; // турецкое слово
  translation: string; // перевод
  level: Level;
  example: string; // пример предложения на турецком
  source: string; // тематическая категория
}

/** Standard 20-point TÖMER writing rubric reused across writing tasks. */
export const WRITING_CRITERIA: { name: string; maxScore: number }[] = [
  { name: "İçerik", maxScore: 5 },
  { name: "Dil bilgisi", maxScore: 5 },
  { name: "Sözcük", maxScore: 5 },
  { name: "Düzen", maxScore: 5 },
];
