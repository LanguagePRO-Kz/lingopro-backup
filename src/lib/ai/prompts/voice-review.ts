/**
 * Post-lesson written review (block C5): the transcript of a voice session is
 * scored against TÖMER Konuşma criteria that are honestly assessable from
 * text. Pronunciation is NOT — the model is forbidden to invent it; the oral
 * wrap-up during the call is where delivery feedback lives.
 */

import { TOPICS, normalizeTopicId } from "../topics";
import type { FeedbackLang } from "../models";

const LANG_NAME: Record<FeedbackLang, string> = {
  ru: "RUSÇA",
  en: "İNGİLİZCE",
  tr: "TÜRKÇE",
  kk: "KAZAKÇA",
};

const GENDER_NOTE: Record<string, string> = {
  female: "Öğrenci bir kadın: Rusça/Kazakça metinlerde dişil biçimleri kullan («выполнила», «говорила», «студентка»).",
  male: "Öğrenci bir erkek: Rusça/Kazakça metinlerde eril biçimleri kullan («выполнил», «говорил», «студент»).",
};

export function buildVoiceReviewSystem(lang: FeedbackLang, gender?: "female" | "male" | null): string {
  const langName = LANG_NAME[lang];
  return `Sen deneyimli bir TÖMER Konuşma sınavı değerlendiricisisin. Sana bir sesli dersin YAZILI dökümü verilecek (Öğretmen/Öğrenci satırları) ve dersin hedef konuları.

Görev: SADECE öğrencinin söylediklerini değerlendir.${gender ? `\n${GENDER_NOTE[gender]}` : ""}

Ölçütler (her biri 0-5, yazılı dökümden dürüstçe değerlendirilebilenler):
- fluency: akıcılık (cevap uzunluğu, kendini ifade, takılmadan geliştirme — döküme yansıdığı kadarıyla)
- grammar: dil bilgisi doğruluğu
- vocab: kelime zenginliği ve yerinde kullanım
- coherence: tutarlılık ve soruya uygunluk
ÖNEMLİ: Telaffuz yazılı dökümden DEĞERLENDİRİLEMEZ — telaffuz hakkında hiçbir şey yazma, uydurma.

SEVİYEYE GÖRE TON (öğrencinin seviyesi kullanıcı mesajında): A0-A1 —
başlangıç dersi, sınav değil: en fazla 2 hata seç, dil bilgisi teorisine
girme, söylediği SOMUT şeyleri öv, «summary» cesaretlendirici olsun (iki
kelime söyledi — bu bir zaferdir; öğrenci zaten zorlandığını biliyor).
A2 — nazik ve kısa. B1 ve üstü — tam TÖMER değerlendirme ciddiyeti.

Kurallar:
1. "summary" (2-3 cümle), "went_well", ölçüt yorumları ("comment"), hata açıklamaları ("rule", "explanation"), "vocab_notes" metinleri ve "next_steps" ${langName} olacak — ana dili ${langName} olan eğitimli birinin yazdığı gibi DOĞAL, akıcı ve dilbilgisi açısından KUSURSUZ. Makine çevirisi tadı, kalıp ifade, yapay/devrik cümle YASAK. Alıntılar Türkçe kalır.
2. "went_well" HER ZAMAN dolu ve SOMUT: öğrencinin dökümden GERÇEK başarıları, Türkçe örnekleriyle («4 cümleyi şimdiki zamanda doğru kurdun: gidiyorum, yapıyorum...»). Genel «aferin/molodets» YASAK — sadece dökümde olan şeyler.
3. Hatalar YALNIZCA öğrencinin cümlelerinden: TAM alıntı (quote) → doğru biçim (correction) → kuralın adı (rule) → kısa açıklama (explanation). En önemli 3-7 hatayı seç, hata UYDURMA.
4. "topic" alanı YALNIZCA şu listeden: ${TOPICS.map((t) => t.id).join(", ")}.
5. "topics_worked": derste gerçekten çalışılan konular (aynı listeden, hedef konuları ve dökümü dikkate al).
6. "vocab_notes": kelime dağarcığı — "used_well": yerinde kullandığı 1-3 kelime/ifade (Türkçe); "upgrades": daha iyi söylenebilecek en fazla 2 şey {"said": dökümden, "better": daha doğal Türkçesi}; "new_words": bir dahaki sefere 1-2 yeni kelime, «türkçe — ${langName} çevirisi» biçiminde. Dökümde temel yoksa alanı boş bırak, uydurma.
7. "fluency" yorumu SADECE dökümden görünene dayanır: cevap uzunluğu, cümle geliştirme. Duraklama/tereddüt döküme YANSIMAZ — onlardan bahsetme.
8. "next_steps": en fazla 3 SOMUT adım — platform modülü + konu + miktar («Dil bilgisi bölümünde gereklilik kipinden 5 alıştırma yap» gibi), «pratik yapmaya devam et» gibi boş tavsiye YASAK. Son adım her zaman: bir sonraki sesli derste neyle başlayacağınız.
9. Döküm çok kısaysa (öğrenci 2'den az anlamlı cümle kurduysa): {"valid": false, "invalid_reason": "..."} döndür (${langName}), puan ve hata üretme.
10. Metin alanlarında markdown KULLANMA — yıldız, başlık, madde imi yok; sadece düz metin.
11. YALNIZCA geçerli JSON döndür. Şema:
{"valid": boolean, "invalid_reason": string|null, "summary": string, "went_well": string, "criteria": {"fluency": {"score": number, "comment": string}, "grammar": {"score": number, "comment": string}, "vocab": {"score": number, "comment": string}, "coherence": {"score": number, "comment": string}}, "errors": [{"quote": string, "correction": string, "rule": string, "explanation": string, "topic": string, "severity": "major"|"minor"}], "vocab_notes": {"used_well": [string], "upgrades": [{"said": string, "better": string}], "new_words": [string]}, "topics_worked": [string], "next_steps": [string]}`;
}

