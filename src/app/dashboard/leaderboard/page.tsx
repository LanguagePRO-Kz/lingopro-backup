"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

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
};

const T = {
  ru: { title: "Рейтинг студентов", tabs: ["По прогрессу", "По городу", "По стране"], you: "Это ты", empty: "Здесь пока никого. Выполни задание из плана дня — попадёшь в рейтинг.", emptyCta: "К плану дня", locale: "ru-RU" },
  en: { title: "Student leaderboard", tabs: ["By progress", "By city", "By country"], you: "This is you", empty: "Nobody here yet. Complete a task from your daily plan to appear.", emptyCta: "To today's plan", locale: "en-US" },
  tr: { title: "Öğrenci sıralaması", tabs: ["İlerlemeye göre", "Şehre göre", "Ülkeye göre"], you: "Bu sensin", empty: "Henüz kimse yok. Günlük plandan bir görev tamamla, sıralamaya gir.", emptyCta: "Günün planına", locale: "tr-TR" },
  kk: { title: "Студенттер рейтингі", tabs: ["Прогресс бойынша", "Қала бойынша", "Ел бойынша"], you: "Бұл сен", empty: "Мұнда әзірге ешкім жоқ. Күн жоспарынан тапсырма орында.", emptyCta: "Күн жоспарына", locale: "kk-KZ" },
};

const SCOPES: Scope[] = ["global", "city", "country"];
const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function LeaderboardPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [scope, setScope] = useState<Scope>("global");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const supabase = createClient();
    supabase
      .rpc("get_leaderboard", { p_period: "all", p_scope: scope, p_limit: 100 })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("[leaderboard]", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
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

  return (
    <div>
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

        {!loading &&
          rows &&
          rows.map((r, i) => {
            const initial = (r.handle ?? "?").charAt(0).toUpperCase();
            return (
              <motion.div
                key={r.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
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
                    {r.is_me && <span className="rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-[10px] font-semibold text-white">{c.you}</span>}
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
                <span className="shrink-0 text-sm font-bold text-[var(--color-brand)]">{r.total_xp.toLocaleString(c.locale)} XP</span>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
