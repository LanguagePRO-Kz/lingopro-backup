import type { Locale } from "./i18n";

/**
 * Pick localized content for the current locale, falling back to Russian.
 * Lets components ship ru/en/tr copy inline without editing the central dict;
 * kk gracefully falls back to ru.
 */
export function pick<T>(locale: Locale, map: { ru: T; en?: T; tr?: T; kk?: T }): T {
  return map[locale] ?? map.ru;
}

/**
 * Russian numeral agreement: picks the right noun form for a count.
 * 1 уровень · 2–4 уровня · 5–20 уровней (handles the 11–14 teens exception).
 *   pluralize(5, "уровень", "уровня", "уровней") → "уровней"
 */
export function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = Math.abs(n) % 10;
  const mod100 = Math.abs(n) % 100;
  if (mod100 >= 11 && mod100 <= 19) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/** Count + correctly declined Russian noun, e.g. `plural(5, ...)` → "5 уровней". */
export function plural(n: number, one: string, few: string, many: string): string {
  return `${n} ${pluralize(n, one, few, many)}`;
}

/**
 * Shared short UI terms reused across product-preview mockups, so they stay
 * fully localized without duplicating strings in every component.
 */
const TERMS = {
  question: { ru: "Вопрос", en: "Question", tr: "Soru", kk: "Сұрақ" },
  grammar: { ru: "Грамматика", en: "Grammar", tr: "Dil bilgisi", kk: "Грамматика" },
  vocab: { ru: "Лексика", en: "Vocabulary", tr: "Kelime", kk: "Лексика" },
  reading: { ru: "Чтение", en: "Reading", tr: "Okuma", kk: "Оқу" },
  listening: { ru: "Аудирование", en: "Listening", tr: "Dinleme", kk: "Тыңдалым" },
  writing: { ru: "Письмо", en: "Writing", tr: "Yazma", kk: "Жазу" },
  speaking: { ru: "Говорение", en: "Speaking", tr: "Konuşma", kk: "Сөйлеу" },
  pronunciation: { ru: "Произношение", en: "Pronunciation", tr: "Telaffuz", kk: "Айтылым" },
  fluency: { ru: "Беглость", en: "Fluency", tr: "Akıcılık", kk: "Жатықтық" },
  module: { ru: "Модуль", en: "Module", tr: "Modül", kk: "Модуль" },
  forecast: { ru: "Прогноз результата", en: "Result forecast", tr: "Sonuç tahmini", kk: "Нәтиже болжамы" },
  readiness: { ru: "готовность", en: "readiness", tr: "hazırlık", kk: "дайындық" },
  content: { ru: "Содержание", en: "Content", tr: "İçerik", kk: "Мазмұн" },
  coherence: { ru: "Связность", en: "Coherence", tr: "Tutarlılık", kk: "Байланыс" },
  score: { ru: "Оценка", en: "Score", tr: "Puan", kk: "Баға" },
  errorsLabel: { ru: "Ошибки", en: "Errors", tr: "Hatalar", kk: "Қателер" },
  aiReco: { ru: "Рекомендация AI", en: "AI recommendation", tr: "AI önerisi", kk: "AI ұсынысы" },
  todayPlan: { ru: "План на сегодня", en: "Today's plan", tr: "Bugünün planı", kk: "Бүгінгі жоспар" },
  studentAnswer: { ru: "Ответ студента", en: "Student's answer", tr: "Öğrenci cevabı", kk: "Студент жауабы" },
  askTutor: { ru: "Спроси AI-преподавателя…", en: "Ask the AI tutor…", tr: "AI öğretmene sor…", kk: "AI-мұғалімнен сұра…" },
  weekShort: { ru: "Н", en: "W", tr: "H", kk: "А" },
} as const;

export type TermKey = keyof typeof TERMS;

export function term(locale: Locale, key: TermKey): string {
  return TERMS[key][locale] ?? TERMS[key].ru;
}
