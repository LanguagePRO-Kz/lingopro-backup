"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

const TASKS = [
  { emoji: "🎧", typeKey: "listening", href: "/dashboard/listening", titleKey: 0 },
  { emoji: "📖", typeKey: "reading", href: "/dashboard/reading", titleKey: 1 },
  { emoji: "✍️", typeKey: "writing", href: "/dashboard/writing", titleKey: 2 },
  { emoji: "🎤", typeKey: "speaking", href: "/dashboard/speaking", titleKey: 3 },
  { emoji: "📚", typeKey: "vocab", href: "/dashboard/vocabulary", titleKey: 4 },
] as const;

const T = {
  ru: {
    hi: "Привет", day: "День 12 подготовки к TÖMER",
    todayTitle: "Сегодняшняя практика", todayDone: "выполнено", start: "Начать",
    types: { listening: "Аудирование · Диалог A2", reading: "Чтение · Текст A2", writing: "Письмо · Задание A2", speaking: "Говорение · Тема A2", vocab: "Повторение слов · 10 новых слов" },
    titles: ["Разговор в магазине", "Письмо от друга", "Напиши о своём дне", "Расскажи о семье", "Тема: Еда и напитки"],
    goal: "Твоя цель", goalHint: "Пройди тесты и AI отметит прогресс", now: "сейчас", target: "цель",
    scores: "Баллы по навыкам", scoresHint: "Баллы появятся после первых тестов",
    recent: "Последние тесты", recentHint: "Пройдите первый пробный тест, чтобы увидеть результаты", startPractice: "Начать практику",
    overview: "Обзор прогресса", weekProgress: "Прогресс за неделю", noWeekData: "Нет данных за эту неделю",
    accuracy: "Точность по секциям", noAccData: "Пройдите тесты, чтобы увидеть статистику",
    legend: { reading: "Чтение", listening: "Аудирование", writing: "Письмо", speaking: "Спикинг", goal: "Цель" },
  },
  en: {
    hi: "Hi", day: "Day 12 of TÖMER prep",
    todayTitle: "Today's practice", todayDone: "done", start: "Start",
    types: { listening: "Listening · A2 dialogue", reading: "Reading · A2 text", writing: "Writing · A2 task", speaking: "Speaking · A2 topic", vocab: "Word review · 10 new words" },
    titles: ["A conversation at a shop", "A letter from a friend", "Write about your day", "Tell about your family", "Topic: Food & drinks"],
    goal: "Your goal", goalHint: "Take tests and AI will track your progress", now: "now", target: "goal",
    scores: "Skill scores", scoresHint: "Scores appear after your first tests",
    recent: "Recent tests", recentHint: "Take your first mock test to see results", startPractice: "Start practice",
    overview: "Progress overview", weekProgress: "Weekly progress", noWeekData: "No data for this week",
    accuracy: "Accuracy by section", noAccData: "Take tests to see your stats",
    legend: { reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking", goal: "Goal" },
  },
  tr: {
    hi: "Merhaba", day: "TÖMER hazırlığının 12. günü",
    todayTitle: "Bugünün pratiği", todayDone: "tamamlandı", start: "Başla",
    types: { listening: "Dinleme · A2 diyalog", reading: "Okuma · A2 metin", writing: "Yazma · A2 görev", speaking: "Konuşma · A2 konu", vocab: "Kelime tekrarı · 10 yeni kelime" },
    titles: ["Mağazada konuşma", "Arkadaştan mektup", "Gününü yaz", "Aileni anlat", "Konu: Yiyecek ve içecek"],
    goal: "Hedefin", goalHint: "Test çöz, AI ilerlemeni takip etsin", now: "şimdi", target: "hedef",
    scores: "Beceri puanları", scoresHint: "Puanlar ilk testlerden sonra görünür",
    recent: "Son testler", recentHint: "Sonuçları görmek için ilk deneme testini çöz", startPractice: "Pratiğe başla",
    overview: "İlerleme özeti", weekProgress: "Haftalık ilerleme", noWeekData: "Bu hafta için veri yok",
    accuracy: "Bölüm doğruluğu", noAccData: "İstatistik için test çöz",
    legend: { reading: "Okuma", listening: "Dinleme", writing: "Yazma", speaking: "Konuşma", goal: "Hedef" },
  },
  kk: {
    hi: "Сәлем", day: "TÖMER дайындығының 12-күні",
    todayTitle: "Бүгінгі практика", todayDone: "орындалды", start: "Бастау",
    types: { listening: "Тыңдалым · A2 диалог", reading: "Оқу · A2 мәтін", writing: "Жазу · A2 тапсырма", speaking: "Сөйлеу · A2 тақырып", vocab: "Сөз қайталау · 10 жаңа сөз" },
    titles: ["Дүкендегі әңгіме", "Достан хат", "Күнің туралы жаз", "Отбасың туралы айт", "Тақырып: Тағам мен сусын"],
    goal: "Сенің мақсатың", goalHint: "Тест тапсыр, AI прогресті белгілейді", now: "қазір", target: "мақсат",
    scores: "Дағды баллдары", scoresHint: "Баллдар алғашқы тесттерден кейін шығады",
    recent: "Соңғы тесттер", recentHint: "Нәтижені көру үшін алғашқы сынақ тестін тапсыр", startPractice: "Практиканы бастау",
    overview: "Прогресс шолуы", weekProgress: "Апталық прогресс", noWeekData: "Бұл аптаға дерек жоқ",
    accuracy: "Бөлім бойынша дәлдік", noAccData: "Статистика үшін тест тапсыр",
    legend: { reading: "Оқу", listening: "Тыңдалым", writing: "Жазу", speaking: "Сөйлеу", goal: "Мақсат" },
  },
};

const SKILL_DOTS = [
  { emoji: "📖", key: "reading", color: "#3b82f6" },
  { emoji: "🎧", key: "listening", color: "#ef4444" },
  { emoji: "✍️", key: "writing", color: "#f59e0b" },
  { emoji: "🎤", key: "speaking", color: "#eab308" },
  { emoji: "📝", key: "grammar", color: "#6d5bff" },
] as const;

export default function DashboardHome() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [name, setName] = useState("студент");
  const [done, setDone] = useState<boolean[]>([false, false, false, false, false]);

  useEffect(() => {
    const stored = window.localStorage.getItem("lingopro:name");
    if (stored) setName(stored);
  }, []);

  const doneCount = done.filter(Boolean).length;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{c.hi}, {name}! 👋</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{c.day}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ---- left: daily practice ---- */}
        <div>
          <div className="rounded-3xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{c.todayTitle}</h2>
                <p className="mt-0.5 text-sm text-white/80">{doneCount}/5 {c.todayDone}</p>
              </div>
              <Link href={TASKS[doneCount] ? TASKS[doneCount].href : "/dashboard/listening"} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-brand)]">
                ▶ {c.start}
              </Link>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/25">
              <motion.div className="h-full rounded-full bg-white" animate={{ width: `${(doneCount / 5) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            {TASKS.map((task, i) => (
              <div key={task.typeKey} className="glass flex items-center gap-3 rounded-2xl p-3.5">
                <button
                  type="button"
                  onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs transition-colors ${
                    done[i] ? "border-[var(--color-brand-2)] bg-[var(--color-brand-2)] text-white" : "border-black/[0.2] text-transparent"
                  }`}
                >
                  ✓
                </button>
                <span className="text-xl">{task.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs text-[var(--color-muted)] ${done[i] ? "line-through" : ""}`}>{c.types[task.typeKey]}</div>
                  <div className={`text-sm font-medium text-[var(--color-foreground)] ${done[i] ? "line-through opacity-50" : ""}`}>{c.titles[task.titleKey]}</div>
                </div>
                <Link href={task.href} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-sm text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/20">
                  ▶
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ---- right: panel ---- */}
        <div className="flex flex-col gap-4">
          {/* goal */}
          <div className="rounded-3xl bg-gradient-to-br from-[#5b4bd6] to-[#3a1d9c] p-6 text-white">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/60">{c.goal}</div>
            <div className="mt-1 text-4xl font-bold">C1</div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[40%] rounded-full bg-white" />
            </div>
            <div className="mt-2 flex justify-between text-xs text-white/70">
              <span>A2 {c.now}</span>
              <span>C1 {c.target}</span>
            </div>
            <p className="mt-3 text-xs text-white/70">{c.goalHint}</p>
          </div>

          {/* skill scores */}
          <div className="glass rounded-3xl p-5">
            <div className="text-sm font-semibold text-[var(--color-foreground)]">{c.scores}</div>
            <div className="mt-4 flex justify-between">
              {SKILL_DOTS.map((s) => (
                <div key={s.key} className="flex flex-col items-center gap-1.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-black/[0.12] text-sm text-[var(--color-muted)]">—</span>
                  <span className="text-base">{s.emoji}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--color-muted)]">{c.scoresHint}</p>
          </div>

          {/* recent tests */}
          <div className="glass rounded-3xl p-5">
            <div className="text-sm font-semibold text-[var(--color-foreground)]">{c.recent}</div>
            <p className="mt-2 text-xs text-[var(--color-muted)]">{c.recentHint}</p>
            <Link href="/dashboard/mock" className="btn-primary mt-4 block rounded-full px-4 py-2.5 text-center text-sm">
              {c.startPractice} →
            </Link>
          </div>
        </div>
      </div>

      {/* ---- bottom: overview ---- */}
      <h2 className="mt-8 text-lg font-semibold text-[var(--color-foreground)]">{c.overview}</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{c.weekProgress}</h3>
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <button type="button" className="hover:text-[var(--color-foreground)]">←</button>
              <span>22 — 28</span>
              <button type="button" className="hover:text-[var(--color-foreground)]">→</button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-[var(--color-muted)]">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#3b82f6]" />{c.legend.reading}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#ef4444]" />{c.legend.listening}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#f59e0b]" />{c.legend.writing}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#eab308]" />{c.legend.speaking}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-full border-t-2 border-dashed border-[var(--color-muted)]" />{c.legend.goal}</span>
          </div>
          <div className="mt-4 flex h-40 flex-col items-center justify-center rounded-2xl bg-black/[0.02] text-sm text-[var(--color-muted)]">
            <span className="text-3xl">📈</span>
            <span className="mt-2">{c.noWeekData}</span>
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{c.accuracy}</h3>
          <div className="mt-4 flex h-40 flex-col items-center justify-center rounded-2xl bg-black/[0.02] text-center text-sm text-[var(--color-muted)]">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-8 border-black/[0.06] text-xs">—</span>
            <span className="mt-2">{c.noAccData}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
