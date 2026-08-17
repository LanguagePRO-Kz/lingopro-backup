"use client";

/**
 * ПРАКТИКА — разговор с Ahu без урока (Блок 1 от 16.08.2026).
 *
 * Отличия от «Живого урока» намеренные, а не упрощение ради упрощения:
 * нет режимов Bölüm, нет фокус-тем, нет досье, нет устного подведения итога
 * и НЕТ письменного разбора. Это болталка: студент говорит, Ahu поддерживает
 * беседу и правит ошибки рекастом по ходу.
 *
 * Механика биллинга/слотов/восстановления после закрытой вкладки — та же, что
 * у урока (сеттл идемпотентен на сервере), поэтому паттерны сохранены один
 * в один: терять минуты или деньги на «более простом» экране нельзя.
 */

import { useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { motion } from "framer-motion";
import { VOICE_OPTIONS } from "@/lib/ai/voices";
import { VoicePackModal } from "@/components/VoicePackModal";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

type Line = { source: "user" | "ai"; text: string };
type Phase = "idle" | "starting" | "live" | "ended";

function Practice() {
  const { locale } = useI18n();
  const [phase, setPhase] = useState<Phase>("idle");
  const [err, setErr] = useState<string | null>(null);
  const [busyEta, setBusyEta] = useState(2);
  const [busyFreed, setBusyFreed] = useState(false);
  const [voice, setVoice] = useState<string>(VOICE_OPTIONS[0].id);
  const [lines, setLines] = useState<Line[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [allowance, setAllowance] = useState<{ baseLeft: number; creditsLeft: number; monthlyLeft?: number } | null>(null);
  const [packModal, setPackModal] = useState(false);
  const [spent, setSpent] = useState<{ minutes: number | null; seconds: number } | null>(null);

  // 5 минут — дневной лимит практики (Блок 4); точное значение приходит с
  // сервера в maxSeconds, здесь только начальное показание таймера
  const maxSecondsRef = useRef(300);
  const [maxSeconds, setMaxSeconds] = useState(300);
  const convIdRef = useRef<string | null>(null);
  const settlingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onMessage: (event) => {
      const e = event as {
        type?: string;
        user_transcription_event?: { user_transcript?: string };
        agent_response_event?: { agent_response?: string };
      };
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
          window.localStorage.setItem("lingopro:pending-voice", convIdRef.current);
        } catch {
          /* ещё не готов */
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // сессия, чью вкладку закрыли на середине: сеттл идемпотентен на сервере,
  // поэтому вызов на каждом монтировании безопасен
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

  // «занято» — не ошибка: опрашиваем слоты и оживляем кнопку
  useEffect(() => {
    if (err !== "errBusy") return;
    const id = setInterval(async () => {
      try {
        const d = await fetch("/api/voice/session").then((r) => r.json());
        if (d && d.busy === false) {
          setErr(null);
          setBusyFreed(true);
        } else if (d?.etaMinutes) {
          setBusyEta(d.etaMinutes);
        }
      } catch {
        /* сеть мигнула — следующий тик */
      }
    }, 25_000);
    return () => clearInterval(id);
  }, [err]);

  useEffect(() => {
    if (phase !== "live") return;
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
    if (settlingRef.current || !convIdRef.current) return;
    settlingRef.current = true;
    setPhase("ended");
    try {
      // разбора здесь нет, но списание минут обязано пройти: сервер может
      // ответить 503, пока ElevenLabs финализирует запись — ретраим
      for (let attempt = 0; attempt < 3; attempt++) {
        let res: Response | null = null;
        try {
          res = await fetch("/api/voice/session/end", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ conversationId: convIdRef.current }),
          });
        } catch {
          /* сеть — ретрай ниже */
        }
        if (res?.ok) {
          const d = await res.json();
          setSpent({ minutes: d.minutes ?? null, seconds: d.seconds ?? 0 });
          window.localStorage.removeItem("lingopro:pending-voice");
          break;
        }
        if (attempt < 2) await new Promise((r) => setTimeout(r, 2500));
      }
    } finally {
      settlingRef.current = false;
      convIdRef.current = null;
    }
  }

  async function start() {
    setErr(null);
    setBusyFreed(false);
    setLines([]);
    setElapsed(0);
    setSpent(null);
    setPhase("starting");
    settlingRef.current = false;

    let data: {
      conversationToken: string;
      voiceId: string;
      maxSeconds: number;
      allowance: { baseLeft: number; creditsLeft: number; monthlyLeft?: number };
      firstMessage?: string;
      dynamicVariables: Record<string, string>;
    };
    try {
      const res = await fetch("/api/voice/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "practice", feedbackLang: locale, voiceId: voice }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        if (res.status === 401) setErr("errAuth");
        else if (d.error === "no_minutes") {
          setErr("errNoMinutes");
          setAllowance({ baseLeft: d.dailyLeft ?? d.baseLeft ?? 0, creditsLeft: d.creditsLeft ?? 0, monthlyLeft: d.monthlyLeft });
        } else if (d.error === "busy") {
          setErr("errBusy");
          setBusyEta(d.etaMinutes ?? 2);
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
    maxSecondsRef.current = data.maxSeconds;
    setMaxSeconds(data.maxSeconds);

    // WebRTC-коннект мигает с первого раза — авто-ретрай, как в уроке
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await conversation.startSession({
          conversationToken: data.conversationToken,
          connectionType: "webrtc",
          dynamicVariables: data.dynamicVariables,
          overrides: {
            tts: { voiceId: data.voiceId },
            ...(data.firstMessage ? { agent: { firstMessage: data.firstMessage } } : {}),
          },
        });
        return;
      } catch {
        if (attempt < 2) await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
      }
    }
    setErr("errGeneric");
    setPhase("idle");
  }

  const remaining = Math.max(0, maxSeconds - elapsed);
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const ERRORS: Record<string, string> = {
    errAuth: pick(locale, {
      ru: "Войди в аккаунт, чтобы начать разговор.",
      en: "Sign in to start talking.",
      tr: "Sohbete başlamak için giriş yap.",
      kk: "Әңгімені бастау үшін аккаунтқа кір.",
    }),
    errNoMinutes: pick(locale, {
      ru: "Минуты на сегодня закончились. База обновится в полночь — или докупи пакет.",
      en: "You're out of minutes today. The base resets at midnight — or top up.",
      tr: "Bugünlük dakikan bitti. Taban gece yarısı yenilenir — ya da paket al.",
      kk: "Бүгінгі минуттар бітті. База түн ортасында жаңарады — немесе пакет сатып ал.",
    }),
    errUnavailable: pick(locale, {
      ru: "Практика временно недоступна. Попробуй позже.",
      en: "Practice is temporarily unavailable. Try later.",
      tr: "Pratik şu an kullanılamıyor. Sonra dene.",
      kk: "Практика уақытша қолжетімсіз. Кейінірек көр.",
    }),
    errGeneric: pick(locale, {
      ru: "Не получилось подключиться. Попробуй ещё раз.",
      en: "Couldn't connect. Please try again.",
      tr: "Bağlanılamadı. Tekrar dene.",
      kk: "Қосыла алмадық. Қайта көр.",
    }),
  };

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">
        {pick(locale, { ru: "Практика", en: "Practice", tr: "Pratik", kk: "Практика" })}
      </h2>
      <p className="mt-1 max-w-xl text-sm text-[var(--color-muted)]">
        {pick(locale, {
          ru: "Просто разговор по-турецки на твоём уровне. Ahu поправляет по ходу, не останавливая беседу. Без разбора и оценок — это тренировка речи, а не урок.",
          en: "Just a Turkish conversation at your level. Ahu corrects on the fly without stopping the talk. No review, no scores — this is speaking practice, not a lesson.",
          tr: "Seviyene uygun bir Türkçe sohbet. Ahu sohbeti durdurmadan düzeltir. Değerlendirme ve puan yok — bu konuşma pratiği, ders değil.",
          kk: "Деңгейіңе сай жай ғана түрікше әңгіме. Ahu әңгімені тоқтатпай түзетеді. Талдау мен баға жоқ — бұл сөйлеу жаттығуы, сабақ емес.",
        })}
      </p>

      {allowance && (
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-muted)]">
          <span>
            {pick(locale, { ru: "Минуты сегодня", en: "Minutes today", tr: "Bugünkü dakikalar", kk: "Бүгінгі минуттар" })}:{" "}
            <span className="font-semibold text-[var(--color-brand)]">{allowance.baseLeft}</span>
            {allowance.creditsLeft > 0 && (
              <>
                {" "}
                + {allowance.creditsLeft}{" "}
                {pick(locale, { ru: "докупленные", en: "purchased", tr: "satın alınan", kk: "сатып алынған" })}
              </>
            )}
            {/* месячный остаток — честно рядом с дневным: студент должен
                видеть оба потолка, а не упираться в невидимый (правило 1.3) */}
            {allowance.monthlyLeft != null && (
              <>
                {" · "}
                {pick(locale, { ru: "в месяце", en: "this month", tr: "bu ay", kk: "айда" })}:{" "}
                <span className="font-semibold">{allowance.monthlyLeft}</span>
              </>
            )}
          </span>
          <button
            type="button"
            onClick={() => setPackModal(true)}
            className="rounded-full border border-[var(--color-brand)]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/[0.06]"
          >
            + {pick(locale, { ru: "Докупить минуты", en: "Buy minutes", tr: "Dakika al", kk: "Минут сатып алу" })}
          </button>
        </div>
      )}
      {packModal && <VoicePackModal onClose={() => setPackModal(false)} />}

      {phase === "idle" && (
        <div className="glass mt-5 rounded-3xl p-6">
          <div className="text-xs font-medium text-[var(--color-muted)]">
            {pick(locale, { ru: "Голос собеседника", en: "Partner's voice", tr: "Konuşma partnerinin sesi", kk: "Әңгімелесуші дауысы" })}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {VOICE_OPTIONS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVoice(v.id)}
                className={`rounded-2xl px-4 py-2.5 text-left transition-all ${
                  voice === v.id ? "bg-[var(--color-brand)]/10 ring-1 ring-[var(--color-brand)]/40" : "bg-black/[0.04] hover:bg-black/[0.07]"
                }`}
              >
                <span className="block text-sm font-semibold text-[var(--color-foreground)]">{v.name}</span>
                <span className="block text-[11px] text-[var(--color-muted)]">{v.tone[locale]}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-[var(--color-brand)]/[0.05] p-4">
            <div className="text-sm font-semibold text-[var(--color-foreground)]">
              {pick(locale, { ru: "Как проходит практика", en: "How practice works", tr: "Pratik nasıl geçer", kk: "Практика қалай өтеді" })}
            </div>
            <ul className="mt-2 flex flex-col gap-1.5 text-xs leading-relaxed text-[var(--color-muted)]">
              <li>
                {pick(locale, {
                  ru: "Ahu говорит по-турецки на твоём уровне и ведёт беседу — отвечай голосом.",
                  en: "Ahu speaks Turkish at your level and keeps the conversation going — answer out loud.",
                  tr: "Ahu seviyene uygun Türkçe konuşur ve sohbeti sürdürür — sesli cevap ver.",
                  kk: "Ahu деңгейіңе сай түрікше сөйлеп, әңгімені жүргізеді — дауыстап жауап бер.",
                })}
              </li>
              <li>
                {pick(locale, {
                  ru: "Ошибку она исправит незаметно — повторит правильную форму в своём ответе и пойдёт дальше.",
                  en: "Mistakes get fixed invisibly — she repeats the correct form in her reply and moves on.",
                  tr: "Hatanı fark ettirmeden düzeltir — doğru biçimi kendi cevabında söyler ve devam eder.",
                  kk: "Қатеңді байқатпай түзетеді — дұрыс түрін өз жауабында айтып, әрі қарай жүреді.",
                })}
              </li>
              <li>
                {pick(locale, {
                  ru: "Не понял — скажи об этом на своём языке, она объяснит и вернётся к турецкому.",
                  en: "Lost? Say so in your language — she'll explain and switch back to Turkish.",
                  tr: "Anlamadıysan kendi dilinde söyle — açıklar ve Türkçeye döner.",
                  kk: "Түсінбесең, өз тіліңде айт — түсіндіріп, түрікшеге қайтады.",
                })}
              </li>
              <li>
                {pick(locale, {
                  ru: "Разбора в конце нет — за оценками и рекомендациями иди в «Живой урок».",
                  en: "No review at the end — for scores and recommendations use the live lesson.",
                  tr: "Sonunda değerlendirme yok — puan ve öneri için canlı derse git.",
                  kk: "Соңында талдау жоқ — баға мен ұсыныс үшін «Тірі сабаққа» бар.",
                })}
              </li>
            </ul>
          </div>

          {(err || busyFreed) && (
            <div className="mt-4 rounded-xl bg-[#d97706]/10 px-4 py-3 text-sm text-[#92400e]">
              <p>
                {busyFreed
                  ? pick(locale, {
                      ru: "Собеседник освободился — можно начинать!",
                      en: "Your partner is free — you can start!",
                      tr: "Partnerin boşaldı — başlayabilirsin!",
                      kk: "Әңгімелесуші босады — бастауға болады!",
                    })
                  : err === "errBusy"
                    ? pick(locale, {
                        ru: `Все места заняты. Освободится через ~${busyEta} мин — проверяем автоматически.`,
                        en: `All slots are taken. A slot frees up in ~${busyEta} min — we re-check automatically.`,
                        tr: `Tüm yerler dolu. ~${busyEta} dk içinde boşalır — otomatik kontrol ediyoruz.`,
                        kk: `Барлық орын бос емес. ~${busyEta} мин ішінде босайды — автоматты тексереміз.`,
                      })
                    : ERRORS[err as string]}
              </p>
              {err === "errNoMinutes" && (
                <button
                  type="button"
                  onClick={() => setPackModal(true)}
                  className="mt-2 rounded-full bg-[#92400e] px-4 py-1.5 text-xs font-semibold text-white"
                >
                  {pick(locale, { ru: "Докупить минуты", en: "Buy minutes", tr: "Dakika al", kk: "Минут сатып алу" })}
                </button>
              )}
              {err === "errAuth" && (
                <a href="/login" className="mt-2 inline-block rounded-full bg-[#92400e] px-4 py-1.5 text-xs font-semibold text-white">
                  {pick(locale, { ru: "Войти", en: "Sign in", tr: "Giriş yap", kk: "Кіру" })}
                </a>
              )}
            </div>
          )}

          <button type="button" onClick={() => void start()} className="btn-primary mt-5 rounded-full px-6 py-3 text-sm font-semibold">
            {pick(locale, { ru: "Начать разговор", en: "Start talking", tr: "Sohbete başla", kk: "Әңгімені бастау" })}
          </button>
        </div>
      )}

      {phase === "starting" && (
        <div className="glass mt-5 rounded-3xl p-6 text-sm text-[var(--color-muted)]">
          {pick(locale, { ru: "Подключение…", en: "Connecting…", tr: "Bağlanıyor…", kk: "Қосылуда…" })}
        </div>
      )}

      {phase === "live" && (
        <div className="glass mt-5 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <motion.span
                animate={{ scale: isSpeaking ? [1, 1.25, 1] : 1, opacity: isSpeaking ? 1 : 0.55 }}
                transition={{ repeat: isSpeaking ? Infinity : 0, duration: 1.1 }}
                className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-brand)]"
              />
              {isSpeaking
                ? pick(locale, { ru: "Ahu говорит…", en: "Ahu is speaking…", tr: "Ahu konuşuyor…", kk: "Ahu сөйлеп тұр…" })
                : pick(locale, { ru: "Слушает тебя — говори", en: "Listening — go ahead", tr: "Dinliyor — konuş", kk: "Тыңдап тұр — сөйле" })}
            </div>
            <div className="text-sm tabular-nums text-[var(--color-muted)]">{mmss(remaining)}</div>
          </div>

          <div ref={scrollRef} className="mt-4 max-h-64 overflow-y-auto rounded-2xl bg-black/[0.03] p-4">
            {lines.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)]">
                {pick(locale, {
                  ru: "Транскрипт появится здесь по ходу разговора.",
                  en: "The transcript appears here as you talk.",
                  tr: "Döküm sohbet ilerledikçe burada görünür.",
                  kk: "Әңгіме барысында мәтін осында шығады.",
                })}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {lines.map((l, i) => (
                  <div key={i} className={`text-sm ${l.source === "ai" ? "text-[var(--color-foreground)]" : "text-[var(--color-muted)]"}`}>
                    <span className="text-[11px] font-semibold uppercase tracking-wide opacity-60">
                      {l.source === "ai" ? "Ahu" : pick(locale, { ru: "Ты", en: "You", tr: "Sen", kk: "Сен" })}
                    </span>
                    <p>{l.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => void conversation.endSession()}
            className="mt-5 rounded-full bg-black/[0.06] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-black/[0.1]"
          >
            {pick(locale, { ru: "Завершить", en: "Finish", tr: "Bitir", kk: "Аяқтау" })}
          </button>
        </div>
      )}

      {phase === "ended" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass mt-5 rounded-3xl p-6">
          <div className="text-sm font-semibold">
            {pick(locale, { ru: "Хорошо поговорили!", en: "Good talk!", tr: "Güzel bir sohbetti!", kk: "Жақсы әңгімеледік!" })}
          </div>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {spent && spent.minutes !== null && spent.minutes > 0
              ? pick(locale, {
                  ru: `Разговор занял ${spent.minutes} мин.`,
                  en: `The conversation took ${spent.minutes} min.`,
                  tr: `Sohbet ${spent.minutes} dk sürdü.`,
                  kk: `Әңгіме ${spent.minutes} мин алды.`,
                })
              : pick(locale, {
                  ru: "Сессия была короче 10 секунд — минуты не списаны.",
                  en: "The session was under 10 seconds — no minutes charged.",
                  tr: "Oturum 10 saniyeden kısaydı — dakika düşülmedi.",
                  kk: "Сессия 10 секундтан қысқа болды — минут алынбады.",
                })}
          </p>
          <button
            type="button"
            onClick={() => {
              setPhase("idle");
              setLines([]);
            }}
            className="btn-primary mt-5 rounded-full px-5 py-2.5 text-sm"
          >
            {pick(locale, { ru: "Ещё разговор", en: "Talk again", tr: "Bir sohbet daha", kk: "Тағы әңгіме" })}
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <ConversationProvider>
      <Practice />
    </ConversationProvider>
  );
}
