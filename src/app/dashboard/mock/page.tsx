"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { SectionBack } from "@/components/SectionBack";
import { SectionHint } from "@/components/SectionHint";
import { createClient } from "@/lib/supabase/client";
import { todayISO } from "@/lib/daily-plan";
import { loadResult } from "@/lib/quiz";
import {
  TOMER_EXAMS,
  sectionUnits,
  scoreOutOf25,
  type TomerExam,
  type TomerSection,
  type TomerUnit,
} from "@/data/tomer-exams";
import {
  DEFAULT_EXAM_FORMAT,
  EXAM_FORMATS,
  examFormat,
  examVerdict,
  sectionTimeLimit,
  type ExamFormatSlug,
} from "@/lib/exam/format";
import { STRATEGIES, STRATEGY_DISCLAIMER } from "@/data/strategies";

/**
 * Mock runner (UX audit #9) — honest TÖMER format from the reviewed content
 * bank: real Okuma texts (not grammar drills), Dinleme with exam-style audio
 * (plays twice, like the real thing), Yazma scored /25 by the AI examiner,
 * Konuşma in the live voice lesson. Every finished section persists to
 * mock_results, so route milestones actually see mock progress.
 */

const T = {
  ru: {
    title: "Пробный TÖMER", sub: "Формат экзамена: 4 секции, каждая оценивается из 25. Задания оригинальные — создаются AI и постоянно улучшаются.",
    sections: { dinleme: "Dinleme · Аудирование", okuma: "Okuma · Чтение", yazma: "Yazma · Письмо", konusma: "Konuşma · Говорение" },
    start: "Начать", redo: "Пройти ещё раз", scoreOf: "из 25", total: "Итог", totalHint: "Итог /100 появится, когда будут оценены все 4 секции.",
    listenHint: "Запись играет дважды — как на экзамене.", playsLeft: (n: number) => `осталось прослушиваний: ${n}`,
    q: "Вопрос", ofQ: "из", next: "Дальше", finishSection: "Завершить секцию",
    sectionDone: "Секция завершена", correctAnswers: "Правильных ответов", back: "К секциям",
    yazmaWords: "слов", yazmaSubmit: "Отправить на проверку", yazmaChecking: "AI-экзаменатор проверяет…",
    yazmaTask: "Задание", yazmaScored: "Оценка", yazmaNeedBoth: "Оценка секции — среднее двух заданий.",
    yazmaErr: "Не получилось проверить — текст на месте, попробуй отправить ещё раз.",
    konusmaBody: "Говорение проходит живым уроком с AI-преподавателем: 3 части, как на TÖMER. Оценка по критериям придёт после урока.",
    konusmaGo: "Начать голосовой экзамен",
    sourceOriginal: "Задания созданы AI в формате TÖMER и постоянно улучшаются",
    fmtLabel: "Мой экзамен", timeLeft: "осталось", timeUp: "Время вышло — ответы зафиксированы как есть.",
    timeBudget: (m: number) => `⏱ ${m} мин — как на экзамене`,
    vTitle: "Вердикт", vPassedC1: "По формату твоего центра это C1.",
    vPassedB2: "По формату твоего центра это B2.", vC1Gap: (n: number) => `До C1 не хватает ${n} баллов.`,
    vFailedMin: "ЭКЗАМЕН НЕ СДАН: слабое звено топит.", vFailedMinBody: (secs: string, min: number) => `Сумма не спасает — твой центр требует минимум ${min}/25 по каждой секции. Провалено: ${secs}.`,
    vFailed: "Ниже порога сертификата. Фокус — слабейшая секция, потом новый мок.",
    vNoPromise: "Пороги этого экзамена плавающие (Modern Test Theory) — конкретный балл обещать нельзя. Работай по слабейшей секции.",
    vUnclear: "Выше провальной черты, но порог этого сертификата центр не публикует — уточни в своём центре.",
    vBelowMin: (m: number) => `❌ ниже минимума ${m}/25`,
    stratTitle: "Стратегии сдачи",
  },
  en: {
    title: "TÖMER mock exam", sub: "Exam format: 4 sections, each scored out of 25. Original tasks — AI-generated and continuously improved.",
    sections: { dinleme: "Dinleme · Listening", okuma: "Okuma · Reading", yazma: "Yazma · Writing", konusma: "Konuşma · Speaking" },
    start: "Start", redo: "Retake", scoreOf: "of 25", total: "Total", totalHint: "The /100 total appears once all 4 sections are scored.",
    listenHint: "The recording plays twice — like the real exam.", playsLeft: (n: number) => `plays left: ${n}`,
    q: "Question", ofQ: "of", next: "Next", finishSection: "Finish section",
    sectionDone: "Section finished", correctAnswers: "Correct answers", back: "To sections",
    yazmaWords: "words", yazmaSubmit: "Submit for review", yazmaChecking: "The AI examiner is reviewing…",
    yazmaTask: "Task", yazmaScored: "Score", yazmaNeedBoth: "The section score is the average of both tasks.",
    yazmaErr: "Review failed — your text is safe, try submitting again.",
    konusmaBody: "Speaking runs as a live lesson with the AI teacher: 3 parts, TÖMER-style. The criteria-based score arrives after the lesson.",
    konusmaGo: "Start the speaking exam",
    sourceOriginal: "AI-generated tasks in the TÖMER format, continuously improved",
    fmtLabel: "My exam", timeLeft: "left", timeUp: "Time's up — answers locked as they are.",
    timeBudget: (m: number) => `⏱ ${m} min — exam pace`,
    vTitle: "Verdict", vPassedC1: "By your centre's format this is C1.",
    vPassedB2: "By your centre's format this is B2.", vC1Gap: (n: number) => `${n} points short of C1.`,
    vFailedMin: "EXAM NOT PASSED: the weak link sinks it.", vFailedMinBody: (secs: string, min: number) => `The total doesn't save you — your centre requires at least ${min}/25 in every section. Failed: ${secs}.`,
    vFailed: "Below the certificate threshold. Focus on the weakest section, then retake a mock.",
    vNoPromise: "This exam's thresholds float (Modern Test Theory) — no score promise. Work on your weakest section.",
    vUnclear: "Above the failing line, but the centre doesn't publish this certificate's threshold — confirm with your centre.",
    vBelowMin: (m: number) => `❌ below the ${m}/25 minimum`,
    stratTitle: "Passing strategies",
  },
  tr: {
    title: "TÖMER Deneme Sınavı", sub: "Sınav formatı: 4 bölüm, her biri 25 üzerinden. Özgün görevler — yapay zekâ üretir, sürekli iyileştirilir.",
    sections: { dinleme: "Dinleme", okuma: "Okuma", yazma: "Yazma", konusma: "Konuşma" },
    start: "Başla", redo: "Tekrar çöz", scoreOf: "/ 25", total: "Toplam", totalHint: "4 bölümün tamamı puanlanınca /100 toplam görünür.",
    listenHint: "Kayıt iki kez çalar — gerçek sınavdaki gibi.", playsLeft: (n: number) => `kalan dinleme: ${n}`,
    q: "Soru", ofQ: "/", next: "Sonraki", finishSection: "Bölümü bitir",
    sectionDone: "Bölüm bitti", correctAnswers: "Doğru cevap", back: "Bölümlere dön",
    yazmaWords: "kelime", yazmaSubmit: "İncelemeye gönder", yazmaChecking: "AI sınav uzmanı inceliyor…",
    yazmaTask: "Görev", yazmaScored: "Puan", yazmaNeedBoth: "Bölüm puanı iki görevin ortalamasıdır.",
    yazmaErr: "İnceleme başarısız — metnin duruyor, tekrar göndermeyi dene.",
    konusmaBody: "Konuşma, AI öğretmenle canlı derste yapılır: TÖMER tarzı 3 bölüm. Ölçütlere göre puan dersten sonra gelir.",
    konusmaGo: "Konuşma sınavını başlat",
    sourceOriginal: "TÖMER formatında yapay zekâ üretimi görevler, sürekli iyileştirilir",
    fmtLabel: "Sınavım", timeLeft: "kaldı", timeUp: "Süre doldu — cevaplar olduğu gibi kilitlendi.",
    timeBudget: (m: number) => `⏱ ${m} dk — sınav temposu`,
    vTitle: "Sonuç", vPassedC1: "Merkezinin formatına göre bu C1.",
    vPassedB2: "Merkezinin formatına göre bu B2.", vC1Gap: (n: number) => `C1 için ${n} puan eksik.`,
    vFailedMin: "SINAV GEÇİLMEDİ: zayıf halka batırıyor.", vFailedMinBody: (secs: string, min: number) => `Toplam kurtarmıyor — merkezin her bölümde en az ${min}/25 istiyor. Kalınan: ${secs}.`,
    vFailed: "Sertifika eşiğinin altında. Önce en zayıf bölüm, sonra yeni deneme.",
    vNoPromise: "Bu sınavın eşikleri değişkendir (Modern Test Theory) — puan sözü verilemez. En zayıf bölümüne çalış.",
    vUnclear: "Başarısızlık çizgisinin üstünde, ancak merkez bu sertifikanın eşiğini yayımlamıyor — merkezinden doğrula.",
    vBelowMin: (m: number) => `❌ ${m}/25 asgarisinin altında`,
    stratTitle: "Geçiş stratejileri",
  },
  kk: {
    title: "Сынақ TÖMER", sub: "Емтихан форматы: 4 бөлім, әрқайсысы 25 ұпайдан. Тапсырмалар төл — AI жасайды және үнемі жетілдіріледі.",
    sections: { dinleme: "Dinleme · Тыңдалым", okuma: "Okuma · Оқылым", yazma: "Yazma · Жазылым", konusma: "Konuşma · Сөйлесім" },
    start: "Бастау", redo: "Қайта өту", scoreOf: "/ 25", total: "Қорытынды", totalHint: "4 бөлім түгел бағаланғанда /100 қорытынды шығады.",
    listenHint: "Жазба екі рет ойналады — нағыз емтихандағыдай.", playsLeft: (n: number) => `қалған тыңдау: ${n}`,
    q: "Сұрақ", ofQ: "/", next: "Келесі", finishSection: "Бөлімді аяқтау",
    sectionDone: "Бөлім аяқталды", correctAnswers: "Дұрыс жауап", back: "Бөлімдерге",
    yazmaWords: "сөз", yazmaSubmit: "Тексеруге жіберу", yazmaChecking: "AI емтихан алушы тексеруде…",
    yazmaTask: "Тапсырма", yazmaScored: "Баға", yazmaNeedBoth: "Бөлім бағасы — екі тапсырманың орташасы.",
    yazmaErr: "Тексеру сәтсіз — мәтінің сақтаулы, қайта жіберіп көр.",
    konusmaBody: "Сөйлесім AI ұстазбен жанды сабақта өтеді: TÖMER үлгісіндегі 3 бөлім. Өлшемдер бойынша баға сабақтан кейін келеді.",
    konusmaGo: "Сөйлесім емтиханын бастау",
    sourceOriginal: "TÖMER форматындағы AI жасаған тапсырмалар, үнемі жетілдіріледі",
    fmtLabel: "Менің емтиханым", timeLeft: "қалды", timeUp: "Уақыт бітті — жауаптар сол күйінде бекітілді.",
    timeBudget: (m: number) => `⏱ ${m} мин — емтихан қарқыны`,
    vTitle: "Үкім", vPassedC1: "Орталығыңның форматы бойынша бұл C1.",
    vPassedB2: "Орталығыңның форматы бойынша бұл B2.", vC1Gap: (n: number) => `C1-ге ${n} балл жетпейді.`,
    vFailedMin: "ЕМТИХАН ТАПСЫРЫЛМАДЫ: әлсіз буын құлатады.", vFailedMinBody: (secs: string, min: number) => `Жалпы балл құтқармайды — орталығың әр бөлімнен кемінде ${min}/25 талап етеді. Құлаған: ${secs}.`,
    vFailed: "Сертификат шегінен төмен. Алдымен ең әлсіз бөлім, сосын жаңа сынама.",
    vNoPromise: "Бұл емтиханның шектері өзгермелі (Modern Test Theory) — нақты балл уәде етілмейді. Ең әлсіз бөліміңмен жұмыс істе.",
    vUnclear: "Құлау сызығынан жоғары, бірақ орталық бұл сертификаттың шегін жарияламайды — өз орталығыңнан нақтыла.",
    vBelowMin: (m: number) => `❌ ${m}/25 минимумынан төмен`,
    stratTitle: "Тапсыру стратегиялары",
  },
};

