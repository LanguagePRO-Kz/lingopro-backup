"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { FeedbackButton } from "@/components/FeedbackButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { NAV, activeNav, planBadge } from "@/lib/dashboard";
import { trialLeftLabel } from "@/lib/trial";
import { createClient } from "@/lib/supabase/client";
import { fetchProfile, syncProfileTimezone } from "@/lib/profile";
import { saveResult } from "@/lib/quiz";
import { saveProgress } from "@/lib/studyplan";
import { computeStreak, peekToday, type DayRow } from "@/lib/daily-plan";
import { daysToExam, fetchExamPlan } from "@/lib/exam-plan";

/** Уведомление, собранное из РЕАЛЬНОГО события (правило 1.3: нет события —
 * нет уведомления; выдуманные «серия 3 дня» у свежего юзера — враньё). */
type Notif = { id: string; emoji: string; text: string; href?: string };

const NOTIF_READ_KEY = "lingopro:notif-read";

const ENROLL_MAILTO = `mailto:lingopro2026@gmail.com?subject=${encodeURIComponent(
  "Запись на экзамен TÖMER",
)}&body=${encodeURIComponent(
  "Здравствуйте! Хочу записаться на экзамен TÖMER. Мой текущий уровень: ___. Желаемая дата экзамена: ___.",
)}`;

/**
 * Клиентская оболочка дашборда. Доступ уже решён СЕРВЕРОМ (layout.tsx:
 * auth + активный план из БД, редиректы до рендера) — здесь только UI.
 * plan/trialMsLeft приходят с сервера; localStorage доступ не решает.
 */
