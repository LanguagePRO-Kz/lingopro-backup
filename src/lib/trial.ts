/**
 * Честное «сколько осталось» для триала (правило 1.3: округление в свою
 * пользу — ложь; человек рассчитывает время, а доступ закроется раньше,
 * чем он думает).
 *
 * Полные сутки — floor с допуском +1 час к границе. Сразу после выдачи
 * 3-дневного триала до рендера баннера проходят секунды (redeem → редирект),
 * а часы БД и сервера рендера могут расходиться на секунды в обе стороны:
 * остаток равновероятно 71ч59м или 72ч00м01с. Math.ceil без допуска на
 * втором случае показывал «осталось 4 дня». Допуск завышает максимум на
 * 1 час у границы суток; во всех остальных точках — только занижаем.
 */

import type { Locale } from "./i18n";

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
/** Допуск к границе суток: перекос часов БД ↔ сервер рендера + секунды на редирект. */
const GRACE_MS = HOUR_MS;

/** Полных суток осталось: 72ч+30с → 3 (не 4!), 71ч → 3, 25ч → 1, 20ч → 0. */
export function trialDaysLeft(msLeft: number): number {
  return Math.max(0, Math.floor((msLeft + GRACE_MS) / DAY_MS));
}

/** Русская форма по числу: plural(3, "день", "дня", "дней") → "дня". */
function ruPlural(n: number, one: string, few: string, many: string): string {
  const d10 = n % 10;
  const d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return one;
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return few;
  return many;
}

/** «остался 1 …» / «осталось 2 …» — согласование глагола с числом. */
function ruVerb(n: number): string {
  return n % 10 === 1 && n % 100 !== 11 ? "остался" : "осталось";
}

/**
 * Фраза остатка для баннера триала: «осталось 3 дня» / «остался 1 день» /
 * «осталось меньше суток» (12–23ч — обещать день уже нельзя) /
 * «осталось 2 часа» / «осталось меньше часа».
 */
export function trialLeftLabel(msLeft: number, locale: Locale): string {
  const days = trialDaysLeft(msLeft);
  if (days >= 1) {
    return {
      ru: `${ruVerb(days)} ${days} ${ruPlural(days, "день", "дня", "дней")}`,
      en: `${days} ${days === 1 ? "day" : "days"} left`,
      tr: `${days} gün kaldı`,
      kk: `${days} күн қалды`,
    }[locale];
  }
  const hours = Math.max(0, Math.floor(msLeft / HOUR_MS));
  if (hours >= 12) {
    return {
      ru: "осталось меньше суток",
      en: "less than a day left",
      tr: "1 günden az kaldı",
      kk: "бір күннен аз қалды",
    }[locale];
  }
  if (hours >= 1) {
    return {
      ru: `${ruVerb(hours)} ${hours} ${ruPlural(hours, "час", "часа", "часов")}`,
      en: `${hours} ${hours === 1 ? "hour" : "hours"} left`,
      tr: `${hours} saat kaldı`,
      kk: `${hours} сағат қалды`,
    }[locale];
  }
  return {
    ru: "осталось меньше часа",
    en: "less than an hour left",
    tr: "1 saatten az kaldı",
    kk: "бір сағаттан аз қалды",
  }[locale];
}
