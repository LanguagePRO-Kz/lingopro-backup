"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

type Task = { id: string; level: string; prompt: string };

const TASKS: Task[] = [
  { id: "city", level: "A2", prompt: "Yaşadığınız şehri anlatın. En az 5 cümle yazın." },
  { id: "friend", level: "B1", prompt: "Tatilinizi anlatan bir mektup yazın arkadaşınıza." },
  { id: "essay", level: "B2", prompt: "Online eğitim mi geleneksel eğitim mi daha iyi? Bir kompozisyon yazın." },
  { id: "formal", level: "B2", prompt: "Üniversiteye resmi bir başvuru mektubu yazın." },
  { id: "tomer", level: "C1", prompt: "TÖMER formatında bir kompozisyon yazın (en az 250 kelime)." },
];

const T = {
  ru: {
    title: "Проверка письменных заданий",
    titles: { city: "Расскажи о своём городе", friend: "Письмо другу о каникулах", essay: "Эссе: Онлайн vs Офлайн обучение", formal: "Формальное письмо в университет", tomer: "Эссе в формате TÖMER" } as Record<string, string>,
    back: "К заданиям",
    words: "слов",
    placeholder: "Напиши ответ на турецком…",
    submit: "Отправить на проверку",
    result: "Результат проверки",
    score: "Оценка",
    errors: "Ошибки",
    corrected: "Исправленный вариант",
    reco: "Рекомендации",
    again: "Написать заново",
    fb: {
      errors: ["Падежное окончание: «şehirde» вместо «şehir».", "Связующее слово: добавь «ayrıca» между аргументами.", "Пунктуация: пропущена точка в конце 3-го предложения."],
      corrected: "Ben Almatı'da yaşıyorum. Şehrimiz çok büyük ve modern. Ayrıca burada çok park var. Havası temiz ve insanlar çok kibar.",
      reco: "Используй больше связующих слов (çünkü, ancak, ayrıca) и следи за падежными окончаниями.",
      stub: "[Полная проверка с AI будет доступна после подключения Claude API]",
    },
  },
  en: {
    title: "Written assignment review",
    titles: { city: "Describe your city", friend: "A letter to a friend about the holidays", essay: "Essay: Online vs Offline education", formal: "Formal letter to a university", tomer: "TÖMER-format essay" } as Record<string, string>,
    back: "To tasks",
    words: "words",
    placeholder: "Write your answer in Turkish…",
    submit: "Submit for review",
    result: "Review result",
    score: "Score",
    errors: "Errors",
    corrected: "Corrected version",
    reco: "Recommendations",
    again: "Write again",
    fb: {
      errors: ["Case ending: «şehirde» instead of «şehir».", "Linking word: add «ayrıca» between arguments.", "Punctuation: missing period at the end of sentence 3."],
      corrected: "Ben Almatı'da yaşıyorum. Şehrimiz çok büyük ve modern. Ayrıca burada çok park var. Havası temiz ve insanlar çok kibar.",
      reco: "Use more linking words (çünkü, ancak, ayrıca) and watch your case endings.",
      stub: "[Full AI review will be available once the Claude API is connected]",
    },
  },
  tr: {
    title: "Yazılı ödev değerlendirmesi",
    titles: { city: "Şehrini anlat", friend: "Tatil hakkında arkadaşa mektup", essay: "Kompozisyon: Online vs Yüz yüze eğitim", formal: "Üniversiteye resmi mektup", tomer: "TÖMER formatında kompozisyon" } as Record<string, string>,
    back: "Görevlere dön",
    words: "kelime",
    placeholder: "Cevabını Türkçe yaz…",
    submit: "Değerlendirmeye gönder",
    result: "Değerlendirme sonucu",
    score: "Puan",
    errors: "Hatalar",
    corrected: "Düzeltilmiş hâli",
    reco: "Öneriler",
    again: "Tekrar yaz",
    fb: {
      errors: ["Hâl eki: «şehir» yerine «şehirde».", "Bağlaç: argümanlar arasına «ayrıca» ekle.", "Noktalama: 3. cümlenin sonunda nokta eksik."],
      corrected: "Ben Almatı'da yaşıyorum. Şehrimiz çok büyük ve modern. Ayrıca burada çok park var. Havası temiz ve insanlar çok kibar.",
      reco: "Daha çok bağlaç kullan (çünkü, ancak, ayrıca) ve hâl eklerine dikkat et.",
      stub: "[Tam AI değerlendirmesi Claude API bağlanınca gelecek]",
    },
  },
  kk: {
    title: "Жазба тапсырмаларды тексеру",
    titles: { city: "Қалаң туралы айт", friend: "Досқа демалыс туралы хат", essay: "Эссе: Онлайн vs Офлайн оқу", formal: "Университетке ресми хат", tomer: "TÖMER форматындағы эссе" } as Record<string, string>,
    back: "Тапсырмаларға",
    words: "сөз",
    placeholder: "Жауабыңды түрікше жаз…",
    submit: "Тексеруге жіберу",
    result: "Тексеру нәтижесі",
    score: "Баға",
    errors: "Қателер",
    corrected: "Түзетілген нұсқа",
    reco: "Ұсыныстар",
    again: "Қайта жазу",
    fb: {
      errors: ["Септік жалғауы: «şehir» орнына «şehirde».", "Жалғаулық сөз: дәйектер арасына «ayrıca» қос.", "Тыныс белгі: 3-сөйлемнің соңында нүкте жоқ."],
      corrected: "Ben Almatı'da yaşıyorum. Şehrimiz çok büyük ve modern. Ayrıca burada çok park var. Havası temiz ve insanlar çok kibar.",
      reco: "Көбірек жалғаулық сөз қолдан (çünkü, ancak, ayrıca) және септік жалғауларына көңіл бөл.",
      stub: "[Толық AI тексеру Claude API қосылғанда қолжетімді болады]",
    },
  },
};

