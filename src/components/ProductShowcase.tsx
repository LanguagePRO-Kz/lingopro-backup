"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n, type Locale } from "@/lib/i18n";
import { pick, term } from "@/lib/localized";
import { Reveal } from "./ui/Reveal";

type TabId = "diagnostic" | "tutor" | "speaking" | "writing" | "exam" | "mentor";

type Tab = { id: TabId; label: string; heading: string; text: string; bullets: string[] };
type Content = { eyebrow: string; title: string; subtitle: string; tabs: Tab[] };

const CONTENT: Record<Locale, Content> = {
  ru: {
    eyebrow: "Внутри платформы",
    title: "Один продукт — весь путь подготовки",
    subtitle:
      "Диагностика, AI-преподаватель, разговорная практика, проверка письма и пробный TÖMER — в едином интерфейсе.",
    tabs: [
      {
        id: "diagnostic",
        label: "AI-диагностика",
        heading: "Узнай свой реальный уровень",
        text: "AI анализирует не только правильные ответы, но и типичные ошибки, скорость и уверенность — и определяет точку старта от A1 до C1.",
        bullets: ["Оценка по 5 навыкам", "Прогноз готовности к TÖMER", "Ориентировочный срок подготовки"],
      },
      {
        id: "tutor",
        label: "AI-преподаватель",
        heading: "Объясняет так, как нужно именно тебе",
        text: "Разбирает ошибки простыми словами, отвечает на вопросы и подбирает упражнения под твой уровень и цель.",
        bullets: ["Объяснение ошибок", "Персональные упражнения", "Адаптация сложности"],
      },
      {
        id: "speaking",
        label: "Разговор",
        heading: "Говори на турецком увереннее",
        text: "Распознаёт речь, отмечает произношение и беглость, предлагает, что подтянуть до экзамена.",
        bullets: ["Анализ произношения", "Оценка беглости", "Рекомендации AI"],
      },
      {
        id: "writing",
        label: "Письмо",
        heading: "Проверка письменных заданий",
        text: "Находит ошибки, объясняет правила и показывает улучшенный вариант с оценкой уровня.",
        bullets: ["Исправления и объяснения", "Улучшенный вариант", "Оценка уровня"],
      },
      {
        id: "exam",
        label: "Пробный TÖMER",
        heading: "Тренируйся в формате экзамена",
        text: "Полный формат с таймером, автоматическая проверка, прогноз результата и план по слабым зонам.",
        bullets: ["Таймер и модули", "Прогноз результата", "Анализ слабых зон"],
      },
    ],
  },
  kk: {
    eyebrow: "Платформа ішінде",
    title: "Бір өнім — дайындықтың бүкіл жолы",
    subtitle:
      "Диагностика, AI-мұғалім, сөйлеу практикасы, жазуды тексеру және сынақ TÖMER — біртұтас интерфейсте.",
    tabs: [
      {
        id: "diagnostic",
        label: "AI-диагностика",
        heading: "Нақты деңгейіңді біл",
        text: "AI дұрыс жауаптарды ғана емес, қателерді, жылдамдық пен сенімділікті талдап, A1-ден C1-ге дейінгі бастау нүктесін анықтайды.",
        bullets: ["5 дағды бойынша баға", "TÖMER-ге дайындық болжамы", "Дайындықтың шамамен мерзімі"],
      },
      {
        id: "tutor",
        label: "AI-мұғалім",
        heading: "Дәл саған қажет етіп түсіндіреді",
        text: "Қателерді қарапайым тілмен талдайды, сұрақтарға жауап береді және деңгейіңе сай жаттығу таңдайды.",
        bullets: ["Қателерді түсіндіру", "Жеке жаттығулар", "Күрделілікті бейімдеу"],
      },
      {
        id: "speaking",
        label: "Сөйлеу",
        heading: "Түрікше сенімдірек сөйле",
        text: "Сөйлеуді танып, айтылым мен жатықтықты бағалайды, емтиханға дейін нені жетілдіру керегін ұсынады.",
        bullets: ["Айтылым талдауы", "Жатықтық бағасы", "AI ұсыныстары"],
      },
      {
        id: "writing",
        label: "Жазу",
        heading: "Жазба тапсырмаларды тексеру",
        text: "Қателерді табады, ережелерді түсіндіреді және деңгей бағасымен жақсартылған нұсқаны көрсетеді.",
        bullets: ["Түзетулер мен түсіндірме", "Жақсартылған нұсқа", "Деңгей бағасы"],
      },
      {
        id: "exam",
        label: "Сынақ TÖMER",
        heading: "Емтихан форматында жаттық",
        text: "Таймермен толық формат, автоматты тексеру, нәтиже болжамы және әлсіз тұстар жоспары.",
        bullets: ["Таймер мен модульдер", "Нәтиже болжамы", "Әлсіз тұстарды талдау"],
      },
    ],
  },
  en: {
    eyebrow: "Inside the platform",
    title: "One product — the entire prep journey",
    subtitle:
      "Diagnostic, AI tutor, speaking practice, writing review and a mock TÖMER — in a single interface.",
    tabs: [
      {
        id: "diagnostic",
        label: "AI diagnostic",
        heading: "Find out your real level",
        text: "AI analyses not only correct answers but typical mistakes, speed and confidence — pinpointing your start from A1 to C1.",
        bullets: ["Scoring across 5 skills", "TÖMER readiness forecast", "Estimated prep timeline"],
      },
      {
        id: "tutor",
        label: "AI tutor",
        heading: "Explains the way you need",
        text: "Breaks down mistakes in plain words, answers questions and picks exercises for your level and goal.",
        bullets: ["Mistake explanations", "Personal exercises", "Adaptive difficulty"],
      },
      {
        id: "speaking",
        label: "Speaking",
        heading: "Speak Turkish with confidence",
        text: "Recognises speech, scores pronunciation and fluency, and suggests what to improve before the exam.",
        bullets: ["Pronunciation analysis", "Fluency score", "AI recommendations"],
      },
      {
        id: "writing",
        label: "Writing",
        heading: "Written assignment review",
        text: "Finds errors, explains the rules and shows an improved version with a level estimate.",
        bullets: ["Fixes and explanations", "Improved version", "Level estimate"],
      },
      {
        id: "exam",
        label: "Mock TÖMER",
        heading: "Practise in exam format",
        text: "Full timed format, automatic grading, a result forecast and a plan for weak areas.",
        bullets: ["Timer and modules", "Result forecast", "Weak-area analysis"],
      },
    ],
  },
  tr: {
    eyebrow: "Platformun içinde",
    title: "Tek ürün — hazırlığın tüm yolu",
    subtitle:
      "Tanı, AI öğretmen, konuşma pratiği, yazma değerlendirmesi ve deneme TÖMER — tek bir arayüzde.",
    tabs: [
      {
        id: "diagnostic",
        label: "AI tanı",
        heading: "Gerçek seviyeni öğren",
        text: "AI yalnızca doğru cevapları değil, tipik hataları, hızı ve güveni de analiz eder; A1'den C1'e başlangıç noktanı belirler.",
        bullets: ["5 beceride puanlama", "TÖMER hazırlık tahmini", "Tahmini hazırlık süresi"],
      },
      {
        id: "tutor",
        label: "AI öğretmen",
        heading: "Tam sana göre açıklar",
        text: "Hataları basit anlatır, sorularını yanıtlar ve seviyene, hedefine göre alıştırma seçer.",
        bullets: ["Hata açıklamaları", "Kişisel alıştırmalar", "Uyarlanabilir zorluk"],
      },
      {
        id: "speaking",
        label: "Konuşma",
        heading: "Türkçe'yi güvenle konuş",
        text: "Konuşmayı tanır, telaffuz ve akıcılığı puanlar, sınavdan önce neyi geliştireceğini önerir.",
        bullets: ["Telaffuz analizi", "Akıcılık puanı", "AI önerileri"],
      },
      {
        id: "writing",
        label: "Yazma",
        heading: "Yazılı ödev değerlendirmesi",
        text: "Hataları bulur, kuralları açıklar ve seviye tahminiyle geliştirilmiş bir sürüm gösterir.",
        bullets: ["Düzeltmeler ve açıklamalar", "Geliştirilmiş sürüm", "Seviye tahmini"],
      },
      {
        id: "exam",
        label: "Deneme TÖMER",
        heading: "Sınav formatında çalış",
        text: "Süreli tam format, otomatik değerlendirme, sonuç tahmini ve zayıf alanlar için plan.",
        bullets: ["Süre ve modüller", "Sonuç tahmini", "Zayıf alan analizi"],
      },
    ],
  },
};

