"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import type { PackageId } from "@/lib/billing";
import { redeemPromo, type PromoReason } from "@/lib/promo";
import { currencyFor, fmtMoney, planRow, type Currency } from "@/lib/pricing";

/**
 * Чекаут пакета — единый для всех пакетов (1/3/6 мес) и языков (RU/EN/TR/KK).
 *
 * Основной путь — ОПЛАТА: на выбор ДВА способа (Kaspi в тенге и карта
 * Visa/Mastercard через Dodo в долларах), дефолт — по рынку интерфейса
 * (RU/KK → Kaspi, EN/TR → карта). Цена и валюта честно переключаются вместе
 * со способом; провайдер при оплате определяется выбранным способом.
 * Промокод — вторичное поле под разделителем.
 *
 * Логотипы: до получения официальных brand-ассетов (Kaspi/Visa/Mastercard)
 * используем нейтральные иконки + текстовые подписи — чужие бренды не
 * перерисовываем. Официальные SVG положить в public/payment/ и заменить
 * иконки в MethodIcon ниже.
 *
 * Пока провайдер выключен (KASPI_MODE/DODO_MODE=off) кнопка оплаты честно
 * отвечает «временно недоступна» — при вставке ключей тот же клик открывает
 * реальную страницу оплаты без правок кода. Доступ по оплате выдаёт ТОЛЬКО
 * сервер по подписанному webhook'у (lib/payments/grant.ts).
 */

