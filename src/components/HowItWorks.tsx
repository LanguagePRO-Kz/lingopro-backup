"use client";

import { useI18n } from "@/lib/i18n";
import { SectionHeading } from "./ui/SectionHeading";
import { StaggerGroup, StaggerItem } from "./ui/Reveal";

export function HowItWorks() {
  const { t } = useI18n();

  return (
    <section id="how" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="01 → 03" title={t.how.title} subtitle={t.how.subtitle} />

        <StaggerGroup className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div className="absolute left-0 top-12 hidden h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent md:block" />
          {t.how.steps.map((step) => (
            <StaggerItem key={step.n}>
              <div className="card-glow glass relative flex h-full flex-col gap-4 rounded-3xl p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-lg font-bold text-white">
                  {step.n}
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-foreground)]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">{step.text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