const MENTOR_TAB: Record<Locale, Tab> = {
  ru: {
    id: "mentor",
    label: "AI-ментор",
    heading: "Поможет не бросить подготовку",
    text: "Следит за планом, поддерживает серию дней, мягче нагружает в сложные периоды и возвращает к цели.",
    bullets: ["Контроль плана и напоминания", "Поддержка серии дней", "Адаптация нагрузки"],
  },
  kk: {
    id: "mentor",
    label: "AI-ментор",
    heading: "Дайындықты тастамауға көмектеседі",
    text: "Жоспарды бақылайды, күндер сериясын қолдайды, қиын кезеңде жүктемені азайтады және мақсатқа қайтарады.",
    bullets: ["Жоспарды бақылау мен еске салу", "Күндер сериясын қолдау", "Жүктемені бейімдеу"],
  },
  en: {
    id: "mentor",
    label: "AI mentor",
    heading: "Helps you not quit",
    text: "Tracks your plan, keeps your streak alive, eases the load in hard weeks and brings you back to your goal.",
    bullets: ["Plan tracking and reminders", "Streak support", "Adaptive workload"],
  },
  tr: {
    id: "mentor",
    label: "AI mentor",
    heading: "Bırakmamana yardım eder",
    text: "Planı takip eder, seriyi canlı tutar, zor haftalarda yükü azaltır ve seni hedefine geri getirir.",
    bullets: ["Plan takibi ve hatırlatmalar", "Seri desteği", "Uyarlanabilir yük"],
  },
};

