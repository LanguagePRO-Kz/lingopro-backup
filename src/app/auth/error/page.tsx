"use client";

import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

export default function AuthErrorPage() {
  const { locale } = useI18n();
  const c = pick(locale, {
    ru: { title: "Не удалось войти", text: "Что-то пошло не так при авторизации. Попробуй ещё раз.", back: "Вернуться ко входу" },
    en: { title: "Sign-in failed", text: "Something went wrong during authentication. Please try again.", back: "Back to sign in" },
    tr: { title: "Giriş başarısız", text: "Kimlik doğrulama sırasında bir sorun oluştu. Lütfen tekrar dene.", back: "Girişe dön" },
    kk: { title: "Кіру сәтсіз аяқталды", text: "Авторизация кезінде бір қате болды. Қайталап көр.", back: "Кіруге қайту" },
  });

  return (
    <PageShell>
      <div className="glass-strong w-full max-w-md rounded-3xl p-8 text-center">
        <h1 className="text-xl font-bold tracking-tight">{c.title}</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{c.text}</p>
        <Link href="/login" className="btn-primary mt-6 inline-block rounded-full px-6 py-3.5 text-sm">
          {c.back}
        </Link>
      </div>
    </PageShell>
  );
}
