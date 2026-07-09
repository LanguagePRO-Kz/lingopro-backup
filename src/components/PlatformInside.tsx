"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { Reveal } from "./ui/Reveal";
import SHOTS from "@/data/platform-shots.json";

/*
 * Честная витрина: РЕАЛЬНЫЕ скриншоты продукта, снятые скриптом
 * `scripts/capture-platform-shots.mts` с живого билда под демо-аккаунтом,
 * который прошёл настоящую воронку (диагностика → план → занятия).
 * Никаких нарисованных макетов. После правок UI перезапусти скрипт —
 * витрина обновится и не разойдётся с продуктом.
 */

type TabId = keyof typeof SHOTS;

type Content = { title: string; subtitle: string; cta: string; tabs: { id: TabId; label: string }[] };

const CONTENT: { ru: Content; en: Content; tr: Content; kk: Content } = {
  ru: {
    title: "Взгляни на платформу изнутри",
    subtitle: "Настоящие скриншоты продукта — как он выглядит внутри. Переключай вкладки.",
    cta: "Начать подготовку →",
    tabs: [
      { id: "speaking", label: "AI Öğretmen" },
      { id: "tutor", label: "AI-преподаватель" },
      { id: "plan", label: "Персональный план" },
      { id: "exam", label: "Пробный TÖMER" },
      { id: "feedback", label: "Детальный фидбек" },
      { id: "stats", label: "Статистика" },
      { id: "vocab", label: "Словарь" },
    ],
  },
  en: {
    title: "Take a look inside the platform",
    subtitle: "Real product screenshots — exactly how it looks inside. Switch the tabs.",
    cta: "Start preparing →",
    tabs: [
      { id: "speaking", label: "AI Öğretmen" },
      { id: "tutor", label: "AI tutor" },
      { id: "plan", label: "Personal plan" },
      { id: "exam", label: "Mock TÖMER" },
      { id: "feedback", label: "Detailed feedback" },
      { id: "stats", label: "Statistics" },
      { id: "vocab", label: "Vocabulary" },
    ],
  },
  tr: {
    title: "Platforma içeriden bak",
    subtitle: "Ürünün gerçek ekran görüntüleri — içeride tam böyle görünüyor. Sekmeleri değiştir.",
    cta: "Hazırlığa başla →",
    tabs: [
      { id: "speaking", label: "AI Öğretmen" },
      { id: "tutor", label: "AI öğretmen" },
      { id: "plan", label: "Kişisel plan" },
      { id: "exam", label: "Deneme TÖMER" },
      { id: "feedback", label: "Ayrıntılı geri bildirim" },
      { id: "stats", label: "İstatistik" },
      { id: "vocab", label: "Sözlük" },
    ],
  },
  kk: {
    title: "Платформаға іштен қара",
    subtitle: "Өнімнің нақты скриншоттары — іші дәл осылай көрінеді. Қойындыларды ауыстыр.",
    cta: "Дайындықты бастау →",
    tabs: [
      { id: "speaking", label: "AI Öğretmen" },
      { id: "tutor", label: "AI-мұғалім" },
      { id: "plan", label: "Жеке жоспар" },
      { id: "exam", label: "Сынақ TÖMER" },
      { id: "feedback", label: "Толық фидбек" },
      { id: "stats", label: "Статистика" },
      { id: "vocab", label: "Сөздік" },
    ],
  },
};

/* ---------------------------- browser frame ---------------------------- */
function Chrome({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div className="border-gradient overflow-hidden rounded-[1.6rem] p-2.5">
      <div className="overflow-hidden rounded-[1.3rem] bg-white">
        <div className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 flex-1 truncate rounded-md bg-black/[0.04] px-3 py-1 text-xs text-[var(--color-muted)]">
            lingopro.app{path}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PlatformInside() {
  const { locale } = useI18n();
  const c = pick(locale, CONTENT);
  const [active, setActive] = useState<TabId>("speaking");
  const tab = c.tabs.find((t) => t.id === active) ?? c.tabs[0];
  const shot = SHOTS[active];

  return (
    <section id="platform" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{c.title}</h2>
          <p className="mt-4 text-base text-[var(--color-muted)]">{c.subtitle}</p>
        </Reveal>

        <Reveal className="mt-10">
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {c.tabs.map((t) => {
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(t.id)}
                  aria-pressed={isActive}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="platform-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative mx-auto max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Chrome path={shot.route}>
                  <Image
                    src={shot.src}
                    alt={tab.label}
                    width={1280}
                    height={900}
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="h-auto w-full"
                    priority={active === "speaking"}
                  />
                </Chrome>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/quiz" className="btn-primary rounded-full px-7 py-3.5 text-sm">
              {c.cta}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
