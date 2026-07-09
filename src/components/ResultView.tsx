"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useExam } from "@/lib/exam-context";
import { useI18n, type Locale } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import {
  LEVEL_ORDER,
  MODULES,
  PLANS,
  levelIndex,
  qt,
  clearProgress,
  clearResult,
  type AnswerRecord,
  type ModuleId,
  type QuizResult,
} from "@/lib/quiz";
import { topicById } from "@/lib/ai/topics";

function barColor(percent: number) {
  if (percent >= 70) return { from: "#16a34a", to: "#22c55e" };
  if (percent >= 40) return { from: "#d97706", to: "#f59e0b" };
  return { from: "#dc2626", to: "#ef4444" };
}

function moduleMeta(id: ModuleId) {
  return MODULES.find((m) => m.id === id)!;
}

/* ------------------------------- Skill bar -------------------------------- */
function SkillBar({
  id,
  percent,
  level,
  delay,
  locale,
}: {
  id: ModuleId;
  percent: number;
  level: string;
  delay: number;
  locale: Locale;
}) {
  const m = moduleMeta(id);
  const c = barColor(percent);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-[var(--color-foreground)]">
          <span>{m.emoji}</span>
          {m.name[locale]}
        </span>
        <span className="text-[var(--color-muted)]">
          {percent}% · <span className="font-semibold text-[var(--color-foreground)]">{level}</span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(to right, ${c.from}, ${c.to})` }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.9, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ------------------------------- Accordion -------------------------------- */
/** Fact-based per-module breakdown: built ONLY from the student's answers. */
function ModuleAccordion({
  id,
  percent,
  level,
  records,
  locale,
  defaultOpen,
}: {
  id: ModuleId;
  percent: number;
  level: string;
  records: AnswerRecord[];
  locale: Locale;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const m = moduleMeta(id);
  const c = barColor(percent);

  const knows = records.filter((r) => r.correct);
  const gaps = records.filter((r) => !r.correct);
  const gapTopics = [...new Set(gaps.map((g) => g.topic).filter(Boolean))] as string[];
  const label = (r: AnswerRecord) => (r.tag ? r.tag[locale] ?? r.tag.ru : r.prompt);
  const isOpenSkill = id === "writing" || id === "speaking";

  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-black/[0.02]"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-[var(--color-foreground)] sm:text-base">
          <span>{m.emoji}</span>
          {m.name[locale]}
          <span
            className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
            style={{ background: `linear-gradient(to right, ${c.from}, ${c.to})` }}
          >
            {percent}% · {level}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-[var(--color-muted)]"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 border-t border-black/[0.06] px-5 py-5">
              {isOpenSkill ? (
                // open-ended skills: the diagnostic only sizes the answer —
                // say so honestly and point to where the real assessment lives
                <p className="rounded-xl bg-black/[0.03] p-4 text-sm leading-relaxed text-[var(--color-foreground)]">
                  {qt(locale, id === "writing" ? "prelimWriting" : "prelimSpeaking")}
                </p>
              ) : records.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">{qt(locale, "noDetail")}</p>
              ) : (
                <>
                  {knows.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-2)]">
                        {qt(locale, "knowsTitle")}
                      </div>
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {knows.map((k, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]">
                            <span className="text-[var(--color-brand-2)]">✅</span>
                            <span>{label(k)} <span className="text-xs text-[var(--color-muted)]">· {k.level}</span></span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-[#d97706]">
                      {qt(locale, "gapsTitle")}
                    </div>
                    {gaps.length === 0 ? (
                      <p className="mt-2 text-sm text-[#16a34a]">✅</p>
                    ) : (
                      <ul className="mt-2 flex flex-col gap-2">
                        {gaps.map((g, i) => (
                          <li key={i} className="rounded-xl bg-black/[0.03] p-3 text-sm text-[var(--color-foreground)]">
                            <div className="flex items-start gap-2">
                              <span>❌</span>
                              <span>{label(g)} <span className="text-xs text-[var(--color-muted)]">· {g.level}</span></span>
                            </div>
                            <div className="mt-1 pl-6 text-xs text-[var(--color-muted)]">
                              «{g.prompt}» — {qt(locale, "correctAnswerWord")}: <b className="text-[var(--color-foreground)]">{g.correctAnswer}</b>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {gapTopics.length > 0 && (
                    <div className="rounded-xl bg-[var(--color-brand)]/[0.05] p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {gapTopics.map((t) => {
                          const topic = topicById(t);
                          return topic ? (
                            <span key={t} className="rounded-full bg-[var(--color-brand)]/[0.1] px-2.5 py-1 text-xs font-medium text-[var(--color-brand)]">
                              {topic.label[locale]}
                            </span>
                          ) : null;
                        })}
                      </div>
                      <p className="mt-2 text-xs text-[var(--color-muted)]">{qt(locale, "focusNote")}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------- v3 sections (/25) ---------------------------- */

function SectionRow({
  label,
  emoji,
  score,
  pendingNode,
  delay,
}: {
  label: string;
  emoji: string;
  score: number | null;
  pendingNode?: React.ReactNode;
  delay: number;
}) {
  const c = score != null ? barColor((score / 25) * 100) : null;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-[var(--color-foreground)]">
          <span>{emoji}</span>
          {label}
        </span>
        {score != null ? (
          <span className="font-semibold text-[var(--color-foreground)]">{score}/25</span>
        ) : (
          <span className="text-xs text-[var(--color-muted)]">—/25</span>
        )}
      </div>
      {score != null && c ? (
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(to right, ${c.from}, ${c.to})` }}
            initial={{ width: 0 }}
            animate={{ width: `${(score / 25) * 100}%` }}
            transition={{ duration: 0.9, delay, ease: "easeOut" }}
          />
        </div>
      ) : (
        <div className="rounded-xl bg-black/[0.03] px-3 py-2 text-xs text-[var(--color-muted)]">{pendingNode}</div>
      )}
    </div>
  );
}

