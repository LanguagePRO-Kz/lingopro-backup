"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { term } from "@/lib/localized";
import { SectionHeading } from "./ui/SectionHeading";

const icons: ReactNode[] = [
  // Diagnostic — radar
  <path key="d" d="M12 3v9l6 3M12 3a9 9 0 109 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />,
  // Tutor — chat
  <path key="t" d="M4 5h16v11H9l-5 4V5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />,
  // Speaking — mic
  <path key="s" d="M12 4a3 3 0 013 3v4a3 3 0 11-6 0V7a3 3 0 013-3zM5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />,
  // Writing — pen
  <path key="w" d="M4 20l4-1L19 8a2 2 0 00-3-3L5 16l-1 4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />,
  // Mock — doc check
  <path key="m" d="M7 3h7l5 5v13H7zM14 3v5h5M9.5 14l2 2 3.5-4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />,
  // Discipline — calendar
  <path key="dc" d="M4 6h16v15H4zM4 10h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />,
  // Motivation — spark/heart
  <path key="mo" d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0112 8a3.5 3.5 0 017 2.5C19 15.5 12 20 12 20z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />,
];

export function Features() {
  const { t, locale } = useI18n();
  const items = t.features.items;

  return (
    <section id="features" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={t.nav.features}
          title={t.features.title}
          subtitle={t.features.subtitle}
        />

        <div className="mt-14 grid auto-rows-[1fr] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => (
            <div
              key={f.title}
              className={i === 0 ? "sm:col-span-2 lg:row-span-2" : ""}
            >
              <article
                className={`card-glow group flex h-full flex-col gap-4 rounded-3xl p-6 ${
                  i === 0 ? "border-gradient justify-between sm:p-8" : "glass"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] text-[var(--color-brand-2)] ring-1 ring-black/[0.06] transition-colors group-hover:text-[var(--color-brand)]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      {icons[i]}
                    </svg>
                  </div>
                  <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    {f.tag}
                  </span>
                </div>

                {i === 0 && (
                  <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between text-[11px] text-[var(--color-muted)]">
                      <span>{term(locale, "question")} 7 / 20</span>
                      <span>35%</span>
                    </div>
                    <div className="mb-3.5 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
                      <div className="h-full w-[35%] rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">
                      «Ben okul___ gidiyorum»
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {["okul", "okula", "okulda", "okulun"].map((o, oi) => (
                        <div
                          key={o}
                          className={`rounded-xl border px-3 py-2 text-sm ${
                            oi === 1
                              ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-foreground)]"
                              : "border-black/[0.07] bg-black/[0.02] text-[var(--color-muted)]"
                          }`}
                        >
                          {o}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        [term(locale, "grammar"), "A2"],
                        [term(locale, "vocab"), "B1"],
                        [term(locale, "reading"), "A2+"],
                      ].map(([k, v]) => (
                        <span
                          key={k}
                          className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] text-[var(--color-muted)]"
                        >
                          {k}: <span className="font-semibold text-[var(--color-foreground)]">{v}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={i === 0 ? "mt-auto" : ""}>
                  <h3
                    className={`font-semibold text-[var(--color-foreground)] ${
                      i === 0 ? "text-2xl" : "text-lg"
                    }`}
                  >
                    {f.title}
                  </h3>
                  <p
                    className={`mt-2 leading-relaxed text-[var(--color-muted)] ${
                      i === 0 ? "text-base" : "text-sm"
                    }`}
                  >
                    {f.text}
                  </p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