export default function DashboardShell({
  children,
  plan,
  trialMsLeft,
}: {
  children: ReactNode;
  plan: string;
  trialMsLeft: number | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useI18n();
  const tx = pick(locale, {
    ru: {
      plan: "Персональный план", enroll: "Записаться на TÖMER", logout: "Выйти", new: "NEW", soon: "Скоро",
      planMy: "Мой план",
      planGoal: (tgt: string) => `Цель: ${tgt}`,
      planDays: (d: number) => `${d} дн. до экзамена`,
      planNoDate: "Дата экзамена не задана",
      planToday: (done: number, total: number) => `Сегодня: ${done}/${total} задач`,
      notifTitle: "Уведомления", markAll: "Отметить все как прочитанные",
      nToday: (n: number) => `В плане на сегодня осталось ${n} задач`,
      nDone: "План на сегодня выполнен — отличная работа!",
      nStreak: (n: number) => `Серия: ${n} дн. подряд — не прерывай сегодня`,
      nProbe: "Оценка говорения пуста — пройди пробу (2 мин)",
      nTrial: (h: number) => `Триал заканчивается через ~${h} ч`,
      nEmpty: "Пока нет уведомлений",
    },
    en: {
      plan: "Personal plan", enroll: "Register for TÖMER", logout: "Log out", new: "NEW", soon: "Soon",
      planMy: "My plan",
      planGoal: (tgt: string) => `Goal: ${tgt}`,
      planDays: (d: number) => `${d} days to the exam`,
      planNoDate: "Exam date not set",
      planToday: (done: number, total: number) => `Today: ${done}/${total} tasks`,
      notifTitle: "Notifications", markAll: "Mark all as read",
      nToday: (n: number) => `${n} tasks left in today's plan`,
      nDone: "Today's plan is done — great work!",
      nStreak: (n: number) => `Streak: ${n} days in a row — keep it alive today`,
      nProbe: "Your speaking score is empty — take the 2-min probe",
      nTrial: (h: number) => `Your trial ends in ~${h} h`,
      nEmpty: "No notifications yet",
    },
    tr: {
      plan: "Kişisel plan", enroll: "TÖMER'e kayıt ol", logout: "Çıkış", new: "NEW", soon: "Yakında",
      planMy: "Planım",
      planGoal: (tgt: string) => `Hedef: ${tgt}`,
      planDays: (d: number) => `Sınava ${d} gün`,
      planNoDate: "Sınav tarihi belirlenmedi",
      planToday: (done: number, total: number) => `Bugün: ${done}/${total} görev`,
      notifTitle: "Bildirimler", markAll: "Tümünü okundu işaretle",
      nToday: (n: number) => `Bugünkü planda ${n} görev kaldı`,
      nDone: "Bugünkü plan tamam — harika iş!",
      nStreak: (n: number) => `Seri: üst üste ${n} gün — bugün de koru`,
      nProbe: "Konuşma puanın boş — 2 dakikalık denemeyi yap",
      nTrial: (h: number) => `Deneme süren ~${h} saat içinde bitiyor`,
      nEmpty: "Henüz bildirim yok",
    },
    kk: {
      plan: "Жеке жоспар", enroll: "TÖMER-ге тіркелу", logout: "Шығу", new: "NEW", soon: "Жақында",
      planMy: "Менің жоспарым",
      planGoal: (tgt: string) => `Мақсат: ${tgt}`,
      planDays: (d: number) => `Емтиханға ${d} күн`,
      planNoDate: "Емтихан күні қойылмаған",
      planToday: (done: number, total: number) => `Бүгін: ${done}/${total} тапсырма`,
      notifTitle: "Хабарламалар", markAll: "Барлығын оқылды деп белгілеу",
      nToday: (n: number) => `Бүгінгі жоспарда ${n} тапсырма қалды`,
      nDone: "Бүгінгі жоспар орындалды — керемет!",
      nStreak: (n: number) => `Серия: қатарынан ${n} күн — бүгін де жалғастыр`,
      nProbe: "Сөйлесім бағасы бос — 2 минуттық сынамадан өт",
      nTrial: (h: number) => `Триал ~${h} сағаттан кейін бітеді`,
      nEmpty: "Әзірге хабарлама жоқ",
    },
  });

  const [name, setName] = useState("студент");
  const [user, setUser] = useState<{ name: string; email: string; avatar: string | null } | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  // реальные факты для уведомлений и «Моего плана» (грузятся одним заходом)
  const [notifFacts, setNotifFacts] = useState<{ streak: number; konusmaMissing: boolean } | null>(null);
  const [examInfo, setExamInfo] = useState<{ target: "B2" | "C1"; days: number | null } | null>(null);
  // прочитанность — по стабильным id в localStorage (переживает перезагрузку)
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      return new Set(JSON.parse(window.localStorage.getItem(NOTIF_READ_KEY) ?? "[]") as string[]);
    } catch {
      return new Set();
    }
  });

  function markRead(ids: string[]) {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      try {
        window.localStorage.setItem(NOTIF_READ_KEY, JSON.stringify([...next].slice(-100)));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  // today's daily-plan progress → sidebar "Home" indicator
  const [daily, setDaily] = useState<{ completed: number; total: number } | null>(null);
  useEffect(() => {
    let active = true;
    peekToday().then((d) => {
      if (active && d) setDaily(d);
    });
    function onUpdate(e: Event) {
      const detail = (e as CustomEvent<{ completed: number; total: number }>).detail;
      if (detail) setDaily(detail);
    }
    window.addEventListener("lp:daily-updated", onUpdate);
    return () => {
      active = false;
      window.removeEventListener("lp:daily-updated", onUpdate);
    };
  }, []);

  // имя/аватар в сайдбар + гидрация локальных кэшей квиза и прогресса.
  // Доступ здесь НЕ решается — это сделал серверный layout до рендера.
  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!u || !active) return;
      const full = (u.user_metadata?.full_name as string) || u.email || "";
      setUser({ name: full, email: u.email ?? "", avatar: (u.user_metadata?.avatar_url as string) ?? null });
      if (full) setName(full);
      // таймзона: «сегодня» Ahu и квот должно совпадать с сутками студента
      void syncProfileTimezone();
      const profile = await fetchProfile();
      if (!active) return;
      if (profile?.quiz_result) saveResult(profile.quiz_result);
      if (profile?.plan_progress && Object.keys(profile.plan_progress).length) saveProgress(profile.plan_progress);

      // реальные факты для уведомлений: стрик из daily_progress, пустая
      // оценка говорения из quiz_result — ничего выдуманного
      const konusmaMissing = !!profile?.quiz_result && profile.quiz_result.sections?.konusma == null;
      const { data: days } = await supabase
        .from("daily_progress")
        .select("date, tasks, completed_count, total_count")
        .eq("user_id", u.id)
        .order("date");
      if (!active) return;
      const streak = computeStreak(
        ((days as { date: string; tasks: unknown; completed_count: number; total_count: number }[] | null) ?? []).map((d) => ({
          date: d.date,
          tasks: (d.tasks ?? []) as DayRow["tasks"],
          completedCount: d.completed_count,
          total: d.total_count,
        })),
      );
      setNotifFacts({ streak, konusmaMissing });

      // «Мой план» в сайдбаре: реальная цель и дни до экзамена
      const ep = await fetchExamPlan();
      if (!active) return;
      setExamInfo({ target: ep?.targetLevel ?? "B2", days: daysToExam(ep) });
    })();
    return () => {
      active = false;
    };
  }, []);

  // уведомления — только из реальных событий; нет событий → честная пустота
  const todayKey = new Date().toISOString().slice(0, 10);
  const notifs: Notif[] = [];
  if (plan === "trial" && trialMsLeft != null && trialMsLeft > 0 && trialMsLeft <= 24 * 3600_000) {
    notifs.push({ id: `trial-${todayKey}`, emoji: "⏳", text: tx.nTrial(Math.max(1, Math.floor(trialMsLeft / 3600_000))), href: "/pricing" });
  }
  if (daily && daily.total > 0) {
    if (daily.completed < daily.total) {
      notifs.push({ id: `today-${todayKey}`, emoji: "📋", text: tx.nToday(daily.total - daily.completed), href: "/dashboard" });
    } else {
      notifs.push({ id: `done-${todayKey}`, emoji: "✅", text: tx.nDone });
    }
  }
  if (notifFacts && notifFacts.streak >= 2) {
    notifs.push({ id: `streak-${todayKey}`, emoji: "🔥", text: tx.nStreak(notifFacts.streak) });
  }
  if (notifFacts?.konusmaMissing) {
    notifs.push({ id: "probe", emoji: "🎤", text: tx.nProbe, href: "/quiz/speaking" });
  }
  const unread = notifs.filter((n) => !readIds.has(n.id)).length;

  useEffect(() => {
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    if (!notifOpen) return;
    function onDown(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [notifOpen]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const current = activeNav(pathname);
  const mainNav = NAV.filter((n) => n.id !== "settings");
  const settings = NAV.find((n) => n.id === "settings")!;

  const SidebarInner = (
    <>
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <Logo className="h-8 w-8" />
        <span className="text-lg font-bold tracking-tight">
          Lingo<span className="text-gradient">PRO</span>
        </span>
      </Link>
      <div className="mt-4 h-px bg-black/[0.06]" />

      <nav className="mt-4 flex flex-1 flex-col gap-0.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {mainNav.map((n) => {
          const active = n.id === current.id;
          return (
            <Link
              key={n.id}
              href={n.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-[var(--color-brand)]/[0.1] font-medium text-[var(--color-brand)]"
                  : "text-[var(--color-muted)] hover:bg-black/[0.04] hover:text-[var(--color-foreground)]"
              }`}
            >
              <span className="text-base">{n.emoji}</span>
              {n.label[locale]}
              {n.isNew && (
                <span className="ml-auto rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {tx.new}
                </span>
              )}
              {n.id === "home" && daily && (
                daily.completed >= daily.total ? (
                  <span className="ml-auto text-sm font-bold text-[#16a34a]" aria-label="daily plan done">✓</span>
                ) : (
                  <span
                    className={`ml-auto h-2.5 w-2.5 rounded-full ${daily.completed === 0 ? "bg-[#ef4444]" : "bg-[#f59e0b]"}`}
                    aria-label="daily plan progress"
                  />
                )
              )}
            </Link>
          );
        })}

        {/* Personal plan — label navigates, chevron expands */}
        <div className="mt-1 flex items-center rounded-xl text-sm text-[var(--color-muted)] transition-colors hover:bg-black/[0.04]">
          <Link href="/dashboard/plan" className="flex flex-1 items-center gap-3 rounded-l-xl px-3 py-2.5 hover:text-[var(--color-foreground)]">
            <span className="text-base">📋</span>
            {tx.plan}
          </Link>
          <button
            type="button"
            onClick={() => setPlanOpen((o) => !o)}
            aria-label={tx.plan}
            className="rounded-r-xl px-3 py-2.5 hover:text-[var(--color-foreground)]"
          >
            <motion.span animate={{ rotate: planOpen ? 180 : 0 }} className="inline-block text-xs">
              ▾
            </motion.span>
          </button>
        </div>
        <AnimatePresence initial={false}>
          {planOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="ml-3 flex flex-col gap-0.5 border-l border-black/[0.07] pl-2">
                <Link
                  href="/dashboard/plan"
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[var(--color-muted)] transition-colors hover:bg-black/[0.03] hover:text-[var(--color-foreground)]"
                >
                  <span>📋</span>
                  <span className="flex-1">{tx.planMy}</span>
                </Link>
                {/* реальные цель/дата/прогресс дня — не хардкод «C1 · 30 дней · 3/5» */}
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--color-muted)]">
                  <span>🎯</span> {tx.planGoal(examInfo?.target ?? "B2")}
                </div>
                {examInfo?.days != null && (
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--color-muted)]">
                    <span>📅</span> {tx.planDays(examInfo.days)}
                  </div>
                )}
                {daily && daily.total > 0 && (
                  <div className="px-2 py-1.5">
                    <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                      <span>⚡</span> {tx.planToday(daily.completed, daily.total)}
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] transition-[width]"
                        style={{ width: `${Math.round((100 * daily.completed) / daily.total)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* external + user */}
      <div className="mt-3 flex flex-col gap-2">
        {/* the mailto works — the contradictory «Скоро» badge is gone
            (UX-audit #15: a working button must not be labelled unready) */}
        <a
          href={ENROLL_MAILTO}
          className="flex items-center gap-2 rounded-xl border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/[0.05] px-3 py-2.5 text-sm font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/[0.1]"
        >
          🔗 <span className="flex-1">{tx.enroll}</span>
        </a>

        <div className="rounded-2xl border border-black/[0.06] bg-white p-3">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <span
                className="h-9 w-9 shrink-0 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${user.avatar})` }}
              />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-sm font-bold text-white">
                {(user?.name || name).charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[var(--color-foreground)]">{user?.name || name}</div>
              <div className="truncate text-xs text-[var(--color-muted)]">{user?.email || planBadge(plan, locale)}</div>
            </div>
            <Link
              href={settings.href}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-black/[0.05]"
              aria-label={settings.label[locale]}
            >
              ⚙️
            </Link>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2.5 w-full rounded-xl border border-black/[0.08] py-2 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-black/[0.03] hover:text-[var(--color-foreground)]"
          >
            {tx.logout}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-black/[0.06] bg-white/80 p-5 backdrop-blur lg:flex">
        {SidebarInner}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.button
              type="button"
              aria-label="close menu"
              onClick={() => setDrawer(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto border-r border-black/[0.06] bg-white p-5 lg:hidden"
            >
              {SidebarInner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/[0.06] bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-foreground)] hover:bg-black/[0.05] lg:hidden"
            aria-label="open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="text-base font-semibold tracking-tight text-[var(--color-foreground)] sm:text-lg">
            {current.emoji} {current.label[locale]}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-muted)] transition-colors hover:bg-black/[0.05] hover:text-[var(--color-foreground)]"
              aria-label={tx.notifTitle}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9M9 21a3 3 0 006 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-red)] px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
                    <span className="text-sm font-semibold text-[var(--color-foreground)]">{tx.notifTitle}</span>
                    {unread > 0 && (
                      <span className="rounded-full bg-[var(--color-red)] px-2 py-0.5 text-[10px] font-bold text-white">{unread}</span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifs.length === 0 && (
                      <div className="px-4 py-6 text-center text-sm text-[var(--color-muted)]">{tx.nEmpty}</div>
                    )}
                    {notifs.map((n) => {
                      const read = readIds.has(n.id);
                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            markRead([n.id]);
                            if (n.href) {
                              setNotifOpen(false);
                              router.push(n.href);
                            }
                          }}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.03] ${
                            read ? "" : "bg-[#3b82f6]/[0.05]"
                          }`}
                        >
                          <span className="relative mt-0.5 text-base">
                            {!read && <span className="absolute -left-2 top-1.5 h-2 w-2 rounded-full bg-[#3b82f6]" />}
                            {n.emoji}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block text-sm ${read ? "text-[var(--color-muted)]" : "font-medium text-[var(--color-foreground)]"}`}>
                              {n.text}
                            </span>
                            {n.href && <span className="text-xs text-[var(--color-brand)]">→</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {notifs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => markRead(notifs.map((n) => n.id))}
                      className="w-full border-t border-black/[0.06] px-4 py-3 text-center text-xs font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/[0.05]"
                    >
                      {tx.markAll}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <LanguageSwitcher />
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-sm font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-7 sm:px-8">
        {/* триал: честный статус + путь к подписке, без сюрпризов
            (остаток форматирует trialLeftLabel — округление вниз, не вверх) */}
        {plan === "trial" && trialMsLeft != null && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-brand)]/25 bg-[var(--color-brand)]/[0.06] px-4 py-3">
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              ⏳ {planBadge(plan, locale)} · {trialLeftLabel(trialMsLeft, locale)}
            </span>
            <Link
              href="/pricing"
              className="btn-primary rounded-full px-4 py-2 text-xs font-semibold"
            >
              {pick(locale, { ru: "Оформить подписку", en: "Subscribe", tr: "Abone ol", kk: "Жазылу" })} →
            </Link>
          </div>
        )}
        {children}
      </main>

      {/* Фаза 6: «Сообщить о проблеме» — виден на каждой странице кабинета */}
      <FeedbackButton />
    </div>
  );
}
