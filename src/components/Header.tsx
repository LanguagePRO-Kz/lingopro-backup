"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ExamSelector } from "./ExamSelector";
import { Logo } from "./ui/Logo";

export function Header() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: t.nav.features },
    { href: "#how", label: t.nav.how },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#faq", label: t.nav.faq },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <div
        className={`flex w-full max-w-6xl items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-all duration-300 sm:px-6 ${
          scrolled ? "glass-strong shadow-2xl" : "border border-transparent"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5" aria-label="LingoPRO">
          <Logo className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight">
            Lingo<span className="text-gradient">PRO</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm text-[var(--color-muted)] transition-colors hover:bg-black/[0.04] hover:text-[var(--color-foreground)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ExamSelector />
          </div>
          <LanguageSwitcher />
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)] sm:inline-block"
          >
            {t.nav.login}
          </Link>
          <Link
            href="/quiz"
            className="btn-primary hidden rounded-full px-4 py-2 text-sm sm:inline-block"
          >
            {t.nav.cta}
          </Link>

          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="btn-ghost flex h-9 w-9 items-center justify-center rounded-full lg:hidden"
          >
            <div className="flex flex-col gap-1">
              <span className={`h-0.5 w-4 bg-[var(--color-foreground)] transition-transform ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`h-0.5 w-4 bg-[var(--color-foreground)] transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-4 bg-[var(--color-foreground)] transition-transform ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-strong absolute inset-x-4 top-[4.5rem] z-40 rounded-2xl p-3 lg:hidden"
          >
            <nav className="flex flex-col">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm text-[var(--color-muted)] transition-colors hover:bg-black/[0.04] hover:text-[var(--color-foreground)]"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 border-t border-black/[0.07] pt-3">
                <ExamSelector />
              </div>
              <div className="mt-2 flex gap-2">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-ghost flex-1 rounded-full px-4 py-2.5 text-center text-sm">
                  {t.nav.login}
                </Link>
                <Link href="/quiz" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 rounded-full px-4 py-2.5 text-center text-sm">
                  {t.nav.cta}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
