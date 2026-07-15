"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

/**
 * Плавающая кнопка «Сообщить о проблеме» (Фаза 6): текст студента +
 * автоконтекст (страница, user agent; user_id и время ставит БД).
 * Таблица feedback, RLS «пишет свои» — сбой записи показывается честно.
 */

const T = {
  ru: {
    fab: "Сообщить о проблеме",
    title: "Что сломалось или мешает?",
    placeholder: "Опиши проблему — страница и техданные приложатся сами.",
    send: "Отправить", sending: "Отправляем…",
    done: "Спасибо! Мы посмотрим и починим.",
    fail: "Не отправилось — текст на месте, попробуй ещё раз.",
    authFirst: "Отправка работает после входа в аккаунт.",
    close: "Закрыть",
  },
  en: {
    fab: "Report a problem",
    title: "What's broken or in the way?",
    placeholder: "Describe the problem — the page and tech context attach automatically.",
    send: "Send", sending: "Sending…",
    done: "Thanks! We'll look into it.",
    fail: "Couldn't send — your text is safe, try again.",
    authFirst: "Sending works after you sign in.",
    close: "Close",
  },
  tr: {
    fab: "Sorun bildir",
    title: "Ne bozuk ya da ne engel oluyor?",
    placeholder: "Sorunu anlat — sayfa ve teknik bağlam otomatik eklenir.",
    send: "Gönder", sending: "Gönderiliyor…",
    done: "Teşekkürler! İnceleyip düzelteceğiz.",
    fail: "Gönderilemedi — metnin duruyor, tekrar dene.",
    authFirst: "Gönderme, giriş yaptıktan sonra çalışır.",
    close: "Kapat",
  },
  kk: {
    fab: "Мәселе туралы хабарлау",
    title: "Не бұзылды немесе не кедергі?",
    placeholder: "Мәселені сипатта — бет пен техникалық контекст өзі тіркеледі.",
    send: "Жіберу", sending: "Жіберілуде…",
    done: "Рақмет! Қарап, түзетеміз.",
    fail: "Жіберілмеді — мәтінің сақтаулы, қайта көр.",
    authFirst: "Жіберу аккаунтқа кіргеннен кейін жұмыс істейді.",
    close: "Жабу",
  },
};

export function FeedbackButton() {
  const pathname = usePathname();
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "fail" | "auth">("idle");

  async function send() {
    const message = text.trim();
    if (message.length < 3 || state === "sending") return;
    setState("sending");
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setState("auth");
        return;
      }
      const { error } = await supabase.from("feedback").insert({
        user_id: user.id,
        message,
        page: pathname,
        user_agent: navigator.userAgent.slice(0, 300),
      });
      if (error) {
        console.error("[feedback] insert failed:", error.message);
        setState("fail");
        return;
      }
      setState("done");
      setText("");
    } catch {
      setState("fail");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setState("idle");
        }}
        aria-label={c.fab}
        className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-black/[0.08] bg-white/90 text-lg shadow-lg backdrop-blur transition-transform hover:scale-105"
      >
        {/* правый низ: левый занят Next DevTools-бейджем в dev — кнопку там
            было физически не нажать (nextjs-portal перехватывал клики) */}
        🛠
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label={c.close}
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="fixed bottom-5 left-5 right-5 z-50 mx-auto max-w-md rounded-3xl border border-black/[0.08] bg-white p-5 shadow-2xl sm:left-auto sm:right-5 sm:w-96"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--color-foreground)]">🛠 {c.title}</h3>
                <button type="button" onClick={() => setOpen(false)} aria-label={c.close} className="rounded-lg px-2 py-1 text-sm text-[var(--color-muted)] hover:bg-black/[0.05]">
                  ✕
                </button>
              </div>

              {state === "done" ? (
                <p className="mt-3 text-sm text-[#16a34a]">✅ {c.done}</p>
              ) : (
                <>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={c.placeholder}
                    rows={4}
                    maxLength={2000}
                    className="mt-3 w-full resize-none rounded-2xl border border-black/[0.08] bg-black/[0.02] p-3 text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-brand)]/50"
                  />
                  {state === "fail" && <p className="mt-2 text-xs text-[#b91c1c]">{c.fail}</p>}
                  {state === "auth" && <p className="mt-2 text-xs text-[#92400e]">{c.authFirst}</p>}
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={text.trim().length < 3 || state === "sending"}
                    className="btn-primary mt-3 w-full rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                  >
                    {state === "sending" ? c.sending : c.send}
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
