/**
 * Daily Ahu note on the dashboard — ONE short, human message built strictly
 * from the student's REAL numbers (founder's honesty condition: no empty
 * cheering; zero activity is named plainly and warmly, never praised).
 * The context facts are computed server-side and passed in the user message;
 * the model may only rephrase them, never invent.
 */

import type { FeedbackLang } from "../models";

const LANG_NAME: Record<FeedbackLang, string> = {
  ru: "RUSÇA",
  en: "İNGİLİZCE",
  tr: "TÜRKÇE",
  kk: "KAZAKÇA",
};

const GENDER_NOTE: Record<string, string> = {
  female: "Öğrenci bir kadın: Rusça ve Kazakça yazarken dişil biçimleri kullan («сделала», «готова», «сама»).",
  male: "Öğrenci bir erkek: Rusça ve Kazakça yazarken eril biçimleri kullan («сделал», «готов», «сам»).",
};

export function buildMotivatorSystem(lang: FeedbackLang, gender?: "female" | "male" | null): string {
  return `Sen Ahu'sun — LingoPRO'daki Türkçe öğretmeni. Öğrencinin paneline günde BİR kısa not yazıyorsun.${gender ? `\n${GENDER_NOTE[gender]}` : ""}

Kurallar (İHLAL EDİLEMEZ):
1. SADECE sana verilen gerçek verilere dayan. Veri uydurmak, abartmak, olmayan başarıyı övmek YASAK.
2. Dün hiçbir şey yapılmadıysa bunu açıkça ama sıcak söyle ve bugünkü plana çağır ("вчера пропуск — бывает, сегодня вернёмся" ruhunda). Sıfır aktiviteye "молодец/harika" DEME.
3. Gerçek bir başarı varsa (seri, dünkü görevler, kapanan konu) SOMUT sayıyla an. Genel "aferin" yok — olgu + kısa insanî yorum.
4. Zayıf konu verildiyse ve yerinde duruyorsa bir cümleyle ona yönlendirebilirsin.
5. 1-2 kısa cümle, en fazla ~35 kelime. Tek paragraf, düz metin. MARKDOWN, liste, başlık YASAK. Emoji en fazla bir tane.
6. Not ${LANG_NAME[lang]} dilinde. Canlı, insanî öğretmen sesi — robot klişesi ("не сдавайся", "ты можешь всё") YASAK.
7. Sınav sonucu vaat etme.
8. Öğrenciye SEN diye hitap et (Rusça «ты» — resmî «вы» YASAK). Kendi adınla («Ahu») veya herhangi bir isimle/selamlamayla BAŞLAMA — doğrudan konuya gir.`;
}

export type MotivatorFacts = {
  /** yesterday's plan: done/total, null = no plan row existed */
  yesterday: { done: number; total: number } | null;
  /** true = до сегодняшнего дня истории НЕ было (новичок) — «пропуск» здесь ложь */
  firstDays: boolean;
  /** current streak in days (0 = broken/none) */
  streak: number;
  /** days until the exam (exact date only) */
  daysToExam: number | null;
  /** weakest open topic, Turkish label */
  weakTopicTr: string | null;
  /** topics closed (strength ≥ 60) inside the route span */
  topicsClosed: number;
  level: string;
  targetLevel: string;
};

/** The facts block the model is allowed to speak about — nothing else. */
export function buildMotivatorUserMessage(f: MotivatorFacts): string {
  const lines = [
    `Seviye: ${f.level}, hedef: ${f.targetLevel}.`,
    f.daysToExam != null ? `Sınava ${f.daysToExam} gün var.` : "Sınav tarihi belirlenmedi.",
    f.firstDays
      ? "Öğrenci platforma DAHA YENİ başladı — geçmiş günler henüz yok. 'Kaçırdın/dersi atladın' DEME; hoş geldin de ve ilk adımı öner."
      : f.yesterday
        ? `Dün: planın ${f.yesterday.done}/${f.yesterday.total} görevi yapıldı.`
        : "Dün için plan verisi yok (öğrenci o gün girmedi).",
    `Seri: ${f.streak} gün.`,
    `Kapatılan konu sayısı: ${f.topicsClosed}.`,
    f.weakTopicTr ? `En zayıf konu: ${f.weakTopicTr}.` : "Zayıf konu verisi yok.",
    "",
    "Bu verilere dayanarak panele bugünkü kısa notunu yaz.",
  ];
  return lines.join("\n");
}
