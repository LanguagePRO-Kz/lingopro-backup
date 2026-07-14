import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "./DashboardShell";

/**
 * Серверный гейт дашборда (P0-2): доступ решает ТОЛЬКО сервер по БД —
 * auth-сессия + активный план (plan is not null AND plan_expires_at > now()).
 * localStorage и любое клиентское состояние на доступ не влияют; страницы
 * без плана не рендерятся вообще (redirect до рендера). API платных фич
 * защищены отдельно (requireActivePlan в каждом роуте) — клиент, дёргающий
 * API напрямую, упирается в 402 независимо от этого гейта.
 */
/** Активность плана на момент запроса (RSC — вычисляется на каждый запрос). */
function accessState(plan: string | null, planExpiresAt: string | null) {
  const now = Date.now();
  const expiresAt = planExpiresAt ? Date.parse(planExpiresAt) : null;
  const active = !!plan && expiresAt != null && expiresAt > now;
  // сырой остаток в ms; в дни/часы переводит trialLeftLabel (честное
  // округление вниз — Math.ceil здесь показывал «4 дня» у 3-дневного триала
  // при секундном перекосе часов БД и сервера рендера)
  const trialMsLeft =
    active && plan === "trial" && expiresAt != null ? expiresAt - now : null;
  return { active, trialMsLeft };
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at, quiz_result")
    .eq("id", user.id)
    .maybeSingle();

  // воронка: без диагностики — на квиз (он бесплатный вход в продукт)
  if (!profile?.quiz_result) redirect("/quiz");

  const { active, trialMsLeft } = accessState(
    (profile.plan as string | null) ?? null,
    (profile.plan_expires_at as string | null) ?? null,
  );
  if (!active) redirect("/pricing");

  return (
    <DashboardShell plan={profile.plan as string} trialMsLeft={trialMsLeft}>
      {children}
    </DashboardShell>
  );
}
