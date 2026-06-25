"use client";

import { useI18n } from "@/lib/i18n";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "./ui/Reveal";

export function Gamification() {
  const { t } = useI18n();

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={t.gamification.title} subtitle={t.gamification.subtitle} />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Highlight panel */}
          <Reveal>
            <div className="glass-strong relative h-full overflow-hidden rounded-3xl p-8">
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-50 blur-3xl"
                style={{ background: "radial-gradient(circle,#7c5cff,transparent 70%)" }}
              />
              <div className="relative grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-black/[0.04] p-5 ring-1 ring-black/[0.06]">
                  <div className="flex items-center gap-2 text-[var(--color-brand-3)]">
                    <span className="text-2xl">🔥</span>
                    <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                      {t.gamification.streakLabel}
                    </span>
                  </div>
                  <div className="mt-3 text-4xl font-bold text-[var(--color-foreground)]">23</div>
                  <div className="text-xs text-[var(--color-muted)]">{t.gamification.streakDays}</div>
                </div>

                <div className="rounded-2xl bg-black/[0.04] p-5 ring-1 ring-black/[0.06]">
                  <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                    {t.gamification.levelLabel}
                  </div>
                  <div className="mt-3 text-4xl font-bold text-[var(--color-foreground)]">14</div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]" />
                  </div>
                </div>

                <div className="rounded-2xl bg-black/[0.04] p-5 ring-1 ring-black/[0.06] sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                        {t.gamification.leagueLabel}
                      </div>
                      <div className="mt-1 text-2xl font-bold text-[var(--color-foreground)]">
                        {t.gamification.leagueValue}
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      {["💎", "🏆", "⭐", "🎯"].map((e) => (
                        <span
                          key={e}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-[0_4px_12px_-4px_rgba(16,24,40,0.25)] ring-2 ring-[var(--color-bg)]"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Cards */}
          <StaggerGroup className="grid gap-4 sm:grid-cols-2">
            {t.gamification.cards.map((c) => (
              <StaggerItem key={c.title}>
                <div className="card-glow glass flex h-full flex-col gap-2 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{c.title}</h3>
                  <p className="text-xs leading-relaxed text-[var(--color-muted)]">{c.text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
