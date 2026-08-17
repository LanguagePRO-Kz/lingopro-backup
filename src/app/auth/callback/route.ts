import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeResult } from "@/lib/quiz";
import { postAuthDestination } from "@/lib/auth-destination";

/** Маршруты воронки: их выбирает сервер по профилю, ?next= их не навязывает. */
const FUNNEL_ROUTES = new Set(["/dashboard", "/quiz", "/quiz/result"]);

/**
 * OAuth / email-link callback. Exchanges the `code` for a session and decides
 * where the student lands — by the PROFILE, not by the browser's localStorage
 * (see postAuthDestination). `?next=` is honoured only for non-funnel routes
 * (deep links из писем). On any failure we send the user to
 * /login?error=auth_failed — never to the landing page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "";
  // только внутренний путь: "//evil.com" и абсолютные URL не пропускаем
  const deepLink =
    rawNext.startsWith("/") && !rawNext.startsWith("//") && !FUNNEL_ROUTES.has(rawNext) ? rawNext : null;
  // время локального результата диагностики (клиент передаёт число, не маршрут)
  const localTakenAt = Number(searchParams.get("at")) || 0;

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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${deepLink ?? (await funnelRoute(supabase, data.session?.user?.id, localTakenAt))}`);
    }
    // причина — в серверный лог: у юзера остаётся общий auth_failed
    console.error("[auth/callback] exchange failed:", error.message);
  } else {
    console.error("[auth/callback] no code in query:", searchParams.toString().slice(0, 200));
  }

  return NextResponse.redirect(`${base}/login?error=auth_failed`);
}

/**
 * Точка воронки по РЕАЛЬНОМУ профилю: есть сохранённый результат диагностики
 * (и он не старее локального) → кабинет, иначе → /quiz/result. Сессия уже
 * обменяна, так что select идёт под RLS самого студента. Не смогли прочитать
 * профиль — ведём в кабинет: там стоит серверный гейт, который сам развернёт
 * на /quiz или /pricing (правило 1.3: отсутствие данных ≠ «результата нет»).
 */
async function funnelRoute(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string | undefined,
  localTakenAt: number,
): Promise<string> {
  if (!userId) return "/dashboard";
  const { data, error } = await supabase
    .from("profiles")
    .select("quiz_result")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("[auth/callback] profile read failed:", error.message);
    return "/dashboard";
  }
  return postAuthDestination(sanitizeResult(data?.quiz_result)?.takenAt ?? 0, localTakenAt);
}
