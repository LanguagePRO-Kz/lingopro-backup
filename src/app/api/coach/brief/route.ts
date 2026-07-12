import { NextResponse } from "next/server";
import { callAI, isConfigured, type FeedbackLang } from "@/lib/ai";
import { consumeQuota } from "@/lib/ai/quota";
import { buildAhuContext, buildAhuSystem, buildSnapshot, coachFallbackText, decide } from "@/lib/coach";
import { matchesFeedbackLang } from "@/lib/coach/persona";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Проактивный бриф Ahu (канал 1 единого агента, DESIGN-COACH §4).
 * Ядро (snapshot → states → decide) пересчитывается КАЖДЫЙ запрос — это
 * бесплатно; AI-вызов только когда на сегодня нет заметки этого состояния
 * и языка. Дедуп — уникальный индекс coach_messages_proactive_uniq
 * (user, meta->>day_key): гонка двух вкладок даёт одну строку. Жёсткий
 * потолок 2 AI-вызова/день — существующая квота `motivator`. Любой отказ
 * (нет ключей/квоты/admin) → честный детерминированный шаблон, НЕ пустота;
 * шаблоны в БД не сохраняются (ожившее AI должно смочь записать заметку).
 */

export const runtime = "nodejs";

const LANGS: FeedbackLang[] = ["ru", "en", "tr", "kk"];

type ProactiveMeta = {
  day_key?: string;
  lang?: string;
  state?: string;
  action?: string;
  action_topic?: string | null;
  focus_topics?: string[];
  replan_hint?: boolean;
};

export async function POST(req: Request) {
  if (!checkRateLimit(`coach-brief:${clientKey(req)}`, 6, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { feedbackLang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const lang: FeedbackLang = LANGS.includes(body.feedbackLang as FeedbackLang)
    ? (body.feedbackLang as FeedbackLang)
    : "en";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  const snapshot = await buildSnapshot(supabase, user.id, { kkNative: lang === "kk" });
  const decision = decide(snapshot);

  const respond = (text: string, source: "ai" | "cached" | "template") =>
    NextResponse.json({
      text,
      source,
      state: decision.state.id,
      action: decision.action,
      actionTopic: decision.actionTopic,
      focusTopics: decision.focusTopics,
      replanHint: decision.replanHint,
    });
  const template = () => respond(coachFallbackText(snapshot, decision, lang), "template");

  // сегодняшние заметки (любое состояние дня) — свежие первыми
  const admin = createAdminClient();
  let todays: { content: string; meta: ProactiveMeta }[] = [];
  if (admin) {
    const { data, error } = await admin
      .from("coach_messages")
      .select("content, meta")
      .eq("user_id", user.id)
      .eq("channel", "proactive")
      .like("meta->>day_key", `${snapshot.today}#%`)
      .order("created_at", { ascending: false });
    if (error) console.error("[coach] brief lookup failed:", error.message);
    todays = (data as { content: string; meta: ProactiveMeta }[] | null) ?? [];
  }

  const exact = todays.find((r) => r.meta?.day_key === decision.dayKey && r.meta?.lang === lang);
  if (exact) return respond(exact.content, "cached");

  // без admin дедуп/персист невозможны — честный шаблон вместо бесконтрольных AI-вызовов
  if (!admin || !isConfigured("motivator_note", lang)) return template();

  const quota = await consumeQuota("motivator");
  if (!quota.ok) {
    // потолок дня исчерпан: лучшая честная заметка — сегодняшняя на нужном
    // языке (пусть и от прежнего состояния), иначе шаблон
    const sameLang = todays.find((r) => r.meta?.lang === lang);
    return sameLang ? respond(sameLang.content, "cached") : template();
  }

  const system = `${buildAhuSystem({ channel: "proactive", lang, gender: snapshot.gender })}

--- ÖĞRENCİNİN GERÇEK VERİLERİ ---
${buildAhuContext(snapshot, decision, "proactive")}`;

  const LANG_TR: Record<FeedbackLang, string> = { ru: "RUSÇA", en: "İNGİLİZCE", tr: "TÜRKÇE", kk: "KAZAKÇA" };
  const ask = (content: string) =>
    callAI({
      task: "motivator_note",
      feedbackLang: lang,
      system,
      messages: [{ role: "user", content }],
      // deepseek-v4-pro рассуждает до ответа — меньший бюджет съедается целиком
      maxTokens: 700,
    });
  let result = await ask("Bugünkü notunu yaz.");
  let text = result?.text?.trim();
  // живые прогоны: DeepSeek изредка отвечает целиком по-турецки при ru/kk —
  // один жёсткий ретрай, дальше честный шаблон (не турецкий текст студенту)
  if (text && !matchesFeedbackLang(text, lang)) {
    result = await ask(`Bugünkü notunu yaz. ÇOK ÖNEMLİ: notun TAMAMI ${LANG_TR[lang]} dilinde olmalı (Türkçe sadece örnek/alıntı olarak kalabilir).`);
    text = result?.text?.trim();
    if (text && !matchesFeedbackLang(text, lang)) text = undefined;
  }
  if (!text) return template();

  const meta: ProactiveMeta & Record<string, unknown> = {
    day_key: decision.dayKey,
    lang,
    state: decision.state.id,
    action: decision.action,
    action_topic: decision.actionTopic,
    focus_topics: decision.focusTopics,
    replan_hint: decision.replanHint,
  };
  const { error: insErr } = await admin.from("coach_messages").insert({
    user_id: user.id,
    channel: "proactive",
    role: "ahu",
    content: text,
    meta,
  });
  if (insErr) {
    if (insErr.code === "23505") {
      // гонка (две вкладки) или смена языка в течение дня: строка этого
      // day_key уже существует — обновляем содержимое, а не плодим строки
      await admin
        .from("coach_messages")
        .update({ content: text, meta })
        .eq("user_id", user.id)
        .eq("channel", "proactive")
        .eq("meta->>day_key", decision.dayKey);
    } else {
      console.error("[coach] brief persist failed:", insErr.message);
    }
  }
  return respond(text, "ai");
}
