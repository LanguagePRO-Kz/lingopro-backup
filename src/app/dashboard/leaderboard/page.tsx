"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { titleById } from "@/lib/coach/titles";

/**
 * Рейтинг по стандартному паттерну (заказ основателя 19.07.2026):
 * топ-10 → блок «вокруг тебя» (±2 соседа) → закреплённая карточка «Ты»
 * (всегда видна) → весь список по кнопке. Данные — реальный get_leaderboard
 * (топ-100); за пределами сотни — честное «ещё не в топ-100», без выдумок.
 */

type Scope = "global" | "city" | "country";
type Row = {
  user_id: string;
  handle: string | null;
  current_level: string | null;
  target_level: string | null;
  city: string | null;
  country: string | null;
  total_xp: number;
  rank: number;
  is_me: boolean;
  /** честный титул (0011); null до миграции/первого титула */
  title_slug?: string | null;
};

const T = {
  ru: {
    title: "Рейтинг студентов", tabs: ["По прогрессу", "По городу", "По стране"], you: "Это ты",
    empty: "Здесь пока никого. Выполни задание из плана дня — попадёшь в рейтинг.", emptyCta: "К плану дня",
    top10: "Топ-10", around: "Вокруг тебя", yourPlace: "Твоё место",
    notRanked: "Тебя ещё нет в рейтинге — выполни задание из плана дня, XP появится.",
    beyond: (n: number) => `Ты пока за пределами топ-${n} — каждый XP приближает.`,
    showAll: "Показать весь рейтинг", hideAll: "Свернуть", locale: "ru-RU",
  },
  en: {
    title: "Student leaderboard", tabs: ["By progress", "By city", "By country"], you: "This is you",
    empty: "Nobody here yet. Complete a task from your daily plan to appear.", emptyCta: "To today's plan",
    top10: "Top 10", around: "Around you", yourPlace: "Your place",
    notRanked: "You're not ranked yet — complete a task from your daily plan to earn XP.",
    beyond: (n: number) => `You're outside the top ${n} for now — every XP brings you closer.`,
    showAll: "Show the full leaderboard", hideAll: "Collapse", locale: "en-US",
  },
  tr: {
    title: "Öğrenci sıralaması", tabs: ["İlerlemeye göre", "Şehre göre", "Ülkeye göre"], you: "Bu sensin",
    empty: "Henüz kimse yok. Günlük plandan bir görev tamamla, sıralamaya gir.", emptyCta: "Günün planına",
    top10: "İlk 10", around: "Senin çevrende", yourPlace: "Senin yerin",
    notRanked: "Henüz sıralamada değilsin — günlük plandan bir görev tamamla, XP gelsin.",
    beyond: (n: number) => `Şimdilik ilk ${n} dışındasın — her XP yaklaştırır.`,
    showAll: "Tüm sıralamayı göster", hideAll: "Daralt", locale: "tr-TR",
  },
  kk: {
    title: "Студенттер рейтингі", tabs: ["Прогресс бойынша", "Қала бойынша", "Ел бойынша"], you: "Бұл сен",
    empty: "Мұнда әзірге ешкім жоқ. Күн жоспарынан тапсырма орында.", emptyCta: "Күн жоспарына",
    top10: "Топ-10", around: "Сенің айналаң", yourPlace: "Сенің орның",
    notRanked: "Сен әлі рейтингте жоқсың — күн жоспарынан тапсырма орында, XP шығады.",
    beyond: (n: number) => `Әзірге топ-${n} сыртындасың — әр XP жақындатады.`,
    showAll: "Толық рейтингті көрсету", hideAll: "Жию", locale: "kk-KZ",
  },
};