const SECTION_EMOJI: Record<TomerSection, string> = { dinleme: "🎧", okuma: "📖", yazma: "✍️", konusma: "🎤" };
const SECTION_ORDER: TomerSection[] = ["dinleme", "okuma", "yazma", "konusma"];

/* ------------------------- persistence (mock_results) ------------------------- */

type SectionScores = Partial<Record<TomerSection, number>>;

async function loadScores(examId: string): Promise<SectionScores> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("mock_results")
      .select("section_scores, created_at")
      .eq("exam_id", examId)
      .order("created_at", { ascending: true });
    if (error || !data) return {};
    // one row per finished section attempt; the latest attempt wins
    const agg: SectionScores = {};
    for (const row of data) {
      const s = (row.section_scores ?? {}) as SectionScores;
      for (const k of SECTION_ORDER) if (typeof s[k] === "number") agg[k] = s[k];
    }
    return agg;
  } catch {
    return {};
  }
}

async function saveSectionScore(examId: string, section: TomerSection, score: number, allScores: SectionScores): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const merged = { ...allScores, [section]: score };
    const complete = SECTION_ORDER.every((k) => typeof merged[k] === "number");
    const { error } = await supabase.from("mock_results").insert({
      user_id: user.id,
      exam_id: examId,
      section_scores: { [section]: score },
      total: complete ? SECTION_ORDER.reduce((s, k) => s + (merged[k] ?? 0), 0) : null,
    });
    if (error) console.error("[mock] save failed:", error.message);
  } catch {
    /* score shown in UI either way; next attempt can re-save */
  }
  // credit today's mock task on the dashboard (voice-done pattern, audit #10)
  try {
    window.localStorage.setItem("lingopro:mock-done", todayISO());
  } catch {
    /* ignore */
  }
}

