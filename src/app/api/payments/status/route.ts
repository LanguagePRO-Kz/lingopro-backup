/**
 * GET /api/payments/status?currency=kzt|usd — доступность оплаты для рынка.
 * UI по этому ответу решает, показывать ли кнопку «Оплатить» (mode ≠ off).
 * Ключей и секретов в ответе нет — только провайдер и режим.
 */

import { NextResponse } from "next/server";
import { providerForMarket } from "@/lib/payments";

export async function GET(req: Request) {
  const cur = new URL(req.url).searchParams.get("currency");
  if (cur !== "kzt" && cur !== "usd") {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }
  const provider = providerForMarket(cur);
  return NextResponse.json({ ok: true, provider: provider.id, mode: provider.mode() });
}
