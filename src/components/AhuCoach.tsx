"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { topicById } from "@/lib/ai/topics";
import { AhuMascot } from "@/components/mascot/AhuMascot";
import { GrowthTree } from "@/components/mascot/GrowthTree";
import type { CoachStateId } from "@/lib/coach/types";

/**
 * Ahu — единый агент на дашборде (замена AhuNote, DESIGN-COACH §7).
 * Одно проактивное сообщение дня из /api/coach/brief (ядро решает, AI только
 * формулирует; сервер дедупит — повторный заход отдаёт cached без AI-вызова),
 * чип-действие из СВЕЖЕГО decision.action (важно: при source=cached текст
 * утренний, а действие пересчитано) и поле «Спросить Ahu» → чат.
 *
 * Нарочно SLIM (правило основателя: дашборд не топит план). LS-кэша нет:
 * состояние студента меняется в течение дня, а сервер и так почти бесплатен
 * в cached-ветке.
 */

type Brief = {
  text: string;
  source: "ai" | "cached" | "template";
  state: CoachStateId;
  action: "none" | "suggest_task" | "suggest_voice" | "suggest_mock" | "warn_pace" | "celebrate";
  actionTopic: string | null;
  focusTopics: string[];
  replanHint: boolean;
  /** реальный уровень (A0..C1) — стадия символа роста */
  level: string;
  /** честный титул (15 ступеней) или null до первого */
  title: { id: string; tr: string; rank: number; label: Record<string, string> } | null;
};

const T = {
  ru: {
    from: "Ahu — твой преподаватель",
    ask: "Спроси Ahu о турецком…",
    offline: "Ahu сейчас недоступна — обнови страницу чуть позже.",
    chips: { task: "→ К заданию дня", voice: "🎙 Урок:", mock: "📝 Пробный TÖMER", pace: "⚙️ Настройки темпа" },
  },
  en: {
    from: "Ahu — your teacher",
    ask: "Ask Ahu about Turkish…",
    offline: "Ahu is unavailable right now — refresh in a bit.",
    chips: { task: "→ Today's task", voice: "🎙 Lesson:", mock: "📝 Mock TÖMER", pace: "⚙️ Pace settings" },
  },
  tr: {
    from: "Ahu — öğretmenin",
    ask: "Ahu'ya Türkçe hakkında sor…",
    offline: "Ahu şu an ulaşılamıyor — birazdan sayfayı yenile.",
    chips: { task: "→ Bugünkü görev", voice: "🎙 Ders:", mock: "📝 Deneme TÖMER", pace: "⚙️ Tempo ayarları" },
  },
  kk: {
    from: "Ahu — сенің ұстазың",
    ask: "Ahu-дан түрік тілі туралы сұра…",
    offline: "Ahu қазір қолжетімсіз — сәлден кейін бетті жаңарт.",
    chips: { task: "→ Бүгінгі тапсырма", voice: "🎙 Сабақ:", mock: "📝 Сынақ TÖMER", pace: "⚙️ Қарқын баптаулары" },
  },
};

export function AhuCoach() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const router = useRouter();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");
  // кивок маскота на РЕАЛЬНОЕ действие: дашборд диспатчит lp:daily-updated
  // при закрытии задачи — никакой анимации «просто так»
  const [nudge, setNudge] = useState(0);
  useEffect(() => {
    const onDone = () => setNudge((n) => n + 1);
    window.addEventListener("lp:daily-updated", onDone);
    return () => window.removeEventListener("lp:daily-updated", onDone);
  }, []);

  useEffect(() => {
    let active = true;
    setFailed(false);
    void (async () => {
      try {
        const res = await fetch("/api/coach/brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedbackLang: locale }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Brief;
        if (active && data.text) setBrief(data);
        else if (active) setFailed(true);
      } catch {
        if (active) setFailed(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [locale]);

  function askAhu() {
    const text = q.trim();
    if (!text) {
      router.push("/dashboard/tutor");
      return;
    }
    try {
      window.sessionStorage.setItem("lingopro:ahu:handoff", text);
    } catch {
      /* приватный режим — вопрос просто не предзаполнится */
    }
    router.push("/dashboard/tutor");
  }

  // чип-действие из свежего решения ядра → существующие разделы платформы
  const chip = (() => {
    if (!brief) return null;
    const topic = brief.actionTopic ?? brief.focusTopics[0] ?? null;
    switch (brief.action) {
      case "suggest_task":
        return { href: "#plan", label: c.chips.task };
      case "suggest_voice":
        return {
          href: `/dashboard/speaking${topic ? `?focus=${encodeURIComponent(brief.focusTopics.join(","))}` : ""}`,
          label: `${c.chips.voice} ${topic ? (topicById(topic)?.label[locale] ?? topic) : ""}`.trim(),
        };
      case "suggest_mock":
        return { href: "/dashboard/mock", label: c.chips.mock };
      case "warn_pace":
        return { href: "/dashboard/settings", label: c.chips.pace };
      default:
        return null; // none | celebrate — текст сам празднует, кнопка не нужна
    }
  })();

  return (
    <div className="mt-4 rounded-2xl border border-black/[0.06] bg-gradient-to-br from-[var(--color-brand)]/[0.05] to-[var(--color-brand-2)]/[0.05] px-4 py-3">
      <div className="flex items-start gap-3">
        {/* маскот показывает РЕАЛЬНОЕ состояние из ядра (честность гарантируют
            тесты ядра: праздника на нуле не бывает) */}
        <AhuMascot state={brief?.state ?? "ON_TRACK"} size={52} nudge={nudge} className="shrink-0 -ml-1" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-brand)]">{c.from}</span>
            {brief && (
              <span className="inline-flex items-center gap-1">
                <GrowthTree level={brief.level} size={16} />
                {brief.title && (
                  <span className="rounded-full bg-[var(--color-brand)]/[0.08] px-2 py-0.5 text-[10px] font-bold text-[var(--color-brand)]">
                    {brief.title.tr} · {brief.title.rank}/15
                  </span>
                )}
              </span>
            )}
          </div>
          {brief ? (
            <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-foreground)]">{brief.text}</p>
          ) : failed ? (
            <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-muted)]">{c.offline}</p>
          ) : (
            <div className="mt-1.5 space-y-1.5" aria-hidden>
              <div className="h-3 w-4/5 animate-pulse rounded bg-black/[0.06]" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-black/[0.06]" />
            </div>
          )}
          {chip && (
            <Link
              href={chip.href}
              className="mt-2 inline-block rounded-full border border-[var(--color-brand)]/30 bg-white px-3 py-1 text-xs font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/[0.08]"
            >
              {chip.label}
            </Link>
          )}
        </div>
      </div>
      <form
        className="mt-2.5 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          askAhu();
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={c.ask}
          className="min-w-0 flex-1 rounded-full border border-black/[0.08] bg-white px-3.5 py-2 text-sm outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
        />
        <button
          type="submit"
          aria-label="ask Ahu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-white"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M4 12l16-8-6 16-2.5-6.5L4 12z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  );
}
