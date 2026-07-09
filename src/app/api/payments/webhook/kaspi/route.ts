/**
 * POST /api/payments/webhook/kaspi — callback Kaspi «оплачено/ошибка».
 * URL для кабинета/договора Kaspi: https://<домен>/api/payments/webhook/kaspi
 *
 * Подпись проверяется в kaspiProvider.verifyAndParseWebhook (HMAC, секрет
 * KASPI_WEBHOOK_SECRET) — событие без валидной подписи доступ НЕ открывает.
 */

import { NextResponse } from "next/server";
import { kaspiProvider } from "@/lib/payments/kaspi";
import { applyWebhookEvent } from "@/lib/payments/grant";

export async function POST(req: Request) {
  const raw = await req.text();
  const event = await kaspiProvider.verifyAndParseWebhook(raw, req.headers);
  const { status, body } = await applyWebhookEvent("kaspi", event);
  return NextResponse.json(body, { status });
}
