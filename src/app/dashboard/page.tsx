"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { LEVELS } from "@/data/types";
import { TaskModal } from "@/components/TaskModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StartChecklist } from "@/components/StartChecklist";
import { PlanCheckpoint } from "@/components/PlanCheckpoint";
import { LiveFacts } from "@/components/LiveFacts";
import { Milestones } from "@/components/Milestones";
import { WeeklyDigest } from "@/components/WeeklyDigest";
import { AhuCoach } from "@/components/AhuCoach";
import { fetchExamPlan } from "@/lib/exam-plan";
import { createClient } from "@/lib/supabase/client";
import { awardXp, awardSkillTest, XP } from "@/lib/xp";
import {
  loadDashboardData,
  saveDay,
  saveTaskResult,
  todayISO,
  SKILL_META,
  skillLabel,
  taskDescription,
  minutesLabel,
  contentLevel,
  computeStreak,
  weekCalendar,
  totalTasksDone,
  wordsLearned,
  type DayRow,
  type DailyTask,
} from "@/lib/daily-plan";

const T = {
  ru: {
    hi: "Привет", planTitle: "План на сегодня", change: "Изменить", done: "выполнено", remaining: "осталось",
    start: "Начать →", doneLabel: "Выполнено", allDone: "🎉 Отлично! План на сегодня выполнен!",
    streakTitle: "дней подряд", streakHint: "Выполняйте план каждый день!", week: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    myProgress: "Мой прогресс", levelCard: "Уровень", statsCard: "Статистика",
    statTasks: "Заданий выполнено", statWords: "Слов выучено", statDays: "Дней подряд",
    continueTitle: "План выполнен! Хочешь продолжить?", localeCode: "ru-RU",
    cont: { grammar: "Грамматика", reading: "Чтение", listening: "Аудирование", mock: "Пробный TÖMER" },
  },
  en: {
    hi: "Hi", planTitle: "Today's plan", change: "Change", done: "done", remaining: "left",
    start: "Start →", doneLabel: "Done", allDone: "🎉 Great job! Today's plan is complete!",
    streakTitle: "days in a row", streakHint: "Complete the plan every day!", week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    myProgress: "My progress", levelCard: "Level", statsCard: "Statistics",
    statTasks: "Tasks completed", statWords: "Words learned", statDays: "Days in a row",
    continueTitle: "Plan complete! Want to keep going?", localeCode: "en-US",
    cont: { grammar: "Grammar", reading: "Reading", listening: "Listening", mock: "Mock TÖMER" },
  },
  tr: {
    hi: "Merhaba", planTitle: "Bugünün planı", change: "Değiştir", done: "tamamlandı", remaining: "kaldı",
    start: "Başla →", doneLabel: "Tamamlandı", allDone: "🎉 Harika! Bugünün planı tamamlandı!",
    streakTitle: "gün üst üste", streakHint: "Planı her gün tamamla!", week: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
    myProgress: "İlerlemem", levelCard: "Seviye", statsCard: "İstatistik",
    statTasks: "Tamamlanan görev", statWords: "Öğrenilen kelime", statDays: "Gün üst üste",
    continueTitle: "Plan tamam! Devam etmek ister misin?", localeCode: "tr-TR",
    cont: { grammar: "Dil bilgisi", reading: "Okuma", listening: "Dinleme", mock: "Deneme TÖMER" },
  },
  kk: {
    hi: "Сәлем", planTitle: "Бүгінгі жоспар", change: "Өзгерту", done: "орындалды", remaining: "қалды",
    start: "Бастау →", doneLabel: "Орындалды", allDone: "🎉 Тамаша! Бүгінгі жоспар орындалды!",
    streakTitle: "күн қатарынан", streakHint: "Жоспарды күн сайын орында!", week: ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"],
    myProgress: "Менің прогресім", levelCard: "Деңгей", statsCard: "Статистика",
    statTasks: "Орындалған тапсырма", statWords: "Үйренілген сөз", statDays: "Күн қатарынан",
    continueTitle: "Жоспар орындалды! Жалғастырғың келе ме?", localeCode: "kk-KZ",
    cont: { grammar: "Грамматика", reading: "Оқу", listening: "Тыңдалым", mock: "Сынақ TÖMER" },
  },
};

