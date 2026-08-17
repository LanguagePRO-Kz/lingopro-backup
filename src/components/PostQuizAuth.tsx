"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { createClient } from "@/lib/supabase/client";
import { authErrorRu, isRateLimit } from "@/lib/auth-errors";
import { signUpAndSync } from "@/lib/signup-flow";
import { saveProfileResult } from "@/lib/profile";
import { loadResult, clearResult } from "@/lib/quiz";

const NEXT = "/quiz/result";

const T = {
  ru: {
    title: "Мы определили ваш уровень!",
    subtitle: "Создайте аккаунт, чтобы увидеть результат и начать подготовку.",
    google: "Продолжить с Google",
    apple: "Продолжить с Apple",
    soon: "Скоро",
    or: "или",
    name: "Имя",
    email: "Email",
    password: "Пароль",
    signup: "Создать аккаунт",
    signin: "Войти",
    creating: "Создаём…",
    signingIn: "Входим…",
    haveAccount: "Уже есть аккаунт?",
    noAccount: "Нет аккаунта?",
    toSignin: "Войти",
    toSignup: "Создать",
    successTitle: "Регистрация прошла успешно! 🎉",
    successText: "Аккаунт создан, результат сохранён.",
    seeResults: "Посмотреть результаты →",
    rateLimit: "Слишком много попыток. Подождите 30 секунд и попробуйте снова.",
    retryIn: (n: number) => `Попробовать снова через ${n}с…`,
  },
  en: {
    title: "We've assessed your level!",
    subtitle: "Create an account to see your result and start preparing.",
    google: "Continue with Google",
    apple: "Continue with Apple",
    soon: "Soon",
    or: "or",
    name: "Name",
    email: "Email",
    password: "Password",
    signup: "Create account",
    signin: "Sign in",
    creating: "Creating…",
    signingIn: "Signing in…",
    haveAccount: "Already have an account?",
    noAccount: "No account yet?",
    toSignin: "Sign in",
    toSignup: "Create one",
    successTitle: "Registration successful! 🎉",
    successText: "Your account is created and the result is saved.",
    seeResults: "See your results →",
    rateLimit: "Too many attempts. Please wait 30 seconds and try again.",
    retryIn: (n: number) => `Try again in ${n}s…`,
  },
  tr: {
    title: "Seviyeni belirledik!",
    subtitle: "Sonucunu görmek ve hazırlığa başlamak için hesap oluştur.",
    google: "Google ile devam et",
    apple: "Apple ile devam et",
    soon: "Yakında",
    or: "veya",
    name: "Ad",
    email: "E-posta",
    password: "Şifre",
    signup: "Hesap oluştur",
    signin: "Giriş yap",
    creating: "Oluşturuluyor…",
    signingIn: "Giriş yapılıyor…",
    haveAccount: "Zaten hesabın var mı?",
    noAccount: "Hesabın yok mu?",
    toSignin: "Giriş yap",
    toSignup: "Oluştur",
    successTitle: "Kayıt başarılı! 🎉",
    successText: "Hesabın oluşturuldu ve sonucun kaydedildi.",
    seeResults: "Sonuçları gör →",
    rateLimit: "Çok fazla deneme. Lütfen 30 saniye bekleyip tekrar dene.",
    retryIn: (n: number) => `${n}sn sonra tekrar dene…`,
  },
  kk: {
    title: "Деңгейіңді анықтадық!",
    subtitle: "Нәтижені көру және дайындықты бастау үшін аккаунт жаса.",
    google: "Google арқылы жалғастыру",
    apple: "Apple арқылы жалғастыру",
    soon: "Жақында",
    or: "немесе",
    name: "Аты",
    email: "Email",
    password: "Құпиясөз",
    signup: "Аккаунт жасау",
    signin: "Кіру",
    creating: "Жасалуда…",
    signingIn: "Кіру…",
    haveAccount: "Аккаунтың бар ма?",
    noAccount: "Аккаунтың жоқ па?",
    toSignin: "Кіру",
    toSignup: "Жасау",
    successTitle: "Тіркелу сәтті өтті! 🎉",
    successText: "Аккаунт жасалды, нәтиже сақталды.",
    seeResults: "Нәтижелерді көру →",
    rateLimit: "Тым көп әрекет. 30 секунд күтіп, қайталап көріңіз.",
    retryIn: (n: number) => `${n}с кейін қайталап көріңіз…`,
  },
};

