"use client";

/**
 * Чтение (Фаза 1 P0-ядра): каждый ответ немедленно уходит в attempts через
 * POST /api/attempts (правильность судит сервер); шапка показывает точность
 * и число ответов из ТОГО ЖЕ источника. Чек-лист «X/60 пройдено» удалён.
 * Галочка текста = все его вопросы когда-либо отвечены верно (история) или
 * верно в текущей сессии. Сбой сохранения виден честно, с ретраем.
 */

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { READING_TASKS } from "@/data/reading-tasks";
import { shuffleOptions } from "@/lib/shuffle";
import { awardXp, XP } from "@/lib/xp";
import { submitAttempt, type AttemptSaveStatus } from "@/lib/attempts-client";
import { useSkillStats } from "@/lib/hooks/useSkillStats";
import type { Level, ReadingTask } from "@/data/types";
import { SectionBack } from "@/components/SectionBack";
import { SectionHint } from "@/components/SectionHint";

type Shuffled = Record<string, { options: string[]; answer: number }>;
function buildShuffled(tasks: ReadingTask[]): Shuffled {
  const m: Shuffled = {};
  for (const t of tasks) for (const q of t.questions) {
    const s = shuffleOptions(q.options, q.correctAnswer);
    m[q.id] = { options: s.shuffled, answer: s.newCorrectIndex };
  }
  return m;
}

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

const T = {
  ru: { title: "Тренировка чтения", back: "К текстам", correct: "Верно!", wrong: "Неверно", answer: "Правильный ответ", explanation: "Объяснение", questions: "вопросов", accuracy: "Точность", answered: "отвечено", accuracyHint: "по ответам за 90 дней", noData: "—", saved: "сохранено", saving: "сохраняем…", saveFailed: "не сохранено", retry: "повторить", synonyms: "Синонимы", all: "Все", unfinished: "Непройденные", allLevels: "Все уровни", empty: "Нет текстов по выбранным фильтрам." },
  en: { title: "Reading practice", back: "To texts", correct: "Correct!", wrong: "Wrong", answer: "Correct answer", explanation: "Explanation", questions: "questions", accuracy: "Accuracy", answered: "answered", accuracyHint: "answers over 90 days", noData: "—", saved: "saved", saving: "saving…", saveFailed: "not saved", retry: "retry", synonyms: "Synonyms", all: "All", unfinished: "Unfinished", allLevels: "All levels", empty: "No texts match the selected filters." },
  tr: { title: "Okuma pratiği", back: "Metinlere dön", correct: "Doğru!", wrong: "Yanlış", answer: "Doğru cevap", explanation: "Açıklama", questions: "soru", accuracy: "Doğruluk", answered: "cevaplandı", accuracyHint: "son 90 günün cevapları", noData: "—", saved: "kaydedildi", saving: "kaydediliyor…", saveFailed: "kaydedilmedi", retry: "tekrar dene", synonyms: "Eş anlamlılar", all: "Tümü", unfinished: "Tamamlanmamış", allLevels: "Tüm seviyeler", empty: "Seçilen filtrelere uygun metin yok." },
  kk: { title: "Оқу жаттығуы", back: "Мәтіндерге", correct: "Дұрыс!", wrong: "Қате", answer: "Дұрыс жауап", explanation: "Түсіндірме", questions: "сұрақ", accuracy: "Дәлдік", answered: "жауап берілді", accuracyHint: "90 күндегі жауаптар бойынша", noData: "—", saved: "сақталды", saving: "сақталуда…", saveFailed: "сақталмады", retry: "қайталау", synonyms: "Синонимдер", all: "Барлығы", unfinished: "Орындалмаған", allLevels: "Барлық деңгей", empty: "Таңдалған сүзгілерге сай мәтін жоқ." },
};

export default function ReadingPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [level, setLevel] = useState<Level | "all">("all");
  const [onlyUnfinished, setOnlyUnfinished] = useState(false);
  const [active, setActive] = useState<ReadingTask | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const shuffled = useMemo(() => buildShuffled(READING_TASKS), []);
  const { stats, reload } = useSkillStats("reading");

  // текст «пройден» = все вопросы верны в сессии ИЛИ верны когда-либо (история)
  const isDone = useMemo(
    () => (t: ReadingTask) =>
      t.questions.every(
        (q) => answers[q.id] === shuffled[q.id].answer || stats?.correctIds.has(q.id),
      ),
    [answers, shuffled, stats],
  );

  const list = useMemo(
    () =>
      READING_TASKS.filter((t) => {
        const byLevel = level === "all" || t.level === level;
        const byStatus = !onlyUnfinished || !isDone(t);
        return byLevel && byStatus;
      }),
    [level, onlyUnfinished, isDone],
  );

  if (active)
    return (
      <Reader
        text={active}
        c={c}
        answers={answers}
        setAnswers={setAnswers}
        shuffled={shuffled}
        onBack={() => {
          setActive(null);
          void reload();
        }}
      />
    );

  return (
    <div>
      <SectionBack />
      <SectionHint id="reading" />
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-muted)]">
        <span>
          {c.accuracy}:{" "}
          <span className="font-semibold text-[var(--color-brand)]">
            {stats?.accuracy != null ? `${stats.accuracy}%` : c.noData}
          </span>
        </span>
        <span>
          {c.answered}:{" "}
          <span className="font-semibold text-[var(--color-foreground)]">
            {stats?.available ? stats.answered : c.noData}
          </span>
        </span>
      </div>
      <div className="mt-0.5 text-[11px] text-[var(--color-muted)]">{c.accuracyHint}</div>

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
          <button key={t.id} type="button" onClick={() => setActive(t)} className="glass flex items-center justify-between rounded-2xl p-4 text-left transition-shadow hover:shadow-md">
            <span className="flex items-center gap-3">
              <span className="text-lg">{isDone(t) ? "✅" : "📖"}</span>
              <span className="text-sm font-medium text-[var(--color-foreground)]">{t.title}</span>
            </span>
            <span className="text-xs text-[var(--color-muted)]">{t.level} · {t.questions.length} {c.questions}</span>
          </button>
        ))}
        {list.length === 0 && <div className="rounded-2xl border border-black/[0.07] bg-white/60 px-5 py-8 text-center text-sm text-[var(--color-muted)]">{c.empty}</div>}
      </div>
    </div>
  );
}