const CONTINUE = [
  { key: "grammar", href: "/dashboard/grammar", emoji: "📝" },
  { key: "reading", href: "/dashboard/reading", emoji: "📖" },
  { key: "listening", href: "/dashboard/listening", emoji: "🎧" },
  { key: "mock", href: "/dashboard/mock", emoji: "🧪" },
] as const;

export default function DashboardHome() {
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [name, setName] = useState("студент");
  const [levelRaw, setLevelRaw] = useState("A2");
  const [today, setToday] = useState<DayRow | null>(null);
  const [history, setHistory] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<DailyTask | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  // real goal for the progress card — "→ C1" was hardcoded for everyone
  const [targetLevel, setTargetLevel] = useState<"B2" | "C1">("C1");

  useEffect(() => {
    const stored = window.localStorage.getItem("lingopro:name");
    if (stored) setName(stored);
    let active = true;
    void fetchExamPlan().then((p) => {
      if (p && active) setTargetLevel(p.targetLevel);
    });
    // Google sign-ups never typed a name into our form — «Привет, студент»
    // while the account knows full_name is a bug (UX-audit #7)
    if (!stored) {
      void createClient()
        .auth.getUser()
        .then(({ data }) => {
          const full = (data.user?.user_metadata?.full_name as string | undefined)?.trim();
          if (full && active) {
            setName(full.split(" ")[0]);
            try {
              window.localStorage.setItem("lingopro:name", full.split(" ")[0]);
            } catch {
              /* ignore */
            }
          }
        });
    }
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      // one getUser + one Promise.all(profile, history) — no duplicate queries
      const data = await loadDashboardData(locale);
      if (!active) return;
      setLevelRaw(data.levelRaw);

      setToday(data.today);
      setHistory(data.history);
      setLoading(false);
      if (data.today) {
        window.dispatchEvent(new CustomEvent("lp:daily-updated", { detail: { completed: data.today.completedCount, total: data.today.total } }));
      }

      // plan engine: no route yet → generate once; stale route (built with
      // different minutes, e.g. a lost write) → regenerate with the real
      // inputs. Session-guarded so quota errors don't loop.
      if ((!data.hasRoute || data.routeStale) && !window.sessionStorage.getItem("lp:route-requested")) {
        window.sessionStorage.setItem("lp:route-requested", "1");
        void fetch("/api/ai/route", { method: "POST" })
          .then(async (r) => {
            if (!r.ok || !active) return;
            const fresh = await loadDashboardData(locale);
            if (!active) return;
            setToday(fresh.today);
            setHistory(fresh.history);
            if (fresh.today) {
              window.dispatchEvent(new CustomEvent("lp:daily-updated", { detail: { completed: fresh.today.completedCount, total: fresh.today.total } }));
            }
          })
          .catch(() => {});
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the live lesson page sets this flag when a session settles with real
  // minutes — credit the day's voice_lesson task when the student returns
  useEffect(() => {
    function creditVoiceTask() {
      if (window.localStorage.getItem("lingopro:voice-done") !== todayISO()) return;
      setToday((prev) => {
        if (!prev) return prev;
        const idx = prev.tasks.findIndex((t) => t.kind === "voice_lesson" && !t.completed);
        if (idx === -1) return prev;
        const tasks = prev.tasks.map((t, i) => (i === idx ? { ...t, completed: true } : t));
        const row: DayRow = { ...prev, tasks, completedCount: tasks.filter((t) => t.completed).length };
        void saveDay(row);
        setHistory((h) => h.map((r) => (r.date === row.date ? row : r)));
        window.dispatchEvent(new CustomEvent("lp:daily-updated", { detail: { completed: row.completedCount, total: row.total } }));
        return row;
      });
    }
    creditVoiceTask();
    window.addEventListener("focus", creditVoiceTask);
    return () => window.removeEventListener("focus", creditVoiceTask);
  }, []);

  // same pattern for mocks (audit #10): a finished mock section sets the flag,
  // the day's mock task gets credited when the student returns to the plan
  useEffect(() => {
    function creditMockTask() {
      if (window.localStorage.getItem("lingopro:mock-done") !== todayISO()) return;
      setToday((prev) => {
        if (!prev) return prev;
        const idx = prev.tasks.findIndex((t) => (t.kind === "mock_section" || t.kind === "mock_full") && !t.completed);
        if (idx === -1) return prev;
        const tasks = prev.tasks.map((t, i) => (i === idx ? { ...t, completed: true } : t));
        const row: DayRow = { ...prev, tasks, completedCount: tasks.filter((t) => t.completed).length };
        void saveDay(row);
        setHistory((h) => h.map((r) => (r.date === row.date ? row : r)));
        window.dispatchEvent(new CustomEvent("lp:daily-updated", { detail: { completed: row.completedCount, total: row.total } }));
        return row;
      });
    }
    creditMockTask();
    window.addEventListener("focus", creditMockTask);
    return () => window.removeEventListener("focus", creditMockTask);
  }, []);

  function completeTask(task: DailyTask, result: { score: number; maxScore: number; answers: unknown }) {
    setActiveTask(null);
    if (!today) return;
    const tasks = today.tasks.map((t) => (t.id === task.id ? { ...t, completed: true } : t));
    const completedCount = tasks.filter((t) => t.completed).length;
    const wasAll = today.completedCount >= today.total;
    const row: DayRow = { ...today, tasks, completedCount };
    setToday(row);
    setHistory((h) => h.map((r) => (r.date === row.date ? row : r)));
    void saveDay(row);
    void saveTaskResult({ taskId: task.taskId, skill: task.skill, score: result.score, maxScore: result.maxScore, answers: result.answers });

    // XP for the task itself (no cap — extra work beyond the plan still earns full XP)
    if (task.skill === "vocabulary") {
      const words = result.maxScore || task.count || 0;
      if (words > 0) void awardXp("vocab_word", XP.VOCAB_WORD * words, { metadata: { taskId: task.taskId, words } });
    } else {
      void awardSkillTest(task.skill, { taskId: task.taskId });
    }

    window.dispatchEvent(new CustomEvent("lp:daily-updated", { detail: { completed: completedCount, total: row.total } }));
    if (!wasAll && completedCount >= row.total) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2600);
      // bonuses — once per day (dedup_key makes a repeat a no-op)
      void awardXp("daily_plan_bonus", XP.DAILY_PLAN_BONUS, { dedupKey: `daily_plan:${row.date}` });
      void awardXp("streak_day_bonus", XP.STREAK_DAY_BONUS, { dedupKey: `streak_day:${row.date}` });
    }
  }

  const dateStr = useMemo(
    () => new Intl.DateTimeFormat(c.localeCode, { day: "numeric", month: "long", weekday: "long" }).format(new Date()),
    [c.localeCode],
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin-slow rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
  }

  // pace comes from the diagnostic minutes (single source of truth) — no
  // modal; a missing plan here only means the profile isn't loaded yet
  if (!today) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{c.hi}, {name}! 👋</h1>
        <LiveFacts streak={computeStreak(history)} levelRaw={levelRaw} />
        {/* the welcome must be reachable even before the plan loads */}
        <StartChecklist level={levelRaw} firstTaskDone={totalTasksDone(history) > 0} />
      </div>
    );
  }

  const { completedCount, total } = today;
  const allDone = completedCount >= total;
  const pct = Math.round((completedCount / total) * 100);
  const totalMin = today.tasks.reduce((s, t) => s + (t.estimatedMinutes || 10), 0);
  const remainingMin = today.tasks.filter((t) => !t.completed).reduce((s, t) => s + (t.estimatedMinutes || 10), 0);
  const streak = computeStreak(history);
  const week = weekCalendar(history);
  const lvl = contentLevel(levelRaw);
  const lvlPct = Math.round((LEVELS.indexOf(lvl) / (LEVELS.length - 1)) * 100);

  return (
    <div className="relative">
      {/* milestone toasts: only REAL events (topic closed / streak / mock PB) */}
      <Milestones history={history} />

      {/* confetti */}
      <AnimatePresence>
        {celebrate && (
          <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
            {Array.from({ length: 28 }).map((_, i) => {
              const left = (i * 37) % 100;
              const delay = (i % 7) * 0.08;
              const emoji = ["🎉", "✨", "🎊", "⭐️", "🔥"][i % 5];
              return (
                <motion.span
                  key={i}
                  className="absolute text-xl"
                  style={{ left: `${left}%`, top: "-5%" }}
                  initial={{ y: "-10vh", opacity: 1, rotate: 0 }}
                  animate={{ y: "110vh", opacity: [1, 1, 0], rotate: 360 }}
                  transition={{ duration: 2.2, delay, ease: "easeIn" }}
                >
                  {emoji}
                </motion.span>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{c.hi}, {name}! 👋</h1>

      {/* ===== LIVE FACTS (motivator: real numbers only) ===== */}
      <LiveFacts streak={streak} levelRaw={levelRaw} />

      {/* ===== GETTING STARTED (first visits only; real progress) ===== */}
      <StartChecklist level={levelRaw} firstTaskDone={totalTasksDone(history) > 0} />

      {/* ===== Ahu's daily note: slim strip, the teacher opens the day —
           the PLAN below stays the hero of the page ===== */}
      <AhuCoach />

      {/* ===== PLAN ===== */}
      <div id="plan" className="mt-6 rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_-12px_rgba(16,24,40,0.15)] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--color-foreground)]">📋 {c.planTitle}</h2>
            <p className="mt-0.5 text-sm capitalize text-[var(--color-muted)]">{dateStr}</p>
          </div>
          <div className="text-right text-sm">
            <div className="font-medium text-[var(--color-foreground)]">{minutesLabel(totalMin, locale)}</div>
            {/* pace (minutes/day) is edited in settings — the single source of truth */}
            <Link href="/dashboard/settings" className="text-xs font-medium text-[var(--color-brand)] hover:underline">
              {c.change}
            </Link>
          </div>
        </div>

        {/* honest checkpoint: locked exam date + goal doesn't fit → the
            mobilization forecast, never a silent overpromise */}
        <PlanCheckpoint />

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-semibold text-[var(--color-foreground)]">{completedCount}/{total} {c.done}</span>
          {!allDone && <span className="text-[var(--color-muted)]">{minutesLabel(remainingMin, locale)} {c.remaining}</span>}
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: allDone ? "linear-gradient(to right,#16a34a,#22c55e)" : "linear-gradient(to right,var(--color-brand),var(--color-brand-2))" }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {allDone && (
          <div className="mt-4 rounded-2xl bg-[#16a34a]/[0.08] px-4 py-3 text-center text-sm font-semibold text-[#16a34a]">
            {c.allDone}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2.5">
          {today.tasks.map((task) => {
            const meta = SKILL_META[task.skill];
            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 transition-colors ${
                  task.completed ? "border-[#16a34a]/25 bg-[#16a34a]/[0.05]" : "border-black/[0.07] bg-white"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs ${
                    task.completed ? "bg-[#16a34a] text-white" : "border border-black/[0.2] text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg" style={{ background: `${meta.color}1a`, color: meta.color }}>
                  {meta.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`flex flex-wrap items-center gap-1.5 text-sm font-medium text-[var(--color-foreground)] ${task.completed ? "line-through opacity-60" : ""}`}>
                    {task.title || skillLabel(task.skill, locale)}
                    {(!task.kind || task.kind === "regular") && (
                      <span className="text-[var(--color-muted)]">· {taskDescription(task, locale)}</span>
                    )}
                    {task.skill !== "vocabulary" && task.skill !== "writing" && (
                      <span className="rounded-full bg-black/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-brand-2)]">{task.level}</span>
                    )}
                    <span className="text-[11px] text-[var(--color-muted)]">· {minutesLabel(task.estimatedMinutes || 10, locale)}</span>
                  </div>
                </div>
                {task.completed ? (
                  <span className="shrink-0 text-xs font-semibold text-[#16a34a]">✓ {c.doneLabel}</span>
                ) : task.kind === "voice_lesson" ? (
                  <Link
                    href={`/dashboard/speaking/live?mode=${task.voiceMode ?? "plan"}${task.focusTopics?.length ? `&focus=${task.focusTopics.join(",")}` : ""}`}
                    className="shrink-0 rounded-full bg-[var(--color-brand)]/10 px-4 py-2 text-xs font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/20"
                  >
                    {c.start}
                  </Link>
                ) : task.kind === "mock_section" || task.kind === "mock_full" ? (
                  <Link
                    href="/dashboard/mock"
                    className="shrink-0 rounded-full bg-[var(--color-brand)]/10 px-4 py-2 text-xs font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/20"
                  >
                    {c.start}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTask(task)}
                    className="shrink-0 rounded-full bg-[var(--color-brand)]/10 px-4 py-2 text-xs font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/20"
                  >
                    {c.start}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== WEEKLY DIGEST — Mon–Tue only, real numbers or an honest
           skip line; below the plan so the top never turns into каша ===== */}
      <WeeklyDigest history={history} />

      {/* ===== STREAK ===== */}
      <div className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#f59e0b] to-[#ef4444] p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-bold">🔥 {streak} {c.streakTitle}</div>
            <p className="mt-1 max-w-xs text-sm text-white/80">{c.streakHint}</p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            {week.map((d, i) => (
              <div key={d.iso} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-white/70">{c.week[i]}</span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                    d.done ? "bg-white text-[#ea580c]" : d.today ? "border-2 border-white/70 text-white" : "bg-white/20 text-white/60"
                  }`}
                >
                  {d.done ? "✓" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MY PROGRESS ===== */}
      <h2 className="mt-8 text-lg font-semibold text-[var(--color-foreground)]">{c.myProgress}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <div className="text-sm font-semibold text-[var(--color-foreground)]">{c.levelCard}</div>
          <div className="mt-2 flex items-baseline gap-2 text-2xl font-bold text-[var(--color-foreground)]">
            {levelRaw} <span className="text-[var(--color-muted)]">→</span> <span className="text-gradient">{targetLevel}</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]" style={{ width: `${Math.max(6, lvlPct)}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-[var(--color-muted)]">
            {LEVELS.map((l) => (
              <span key={l} className={l === lvl ? "font-bold text-[var(--color-brand)]" : ""}>{l}</span>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="text-sm font-semibold text-[var(--color-foreground)]">{c.statsCard}</div>
          <div className="mt-4 flex flex-col gap-3">
            {[
              { label: c.statTasks, value: totalTasksDone(history), icon: "✅" },
              { label: c.statWords, value: wordsLearned(history), icon: "📚" },
              { label: c.statDays, value: streak, icon: "🔥" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-[var(--color-muted)]"><span>{s.icon}</span>{s.label}</span>
                <span className="text-lg font-bold text-[var(--color-foreground)]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CONTINUE ===== */}
      {allDone && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{c.continueTitle}</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CONTINUE.map((item) => (
              <Link key={item.key} href={item.href} className="glass flex flex-col items-center gap-2 rounded-2xl p-5 text-center transition-transform hover:-translate-y-0.5">
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-sm font-medium text-[var(--color-foreground)]">{c.cont[item.key]}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* modals */}
      <AnimatePresence>
        {activeTask && (
          <ErrorBoundary
            fallback={
              <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" onClick={() => setActiveTask(null)}>
                <div className="absolute inset-0 bg-[var(--color-navy)]/40 backdrop-blur-sm" />
                <div className="relative z-10 rounded-2xl bg-white p-6 text-center text-sm text-[var(--color-muted)]">
                  Что-то пошло не так.{" "}
                  <button type="button" onClick={() => setActiveTask(null)} className="font-medium text-[var(--color-brand)] underline">
                    Закрыть
                  </button>
                </div>
              </div>
            }
          >
            <TaskModal task={activeTask} onComplete={(r) => completeTask(activeTask, r)} onClose={() => setActiveTask(null)} />
          </ErrorBoundary>
        )}
      </AnimatePresence>
    </div>
  );
}
