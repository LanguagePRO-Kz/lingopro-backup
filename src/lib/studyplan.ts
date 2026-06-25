/**
 * Personal study plan derived from the real diagnostic (QuizResult).
 * Weakest skills get priority. Daily tasks are deterministic per day, and
 * completion is persisted so the student keeps a streak / daily progress.
 */

import type { Locale } from "./i18n";
import { MODULES, type Localized, type ModuleId, type QuizResult } from "./quiz";

export type PlanTask = { id: ModuleId; emoji: string; href: string; minutes: number; xp: number; title: string };

const META: Record<ModuleId, { emoji: string; href: string; minutes: number; xp: number }> = {
  grammar: { emoji: "📝", href: "/dashboard/grammar", minutes: 15, xp: 10 },
  vocab: { emoji: "📚", href: "/dashboard/vocabulary", minutes: 10, xp: 8 },
  reading: { emoji: "📖", href: "/dashboard/reading", minutes: 12, xp: 10 },
  writing: { emoji: "✍️", href: "/dashboard/writing", minutes: 15, xp: 12 },
  speaking: { emoji: "🎙", href: "/dashboard/speaking", minutes: 10, xp: 12 },
};

const TITLES: Record<ModuleId, Localized[]> = {
  grammar: [
    { ru: "Падежи: -e, -de, -den", en: "Cases: -e, -de, -den", tr: "Hâller: -e, -de, -den", kk: "Септіктер: -e, -de, -den" },
    { ru: "Времена глаголов", en: "Verb tenses", tr: "Fiil zamanları", kk: "Етістік шақтары" },
    { ru: "Условное наклонение (-se/-sa)", en: "Conditional (-se/-sa)", tr: "Şart kipi (-se/-sa)", kk: "Шартты рай (-se/-sa)" },
  ],
  vocab: [
    { ru: "15 новых слов: университет", en: "15 new words: university", tr: "15 yeni kelime: üniversite", kk: "15 жаңа сөз: университет" },
    { ru: "Повтори слова к повторению", en: "Review due words", tr: "Tekrar kelimelerini gözden geçir", kk: "Қайталау сөздерін қайтала" },
    { ru: "Абстрактная лексика B1", en: "Abstract B1 vocabulary", tr: "Soyut B1 kelimeleri", kk: "Абстрактты B1 лексикасы" },
  ],
  reading: [
    { ru: "Прочитай текст уровня A2", en: "Read an A2-level text", tr: "A2 seviye metin oku", kk: "A2 деңгейлі мәтін оқы" },
    { ru: "Текст B1 + 3 вопроса", en: "B1 text + 3 questions", tr: "B1 metni + 3 soru", kk: "B1 мәтіні + 3 сұрақ" },
    { ru: "Понимание скрытого смысла", en: "Inference practice", tr: "Çıkarım pratiği", kk: "Астарлы мағынаны түсіну" },
  ],
  writing: [
    { ru: "Мини-эссе о своём городе", en: "Mini-essay about your city", tr: "Şehrin hakkında mini kompozisyon", kk: "Қалаң туралы шағын эссе" },
    { ru: "Письмо другу (100+ слов)", en: "Letter to a friend (100+ words)", tr: "Arkadaşa mektup (100+ kelime)", kk: "Досқа хат (100+ сөз)" },
    { ru: "Связующие слова в эссе", en: "Linking words in an essay", tr: "Kompozisyonda bağlaçlar", kk: "Эсседегі жалғаулық сөздер" },
  ],
  speaking: [
    { ru: "Разговор с AI Öğretmen", en: "Talk with AI Öğretmen", tr: "AI Öğretmen ile konuş", kk: "AI Öğretmen-мен сөйлес" },
    { ru: "Расскажи о выходных (1 мин)", en: "Talk about your weekend (1 min)", tr: "Hafta sonunu anlat (1 dk)", kk: "Демалысың туралы айт (1 мин)" },
    { ru: "Аргументируй своё мнение", en: "Argue your opinion", tr: "Fikrini savun", kk: "Пікіріңді дәйекте" },
  ],
};

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0).getTime();
  return Math.floor((d.getTime() - start) / 86_400_000);
}

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Skill name for display. */
export function skillName(id: ModuleId, locale: Locale) {
  return MODULES.find((m) => m.id === id)!.name[locale];
}

