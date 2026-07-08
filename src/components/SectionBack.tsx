"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const LABEL = { ru: "На главную", en: "Home", tr: "Ana sayfa", kk: "Басты бет" } as const;

/** Always-visible way back to the daily plan from any cabinet section —
 *  the sidebar hides behind a burger on mobile, this never does. */
export function SectionBack() {
  const { locale } = useI18n();
  return (
    <Link
      href="/dashboard"
      className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
    >
      ← {LABEL[locale]}
    </Link>
  );
}
