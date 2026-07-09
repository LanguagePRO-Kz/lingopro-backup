"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { LISTENING_TASKS } from "@/data/listening-tasks";
import AUDIO_MANIFEST from "@/data/listening-audio.json";
import { shuffleQuestionMap } from "@/lib/shuffle";
import { awardXp, XP } from "@/lib/xp";
import type { Level, ReadingTask } from "@/data/types";
import { SectionBack } from "@/components/SectionBack";
import { SectionHint } from "@/components/SectionHint";

type Shuffled = Record<string, { options: string[]; answer: number }>;

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

// real studio audio (ElevenLabs, generated once into public/audio/listening);
// tasks missing from the manifest keep the Web Speech fallback until the
// bank generation catches up
const AUDIO: Record<string, string> = AUDIO_MANIFEST as Record<string, string>;

function speakSeq(lines: string[], onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  lines.forEach((line, i) => {
    const u = new SpeechSynthesisUtterance(line);
    u.lang = "tr-TR";
    u.rate = 0.9;
    if (i === lines.length - 1 && onEnd) u.onend = onEnd;
    window.speechSynthesis.speak(u);
  });
}

const T = {
  ru: { title: "Тренировка аудирования", sub: "Слушай турецкую речь и отвечай на вопросы", back: "К списку", play: "Прослушать", playing: "Воспроизведение…", showText: "Показать текст", hideText: "Скрыть текст", correct: "Верно!", wrong: "Неверно", answer: "Правильный ответ", explanation: "Объяснение", questions: "вопросов", done: "пройдено", all: "Все", unfinished: "Непройденные", allLevels: "Все уровни", empty: "Нет записей по выбранным фильтрам." },
  en: { title: "Listening practice", sub: "Listen to Turkish speech and answer", back: "To list", play: "Play audio", playing: "Playing…", showText: "Show transcript", hideText: "Hide transcript", correct: "Correct!", wrong: "Wrong", answer: "Correct answer", explanation: "Explanation", questions: "questions", done: "done", all: "All", unfinished: "Unfinished", allLevels: "All levels", empty: "No recordings match the selected filters." },
  tr: { title: "Dinleme pratiği", sub: "Türkçe dinle ve soruları cevapla", back: "Listeye dön", play: "Dinle", playing: "Çalıyor…", showText: "Metni göster", hideText: "Metni gizle", correct: "Doğru!", wrong: "Yanlış", answer: "Doğru cevap", explanation: "Açıklama", questions: "soru", done: "tamamlandı", all: "Tümü", unfinished: "Tamamlanmamış", allLevels: "Tüm seviyeler", empty: "Seçilen filtrelere uygun kayıt yok." },
  kk: { title: "Тыңдалым жаттығуы", sub: "Түрік тілін тыңда да жауап бер", back: "Тізімге", play: "Тыңдау", playing: "Ойнатылуда…", showText: "Мәтінді көрсету", hideText: "Мәтінді жасыру", correct: "Дұрыс!", wrong: "Қате", answer: "Дұрыс жауап", explanation: "Түсіндірме", questions: "сұрақ", done: "орындалды", all: "Барлығы", unfinished: "Орындалмаған", allLevels: "Барлық деңгей", empty: "Таңдалған сүзгілерге сай жазба жоқ." },
};

export default function ListeningPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [level, setLevel] = useState<Level | "all">("all");
  const [onlyUnfinished, setOnlyUnfinished] = useState(false);
  const [active, setActive] = useState<ReadingTask | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const shuffled = useMemo(() => shuffleQuestionMap(LISTENING_TASKS.flatMap((t) => t.questions)), []);

  const isDone = useMemo(
    () => (t: ReadingTask) => t.questions.every((q) => answers[q.id] === shuffled[q.id].answer),
    [answers, shuffled],
  );
  const doneCount = useMemo(() => LISTENING_TASKS.filter(isDone).length, [isDone]);

  // award XP once per listening exercise the first time it's fully answered correctly
  const awarded = useRef<Set<string>>(new Set());
  useEffect(() => {
    for (const t of LISTENING_TASKS) {
      if (!awarded.current.has(t.id) && isDone(t)) {
        awarded.current.add(t.id);
        void awardXp("listening_test", XP.LISTENING_TEST, { dedupKey: `listening:${t.id}`, metadata: { taskId: t.id, level: t.level } });
      }
    }
  }, [isDone]);

  const list = useMemo(
    () =>
      LISTENING_TASKS.filter((t) => {
        const byLevel = level === "all" || t.level === level;
        const byStatus = !onlyUnfinished || !isDone(t);
        return byLevel && byStatus;
      }),
    [level, onlyUnfinished, isDone],
  );

  if (active) return <Player ex={active} c={c} answers={answers} setAnswers={setAnswers} shuffled={shuffled} onBack={() => setActive(null)} />;

  return (
    <div>
      <SectionBack />
      <SectionHint id="listening" />
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{c.sub}</p>
      <div className="mt-2 text-sm text-[var(--color-muted)]">
        <span className="font-semibold text-[var(--color-brand)]">{doneCount}</span> / {LISTENING_TASKS.length} {c.done}
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
        {list.map((e) => (
          <button key={e.id} type="button" onClick={() => setActive(e)} className="glass flex items-center justify-between rounded-2xl p-4 text-left transition-shadow hover:shadow-md">
            <span className="flex items-center gap-3">
              <span className="text-lg">{isDone(e) ? "✅" : "🎧"}</span>
              <span className="text-sm font-medium text-[var(--color-foreground)]">{e.title}</span>
            </span>
            <span className="text-xs text-[var(--color-muted)]">{e.level} · {e.questions.length} {c.questions}</span>
          </button>
        ))}
        {list.length === 0 && <div className="rounded-2xl border border-black/[0.07] bg-white/60 px-5 py-8 text-center text-sm text-[var(--color-muted)]">{c.empty}</div>}
      </div>
    </div>
  );
}

