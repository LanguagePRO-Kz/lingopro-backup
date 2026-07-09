"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Background } from "@/components/ui/Background";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { useI18n } from "@/lib/i18n";
import { pick, pluralize } from "@/lib/localized";
import { loadResult, saveResult, PLANS, LEVEL_ORDER, levelIndex, type QuizResult } from "@/lib/quiz";
import { type PackageId } from "@/lib/billing";
import { PRICING, currencyFor, fmtMoney, planRow, savingsPct, type Currency } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/client";
import { fetchProfile } from "@/lib/profile";
import { EarlyAccessModal } from "@/components/EarlyAccessModal";

const T = {
  ru: {
    hi: "Привет",
    sub: "Выбери план и начни подготовку к TÖMER уже сегодня",
    yourLevel: "Твой уровень",
    recoPlan: "Рекомендуемый план",
    choose: "Выбрать пакет",
    fullAccess: "Полный доступ ко всем функциям",
    popular: "Популярный",
    includedTitle: "Что входит в каждый пакет",
    perDayLabel: " в день",
    back: "На главную",
    levelWord: "Ваш уровень",
    toGoal: "До цели C1 —",
    levels: (n: number) => pluralize(n, "уровень", "уровня", "уровней"),
    choosePlan: "Выберите план подготовки",
    earlyNote: "Оплата откроется при запуске платформы.",
    discountBanner: "🎯 Вы прошли диагностику! Ваша персональная скидка 30%",
    names: { "1m": "1 месяц", "3m": "3 месяца", "6m": "6 месяцев" } as Record<string, string>,
    save: (n: number) => `Экономия ${n}%`,
    saveMax: (n: number) => `Максимальная экономия — ${n}%`,
    features: [
      "AI-диагностика уровня",
      "Персональный план подготовки",
      "AI-преподаватель 24/7",
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
    choose: "Choose plan",
    fullAccess: "Full access to all features",
    popular: "Popular",
    includedTitle: "What's included",
    perDayLabel: "/day",
    back: "Home",
    levelWord: "Your level",
    toGoal: "To the C1 goal —",
    levels: (n: number) => (n === 1 ? "level" : "levels"),
    choosePlan: "Choose a prep plan",
    earlyNote: "Card payments open at launch.",
    discountBanner: "🎯 You completed the diagnostic! Your personal 30% discount",
    names: { "1m": "1 month", "3m": "3 months", "6m": "6 months" } as Record<string, string>,
    save: (n: number) => `Save ${n}%`,
    saveMax: (n: number) => `Maximum savings — ${n}%`,
    features: [
      "AI level diagnostic",
      "Personal preparation plan",
      "AI tutor 24/7",
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
    choose: "Paketi seç",
    fullAccess: "Tüm özelliklere tam erişim",
    popular: "Popüler",
    includedTitle: "Her pakete dahil",
    perDayLabel: "/gün",
    back: "Ana sayfa",
    levelWord: "Seviyen",
    toGoal: "C1 hedefine —",
    levels: () => "seviye",
    choosePlan: "Bir hazırlık planı seç",
    earlyNote: "Kart ödemeleri lansmanda açılacak.",
    discountBanner: "🎯 Teşhisi tamamladın! Kişisel %30 indirimin",
    names: { "1m": "1 ay", "3m": "3 ay", "6m": "6 ay" } as Record<string, string>,
    save: (n: number) => `%${n} tasarruf`,
    saveMax: (n: number) => `En yüksek tasarruf — %${n}`,
    features: [
      "AI seviye tanısı",
      "Kişisel hazırlık planı",
      "7/24 AI öğretmen",
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
    choose: "Пакетті таңдау",
    fullAccess: "Барлық мүмкіндіктерге толық қол жеткізу",
    popular: "Танымал",
    includedTitle: "Әрбір пакетке кіреді",
    perDayLabel: "/күніне",
    back: "Басты бетке",
    levelWord: "Сенің деңгейің",
    toGoal: "C1 мақсатына дейін —",
    levels: () => "деңгей",
    choosePlan: "Дайындық жоспарын таңда",
    earlyNote: "Карта төлемдері платформа іске қосылғанда ашылады.",
    discountBanner: "🎯 Диагностикадан өттің! Сенің жеке 30% жеңілдігің",
    names: { "1m": "1 ай", "3m": "3 ай", "6m": "6 ай" } as Record<string, string>,
    save: (n: number) => `${n}% үнемдеу`,
    saveMax: (n: number) => `Ең көп үнемдеу — ${n}%`,
    features: [
      "Деңгейдің AI-диагностикасы",
      "Жеке дайындық жоспары",
      "24/7 AI-мұғалім",
      "Сөйлеу практикасы және айтылым",
      "Жазба тапсырмаларды тексеру",
      "TÖMER сынақ емтихандары",
      "AI мотивация менторы",
      "Статистика және прогресс",
    ],
  },
};

export default function PricingPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);

  // currency follows the interface language (RU/KZ → ₸, else → $)
  const cur: Currency = currencyFor(locale);
  const plans = PRICING[cur].plans;

  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [name, setName] = useState("");
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [modalPkg, setModalPkg] = useState<PackageId | null>(null);

  useEffect(() => {
    const local = loadResult();
    if (local) setResult(local);
    setName(window.localStorage.getItem("lingopro:name") || "");
    createClient()
      .auth.getUser()
      .then(async ({ data }) => {
        setAuthed(!!data.user);
        // result may live only in Supabase after the sign-up hop cleared the
        // local cache — hydrate from the profile so personalization works
        if (!local && data.user) {
          const profile = await fetchProfile();
          if (profile?.quiz_result) {
            setResult(profile.quiz_result);
            saveResult(profile.quiz_result);
          }
        }
      });
  }, []);

  // pick a plan → honest early access. Not authed yet? register first. Otherwise
  // open the early-access modal: real payment opens at launch, and the only way
  // in now is a genuine access code (redeem_promo) — no silent free grant.
  async function selectPlan(plan: PackageId) {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setBusy(false);
    if (!user) {
      router.push("/register");
      return;
    }
    setModalPkg(plan);
  }

  // finished the diagnostic → personal 30% discount
  const hasDiscount = !!result;

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

        {/* personal 30% discount banner — anyone who finished the diagnostic */}
        {hasDiscount && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-5 overflow-hidden rounded-3xl px-5 py-4 sm:px-7 sm:py-5"
          >
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{ background: "linear-gradient(120deg, #6d5bff, #5b8cff 50%, #19c6b3)" }}
            />
            <p className="text-base font-semibold text-white sm:text-lg">{c.discountBanner}</p>
          </motion.div>
        )}

        {/* funnel message — authed user who just finished the diagnostic */}
        {authed && result && (
          <div className="mt-5 rounded-2xl border border-[var(--color-brand)]/25 bg-[var(--color-brand)]/[0.06] px-5 py-4 text-sm sm:text-base">
            <span className="text-[var(--color-foreground)]">
              {c.levelWord}: <span className="font-bold text-[var(--color-brand)]">{result.level}</span>. {c.toGoal}{" "}
              <span className="font-semibold">{(() => { const n = LEVEL_ORDER.length - 1 - levelIndex(result.level); return `${n} ${c.levels(n)}`; })()}</span>. {c.choosePlan}:
            </span>
          </div>
        )}

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

        {/* packages — savings computed from the real prices, never hand-typed */}
        <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((p) => {
            const popular = !!p.popular;
            const badge =
              p.id === "3m" ? c.save(savingsPct(cur, p.id))
              : p.id === "6m" ? c.saveMax(savingsPct(cur, p.id))
              : undefined;
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

                  {/* price — 30% off after the diagnostic, else the full price */}
                  {hasDiscount ? (
                    <>
                      <div className="mt-2 text-sm text-[var(--color-muted)] line-through">{fmtMoney(cur, p.price)}</div>
                      <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
                        <span className="text-[34px] font-bold leading-none text-[#16a34a]">{fmtMoney(cur, p.disc)}</span>
                        <span className="rounded-full bg-[#16a34a]/15 px-2 py-0.5 text-[11px] font-bold text-[#16a34a]">−30%</span>
                      </div>
                    </>
                  ) : (
                    <div className="mt-2 text-[34px] font-bold leading-none text-[var(--color-foreground)]">{fmtMoney(cur, p.price)}</div>
                  )}

                  <div className="my-4 h-px w-full bg-black/[0.07]" />
                  <div className="text-[#374151]">
                    <span className="text-[16px]">≈ </span>
                    <span className="text-[20px] font-bold">{fmtMoney(cur, hasDiscount ? p.discPerDay : p.perDay)}</span>
                    <span className="text-[16px]">{c.perDayLabel}</span>
                  </div>

                  <p className="mt-3 text-sm text-[var(--color-foreground)]">✅ {c.fullAccess}</p>
                  {badge && (
                    <p className="mt-1 text-sm font-medium text-[var(--color-brand)]">{badge}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => selectPlan(p.id)}
                    disabled={busy}
                    className={`mt-7 rounded-full px-5 py-3 text-center text-sm font-semibold transition-all disabled:opacity-50 ${
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

        {/* honest early-access framing — no silent free grant */}
        <p className="mt-4 text-center text-xs text-[var(--color-muted)]">{c.earlyNote}</p>

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

      {/* early-access modal — code-gated entry (redeem_promo), no fake payment */}
      <AnimatePresence>
        {modalPkg && (
          <EarlyAccessModal
            pkgId={modalPkg}
            planName={c.names[modalPkg]}
            launchPrice={fmtMoney(cur, hasDiscount ? planRow(cur, modalPkg).disc : planRow(cur, modalPkg).price)}
            onClose={() => setModalPkg(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