const T = {
  ru: {
    discountNote: "Скидка 30% за диагностику применена",
    method: "Способ оплаты",
    methodKaspi: "Kaspi",
    methodKaspiNote: "Приложение Kaspi.kz · счёт в тенге",
    methodCard: "Банковская карта",
    methodCardNote: "Visa · Mastercard · счёт в долларах",
    pay: (p: string) => `Оплатить ${p}`,
    paying: "Открываем оплату…",
    payErr: "Не удалось открыть оплату — попробуй ещё раз.",
    payOff: "Оплата временно недоступна — попробуй чуть позже.",
    paySoon: "Оплата скоро будет доступна",
    qrHint: "Отсканируй в приложении Kaspi:",
    promoQ: "Есть промокод?",
    promoPlaceholder: "Промокод",
    promoApply: "Применить",
    promoChecking: "Проверяем…",
    promoTrial: (n: number) => `Пробный доступ на ${n} дн. активирован! Открываем…`,
    promoSaved: (n: number) => `Скидка ${n}% применится к оплате.`,
    reasons: {
      not_found: "Промокод не найден",
      expired: "Срок действия промокода истёк",
      exhausted: "Лимит промокода исчерпан",
      wrong_package: "Промокод не подходит к этому пакету",
      not_first_purchase: "Промокод только для первой покупки",
      already_used: "Этот промокод уже был использован",
      trial_used: "Пробный доступ уже был активирован раньше",
      already_active: "У тебя уже есть активная подписка",
      unauthenticated: "Войди, чтобы применить промокод",
      error: "Не удалось проверить промокод — попробуй ещё раз",
    } as Record<PromoReason | "error", string>,
  },
  en: {
    discountNote: "30% diagnostic discount applied",
    method: "Payment method",
    methodKaspi: "Kaspi",
    methodKaspiNote: "Kaspi.kz app · billed in KZT",
    methodCard: "Bank card",
    methodCardNote: "Visa · Mastercard · billed in USD",
    pay: (p: string) => `Pay ${p}`,
    paying: "Opening checkout…",
    payErr: "Couldn't open checkout — please try again.",
    payOff: "Payments are temporarily unavailable — please try again later.",
    paySoon: "Payments are coming soon",
    qrHint: "Scan in the Kaspi app:",
    promoQ: "Have a promo code?",
    promoPlaceholder: "Promo code",
    promoApply: "Apply",
    promoChecking: "Checking…",
    promoTrial: (n: number) => `${n}-day trial activated! Opening your access…`,
    promoSaved: (n: number) => `A ${n}% discount will apply to your payment.`,
    reasons: {
      not_found: "Promo code not found",
      expired: "This promo code has expired",
      exhausted: "This promo code has reached its limit",
      wrong_package: "This promo code doesn't apply to this package",
      not_first_purchase: "This promo code is for the first purchase only",
      already_used: "This promo code was already used",
      trial_used: "Your trial has already been activated before",
      already_active: "You already have an active subscription",
      unauthenticated: "Sign in to apply the promo code",
      error: "Couldn't verify the promo code — try again",
    } as Record<PromoReason | "error", string>,
  },
  tr: {
    discountNote: "Teşhis için %30 indirim uygulandı",
    method: "Ödeme yöntemi",
    methodKaspi: "Kaspi",
    methodKaspiNote: "Kaspi.kz uygulaması · KZT olarak",
    methodCard: "Banka kartı",
    methodCardNote: "Visa · Mastercard · USD olarak",
    pay: (p: string) => `${p} öde`,
    paying: "Ödeme açılıyor…",
    payErr: "Ödeme açılamadı — lütfen tekrar dene.",
    payOff: "Ödeme geçici olarak kullanılamıyor — lütfen daha sonra tekrar dene.",
    paySoon: "Ödeme yakında kullanılabilir olacak",
    qrHint: "Kaspi uygulamasında tara:",
    promoQ: "Promosyon kodun var mı?",
    promoPlaceholder: "Promosyon kodu",
    promoApply: "Uygula",
    promoChecking: "Kontrol ediliyor…",
    promoTrial: (n: number) => `${n} günlük deneme erişimi açıldı! Yönlendiriliyorsun…`,
    promoSaved: (n: number) => `Ödemene %${n} indirim uygulanacak.`,
    reasons: {
      not_found: "Kod bulunamadı",
      expired: "Bu kodun süresi dolmuş",
      exhausted: "Bu kod limitine ulaştı",
      wrong_package: "Bu kod bu pakete uygun değil",
      not_first_purchase: "Bu kod yalnızca ilk satın alma için",
      already_used: "Bu kod zaten kullanıldı",
      trial_used: "Deneme erişimi daha önce etkinleştirilmiş",
      already_active: "Zaten aktif bir aboneliğin var",
      unauthenticated: "Kodu uygulamak için giriş yap",
      error: "Kod doğrulanamadı — tekrar dene",
    } as Record<PromoReason | "error", string>,
  },
  kk: {
    discountNote: "Диагностика үшін 30% жеңілдік қолданылды",
    method: "Төлем тәсілі",
    methodKaspi: "Kaspi",
    methodKaspiNote: "Kaspi.kz қосымшасы · теңгемен",
    methodCard: "Банк картасы",
    methodCardNote: "Visa · Mastercard · доллармен",
    pay: (p: string) => `${p} төлеу`,
    paying: "Төлем ашылуда…",
    payErr: "Төлемді ашу мүмкін болмады — қайталап көр.",
    payOff: "Төлем уақытша қолжетімсіз — сәлден соң қайталап көр.",
    paySoon: "Төлем жақында қолжетімді болады",
    qrHint: "Kaspi қосымшасында сканерле:",
    promoQ: "Промокод бар ма?",
    promoPlaceholder: "Промокод",
    promoApply: "Қолдану",
    promoChecking: "Тексерілуде…",
    promoTrial: (n: number) => `${n} күндік сынақ қолжетімділік ашылды! Ашылуда…`,
    promoSaved: (n: number) => `Төлеміңе ${n}% жеңілдік қолданылады.`,
    reasons: {
      not_found: "Промокод табылмады",
      expired: "Промокодтың мерзімі өтіп кеткен",
      exhausted: "Промокодтың лимиті таусылды",
      wrong_package: "Бұл промокод бұл пакетке келмейді",
      not_first_purchase: "Бұл промокод тек алғашқы сатып алуға",
      already_used: "Бұл промокод бұрын қолданылған",
      trial_used: "Сынақ қолжетімділік бұрын іске қосылған",
      already_active: "Сенде белсенді жазылым бар",
      unauthenticated: "Промокодты қолдану үшін кір",
      error: "Промокодты тексеру мүмкін болмады — қайталап көр",
    } as Record<PromoReason | "error", string>,
  },
};

type PromoStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "trial"; days: number }
  | { kind: "saved"; discount: number }
  | { kind: "error"; msg: string };

type MethodId = "kaspi" | "card";

/** Валюта каждого способа: Kaspi всегда в тенге, карта (Dodo) — в долларах. */
const METHOD_CURRENCY: Record<MethodId, Currency> = { kaspi: "kzt", card: "usd" };

