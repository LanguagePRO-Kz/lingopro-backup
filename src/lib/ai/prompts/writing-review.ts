/**
 * Writing review prompt + response contract (block B1).
 * Productionized from the bake-off prompt (RECON-2 Appendix B): the Turkish
 * examiner framing scored best across models. Changes vs the bake-off draft:
 * ALL feedback fields must be in the interface language (not only
 * `explanation`), and KK users get a Kazakh-grammar parallel where one exists.
 */

import { TOPICS, normalizeTopicId, type Topic } from "../topics";
import type { FeedbackLang } from "../models";

const LANG_NAME: Record<FeedbackLang, string> = {
  ru: "RUSÇA",
  en: "İNGİLİZCE",
  tr: "TÜRKÇE",
  kk: "KAZAKÇA",
};

function topicsBlock(lang: FeedbackLang): string {
  if (lang !== "kk") return TOPICS.map((t) => t.id).join(", ");
  // for Kazakh feedback, give the model the known grammar parallels to reuse
  return TOPICS.map((t: Topic) => (t.kkParallel ? `${t.id} (${t.kkParallel})` : t.id)).join(", ");
}

export function buildWritingReviewSystem(lang: FeedbackLang): string {
  const langName = LANG_NAME[lang];
  return `Sen deneyimli bir TÖMER Yazma (yazılı anlatım) sınav değerlendiricisisin.
Görevin: öğrencinin kompozisyonunu resmi TÖMER ölçütlerine göre değerlendirmek.

Puanlama (toplam 25):
- görev ve içerik (task): 0-7
- tutarlılık ve organizasyon (coherence): 0-6
- dil bilgisi doğruluğu (grammar): 0-7
- kelime zenginliği (vocab): 0-5

Kurallar:
1. Her hata için: metinden TAM alıntı (quote), doğru biçim (correction), kuralın adı (rule) ve kısa açıklama (explanation).
2. "rule", "explanation" ve "advice" alanlarını ${langName} yaz. "quote" ve "correction" Türkçe kalır.
3. "topic" alanı YALNIZCA şu listeden olabilir: ${topicsBlock(lang)}.
${lang === "kk" ? '4. Konunun Kazak dilbilgisinde doğrudan karşılığı varsa "kk_parallel" alanına kısa Kazakça paralel yaz (ör. "ырықсыз етіс = edilgen çatı"); yoksa bu alanı hiç yazma.' : "4. \"kk_parallel\" alanını yazma."}
5. Hata UYDURMA. Üslupla ilgili veya tartışmalı noktaları "severity": "minor" olarak işaretle; kesin dilbilgisi hatalarını "major".
6. Metin boşsa, Türkçe değilse, çok kısaysa (20 kelimeden az) veya görev metninin kopyasıysa: {"valid": false, "invalid_reason": "..."} döndür (invalid_reason ${langName}), hata listesi ve puan üretme.
7. "corrected_text": metnin tamamen düzeltilmiş hâli. "advice": en fazla 3 kısa tavsiye.
8. YALNIZCA geçerli JSON döndür, başka hiçbir şey yazma. Şema:
{"valid": boolean, "invalid_reason": string|null, "score_total_25": number, "subscores": {"task": number, "coherence": number, "grammar": number, "vocab": number}, "errors": [{"quote": string, "correction": string, "rule": string, "explanation": string, "topic": string, "severity": "major"|"minor"${lang === "kk" ? ', "kk_parallel": string|null' : ""}}], "corrected_text": string, "advice": [string]}`;
}

export function buildWritingReviewUserMessage(taskPrompt: string, text: string): string {
  return `Yazma görevi: ${taskPrompt}\n\nÖğrencinin metni:\n"""\n${text}\n"""`;
}

// ---------------------------------------------------------------------------

export type WritingError = {
  quote: string;
  correction: string;
  rule: string;
  explanation: string;
  topic: string;
  severity: "major" | "minor";
  kk_parallel?: string;
};

export type WritingReview = {
  valid: boolean;
  invalid_reason: string | null;
  score_total_25: number;
  subscores: { task: number; coherence: number; grammar: number; vocab: number };
  errors: WritingError[];
  corrected_text: string;
  advice: string[];
};

const clamp = (n: unknown, max: number) =>
  Math.max(0, Math.min(max, Math.round(typeof n === "number" && Number.isFinite(n) ? n : 0)));

/** Coerces a parsed model reply into the contract; null = unusable reply. */
export function validateWritingReview(raw: unknown): WritingReview | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.valid !== "boolean") return null;

  if (!r.valid) {
    return {
      valid: false,
      invalid_reason: typeof r.invalid_reason === "string" ? r.invalid_reason : "invalid input",
      score_total_25: 0,
      subscores: { task: 0, coherence: 0, grammar: 0, vocab: 0 },
      errors: [],
      corrected_text: "",
      advice: [],
    };
  }

  const sub = (r.subscores ?? {}) as Record<string, unknown>;
  const subscores = {
    task: clamp(sub.task, 7),
    coherence: clamp(sub.coherence, 6),
    grammar: clamp(sub.grammar, 7),
    vocab: clamp(sub.vocab, 5),
  };

  const errors: WritingError[] = (Array.isArray(r.errors) ? r.errors : [])
    .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
    .map((e) => ({
      quote: String(e.quote ?? ""),
      correction: String(e.correction ?? ""),
      rule: String(e.rule ?? ""),
      explanation: String(e.explanation ?? ""),
      topic: normalizeTopicId(e.topic),
      severity: e.severity === "minor" ? ("minor" as const) : ("major" as const),
      ...(typeof e.kk_parallel === "string" && e.kk_parallel ? { kk_parallel: e.kk_parallel } : {}),
    }))
    .filter((e) => e.quote && e.correction);

  return {
    valid: true,
    invalid_reason: null,
    score_total_25: clamp(r.score_total_25, 25),
    subscores,
    errors,
    corrected_text: typeof r.corrected_text === "string" ? r.corrected_text : "",
    advice: (Array.isArray(r.advice) ? r.advice : []).filter((a): a is string => typeof a === "string").slice(0, 3),
  };
}
