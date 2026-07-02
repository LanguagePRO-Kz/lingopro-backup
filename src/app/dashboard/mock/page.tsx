"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { MOCK_EXAMS } from "@/data/mock-exams";
import type { Level, MockExam, Question } from "@/data/types";

const LEVELS: Level[] = ["A2", "B2", "C1"];

const T = {
  ru: {
    title: "Пробные тесты TÖMER", sub: "Полный формат экзамена: Okuma · Dinleme · Yazma · Konuşma",
    done: "пройдено", all: "Все", unfinished: "Непройденные", allLevels: "Все уровни",
    start: "Начать тест", exit: "Выйти", min: "мин",
    okuma: "Чтение", dinleme: "Аудирование", yazma: "Письмо", konusma: "Говорение",
    finishSection: "Завершить раздел →", finishExam: "Завершить тест", transcript: "Транскрипт",
    writeHere: "Напишите ответ на турецком…", words: "слов", minWords: "минимум",
    results: "Результаты теста", overall: "Общий уровень", sectionScore: "Баллы по разделам",
    correctOf: "верных", submitted: "отправлено", notDone: "не выполнено", backToList: "К списку тестов", empty: "Нет тестов по выбранным фильтрам.",
  },
  en: {
    title: "Mock TÖMER tests", sub: "Full exam format: Okuma · Dinleme · Yazma · Konuşma",
    done: "done", all: "All", unfinished: "Unfinished", allLevels: "All levels",
    start: "Start test", exit: "Exit", min: "min",
    okuma: "Reading", dinleme: "Listening", yazma: "Writing", konusma: "Speaking",
    finishSection: "Finish section →", finishExam: "Finish test", transcript: "Transcript",
    writeHere: "Write your answer in Turkish…", words: "words", minWords: "minimum",
    results: "Test results", overall: "Overall level", sectionScore: "Section scores",
    correctOf: "correct", submitted: "submitted", notDone: "not done", backToList: "To test list", empty: "No tests match the selected filters.",
  },
  tr: {
    title: "Deneme TÖMER testleri", sub: "Tam sınav formatı: Okuma · Dinleme · Yazma · Konuşma",
    done: "tamamlandı", all: "Tümü", unfinished: "Tamamlanmamış", allLevels: "Tüm seviyeler",
    start: "Teste başla", exit: "Çık", min: "dk",
    okuma: "Okuma", dinleme: "Dinleme", yazma: "Yazma", konusma: "Konuşma",
    finishSection: "Bölümü tamamla →", finishExam: "Testi bitir", transcript: "Metin",
    writeHere: "Cevabını Türkçe yaz…", words: "kelime", minWords: "en az",
    results: "Test sonuçları", overall: "Genel seviye", sectionScore: "Bölüm puanları",
    correctOf: "doğru", submitted: "gönderildi", notDone: "yapılmadı", backToList: "Test listesine", empty: "Seçilen filtrelere uygun test yok.",
  },
  kk: {
    title: "Сынақ TÖMER тесттері", sub: "Толық емтихан форматы: Okuma · Dinleme · Yazma · Konuşma",
    done: "өтілді", all: "Барлығы", unfinished: "Аяқталмаған", allLevels: "Барлық деңгей",
    start: "Тестті бастау", exit: "Шығу", min: "мин",
    okuma: "Оқу", dinleme: "Тыңдалым", yazma: "Жазу", konusma: "Сөйлеу",
    finishSection: "Бөлімді аяқтау →", finishExam: "Тестті аяқтау", transcript: "Мәтін",
    writeHere: "Жауабыңды түрікше жаз…", words: "сөз", minWords: "кемінде",
    results: "Тест нәтижелері", overall: "Жалпы деңгей", sectionScore: "Бөлім бойынша баллдар",
    correctOf: "дұрыс", submitted: "жіберілді", notDone: "орындалмады", backToList: "Тестер тізіміне", empty: "Таңдалған сүзгілерге сай тест жоқ.",
  },
};

