"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "./ui/Reveal";

export function FinalCTA() {
  const { t } = useI18n();

  return (
    <section className="px-4 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-5xl">
        <div className="glass-strong relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center sm:px-12">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-80"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 0%, rgba(109,91,255,0.28), transparent 70%), radial-gradient(50% 70% at 80% 100%, rgba(25,198,179,0.22), transparent 70%)",
            }}
          />
          <div aria-hidden className="dot-grid absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000,transparent)]" />
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            {t.finalCta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-[var(--color-muted)] sm:text-lg">
            {t.finalCta.subtitle}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/quiz" className="btn-primary w-full rounded-full px-8 py-4 text-center text-sm sm:w-auto">
              {t.finalCta.primary}
            </Link>
            <Link href="/register" className="btn-ghost w-full rounded-full px-8 py-4 text-center text-sm font-medium sm:w-auto">
              {t.finalCta.secondary}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
