"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { savePlan, type PackageId } from "@/lib/billing";
import { saveProfilePlan } from "@/lib/profile";
import { redeemPromo, type PromoReason } from "@/lib/promo";
import { currencyFor } from "@/lib/pricing";

/**
 * Чекаут пакета — единый для всех пакетов (1/3/6 мес) и языков (RU/EN/TR/KK).
 *
 * Основной путь — ОПЛАТА (Kaspi для KZT-рынка, карта через Dodo для USD —
 * провайдера выбирает сервер по валюте). Промокод — вторичное поле под
 * разделителем; публично механику кодов не рекламируем.
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
    methodKaspiNote: "Оплата в приложении Kaspi.kz",
    methodCard: "Банковская карта",
    methodCardNote: "Visa · Mastercard · безопасная оплата",
    pay: (p: string) => `Оплатить ${p}`,
    paying: "Открываем оплату…",
    payErr: "Не удалось открыть оплату — попробуй ещё раз.",
    payOff: "Оплата временно недоступна — попробуй чуть позже.",
    qrHint: "Отсканируй в приложении Kaspi:",
    promoQ: "Есть промокод?",
    promoPlaceholder: "Промокод",
    promoApply: "Применить",
    promoChecking: "Проверяем…",
    promoGranted: "Промокод активирован! Открываем доступ…",
    promoSaved: (n: number) => `Скидка ${n}% применится к оплате.`,
    reasons: {
      not_found: "Промокод не найден",
      expired: "Срок действия промокода истёк",
      exhausted: "Лимит промокода исчерпан",
      wrong_package: "Промокод не подходит к этому пакету",
      not_first_purchase: "Промокод только для первой покупки",
      unauthenticated: "Войди, чтобы применить промокод",
      error: "Не удалось проверить промокод — попробуй ещё раз",
    } as Record<PromoReason | "error", string>,
  },
  en: {
    discountNote: "30% diagnostic discount applied",
    method: "Payment method",
    methodKaspi: "Kaspi",
    methodKaspiNote: "Pay in the Kaspi.kz app",
    methodCard: "Bank card",
    methodCardNote: "Visa · Mastercard · secure checkout",
    pay: (p: string) => `Pay ${p}`,
    paying: "Opening checkout…",
    payErr: "Couldn't open checkout — please try again.",
    payOff: "Payments are temporarily unavailable — please try again later.",
    qrHint: "Scan in the Kaspi app:",
    promoQ: "Have a promo code?",
    promoPlaceholder: "Promo code",
    promoApply: "Apply",
    promoChecking: "Checking…",
    promoGranted: "Promo code activated! Opening your access…",
    promoSaved: (n: number) => `A ${n}% discount will apply to your payment.`,
    reasons: {
      not_found: "Promo code not found",
      expired: "This promo code has expired",
      exhausted: "This promo code has reached its limit",
      wrong_package: "This promo code doesn't apply to this package",
      not_first_purchase: "This promo code is for the first purchase only",
      unauthenticated: "Sign in to apply the promo code",
      error: "Couldn't verify the promo code — try again",
    } as Record<PromoReason | "error", string>,
  },
  tr: {
    discountNote: "Teşhis için %30 indirim uygulandı",
    method: "Ödeme yöntemi",
    methodKaspi: "Kaspi",
    methodKaspiNote: "Kaspi.kz uygulamasında öde",
    methodCard: "Banka kartı",
    methodCardNote: "Visa · Mastercard · güvenli ödeme",
    pay: (p: string) => `${p} öde`,
    paying: "Ödeme açılıyor…",
    payErr: "Ödeme açılamadı — lütfen tekrar dene.",
    payOff: "Ödeme geçici olarak kullanılamıyor — lütfen daha sonra tekrar dene.",
    qrHint: "Kaspi uygulamasında tara:",
    promoQ: "Promosyon kodun var mı?",
    promoPlaceholder: "Promosyon kodu",
    promoApply: "Uygula",
    promoChecking: "Kontrol ediliyor…",
    promoGranted: "Kod etkinleştirildi! Erişimin açılıyor…",
    promoSaved: (n: number) => `Ödemene %${n} indirim uygulanacak.`,
    reasons: {
      not_found: "Kod bulunamadı",
      expired: "Bu kodun süresi dolmuş",
      exhausted: "Bu kod limitine ulaştı",
      wrong_package: "Bu kod bu pakete uygun değil",
      not_first_purchase: "Bu kod yalnızca ilk satın alma için",
      unauthenticated: "Kodu uygulamak için giriş yap",
      error: "Kod doğrulanamadı — tekrar dene",
    } as Record<PromoReason | "error", string>,
  },
  kk: {
    discountNote: "Диагностика үшін 30% жеңілдік қолданылды",
    method: "Төлем тәсілі",
    methodKaspi: "Kaspi",
    methodKaspiNote: "Kaspi.kz қосымшасында төле",
    methodCard: "Банк картасы",
    methodCardNote: "Visa · Mastercard · қауіпсіз төлем",
    pay: (p: string) => `${p} төлеу`,
    paying: "Төлем ашылуда…",
    payErr: "Төлемді ашу мүмкін болмады — қайталап көр.",
    payOff: "Төлем уақытша қолжетімсіз — сәлден соң қайталап көр.",
    qrHint: "Kaspi қосымшасында сканерле:",
    promoQ: "Промокод бар ма?",
    promoPlaceholder: "Промокод",
    promoApply: "Қолдану",
    promoChecking: "Тексерілуде…",
    promoGranted: "Промокод іске қосылды! Қолжетімділік ашылуда…",
    promoSaved: (n: number) => `Төлеміңе ${n}% жеңілдік қолданылады.`,
    reasons: {
      not_found: "Промокод табылмады",
      expired: "Промокодтың мерзімі өтіп кеткен",
      exhausted: "Промокодтың лимиті таусылды",
      wrong_package: "Бұл промокод бұл пакетке келмейді",
      not_first_purchase: "Бұл промокод тек алғашқы сатып алуға",
      unauthenticated: "Промокодты қолдану үшін кір",
      error: "Промокодты тексеру мүмкін болмады — қайталап көр",
    } as Record<PromoReason | "error", string>,
  },
};

type PromoStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "granted" }
  | { kind: "saved"; discount: number }
  | { kind: "error"; msg: string };

export function CheckoutModal({
  pkgId,
  planName,
  priceLabel,
  baseLabel,
  onClose,
}: {
  pkgId: PackageId;
  planName: string;
  /** Итоговая цена («29 990 ₸» / «$59.99»). */
  priceLabel: string;
  /** Цена без скидки — рисуется зачёркнутой, когда скидка применена. */
  baseLabel?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { locale } = useI18n();
  const c = pick(locale, T);
  const currency = currencyFor(locale); // KZT → Kaspi, USD → карта (Dodo)

  /* ------------------------------ оплата ------------------------------ */
  const [payState, setPayState] = useState<"idle" | "busy" | "off" | "error">("idle");
  const [qr, setQr] = useState<string | null>(null);

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
    // 100% (или уже активированный ранее код) — доступ открывается сразу;
    // частичный код сохраняется и применится к оплате на сервере
    if (res.discountPercent === 100 || res.alreadyRedeemed) {
      setPromo({ kind: "granted" });
      savePlan(pkgId);
      await saveProfilePlan(pkgId);
      router.push("/dashboard");
      return;
    }
    setPromo({ kind: "saved", discount: res.discountPercent });
  }

  const promoBusy = promo.kind === "checking" || promo.kind === "granted";

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

        {/* способ оплаты — по рынку: KZT → Kaspi, USD → карта (Dodo) */}
        <div className="mt-5 rounded-2xl border border-black/[0.07] bg-black/[0.02] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">{c.method}</div>
          <div className="mt-2.5 flex items-center gap-3">
            {currency === "kzt" ? (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ef2e24] text-lg font-black text-white">K</span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-[var(--color-foreground)]">{c.methodKaspi}</span>
                  <span className="text-xs text-[var(--color-muted)]">{c.methodKaspiNote}</span>
                </span>
              </>
            ) : (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a1f71] to-[#3b4db8] text-lg text-white">💳</span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-[var(--color-foreground)]">{c.methodCard}</span>
                  <span className="text-xs text-[var(--color-muted)]">{c.methodCardNote}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* оплатить */}
        <button
          type="button"
          onClick={payNow}
          disabled={payState === "busy"}
          className="btn-primary mt-4 w-full rounded-full px-6 py-4 text-base font-semibold disabled:opacity-60"
        >
          {payState === "busy" ? c.paying : c.pay(priceLabel)}
        </button>
        {payState === "off" && <div className="mt-2 text-center text-xs font-medium text-[#b45309]">⏳ {c.payOff}</div>}
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
        {promo.kind === "granted" && <div className="mt-2 text-xs font-medium text-[#16a34a]">✅ {c.promoGranted}</div>}
        {promo.kind === "saved" && <div className="mt-2 text-xs font-medium text-[#16a34a]">✅ {c.promoSaved(promo.discount)}</div>}
      </motion.div>
    </motion.div>
  );
}
