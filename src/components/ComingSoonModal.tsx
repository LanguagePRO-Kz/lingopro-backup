"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { examLang, type Exam } from "@/lib/exams";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

export function ComingSoonModal({ exam, onClose }: { exam: Exam | null; onClose: () => void }) {
  const { locale } = useI18n();
  const L = pick(locale, {
    ru: {
      soon: "скоро!",
      subtitle: (n: string) => `Оставь email и узнай первым о запуске подготовки к ${n}.`,
      notify: "Узнать о запуске",
      done: "Готово!",
      doneText: (e: string, n: string) => `Мы напишем на ${e}, как только запустим ${n}.`,
      close: "Закрыть",
    },
    en: {
      soon: "coming soon!",
      subtitle: (n: string) => `Leave your email and be the first to know when ${n} prep launches.`,
      notify: "Notify me",
      done: "Done!",
      doneText: (e: string, n: string) => `We'll email ${e} as soon as we launch ${n}.`,
      close: "Close",
    },
    tr: {
      soon: "yakında!",
      subtitle: (n: string) => `E-postanı bırak, ${n} hazırlığı başladığında ilk sen haberdar ol.`,
      notify: "Haber ver",
      done: "Tamam!",
      doneText: (e: string, n: string) => `${n} başladığında ${e} adresine yazacağız.`,
      close: "Kapat",
    },
    kk: {
      soon: "жақында!",
      subtitle: (n: string) => `Email қалдыр да, ${n} дайындығы іске қосылғанда бірінші болып біл.`,
      notify: "Хабарлау",
      done: "Дайын!",
      doneText: (e: string, n: string) => `${n} іске қосылған бойда ${e} мекенжайына жазамыз.`,
      close: "Жабу",
    },
  });
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  // Reset local state whenever the targeted exam changes.
  useEffect(() => {
    setEmail("");
    setSent(false);
  }, [exam]);

  useEffect(() => {
    if (!exam) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [exam, onClose]);

  return (
    <AnimatePresence>
      {exam && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${exam.name} — ${L.soon}`}
        >
          <div
            className="absolute inset-0 bg-[var(--color-navy)]/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong relative z-10 w-full max-w-md rounded-3xl p-7 text-center"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={L.close}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-[var(--color-muted)] transition-colors hover:bg-black/[0.08] hover:text-[var(--color-foreground)]"
            >
              ✕
            </button>

            {!sent ? (
              <>
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                  style={{ background: `${exam.color}1a` }}
                >
                  {exam.flag}
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  {exam.name} · {examLang(exam, locale)} — {L.soon}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{L.subtitle(exam.name)}</p>
                <form
                  className="mt-6 flex flex-col gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    aria-label="Email"
                    className="rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition-all placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
                  />
                  <button type="submit" className="btn-primary rounded-full px-6 py-3.5 text-sm">
                    {L.notify}
                  </button>
                </form>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-2)]/15 text-3xl text-[var(--color-brand-2)]">
                  ✓
                </div>
                <h3 className="text-xl font-bold tracking-tight">{L.done}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{L.doneText(email, exam.name)}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost mt-6 rounded-full px-6 py-3 text-sm font-medium"
                >
                  {L.close}
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
