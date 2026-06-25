"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { Reveal } from "./ui/Reveal";

type Content = {
  title: string;
  text: string;
  cta: string;
  modalTitle: string;
  modalText: string;
  name: string;
  social: string;
  submit: string;
  doneTitle: string;
  doneText: string;
  close: string;
};

const CONTENT: { ru: Content; en: Content; tr: Content; kk: Content } = {
  ru: {
    title: "Стать UGC-креатором",
    text: "Снимай короткие видео для LingoPRO и получай вознаграждение.",
    cta: "Подробнее →",
    modalTitle: "Стать UGC-креатором",
    modalText: "Оставь контакты — расскажем условия и вознаграждение.",
    name: "Имя",
    social: "Ссылка на профиль (Instagram / TikTok)",
    submit: "Отправить заявку",
    doneTitle: "Заявка отправлена!",
    doneText: "Мы свяжемся с тобой и расскажем подробности.",
    close: "Закрыть",
  },
  en: {
    title: "Become a UGC creator",
    text: "Make short videos for LingoPRO and earn a reward.",
    cta: "Learn more →",
    modalTitle: "Become a UGC creator",
    modalText: "Leave your contacts — we'll share the terms and reward.",
    name: "Name",
    social: "Profile link (Instagram / TikTok)",
    submit: "Send application",
    doneTitle: "Application sent!",
    doneText: "We'll get in touch and share the details.",
    close: "Close",
  },
  tr: {
    title: "UGC içerik üreticisi ol",
    text: "LingoPRO için kısa videolar çek ve ödül kazan.",
    cta: "Daha fazla →",
    modalTitle: "UGC içerik üreticisi ol",
    modalText: "İletişim bilgilerini bırak — koşulları ve ödülü paylaşalım.",
    name: "Ad",
    social: "Profil bağlantısı (Instagram / TikTok)",
    submit: "Başvuru gönder",
    doneTitle: "Başvuru gönderildi!",
    doneText: "Seninle iletişime geçip ayrıntıları paylaşacağız.",
    close: "Kapat",
  },
  kk: {
    title: "UGC-креатор болу",
    text: "LingoPRO үшін қысқа видеолар түсір де сыйақы ал.",
    cta: "Толығырақ →",
    modalTitle: "UGC-креатор болу",
    modalText: "Байланыс қалдыр — шарттар мен сыйақыны айтамыз.",
    name: "Аты",
    social: "Профиль сілтемесі (Instagram / TikTok)",
    submit: "Өтінім жіберу",
    doneTitle: "Өтінім жіберілді!",
    doneText: "Сенімен байланысып, толық мәліметті айтамыз.",
    close: "Жабу",
  },
};

export function UGCCreator() {
  const { locale } = useI18n();
  const c = pick(locale, CONTENT);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section className="px-4 pb-20 pt-4 sm:pb-28">
      <Reveal className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12">
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{ background: "linear-gradient(120deg, #6d5bff, #5b8cff 50%, #19c6b3)" }}
          />
          <div aria-hidden className="dot-grid absolute inset-0 -z-10 opacity-20" />
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{c.title}</h2>
              <p className="mt-2 max-w-md text-sm text-white/85 sm:text-base">{c.text}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setOpen(true);
              }}
              className="shrink-0 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[var(--color-brand)] shadow-lg transition-transform hover:-translate-y-0.5"
            >
              {c.cta}
            </button>
          </div>
        </div>
      </Reveal>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={c.modalTitle}
          >
            <div className="absolute inset-0 bg-[var(--color-navy)]/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong relative z-10 w-full max-w-md rounded-3xl p-7"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={c.close}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-[var(--color-muted)] transition-colors hover:bg-black/[0.08] hover:text-[var(--color-foreground)]"
              >
                ✕
              </button>

              {!sent ? (
                <>
                  <h3 className="text-xl font-bold tracking-tight">{c.modalTitle}</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{c.modalText}</p>
                  <form
                    className="mt-6 flex flex-col gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSent(true);
                    }}
                  >
                    <input
                      type="text"
                      required
                      placeholder={c.name}
                      aria-label={c.name}
                      className="rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition-all placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
                    />
                    <input
                      type="email"
                      required
                      placeholder="you@email.com"
                      aria-label="Email"
                      className="rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition-all placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
                    />
                    <input
                      type="text"
                      placeholder={c.social}
                      aria-label={c.social}
                      className="rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition-all placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
                    />
                    <button type="submit" className="btn-primary mt-1 rounded-full px-6 py-3.5 text-sm">
                      {c.submit}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-2)]/15 text-3xl text-[var(--color-brand-2)]">
                    ✓
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{c.doneTitle}</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{c.doneText}</p>
                  <button type="button" onClick={() => setOpen(false)} className="btn-ghost mt-6 rounded-full px-6 py-3 text-sm font-medium">
                    {c.close}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