export function CheckoutModal({
  pkgId,
  planName,
  hasDiscount,
  onClose,
}: {
  pkgId: PackageId;
  planName: string;
  /** Скидка 30% за пройденную диагностику применена. */
  hasDiscount: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { locale } = useI18n();
  const c = pick(locale, T);

  /* --------------------------- способ оплаты --------------------------- */
  // оба способа доступны всем; дефолт — по рынку интерфейса:
  // RU/KK → Kaspi (₸), EN/TR → карта (USD)
  const [method, setMethod] = useState<MethodId>(currencyFor(locale) === "kzt" ? "kaspi" : "card");
  const currency = METHOD_CURRENCY[method];
  // цена и валюта честно следуют за выбранным способом
  const row = planRow(currency, pkgId);
  const priceLabel = fmtMoney(currency, hasDiscount ? row.disc : row.price);
  const baseLabel = hasDiscount ? fmtMoney(currency, row.price) : undefined;

  /* ------------------------------ оплата ------------------------------ */
  const [payState, setPayState] = useState<"idle" | "busy" | "off" | "error">("idle");
  const [qr, setQr] = useState<string | null>(null);

  // доступность провайдера ДО клика: off → отключённая кнопка + честный
  // текст «оплата скоро будет доступна» (старт на триалах, P0-2)
  useEffect(() => {
    let cancelled = false;
    setPayState("idle");
    fetch(`/api/payments/status?currency=${currency}`)
      .then((r) => r.json())
      .then((d: { ok: boolean; mode?: string }) => {
        if (!cancelled && (!d.ok || d.mode === "off")) setPayState("off");
      })
      .catch(() => {
        /* статус не узнали — кнопка живая, клик ответит честно */
      });
    return () => {
      cancelled = true;
    };
  }, [currency]);

  async function payNow() {
    if (payState === "busy") return;
    setPayState("busy");
    setQr(null);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkgId, currency }),
      });
      const d = (await res.json()) as
        | { ok: true; kind: "redirect"; url: string }
        | { ok: true; kind: "qr"; qrPayload: string }
        | { ok: false; reason: string };
      if (d.ok && d.kind === "redirect") {
        window.location.href = d.url; // страница оплаты провайдера
        return;
      }
      if (d.ok && d.kind === "qr") {
        setQr(d.qrPayload);
        setPayState("idle");
        return;
      }
      // провайдер ещё выключен (нет ключей) либо не сконфигурирован
      const off = !d.ok && (d.reason === "payments_off" || d.reason === "not_configured" || d.reason === "migration_0007_missing");
      console.info("[checkout]", !d.ok ? d.reason : "");
      setPayState(off ? "off" : "error");
    } catch {
      setPayState("error");
    }
  }

  /* ----------------------------- промокод ----------------------------- */
  const [code, setCode] = useState("");
  const [promo, setPromo] = useState<PromoStatus>({ kind: "idle" });

  async function applyPromo() {
    const trimmed = code.trim();
    if (!trimmed || promo.kind === "checking") return;
    setPromo({ kind: "checking" });

    const res = await redeemPromo(trimmed, pkgId);
    if (!res.ok) {
      setPromo({ kind: "error", msg: c.reasons[res.reason] });
      return;
    }
    // триал: доступ уже выдан СЕРВЕРОМ (redeem_promo, security definer) —
    // клиент план не пишет никогда, просто идёт в дашборд
    if (res.kind === "trial") {
      setPromo({ kind: "trial", days: res.trialDays });
      router.push("/dashboard");
      return;
    }
    // скидка сохранена на сервере и применится к оплате
    setPromo({ kind: "saved", discount: res.discountPercent });
  }

  const promoBusy = promo.kind === "checking" || promo.kind === "trial";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button type="button" aria-label="close" onClick={onClose} className="absolute inset-0 bg-black/45 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-7"
      >
        {/* заголовок: пакет · цена */}
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[var(--color-foreground)]">
            {planName} · {priceLabel}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-black/[0.05]"
          >
            ✕
          </button>
        </div>

        {/* применённая скидка за диагностику */}
        {baseLabel && (
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            <span className="line-through">{baseLabel}</span>{" "}
            <span className="ml-1 rounded-full bg-[#16a34a]/15 px-2 py-0.5 text-[11px] font-bold text-[#16a34a]">−30%</span>{" "}
            <span className="ml-1 text-xs">{c.discountNote}</span>
          </p>
        )}

        {/* способ оплаты — на выбор: Kaspi (₸) и карта (USD), оба для всех */}
        <div className="mt-5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">{c.method}</div>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <MethodCard
              active={method === "kaspi"}
              onSelect={() => setMethod("kaspi")}
              icon={<MethodIcon kind="kaspi" />}
              title={c.methodKaspi}
              note={c.methodKaspiNote}
              chip="₸"
            />
            <MethodCard
              active={method === "card"}
              onSelect={() => setMethod("card")}
              icon={<MethodIcon kind="card" />}
              title={c.methodCard}
              note={c.methodCardNote}
              chip="$"
            />
          </div>
        </div>

        {/* оплатить: провайдер off → отключённая кнопка + честный текст */}
        <button
          type="button"
          onClick={payNow}
          disabled={payState === "busy" || payState === "off"}
          className="btn-primary mt-4 w-full rounded-full px-6 py-4 text-base font-semibold disabled:opacity-60"
        >
          {payState === "busy" ? c.paying : c.pay(priceLabel)}
        </button>
        {payState === "off" && <div className="mt-2 text-center text-xs font-medium text-[#b45309]">⏳ {c.paySoon}</div>}
        {payState === "error" && <div className="mt-2 text-center text-xs font-medium text-[#dc2626]">❌ {c.payErr}</div>}
        {qr && (
          <div className="mt-3 rounded-2xl border border-black/[0.07] bg-black/[0.02] p-4 text-center">
            <div className="text-xs text-[var(--color-muted)]">{c.qrHint}</div>
            {/* TODO(kaspi): при QR-сценарии подключить рендер QR-кода из payload */}
            <div className="mt-2 break-all font-mono text-xs text-[var(--color-foreground)]">{qr}</div>
          </div>
        )}

        {/* промокод — вторичный путь, под разделителем */}
        <div className="my-5 flex items-center gap-3 text-[11px] text-[var(--color-muted)]">
          <span className="h-px flex-1 bg-black/[0.08]" /> {c.promoQ} <span className="h-px flex-1 bg-black/[0.08]" />
        </div>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (promo.kind === "error") setPromo({ kind: "idle" });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyPromo();
            }}
            placeholder={c.promoPlaceholder}
            autoCapitalize="characters"
            className={`min-w-0 flex-1 rounded-xl border bg-white px-4 py-2.5 text-sm uppercase tracking-wider outline-none transition-all ${
              promo.kind === "error"
                ? "border-[#dc2626] ring-2 ring-[#dc2626]/20"
                : "border-black/[0.1] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
            }`}
          />
          <button
            type="button"
            onClick={applyPromo}
            disabled={promoBusy || !code.trim()}
            className="btn-ghost shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {promo.kind === "checking" ? c.promoChecking : c.promoApply}
          </button>
        </div>
        {promo.kind === "error" && <div className="mt-2 text-xs font-medium text-[#dc2626]">❌ {promo.msg}</div>}
        {promo.kind === "trial" && <div className="mt-2 text-xs font-medium text-[#16a34a]">✅ {c.promoTrial(promo.days)}</div>}
        {promo.kind === "saved" && <div className="mt-2 text-xs font-medium text-[#16a34a]">✅ {c.promoSaved(promo.discount)}</div>}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------- карточка способа оплаты ------------------------- */

