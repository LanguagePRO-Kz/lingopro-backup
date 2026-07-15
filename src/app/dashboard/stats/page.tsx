"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { pick, pluralize } from "@/lib/localized";
import { useStats, type Period } from "@/lib/hooks/useStats";
import { SectionHint } from "@/components/SectionHint";

/**
 * Статистика: два источника, два блока — НЕ смешиваются (правило 1.3).
 * «Оценка уровня» = снимок из диагностики/пробы (/25 за секцию).
 * Плашки/активность = реальная работа после диагностики (attempts,
 * ai_usage, voice_sessions). Свежий юзер видит оценку уровня и честные
 * нули активности — без выдуманных цифр и вечных заглушек.
 */

const T = {
  ru: {
    title: "Твоя статистика",
    periods: ["Неделя", "Месяц", "3 мес", "6 мес", "Всё время"],
    streak: "Серия",
    streakLabel: (n: number) => (n === 0 ? "Начни серию сегодня" : `${n} ${pluralize(n, "день", "дня", "дней")} подряд`),
    weekDays: (n: number) => `${n} из 7 дней на этой неделе`,
    level: "Оценка уровня", levelSub: "По диагностике и голосовой пробе · баллы из 25",
    levelEmpty: "Пройди диагностику — здесь появится оценка по 4 навыкам",
    levelCta: "Пройти диагностику",
    goal: "Твоя цель",
    goalNow: (cur: string | null, tgt: string | null) => (cur && tgt ? `${cur} сейчас → осталось до ${tgt}` : "Выбери цель в настройках"),
    week: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    plaques: { reading: "Чтение", listening: "Аудирование", writing: "Письмо", speaking: "Говорение", vocab: "Словарь" },
    unit: {
      reading: (n: number) => `${n} ${pluralize(n, "задание", "задания", "заданий")}`,
      listening: (n: number) => `${n} ${pluralize(n, "задание", "задания", "заданий")}`,
      writing: (n: number) => `${n} ${pluralize(n, "эссе", "эссе", "эссе")}`,
      speaking: (n: number) => `${n} ${pluralize(n, "урок", "урока", "уроков")}`,
      vocab: (n: number) => `${n} ${pluralize(n, "слово", "слова", "слов")}`,
    },
    accuracy: (p: number) => `точность ${p}%`,
    activity: "Активность — решённые задания",
    activityEmpty: "За этот период заданий пока нет. Начни с раздела —",
    activityEmptyCta: "Чтение",
    tasksN: (n: number) => `${n} ${pluralize(n, "задание", "задания", "заданий")}`,
  },
  en: {
    title: "Your statistics",
    periods: ["Week", "Month", "3 mo", "6 mo", "All time"],
    streak: "Streak",
    streakLabel: (n: number) => (n === 0 ? "Start your streak today" : `${n} ${n === 1 ? "day" : "days"} in a row`),
    weekDays: (n: number) => `${n} of 7 days this week`,
    level: "Level estimate", levelSub: "From the diagnostic and the voice probe · scores out of 25",
    levelEmpty: "Take the diagnostic — a 4-skill estimate will appear here",
    levelCta: "Take the diagnostic",
    goal: "Your goal",
    goalNow: (cur: string | null, tgt: string | null) => (cur && tgt ? `${cur} now → way to go to ${tgt}` : "Set your goal in settings"),
    week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    plaques: { reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking", vocab: "Vocabulary" },
    unit: {
      reading: (n: number) => `${n} ${n === 1 ? "task" : "tasks"}`,
      listening: (n: number) => `${n} ${n === 1 ? "task" : "tasks"}`,
      writing: (n: number) => `${n} ${n === 1 ? "essay" : "essays"}`,
      speaking: (n: number) => `${n} ${n === 1 ? "lesson" : "lessons"}`,
      vocab: (n: number) => `${n} ${n === 1 ? "word" : "words"}`,
    },
    accuracy: (p: number) => `${p}% accuracy`,
    activity: "Activity — tasks solved",
    activityEmpty: "No tasks in this period yet. Start with —",
    activityEmptyCta: "Reading",
    tasksN: (n: number) => `${n} ${n === 1 ? "task" : "tasks"}`,
  },
  tr: {
    title: "İstatistiklerin",
    periods: ["Hafta", "Ay", "3 ay", "6 ay", "Tüm zaman"],
    streak: "Seri",
    streakLabel: (n: number) => (n === 0 ? "Bugün seriye başla" : `${n} gün üst üste`),
    weekDays: (n: number) => `Bu hafta 7 günün ${n}'i`,
    level: "Seviye tahmini", levelSub: "Tanılama ve konuşma denemesinden · 25 üzerinden",
    levelEmpty: "Tanılamayı geç — 4 beceri tahmini burada görünecek",
    levelCta: "Tanılamaya başla",
    goal: "Hedefin",
    goalNow: (cur: string | null, tgt: string | null) => (cur && tgt ? `${cur} şimdi → ${tgt}'e kaldı` : "Ayarlarda hedef seç"),
    week: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
    plaques: { reading: "Okuma", listening: "Dinleme", writing: "Yazma", speaking: "Konuşma", vocab: "Sözlük" },
    unit: {
      reading: (n: number) => `${n} görev`,
      listening: (n: number) => `${n} görev`,
      writing: (n: number) => `${n} kompozisyon`,
      speaking: (n: number) => `${n} ders`,
      vocab: (n: number) => `${n} kelime`,
    },
    accuracy: (p: number) => `doğruluk %${p}`,
    activity: "Etkinlik — çözülen görevler",
    activityEmpty: "Bu dönemde henüz görev yok. Şuradan başla —",
    activityEmptyCta: "Okuma",
    tasksN: (n: number) => `${n} görev`,
  },
  kk: {
    title: "Сенің статистикаң",
    periods: ["Апта", "Ай", "3 ай", "6 ай", "Барлық уақыт"],
    streak: "Серия",
    streakLabel: (n: number) => (n === 0 ? "Бүгін серияны баста" : `Қатарынан ${n} күн`),
    weekDays: (n: number) => `Осы аптада 7 күннің ${n}-уі`,
    level: "Деңгей бағасы", levelSub: "Диагностика мен дауыс сынамасынан · 25-тен",
    levelEmpty: "Диагностикадан өт — 4 дағды бойынша баға осында шығады",
    levelCta: "Диагностикадан өту",
    goal: "Сенің мақсатың",
    goalNow: (cur: string | null, tgt: string | null) => (cur && tgt ? `${cur} қазір → ${tgt}-ге дейін қалды` : "Баптауларда мақсат таңда"),
    week: ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"],
    plaques: { reading: "Оқу", listening: "Тыңдалым", writing: "Жазу", speaking: "Сөйлеу", vocab: "Сөздік" },
    unit: {
      reading: (n: number) => `${n} тапсырма`,
      listening: (n: number) => `${n} тапсырма`,
      writing: (n: number) => `${n} эссе`,
      speaking: (n: number) => `${n} сабақ`,
      vocab: (n: number) => `${n} сөз`,
    },
    accuracy: (p: number) => `дәлдік ${p}%`,
    activity: "Белсенділік — шешілген тапсырмалар",
    activityEmpty: "Бұл кезеңде тапсырма жоқ. Мынадан баста —",
    activityEmptyCta: "Оқу",
    tasksN: (n: number) => `${n} тапсырма`,
  },
};

const PLAQUES = [
  { id: "reading", emoji: "📖", href: "/dashboard/reading" },
  { id: "listening", emoji: "🎧", href: "/dashboard/listening" },
  { id: "writing", emoji: "✍️", href: "/dashboard/writing" },
  { id: "speaking", emoji: "🎤", href: "/dashboard/speaking" },
  { id: "vocab", emoji: "📚", href: "/dashboard/vocabulary" },
] as const;

// оценка уровня: те же секции, что на странице результата (/25)
const LEVEL_SECTIONS = [
  { emoji: "🎧", key: "L", id: "dinleme" as const },
  { emoji: "📖", key: "R", id: "okuma" as const },
  { emoji: "✍️", key: "W", id: "yazma" as const },
  { emoji: "🎤", key: "S", id: "konusma" as const },
];

const PERIODS: Period[] = ["week", "month", "3mo", "6mo", "all"];

export default function StatsPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [periodIdx, setPeriodIdx] = useState(0);

  const stats = useStats(PERIODS[periodIdx]);
  const daysDoneThisWeek = stats.weekDone.filter(Boolean).length;
  const maxDay = Math.max(1, ...stats.activityByDay.map((d) => d.n));

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

      {/* 3 top cards */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* streak — реальный, из daily_progress */}
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

        {/* оценка уровня — снимок из диагностики/пробы, НЕ активность */}
        <div className="glass rounded-3xl p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">{c.level}</div>
          {stats.levelEstimate ? (
            <>
              <div className="mt-3 flex justify-between">
                {LEVEL_SECTIONS.map((s) => {
                  const v = stats.levelEstimate![s.id];
                  return (
                    <div key={s.key} className="flex flex-col items-center gap-1">
                      <span className="text-base">{s.emoji}</span>
                      <span className="text-xs font-semibold text-[var(--color-foreground)]">
                        {s.key}: {v != null ? `${v}/25` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-[var(--color-muted)]">{c.levelSub}</p>
            </>
          ) : (
            <div className="mt-3">
              <p className="text-xs text-[var(--color-muted)]">{c.levelEmpty}</p>
              {!stats.loading && (
                <Link href="/quiz" className="mt-3 inline-block rounded-full bg-[var(--color-brand)] px-4 py-2 text-xs font-semibold text-white transition-transform active:scale-95">
                  {c.levelCta} →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* goal — цель из профиля, B2 по умолчанию */}
        <div className="rounded-3xl bg-gradient-to-br from-[#5b4bd6] to-[#3a1d9c] p-5 text-white">
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/60">{c.goal}</div>
          <div className="mt-1 text-3xl font-bold">{stats.targetLevel}</div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${stats.goalProgressPct}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/70">{c.goalNow(stats.currentLevel, stats.targetLevel)}</p>
          {!stats.loading && !stats.currentLevel && (
            <Link href="/quiz" className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#3a1d9c] transition-transform active:scale-95">
              {c.levelCta} →
            </Link>
          )}
        </div>
      </div>

      {/* плашки: реальная работа за период (attempts / ai_usage / voice_sessions) */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {PLAQUES.map((p) => (
          <Link key={p.id} href={p.href} className="glass flex items-center gap-3 rounded-2xl p-4 transition-shadow hover:shadow-md">
            <span className="text-xl">{p.emoji}</span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[var(--color-foreground)]">{c.plaques[p.id]}</div>
              <div className="text-xs text-[var(--color-muted)]">{c.unit[p.id](stats.counts[p.id])}</div>
              {(p.id === "reading" || p.id === "listening") && stats.accuracy[p.id] != null && (
                <div className="text-[11px] font-medium text-[var(--color-brand)]">{c.accuracy(stats.accuracy[p.id]!)}</div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* активность: реальные задания по дням; нет — честный ноль с действием */}
      <div className="glass mt-6 rounded-3xl p-6">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{c.activity}</h3>
        {stats.activityByDay.length > 0 ? (
          <div className="mt-4 flex h-32 items-end gap-1.5 overflow-x-auto rounded-2xl bg-black/[0.02] px-3 pb-6 pt-3">
            {stats.activityByDay.slice(-31).map((d) => (
              <div key={d.date} className="group relative flex h-full w-full min-w-[10px] flex-col items-center justify-end">
                <div
                  className="w-full max-w-[26px] rounded-t-md bg-gradient-to-t from-[var(--color-brand)] to-[var(--color-brand-2)]"
                  style={{ height: `${Math.max(8, Math.round((d.n / maxDay) * 100))}%` }}
                  title={`${d.date}: ${c.tasksN(d.n)}`}
                />
                <span className="absolute -bottom-5 text-[9px] text-[var(--color-muted)]">{d.date.slice(8, 10)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex h-32 flex-col items-center justify-center rounded-2xl bg-black/[0.02] text-sm text-[var(--color-muted)]">
            <span className="text-2xl">📅</span>
            <span className="mt-2">
              {c.activityEmpty}{" "}
              <Link href="/dashboard/reading" className="font-semibold text-[var(--color-brand)] underline-offset-2 hover:underline">
                {c.activityEmptyCta} →
              </Link>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
