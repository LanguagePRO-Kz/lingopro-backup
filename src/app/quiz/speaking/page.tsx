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
    body: "Ahu задаст пару простых вопросов о тебе. Отвечай как можешь — короткие ответы это нормально, ошибки не страшны: цель — услышать твой уровень, а не устроить экзамен.",
    start: "Начать пробу", starting: "Подключение…", live: "Идёт разговор — отвечай голосом",
    left: "осталось", finishing: "Завершаем — считаем оценку…",
    done: "Готово! Оценка говорения появится на странице результата.", toResult: "К результату",
    errMic: "Нужен доступ к микрофону — разреши его в браузере и попробуй снова.",
    errUsed: "Проба уже была использована. Оценка говорения обновляется на живых уроках с Ahu.",
    errAuth: "Сначала войди в аккаунт.", errGeneric: "Не получилось подключиться. Попробуй ещё раз.",
    skipLink: "Пропустить — вернуться к результату",
  },
  en: {
    title: "Speaking probe · ~2 minutes",
    body: "Ahu will ask a couple of simple questions about you. Answer as you can — short answers are fine and mistakes are okay: the goal is to hear your level, not to hold an exam.",
    start: "Start the probe", starting: "Connecting…", live: "Live — answer with your voice",
    left: "left", finishing: "Wrapping up — scoring…",
    done: "Done! Your speaking score will appear on the result page.", toResult: "To the result",
    errMic: "Microphone access is required — allow it in your browser and retry.",
    errUsed: "The probe has already been used. Speaking is scored in live lessons with Ahu.",
    errAuth: "Sign in first.", errGeneric: "Couldn't connect. Please try again.",
    skipLink: "Skip — back to the result",
  },
  tr: {
    title: "Konuşma denemesi · ~2 dakika",
    body: "Ahu sana birkaç basit soru soracak. Elinden geldiğince cevapla — kısa cevaplar normal, hata sorun değil: amaç seviyeni duymak, sınav yapmak değil.",
    start: "Denemeyi başlat", starting: "Bağlanıyor…", live: "Konuşma sürüyor — sesle cevapla",
    left: "kaldı", finishing: "Bitiriliyor — puanlanıyor…",
    done: "Tamam! Konuşma puanın sonuç sayfasında görünecek.", toResult: "Sonuca dön",
    errMic: "Mikrofon izni gerekli — tarayıcıda izin ver ve tekrar dene.",
    errUsed: "Deneme zaten kullanıldı. Konuşma puanı Ahu ile canlı derslerde güncellenir.",
    errAuth: "Önce giriş yap.", errGeneric: "Bağlanılamadı. Tekrar dene.",
    skipLink: "Atla — sonuca dön",
  },
  kk: {
    title: "Сөйлесім сынамасы · ~2 минут",
    body: "Ahu өзің туралы бірнеше қарапайым сұрақ қояды. Қолыңнан келгенше жауап бер — қысқа жауап қалыпты, қателесу қорқынышты емес: мақсат — деңгейіңді есту, емтихан емес.",
    start: "Сынаманы бастау", starting: "Қосылуда…", live: "Әңгіме жүріп жатыр — дауыспен жауап бер",
    left: "қалды", finishing: "Аяқталуда — бағалануда…",
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
  const convIdRef = useRef<string | null>(null);
  const settlingRef = useRef(false);

  const conversation = useConversation({
    onDisconnect: () => void settle(),
    onError: () => {
      setErr(c.errGeneric);
      setPhase("idle");
    },
  });
  const { status } = conversation;

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

  // жёсткий таймер пробы: 2 минуты — и завершаем (сервер режет на 180с)
  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => {
      setElapsed((s) => {
        if (s + 1 >= PROBE_SECONDS) void conversation.endSession();
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

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
    let data: { conversationToken?: string; voiceId?: string; dynamicVariables?: Record<string, string> } = {};
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
        overrides: { tts: { voiceId: data.voiceId } },
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
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-[var(--color-brand)]/25 bg-[var(--color-brand)]/[0.06] px-4 py-3">
            <span className="text-sm font-medium text-[var(--color-foreground)]">🔴 {c.live}</span>
            <span className="text-sm font-bold text-[var(--color-brand)]">{mmss} {c.left}</span>
          </div>
        )}
        {phase === "settling" && (
          <div className="mt-6 flex items-center gap-3 text-sm text-[var(--color-muted)]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
            {c.finishing}
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
