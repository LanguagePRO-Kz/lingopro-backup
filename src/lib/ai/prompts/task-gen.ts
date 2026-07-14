/**
 * Генератор заданий + QA-проход (Фаза 7.5). Два РАЗНЫХ промпта у РАЗНЫХ
 * провайдеров (task_gen=Sonnet, task_qa=DeepSeek): модель, написавшая
 * задание, уверена в его корректности — судит «злой экзаменатор».
 *
 * Не прошло QA → в банк НЕ идёт: сломанное задание (два верных ответа или
 * ни одного) опаснее пробела в грамматике — студент выучит неверный ключ,
 * провалит экзамен → возврат денег по гарантии.
 */

import { topicById } from "../topics";

export type GeneratedTask = {
  question: string; // турецкое предложение с пропуском/вопросом
  options: string[]; // ровно 4
  correctAnswer: number; // индекс
  explanation: string; // на русском (как в банке)
  topic: string;
  level: string;
};

export function buildTaskGenSystem(input: { topicId: string; level: string; count: number }): string {
  const topic = topicById(input.topicId);
  const label = topic?.label.tr ?? input.topicId;
  return `Sen TÖMER hazırlık materyali yazan deneyimli bir Türkçe öğretmenisin.
Görev: «${label}» konusunda, ${input.level} seviyesinde ${input.count} adet çoktan seçmeli dil bilgisi sorusu ÜRET.

Kurallar:
1. Sorular TAMAMEN ÖZGÜN olmalı — hiçbir sınavdan, kitaptan veya bilinen kaynaktan alınmamış. Nötr günlük temalar (şehir, aile, iş, eğitim, teknoloji); siyaset/din YOK.
2. Her soruda TAM 4 şık ve KESİNLİKLE TEK doğru cevap. Çeldiriciler mantıklı: sık yapılan gerçek hatalar olsun, saçma şıklar değil.
3. Seviye ${input.level}'e SADIK kal: kelime ve yapılar bu seviyenin üstüne çıkmasın (soru gövdesi de dahil).
4. "explanation" RUSÇA yazılır: kuralın adı + doğru cevabın kısa gerekçesi (öğrenci için).
5. Cümlelerin DOĞAL Türkçe olduğundan emin ol — «dil bilgisi doğru ama Türk böyle demez» kabul edilmez.
6. YALNIZCA geçerli JSON dizisi döndür:
[{"question": "...", "options": ["...","...","...","..."], "correctAnswer": 0, "explanation": "..."}]`;
}

/** «Злой экзаменатор»: чек-лист основателя — единственность ключа, уровень,
 *  соответствие ключа объяснению, натуральность. Сомнение = reject. */
export function buildTaskQASystem(level: string): string {
  return `Sen ACIMASIZ bir TÖMER sınav denetçisisin. Sana üretilmiş bir çoktan seçmeli soru verilecek. Görevin ONU ÇÜRÜTMEK — onaylamak değil.

Sırayla denetle:
1. single_correct: şıkları TEK TEK dene — gerçekten KAÇ şık kabul edilebilir? Dil bilgisi VE anlam açısından savunulabilir her şık sayılır. Tam 1 değilse → RED.
2. level_match: soru gerçekten ${level} mi? Kelime/yapı seviyenin üstündeyse (öğrenci kolayca çözemez) veya çok altındaysa (hazır olduğunu sanır) → RED.
3. key_matches_explanation: verilen doğru cevap indeksi, açıklamadaki gerekçeyle aynı şıkkı mı gösteriyor? Değilse → RED.
4. natural: bir ana dili konuşuru bu cümleyi böyle KURAR MI? «Doğru ama yapay» ise → RED.

ŞÜPHE = RED. Kırılan soru, eksik sorudan daha tehlikelidir: öğrenci yanlış cevabı öğrenir ve sınavda onunla düşer.

YALNIZCA geçerli JSON döndür:
{"approved": boolean, "single_correct": boolean, "level_match": boolean, "key_matches_explanation": boolean, "natural": boolean, "problems": ["kısa sorun açıklamaları (Rusça)"]}`;
}

export type TaskQaVerdict = {
  approved: boolean;
  single_correct: boolean;
  level_match: boolean;
  key_matches_explanation: boolean;
  natural: boolean;
  problems: string[];
};

export function validateQaVerdict(raw: unknown): TaskQaVerdict | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.approved !== "boolean") return null;
  const flags = ["single_correct", "level_match", "key_matches_explanation", "natural"] as const;
  const v: TaskQaVerdict = {
    approved: r.approved,
    single_correct: r.single_correct === true,
    level_match: r.level_match === true,
    key_matches_explanation: r.key_matches_explanation === true,
    natural: r.natural === true,
    problems: (Array.isArray(r.problems) ? r.problems : []).filter((p): p is string => typeof p === "string").slice(0, 6),
  };
  // страховка от вежливого судьи: approved требует ВСЕ четыре флага
  if (v.approved && !flags.every((f) => v[f])) v.approved = false;
  return v;
}

export function validateGeneratedTasks(raw: unknown, topicId: string, level: string): GeneratedTask[] {
  if (!Array.isArray(raw)) return [];
  const out: GeneratedTask[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const t = item as Record<string, unknown>;
    const options = Array.isArray(t.options) ? t.options.filter((o): o is string => typeof o === "string") : [];
    const idx = t.correctAnswer;
    if (
      typeof t.question !== "string" ||
      t.question.trim().length < 8 ||
      options.length !== 4 ||
      new Set(options.map((o) => o.trim().toLowerCase())).size !== 4 ||
      !Number.isInteger(idx) ||
      (idx as number) < 0 ||
      (idx as number) > 3 ||
      typeof t.explanation !== "string"
    ) {
      continue;
    }
    out.push({
      question: t.question.trim(),
      options: options.map((o) => o.trim()),
      correctAnswer: idx as number,
      explanation: t.explanation.trim(),
      topic: topicId,
      level,
    });
  }
  return out;
}
