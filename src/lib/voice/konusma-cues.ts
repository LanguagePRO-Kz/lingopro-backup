/**
 * Детект фиксированных маркеров симуляции в репликах агента (Блок 5).
 * Сценарий (konusmaScript) велит агенту произносить ТОЧНЫЕ фразы-маркеры —
 * клиент по ним открывает карточки/заметки и запускает таймеры подготовки.
 * Чистая функция: юнит-тестируется без страницы и без ElevenLabs.
 */

export type KonusmaCue = "roleB" | "prep3" | "prep4" | null;

export function detectKonusmaCue(agentText: string): KonusmaCue {
  const t = agentText.toLocaleLowerCase("tr");
  // Bölüm 3: «…Yirmi saniye düşün» (проверяем раньше roleB: в этой же фразе
  // есть слово «kart»)
  if (t.includes("yirmi saniye")) return "prep3";
  // Bölüm 4: «…Otuz saniye not alabilirsin»
  if (t.includes("otuz saniye")) return "prep4";
  // Bölüm 2, тип B: «…Kartı oku — bu sefer konuşmayı SEN başlatacaksın»
  if (t.includes("kartı oku") || t.includes("karti oku")) return "roleB";
  return null;
}
