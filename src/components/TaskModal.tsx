"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { shuffleOptions } from "@/lib/shuffle";
import { useTTS } from "@/hooks/useTTS";
import type { Question, VocabWord } from "@/data/types";
import { SKILL_META, skillLabel, type DailyTask } from "@/lib/daily-plan";
import { resolveTaskContent, type TaskContent } from "@/lib/task-content";
import { submitAttempt, submitSelfReport, type AttemptSaveStatus } from "@/lib/attempts-client";

type Result = { score: number; maxScore: number; answers: unknown };

const T = {
  ru: {
    question: "Вопрос", of: "из", check: "Проверить", next: "Следующий →", finish: "Завершить",
    correct: "Правильно!", wrong: "Ошибка", explanation: "Объяснение", backToPlan: "Вернуться к плану",
    doneTitle: "Готово!", correctOf: "правильных", closeConfirm: "Прогресс задания не сохранится. Закрыть?",
    showTranslation: "Показать перевод", know: "Знаю ✓", learning: "Учу ✗", example: "Пример",
    vocabResult: "Выучено", onReview: "на повторении",
    attemptSaved: "сохранено", attemptSaving: "сохраняем…", attemptFailed: "не сохранено", attemptRetry: "повторить",
    play: "▶ Прослушать", pause: "⏸ Пауза", again: "🔄 Ещё раз", slower: "🐢 Медленнее",
    listening: "🎧 Слушайте внимательно…", showTranscript: "📝 Показать транскрипт", hideTranscript: "📝 Скрыть транскрипт",
    ttsUnsupported: "⚠️ Ваш браузер не поддерживает озвучку. Откройте в Chrome для аудио.",
    voiceSoon: "🎤 Голосовой ввод скоро — напиши ответ текстом", send: "Отправить", saved: "Сохранено! AI проверит.",
    words: "слов", minWords: "минимум", yourAnswer: "Твой ответ", submitEssay: "Отправить сочинение",
  },
  en: {
    question: "Question", of: "of", check: "Check", next: "Next →", finish: "Finish",
    correct: "Correct!", wrong: "Wrong", explanation: "Explanation", backToPlan: "Back to plan",
    doneTitle: "Done!", correctOf: "correct", closeConfirm: "Your progress won't be saved. Close?",
    showTranslation: "Show translation", know: "Know ✓", learning: "Learning ✗", example: "Example",
    vocabResult: "Learned", onReview: "to review",
    attemptSaved: "saved", attemptSaving: "saving…", attemptFailed: "not saved", attemptRetry: "retry",
    play: "▶ Play", pause: "⏸ Pause", again: "🔄 Again", slower: "🐢 Slower",
    listening: "🎧 Listen carefully…", showTranscript: "📝 Show transcript", hideTranscript: "📝 Hide transcript",
    ttsUnsupported: "⚠️ Your browser doesn't support audio. Open in Chrome for sound.",
    voiceSoon: "🎤 Voice input coming soon — type your answer", send: "Submit", saved: "Saved! AI will review it.",
    words: "words", minWords: "minimum", yourAnswer: "Your answer", submitEssay: "Submit essay",
  },
  tr: {
    question: "Soru", of: "/", check: "Kontrol et", next: "Sonraki →", finish: "Bitir",
    correct: "Doğru!", wrong: "Yanlış", explanation: "Açıklama", backToPlan: "Plana dön",
    doneTitle: "Tamam!", correctOf: "doğru", closeConfirm: "İlerlemen kaydedilmeyecek. Kapatılsın mı?",
    showTranslation: "Çeviriyi göster", know: "Biliyorum ✓", learning: "Öğreniyorum ✗", example: "Örnek",
    vocabResult: "Öğrenildi", onReview: "tekrar için",
    attemptSaved: "kaydedildi", attemptSaving: "kaydediliyor…", attemptFailed: "kaydedilmedi", attemptRetry: "tekrar dene",
    play: "▶ Dinle", pause: "⏸ Duraklat", again: "🔄 Tekrar", slower: "🐢 Daha yavaş",
    listening: "🎧 Dikkatle dinle…", showTranscript: "📝 Metni göster", hideTranscript: "📝 Metni gizle",
    ttsUnsupported: "⚠️ Tarayıcın sesi desteklemiyor. Ses için Chrome'da aç.",
    voiceSoon: "🎤 Sesli giriş yakında — cevabını yaz", send: "Gönder", saved: "Kaydedildi! AI değerlendirecek.",
    words: "kelime", minWords: "en az", yourAnswer: "Cevabın", submitEssay: "Kompozisyonu gönder",
  },
  kk: {
    question: "Сұрақ", of: "/", check: "Тексеру", next: "Келесі →", finish: "Аяқтау",
    correct: "Дұрыс!", wrong: "Қате", explanation: "Түсіндірме", backToPlan: "Жоспарға оралу",
    doneTitle: "Дайын!", correctOf: "дұрыс", closeConfirm: "Прогресс сақталмайды. Жабылсын ба?",
    showTranslation: "Аударманы көрсету", know: "Білемін ✓", learning: "Үйренемін ✗", example: "Мысал",
    vocabResult: "Үйренілді", onReview: "қайталауға",
    attemptSaved: "сақталды", attemptSaving: "сақталуда…", attemptFailed: "сақталмады", attemptRetry: "қайталау",
    play: "▶ Тыңдау", pause: "⏸ Кідірту", again: "🔄 Қайта", slower: "🐢 Баяуырақ",
    listening: "🎧 Мұқият тыңда…", showTranscript: "📝 Транскриптті көрсету", hideTranscript: "📝 Транскриптті жасыру",
    ttsUnsupported: "⚠️ Браузерің дыбысты қолдамайды. Дыбыс үшін Chrome-да аш.",
    voiceSoon: "🎤 Дауыспен енгізу жақында — жауабыңды жаз", send: "Жіберу", saved: "Сақталды! AI тексереді.",
    words: "сөз", minWords: "кемінде", yourAnswer: "Жауабың", submitEssay: "Шығарманы жіберу",
  },
};

