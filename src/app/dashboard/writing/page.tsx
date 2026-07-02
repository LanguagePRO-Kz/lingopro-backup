"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { WRITING_TASKS } from "@/data/writing-tasks";
import type { Level, WritingTask } from "@/data/types";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

const T = {
  ru: {
    title: "Проверка письменных заданий", back: "К заданиям", words: "слов", minWords: "минимум", placeholder: "Напиши ответ на турецком…",
    submit: "Отправить на проверку", result: "Результат проверки", score: "Оценка", errors: "Ошибки", corrected: "Исправленный вариант",
    reco: "Рекомендации", again: "Написать заново", criteria: "Критерии оценки", sample: "Пример хорошего ответа", translation: "Перевод задания",
    done: "выполнено", all: "Все", unfinished: "Непройденные", allLevels: "Все уровни", empty: "Нет заданий по выбранным фильтрам.",
    fb: {
      errors: ["Падежное окончание: «şehirde» вместо «şehir».", "Связующее слово: добавь «ayrıca» между аргументами.", "Пунктуация: пропущена точка в конце предложения."],
      corrected: "Ben Almatı'da yaşıyorum. Şehrimiz çok büyük ve modern. Ayrıca burada çok park var. Havası temiz ve insanlar çok kibar.",
      reco: "Используй больше связующих слов (çünkü, ancak, ayrıca) и следи за падежными окончаниями.",
      stub: "[Полная проверка с AI будет доступна после подключения Claude API]",
    },
  },
  en: {
    title: "Written assignment review", back: "To tasks", words: "words", minWords: "minimum", placeholder: "Write your answer in Turkish…",
    submit: "Submit for review", result: "Review result", score: "Score", errors: "Errors", corrected: "Corrected version",
    reco: "Recommendations", again: "Write again", criteria: "Scoring criteria", sample: "Sample good answer", translation: "Task translation",
    done: "done", all: "All", unfinished: "Unfinished", allLevels: "All levels", empty: "No tasks match the selected filters.",
    fb: {
      errors: ["Case ending: «şehirde» instead of «şehir».", "Linking word: add «ayrıca» between arguments.", "Punctuation: missing period at the end of a sentence."],
      corrected: "Ben Almatı'da yaşıyorum. Şehrimiz çok büyük ve modern. Ayrıca burada çok park var. Havası temiz ve insanlar çok kibar.",
      reco: "Use more linking words (çünkü, ancak, ayrıca) and watch your case endings.",
      stub: "[Full AI review will be available once the Claude API is connected]",
    },
  },
  tr: {
    title: "Yazılı ödev değerlendirmesi", back: "Görevlere dön", words: "kelime", minWords: "en az", placeholder: "Cevabını Türkçe yaz…",
    submit: "Değerlendirmeye gönder", result: "Değerlendirme sonucu", score: "Puan", errors: "Hatalar", corrected: "Düzeltilmiş hâli",
    reco: "Öneriler", again: "Tekrar yaz", criteria: "Değerlendirme ölçütleri", sample: "Örnek iyi cevap", translation: "Görev çevirisi",
    done: "tamamlandı", all: "Tümü", unfinished: "Tamamlanmamış", allLevels: "Tüm seviyeler", empty: "Seçilen filtrelere uygun görev yok.",
    fb: {
      errors: ["Hâl eki: «şehir» yerine «şehirde».", "Bağlaç: argümanlar arasına «ayrıca» ekle.", "Noktalama: cümle sonunda nokta eksik."],
      corrected: "Ben Almatı'da yaşıyorum. Şehrimiz çok büyük ve modern. Ayrıca burada çok park var. Havası temiz ve insanlar çok kibar.",
      reco: "Daha çok bağlaç kullan (çünkü, ancak, ayrıca) ve hâl eklerine dikkat et.",
      stub: "[Tam AI değerlendirmesi Claude API bağlanınca gelecek]",
    },
  },
  kk: {
    title: "Жазба тапсырмаларды тексеру", back: "Тапсырмаларға", words: "сөз", minWords: "кемінде", placeholder: "Жауабыңды түрікше жаз…",
    submit: "Тексеруге жіберу", result: "Тексеру нәтижесі", score: "Баға", errors: "Қателер", corrected: "Түзетілген нұсқа",
    reco: "Ұсыныстар", again: "Қайта жазу", criteria: "Бағалау критерийлері", sample: "Жақсы жауап үлгісі", translation: "Тапсырма аудармасы",
    done: "орындалды", all: "Барлығы", unfinished: "Орындалмаған", allLevels: "Барлық деңгей", empty: "Таңдалған сүзгілерге сай тапсырма жоқ.",
    fb: {
      errors: ["Септік жалғауы: «şehir» орнына «şehirde».", "Жалғаулық сөз: дәйектер арасына «ayrıca» қос.", "Тыныс белгі: сөйлем соңында нүкте жоқ."],
      corrected: "Ben Almatı'da yaşıyorum. Şehrimiz çok büyük ve modern. Ayrıca burada çok park var. Havası temiz ve insanlar çok kibar.",
      reco: "Көбірек жалғаулық сөз қолдан (çünkü, ancak, ayrıca) және септік жалғауларына көңіл бөл.",
      stub: "[Толық AI тексеру Claude API қосылғанда қолжетімді болады]",
    },
  },
};

