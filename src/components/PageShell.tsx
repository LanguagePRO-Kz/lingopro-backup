"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Background } from "./ui/Background";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./ui/Logo";
import { useI18n } from "@/lib/i18n";

export function PageShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <>
      <Background />
      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight">
            Lingo<span className="text-gradient">PRO</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/"
            className="hidden text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)] sm:inline-block"
          >
            ← {t.pages.back}
          </Link>
        </div>
      </header>
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10">
        {children}
      </main>
    </>
  );
}
