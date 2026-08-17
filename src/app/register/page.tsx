"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { createClient } from "@/lib/supabase/client";
import { loadResult } from "@/lib/quiz";
import { signUpAndSync } from "@/lib/signup-flow";
import { authErrorRu, isRateLimit } from "@/lib/auth-errors";

const T = {
  ru: {
    title: "Создай аккаунт",
    subtitle: "Сохрани результат диагностики и начни персональную подготовку.",
    google: "Продолжить с Google",
    apple: "Продолжить с Apple",
    soon: "Скоро",
    or: "или",
    name: "Имя",
    email: "Email",
    password: "Пароль",
    submit: "Создать аккаунт",
    loading: "Создаём…",
    have: "Уже есть аккаунт?",
    login: "Войти",
    successTitle: "Регистрация прошла успешно! 🎉",
    successText: "Аккаунт создан, результат сохранён.",
    continueBtn: "Продолжить →",
    rateLimit: "Слишком много попыток. Подождите 30 секунд и попробуйте снова.",
    retryIn: (n: number) => `Попробовать снова через ${n}с…`,
  },
  en: {
    title: "Create an account",
    subtitle: "Save your diagnostic result and start your personal preparation.",
    google: "Continue with Google",
    apple: "Continue with Apple",
    soon: "Soon",
    or: "or",
    name: "Name",
    email: "Email",
    password: "Password",
    submit: "Create account",
    loading: "Creating…",
    have: "Already have an account?",
    login: "Sign in",
    successTitle: "Registration successful! 🎉",
    successText: "Your account is created and the result is saved.",
    continueBtn: "Continue →",
    rateLimit: "Too many attempts. Please wait 30 seconds and try again.",
    retryIn: (n: number) => `Try again in ${n}s…`,
  },
  tr: {
    title: "Hesap oluştur",
    subtitle: "Teşhis sonucunu kaydet ve kişisel hazırlığına başla.",
    google: "Google ile devam et",
    apple: "Apple ile devam et",
    soon: "Yakında",
    or: "veya",
    name: "Ad",
    email: "E-posta",
    password: "Şifre",
    submit: "Hesap oluştur",
    loading: "Oluşturuluyor…",
    have: "Zaten hesabın var mı?",
    login: "Giriş yap",
    successTitle: "Kayıt başarılı! 🎉",
    successText: "Hesabın oluşturuldu ve sonucun kaydedildi.",
    continueBtn: "Devam et →",
    rateLimit: "Çok fazla deneme. Lütfen 30 saniye bekleyip tekrar dene.",
    retryIn: (n: number) => `${n}sn sonra tekrar dene…`,
  },
  kk: {
    title: "Аккаунт жасау",
    subtitle: "Диагностика нәтижесін сақтап, жеке дайындықты баста.",
    google: "Google арқылы жалғастыру",
    apple: "Apple арқылы жалғастыру",
    soon: "Жақында",
    or: "немесе",
    name: "Аты",
    email: "Email",
    password: "Құпиясөз",
    submit: "Аккаунт жасау",
    loading: "Жасалуда…",
    have: "Аккаунтың бар ма?",
    login: "Кіру",
    successTitle: "Тіркелу сәтті өтті! 🎉",
    successText: "Аккаунт жасалды, нәтиже сақталды.",
    continueBtn: "Жалғастыру →",
    rateLimit: "Тым көп әрекет. 30 секунд күтіп, қайталап көріңіз.",
    retryIn: (n: number) => `${n}с кейін қайталап көріңіз…`,
  },
};

export default function RegisterPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // holds the "next" route
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  function handleAuthError(message: string) {
    if (isRateLimit(message)) {
      setCooldown(30);
      setError(c.rateLimit);
    } else {
      setError(authErrorRu(message));
    }
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    // маршрут после входа выбирает СЕРВЕР по профилю (/auth/callback):
    // у «нового» аккаунта может уже быть и результат, и оплата
    const at = loadResult()?.takenAt ?? 0;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?at=${at}` },
    });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (loading || cooldown > 0) return;
    setError(null);
    setLoading(true);
    if (name.trim()) window.localStorage.setItem("lingopro:name", name.trim());

    // capture the destination BEFORE the helper clears the local result
    const next = loadResult() ? "/quiz/result" : "/dashboard";
    const res = await signUpAndSync(email, password, name.trim());
    setLoading(false);
    if (!res.ok) {
      handleAuthError(res.error);
      return;
    }
    setSuccess(next);
  }

  const submitLabel = cooldown > 0 ? c.retryIn(cooldown) : loading ? c.loading : c.submit;

  return (
    <PageShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong w-full max-w-md rounded-3xl p-8"
      >
        {success ? (
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-2)]/15 text-4xl text-[var(--color-brand-2)]"
            >
              ✓
            </motion.div>
            <h1 className="text-xl font-bold tracking-tight">{c.successTitle}</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{c.successText}</p>
            <button
              type="button"
              onClick={() => (window.location.href = success)}
              className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 text-sm"
            >
              {c.continueBtn}
            </button>
          </motion.div>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight">{c.title}</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{c.subtitle}</p>

            <div className="mt-6 flex flex-col gap-3">
              <GoogleButton label={c.google} onClick={handleGoogleLogin} />
            </div>

            <div className="my-5 flex items-center gap-3 text-xs text-[var(--color-muted)]">
              <span className="h-px flex-1 bg-black/[0.08]" /> {c.or} <span className="h-px flex-1 bg-black/[0.08]" />
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSignUp}>
              <Field label={c.name} type="text" autoComplete="name" value={name} onChange={setName} />
              <Field label={c.email} type="email" autoComplete="email" value={email} onChange={setEmail} />
              <Field label={c.password} type="password" autoComplete="new-password" value={password} onChange={setPassword} />
              {error && <p className="text-sm font-medium text-[#dc2626]">{error}</p>}
              <button type="submit" disabled={loading || cooldown > 0} className="btn-primary mt-2 rounded-full px-6 py-3.5 text-sm disabled:opacity-60">
                {submitLabel}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
              {c.have}{" "}
              <Link href="/login" className="font-medium text-[var(--color-brand)] hover:underline">
                {c.login}
              </Link>
            </p>
          </>
        )}
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