/* ------------------------------ audio (2 plays) ------------------------------ */

function MockAudio({ unitId, src, c }: { unitId: string; src: string; c: (typeof T)["ru"] }) {
  const MAX_PLAYS = 2;
  const key = `lingopro:mockplays:${unitId}`;
  const [playsUsed, setPlaysUsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      setPlaysUsed(Number(window.sessionStorage.getItem(key) ?? 0));
    } catch {
      /* ignore */
    }
  }, [key]);

  function play() {
    if (playing || playsUsed >= MAX_PLAYS) return;
    const el = audioRef.current ?? new Audio(src);
    audioRef.current = el;
    el.currentTime = 0;
    void el.play();
    setPlaying(true);
    const used = playsUsed + 1;
    setPlaysUsed(used);
    try {
      window.sessionStorage.setItem(key, String(used));
    } catch {
      /* ignore */
    }
    el.onended = () => setPlaying(false);
  }

  const left = Math.max(0, MAX_PLAYS - playsUsed);
  return (
    <div className="rounded-2xl border border-black/[0.07] bg-black/[0.02] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={play}
          disabled={playing || left === 0}
          className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
        >
          {playing ? "🔊 …" : "▶ Dinle"}
        </button>
        <span className="text-xs text-[var(--color-muted)]">{c.playsLeft(left)}</span>
      </div>
      <p className="mt-2 text-xs text-[var(--color-muted)]">{c.listenHint}</p>
    </div>
  );
}

