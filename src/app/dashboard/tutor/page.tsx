"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

type Msg = { role: "ai" | "user"; text: string };

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
    greet1: "Merhaba! 👋 Ben senin kişisel Türkçe öğretmeninim. Sana nasıl yardımcı olabilirim?",
    greet2: "Привет! Я твой персональный учитель турецкого. Чем могу помочь?",
    placeholder: "Напиши сообщение…",
    quick: ["Объясни грамматику", "Проверь предложение", "Подготовка к TÖMER", "Разговорная практика", "Переведи текст"],
    fallback: "Отличный вопрос! Давай разберём это вместе. [AI-ответы будут доступны после подключения Claude API]",
    answers: {
      "Объясни грамматику": "С удовольствием! В турецком 6 падежей: основной, винительный (-i), дательный (-e), местный (-de), исходный (-den) и родительный (-in). Какую тему разберём?",
      "Проверь предложение": "Пришли предложение, которое хочешь проверить, — я подсвечу ошибки и объясню правила.",
      "Подготовка к TÖMER": "TÖMER состоит из 4 секций: грамматика, чтение, аудирование и письмо. С какой начнём?",
      "Разговорная практика": "Süper! Hadi Türkçe konuşalım. Bugün nasılsın? (Отлично! Давай говорить по-турецки. Как ты сегодня?)",
      "Переведи текст": "Вставь текст на турецком или русском — я переведу и объясню сложные слова.",
    } as Record<string, string>,
  },
  en: {
    online: "Online",
    greet1: "Merhaba! 👋 Ben senin kişisel Türkçe öğretmeninim. Sana nasıl yardımcı olabilirim?",
    greet2: "Hi! I'm your personal Turkish teacher. How can I help?",
    placeholder: "Type a message…",
    quick: ["Explain grammar", "Check a sentence", "TÖMER prep", "Speaking practice", "Translate text"],
    fallback: "Great question! Let's work through it together. [AI answers will be available once the Claude API is connected]",
    answers: {
      "Explain grammar": "Sure! Turkish has 6 cases: nominative, accusative (-i), dative (-e), locative (-de), ablative (-den) and genitive (-in). Which one shall we cover?",
      "Check a sentence": "Send the sentence you want checked — I'll highlight mistakes and explain the rules.",
      "TÖMER prep": "TÖMER has 4 sections: grammar, reading, listening and writing. Which one first?",
      "Speaking practice": "Süper! Let's speak Turkish. Bugün nasılsın? (How are you today?)",
      "Translate text": "Paste text in Turkish or English — I'll translate and explain the tricky words.",
    } as Record<string, string>,
  },
  tr: {
    online: "Çevrimiçi",
    greet1: "Merhaba! 👋 Ben senin kişisel Türkçe öğretmeninim. Sana nasıl yardımcı olabilirim?",
    greet2: "Bugün hangi konuda yardımcı olabilirim?",
    placeholder: "Bir mesaj yaz…",
    quick: ["Dil bilgisi açıkla", "Cümle kontrol et", "TÖMER hazırlık", "Konuşma pratiği", "Metin çevir"],
    fallback: "Harika soru! Birlikte çözelim. [AI cevapları Claude API bağlandığında gelecek]",
    answers: {
      "Dil bilgisi açıkla": "Tabii! Türkçede 6 hâl var: yalın, belirtme (-i), yönelme (-e), bulunma (-de), ayrılma (-den) ve tamlayan (-in). Hangisini görelim?",
      "Cümle kontrol et": "Kontrol etmek istediğin cümleyi gönder — hataları işaretleyip kuralları açıklayayım.",
      "TÖMER hazırlık": "TÖMER 4 bölümden oluşur: dil bilgisi, okuma, dinleme ve yazma. Hangisiyle başlayalım?",
      "Konuşma pratiği": "Süper! Türkçe konuşalım. Bugün nasılsın?",
      "Metin çevir": "Türkçe veya İngilizce metni yapıştır — çevirip zor kelimeleri açıklayayım.",
    } as Record<string, string>,
  },
  kk: {
    online: "Желіде",
    greet1: "Merhaba! 👋 Ben senin kişisel Türkçe öğretmeninim. Sana nasıl yardımcı olabilirim?",
    greet2: "Сәлем! Мен сенің жеке түрік тілі мұғаліміңмін. Қалай көмектесе аламын?",
    placeholder: "Хабарлама жаз…",
    quick: ["Грамматиканы түсіндір", "Сөйлемді тексер", "TÖMER дайындық", "Сөйлеу практикасы", "Мәтінді аудар"],
    fallback: "Тамаша сұрақ! Бірге талдайық. [AI жауаптары Claude API қосылғанда қолжетімді болады]",
    answers: {
      "Грамматиканы түсіндір": "Әрине! Түрік тілінде 6 септік бар: атау, табыс (-i), барыс (-e), жатыс (-de), шығыс (-den) және ілік (-in). Қайсысын қарайық?",
      "Сөйлемді тексер": "Тексергің келетін сөйлемді жібер — қателерді белгілеп, ережелерді түсіндіремін.",
      "TÖMER дайындық": "TÖMER 4 бөлімнен тұрады: грамматика, оқу, тыңдалым, жазу. Қайсысынан бастаймыз?",
      "Сөйлеу практикасы": "Süper! Түрікше сөйлесейік. Bugün nasılsın? (Бүгін қалайсың?)",
      "Мәтінді аудар": "Түрікше не орысша мәтінді қой — аударып, қиын сөздерді түсіндіремін.",
    } as Record<string, string>,
  },
};

export default function TutorPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: c.greet1 },
    { role: "ai", text: c.greet2 },
  ]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [micOk] = useState(() => getSR() !== null);
  const endRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<SRInstance | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => () => recRef.current?.stop(), []);

  function toggleVoice() {
    if (recording) {
      recRef.current?.stop();
      return;
    }
    const SR = getSR();
    if (!SR) return;
    const r = new SR();
    r.lang = "tr-TR";
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

  function reply(userText: string, aiText: string) {
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setTimeout(() => setMessages((m) => [...m, { role: "ai", text: aiText }]), 500);
  }

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    reply(text, c.fallback);
  }

  return (
    <div className="flex h-[calc(100vh-9.5rem)] flex-col">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-lg">🤖</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--color-foreground)]">LingoPRO AI</span>
            <span className="rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-1.5 py-0.5 text-[9px] font-bold text-white">NEW</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <span className="h-2 w-2 rounded-full bg-[#16a34a]" /> {c.online} 🟢
          </div>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto py-5">
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
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
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {/* quick replies */}
      <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {c.quick.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => reply(q, c.answers[q] ?? c.fallback)}
            className="shrink-0 rounded-full border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/[0.06] px-3 py-1.5 text-xs font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/12"
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
