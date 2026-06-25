"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { Reveal } from "./ui/Reveal";

const HEADING: Record<Locale, { title: string; cta: string }> = {
  ru: { title: "Нас уже видели в соцсетях", cta: "Начать подготовку" },
  kk: { title: "Бізді әлеуметтік желілерден көрген", cta: "Дайындықты бастау" },
  en: { title: "You may have seen us on social", cta: "Start preparing" },
  tr: { title: "Bizi sosyal medyada görmüş olabilirsin", cta: "Hazırlığa başla" },
};

const POSTS = [
  { platform: "Reels", views: "150K", handle: "@student_almaty", icon: "📸" },
  { platform: "TikTok", views: "89K", handle: "@tomer_tips", icon: "🎵" },
  { platform: "Reels", views: "200K", handle: "@turkish_kz", icon: "📸" },
  { platform: "Shorts", views: "74K", handle: "@tomer_daily", icon: "▶️" },
  { platform: "TikTok", views: "120K", handle: "@turkce_kz", icon: "🎵" },
  { platform: "Reels", views: "95K", handle: "@study_turkiye", icon: "📸" },
];

function Card({ p }: { p: (typeof POSTS)[number] }) {
  return (
    <div className="glass flex w-56 shrink-0 items-center gap-3 rounded-2xl p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand)]/15 to-[var(--color-brand-2)]/15 text-xl">
        {p.icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-[var(--color-foreground)]">
          {p.platform} · {p.views}
        </div>
        <div className="truncate text-xs text-[var(--color-muted)]">{p.handle}</div>
      </div>
    </div>
  );
}

export function UGCStrip() {
  const { locale } = useI18n();
  const h = HEADING[locale];
  const loop = [...POSTS, ...POSTS];

  return (
    <section className="overflow-hidden py-16 sm:py-20">
      <Reveal className="px-4">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">{h.title}</h2>
      </Reveal>

      <div className="relative mt-10">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--color-bg)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--color-bg)] to-transparent" />
        <div className="flex w-max animate-marquee gap-4">
          {loop.map((p, i) => (
            <Card key={`${p.handle}-${i}`} p={p} />
          ))}
        </div>
      </div>

      <Reveal className="mt-10 flex justify-center px-4">
        <Link href="/quiz" className="btn-primary rounded-full px-7 py-3.5 text-sm">
          {h.cta}
        </Link>
      </Reveal>
    </section>
  );
}
