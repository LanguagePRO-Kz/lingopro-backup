"use client";

/**
 * Раздел Konuşma (Блок 5) — симуляция устного TÖMER: 4 части, тайминг по
 * SPEAKING-уровню (per-skill, сервер решает), только турецкий, без
 * подсказок и адаптации. Слово «экзамен» в UI сознательно не пишется.
 *
 * Переиспользует голосовой пайплайн целиком: /api/voice/session (mode=sinav),
 * ElevenLabs SDK, /api/voice/session/end (биллинг+разбор). Клиентская
 * специфика — только экранные материалы и таймеры подготовки:
 * агент произносит фиксированный маркер → карточка/темы на экране + таймер
 * (20с/30с) + mute; sendUserActivity каждые 4с держит turn-таймер агента,
 * чтобы он не влезал в паузу; по нулю (или «Hazırım» раньше) — unmute и
 * sendUserMessage. Фолбэк: маркер не пойман → кнопка открыть карточку руками.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { detectKonusmaCue } from "@/lib/voice/konusma-cues";
import type { VoiceReport } from "@/lib/ai/prompts/voice-review";
import { awardXp, XP } from "@/lib/xp";
import { SectionBack } from "@/components/SectionBack";

const T = {
  ru: {
    title: "Konuşma",
    subtitle: "Полная симуляция устной части: четыре раздела, только турецкий, без подсказок. В конце — письменный разбор.",
    parts: ["Bölüm 1 · Вопросы", "Bölüm 2 · Ситуации", "Bölüm 3 · Обсуждение", "Bölüm 4 · Рассказ"],
    intro: ["Вопросы по темам — категория объявляется вслух", "Две ситуации: во второй разговор начинаешь ТЫ", "Тема с карточкой тезисов · 20 сек на подготовку", "Рассказ до 2 минут (30 сек на заметки) + вопросы"],
    start: "Başla →", starting: "Подключаем…", level: "Уровень симуляции",
    approx: "≈, точный регламент центра не публикуется",
    srcReviews: "по последним голосовым урокам", srcProbe: "по голосовой пробе диагностики", srcDefault: "по умолчанию (данных о говорении мало — пройди урок или пробу для точности)",
    gateTitle: "Симуляция начинается с уровня A2",
    gateBody: "По твоему говорению пока рано — сначала набери базу в живых уроках с Ahu: там есть перевод, подсказки и поддержка.",
    gateCta: "К живому уроку →",
    micDenied: "Нужен доступ к микрофону — симуляция проходит только голосом.",
    busy: "Все голосовые слоты заняты — попробуй через пару минут.",
    noMinutes: "Голосовые минуты на сегодня закончились.",
    generic: "Не получилось начать. Попробуй ещё раз.",
    prep3Title: "Карточка обсуждения", prep4Title: "Выбери тему рассказа",
    notesPh: "Твои заметки (видны только тебе)…",
    ready: "Hazırım →", finish: "Bitirdim ✓", endExam: "Завершить",
    cardBtn: "Открыть карточку", partLabel: "Bölüm",
    reportTitle: "Письменный разбор", reportPending: "Готовим разбор — обычно 1-2 минуты…",
    reportFailed: "Разбор ещё обрабатывается.", reportRetry: "Получить разбор",
    criteria: { fluency: "Беглость", grammar: "Грамматика", vocab: "Лексика", coherence: "Связность" },
    wentWell: "Что получилось", errors: "Ошибки", next: "Следующие шаги", again: "Пройти ещё раз",
    seconds: "сек",
  },
  en: {
    title: "Konuşma",
    subtitle: "A full oral-part simulation: four sections, Turkish only, no hints. A written review at the end.",
    parts: ["Bölüm 1 · Questions", "Bölüm 2 · Situations", "Bölüm 3 · Discussion", "Bölüm 4 · Long turn"],
    intro: ["Topic questions — the category is announced aloud", "Two situations: in the second one YOU start", "A topic card with bullet points · 20s to prepare", "Up to a 2-minute talk (30s for notes) + follow-ups"],
    start: "Başla →", starting: "Connecting…", level: "Simulation level",
    approx: "≈, the centre's exact rules aren't published",
    srcReviews: "based on your recent voice lessons", srcProbe: "based on the diagnostic voice probe", srcDefault: "default (little speaking data — take a lesson or the probe for accuracy)",
    gateTitle: "The simulation starts at level A2",
    gateBody: "Your speaking isn't there yet — build the base in live lessons with Ahu first: they have translations, hints and support.",
    gateCta: "To a live lesson →",
    micDenied: "Microphone access is required — the simulation is voice-only.",
    busy: "All voice slots are busy — try again in a couple of minutes.",
    noMinutes: "You're out of voice minutes for today.",
    generic: "Couldn't start. Please try again.",
    prep3Title: "Discussion card", prep4Title: "Pick your topic",
    notesPh: "Your notes (visible only to you)…",
    ready: "Hazırım →", finish: "Bitirdim ✓", endExam: "Finish",
    cardBtn: "Open the card", partLabel: "Bölüm",
    reportTitle: "Written review", reportPending: "Preparing the review — usually 1-2 minutes…",
    reportFailed: "The review is still processing.", reportRetry: "Get the review",
    criteria: { fluency: "Fluency", grammar: "Grammar", vocab: "Vocabulary", coherence: "Coherence" },
    wentWell: "What went well", errors: "Errors", next: "Next steps", again: "Take it again",
    seconds: "s",
  },
  tr: {
    title: "Konuşma",
    subtitle: "Sözlü bölümün tam simülasyonu: dört bölüm, sadece Türkçe, ipucu yok. Sonunda yazılı değerlendirme.",
    parts: ["Bölüm 1 · Sorular", "Bölüm 2 · Durumlar", "Bölüm 3 · Tartışma", "Bölüm 4 · Uzun konuşma"],
    intro: ["Konulara göre sorular — kategori yüksek sesle söylenir", "İki durum: ikincisinde konuşmayı SEN başlatırsın", "Kartlı tartışma konusu · hazırlık 20 sn", "2 dakikaya kadar konuşma (not için 30 sn) + ek sorular"],
    start: "Başla →", starting: "Bağlanıyor…", level: "Simülasyon seviyesi",
    approx: "≈, merkezin kesin kuralları yayımlanmıyor",
    srcReviews: "son sesli derslerine göre", srcProbe: "tanılama ses denemesine göre", srcDefault: "varsayılan (konuşma verisi az — kesinlik için ders ya da deneme yap)",
    gateTitle: "Simülasyon A2 seviyesinden başlar",
    gateBody: "Konuşman için henüz erken — önce Ahu ile canlı derslerde temel oluştur: orada çeviri, ipucu ve destek var.",
    gateCta: "Canlı derse →",
    micDenied: "Mikrofon erişimi gerekli — simülasyon yalnızca seslidir.",
    busy: "Tüm ses hatları dolu — birkaç dakika sonra dene.",
    noMinutes: "Bugünkü ses dakikaların bitti.",
    generic: "Başlatılamadı. Tekrar dene.",
    prep3Title: "Tartışma kartı", prep4Title: "Konunu seç",
    notesPh: "Notların (sadece sen görürsün)…",
    ready: "Hazırım →", finish: "Bitirdim ✓", endExam: "Bitir",
    cardBtn: "Kartı aç", partLabel: "Bölüm",
    reportTitle: "Yazılı değerlendirme", reportPending: "Değerlendirme hazırlanıyor — genellikle 1-2 dakika…",
    reportFailed: "Değerlendirme hâlâ işleniyor.", reportRetry: "Değerlendirmeyi al",
    criteria: { fluency: "Akıcılık", grammar: "Dil bilgisi", vocab: "Kelime", coherence: "Tutarlılık" },
    wentWell: "İyi gidenler", errors: "Hatalar", next: "Sonraki adımlar", again: "Tekrar dene",
    seconds: "sn",
  },
  kk: {
    title: "Konuşma",
    subtitle: "Ауызша бөлімнің толық симуляциясы: төрт бөлім, тек түрікше, кеңессіз. Соңында жазбаша талдау.",
    parts: ["Bölüm 1 · Сұрақтар", "Bölüm 2 · Жағдаяттар", "Bölüm 3 · Талқылау", "Bölüm 4 · Әңгіме"],
    intro: ["Тақырып бойынша сұрақтар — санат дауыстап аталады", "Екі жағдаят: екіншісінде әңгімені СЕН бастайсың", "Тезистер картасы бар тақырып · дайындыққа 20 сек", "2 минутқа дейін әңгіме (жазбаға 30 сек) + қосымша сұрақтар"],
    start: "Başla →", starting: "Қосылуда…", level: "Симуляция деңгейі",
    approx: "≈, орталықтың нақты ережесі жарияланбайды",
    srcReviews: "соңғы дауыстық сабақтар бойынша", srcProbe: "диагностика дауыс сынамасы бойынша", srcDefault: "әдепкі (сөйлеу дерегі аз — дәлдік үшін сабақ немесе сынама өт)",
    gateTitle: "Симуляция A2 деңгейінен басталады",
    gateBody: "Сөйлеуің үшін әлі ерте — алдымен Ahu-мен тірі сабақтарда негіз қала: онда аударма, кеңес және қолдау бар.",
    gateCta: "Тірі сабаққа →",
    micDenied: "Микрофонға рұқсат қажет — симуляция тек дауыспен өтеді.",
    busy: "Барлық дауыс слоттары бос емес — бірнеше минуттан кейін көр.",
    noMinutes: "Бүгінгі дауыс минуттары бітті.",
    generic: "Бастау мүмкін болмады. Қайта көр.",
    prep3Title: "Талқылау картасы", prep4Title: "Тақырыбыңды таңда",
    notesPh: "Жазбаларың (тек өзің көресің)…",
    ready: "Hazırım →", finish: "Bitirdim ✓", endExam: "Аяқтау",
    cardBtn: "Картаны ашу", partLabel: "Bölüm",
    reportTitle: "Жазбаша талдау", reportPending: "Талдау дайындалуда — әдетте 1-2 минут…",
    reportFailed: "Талдау әлі өңделуде.", reportRetry: "Талдауды алу",
    criteria: { fluency: "Еркіндік", grammar: "Грамматика", vocab: "Лексика", coherence: "Байланыстылық" },
    wentWell: "Жақсы шыққаны", errors: "Қателер", next: "Келесі қадамдар", again: "Қайта өту",
    seconds: "сек",
  },
};

type KonusmaMaterials = {
  level: string;
  approx: boolean;
  partSeconds: [number, number, number, number];
  prepSeconds: { bolum3: number; bolum4: number };
  roleACard: string;
  roleBCard: string;
  discussion: { topicTr: string; bulletsTr: string[] };
  monologueTopics: string[];
  levelSource: "voice_reviews" | "diagnostic_probe" | "default_a2";
  score20: number | null;
};

type Phase = "idle" | "starting" | "live" | "ended";
type Prep = { kind: "prep3" | "prep4"; left: number } | null;
type Line = { source: "user" | "ai"; text: string };

export default function KonusmaPage() {
  return (
    <ConversationProvider>
      <KonusmaExam />
    </ConversationProvider>
  );
}

function KonusmaExam() {
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [phase, setPhase] = useState<Phase>("idle");
  const [err, setErr] = useState<"gate" | "mic" | "busy" | "noMinutes" | "generic" | null>(null);
  const [mat, setMat] = useState<KonusmaMaterials | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [part, setPart] = useState(0); // 0..3
  const [partElapsed, setPartElapsed] = useState(0);
  const [prep, setPrep] = useState<Prep>(null);
  const [showRoleB, setShowRoleB] = useState(false);
  const [prep3Done, setPrep3Done] = useState(false);
  const [prep4Done, setPrep4Done] = useState(false);
  const [notes, setNotes] = useState("");
  const [settle, setSettle] = useState<{ minutes: number | null; seconds: number; report: VoiceReport | null; reportState?: string } | null>(null);
  const [reportPending, setReportPending] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const convIdRef = useRef<string | null>(null);
  const settlingRef = useRef(false);
  const maxSecondsRef = useRef(1080);
  const elapsedRef = useRef(0);
  const partRef = useRef(0);
  const prepRef = useRef<Prep>(null);
  const timeUpSentRef = useRef<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onMessage: (event) => {
      const e = event as { type?: string; user_transcription_event?: { user_transcript?: string }; agent_response_event?: { agent_response?: string } };
      if (e.type === "user_transcript" && e.user_transcription_event?.user_transcript) {
        setLines((l) => [...l, { source: "user", text: e.user_transcription_event!.user_transcript! }]);
      } else if (e.type === "agent_response" && e.agent_response_event?.agent_response) {
        const text = e.agent_response_event.agent_response;
        setLines((l) => [...l, { source: "ai", text }]);
        // маркеры сценария → карточки и таймеры подготовки
        const cue = detectKonusmaCue(text);
        if (cue === "roleB") {
          setShowRoleB(true);
          setPart((p) => Math.max(p, 1));
        } else if (cue === "prep3" && !prepRef.current) {
          setPart((p) => Math.max(p, 2));
          setPartElapsed(0);
          setPrep({ kind: "prep3", left: matRef.current?.prepSeconds.bolum3 ?? 20 });
        } else if (cue === "prep4" && !prepRef.current) {
          setPart(3);
          setPartElapsed(0);
          setPrep({ kind: "prep4", left: matRef.current?.prepSeconds.bolum4 ?? 30 });
        }
      }
    },
    onDisconnect: () => void settleSession(),
    onError: () => {
      if (phase === "starting") {
        setErr("generic");
        setPhase("idle");
      }
    },
  });
  const { status } = conversation;
  const matRef = useRef<KonusmaMaterials | null>(null);
  useEffect(() => {
    matRef.current = mat;
  }, [mat]);
  useEffect(() => {
    partRef.current = part;
  }, [part]);
  useEffect(() => {
    prepRef.current = prep;
  }, [prep]);

  useEffect(() => {
    if (status === "connected") {
      setPhase((p) => (p === "starting" ? "live" : p));
      if (!convIdRef.current) {
        try {
          convIdRef.current = conversation.getId();
          window.localStorage.setItem("lingopro:pending-voice", convIdRef.current);
        } catch {
          /* not ready yet */
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // хвост незакрытой сессии (вкладку закрыли) — биллинг идемпотентен
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

  // подготовка: mute + карточка + countdown; sendUserActivity каждые 4с
  // держит turn-таймер агента — он молчит, пока студент думает
  useEffect(() => {
    if (!prep) return;
    conversation.setMuted(true);
    const act = setInterval(() => {
      try {
        conversation.sendUserActivity();
      } catch {
        /* соединение мигнуло */
      }
    }, 4000);
    const tick = setInterval(() => {
      setPrep((p) => (p ? { ...p, left: p.left - 1 } : p));
    }, 1000);
    return () => {
      clearInterval(act);
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prep?.kind]);

  useEffect(() => {
    if (prep && prep.left <= 0) finishPrep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prep?.left]);

  function finishPrep() {
    const kind = prepRef.current?.kind;
    setPrep(null);
    if (kind === "prep3") setPrep3Done(true);
    if (kind === "prep4") setPrep4Done(true);
    conversation.setMuted(false);
    try {
      conversation.sendUserMessage("Hazırım");
    } catch {
      /* соединение мигнуло — агент подхватит по тишине */
    }
  }

  // локальный секундомер: общий + по частям (во время подготовки часть стоит);
  // конец бюджета части → однократный сигнал агенту перейти дальше
  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => {
      elapsedRef.current += 1;
      if (elapsedRef.current >= maxSecondsRef.current) conversation.endSession();
      if (prepRef.current) return; // подготовка — вне тайминга частей
      setPartElapsed((s) => {
        const m = matRef.current;
        const p = partRef.current;
        if (m && p < 3 && s + 1 >= m.partSeconds[p] && !timeUpSentRef.current.has(p)) {
          timeUpSentRef.current.add(p);
          try {
            conversation.sendContextualUpdate("Süre doldu, sonraki bölüme geç");
          } catch {
            /* ignore */
          }
          setPart(p + 1);
          return 0;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  async function start() {
    setErr(null);
    setPhase("starting");
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErr("mic");
      setPhase("idle");
      return;
    }
    let data: {
      conversationToken: string;
      voiceId: string;
      maxSeconds: number;
      dynamicVariables: Record<string, string>;
      firstMessage?: string;
      konusma?: KonusmaMaterials;
    };
    try {
      const res = await fetch("/api/voice/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "sinav", feedbackLang: locale }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.error === "speaking_gate" ? "gate" : d.error === "busy" ? "busy" : d.error === "no_minutes" ? "noMinutes" : "generic");
        setPhase("idle");
        return;
      }
      data = await res.json();
    } catch {
      setErr("generic");
      setPhase("idle");
      return;
    }
    if (!data.konusma) {
      setErr("generic");
      setPhase("idle");
      return;
    }
    setMat(data.konusma);
    matRef.current = data.konusma;
    maxSecondsRef.current = data.maxSeconds;
    setLines([]);
    setPart(0);
    setPartElapsed(0);
    elapsedRef.current = 0;
    timeUpSentRef.current = new Set();
    setShowRoleB(false);
    setPrep3Done(false);
    setPrep4Done(false);
    setSettle(null);
    settlingRef.current = false;
    convIdRef.current = null;
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
    setErr("generic");
    setPhase("idle");
  }

  async function settleSession() {
    if (settlingRef.current || !convIdRef.current) return;
    settlingRef.current = true;
    setPhase("ended");
    setPrep(null);
    setReportPending(true);
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        let res: Response | null = null;
        try {
          res = await fetch("/api/voice/session/end", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ conversationId: convIdRef.current }),
          });
        } catch {
          /* сеть мигнула */
        }
        if (res?.ok) {
          window.localStorage.removeItem("lingopro:pending-voice");
          const d = await res.json();
          setSettle(d);
          if ((d.minutes ?? 0) > 0) {
            void awardXp("speaking_test", XP.SPEAKING_TEST, {
              dedupKey: `voice:${convIdRef.current}`,
              metadata: { conversationId: convIdRef.current, seconds: d.seconds, mode: "sinav" },
            });
          }
          setReportPending(false);
          return;
        }
        if (attempt < 2) await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
      }
      settlingRef.current = false;
    } finally {
      setReportPending(false);
    }
  }

  async function retryReport() {
    if (!convIdRef.current || retrying) return;
    setRetrying(true);
    try {
      const res = await fetch("/api/voice/session/end", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId: convIdRef.current }),
      });
      if (res.ok) {
        const d = await res.json();
        setSettle((prev) => (prev ? { ...prev, report: d.report ?? prev.report, reportState: d.reportState } : d));
      }
    } catch {
      /* кнопка остаётся */
    } finally {
      setRetrying(false);
    }
  }

  const srcLabel = mat?.levelSource === "voice_reviews" ? c.srcReviews : mat?.levelSource === "diagnostic_probe" ? c.srcProbe : c.srcDefault;
  const report = settle?.report && settle.report.valid ? settle.report : null;
  const inCall = phase === "live";

  return (
    <div>
      <SectionBack />
      <h2 className="text-xl font-bold tracking-tight">🎤 {c.title}</h2>
      <p className="mt-1 max-w-xl text-sm text-[var(--color-muted)]">{c.subtitle}</p>

      {/* ------------------------------- idle ------------------------------ */}
      {phase === "idle" && (
        <div className="glass mt-5 rounded-3xl p-6">
          {err === "gate" ? (
            <div className="rounded-2xl bg-[#d97706]/10 p-5">
              <div className="text-base font-semibold text-[#92400e]">{c.gateTitle}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-[#92400e]">{c.gateBody}</p>
              <Link href="/dashboard/speaking/live" className="btn-primary mt-4 inline-block rounded-full px-5 py-2.5 text-sm font-semibold">
                {c.gateCta}
              </Link>
            </div>
          ) : (
            <>
              <ol className="flex flex-col gap-2.5">
                {c.parts.map((p, i) => (
                  <li key={p} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-xs font-bold text-[var(--color-brand)]">{i + 1}</span>
                    <span>
                      <span className="font-semibold text-[var(--color-foreground)]">{p}</span>
                      <span className="block text-xs text-[var(--color-muted)]">{c.intro[i]}</span>
                    </span>
                  </li>
                ))}
              </ol>
              {err && (
                <div className="mt-4 rounded-xl bg-[#dc2626]/10 px-4 py-3 text-sm text-[#b91c1c]">
                  {err === "mic" ? c.micDenied : err === "busy" ? c.busy : err === "noMinutes" ? c.noMinutes : c.generic}
                </div>
              )}
              <button type="button" onClick={start} className="btn-primary mt-5 rounded-full px-8 py-3.5 text-base font-semibold">
                {c.start}
              </button>
            </>
          )}
        </div>
      )}

      {phase === "starting" && (
        <div className="glass mt-5 flex items-center gap-3 rounded-3xl p-6 text-sm text-[var(--color-muted)]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
          {c.starting}
        </div>
      )}

      {/* ------------------------------- live ------------------------------ */}
      {(inCall || phase === "ended") && mat && (
        <div className="mt-5 flex flex-col gap-4">
          {/* уровень + таймлайн частей */}
          <div className="glass rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-muted)]">
              <span>
                {c.level}: <b className="text-[var(--color-brand)]">{mat.level}</b>
                {mat.approx && <span className="ml-1">({c.approx})</span>} · {srcLabel}
              </span>
              {inCall && (
                <span className="tabular-nums font-semibold text-[var(--color-foreground)]">
                  {c.partLabel} {part + 1} · {Math.floor(Math.max(0, mat.partSeconds[part] - partElapsed) / 60)}:{String(Math.max(0, mat.partSeconds[part] - partElapsed) % 60).padStart(2, "0")}
                </span>
              )}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {c.parts.map((p, i) => (
                <div key={p} className="flex flex-col gap-1">
                  <div className={`h-1.5 rounded-full ${i < part ? "bg-[var(--color-brand)]" : i === part && inCall ? "bg-[var(--color-brand)]/60" : "bg-black/[0.08]"}`} />
                  <span className={`text-[10px] leading-tight ${i === part && inCall ? "font-semibold text-[var(--color-foreground)]" : "text-[var(--color-muted)]"}`}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* карточки ситуаций (Bölüm 2) — как «карточка в руках» */}
          {inCall && part === 1 && (
            <div className="glass rounded-2xl border-l-4 border-[var(--color-brand)] p-4">
              <div className="text-sm leading-relaxed text-[var(--color-foreground)]">{showRoleB ? mat.roleBCard : mat.roleACard}</div>
            </div>
          )}
          {/* карточка обсуждения после подготовки — остаётся на экране */}
          {inCall && part === 2 && prep3Done && !prep && (
            <div className="glass rounded-2xl border-l-4 border-[var(--color-brand-2)] p-4">
              <div className="text-sm font-semibold text-[var(--color-foreground)]">{mat.discussion.topicTr}</div>
              <ul className="mt-2 flex flex-col gap-1 text-xs text-[var(--color-muted)]">
                {mat.discussion.bulletsTr.map((b) => (
                  <li key={b}>• {b}</li>
                ))}
              </ul>
            </div>
          )}
          {/* заметки студента в Bölüm 4 */}
          {inCall && part === 3 && prep4Done && !prep && notes.trim() && (
            <div className="glass rounded-2xl p-4">
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-[var(--color-muted)]">{notes}</p>
            </div>
          )}

          {/* транскрипт */}
          <div ref={scrollRef} className="glass max-h-72 overflow-y-auto rounded-2xl p-4">
            {lines.map((l, i) => (
              <p key={i} className={`mb-2 text-sm leading-relaxed ${l.source === "ai" ? "text-[var(--color-foreground)]" : "text-[var(--color-brand)]"}`}>
                {l.source === "ai" ? "👩‍🏫 " : "🎙 "}
                {l.text}
              </p>
            ))}
          </div>

          {inCall && (
            <div className="flex flex-wrap items-center gap-2">
              {/* фолбэк: маркер не пойман — карточку можно открыть руками */}
              {part === 2 && !prep3Done && !prep && (
                <button type="button" onClick={() => setPrep({ kind: "prep3", left: mat.prepSeconds.bolum3 })} className="btn-ghost rounded-full px-4 py-2 text-sm">
                  {c.cardBtn}
                </button>
              )}
              {part === 3 && !prep4Done && !prep && (
                <button type="button" onClick={() => setPrep({ kind: "prep4", left: mat.prepSeconds.bolum4 })} className="btn-ghost rounded-full px-4 py-2 text-sm">
                  {c.cardBtn}
                </button>
              )}
              {/* Bitirdim: досрочный финиш монолога */}
              {part === 3 && prep4Done && (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      conversation.sendUserMessage("Bitirdim");
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="btn-ghost rounded-full px-4 py-2 text-sm font-semibold"
                >
                  {c.finish}
                </button>
              )}
              <button type="button" onClick={() => conversation.endSession()} className="ml-auto rounded-full bg-[#dc2626]/10 px-5 py-2 text-sm font-semibold text-[#b91c1c]">
                {c.endExam}
              </button>
            </div>
          )}
        </div>
      )}

      {/* --------------------- оверлей подготовки (20с/30с) ------------------ */}
      {prep && mat && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--color-foreground)]">{prep.kind === "prep3" ? c.prep3Title : c.prep4Title}</h3>
              <span className="rounded-full bg-[var(--color-brand)]/10 px-3 py-1 text-sm font-bold tabular-nums text-[var(--color-brand)]">
                {Math.max(0, prep.left)} {c.seconds}
              </span>
            </div>
            {prep.kind === "prep3" ? (
              <>
                <div className="mt-3 text-sm font-semibold text-[var(--color-foreground)]">{mat.discussion.topicTr}</div>
                <ul className="mt-2 flex flex-col gap-1.5 text-sm text-[var(--color-muted)]">
                  {mat.discussion.bulletsTr.map((b) => (
                    <li key={b}>• {b}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <ol className="mt-3 flex flex-col gap-1.5 text-sm text-[var(--color-foreground)]">
                  {mat.monologueTopics.map((t, i) => (
                    <li key={t}>
                      <b>{i + 1})</b> {t}
                    </li>
                  ))}
                </ol>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={c.notesPh}
                  className="mt-3 w-full resize-none rounded-xl border border-black/[0.1] p-3 text-sm outline-none focus:border-[var(--color-brand)]"
                />
              </>
            )}
            <button type="button" onClick={finishPrep} className="btn-primary mt-4 w-full rounded-full px-6 py-3 text-sm font-semibold">
              {c.ready}
            </button>
          </div>
        </motion.div>
      )}

      {/* ------------------------------ разбор ------------------------------ */}
      {phase === "ended" && (
        <div className="glass mt-4 rounded-3xl p-6">
          <h3 className="text-base font-semibold text-[var(--color-foreground)]">{c.reportTitle}</h3>
          {reportPending && (
            <div className="mt-3 flex items-center gap-3 text-sm text-[var(--color-muted)]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
              {c.reportPending}
            </div>
          )}
          {!reportPending && !report && (
            <div className="mt-3 text-sm text-[var(--color-muted)]">
              {c.reportFailed}{" "}
              <button type="button" disabled={retrying} onClick={retryReport} className="font-semibold text-[var(--color-brand)] underline disabled:opacity-50">
                {c.reportRetry}
              </button>
            </div>
          )}
          {report && (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {(["fluency", "grammar", "vocab", "coherence"] as const).map((k) => (
                  <span key={k} className="rounded-full bg-[var(--color-brand)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-brand)]">
                    {c.criteria[k]} · {report.criteria[k].score}/5
                  </span>
                ))}
              </div>
              {report.went_well && (
                <div className="rounded-xl bg-[#16a34a]/[0.07] p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#15803d]">{c.wentWell}</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-foreground)]">{report.went_well}</p>
                </div>
              )}
              <p className="text-sm leading-relaxed text-[var(--color-foreground)]">{report.summary}</p>
              {report.errors.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#d97706]">{c.errors}</div>
                  <ul className="mt-2 flex flex-col gap-2">
                    {report.errors.map((e, i) => (
                      <li key={i} className="rounded-xl bg-black/[0.03] p-3 text-sm">
                        <span className="rounded bg-[#dc2626]/10 px-1.5 py-0.5 text-[#b91c1c] line-through">{e.quote}</span>{" "}
                        <span aria-hidden>→</span>{" "}
                        <span className="rounded bg-[#16a34a]/10 px-1.5 py-0.5 text-[#15803d]">{e.correction}</span>
                        <div className="mt-1 text-xs text-[var(--color-muted)]">{e.explanation}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.next_steps.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)]">{c.next}</div>
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-[var(--color-foreground)]">
                    {report.next_steps.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setPhase("idle");
                  setMat(null);
                  setErr(null);
                }}
                className="btn-ghost w-fit rounded-full px-5 py-2.5 text-sm font-medium"
              >
                {c.again}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
