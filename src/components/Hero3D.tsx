"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { EXAM_LIST } from "@/lib/exams";
import { useExam } from "@/lib/exam-context";

/**
 * Pseudo-3D exam sphere: all exam names orbit a glowing core; the selected
 * exam lights up. Reacts to the cursor with a soft parallax tilt.
 */
export function Hero3D() {
  const { examId, exam } = useExam();
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-16, 16]), { stiffness: 120, damping: 18 });
  const tx = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 20 });
  const ty = useSpring(useTransform(my, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 20 });

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function reset() {
    mx.set(0);
    my.set(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="relative mx-auto flex aspect-square w-full max-w-[28rem] items-center justify-center"
      style={{ perspective: "1100px" }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      >
        {/* glow core */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            x: tx,
            y: ty,
            background: "radial-gradient(circle at 35% 30%, #c9c4ff, #6d5bff 42%, #3a1d9c 78%)",
            boxShadow: "0 0 90px 18px rgba(109,92,255,0.45)",
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* orbit rings */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-spin-slow absolute left-1/2 top-1/2 rounded-full border"
            style={{
              width: `${70 + i * 12}%`,
              height: `${70 + i * 12}%`,
              translate: "-50% -50%",
              borderColor: i === 1 ? "rgba(25,198,179,0.45)" : "rgba(16,24,40,0.12)",
              transform: `rotateX(${72 - i * 8}deg) rotateZ(${i * 30}deg)`,
              animationDuration: `${18 + i * 8}s`,
              animationDirection: i % 2 ? "reverse" : "normal",
            }}
          />
        ))}

        {/* exam chips */}
        {EXAM_LIST.map((e, i) => {
          const angle = (i / EXAM_LIST.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 47;
          const left = 50 + Math.cos(angle) * radius;
          const top = 50 + Math.sin(angle) * radius * 0.64;
          const depth = Math.sin(angle) * 60;
          const isActive = e.id === examId;
          return (
            <motion.div
              key={e.id}
              className={`absolute flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ${
                isActive
                  ? "bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-white shadow-[0_10px_30px_-8px_rgba(109,91,255,0.6)]"
                  : "glass text-[var(--color-muted)]"
              }`}
              style={{ left: `${left}%`, top: `${top}%`, x: "-50%", y: "-50%", z: depth }}
              animate={{
                y: ["-50%", "-56%", "-50%"],
                opacity: isActive ? 1 : 0.55,
                scale: isActive ? 1.12 : 1,
              }}
              transition={{
                y: { duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 },
              }}
            >
              <span className="text-sm leading-none">{e.flag}</span>
              {e.name}
            </motion.div>
          );
        })}

        {/* center card */}
        <motion.div
          className="glass-strong absolute left-1/2 top-1/2 flex flex-col items-center gap-0.5 rounded-2xl px-5 py-3"
          style={{ x: tx, y: ty, translate: "-50% -50%", z: 70 }}
        >
          <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-brand)]">LingoPRO</span>
          <span className="text-sm font-semibold text-[var(--color-foreground)]">{exam.name}</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
