import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / email-link callback. Exchanges the `code` for a session and forwards
 * to `next` (defaults to /dashboard). On any failure we send the user to
 * /login?error=auth_failed — never to the landing page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  // только внутренний путь: "//evil.com" и абсолютные URL не пропускаем
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  // За прокси (Vercel/балансер) origin из request.url может быть внутренним
  // хостом — реальный домен приходит в x-forwarded-host (официальный рецепт
  // Supabase для Next.js). Домен НЕ хардкодим: работает и на localhost,
  // и на проде, и на превью-деплоях.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const base =
    process.env.NODE_ENV === "development" || !forwardedHost
      ? origin
      : `https://${forwardedHost}`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${next}`);
    }
    // причина — в серверный лог: у юзера остаётся общий auth_failed
    console.error("[auth/callback] exchange failed:", error.message);
  } else {
    console.error("[auth/callback] no code in query:", searchParams.toString().slice(0, 200));
  }

  return NextResponse.redirect(`${base}/login?error=auth_failed`);
}
