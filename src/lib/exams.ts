/**
 * Exam catalogue — the whole platform adapts to the selected exam.
 * Only TÖMER is active; the rest are "coming soon" and open an email-capture modal.
 */

import type { Locale } from "./i18n";

export type ExamStatus = "active" | "coming_soon";

export type Exam = {
  id: ExamId;
  name: string;
  /** Russian language name (fallback); use `examLang()` for localized display */
  language: string;
  /** Localized language name per interface locale */
  langs: Record<Locale, string>;
  /** Genitive country form for "университеты {country}" copy */
  country: string;
  flag: string;
  /** Accent color used sparingly (sphere highlight, badges) */
  color: string;
  status: ExamStatus;
  skills: string[];
  universities: string[];
};

export type ExamId = "tomer" | "topik" | "hsk" | "jlpt" | "delf" | "testdaf";

export const EXAMS: Record<ExamId, Exam> = {
  tomer: {
    id: "tomer",
    name: "TÖMER",
    language: "Турецкий",
    langs: { ru: "Турецкий", en: "Turkish", tr: "Türkçe", kk: "Түрік тілі" },
    country: "Турции",
    flag: "🇹🇷",
    color: "#e53e3e",
    status: "active",
    skills: ["Грамматика", "Лексика", "Чтение", "Аудирование", "Письмо"],
    universities: ["Ankara Üni", "Istanbul Üni", "ODTÜ", "Boğaziçi", "Hacettepe", "Gazi Üni"],
  },
  topik: {
    id: "topik",
    name: "TOPIK",
    language: "Корейский",
    langs: { ru: "Корейский", en: "Korean", tr: "Korece", kk: "Корей тілі" },
    country: "Кореи",
    flag: "🇰🇷",
    color: "#3182ce",
    status: "coming_soon",
    skills: ["Чтение", "Аудирование", "Письмо"],
    universities: [],
  },
  hsk: {
    id: "hsk",
    name: "HSK",
    language: "Китайский",
    langs: { ru: "Китайский", en: "Chinese", tr: "Çince", kk: "Қытай тілі" },
    country: "Китая",
    flag: "🇨🇳",
    color: "#d69e2e",
    status: "coming_soon",
    skills: ["Чтение", "Аудирование", "Письмо"],
    universities: [],
  },
  jlpt: {
    id: "jlpt",
    name: "JLPT",
    language: "Японский",
    langs: { ru: "Японский", en: "Japanese", tr: "Japonca", kk: "Жапон тілі" },
    country: "Японии",
    flag: "🇯🇵",
    color: "#e53e3e",
    status: "coming_soon",
    skills: ["Чтение", "Аудирование", "Лексика"],
    universities: [],
  },
  delf: {
    id: "delf",
    name: "DELF",
    language: "Французский",
    langs: { ru: "Французский", en: "French", tr: "Fransızca", kk: "Француз тілі" },
    country: "Франции",
    flag: "🇫🇷",
    color: "#2b6cb0",
    status: "coming_soon",
    skills: ["Чтение", "Аудирование", "Письмо", "Говорение"],
    universities: [],
  },
  testdaf: {
    id: "testdaf",
    name: "TestDaF",
    language: "Немецкий",
    langs: { ru: "Немецкий", en: "German", tr: "Almanca", kk: "Неміс тілі" },
    country: "Германии",
    flag: "🇩🇪",
    color: "#d69e2e",
    status: "coming_soon",
    skills: ["Чтение", "Аудирование", "Письмо", "Говорение"],
    universities: [],
  },
};

export const EXAM_LIST: Exam[] = Object.values(EXAMS);
export const DEFAULT_EXAM: ExamId = "tomer";

/** Localized language name for the current interface locale. */
export function examLang(exam: Exam, locale: Locale): string {
  return exam.langs[locale] ?? exam.language;
}
