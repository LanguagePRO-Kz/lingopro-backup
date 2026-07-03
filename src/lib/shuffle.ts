/**
 * Answer-option shuffling. Applied at display time so the correct answer lands
 * on a different position on every load (data files keep their original order).
 */

/** Fisher–Yates shuffle of an options array; returns the remapped correct index. */
export function shuffleOptions(
  options: string[],
  correctIndex: number,
): { shuffled: string[]; newCorrectIndex: number } {
  const correct = options[correctIndex];
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { shuffled, newCorrectIndex: shuffled.indexOf(correct) };
}

/** A random permutation of indices 0..n-1. */
export function permutation(n: number): number[] {
  const p = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}

/** Reorder an array by a permutation. */
export function applyPerm<T>(arr: T[], perm: number[]): T[] {
  return perm.map((i) => arr[i]);
}

/** Build a stable id → { options, answer } map with each question pre-shuffled. */
export function shuffleQuestionMap(
  questions: { id: string; options: string[]; correctAnswer: number }[],
): Record<string, { options: string[]; answer: number }> {
  const m: Record<string, { options: string[]; answer: number }> = {};
  for (const q of questions) {
    const s = shuffleOptions(q.options, q.correctAnswer);
    m[q.id] = { options: s.shuffled, answer: s.newCorrectIndex };
  }
  return m;
}
