"use client";

import { useState } from "react";
import { AhuMascot, MASCOT_PRESETS } from "@/components/mascot/AhuMascot";
import { GrowthTree } from "@/components/mascot/GrowthTree";
import { TITLES } from "@/lib/coach/titles";
import type { CoachStateId } from "@/lib/coach/types";

const STATE_NOTES: Record<CoachStateId, string> = {
  NEWBIE: "приветливая, машет — ведёт за руку",
  ON_TRACK: "спокойная довольная",
  BREAKTHROUGH: "празднует (конфетти)",
  STREAK_BROKEN: "грустит без укора, зовёт",
  BEHIND: "серьёзная, руки сложены",
  EXAM_SOON: "собранная, секундомер",
  TOPIC_FAILED: "сосредоточенная, указка",
  PLATEAU: "сосредоточенная, указка",
};

const TREE_STAGES: { level: string; label: string }[] = [
  { level: "A1", label: "A0/A1 — росток" },
  { level: "A2", label: "A2 — деревце" },
  { level: "B1", label: "B1/B2 — дерево" },
  { level: "C1", label: "C1 — цветущее" },
];

export function MascotGallery() {
  const [nudge, setNudge] = useState(0);
  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-bold tracking-tight">Ahu — маскот, символ роста, титулы (dev)</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Состояния приходят из ядра агента (/api/coach/brief) — здесь просто галерея пресетов для проверки глазами.
      </p>

      <h2 className="mt-8 text-lg font-semibold">8 состояний ядра</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(Object.keys(MASCOT_PRESETS) as CoachStateId[]).map((s) => (
          <div key={s} className="rounded-2xl border border-black/[0.08] bg-white p-4 text-center">
            <AhuMascot state={s} size={96} nudge={nudge} className="mx-auto" />
            <div className="mt-2 text-xs font-bold">{s}</div>
            <div className="text-[11px] text-[var(--color-muted)]">{STATE_NOTES[s]}</div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setNudge((n) => n + 1)}
        className="mt-4 rounded-full border border-[var(--color-brand)]/40 px-4 py-2 text-sm font-medium text-[var(--color-brand)]"
      >
        Симулировать «задача закрыта» (кивок)
      </button>

      <h2 className="mt-10 text-lg font-semibold">Символ роста (по реальному уровню)</h2>
      <div className="mt-4 flex flex-wrap gap-6">
        {TREE_STAGES.map((t) => (
          <div key={t.level} className="rounded-2xl border border-black/[0.08] bg-white p-4 text-center">
            <GrowthTree level={t.level} size={64} className="mx-auto" />
            <div className="mt-2 text-[11px] text-[var(--color-muted)]">{t.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">15 титулов (пороги утверждены, начисление честное)</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {TITLES.map((t) => (
          <span
            key={t.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand)]/[0.08] px-3 py-1.5 text-xs font-bold text-[var(--color-brand)]"
          >
            {t.tr}
            <span className="font-normal text-[var(--color-muted)]">· {t.label.ru} · {t.rank}/15</span>
          </span>
        ))}
      </div>
    </div>
  );
}
