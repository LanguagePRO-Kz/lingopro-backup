"use client";

import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <span className="mb-3 inline-block rounded-full border border-black/[0.07] bg-black/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-brand)]">
          {eyebrow}
        </span>
      )}
      <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-balance text-base leading-relaxed text-[var(--color-muted)]">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