export default function MockPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [level, setLevel] = useState<Level | "all">("all");
  const [onlyUnfinished, setOnlyUnfinished] = useState(false);
  const [active, setActive] = useState<MockExam | null>(null);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const list = useMemo(
    () =>
      MOCK_EXAMS.filter((m) => {
        const byLevel = level === "all" || m.level === level;
        const byStatus = !onlyUnfinished || !doneIds.has(m.id);
        return byLevel && byStatus;
      }),
    [level, onlyUnfinished, doneIds],
  );

  if (active)
    return (
      <ExamRunner
        exam={active}
        c={c}
        onExit={() => setActive(null)}
        onFinish={() => setDoneIds((s) => new Set(s).add(active.id))}
      />
    );

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{c.sub}</p>
      <div className="mt-2 text-sm text-[var(--color-muted)]">
        <span className="font-semibold text-[var(--color-brand)]">{doneIds.size}</span> / {MOCK_EXAMS.length} {c.done}
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

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="glass card-glow flex h-full flex-col rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand)]/10 text-xl">🧪</span>
                <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-brand-2)]">{m.level}</span>
              </div>
              <div className="mt-3 text-sm font-semibold text-[var(--color-foreground)]">{m.title}</div>
              <div className="mt-1 text-xs text-[var(--color-muted)]">
                {m.grammar.length + m.reading.questions.length}+{m.listening.questions.length} soru · ~{m.timeMinutes} {c.min}
              </div>
              <button
                type="button"
                onClick={() => setActive(m)}
                className={`mt-4 rounded-full px-4 py-2 text-sm font-semibold ${doneIds.has(m.id) ? "bg-[#16a34a]/12 text-[#16a34a]" : "btn-primary"}`}
              >
                {doneIds.has(m.id) ? `✅ ${c.start}` : `▶ ${c.start}`}
              </button>
            </div>
          </motion.div>
        ))}
        {list.length === 0 && <div className="rounded-2xl border border-black/[0.07] bg-white/60 px-5 py-8 text-center text-sm text-[var(--color-muted)] sm:col-span-2 lg:col-span-3">{c.empty}</div>}
      </div>
    </div>
  );
}

type SectionId = "okuma" | "dinleme" | "yazma" | "konusma";

