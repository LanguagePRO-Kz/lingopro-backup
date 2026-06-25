"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Background } from "@/components/ui/Background";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { PaymentModal } from "@/components/PaymentModal";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { loadResult, PLANS, type QuizResult } from "@/lib/quiz";
import {
  applyDiscount,
  formatPrice,
  perDay,
  PACKAGES,
  QUIZ_DISCOUNT,
  DISCOUNT_WINDOW,
  type Package,
} from "@/lib/billing";
import { PricingTicker } from "@/components/PricingTicker";

const T = {
  ru: {
    hi: "Привет",
    sub: "Выбери план и начни подготовку к TÖMER уже сегодня",
    yourLevel: "Твой уровень",
    recoPlan: "Рекомендуемый план",
    bannerText: "Ты прошёл диагностику — скидка 30% уже применена!",
    bannerTimer: "Скидка действует:",
    choose: "Выбрать",
    fullAccess: "Полный доступ ко всем функциям",
    popular: "Популярный",
    includedTitle: "Что входит в каждый пакет",
    noQuizText: "Пройди бесплатную диагностику и получи скидку 30%",
    noQuizCta: "Пройти диагностику →",
    back: "На главную",
    names: { "1m": "1 месяц", "3m": "3 месяца", "6m": "6 месяцев" } as Record<string, string>,
    extra: { "3m": "Экономия 40%", "6m": "Максимальная экономия" } as Record<string, string>,
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
  },
  en: {
    hi: "Hi",
    sub: "Pick a plan and start preparing for TÖMER today",
    yourLevel: "Your level",
    recoPlan: "Recommended plan",
    bannerText: "You finished the diagnostic — 30% off already applied!",
    bannerTimer: "Discount ends in:",
    choose: "Choose",
    fullAccess: "Full access to all features",
    popular: "Popular",
    includedTitle: "What every package includes",
    noQuizText: "Take the free diagnostic and get 30% off",
    noQuizCta: "Take the diagnostic →",
    back: "Home",
    names: { "1m": "1 month", "3m": "3 months", "6m": "6 months" } as Record<string, string>,
    extra: { "3m": "Save 40%", "6m": "Maximum savings" } as Record<string, string>,
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
  },
  tr: {
    hi: "Merhaba",
    sub: "Bir plan seç ve bugün TÖMER hazırlığına başla",
    yourLevel: "Seviyen",
    recoPlan: "Önerilen plan",
    bannerText: "Teşhisi tamamladın — %30 indirim çoktan uygulandı!",
    bannerTimer: "İndirim bitişi:",
    choose: "Seç",
    fullAccess: "Tüm özelliklere tam erişim",
    popular: "Popüler",
    includedTitle: "Her pakete dahil olanlar",
    noQuizText: "Ücretsiz teşhisi geç ve %30 indirim kazan",
    noQuizCta: "Teşhise başla →",
    back: "Ana sayfa",
    names: { "1m": "1 ay", "3m": "3 ay", "6m": "6 ay" } as Record<string, string>,
    extra: { "3m": "%40 tasarruf", "6m": "Maksimum tasarruf" } as Record<string, string>,
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
  },
  kk: {
    hi: "Сәлем",
    sub: "Жоспарды таңда да бүгін TÖMER-ге дайындықты баста",
    yourLevel: "Сенің деңгейің",
    recoPlan: "Ұсынылатын жоспар",
    bannerText: "Сен диагностикадан өттің — 30% жеңілдік қолданылды!",
    bannerTimer: "Жеңілдік аяқталады:",
    choose: "Таңдау",
    fullAccess: "Барлық функцияларға толық қолжетімділік",
    popular: "Танымал",
    includedTitle: "Әр пакетке не кіреді",
    noQuizText: "Тегін диагностикадан өт және 30% жеңілдік ал",
    noQuizCta: "Диагностикадан өту →",
    back: "Басты бетке",
    names: { "1m": "1 ай", "3m": "3 ай", "6m": "6 ай" } as Record<string, string>,
    extra: { "3m": "40% үнемдеу", "6m": "Максималды үнемдеу" } as Record<string, string>,
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
  },
};

function fmtClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((x) => x.toString().padStart(2, "0")).join(":");
}

