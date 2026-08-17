/**
 * POST /api/payments/checkout — создать оплату пакета.
 * Тело: { packageId: "1m"|"3m"|"6m", currency: "kzt"|"usd" }.
 *
 * Сервер НЕ доверяет клиентской сумме: цена считается здесь из lib/pricing
 * (база или −30% после диагностики; сохранённый частичный промокод — если
 * он даёт больше). Провайдер выбирается по валюте рынка: KZT → Kaspi,
 * USD → Dodo. При выключенном провайдере — честное { reason: "payments_off" }.
 */

import { NextResponse } from "next/server";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { providerForMarket, type PayCurrency } from "@/lib/payments";
import { DAYS, type PackageId } from "@/lib/billing";
import { planRow, VOICE_PACKS, VOICE_PACK_IDS, type VoicePackId } from "@/lib/pricing";

const PKG_IDS: PackageId[] = ["1m", "3m", "6m"];

/** Цена в минорных единицах с учётом лучшей доступной скидки. */
function priceMinor(cur: PayCurrency, pkg: PackageId, discountPercent: number): number {
  const row = planRow(cur, pkg);
  // 30% — фиксированные «психологические» цены основателя, не расчёт
  if (discountPercent === 30) return Math.round(row.disc * 100);
  if (discountPercent > 0) return Math.round(row.price * (1 - discountPercent / 100) * 100);
  return Math.round(row.price * 100);
}

export async function POST(req: Request) {
  // спам-гвард: pending-строки журнала не должны плодиться бесконтрольно
  if (!checkRateLimit(`checkout:${clientKey(req)}`, 6, 60_000)) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, reason: "unauthenticated" }, { status: 401 });

  let body: { packageId?: string; currency?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }
  const packageId = PKG_IDS.find((p) => p === body.packageId);
  const voicePackId = VOICE_PACK_IDS.find((p) => p === body.packageId);
  const currency: PayCurrency | null = body.currency === "kzt" || body.currency === "usd" ? body.currency : null;
  if ((!packageId && !voicePackId) || !currency) {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const provider = providerForMarket(currency);
  if (provider.mode() === "off") {
    // заглушка: оплата ещё не открыта — модалка покажет промокод-путь
    return NextResponse.json({ ok: false, reason: "payments_off" });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });

  /* --------------------- скидка (считает сервер) --------------------- */
  // пакеты минут — расходник, скидки не применяются
  let discount = 0;
  if (packageId) {
    const { data: prof } = await admin
      .from("profiles")
      .select("quiz_result, diagnostic_completed_at")
      .eq("id", user.id)
      .maybeSingle();
    if (prof?.quiz_result || prof?.diagnostic_completed_at) discount = 30; // скидка за диагностику

    // сохранённый частичный промокод (redeem_promo < 100%) — если выгоднее
    try {
      const { data: reds } = await admin
        .from("promo_redemptions")
        .select("promo_codes(discount_percent)")
        .eq("user_id", user.id);
      for (const r of reds ?? []) {
        const pc = (r as { promo_codes?: { discount_percent?: number } | { discount_percent?: number }[] }).promo_codes;
        const d = Array.isArray(pc) ? pc[0]?.discount_percent : pc?.discount_percent;
        if (typeof d === "number" && d > discount && d < 100) discount = d;
      }
    } catch {
      /* нет таблицы/строк — остаёмся на скидке за диагностику */
    }
  }

  const itemId: PackageId | VoicePackId = packageId ?? (voicePackId as VoicePackId);
  const amountMinor = packageId
    ? priceMinor(currency, packageId, discount)
    : Math.round(VOICE_PACKS[currency][voicePackId as VoicePackId].price * 100);

  /* ------------------ платёж (pending) до провайдера ------------------ */
  const { data: created, error: insErr } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      provider: provider.id,
      package_id: itemId,
      currency,
      amount_minor: amountMinor,
      discount_percent: discount,
      status: "pending",
    })
    .select("id")
    .single();
  if (insErr || !created) {
    // нет таблицы (0007) или constraint не знает пакеты минут (0009) —
    // говорим об этом прямо, покупка честно недоступна до миграции
    console.error("[payments] insert failed:", insErr?.message);
    return NextResponse.json({ ok: false, reason: "migration_missing" }, { status: 503 });
  }

  const origin = new URL(req.url).origin;
  const description = packageId
    ? `LingoPRO · пакет ${packageId} · ${DAYS[packageId]} дней доступа`
    : (() => {
        const p = VOICE_PACKS[currency][voicePackId as VoicePackId];
        const what = p.kind === "practice_minutes" ? "мин практики" : p.kind === "lesson" ? "уроков" : "пробных Konuşma";
        return `LingoPRO · докупка · +${p.units} ${what}`;
      })();
  const session = await provider.createCheckout({
    userId: user.id,
    packageId: itemId,
    currency,
    amountMinor,
    discountPercent: discount,
    paymentId: created.id,
    description,
    returnUrl: `${origin}/payment/return?pid=${created.id}`,
    customerEmail: user.email ?? null,
  });

  if (!session.ok) {
    await admin.from("payments").update({ status: "failed", raw: { reason: session.reason, detail: session.detail } }).eq("id", created.id);
    const status = session.reason === "off" ? 200 : session.reason === "not_configured" ? 503 : 502;
    return NextResponse.json({ ok: false, reason: session.reason === "off" ? "payments_off" : session.reason }, { status });
  }

  if (session.providerPaymentId) {
    await admin.from("payments").update({ provider_payment_id: session.providerPaymentId }).eq("id", created.id);
  }

  return NextResponse.json(
    session.kind === "redirect"
      ? { ok: true, kind: "redirect", url: session.url, paymentId: created.id }
      : { ok: true, kind: "qr", qrPayload: session.qrPayload, paymentId: created.id },
  );
}
