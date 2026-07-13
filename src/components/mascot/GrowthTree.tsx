"use client";

import { motion } from "framer-motion";

/**
 * Символ роста рядом с Ahu (утверждено основателем): НЕ второй персонаж, а
 * индикатор реального прогресса. Стадия — от уровня CEFR:
 *   A0/A1 росток → A2 деревце → B1/B2 дерево → C1 цветущее дерево.
 * ЧЕСТНОСТЬ: уровень приходит из ядра (/api/coach/brief.level — данные
 * диагностики/mastery), без прогресса дерево не растёт.
 * detail — задел под титулы (листья/плоды по рангу титула), пока не задействован.
 */

export function growthStage(level: string): 0 | 1 | 2 | 3 {
  if (level === "C1") return 3;
  if (level === "B1" || level === "B2") return 2;
  if (level === "A2") return 1;
  return 0; // A0/A1
}

const LEAF = "var(--color-brand-2, #19c6b3)";
const TRUNK = "#8a6b4f";

export function GrowthTree({
  level,
  size = 28,
  className,
}: {
  level: string;
  size?: number;
  className?: string;
}) {
  const stage = growthStage(level);
  return (
    <svg viewBox="0 0 60 80" width={size} height={(size * 80) / 60} className={className} role="img" aria-label={`growth stage ${stage + 1}/4`}>
      {/* земля */}
      <ellipse cx="30" cy="74" rx="16" ry="4" fill={TRUNK} opacity="0.25" />

      <motion.g
        key={stage}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        style={{ originX: "30px", originY: "74px" }}
      >
        {stage === 0 && (
          <g>
            <path d="M30 74 V60" stroke={LEAF} strokeWidth="3" strokeLinecap="round" />
            <path d="M30 62 Q20 58 20 48 Q30 52 30 62" fill={LEAF} />
            <path d="M30 66 Q40 62 40 52 Q30 56 30 66" fill={LEAF} opacity="0.85" />
          </g>
        )}
        {stage === 1 && (
          <g>
            <path d="M30 74 V44" stroke={TRUNK} strokeWidth="4" strokeLinecap="round" />
            <path d="M30 56 Q20 52 19 42 Q29 46 30 56" fill={LEAF} />
            <path d="M30 52 Q40 48 41 38 Q31 42 30 52" fill={LEAF} opacity="0.9" />
            <circle cx="30" cy="38" r="9" fill={LEAF} opacity="0.95" />
          </g>
        )}
        {stage === 2 && (
          <g>
            <path d="M30 74 V38 M30 52 Q22 48 18 42 M30 46 Q38 42 42 36" stroke={TRUNK} strokeWidth="4" strokeLinecap="round" fill="none" />
            <circle cx="17" cy="36" r="9" fill={LEAF} opacity="0.9" />
            <circle cx="43" cy="30" r="10" fill={LEAF} opacity="0.9" />
            <circle cx="30" cy="24" r="13" fill={LEAF} />
          </g>
        )}
        {stage === 3 && (
          <g>
            <path d="M30 74 V36 M30 52 Q22 48 17 42 M30 46 Q38 42 43 36" stroke={TRUNK} strokeWidth="4" strokeLinecap="round" fill="none" />
            <circle cx="16" cy="34" r="9" fill={LEAF} opacity="0.9" />
            <circle cx="44" cy="30" r="10" fill={LEAF} opacity="0.9" />
            <circle cx="30" cy="22" r="13" fill={LEAF} />
            {/* цветение */}
            {[
              { x: 22, y: 18 }, { x: 36, y: 14 }, { x: 44, y: 26 }, { x: 15, y: 30 }, { x: 30, y: 28 },
            ].map((f, i) => (
              <motion.circle
                key={i}
                cx={f.x}
                cy={f.y}
                r="2.6"
                fill="#ff9ec6"
                animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.2, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
          </g>
        )}
      </motion.g>
    </svg>
  );
}