function Reader({ text, c, answers, setAnswers, shuffled, onBack }: { text: ReadingTask; c: (typeof T)["ru"]; answers: Record<string, number>; setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>; shuffled: Shuffled; onBack: () => void }) {
  // статус сохранения и id клика по каждому вопросу (ретрай шлёт тот же id)
  const [saves, setSaves] = useState<Record<string, { status: AttemptSaveStatus; attemptId: string; original: number }>>({});
  // XP как раньше: один раз за текст, полностью верно отвеченный в сессии
  const [xpAwarded, setXpAwarded] = useState(false);

  async function persist(qid: string, original: number, attemptId: string) {
    setSaves((s) => ({ ...s, [qid]: { status: "saving", attemptId, original } }));
    const ok = await submitAttempt({
      questionId: qid,
      selected: original,
      source: "free_practice",
      clientAttemptId: attemptId,
    });
    setSaves((s) => ({ ...s, [qid]: { status: ok ? "saved" : "failed", attemptId, original } }));
  }

  function answerQuestion(qid: string, oi: number) {
    if (answers[qid] !== undefined) return;
    const next = { ...answers, [qid]: oi };
    setAnswers(next);
    // перетасованный индекс → оригинальный: сервер судит по банку
    const original = text.questions
      .find((q) => q.id === qid)!
      .options.indexOf(shuffled[qid].options[oi]);
    void persist(qid, original, crypto.randomUUID());
    // все вопросы текста верны в этой сессии → XP (как раньше; дедуп по ключу)
    if (!xpAwarded && text.questions.every((q) => next[q.id] === shuffled[q.id].answer)) {
      setXpAwarded(true);
      void awardXp("reading_test", XP.READING_TEST, { dedupKey: `reading:${text.id}`, metadata: { taskId: text.id, level: text.level } });
    }
  }

  return (
    <div>
      <button type="button" onClick={onBack} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">← {c.back}</button>

      <div className="glass mt-4 rounded-3xl p-6">
        <h2 className="text-lg font-bold text-[var(--color-foreground)]">{text.title}</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--color-foreground)]">{text.text}</p>
        {text.synonyms && text.synonyms.length > 0 && (
          <div className="mt-4 rounded-xl bg-black/[0.03] p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-brand-2)]">{c.synonyms}</div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-muted)]">
              {text.synonyms.map((s) => (
                <span key={s.word}>{s.word} → {s.synonym}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {text.questions.map((q) => {
          const sel = answers[q.id];
          const answered = sel !== undefined;
          const save = saves[q.id];
          return (
            <div key={q.id} className="glass rounded-2xl p-5">
              <div className="text-sm font-semibold text-[var(--color-foreground)]">{q.question}</div>
              <div className="mt-3 grid gap-2">
                {shuffled[q.id].options.map((opt, oi) => {
                  let cls = "border-black/[0.08] bg-black/[0.02] text-[var(--color-foreground)] hover:border-black/[0.16]";
                  if (answered && oi === shuffled[q.id].answer) cls = "border-[#16a34a] bg-[#16a34a]/[0.08]";
                  else if (answered && oi === sel) cls = "border-[#dc2626] bg-[#dc2626]/[0.06]";
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={answered}
                      onClick={() => answerQuestion(q.id, oi)}
                      className={`rounded-xl border px-4 py-2.5 text-left text-sm transition-all disabled:cursor-default ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs">
                  <div className="font-medium">
                    {sel === shuffled[q.id].answer ? (
                      <span className="text-[#16a34a]">✅ {c.correct}</span>
                    ) : (
                      <span className="text-[#dc2626]">❌ {c.wrong} · {c.answer}: {shuffled[q.id].options[shuffled[q.id].answer]}</span>
                    )}
                  </div>
                  <p className="mt-1 leading-relaxed text-[var(--color-muted)]">{q.explanation}</p>
                  {/* честный статус сохранения: несохранённое не «есть» */}
                  <div className="mt-1.5">
                    {save?.status === "saved" && <span className="text-[#16a34a]">✓ {c.saved}</span>}
                    {save?.status === "saving" && <span className="text-[var(--color-muted)]">{c.saving}</span>}
                    {save?.status === "failed" && (
                      <span className="text-[#dc2626]">
                        ⚠️ {c.saveFailed}{" "}
                        <button type="button" onClick={() => void persist(q.id, save.original, save.attemptId)} className="font-semibold underline underline-offset-2">
                          {c.retry}
                        </button>
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
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
