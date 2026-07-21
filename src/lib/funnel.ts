/**
 * Штампы воронки оплаты — чтобы следующий разбор «где теряются люди» видел
 * шаг «дошёл до чекаута» и «пытался применить код», а не гадал по косвенным.
 * Пишется ПЕРВОЕ касание (only-if-NULL): нас интересует «дошёл ли вообще»,
 * не количество открытий. Запись сессией юзера (RLS update-own).
 */

import { createClient } from "@/lib/supabase/client";

export type FunnelStamp = "checkout_opened_at" | "promo_attempted_at";

/**
 * Изолированный best-effort: колонки приезжают миграцией 0021 — до её
 * применения апдейт тихо падает и ничего не ломает (урок exam-plan: одна
 * несуществующая колонка 400-ит весь update, поэтому штампы живут отдельным
 * запросом и никогда не едут в одном update с другими полями).
 */
export async function markFunnelOnce(col: FunnelStamp): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ [col]: new Date().toISOString() })
      .eq("id", user.id)
      .is(col, null);
  } catch {
    /* best-effort */
  }
}
