"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { AppleButton } from "@/components/ui/AppleButton";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

const T = {
  ru: {
    title: "Создай аккаунт",
    subtitle: "Сохрани результат диагностики и начни персональную подготовку.",
    google: "Продолжить с Google",
    apple: "Продолжить с Apple",
    or: "или",
    name: "Имя",
    email: "Email",
    password: "Пароль",
    submit: "Создать аккаунт",
    have: "Уже есть аккаунт?",
    login: "Войти",
  },
  en: {
    title: "Create an account",
    subtitle: "Save your diagnostic result and start your personal preparation.",
    google: "Continue with Google",
    apple: "Continue with Apple",
    or: "or",
    name: "Name",
    email: "Email",
    password: "Password",
    submit: "Create account",
    have: "Already have an account?",
    login: "Sign in",
  },
  tr: {
    title: "Hesap oluştur",
    subtitle: "Teşhis sonucunu kaydet ve kişisel hazırlığına başla.",
    google: "Google ile devam et",
    apple: "Apple ile devam et",
    or: "veya",
    name: "Ad",
    email: "E-posta",
    password: "Şifre",
    submit: "Hesap oluştur",
    have: "Zaten hesabın var mı?",
    login: "Giriş yap",
  },
  kk: {
    title: "Аккаунт жасау",
    subtitle: "Диагностика нәтижесін сақтап, жеке дайындықты баста.",
    google: "Google арқылы жалғастыру",
    apple: "Apple арқылы жалғастыру",
    or: "немесе",
    name: "Аты",
    email: "Email",
    password: "Құпиясөз",
    submit: "Аккаунт жасау",
    have: "Аккаунтың бар ма?",
    login: "Кіру",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [name, setName] = useState("");

  function go() {
    router.push("/pricing");
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
            if (name.trim()) window.localStorage.setItem("lingopro:name", name.trim());
            router.push("/pricing");
          }}
        >
          <Field label={c.name} type="text" autoComplete="name" value={name} onChange={setName} />
          <Field label={c.email} type="email" autoComplete="email" />
          <Field label={c.password} type="password" autoComplete="new-password" />
          <button type="submit" className="btn-primary mt-2 rounded-full px-6 py-3.5 text-sm">
            {c.submit}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
          {c.have}{" "}
          <Link href="/login" className="font-medium text-[var(--color-brand)] hover:underline">
            {c.login}
          </Link>
        </p>
      </motion.div>
    </PageShell>
  );
}

function Field({
  label,
  type,
  autoComplete,
  value,
  onChange,
}: {
  label: string;
  type: string;
  autoComplete: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--color-muted)]">{label}</span>
      <input
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition-all placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
      />
    </label>
  );
}
