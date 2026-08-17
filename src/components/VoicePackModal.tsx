"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { currencyFor, fmtMoney, VOICE_PACKS, VOICE_PACK_IDS, type VoicePackId, type Currency } from "@/lib/pricing";
import { MethodCard, MethodIcon } from "./CheckoutModal";

/**
 * Докупки сверх месячного лимита (Блок 5 от 16.08.2026): минуты практики,
 * уроки, пробные Konuşma. Та же платёжная механика, что у пакетов доступа:
 * Kaspi (₸) / карта Dodo ($) на выбор, провайдер — по выбранному способу,
 * начисляет ТОЛЬКО сервер по подписанному webhook'у.
 * Промокодов здесь нет — коды дают доступ к платформе, не занятия.
 */

const T = {
  ru: {
    title: "Докупить занятия",
    subtitle: "Сверх месячного лимита. Купленное не сгорает — остаётся с тобой, пока не используешь.",
    unit: { practice_minutes: "мин практики", lesson: "уроков", exam: "Konuşma" },
    method: "Способ оплаты",
    methodKaspi: "Kaspi",
    methodKaspiNote: "Приложение Kaspi.kz · счёт в тенге",
    methodCard: "Банковская карта",
    methodCardNote: "Visa · Mastercard · счёт в долларах",
    pay: (p: string) => `Оплатить ${p}`,
    paying: "Открываем оплату…",
    payErr: "Не удалось открыть оплату — попробуй ещё раз.",
    payOff: "Оплата временно недоступна — попробуй чуть позже.",
    qrHint: "Отсканируй в приложении Kaspi:",
    validity: "не сгорает",
  },
  en: {
    title: "Top up",
    subtitle: "On top of your monthly limit. What you buy never expires — it stays until you use it.",
    unit: { practice_minutes: "min practice", lesson: "lessons", exam: "Konuşma" },
    method: "Payment method",
    methodKaspi: "Kaspi",
    methodKaspiNote: "Kaspi.kz app · billed in KZT",
    methodCard: "Bank card",
    methodCardNote: "Visa · Mastercard · billed in USD",
    pay: (p: string) => `Pay ${p}`,
    paying: "Opening checkout…",
    payErr: "Couldn't open checkout — please try again.",
    payOff: "Payments are temporarily unavailable — please try again later.",
    qrHint: "Scan in the Kaspi app:",
    validity: "never expires",
  },
  tr: {
    title: "Ek satın al",
    subtitle: "Aylık limitin üstüne. Satın aldığın hiç yanmaz — kullanana kadar seninle kalır.",
    unit: { practice_minutes: "dk pratik", lesson: "ders", exam: "Konuşma" },
    method: "Ödeme yöntemi",
    methodKaspi: "Kaspi",
    methodKaspiNote: "Kaspi.kz uygulaması · KZT olarak",
    methodCard: "Banka kartı",
    methodCardNote: "Visa · Mastercard · USD olarak",
    pay: (p: string) => `${p} öde`,
    paying: "Ödeme açılıyor…",
    payErr: "Ödeme açılamadı — lütfen tekrar dene.",
    payOff: "Ödeme geçici olarak kullanılamıyor — daha sonra tekrar dene.",
    qrHint: "Kaspi uygulamasında tara:",
    validity: "süresiz",
  },
  kk: {
    title: "Қосымша сатып алу",
    subtitle: "Айлық лимиттен тыс. Сатып алғаның жанбайды — қолданғанша сенде қалады.",
    unit: { practice_minutes: "мин практика", lesson: "сабақ", exam: "Konuşma" },
    method: "Төлем тәсілі",
    methodKaspi: "Kaspi",
    methodKaspiNote: "Kaspi.kz қосымшасы · теңгемен",
    methodCard: "Банк картасы",
    methodCardNote: "Visa · Mastercard · доллармен",
    pay: (p: string) => `${p} төлеу`,
    paying: "Төлем ашылуда…",
    payErr: "Төлемді ашу мүмкін болмады — қайталап көр.",
    payOff: "Төлем уақытша қолжетімсіз — сәлден соң қайталап көр.",
    qrHint: "Kaspi қосымшасында сканерле:",
    validity: "жанбайды",
  },
};

type MethodId = "kaspi" | "card";
const METHOD_CURRENCY: Record<MethodId, Currency> = { kaspi: "kzt", card: "usd" };

export function VoicePackModal({ onClose }: { onClose: () => void }) {
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [method, setMethod] = useState<MethodId>(currencyFor(locale) === "kzt" ? "kaspi" : "card");
  const currency = METHOD_CURRENCY[method];
  const [pack, setPack] = useState<VoicePackId>("pp60");
  const [payState, setPayState] = useState<"idle" | "busy" | "off" | "error">("idle");
  const [qr, setQr] = useState<string | null>(null);

  const price = VOICE_PACKS[currency][pack].price;
  const priceLabel = fmtMoney(currency, price);

  async function payNow() {
    if (payState === "busy") return;
    setPayState("busy");
    setQr(null);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pack, currency }),
      });
      const d = (await res.json()) as
        | { ok: true; kind: "redirect"; url: string }
        | { ok: true; kind: "qr"; qrPayload: string }
        | { ok: false; reason: string };
      if (d.ok && d.kind === "redirect") {
        window.location.href = d.url;
        return;
      }
      if (d.ok && d.kind === "qr") {
        setQr(d.qrPayload);
        setPayState("idle");
        return;
      }
      const off = !d.ok && (d.reason === "payments_off" || d.reason === "not_configured" || d.reason === "migration_missing");
      console.info("[voice-pack checkout]", !d.ok ? d.reason : "");
      setPayState(off ? "off" : "error");
    } catch {
      setPayState("error");
    }
  }

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
          <h2 className="text-lg font-bold tracking-tight text-[var(--color-foreground)]">🎙️ {c.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-black/[0.05]"
          >
            ✕
          </button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{c.subtitle}</p>

        {/* выбор докупки: три вида по два размера */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {VOICE_PACK_IDS.map((id) => {
            const p = VOICE_PACKS[currency][id];
            const active = pack === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPack(id)}
                aria-pressed={active}
                className={`flex flex-col items-center gap-1 rounded-2xl border p-3.5 transition-all ${
                  active
                    ? "border-[var(--color-brand)] bg-[var(--color-brand)]/[0.06] ring-2 ring-[var(--color-brand)]/25"
                    : "border-black/[0.08] bg-black/[0.02] hover:border-black/[0.16]"
                }`}
              >
                <span className="text-lg font-bold text-[var(--color-foreground)]">+{p.units}</span>
                <span className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">{c.unit[p.kind]}</span>
                <span className="mt-1 text-sm font-semibold text-[var(--color-brand)]">{fmtMoney(currency, p.price)}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[11px] text-[var(--color-muted)]">♾️ {c.validity}</p>

        {/* способ оплаты */}
        <div className="mt-4">
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
            <div className="mt-2 break-all font-mono text-xs text-[var(--color-foreground)]">{qr}</div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
