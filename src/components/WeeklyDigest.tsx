"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { createClient } from "@/lib/supabase/client";
import { todayISO, addDaysISO, type DayRow } from "@/lib/daily-plan";

/**
 * Weekly digest (motivator block 2) — last week's REAL numbers, shown once
 * per week until dismissed. Founder's honesty condition: a zero week is
 * named a zero week ("пропуск — бывает, вернёмся"), never dressed up as
 * "отличная неделя". New accounts (no history before this week) see nothing.
 */

const T = {
  ru: {
    title: "Итоги прошлой недели",
    tasks: (n: number) => `✅ ${n} заданий`,
    days: (n: number) => `📅 ${n} активных ${n === 1 ? "день" : [2, 3, 4].includes(n) ? "дня" : "дней"}`,
    voice: (n: number) => `🎙 ${n} ${n === 1 ? "голосовой урок" : [2, 3, 4].includes(n) ? "голосовых урока" : "голосовых уроков"}`,
    minutes: (n: number) => `⏱ ~${n} мин занятий`,
    zero: "Прошлая неделя — пропуск. Бывает. План на сегодня готов — вернёмся с малого.",
    close: "Скрыть",
  },
  en: {
    title: "Last week in numbers",
    tasks: (n: number) => `✅ ${n} tasks`,
    days: (n: number) => `📅 ${n} active ${n === 1 ? "day" : "days"}`,
    voice: (n: number) => `🎙 ${n} voice ${n === 1 ? "lesson" : "lessons"}`,
    minutes: (n: number) => `⏱ ~${n} min of study`,
    zero: "Last week was a skip. It happens. Today's plan is ready — let's ease back in.",
    close: "Hide",
  },
  tr: {
    title: "Geçen haftanın özeti",
    tasks: (n: number) => `✅ ${n} görev`,
    days: (n: number) => `📅 ${n} aktif gün`,
    voice: (n: number) => `🎙 ${n} sesli ders`,
    minutes: (n: number) => `⏱ ~${n} dk çalışma`,
    zero: "Geçen hafta boş geçti. Olur. Bugünün planı hazır — küçük adımla dönelim.",
    close: "Gizle",
  },
  kk: {
    title: "Өткен аптаның қорытындысы",
    tasks: (n: number) => `✅ ${n} тапсырма`,
    days: (n: number) => `📅 ${n} белсенді күн`,
    voice: (n: number) => `🎙 ${n} дауысты сабақ`,
    minutes: (n: number) => `⏱ ~${n} мин оқу`,
    zero: "Өткен апта қалып қойды. Болады. Бүгінгі жоспар дайын — кішкентайдан қайта бастайық.",
    close: "Жасыру",
  },
};

/** Monday of the week containing `iso` (local calendar dates). */
function mondayOf(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay(); // 0=Sun
  return addDaysISO(iso, -((dow + 6) % 7));
}

export function WeeklyDigest({ history }: { history: DayRow[] }) {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [voiceCount, setVoiceCount] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(true); // resolved in the effect

  const thisMonday = mondayOf(todayISO());
  const prevMonday = addDaysISO(thisMonday, -7);
  const lsKey = `lingopro:digest:${thisMonday}`;

  // founder verification: /dashboard?motivator=1 shows the digest with the
  // real numbers regardless of the dismissal/new-account gates
  const [forced, setForced] = useState(false);

  useEffect(() => {
    let active = true;
    try {
      setForced(new URLSearchParams(window.location.search).get("motivator") === "1");
      setDismissed(window.localStorage.getItem(lsKey) === "1");
    } catch {
      /* stays hidden */
    }
    void (async () => {
      const { data, error } = await createClient()
        .from("voice_sessions")
        .select("id")
        .gte("created_at", `${prevMonday}T00:00:00Z`)
        .lt("created_at", `${thisMonday}T00:00:00Z`)
        .limit(100);
      if (active) setVoiceCount(error ? null : (data ?? []).length);
    })();
    return () => {
      active = false;
    };
  }, [lsKey, prevMonday, thisMonday]);

  // fresh reading, not a permanent fixture: Monday/Tuesday only (founder:
  // the dashboard must not accumulate blocks)
  const dow = new Date().getDay();
  if (!forced && dow !== 1 && dow !== 2) {
    console.info("[motivator] WeeklyDigest hidden: shows Mon–Tue only — force with /dashboard?motivator=1");
    return null;
  }
  // only accounts that existed before this week get a digest
  if (!forced && !history.some((r) => r.date < thisMonday)) {
    console.info("[motivator] WeeklyDigest hidden: no history before this Monday (new account) — force with /dashboard?motivator=1");
    return null;
  }
  if (!forced && dismissed) {
    console.info("[motivator] WeeklyDigest hidden: dismissed this week — force with /dashboard?motivator=1");
    return null;
  }

  const week = history.filter((r) => r.date >= prevMonday && r.date < thisMonday);
  const tasksDone = week.reduce((s, r) => s + r.completedCount, 0);
  const activeDays = week.filter((r) => r.completedCount > 0).length;
  const minutes = week.reduce(
    (s, r) => s + r.tasks.filter((t) => t.completed).reduce((m, t) => m + (t.estimatedMinutes || 10), 0),
    0,
  );
  const voice = voiceCount ?? 0;
  // "неделя-пропуск" is a factual claim — only make it when the voice data
  // really arrived; a failed query must not turn into a false zero
  if (tasksDone === 0 && voiceCount == null) return null;
  const zeroWeek = tasksDone === 0 && voiceCount === 0;

  function close() {
    setDismissed(true);
    try {
      window.localStorage.setItem(lsKey, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-3xl border border-black/[0.06] bg-white p-5 shadow-[0_8px_30px_-16px_rgba(16,24,40,0.2)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-bold text-[var(--color-foreground)]">📬 {c.title}</h2>
        <button
          type="button"
          aria-label={c.close}
          onClick={close}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-black/[0.06]"
        >
          ✕
        </button>
      </div>
      {zeroWeek ? (
        <p className="mt-2 text-sm text-[var(--color-muted)]">{c.zero}</p>
      ) : (
        <div className="mt-2.5 flex flex-wrap gap-2">
          <span className="rounded-full bg-black/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--color-foreground)]">{c.tasks(tasksDone)}</span>
          <span className="rounded-full bg-black/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--color-foreground)]">{c.days(activeDays)}</span>
          {voiceCount != null && (
            <span className="rounded-full bg-black/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--color-foreground)]">{c.voice(voice)}</span>
          )}
          {minutes > 0 && (
            <span className="rounded-full bg-black/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--color-foreground)]">{c.minutes(minutes)}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
