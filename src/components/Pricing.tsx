"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import type { PackageId } from "@/lib/billing";
import { currencyFor, fmtMoney, planRow } from "@/lib/pricing";
import { SectionHeading } from "./ui/SectionHeading";
import { Gift } from "lucide-react";
import { PricingTicker } from "./PricingTicker";
import { StaggerGroup, StaggerItem, Reveal } from "./ui/Reveal";

type Pkg = { id: PackageId; name: string; note: string; badge?: string };
type Content = {
  title: string;
  subtitle: string;
  includedTitle: string;
  cta: string;
  features: string[];
  packages: Pkg[];
  bannerText: string;
  bannerStrong: string;
  bannerCta: string;
};

const CONTENT: { ru: Content; en: Content; tr: Content; kk: Content } = {
  ru: {
    title: "Тарифы",
    subtitle: "Функционал одинаковый во всех пакетах — отличается только срок доступа.",
    includedTitle: "Что входит в каждый пакет",
    cta: "Выбрать пакет",
    features: [
      "AI-диагностика уровня",
      "Персональный план подготовки",
      "AI-преподаватель без лимитов",
      "Разговорная практика и произношение",
      "Проверка письменных заданий",
      "Пробные экзамены TÖMER",
      "AI-ментор мотивации",
      "Статистика и прогресс",
    ],
    packages: [
      { id: "1m", name: "1 месяц", note: "Полный доступ ко всем функциям" },
      { id: "3m", name: "3 месяца", note: "Экономия 40%", badge: "Популярный" },
      { id: "6m", name: "6 месяцев", note: "Максимальная экономия" },
    ],
    bannerText: "Пройди бесплатную диагностику и получи скидку на любой пакет",
    bannerStrong: "−30%",
    bannerCta: "Пройти диагностику →",
  },
  en: {
    title: "Pricing",
    subtitle: "The same features in every package — only the access period differs.",
    includedTitle: "What every package includes",
    cta: "Choose package",
    features: [
      "AI level diagnostic",
      "Personal preparation plan",
      "Unlimited AI tutor",
      "Speaking practice & pronunciation",
      "Written assignment review",
      "Mock TÖMER exams",
      "AI motivation mentor",
      "Statistics & progress",
    ],
    packages: [
      { id: "1m", name: "1 month", note: "Full access to all features" },
      { id: "3m", name: "3 months", note: "Save 40%", badge: "Popular" },
      { id: "6m", name: "6 months", note: "Maximum savings" },
    ],
    bannerText: "Take the free diagnostic and get a discount on any package",
    bannerStrong: "−30%",
    bannerCta: "Take the diagnostic →",
  },
  tr: {
    title: "Fiyatlar",
    subtitle: "Tüm paketlerde aynı özellikler — yalnızca erişim süresi değişir.",
    includedTitle: "Her pakete dahil olanlar",
    cta: "Paket seç",
    features: [
      "AI seviye tanısı",
      "Kişisel hazırlık planı",
      "Sınırsız AI öğretmen",
      "Konuşma pratiği ve telaffuz",
      "Yazılı ödev değerlendirmesi",
      "Deneme TÖMER sınavları",
      "AI motivasyon mentoru",
      "İstatistik ve ilerleme",
    ],
    packages: [
      { id: "1m", name: "1 ay", note: "Tüm özelliklere tam erişim" },
      { id: "3m", name: "3 ay", note: "%40 tasarruf", badge: "Popüler" },
      { id: "6m", name: "6 ay", note: "Maksimum tasarruf" },
    ],
    bannerText: "Ücretsiz tanıyı tamamla ve her pakette indirim kazan",
    bannerStrong: "−30%",
    bannerCta: "Tanıya başla →",
  },
  kk: {
    title: "Тарифтер",
    subtitle: "Барлық пакеттерде функциялар бірдей — тек қолжетімділік мерзімі ерекшеленеді.",
    includedTitle: "Әр пакетке не кіреді",
    cta: "Пакет таңдау",
    features: [
      "Деңгейдің AI-диагностикасы",
      "Жеке дайындық жоспары",
      "Шектеусіз AI-мұғалім",
      "Сөйлеу практикасы және айтылым",
      "Жазба тапсырмаларды тексеру",
      "TÖMER сынақ емтихандары",
      "AI мотивация менторы",
      "Статистика және прогресс",
    ],
    packages: [
      { id: "1m", name: "1 ай", note: "Барлық функцияларға толық қолжетімділік" },
      { id: "3m", name: "3 ай", note: "40% үнемдеу", badge: "Танымал" },
      { id: "6m", name: "6 ай", note: "Максималды үнемдеу" },
    ],
    bannerText: "Тегін диагностикадан өт және кез келген пакетке жеңілдік ал",
    bannerStrong: "−30%",
    bannerCta: "Диагностикадан өту →",
  },
};

