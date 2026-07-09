"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { savePlan, type PackageId } from "@/lib/billing";
import { saveProfilePlan } from "@/lib/profile";
import { redeemPromo, type PromoReason } from "@/lib/promo";
import { currencyFor } from "@/lib/pricing";

/**
 * Honest early-access modal. Real card payments open at launch (Kaspi keys
 * pending) — until then the only way in is a real, DB-tracked access code
 * (e.g. LINGOPRO100 → 100%). No fake card form, no unbacked refund promise:
 * we grant dashboard access ONLY on a genuine 100% redemption via
 * redeem_promo(). Anything less is honest about "payment opens at launch".
 */

const T = {
  ru: {
    title: "Ранний доступ",
    body: "Оплата откроется при запуске платформы. Сейчас доступ открывается по коду раннего доступа.",
    launch: "Цена при запуске:",
    codePlaceholder: "Код доступа",
    activate: "Активировать доступ",
    checking: "Проверяем…",
    granted: "Готово! Открываем доступ…",
    savedDiscount: (n: number) => `Скидка ${n}% сохранена — спишется при запуске оплаты.`,
    noCode: "Кода нет? Доступ открываем волнами — напиши нам, добавим тебя в очередь.",
    bodyLive: "Оплати картой — доступ откроется сразу после подтверждения. Или введи код доступа.",
    pay: "Оплатить картой",
    paying: "Открываем оплату…",
    payErr: "Не удалось открыть оплату — попробуй ещё раз.",
    orCode: "или по коду доступа",
    qrHint: "Отсканируй в приложении Kaspi:",
    reasons: {
      not_found: "Код не найден",
      expired: "Срок действия кода истёк",
      exhausted: "Лимит кода исчерпан",
      wrong_package: "Код не подходит к этому пакету",
      not_first_purchase: "Код только для первого доступа",
      unauthenticated: "Войди, чтобы активировать код",
      error: "Не удалось проверить код — попробуй ещё раз",
    } as Record<PromoReason | "error", string>,
  },
  en: {
    title: "Early access",
    body: "Card payments open at launch. For now, access is granted with an early-access code.",
    launch: "Price at launch:",
    codePlaceholder: "Access code",
    activate: "Activate access",
    checking: "Checking…",
    granted: "Done! Opening your access…",
    savedDiscount: (n: number) => `${n}% discount saved — applied when payments launch.`,
    noCode: "No code? We open access in waves — message us to join the queue.",
    bodyLive: "Pay by card — access opens right after confirmation. Or enter an access code.",
    pay: "Pay by card",
    paying: "Opening checkout…",
    payErr: "Couldn't open checkout — please try again.",
    orCode: "or with an access code",
    qrHint: "Scan in the Kaspi app:",
    reasons: {
      not_found: "Code not found",
      expired: "This code has expired",
      exhausted: "This code has reached its limit",
      wrong_package: "This code doesn't apply to this package",
      not_first_purchase: "This code is for first access only",
      unauthenticated: "Sign in to activate the code",
      error: "Couldn't verify the code — try again",
    } as Record<PromoReason | "error", string>,
  },
  tr: {
    title: "Erken erişim",
    body: "Kart ödemeleri lansmanda açılacak. Şimdilik erişim, erken erişim koduyla veriliyor.",
    launch: "Lansman fiyatı:",
    codePlaceholder: "Erişim kodu",
    activate: "Erişimi etkinleştir",
    checking: "Kontrol ediliyor…",
    granted: "Hazır! Erişimin açılıyor…",
    savedDiscount: (n: number) => `%${n} indirim kaydedildi — ödeme başladığında uygulanacak.`,
    noCode: "Kodun yok mu? Erişimi dalgalar hâlinde açıyoruz — yazarsan sıraya ekleriz.",
    bodyLive: "Kartla öde — onaydan hemen sonra erişim açılır. Ya da erişim kodu gir.",
    pay: "Kartla öde",
    paying: "Ödeme açılıyor…",
    payErr: "Ödeme açılamadı — lütfen tekrar dene.",
    orCode: "veya erişim koduyla",
    qrHint: "Kaspi uygulamasında tara:",
    reasons: {
      not_found: "Kod bulunamadı",
      expired: "Bu kodun süresi dolmuş",
      exhausted: "Bu kod limitine ulaştı",
      wrong_package: "Bu kod bu pakete uygun değil",
      not_first_purchase: "Bu kod yalnızca ilk erişim için",
      unauthenticated: "Kodu etkinleştirmek için giriş yap",
      error: "Kod doğrulanamadı — tekrar dene",
    } as Record<PromoReason | "error", string>,
  },
  kk: {
    title: "Ерте қолжетімділік",
    body: "Карта төлемдері іске қосылғанда ашылады. Әзірге қолжетімділік ерте қолжетімділік кодымен беріледі.",
    launch: "Іске қосылғандағы баға:",
    codePlaceholder: "Қолжетімділік коды",
    activate: "Қолжетімділікті ашу",
    checking: "Тексерудеміз…",
    granted: "Дайын! Қолжетімділік ашылуда…",
    savedDiscount: (n: number) => `${n}% жеңілдік сақталды — төлем ашылғанда есептеледі.`,
    noCode: "Код жоқ па? Қолжетімділікті толқынмен ашамыз — жазсаң, кезекке қосамыз.",
    bodyLive: "Картамен төле — растаудан кейін бірден қолжетімділік ашылады. Немесе код енгіз.",
    pay: "Картамен төлеу",
    paying: "Төлем ашылуда…",
    payErr: "Төлемді ашу мүмкін болмады — қайталап көр.",
    orCode: "немесе қолжетімділік кодымен",
    qrHint: "Kaspi қосымшасында сканерле:",
    reasons: {
      not_found: "Код табылмады",
      expired: "Кодтың мерзімі өтіп кеткен",
      exhausted: "Кодтың лимиті таусылды",
      wrong_package: "Бұл код бұл пакетке келмейді",
      not_first_purchase: "Бұл код тек алғашқы қолжетімділік үшін",
      unauthenticated: "Кодты ашу үшін кір",
      error: "Кодты тексеру мүмкін болмады — қайталап көр",
    } as Record<PromoReason | "error", string>,
  },
};

