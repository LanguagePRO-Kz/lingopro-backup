import { NextResponse } from "next/server";
import { requireActivePlan } from "@/lib/access";
import { callAI, isConfigured, type ChatMessage } from "@/lib/ai";
import { consumeQuota } from "@/lib/ai/quota";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Текстовая подсказка Ahu (одна фраза) — единственный оставшийся потребитель
 * этого роута: кнопка «спросить Ahu» на странице плана.
 *
 * Режимы чата и итога здесь жили ради push-to-talk (/dashboard/speaking/push).
 * Раздел убран 16.08.2026 как дубль голосовых разделов, вместе с ним ушли и
 * они: мёртвый обработчик, который никто не вызывает, всё равно тратит квоту
 * и деньги, если до него достучаться напрямую.
 */

type ChatMsg = { role: "user" | "assistant"; content: string };

const QUALITY =
  "Mümkün olduğunca doğru yaz: dilbilgisi hatası, yazım hatası veya yanlış çekim olmasın; göndermeden önce her cümleyi kontrol et. Türkçe: ünlü/ünsüz uyumu ve doğru ekler (ç, ş, ğ, ı, ö, ü). Rusça: doğru hâller, sayı uyumu ve noktalama.";

const HINT_SYSTEM =
  "Sen bir Türkçe öğretmenisin. Öğrenciye şimdi ne söyleyebileceği hakkında KISA (1 cümle) Türkçe bir ipucu ver ve parantez içinde Rusça çevirisini ekle. Sadece ipucunu yaz. " +
  QUALITY;

export async function POST(req: Request) {
  // throttle abusive / runaway clients (30 req/min per IP)
  if (!checkRateLimit(`speaking:${clientKey(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { messages?: ChatMsg[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const messages = Array.isArray(body.messages) ? body.messages : [];

  // платная фича: подписка ДО квоты (P0-2)
  const access = await requireActivePlan();
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: access.status });

  // session + server-side quota (30/day, 500/month — src/lib/ai/limits.ts)
  const quota = await consumeQuota("speaking");
  if (!quota.ok) {
    return NextResponse.json({ error: quota.reason }, { status: quota.status });
  }

  if (!isConfigured("speaking_chat")) {
    return NextResponse.json({ text: "Bugün hava nasıl? (Какая сегодня погода?)", offline: true });
  }

  const result = await callAI({
    task: "speaking_chat",
    system: HINT_SYSTEM,
    messages: (messages.length ? messages : [{ role: "user", content: "..." }]) as ChatMessage[],
    maxTokens: 1024,
  });
  return NextResponse.json({ text: result?.text ?? "…" });
}