/* ---------- Per-tab product mockups (Turkish lesson content stays Turkish) ---------- */

function Mock({ id }: { id: TabId }) {
  if (id === "diagnostic") return <DiagnosticMock />;
  if (id === "tutor") return <TutorMock />;
  if (id === "speaking") return <SpeakingMock />;
  if (id === "writing") return <WritingMock />;
  if (id === "mentor") return <MentorMock />;
  return <ExamMock />;
}

function MentorMock() {
  const { locale } = useI18n();
  const m = pick(locale, {
    ru: {
      streak: "Серия: 12 дней",
      weekDone: "Недельный план выполнен на 62%",
      msg: "Ты уже прошёл 62% недельного плана 💪 Осталось одно короткое занятие, чтобы сохранить серию из 12 дней.",
      btn: "Продолжить занятие · 8 мин",
    },
    en: {
      streak: "Streak: 12 days",
      weekDone: "Weekly plan 62% done",
      msg: "You've completed 62% of the weekly plan 💪 One short lesson left to keep your 12-day streak.",
      btn: "Continue lesson · 8 min",
    },
    tr: {
      streak: "Seri: 12 gün",
      weekDone: "Haftalık plan %62 tamamlandı",
      msg: "Haftalık planın %62'sini tamamladın 💪 12 günlük seriyi korumak için bir kısa ders kaldı.",
      btn: "Derse devam et · 8 dk",
    },
    kk: {
      streak: "Серия: 12 күн",
      weekDone: "Апталық жоспар 62% орындалды",
      msg: "Апталық жоспардың 62%-ын орындадың 💪 12 күндік серияны сақтау үшін бір қысқа сабақ қалды.",
      btn: "Сабақты жалғастыр · 8 мин",
    },
  });
  return (
    <Chrome label="lingopro.app / mentor">
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[var(--color-brand)]/10 to-[var(--color-brand-2)]/10 p-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-xl">
          🔥
        </span>
        <div>
          <div className="text-sm font-semibold text-[var(--color-foreground)]">{m.streak}</div>
          <div className="text-[11px] text-[var(--color-muted)]">{m.weekDone}</div>
        </div>
      </div>
      <div className="mt-3 max-w-[92%] rounded-2xl rounded-tl-sm bg-black/[0.04] px-3.5 py-2.5 text-sm text-[var(--color-foreground)]">
        {m.msg}
      </div>
      <button type="button" aria-hidden className="btn-primary mt-3 w-full rounded-full px-4 py-2.5 text-sm">
        {m.btn}
      </button>
    </Chrome>
  );
}

