"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { useExam } from "@/lib/exam-context";
import { Hero3D } from "./Hero3D";

export function Hero() {
  const { t, locale } = useI18n();
  const { exam } = useExam();
  const partnerLabel = pick(locale, {
    ru: `Официальный партнёр ${exam.name}`,
    en: `Official partner of ${exam.name}`,
    tr: `${exam.name} resmi partneri`,
    kk: `${exam.name} ресми серіктесі`,
  });

  return (
    <section className="relative flex min-h-screen items-center px-4 pt-32 pb-16 sm:pt-36">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[var(--color-muted)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand-2)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-brand-2)]" />
            </span>
            {t.hero.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {t.hero.titleLead}{" "}
            <span className="text-gradient">{exam.name}</span>{" "}
            {t.hero.titleTail}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-[var(--color-muted)] sm:text-lg lg:mx-0"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start lg:justify-start"
          >
            <Link
              href="/quiz"
              className="btn-primary w-full rounded-full px-7 py-3.5 text-center text-sm sm:w-auto"
            >
              {t.hero.primary}
            </Link>
            <a
              href="#how"
              className="btn-ghost w-full rounded-full px-7 py-3.5 text-center text-sm font-medium sm:w-auto"
            >
              {t.hero.secondary}
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.32 }}
            className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[var(--color-muted)] lg:justify-start"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-brand-2)]/15 text-[var(--color-brand-2)]">
              <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7.5L6 11l5.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {partnerLabel}
          </motion.p>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.36 }}
            className="mt-12 grid grid-cols-3 gap-4 border-t border-black/[0.07] pt-6"
          >
            {t.hero.stats.map((s, i) => (
              <div key={s.label} className="text-center lg:text-left">
                <dt className="text-lg font-bold text-[var(--color-foreground)] sm:text-2xl">
                  {i === 2 ? exam.name : s.value}
                </dt>
                <dd className="mt-1 text-xs leading-snug text-[var(--color-muted)]">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-first lg:order-last"
        >
          <div
            aria-hidden
            className="glow-spot left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 opacity-40"
            style={{
              background:
                "radial-gradient(circle, #6d5bff 0%, #5b8cff 35%, transparent 70%)",
            }}
          />
          <Hero3D />
        </motion.div>
      </div>
    </section>
  );
}
