"use client";

import { memo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import type { Intensity } from "@/lib/profile";

const T = {
  ru: {
    title: "Сколько времени в день вы готовы заниматься?",
    subtitle: "Выберите комфортный темп. Можно изменить в любой момент.",
    recommend: "Рекомендуем",
    cta: "Начать обучение →",
    close: "Закрыть",
    options: {
      light: { emoji: "🟢", name: "Лёгкий", time: "30–45 минут в день", text: "Подходит для занятых. Стабильный прогресс.", goal: "Достигнете цели за ~6 месяцев" },
      medium: { emoji: "🟡", name: "Средний", time: "45–60 минут в день", text: "Оптимальный баланс. Быстрый результат.", goal: "Достигнете цели за ~3–4 месяца" },
      intensive: { emoji: "🔴", name: "Интенсивный", time: "75–90 минут в день", text: "Для тех кто готовится к экзамену в ближайшее время.", goal: "Достигнете цели за ~2 месяца" },
    },
  },
  en: {
    title: "How much time a day can you study?",
    subtitle: "Pick a comfortable pace. You can change it anytime.",
    recommend: "Recommended",
    cta: "Start learning →",
    close: "Close",
    options: {
      light: { emoji: "🟢", name: "Light", time: "30–45 min a day", text: "Great for busy schedules. Steady progress.", goal: "Reach your goal in ~6 months" },
      medium: { emoji: "🟡", name: "Medium", time: "45–60 min a day", text: "The optimal balance. Fast results.", goal: "Reach your goal in ~3–4 months" },
      intensive: { emoji: "🔴", name: "Intensive", time: "75–90 min a day", text: "For those with an exam coming up soon.", goal: "Reach your goal in ~2 months" },
    },
  },
  tr: {
    title: "Günde ne kadar çalışabilirsin?",
    subtitle: "Rahat bir tempo seç. İstediğin zaman değiştirebilirsin.",
    recommend: "Önerilen",
    cta: "Öğrenmeye başla →",
    close: "Kapat",
    options: {
      light: { emoji: "🟢", name: "Hafif", time: "Günde 30–45 dakika", text: "Yoğun olanlar için. İstikrarlı ilerleme.", goal: "Hedefe ~6 ayda ulaş" },
      medium: { emoji: "🟡", name: "Orta", time: "Günde 45–60 dakika", text: "En iyi denge. Hızlı sonuç.", goal: "Hedefe ~3–4 ayda ulaş" },
      intensive: { emoji: "🔴", name: "Yoğun", time: "Günde 75–90 dakika", text: "Yakında sınava girecekler için.", goal: "Hedefe ~2 ayda ulaş" },
    },
  },
  kk: {
    title: "Күніне қанша уақыт айналыса аласыз?",
    subtitle: "Ыңғайлы қарқын таңдаңыз. Кез келген уақытта өзгертуге болады.",
    recommend: "Ұсынамыз",
    cta: "Оқуды бастау →",
    close: "Жабу",
    options: {
      light: { emoji: "🟢", name: "Жеңіл", time: "Күніне 30–45 минут", text: "Бос уақыты аз адамдарға. Тұрақты прогресс.", goal: "Мақсатқа ~6 айда жетесіз" },
      medium: { emoji: "🟡", name: "Орташа", time: "Күніне 45–60 минут", text: "Оңтайлы баланс. Жылдам нәтиже.", goal: "Мақсатқа ~3–4 айда жетесіз" },
      intensive: { emoji: "🔴", name: "Қарқынды", time: "Күніне 75–90 минут", text: "Жақында емтихан тапсыратындарға.", goal: "Мақсатқа ~2 айда жетесіз" },
    },
  },
};

const ORDER: Intensity[] = ["light", "medium", "intensive"];

function IntensityModalInner({
  open,
  current,
  onSelect,
  onClose,
}: {
  open: boolean;
  current?: Intensity | null;
  onSelect: (i: Intensity) => void;
  onClose?: () => void;
}) {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [choice, setChoice] = useState<Intensity>(current ?? "medium");
  const [busy, setBusy] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-[var(--color-navy)]/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 sm:p-8"
          >
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label={c.close}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-[var(--color-muted)] transition-colors hover:bg-black/[0.08]"
              >
                ✕
              </button>
            )}

            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{c.title}</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{c.subtitle}</p>

            <div className="mt-6 grid gap-3">
              {ORDER.map((id) => {
                const o = c.options[id];
                const active = choice === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setChoice(id)}
                    className={`relative flex items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? "border-[var(--color-brand)] bg-[var(--color-brand)]/[0.06] ring-1 ring-[var(--color-brand)]/40"
                        : "border-black/[0.08] bg-white hover:border-black/[0.16]"
                    }`}
                  >
                    <span className="text-2xl">{o.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-[var(--color-foreground)]">{o.name}</span>
                        <span className="text-sm text-[var(--color-muted)]">· {o.time}</span>
                        {id === "medium" && (
                          <span className="rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-2 py-0.5 text-[10px] font-bold text-white">
                            {c.recommend}
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-sm text-[var(--color-foreground)]">{o.text}</span>
                      <span className="mt-0.5 block text-xs font-medium text-[var(--color-brand)]">{o.goal}</span>
                    </span>
                    <span
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        active ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white" : "border-black/[0.2]"
                      }`}
                    >
                      {active && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                onSelect(choice);
              }}
              className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 text-sm disabled:opacity-60"
            >
              {c.cta}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const IntensityModal = memo(IntensityModalInner);
