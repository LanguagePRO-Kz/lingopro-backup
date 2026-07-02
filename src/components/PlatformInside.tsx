"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick, term } from "@/lib/localized";
import { Reveal } from "./ui/Reveal";

type TabId = "speaking" | "tutor" | "plan" | "exam" | "feedback" | "stats" | "vocab";

type Content = { title: string; subtitle: string; cta: string; tabs: { id: TabId; label: string; path: string }[] };

const CONTENT: { ru: Content; en: Content; tr: Content; kk: Content } = {
  ru: {
    title: "Взгляни на платформу изнутри",
    subtitle: "Реальные экраны продукта — переключай вкладки.",
    cta: "Начать подготовку →",
    tabs: [
      { id: "speaking", label: "AI Öğretmen", path: "speaking" },
      { id: "tutor", label: "AI-преподаватель", path: "teacher" },
      { id: "plan", label: "Персональный план", path: "plan" },
      { id: "exam", label: "Пробный TÖMER", path: "exam" },
      { id: "feedback", label: "Детальный фидбек", path: "feedback" },
      { id: "stats", label: "Статистика", path: "stats" },
      { id: "vocab", label: "Словарь", path: "vocabulary" },
    ],
  },
  en: {
    title: "Take a look inside the platform",
    subtitle: "Real product screens — switch the tabs.",
    cta: "Start preparing →",
    tabs: [
      { id: "speaking", label: "AI Öğretmen", path: "speaking" },
      { id: "tutor", label: "AI tutor", path: "teacher" },
      { id: "plan", label: "Personal plan", path: "plan" },
      { id: "exam", label: "Mock TÖMER", path: "exam" },
      { id: "feedback", label: "Detailed feedback", path: "feedback" },
      { id: "stats", label: "Statistics", path: "stats" },
      { id: "vocab", label: "Vocabulary", path: "vocabulary" },
    ],
  },
  tr: {
    title: "Platforma içeriden bak",
    subtitle: "Gerçek ürün ekranları — sekmeleri değiştir.",
    cta: "Hazırlığa başla →",
    tabs: [
      { id: "speaking", label: "AI Öğretmen", path: "speaking" },
      { id: "tutor", label: "AI öğretmen", path: "teacher" },
      { id: "plan", label: "Kişisel plan", path: "plan" },
      { id: "exam", label: "Deneme TÖMER", path: "exam" },
      { id: "feedback", label: "Ayrıntılı geri bildirim", path: "feedback" },
      { id: "stats", label: "İstatistik", path: "stats" },
      { id: "vocab", label: "Sözlük", path: "vocabulary" },
    ],
  },
  kk: {
    title: "Платформаға іштен қара",
    subtitle: "Нақты өнім экрандары — қойындыларды ауыстыр.",
    cta: "Дайындықты бастау →",
    tabs: [
      { id: "speaking", label: "AI Öğretmen", path: "speaking" },
      { id: "tutor", label: "AI-мұғалім", path: "teacher" },
      { id: "plan", label: "Жеке жоспар", path: "plan" },
      { id: "exam", label: "Сынақ TÖMER", path: "exam" },
      { id: "feedback", label: "Толық фидбек", path: "feedback" },
      { id: "stats", label: "Статистика", path: "stats" },
      { id: "vocab", label: "Сөздік", path: "vocabulary" },
    ],
  },
};