const SCOPES: Scope[] = ["global", "city", "country"];
const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function RowCard({ r, you, locale, delay = 0 }: { r: Row; you: string; locale: string; delay?: number }) {
  const initial = (r.handle ?? "?").charAt(0).toUpperCase();
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
        r.is_me ? "bg-[var(--color-brand)]/[0.1] ring-1 ring-[var(--color-brand)]/40" : "glass"
      }`}
    >
      <span className="w-8 shrink-0 text-center text-sm font-bold text-[var(--color-foreground)]">{MEDAL[r.rank] ?? r.rank}</span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-sm font-bold text-white">
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-foreground)]">
          @{r.handle ?? "user"}
          {titleById(r.title_slug)?.tr && (
            <span className="rounded-full bg-[var(--color-brand)]/[0.08] px-2 py-0.5 text-[10px] font-bold text-[var(--color-brand)]">
              {titleById(r.title_slug)!.tr}
            </span>
          )}
          {r.is_me && <span className="rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-[10px] font-semibold text-white">{you}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-[var(--color-muted)]">
          {(r.current_level || r.target_level) && (
            <span>{r.current_level ?? "—"} → {r.target_level ?? "—"}</span>
          )}
          {(r.city || r.country) && (
            <span className="flex items-center gap-1">
              <span aria-hidden>📍</span>
              {[r.city, r.country].filter(Boolean).join(", ")}
            </span>
          )}
        </div>
      </div>
      <span className="shrink-0 text-sm font-bold text-[var(--color-brand)]">{r.total_xp.toLocaleString(locale)} XP</span>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [scope, setScope] = useState<Scope>("global");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setShowAll(false);
    const supabase = createClient();
    supabase
      .rpc("get_leaderboard", { p_period: "all", p_scope: scope, p_limit: 100 })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("[leaderboard]", { message: error.message, code: error.code, details: error.details, hint: error.hint });
          setRows([]);
        } else {
          setRows((data as Row[]) ?? []);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scope]);

  const me = rows?.find((r) => r.is_me) ?? null;
  const top10 = (rows ?? []).slice(0, 10);
  // соседи ±2 — только когда «Ты» ниже топ-10 (в топе соседи и так видны)
  const around =
    me && me.rank > 10
      ? (rows ?? []).filter((r) => Math.abs(r.rank - me.rank) <= 2)
      : [];

  return (
    <div className="pb-24">
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>

      <div className="mt-5 flex flex-wrap gap-2">
        {SCOPES.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setScope(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${scope === s ? "bg-[var(--color-brand)] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}
          >
            {c.tabs[i]}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[60px] animate-pulse rounded-2xl bg-black/[0.04]" />
          ))}

        {!loading && rows && rows.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-[var(--color-muted)]">
            <p>{c.empty}</p>
            <Link href="/dashboard" className="btn-primary mt-4 inline-block rounded-full px-5 py-2.5 text-sm">
              {c.emptyCta} →
            </Link>
          </div>
        )}

        {!loading && rows && rows.length > 0 && !showAll && (
          <>
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{c.top10}</div>
            {top10.map((r, i) => (
              <RowCard key={r.user_id} r={r} you={c.you} locale={c.locale} delay={Math.min(i, 8) * 0.04} />
            ))}

            {around.length > 0 && (
              <>
                <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{c.around}</div>
                {around.map((r) => (
                  <RowCard key={r.user_id} r={r} you={c.you} locale={c.locale} />
                ))}
              </>
            )}

            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-3 rounded-full border border-black/[0.1] px-5 py-2.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:bg-black/[0.04]"
            >
              {c.showAll} ↓
            </button>
          </>
        )}

        {!loading && rows && rows.length > 0 && showAll && (
          <>
            {rows.map((r, i) => (
              <RowCard key={r.user_id} r={r} you={c.you} locale={c.locale} delay={Math.min(i, 8) * 0.03} />
            ))}
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="mt-3 rounded-full border border-black/[0.1] px-5 py-2.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:bg-black/[0.04]"
            >
              {c.hideAll} ↑
            </button>
          </>
        )}
      </div>

      {/* закреплённая карточка «Ты» — всегда видна (стандартный паттерн) */}
      {!loading && rows && rows.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.06] bg-white/90 px-4 py-3 backdrop-blur lg:pl-72">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            {me ? (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-sm font-bold text-white">
                  {me.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--color-foreground)]">
                    {c.yourPlace}: #{me.rank} · @{me.handle ?? "user"}
                  </div>
                  <div className="text-xs text-[var(--color-muted)]">{me.current_level ?? "—"} → {me.target_level ?? "—"}</div>
                </div>
                <span className="shrink-0 text-sm font-bold text-[var(--color-brand)]">{me.total_xp.toLocaleString(c.locale)} XP</span>
              </>
            ) : (
              <p className="flex-1 text-xs text-[var(--color-muted)]">
                {rows.length >= 100 ? c.beyond(100) : c.notRanked}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
