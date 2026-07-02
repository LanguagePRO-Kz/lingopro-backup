"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Logo } from "./ui/Logo";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/[0.07] px-4 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo className="h-8 w-8" />
              <span className="text-lg font-bold tracking-tight">
                Lingo<span className="text-gradient">PRO</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--color-muted)]">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--color-foreground)]">{t.footer.product}</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-[var(--color-muted)]">
              <li><Link href="/#platform" className="transition-colors hover:text-[var(--color-foreground)]">{t.footer.links.features}</Link></li>
              <li><a href="#pricing" className="transition-colors hover:text-[var(--color-foreground)]">{t.footer.links.pricing}</a></li>
              <li><Link href="/quiz" className="transition-colors hover:text-[var(--color-foreground)]">{t.footer.links.diagnostic}</Link></li>
              <li><a href="#faq" className="transition-colors hover:text-[var(--color-foreground)]">{t.footer.links.faq}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--color-foreground)]">{t.footer.company}</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-[var(--color-muted)]">
              <li><Link href="/about" className="transition-colors hover:text-[var(--color-foreground)]">{t.footer.links.about}</Link></li>
              <li><Link href="/contacts" className="transition-colors hover:text-[var(--color-foreground)]">{t.footer.links.contact}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--color-foreground)]">{t.footer.legal}</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-[var(--color-muted)]">
              <li><Link href="/privacy" className="transition-colors hover:text-[var(--color-foreground)]">{t.footer.links.privacy}</Link></li>
              <li><Link href="/terms" className="transition-colors hover:text-[var(--color-foreground)]">{t.footer.links.terms}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-black/[0.07] pt-6">
          <p className="text-xs leading-relaxed text-[var(--color-muted)]">{t.footer.disclaimer}</p>
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            © {year} LingoPRO. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
