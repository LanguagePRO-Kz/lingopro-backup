"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { createClient } from "@/lib/supabase/client";
import { fetchProfile } from "@/lib/profile";
import { loadResult } from "@/lib/quiz";
import { postAuthDestination } from "@/lib/auth-destination";
import { authErrorRu } from "@/lib/auth-errors";

const T = {
  ru: {
    title: "С возвращением",
    subtitle: "Войди, чтобы продолжить подготовку.",
    google: "Продолжить с Google",
    apple: "Продолжить с Apple",
    soon: "Скоро",
    or: "или",
    email: "Email",
    password: "Пароль",
    submit: "Войти",
    loading: "Входим…",
    no: "Нет аккаунта?",
    create: "Создать",
    authFailed: "Не удалось войти. Попробуйте ещё раз.",
  },
  en: {
    title: "Welcome back",
    subtitle: "Sign in to continue your preparation.",
    google: "Continue with Google",
    apple: "Continue with Apple",
    soon: "Soon",
    or: "or",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    loading: "Signing in…",
    no: "No account yet?",
    create: "Create one",
    authFailed: "Sign-in failed. Please try again.",
  },
  tr: {
    title: "Tekrar hoş geldin",
    subtitle: "Hazırlığına devam etmek için giriş yap.",
    google: "Google ile devam et",
    apple: "Apple ile devam et",
    soon: "Yakında",
    or: "veya",
    email: "E-posta",
    password: "Şifre",
    submit: "Giriş yap",
    loading: "Giriş yapılıyor…",
    no: "Hesabın yok mu?",
    create: "Oluştur",
    authFailed: "Giriş başarısız oldu. Lütfen tekrar deneyin.",
  },
  kk: {
    title: "Қайта келдің",
    subtitle: "Дайындықты жалғастыру үшін кір.",
    google: "Google арқылы жалғастыру",
    apple: "Apple арқылы жалғастыру",
    soon: "Жақында",
    or: "немесе",
    email: "Email",
    password: "Құпиясөз",
    submit: "Кіру",
    loading: "Кіру…",
    no: "Аккаунтың жоқ па?",
    create: "Жасау",
    authFailed: "Кіру сәтсіз аяқталды. Қайталап көріңіз.",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // surface a failed OAuth/email-link callback (redirected here with ?error=)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "auth_failed") {
      setError(c.authFailed);
    }
  }, [c.authFailed]);

  async function handleGoogleLogin() {
    const supabase = createClient();
    // маршрут после входа выбирает СЕРВЕР по профилю (/auth/callback);
    // отсюда уезжает только время локального результата диагностики
    const at = loadResult()?.takenAt ?? 0;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?at=${at}` },
    });
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoading(false);
      setError(authErrorRu(signInError.message));
      return;
    }

    // то же правило, что и в /auth/callback: решает профиль, а не localStorage.
    // Дальше кабинет сам развернёт на /quiz или /pricing своим гейтом.
    const profile = await fetchProfile();
    router.push(
      postAuthDestination(profile?.quiz_result?.takenAt ?? 0, loadResult()?.takenAt ?? 0),
    );
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
          <GoogleButton label={c.google} onClick={handleGoogleLogin} />
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-[var(--color-muted)]">
          <span className="h-px flex-1 bg-black/[0.08]" /> {c.or} <span className="h-px flex-1 bg-black/[0.08]" />
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSignIn}>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-muted)]">{c.email}</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition-all placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-muted)]">{c.password}</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition-all placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
            />
          </label>
          {error && <p className="text-sm font-medium text-[#dc2626]">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary mt-2 rounded-full px-6 py-3.5 text-sm disabled:opacity-60">
            {loading ? c.loading : c.submit}
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
