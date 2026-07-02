"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { createClient } from "@/lib/supabase/client";
import { Reveal } from "./ui/Reveal";

type Content = {
  title: string;
  text: string;
  cta: string;
  modalTitle: string;
  modalText: string;
  name: string;
  phone: string;
  social: string;
  submit: string;
  sending: string;
  doneTitle: string;
  doneText: string;
  close: string;
  errName: string;
  errEmail: string;
};

const CONTENT: { ru: Content; en: Content; tr: Content; kk: Content } = {
  ru: {
    title: "Стать UGC-креатором",
    text: "Снимай короткие видео для LingoPRO и получай вознаграждение.",
    cta: "Подробнее →",
    modalTitle: "Стать UGC-креатором",
    modalText: "Оставь контакты — расскажем условия и вознаграждение.",
    name: "Имя",
    phone: "Телефон",
    social: "Ссылка на профиль (Instagram / TikTok)",
    submit: "Отправить заявку",
    sending: "Отправляем…",
    doneTitle: "Заявка отправлена!",
    doneText: "Спасибо! Мы свяжемся с вами в течение 24 часов 🎬",
    close: "Закрыть",
    errName: "Введите имя.",
    errEmail: "Введите корректный email.",
  },
  en: {
    title: "Become a UGC creator",
    text: "Make short videos for LingoPRO and earn a reward.",
    cta: "Learn more →",
    modalTitle: "Become a UGC creator",
    modalText: "Leave your contacts — we'll share the terms and reward.",
    name: "Name",
    phone: "Phone",
    social: "Profile link (Instagram / TikTok)",
    submit: "Send application",
    sending: "Sending…",
    doneTitle: "Application sent!",
    doneText: "Thanks! We'll get in touch within 24 hours 🎬",
    close: "Close",
    errName: "Please enter your name.",
    errEmail: "Please enter a valid email.",
  },
  tr: {
    title: "UGC içerik üreticisi ol",
    text: "LingoPRO için kısa videolar çek ve ödül kazan.",
    cta: "Daha fazla →",
    modalTitle: "UGC içerik üreticisi ol",
    modalText: "İletişim bilgilerini bırak — koşulları ve ödülü paylaşalım.",
    name: "Ad",
    phone: "Telefon",
    social: "Profil bağlantısı (Instagram / TikTok)",
    submit: "Başvuru gönder",
    sending: "Gönderiliyor…",
    doneTitle: "Başvuru gönderildi!",
    doneText: "Teşekkürler! 24 saat içinde seninle iletişime geçeceğiz 🎬",
    close: "Kapat",
    errName: "Lütfen adını gir.",
    errEmail: "Lütfen geçerli bir email gir.",
  },
  kk: {
    title: "UGC-креатор болу",
    text: "LingoPRO үшін қысқа видеолар түсір де сыйақы ал.",
    cta: "Толығырақ →",
    modalTitle: "UGC-креатор болу",
    modalText: "Байланыс қалдыр — шарттар мен сыйақыны айтамыз.",
    name: "Аты",
    phone: "Телефон",
    social: "Профиль сілтемесі (Instagram / TikTok)",
    submit: "Өтінім жіберу",
    sending: "Жіберілуде…",
    doneTitle: "Өтінім жіберілді!",
    doneText: "Рахмет! 24 сағат ішінде сізбен байланысамыз 🎬",
    close: "Жабу",
    errName: "Атыңды енгіз.",
    errEmail: "Дұрыс email енгіз.",
  },
};

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export function UGCCreator() {
  const { locale } = useI18n();
  const c = pick(locale, CONTENT);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [social, setSocial] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setSocial("");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    if (!name.trim()) {
      setError(c.errName);
      return;
    }
    if (!isEmail(email)) {
      setError(c.errEmail);
      return;
    }

    setLoading(true);
    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      social_link: social.trim() || null,
    };

    try {
      const { error: dbError } = await createClient().from("ugc_applications").insert(payload);
      if (dbError) throw dbError;
    } catch {
      // backup: открыть письмо на lingopro2026@gmail.com
      const body = encodeURIComponent(
        `Имя: ${payload.name}\nEmail: ${payload.email}\nТелефон: ${payload.phone ?? "—"}\nПрофиль: ${payload.social_link ?? "—"}`,
      );
      window.location.href = `mailto:lingopro2026@gmail.com?subject=${encodeURIComponent("UGC-заявка — " + payload.name)}&body=${body}`;
    }

    setLoading(false);
    setSent(true);
    reset();
    setTimeout(() => setOpen(false), 2000);
  }

  const inputCls =
    "rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition-all placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15";

  return (
    <section className="px-4 pb-20 pt-4 sm:pb-28">
      <Reveal className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12">
          <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "linear-gradient(120deg, #6d5bff, #5b8cff 50%, #19c6b3)" }} />
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
                reset();
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
                  <form className="mt-6 flex flex-col gap-3" onSubmit={submit}>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder={c.name} aria-label={c.name} className={inputCls} />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" aria-label="Email" className={inputCls} />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" aria-label={c.phone} className={inputCls} />
                    <input type="text" value={social} onChange={(e) => setSocial(e.target.value)} placeholder={c.social} aria-label={c.social} className={inputCls} />
                    {error && <p className="text-sm font-medium text-[#dc2626]">{error}</p>}
                    <button type="submit" disabled={loading} className="btn-primary mt-1 rounded-full px-6 py-3.5 text-sm disabled:opacity-60">
                      {loading ? c.sending : c.submit}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-2)]/15 text-3xl text-[var(--color-brand-2)]">
                    ✓
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">{c.doneTitle}</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{c.doneText}</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