/* --------------------- v3 per-section breakdown (§ bug 4) ----------------- */
/* The diagnostic must not only measure but point the way: every section gets
   its wrong answers + 2 concrete, score-banded recommendations. */

type Band = "weak" | "mid" | "strong";
const bandOf = (score: number | null): Band | null =>
  score == null ? null : score < 15 ? "weak" : score < 20 ? "mid" : "strong";

type Loc = Record<Locale, string>;
const SECTION_RECS: Record<"dinleme" | "okuma" | "yazma" | "konusma", Record<Band, Loc[]>> = {
  dinleme: {
    weak: [
      { ru: "Каждый день 10 минут аудирования в кабинете — короткие диалоги твоего уровня.", en: "10 minutes of listening daily — short dialogues at your level.", tr: "Her gün 10 dakika dinleme — seviyene uygun kısa diyaloglar.", kk: "Күн сайын 10 минут тыңдалым — деңгейіңе сай қысқа диалогтар." },
      { ru: "Слушай в два подхода: первый раз — общий смысл, второй — детали (числа, время, имена).", en: "Listen twice: first for gist, then for details (numbers, times, names).", tr: "İki kez dinle: önce genel anlam, sonra ayrıntılar (sayılar, saatler, isimler).", kk: "Екі рет тыңда: алдымен жалпы мағына, сосын детальдар (сандар, уақыт, есімдер)." },
    ],
    mid: [
      { ru: "3–4 аудирования в неделю; особое внимание числам, датам и ценам — на них чаще всего ловят.", en: "3–4 listening sets a week; watch numbers, dates and prices — the classic traps.", tr: "Haftada 3–4 dinleme; sayılara, tarihlere ve fiyatlara dikkat — klasik tuzaklar.", kk: "Аптасына 3–4 тыңдалым; сандарға, күндерге, бағаларға мұқият бол — жиі қақпан осында." },
      { ru: "После прослушивания перескажи услышанное вслух в 2–3 предложениях.", en: "After listening, retell what you heard aloud in 2–3 sentences.", tr: "Dinledikten sonra duyduklarını 2–3 cümleyle sesli anlat.", kk: "Тыңдағаннан кейін естігеніңді 2–3 сөйлеммен дауыстап айтып бер." },
    ],
    strong: [
      { ru: "Держи форму: 1–2 аудио в неделю уровнем выше (подкасты, новости на турецком).", en: "Stay sharp: 1–2 audios a week one level up (Turkish podcasts, news).", tr: "Formda kal: haftada 1–2 üst seviye ses (Türkçe podcast, haber).", kk: "Форманы сақта: аптасына 1–2 жоғарырақ деңгейдегі аудио (түрікше подкаст, жаңалық)." },
    ],
  },
  okuma: {
    weak: [
      { ru: "Читай короткий текст каждый день в кабинете Чтения; незнакомые слова — сразу в словарь.", en: "Read a short text daily in the Reading section; new words go straight to your vocabulary.", tr: "Her gün Okuma bölümünde kısa bir metin oku; bilmediğin kelimeleri hemen sözlüğe ekle.", kk: "Күн сайын Оқылым бөлімінде қысқа мәтін оқы; бейтаныс сөздерді бірден сөздікке қос." },
      { ru: "Ответ всегда ищи В ТЕКСТЕ, а не по памяти — подчёркивай место, где он написан.", en: "Always find the answer IN the text, not from memory — underline where it's stated.", tr: "Cevabı hafızadan değil METİNDEN bul — geçtiği yeri işaretle.", kk: "Жауапты жадыңнан емес, МӘТІННЕН тап — жазылған жерін белгіле." },
    ],
    mid: [
      { ru: "Тренируйся с таймером: 5 вопросов за ~7 минут, как на экзамене.", en: "Practise against the clock: 5 questions in ~7 minutes, exam pace.", tr: "Süre tutarak çalış: sınav temposunda ~7 dakikada 5 soru.", kk: "Таймермен жаттық: емтихан қарқынымен ~7 минутта 5 сұрақ." },
      { ru: "Отрабатывай вопросы-ловушки «что верно/неверно по тексту» — сверяй каждый вариант с текстом.", en: "Drill the “which is true/false” traps — check every option against the text.", tr: "«Hangisi doğru/yanlış» tuzaklarını çalış — her şıkkı metinle karşılaştır.", kk: "«Қайсысы дұрыс/бұрыс» қақпан сұрақтарын жаттық — әр нұсқаны мәтінмен салыстыр." },
    ],
    strong: [
      { ru: "Переходи на тексты уровнем выше: статьи и колонки — именно они на B2/C1.", en: "Move to texts one level up: articles and columns — that's what B2/C1 tests.", tr: "Bir üst seviye metinlere geç: makaleler ve köşe yazıları — B2/C1 bunları sorar.", kk: "Бір деңгей жоғары мәтіндерге көш: мақалалар мен колонкалар — B2/C1 осыны сұрайды." },
    ],
  },
  yazma: {
    weak: [
      { ru: "Пиши в кабинете Письма 2–3 раза в неделю по 5–8 предложений — AI-экзаменатор разберёт каждую ошибку.", en: "Write 2–3 times a week (5–8 sentences) in the Writing section — the AI examiner reviews every error.", tr: "Haftada 2–3 kez Yazma bölümünde 5–8 cümle yaz — yapay zekâ her hatayı inceler.", kk: "Аптасына 2–3 рет Жазылым бөлімінде 5–8 сөйлем жаз — AI әр қатені талдайды." },
      { ru: "Держи каркас: вступление → 2 аргумента с примерами → вывод. Это половина балла за задание.", en: "Keep the frame: intro → 2 arguments with examples → conclusion. That's half the task score.", tr: "İskeleti koru: giriş → örnekli 2 argüman → sonuç. Görev puanının yarısı budur.", kk: "Қаңқаны ұста: кіріспе → мысалды 2 дәлел → қорытынды. Тапсырма баллының жартысы осы." },
    ],
    mid: [
      { ru: "Работай над связками (ancak, üstelik, dolayısıyla, buna rağmen) — они дают баллы за связность.", en: "Work on connectors (ancak, üstelik, dolayısıyla, buna rağmen) — they earn coherence points.", tr: "Bağlaçlara çalış (ancak, üstelik, dolayısıyla, buna rağmen) — tutarlılık puanı kazandırır.", kk: "Жалғаулықтармен жұмыс істе (ancak, üstelik, dolayısıyla) — байланыстылыққа балл береді." },
      { ru: "Перечитывай написанное один раз только на предмет окончаний падежей — самая частая потеря баллов.", en: "Re-read once checking case endings only — the most common point loss.", tr: "Yazdığını bir kez SADECE hâl ekleri için oku — en sık puan kaybı budur.", kk: "Жазғаныңды бір рет тек септік жалғауларын тексеріп оқы — балл көбіне осында кетеді." },
    ],
    strong: [
      { ru: "Тренируй полноформатные эссе 180+ слов с контраргументом — формат C1.", en: "Practise full essays of 180+ words with a counter-argument — the C1 format.", tr: "Karşı argümanlı 180+ kelimelik tam kompozisyonlar yaz — C1 formatı.", kk: "Қарсы дәлелі бар 180+ сөздік толық эссе жаз — C1 форматы." },
    ],
  },
  konusma: {
    weak: [
      { ru: "Проходи голосовые уроки 3 раза в неделю — Ahu ведёт урок по твоим слабым темам и разбирает ошибки.", en: "Take voice lessons 3× a week — Ahu teaches to your weak topics and reviews your errors.", tr: "Haftada 3 kez sesli ders yap — Ahu zayıf konularına göre ders işler, hatalarını inceler.", kk: "Аптасына 3 рет дауыстық сабақ өт — Ahu әлсіз тақырыптарың бойынша сабақ жүргізіп, қателеріңді талдайды." },
      { ru: "Отвечай развёрнуто: минимум 3–4 предложения на вопрос, даже простыми конструкциями.", en: "Answer at length: 3–4 sentences minimum per question, even with simple structures.", tr: "Uzun cevap ver: soru başına en az 3–4 cümle, basit yapılarla bile olur.", kk: "Толық жауап бер: әр сұраққа кемінде 3–4 сөйлем, қарапайым құрылыммен болса да." },
    ],
    mid: [
      { ru: "На уроках проси Ahu исправлять тебя сразу — и повторяй исправленную фразу вслух.", en: "Ask Ahu to correct you immediately — and repeat the corrected phrase aloud.", tr: "Ahu'dan seni hemen düzeltmesini iste — düzeltilmiş cümleyi sesli tekrar et.", kk: "Ahu-дан бірден түзетуін сұра — түзетілген сөйлемді дауыстап қайтала." },
    ],
    strong: [
      { ru: "Переходи на режимы Bölüm 2–3 (описание и аргументация) — это формат экзамена.", en: "Move to Bölüm 2–3 modes (description and argumentation) — the exam format.", tr: "Bölüm 2–3 modlarına geç (betimleme ve savunma) — sınav formatı budur.", kk: "Bölüm 2–3 режимдеріне көш (сипаттау және дәйектеу) — емтихан форматы осы." },
    ],
  },
};

