"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { loadResult, PLANS, qt, type QuizResult } from "@/lib/quiz";
import { fetchExamPlan, type ExamPlan } from "@/lib/exam-plan";
import { assessPlan, type StudentLevel } from "@/lib/plan/feasibility";
import {
  todaysTasks,
  loadProgress,
  saveProgress,
  toggleTask,
  doneToday,
  streak as streakOf,
  totalDone,
  activeDays,
  motivate,
  skillName,
  type Progress,
  type PlanTask,
} from "@/lib/studyplan";
import { saveProfileProgress } from "@/lib/profile";

const T = {
  ru: {
    emptyTitle: "Персональный план подготовки",
    emptySub: "Пройди диагностику — и AI составит план под твои слабые места",
    emptyBody: "AI Öğretmen проанализирует 5 навыков TÖMER и построит ежедневный план с заданиями, прогрессом и мотивацией.",
    emptyCta: "Пройти диагностику",
    title: "Твой персональный план",
    goalNow: "сейчас", goalTarget: "цель", duration: "Срок",
    today: "Задания на сегодня", done: "выполнено", min: "мин", startBtn: "Начать",
    streak: "Серия", days: "дн.", totalDone: "Заданий выполнено", activeDays: "Активных дней",
    focus: "Над чем работаем (по диагностике)", stages: "Этапы плана",
    motivator: "AI Öğretmen — твой мотиватор", askAi: "Совет от AI", thinking: "Думаю…",
    retake: "Пройти диагностику заново",
  },
  en: {
    emptyTitle: "Personal preparation plan",
    emptySub: "Take the diagnostic — AI will build a plan around your weak spots",
    emptyBody: "AI Öğretmen analyses your 5 TÖMER skills and builds a daily plan with tasks, progress and motivation.",
    emptyCta: "Take the diagnostic",
    title: "Your personal plan",
    goalNow: "now", goalTarget: "goal", duration: "Timeline",
    today: "Today's tasks", done: "done", min: "min", startBtn: "Start",
    streak: "Streak", days: "d", totalDone: "Tasks completed", activeDays: "Active days",
    focus: "What we focus on (from the diagnostic)", stages: "Plan stages",
    motivator: "AI Öğretmen — your motivator", askAi: "AI advice", thinking: "Thinking…",
    retake: "Retake the diagnostic",
  },
  tr: {
    emptyTitle: "Kişisel hazırlık planı",
    emptySub: "Teşhisi geç — AI zayıf yönlerine göre plan kursun",
    emptyBody: "AI Öğretmen 5 TÖMER becerini analiz eder ve görevler, ilerleme ve motivasyonla günlük plan oluşturur.",
    emptyCta: "Teşhise başla",
    title: "Kişisel planın",
    goalNow: "şimdi", goalTarget: "hedef", duration: "Süre",
    today: "Bugünün görevleri", done: "tamam", min: "dk", startBtn: "Başla",
    streak: "Seri", days: "g", totalDone: "Tamamlanan görev", activeDays: "Aktif gün",
    focus: "Neye odaklanıyoruz (teşhise göre)", stages: "Plan aşamaları",
    motivator: "AI Öğretmen — motivatörün", askAi: "AI tavsiyesi", thinking: "Düşünüyorum…",
    retake: "Teşhisi tekrar geç",
  },
  kk: {
    emptyTitle: "Жеке дайындық жоспары",
    emptySub: "Диагностикадан өт — AI әлсіз тұстарыңа жоспар құрады",
    emptyBody: "AI Öğretmen 5 TÖMER дағдысын талдап, тапсырмалары, прогресі мен мотивациясы бар күнделікті жоспар жасайды.",
    emptyCta: "Диагностикадан өту",
    title: "Сенің жеке жоспарың",
    goalNow: "қазір", goalTarget: "мақсат", duration: "Мерзім",
    today: "Бүгінгі тапсырмалар", done: "орындалды", min: "мин", startBtn: "Бастау",
    streak: "Серия", days: "к.", totalDone: "Орындалған тапсырма", activeDays: "Белсенді күн",
    focus: "Неге назар аударамыз (диагностика бойынша)", stages: "Жоспар кезеңдері",
    motivator: "AI Öğretmen — мотиваторың", askAi: "AI кеңесі", thinking: "Ойланудамын…",
    retake: "Диагностиканы қайта өту",
  },
};

