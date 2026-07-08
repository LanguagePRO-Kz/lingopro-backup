"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { WRITING_TASKS } from "@/data/writing-tasks";
import { awardXp, XP } from "@/lib/xp";
import type { WritingReview } from "@/lib/ai/prompts/writing-review";
import type { Level, WritingTask } from "@/data/types";
import { SectionBack } from "@/components/SectionBack";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

const T = {
  ru: {
    title: "Проверка письменных заданий", back: "К заданиям", words: "слов", minWords: "минимум", placeholder: "Напиши ответ на турецком…",
    submit: "Отправить на проверку", checking: "AI-преподаватель проверяет — обычно до минуты…", result: "Результат проверки",
    score: "Оценка", sub: { task: "Задание", coherence: "Связность", grammar: "Грамматика", vocab: "Лексика" },
    errors: "Ошибки", noErrors: "Грамматических ошибок не найдено — отличная работа!", corrected: "Исправленный вариант",
    reco: "Рекомендации", again: "Написать заново", retry: "Проверить ещё раз", sample: "Пример хорошего ответа", translation: "Перевод задания",
    done: "выполнено", all: "Все", unfinished: "Непройденные", allLevels: "Все уровни", empty: "Нет заданий по выбранным фильтрам.",
    rule: "Правило", kkParallel: "Параллель с казахским",
    left: "Проверок сегодня", invalid: "Текст не принят",
    errAuth: "Войди в аккаунт, чтобы отправить текст на проверку.",
    errDaily: "Дневной лимит проверок исчерпан (3/день). Новые проверки — завтра.",
    errMonthly: "Месячный лимит проверок исчерпан (60/мес).",
    errUnavailable: "Проверка временно недоступна. Попробуй позже.",
    errGeneric: "Не получилось проверить. Попробуй ещё раз.",
  },
  en: {
    title: "Written assignment review", back: "To tasks", words: "words", minWords: "minimum", placeholder: "Write your answer in Turkish…",
    submit: "Submit for review", checking: "The AI teacher is reviewing — usually under a minute…", result: "Review result",
    score: "Score", sub: { task: "Task", coherence: "Coherence", grammar: "Grammar", vocab: "Vocabulary" },
    errors: "Errors", noErrors: "No grammar errors found — great job!", corrected: "Corrected version",
    reco: "Recommendations", again: "Write again", retry: "Review again", sample: "Sample good answer", translation: "Task translation",
    done: "done", all: "All", unfinished: "Unfinished", allLevels: "All levels", empty: "No tasks match the selected filters.",
    rule: "Rule", kkParallel: "Kazakh parallel",
    left: "Reviews left today", invalid: "Text not accepted",
    errAuth: "Sign in to submit your text for review.",
    errDaily: "Daily review limit reached (3/day). More reviews tomorrow.",
    errMonthly: "Monthly review limit reached (60/month).",
    errUnavailable: "Review is temporarily unavailable. Please try later.",
    errGeneric: "The review failed. Please try again.",
  },
  tr: {
    title: "Yazılı ödev değerlendirmesi", back: "Görevlere dön", words: "kelime", minWords: "en az", placeholder: "Cevabını Türkçe yaz…",
    submit: "Değerlendirmeye gönder", checking: "AI öğretmen inceliyor — genellikle bir dakikadan az…", result: "Değerlendirme sonucu",
    score: "Puan", sub: { task: "Görev", coherence: "Tutarlılık", grammar: "Dil bilgisi", vocab: "Kelime" },
    errors: "Hatalar", noErrors: "Dil bilgisi hatası bulunamadı — harika!", corrected: "Düzeltilmiş hâli",
    reco: "Öneriler", again: "Tekrar yaz", retry: "Yeniden değerlendir", sample: "Örnek iyi cevap", translation: "Görev çevirisi",
    done: "tamamlandı", all: "Tümü", unfinished: "Tamamlanmamış", allLevels: "Tüm seviyeler", empty: "Seçilen filtrelere uygun görev yok.",
    rule: "Kural", kkParallel: "Kazakça paralel",
    left: "Bugünkü kalan hak", invalid: "Metin kabul edilmedi",
    errAuth: "Değerlendirme için giriş yap.",
    errDaily: "Günlük değerlendirme sınırına ulaşıldı (3/gün). Yarın devam.",
    errMonthly: "Aylık sınıra ulaşıldı (60/ay).",
    errUnavailable: "Değerlendirme geçici olarak kullanılamıyor. Daha sonra dene.",
    errGeneric: "Değerlendirme başarısız oldu. Tekrar dene.",
  },
  kk: {
    title: "Жазба тапсырмаларды тексеру", back: "Тапсырмаларға", words: "сөз", minWords: "кемінде", placeholder: "Жауабыңды түрікше жаз…",
    submit: "Тексеруге жіберу", checking: "AI ұстаз тексеріп жатыр — әдетте бір минуттан аз…", result: "Тексеру нәтижесі",
    score: "Баға", sub: { task: "Тапсырма", coherence: "Байланыстылық", grammar: "Грамматика", vocab: "Лексика" },
    errors: "Қателер", noErrors: "Грамматикалық қате табылмады — керемет!", corrected: "Түзетілген нұсқа",
    reco: "Ұсыныстар", again: "Қайта жазу", retry: "Қайта тексеру", sample: "Жақсы жауап үлгісі", translation: "Тапсырма аудармасы",
    done: "орындалды", all: "Барлығы", unfinished: "Орындалмаған", allLevels: "Барлық деңгей", empty: "Таңдалған сүзгілерге сай тапсырма жоқ.",
    rule: "Ереже", kkParallel: "Қазақшамен параллель",
    left: "Бүгінгі қалған тексеру", invalid: "Мәтін қабылданбады",
    errAuth: "Тексеру үшін аккаунтқа кір.",
    errDaily: "Күнделікті тексеру шегі бітті (3/күн). Жаңасы — ертең.",
    errMonthly: "Айлық шек бітті (60/ай).",
    errUnavailable: "Тексеру уақытша қолжетімсіз. Кейінірек көр.",
    errGeneric: "Тексеру сәтсіз болды. Қайта көр.",
  },
};