function TaskModalInner({
  task,
  onComplete,
  onClose,
}: {
  task: DailyTask;
  onComplete: (r: Result) => void;
  onClose: () => void;
}) {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const meta = SKILL_META[task.skill];

  // heavy question banks are loaded on demand for this one task only
  const [content, setContent] = useState<TaskContent | null>(null);
  useEffect(() => {
    let active = true;
    resolveTaskContent(task).then((res) => active && setContent(res));
    return () => {
      active = false;
    };
  }, [task]);

  function requestClose() {
    if (window.confirm(c.closeConfirm)) onClose();
  }

  function renderFlow(cnt: TaskContent) {
    switch (cnt.skill) {
      case "grammar":
      case "reading":
      case "listening":
        return <MCFlow content={cnt} c={c} onComplete={onComplete} />;
      case "vocabulary":
        return <VocabFlow content={cnt} c={c} onComplete={onComplete} />;
      case "writing":
        return <WritingFlow content={cnt} c={c} onComplete={onComplete} />;
      case "speaking":
        return <SpeakingFlow content={cnt} c={c} onComplete={onComplete} />;
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-[var(--color-navy)]/40 backdrop-blur-sm" onClick={requestClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex max-h-[100vh] w-full max-w-[700px] flex-col overflow-hidden rounded-t-3xl bg-white sm:max-h-[90vh] sm:rounded-3xl"
      >
        {/* header */}
        <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ background: `${meta.color}1a`, color: meta.color }}>
            {meta.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-[var(--color-foreground)]">{skillLabel(task.skill, locale)}</div>
            <div className="text-xs text-[var(--color-muted)]">{task.level}</div>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-[var(--color-muted)] transition-colors hover:bg-black/[0.08]"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {!content ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-7 w-7 animate-spin-slow rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
            </div>
          ) : (
            renderFlow(content)
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export const TaskModal = memo(TaskModalInner);

type C = (typeof T)["ru"];

/* ------------------------- Grammar / Reading / Listening ------------------ */
type Step = { q: Question; options: string[]; answer: number; listen?: boolean; title?: string; text?: string };

type MCContent = Extract<TaskContent, { skill: "grammar" | "reading" | "listening" }>;

function MCFlow({ content, c, onComplete }: { content: MCContent; c: C; onComplete: (r: Result) => void }) {
  const steps = useMemo<Step[]>(() => {
    // shuffle each question's options once (stable while the modal is open)
    const mk = (q: Question, extra?: Partial<Step>): Step => {
      const { shuffled, newCorrectIndex } = shuffleOptions(q.options, q.correctAnswer);
      return { q, options: shuffled, answer: newCorrectIndex, ...extra };
    };
    if (content.skill === "grammar") return content.questions.map((q) => mk(q));
    const listen = content.skill === "listening";
    const out: Step[] = [];
    for (const t of content.tasks) {
      for (const q of t.questions.slice(0, 5)) out.push(mk(q, { listen, title: t.title, text: t.text }));
    }
    return out;
  }, [content]);

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  // сохранение ответа в attempts: честный статус на текущем шаге + ретрай
  const [save, setSave] = useState<{ status: AttemptSaveStatus; attemptId: string; original: number } | null>(null);

  if (!steps.length) {
    // no content resolved → let the student mark it done anyway
    return <EmptyDone c={c} onComplete={() => onComplete({ score: 0, maxScore: 0, answers: [] })} />;
  }

  if (finished) {
    return (
      <DoneScreen
        c={c}
        line={`${correct}/${steps.length} ${c.correctOf}`}
        onDone={() => onComplete({ score: correct, maxScore: steps.length, answers })}
      />
    );
  }

  const s = steps[step];
  const isLast = step + 1 >= steps.length;

  async function persist(questionId: string, original: number, attemptId: string) {
    setSave({ status: "saving", attemptId, original });
    const ok = await submitAttempt({
      questionId,
      selected: original,
      source: "daily_plan",
      clientAttemptId: attemptId,
    });
    setSave((cur) =>
      cur?.attemptId === attemptId ? { status: ok ? "saved" : "failed", attemptId, original } : cur,
    );
  }

  function check() {
    if (selected === null) return;
    setChecked(true);
    if (selected === s.answer) setCorrect((n) => n + 1);
    setAnswers((a) => [...a, selected]);
    // по-вопросная запись в attempts (перетасованный индекс → оригинальный)
    const original = s.q.options.indexOf(s.options[selected]);
    void persist(s.q.id, original, crypto.randomUUID());
  }
  function next() {
    setSave(null);
    if (isLast) setFinished(true);
    else {
      setStep((n) => n + 1);
      setSelected(null);
      setChecked(false);
    }
  }

  return (
    <div>
      <ProgressLine label={`${c.question} ${step + 1} ${c.of} ${steps.length}`} value={(step + 1) / steps.length} />

      {s.text && s.title && (
        s.listen ? (
          <AudioBlock key={s.title} text={s.text} title={s.title} c={c} />
        ) : (
          <div className="mt-4 max-h-48 overflow-y-auto rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4">
            <div className="text-sm font-semibold text-[var(--color-foreground)]">{s.title}</div>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-foreground)]">{s.text}</p>
          </div>
        )
      )}

      <h3 className="mt-4 text-base font-semibold text-[var(--color-foreground)]">{s.q.question}</h3>

      <div className="mt-4 grid gap-2.5">
        {s.options.map((opt, i) => {
          let cls = "border-black/[0.08] bg-white hover:border-black/[0.18]";
          if (checked) {
            if (i === s.answer) cls = "border-[#16a34a] bg-[#16a34a]/[0.1]";
            else if (i === selected) cls = "border-[#dc2626] bg-[#dc2626]/[0.08]";
            else cls = "border-black/[0.06] bg-white opacity-60";
          } else if (i === selected) {
            cls = "border-[var(--color-brand)] bg-[var(--color-brand)]/[0.08]";
          }
          return (
            <button
              key={i}
              type="button"
              disabled={checked}
              onClick={() => setSelected(i)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm text-[var(--color-foreground)] transition-all ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4">
            <div className={`text-sm font-bold ${selected === s.answer ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
              {selected === s.answer ? `✅ ${c.correct}` : `❌ ${c.wrong}`}
            </div>
            <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{c.explanation}</div>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-foreground)]">{s.q.explanation}</p>
            {/* честный статус сохранения ответа: несохранённое не «есть» */}
            <div className="mt-2 text-[11px]">
              {save?.status === "saved" && <span className="text-[#16a34a]">✓ {c.attemptSaved}</span>}
              {save?.status === "saving" && <span className="text-[var(--color-muted)]">{c.attemptSaving}</span>}
              {save?.status === "failed" && (
                <span className="text-[#dc2626]">
                  ⚠️ {c.attemptFailed}{" "}
                  <button
                    type="button"
                    onClick={() => save && void persist(s.q.id, save.original, save.attemptId)}
                    className="font-semibold underline underline-offset-2"
                  >
                    {c.attemptRetry}
                  </button>
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5">
        {!checked ? (
          <button type="button" disabled={selected === null} onClick={check} className="btn-primary w-full rounded-full px-6 py-3.5 text-sm disabled:opacity-40">
            {c.check}
          </button>
        ) : (
          <button type="button" onClick={next} className="btn-primary w-full rounded-full px-6 py-3.5 text-sm">
            {isLast ? c.finish : c.next}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------- Listening audio ---------------------------- */
function AudioBlock({ text, title, c }: { text: string; title: string; c: C }) {
  const { speak, stop, isSpeaking, isSupported } = useTTS();
  const [showTranscript, setShowTranscript] = useState(false);
  const [hasListened, setHasListened] = useState(false);

  return (
    <div className="mt-4 rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4">
      <div className="text-sm font-semibold text-[var(--color-foreground)]">{title}</div>

      {isSupported ? (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (isSpeaking) stop();
                else {
                  speak(text);
                  setHasListened(true);
                }
              }}
              className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              {isSpeaking ? c.pause : c.play}
            </button>
            {hasListened && (
              <button type="button" onClick={() => speak(text)} className="rounded-lg border border-black/[0.1] px-3 py-2 text-sm text-[var(--color-foreground)] hover:bg-black/[0.03]">
                {c.again}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                speak(text, 0.6);
                setHasListened(true);
              }}
              className="rounded-lg border border-black/[0.1] px-3 py-2 text-sm text-[var(--color-foreground)] hover:bg-black/[0.03]"
            >
              {c.slower}
            </button>
          </div>

          {isSpeaking && <p className="mt-2 animate-pulse text-sm text-[var(--color-brand)]">{c.listening}</p>}

          <button
            type="button"
            onClick={() => setShowTranscript((v) => !v)}
            className="mt-2 text-xs text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
          >
            {showTranscript ? c.hideTranscript : c.showTranscript}
          </button>
          {showTranscript && (
            <p className="mt-2 whitespace-pre-line rounded-xl border border-black/[0.06] bg-white p-3 text-sm leading-relaxed text-[var(--color-foreground)]">
              {text}
            </p>
          )}
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#d97706]">{c.ttsUnsupported}</p>
          <p className="mt-2 whitespace-pre-line rounded-xl border border-black/[0.06] bg-white p-3 text-sm leading-relaxed text-[var(--color-foreground)]">
            {text}
          </p>
        </>
      )}
    </div>
  );
}

/* ------------------------------- Vocabulary ------------------------------ */
function VocabFlow({ content, c, onComplete }: { content: Extract<TaskContent, { skill: "vocabulary" }>; c: C; onComplete: (r: Result) => void }) {
  const initial = content.words;
  const [queue, setQueue] = useState<VocabWord[]>(initial);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);
  const [review, setReview] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!initial.length) return <EmptyDone c={c} onComplete={() => onComplete({ score: 0, maxScore: 0, answers: [] })} />;

  if (finished) {
    return (
      <DoneScreen
        c={c}
        line={`${c.vocabResult}: ${known}/${initial.length} · ${review} ${c.onReview}`}
        onDone={() => onComplete({ score: known, maxScore: initial.length, answers: { known, review } })}
      />
    );
  }

  const w = queue[idx];
  const total = initial.length;

  function answer(isKnown: boolean) {
    // самооценка → attempts с is_self_reported = true (в mastery не входит)
    void submitSelfReport({
      itemId: w.word,
      known: isKnown,
      source: "daily_plan",
      clientAttemptId: crypto.randomUUID(),
    });
    if (isKnown) setKnown((n) => n + 1);
    else {
      setReview((n) => n + 1);
      setQueue((q) => [...q, w]); // requeue "learning" words
    }
    const nextIdx = idx + 1;
    setRevealed(false);
    if (nextIdx >= queue.length) setFinished(true);
    else setIdx(nextIdx);
  }

  return (
    <div>
      <ProgressLine label={`${Math.min(idx + 1, total)} ${c.of} ${total}`} value={Math.min((idx + 1) / total, 1)} />

      <div className="mt-6 flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-black/[0.06] bg-black/[0.02] p-6 text-center">
        <div className="text-3xl font-bold text-[var(--color-foreground)]">{w.word}</div>
        <AnimatePresence>
          {revealed && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <div className="text-lg font-semibold text-[var(--color-brand)]">{w.translation}</div>
              {w.example && (
                <div className="mt-3 rounded-xl bg-white px-4 py-2 text-sm text-[var(--color-foreground)]">
                  <span className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">{c.example}</span>
                  <div className="mt-0.5">{w.example}</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!revealed ? (
        <button type="button" onClick={() => setRevealed(true)} className="btn-primary mt-5 w-full rounded-full px-6 py-3.5 text-sm">
          {c.showTranslation}
        </button>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => answer(true)} className="rounded-full bg-[#16a34a] px-6 py-3.5 text-sm font-semibold text-white transition-transform active:scale-95">
            {c.know}
          </button>
          <button type="button" onClick={() => answer(false)} className="rounded-full bg-[#dc2626] px-6 py-3.5 text-sm font-semibold text-white transition-transform active:scale-95">
            {c.learning}
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------- Writing -------------------------------- */
function WritingFlow({ content, c, onComplete }: { content: Extract<TaskContent, { skill: "writing" }>; c: C; onComplete: (r: Result) => void }) {
  const wt = content.task;
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  if (!wt) return <EmptyDone c={c} onComplete={() => onComplete({ score: 0, maxScore: 0, answers: [] })} />;

  const min = wt.minWords || 40;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  if (sent) {
    return <DoneScreen c={c} line={c.saved} onDone={() => onComplete({ score: 1, maxScore: 1, answers: text })} />;
  }

  return (
    <div>
      <h3 className="text-base font-semibold text-[var(--color-foreground)]">{wt.prompt}</h3>
      <p className="mt-1.5 text-sm text-[var(--color-muted)]">{wt.promptRu}</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={9}
        placeholder={c.yourAnswer}
        className="mt-4 w-full resize-y rounded-2xl border border-black/[0.08] bg-white p-4 text-sm leading-relaxed text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
      />
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={words >= min ? "font-medium text-[#16a34a]" : "text-[var(--color-muted)]"}>
          {words} {c.words}
        </span>
        <span className="text-[var(--color-muted)]">{c.minWords}: {min}</span>
      </div>

      <button
        type="button"
        disabled={words < min}
        onClick={() => setSent(true)}
        className="btn-primary mt-4 w-full rounded-full px-6 py-3.5 text-sm disabled:opacity-40"
      >
        {c.submitEssay}
      </button>
    </div>
  );
}

/* -------------------------------- Speaking ------------------------------- */
function SpeakingFlow({ content, c, onComplete }: { content: Extract<TaskContent, { skill: "speaking" }>; c: C; onComplete: (r: Result) => void }) {
  const st = content.task;
  const parts = useMemo(() => (st ? st.parts : []), [st]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [finished, setFinished] = useState(false);

  if (!st || !parts.length) return <EmptyDone c={c} onComplete={() => onComplete({ score: 0, maxScore: 0, answers: [] })} />;

  if (finished) {
    return (
      <DoneScreen c={c} line={c.saved} onDone={() => onComplete({ score: answers.length, maxScore: parts.length, answers })} />
    );
  }

  const part = parts[idx];
  const isLast = idx + 1 >= parts.length;

  function next() {
    const all = [...answers, text];
    setAnswers(all);
    setText("");
    if (isLast) setFinished(true);
    else setIdx((n) => n + 1);
  }

  return (
    <div>
      <ProgressLine label={`${c.question} ${idx + 1} ${c.of} ${parts.length}`} value={(idx + 1) / parts.length} />
      <div className="mt-2 text-xs font-medium text-[var(--color-muted)]">{c.voiceSoon}</div>

      <h3 className="mt-4 text-base font-semibold text-[var(--color-foreground)]">{part.instruction}</h3>
      <p className="mt-1.5 text-sm text-[var(--color-muted)]">{part.instructionRu}</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={c.yourAnswer}
        className="mt-4 w-full resize-y rounded-2xl border border-black/[0.08] bg-white p-4 text-sm leading-relaxed text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
      />

      <button type="button" onClick={next} className="btn-primary mt-4 w-full rounded-full px-6 py-3.5 text-sm">
        {isLast ? c.finish : c.next}
      </button>
    </div>
  );
}

/* ------------------------------- Shared UI ------------------------------- */
function ProgressLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium text-[var(--color-muted)]">{label}</div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
          animate={{ width: `${Math.round(value * 100)}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}

function DoneScreen({ c, line, onDone }: { c: C; line: string; onDone: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#16a34a]/15 text-4xl">🎉</div>
      <h3 className="mt-4 text-xl font-bold tracking-tight">{c.doneTitle}</h3>
      <p className="mt-1.5 text-sm text-[var(--color-muted)]">{line}</p>
      <button type="button" onClick={onDone} className="btn-primary mt-6 rounded-full px-8 py-3.5 text-sm">
        {c.backToPlan}
      </button>
    </motion.div>
  );
}

function EmptyDone({ c, onComplete }: { c: C; onComplete: () => void }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <p className="text-sm text-[var(--color-muted)]">—</p>
      <button type="button" onClick={onComplete} className="btn-primary mt-4 rounded-full px-8 py-3.5 text-sm">
        {c.backToPlan}
      </button>
    </div>
  );
}