/* ---------------------------- browser frame ---------------------------- */
function Chrome({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div className="border-gradient overflow-hidden rounded-[1.6rem] p-2.5">
      <div className="rounded-[1.3rem] bg-white">
        <div className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 flex-1 truncate rounded-md bg-black/[0.04] px-3 py-1 text-xs text-[var(--color-muted)]">
            lingopro.app/{path}
          </span>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function Mock({ id, path }: { id: TabId; path: string }) {
  return (
    <Chrome path={path}>
      {id === "speaking" && <SpeakingMock />}
      {id === "tutor" && <TutorMock />}
      {id === "plan" && <PlanMock />}
      {id === "exam" && <ExamMock />}
      {id === "feedback" && <FeedbackMock />}
      {id === "stats" && <StatsMock />}
      {id === "vocab" && <VocabMock />}
    </Chrome>
  );
}

/* ------------------------------ 1. Speaking ----------------------------- */
function SpeakingMock() {
  const { locale } = useI18n();
  const m = pick(locale, {
    ru: { status: "Нажмите на микрофон и говорите по-турецки", student: "Студент", teacher: "Öğretmen", newWord: "Yeni", meaning: "спасибо", hint: "AI öğretmen · Türkçe konuşma" },
    en: { status: "Tap the microphone and speak Turkish", student: "Student", teacher: "Öğretmen", newWord: "New", meaning: "thank you", hint: "AI tutor · Turkish speaking" },
    tr: { status: "Mikrofona bas ve Türkçe konuş", student: "Öğrenci", teacher: "Öğretmen", newWord: "Yeni", meaning: "teşekkür", hint: "AI öğretmen · Türkçe konuşma" },
    kk: { status: "Микрофонды бас та түрікше сөйле", student: "Студент", teacher: "Öğretmen", newWord: "Yeni", meaning: "рахмет", hint: "AI-мұғалім · түрікше сөйлеу" },
  });
  const student = "Merhaba, nasılsınız?";
  const teacher = "Merhaba! Ben iyiyim, teşekkür ederim. Sen nasılsın?";
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="rounded-full bg-[var(--color-brand)]/10 px-3 py-1 text-[11px] font-medium text-[var(--color-brand)]">{m.hint}</span>

      {/* avatar 200px with SVG face */}
      <div className="relative mt-1 flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
        <span className="absolute inset-3 animate-ping rounded-full bg-[var(--color-brand)]/20" />
        <span className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] shadow-[0_16px_40px_-10px_rgba(109,91,255,0.6)] sm:h-40 sm:w-40">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
            <circle cx="27" cy="30" r="4.5" fill="white" />
            <circle cx="45" cy="30" r="4.5" fill="white" />
            <path d="M25 44c3.2 4 7 6 11 6s7.8-2 11-6" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </span>
      </div>

      <p className="text-xs text-[var(--color-muted)]">{m.status}</p>

      {/* mic button */}
      <button type="button" aria-hidden className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-white shadow-lg">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 4a3 3 0 013 3v4a3 3 0 11-6 0V7a3 3 0 013-3zM5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {/* subtitles */}
      <div className="mt-1 flex w-full flex-col gap-2 text-sm">
        <div className="max-w-[88%] self-start rounded-2xl rounded-tl-sm bg-black/[0.04] px-3.5 py-2 text-left">
          <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">{m.student}</span>
          <span className="text-[var(--color-foreground)]">{student}</span>
        </div>
        <div className="max-w-[88%] self-end rounded-2xl rounded-tr-sm bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-3)] px-3.5 py-2 text-left text-white">
          <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-white/70">{m.teacher}</span>
          {teacher}
        </div>
        <div className="self-start rounded-xl bg-[var(--color-brand-2)]/[0.1] px-3 py-1.5 text-left text-[13px] text-[var(--color-foreground)]">
          📚 {m.newWord}: <span className="font-semibold">teşekkür ederim</span> — {m.meaning}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ 2. Tutor -------------------------------- */
function TutorMock() {
  const { locale } = useI18n();
  const m = pick(locale, {
    ru: { q: "Почему здесь «okula», а не «okul»? 🤔", a1: "Направление движения требует дательного падежа: «okul → okula» («в школу»). После согласной добавляем -a/-e.", a2: "Попробуй: «Eve gidiyorum» — куда я иду? 🏠", ask: "Спроси AI-преподавателя…" },
    en: { q: "Why «okula» here, not «okul»? 🤔", a1: "Direction of motion needs the dative case: «okul → okula» («to school»). After a consonant add -a/-e.", a2: "Try: «Eve gidiyorum» — where am I going? 🏠", ask: "Ask the AI tutor…" },
    tr: { q: "Neden burada «okula», «okul» değil? 🤔", a1: "Yön belirten hareket -e hâlini ister: «okul → okula». Ünsüzden sonra -a/-e eklenir.", a2: "Dene: «Eve gidiyorum» — nereye gidiyorum? 🏠", ask: "AI öğretmene sor…" },
    kk: { q: "Неге мұнда «okula», «okul» емес? 🤔", a1: "Қозғалыс бағыты барыс септігін қажет етеді: «okul → okula» («мектепке»).", a2: "Байқап көр: «Eve gidiyorum» — қайда барамын? 🏠", ask: "AI-мұғалімнен сұра…" },
  });
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-sm text-white">AI</span>
        <span className="text-sm font-semibold text-[var(--color-foreground)]">LingoPRO AI</span>
      </div>
      <div className="flex flex-col gap-3 text-sm">
        <div className="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-black/[0.04] px-3.5 py-2.5 text-[var(--color-foreground)]">{m.q}</div>
        <div className="max-w-[88%] self-end rounded-2xl rounded-tr-sm bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-3)] px-3.5 py-2.5 text-white">{m.a1}</div>
        <div className="max-w-[88%] self-end rounded-2xl rounded-tr-sm bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-3)] px-3.5 py-2.5 text-white">{m.a2}</div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-full border border-black/[0.08] bg-black/[0.02] px-4 py-2.5 text-sm text-[var(--color-muted)]">
        {m.ask}
        <span className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-white">↑</span>
      </div>
    </div>
  );
}

/* ------------------------------ 3. Plan --------------------------------- */
function PlanMock() {
  const { locale } = useI18n();
  const m = pick(locale, {
    ru: { day: "День 5 из 30", today: "Задачи на сегодня", done: "выполнено", tasks: ["Грамматика: падежи", "Лексика: 15 слов", "Аудирование: диалог", "Чтение: текст A2", "Говорение: 1 мин"] },
    en: { day: "Day 5 of 30", today: "Today's tasks", done: "done", tasks: ["Grammar: cases", "Vocabulary: 15 words", "Listening: dialogue", "Reading: A2 text", "Speaking: 1 min"] },
    tr: { day: "30 günün 5. günü", today: "Bugünün görevleri", done: "tamamlandı", tasks: ["Dil bilgisi: hâller", "Kelime: 15 sözcük", "Dinleme: diyalog", "Okuma: A2 metni", "Konuşma: 1 dk"] },
    kk: { day: "30 күннің 5-күні", today: "Бүгінгі тапсырмалар", done: "орындалды", tasks: ["Грамматика: септіктер", "Лексика: 15 сөз", "Тыңдалым: диалог", "Оқу: A2 мәтіні", "Сөйлеу: 1 мин"] },
  });
  const doneCount = 3;
  return (
    <div>
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] p-4 text-white">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-white/70">{m.today}</div>
          <div className="mt-0.5 text-lg font-bold">{m.day}</div>
        </div>
        <div className="text-2xl">🔥</div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]" style={{ width: `${(doneCount / m.tasks.length) * 100}%` }} />
      </div>
      <div className="mt-1 text-right text-[11px] text-[var(--color-muted)]">{doneCount}/{m.tasks.length} {m.done}</div>
      <ul className="mt-3 flex flex-col gap-2">
        {m.tasks.map((task, i) => {
          const ok = i < doneCount;
          return (
            <li key={task} className="flex items-center gap-2.5 rounded-xl border border-black/[0.06] bg-black/[0.02] px-3.5 py-2.5 text-sm">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] ${ok ? "bg-[var(--color-brand-2)] text-white" : "border border-black/[0.15]"}`}>{ok ? "✓" : ""}</span>
              <span className={ok ? "text-[var(--color-muted)] line-through" : "text-[var(--color-foreground)]"}>{task}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------ 4. Exam --------------------------------- */
function ExamMock() {
  const { locale } = useI18n();
  const m = pick(locale, {
    ru: { module: "Грамматика", q: "Boşluğa uygun eki seçin:", sentence: "«Ben okul___ gidiyorum.»", qnum: "Вопрос 7 / 40" },
    en: { module: "Grammar", q: "Choose the correct suffix:", sentence: "«Ben okul___ gidiyorum.»", qnum: "Question 7 / 40" },
    tr: { module: "Dil bilgisi", q: "Boşluğa uygun eki seçin:", sentence: "«Ben okul___ gidiyorum.»", qnum: "Soru 7 / 40" },
    kk: { module: "Грамматика", q: "Бос орынға сәйкес жұрнақты таңда:", sentence: "«Ben okul___ gidiyorum.»", qnum: "Сұрақ 7 / 40" },
  });
  const opts = ["okul", "okula", "okulda", "okulun"];
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[11px] text-[var(--color-muted)]">{m.module}</span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-foreground)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-red)]" /> 58:42
        </span>
      </div>
      <div className="text-[11px] text-[var(--color-muted)]">{m.qnum}</div>
      <p className="mt-1 text-sm font-medium text-[var(--color-foreground)]">{m.q}</p>
      <p className="mt-1 text-base font-semibold text-[var(--color-foreground)]">{m.sentence}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {opts.map((o, i) => (
          <div key={o} className={`rounded-xl border px-3 py-2 text-sm ${i === 1 ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-foreground)]" : "border-black/[0.07] bg-black/[0.02] text-[var(--color-muted)]"}`}>{o}</div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-10 gap-1">
        {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => (
          <span key={n} className={`flex aspect-square items-center justify-center rounded-[5px] text-[9px] font-medium ${n === 7 ? "bg-[var(--color-brand)] text-white" : n < 7 ? "bg-[var(--color-brand-2)]/15 text-[var(--color-brand-2)]" : "bg-black/[0.04] text-[var(--color-muted)]"}`}>{n}</span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ 5. Feedback ----------------------------- */
function FeedbackMock() {
  const { locale } = useI18n();
  const m = pick(locale, {
    ru: { q: "«Eve gel___, beni ara.»", chosen: "gelince", correct: "Правильно!", expl: "«gelince» — «когда придёшь». Суффикс -ince присоединяется к основе глагола и указывает, что второе действие следует за первым.", remember: "Запомните: суффикс -ince используется для последовательных действий" },
    en: { q: "«Eve gel___, beni ara.»", chosen: "gelince", correct: "Correct!", expl: "«gelince» — «when you arrive». The -ince suffix attaches to the verb stem and shows one action follows another.", remember: "Remember: the -ince suffix is used for sequential actions" },
    tr: { q: "«Eve gel___, beni ara.»", chosen: "gelince", correct: "Doğru!", expl: "«gelince» — «geldiğinde». -ince eki fiil köküne gelir ve bir eylemin diğerini takip ettiğini gösterir.", remember: "Unutma: -ince eki ardışık eylemler için kullanılır" },
    kk: { q: "«Eve gel___, beni ara.»", chosen: "gelince", correct: "Дұрыс!", expl: "«gelince» — «келгенде». -ince жұрнағы етістік түбіріне жалғанып, бір әрекеттің екіншісінен кейін болатынын білдіреді.", remember: "Есте сақта: -ince жұрнағы кезектес әрекеттерге қолданылады" },
  });
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm text-[var(--color-foreground)]">{m.q}</div>
      <div className="flex items-center gap-2 rounded-2xl border border-[#16a34a]/30 bg-[#16a34a]/[0.08] px-4 py-3">
        <span className="text-lg">✅</span>
        <div>
          <div className="text-sm font-semibold text-[#16a34a]">{m.correct}</div>
          <div className="text-sm text-[var(--color-foreground)]">{m.chosen}</div>
        </div>
      </div>
      <div className="rounded-2xl border-gradient p-4">
        <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-brand)]">
          <span>✦</span> {term(locale, "aiReco")}
        </div>
        <p className="text-[13px] leading-relaxed text-[var(--color-foreground)]">{m.expl}</p>
        <div className="mt-2.5 rounded-xl bg-[var(--color-brand-2)]/[0.1] px-3 py-2 text-[13px] text-[var(--color-foreground)]">
          📚 {m.remember}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ 6. Stats -------------------------------- */
function StatsMock() {
  const { locale } = useI18n();
  const m = pick(locale, {
    ru: { streak: "Серия", days: "12 дней подряд", goal: "Прогресс к цели", skills: [["Чтение", 72], ["Аудирование", 58], ["Лексика", 81], ["Грамматика", 64]] as [string, number][] },
    en: { streak: "Streak", days: "12 days in a row", goal: "Progress to goal", skills: [["Reading", 72], ["Listening", 58], ["Vocabulary", 81], ["Grammar", 64]] as [string, number][] },
    tr: { streak: "Seri", days: "12 gün üst üste", goal: "Hedefe ilerleme", skills: [["Okuma", 72], ["Dinleme", 58], ["Kelime", 81], ["Dil bilgisi", 64]] as [string, number][] },
    kk: { streak: "Серия", days: "12 күн қатарынан", goal: "Мақсатқа ілгерілеу", skills: [["Оқу", 72], ["Тыңдалым", 58], ["Лексика", 81], ["Грамматика", 64]] as [string, number][] },
  });
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#ef4444] p-4 text-white">
          <div className="text-[10px] uppercase tracking-wide text-white/70">{m.streak}</div>
          <div className="mt-1 text-xl font-bold">🔥 {m.days}</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#5b4bd6] to-[#3a1d9c] p-4 text-white">
          <div className="text-[10px] uppercase tracking-wide text-white/60">{m.goal}</div>
          <div className="mt-1 flex items-center gap-2 text-lg font-bold">A2 <span className="text-white/60">→</span> C1</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-[40%] rounded-full bg-white" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4">
        {m.skills.map(([name, val]) => (
          <div key={name}>
            <div className="mb-1 flex justify-between text-xs text-[var(--color-muted)]">
              <span>{name}</span>
              <span>{val}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]" style={{ width: `${val}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ 7. Vocab -------------------------------- */
function VocabMock() {
  const { locale } = useI18n();
  const words = ["kütüphane", "başvuru", "gelişmek", "sınav", "yeterlilik"];
  const levels = ["A2", "B1", "B1", "A2", "B2"];
  const meanings = pick(locale, {
    ru: ["библиотека", "заявление", "развиваться", "экзамен", "квалификация"],
    en: ["library", "application", "to develop", "exam", "proficiency"],
    tr: ["kitaplık", "müracaat", "ilerlemek", "deneme", "ehliyet"],
    kk: ["кітапхана", "өтініш", "дамыту", "емтихан", "біліктілік"],
  });
  return (
    <ul className="mx-auto flex max-w-md flex-col gap-2">
      {words.map((w, i) => (
        <li key={w} className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-black/[0.02] px-3.5 py-2.5 text-sm">
          <span className="font-semibold text-[var(--color-foreground)]">{w}</span>
          <span className="text-[var(--color-muted)]">{meanings[i]}</span>
          <span className="rounded-full bg-[var(--color-brand)]/[0.1] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-brand)]">{levels[i]}</span>
        </li>
      ))}
    </ul>
  );
}

export function PlatformInside() {
  const { locale } = useI18n();
  const c = pick(locale, CONTENT);
  const [active, setActive] = useState<TabId>("speaking");
  const tab = c.tabs.find((t) => t.id === active) ?? c.tabs[0];

  return (
    <section id="platform" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{c.title}</h2>
          <p className="mt-4 text-base text-[var(--color-muted)]">{c.subtitle}</p>
        </Reveal>

        <Reveal className="mt-10">
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {c.tabs.map((t) => {
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(t.id)}
                  aria-pressed={isActive}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="platform-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative mx-auto max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Mock id={active} path={tab.path} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/quiz" className="btn-primary rounded-full px-7 py-3.5 text-sm">
              {c.cta}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
