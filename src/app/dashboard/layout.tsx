"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { loadPlan, savePlan, type PackageId } from "@/lib/billing";
import { NAV, activeNav, planBadge } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/client";
import { fetchProfile } from "@/lib/profile";
import { saveResult } from "@/lib/quiz";
import { saveProgress } from "@/lib/studyplan";

const NOTIF_META = [
  { emoji: "🟣", read: false },
  { emoji: "📖", read: false },
  { emoji: "📚", read: false },
  { emoji: "🎯", read: true },
  { emoji: "🔥", read: true },
];

const ENROLL_MAILTO = `mailto:lingopro2026@gmail.com?subject=${encodeURIComponent(
  "Запись на экзамен TÖMER",
)}&body=${encodeURIComponent(
  "Здравствуйте! Хочу записаться на экзамен TÖMER. Мой текущий уровень: ___. Желаемая дата экзамена: ___.",
)}`;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useI18n();
  const tx = pick(locale, {
    ru: {
      plan: "Персональный план", enroll: "Записаться на TÖMER", logout: "Выйти", new: "NEW", soon: "Скоро",
      planMy: "Мой план", planGoal: "Цель: C1", planDays: "30 дней до экзамена", planToday: "Сегодня: 3/5 задач",
      notifTitle: "Уведомления", markAll: "Отметить все как прочитанные",
      notifs: [
        { t: "Добро пожаловать в LingoPRO!", time: "1 мин назад" },
        { t: "Новый тест по чтению доступен", time: "2 часа назад" },
        { t: "Пора повторить 5 слов", time: "5 часов назад" },
        { t: "Поставьте цель подготовки к TÖMER", time: "1 день назад" },
        { t: "Ваша серия: 3 дня подряд!", time: "2 дня назад" },
      ],
    },
    en: {
      plan: "Personal plan", enroll: "Register for TÖMER", logout: "Log out", new: "NEW", soon: "Soon",
      planMy: "My plan", planGoal: "Goal: C1", planDays: "30 days to the exam", planToday: "Today: 3/5 tasks",
      notifTitle: "Notifications", markAll: "Mark all as read",
      notifs: [
        { t: "Welcome to LingoPRO!", time: "1 min ago" },
        { t: "A new reading test is available", time: "2 hours ago" },
        { t: "Time to review 5 words", time: "5 hours ago" },
        { t: "Set your TÖMER prep goal", time: "1 day ago" },
        { t: "Your streak: 3 days in a row!", time: "2 days ago" },
      ],
    },
    tr: {
      plan: "Kişisel plan", enroll: "TÖMER'e kayıt ol", logout: "Çıkış", new: "NEW", soon: "Yakında",
      planMy: "Planım", planGoal: "Hedef: C1", planDays: "Sınava 30 gün", planToday: "Bugün: 3/5 görev",
      notifTitle: "Bildirimler", markAll: "Tümünü okundu işaretle",
      notifs: [
        { t: "LingoPRO'ya hoş geldin!", time: "1 dk önce" },
        { t: "Yeni okuma testi hazır", time: "2 saat önce" },
        { t: "5 kelimeyi tekrar etme zamanı", time: "5 saat önce" },
        { t: "TÖMER hazırlık hedefini belirle", time: "1 gün önce" },
        { t: "Serin: 3 gün üst üste!", time: "2 gün önce" },
      ],
    },
    kk: {
      plan: "Жеке жоспар", enroll: "TÖMER-ге тіркелу", logout: "Шығу", new: "NEW", soon: "Жақында",
      planMy: "Менің жоспарым", planGoal: "Мақсат: C1", planDays: "Емтиханға 30 күн", planToday: "Бүгін: 3/5 тапсырма",
      notifTitle: "Хабарламалар", markAll: "Барлығын оқылды деп белгілеу",
      notifs: [
        { t: "LingoPRO-ға қош келдің!", time: "1 мин бұрын" },
        { t: "Жаңа оқу тесті қолжетімді", time: "2 сағат бұрын" },
        { t: "5 сөзді қайталау уақыты", time: "5 сағат бұрын" },
        { t: "TÖMER дайындық мақсатын қой", time: "1 күн бұрын" },
        { t: "Сериясың: қатарынан 3 күн!", time: "2 күн бұрын" },
      ],
    },
  });

  const [allowed, setAllowed] = useState(false);
  const [name, setName] = useState("студент");
  const [user, setUser] = useState<{ name: string; email: string; avatar: string | null } | null>(null);
  const [plan, setPlan] = useState<PackageId | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [reads, setReads] = useState<boolean[]>(NOTIF_META.map((n) => n.read));
  const notifRef = useRef<HTMLDivElement>(null);
  const unread = reads.filter((r) => !r).length;

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { user: u },
      } = await supabase.auth.getUser();

      if (u) {
        const full = (u.user_metadata?.full_name as string) || u.email || "";
        if (active) {
          setUser({ name: full, email: u.email ?? "", avatar: (u.user_metadata?.avatar_url as string) ?? null });
          if (full) setName(full);
        }
        // hydrate the localStorage cache from the persistent Supabase profile
        const profile = await fetchProfile();
        if (profile?.plan) savePlan(profile.plan as PackageId);
        if (profile?.quiz_result) saveResult(profile.quiz_result);
        if (profile?.plan_progress && Object.keys(profile.plan_progress).length) saveProgress(profile.plan_progress);
      }

      if (!active) return;
      const p = loadPlan();
      if (!p) {
        router.replace("/pricing");
        return;
      }
      setPlan(p);
      setAllowed(true);
      if (!u) {
        const stored = window.localStorage.getItem("lingopro:name");
        if (stored) setName(stored);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

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

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin-slow rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
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
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--color-muted)]">
                  <span>🎯</span> {tx.planGoal}
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--color-muted)]">
                  <span>📅</span> {tx.planDays}
                </div>
                <div className="px-2 py-1.5">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    <span>⚡</span> {tx.planToday}
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                    <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* external + user */}
      <div className="mt-3 flex flex-col gap-2">
        <a
          href={ENROLL_MAILTO}
          className="flex items-center gap-2 rounded-xl border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/[0.05] px-3 py-2.5 text-sm font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/[0.1]"
        >
          🔗 <span className="flex-1">{tx.enroll}</span>
          <span className="rounded-full bg-[#f97316]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#ea580c]">
            {tx.soon}
          </span>
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
                    {tx.notifs.map((n, i) => {
                      const read = reads[i];
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReads((prev) => prev.map((r, j) => (j === i ? true : r)))}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.03] ${
                            read ? "" : "bg-[#3b82f6]/[0.05]"
                          }`}
                        >
                          <span className="relative mt-0.5 text-base">
                            {!read && <span className="absolute -left-2 top-1.5 h-2 w-2 rounded-full bg-[#3b82f6]" />}
                            {NOTIF_META[i].emoji}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block text-sm ${read ? "text-[var(--color-muted)]" : "font-medium text-[var(--color-foreground)]"}`}>
                              {n.t}
                            </span>
                            <span className="text-xs text-[var(--color-muted)]">{n.time}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setReads((prev) => prev.map(() => true))}
                    className="w-full border-t border-black/[0.06] px-4 py-3 text-center text-xs font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/[0.05]"
                  >
                    {tx.markAll}
                  </button>
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

      <main className="mx-auto max-w-5xl px-4 py-7 sm:px-8">{children}</main>
    </div>
  );
}
