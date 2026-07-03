"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { awardXp, XP } from "@/lib/xp";

/* ----------------------------- Web Speech API ----------------------------- */
type SRResult = { 0: { transcript: string }; isFinal: boolean };
type SREvent = { resultIndex: number; results: { length: number; [i: number]: SRResult } };
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

function speak(text: string, onEnd?: () => void, onNoVoice?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "tr-TR";
  u.rate = 0.85;
  const trVoice = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith("tr"));
  if (trVoice) u.voice = trVoice;
  else onNoVoice?.();
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  synth.speak(u);
}

/* --------------------------------- Types ---------------------------------- */
type RecState = "idle" | "listening" | "processing" | "speaking";
type ModeId = "free" | "tomer" | "pronunciation" | "roleplay";
type Item =
  | { role: "user"; text: string }
  | { role: "ai"; reply: string; correction: string | null; newWord: string | null; note: string | null };

const OPENERS: Record<ModeId, string> = {
  free: "Merhaba! Bugün nasılsın? Hadi biraz sohbet edelim.",
  tomer: "Merhaba! TÖMER konuşma pratiği yapalım. Kendini tanıtır mısın?",
  pronunciation: "Merhaba! Sana bir cümle söyleyeceğim, tekrar et: Çalışkan öğrenciler her gün ders çalışır.",
  roleplay: "Merhaba! Ben üniversite kayıt memuruyum. Size nasıl yardımcı olabilirim?",
};

