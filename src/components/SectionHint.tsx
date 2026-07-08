"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { dismissHint, hintSeen, type HintId } from "@/lib/onboarding";

/**
 * First-visit hint bubble for a cabinet section: one soft sentence about
 * what the section is for and how it fits the prep loop. Shows once,
 * dismissable, never stacks (one per page by construction). Settings'
 * "show hints again" resets all of them (see lib/onboarding resetHints).
 */

const HINTS: Record<HintId, Record<"ru" | "en" | "tr" | "kk", string>> = {
  grammar: {
    ru: "Здесь отрабатывается грамматика под твой уровень. Повторения слабых тем из плана дня приводят сюда же.",
    en: "This is where you drill grammar at your level. Weak-topic reviews from the daily plan land here too.",
    tr: "Burada seviyene uygun dil bilgisi çalışırsın. Günlük plandaki zayıf konu tekrarları da buraya gelir.",
    kk: "Мұнда деңгейіңе сай грамматика жаттығасың. Күн жоспарындағы әлсіз тақырып қайталаулары да осында әкеледі.",
  },
  vocabulary: {
    ru: "Словарь дня: короткие подходы по 15–20 слов. Выученное попадает в статистику и повторения.",
    en: "Daily vocabulary: short sets of 15–20 words. What you learn feeds your stats and reviews.",
    tr: "Günün kelimeleri: 15–20 kelimelik kısa setler. Öğrendiklerin istatistiğe ve tekrarlara işler.",
    kk: "Күн сөздігі: 15–20 сөзден қысқа жаттығулар. Үйренгенің статистика мен қайталауларға түседі.",
  },
  reading: {
    ru: "Тексты с вопросами в духе TÖMER Okuma. Читай без словаря — сначала пойми общий смысл, потом детали.",
    en: "Texts with questions in the TÖMER Okuma spirit. Read without a dictionary — gist first, details second.",
    tr: "TÖMER Okuma tarzında sorulu metinler. Sözlüksüz oku — önce genel anlam, sonra ayrıntılar.",
    kk: "TÖMER Okuma үлгісіндегі сұрақты мәтіндер. Сөздіксіз оқы — алдымен жалпы мағына, сосын детальдар.",
  },
  listening: {
    ru: "Аудирование: диалоги с вопросами. На экзамене запись играет дважды — здесь так же, привыкай к формату.",
    en: "Listening: dialogues with questions. On the exam the audio plays twice — same here, get used to the format.",
    tr: "Dinleme: sorulu diyaloglar. Sınavda kayıt iki kez çalar — burada da öyle, formata alış.",
    kk: "Тыңдалым: сұрақты диалогтар. Емтиханда жазба екі рет ойналады — мұнда да солай, форматқа үйрен.",
  },
  writing: {
    ru: "Пиши сочинение — AI-экзаменатор разберёт каждую ошибку по критериям TÖMER Yazma. Начни с любого посильного задания.",
    en: "Write an essay — the AI examiner reviews every error against TÖMER Yazma criteria. Start with any prompt that feels doable.",
    tr: "Bir kompozisyon yaz — AI sınav uzmanı her hatayı TÖMER Yazma ölçütleriyle inceler. Gözüne yatan herhangi bir konuyla başla.",
    kk: "Шығарма жаз — AI емтихан алушы әр қатені TÖMER Yazma өлшемдерімен талдайды. Шамаң жететін кез келген тапсырмадан баста.",
  },
  mock: {
    ru: "Пробные прогоны в формате экзамена. По расписанию плана они появляются сами — но можно прийти и потренироваться отдельно.",
    en: "Practice runs in exam format. The plan schedules them for you — but you can come train on your own too.",
    tr: "Sınav formatında deneme turları. Plan bunları kendisi zamanlar — ama ayrıca gelip çalışabilirsin.",
    kk: "Емтихан форматындағы сынақ жүгіртулер. Жоспар оларды өзі қояды — бірақ бөлек келіп жаттығуға да болады.",
  },
  tutor: {
    ru: "Живой чат с преподавателем: правило, перевод, проверка фразы — что угодно. Он помнит твои слабые темы.",
    en: "A live chat with your teacher: a rule, a translation, a phrase check — anything. It remembers your weak topics.",
    tr: "Öğretmenle canlı sohbet: kural, çeviri, cümle kontrolü — ne istersen. Zayıf konularını hatırlar.",
    kk: "Ұстазбен жанды чат: ереже, аударма, сөйлем тексеру — не болсын. Әлсіз тақырыптарыңды есінде сақтайды.",
  },
  stats: {
    ru: "Вся статистика считается из реально сделанного — нули в начале это нормально, они честные.",
    en: "All stats come from what you actually did — zeros at the start are normal, they're honest.",
    tr: "Tüm istatistik gerçekten yaptıklarından hesaplanır — başlangıçtaki sıfırlar normaldir, dürüsttür.",
    kk: "Барлық статистика нақты істегеніңнен есептеледі — басындағы нөлдер қалыпты, олар шынайы.",
  },
};

const CLOSE = { ru: "Понятно", en: "Got it", tr: "Anladım", kk: "Түсінікті" } as const;

export function SectionHint({ id }: { id: HintId }) {
  const { locale } = useI18n();
  const [visible, setVisible] = useState(false);

  // LS read happens client-side only — render nothing until mounted
  useEffect(() => {
    setVisible(!hintSeen(id));
  }, [id]);

  if (!visible) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/[0.05] px-4 py-3">
      <span aria-hidden className="mt-0.5 text-base">💡</span>
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-[var(--color-foreground)]">{pick(locale, HINTS[id])}</p>
      <button
        type="button"
        onClick={() => {
          dismissHint(id);
          setVisible(false);
        }}
        className="shrink-0 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--color-brand)] transition-colors hover:bg-white"
      >
        {pick(locale, CLOSE)}
      </button>
    </div>
  );
}