export function PostQuizAuth() {
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // rate-limit countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // the success screen was an extra click before the result (UX-audit #8) —
  // auto-continue after a beat; the button stays as a fallback
  useEffect(() => {
    if (!success) return;
    const id = setTimeout(() => (window.location.href = NEXT), 1600);
    return () => clearTimeout(id);
  }, [success]);

  function handleAuthError(message: string) {
    if (isRateLimit(message)) {
      setCooldown(30);
      setError(c.rateLimit);
    } else {
      setError(authErrorRu(message));
    }
  }

  async function handleGoogle() {
    const supabase = createClient();
    // свежая диагностика: её takenAt заведомо новее профильного, и сервер
    // сам приведёт на NEXT — там результат мигрирует в БД (маршрут решает
    // /auth/callback по профилю, а не localStorage)
    const at = loadResult()?.takenAt ?? 0;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?at=${at}` },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || cooldown > 0) return;
    setError(null);
    setLoading(true);

    if (mode === "signin") {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setLoading(false);
        handleAuthError(signInError.message);
        return;
      }
      // migrate the anonymous result, then head to the result page
      const local = loadResult();
      if (local && data.user) {
        await saveProfileResult(local);
        clearResult();
      }
      setSuccess(true);
      return;
    }

    // sign up (auto sign-in inside the helper if confirmation is on)
    if (name.trim()) window.localStorage.setItem("lingopro:name", name.trim());
    const res = await signUpAndSync(email, password, name.trim());
    setLoading(false);
    if (!res.ok) {
      handleAuthError(res.error);
      return;
    }
    setSuccess(true);
  }

  const inputCls =
    "rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition-all placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15";

  const submitLabel = cooldown > 0
    ? c.retryIn(cooldown)
    : loading
      ? mode === "signup" ? c.creating : c.signingIn
      : mode === "signup" ? c.signup : c.signin;

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
              onClick={() => (window.location.href = NEXT)}
              className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 text-sm"
            >
              {c.seeResults}
            </button>
          </motion.div>
        ) : (
          <>
            <div className="mb-1 flex justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-2)]/15 text-3xl text-[var(--color-brand-2)]">
                🎯
              </span>
            </div>
            <h1 className="text-center text-2xl font-bold tracking-tight">{c.title}</h1>
            <p className="mt-2 text-center text-sm text-[var(--color-muted)]">{c.subtitle}</p>

            {/* Apple removed until it works — a dead «Скоро» button on the
                conversion gate erodes trust (UX-audit #6) */}
            <div className="mt-6 flex flex-col gap-3">
              <GoogleButton label={c.google} onClick={handleGoogle} />
            </div>

            <div className="my-5 flex items-center gap-3 text-xs text-[var(--color-muted)]">
              <span className="h-px flex-1 bg-black/[0.08]" /> {c.or} <span className="h-px flex-1 bg-black/[0.08]" />
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--color-muted)]">{c.name}</span>
                  <input type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                </label>
              )}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--color-muted)]">{c.email}</span>
                <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--color-muted)]">{c.password}</span>
                <input
                  type="password"
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                />
              </label>
              {error && <p className="text-sm font-medium text-[#dc2626]">{error}</p>}
              <button type="submit" disabled={loading || cooldown > 0} className="btn-primary mt-1 rounded-full px-6 py-3.5 text-sm disabled:opacity-60">
                {submitLabel}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
              {mode === "signup" ? c.haveAccount : c.noAccount}{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode((m) => (m === "signup" ? "signin" : "signup"));
                }}
                className="font-medium text-[var(--color-brand)] hover:underline"
              >
                {mode === "signup" ? c.toSignin : c.toSignup}
              </button>
            </p>
          </>
        )}
      </motion.div>
    </PageShell>
  );
}
