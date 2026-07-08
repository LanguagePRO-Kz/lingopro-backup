"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { useStats, type Period } from "@/lib/hooks/useStats";
import { SectionHint } from "@/components/SectionHint";

const T = {
  ru: {
    title: "Твоя статистика",
    periods: ["Неделя", "Месяц", "3 мес", "6 мес", "Всё время"],
    skills: ["Обзор", "Чтение", "Аудирование", "Письмо", "Говорение", "Словарь"],
    streak: "Серия",
    streakLabel: (n: number) => {
      if (n === 0) return "Начни серию сегодня";
      const m10 = n % 10, m100 = n % 100;
      const form = (m10 === 1 && m100 !== 11) ? "день подряд"
        : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? "дня подряд"
        : "дней подряд";
      return `${n} ${form}`;
    },
    weekDays: (n: number) => `${n} из 7 дней на этой неделе`,
    level: "Оценка уровня", levelHint: "Баллы появятся после тестов",
    goal: "Твоя цель",
    goalNow: (cur: string | null, tgt: string | null) => cur && tgt ? `${cur} сейчас → осталось до ${tgt}` : "Выбери цель в настройках",
    week: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    plaques: { reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking", vocab: "Словарь" },
    tests: "тестов", words: "слов",
    activity: "Активность", noData: "Нет данных за выбранный период",
    dynamics: "Динамика баллов",
  },
  en: {
    title: "Your statistics",
    periods: ["Week", "Month", "3 mo", "6 mo", "All time"],
    skills: ["Overview", "Reading", "Listening", "Writing", "Speaking", "Vocabulary"],
    streak: "Streak",
    streakLabel: (n: number) => n === 0 ? "Start your streak today" : `${n} ${n === 1 ? "day" : "days"} in a row`,
    weekDays: (n: number) => `${n} of 7 days this week`,
    level: "Level estimate", levelHint: "Scores appear after tests",
    goal: "Your goal",
    goalNow: (cur: string | null, tgt: string | null) => cur && tgt ? `${cur} now → way to go to ${tgt}` : "Set your goal in settings",
    week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    plaques: { reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking", vocab: "Vocabulary" },
    tests: "tests", words: "words",
    activity: "Activity", noData: "No data for the selected period",
    dynamics: "Score dynamics",
  },
  tr: {
    title: "İstatistiklerin",
    periods: ["Hafta", "Ay", "3 ay", "6 ay", "Tüm zaman"],
    skills: ["Genel", "Okuma", "Dinleme", "Yazma", "Konuşma", "Sözlük"],
    streak: "Seri",
    streakLabel: (n: number) => n === 0 ? "Bugün seriye başla" : `${n} gün üst üste`,
    weekDays: (n: number) => `Bu hafta 7 günün ${n}'i`,
    level: "Seviye tahmini", levelHint: "Puanlar testlerden sonra görünür",
    goal: "Hedefin",
    goalNow: (cur: string | null, tgt: string | null) => cur && tgt ? `${cur} şimdi → ${tgt}'e kaldı` : "Ayarlarda hedef seç",
    week: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
    plaques: { reading: "Okuma", listening: "Dinleme", writing: "Yazma", speaking: "Konuşma", vocab: "Sözlük" },
    tests: "test", words: "kelime",
    activity: "Etkinlik", noData: "Seçilen dönem için veri yok",
    dynamics: "Puan dinamiği",
  },
  kk: {
    title: "Сенің статистикаң",
    periods: ["Апта", "Ай", "3 ай", "6 ай", "Барлық уақыт"],
    skills: ["Шолу", "Оқу", "Тыңдалым", "Жазу", "Сөйлеу", "Сөздік"],
    streak: "Серия",
    streakLabel: (n: number) => n === 0 ? "Бүгін серияны баста" : `Қатарынан ${n} күн`,
    weekDays: (n: number) => `Осы аптада 7 күннің ${n}-уі`,
    level: "Деңгей бағасы", levelHint: "Баллдар тесттерден кейін шығады",
    goal: "Сенің мақсатың",
    goalNow: (cur: string | null, tgt: string | null) => cur && tgt ? `${cur} қазір → ${tgt}-ге дейін қалды` : "Баптауларда мақсат таңда",
    week: ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"],
    plaques: { reading: "Оқу", listening: "Тыңдалым", writing: "Жазу", speaking: "Сөйлеу", vocab: "Сөздік" },
    tests: "тест", words: "сөз",
    activity: "Белсенділік", noData: "Таңдалған кезеңге дерек жоқ",
    dynamics: "Балл динамикасы",
  },
};

const PLAQUES = [
  { id: "reading",   emoji: "📖", href: "/dashboard/reading",    unit: "tests" },
  { id: "listening", emoji: "🎧", href: "/dashboard/listening",  unit: "tests" },
  { id: "writing",   emoji: "✍️", href: "/dashboard/writing",    unit: "tests" },
  { id: "speaking",  emoji: "🎤", href: "/dashboard/speaking",   unit: "tests" },
  { id: "vocab",     emoji: "📚", href: "/dashboard/vocabulary", unit: "words" },
] as const;

const SKILL_SCORES = [
  { emoji: "📖", key: "R", id: "reading"   as const },
  { emoji: "🎧", key: "L", id: "listening" as const },
  { emoji: "✍️", key: "W", id: "writing"   as const },
  { emoji: "🎤", key: "S", id: "speaking"  as const },
];

const PERIODS: Period[] = ["week", "month", "3mo", "6mo", "all"];

export default function StatsPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [periodIdx, setPeriodIdx] = useState(0);
  const [skillIdx, setSkillIdx] = useState(0);

  const stats = useStats(PERIODS[periodIdx]);
  const daysDoneThisWeek = stats.weekDone.filter(Boolean).length;

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>
      <div className="mt-4">
        <SectionHint id="stats" />
      </div>

      {/* period tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {c.periods.map((p, i) => (
          <button key={p} type="button" onClick={() => setPeriodIdx(i)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${periodIdx === i ? "bg-[var(--color-brand)] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}>{p}</button>
        ))}
      </div>
      {/* skill tabs */}
      <div className="mt-3 flex flex-wrap gap-2">
        {c.skills.map((s, i) => (
          <button key={s} type="button" onClick={() => setSkillIdx(i)} className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${skillIdx === i ? "bg-[var(--color-brand)]/12 text-[var(--color-brand)]" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}>{s}</button>
        ))}
      </div>

      {/* 3 top cards */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* streak */}
        <div className="rounded-3xl bg-gradient-to-br from-[#f59e0b] to-[#ef4444] p-5 text-white">
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/70">{c.streak}</div>
          <div className="mt-1 text-2xl font-bold">
            {stats.streakDays > 0 && "🔥 "}{c.streakLabel(stats.streakDays)}
          </div>
          <div className="mt-3 flex justify-between gap-1">
            {c.week.map((d, i) => (
              <div key={d} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-white/70">{d}</span>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${stats.weekDone[i] ? "bg-white text-[#ef4444]" : "bg-white/25"}`}>{stats.weekDone[i] ? "✓" : ""}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-white/80">{c.weekDays(daysDoneThisWeek)}</div>
        </div>

        {/* level estimate */}
        <div className="glass rounded-3xl p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">{c.level}</div>
          <div className="mt-3 flex justify-between">
            {SKILL_SCORES.map((s) => (
              <div key={s.key} className="flex flex-col items-center gap-1">
                <span className="text-base">{s.emoji}</span>
                <span className="text-xs font-semibold text-[var(--color-muted)]">{s.key}: {stats.scores[s.id] ?? "—"}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--color-muted)]">{c.levelHint}</p>
        </div>

        {/* goal */}
        <div className="rounded-3xl bg-gradient-to-br from-[#5b4bd6] to-[#3a1d9c] p-5 text-white">
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/60">{c.goal}</div>
          <div className="mt-1 text-3xl font-bold">{stats.targetLevel ?? "—"}</div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${stats.goalProgressPct}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/70">{c.goalNow(stats.currentLevel, stats.targetLevel)}</p>
          {/* empty state → concrete next action, not a dead dash */}
          {!stats.loading && !stats.currentLevel && (
            <Link href="/quiz" className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#3a1d9c] transition-transform active:scale-95">
              {pick(locale, { ru: "Пройти диагностику", en: "Take the diagnostic", tr: "Teşhise başla", kk: "Диагностикадан өту" })} →
            </Link>
          )}
        </div>
      </div>

      {/* skill plaques */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {PLAQUES.map((p) => (
          <Link key={p.id} href={p.href} className="glass flex items-center gap-3 rounded-2xl p-4 transition-shadow hover:shadow-md">
            <span className="text-xl">{p.emoji}</span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[var(--color-foreground)]">{c.plaques[p.id]}</div>
              <div className="text-xs text-[var(--color-muted)]">{stats.counts[p.id]} {p.unit === "tests" ? c.tests : c.words}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* activity */}
      <div className="glass mt-6 rounded-3xl p-6">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{c.activity}</h3>
        <div className="mt-4 flex h-32 flex-col items-center justify-center rounded-2xl bg-black/[0.02] text-sm text-[var(--color-muted)]">
          <span className="text-2xl">📅</span>
          <span className="mt-2">{c.noData}</span>
        </div>
      </div>

      {/* dynamics */}
      <div className="glass mt-6 rounded-3xl p-6">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{c.dynamics}</h3>
        <div className="mt-4 flex h-40 flex-col items-center justify-center rounded-2xl bg-black/[0.02] text-sm text-[var(--color-muted)]">
          <span className="text-2xl">📈</span>
          <span className="mt-2">{c.noData}</span>
        </div>
      </div>
    </div>
  );
}
