import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { maturePendingReport, type ConvSnapshot } from "@/lib/voice/report";

export const runtime = "nodejs";

/**
 * Post-call вебхук ElevenLabs (post_call_transcription): провайдер сам
 * присылает ГОТОВЫЙ транскрипт, когда запись финализирована — опрос из
 * settle-роута по определению гонка, вебхук закрывает её со стороны провайдера.
 *
 * Контракт узкий и безопасный: дозреваем ТОЛЬКО существующие строки
 * voice_sessions с report IS NULL. Если строки нет — сессия ещё не
 * рассчитана (/api/voice/session/end не вызывался), биллинг обязан пройти
 * клиентским путём; вебхук молча выходит, чтобы не подарить бесплатный урок.
 *
 * Подпись: заголовок `elevenlabs-signature` = "t=<unix>,v0=<hex>",
 * v0 = HMAC-SHA256(secret, "<t>.<raw body>"). Секрет — ELEVENLABS_WEBHOOK_SECRET
 * (выдаётся в кабинете ElevenLabs при создании вебхука).
 */

const SIGNATURE_TOLERANCE_SEC = 30 * 60;

function verifySignature(raw: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => [p.slice(0, p.indexOf("=")), p.slice(p.indexOf("=") + 1)]),
  ) as { t?: string; v0?: string };
  if (!parts.t || !parts.v0) return false;
  const ts = Number(parts.t);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > SIGNATURE_TOLERANCE_SEC) return false;
  const expected = createHmac("sha256", secret).update(`${parts.t}.${raw}`).digest("hex");
  const got = parts.v0.replace(/^sha256=/, "");
  if (expected.length !== got.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(got, "hex"));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "webhook_not_configured" }, { status: 501 });

  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("elevenlabs-signature"), secret)) {
    return NextResponse.json({ error: "bad_signature" }, { status: 401 });
  }

  let payload: { type?: string; data?: (ConvSnapshot & { conversation_id?: string }) | null };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad_payload" }, { status: 400 });
  }
  if (payload.type !== "post_call_transcription" || !payload.data) {
    return NextResponse.json({ ok: true, skipped: "not_transcription" });
  }

  const conv = payload.data;
  const conversationId = conv.conversation_id ?? "";
  if (!conversationId || conv.agent_id !== process.env.ELEVENLABS_AGENT_ID) {
    return NextResponse.json({ ok: true, skipped: "foreign_agent" });
  }
  // payload вебхука — уже финализированная запись; статус может отсутствовать
  // в теле, поэтому фиксируем терминальность явно
  conv.status = conv.status ?? "done";

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "server_not_configured" }, { status: 503 });

  const { data: session } = await admin
    .from("voice_sessions")
    .select("id, user_id, seconds, report")
    .eq("transcript->>conversation_id", conversationId)
    .maybeSingle();
  if (!session) return NextResponse.json({ ok: true, skipped: "no_session_yet" });
  if (session.report != null) return NextResponse.json({ ok: true, skipped: "already_reported" });

  const { data: genderRow } = await admin
    .from("profiles")
    .select("gender")
    .eq("id", session.user_id as string)
    .maybeSingle();

  const { state } = await maturePendingReport(admin, {
    sessionId: session.id as string,
    userId: session.user_id as string,
    conversationId,
    conv,
    gender: (genderRow?.gender as "female" | "male" | null) ?? null,
    minutes: Math.ceil(((session.seconds as number | null) ?? 0) / 60),
  });

  return NextResponse.json({ ok: true, reportState: state });
}