export default function PricingPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const pd = pick(locale, {
    ru: { pre: "всего ≈ ", post: " в день" },
    en: { pre: "that's ≈ ", post: " per day" },
    tr: { pre: "günde yaklaşık ", post: "" },
    kk: { pre: "күніне ≈ ", post: "" },
  });

  const [result, setResult] = useState<QuizResult | null>(null);
  const [name, setName] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [selected, setSelected] = useState<Package | null>(null);

  useEffect(() => {
    setResult(loadResult());
    setName(window.localStorage.getItem("lingopro:name") || "");
  }, []);

  // live countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const hasDiscount = !!result;
  const remaining = result ? result.takenAt + DISCOUNT_WINDOW - now : 0;

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
            ← {c.back}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-8">
        {/* greeting */}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {c.hi}{name ? `, ${name}` : ""}! 👋
        </h1>
        <p className="mt-1.5 text-sm text-[var(--color-muted)] sm:text-base">{c.sub}</p>

        {/* recommended plan mini-card */}
        {result && (
          <div className="glass mt-5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl px-4 py-3 text-sm">
            <span className="text-[var(--color-muted)]">{c.yourLevel}:</span>
            <span className="font-bold text-[var(--color-foreground)]">{result.level}</span>
            <span className="text-[var(--color-muted)]">· {c.recoPlan}:</span>
            <span className="font-semibold text-[var(--color-brand)]">{PLANS[result.plan].title[locale]}</span>
            <span className="text-[var(--color-muted)]">· {PLANS[result.plan].months[locale]}</span>
          </div>
        )}

        {/* discount banner with countdown */}
        {hasDiscount && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-6 overflow-hidden rounded-3xl px-5 py-4 sm:px-7 sm:py-5"
          >
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{ background: "linear-gradient(120deg, #6d5bff, #5b8cff 50%, #19c6b3)" }}
            />
            <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
              <p className="text-base font-semibold text-white sm:text-lg">🎉 {c.bannerText}</p>
              <div className="shrink-0 rounded-full bg-white/20 px-4 py-2 text-sm font-bold text-white">
                {c.bannerTimer} <span className="tabular-nums">{fmtClock(remaining)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* names + live counter ticker */}
        <div className="mt-8">
          <PricingTicker />
        </div>

        {/* packages */}
        <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-3">
          {PACKAGES.map((p) => {
            const popular = !!p.popular;
            const discounted = applyDiscount(p.base, QUIZ_DISCOUNT);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={popular ? "lg:-mt-4" : ""}
              >
                <div
                  className={`card-glow relative flex h-full flex-col rounded-3xl p-7 ${
                    popular ? "glass-strong ring-2 ring-[var(--color-brand)]/60" : "glass"
                  }`}
                >
                  {popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-3 py-1 text-[11px] font-semibold text-white">
                      {c.popular}
                    </span>
                  )}
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--color-muted)]">{c.names[p.id]}</h3>

                  {/* price — total is the main accent */}
                  {hasDiscount ? (
                    <>
                      <div className="mt-2 text-sm text-[var(--color-muted)] line-through">{formatPrice(p.base)} ₸</div>
                      <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
                        <span className="text-[34px] font-bold leading-none text-[#16a34a]">{formatPrice(discounted)} ₸</span>
                        <span className="rounded-full bg-[#16a34a]/15 px-2 py-0.5 text-[11px] font-bold text-[#16a34a]">−30%</span>
                      </div>
                    </>
                  ) : (
                    <div className="mt-2 text-[34px] font-bold leading-none text-[var(--color-foreground)]">{formatPrice(p.base)} ₸</div>
                  )}

                  <div className="my-4 h-px w-full bg-black/[0.07]" />
                  <div className="text-[#374151]">
                    <span className="text-[16px]">{pd.pre}</span>
                    <span className="text-[20px] font-bold">{formatPrice(perDay(hasDiscount ? discounted : p.base, p.id))} ₸</span>
                    <span className="text-[16px]">{pd.post}</span>
                  </div>

                  <p className="mt-3 text-sm text-[var(--color-foreground)]">✅ {c.fullAccess}</p>
                  {c.extra[p.id] && (
                    <p className="mt-1 text-sm font-medium text-[var(--color-brand)]">{c.extra[p.id]}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelected(p)}
                    className={`mt-7 rounded-full px-5 py-3 text-center text-sm font-semibold transition-all ${
                      popular ? "btn-primary" : "btn-ghost"
                    }`}
                  >
                    {c.choose}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* no-quiz banner */}
        {!hasDiscount && (
          <div className="relative mt-6 overflow-hidden rounded-3xl px-6 py-5">
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{ background: "linear-gradient(120deg, #6d5bff, #5b8cff 50%, #19c6b3)" }}
            />
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <p className="text-lg font-semibold text-white">🎁 {c.noQuizText}</p>
              <Link
                href="/quiz"
                className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-bold text-[var(--color-brand)] shadow-lg transition-transform hover:-translate-y-0.5"
              >
                {c.noQuizCta}
              </Link>
            </div>
          </div>
        )}

        {/* included features */}
        <div className="glass mt-8 rounded-3xl p-7">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">{c.includedTitle}</h3>
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
      </main>

      <AnimatePresence>
        {selected && (
          <PaymentModal
            pkgId={selected.id}
            base={selected.base}
            name={c.names[selected.id]}
            hasDiscount={hasDiscount}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
