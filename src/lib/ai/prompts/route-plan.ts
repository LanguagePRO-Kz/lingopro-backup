/**
 * Route-plan prompt (DESIGN-PLAN-ENGINE §3): the AI acts as a TÖMER
 * methodologist and returns a weekly topic route as STRICT JSON. Code
 * validates everything afterwards (validateRoute) and enforces the mock
 * schedule — the model only proposes structure and pedagogy.
 */

import { TOPICS } from "../topics";
import type { RouteInputs } from "@/lib/plan/route";

export function buildRoutePlanSystem(): string {
  const registry = TOPICS.filter((t) => t.id !== "other")
    .map((t) => `${t.id} (${t.level}: ${t.label.tr})`)
    .join(", ");

  return `Sen deneyimli bir TÖMER hazırlık metodoloğusun. Görev: öğrenci için HAFTALIK konu rotası oluşturmak.

Metodoloji (uygula):
1. Sıralama "temellerden üst yapıya": hâl ekleri → zamanlar → çatılar → yan cümleler → söylem.
2. Beceriler dönüşümlü (interleaving): her hafta dil bilgisi + en az iki anlama/üretme becerisi.
3. Öğrencinin ZAYIF konuları ilk 2 haftaya VE 3-4 hafta sonra tekrar olarak yerleştirilir.
4. Son haftaların ~%25'i deneme sınavı ağırlıklı olur (mockPolicy'yi kod belirler, sen sadece yapıyı kur).
5. Hedef seviyenin ÜZERİNDEKİ konuları dahil etme.

Konu kayıt listesi (topics alanında YALNIZCA bu id'ler kullanılabilir):
${registry}

Çıktı: YALNIZCA geçerli JSON, şema:
{"weeks": [{
  "theme": {"ru": string, "en": string, "tr": string, "kk": string},   // kısa motive edici başlık
  "topics": [string],                                                   // 2-4 id, kayıt listesinden
  "skillsEmphasis": {"grammar": number, "vocabulary": number, "reading": number, "listening": number, "writing": number}, // 0..1, toplam ≈ 1
  "milestone": {"ru": string, "en": string, "tr": string, "kk": string} // isteğe bağlı, ölçülebilir hedef
}]}
Hafta sayısı sana verilecek — tam o kadar hafta üret.`;
}

export function buildRoutePlanUserMessage(
  inputs: Omit<RouteInputs, "routeStartedAt">,
  weakDetails: { topic: string; strength: number }[],
  weeks: number,
): string {
  const weak = weakDetails.length
    ? weakDetails.map((w) => `${w.topic} (güç: ${w.strength}/100)`).join(", ")
    : "yok (teşhis temiz)";
  const deadline = inputs.examDate
    ? `sınav tarihi ${inputs.examDate}`
    : inputs.horizonMonths
      ? `yaklaşık ${inputs.horizonMonths} ay sonra`
      : "tarih belli değil";

  return `Öğrenci:
- Mevcut seviye: ${inputs.level}
- Hedef: ${inputs.targetLevel} (baraj: ${inputs.targetLevel === "B2" ? 60 : 75}/100)
- Sınav: ${deadline}
- Günlük çalışma süresi: ${inputs.minutesDaily} dakika
- Zayıf konular: ${weak}

${weeks} haftalık rota üret (weeks dizisinde tam ${weeks} öğe).`;
}
