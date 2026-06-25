"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { AppleButton } from "@/components/ui/AppleButton";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { loadPlan } from "@/lib/billing";

const T = {
  ru: {
    title: "С возвращением",
    subtitle: "Войди, чтобы продолжить подготовку.",
    google: "Продолжить с Google",
    apple: "Продолжить с Apple",
    or: "или",
    email: "Email",
    password: "Пароль",
    submit: "Войти",
    no: "Нет аккаунта?",
    create: "Создать",
  },
  en: {
    title: "Welcome back",
    subtitle: "Sign in to continue your preparation.",
    google: "Continue with Google",
    apple: "Continue with Apple",
    or: "or",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    no: "No account yet?",
    create: "Create one",
  },
  tr: {
    title: "Tekrar hoş geldin",
    subtitle: "Hazırlığına devam etmek için giriş yap.",
    google: "Google ile devam et",
    apple: "Apple ile devam et",
    or: "veya",
    email: "E-posta",
    password: "Şifre",
    submit: "Giriş yap",
    no: "Hesabın yok mu?",
    create: "Oluştur",
  },
  kk: {
    title: "Қайта келдің",
    subtitle: "Дайындықты жалғастыру үшін кір.",
    google: "Google арқылы жалғастыру",
    apple: "Apple арқылы жалғастыру",
    or: "немесе",
    email: "Email",
    password: "Құпиясөз",
    submit: "Кіру",
    no: "Аккаунтың жоқ па?",
    create: "Жасау",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const c = pick(locale, T);

  function go() {
    router.push(loadPlan() ? "/dashboard" : "/pricing");
  }

  return (
    <PageShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong w-full max-w-md rounded-3xl p-8"
      >
        <h1 className="text-2xl font-bold tracking-tight">{c.title}</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{c.subtitle}</p>

        <div className="mt-6 flex flex-col gap-3">
          <GoogleButton label={c.google} onClick={go} />
          <AppleButton label={c.apple} onClick={go} />
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-[var(--color-muted)]">
          <span className="h-px flex-1 bg-black/[0.08]" /> {c.or} <span className="h-px flex-1 bg-black/[0.08]" />
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            go();
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-muted)]">{c.email}</span>
            <input
              type="email"
              required
              autoComplete="email"
              className="rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition-all placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-muted)]">{c.password}</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition-all placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
            />
          </label>
          <button type="submit" className="btn-primary mt-2 rounded-full px-6 py-3.5 text-sm">
            {c.submit}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
          {c.no}{" "}
          <Link href="/register" className="font-medium text-[var(--color-brand)] hover:underline">
            {c.create}
          </Link>
        </p>
      </motion.div>
    </PageShell>
  );
}