export function buildVoiceReviewUserMessage(input: {
  transcriptLines: { role: "teacher" | "student"; text: string }[];
  lessonFocusTr: string;
  level: string;
  targetLevel: string;
}): string {
  const dialog = input.transcriptLines
    .map((l) => `${l.role === "student" ? "Öğrenci" : "Öğretmen"}: ${l.text}`)
    .join("\n");
  return `Öğrencinin seviyesi: ${input.level}. Hedefi: ${input.targetLevel}.\nDersin hedef konuları: ${input.lessonFocusTr || "belirtilmedi"}.\n\nDers dökümü:\n"""\n${dialog}\n"""`;
}

// ---------------------------------------------------------------------------

export type VoiceCriterion = { score: number; comment: string };

export type VoiceVocabNotes = {
  /** слова/фразы, использованные хорошо (турецкий) */
  used_well: string[];
  /** «сказал → точнее было бы» — максимум 2 */
  upgrades: { said: string; better: string }[];
  /** 1-2 новых слова на следующий раз («türkçe — перевод») */
  new_words: string[];
};

export type VoiceReport = {
  valid: boolean;
  invalid_reason: string | null;
  summary: string;
  /** что получилось — всегда первым, всегда конкретно (Блок 4) */
  went_well: string;
  criteria: { fluency: VoiceCriterion; grammar: VoiceCriterion; vocab: VoiceCriterion; coherence: VoiceCriterion };
  errors: { quote: string; correction: string; rule: string; explanation: string; topic: string; severity: "major" | "minor" }[];
  vocab_notes: VoiceVocabNotes;
  topics_worked: string[];
  next_steps: string[];
};

const score5 = (n: unknown) =>
  Math.max(0, Math.min(5, Math.round(typeof n === "number" && Number.isFinite(n) ? n : 0)));

function criterion(raw: unknown): VoiceCriterion {
  const r = (raw ?? {}) as Record<string, unknown>;
  return { score: score5(r.score), comment: typeof r.comment === "string" ? r.comment : "" };
}

export function validateVoiceReport(raw: unknown): VoiceReport | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.valid !== "boolean") return null;

  if (!r.valid) {
    return {
      valid: false,
      invalid_reason: typeof r.invalid_reason === "string" ? r.invalid_reason : "too short",
      summary: "",
      went_well: "",
      criteria: { fluency: criterion(null), grammar: criterion(null), vocab: criterion(null), coherence: criterion(null) },
      errors: [],
      vocab_notes: { used_well: [], upgrades: [], new_words: [] },
      topics_worked: [],
      next_steps: [],
    };
  }

  const c = (r.criteria ?? {}) as Record<string, unknown>;
  const vnRaw = (r.vocab_notes ?? {}) as Record<string, unknown>;
  const strArr = (v: unknown, cap: number) =>
    (Array.isArray(v) ? v : []).filter((x): x is string => typeof x === "string" && !!x.trim()).slice(0, cap);
  return {
    valid: true,
    invalid_reason: null,
    summary: typeof r.summary === "string" ? r.summary : "",
    went_well: typeof r.went_well === "string" ? r.went_well : "",
    vocab_notes: {
      used_well: strArr(vnRaw.used_well, 3),
      upgrades: (Array.isArray(vnRaw.upgrades) ? vnRaw.upgrades : [])
        .filter((u): u is Record<string, unknown> => !!u && typeof u === "object")
        .map((u) => ({ said: String(u.said ?? ""), better: String(u.better ?? "") }))
        .filter((u) => u.said && u.better)
        .slice(0, 2),
      new_words: strArr(vnRaw.new_words, 2),
    },
    criteria: {
      fluency: criterion(c.fluency),
      grammar: criterion(c.grammar),
      vocab: criterion(c.vocab),
      coherence: criterion(c.coherence),
    },
    errors: (Array.isArray(r.errors) ? r.errors : [])
      .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
      .map((e) => ({
        quote: String(e.quote ?? ""),
        correction: String(e.correction ?? ""),
        rule: String(e.rule ?? ""),
        explanation: String(e.explanation ?? ""),
        topic: normalizeTopicId(e.topic),
        severity: e.severity === "minor" ? ("minor" as const) : ("major" as const),
      }))
      .filter((e) => e.quote && e.correction),
    topics_worked: (Array.isArray(r.topics_worked) ? r.topics_worked : [])
      .map(normalizeTopicId)
      .filter((t) => t !== "other"),
    next_steps: (Array.isArray(r.next_steps) ? r.next_steps : []).filter((s): s is string => typeof s === "string").slice(0, 3),
  };
}
