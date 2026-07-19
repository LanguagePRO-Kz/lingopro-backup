"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

/**
 * Голосовая проба уровня говорения (Фаза 4): ~2 минуты разговора с Ahu,
 * бесплатно, один раз на юзера (mode='diagnostic_speaking' в voice/session —
 * сервер отказывает при любой существующей сессии). Оценка едет обычным
 * settle-конвейером (voice-review → attempts → attachKonusmaScore), студент
 * возвращается на /quiz/result с заполненной секцией Konuşma.
 */

const T = {
  ru: {
    title: "Проба говорения · ~2 минуты",
    body: "Короткие ответы — это нормально, ошибки не страшны: цель — услышать твой уровень, а не устроить экзамен.",
    steps: ["Нажми «Начать пробу» и разреши микрофон", "Ahu поздоровается и задаст простой вопрос о тебе", "Отвечай голосом — как только Ahu замолчала, говори ты"],
    stepsTitle: "Как это пройдёт",
    start: "Начать пробу", starting: "Подключение…",
    yourTurn: "Сейчас говори — Ahu слушает", ahuTurn: "Ahu говорит — послушай вопрос",
    left: "осталось", finishing: "Анализирую твою речь — обычно 15–30 секунд",
    done: "Готово! Оценка говорения появится на странице результата.", toResult: "К результату",
    errMic: "Нужен доступ к микрофону — разреши его в браузере и попробуй снова.",
    errUsed: "Проба уже была использована. Оценка говорения обновляется на живых уроках с Ahu.",
    errAuth: "Сначала войди в аккаунт.", errGeneric: "Не получилось подключиться. Попробуй ещё раз.",
    skipLink: "Пропустить — вернуться к результату",
  },
  en: {
    title: "Speaking probe · ~2 minutes",
    body: "Short answers are fine and mistakes are okay: the goal is to hear your level, not to hold an exam.",
    steps: ["Press “Start the probe” and allow the microphone", "Ahu will say hi and ask a simple question about you", "Answer with your voice — as soon as Ahu goes quiet, it's your turn"],
    stepsTitle: "How it goes",
    start: "Start the probe", starting: "Connecting…",
    yourTurn: "Speak now — Ahu is listening", ahuTurn: "Ahu is speaking — listen to the question",
    left: "left", finishing: "Analyzing your speech — usually 15–30 seconds",
    done: "Done! Your speaking score will appear on the result page.", toResult: "To the result",
    errMic: "Microphone access is required — allow it in your browser and retry.",
    errUsed: "The probe has already been used. Speaking is scored in live lessons with Ahu.",
    errAuth: "Sign in first.", errGeneric: "Couldn't connect. Please try again.",
    skipLink: "Skip — back to the result",
  },
  tr: {
    title: "Konuşma denemesi · ~2 dakika",
    body: "Kısa cevaplar normal, hata sorun değil: amaç seviyeni duymak, sınav yapmak değil.",
    steps: ["«Denemeyi başlat»a bas ve mikrofona izin ver", "Ahu selam verip senin hakkında basit bir soru soracak", "Sesle cevapla — Ahu susar susmaz sıra sende"],
    stepsTitle: "Nasıl geçecek",
    start: "Denemeyi başlat", starting: "Bağlanıyor…",
    yourTurn: "Şimdi konuş — Ahu dinliyor", ahuTurn: "Ahu konuşuyor — soruyu dinle",
    left: "kaldı", finishing: "Konuşman analiz ediliyor — genelde 15–30 saniye",
    done: "Tamam! Konuşma puanın sonuç sayfasında görünecek.", toResult: "Sonuca dön",
    errMic: "Mikrofon izni gerekli — tarayıcıda izin ver ve tekrar dene.",
    errUsed: "Deneme zaten kullanıldı. Konuşma puanı Ahu ile canlı derslerde güncellenir.",
    errAuth: "Önce giriş yap.", errGeneric: "Bağlanılamadı. Tekrar dene.",
    skipLink: "Atla — sonuca dön",
  },
  kk: {
    title: "Сөйлесім сынамасы · ~2 минут",
    body: "Қысқа жауап қалыпты, қателесу қорқынышты емес: мақсат — деңгейіңді есту, емтихан емес.",
    steps: ["«Сынаманы бастау» дегенді бас та микрофонға рұқсат бер", "Ahu сәлемдесіп, өзің туралы қарапайым сұрақ қояды", "Дауыспен жауап бер — Ahu үнсіз қалған бойда кезек сенікі"],
    stepsTitle: "Қалай өтеді",
    start: "Сынаманы бастау", starting: "Қосылуда…",
    yourTurn: "Қазір сөйле — Ahu тыңдап тұр", ahuTurn: "Ahu сөйлеп жатыр — сұрақты тыңда",
    left: "қалды", finishing: "Сөзің талдануда — әдетте 15–30 секунд",
    done: "Дайын! Сөйлесім бағасы нәтиже бетінде көрінеді.", toResult: "Нәтижеге өту",
    errMic: "Микрофонға рұқсат керек — браузерде рұқсат беріп, қайта көр.",
    errUsed: "Сынама қолданылып қойған. Сөйлесім бағасы Ahu-мен жанды сабақтарда жаңарады.",
    errAuth: "Алдымен аккаунтқа кір.", errGeneric: "Қосылу сәтсіз. Қайта көр.",
    skipLink: "Өткізіп жіберу — нәтижеге оралу",
  },
};

