/**
 * Shared dashboard config — localized sidebar navigation, the 8-week personal
 * plan and small helpers reused across every /dashboard page.
 */

import type { Locale } from "./i18n";
import type { PackageId } from "./billing";

export type Loc = Record<Locale, string>;

export type NavItem = { id: string; emoji: string; href: string; label: Loc; isNew?: boolean };

export const NAV: NavItem[] = [
  { id: "home", emoji: "📊", href: "/dashboard", label: { ru: "Главная", en: "Home", tr: "Ana sayfa", kk: "Басты бет" } },
  // одна личность агента на всю платформу: и чат, и голосовой урок — это Ahu
  { id: "tutor", emoji: "💬", href: "/dashboard/tutor", isNew: true, label: { ru: "Чат с Ahu", en: "Chat with Ahu", tr: "Ahu ile sohbet", kk: "Ahu-мен чат" } },
  { id: "writing", emoji: "✍️", href: "/dashboard/writing", label: { ru: "Письмо", en: "Writing", tr: "Yazma", kk: "Жазу" } },
  { id: "reading", emoji: "📖", href: "/dashboard/reading", label: { ru: "Чтение", en: "Reading", tr: "Okuma", kk: "Оқу" } },
  { id: "listening", emoji: "🎧", href: "/dashboard/listening", label: { ru: "Аудирование", en: "Listening", tr: "Dinleme", kk: "Тыңдалым" } },
  { id: "grammar", emoji: "📚", href: "/dashboard/grammar", label: { ru: "Грамматика", en: "Grammar", tr: "Dil bilgisi", kk: "Грамматика" } },
  { id: "mock", emoji: "🧪", href: "/dashboard/mock", label: { ru: "Пробные тесты", en: "Mock tests", tr: "Deneme testleri", kk: "Сынақ тесттер" } },
  { id: "stats", emoji: "📈", href: "/dashboard/stats", label: { ru: "Статистика", en: "Statistics", tr: "İstatistik", kk: "Статистика" } },
  { id: "vocabulary", emoji: "📕", href: "/dashboard/vocabulary", label: { ru: "Словарь", en: "Vocabulary", tr: "Sözlük", kk: "Сөздік" } },
  { id: "speaking", emoji: "🎙", href: "/dashboard/speaking", isNew: true, label: { ru: "Урок с Ahu", en: "Lesson with Ahu", tr: "Ahu ile ders", kk: "Ahu-мен сабақ" } },
  // симуляция устного TÖMER (Блок 5): раздел называется просто Konuşma —
  // слово «экзамен» в UI сознательно не пишем
  { id: "konusma", emoji: "🎤", href: "/dashboard/konusma", isNew: true, label: { ru: "Konuşma", en: "Konuşma", tr: "Konuşma", kk: "Konuşma" } },
  // «Прямой эфир» (27.07): свободная беседа — отдельный вход, не урок и не
  // экзамен; ведёт на live с запинованным free (чипы скрыты)
  { id: "sohbet", emoji: "📻", href: "/dashboard/speaking/live?mode=free", isNew: true, label: { ru: "Прямой эфир", en: "Live talk", tr: "Canlı sohbet", kk: "Тікелей эфир" } },
  { id: "leaderboard", emoji: "🏆", href: "/dashboard/leaderboard", label: { ru: "Рейтинг", en: "Leaderboard", tr: "Sıralama", kk: "Рейтинг" } },
  { id: "settings", emoji: "⚙️", href: "/dashboard/settings", label: { ru: "Настройки", en: "Settings", tr: "Ayarlar", kk: "Баптаулар" } },
];

/** Match the active nav item for a pathname (longest href wins). */
export function activeNav(pathname: string): NavItem {
  const match = [...NAV]
    .sort((a, b) => b.href.length - a.href.length)
    .find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
  return match ?? NAV[0];
}

/** 8-week personal study plan shown in the sidebar. */
export type PlanWeek = { week: number; emoji: string; href: string; level: string; title: Loc };

export const PLAN_WEEKS: PlanWeek[] = [
  { week: 1, emoji: "📝", href: "/dashboard/grammar", level: "A1", title: { ru: "Базовая грамматика", en: "Basic grammar", tr: "Temel dil bilgisi", kk: "Негізгі грамматика" } },
  { week: 2, emoji: "📚", href: "/dashboard/vocabulary", level: "A1–A2", title: { ru: "Лексика 300 слов", en: "300-word vocabulary", tr: "300 kelime", kk: "300 сөз лексика" } },
  { week: 3, emoji: "📖", href: "/dashboard/reading", level: "A2", title: { ru: "Чтение простых текстов", en: "Reading simple texts", tr: "Basit metin okuma", kk: "Қарапайым мәтін оқу" } },
  { week: 4, emoji: "🎧", href: "/dashboard/listening", level: "A2", title: { ru: "Аудирование диалогов", en: "Listening to dialogues", tr: "Diyalog dinleme", kk: "Диалог тыңдау" } },
  { week: 5, emoji: "✍️", href: "/dashboard/writing", level: "A2–B1", title: { ru: "Письмо коротких текстов", en: "Writing short texts", tr: "Kısa metin yazma", kk: "Қысқа мәтін жазу" } },
  { week: 6, emoji: "🎤", href: "/dashboard/speaking", level: "B1", title: { ru: "Говорение на темы", en: "Topic speaking", tr: "Konu konuşması", kk: "Тақырыптық сөйлеу" } },
  { week: 7, emoji: "🔄", href: "/dashboard/mock", level: "B1", title: { ru: "Комплексная практика", en: "Mixed practice", tr: "Karma pratik", kk: "Кешенді практика" } },
  { week: 8, emoji: "🧪", href: "/dashboard/mock", level: "B1–B2", title: { ru: "Пробный TÖMER", en: "Mock TÖMER", tr: "Deneme TÖMER", kk: "Сынақ TÖMER" } },
];

export const CURRENT_WEEK = 3;

export const PLAN_MONTHS: Record<PackageId, string> = { "1m": "1", "3m": "3", "6m": "6" };

export function planBadge(plan: string | null, locale: Locale): string {
  if (plan === "trial") {
    const t: Loc = { ru: "Пробный доступ", en: "Trial access", tr: "Deneme erişimi", kk: "Сынақ қолжетімділік" };
    return t[locale];
  }
  const mo = plan ? PLAN_MONTHS[plan as PackageId] : undefined;
  if (!mo) return "Premium";
  const unit: Loc = { ru: "мес", en: "mo", tr: "ay", kk: "ай" };
  return `Premium · ${mo} ${unit[locale]}`;
}