export function Pricing() {
  const { locale } = useI18n();
  const c = pick(locale, CONTENT);
  const cur = currencyFor(locale);
  const pd = pick(locale, {
    ru: { pre: "всего ≈ ", post: " в день" },
    en: { pre: "that's ≈ ", post: " per day" },
    tr: { pre: "günde yaklaşık ", post: "" },
    kk: { pre: "күніне ≈ ", post: "" },
  });

  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={c.title} title={c.title} subtitle={c.subtitle} />

        {/* names + live counter ticker */}
        <Reveal className="mt-10">
          <PricingTicker />
        </Reveal>

        {/* packages */}
        <StaggerGroup className="mt-8 grid items-stretch gap-6 lg:grid-cols-3">
          {c.packages.map((p) => {
            const popular = !!p.badge;
            const row = planRow(cur, p.id);
            return (
              <StaggerItem key={p.id} className={popular ? "lg:-mt-4" : ""}>
                <div
                  className={`card-glow relative flex h-full flex-col rounded-3xl p-7 ${
                    popular ? "glass-strong ring-2 ring-[var(--color-brand)]/60" : "glass"
                  }`}
                >
                  {popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-3 py-1 text-[11px] font-semibold text-white">
                      {p.badge}
                    </span>
                  )}
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--color-muted)]">{p.name}</h3>
                  <div className="mt-2 text-[34px] font-bold leading-none text-[var(--color-foreground)]">{fmtMoney(cur, row.price)}</div>
                  <div className="my-4 h-px w-full bg-black/[0.07]" />
                  <div className="text-[#374151]">
                    <span className="text-[16px]">{pd.pre}</span>
                    <span className="text-[20px] font-bold">{fmtMoney(cur, row.perDay)}</span>
                    <span className="text-[16px]">{pd.post}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-[var(--color-brand)]">{p.note}</p>
                  <Link
                    href="/register"
                    className={`mt-7 rounded-full px-5 py-3 text-center text-sm font-semibold transition-all ${
                      popular ? "btn-primary" : "btn-ghost"
                    }`}
                  >
                    {c.cta}
                  </Link>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* shared features */}
        <Reveal className="mt-8">
          <div className="glass rounded-3xl p-7">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              {c.includedTitle}
            </h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {c.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--color-foreground)]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-2)]/15 text-[var(--color-brand-2)]">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7.5L6 11l5.5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* discount banner — bright, prominent */}
        <Reveal className="mt-6">
          <div className="relative overflow-hidden rounded-3xl px-6 py-6 sm:px-8 sm:py-7">
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{ background: "linear-gradient(120deg, #6d5bff, #5b8cff 50%, #19c6b3)" }}
            />
            <div aria-hidden className="dot-grid absolute inset-0 -z-10 opacity-20" />
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <div className="flex shrink-0 items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white"><Gift size={24} /></span>
                <span className="text-[28px] font-extrabold leading-none text-white">{c.bannerStrong}</span>
              </div>
              <p className="flex-1 text-[20px] font-semibold leading-snug text-white">{c.bannerText}</p>
              <Link
                href="/quiz"
                className="animate-pulse-soft shrink-0 rounded-full bg-white px-7 py-3.5 text-base font-bold text-[var(--color-brand)] shadow-lg transition-transform hover:-translate-y-0.5"
              >
                {c.bannerCta}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
