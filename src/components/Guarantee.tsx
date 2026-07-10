"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { Reveal } from "./ui/Reveal";

export function Guarantee() {
  const { locale } = useI18n();
  // payments are built in — the guarantee is stated as live, no future framing
  const c = pick(locale, {
    ru: { title: "Честная гарантия", text: "Уровень не вырос за 3 месяца занятий — вернём 100%.", cta: "Начать подготовку", terms: "Условия гарантии" },
    en: { title: "An honest guarantee", text: "No level growth after 3 months of study — 100% refund.", cta: "Start preparing", terms: "Guarantee terms" },
    tr: { title: "Dürüst garanti", text: "3 aylık çalışmada seviye yükselmezse %100 iade.", cta: "Hazırlığa başla", terms: "Garanti koşulları" },
    kk: { title: "Адал кепілдік", text: "3 ай оқып деңгей өспесе — 100% қайтарамыз.", cta: "Дайындықты бастау", terms: "Кепілдік шарттары" },
  });

  return (
    <section id="guarantee" className="px-4 py-20 sm:py-28">
      <Reveal className="mx-auto max-w-3xl">
        <div className="border-gradient rounded-3xl p-10 text-center sm:p-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
            <Shield size={28} />
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{c.title}</h2>
          <p className="mt-3 text-base text-[var(--color-muted)] sm:text-lg">{c.text}</p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link href="/quiz" className="btn-primary rounded-full px-8 py-3.5 text-sm">
              {c.cta}
            </Link>
            <Link href="/guarantee" className="text-sm text-[var(--color-muted)] underline-offset-4 transition-colors hover:text-[var(--color-foreground)] hover:underline">
              {c.terms}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
