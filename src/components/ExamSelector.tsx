"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EXAM_LIST, examLang } from "@/lib/exams";
import { useExam } from "@/lib/exam-context";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

export function ExamSelector() {
  const { examId, exam, selectExam } = useExam();
  const { t, locale } = useI18n();
  const aria = pick(locale, { ru: "Выбрать экзамен", en: "Choose exam", tr: "Sınav seç", kk: "Емтихан таңдау" });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={aria}
        className="btn-ghost flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium"
      >
        <span className="text-base leading-none">{exam.flag}</span>
        <span className="hidden sm:inline">{exam.name}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="glass-strong absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl p-1.5"
          >
            {EXAM_LIST.map((e) => {
              const active = e.id === examId;
              const soon = e.status === "coming_soon";
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      selectExam(e.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? "bg-black/[0.05] text-[var(--color-foreground)]"
                        : "text-[var(--color-foreground)] hover:bg-black/[0.04]"
                    }`}
                  >
                    <span className="text-lg leading-none">{e.flag}</span>
                    <span className="flex flex-col">
                      <span className="font-medium">{e.name}</span>
                      <span className="text-[11px] text-[var(--color-muted)]">{examLang(e, locale)}</span>
                    </span>
                    {soon ? (
                      <span className="ml-auto rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
                        {t.exams.soon}
                      </span>
                    ) : (
                      <span className="ml-auto rounded-full bg-[var(--color-brand-2)]/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-brand-2)]">
                        {t.exams.available}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
