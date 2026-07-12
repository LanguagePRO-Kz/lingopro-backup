"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { createClient } from "@/lib/supabase/client";
import { SectionBack } from "@/components/SectionBack";
import { SectionHint } from "@/components/SectionHint";

// "lesson" — карточка голосового урока из coach_messages (voice_summary)
type Msg = { role: "ai" | "user" | "lesson"; text: string; minutes?: number };

/* ----------------------------- Web Speech API ----------------------------- */
type SRResult = { 0: { transcript: string }; isFinal: boolean };
type SREvent = { results: { length: number; [i: number]: SRResult } };
type SRInstance = {
  lang: string; continuous: boolean; interimResults: boolean;
  start: () => void; stop: () => void;
  onresult: ((e: SREvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type SRCtor = new () => SRInstance;

function getSR(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { webkitSpeechRecognition?: SRCtor; SpeechRecognition?: SRCtor };
  return w.webkitSpeechRecognition ?? w.SpeechRecognition ?? null;
}

const T = {
  ru: {
    online: "Онлайн",
    subtitle: "твой преподаватель",
    lesson: (n?: number) => `🎙 Голосовой урок${n ? ` · ${n} мин` : ""}`,
    greet2: "Привет! Я Ahu — твой преподаватель турецкого. Спроси про грамматику, слово, план подготовки — или пришли предложение на проверку. Я помню твой план, ошибки и наши уроки.",
    placeholder: "Напиши сообщение…",
    quick: ["Объясни грамматику", "Проверь предложение", "Подготовка к TÖMER", "Разговорная практика", "Переведи текст"],
    errGeneric: "Не получилось получить ответ — проверь соединение и попробуй ещё раз.",
    errDaily: "Дневной лимит вопросов исчерпан. Завтра лимит обновится.",
    errMonthly: "Месячный лимит вопросов исчерпан.",
    errUnavailable: "Ahu временно недоступна. Попробуй чуть позже.",
  },
  en: {
    online: "Online",
    subtitle: "your teacher",
    lesson: (n?: number) => `🎙 Voice lesson${n ? ` · ${n} min` : ""}`,
    greet2: "Hi! I'm Ahu — your Turkish teacher. Ask about grammar, a word, your prep plan — or send a sentence to check. I remember your plan, your mistakes and our lessons.",
    placeholder: "Type a message…",
    quick: ["Explain grammar", "Check a sentence", "TÖMER prep", "Speaking practice", "Translate text"],
    errGeneric: "Couldn't get a reply — check your connection and try again.",
    errDaily: "Today's question limit is used up. It resets tomorrow.",
    errMonthly: "This month's question limit is used up.",
    errUnavailable: "Ahu is temporarily unavailable. Try again shortly.",
  },
  tr: {
    online: "Çevrimiçi",
    subtitle: "öğretmenin",
    lesson: (n?: number) => `🎙 Sesli ders${n ? ` · ${n} dk` : ""}`,
    greet2: "Merhaba! Ben Ahu — Türkçe öğretmenin. Dil bilgisi, kelime, hazırlık planı sor — ya da kontrol için bir cümle gönder. Planını, hatalarını ve derslerimizi hatırlıyorum.",
    placeholder: "Bir mesaj yaz…",
    quick: ["Dil bilgisi açıkla", "Cümle kontrol et", "TÖMER hazırlık", "Konuşma pratiği", "Metin çevir"],
    errGeneric: "Cevap alınamadı — bağlantını kontrol edip tekrar dene.",
    errDaily: "Bugünkü soru limitin doldu. Yarın yenilenir.",
    errMonthly: "Bu ayki soru limitin doldu.",
    errUnavailable: "Ahu geçici olarak ulaşılamıyor. Az sonra tekrar dene.",
  },
  kk: {
    online: "Желіде",
    subtitle: "сенің ұстазың",
    lesson: (n?: number) => `🎙 Дауыстық сабақ${n ? ` · ${n} мин` : ""}`,
    greet2: "Сәлем! Мен Ahu — сенің түрік тілі ұстазыңмын. Грамматика, сөз, дайындық жоспары туралы сұра — немесе тексеруге сөйлем жібер. Жоспарыңды, қателеріңді және сабақтарымызды есімде сақтаймын.",
    placeholder: "Хабарлама жаз…",
    quick: ["Грамматиканы түсіндір", "Сөйлемді тексер", "TÖMER дайындық", "Сөйлеу практикасы", "Мәтінді аудар"],
    errGeneric: "Жауап алынбады — байланысты тексеріп, қайта көр.",
    errDaily: "Бүгінгі сұрақ лимиті таусылды. Ертең жаңарады.",
    errMonthly: "Осы айдағы сұрақ лимиті таусылды.",
    errUnavailable: "Ahu уақытша қолжетімсіз. Сәлден соң қайта көр.",
  },
};

export default function TutorPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [messages, setMessages] = useState<Msg[]>([{ role: "ai", text: c.greet2 }]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [micOk] = useState(() => getSR() !== null);
  const endRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<SRInstance | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  useEffect(() => () => recRef.current?.stop(), []);

  // Историей владеет СЕРВЕР (coach_messages, RLS read-own): переживает
  // перезагрузку и смену устройства. Голосовые уроки — карточками в ленте.
  // После загрузки подхватываем handoff-вопрос из блока Ahu на дашборде.
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !active) return;
        const { data } = await supabase
          .from("coach_messages")
          .select("channel, role, content, meta")
          .eq("user_id", user.id)
          .in("channel", ["chat", "voice_summary"])
          .order("created_at", { ascending: true })
          .limit(50);
        if (!active) return;
        const restored: Msg[] = [];
        for (const r of (data ?? []) as { channel: string; role: string; content: string; meta: { minutes?: number } | null }[]) {
          if (r.channel === "voice_summary") {
            restored.push({ role: "lesson", text: r.content, minutes: r.meta?.minutes });
          } else if (r.role === "student") {
            restored.push({ role: "user", text: r.content });
          } else {
            // ответ Ahu хранится целиком — на экране те же пузыри, что при отправке
            for (const part of r.content.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean).slice(0, 4)) {
              restored.push({ role: "ai", text: part });
            }
          }
        }
        if (restored.length) setMessages([{ role: "ai", text: c.greet2 }, ...restored]);
      } catch {
        /* история недоступна — чат работает с чистого листа */
      } finally {
        // handoff с дашборда: вопрос из блока «Ahu — твой преподаватель»
        try {
          const h = window.sessionStorage.getItem("lingopro:ahu:handoff");
          if (h && active) {
            window.sessionStorage.removeItem("lingopro:ahu:handoff");
            void ask(h);
          }
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleVoice() {
    if (recording) {
      recRef.current?.stop();
      return;
    }
    const SR = getSR();
    if (!SR) return;
    const r = new SR();
    // recognize in the INTERFACE language — a Russian question through a
    // tr-TR recognizer came out as noise (UX-audit #16)
    r.lang = { ru: "ru-RU", en: "en-US", tr: "tr-TR", kk: "kk-KZ" }[locale] ?? "tr-TR";
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      setInput((final + " " + interim).trim());
    };
    r.onend = () => setRecording(false);
    r.onerror = () => setRecording(false);
    recRef.current = r;
    r.start();
    setRecording(true);
  }

  const [thinking, setThinking] = useState(false);

  /** Safety net: the prompt forbids markdown, but models drift — render plain text only. */
  function deMarkdown(s: string): string {
    return s
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/__(.+?)__/g, "$1")
      .replace(/(^|\s)\*([^*\n]+)\*(?=\s|[.,!?]|$)/g, "$1$2")
      .replace(/(^|\s)_([^_\n]+)_(?=\s|[.,!?]|$)/g, "$1$2")
      .replace(/^[ \t]*[-*•]\s+/gm, "— ")
      .replace(/`([^`\n]+)`/g, "$1");
  }

  /** Единый агент: серверу нужен только НОВЫЙ вопрос — историю (последние 12
   * реплик) и контекст студента /api/coach/chat поднимает сам из БД. */
  async function ask(userText: string) {
    const text = userText.trim();
    if (!text || thinking) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setThinking(true);
    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackLang: locale, message: text }),
      });
      if (res.ok) {
        const data = (await res.json()) as { text?: string };
        // one reply → several short bubbles (blank-line separated), delivered
        // with a typing pause like a real teacher texting
        const parts = data.text
          ? deMarkdown(data.text).split(/\n{2,}/).map((t) => t.trim()).filter(Boolean).slice(0, 4)
          : [];
        if (parts.length === 0) {
          setMessages((m) => [...m, { role: "ai", text: c.errGeneric }]);
        }
        for (let i = 0; i < parts.length; i++) {
          if (i > 0) await new Promise((r) => setTimeout(r, 500 + Math.min(900, parts[i].length * 12)));
          const part = parts[i];
          setMessages((m) => [...m, { role: "ai", text: part }]);
        }
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const msg =
          data.error === "daily_limit" ? c.errDaily
          : data.error === "monthly_limit" ? c.errMonthly
          : data.error === "ai_unavailable" || data.error?.includes("budget") ? c.errUnavailable
          : c.errGeneric;
        setMessages((m) => [...m, { role: "ai", text: msg }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "ai", text: c.errGeneric }]);
    } finally {
      setThinking(false);
    }
  }

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    void ask(text);
  }

  return (
    <div className="flex h-[calc(100vh-9.5rem)] flex-col">
      <SectionBack />
      <SectionHint id="tutor" />
      {/* header — одна личность на всю платформу: Ahu */}
      <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-lg">👩🏻‍🏫</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--color-foreground)]">Ahu</span>
            <span className="text-xs text-[var(--color-muted)]">· {c.subtitle}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <span className="h-2 w-2 rounded-full bg-[#16a34a]" /> {c.online} 🟢
          </div>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto py-5">
        <div className="flex flex-col gap-3">
          {messages.map((m, i) =>
            m.role === "lesson" ? (
              // карточка голосового урока (voice_summary) — часть общей памяти Ahu
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[85%] self-start rounded-2xl border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/[0.05] px-4 py-2.5"
              >
                <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-brand)]">{c.lesson(m.minutes)}</div>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-foreground)]">{m.text}</p>
              </motion.div>
            ) : (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "ai" ? "self-start bg-black/[0.04] text-[var(--color-foreground)]" : "self-end bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-white"
                }`}
              >
                {m.text}
              </motion.div>
            ),
          )}
          {thinking && (
            <div className="flex items-center gap-1.5 self-start rounded-2xl bg-black/[0.04] px-4 py-3">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted)]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* quick replies — real prompts to the AI, not canned answers */}
      <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {c.quick.map((q) => (
          <button
            key={q}
            type="button"
            disabled={thinking}
            onClick={() => void ask(q)}
            className="shrink-0 rounded-full border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/[0.06] px-3 py-1.5 text-xs font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/12 disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* input */}
      <div className="flex items-center gap-2 border-t border-black/[0.06] pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={c.placeholder}
          className="flex-1 rounded-full border border-black/[0.1] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
        />
        <button
          type="button"
          onClick={toggleVoice}
          disabled={!micOk}
          aria-label="mic"
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
            recording ? "bg-[#dc2626] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"
          }`}
        >
          {recording && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ border: "2px solid rgba(239,68,68,0.6)" }}
              animate={{ scale: [1, 1.4], opacity: [0.7, 0] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
          )}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 4a3 3 0 013 3v4a3 3 0 11-6 0V7a3 3 0 013-3zM5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" onClick={send} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-white" aria-label="send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 12l16-8-6 16-2.5-6.5L4 12z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