/** Today's 5 tasks, weakest diagnostic skill first, deterministic per day. */
export function todaysTasks(result: QuizResult, locale: Locale): PlanTask[] {
  const order: ModuleId[] = result.byWeakness?.length ? result.byWeakness : MODULES.map((m) => m.id);
  const seed = dayOfYear(new Date());
  return order.map((id) => {
    const pool = TITLES[id];
    const title = pool[seed % pool.length][locale];
    return { id, ...META[id], title };
  });
}

/* ------------------------------- Progress -------------------------------- */
const PROGRESS_KEY = "lingopro:planProgress";

export type Progress = Record<string, ModuleId[]>;

export function loadProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as Progress) : {};
  } catch {
    return {};
  }
}

export function saveProgress(p: Progress) {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function toggleTask(p: Progress, id: ModuleId): Progress {
  const key = todayKey();
  const day = p[key] ?? [];
  const next = day.includes(id) ? day.filter((x) => x !== id) : [...day, id];
  return { ...p, [key]: next };
}

export function doneToday(p: Progress): ModuleId[] {
  return p[todayKey()] ?? [];
}

/** Consecutive active days ending today (or yesterday as grace). */
export function streak(p: Progress): number {
  let s = 0;
  const d = new Date();
  if ((p[todayKey(d)] ?? []).length === 0) d.setDate(d.getDate() - 1);
  while ((p[todayKey(d)] ?? []).length > 0) {
    s++;
    d.setDate(d.getDate() - 1);
  }
  return s;
}

export function totalDone(p: Progress): number {
  return Object.values(p).reduce((s, a) => s + a.length, 0);
}

export function activeDays(p: Progress): number {
  return Object.values(p).filter((a) => a.length > 0).length;
}

/* ------------------------------- Motivator ------------------------------- */
export type Motivation = { line: string; note: string };

const M = {
  zero: {
    ru: { line: "Hadi başlayalım! 💪", note: "Сегодня ещё ноль заданий. Начни с одного — даже 10 минут двигают тебя к C1." },
    en: { line: "Hadi başlayalım! 💪", note: "Zero tasks today. Start with one — even 10 minutes move you toward C1." },
    tr: { line: "Hadi başlayalım! 💪", note: "Bugün hiç görev yok. Bir tanesiyle başla — 10 dakika bile seni C1'e yaklaştırır." },
    kk: { line: "Hadi başlayalım! 💪", note: "Бүгін бір де тапсырма жоқ. Біреуінен баста — тіпті 10 минут C1-ге жақындатады." },
  },
  some: {
    ru: { line: "Aferin, devam et! 👏", note: "Хорошее начало! Доведи день до конца — осталось совсем немного." },
    en: { line: "Aferin, devam et! 👏", note: "Great start! Finish the day — you're almost there." },
    tr: { line: "Aferin, devam et! 👏", note: "Güzel başlangıç! Günü tamamla — az kaldı." },
    kk: { line: "Aferin, devam et! 👏", note: "Жақсы бастама! Күнді аяқта — азғантай қалды." },
  },
  done: {
    ru: { line: "Harika! Hepsi tamam! 🎉", note: "Все задания на сегодня выполнены. Так держать — серия растёт!" },
    en: { line: "Harika! Hepsi tamam! 🎉", note: "All tasks done today. Keep it up — your streak is growing!" },
    tr: { line: "Harika! Hepsi tamam! 🎉", note: "Bugünün tüm görevleri tamam. Böyle devam — serin büyüyor!" },
    kk: { line: "Harika! Hepsi tamam! 🎉", note: "Бүгінгі тапсырмалар орындалды. Осылай жалғастыр — серияң өсуде!" },
  },
  comeback: {
    ru: { line: "Seni özledim! 🙌", note: "Ты пропустил пару дней — это нормально. Вернись сегодня и восстанови серию!" },
    en: { line: "Seni özledim! 🙌", note: "You missed a couple of days — that's okay. Come back today and rebuild your streak!" },
    tr: { line: "Seni özledim! 🙌", note: "Birkaç gün ara verdin — sorun değil. Bugün dön ve serini yeniden başlat!" },
    kk: { line: "Seni özledim! 🙌", note: "Бірнеше күн жіберіп алдың — бұл қалыпты. Бүгін орал да серияңды қайта баста!" },
  },
} as const;

export function motivate(locale: Locale, done: number, total: number, str: number): Motivation {
  let k: keyof typeof M;
  if (done >= total && total > 0) k = "done";
  else if (done > 0) k = "some";
  else if (str === 0) k = "comeback";
  else k = "zero";
  return M[k][locale];
}
