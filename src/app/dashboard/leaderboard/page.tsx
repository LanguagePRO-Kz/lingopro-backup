"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

type Row = { rank: number; user: string; from: string; to: string; xp: number; you?: boolean };

const ROWS: Row[][] = [
  // by progress
  [
    { rank: 1, user: "@deniz_42", from: "A2", to: "B1", xp: 12480 },
    { rank: 2, user: "@aigerim", from: "A2", to: "B1", xp: 11960 },
    { rank: 3, user: "@mert.k", from: "A1", to: "A2", xp: 11200 },
    { rank: 4, user: "@you", from: "A2", to: "B1", xp: 10870, you: true },
    { rank: 5, user: "@sofia_l", from: "A1", to: "A2", xp: 9940 },
    { rank: 6, user: "@ramazan", from: "A1", to: "A2", xp: 9210 },
    { rank: 7, user: "@elif_99", from: "B1", to: "B2", xp: 8730 },
  ],
  // by city
  [
    { rank: 1, user: "@aigerim", from: "A2", to: "B1", xp: 11960 },
    { rank: 2, user: "@you", from: "A2", to: "B1", xp: 10870, you: true },
    { rank: 3, user: "@nurlan", from: "A1", to: "A2", xp: 8400 },
    { rank: 4, user: "@dana_kz", from: "A2", to: "B1", xp: 7950 },
    { rank: 5, user: "@arman", from: "A1", to: "A2", xp: 6620 },
  ],
  // by country
  [
    { rank: 1, user: "@deniz_42", from: "A2", to: "B1", xp: 12480 },
    { rank: 2, user: "@mehmet", from: "B1", to: "B2", xp: 12100 },
    { rank: 3, user: "@aigerim", from: "A2", to: "B1", xp: 11960 },
    { rank: 8, user: "@you", from: "A2", to: "B1", xp: 10870, you: true },
    { rank: 9, user: "@zarina", from: "A1", to: "A2", xp: 10550 },
  ],
];

const T = {
  ru: { title: "Рейтинг студентов", tabs: ["По прогрессу", "По городу", "По стране"], you: "Это ты" },
  en: { title: "Student leaderboard", tabs: ["By progress", "By city", "By country"], you: "This is you" },
  tr: { title: "Öğrenci sıralaması", tabs: ["İlerlemeye göre", "Şehre göre", "Ülkeye göre"], you: "Bu sensin" },
  kk: { title: "Студенттер рейтингі", tabs: ["Прогресс бойынша", "Қала бойынша", "Ел бойынша"], you: "Бұл сен" },
};

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function LeaderboardPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [tab, setTab] = useState(0);
  const rows = ROWS[tab];

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>

      <div className="mt-5 flex flex-wrap gap-2">
        {c.tabs.map((tb, i) => (
          <button key={tb} type="button" onClick={() => setTab(i)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === i ? "bg-[var(--color-brand)] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}>{tb}</button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {rows.map((r, i) => (
          <motion.div
            key={r.user}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
              r.you ? "bg-[var(--color-brand)]/[0.1] ring-1 ring-[var(--color-brand)]/40" : "glass"
            }`}
          >
            <span className="w-8 shrink-0 text-center text-sm font-bold text-[var(--color-foreground)]">{MEDAL[r.rank] ?? r.rank}</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-sm font-bold text-white">
              {r.user.replace("@", "").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-foreground)]">
                {r.user}
                {r.you && <span className="rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-[10px] font-semibold text-white">{c.you}</span>}
              </div>
              <div className="text-xs text-[var(--color-muted)]">{r.from} → {r.to}</div>
            </div>
            <span className="shrink-0 text-sm font-bold text-[var(--color-brand)]">{r.xp.toLocaleString("ru-RU")} XP</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
