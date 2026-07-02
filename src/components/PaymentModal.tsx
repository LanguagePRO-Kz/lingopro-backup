"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import {
  applyDiscount,
  formatPrice,
  PROMO_CODES,
  QUIZ_DISCOUNT,
  savePlan,
  type PackageId,
} from "@/lib/billing";
import { saveProfilePlan } from "@/lib/profile";

const T = {
  ru: {
    title: "Оплата",
    discountApplied: "Скидка 30% применена. Обычная цена:",
    promoPlaceholder: "Введите промокод",
    apply: "Применить",
    promoOk: "Промокод применён: скидка",
    promoBad: "Промокод не найден",
    methodCard: "Банковская карта",
    methodCardSub: "Visa / Mastercard",
    methodQR: "Kaspi QR",
    methodTransfer: "Kaspi перевод",
    cardNumber: "Номер карты",
    expiry: "Срок (ММ/ГГ)",
    cvv: "CVV",
    qrHint: "Отсканируйте QR-код в приложении Kaspi",
    accountLabel: "Номер счёта",
    pay: "Оплатить",
    secure: "🔒 Безопасная оплата · Отмена в любой момент · Возврат в течение 3 дней",
    guaranteeTitle: "Гарантия возврата",
    guaranteeText: "Если платформа не подойдёт — вернём деньги в течение 3 дней. Без вопросов.",
  },
  en: {
    title: "Payment",
    discountApplied: "30% discount applied. Regular price:",
    promoPlaceholder: "Enter promo code",
    apply: "Apply",
    promoOk: "Promo applied: discount",
    promoBad: "Promo code not found",
    methodCard: "Bank card",
    methodCardSub: "Visa / Mastercard",
    methodQR: "Kaspi QR",
    methodTransfer: "Kaspi transfer",
    cardNumber: "Card number",
    expiry: "Expiry (MM/YY)",
    cvv: "CVV",
    qrHint: "Scan the QR code in the Kaspi app",
    accountLabel: "Account number",
    pay: "Pay",
    secure: "🔒 Secure payment · Cancel anytime · Refund within 3 days",
    guaranteeTitle: "Money-back guarantee",
    guaranteeText: "If the platform isn't for you, we'll refund you within 3 days. No questions asked.",
  },
  tr: {
    title: "Ödeme",
    discountApplied: "%30 indirim uygulandı. Normal fiyat:",
    promoPlaceholder: "Promosyon kodu gir",
    apply: "Uygula",
    promoOk: "Kod uygulandı: indirim",
    promoBad: "Promosyon kodu bulunamadı",
    methodCard: "Banka kartı",
    methodCardSub: "Visa / Mastercard",
    methodQR: "Kaspi QR",
    methodTransfer: "Kaspi transfer",
    cardNumber: "Kart numarası",
    expiry: "Son kullanım (AA/YY)",
    cvv: "CVV",
    qrHint: "Kaspi uygulamasında QR kodu tara",
    accountLabel: "Hesap numarası",
    pay: "Öde",
    secure: "🔒 Güvenli ödeme · İstediğin zaman iptal · 3 gün içinde iade",
    guaranteeTitle: "İade garantisi",
    guaranteeText: "Platform sana uymazsa 3 gün içinde paranı iade ederiz. Soru sormadan.",
  },
  kk: {
    title: "Төлем",
    discountApplied: "30% жеңілдік қолданылды. Әдеттегі баға:",
    promoPlaceholder: "Промокод енгіз",
    apply: "Қолдану",
    promoOk: "Промокод қолданылды: жеңілдік",
    promoBad: "Промокод табылмады",
    methodCard: "Банк картасы",
    methodCardSub: "Visa / Mastercard",
    methodQR: "Kaspi QR",
    methodTransfer: "Kaspi аударым",
    cardNumber: "Карта нөмірі",
    expiry: "Мерзімі (АА/ЖЖ)",
    cvv: "CVV",
    qrHint: "Kaspi қосымшасында QR-кодты сканерле",
    accountLabel: "Шот нөмірі",
    pay: "Төлеу",
    secure: "🔒 Қауіпсіз төлем · Кез келген уақытта бас тарту · 3 күнде қайтару",
    guaranteeTitle: "Қайтару кепілдігі",
    guaranteeText: "Платформа ұнамаса — 3 күн ішінде ақшаңды қайтарамыз. Сұраусыз.",
  },
};

type Method = "card" | "qr" | "transfer";

