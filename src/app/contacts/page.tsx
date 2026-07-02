"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { Background } from "@/components/ui/Background";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const CONTENT = {
  ru: {
    title: "Контакты",
    connectTitle: "Связаться с нами",
    phoneLabel: "Телефон",
    formTitle: "Форма обратной связи",
    name: "Имя",
    namePh: "Ваше имя",
    message: "Сообщение",
    messagePh: "Ваше сообщение",
    submit: "Отправить",
    sending: "Отправляем…",
    errName: "Введите имя.",
    errEmail: "Введите корректный email.",
    errMessage: "Введите сообщение.",
    success: "Спасибо! Мы ответим в течение 24 часов.",
  },
  en: {
    title: "Contacts",
    connectTitle: "Get in touch",
    phoneLabel: "Phone",
    formTitle: "Contact form",
    name: "Name",
    namePh: "Your name",
    message: "Message",
    messagePh: "Your message",
    submit: "Send",
    sending: "Sending…",
    errName: "Please enter your name.",
    errEmail: "Please enter a valid email.",
    errMessage: "Please enter a message.",
    success: "Thank you! We'll reply within 24 hours.",
  },
  tr: {
    title: "İletişim",
    connectTitle: "Bize ulaşın",
    phoneLabel: "Telefon",
    formTitle: "İletişim formu",
    name: "Ad",
    namePh: "Adınız",
    message: "Mesaj",
    messagePh: "Mesajınız",
    submit: "Gönder",
    sending: "Gönderiliyor…",
    errName: "Lütfen adınızı girin.",
    errEmail: "Lütfen geçerli bir email girin.",
    errMessage: "Lütfen bir mesaj girin.",
    success: "Teşekkürler! 24 saat içinde yanıtlayacağız.",
  },
  kk: {
    title: "Байланыс",
    connectTitle: "Бізбен байланысу",
    phoneLabel: "Телефон",
    formTitle: "Кері байланыс формасы",
    name: "Аты",
    namePh: "Атыңыз",
    message: "Хабарлама",
    messagePh: "Хабарламаңыз",
    submit: "Жіберу",
    sending: "Жіберілуде…",
    errName: "Атыңызды енгізіңіз.",
    errEmail: "Дұрыс email енгізіңіз.",
    errMessage: "Хабарлама енгізіңіз.",
    success: "Рахмет! 24 сағат ішінде жауап береміз.",
  },
};

export default function ContactsPage() {
  const { t, locale } = useI18n();
  const c = pick(locale, CONTENT);

  const CONTACTS = [
    { Icon: Mail, label: "Email", value: "lingopro2026@gmail.com", href: "mailto:lingopro2026@gmail.com" },
    { Icon: Phone, label: c.phoneLabel, value: "+7 707 366 17 47", href: "tel:+77073661747" },
    { Icon: MessageCircle, label: "WhatsApp", value: "+7 707 366 17 47", href: "https://wa.me/77073661747" },
  ];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

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
    if (!message.trim()) {
      setError(c.errMessage);
      return;
    }

    setLoading(true);
    const payload = { name: name.trim(), email: email.trim(), message: message.trim() };

    try {
      const { error: dbError } = await createClient().from("contact_messages").insert(payload);
      if (dbError) throw dbError;
    } catch {
      // fallback: открыть письмо на lingopro2026@gmail.com
      const body = encodeURIComponent(`Имя: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`);
      window.location.href = `mailto:lingopro2026@gmail.com?subject=${encodeURIComponent("Обращение с сайта — " + payload.name)}&body=${body}`;
    }

    setLoading(false);
    setSent(true);
  }

  const inputCls =
    "w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition-all placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15";

  return (
    <>
      <Background />

      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight">
            Lingo<span className="text-gradient">PRO</span>
          </span>
        </Link>
        <Link href="/" className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]">
          ← {t.pages.back}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-8 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.title}</h1>

        {/* связаться */}
        <h2 className="mt-8 text-lg font-semibold text-[var(--color-foreground)]">{c.connectTitle}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {CONTACTS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="glass flex flex-col gap-2 rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                <item.Icon size={20} />
              </div>
              <span className="text-xs font-medium text-[var(--color-muted)]">{item.label}</span>
              <span className="text-sm font-semibold text-[var(--color-foreground)]">{item.value}</span>
            </a>
          ))}
        </div>

        {/* форма */}
        <h2 className="mt-10 text-lg font-semibold text-[var(--color-foreground)]">{c.formTitle}</h2>
        <div className="glass-strong mt-4 rounded-3xl p-6 sm:p-8">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-2)]/15 text-3xl text-[var(--color-brand-2)]">
                ✓
              </div>
              <p className="text-lg font-semibold text-[var(--color-foreground)]">
                {c.success}
              </p>
            </motion.div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={submit}>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--color-muted)]">{c.name}</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={c.namePh} required className={inputCls} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--color-muted)]">Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className={inputCls} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--color-muted)]">{c.message}</span>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={c.messagePh} rows={4} required className={`${inputCls} resize-y`} />
              </label>

              {error && <p className="text-sm font-medium text-[#dc2626]">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary mt-1 rounded-full px-6 py-3.5 text-sm disabled:opacity-60">
                {loading ? c.sending : c.submit}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
