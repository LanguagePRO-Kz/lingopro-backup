"use client";

import { useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import type { CoachStateId } from "@/lib/coach/types";

/**
 * Ahu как визуальный персонаж (DESIGN-COACH §14, утверждено основателем).
 * Параметрический SVG: ОДНА голова/торс, эмоция = пресет параметров
 * (брови/веки/рот/поза/аксессуар) на каждое состояние ядра. Художник позже
 * заменит ассеты 1:1 по этим же пресетам — компонент и контракт останутся.
 *
 * ЧЕСТНОСТЬ: состояние приходит ТОЛЬКО из ядра агента (/api/coach/brief) —
 * юнит-тесты ядра запрещают праздничные состояния при нуле, значит маскот
 * физически не может улыбаться лентяю.
 *
 * nudge: инкрементируй проп — Ahu кивнёт (реакция на реальное действие,
 * дашборд дёргает по событию lp:daily-updated).
 */

type Preset = {
  /** наклон бровей, градусы: минус = сочувствие («домиком»), плюс = строгость */
  browTilt: number;
  /** подъём бровей, px: плюс = удивление/приветливость */
  browLift: number;
  /** прикрытие век 0..0.45 (0 = широко открыты) */
  lid: number;
  mouth: "smile" | "grin" | "neutral" | "sad" | "firm" | "o";
  /** румянец */
  blush: boolean;
  accessory: "none" | "wave" | "folded" | "pointer" | "watch" | "confetti";
};

export const MASCOT_PRESETS: Record<CoachStateId, Preset> = {
  NEWBIE: { browTilt: -4, browLift: 3, lid: 0, mouth: "grin", blush: true, accessory: "wave" },
  ON_TRACK: { browTilt: 0, browLift: 1, lid: 0.1, mouth: "smile", blush: true, accessory: "none" },
  BREAKTHROUGH: { browTilt: -2, browLift: 4, lid: 0, mouth: "grin", blush: true, accessory: "confetti" },
  STREAK_BROKEN: { browTilt: -14, browLift: 2, lid: 0.25, mouth: "sad", blush: false, accessory: "wave" },
  BEHIND: { browTilt: 10, browLift: -2, lid: 0.15, mouth: "firm", blush: false, accessory: "folded" },
  EXAM_SOON: { browTilt: 6, browLift: 0, lid: 0, mouth: "firm", blush: false, accessory: "watch" },
  TOPIC_FAILED: { browTilt: 4, browLift: 0, lid: 0.12, mouth: "neutral", blush: false, accessory: "pointer" },
  PLATEAU: { browTilt: 2, browLift: 1, lid: 0.12, mouth: "neutral", blush: false, accessory: "pointer" },
};

const MOUTHS: Record<Preset["mouth"], string> = {
  smile: "M50 76 Q60 84 70 76",
  grin: "M48 74 Q60 90 72 74 Z",
  neutral: "M52 78 L68 78",
  sad: "M51 81 Q60 74 69 81",
  firm: "M52 78 Q60 80 68 78",
  o: "M56 76 a4 5 0 1 0 8 0 a4 5 0 1 0 -8 0",
};

const SKIN = "#ffdfc9";
const HAIR = "#43302b";

function Confetti() {
  const bits = [
    { x: 18, y: 22, c: "#6d5bff" }, { x: 100, y: 18, c: "#19c6b3" }, { x: 12, y: 52, c: "#f59e0b" },
    { x: 106, y: 48, c: "#ef4444" }, { x: 28, y: 10, c: "#19c6b3" }, { x: 92, y: 8, c: "#6d5bff" },
  ];
  return (
    <>
      {bits.map((b, i) => (
        <motion.rect
          key={i}
          x={b.x}
          y={b.y}
          width={4.5}
          height={4.5}
          rx={1}
          fill={b.c}
          initial={{ opacity: 0, y: -8, rotate: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: [b.y - 10, b.y + 16], rotate: 200 }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.25, ease: "easeIn" }}
        />
      ))}
    </>
  );
}

