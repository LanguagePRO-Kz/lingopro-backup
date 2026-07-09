"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { fetchChecklistProgress, fetchOnboarded, setOnboarded } from "@/lib/onboarding";

/**
 * "Getting started" checklist — the welcome block of the onboarding
 * (founder's variant B: greeting + checklist + section hints, no big tour).
 * Every tick is REAL: recomputed from the student's own rows on each visit
 * and on window focus, never stored, never faked. Dismissable any time;
 * settings can bring it back.
 */

const T = {
  ru: {
    title: "С чего начать",
    sub: "Пять шагов, чтобы освоиться. Галочки появляются сами — по твоим настоящим действиям.",
    diagnostic: (lvl: string) => `Пройти диагностику — готово, твой уровень ${lvl}`,
    firstTask: "Сделать первую задачу из плана дня",
    firstTaskGo: "к плану",
    voice: "Провести первый голосовой урок с Ahu",
    voiceGo: "начать урок",
    essay: "Отправить первое письмо на проверку",
    essayGo: "к заданиям",
    tutor: "Задать вопрос тьютору",
    tutorGo: "написать",
    done: "Всё! Дальше платформа поведёт сама — просто выполняй план дня.",
    close: "Скрыть",
    reopenHint: "Вернуть чек-лист можно в настройках.",
  },
  en: {
    title: "Getting started",
    sub: "Five steps to find your feet. Ticks appear on their own — from what you actually do.",
    diagnostic: (lvl: string) => `Take the diagnostic — done, your level is ${lvl}`,
    firstTask: "Finish your first task from today's plan",
    firstTaskGo: "to the plan",
    voice: "Have your first voice lesson with Ahu",
    voiceGo: "start lesson",
    essay: "Send your first piece of writing for review",
    essayGo: "to the tasks",
    tutor: "Ask the tutor a question",
    tutorGo: "write",
    done: "That's it! The platform takes it from here — just follow your daily plan.",
    close: "Hide",
    reopenHint: "You can bring this back in settings.",
  },
  tr: {
    title: "Nereden başlamalı",
    sub: "Alışmak için beş adım. İşaretler kendiliğinden gelir — gerçekten yaptıklarınla.",
    diagnostic: (lvl: string) => `Teşhisi geç — tamam, seviyen ${lvl}`,
    firstTask: "Günün planından ilk görevi bitir",
    firstTaskGo: "plana git",
    voice: "Ahu ile ilk sesli dersini yap",
    voiceGo: "derse başla",
    essay: "İlk yazını incelemeye gönder",
    essayGo: "görevlere git",
    tutor: "Öğretmene bir soru sor",
    tutorGo: "yaz",
    done: "Bu kadar! Gerisini platform getirir — günün planını takip et yeter.",
    close: "Gizle",
    reopenHint: "Bu listeyi ayarlardan geri getirebilirsin.",
  },
  kk: {
    title: "Неден бастау керек",
    sub: "Үйреніп кетуге бес қадам. Белгілер өздігінен қойылады — нақты әрекеттеріңнен.",
    diagnostic: (lvl: string) => `Диагностикадан өту — дайын, деңгейің ${lvl}`,
    firstTask: "Күн жоспарынан алғашқы тапсырманы орында",
    firstTaskGo: "жоспарға",
    voice: "Ahu-мен алғашқы дауысты сабақты өткіз",
    voiceGo: "сабақты бастау",
    essay: "Алғашқы жазбаңды тексеруге жібер",
    essayGo: "тапсырмаларға",
    tutor: "Тьюторға сұрақ қой",
    tutorGo: "жазу",
    done: "Болды! Әрі қарай платформа өзі жетелейді — күн жоспарын орындай бер.",
    close: "Жасыру",
    reopenHint: "Бұл тізімді баптаулардан қайтаруға болады.",
  },
};