type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "granted" }
  | { kind: "saved"; discount: number }
  | { kind: "error"; msg: string };

export function EarlyAccessModal({
  pkgId,
  planName,
  launchPrice,
  onClose,
}: {
  pkgId: PackageId;
  planName: string;
  launchPrice: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  /* --------------- платёжный слот (Kaspi KZT / Dodo USD) --------------- */
  // Кнопка оплаты появляется сама, когда провайдер рынка включён env'ом
  // (KASPI_MODE/DODO_MODE ≠ off) — активация без правок кода.
  const currency = currencyFor(locale);
  const [payOn, setPayOn] = useState(false);
  const [payState, setPayState] = useState<"idle" | "busy" | "error">("idle");
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/payments/status?currency=${currency}`)
      .then((r) => r.json())
      .then((d: { ok?: boolean; mode?: string }) => setPayOn(!!d.ok && d.mode !== "off"))
      .catch(() => setPayOn(false));
  }, [currency]);

  async function payByCard() {
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
        window.location.href = d.url;
        return;
      }
      if (d.ok && d.kind === "qr") {
        setQr(d.qrPayload);
        setPayState("idle");
        return;
      }
      console.info("[payments] checkout unavailable:", !d.ok ? d.reason : "");
      setPayState("error");
    } catch {
      setPayState("error");
    }
  }

  async function activate() {
    const trimmed = code.trim();
    if (!trimmed || status.kind === "checking") return;
    setStatus({ kind: "checking" });

    const res = await redeemPromo(trimmed, pkgId);
    if (!res.ok) {
      setStatus({ kind: "error", msg: c.reasons[res.reason] });
      return;
    }
    // Grant access only on a genuine full (100%) redemption, or when the user
    // had already redeemed this code before. Partial codes just save a note —
    // real payment isn't wired yet, so we never fake a paid entry.
    if (res.discountPercent === 100 || res.alreadyRedeemed) {
      setStatus({ kind: "granted" });
      savePlan(pkgId);
      await saveProfilePlan(pkgId);
      router.push("/dashboard");
      return;
    }
    setStatus({ kind: "saved", discount: res.discountPercent });
  }

  const busy = status.kind === "checking" || status.kind === "granted";

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
            {c.title} · {planName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-black/[0.05]"
          >
            ✕
          </button>
        </div>

        {/* honest framing: пока оплата выключена — «откроется при запуске» */}
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{payOn ? c.bodyLive : c.body}</p>

        <div className="mt-4 flex items-baseline justify-between rounded-2xl border border-black/[0.07] bg-black/[0.02] px-4 py-3">
          <span className="text-xs text-[var(--color-muted)]">{c.launch}</span>
          <span className="text-lg font-bold text-[var(--color-foreground)]">{launchPrice}</span>
        </div>

        {/* оплата картой — рендерится только при включённом провайдере */}
        {payOn && (
          <div className="mt-4">
            <button
              type="button"
              onClick={payByCard}
              disabled={payState === "busy"}
              className="btn-primary w-full rounded-full px-6 py-4 text-base font-semibold disabled:opacity-50"
            >
              {payState === "busy" ? c.paying : `${c.pay} · ${launchPrice}`}
            </button>
            {payState === "error" && (
              <div className="mt-2 text-xs font-medium text-[#dc2626]">❌ {c.payErr}</div>
            )}
            {qr && (
              <div className="mt-3 rounded-2xl border border-black/[0.07] bg-black/[0.02] p-4 text-center">
                <div className="text-xs text-[var(--color-muted)]">{c.qrHint}</div>
                {/* TODO(kaspi): если банк даст QR-сценарий — подключить рендер
                    QR-кода из qrPayload (одна маленькая либа, слот готов) */}
                <div className="mt-2 break-all font-mono text-xs text-[var(--color-foreground)]">{qr}</div>
              </div>
            )}
            <div className="my-4 flex items-center gap-3 text-[11px] text-[var(--color-muted)]">
              <span className="h-px flex-1 bg-black/[0.08]" /> {c.orCode} <span className="h-px flex-1 bg-black/[0.08]" />
            </div>
          </div>
        )}

        {/* access code */}
        <div className="mt-5">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (status.kind === "error") setStatus({ kind: "idle" });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") activate();
              }}
              placeholder={c.codePlaceholder}
              autoCapitalize="characters"
              className={`flex-1 rounded-xl border bg-white px-4 py-2.5 text-sm uppercase tracking-wider outline-none transition-all ${
                status.kind === "error"
                  ? "border-[#dc2626] ring-2 ring-[#dc2626]/20"
                  : "border-black/[0.1] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
              }`}
            />
          </div>
          {status.kind === "error" && (
            <div className="mt-2 text-xs font-medium text-[#dc2626]">❌ {status.msg}</div>
          )}
          {status.kind === "granted" && (
            <div className="mt-2 text-xs font-medium text-[#16a34a]">✅ {c.granted}</div>
          )}
          {status.kind === "saved" && (
            <div className="mt-2 text-xs font-medium text-[#16a34a]">✅ {c.savedDiscount(status.discount)}</div>
          )}
        </div>

        {/* activate */}
        <button
          type="button"
          onClick={activate}
          disabled={busy}
          className="btn-primary mt-4 w-full rounded-full px-6 py-4 text-base font-semibold disabled:opacity-50"
        >
          {status.kind === "checking" ? c.checking : status.kind === "granted" ? c.granted : c.activate}
        </button>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--color-muted)]">{c.noCode}</p>
      </motion.div>
    </motion.div>
  );
}