const PROBE_SECONDS = 120;

export default function SpeakingProbePage() {
  return (
    <ConversationProvider>
      <SpeakingProbe />
    </ConversationProvider>
  );
}

function SpeakingProbe() {
  const router = useRouter();
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [phase, setPhase] = useState<"idle" | "starting" | "live" | "settling" | "done">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [settleSec, setSettleSec] = useState(0);

  // счётчик ожидания разбора: студент видит, что процесс идёт, а не завис
  useEffect(() => {
    if (phase !== "settling") return;
    setSettleSec(0);
    const t = setInterval(() => setSettleSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);
  const convIdRef = useRef<string | null>(null);
  const settlingRef = useRef(false);

  const conversation = useConversation({
    onDisconnect: () => void settle(),
    onError: () => {
      setErr(c.errGeneric);
      setPhase("idle");
    },
  });
  const { status, isSpeaking } = conversation;

  useEffect(() => {
    if (status === "connected") {
      setPhase((p) => (p === "starting" ? "live" : p));
      if (!convIdRef.current) {
        try {
          convIdRef.current = conversation.getId();
        } catch {
          /* ещё не готов — settle возьмёт при дисконнекте */
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // жёсткий таймер пробы: тик раз в секунду, пока идёт разговор
  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // 2 минуты вышли — завершаем (сервер режет на 180с). Отдельный эффект:
  // endSession из setState-updater роняет React («Cannot update
  // ConversationProvider while rendering SpeakingProbe») и проба не доходит
  // до оценки — говорение оставалось —/25
  useEffect(() => {
    if (phase === "live" && elapsed >= PROBE_SECONDS) void conversation.endSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, phase]);

  async function settle() {
    if (settlingRef.current || !convIdRef.current) return;
    settlingRef.current = true;
    setPhase("settling");
    // settle идемпотентен; report дозреет — result-страница подтянет Konuşma
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch("/api/voice/session/end", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ conversationId: convIdRef.current }),
        });
        if (res.ok) break;
      } catch {
        /* ретрай ниже */
      }
      if (attempt < 2) await new Promise((r) => setTimeout(r, 4000));
    }
    setPhase("done");
  }

  async function start() {
    setErr(null);
    setElapsed(0);
    setPhase("starting");
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) {
      setErr(c.errAuth);
      setPhase("idle");
      return;
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErr(c.errMic);
      setPhase("idle");
      return;
    }
    let data: { conversationToken?: string; voiceId?: string; dynamicVariables?: Record<string, string>; firstMessage?: string } = {};
    try {
      const res = await fetch("/api/voice/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "diagnostic_speaking", feedbackLang: locale }),
      });
      data = await res.json().catch(() => ({}));
      if (!res.ok || !data.conversationToken) {
        setErr(res.status === 403 ? c.errUsed : res.status === 401 ? c.errAuth : c.errGeneric);
        setPhase("idle");
        return;
      }
    } catch {
      setErr(c.errGeneric);
      setPhase("idle");
      return;
    }
    try {
      // dynamicVariables обязательны: settle сверяет dynVars.user_id (владение)
      await conversation.startSession({
        conversationToken: data.conversationToken,
        connectionType: "webrtc",
        dynamicVariables: data.dynamicVariables,
        overrides: {
          tts: { voiceId: data.voiceId },
          // приветствие пробы — на языке студента (уровень ещё неизвестен)
          ...(data.firstMessage ? { agent: { firstMessage: data.firstMessage } } : {}),
        },
      });
    } catch {
      setErr(c.errGeneric);
      setPhase("idle");
    }
  }

  const mmss = `${Math.floor((PROBE_SECONDS - elapsed) / 60)}:${String((PROBE_SECONDS - elapsed) % 60).padStart(2, "0")}`;

  return (
    <PageShell>
      <div className="glass-strong w-full max-w-xl rounded-3xl p-7 sm:p-8">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">🎤 {c.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{c.body}</p>

        {/* объяснение ДО старта: что произойдёт и когда говорить студенту */}
        {(phase === "idle" || phase === "starting") && (
          <div className="mt-4 rounded-2xl bg-black/[0.03] p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{c.stepsTitle}</div>
            <ol className="mt-2 flex flex-col gap-1.5 text-sm text-[var(--color-foreground)]">
              {c.steps.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold text-[var(--color-brand)]">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {err && <p className="mt-4 rounded-xl bg-[#d97706]/10 px-4 py-3 text-sm text-[#92400e]">{err}</p>}

        {phase === "idle" && (
          <button type="button" onClick={() => void start()} className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 text-sm">
            {c.start}
          </button>
        )}
        {phase === "starting" && (
          <div className="mt-6 flex items-center gap-3 text-sm text-[var(--color-muted)]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
            {c.starting}
          </div>
        )}
        {phase === "live" && (
          <div
            className={`mt-6 flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors ${
              isSpeaking
                ? "border-[var(--color-brand)]/25 bg-[var(--color-brand)]/[0.06]"
                : "border-[#16a34a]/30 bg-[#16a34a]/[0.08]"
            }`}
          >
            {/* явный сигнал очереди: Ahu замолчала → «сейчас говори» */}
            <span className={`text-sm font-semibold ${isSpeaking ? "text-[var(--color-foreground)]" : "text-[#15803d]"}`}>
              {isSpeaking ? <>🔊 {c.ahuTurn}</> : <>🎙 {c.yourTurn}</>}
            </span>
            <span className="text-sm font-bold text-[var(--color-brand)]">{mmss} {c.left}</span>
          </div>
        )}
        {phase === "settling" && (
          <div className="mt-6 flex items-center gap-3 text-sm text-[var(--color-muted)]">
            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
            <span>
              ⏳ {c.finishing}
              {settleSec > 0 && <span className="tabular-nums"> · {settleSec}s</span>}
            </span>
          </div>
        )}
        {phase === "done" && (
          <div className="mt-6">
            <p className="text-sm text-[var(--color-foreground)]">✅ {c.done}</p>
            <button type="button" onClick={() => router.push("/quiz/result")} className="btn-primary mt-4 rounded-full px-6 py-3 text-sm">
              {c.toResult} →
            </button>
          </div>
        )}

        {(phase === "idle" || phase === "starting") && (
          <button
            type="button"
            onClick={() => router.push("/quiz/result")}
            className="mt-4 block text-xs text-[var(--color-muted)] underline-offset-2 hover:underline"
          >
            {c.skipLink}
          </button>
        )}
      </div>
    </PageShell>
  );
}
