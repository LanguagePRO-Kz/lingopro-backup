"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { Reveal } from "./ui/Reveal";

export function Guarantee() {
  const { locale } = useI18n();
  const c = pick(locale, {
    ru: { title: "Гарантия результата", text: "Подготовься к TÖMER или мы вернём деньги.", cta: "Начать подготовку", terms: "Условия гарантии" },
    en: { title: "Result guarantee", text: "Prepare for TÖMER or we'll refund your money.", cta: "Start preparing", terms: "Guarantee terms" },
    tr: { title: "Sonuç garantisi", text: "TÖMER'e hazırlan ya da paranı iade edelim.", cta: "Hazırlığa başla", terms: "Garanti koşulları" },
    kk: { title: "Нәтиже кепілдігі", text: "TÖMER-ге дайындал немесе ақшаңды қайтарамыз.", cta: "Дайындықты бастау", terms: "Кепілдік шарттары" },
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
