/**
 * POST /api/payments/webhook/dodo — webhook Dodo Payments.
 * URL для дашборда Dodo (Developer → Webhooks):
 *   https://<домен>/api/payments/webhook/dodo
 *
 * Подпись Standard Webhooks проверяется в dodoProvider.verifyAndParseWebhook
 * (секрет DODO_WEBHOOK_SECRET) — без неё событие доступ НЕ открывает.
 */

import { NextResponse } from "next/server";
import { dodoProvider } from "@/lib/payments/dodo";
import { applyWebhookEvent } from "@/lib/payments/grant";

export async function POST(req: Request) {
  const raw = await req.text();
  const event = await dodoProvider.verifyAndParseWebhook(raw, req.headers);
  const { status, body } = await applyWebhookEvent("dodo", event);
  return NextResponse.json(body, { status });
}
