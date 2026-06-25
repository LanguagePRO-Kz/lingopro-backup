"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LOCALES, LOCALE_LABELS, useI18n, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        className="btn-ghost flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium"
      >
        <span className="text-base leading-none">{LOCALE_LABELS[locale].flag}</span>
        <span className="hidden sm:inline">{LOCALE_LABELS[locale].native}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="glass-strong absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl p-1.5"
          >
            {LOCALES.map((l: Locale) => (
              <li key={l}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l === locale}
                  onClick={() => {
                    setLocale(l);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    l === locale
                      ? "bg-black/[0.05] text-[var(--color-foreground)]"
                      : "text-[var(--color-muted)] hover:bg-black/[0.04] hover:text-[var(--color-foreground)]"
                  }`}
                >
                  <span className="text-base leading-none">{LOCALE_LABELS[l].flag}</span>
                  {LOCALE_LABELS[l].native}
                  {l === locale && (
                    <svg className="ml-auto" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7.5L6 11l5.5-7" stroke="#4ee0d6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
