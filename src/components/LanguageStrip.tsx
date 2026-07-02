"use client";

import { useI18n, type Locale } from "@/lib/i18n";

const LANGS: { id: Locale; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "ru", label: "RU" },
  { id: "tr", label: "TR" },
  { id: "kk", label: "KZ" },
];

/** Thin utility strip — interface language, top-right above the navbar. */
export function LanguageStrip() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="fixed right-3 top-2 z-[60] flex items-center gap-0.5 text-xs sm:right-5">
      {LANGS.map((l, i) => (
        <span key={l.id} className="flex items-center">
          {i > 0 && <span className="px-0.5 text-[var(--color-muted)]/40">|</span>}
          <button
            type="button"
            onClick={() => setLocale(l.id)}
            className={`px-1 transition-colors ${
              locale === l.id ? "font-semibold text-[var(--color-brand)]" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            }`}
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  );
}
