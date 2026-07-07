"use client";

import { useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { motion } from "framer-motion";
import { VOICE_OPTIONS } from "@/lib/ai/voices";
import { topicById } from "@/lib/ai/topics";
import type { VoiceReport } from "@/lib/ai/prompts/voice-review";
import { useI18n, type Locale } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { awardXp, XP } from "@/lib/xp";

type Mode = "free" | "bolum1" | "bolum2" | "bolum3" | "full";
type Line = { source: "user" | "ai"; text: string };
type Phase = "idle" | "starting" | "live" | "wrapping" | "ended";

const MODES: Mode[] = ["bolum1", "bolum2", "bolum3", "full", "free"];

// oral wrap-up instruction sent as a contextual update when the student ends
// the lesson (the agent prompt defines the same closing ritual)
const WRAP_NOTE: Record<string, string> = {
  ru: "SİSTEM NOTU: Öğrenci dersi şimdi bitiriyor. KAPANIŞ RİTÜELİNİ uygula: Türkçe tek cümle özet, sonra RUSÇA kısa sözlü değerlendirme (iyi yönler, 2-3 somut hata, bugünkü konular, hedefe giden sonraki adım), Türkçe veda. 45 saniyeyi geçme.",
  en: "SİSTEM NOTU: Öğrenci dersi şimdi bitiriyor. KAPANIŞ RİTÜELİNİ uygula: Türkçe tek cümle özet, sonra İNGİLİZCE kısa sözlü değerlendirme (iyi yönler, 2-3 somut hata, bugünkü konular, hedefe giden sonraki adım), Türkçe veda. 45 saniyeyi geçme.",
  tr: "SİSTEM NOTU: Öğrenci dersi şimdi bitiriyor. KAPANIŞ RİTÜELİNİ uygula: tek cümle özet, kısa sözlü değerlendirme (iyi yönler, 2-3 somut hata, bugünkü konular, sonraki adım), veda. 45 saniyeyi geçme.",
  kk: "SİSTEM NOTU: Öğrenci dersi şimdi bitiriyor. KAPANIŞ RİTÜELİNİ uygula: Türkçe tek cümle özet, sonra KAZAKÇA kısa sözlü değerlendirme (iyi yönler, 2-3 somut hata, bugünkü konular, hedefe giden sonraki adım), Türkçe veda. 45 saniyeyi geçme.",
};

const T = {
  ru: {
    title: "Живой урок с AI-преподавателем",
    subtitle: "Урок с учебным фокусом: преподаватель ведёт диалог по темам твоего уровня, исправляет по ходу и в конце разбирает по критериям TÖMER Konuşma.",
    modes: { bolum1: "Bölüm 1 · Диалог", bolum2: "Bölüm 2 · Монолог", bolum3: "Bölüm 3 · Мнение", full: "Полный экзамен", free: "Свободная беседа" },
    voice: "Голос преподавателя", start: "Начать урок", starting: "Подключение…",
    end: "Завершить с итогом", endNow: "закончить без итога", wrapping: "Преподаватель подводит итог — дослушай…",
    listening: "Слушает тебя — говори", speaking: "Преподаватель говорит…", minutes: "Минуты сегодня", purchased: "докупленные",
    focus: "Фокус урока", transcript: "Транскрипт", ended: "Урок завершён", spent: "Потрачено", min: "мин",
    fromBase: "из дневных", fromCredits: "из докупленных", short: "Сессия была короче 10 секунд — минуты не списаны.",
    reportPreparing: "Готовим письменный разбор…", reportTitle: "Разбор урока · TÖMER Konuşma",
    crit: { fluency: "Беглость", grammar: "Грамматика", vocab: "Лексика", coherence: "Связность" },
    errors: "Ошибки из разговора", noErrors: "Заметных ошибок в разговоре не найдено!", rule: "Правило",
    topicsWorked: "Проработанные темы", nextSteps: "Что дальше", reportNone: "Разговор был слишком коротким для разбора.",
    again: "Ещё урок",
    errAuth: "Войди в аккаунт, чтобы начать урок.", errMic: "Нужен доступ к микрофону — разреши его в браузере и попробуй снова.",
    errNoMinutes: "На сегодня минуты закончились. База обновится в полночь; пакеты минут скоро появятся.",
    errUnavailable: "Голосовой урок временно недоступен. Попробуй позже.", errGeneric: "Не получилось подключиться. Попробуй ещё раз.",
    hint: "Говори свободно — ошибки это нормально, преподаватель поправит.",
  },
  en: {
    title: "Live lesson with the AI teacher",
    subtitle: "A lesson with a teaching focus: the teacher steers the dialogue around your level's topics, corrects on the fly and reviews you against TÖMER Konuşma criteria.",
    modes: { bolum1: "Bölüm 1 · Dialogue", bolum2: "Bölüm 2 · Monologue", bolum3: "Bölüm 3 · Opinion", full: "Full exam", free: "Free talk" },
    voice: "Teacher's voice", start: "Start lesson", starting: "Connecting…",
    end: "Finish with feedback", endNow: "end without feedback", wrapping: "The teacher is wrapping up — listen…",
    listening: "Listening — go ahead", speaking: "Teacher is speaking…", minutes: "Minutes today", purchased: "purchased",
    focus: "Lesson focus", transcript: "Transcript", ended: "Lesson finished", spent: "Spent", min: "min",
    fromBase: "from daily", fromCredits: "from purchased", short: "The session was under 10 seconds — no minutes were charged.",
    reportPreparing: "Preparing the written review…", reportTitle: "Lesson review · TÖMER Konuşma",
    crit: { fluency: "Fluency", grammar: "Grammar", vocab: "Vocabulary", coherence: "Coherence" },
    errors: "Errors from the conversation", noErrors: "No notable errors found in the conversation!", rule: "Rule",
    topicsWorked: "Topics worked on", nextSteps: "Next steps", reportNone: "The conversation was too short for a review.",
    again: "Another lesson",
    errAuth: "Sign in to start a lesson.", errMic: "Microphone access is required — allow it in your browser and retry.",
    errNoMinutes: "You're out of minutes for today. The base quota resets at midnight; minute packs are coming soon.",
    errUnavailable: "The voice lesson is temporarily unavailable. Please try later.", errGeneric: "Couldn't connect. Please try again.",
    hint: "Speak freely — mistakes are fine, the teacher will correct you.",
  },
  tr: {
    title: "AI öğretmenle canlı ders",
    subtitle: "Öğrenme odaklı ders: öğretmen diyaloğu seviyene uygun konular etrafında yürütür, anında düzeltir ve sonunda TÖMER Konuşma ölçütlerine göre değerlendirir.",
    modes: { bolum1: "Bölüm 1 · Karşılıklı", bolum2: "Bölüm 2 · Sözlü anlatım", bolum3: "Bölüm 3 · Görüş", full: "Tam sınav", free: "Serbest sohbet" },
    voice: "Öğretmenin sesi", start: "Derse başla", starting: "Bağlanıyor…",
    end: "Değerlendirmeyle bitir", endNow: "değerlendirmesiz bitir", wrapping: "Öğretmen dersi topluyor — dinle…",
    listening: "Dinliyor — konuş", speaking: "Öğretmen konuşuyor…", minutes: "Bugünkü dakikalar", purchased: "satın alınan",
    focus: "Dersin odağı", transcript: "Döküm", ended: "Ders bitti", spent: "Harcanan", min: "dk",
    fromBase: "günlükten", fromCredits: "satın alınandan", short: "Oturum 10 saniyeden kısaydı — dakika düşülmedi.",
    reportPreparing: "Yazılı değerlendirme hazırlanıyor…", reportTitle: "Ders değerlendirmesi · TÖMER Konuşma",
    crit: { fluency: "Akıcılık", grammar: "Dil bilgisi", vocab: "Kelime", coherence: "Tutarlılık" },
    errors: "Konuşmadaki hatalar", noErrors: "Konuşmada kayda değer hata bulunamadı!", rule: "Kural",
    topicsWorked: "Çalışılan konular", nextSteps: "Sonraki adımlar", reportNone: "Konuşma değerlendirme için çok kısaydı.",
    again: "Yeni ders",
    errAuth: "Derse başlamak için giriş yap.", errMic: "Mikrofon izni gerekli — tarayıcıda izin ver ve tekrar dene.",
    errNoMinutes: "Bugünkü dakikaların bitti. Taban kota gece yarısı yenilenir; dakika paketleri yakında.",
    errUnavailable: "Sesli ders geçici olarak kullanılamıyor. Daha sonra dene.", errGeneric: "Bağlanılamadı. Tekrar dene.",
    hint: "Rahat konuş — hata yapmak normal, öğretmen düzeltir.",
  },
  kk: {
    title: "AI ұстазбен жанды сабақ",
    subtitle: "Оқу фокусы бар сабақ: ұстаз диалогты деңгейіңе сай тақырыптармен жүргізеді, қатеңді сол сәтте түзетеді, соңында TÖMER Konuşma өлшемдерімен талдайды.",
    modes: { bolum1: "Bölüm 1 · Диалог", bolum2: "Bölüm 2 · Монолог", bolum3: "Bölüm 3 · Пікір", full: "Толық емтихан", free: "Еркін әңгіме" },
    voice: "Ұстаздың дауысы", start: "Сабақты бастау", starting: "Қосылуда…",
    end: "Қорытындымен аяқтау", endNow: "қорытындысыз аяқтау", wrapping: "Ұстаз қорытынды айтып жатыр — тыңда…",
    listening: "Тыңдап тұр — сөйлей бер", speaking: "Ұстаз сөйлеп жатыр…", minutes: "Бүгінгі минуттар", purchased: "сатып алынған",
    focus: "Сабақ фокусы", transcript: "Транскрипт", ended: "Сабақ аяқталды", spent: "Жұмсалды", min: "мин",
    fromBase: "күнделіктіден", fromCredits: "сатып алынғаннан", short: "Сессия 10 секундтан қысқа болды — минут есептелген жоқ.",
    reportPreparing: "Жазбаша талдау дайындалуда…", reportTitle: "Сабақ талдауы · TÖMER Konuşma",
    crit: { fluency: "Еркіндік", grammar: "Грамматика", vocab: "Лексика", coherence: "Байланыстылық" },
    errors: "Әңгімедегі қателер", noErrors: "Әңгімеде елеулі қате табылмады!", rule: "Ереже",
    topicsWorked: "Өтілген тақырыптар", nextSteps: "Келесі қадамдар", reportNone: "Әңгіме талдау үшін тым қысқа болды.",
    again: "Тағы бір сабақ",
    errAuth: "Сабақты бастау үшін аккаунтқа кір.", errMic: "Микрофонға рұқсат керек — браузерде рұқсат беріп, қайта көр.",
    errNoMinutes: "Бүгінгі минуттар бітті. Базалық квота түн ортасында жаңарады; минут пакеттері жақында.",
    errUnavailable: "Дауысты сабақ уақытша қолжетімсіз. Кейінірек көр.", errGeneric: "Қосылу сәтсіз. Қайта көр.",
    hint: "Еркін сөйле — қателесу қалыпты, ұстаз түзетеді.",
  },
};

function fmt(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

/** Audio wave: bars follow the agent's voice when speaking, mic when listening. */
function Wave({ getData, active, color }: { getData: () => Uint8Array; active: boolean; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const BARS = 28;
    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      let data: Uint8Array | null = null;
      try {
        data = getData();
      } catch {
        /* audio graph not ready */
      }
      const step = data && data.length > 0 ? Math.floor(data.length / BARS) : 0;
      const bw = width / BARS;
      for (let i = 0; i < BARS; i++) {
        const v = active && data && step > 0 ? (data[i * step] ?? 0) / 255 : 0;
        const h = Math.max(height * 0.06, v * height * 0.9);
        const x = i * bw + bw * 0.25;
        const y = (height - h) / 2;
        ctx.fillStyle = color;
        ctx.globalAlpha = active ? 0.9 : 0.35;
        ctx.beginPath();
        ctx.roundRect(x, y, bw * 0.5, h, bw * 0.25);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [getData, active, color]);
  return <canvas ref={ref} width={560} height={72} className="h-[52px] w-full max-w-[420px]" />;
}

function LiveLesson() {
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [mode, setMode] = useState<Mode>("bolum1");
  const [voice, setVoice] = useState("ahu");
  const [phase, setPhase] = useState<Phase>("idle");
  const [err, setErr] = useState<"errAuth" | "errMic" | "errNoMinutes" | "errUnavailable" | "errGeneric" | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [allowance, setAllowance] = useState<{ baseLeft: number; creditsLeft: number } | null>(null);
  const [lessonFocus, setLessonFocus] = useState<{ id: string; label: Record<Locale, string> }[]>([]);
  const [settle, setSettle] = useState<{ minutes: number; seconds: number; fromBase: number; fromCredits: number; report: VoiceReport | null } | null>(null);
  const [reportPending, setReportPending] = useState(false);

  const maxSecondsRef = useRef(900);
  const convIdRef = useRef<string | null>(null);
  const settlingRef = useRef(false);
  const wrapRef = useRef<{ requested: boolean; spoke: boolean; timer: ReturnType<typeof setTimeout> | null }>({ requested: false, spoke: false, timer: null });
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onMessage: (event) => {
      const e = event as { type?: string; user_transcription_event?: { user_transcript?: string }; agent_response_event?: { agent_response?: string } };
      if (e.type === "user_transcript" && e.user_transcription_event?.user_transcript) {
        setLines((l) => [...l, { source: "user", text: e.user_transcription_event!.user_transcript! }]);
      } else if (e.type === "agent_response" && e.agent_response_event?.agent_response) {
        setLines((l) => [...l, { source: "ai", text: e.agent_response_event!.agent_response! }]);
      }
    },
    onDisconnect: () => void settleSession(),
    onError: () => {
      if (phase === "starting") {
        setErr("errGeneric");
        setPhase("idle");
      }
    },
  });
  const { status, isSpeaking } = conversation;

  useEffect(() => {
    if (status === "connected") {
      setPhase((p) => (p === "starting" ? "live" : p));
      if (!convIdRef.current) {
        try {
          convIdRef.current = conversation.getId();
          // survives a closed tab: settled (and removed) on the next visit
          window.localStorage.setItem("lingopro:pending-voice", convIdRef.current);
        } catch {
          /* not ready yet */
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // reconcile a session whose tab was closed mid-call: billing is idempotent
  // server-side, so firing this on every mount is safe
  useEffect(() => {
    const pending = window.localStorage.getItem("lingopro:pending-voice");
    if (!pending || pending === convIdRef.current) return;
    void fetch("/api/voice/session/end", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId: pending }),
    }).then((r) => {
      if (r.ok || r.status === 404 || r.status === 403) window.localStorage.removeItem("lingopro:pending-voice");
    });
  }, []);

  // oral wrap-up: after the farewell instruction, end once the teacher has
  // spoken and gone quiet again (safety timeout guards a stuck state)
  useEffect(() => {
    const w = wrapRef.current;
    if (!w.requested) return;
    if (isSpeaking) w.spoke = true;
    if (!isSpeaking && w.spoke) {
      const t = setTimeout(() => conversation.endSession(), 1500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpeaking]);

  useEffect(() => {
    if (phase !== "live" && phase !== "wrapping") return;
    const t = setInterval(() => {
      setElapsed((s) => {
        if (s + 1 >= maxSecondsRef.current) conversation.endSession();
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  async function settleSession() {
    const w = wrapRef.current;
    if (w.timer) clearTimeout(w.timer);
    if (settlingRef.current || !convIdRef.current) return;
    settlingRef.current = true;
    setPhase("ended");
    setReportPending(true);
    try {
      const res = await fetch("/api/voice/session/end", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId: convIdRef.current }),
      });
      if (res.ok) {
        window.localStorage.removeItem("lingopro:pending-voice");
        const d = await res.json();
        setSettle(d);
        if ((d.minutes ?? 0) > 0) {
          void awardXp("speaking_test", XP.SPEAKING_TEST, {
            dedupKey: `voice:${convIdRef.current}`,
            metadata: { conversationId: convIdRef.current, seconds: d.seconds, mode },
          });
        }
      }
    } catch {
      /* session row stays unsettled; server-side reconciliation is planned */
    } finally {
      setReportPending(false);
    }
  }

  function requestWrapUp() {
    const w = wrapRef.current;
    if (w.requested) return;
    w.requested = true;
    w.spoke = false;
    setPhase("wrapping");
    try {
      conversation.sendContextualUpdate(WRAP_NOTE[locale] ?? WRAP_NOTE.en);
    } catch {
      conversation.endSession();
      return;
    }
    // if the teacher never wraps up, force-end
    w.timer = setTimeout(() => conversation.endSession(), 75_000);
  }

  async function start() {
    setErr(null);
    setLines([]);
    setSettle(null);
    setElapsed(0);
    convIdRef.current = null;
    settlingRef.current = false;
    wrapRef.current = { requested: false, spoke: false, timer: null };
    setPhase("starting");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErr("errMic");
      setPhase("idle");
      return;
    }

    let data: {
      conversationToken: string;
      voiceId: string;
      maxSeconds: number;
      allowance: { baseLeft: number; creditsLeft: number };
      lessonFocus: { id: string; label: Record<Locale, string> }[];
      dynamicVariables: Record<string, string>;
    };
    try {
      const res = await fetch("/api/voice/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, feedbackLang: locale, voiceId: voice }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        if (res.status === 401) setErr("errAuth");
        else if (d.error === "no_minutes") {
          setErr("errNoMinutes");
          setAllowance({ baseLeft: d.baseLeft ?? 0, creditsLeft: d.creditsLeft ?? 0 });
        } else setErr("errUnavailable");
        setPhase("idle");
        return;
      }
      data = await res.json();
    } catch {
      setErr("errGeneric");
      setPhase("idle");
      return;
    }

    setAllowance(data.allowance);
    setLessonFocus(data.lessonFocus ?? []);
    maxSecondsRef.current = data.maxSeconds;
    conversation.startSession({
      conversationToken: data.conversationToken,
      connectionType: "webrtc",
      dynamicVariables: data.dynamicVariables,
      overrides: { tts: { voiceId: data.voiceId } },
    });
  }

  const inCall = phase === "live" || phase === "wrapping";
  const remaining = Math.max(0, maxSecondsRef.current - elapsed);
  const report = settle?.report && settle.report.valid ? settle.report : null;

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>
      <p className="mt-1 max-w-xl text-sm text-[var(--color-muted)]">{c.subtitle}</p>

      {allowance && (
        <div className="mt-3 text-xs text-[var(--color-muted)]">
          {c.minutes}: <span className="font-semibold text-[var(--color-brand)]">{allowance.baseLeft}</span>
          {allowance.creditsLeft > 0 && <> + {allowance.creditsLeft} {c.purchased}</>}
        </div>
      )}

      {phase === "idle" && (
        <div className="glass mt-5 rounded-3xl p-6">
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${mode === m ? "bg-[var(--color-brand)] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}>
                {c.modes[m]}
              </button>
            ))}
          </div>

          <div className="mt-4 text-xs font-medium text-[var(--color-muted)]">{c.voice}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {VOICE_OPTIONS.map((v) => (
              <button key={v.id} type="button" onClick={() => setVoice(v.id)}
                className={`rounded-2xl px-4 py-2.5 text-left transition-all ${voice === v.id ? "bg-[var(--color-brand)]/10 ring-1 ring-[var(--color-brand)]/40" : "bg-black/[0.04] hover:bg-black/[0.07]"}`}>
                <span className="block text-sm font-semibold text-[var(--color-foreground)]">{v.name}</span>
                <span className="block text-[11px] text-[var(--color-muted)]">{v.tone[locale]}</span>
              </button>
            ))}
          </div>

          {err && <div className="mt-4 rounded-xl bg-[#d97706]/10 px-4 py-3 text-sm text-[#92400e]">{c[err]}</div>}

          <button type="button" onClick={start} className="btn-primary mt-5 rounded-full px-6 py-3 text-sm font-semibold">
            🎙️ {c.start}
          </button>
          <p className="mt-3 text-xs text-[var(--color-muted)]">{c.hint}</p>
          <a href="/dashboard/speaking/push" className="mt-2 inline-block text-xs text-[var(--color-muted)] underline-offset-2 hover:underline">
            {pick(locale, { ru: { t: "Текстовый режим (push-to-talk)" }, en: { t: "Text mode (push-to-talk)" }, tr: { t: "Metin modu (push-to-talk)" }, kk: { t: "Мәтін режимі (push-to-talk)" } }).t}
          </a>
        </div>
      )}

      {(phase === "starting" || inCall) && (
        <div className="glass mt-5 rounded-3xl p-6">
          {lessonFocus.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">{c.focus}:</span>
              {lessonFocus.map((f) => (
                <span key={f.id} className="rounded-full bg-[var(--color-brand)]/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-brand)]">
                  {f.label[locale]}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              {phase === "starting" ? c.starting : phase === "wrapping" ? c.wrapping : isSpeaking ? c.speaking : c.listening}
            </span>
            {inCall && (
              <span className={`text-sm font-semibold tabular-nums ${remaining <= 60 ? "text-[#dc2626]" : "text-[var(--color-muted)]"}`}>
                {fmt(elapsed)} / {fmt(maxSecondsRef.current)}
              </span>
            )}
          </div>

          <div className="mt-3 flex justify-center rounded-2xl bg-black/[0.03] px-4 py-2">
            <Wave
              active={inCall}
              color={isSpeaking ? "#6366f1" : "#16a34a"}
              getData={isSpeaking ? conversation.getOutputByteFrequencyData : conversation.getInputByteFrequencyData}
            />
          </div>

          <div ref={scrollRef} className="mt-4 flex max-h-64 flex-col gap-2 overflow-y-auto rounded-2xl bg-black/[0.03] p-4">
            {lines.length === 0 && <span className="text-xs text-[var(--color-muted)]">…</span>}
            {lines.map((l, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${l.source === "user" ? "self-end bg-[var(--color-brand)]/10 text-[var(--color-foreground)]" : "self-start bg-white shadow-sm text-[var(--color-foreground)]"}`}>
                {l.text}
              </div>
            ))}
          </div>

          {phase === "live" && (
            <div className="mt-4 flex items-center gap-4">
              <button type="button" onClick={requestWrapUp} className="btn-primary rounded-full px-5 py-2.5 text-sm font-medium">
                🏁 {c.end}
              </button>
              <button type="button" onClick={() => conversation.endSession()} className="text-xs text-[var(--color-muted)] underline-offset-2 hover:underline">
                {c.endNow}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "ended" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass mt-5 rounded-3xl p-6">
          <h3 className="text-base font-semibold text-[var(--color-foreground)]">{c.ended}</h3>
          {settle &&
            (settle.minutes > 0 ? (
              <p className="mt-1 text-sm text-[var(--color-foreground)]">
                {c.spent}: <b>{settle.minutes} {c.min}</b> ({settle.fromBase} {c.fromBase}
                {settle.fromCredits > 0 && <>, {settle.fromCredits} {c.fromCredits}</>}) · {fmt(settle.seconds)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-[var(--color-muted)]">{c.short}</p>
            ))}

          {reportPending && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-[var(--color-brand)]/[0.06] px-4 py-3 text-sm text-[var(--color-foreground)]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
              {c.reportPreparing}
            </div>
          )}

          {!reportPending && settle && !report && settle.minutes > 0 && (
            <p className="mt-3 text-sm text-[var(--color-muted)]">{c.reportNone}</p>
          )}

          {report && (
            <div className="mt-4 flex flex-col gap-4">
              <div className="text-sm font-semibold text-[var(--color-foreground)]">{c.reportTitle}</div>
              {report.summary && <p className="text-sm leading-relaxed text-[var(--color-foreground)]">{report.summary}</p>}

              <div className="grid gap-2 sm:grid-cols-2">
                {(["fluency", "grammar", "vocab", "coherence"] as const).map((k) => (
                  <div key={k} className="rounded-xl bg-black/[0.03] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--color-foreground)]">{c.crit[k]}</span>
                      <span className="text-sm font-bold text-[var(--color-brand)]">{report.criteria[k].score}/5</span>
                    </div>
                    {report.criteria[k].comment && <p className="mt-1 text-xs text-[var(--color-muted)]">{report.criteria[k].comment}</p>}
                  </div>
                ))}
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#d97706]">{c.errors}</div>
                {report.errors.length === 0 ? (
                  <p className="mt-2 text-sm text-[#16a34a]">{c.noErrors}</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-2.5">
                    {report.errors.map((e, i) => (
                      <li key={i} className="rounded-xl bg-black/[0.03] p-3.5 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-[#dc2626]/10 px-2 py-0.5 font-medium text-[#b91c1c] line-through decoration-[#dc2626]/50">{e.quote}</span>
                          <span aria-hidden>→</span>
                          <span className="rounded bg-[#16a34a]/10 px-2 py-0.5 font-medium text-[#15803d]">{e.correction}</span>
                        </div>
                        <div className="mt-1.5 text-[var(--color-foreground)]"><b>{c.rule}:</b> {e.rule}</div>
                        <div className="mt-0.5 text-[var(--color-muted)]">{e.explanation}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {report.topics_worked.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{c.topicsWorked}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {report.topics_worked.map((id) => {
                      const t = topicById(id);
                      return t ? (
                        <span key={id} className="rounded-full bg-[var(--color-brand)]/[0.08] px-2.5 py-1 text-xs font-medium text-[var(--color-brand)]">
                          {t.label[locale]}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {report.next_steps.length > 0 && (
                <div className="rounded-xl bg-[var(--color-brand)]/[0.05] p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)]">{c.nextSteps}</div>
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-[var(--color-foreground)]">
                    {report.next_steps.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {lines.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{c.transcript}</summary>
              <div className="mt-2 flex max-h-56 flex-col gap-2 overflow-y-auto rounded-2xl bg-black/[0.03] p-4">
                {lines.map((l, i) => (
                  <div key={i} className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${l.source === "user" ? "self-end bg-[var(--color-brand)]/10" : "self-start bg-white shadow-sm"}`}>{l.text}</div>
                ))}
              </div>
            </details>
          )}

          <button type="button" onClick={() => setPhase("idle")} className="btn-primary mt-5 rounded-full px-5 py-2.5 text-sm">
            {c.again}
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function LiveLessonPage() {
  return (
    <ConversationProvider>
      <LiveLesson />
    </ConversationProvider>
  );
}
