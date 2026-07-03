/**
 * On-demand content resolution for a daily task. The heavy question banks in
 * src/data/* are loaded via dynamic import() here — only the bank a student
 * actually opens is fetched, keeping it out of the dashboard bundle.
 */

import type { Question, ReadingTask, WritingTask, SpeakingTask, VocabWord, Level } from "@/data/types";
import type { DailyTask } from "./daily-plan";

export type TaskContent =
  | { skill: "grammar"; questions: Question[] }
  | { skill: "reading" | "listening"; tasks: ReadingTask[] }
  | { skill: "vocabulary"; words: VocabWord[] }
  | { skill: "writing"; task: WritingTask | null }
  | { skill: "speaking"; task: SpeakingTask | null };

/** Deterministic slice of `count` items starting at an offset derived from seed. */
function slice<T>(pool: T[], count: number, seed: number): T[] {
  if (!pool.length) return [];
  const start = ((Math.max(1, seed) - 1) * count) % pool.length;
  return Array.from({ length: count }, (_, i) => pool[(start + i) % pool.length]);
}

export async function resolveTaskContent(task: DailyTask): Promise<TaskContent> {
  const level = task.level as Level;
  const { count, seed } = task;

  switch (task.skill) {
    case "grammar": {
      const m = await import("@/data/grammar-tasks");
      const pool = m.GRAMMAR_BY_LEVEL(level);
      return { skill: "grammar", questions: slice(pool.length ? pool : m.GRAMMAR_TASKS, count, seed) };
    }
    case "reading": {
      const m = await import("@/data/reading-tasks");
      const pool = m.READING_BY_LEVEL(level);
      return { skill: "reading", tasks: slice(pool.length ? pool : m.READING_TASKS, count, seed) };
    }
    case "listening": {
      const m = await import("@/data/listening-tasks");
      const pool = m.LISTENING_BY_LEVEL(level);
      return { skill: "listening", tasks: slice(pool.length ? pool : m.LISTENING_TASKS, count, seed) };
    }
    case "writing": {
      const m = await import("@/data/writing-tasks");
      const pool = m.WRITING_BY_LEVEL(level);
      return { skill: "writing", task: slice(pool.length ? pool : m.WRITING_TASKS, 1, seed)[0] ?? null };
    }
    case "speaking": {
      const m = await import("@/data/speaking-tasks");
      const pool = m.SPEAKING_BY_LEVEL(level);
      return { skill: "speaking", task: slice(pool.length ? pool : m.SPEAKING_TASKS, 1, seed)[0] ?? null };
    }
    case "vocabulary": {
      const m = await import("@/data/vocabulary");
      const pool = m.VOCAB_BY_LEVEL(level);
      return { skill: "vocabulary", words: slice(pool.length ? pool : m.VOCABULARY, count, seed) };
    }
  }
}