export default function WritingPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [level, setLevel] = useState<Level | "all">("all");
  const [onlyUnfinished, setOnlyUnfinished] = useState(false);
  const [active, setActive] = useState<WritingTask | null>(null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const words = text.trim().split(/\s+/).filter(Boolean).length;

  const list = useMemo(
    () =>
      WRITING_TASKS.filter((t) => {
        const byLevel = level === "all" || t.level === level;
        const byStatus = !onlyUnfinished || !doneIds.has(t.id);
        return byLevel && byStatus;
      }),
    [level, onlyUnfinished, doneIds],
  );

  function open(t: WritingTask) {
    setActive(t);
    setText("");
    setSubmitted(false);
  }

  function submit() {
    setSubmitted(true);
    if (active) setDoneIds((s) => new Set(s).add(active.id));
  }

  if (!active) {
    return (
      <div>
        <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>
        <div className="mt-2 text-sm text-[var(--color-muted)]">
          <span className="font-semibold text-[var(--color-brand)]">{doneIds.size}</span> / {WRITING_TASKS.length} {c.done}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <FilterBtn active={level === "all"} onClick={() => setLevel("all")}>{c.allLevels}</FilterBtn>
          {LEVELS.map((l) => (
            <FilterBtn key={l} active={level === l} onClick={() => setLevel(l)}>{l}</FilterBtn>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <FilterBtn active={!onlyUnfinished} onClick={() => setOnlyUnfinished(false)}>{c.all}</FilterBtn>
          <FilterBtn active={onlyUnfinished} onClick={() => setOnlyUnfinished(true)}>{c.unfinished}</FilterBtn>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {list.map((t) => (
            <button key={t.id} type="button" onClick={() => open(t)} className="glass flex items-center justify-between rounded-2xl p-4 text-left transition-shadow hover:shadow-md">
              <span className="flex items-center gap-3">
                <span className="text-lg">{doneIds.has(t.id) ? "✅" : "✍️"}</span>
                <span className="text-sm font-medium text-[var(--color-foreground)]">{t.title}</span>
              </span>
              <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-brand-2)]">{t.level}</span>
            </button>
          ))}
          {list.length === 0 && <div className="rounded-2xl border border-black/[0.07] bg-white/60 px-5 py-8 text-center text-sm text-[var(--color-muted)]">{c.empty}</div>}
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
          <h2 className="text-lg font-bold text-[var(--color-foreground)]">{active.title}</h2>
          <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-brand-2)]">{active.level}</span>
        </div>
        <p className="mt-2 text-sm text-[var(--color-foreground)]">{active.prompt}</p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">{c.translation}: {active.promptRu}</p>

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
              <span className={`text-xs ${words >= active.minWords ? "text-[#16a34a]" : "text-[var(--color-muted)]"}`}>
                {words} / {active.minWords} {c.words} ({c.minWords})
              </span>
              <button
                type="button"
                disabled={text.trim().length < 20}
                onClick={submit}
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
              <span className="font-bold text-[var(--color-brand)]">{active.level} · 15/20</span>
            </div>

            {/* rubric */}
            <div className="rounded-xl bg-black/[0.03] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{c.criteria}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {active.criteria.map((cr) => (
                  <span key={cr.name} className="rounded-full bg-white px-3 py-1 text-xs text-[var(--color-foreground)] shadow-sm">{cr.name} · {cr.maxScore}</span>
                ))}
              </div>
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

            {active.sampleAnswer && (
              <div className="rounded-xl bg-[var(--color-brand)]/[0.05] p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)]">{c.sample}</div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-foreground)]">{active.sampleAnswer}</p>
              </div>
            )}

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

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${active ? "bg-[var(--color-brand)]/12 text-[var(--color-brand)]" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}>
      {children}
    </button>
  );
}
