"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { createClient } from "@/lib/supabase/client";
import { computeStreak, type DayRow } from "@/lib/daily-plan";
import { topicById } from "@/lib/ai/topics";

/**
 * Milestone toasts (motivator block 4) — celebrate only REAL events:
 * a topic reaching strength ≥ 60, a streak threshold, a completed mock
 * (first one / better than the previous best). Detection is diff-based
 * against localStorage snapshots; the first visit seeds silently so nobody
 * gets a fake confetti burst for old history.
 */

const LS_MASTERED = "lingopro:ms:mastered";
const LS_STREAK = "lingopro:ms:streak";
const LS_MOCK = "lingopro:ms:mock";
const STREAK_STEPS = [3, 7, 14, 30, 60];

const T = {
  ru: {
    topic: (label: string) => `Тема закрыта: ${label}`,
    streak: (n: number) => `Серия ${n} ${[3].includes(n) ? "дня" : "дней"} — темп настоящий`,
    mockFirst: (total: number) => `Первый полный мок: ${total}/100 — теперь есть точка отсчёта`,
    mockBetter: (total: number, delta: number) => `Мок лучше прошлого: ${total}/100 (+${delta})`,
  },
  en: {
    topic: (label: string) => `Topic closed: ${label}`,
    streak: (n: number) => `${n}-day streak — that's real momentum`,
    mockFirst: (total: number) => `First full mock: ${total}/100 — now you have a baseline`,
    mockBetter: (total: number, delta: number) => `Mock beats your previous best: ${total}/100 (+${delta})`,
  },
  tr: {
    topic: (label: string) => `Konu kapandı: ${label}`,
    streak: (n: number) => `${n} günlük seri — gerçek bir tempo`,
    mockFirst: (total: number) => `İlk tam deneme: ${total}/100 — artık bir başlangıç noktan var`,
    mockBetter: (total: number, delta: number) => `Deneme öncekinden iyi: ${total}/100 (+${delta})`,
  },
  kk: {
    topic: (label: string) => `Тақырып жабылды: ${label}`,
    streak: (n: number) => `${n} күндік серия — нағыз қарқын`,
    mockFirst: (total: number) => `Алғашқы толық сынама: ${total}/100 — енді бастау нүктең бар`,
    mockBetter: (total: number, delta: number) => `Сынама өткеннен жақсы: ${total}/100 (+${delta})`,
  },
};

const lsGet = (k: string): string | null => {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return null;
  }
};
const lsSet = (k: string, v: string) => {
  try {
    window.localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
};

type Toast = { id: string; emoji: string; text: string };

export function Milestones({ history }: { history: DayRow[] }) {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let active = true;
    const found: Toast[] = [];
    // founder verification: /dashboard?motivator=1 replays the CURRENT real
    // state as toasts (still only real facts — just shown again)
    let forced = false;
    try {
      forced = new URLSearchParams(window.location.search).get("motivator") === "1";
    } catch {
      /* ignore */
    }

    // 1) streak thresholds — from the same real history the dashboard shows
    const streak = computeStreak(history);
    const celebrated = parseInt(lsGet(LS_STREAK) ?? "0", 10) || 0;
    const hit = [...STREAK_STEPS].reverse().find((s) => streak >= s && (forced || s > celebrated));
    if (hit) {
      found.push({ id: `streak-${hit}`, emoji: "🔥", text: c.streak(hit) });
      if (!forced) lsSet(LS_STREAK, String(hit));
    }

    void (async () => {
      const supabase = createClient();

      // 2) topics reaching strength ≥ 60 since the last visit
      const { data: mastered, error: mErr } = await supabase.from("topic_mastery").select("topic").gte("strength", 60);
      if (!mErr) {
        const now = (mastered ?? []).map((r) => r.topic as string);
        const prevRaw = lsGet(LS_MASTERED);
        if (forced) {
          for (const t of now.slice(0, 2)) {
            found.push({ id: `topic-${t}`, emoji: "✅", text: c.topic(topicById(t)?.label[locale] ?? t) });
          }
        } else if (prevRaw == null) {
          lsSet(LS_MASTERED, JSON.stringify(now)); // first run: seed silently
        } else {
          const prev = new Set<string>(JSON.parse(prevRaw) as string[]);
          for (const t of now.filter((t) => !prev.has(t)).slice(0, 2)) {
            found.push({ id: `topic-${t}`, emoji: "✅", text: c.topic(topicById(t)?.label[locale] ?? t) });
          }
          lsSet(LS_MASTERED, JSON.stringify(now));
        }
      }

      // 3) completed mocks: the first one, or a new personal best
      const { data: mocks, error: kErr } = await supabase
        .from("mock_results")
        .select("total, created_at")
        .not("total", "is", null)
        .order("created_at");
      if (!kErr) {
        const rows = (mocks ?? []) as { total: number }[];
        const prevRaw = lsGet(LS_MOCK);
        if (forced && rows.length > 0) {
          found.push({ id: "mock-latest", emoji: "🎯", text: c.mockFirst(rows[rows.length - 1].total) });
        } else if (prevRaw == null) {
          lsSet(LS_MOCK, JSON.stringify({ n: rows.length, best: Math.max(0, ...rows.map((r) => r.total)) }));
        } else if (rows.length > 0) {
          const prev = JSON.parse(prevRaw) as { n: number; best: number };
          if (rows.length > prev.n) {
            const latest = rows[rows.length - 1].total;
            if (prev.n === 0) found.push({ id: "mock-first", emoji: "🎯", text: c.mockFirst(latest) });
            else if (latest > prev.best) found.push({ id: "mock-best", emoji: "🎯", text: c.mockBetter(latest, latest - prev.best) });
            lsSet(LS_MOCK, JSON.stringify({ n: rows.length, best: Math.max(prev.best, latest) }));
          }
        }
      }

      if (active && found.length) {
        setToasts(found.slice(0, 3));
        // real events deserve the moment, then leave on their own
        found.slice(0, 3).forEach((t, i) => {
          setTimeout(() => active && setToasts((cur) => cur.filter((x) => x.id !== t.id)), 7000 + i * 800);
        });
      } else if (active) {
        console.info("[motivator] Milestones: no NEW real events since the last visit — replay current state with /dashboard?motivator=1");
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto flex items-start gap-2.5 rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-sm font-medium text-[var(--color-foreground)] shadow-[0_10px_30px_-10px_rgba(16,24,40,0.25)]"
            onClick={() => setToasts((cur) => cur.filter((x) => x.id !== t.id))}
          >
            <span className="text-lg">{t.emoji}</span>
            <span className="min-w-0 flex-1">{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