export function AhuMascot({
  state = "ON_TRACK",
  size = 56,
  nudge = 0,
  className,
}: {
  state?: CoachStateId;
  size?: number;
  /** инкремент → кивок (реакция на реальное действие студента) */
  nudge?: number;
  className?: string;
}) {
  const p = MASCOT_PRESETS[state] ?? MASCOT_PRESETS.ON_TRACK;
  const nod = useAnimationControls();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!nudge || !mounted) return;
    void nod.start({ rotate: [0, -7, 5, 0], transition: { duration: 0.7, ease: "easeInOut" } });
    // маскот кивает только на реальное событие (см. AhuCoach)
  }, [nudge, nod, mounted]);

  return (
    <motion.svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      animate={nod}
      style={{ originX: "50%", originY: "80%" }}
      role="img"
      aria-label="Ahu"
    >
      <defs>
        <linearGradient id="ahu-jacket" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-brand, #6d5bff)" />
          <stop offset="100%" stopColor="var(--color-brand-2, #19c6b3)" />
        </linearGradient>
      </defs>

      {/* дыхание: едва заметное покачивание всей фигуры */}
      <motion.g animate={{ y: [0, -1.6, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}>
        {/* пучок волос */}
        <circle cx="60" cy="16" r="11" fill={HAIR} />
        {/* плечи/жакет */}
        <path d="M28 118 v-10 q0 -22 32 -22 q32 0 32 22 v10 Z" fill="url(#ahu-jacket)" />
        {/* воротник */}
        <path d="M52 88 L60 98 L68 88 Q60 92 52 88" fill="#ffffff" opacity="0.9" />
        {/* шея */}
        <rect x="54" y="80" width="12" height="12" rx="5" fill={SKIN} />
        {/* волосы (каре за головой) */}
        <path d="M32 52 Q30 18 60 18 Q90 18 88 52 Q90 70 82 76 L82 46 Q82 30 60 30 Q38 30 38 46 L38 76 Q30 70 32 52 Z" fill={HAIR} />
        {/* лицо */}
        <circle cx="60" cy="54" r="26" fill={SKIN} />
        {/* чёлка */}
        <path d="M36 48 Q38 28 60 28 Q82 28 84 48 Q74 38 60 38 Q46 38 36 48 Z" fill={HAIR} />
        {/* серьги-точки */}
        <circle cx="33.5" cy="60" r="1.8" fill="var(--color-brand-2, #19c6b3)" />
        <circle cx="86.5" cy="60" r="1.8" fill="var(--color-brand-2, #19c6b3)" />

        {/* румянец */}
        {p.blush && (
          <>
            <ellipse cx="44" cy="66" rx="4.5" ry="2.6" fill="#ff9d8a" opacity="0.45" />
            <ellipse cx="76" cy="66" rx="4.5" ry="2.6" fill="#ff9d8a" opacity="0.45" />
          </>
        )}

        {/* брови: наклон = эмоция (минус — «домиком», плюс — строгие) */}
        <motion.path
          d="M42 44 Q47 41 52 43"
          stroke={HAIR}
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
          animate={{ rotate: -p.browTilt, y: -p.browLift }}
          style={{ originX: "47px", originY: "43px" }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
        />
        <motion.path
          d="M68 43 Q73 41 78 44"
          stroke={HAIR}
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
          animate={{ rotate: p.browTilt, y: -p.browLift }}
          style={{ originX: "73px", originY: "43px" }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
        />

        {/* глаза + веки (моргание) */}
        {[47, 73].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="55" r="4.6" fill="#2b2440" />
            <circle cx={cx + 1.4} cy="53.6" r="1.4" fill="#ffffff" />
            <motion.rect
              x={cx - 5.5}
              y="49"
              width="11"
              height="12"
              fill={SKIN}
              style={{ originY: "49px" }}
              animate={{ scaleY: [p.lid, p.lid, 1, p.lid] }}
              transition={{ duration: 4.6, repeat: Infinity, times: [0, 0.93, 0.965, 1] }}
            />
          </g>
        ))}

        {/* рот: смена пресета — мягкий кроссфейд */}
        <motion.path
          key={p.mouth}
          d={MOUTHS[p.mouth]}
          stroke="#b3574d"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill={p.mouth === "grin" ? "#c96a5f" : "none"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* --- аксессуары/позы --- */}
        {p.accessory === "wave" && (
          <motion.g
            animate={{ rotate: [0, 14, -4, 14, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
            style={{ originX: "96px", originY: "104px" }}
          >
            <path d="M92 112 Q102 100 100 88" stroke="url(#ahu-jacket)" strokeWidth="9" strokeLinecap="round" fill="none" />
            <circle cx="100" cy="85" r="6" fill={SKIN} />
          </motion.g>
        )}
        {p.accessory === "folded" && (
          <path d="M38 104 Q60 96 82 104" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.85" />
        )}
        {p.accessory === "pointer" && (
          <g>
            <path d="M90 112 Q98 102 97 92" stroke="url(#ahu-jacket)" strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="97" cy="89" r="5.4" fill={SKIN} />
            <line x1="97" y1="88" x2="112" y2="58" stroke="#8a6b4f" strokeWidth="3" strokeLinecap="round" />
            <circle cx="112" cy="58" r="2.2" fill="var(--color-brand, #6d5bff)" />
          </g>
        )}
        {p.accessory === "watch" && (
          <g>
            <path d="M88 112 Q97 104 96 94" stroke="url(#ahu-jacket)" strokeWidth="8" strokeLinecap="round" fill="none" />
            <circle cx="97" cy="88" r="5.4" fill={SKIN} />
            <circle cx="103" cy="78" r="8" fill="#ffffff" stroke="#2b2440" strokeWidth="2" />
            <motion.line
              x1="103"
              y1="78"
              x2="103"
              y2="72.5"
              stroke="#ef4444"
              strokeWidth="1.8"
              strokeLinecap="round"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ originX: "103px", originY: "78px" }}
            />
            <rect x="101" y="67.5" width="4" height="3" rx="1" fill="#2b2440" />
          </g>
        )}
      </motion.g>

      {p.accessory === "confetti" && <Confetti />}
    </motion.svg>
  );
}