export default function WritingPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [active, setActive] = useState<Task | null>(null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const words = text.trim().split(/\s+/).filter(Boolean).length;

  function open(t: Task) {
    setActive(t);
    setText("");
    setSubmitted(false);
  }

  if (!active) {
    return (
      <div>
        <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>
        <div className="mt-6 flex flex-col gap-3">
          {TASKS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => open(t)}
              className="glass flex items-center justify-between rounded-2xl p-4 text-left transition-shadow hover:shadow-md"
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">✍️</span>
                <span className="text-sm font-medium text-[var(--color-foreground)]">{c.titles[t.id]}</span>
              </span>
              <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-brand-2)]">{t.level}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={() => setActive(null)} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
        ← {c.back}
      </button>

      <div className="glass mt-4 rounded-3xl p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-[var(--color-foreground)]">{c.titles[active.id]}</h2>
          <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-brand-2)]">{active.level}</span>
        </div>
        <p className="mt-2 text-sm text-[var(--color-foreground)]">{active.prompt}</p>

        {!submitted ? (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={9}
              placeholder={c.placeholder}
              className="mt-4 w-full resize-y rounded-2xl border border-black/[0.1] bg-white p-4 text-sm leading-relaxed outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-[var(--color-muted)]">{words} {c.words}</span>
              <button
                type="button"
                disabled={text.trim().length < 20}
                onClick={() => setSubmitted(true)}
                className="btn-primary rounded-full px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                {c.submit}
              </button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-[var(--color-foreground)]">{c.result}</h3>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-brand)]/10 px-4 py-2 text-sm">
              <span className="text-[var(--color-muted)]">{c.score}:</span>
              <span className="font-bold text-[var(--color-brand)]">B1 · 15/20</span>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#d97706]">{c.errors}</div>
              <ul className="mt-2 flex flex-col gap-1.5">
                {c.fb.errors.map((e) => (
                  <li key={e} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]"><span>❌</span>{e}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-[var(--color-brand-2)]/[0.06] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-2)]">{c.corrected}</div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-foreground)]">{c.fb.corrected}</p>
            </div>

            <div className="rounded-xl bg-[var(--color-brand)]/[0.05] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)]">{c.reco}</div>
              <p className="mt-2 text-sm text-[var(--color-foreground)]">{c.fb.reco}</p>
            </div>

            <p className="text-xs text-[var(--color-muted)]">{c.fb.stub}</p>
            <button type="button" onClick={() => setSubmitted(false)} className="btn-ghost w-fit rounded-full px-5 py-2.5 text-sm font-medium">
              {c.again}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
