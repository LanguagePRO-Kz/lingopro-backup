/**
 * Формат экзамена — ПАРАМЕТР, не константа (Фаза 7.1). «TÖMER» — семейство
 * экзаменов разных центров + государственный TYS: у каждого свой барем,
 * тайминг и пороги (проверенные факты основателя, 14.07.2026). Студент
 * выбирает СВОЙ экзамен — движок мока и вердикт настраиваются.
 *
 * Числа порогов — из документа основателя (официальные источники центров);
 * чего в нём нет — честный null, НЕ выдумка. Все числа правятся здесь.
 */

import type { Locale } from "@/lib/i18n";

export type ExamFormatSlug = "tomer_generic" | "tys" | "tomer_sakarya" | "tomer_bayburt";

export type SectionId = "dinleme" | "okuma" | "yazma" | "konusma";

export type ExamFormat = {
  slug: ExamFormatSlug;
  name: string;
  note: Record<Locale, string>;
  /** Секундный бюджет мока: на MC-вопрос и на письменное задание —
   *  честный масштаб экзаменационного темпа на наш объём заданий. */
  perQuestionSeconds: { dinleme: number; okuma: number };
  /** Целевое число вопросов секции в моке. Проверенные факты: только TYS
   * публикует объёмы (Okuma 40, Dinleme 30); null = сколько есть в банке —
   * непубликуемые объёмы центров НЕ выдумываем (правило 1.3). */
  questionTargets: { dinleme: number | null; okuma: number | null };
  perWritingTaskSeconds: number;
  /** Порог сертификата по сумме /100; null = центр порог не публикует /
   *  пороги плавающие — вердикт балла НЕ обещаем. */
  thresholds: { B2: number | null; C1: number | null };
  /** Ниже — провал всего экзамена независимо от суммы (null = не публикуется). */
  failBelowTotal: number | null;
  /** Минимум по КАЖДОЙ секции в долях от /25 (например 0.6);
   *  null = центр такого правила не публикует. Слабое звено топит экзамен. */
  minPerSectionShare: number | null;
  scoring: "classic" | "modern_test_theory";
};

const NOTE_GENERIC: Record<Locale, string> = {
  ru: "Формат основан на опубликованных примерах университетских TÖMER. Точный регламент уточняй в своём центре.",
  en: "Format based on published university TÖMER samples. Confirm the exact rules with your centre.",
  tr: "Format, üniversite TÖMER'lerinin yayımlanmış örneklerine dayanır. Kesin kuralları merkezinden doğrula.",
  kk: "Формат университеттік TÖMER-дің жарияланған үлгілеріне негізделген. Нақты ережені өз орталығыңнан нақтыла.",
};

export const EXAM_FORMATS: Record<ExamFormatSlug, ExamFormat> = {
  /** Консервативное общее ядро (blueprint v1): 4 навыка × 25, 60→B2 / 75→C1. */
  tomer_generic: {
    slug: "tomer_generic",
    name: "TÖMER (общий формат)",
    note: NOTE_GENERIC,
    perQuestionSeconds: { dinleme: 90, okuma: 110 },
    questionTargets: { dinleme: null, okuma: null },
    perWritingTaskSeconds: 25 * 60,
    thresholds: { B2: 60, C1: 75 },
    failBelowTotal: null,
    minPerSectionShare: null,
    scoring: "classic",
  },
  /** TYS (Yunus Emre): пороги ПЛАВАЮЩИЕ (Modern Test Theory, пересчёт после
   *  каждого экзамена) — конкретный балл не обещаем, только готовность. */
  tys: {
    slug: "tys",
    name: "TYS (Yunus Emre Enstitüsü)",
    note: {
      ru: "Пороги TYS пересчитываются после каждого экзамена (Modern Test Theory) — конкретный балл обещать нельзя, показываем готовность к уровню.",
      en: "TYS thresholds are recalculated after every sitting (Modern Test Theory) — no score promise, we show level readiness.",
      tr: "TYS eşikleri her sınavdan sonra yeniden hesaplanır (Modern Test Theory) — puan sözü verilemez, seviye hazırlığını gösteririz.",
      kk: "TYS шектері әр емтиханнан кейін қайта есептеледі (Modern Test Theory) — нақты балл уәде етілмейді, деңгейге дайындықты көрсетеміз.",
    },
    // TYS: Okuma 40 вопросов/60 мин (90с), Dinleme 30/45 (90с), Yazma 2 задания/60 мин
    perQuestionSeconds: { dinleme: 90, okuma: 90 },
    questionTargets: { dinleme: 30, okuma: 40 },
    perWritingTaskSeconds: 30 * 60,
    thresholds: { B2: null, C1: null },
    failBelowTotal: null,
    minPerSectionShare: null,
    scoring: "modern_test_theory",
  },
  /** Sakarya: 4×25, C1 = 85–100, ниже 50 — провал. Порог B2 не публикуется. */
  tomer_sakarya: {
    slug: "tomer_sakarya",
    name: "TÖMER · Sakarya Üniversitesi",
    note: {
      ru: "Sakarya: C1 — от 85, ниже 50 — провал. Порог B2 центр не публикует — уточни при записи.",
      en: "Sakarya: C1 from 85, below 50 fails. The B2 cut-off isn't published — confirm when registering.",
      tr: "Sakarya: C1 85'ten başlar, 50'nin altı başarısız. B2 eşiği yayımlanmıyor — kayıtta doğrula.",
      kk: "Sakarya: C1 — 85-тен, 50-ден төмен — сәтсіз. B2 шегі жарияланбайды — тіркелгенде нақтыла.",
    },
    perQuestionSeconds: { dinleme: 90, okuma: 110 },
    // объём вопросов Sakarya не публикует («4×25» — баллы, не вопросы)
    questionTargets: { dinleme: null, okuma: null },
    perWritingTaskSeconds: 25 * 60,
    thresholds: { B2: null, C1: 85 },
    failBelowTotal: 50,
    minPerSectionShare: null,
    scoring: "classic",
  },
  /** Bayburt/EBYU: B2 от 60, C1 от 75, минимум 60% ПО КАЖДОМУ навыку. */
  tomer_bayburt: {
    slug: "tomer_bayburt",
    name: "TÖMER · Bayburt/EBYU",
    note: {
      ru: "Bayburt/EBYU: минимум 60% по КАЖДОМУ навыку — слабое звено топит весь экзамен, даже при высокой сумме.",
      en: "Bayburt/EBYU: a 60% minimum in EVERY skill — one weak section sinks the exam even with a high total.",
      tr: "Bayburt/EBYU: HER beceride en az %60 — tek zayıf bölüm, toplam yüksek olsa bile sınavı batırır.",
      kk: "Bayburt/EBYU: ӘР дағдыдан кемінде 60% — бір әлсіз бөлім жалпы балл жоғары болса да емтиханды құлатады.",
    },
    perQuestionSeconds: { dinleme: 90, okuma: 110 },
    // объём вопросов центр не публикует — не выдумываем
    questionTargets: { dinleme: null, okuma: null },
    perWritingTaskSeconds: 25 * 60,
    thresholds: { B2: 60, C1: 75 },
    failBelowTotal: null,
    minPerSectionShare: 0.6,
    scoring: "classic",
  },
};