function barColor(p: number) {
  if (p >= 70) return "#16a34a";
  if (p >= 40) return "#f59e0b";
  return "#dc2626";
}

export default function PlanPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [progress, setProgress] = useState<Progress>({});
  const [tip, setTip] = useState<string | null>(null);
  const [tipLoading, setTipLoading] = useState(false);
  // real goal/date/pace — the goal card must show the student's actual
  // inputs, not the static template (founder-reported)
  const [examPlan, setExamPlan] = useState<(ExamPlan & { minutesDaily: number | null }) | null>(null);

  useEffect(() => {
    setResult(loadResult());
    setProgress(loadProgress());
    setReady(true);
    let active = true;
    void fetchExamPlan().then((p) => {
      if (p && active) setExamPlan(p);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin-slow rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
  }

  /* -------------------------------- Empty -------------------------------- */
  if (!result) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-black/[0.03] text-[var(--color-muted)]">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M7.5 13h2m3 0h2m-7 4h2m3 0h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-[var(--color-foreground)]">{c.emptyTitle}</h1>
        <p className="mt-2 text-sm text-[var(--color-brand)]">{c.emptySub}</p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--color-muted)]">{c.emptyBody}</p>
        <Link href="/quiz" className="btn-primary mt-7 inline-block rounded-full px-6 py-3.5 text-sm">
          {c.emptyCta} →
        </Link>
      </div>
    );
  }

  /* -------------------------------- Plan --------------------------------- */
  const tasks = todaysTasks(result, locale);
  const done = doneToday(progress);
  const doneCount = done.length;
  const str = streakOf(progress);
  const plan = PLANS[result.plan];
  const mot = motivate(locale, doneCount, tasks.length, str);
  const weak = [...result.skills].sort((a, b) => a.percent - b.percent).slice(0, 3);

  function toggle(t: PlanTask) {
    setProgress((prev) => {
      const next = toggleTask(prev, t.id);
      saveProgress(next);
      void saveProfileProgress(next);
      return next;
    });
  }

  async function askAi() {
    setTipLoading(true);
    setTip(null);
    const ctx = `Öğrenci bugün ${doneCount}/${tasks.length} görev yaptı, serisi ${str} gün. Onu Türkçe kısa motive et ve parantez içinde Rusça açıklama ekle.`;
    try {
      const res = await fetch("/api/speaking", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "hint", messages: [{ role: "user", content: ctx }] }) });
      const d = await res.json();
      setTip(d.text ?? null);
    } catch {
      /* ignore */
    } finally {
      setTipLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{c.title}</h1>
      </div>

      {/* goal — real target/date/pace from the profile, honest-plan months
          when there is no date (the static template lied next to them) */}
      <div className="rounded-3xl bg-gradient-to-br from-[#5b4bd6] to-[#3a1d9c] p-6 text-white">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-bold">{result.level} → {examPlan?.targetLevel ?? "C1"}</div>
            <div className="mt-1 text-sm text-white/70">{plan.title[locale]}</div>
          </div>
          <div className="text-right text-sm text-white/80">
            <div className="text-[10px] uppercase tracking-wide text-white/50">{c.duration}</div>
            {examPlan
              ? (() => {
                  const minutes = Math.min(120, examPlan.minutesDaily ?? result.minutesDaily ?? 30);
                  const timeline =
                    examPlan.examDateMode === "exact" && examPlan.examDate
                      ? new Intl.DateTimeFormat(locale === "kk" ? "kk-KZ" : locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(examPlan.examDate))
                      : `~${
                          examPlan.examDateMode === "approx" && examPlan.examHorizonMonths
                            ? examPlan.examHorizonMonths
                            : assessPlan({
                                level: result.level as StudentLevel,
                                targetLevel: examPlan.targetLevel,
                                minutesDaily: minutes,
                                daysLeft: null,
                                kkNative: locale === "kk",
                              }).monthsNeeded
                        } ${qt(locale, "monthsShort")}`;
                  return `${timeline} · ${minutes} ${qt(locale, "minPerDay")}`;
                })()
              : plan.months[locale]}
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-[40%] rounded-full bg-white" />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-white/70">
          <span>{result.level} {c.goalNow}</span>
          <span>{examPlan?.targetLevel ?? "C1"} {c.goalTarget}</span>
        </div>
      </div>

      {/* AI motivator */}
      <div className="rounded-3xl border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/[0.05] p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl" style={{ background: "linear-gradient(135deg,#7C3AED,#6366F1)" }}>🤖</span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)]">{c.motivator}</div>
            <div className="mt-1 text-sm font-semibold text-[var(--color-foreground)]">{mot.line}</div>
            <p className="mt-0.5 text-sm text-[var(--color-muted)]">{mot.note}</p>
            {tip && <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-[var(--color-foreground)]">💡 {tip}</p>}
            <button type="button" onClick={askAi} disabled={tipLoading} className="mt-3 rounded-full bg-[var(--color-brand)] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
              {tipLoading ? c.thinking : `💬 ${c.askAi}`}
            </button>
          </div>
        </div>
      </div>

      {/* today tasks */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{c.today}</h2>
          <span className="text-sm font-medium text-[var(--color-brand)]">{doneCount}/{tasks.length} {c.done}</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/[0.05]">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]" animate={{ width: `${(doneCount / tasks.length) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {tasks.map((t) => {
            const isDone = done.includes(t.id);
            return (
              <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-black/[0.02] p-3.5">
                <button
                  type="button"
                  onClick={() => toggle(t)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs transition-colors ${isDone ? "border-[var(--color-brand-2)] bg-[var(--color-brand-2)] text-white" : "border-black/[0.2] text-transparent"}`}
                >
                  ✓
                </button>
                <span className="text-xl">{t.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium text-[var(--color-foreground)] ${isDone ? "line-through opacity-50" : ""}`}>{t.title}</div>
                  <div className="text-xs text-[var(--color-muted)]">{skillName(t.id, locale)} · {t.minutes} {c.min} · {t.xp} XP</div>
                </div>
                <Link href={t.href} className="shrink-0 rounded-full bg-[var(--color-brand)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/20">
                  {c.startBtn} →
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-[var(--color-foreground)]">🔥 {str}</div>
          <div className="mt-0.5 text-xs text-[var(--color-muted)]">{c.streak} ({c.days})</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-[var(--color-foreground)]">{totalDone(progress)}</div>
          <div className="mt-0.5 text-xs text-[var(--color-muted)]">{c.totalDone}</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-[var(--color-foreground)]">{activeDays(progress)}</div>
          <div className="mt-0.5 text-xs text-[var(--color-muted)]">{c.activeDays}</div>
        </div>
      </div>

      {/* focus areas (from diagnostic) */}
      <div className="glass rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{c.focus}</h2>
        <div className="mt-4 flex flex-col gap-3">
          {weak.map((s) => (
            <div key={s.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-[var(--color-foreground)]">{skillName(s.id, locale)}</span>
                <span className="text-[var(--color-muted)]">{s.percent}% · {s.level}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.05]">
                <div className="h-full rounded-full" style={{ width: `${s.percent}%`, background: barColor(s.percent) }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* plan stages */}
      <div className="glass rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{c.stages}</h2>
        <div className="mt-4 flex flex-col gap-2.5">
          {plan.stages.map((st, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs font-bold text-white">{i + 1}</span>
              <span className="text-sm text-[var(--color-foreground)]">{st[locale]}</span>
            </div>
          ))}
        </div>
      </div>

      <Link href="/quiz" className="text-center text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
        {c.retake}
      </Link>
    </div>
  );
}
