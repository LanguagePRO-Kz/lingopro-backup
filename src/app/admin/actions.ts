"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Server actions админ-панели (Фаза 9). Каждая action сама проверяет
 * ADMIN_EMAIL — форму можно дёрнуть в обход страницы. service_role живёт
 * только здесь (сервер); клиенту не утекает.
 */

const ACCESS_DAYS: Record<string, number> = { "1m": 30, "3m": 90, "6m": 180, trial: 3 };

async function requireAdmin(): Promise<{ ok: true } | { ok: false }> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return { ok: false };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email && user.email.toLowerCase() === adminEmail.toLowerCase() ? { ok: true } : { ok: false };
}

/** Выдать/продлить план (стакинг как в вебхуке: платный остаток не сгорает). */
export async function grantPlanAction(formData: FormData): Promise<void> {
  if (!(await requireAdmin()).ok) return;
  const userId = String(formData.get("userId") ?? "");
  const pkg = String(formData.get("package") ?? "");
  const days = ACCESS_DAYS[pkg];
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !days) return;

  const admin = createAdminClient();
  if (!admin) return;
  const { data: prof } = await admin.from("profiles").select("plan, plan_expires_at").eq("id", userId).maybeSingle();
  const nowMs = Date.now();
  const currentMs = prof?.plan_expires_at ? Date.parse(prof.plan_expires_at as string) : 0;
  const baseMs = prof?.plan && prof.plan !== "trial" && currentMs > nowMs ? currentMs : nowMs;
  const { error } = await admin
    .from("profiles")
    .update({ plan: pkg, plan_expires_at: new Date(baseMs + days * 86_400_000).toISOString() })
    .eq("id", userId);
  if (error) console.error("[admin] grant failed:", error.message);
  revalidatePath("/admin");
}

/** Отозвать доступ (план снимается; история оплат не трогается). */
export async function revokePlanAction(formData: FormData): Promise<void> {
  if (!(await requireAdmin()).ok) return;
  const userId = String(formData.get("userId") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return;
  const admin = createAdminClient();
  if (!admin) return;
  const { error } = await admin.from("profiles").update({ plan: null, plan_expires_at: null }).eq("id", userId);
  if (error) console.error("[admin] revoke failed:", error.message);
  revalidatePath("/admin");
}

/** Оплата получена вручную (Kaspi перевод / наличные / ИП) → книга продаж + доступ. */
export async function manualPaymentAction(formData: FormData): Promise<void> {
  if (!(await requireAdmin()).ok) return;
  const userId = String(formData.get("userId") ?? "");
  const pkg = String(formData.get("package") ?? "");
  const amountKzt = Math.round(Number(formData.get("amount") ?? 0));
  const note = String(formData.get("note") ?? "").slice(0, 300);
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !ACCESS_DAYS[pkg] || pkg === "trial" || !Number.isFinite(amountKzt) || amountKzt <= 0) return;

  const admin = createAdminClient();
  if (!admin) return;
  const { error: payErr } = await admin.from("payments").insert({
    user_id: userId,
    provider: "manual",
    package_id: pkg,
    currency: "kzt",
    amount_minor: amountKzt * 100, // тиыны
    status: "paid",
    paid_at: new Date().toISOString(),
    note,
  });
  if (payErr) {
    console.error("[admin] manual payment insert failed:", payErr.message);
    return; // доступ без строки в книге продаж не выдаём — сначала учёт
  }
  await grantPlanAction(formData);
}
