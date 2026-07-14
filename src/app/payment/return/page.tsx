"use client";

/**
 * Возврат со страницы оплаты провайдера (returnUrl из checkout).
 * Доступ открывает ТОЛЬКО webhook (сервер) — здесь мы честно ждём его:
 * опрашиваем профиль до ~20 секунд; успех → дашборд; не дождались —
 * говорим прямо, что платёж ещё обрабатывается (без фейкового «успеха»).
 */

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { createClient } from "@/lib/supabase/client";
import { fetchProfile } from "@/lib/profile";


const T = {
  ru: {
    waiting: "Проверяем оплату…",
    waitingNote: "Обычно это занимает несколько секунд.",
    done: "Оплата получена! 🎉",
    doneNote: "Доступ открыт — переходим в кабинет…",
    slow: "Платёж ещё обрабатывается",
    slowNote: "Банк пока не подтвердил оплату. Доступ откроется автоматически — обнови страницу через минуту или зайди в кабинет позже.",
    retry: "Проверить ещё раз",
    home: "На главную",
  },
  en: {
    waiting: "Checking your payment…",
    waitingNote: "This usually takes a few seconds.",
    done: "Payment received! 🎉",
    doneNote: "Access granted — taking you to the dashboard…",
    slow: "Payment is still processing",
    slowNote: "The bank hasn't confirmed it yet. Access opens automatically — refresh in a minute or come back later.",
    retry: "Check again",
    home: "Home",
  },
  tr: {
    waiting: "Ödemen kontrol ediliyor…",
    waitingNote: "Bu genellikle birkaç saniye sürer.",
    done: "Ödeme alındı! 🎉",
    doneNote: "Erişim açıldı — panele yönlendiriliyorsun…",
    slow: "Ödeme hâlâ işleniyor",
    slowNote: "Banka henüz onaylamadı. Erişim otomatik açılır — bir dakika sonra yenile ya da daha sonra dön.",
    retry: "Tekrar kontrol et",
    home: "Ana sayfa",
  },
  kk: {
    waiting: "Төлем тексерілуде…",
    waitingNote: "Бұл әдетте бірнеше секунд алады.",
    done: "Төлем қабылданды! 🎉",
    doneNote: "Қолжетімділік ашылды — кабинетке өтеміз…",
    slow: "Төлем әлі өңделуде",
    slowNote: "Банк әлі растаған жоқ. Қолжетімділік автоматты ашылады — бір минуттан кейін жаңарт немесе кейінірек кір.",
    retry: "Қайта тексеру",
    home: "Басты бет",
  },
};

function ReturnInner() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [state, setState] = useState<"waiting" | "done" | "slow">("waiting");
  const [attempt, setAttempt] = useState(0);

  const pid = useSearchParams().get("pid");

  useEffect(() => {
    let cancelled = false;
    let tries = 0;

    // успех = наш журнал payments (RLS: читаем свои строки) — работает и для
    // пакетов доступа, и для пакетов минут; статус ставит только webhook
    async function poll() {
      if (cancelled) return;
      let paid = false;
      let itemId: string | null = null;

      if (pid) {
        const { data } = await createClient()
          .from("payments")
          .select("status, package_id")
          .eq("id", pid)
          .maybeSingle();
        paid = data?.status === "paid";
        itemId = (data?.package_id as string | null) ?? null;
      } else {
        // без pid (потеряли параметр) — старый путь: ждём флаг доступа
        const profile = await fetchProfile();
        paid = !!profile?.plan;
        itemId = (profile?.plan as string | null) ?? null;
      }
      if (cancelled) return;

      if (paid) {
        // доступ уже выдан сервером (вебхук → grant.ts); кэшей гейта нет (P0-2)
        setState("done");
        const dest = itemId?.startsWith("vp") ? "/dashboard/speaking/live" : "/dashboard";
        setTimeout(() => (window.location.href = dest), 1500);
        return;
      }
      tries += 1;
      if (tries >= 8) {
        setState("slow");
        return;
      }
      setTimeout(poll, 2500);
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [attempt, pid]);

  return (
    <PageShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong w-full max-w-md rounded-3xl p-8 text-center"
      >
        {state === "waiting" && (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--color-brand)]/25 border-t-[var(--color-brand)]" />
            <h1 className="mt-5 text-xl font-bold tracking-tight">{c.waiting}</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{c.waitingNote}</p>
          </>
        )}
        {state === "done" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-2)]/15 text-3xl text-[var(--color-brand-2)]">✓</div>
            <h1 className="mt-5 text-xl font-bold tracking-tight">{c.done}</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{c.doneNote}</p>
          </>
        )}
        {state === "slow" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f59e0b]/15 text-3xl">⏳</div>
            <h1 className="mt-5 text-xl font-bold tracking-tight">{c.slow}</h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{c.slowNote}</p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setState("waiting");
                  setAttempt((n) => n + 1);
                }}
                className="btn-primary rounded-full px-6 py-3 text-sm"
              >
                {c.retry}
              </button>
              <Link href="/" className="text-sm text-[var(--color-muted)] hover:underline">
                {c.home}
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </PageShell>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={null}>
      <ReturnInner />
    </Suspense>
  );
}
