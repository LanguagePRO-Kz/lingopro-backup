"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { EXAM_LIST, examLang } from "@/lib/exams";
import { useExam } from "@/lib/exam-context";
import { SectionHeading } from "./ui/SectionHeading";
import { StaggerGroup, StaggerItem } from "./ui/Reveal";

export function ExamsStrip() {
  const { t, locale } = useI18n();
  const { openWaitlist } = useExam();
  const L = pick(locale, {
    ru: {
      start: "Начать →",
      notify: "Узнать о запуске →",
      subtitle: "TÖMER — уже доступен. Остальные экзамены готовим к запуску.",
    },
    en: {
      start: "Start →",
      notify: "Notify me →",
      subtitle: "TÖMER is available now. The other exams are in the works.",
    },
    tr: {
      start: "Başla →",
      notify: "Haber ver →",
      subtitle: "TÖMER şimdiden mevcut. Diğer sınavları lansmana hazırlıyoruz.",
    },
    kk: {
      start: "Бастау →",
      notify: "Хабарлау →",
      subtitle: "TÖMER — қазірдің өзінде қолжетімді. Қалған емтихандарды іске қосуға дайындап жатырмыз.",
    },
  });

  return (
    <section id="exams" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={t.exams.title} subtitle={L.subtitle} />

        <StaggerGroup className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {EXAM_LIST.map((e) => {
            const available = e.status === "active";

            const inner = (
              <div
                className={`card-glow glass relative flex h-full flex-col gap-3 rounded-3xl p-6 text-left ${
                  available ? "ring-1 ring-[var(--color-brand-2)]/40" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
                    <span>{e.flag}</span>
                    {e.name}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      available
                        ? "bg-[var(--color-brand-2)]/15 text-[var(--color-brand-2)]"
                        : "bg-black/[0.04] text-[var(--color-muted)]"
                    }`}
                  >
                    {available ? t.exams.available : t.exams.soon}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-muted)]">{examLang(e, locale)}</p>
                <span className="mt-auto text-sm font-medium text-[var(--color-brand)]">
                  {available ? L.start : L.notify}
                </span>
              </div>
            );

            return (
              <StaggerItem key={e.id}>
                {available ? (
                  <Link href="/quiz" aria-label={`${e.name} — ${t.exams.available}`}>
                    {inner}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => openWaitlist(e.id)}
                    aria-label={`${e.name} — ${t.exams.soon}`}
                    className="w-full"
                  >
                    {inner}
                  </button>
                )}
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
