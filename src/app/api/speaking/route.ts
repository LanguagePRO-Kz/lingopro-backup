import { NextResponse } from "next/server";
import { requireActivePlan } from "@/lib/access";
import { callAI, isConfigured, type ChatMessage } from "@/lib/ai";
import { consumeQuota } from "@/lib/ai/quota";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

type ChatMsg = { role: "user" | "assistant"; content: string };
type Kind = "chat" | "hint" | "summary";
type Mode = "free" | "tomer" | "pronunciation" | "roleplay";

const MODE_CTX: Record<Mode, string> = {
  free: "Serbest konuşma yap.",
  tomer: "TÖMER konuşma sınavı simülasyonu yap. Gerçek sınav soruları sor.",
  pronunciation: "Bir cümle söyle, öğrenci tekrar etsin. Telaffuzunu değerlendir.",
  roleplay: "Rol yapma oyunu. Sen bir restoran garsonu / doktor / kayıt memuru ol.",
};

const CHAT_SYSTEM = (mode: Mode) => `Sen deneyimli bir Türkçe dil öğretmenisin. Öğrenci TÖMER sınavına hazırlanıyor. Seviyesi: A2-B1.

Mod: ${MODE_CTX[mode]}

Kurallar:
1. Öğrencinin söylediği cümleyi analiz et.
2. Telaffuz veya gramer hatası varsa düzelt: "✏️ [yanlış] → [doğru] — [Rusça açıklama]".
3. Cevabını KISA tut (1-3 cümle Türkçe). Uzun konuşma yapma.
4. Konuşmayı devam ettirmek için bir soru sor.
5. Her 3-4 mesajda yeni bir kelime öğret: "📚 [kelime] — [перевод]".
6. Samimi ve destekleyici ol.
7. Düzeltmeleri ve açıklamaları Rusça yaz, diyalogu Türkçe sürdür.
8. Mümkün olduğunca doğru yaz: hiçbir dilbilgisi hatası, yazım hatası veya yanlış çekim olmasın. Göndermeden önce her cümleyi kontrol et. Türkçe: ünlü ve ünsüz uyumuna, doğru eklere dikkat et (ç, ş, ğ, ı, ö, ü harflerini doğru kullan). Rusça: doğru hâller, sayı uyumu ve noktalama. Öğrenci senden öğreniyor — örnek metnin kusursuz olmalı.

Yanıtını SADECE bu JSON formatında ver:
{"reply": "Türkçe cevap (sesli okunacak)", "correction": "düzeltme veya null", "newWord": "yeni kelime veya null", "note": "Rusça açıklama veya null"}`;

const QUALITY = "Mümkün olduğunca doğru yaz: dilbilgisi hatası, yazım hatası veya yanlış çekim olmasın; göndermeden önce her cümleyi kontrol et. Türkçe: ünlü/ünsüz uyumu ve doğru ekler (ç, ş, ğ, ı, ö, ü). Rusça: doğru hâller, sayı uyumu ve noktalama.";

const HINT_SYSTEM =
  "Sen bir Türkçe öğretmenisin. Öğrenciye şimdi ne söyleyebileceği hakkında KISA (1 cümle) Türkçe bir ipucu ver ve parantez içinde Rusça çevirisini ekle. Sadece ipucunu yaz. " +
  QUALITY;

const SUMMARY_SYSTEM =
  "Bu Türkçe konuşma dersinin özetini yap: konuşulan konu, yapılan hatalar, öğrenilen kelimeler ve genel seviye değerlendirmesi (A1-C1). Kısa ve net, Rusça yaz. " +
  QUALITY;

function chatFallback(messages: ChatMsg[]) {
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const ok = last.trim().split(/\s+/).filter(Boolean).length >= 6;
  return {
    reply: ok ? "Çok güzel söyledin! Peki, bana biraz daha anlatır mısın?" : "Güzel! Biraz daha uzun bir cümle kurmayı dene. Devam edelim?",
    correction: null as string | null,
    newWord: "📚 gerçekten — действительно",
    note: "ℹ️ AI офлайн: для реальных ответов нужен ANTHROPIC_API_KEY.",
  };
}

async function callSpeakingAI(system: string, messages: ChatMessage[]): Promise<string | null> {
  const result = await callAI({ task: "speaking_chat", system, messages, maxTokens: 1024 });
  return result?.text ?? null;
}

export async function POST(req: Request) {
  // throttle abusive / runaway clients (30 req/min per IP)
  if (!checkRateLimit(`speaking:${clientKey(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { messages?: ChatMsg[]; mode?: Mode; kind?: Kind };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const mode: Mode = body.mode ?? "free";
  const kind: Kind = body.kind ?? "chat";

  // платная фича: подписка ДО квоты (P0-2)
  const access = await requireActivePlan();
  if (!access.ok) return NextResponse.json({ error: access.reason }, { status: access.status });

  // session + server-side quota (30/day, 500/month — src/lib/ai/limits.ts)
  const quota = await consumeQuota("speaking");
  if (!quota.ok) {
    return NextResponse.json({ error: quota.reason }, { status: quota.status });
  }

  const configured = isConfigured("speaking_chat");

  // ---- hint / summary: plain text ----
  if (kind === "hint" || kind === "summary") {
    if (!configured) {
      const offline =
        kind === "hint"
          ? "Bugün hava nasıl? (Какая сегодня погода?)"
          : "Хорошая практика! Продолжай заниматься каждый день. (AI офлайн — нужен API-ключ.)";
      return NextResponse.json({ text: offline, offline: true });
    }
    const text = await callSpeakingAI(kind === "hint" ? HINT_SYSTEM : SUMMARY_SYSTEM, messages.length ? messages : [{ role: "user", content: "..." }]);
    return NextResponse.json({ text: text ?? "…" });
  }

  // ---- chat: JSON {reply, correction, newWord, note} ----
  if (!configured) return NextResponse.json({ ...chatFallback(messages), offline: true });

  const raw = await callSpeakingAI(CHAT_SYSTEM(mode), messages);
  if (!raw) return NextResponse.json({ ...chatFallback(messages), offline: true });

  try {
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : raw);
    return NextResponse.json({
      reply: parsed.reply ?? raw,
      correction: parsed.correction ?? null,
      newWord: parsed.newWord ?? null,
      note: parsed.note ?? null,
    });
  } catch {
    return NextResponse.json({ reply: raw, correction: null, newWord: null, note: null });
  }
}