function ExamRunner({ exam, c, onExit, onFinish }: { exam: MockExam; c: (typeof T)["ru"]; onExit: () => void; onFinish: () => void }) {
  const okumaQs: Question[] = useMemo(() => [...exam.reading.questions, ...exam.grammar], [exam]);
  const dinlemeQs = exam.listening.questions;

  const sections: { id: SectionId; label: string; count: number }[] = [
    { id: "okuma", label: c.okuma, count: okumaQs.length },
    { id: "dinleme", label: c.dinleme, count: dinlemeQs.length },
    { id: "yazma", label: c.yazma, count: 1 },
    { id: "konusma", label: c.konusma, count: exam.speaking.parts.length },
  ];

  const [section, setSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [writing, setWriting] = useState("");
  const [speaking, setSpeaking] = useState<string[]>(() => exam.speaking.parts.map(() => ""));
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(exam.timeMinutes * 60);

  useEffect(() => {
    if (finished) return;
    if (secondsLeft <= 0) {
      setFinished(true);
      onFinish();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, finished, onFinish]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  function nextSection() {
    if (section + 1 >= sections.length) {
      setFinished(true);
      onFinish();
    } else {
      setSection((s) => s + 1);
    }
  }

  if (finished) {
    const okumaCorrect = okumaQs.filter((q) => answers[q.id] === q.correctAnswer).length;
    const dinlemeCorrect = dinlemeQs.filter((q) => answers[q.id] === q.correctAnswer).length;
    const writingWords = writing.trim().split(/\s+/).filter(Boolean).length;
    const speakingDone = speaking.filter((s) => s.trim().length > 0).length;
    return (
      <div className="mx-auto max-w-lg">
        <div className="glass rounded-3xl p-6 text-center">
          <div className="text-3xl">🎉</div>
          <h2 className="mt-2 text-lg font-bold">{c.results}</h2>
          <div className="mt-1 text-sm text-[var(--color-muted)]">{exam.title}</div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)]/10 px-4 py-2 text-sm">
            <span className="text-[var(--color-muted)]">{c.overall}:</span>
            <span className="font-bold text-[var(--color-brand)]">{exam.level}</span>
          </div>

          <div className="mt-5 text-left">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{c.sectionScore}</div>
            <div className="mt-2 flex flex-col gap-2">
              <ScoreRow label={c.okuma} value={`${okumaCorrect}/${okumaQs.length} ${c.correctOf}`} />
              <ScoreRow label={c.dinleme} value={`${dinlemeCorrect}/${dinlemeQs.length} ${c.correctOf}`} />
              <ScoreRow label={c.yazma} value={writingWords > 0 ? `${writingWords} ${c.words} · ${c.submitted}` : c.notDone} />
              <ScoreRow label={c.konusma} value={`${speakingDone}/${exam.speaking.parts.length} ${c.submitted}`} />
            </div>
          </div>

          <button type="button" onClick={onExit} className="btn-primary mt-6 rounded-full px-6 py-3 text-sm">{c.backToList}</button>
        </div>
      </div>
    );
  }

  const cur = sections[section];

  return (
    <div>
      {/* top bar */}
      <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between gap-3 border-b border-black/[0.07] bg-[var(--color-bg)]/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <button type="button" onClick={onExit} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">← {c.exit}</button>
        <span className="text-sm font-semibold text-[var(--color-foreground)]">{exam.title}</span>
        <span className={`rounded-full px-3 py-1 text-sm font-bold tabular-nums ${secondsLeft < 300 ? "bg-[#dc2626]/12 text-[#dc2626]" : "bg-black/[0.05] text-[var(--color-foreground)]"}`}>⏱ {mm}:{ss}</span>
      </div>

      {/* section tabs */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(i)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${section === i ? "bg-[var(--color-brand)] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}
          >
            {s.label} <span className={section === i ? "text-white/70" : "opacity-60"}>{s.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        {cur.id === "okuma" && (
          <div className="flex flex-col gap-4">
            <div className="glass rounded-2xl p-5">
              <div className="text-sm font-bold text-[var(--color-foreground)]">{exam.reading.title}</div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-foreground)]">{exam.reading.text}</p>
            </div>
            {okumaQs.map((q) => <MCQ key={q.id} q={q} answers={answers} setAnswers={setAnswers} />)}
          </div>
        )}

        {cur.id === "dinleme" && (
          <div className="flex flex-col gap-4">
            <div className="glass rounded-2xl p-5">
              <div className="text-sm font-bold text-[var(--color-foreground)]">🎧 {exam.listening.title}</div>
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium text-[var(--color-brand)]">{c.transcript}</summary>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-foreground)]">{exam.listening.text}</p>
              </details>
            </div>
            {dinlemeQs.map((q) => <MCQ key={q.id} q={q} answers={answers} setAnswers={setAnswers} />)}
          </div>
        )}

        {cur.id === "yazma" && (
          <div className="glass rounded-2xl p-5">
            <div className="text-sm font-bold text-[var(--color-foreground)]">{exam.writing.title}</div>
            <p className="mt-2 text-sm text-[var(--color-foreground)]">{exam.writing.prompt}</p>
            <textarea
              value={writing}
              onChange={(e) => setWriting(e.target.value)}
              rows={10}
              placeholder={c.writeHere}
              className="mt-3 w-full resize-y rounded-2xl border border-black/[0.1] bg-white p-4 text-sm leading-relaxed outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
            />
            <div className="mt-2 text-xs text-[var(--color-muted)]">
              {writing.trim().split(/\s+/).filter(Boolean).length} / {exam.writing.minWords} {c.words} ({c.minWords})
            </div>
          </div>
        )}

        {cur.id === "konusma" && (
          <div className="flex flex-col gap-4">
            {exam.speaking.parts.map((p, i) => (
              <div key={i} className="glass rounded-2xl p-5">
                <div className="text-sm font-semibold text-[var(--color-foreground)]">Bölüm {i + 1} · {p.timeMinutes} dk</div>
                <p className="mt-1 text-sm text-[var(--color-foreground)]">{p.instruction}</p>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">{p.instructionRu}</p>
                <textarea
                  value={speaking[i]}
                  onChange={(e) => setSpeaking((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
                  rows={4}
                  placeholder={c.writeHere}
                  className="mt-3 w-full resize-y rounded-2xl border border-black/[0.1] bg-white p-3 text-sm leading-relaxed outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={nextSection} className="btn-primary rounded-full px-6 py-3 text-sm">
          {section + 1 >= sections.length ? c.finishExam : c.finishSection}
        </button>
      </div>
    </div>
  );
}

function MCQ({ q, answers, setAnswers }: { q: Question; answers: Record<string, number>; setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>> }) {
  const sel = answers[q.id];
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-sm font-semibold text-[var(--color-foreground)]">{q.question}</div>
      <div className="mt-3 grid gap-2">
        {q.options.map((opt, oi) => (
          <button
            key={oi}
            type="button"
            onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
            className={`rounded-xl border px-4 py-2.5 text-left text-sm transition-all ${sel === oi ? "border-[var(--color-brand)] bg-[var(--color-brand)]/[0.08]" : "border-black/[0.08] bg-black/[0.02] text-[var(--color-foreground)] hover:border-black/[0.16]"}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-black/[0.03] px-4 py-2.5 text-sm">
      <span className="text-[var(--color-foreground)]">{label}</span>
      <span className="font-semibold text-[var(--color-brand)]">{value}</span>
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