export function MethodCard({
  active,
  onSelect,
  icon,
  title,
  note,
  chip,
}: {
  active: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  note: string;
  chip: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`relative flex flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition-all ${
        active
          ? "border-[var(--color-brand)] bg-[var(--color-brand)]/[0.06] ring-2 ring-[var(--color-brand)]/25"
          : "border-black/[0.08] bg-black/[0.02] hover:border-black/[0.16]"
      }`}
    >
      <span className="absolute right-3 top-3 rounded-full bg-black/[0.05] px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-muted)]">
        {chip}
      </span>
      {icon}
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-[var(--color-foreground)]">{title}</span>
        <span className="mt-0.5 text-[11px] leading-snug text-[var(--color-muted)]">{note}</span>
      </span>
    </button>
  );
}

/**
 * Нейтральные иконки способов оплаты. Чужие логотипы (Kaspi/Visa/Mastercard)
 * НЕ перерисовываем — по бренд-гайдлайнам можно использовать только
 * официальные ассеты. Когда основатель положит их в public/payment/
 * (kaspi.svg, visa.svg, mastercard.svg) — заменить эти SVG на <Image>.
 */
export function MethodIcon({ kind }: { kind: "kaspi" | "card" }) {
  if (kind === "kaspi") {
    // нейтральная иконка «оплата в приложении» (смартфон + чек)
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.05]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="7" y="3" width="10" height="18" rx="2.2" stroke="#0f172a" strokeWidth="1.7" />
          <path d="M10.2 12.2l1.6 1.6 3-3.4" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.5 18h3" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  // нейтральная иконка банковской карты
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.05]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2.5" y="5" width="19" height="14" rx="2.4" stroke="#0f172a" strokeWidth="1.7" />
        <path d="M2.5 9.5h19" stroke="#0f172a" strokeWidth="1.7" />
        <path d="M6 15h4" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}
