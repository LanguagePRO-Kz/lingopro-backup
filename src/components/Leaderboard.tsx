"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

type Row = { rank: number; name: string; meta: string; xp: number; you?: boolean };

// Deterministic thousands separator (avoids SSR/client locale mismatch).
const formatXp = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const DATA: Record<string, Row[]> = {
  progress: [
    { rank: 1, name: "deniz_42", meta: "A2 → B1", xp: 12480 },
    { rank: 2, name: "aigerim", meta: "A2 → B1", xp: 11960 },
    { rank: 3, name: "mert.k", meta: "A1 → A2", xp: 11200 },
    { rank: 4, name: "you", meta: "A2 → B1", xp: 10870, you: true },
    { rank: 5, name: "sofia_l", meta: "A1 → A2", xp: 9940 },
  ],
  city: [
    { rank: 1, name: "you", meta: "Almaty", xp: 10870, you: true },
    { rank: 2, name: "nurlan", meta: "Almaty", xp: 10120 },
    { rank: 3, name: "kamila", meta: "Almaty", xp: 9760 },
    { rank: 4, name: "ramazan", meta: "Almaty", xp: 8990 },
    { rank: 5, name: "alina_t", meta: "Almaty", xp: 8430 },
  ],
  country: [
    { rank: 1, name: "elif_yz", meta: "Türkiye", xp: 15310 },
    { rank: 2, name: "deniz_42", meta: "Türkiye", xp: 12480 },
    { rank: 3, name: "burak", meta: "Türkiye", xp: 11870 },
    { rank: 4, name: "you", meta: "Kazakhstan", xp: 10870, you: true },
    { rank: 5, name: "aigerim", meta: "Kazakhstan", xp: 9960 },
  ],
};

export function Leaderboard() {
  const { t } = useI18n();
  const [tab, setTab] = useState("progress");

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionHeading title={t.leaderboard.title} subtitle={t.leaderboard.subtitle} />

        <Reveal className="mt-10">
          <div className="glass-strong rounded-3xl p-3 sm:p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              {t.leaderboard.tabs.map((tb) => (
                <button
                  key={tb.id}
                  type="button"
                  onClick={() => setTab(tb.id)}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    tab === tb.id ? "text-white" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  }`}
                >
                  {tab === tb.id && (
                    <motion.span
                      layoutId="lb-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{tb.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.ul
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-2"
              >
                {DATA[tab].map((row) => (
                  <li
                    key={row.rank}
                    className={`flex items-center gap-4 rounded-2xl px-4 py-3 ${
                      row.you
                        ? "bg-[var(--color-brand)]/15 ring-1 ring-[var(--color-brand)]/40"
                        : "bg-black/[0.025]"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        row.rank <= 3
                          ? "bg-gradient-to-br from-[var(--color-brand-3)] to-[var(--color-brand)] text-white"
                          : "bg-black/[0.04] text-[var(--color-muted)]"
                      }`}
                    >
                      {row.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 truncate text-sm font-semibold text-[var(--color-foreground)]">
                        @{row.name}
                        {row.you && (
                          <span className="rounded-full bg-[var(--color-brand-2)]/20 px-2 py-0.5 text-[10px] font-medium text-[var(--color-brand-2)]">
                            {t.leaderboard.you}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--color-muted)]">{row.meta}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[var(--color-foreground)]">
                        {formatXp(row.xp)}
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
                        {t.leaderboard.xp}
                      </div>
                    </div>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
          <p className="mt-3 text-center text-xs text-[var(--color-muted)]">{t.leaderboard.note}</p>
        </Reveal>
      </div>
    </section>
  );
}
