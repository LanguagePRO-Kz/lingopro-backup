import { NextResponse } from "next/server";
import { requireActivePlan } from "@/lib/access";
import { callAI, isConfigured, type FeedbackLang } from "@/lib/ai";
import type { ChatMessage } from "@/lib/ai/client";
import { consumeQuota } from "@/lib/ai/quota";
import { buildAhuContext, buildAhuSystem, buildSnapshot, decide } from "@/lib/coach";
import { validateAhuFacts } from "@/lib/coach/validate";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Чат с Ahu (канал 2 единого агента, DESIGN-COACH §5) — эволюция /api/ai/tutor.
 * Историей владеет СЕРВЕР: клиент шлёт только новое сообщение, последние 12
 * реплик поднимаются из coach_messages (переживают перезагрузку и смену
 * устройства), контекст ядра даёт Ahu память о плане/ошибках/уроках.
 * Вопрос студента пишется его сессией (RLS «student writes own chat»),
 * ответ Ahu — service-ролью. Квота — существующая `tutor` (30/день).
 */

export const runtime = "nodejs";

const LANGS: FeedbackLang[] = ["ru", "en", "tr", "kk"];
const MAX_MESSAGE_CHARS = 2000;
const HISTORY_LIMIT = 12;

export async function POST(req: Request) {
  if (!checkRateLimit(`coach-chat:${clientKey(req)}`, 20, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { feedbackLang?: string; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_CHARS) : "";
  if (!message) return NextResponse.json({ error: "empty_message" }, { status: 400 });
  const lang: FeedbackLang = LANGS.includes(body.feedbackLang as FeedbackLang)
    ? (body.feedbackLang as FeedbackLang)
    : "en";

  if (!isConfigured("tutor_chat", lang)) {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  // платная фича: подписка ДО квоты — бесплатный не жжёт лимиты (P0-2)
  const access = await requireActivePlan();
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: access.status });

  // квота ДО любых вставок: отбитый лимитом вопрос не должен осесть в истории
  const quota = await consumeQuota("tutor");
  if (!quota.ok) {
    return NextResponse.json({ error: quota.reason }, { status: quota.status });
  }

  const supabase = await createClient();
  const [snapshot, historyRes] = await Promise.all([
    buildSnapshot(supabase, quota.userId, { kkNative: lang === "kk" }),
    supabase
      .from("coach_messages")
      .select("role, content")
      .eq("user_id", quota.userId)
      .eq("channel", "chat")
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT),
  ]);

  // вопрос — сессией студента (история переживает перезагрузку); сбой записи
  // не блокирует ответ, но честно логируется
  const { error: studentErr } = await supabase
    .from("coach_messages")
    .insert({ user_id: quota.userId, channel: "chat", role: "student", content: message });
  if (studentErr) console.error("[coach] chat student persist failed:", studentErr.message);

  // история asc; соседние реплики одной роли склеиваются (API требует
  // чередования — логика перенесена со старой tutor-страницы на сервер)
  const rows = ((historyRes.data as { role: string; content: string }[] | null) ?? []).reverse();
  const messages: ChatMessage[] = [];
  for (const r of rows) {
    const role = r.role === "ahu" ? ("assistant" as const) : ("user" as const);
    const last = messages[messages.length - 1];
    if (last && last.role === role) last.content += "\n\n" + r.content;
    else messages.push({ role, content: r.content });
  }
  // диалог обязан начинаться с хода студента
  while (messages.length && messages[0].role !== "user") messages.shift();
  const tail = messages[messages.length - 1];
  if (tail && tail.role === "user") tail.content += "\n\n" + message;
  else messages.push({ role: "user", content: message });

  const decision = decide(snapshot);
  const contextStr = buildAhuContext(snapshot, decision, "chat");
  const system = `${buildAhuSystem({ channel: "chat", lang, gender: snapshot.gender, level: snapshot.level })}

--- ÖĞRENCİNİN GERÇEK VERİLERİ ---
${contextStr}`;

  const result = await callAI({ task: "tutor_chat", feedbackLang: lang, system, messages, maxTokens: 1200 });
  if (!result?.text) {
    // вопрос уже в истории — честно; клиент покажет ошибку и предложит повтор
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }
  const text = result.text.trim();

  // валидатор фактов (8.4) и на чат-канале: числа диалога легальны (студент
  // сам их называет) — «белый список» = контекст + вся переписка запроса
  const dialogNumbers = messages.map((m) => m.content).join("\n");
  const facts = validateAhuFacts({ text, contextStr: `${contextStr}\n${dialogNumbers}`, snapshot, decision });
  if (!facts.ok) {
    console.error(`[coach] chat failed fact-check (${facts.reason})`, quota.userId);
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  const admin = createAdminClient();
  if (admin) {
    const { error: ahuErr } = await admin
      .from("coach_messages")
      .insert({ user_id: quota.userId, channel: "chat", role: "ahu", content: text });
    if (ahuErr) console.error("[coach] chat ahu persist failed:", ahuErr.message);
  } else {
    console.error("[coach] chat: no service key — ответ Ahu не сохранён в историю");
  }

  return NextResponse.json({
    text,
    meta: {
      provider: result.provider,
      model: result.model,
      usedToday: quota.usedToday,
      usedMonth: quota.usedMonth,
    },
  });
}