function Player({ ex, c, answers, setAnswers, shuffled, onBack }: { ex: ReadingTask; c: (typeof T)["ru"]; answers: Record<string, number>; setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>; shuffled: Shuffled; onBack: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [showText, setShowText] = useState(false);
  const mounted = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lines = useMemo(() => ex.text.split("\n").filter(Boolean), [ex.text]);
  const audioSrc = AUDIO[ex.id] ?? null;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
    };
  }, []);

  function play() {
    if (audioSrc) {
      // real recording: role voices + natural pauses, replayable freely
      if (!audioRef.current) {
        audioRef.current = new Audio(audioSrc);
        audioRef.current.onended = () => mounted.current && setPlaying(false);
        audioRef.current.onerror = () => {
          // missing/broken file → honest Web Speech fallback, not silence
          if (!mounted.current) return;
          audioRef.current = null;
          speakSeq(lines, () => mounted.current && setPlaying(false));
        };
      }
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        setPlaying(true);
        void audioRef.current.play();
      }
      return;
    }
    setPlaying(true);
    speakSeq(lines, () => mounted.current && setPlaying(false));
  }

  return (
    <div>
      <button type="button" onClick={onBack} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">← {c.back}</button>

      <div className="glass mt-4 rounded-3xl p-6 text-center">
        <h2 className="text-lg font-bold text-[var(--color-foreground)]">🎧 {ex.title}</h2>
        <button
          type="button"
          onClick={play}
          className="mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-2xl text-white shadow-[0_12px_40px_-8px_rgba(109,91,255,0.6)] transition-transform active:scale-95"
        >
          {playing ? "⏸" : "▶"}
        </button>
        <div className="mt-3 text-xs text-[var(--color-muted)]">{playing ? c.playing : c.play}</div>

        <button type="button" onClick={() => setShowText((s) => !s)} className="mt-3 text-xs font-medium text-[var(--color-brand)] hover:underline">
          {showText ? c.hideText : c.showText}
        </button>
        {showText && (
          <div className="mt-2 rounded-xl bg-black/[0.03] p-3 text-left text-sm leading-relaxed text-[var(--color-foreground)]">
            {lines.map((l, i) => <p key={i}>{l}</p>)}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {ex.questions.map((q) => {
          const sel = answers[q.id];
          const answered = sel !== undefined;
          return (
            <div key={q.id} className="glass rounded-2xl p-5">
              <div className="text-sm font-semibold text-[var(--color-foreground)]">{q.question}</div>
              <div className="mt-3 grid gap-2">
                {shuffled[q.id].options.map((opt, oi) => {
                  let cls = "border-black/[0.08] bg-black/[0.02] text-[var(--color-foreground)] hover:border-black/[0.16]";
                  if (answered && oi === shuffled[q.id].answer) cls = "border-[#16a34a] bg-[#16a34a]/[0.08]";
                  else if (answered && oi === sel) cls = "border-[#dc2626] bg-[#dc2626]/[0.06]";
                  return (
                    <button key={oi} type="button" disabled={answered} onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))} className={`rounded-xl border px-4 py-2.5 text-left text-sm transition-all disabled:cursor-default ${cls}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs">
                  <div className="font-medium">
                    {sel === shuffled[q.id].answer ? <span className="text-[#16a34a]">✅ {c.correct}</span> : <span className="text-[#dc2626]">❌ {c.wrong} · {c.answer}: {shuffled[q.id].options[shuffled[q.id].answer]}</span>}
                  </div>
                  <p className="mt-1 leading-relaxed text-[var(--color-muted)]">{q.explanation}</p>
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
