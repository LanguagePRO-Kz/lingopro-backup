"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

function SkillBar({ name, value, delay }: { name: string; value: number; delay: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-[var(--color-foreground)]">{name}</span>
        <span className="text-[var(--color-muted)]">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.05]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function DashboardPreview() {
  const { t } = useI18n();
  const avg = Math.round(
    t.dashboard.skills.reduce((s, k) => s + k.value, 0) / t.dashboard.skills.length,
  );

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={t.dashboard.title} subtitle={t.dashboard.subtitle} />

        <Reveal className="mt-12">
          <div className="glass-strong rounded-[2rem] p-3 sm:p-5">
            {/* faux window bar */}
            <div className="mb-4 flex items-center gap-2 px-3 py-1">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-xs text-[var(--color-muted)]">lingopro.app / dashboard</span>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* readiness ring */}
              <div className="glass flex flex-col items-center justify-center rounded-2xl p-6">
                <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  {t.dashboard.progressTitle}
                </div>
                <div className="relative mt-4 h-32 w-32">
                  <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(16,24,40,0.08)" strokeWidth="12" />
                    <motion.circle
                      cx="60" cy="60" r="52" fill="none" stroke="url(#ring-grad)" strokeWidth="12" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 52}
                      initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                      whileInView={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - avg / 100) }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="ring-grad" x1="0" y1="0" x2="120" y2="120">
                        <stop stopColor="#7c5cff" />
                        <stop offset="1" stopColor="#4ee0d6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[var(--color-foreground)]">{avg}%</span>
                  </div>
                </div>
                <div className="mt-4 rounded-full bg-black/[0.04] px-3 py-1 text-xs text-[var(--color-muted)]">
                  {t.dashboard.daysLeftValue} {t.dashboard.daysLeft}
                </div>
              </div>

              {/* skills */}
              <div className="glass flex flex-col justify-center gap-4 rounded-2xl p-6">
                {t.dashboard.skills.map((s, i) => (
                  <SkillBar key={s.name} name={s.name} value={s.value} delay={i * 0.12} />
                ))}
              </div>

              {/* recommendations */}
              <div className="glass flex flex-col gap-4 rounded-2xl p-6">
                <div className="text-sm font-semibold text-[var(--color-foreground)]">{t.dashboard.recoTitle}</div>
                <ul className="flex flex-col gap-2.5">
                  {t.dashboard.reco.map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-xs text-[var(--color-foreground)]">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border border-[var(--color-brand-2)]/50 text-[var(--color-brand-2)]">
                        <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 7.5L6 11l5.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto rounded-xl bg-gradient-to-br from-[var(--color-brand)]/20 to-[var(--color-brand-2)]/10 p-4 ring-1 ring-black/[0.06]">
                  <div className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">
                    {t.dashboard.nextLesson}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[var(--color-foreground)]">
                    {t.dashboard.nextLessonValue}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