type Status =
  | { kind: "editing" }
  | { kind: "checking" }
  | { kind: "error"; code: "errAuth" | "errDaily" | "errMonthly" | "errUnavailable" | "errGeneric" }
  | { kind: "review"; review: WritingReview; usedToday: number };

export default function WritingPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [level, setLevel] = useState<Level | "all">("all");
  const [onlyUnfinished, setOnlyUnfinished] = useState(false);
  const [active, setActive] = useState<WritingTask | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "editing" });
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
    setStatus({ kind: "editing" });
  }

  async function submit() {
    if (!active) return;
    setStatus({ kind: "checking" });
    try {
      const res = await fetch("/api/ai/writing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, taskPrompt: active.prompt, feedbackLang: locale }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const code =
          res.status === 401 ? "errAuth"
          : d.error === "daily_limit" ? "errDaily"
          : d.error === "monthly_limit" ? "errMonthly"
          : res.status === 503 ? "errUnavailable"
          : "errGeneric";
        setStatus({ kind: "error", code });
        return;
      }
      const d = (await res.json()) as { review: WritingReview; meta: { usedToday: number } };
      setStatus({ kind: "review", review: d.review, usedToday: d.meta.usedToday });
      if (d.review.valid) {
        setDoneIds((s) => new Set(s).add(active.id));
        // XP once per writing task — only for a genuinely reviewed text
        void awardXp("writing_test", XP.WRITING_TEST, { dedupKey: `writing:${active.id}`, metadata: { taskId: active.id, level: active.level, score: d.review.score_total_25 } });
      }
    } catch {
      setStatus({ kind: "error", code: "errGeneric" });
    }
  }

  if (!active) {
    return (
      <div>
        <SectionBack />
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

  const review = status.kind === "review" ? status.review : null;

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

        {(status.kind === "editing" || status.kind === "error" || status.kind === "checking") && (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={9}
              disabled={status.kind === "checking"}
              placeholder={c.placeholder}
              className="mt-4 w-full resize-y rounded-2xl border border-black/[0.1] bg-white p-4 text-sm leading-relaxed outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15 disabled:opacity-60"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className={`text-xs ${words >= active.minWords ? "text-[#16a34a]" : "text-[var(--color-muted)]"}`}>
                {words} / {active.minWords} {c.words} ({c.minWords})
              </span>
              <button
                type="button"
                disabled={text.trim().length < 20 || status.kind === "checking"}
                onClick={submit}
                className="btn-primary rounded-full px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                {c.submit}
              </button>
            </div>

            {status.kind === "checking" && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-[var(--color-brand)]/[0.06] px-4 py-3 text-sm text-[var(--color-foreground)]">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
                {c.checking}
              </div>
            )}
            {status.kind === "error" && (
              <div className="mt-4 rounded-xl bg-[#d97706]/10 px-4 py-3 text-sm text-[#92400e]">
                <p>{c[status.code]}</p>
                {/* every error offers a way forward (P0-5); text stays in the box, submit = retry */}
                <div className="mt-2">
                  {status.code === "errAuth" ? (
                    <a href="/login" className="inline-block rounded-full bg-[#92400e] px-4 py-1.5 text-xs font-semibold text-white">
                      {pick(locale, { ru: "Войти", en: "Sign in", tr: "Giriş yap", kk: "Кіру" })}
                    </a>
                  ) : status.code === "errDaily" || status.code === "errMonthly" ? (
                    <a href="/dashboard" className="inline-block rounded-full bg-[#92400e] px-4 py-1.5 text-xs font-semibold text-white">
                      {pick(locale, { ru: "К плану дня", en: "To today's plan", tr: "Günün planına", kk: "Күн жоспарына" })}
                    </a>
                  ) : (
                    <p className="text-xs opacity-80">
                      {pick(locale, {
                        ru: "Текст сохранён в поле — нажми «Отправить» ещё раз.",
                        en: "Your text is still in the box — press submit again.",
                        tr: "Metnin kutuda duruyor — tekrar gönder.",
                        kk: "Мәтінің өрісте тұр — қайта жібер.",
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {review && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-[var(--color-foreground)]">{c.result}</h3>

            {!review.valid ? (
              <div className="rounded-xl bg-[#d97706]/10 px-4 py-3 text-sm text-[#92400e]">
                <b>{c.invalid}:</b> {review.invalid_reason}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)]/10 px-4 py-2 text-sm">
                    <span className="text-[var(--color-muted)]">{c.score}:</span>
                    <span className="font-bold text-[var(--color-brand)]">{review.score_total_25}/25</span>
                  </span>
                  {(["task", "coherence", "grammar", "vocab"] as const).map((k) => (
                    <span key={k} className="rounded-full bg-black/[0.04] px-3 py-1.5 text-xs text-[var(--color-foreground)]">
                      {c.sub[k]} · {review.subscores[k]}/{{ task: 7, coherence: 6, grammar: 7, vocab: 5 }[k]}
                    </span>
                  ))}
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#d97706]">{c.errors}</div>
                  {review.errors.length === 0 ? (
                    <p className="mt-2 text-sm text-[#16a34a]">{c.noErrors}</p>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-2.5">
                      {review.errors.map((e, i) => (
                        <li key={i} className="rounded-xl bg-black/[0.03] p-3.5 text-sm">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-[#dc2626]/10 px-2 py-0.5 font-medium text-[#b91c1c] line-through decoration-[#dc2626]/50">{e.quote}</span>
                            <span aria-hidden>→</span>
                            <span className="rounded bg-[#16a34a]/10 px-2 py-0.5 font-medium text-[#15803d]">{e.correction}</span>
                            {e.severity === "minor" && <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] text-[var(--color-muted)]">minor</span>}
                          </div>
                          <div className="mt-1.5 text-[var(--color-foreground)]"><b>{c.rule}:</b> {e.rule}</div>
                          <div className="mt-0.5 text-[var(--color-muted)]">{e.explanation}</div>
                          {e.kk_parallel && (
                            <div className="mt-1.5 rounded-lg bg-[var(--color-brand-2)]/[0.08] px-2.5 py-1.5 text-xs text-[var(--color-foreground)]">
                              🇰🇿 <b>{c.kkParallel}:</b> {e.kk_parallel}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {review.corrected_text && (
                  <div className="rounded-xl bg-[var(--color-brand-2)]/[0.06] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-2)]">{c.corrected}</div>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-foreground)]">{review.corrected_text}</p>
                  </div>
                )}

                {active.sampleAnswer && (
                  <div className="rounded-xl bg-[var(--color-brand)]/[0.05] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)]">{c.sample}</div>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-foreground)]">{active.sampleAnswer}</p>
                  </div>
                )}

                {review.advice.length > 0 && (
                  <div className="rounded-xl bg-[var(--color-brand)]/[0.05] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)]">{c.reco}</div>
                    <ul className="mt-2 flex flex-col gap-1 text-sm text-[var(--color-foreground)]">
                      {review.advice.map((a, i) => (
                        <li key={i}>• {a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-[var(--color-muted)]">{c.left}: {Math.max(0, 3 - (status.kind === "review" ? status.usedToday : 0))}/3</p>
              </>
            )}

            <button type="button" onClick={() => setStatus({ kind: "editing" })} className="btn-ghost w-fit rounded-full px-5 py-2.5 text-sm font-medium">
              {review.valid ? c.again : c.retry}
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
