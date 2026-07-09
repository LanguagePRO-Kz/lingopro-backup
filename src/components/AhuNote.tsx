"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { getMotivation, lastActivity, todayISO, type DayRow } from "@/lib/daily-plan";

/**
 * Daily Ahu note (motivator block 3): ONE personal message per day, written
 * by the AI from the student's real numbers (server computes the facts —
 * see /api/ai/motivator). Cached in localStorage per day+locale, so it costs
 * one cheap call a day. When AI is unavailable the honest streak-based
 * template takes over — never an empty box, never an invented cheer.
 */

const T = {
  ru: { from: "Ahu — твой преподаватель" },
  en: { from: "Ahu — your teacher" },
  tr: { from: "Ahu — öğretmenin" },
  kk: { from: "Ahu — сенің ұстазың" },
};

export function AhuNote({ streak, history }: { streak: number; history: DayRow[] }) {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [aiText, setAiText] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const key = `lingopro:ahu:${todayISO()}:${locale}`;
    try {
      const cached = window.localStorage.getItem(key);
      if (cached) {
        setAiText(cached);
        return;
      }
    } catch {
      /* fall through to fetch */
    }
    void (async () => {
      try {
        const res = await fetch("/api/ai/motivator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedbackLang: locale }),
        });
        if (!res.ok) {
          console.info(`[motivator] AhuNote: AI note unavailable (HTTP ${res.status}) — honest template fallback shown`);
          return; // quota/no AI → the template fallback stays
        }
        const data = (await res.json()) as { text?: string };
        if (!data.text || !active) return;
        setAiText(data.text);
        try {
          window.localStorage.setItem(key, data.text);
        } catch {
          /* ignore */
        }
      } catch {
        /* network → template fallback */
      }
    })();
    return () => {
      active = false;
    };
  }, [locale]);

  // honest fallback: the streak-based template (real numbers, no AI)
  const m = getMotivation(locale, streak, lastActivity(history));

  // deliberately SLIM (founder: the dashboard must not drown the plan) —
  // one strip: small avatar + the note, no decorations
  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-gradient-to-br from-[var(--color-brand)]/[0.05] to-[var(--color-brand-2)]/[0.05] px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-sm text-white">
        👩🏻‍🏫
      </span>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-brand)]">{c.from}</span>
        <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-foreground)]">{aiText ?? m.text[locale]}</p>
      </div>
    </div>
  );
}