function Chrome({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="border-gradient rounded-[1.6rem] p-2.5">
      <div className="rounded-[1.3rem] bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[11px] text-[var(--color-muted)]">{label}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function DiagnosticMock() {
  const { locale } = useI18n();
  return (
    <Chrome label="lingopro.app / diagnostic">
      <div className="mb-3 flex items-center justify-between text-[11px] text-[var(--color-muted)]">
        <span>{term(locale, "question")} 7 / 20</span>
        <span>35%</span>
      </div>
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
        <div className="h-full w-[35%] rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]" />
      </div>
      <p className="text-sm font-semibold text-[var(--color-foreground)]">«Ben okul___ gidiyorum.»</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {["okul", "okula", "okulda", "okulun"].map((o, i) => (
          <div
            key={o}
            className={`rounded-xl border px-3 py-2 text-sm ${
              i === 1
                ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-foreground)]"
                : "border-black/[0.07] bg-black/[0.02] text-[var(--color-muted)]"
            }`}
          >
            {o}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          [term(locale, "grammar"), "A2"],
          [term(locale, "vocab"), "A2+"],
          [term(locale, "reading"), "B1"],
        ].map(([k, v]) => (
          <span key={k} className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] text-[var(--color-muted)]">
            {k} · <span className="font-semibold text-[var(--color-foreground)]">{v}</span>
          </span>
        ))}
      </div>
    </Chrome>
  );
}

function TutorMock() {
  const { locale } = useI18n();
  const m = pick(locale, {
    ru: {
      q: "Почему здесь «okula», а не «okul»? 🤔",
      a1: "Направление движения требует дательного падежа: «okul → okula» («в школу»). После согласной добавляем -a/-e.",
      a2: "Попробуй: «Eve gidiyorum» — куда я иду? 🏠",
    },
    en: {
      q: "Why «okula» here, not «okul»? 🤔",
      a1: "Direction of motion needs the dative case: «okul → okula» («to school»). After a consonant add -a/-e.",
      a2: "Try: «Eve gidiyorum» — where am I going? 🏠",
    },
    tr: {
      q: "Neden burada «okula», «okul» değil? 🤔",
      a1: "Yön belirten hareket -e hâlini ister: «okul → okula». Ünsüzden sonra -a/-e eklenir.",
      a2: "Dene: «Eve gidiyorum» — nereye gidiyorum? 🏠",
    },
    kk: {
      q: "Неге мұнда «okula», «okul» емес? 🤔",
      a1: "Қозғалыс бағыты барыс септігін қажет етеді: «okul → okula» («мектепке»). Дауыссыздан кейін -a/-e қосамыз.",
      a2: "Байқап көр: «Eve gidiyorum» — қайда барамын? 🏠",
    },
  });
  return (
    <Chrome label="lingopro.app / tutor">
      <div className="flex flex-col gap-3 text-sm">
        <div className="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-black/[0.04] px-3.5 py-2.5 text-[var(--color-foreground)]">
          {m.q}
        </div>
        <div className="max-w-[88%] self-end rounded-2xl rounded-tr-sm bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-3)] px-3.5 py-2.5 text-white">
          {m.a1}
        </div>
        <div className="max-w-[88%] self-end rounded-2xl rounded-tr-sm bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-3)] px-3.5 py-2.5 text-white">
          {m.a2}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-full border border-black/[0.08] bg-black/[0.02] px-4 py-2.5 text-sm text-[var(--color-muted)]">
        {term(locale, "askTutor")}
        <span className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-white">
          ↑
        </span>
      </div>
    </Chrome>
  );
}

function SpeakingMock() {
  const { locale } = useI18n();
  const bars = Array.from({ length: 30 }, (_, i) => 30 + ((i * 37) % 70));
  return (
    <Chrome label="lingopro.app / speaking">
      <div className="flex flex-col items-center gap-4 py-1">
        <div className="flex h-16 items-end gap-[3px]">
          {bars.map((h, i) => (
            <span
              key={i}
              className="animate-eq w-[3px] rounded-full bg-gradient-to-t from-[var(--color-brand)] to-[var(--color-brand-2)]"
              style={{ height: `${h}%`, animationDelay: `${(i % 10) * 0.08}s` }}
            />
          ))}
        </div>
        <button
          type="button"
          aria-hidden
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-white shadow-[0_10px_24px_-8px_rgba(109,91,255,0.6)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 4a3 3 0 013 3v4a3 3 0 11-6 0V7a3 3 0 013-3zM5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="mt-3 rounded-xl bg-black/[0.03] px-3.5 py-2.5 text-sm text-[var(--color-foreground)]">
        «Merhaba, bugün hava çok güzel.»
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border border-black/[0.06] py-2">
          <div className="text-lg font-bold text-[var(--color-foreground)]">92%</div>
          <div className="text-[11px] text-[var(--color-muted)]">{term(locale, "pronunciation")}</div>
        </div>
        <div className="rounded-xl border border-black/[0.06] py-2">
          <div className="text-lg font-bold text-[var(--color-foreground)]">B1</div>
          <div className="text-[11px] text-[var(--color-muted)]">{term(locale, "fluency")}</div>
        </div>
      </div>
    </Chrome>
  );
}

function WritingMock() {
  const { locale } = useI18n();
  const m = pick(locale, {
    ru: { rule: "«dün» (вчера) требует прошедшего времени — ", grade: "B1 · хороший прогресс" },
    en: { rule: "«dün» (yesterday) requires past tense — ", grade: "B1 · good progress" },
    tr: { rule: "«dün» geçmiş zaman ister — ", grade: "B1 · iyi ilerleme" },
    kk: { rule: "«dün» (кеше) өткен шақты қажет етеді — ", grade: "B1 · жақсы прогресс" },
  });
  return (
    <Chrome label="lingopro.app / writing">
      <div className="text-sm leading-relaxed">
        <div className="rounded-xl bg-[var(--color-red)]/[0.07] px-3.5 py-2.5 text-[var(--color-foreground)]">
          Ben dün okula <span className="text-[var(--color-red)] line-through">gidiyorum</span>.
        </div>
        <div className="mt-2 rounded-xl bg-[var(--color-brand-2)]/[0.1] px-3.5 py-2.5 text-[var(--color-foreground)]">
          Ben dün okula <b className="text-[var(--color-brand)]">gittim</b>. ✓
        </div>
        <p className="mt-3 text-[13px] text-[var(--color-muted)]">
          {m.rule}
          <b className="text-[var(--color-foreground)]">-di</b>.
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-black/[0.03] px-3.5 py-2.5">
        <span className="text-[11px] uppercase tracking-wide text-[var(--color-muted)]">{term(locale, "score")}</span>
        <span className="text-sm font-semibold text-[var(--color-foreground)]">{m.grade}</span>
      </div>
    </Chrome>
  );
}

function ExamMock() {
  const { locale } = useI18n();
  const mods = [
    [term(locale, "reading"), 100],
    [term(locale, "listening"), 75],
    [term(locale, "writing"), 40],
    [term(locale, "speaking"), 0],
  ] as const;
  return (
    <Chrome label="lingopro.app / mock-exam">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[11px] text-[var(--color-muted)]">
          {term(locale, "module")} 2 / 4
        </span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-foreground)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-red)]" /> 18:24
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {mods.map(([name, pct]) => (
          <div key={name} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-[13px] text-[var(--color-muted)]">{name}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/[0.05]">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border-gradient px-3.5 py-3">
        <div className="text-[11px] uppercase tracking-wide text-[var(--color-muted)]">{term(locale, "forecast")}</div>
        <div className="mt-0.5 text-base font-bold text-[var(--color-foreground)]">≈ B1 · {term(locale, "readiness")} 68%</div>
      </div>
    </Chrome>
  );
}

export function ProductShowcase() {
  const { locale } = useI18n();
  const c = CONTENT[locale];
  const tabs = [...c.tabs, MENTOR_TAB[locale]];
  const [active, setActive] = useState<TabId>("diagnostic");
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <section id="platform" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="mb-3 inline-block rounded-full border border-black/[0.07] bg-black/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-brand)]">
            {c.eyebrow}
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{c.title}</h2>
          <p className="mt-4 text-balance text-base leading-relaxed text-[var(--color-muted)]">{c.subtitle}</p>
        </Reveal>

        <Reveal className="mt-12">
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {tabs.map((t) => {
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
                      layoutId="showcase-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div
              aria-hidden
              className="glow-spot left-[-4rem] top-1/2 h-64 w-64 -translate-y-1/2"
              style={{ background: "radial-gradient(circle, #6d5bff, transparent 70%)" }}
            />
            <div className="relative order-last lg:order-first">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Mock id={active} />
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <h3 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">{tab.heading}</h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--color-muted)]">{tab.text}</p>
                <ul className="mt-6 flex flex-col gap-3">
                  {tab.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-sm text-[var(--color-foreground)]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-2)]/15 text-[var(--color-brand-2)]">
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 7.5L6 11l5.5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