function V3SectionAccordion({
  emoji,
  label,
  score,
  records,
  recs,
  locale,
  defaultOpen,
  children,
}: {
  emoji: string;
  label: string;
  score: number | null;
  records: AnswerRecord[];
  recs: Loc[];
  locale: Locale;
  defaultOpen: boolean;
  children?: React.ReactNode; // extra section-specific content (yazma subscores, konusma CTA)
}) {
  const [open, setOpen] = useState(defaultOpen);
  const gaps = records.filter((r) => !r.correct);
  const c = score != null ? barColor((score / 25) * 100) : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-black/[0.02]"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-[var(--color-foreground)] sm:text-base">
          <span>{emoji}</span>
          {label}
          {score != null && c ? (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ background: `linear-gradient(to right, ${c.from}, ${c.to})` }}
            >
              {score}/25
            </span>
          ) : (
            <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-xs font-semibold text-[var(--color-muted)]">—/25</span>
          )}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0 text-[var(--color-muted)]">
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 border-t border-black/[0.06] px-5 py-5">
              {children}

              {gaps.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#d97706]">{qt(locale, "gapsTitle")}</div>
                  <ul className="mt-2 flex flex-col gap-2">
                    {gaps.map((g, i) => (
                      <li key={i} className="rounded-xl bg-black/[0.03] p-3 text-sm text-[var(--color-foreground)]">
                        <div className="flex items-start gap-2">
                          <span>❌</span>
                          <span>{g.prompt}</span>
                        </div>
                        <div className="mt-1 pl-6 text-xs text-[var(--color-muted)]">
                          {qt(locale, "correctAnswerWord")}: <b className="text-[var(--color-foreground)]">{g.correctAnswer}</b>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recs.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-2)]">{qt(locale, "todoTitle")}</div>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {recs.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]">
                        <span className="text-[var(--color-brand)]">→</span>
                        <span>{r[locale] ?? r.ru}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ Result view ------------------------------ */
/** The full diagnostic result UI. Shared by /results and /quiz/result. */
export function ResultView({
  result,
  yazmaChecking,
  planVerdict,
}: {
  result: QuizResult;
  yazmaChecking?: boolean;
  /** honest plan verdict card — right after the level, before everything else */
  planVerdict?: React.ReactNode;
}) {
  const { exam } = useExam();
  const { locale } = useI18n();
  const router = useRouter();

  // full reset: a fresh diagnostic always starts at module 1
  function retake() {
    clearProgress();
    clearResult();
    router.push("/quiz");
  }

  const C = 2 * Math.PI * 52;
  const plan = PLANS[result.plan];
  const highRisk = result.overall < 65;

  const isV3 = result.version === 3 && !!result.sections;
  const sections = result.sections;
  const knownScores = sections
    ? [sections.dinleme, sections.okuma, sections.yazma, sections.konusma].filter(
        (v): v is number => typeof v === "number",
      )
    : [];
  const totalKnown = knownScores.reduce((a, b) => a + b, 0);
  const maxKnown = knownScores.length * 25;
  const allKnown = knownScores.length === 4;

  // v3 topic gap chips (all wrong tagged answers, any stage)
  const gapTopicIds = isV3
    ? [...new Set((result.answers ?? []).filter((a) => !a.correct && a.topic).map((a) => a.topic!))]
    : [];

  const review = result.yazmaReview;

  // ordered worst → best for the breakdown (legacy view)
  const orderedSkills = result.byWeakness.map((id) => result.skills.find((s) => s.id === id)!);

  // comparison markers (index over A0..C1)
  const youIdx = levelIndex(result.level);
  const pct = (i: number) => (i / (LEVEL_ORDER.length - 1)) * 100;

  return (
    <div className="w-full max-w-3xl py-4">
      {/* ============ 1. Overall level ============ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-7 text-center sm:p-9"
      >
        <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          {qt(locale, "yourLevel")} {exam.name}
        </span>
        <div className="relative mx-auto mt-4 h-44 w-44">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(16,24,40,0.08)" strokeWidth="10" />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="url(#rg)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C * (1 - result.overall / 100) }}
              transition={{ duration: 1.3, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#6d5bff" />
                <stop offset="1" stopColor="#19c6b3" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-gradient text-5xl font-bold">{result.level}</span>
            <span className="mt-1 text-sm font-medium text-[var(--color-foreground)]">{result.overall}/100</span>
            <span className="text-[11px] text-[var(--color-muted)]">{qt(locale, "correct")}</span>
          </div>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/[0.04] px-4 py-2 text-sm">
          {isV3 ? (
            <>
              <span className="text-[var(--color-muted)]">{exam.name}:</span>
              <span className="font-bold text-[var(--color-foreground)]">
                {allKnown
                  ? `≈ ${Math.max(0, totalKnown - 7)}–${Math.min(100, totalKnown + 5)} / 100`
                  : `${totalKnown}/${maxKnown} · ${qt(locale, "ofSections")}`}
              </span>
            </>
          ) : (
            <>
              <span className="text-[var(--color-muted)]">{qt(locale, "predicted")} {exam.name}:</span>
              <span className="font-bold text-[var(--color-foreground)]">
                ≈ {Math.max(0, result.overall - 10)}–{Math.min(100, result.overall + 5)} / 100
              </span>
            </>
          )}
        </div>
        <p className="mx-auto mt-2 max-w-md text-xs text-[var(--color-muted)]">{qt(locale, "approxNote")}</p>
        <p className="mx-auto mt-1 max-w-md text-xs font-medium text-[var(--color-foreground)]">{qt(locale, "thresholdsNote")}</p>
        {isV3 && levelIndex(result.level) >= levelIndex("B2") && (
          <p className="mx-auto mt-1 max-w-md text-xs text-[var(--color-muted)]">{qt(locale, "cefrCapNote")}</p>
        )}
      </motion.div>

      {/* ============ 1b. Honest plan verdict (founder: right after the
           result, before the route) ============ */}
      {planVerdict && <div className="mt-6">{planVerdict}</div>}

      {/* ============ 2. Sections (v3) / skill bars (legacy) ============ */}
      {isV3 && sections ? (
        <div className="glass mt-6 flex flex-col gap-5 rounded-3xl p-7">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{qt(locale, "secTitle")}</h2>
          <SectionRow label={qt(locale, "stDinleme")} emoji="🎧" score={sections.dinleme} delay={0} />
          <SectionRow label={qt(locale, "stOkuma")} emoji="📖" score={sections.okuma} delay={0.12} />
          <SectionRow
            label={qt(locale, "stYazma")}
            emoji="✍️"
            score={sections.yazma}
            delay={0.24}
            pendingNode={
              yazmaChecking ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border border-[var(--color-brand)] border-t-transparent" />
                  {qt(locale, "yazmaChecking")}
                </span>
              ) : (
                qt(locale, "yazmaPendingAuth")
              )
            }
          />
          <SectionRow
            label={qt(locale, "stKonusma")}
            emoji="🎤"
            score={sections.konusma}
            delay={0.36}
            pendingNode={
              <span className="flex flex-wrap items-center gap-2">
                {qt(locale, "konusmaPending")}
                <Link
                  href="/dashboard/speaking/live"
                  className="rounded-full bg-[var(--color-brand)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/20"
                >
                  {qt(locale, "konusmaCta")} →
                </Link>
              </span>
            }
          />
        </div>
      ) : (
        <div className="glass mt-6 flex flex-col gap-5 rounded-3xl p-7">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{qt(locale, "skills")}</h2>
          {result.skills.map((s, i) => (
            <SkillBar key={s.id} id={s.id} percent={s.percent} level={s.level} delay={i * 0.12} locale={locale} />
          ))}
        </div>
      )}

      {/* ============ 3. Detailed breakdown ============ */}
      {isV3 ? (
        <>
          {/* topic gap chips — the same map that feeds lesson focus */}
          {gapTopicIds.length > 0 && (
            <div className="glass mt-6 rounded-3xl p-7">
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{qt(locale, "gapsFound")}</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {gapTopicIds.map((t) => {
                  const topic = topicById(t);
                  return topic ? (
                    <span key={t} className="rounded-full bg-[var(--color-brand)]/[0.1] px-2.5 py-1 text-xs font-medium text-[var(--color-brand)]">
                      {topic.label[locale]}
                    </span>
                  ) : null;
                })}
              </div>
              <p className="mt-3 text-xs text-[var(--color-muted)]">{qt(locale, "focusNote")}</p>
            </div>
          )}

          {/* per-section breakdown: gaps + concrete recommendations */}
          <div className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-foreground)]">{qt(locale, "detailTitle")}</h2>
            <div className="flex flex-col gap-3">
              <V3SectionAccordion
                emoji="🎧"
                label={qt(locale, "stDinleme")}
                score={sections!.dinleme}
                records={(result.answers ?? []).filter((a) => a.module === "listening")}
                recs={SECTION_RECS.dinleme[bandOf(sections!.dinleme) ?? "weak"]}
                locale={locale}
                defaultOpen={bandOf(sections!.dinleme) === "weak"}
              />
              <V3SectionAccordion
                emoji="📖"
                label={qt(locale, "stOkuma")}
                score={sections!.okuma}
                records={(result.answers ?? []).filter((a) => a.module === "reading")}
                recs={SECTION_RECS.okuma[bandOf(sections!.okuma) ?? "weak"]}
                locale={locale}
                defaultOpen={bandOf(sections!.okuma) === "weak"}
              />
              <V3SectionAccordion
                emoji="✍️"
                label={qt(locale, "stYazma")}
                score={sections!.yazma}
                records={[]}
                recs={SECTION_RECS.yazma[bandOf(sections!.yazma) ?? "weak"]}
                locale={locale}
                defaultOpen={false}
              >
                {sections!.yazma == null && (
                  <p className="rounded-xl bg-black/[0.03] px-3 py-2 text-xs text-[var(--color-muted)]">
                    {yazmaChecking ? qt(locale, "yazmaChecking") : qt(locale, "yazmaPendingAuth")}
                  </p>
                )}
                {review?.valid && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(["task", "coherence", "grammar", "vocab"] as const).map((k) => (
                      <div key={k} className="rounded-xl bg-black/[0.03] px-3 py-2 text-center">
                        <div className="text-sm font-bold text-[var(--color-foreground)]">{review.subscores[k]}</div>
                        <div className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">{k}</div>
                      </div>
                    ))}
                  </div>
                )}
                {review?.valid && review.errors.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-[#d97706]">{qt(locale, "mainErrors")}</div>
                    <div className="mt-2 flex flex-col gap-2.5">
                      {review.errors.slice(0, 3).map((e, i) => (
                        <div key={i} className="rounded-xl bg-black/[0.03] p-3 text-sm">
                          <div>
                            <span className="text-[#dc2626] line-through decoration-[#dc2626]/60">{e.quote}</span>{" "}
                            → <span className="font-semibold text-[#16a34a]">{e.correction}</span>
                          </div>
                          <div className="mt-1 text-xs text-[var(--color-muted)]">
                            <b>{e.rule}</b>{e.explanation ? ` — ${e.explanation}` : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {review?.valid && review.advice.length > 0 && (
                  <ul className="flex flex-col gap-1.5">
                    {review.advice.slice(0, 3).map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]">
                        <span className="text-[var(--color-brand)]">💡</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </V3SectionAccordion>
              <V3SectionAccordion
                emoji="🎤"
                label={qt(locale, "stKonusma")}
                score={sections!.konusma}
                records={[]}
                recs={SECTION_RECS.konusma[bandOf(sections!.konusma) ?? "weak"]}
                locale={locale}
                defaultOpen={false}
              >
                {sections!.konusma == null && (
                  <p className="flex flex-wrap items-center gap-2 rounded-xl bg-black/[0.03] px-3 py-2 text-xs text-[var(--color-muted)]">
                    {qt(locale, "konusmaPending")}
                    <Link
                      href="/dashboard/speaking/live"
                      className="rounded-full bg-[var(--color-brand)]/10 px-2.5 py-1 font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/20"
                    >
                      {qt(locale, "konusmaCta")} →
                    </Link>
                  </p>
                )}
              </V3SectionAccordion>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6">
          {/* honest upgrade note: old-format results have no /25 sections or
              recommendations — say so and offer the new diagnostic instead of
              silently showing less (founder feedback: "не пусто") */}
          <div className="mb-4 rounded-2xl border border-[var(--color-brand)]/25 bg-[var(--color-brand)]/[0.06] p-5">
            <p className="text-sm leading-relaxed text-[var(--color-foreground)]">{qt(locale, "v2UpsellText")}</p>
            <Link href="/quiz" className="btn-primary mt-3 inline-block rounded-full px-5 py-2.5 text-sm font-semibold">
              {qt(locale, "v2UpsellCta")} →
            </Link>
          </div>
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-foreground)]">{qt(locale, "detailTitle")}</h2>
          <div className="flex flex-col gap-3">
            {orderedSkills.map((s, i) => (
              <ModuleAccordion
                key={s.id}
                id={s.id}
                percent={s.percent}
                level={s.level}
                records={(result.answers ?? []).filter((a) => a.module === s.id)}
                locale={locale}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* ============ 4. Exam forecast ============ */}
      <div className="border-gradient mt-6 rounded-3xl p-7">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
          {qt(locale, "forecastTitle")} {exam.name}
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#dc2626]/25 bg-[#dc2626]/[0.05] p-4">
            <div className="text-xs font-medium text-[var(--color-muted)]">{qt(locale, "ifNow")}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#dc2626]" />
              <span className="text-sm text-[var(--color-foreground)]">
                {qt(locale, "likelyResult")}:{" "}
                <span className="font-bold">{result.level}</span> · {qt(locale, "readinessWord")}{" "}
                <span className="font-bold">{result.overall}%</span>
              </span>
            </div>
            {highRisk && <div className="mt-2 text-xs text-[#b91c1c]">{qt(locale, "riskText")}</div>}
          </div>

          <div className="rounded-2xl border border-[#16a34a]/25 bg-[#16a34a]/[0.05] p-4">
            <div className="text-xs font-medium text-[var(--color-muted)]">{qt(locale, "afterPrep")}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#16a34a]" />
              <span className="text-sm text-[var(--color-foreground)]">
                {qt(locale, "expectedResult")}: <span className="font-bold">B2 / C1</span>
              </span>
            </div>
            <div className="mt-2 text-xs text-[var(--color-muted)]">
              {qt(locale, "termWord")}: {plan.desc[locale]}
            </div>
          </div>
        </div>

        {/* progress to C1 */}
        <div className="mt-6">
          <div className="relative h-2.5 w-full rounded-full bg-black/[0.06]">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(8, pct(youIdx))}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <div
              className="absolute -top-1 -translate-x-1/2 rounded-full border-2 border-white bg-[var(--color-brand)] shadow"
              style={{ left: `${Math.max(4, pct(youIdx))}%`, height: 18, width: 18 }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-[var(--color-muted)]">
            <span>{result.level} · {qt(locale, "nowLabel")}</span>
            <span>{qt(locale, "m1")}</span>
            <span>{qt(locale, "m3")}</span>
            <span className="font-semibold text-[var(--color-brand)]">C1</span>
          </div>
        </div>
      </div>

      {/* ============ 5. Personal plan ============ */}
      <div className="glass mt-6 rounded-3xl p-7">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{qt(locale, "planToC1")}</h2>
        <div className="mt-3 rounded-2xl bg-gradient-to-br from-[var(--color-brand)]/[0.08] to-[var(--color-brand-2)]/[0.08] p-5">
          <div className="text-xl font-bold text-[var(--color-foreground)]">{plan.title[locale]}</div>
          <div className="mt-1 text-sm font-medium text-[var(--color-brand)]">
            {result.level} → C1 · {plan.desc[locale]}
          </div>

          <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            {qt(locale, "stagesTitle")}
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            {plan.stages.map((st, i) => (
              <motion.div
                key={st.ru}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-sm text-[var(--color-foreground)]">{st[locale]}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ 6. Comparison ============ */}
      <div className="glass mt-6 rounded-3xl p-7">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{qt(locale, "compareTitle")}</h2>

        <div className="relative mt-12 mb-10">
          {/* scale */}
          <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-[#dc2626] via-[#f59e0b] to-[#16a34a]" />
          <div className="mt-2 flex justify-between text-[11px] font-medium text-[var(--color-muted)]">
            {LEVEL_ORDER.map((lv) => (
              <span key={lv}>{lv}</span>
            ))}
          </div>

          {/* you (above) */}
          <div
            className="absolute -top-9 -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${pct(youIdx)}%` }}
          >
            <div className="rounded-full bg-[var(--color-brand)] px-2.5 py-1 text-[11px] font-bold text-white shadow">
              {qt(locale, "youHere")}
            </div>
            <div className="mx-auto h-2 w-0.5 bg-[var(--color-brand)]" />
          </div>

          {/* needed for exam (below, right) */}
          <div
            className="absolute top-7 -translate-x-1/2 whitespace-nowrap text-center"
            style={{ left: `${pct(LEVEL_ORDER.length - 1)}%` }}
          >
            <div className="mx-auto h-2 w-0.5 bg-[#16a34a]" />
            <div className="mt-0.5 text-[10px] font-medium text-[#16a34a]">
              {qt(locale, "neededFor")} {exam.name}
            </div>
          </div>
        </div>

        <p className="rounded-xl bg-[var(--color-brand)]/[0.05] px-4 py-3 text-sm text-[var(--color-foreground)]">
          {qt(locale, "thresholdsNote")}
        </p>
      </div>

      {/* ============ 7. CTA ============ */}
      <div className="mt-7">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/pricing" className="btn-primary flex-1 rounded-full px-6 py-4 text-center text-sm">
            {pick(locale, { ru: "Выбрать тариф", en: "Choose a plan", tr: "Plan seç", kk: "Тариф таңдау" })} →
          </Link>
          <button type="button" onClick={retake} className="btn-ghost flex-1 rounded-full px-6 py-4 text-center text-sm font-medium">
            {qt(locale, "retake")}
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-[var(--color-muted)]">🎁 {qt(locale, "discountNote")}</p>
      </div>
    </div>
  );
}