export function StartChecklist({ level, firstTaskDone }: { level: string; firstTaskDone: boolean }) {
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState({ voiceLesson: false, essay: false, tutor: false });
  const [byeNote, setByeNote] = useState(false);

  useEffect(() => {
    let active = true;
    // guaranteed test entrance: /dashboard?checklist=1 shows the card
    // regardless of any stored flags (founder verification / debugging)
    const forced = new URLSearchParams(window.location.search).get("checklist") === "1";
    if (forced) {
      setVisible(true);
      void fetchChecklistProgress().then((p) => active && setProgress(p));
    } else {
      fetchOnboarded().then((done) => {
        if (!active) return;
        if (done) {
          // observable reason instead of a silent no-show
          console.info("[onboarding] checklist hidden: dismissed earlier (reset in settings or open /dashboard?checklist=1)");
          return;
        }
        setVisible(true);
        void fetchChecklistProgress().then((p) => active && setProgress(p));
      });
    }
    // the student comes back from a section → the tick flips right away
    const refresh = () => void fetchChecklistProgress().then((p) => active && setProgress(p));
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
    };
  }, []);

  if (!visible) return null;

  const items = [
    { id: "diagnostic", done: true, label: c.diagnostic(level), href: null, go: null },
    { id: "firstTask", done: firstTaskDone, label: c.firstTask, href: "#plan", go: c.firstTaskGo },
    { id: "voice", done: progress.voiceLesson, label: c.voice, href: "/dashboard/speaking/live", go: c.voiceGo },
    // founder's call: the essay step opens the Writing task LIST — the
    // student picks something doable, we never lock them into one prompt
    { id: "essay", done: progress.essay, label: c.essay, href: "/dashboard/writing", go: c.essayGo },
    { id: "tutor", done: progress.tutor, label: c.tutor, href: "/dashboard/tutor", go: c.tutorGo },
  ] as const;
  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;

  function close() {
    setVisible(false);
    void setOnboarded(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-3xl border border-[var(--color-brand)]/20 bg-gradient-to-br from-[var(--color-brand)]/[0.05] to-[var(--color-brand-2)]/[0.05] p-6 sm:p-7"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--color-foreground)]">🧭 {c.title}</h2>
          <p className="mt-1 max-w-md text-sm text-[var(--color-muted)]">{c.sub}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold text-[var(--color-brand)]">{doneCount}/{items.length}</span>
          <button
            type="button"
            aria-label={c.close}
            onClick={() => (byeNote ? close() : setByeNote(true))}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-muted)] transition-colors hover:bg-black/[0.06]"
          >
            ✕
          </button>
        </div>
      </div>

      {byeNote && !allDone && (
        <button type="button" onClick={close} className="mt-2 text-xs text-[var(--color-muted)] underline-offset-2 hover:underline">
          {c.close} · {c.reopenHint}
        </button>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {items.map((it) => (
          <div
            key={it.id}
            className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm ${
              it.done ? "bg-[#16a34a]/[0.07] text-[var(--color-foreground)]" : "bg-white/70 text-[var(--color-foreground)]"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                it.done ? "bg-[#16a34a] text-white" : "border border-black/[0.2] text-transparent"
              }`}
            >
              ✓
            </span>
            <span className={`min-w-0 flex-1 ${it.done ? "opacity-70" : ""}`}>{it.label}</span>
            {!it.done && it.href && (
              <Link
                href={it.href}
                className="shrink-0 rounded-full bg-[var(--color-brand)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/20"
              >
                {it.go} →
              </Link>
            )}
          </div>
        ))}
      </div>

      {allDone && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#16a34a]/[0.08] px-4 py-3">
          <span className="text-sm font-semibold text-[#15803d]">🎉 {c.done}</span>
          <button type="button" onClick={close} className="rounded-full bg-[#16a34a] px-4 py-1.5 text-xs font-semibold text-white">
            {c.close}
          </button>
        </div>
      )}
    </motion.div>
  );
}