export const DEFAULT_EXAM_FORMAT: ExamFormatSlug = "tomer_generic";

export function examFormat(slug: string | null | undefined): ExamFormat {
  return EXAM_FORMATS[(slug as ExamFormatSlug) ?? DEFAULT_EXAM_FORMAT] ?? EXAM_FORMATS[DEFAULT_EXAM_FORMAT];
}

/* ------------------------------- вердикт -------------------------------- */

export type SectionScores = Partial<Record<SectionId, number>>; // /25 каждая

export type ExamVerdict = {
  total: number; // сумма известных секций
  known: SectionId[];
  complete: boolean; // все 4 секции оценены
  /** Секции ниже минимума центра (пусто, если правила нет или всё ок). */
  weakSections: SectionId[];
  /**
   * passed_c1 / passed_b2 — порог достигнут И минимум по секциям цел;
   * failed_min — сумма прошла бы, но слабое звено топит;
   * failed — сумма ниже порога/провальной черты;
   * unclear_threshold — выше провальной черты, но порог этого сертификата
   *   центр не публикует (Sakarya 50–84) — «уточни в центре», не «провал»;
   * no_promise — пороги не публикуются вовсе (TYS/MTT) — вердикт балла не даём;
   * incomplete — оценены не все секции.
   */
  outcome: "passed_c1" | "passed_b2" | "failed_min" | "failed" | "unclear_threshold" | "no_promise" | "incomplete";
};

export function examVerdict(fmt: ExamFormat, scores: SectionScores): ExamVerdict {
  const ids: SectionId[] = ["dinleme", "okuma", "yazma", "konusma"];
  const known = ids.filter((s) => typeof scores[s] === "number");
  const total = known.reduce((sum, s) => sum + (scores[s] as number), 0);
  const complete = known.length === 4;

  const minPts = fmt.minPerSectionShare != null ? fmt.minPerSectionShare * 25 : null;
  const weakSections = minPts != null ? known.filter((s) => (scores[s] as number) < minPts) : [];

  if (!complete) return { total, known, complete, weakSections, outcome: "incomplete" };
  if (fmt.scoring === "modern_test_theory" || (fmt.thresholds.B2 == null && fmt.thresholds.C1 == null)) {
    return { total, known, complete, weakSections, outcome: "no_promise" };
  }
  if (fmt.failBelowTotal != null && total < fmt.failBelowTotal) {
    return { total, known, complete, weakSections, outcome: "failed" };
  }
  const meetsC1 = fmt.thresholds.C1 != null && total >= fmt.thresholds.C1;
  const meetsB2 = fmt.thresholds.B2 != null && total >= fmt.thresholds.B2;
  if ((meetsC1 || meetsB2) && weakSections.length > 0) {
    return { total, known, complete, weakSections, outcome: "failed_min" };
  }
  if (meetsC1) return { total, known, complete, weakSections, outcome: "passed_c1" };
  if (meetsB2) return { total, known, complete, weakSections, outcome: "passed_b2" };
  // порог этого сертификата центр не публикует (Sakarya: B2 неизвестен,
  // 50–84) — «провал» был бы враньём; честно шлём уточнять в центр
  if (fmt.thresholds.B2 == null && fmt.thresholds.C1 != null) {
    return { total, known, complete, weakSections, outcome: "unclear_threshold" };
  }
  return { total, known, complete, weakSections, outcome: "failed" };
}

/** Секундный бюджет секции мока под конкретное число заданий. */
export function sectionTimeLimit(fmt: ExamFormat, section: SectionId, count: number): number | null {
  if (section === "dinleme" || section === "okuma") return count > 0 ? count * fmt.perQuestionSeconds[section] : null;
  if (section === "yazma") return count > 0 ? count * fmt.perWritingTaskSeconds : null;
  return null; // konusma живёт в голосовой сессии со своим лимитом
}
