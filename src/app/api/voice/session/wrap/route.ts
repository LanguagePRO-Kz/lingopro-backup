import { NextResponse } from "next/server";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Stamps the moment the student pressed "end lesson" (with or without the
 * oral wrap-up). The settle route bills only up to this stamp, so the
 * teacher's closing summary — and any disconnect lag — is free. RLS lets a
 * student stamp only their own (user_id, conversation_id); the first press
 * wins via the primary key. Abuse (stamp early, keep talking) is voided
 * server-side by the grace-window check in /api/voice/session/end.
 */
export async function POST(req: Request) {
  if (!checkRateLimit(`voice-wrap:${clientKey(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { conversationId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
  if (!/^[A-Za-z0-9_]+$/.test(conversationId)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  // RLS-scoped insert; a duplicate press hits the PK and keeps the first stamp
  const { error } = await supabase
    .from("voice_wrap_marks")
    .insert({ user_id: user.id, conversation_id: conversationId });
  if (error && error.code !== "23505") {
    console.error("[voice] wrap stamp failed:", error.message);
    return NextResponse.json({ error: "stamp_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
