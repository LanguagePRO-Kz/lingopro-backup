/**
 * Готовность к экзамену — ГЛАВНОЕ ЧИСЛО агента (Фаза 8.2): прогноз по КАЖДОЙ
 * секции против минимума формата студента, вердикт «сдаст / на грани /
 * НЕ СДАСТ», слабое звено. Считает КОД — LLM получает готовые числа.
 *
 * Правила честности:
 *  - слабое звено топит: одна секция ниже минимума центра → not_ready,
 *    сколько бы ни была сумма (ФАКТ 1 документа основателя);
 *  - прогноз без данных не выносится: нет ни одной оценки → no_data;
 *    известны не все секции и минимумы целы → тоже no_data (частичной
 *    суммой хвалить нельзя);
 *  - плавающие пороги (TYS/MTT) → no_promise: конкретный балл не обещаем.
 */

import type { ExamFormat, SectionId } from "@/lib/exam/format";

export type SectionEstimate = {
  score: number; // /25
  source: "mock" | "diagnostic";
  at: string | null; // ISO даты оценки
};

export type ReadinessVerdict = "ready" | "borderline" | "not_ready" | "no_promise" | "no_data";

export type Readiness = {
  verdict: ReadinessVerdict;
  /** сумма известных секций (все 4 → сопоставима с порогом /100) */
  total: number | null;
  knownCount: number;
  sections: Partial<Record<SectionId, SectionEstimate>>;
  /** самая слабая из известных секций */
  weakestSection: SectionId | null;
  /** секции ниже минимума центра (топят экзамен) */
  belowMin: SectionId[];
  /** баллов до проходного порога (положительное = не хватает); null без порога */
  gapToPass: number | null;
};

const SECTION_IDS: SectionId[] = ["dinleme", "okuma", "yazma", "konusma"];

/** «На грани» — в пределах ±5 баллов порога: одна секция может качнуть. */
const BORDERLINE_BAND = 5;

export function examReadiness(
  format: ExamFormat,
  sections: Partial<Record<SectionId, SectionEstimate>>,
): Readiness {
  const known = SECTION_IDS.filter((s) => sections[s] != null);
  const knownCount = known.length;
  const total = knownCount === 4 ? known.reduce((sum, s) => sum + sections[s]!.score, 0) : null;

  const minPts = format.minPerSectionShare != null ? format.minPerSectionShare * 25 : null;
  const belowMin = minPts != null ? known.filter((s) => sections[s]!.score < minPts) : [];

  let weakestSection: SectionId | null = null;
  for (const s of known) {
    if (weakestSection == null || sections[s]!.score < sections[weakestSection]!.score) weakestSection = s;
  }

  const base = { total, knownCount, sections, weakestSection, belowMin };

  if (knownCount === 0) return { ...base, verdict: "no_data", gapToPass: null };
  // слабое звено топит УЖЕ по известным данным — частичность не спасает
  if (belowMin.length > 0) {
    const passAt = format.thresholds.B2 ?? format.thresholds.C1;
    return { ...base, verdict: "not_ready", gapToPass: total != null && passAt != null ? Math.max(0, passAt - total) : null };
  }

  const passAt = format.thresholds.B2 ?? format.thresholds.C1;
  if (passAt == null) {
    // TYS/MTT: пороги плавающие — вердикт балла не выносим никогда
    return { ...base, verdict: "no_promise", gapToPass: null };
  }
  if (total == null) return { ...base, verdict: "no_data", gapToPass: null };

  const gapToPass = Math.max(0, passAt - total);
  if (total >= passAt + BORDERLINE_BAND) return { ...base, verdict: "ready", gapToPass: 0 };
  if (total >= passAt - BORDERLINE_BAND) return { ...base, verdict: "borderline", gapToPass };
  return { ...base, verdict: "not_ready", gapToPass };
}

/**
 * Слить источники оценок посекционно: мок свежее диагностики; из моков
 * берётся последняя оценка КАЖДОЙ секции (моки пишут посекционные строки).
 */
export function mergeSectionEstimates(input: {
  /** строки mock_results новее → раньше в массиве */
  mockRows: { section_scores: Partial<Record<SectionId, number>> | null; created_at: string }[];
  diagnosticSections: Partial<Record<SectionId, number | null>> | null;
  diagnosticAt: string | null;
}): Partial<Record<SectionId, SectionEstimate>> {
  const out: Partial<Record<SectionId, SectionEstimate>> = {};
  for (const row of input.mockRows) {
    for (const s of SECTION_IDS) {
      const v = row.section_scores?.[s];
      if (typeof v === "number" && out[s] == null) out[s] = { score: v, source: "mock", at: row.created_at };
    }
  }
  for (const s of SECTION_IDS) {
    const v = input.diagnosticSections?.[s];
    if (typeof v === "number" && out[s] == null) out[s] = { score: v, source: "diagnostic", at: input.diagnosticAt };
  }
  return out;
}