const MODES: { id: ModeId; gradient: string; icon: string }[] = [
  { id: "free", gradient: "linear-gradient(135deg,#7C3AED,#6366F1)", icon: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" },
  { id: "tomer", gradient: "linear-gradient(135deg,#2563eb,#3b82f6)", icon: "M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" },
  { id: "pronunciation", gradient: "linear-gradient(135deg,#16a34a,#22c55e)", icon: "M11 5L6 9H2v6h4l5 4V5zM19 5a9 9 0 010 14M15.5 8.5a5 5 0 010 7" },
  { id: "roleplay", gradient: "linear-gradient(135deg,#f97316,#fb923c)", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
];

const T = {
  ru: {
    aiName: "AI Öğretmen", settings: "Режим",
    statusIdle: "Нажмите на микрофон и начните говорить", statusListening: "Слушаю… говорите по-турецки", statusProcessing: "Думаю…", statusSpeaking: "Öğretmen говорит…",
    you: "Ты", teacher: "Öğretmen", hint: "Подсказка", end: "Завершить",
    noBrowser: "Откройте в Chrome для голосовой практики", noVoice: "Турецкий голос не найден — озвучка может звучать иначе.",
    typeFallback: "Или напишите текстом…",
    modalTitle: "Выбери режим практики", start: "Начать", example: "Пример",
    modes: {
      free: { t: "Свободный разговор", d: "Свободная беседа на любую тему" },
      tomer: { t: "TÖMER Konuşma", d: "Симуляция устной части экзамена" },
      pronunciation: { t: "Произношение", d: "Повторяй за преподавателем" },
      roleplay: { t: "Ролевая игра", d: "Ресторан, врач, университет…" },
    },
    summaryTitle: "Итоги разговора", time: "Время", msgs: "Сообщений", corr: "Исправлений", words: "Новых слов", levelEval: "Оценка уровня",
    newTalk: "Новый разговор", back: "Вернуться", evaluating: "Оцениваю…",
  },
  en: {
    aiName: "AI Öğretmen", settings: "Mode",
    statusIdle: "Tap the mic and start speaking", statusListening: "Listening… speak in Turkish", statusProcessing: "Thinking…", statusSpeaking: "Öğretmen is speaking…",
    you: "You", teacher: "Öğretmen", hint: "Hint", end: "End",
    noBrowser: "Open in Chrome for voice practice", noVoice: "No Turkish voice found — playback may sound different.",
    typeFallback: "Or type instead…",
    modalTitle: "Choose a practice mode", start: "Start", example: "Example",
    modes: {
      free: { t: "Free talk", d: "Free conversation on any topic" },
      tomer: { t: "TÖMER Konuşma", d: "Speaking exam simulation" },
      pronunciation: { t: "Pronunciation", d: "Repeat after the teacher" },
      roleplay: { t: "Role-play", d: "Restaurant, doctor, university…" },
    },
    summaryTitle: "Session summary", time: "Time", msgs: "Messages", corr: "Corrections", words: "New words", levelEval: "Level estimate",
    newTalk: "New conversation", back: "Go back", evaluating: "Evaluating…",
  },
  tr: {
    aiName: "AI Öğretmen", settings: "Mod",
    statusIdle: "Mikrofona dokun ve konuşmaya başla", statusListening: "Dinliyorum… Türkçe konuş", statusProcessing: "Düşünüyorum…", statusSpeaking: "Öğretmen konuşuyor…",
    you: "Sen", teacher: "Öğretmen", hint: "İpucu", end: "Bitir",
    noBrowser: "Sesli pratik için Chrome'da aç", noVoice: "Türkçe ses bulunamadı — telaffuz farklı olabilir.",
    typeFallback: "Ya da yazarak dene…",
    modalTitle: "Pratik modunu seç", start: "Başla", example: "Örnek",
    modes: {
      free: { t: "Serbest sohbet", d: "Her konuda serbest sohbet" },
      tomer: { t: "TÖMER Konuşma", d: "Konuşma sınavı simülasyonu" },
      pronunciation: { t: "Telaffuz", d: "Öğretmenden sonra tekrar et" },
      roleplay: { t: "Rol yapma", d: "Restoran, doktor, üniversite…" },
    },
    summaryTitle: "Ders özeti", time: "Süre", msgs: "Mesaj", corr: "Düzeltme", words: "Yeni kelime", levelEval: "Seviye değerlendirmesi",
    newTalk: "Yeni konuşma", back: "Geri dön", evaluating: "Değerlendiriyorum…",
  },
  kk: {
    aiName: "AI Öğretmen", settings: "Режим",
    statusIdle: "Микрофонды бас та сөйлей баста", statusListening: "Тыңдап тұрмын… түрікше сөйле", statusProcessing: "Ойланудамын…", statusSpeaking: "Öğretmen сөйлеп тұр…",
    you: "Сен", teacher: "Öğretmen", hint: "Кеңес", end: "Аяқтау",
    noBrowser: "Дауыспен жаттығу үшін Chrome-да аш", noVoice: "Түрік дауысы табылмады — айтылым басқаша болуы мүмкін.",
    typeFallback: "Немесе мәтінмен жаз…",
    modalTitle: "Практика режимін таңда", start: "Бастау", example: "Мысал",
    modes: {
      free: { t: "Еркін әңгіме", d: "Кез келген тақырыпта әңгіме" },
      tomer: { t: "TÖMER Konuşma", d: "Ауызша емтихан симуляциясы" },
      pronunciation: { t: "Айтылым", d: "Мұғалімнен кейін қайтала" },
      roleplay: { t: "Рөлдік ойын", d: "Мейрамхана, дәрігер, университет…" },
    },
    summaryTitle: "Сабақ қорытындысы", time: "Уақыт", msgs: "Хабарлама", corr: "Түзету", words: "Жаңа сөз", levelEval: "Деңгей бағасы",
    newTalk: "Жаңа әңгіме", back: "Қайту", evaluating: "Бағалаудамын…",
  },
};

/* ------------------------------- Avatar (SVG) ----------------------------- */
/**
 * Expressive SVG face for the AI tutor. Always alive (blink + wandering
 * pupils); bobs while idle; pulsing rings while listening; talking mouth,
 * raised brows and side sound-waves while speaking. Purely 2D vector + CSS.
 */
function Avatar({ state }: { state: RecState }) {
  const listening = state === "listening";
  const speaking = state === "speaking";
  const idle = state === "idle";

  const eyeStyle = { transformBox: "fill-box", transformOrigin: "center" } as const;

  return (
    <div className="relative h-[260px] w-[260px]">
      {/* listening — two soft blue pulsing rings */}
      {listening &&
        [0, 0.9].map((d) => (
          <span
            key={d}
            className="lp-ring absolute inset-0 rounded-full"
            style={{ boxShadow: "0 0 0 5px rgba(56,189,248,0.45)", animationDelay: `${d}s` }}
          />
        ))}

      {/* soft elliptical ground shadow */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: -2, width: 160, height: 26, background: "rgba(76,29,149,0.35)", borderRadius: "50%", filter: "blur(13px)" }}
      />

      {/* speaking — side sound waves */}
      {speaking &&
        (["left-[-24px]", "right-[-24px]"] as const).map((side) => (
          <div key={side} className={`absolute top-1/2 ${side} flex -translate-y-1/2 items-center gap-1`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="lp-wave w-1.5 rounded-full bg-[#7C3AED]" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        ))}

      {/* face */}
      <svg
        viewBox="0 0 200 200"
        className={`relative h-full w-full ${idle ? "lp-bob" : ""}`}
        style={{ filter: "drop-shadow(0 24px 50px rgba(124,58,237,0.55))", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="lp-face" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C3AED" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="96" fill="url(#lp-face)" />

        {/* eyebrows — raise slightly while speaking */}
        <g
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          style={{
            transform: speaking ? "translateY(-5px)" : "translateY(0)",
            transition: "transform 0.3s ease",
            transformBox: "fill-box",
            transformOrigin: "center",
          }}
        >
          <path d="M56 68 Q72 58 88 66" />
          <path d="M112 66 Q128 58 144 68" />
        </g>

        {/* eyes — blink group wraps whites + wandering pupils */}
        <g className="lp-blink">
          <ellipse cx="72" cy="94" rx="15" ry="19" fill="#fff" />
          <g className="lp-look" style={eyeStyle}>
            <circle cx="72" cy="95" r="7.5" fill="#1b1640" />
            <circle cx="69" cy="92" r="2.3" fill="#fff" />
          </g>

          <ellipse cx="128" cy="94" rx="15" ry="19" fill="#fff" />
          <g className="lp-look" style={eyeStyle}>
            <circle cx="128" cy="95" r="7.5" fill="#1b1640" />
            <circle cx="125" cy="92" r="2.3" fill="#fff" />
          </g>
        </g>

        {/* mouth — smile when idle, opening loop while speaking */}
        {speaking ? (
          <ellipse className="lp-mouth-talk" cx="100" cy="140" rx="17" ry="13" fill="#fff" style={eyeStyle} />
        ) : (
          <path d="M74 134 Q100 156 126 134" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" />
        )}
      </svg>
    </div>
  );
}

/* --------------------------------- Page ----------------------------------- */
export default function SpeakingPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const c = pick(locale, T);

  const [supported] = useState(() => getSR() !== null);
  const [mode, setMode] = useState<ModeId | null>(null);
  const [pending, setPending] = useState<ModeId | null>(null);
  const [modal, setModal] = useState(true);

  const [rec, setRec] = useState<RecState>("idle");
  const [interim, setInterim] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [voiceWarn, setVoiceWarn] = useState(false);
  const [typed, setTyped] = useState("");
  const [summary, setSummary] = useState<{ text: string; mins: number; msgs: number; corr: number; words: number } | null>(null);
  const [ending, setEnding] = useState(false);

  const recRef = useRef<SRInstance | null>(null);
  const finalRef = useRef("");
  const subsRef = useRef<HTMLDivElement>(null);
  const startTs = useRef(0);

  useEffect(() => {
    subsRef.current?.scrollTo({ top: subsRef.current.scrollHeight, behavior: "smooth" });
  }, [items, interim]);

  useEffect(() => () => { recRef.current?.stop(); window.speechSynthesis?.cancel(); }, []);

  const status =
    rec === "listening" ? c.statusListening : rec === "processing" ? c.statusProcessing : rec === "speaking" ? c.statusSpeaking : c.statusIdle;

  function apiMessages(list: Item[]) {
    const mapped = list.map((it) => (it.role === "user" ? { role: "user" as const, content: it.text } : { role: "assistant" as const, content: it.reply }));
    const firstUser = mapped.findIndex((m) => m.role === "user");
    return firstUser < 0 ? mapped : mapped.slice(firstUser);
  }

  function startConversation() {
    if (!pending) return;
    setMode(pending);
    setModal(false);
    setSummary(null);
    startTs.current = Date.now();
    const opener = OPENERS[pending];
    setItems([{ role: "ai", reply: opener, correction: null, newWord: null, note: null }]);
    setRec("speaking");
    speak(opener, () => setRec("idle"), () => setVoiceWarn(true));
  }

  async function processUser(text: string) {
    const next: Item[] = [...items, { role: "user", text }];
    setItems(next);
    setInterim("");
    setRec("processing");
    try {
      const res = await fetch("/api/speaking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "chat", mode, messages: apiMessages(next) }),
      });
      const d = await res.json();
      const ai: Item = { role: "ai", reply: d.reply ?? "…", correction: d.correction ?? null, newWord: d.newWord ?? null, note: d.note ?? null };
      setItems((prev) => [...prev, ai]);
      setRec("speaking");
      speak(ai.reply, () => setRec("idle"), () => setVoiceWarn(true));
    } catch {
      setRec("idle");
    }
  }

  /* ---- speech recognition ---- */
  function startRec() {
    const SR = getSR();
    if (!SR) return;
    const r = new SR();
    r.lang = "tr-TR";
    r.continuous = false;
    r.interimResults = true;
    finalRef.current = "";
    r.onresult = (e) => {
      let interimText = "";
      let finalText = finalRef.current;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      finalRef.current = finalText;
      setInterim((finalText + " " + interimText).trim());
    };
    r.onend = () => {
      const text = finalRef.current.trim();
      if (text) processUser(text);
      else setRec("idle");
    };
    r.onerror = () => setRec("idle");
    recRef.current = r;
    window.speechSynthesis?.cancel();
    r.start();
    setRec("listening");
    setInterim("");
  }

  function micClick() {
    if (rec === "listening") recRef.current?.stop();
    else if (rec === "idle") startRec();
  }

  async function askHint() {
    try {
      const res = await fetch("/api/speaking", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "hint", mode, messages: apiMessages(items) }) });
      const d = await res.json();
      setToast(d.text ?? "…");
      setTimeout(() => setToast(null), 7000);
    } catch { /* ignore */ }
  }

  async function endSession() {
    recRef.current?.stop();
    window.speechSynthesis?.cancel();
    setEnding(true);
    const userMsgs = items.filter((i) => i.role === "user").length;
    const corr = items.filter((i) => i.role === "ai" && i.correction).length;
    const words = items.filter((i) => i.role === "ai" && i.newWord).length;
    const mins = Math.max(1, Math.round((Date.now() - startTs.current) / 60000));
    let text = "";
    try {
      const res = await fetch("/api/speaking", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "summary", mode, messages: apiMessages(items) }) });
      text = (await res.json()).text ?? "";
    } catch { /* ignore */ }
    setSummary({ text, mins, msgs: userMsgs, corr, words });
    setEnding(false);
    // XP for a real completed speaking session (each genuine session counts)
    if (userMsgs >= 2) void awardXp("speaking_test", XP.SPEAKING_TEST, { metadata: { mode, msgs: userMsgs } });
  }

  function resetToModal() {
    setItems([]);
    setSummary(null);
    setRec("idle");
    setPending(null);
    setMode(null);
    setModal(true);
  }

  /* ------------------------------- Summary ------------------------------- */
  if (summary) {
    return (
      <div className="mx-auto max-w-lg py-6">
        <div className="glass rounded-3xl p-7">
          <h2 className="text-center text-xl font-bold tracking-tight">🎓 {c.summaryTitle}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[[c.time, `${summary.mins} мин`], [c.msgs, summary.msgs], [c.corr, summary.corr], [c.words, summary.words]].map(([l, v]) => (
              <div key={String(l)} className="rounded-2xl bg-black/[0.03] p-4 text-center">
                <div className="text-2xl font-bold text-[var(--color-foreground)]">{v}</div>
                <div className="mt-0.5 text-xs text-[var(--color-muted)]">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/[0.05] p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)]">{c.levelEval}</div>
            <div className="mt-1 text-lg font-bold text-[var(--color-foreground)]">A2 → B1 🚀</div>
          </div>
          {summary.text && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--color-foreground)]">{summary.text}</p>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={resetToModal} className="btn-primary flex-1 rounded-full px-6 py-3 text-sm">{c.newTalk}</button>
            <button type="button" onClick={() => router.push("/dashboard")} className="btn-ghost flex-1 rounded-full px-6 py-3 text-sm font-medium">{c.back}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[var(--color-foreground)]">{c.aiName}</span>
          {mode && <span className="rounded-full bg-[var(--color-brand)]/10 px-3 py-1 text-xs font-medium text-[var(--color-brand)]">{c.modes[mode].t}</span>}
        </div>
        <button type="button" onClick={() => setModal(true)} aria-label={c.settings} className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-muted)] transition-colors hover:bg-black/[0.05]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 9a3 3 0 100 6 3 3 0 000-6zM4 12h2m12 0h2M12 4v2m0 12v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
        </button>
      </div>

      {/* center */}
      <div className="flex flex-1 flex-col items-center justify-center py-4">
        <div className="flex h-[200px] items-center justify-center sm:h-[280px]">
          <div className="scale-[0.69] sm:scale-100"><Avatar state={rec} /></div>
        </div>

        <div className="mt-6 text-center text-sm font-medium text-[var(--color-foreground)]">{status}</div>

        {/* interim live text */}
        {rec === "listening" && interim && <div className="mt-2 max-w-[500px] text-center text-sm italic text-[var(--color-muted)]">«{interim}»</div>}

        {voiceWarn && <div className="mt-2 text-center text-xs text-[#d97706]">⚠️ {c.noVoice}</div>}

        {/* subtitles */}
        {items.length > 0 && (
          <div ref={subsRef} className="mt-4 max-h-[200px] w-full max-w-[500px] overflow-y-auto rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              {items.map((it, i) =>
                it.role === "user" ? (
                  <div key={i} className="self-end text-right text-sm italic text-[var(--color-muted)]">{it.text}</div>
                ) : (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="text-sm text-[var(--color-foreground)]">{it.reply}</div>
                    {it.correction && <div className="rounded-xl bg-[#fef9c3] px-3 py-2 text-xs text-[#854d0e]">✏️ {it.correction}</div>}
                    {it.newWord && <div className="rounded-xl bg-[var(--color-brand)]/[0.08] px-3 py-2 text-xs text-[var(--color-brand)]">📚 {it.newWord}</div>}
                    {it.note && !it.correction && !it.newWord && <div className="text-xs text-[var(--color-muted)]">{it.note}</div>}
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* no-browser warning + text fallback */}
        {!supported && (
          <div className="mt-4 w-full max-w-[500px] rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/[0.08] p-4 text-center text-sm text-[#b45309]">
            🔊 {c.noBrowser}
          </div>
        )}
      </div>

      {/* controls */}
      <div className="sticky bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent pb-2 pt-4">
        {supported ? (
          <div className="flex items-center gap-5">
            <button type="button" onClick={askHint} className="flex h-12 w-12 items-center justify-center rounded-full border border-black/[0.1] text-[var(--color-muted)] transition-colors hover:bg-black/[0.03]" aria-label={c.hint}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0012 2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

            <button
              type="button"
              onClick={micClick}
              disabled={rec === "processing" || rec === "speaking"}
              className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full text-white shadow-[0_14px_44px_-8px_rgba(109,91,255,0.7)] transition-transform active:scale-95 disabled:opacity-50"
              style={{ background: rec === "listening" ? "linear-gradient(135deg,#ef4444,#b91c1c)" : "linear-gradient(135deg,var(--color-brand),var(--color-brand-2))" }}
              aria-label="mic"
            >
              {rec === "listening" && <motion.span className="absolute inset-0 rounded-full" style={{ border: "3px solid rgba(239,68,68,0.6)" }} animate={{ scale: [1, 1.4], opacity: [0.7, 0] }} transition={{ duration: 1.1, repeat: Infinity }} />}
              <motion.svg width="28" height="28" viewBox="0 0 24 24" fill="none" animate={rec === "listening" ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.8, repeat: Infinity }}>
                <path d="M12 4a3 3 0 013 3v4a3 3 0 11-6 0V7a3 3 0 013-3zM5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </motion.svg>
            </button>

            <button type="button" onClick={endSession} disabled={ending || items.length === 0} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dc2626] text-white transition-colors hover:bg-[#b91c1c] disabled:opacity-40" aria-label={c.end}>
              {ending ? <span className="h-4 w-4 animate-spin-slow rounded-full border-2 border-white border-t-transparent" /> : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              )}
            </button>
          </div>
        ) : (
          // text fallback when no speech recognition
          <div className="flex w-full max-w-[500px] items-end gap-2">
            <input value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && typed.trim()) { processUser(typed.trim()); setTyped(""); } }} placeholder={c.typeFallback} className="flex-1 rounded-full border border-black/[0.1] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-brand)]" />
            <button type="button" onClick={() => { if (typed.trim()) { processUser(typed.trim()); setTyped(""); } }} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 left-1/2 z-40 w-[min(90vw,420px)] -translate-x-1/2 rounded-2xl bg-[#1b1640] px-4 py-3 text-sm text-white shadow-xl">
            💡 {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* mode modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => mode && setModal(false)} />
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }} transition={{ type: "spring", stiffness: 240, damping: 26 }} className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
              <h2 className="text-xl font-bold tracking-tight text-[var(--color-foreground)]">{c.modalTitle}</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {MODES.map((m) => {
                  const info = c.modes[m.id];
                  const active = pending === m.id;
                  return (
                    <button key={m.id} type="button" onClick={() => setPending(m.id)} className={`flex flex-col rounded-2xl p-4 text-left text-white transition-all ${active ? "ring-4 ring-[var(--color-brand)]/30" : ""}`} style={{ background: m.gradient }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d={m.icon} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className="mt-2 text-sm font-bold">{info.t}</span>
                      <span className="mt-1 text-xs text-white/85">{info.d}</span>
                    </button>
                  );
                })}
              </div>
              <button type="button" onClick={startConversation} disabled={!pending} className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">
                {c.start} →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