export function PaymentModal({
  pkgId,
  base,
  name,
  hasDiscount,
  onClose,
}: {
  pkgId: PackageId;
  base: number;
  name: string;
  hasDiscount: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(0);
  const [promoMsg, setPromoMsg] = useState<"ok" | "bad" | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [method, setMethod] = useState<Method>("card");

  const fraction = (hasDiscount ? QUIZ_DISCOUNT : 0) + appliedPromo / 100;
  const finalPrice = applyDiscount(base, fraction);

  function applyPromo() {
    const code = promo.trim().toUpperCase();
    const pct = PROMO_CODES[code];
    if (pct) {
      setAppliedPromo(pct);
      setPromoMsg("ok");
      setInvalid(false);
    } else {
      setAppliedPromo(0);
      setPromoMsg("bad");
      setInvalid(true);
      setTimeout(() => setInvalid(false), 2000);
    }
  }

  async function pay() {
    savePlan(pkgId);
    await saveProfilePlan(pkgId);
    router.push("/dashboard");
  }

  const methods: { id: Method; icon: string; label: string; sub?: string }[] = [
    { id: "card", icon: "💳", label: c.methodCard, sub: c.methodCardSub },
    { id: "qr", icon: "📱", label: c.methodQR },
    { id: "transfer", icon: "💳", label: c.methodTransfer },
  ];

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
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[var(--color-foreground)]">
            {c.title} · {name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-black/[0.05]"
          >
            ✕
          </button>
        </div>

        {/* amount */}
        <div className="mt-4 text-center">
          <div className="text-4xl font-extrabold text-[var(--color-foreground)]">{formatPrice(finalPrice)} ₸</div>
          {hasDiscount && (
            <div className="mt-1 text-xs text-[var(--color-muted)]">
              {c.discountApplied}{" "}
              <span className="line-through">{formatPrice(base)} ₸</span>
            </div>
          )}
        </div>

        {/* promo */}
        <div className="mt-5">
          <div className="flex gap-2">
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder={c.promoPlaceholder}
              className={`flex-1 rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-all ${
                invalid
                  ? "border-[#dc2626] ring-2 ring-[#dc2626]/20"
                  : "border-black/[0.1] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
              }`}
            />
            <button
              type="button"
              onClick={applyPromo}
              className="shrink-0 rounded-xl bg-black/[0.06] px-4 py-2.5 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:bg-black/[0.1]"
            >
              {c.apply}
            </button>
          </div>
          {promoMsg === "ok" && (
            <div className="mt-2 text-xs font-medium text-[#16a34a]">
              ✅ {c.promoOk} {appliedPromo}%
            </div>
          )}
          {promoMsg === "bad" && <div className="mt-2 text-xs font-medium text-[#dc2626]">❌ {c.promoBad}</div>}
        </div>

        {/* methods */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-all ${
                method === m.id
                  ? "border-[var(--color-brand)] bg-[var(--color-brand)]/[0.06]"
                  : "border-black/[0.08] hover:border-black/[0.16]"
              }`}
            >
              <span className="text-lg">{m.icon}</span>
              <span className="text-[11px] font-medium leading-tight text-[var(--color-foreground)]">{m.label}</span>
            </button>
          ))}
        </div>

        {/* method body */}
        <div className="mt-4">
          {method === "card" && (
            <div className="flex flex-col gap-3">
              <input
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                className="rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  inputMode="numeric"
                  placeholder={c.expiry}
                  className="rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
                />
                <input
                  inputMode="numeric"
                  placeholder={c.cvv}
                  className="rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
                />
              </div>
            </div>
          )}

          {method === "qr" && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/[0.07] bg-black/[0.02] p-5">
              <div
                className="h-36 w-36 rounded-xl"
                style={{
                  background:
                    "repeating-conic-gradient(#101828 0% 25%, #ffffff 0% 50%) 50% / 14px 14px",
                }}
              />
              <p className="text-center text-xs text-[var(--color-muted)]">{c.qrHint}</p>
            </div>
          )}

          {method === "transfer" && (
            <div className="rounded-2xl border border-black/[0.07] bg-black/[0.02] p-5">
              <div className="text-xs text-[var(--color-muted)]">{c.accountLabel}</div>
              <div className="mt-1 font-mono text-lg font-semibold tracking-wider text-[var(--color-foreground)]">
                4400 **** **** 1234
              </div>
            </div>
          )}
        </div>

        {/* pay */}
        <button
          type="button"
          onClick={pay}
          className="btn-primary mt-5 w-full rounded-full px-6 py-4 text-base font-semibold"
        >
          {c.pay} {formatPrice(finalPrice)} ₸
        </button>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-[var(--color-muted)]">{c.secure}</p>

        {/* guarantee */}
        <div className="mt-4 rounded-2xl border border-[var(--color-brand-2)]/25 bg-[var(--color-brand-2)]/[0.06] p-4">
          <div className="text-sm font-semibold text-[var(--color-foreground)]">🛡️ {c.guaranteeTitle}</div>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">{c.guaranteeText}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