/* --------------------------- section timer (7.2) --------------------------- */
/** Реальный тайминг секции: время вышло → onExpire (ответы фиксируются как
 *  есть). Бюджет — экзаменационный темп, отмасштабированный на наш объём. */
function SectionTimer({ seconds, onExpire, c }: { seconds: number; onExpire: () => void; c: (typeof T)["ru"] }) {
  const [left, setLeft] = useState(seconds);
  const expiredRef = useRef(false);
  useEffect(() => {
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1 && !expiredRef.current) {
          expiredRef.current = true;
          clearInterval(t);
          onExpire();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums ${
        left <= 60 ? "bg-[#dc2626]/10 text-[#b91c1c]" : "bg-black/[0.05] text-[var(--color-foreground)]"
      }`}
    >
      ⏱ {mm}:{ss} <span className="text-xs font-medium text-[var(--color-muted)]">{c.timeLeft}</span>
    </span>
  );
}

/* ------------------------------ MCQ section run ------------------------------ */

function shuffledOrder(n: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

function McqRunner({
  units,
  section,
  timeLimitSec,
  c,
  onDone,
}: {
  units: TomerUnit[];
  section: TomerSection;
  timeLimitSec: number | null;
  c: (typeof T)["ru"];
  onDone: (correct: number, total: number) => void;
}) {
  const flat = useMemo(() => units.flatMap((u) => u.questions.map((q) => ({ unit: u, q }))), [units]);
  // presentation order of options, fixed per question for this run
  const orders = useMemo(() => flat.map(({ q }) => shuffledOrder(q.options.length)), [flat]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null); // index in shuffled space
  const correctRef = useRef(0);
  const doneRef = useRef(false);

  const { unit, q } = flat[i];
  const order = orders[i];
  const isNewUnit = i === 0 || flat[i - 1].unit.id !== unit.id;

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone(correctRef.current, flat.length);
  };

  function next() {
    if (picked == null) return;
    if (order[picked] === q.answer) correctRef.current += 1;
    setPicked(null);
    if (i + 1 >= flat.length) finish();
    else setI(i + 1);
  }

  return (
    <div className="mt-5 flex flex-col gap-4">
      {/* unit context: text for okuma, audio for dinleme — shown at unit start and kept visible */}
      <div className="glass rounded-3xl p-6">
        <div className="text-sm font-semibold text-[var(--color-foreground)]">{unit.title}</div>
        {section === "okuma" ? (
          <div className="mt-3 max-h-72 overflow-y-auto whitespace-pre-line rounded-2xl bg-black/[0.02] p-4 text-sm leading-relaxed text-[var(--color-foreground)]">
            {unit.body}
          </div>
        ) : (
          unit.audioSrc && (
            <div className="mt-3">
              {isNewUnit || true ? <MockAudio unitId={unit.id} src={unit.audioSrc} c={c} /> : null}
            </div>
          )
        )}
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            {c.q} {i + 1} {c.ofQ} {flat.length}
          </div>
          {/* время вышло → ответы фиксируются как есть (неотвеченные — мимо) */}
          {timeLimitSec != null && <SectionTimer seconds={timeLimitSec} onExpire={finish} c={c} />}
        </div>
        <div className="mt-2 text-base font-medium leading-relaxed text-[var(--color-foreground)]">{q.prompt}</div>
        <div className="mt-4 flex flex-col gap-2">
          {order.map((optIdx, pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => setPicked(pos)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                picked === pos
                  ? "border-[var(--color-brand)] bg-[var(--color-brand)]/[0.07]"
                  : "border-black/[0.08] bg-white hover:border-black/[0.2]"
              }`}
            >
              <span className="mr-2 font-semibold text-[var(--color-muted)]">{String.fromCharCode(65 + pos)})</span>
              {q.options[optIdx]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          disabled={picked == null}
          className="btn-primary mt-5 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-40"
        >
          {i + 1 >= flat.length ? c.finishSection : c.next} →
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Yazma section ------------------------------ */

function YazmaRunner({
  units,
  timeLimitSec,
  c,
  locale,
  onDone,
}: {
  units: TomerUnit[];
  timeLimitSec: number | null;
  c: (typeof T)["ru"];
  locale: string;
  onDone: (score25: number) => void;
}) {
  const [texts, setTexts] = useState<string[]>(() => units.map(() => ""));
  const [scores, setScores] = useState<(number | null)[]>(() => units.map(() => null));
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState<number | null>(null);
  const doneRef = useRef(false);
  const textsRef = useRef(texts);
  textsRef.current = texts;
  const scoresRef = useRef(scores);
  scoresRef.current = scores;

  const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

  /** Время вышло: черновики с реальным текстом уходят на проверку как есть,
   *  пустые задания честно фиксируются нулём. */
  async function finishByTimeout() {
    if (doneRef.current) return;
    doneRef.current = true;
    const finals = [...scoresRef.current];
    for (let idx = 0; idx < units.length; idx++) {
      if (finals[idx] != null) continue;
      const text = textsRef.current[idx].trim();
      if (words(text) < 5) {
        finals[idx] = 0;
        continue;
      }
      try {
        const res = await fetch("/api/ai/writing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, taskPrompt: units[idx].body, feedbackLang: locale }),
        });
        const d = await res.json().catch(() => ({}));
        finals[idx] = res.ok && typeof d?.review?.score_total_25 === "number" ? d.review.score_total_25 : 0;
      } catch {
        finals[idx] = 0;
      }
    }
    setScores(finals);
    onDone(Math.round(finals.reduce((sum: number, b) => sum + (b ?? 0), 0) / units.length));
  }

  async function submit(idx: number) {
    const text = texts[idx].trim();
    if (!text || busy != null) return;
    setBusy(idx);
    setErr(null);
    try {
      const res = await fetch("/api/ai/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, taskPrompt: units[idx].body, feedbackLang: locale }),
      });
      const d = await res.json().catch(() => ({}));
      const s = d?.review?.score_total_25;
      if (res.ok && typeof s === "number") {
        setScores((prev) => {
          const nextScores = prev.map((v, i) => (i === idx ? s : v));
          if (nextScores.every((v) => v != null) && !doneRef.current) {
            doneRef.current = true;
            onDone(Math.round(nextScores.reduce((a, b) => a + (b ?? 0), 0) / nextScores.length));
          }
          return nextScores;
        });
      } else {
        setErr(idx);
      }
    } catch {
      setErr(idx);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-5 flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--color-muted)]">{c.yazmaNeedBoth}</p>
        {timeLimitSec != null && <SectionTimer seconds={timeLimitSec} onExpire={() => void finishByTimeout()} c={c} />}
      </div>
      {units.map((u, idx) => (
        <div key={u.id} className="glass rounded-3xl p-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            {c.yazmaTask} {idx + 1} · {u.constraints ? `${u.constraints.minWords}–${u.constraints.maxWords} ${c.yazmaWords}` : ""}
          </div>
          <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-foreground)]">{u.body}</div>
          {scores[idx] == null ? (
            <>
              <textarea
                value={texts[idx]}
                onChange={(e) => setTexts((p) => p.map((v, i) => (i === idx ? e.target.value : v)))}
                rows={8}
                className="mt-4 w-full rounded-2xl border border-black/[0.1] bg-white p-4 text-sm leading-relaxed outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
              />
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void submit(idx)}
                  disabled={busy != null || words(texts[idx]) === 0}
                  className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
                >
                  {busy === idx ? c.yazmaChecking : c.yazmaSubmit}
                </button>
                <span className="text-xs text-[var(--color-muted)]">{words(texts[idx])} {c.yazmaWords}</span>
              </div>
              {err === idx && <p className="mt-2 text-xs font-medium text-[#b91c1c]">{c.yazmaErr}</p>}
            </>
          ) : (
            <div className="mt-4 rounded-2xl bg-[#16a34a]/[0.08] px-4 py-3 text-sm font-semibold text-[#15803d]">
              ✓ {c.yazmaScored}: {scores[idx]} / 25
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------- page ---------------------------------- */

type View = { kind: "exam" } | { kind: "section"; section: TomerSection } | { kind: "result"; section: TomerSection; score: number; correct?: number; total?: number };

export default function MockPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  // full level coverage A1→C1, one exam per level for now (more per level later)
  const [examIdx, setExamIdx] = useState(3); // fallback: B2, the flagship target
  const exam: TomerExam = TOMER_EXAMS[examIdx];

  const [view, setView] = useState<View>({ kind: "exam" });
  const [scores, setScores] = useState<SectionScores>({});
  // формат экзамена — параметр (7.1): выбор студента живёт в profiles.exam_format
  const [fmtSlug, setFmtSlug] = useState<ExamFormatSlug>(DEFAULT_EXAM_FORMAT);
  const fmt = examFormat(fmtSlug);

  // preselect the student's OWN level from the diagnostic (A0 trains on A1) —
  // defaulting everyone to B2 crushed beginners; the picker stays free
  useEffect(() => {
    const lvl = loadResult()?.level;
    if (!lvl) return;
    const idx = TOMER_EXAMS.findIndex((e) => e.level === (lvl === "A0" ? "A1" : lvl));
    if (idx >= 0) setExamIdx(idx);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;
      const { data } = await supabase.from("profiles").select("exam_format").eq("id", user.id).maybeSingle();
      const slug = data?.exam_format as ExamFormatSlug | null;
      if (active && slug && slug in EXAM_FORMATS) setFmtSlug(slug);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function pickFormat(slug: ExamFormatSlug) {
    setFmtSlug(slug);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from("profiles").update({ exam_format: slug }).eq("id", user.id);
      if (error) console.error("[mock] exam_format save failed:", error.message);
    } catch {
      /* выбор живёт в state; следующий заход попробует снова */
    }
  }

  useEffect(() => {
    setScores({});
    void loadScores(exam.id).then(setScores);
  }, [exam.id]);

  function finishSection(section: TomerSection, score: number, correct?: number, total?: number) {
    void saveSectionScore(exam.id, section, score, scores);
    setScores((s) => ({ ...s, [section]: score }));
    setView({ kind: "result", section, score, correct, total });
  }

  const totalReady = SECTION_ORDER.every((k) => typeof scores[k] === "number");
  const total = SECTION_ORDER.reduce((s, k) => s + (scores[k] ?? 0), 0);

  if (view.kind === "section") {
    const units = sectionUnits(exam, view.section);
    return (
      <div>
        <button type="button" onClick={() => setView({ kind: "exam" })} className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]">
          ← {c.back}
        </button>
        <h2 className="text-xl font-bold tracking-tight">{SECTION_EMOJI[view.section]} {c.sections[view.section]}</h2>
        {view.section === "yazma" ? (
          <YazmaRunner
            units={units}
            timeLimitSec={sectionTimeLimit(fmt, "yazma", units.length)}
            c={c}
            locale={locale}
            onDone={(s) => finishSection("yazma", s)}
          />
        ) : (
          <McqRunner
            units={units}
            section={view.section}
            timeLimitSec={sectionTimeLimit(fmt, view.section, units.reduce((n, u) => n + u.questions.length, 0))}
            c={c}
            onDone={(correct, totalQ) => finishSection(view.section, scoreOutOf25(correct, totalQ), correct, totalQ)}
          />
        )}
      </div>
    );
  }

  if (view.kind === "result") {
    return (
      <div>
        <SectionBack />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass mt-4 rounded-3xl p-7 text-center">
          <div className="text-3xl">{SECTION_EMOJI[view.section]}</div>
          <h2 className="mt-2 text-xl font-bold tracking-tight">{c.sectionDone}</h2>
          <div className="mt-3 text-4xl font-extrabold text-[var(--color-brand)]">{view.score} <span className="text-lg font-semibold text-[var(--color-muted)]">{c.scoreOf}</span></div>
          {view.correct != null && view.total != null && (
            <p className="mt-2 text-sm text-[var(--color-muted)]">{c.correctAnswers}: {view.correct} / {view.total}</p>
          )}
          <button type="button" onClick={() => setView({ kind: "exam" })} className="btn-primary mt-5 rounded-full px-6 py-3 text-sm font-semibold">
            {c.back}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <SectionBack />
      <SectionHint id="mock" />
      <h2 className="text-xl font-bold tracking-tight">{c.title} · {exam.level}</h2>
      <p className="mt-1 max-w-xl text-sm text-[var(--color-muted)]">{c.sub}</p>

      {/* level picker: one exam per level (A1→C1) for now */}
      <div className="mt-4 flex flex-wrap gap-2">
        {TOMER_EXAMS.map((e, i) => (
          <button
            key={e.id}
            type="button"
            onClick={() => {
              setExamIdx(i);
              setView({ kind: "exam" });
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              i === examIdx ? "bg-[var(--color-brand)] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"
            }`}
          >
            {e.level}
          </button>
        ))}
      </div>

      {/* формат экзамена — параметр (7.1): барем/тайминг/минимум зависят от центра */}
      <div className="glass mt-4 rounded-2xl p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{c.fmtLabel}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(EXAM_FORMATS) as ExamFormatSlug[]).map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => void pickFormat(slug)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                slug === fmtSlug ? "bg-[var(--color-brand)] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"
              }`}
            >
              {EXAM_FORMATS[slug].name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-muted)]">{fmt.note[locale]}</p>
      </div>

      {/* honest total + вердикт по формату центра (7.3-7.4) */}
      <div className="glass mt-5 rounded-3xl p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-[var(--color-foreground)]">{exam.title}</span>
          {totalReady ? (
            <span className="text-lg font-extrabold text-[var(--color-brand)]">{c.total}: {total} / 100</span>
          ) : (
            <span className="text-xs text-[var(--color-muted)]">{c.totalHint}</span>
          )}
        </div>

        {totalReady && (() => {
          const v = examVerdict(fmt, scores);
          const minPts = fmt.minPerSectionShare != null ? Math.round(fmt.minPerSectionShare * 25) : null;
          const box = (tone: "ok" | "warn" | "bad", head: string, body?: string) => (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                tone === "ok" ? "bg-[#16a34a]/[0.08] text-[#15803d]" : tone === "warn" ? "bg-[#d97706]/10 text-[#92400e]" : "bg-[#dc2626]/[0.08] text-[#b91c1c]"
              }`}
            >
              <div className="font-bold">{c.vTitle}: {head}</div>
              {body && <p className="mt-1 font-medium">{body}</p>}
            </div>
          );
          switch (v.outcome) {
            case "passed_c1":
              return box("ok", c.vPassedC1);
            case "passed_b2":
              return box("ok", c.vPassedB2, fmt.thresholds.C1 != null ? c.vC1Gap(fmt.thresholds.C1 - v.total) : undefined);
            case "failed_min":
              return box("bad", c.vFailedMin, c.vFailedMinBody(v.weakSections.map((s) => c.sections[s]).join(", "), minPts ?? 15));
            case "failed":
              return box("bad", c.vFailed);
            case "no_promise":
              return box("warn", c.vNoPromise);
            case "unclear_threshold":
              return box("warn", c.vUnclear);
            default:
              return null;
          }
        })()}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SECTION_ORDER.map((s) => {
            const units = sectionUnits(exam, s);
            const nQ = units.reduce((n, u) => n + u.questions.length, 0);
            const done = typeof scores[s] === "number";
            const minPts = fmt.minPerSectionShare != null ? Math.round(fmt.minPerSectionShare * 25) : null;
            const belowMin = done && minPts != null && (scores[s] as number) < minPts;
            const limit = sectionTimeLimit(fmt, s, s === "yazma" ? units.length : nQ);
            return (
              <div key={s} className={`flex flex-col rounded-2xl border bg-white p-4 ${belowMin ? "border-[#dc2626]/40" : "border-black/[0.07]"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--color-foreground)]">{SECTION_EMOJI[s]} {c.sections[s]}</span>
                  {done && (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${belowMin ? "bg-[#dc2626]/10 text-[#b91c1c]" : "bg-[#16a34a]/10 text-[#15803d]"}`}>
                      {scores[s]} / 25
                    </span>
                  )}
                </div>
                {belowMin && minPts != null && (
                  <div className="mt-1 text-xs font-semibold text-[#b91c1c]">{c.vBelowMin(minPts)}</div>
                )}
                <div className="mt-1 text-xs text-[var(--color-muted)]">
                  {s === "yazma" ? `${units.length} görev` : s === "konusma" ? "3 bölüm · canlı" : `${units.length} ${s === "okuma" ? "metin" : "kayıt"} · ${nQ} soru`}
                  {limit != null && <> · {c.timeBudget(Math.round(limit / 60))}</>}
                </div>
                {s === "konusma" ? (
                  <>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">{c.konusmaBody}</p>
                    <Link href="/dashboard/speaking/live?mode=full" className="btn-primary mt-3 w-fit rounded-full px-4 py-2 text-xs font-semibold">
                      🎤 {c.konusmaGo}
                    </Link>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setView({ kind: "section", section: s })}
                    className={`mt-3 w-fit rounded-full px-4 py-2 text-xs font-semibold ${done ? "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]" : "btn-primary"}`}
                  >
                    {done ? c.redo : `▶ ${c.start}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] text-[var(--color-muted)]">{c.sourceOriginal}</p>
      </div>

      {/* стратегии сдачи (7.6): тактики, которые отрабатываются на этих же
          пробниках с реальным таймером */}
      <div className="glass mt-5 rounded-3xl p-6">
        <h3 className="text-base font-semibold text-[var(--color-foreground)]">🧠 {c.stratTitle}</h3>
        <div className="mt-3 flex flex-col gap-2">
          {STRATEGIES.map((s) => (
            <details key={s.id} className="group rounded-2xl border border-black/[0.07] bg-white p-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--color-foreground)]">
                {s.emoji} {s.title[locale]}
                <span className="float-right text-[var(--color-muted)] transition-transform group-open:rotate-180">▾</span>
              </summary>
              <ul className="mt-3 flex flex-col gap-2">
                {s.tips[locale].map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-[var(--color-foreground)]">
                    <span className="text-[var(--color-brand)]">·</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-muted)]">{STRATEGY_DISCLAIMER[locale]}</p>
      </div>
    </div>
  );
}
