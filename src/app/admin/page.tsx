import Link from "next/link";
import { notFound } from "next/navigation";
import { examFormat, type SectionId } from "@/lib/exam/format";
import { examReadiness, mergeSectionEstimates, type Readiness } from "@/lib/coach/readiness";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { grantPlanAction, manualPaymentAction, revokePlanAction } from "./actions";

/**
 * Админ-панель (Фаза 9) — ПАНЕЛЬ ГОТОВНОСТИ К ЭКЗАМЕНУ, не список юзеров.
 * Доступ: только ADMIN_EMAIL (env), остальным 404. Server component,
 * service_role не покидает сервер. Вердикт per-студент считает ТОТ ЖЕ
 * examReadiness, что и агент — одна правда на всех.
 */

export const dynamic = "force-dynamic";

const SECTIONS: SectionId[] = ["dinleme", "okuma", "yazma", "konusma"];
const VERDICT_RU: Record<Readiness["verdict"], { label: string; cls: string; rank: number }> = {
  not_ready: { label: "НЕ СДАСТ", cls: "bg-red-100 text-red-800", rank: 0 },
  borderline: { label: "на грани", cls: "bg-amber-100 text-amber-800", rank: 1 },
  ready: { label: "сдаст", cls: "bg-green-100 text-green-800", rank: 2 },
  no_promise: { label: "TYS: без прогноза балла", cls: "bg-slate-100 text-slate-700", rank: 3 },
  no_data: { label: "данных нет", cls: "bg-slate-100 text-slate-500", rank: 4 },
};

type Tab = "students" | "payments" | "broken" | "feedback";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  // причина каждого 404 — в серверный лог: три ветки снаружи неразличимы,
  // и «у основателя 404» иначе не диагностируется
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    console.warn("[admin] 404: ADMIN_EMAIL не задан в окружении (dev перезапускался после правки .env.local?)");
    notFound();
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userEmail = user?.email?.trim().toLowerCase();
  if (!userEmail || userEmail !== adminEmail) {
    console.warn(`[admin] 404: вошедший email не совпадает с ADMIN_EMAIL (вошёл: ${userEmail ?? "аноним"})`);
    notFound();
  }

  const admin = createAdminClient();
  if (!admin) {
    console.warn("[admin] 404: нет SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY");
    notFound();
  }

  const tab: Tab = (["students", "payments", "broken", "feedback"] as Tab[]).includes(
    (await searchParams).tab as Tab,
  )
    ? ((await searchParams).tab as Tab)
    : "students";

  /* ------------------------- батчевые данные ------------------------- */
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  // exam_format — изолированно: колонка едет миграцией 0017, её отсутствие
  // не должно валить всю панель (все получают дефолтный пресет)
  const fmtRes = await admin.from("profiles").select("id, exam_format");
  const fmtByUser = new Map((fmtRes.data ?? []).map((r) => [r.id as string, (r.exam_format as string | null) ?? null]));
  const [profilesRes, mocksRes, attempts7Res, usersRes] = await Promise.all([
    admin
      .from("profiles")
      .select("id, email, full_name, plan, plan_expires_at, target_level, exam_date, quiz_result, study_minutes_daily, created_at")
      .order("created_at", { ascending: false }),
    admin.from("mock_results").select("user_id, section_scores, created_at").order("created_at", { ascending: false }).limit(500),
    admin.from("attempts").select("user_id, is_correct, answered_at").gte("answered_at", weekAgo).limit(10000),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const lastSignIn = new Map(usersRes.data.users.map((u) => [u.id, u.last_sign_in_at ?? null]));
  const mocksByUser = new Map<string, { section_scores: Partial<Record<SectionId, number>> | null; created_at: string }[]>();
  for (const m of mocksRes.data ?? []) {
    const arr = mocksByUser.get(m.user_id as string) ?? [];
    arr.push({ section_scores: m.section_scores as Partial<Record<SectionId, number>> | null, created_at: m.created_at as string });
    mocksByUser.set(m.user_id as string, arr);
  }
  const act7 = new Map<string, { n: number; correct: number }>();
  for (const a of attempts7Res.data ?? []) {
    const cur = act7.get(a.user_id as string) ?? { n: 0, correct: 0 };
    cur.n += 1;
    if (a.is_correct) cur.correct += 1;
    act7.set(a.user_id as string, cur);
  }

  const now = Date.now();
  const rows = (profilesRes.data ?? []).map((p) => {
    const quiz = p.quiz_result as { sections?: Partial<Record<SectionId, number | null>>; takenAt?: number } | null;
    const fmt = examFormat(fmtByUser.get(p.id as string) ?? null);
    const readiness = examReadiness(
      fmt,
      mergeSectionEstimates({
        mockRows: mocksByUser.get(p.id as string) ?? [],
        diagnosticSections: quiz?.sections ?? null,
        diagnosticAt: quiz?.takenAt ? new Date(quiz.takenAt).toISOString() : null,
      }),
    );
    const expiresMs = p.plan_expires_at ? Date.parse(p.plan_expires_at as string) : null;
    const active = !!p.plan && expiresMs != null && expiresMs > now;
    const a7 = act7.get(p.id as string) ?? { n: 0, correct: 0 };
    const minPts = fmt.minPerSectionShare != null ? Math.round(fmt.minPerSectionShare * 25) : null;
    return { p, fmt, readiness, active, expiresMs, a7, minPts };
  });
  rows.sort((a, b) => VERDICT_RU[a.readiness.verdict].rank - VERDICT_RU[b.readiness.verdict].rank);

  const cards = {
    total: rows.length,
    trial: rows.filter((r) => r.active && r.p.plan === "trial").length,
    paid: rows.filter((r) => r.active && r.p.plan !== "trial").length,
    active7: [...act7.keys()].length,
    failing: rows.filter((r) => r.readiness.verdict === "not_ready").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-sm">
      <h1 className="text-xl font-bold">🛡 LingoPRO Admin · панель готовности</h1>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ["Всего", cards.total],
          ["Триал", cards.trial],
          ["Оплатили", cards.paid],
          ["Активны 7д", cards.active7],
          ["🔴 Не сдадут", cards.failing],
        ].map(([label, n]) => (
          <div key={label as string} className="rounded-2xl border border-black/10 bg-white p-3 text-center">
            <div className="text-2xl font-extrabold">{n}</div>
            <div className="text-xs text-black/50">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        {(
          [
            ["students", "Студенты"],
            ["payments", "Оплаты"],
            ["broken", "Сломанное"],
            ["feedback", "Фидбек"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <Link
            key={id}
            href={`/admin?tab=${id}`}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${tab === id ? "bg-black text-white" : "bg-black/5 hover:bg-black/10"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {tab === "students" && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="w-full min-w-[1080px] text-left text-xs">
            <thead className="bg-black/5 font-semibold">
              <tr>
                {["Юзер", "Доступ", "Цель", "Готовность", "Слабое звено", "Секции (D/O/Y/K)", "Активность 7д", "Последний вход"].map((h) => (
                  <th key={h} className="px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ p, fmt, readiness, active, expiresMs, a7, minPts }) => {
                const v = VERDICT_RU[readiness.verdict];
                const daysLeft = active && expiresMs ? Math.max(0, Math.floor((expiresMs - now) / 86_400_000)) : null;
                return (
                  <tr key={p.id as string} className="border-t border-black/5 align-top">
                    <td className="px-3 py-2">
                      <div className="font-semibold">{(p.full_name as string) || "—"}</div>
                      <div className="text-black/50">{p.email as string}</div>
                      <div className="text-black/40">рег. {(p.created_at as string)?.slice(0, 10)}</div>
                    </td>
                    <td className="px-3 py-2">
                      {active ? (
                        <span className={p.plan === "trial" ? "text-amber-700" : "text-green-700"}>
                          {p.plan as string} · ещё {daysLeft}д
                        </span>
                      ) : (
                        <span className="text-black/40">нет</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {fmt.name}
                      <div className="text-black/50">
                        {(p.target_level as string) ?? "—"} · {(p.exam_date as string) ?? "дата не выбрана"}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 font-bold ${v.cls}`}>{v.label}</span>
                      {readiness.total != null && <div className="mt-1 text-black/50">{readiness.total}/100</div>}
                    </td>
                    <td className="px-3 py-2">
                      {readiness.belowMin.length > 0
                        ? readiness.belowMin.join(", ")
                        : (readiness.weakestSection ?? "—")}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {SECTIONS.map((s) => {
                        const e = readiness.sections[s];
                        const below = e && minPts != null && e.score < minPts;
                        return (
                          <span key={s} className={`mr-2 ${below ? "font-bold text-red-600" : e ? "" : "text-black/30"}`}>
                            {e ? e.score : "—"}
                          </span>
                        );
                      })}
                    </td>
                    <td className="px-3 py-2">
                      {a7.n > 0 ? `${a7.n} попыток · ${Math.round((100 * a7.correct) / a7.n)}%` : <span className="text-black/40">тишина</span>}
                    </td>
                    <td className="px-3 py-2 text-black/50">{lastSignIn.get(p.id as string)?.slice(0, 10) ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "payments" && <PaymentsTab admin={admin} rows={rows.map((r) => ({ id: r.p.id as string, email: r.p.email as string }))} />}
      {tab === "broken" && <BrokenTab admin={admin} />}
      {tab === "feedback" && <FeedbackTab admin={admin} />}
    </div>
  );
}

/* --------------------------------- Оплаты --------------------------------- */

async function PaymentsTab({ admin, rows }: { admin: NonNullable<ReturnType<typeof createAdminClient>>; rows: { id: string; email: string }[] }) {
  const { data: payments } = await admin
    .from("payments")
    .select("user_id, provider, package_id, amount_minor, currency, status, paid_at, note, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  const emailOf = new Map(rows.map((r) => [r.id, r.email]));

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-black/10 bg-white p-4">
        <h2 className="font-bold">Выдать план / оплата получена</h2>
        <form action={manualPaymentAction} className="mt-3 flex flex-col gap-2">
          <select name="userId" className="rounded-lg border border-black/15 p-2" required>
            <option value="">— юзер —</option>
            {rows.map((r) => (
              <option key={r.id} value={r.id}>{r.email}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <select name="package" className="rounded-lg border border-black/15 p-2" required>
              <option value="1m">1 месяц</option>
              <option value="3m">3 месяца</option>
              <option value="6m">6 месяцев</option>
            </select>
            <input name="amount" type="number" min="1" placeholder="Сумма, ₸" className="w-32 rounded-lg border border-black/15 p-2" required />
          </div>
          <input name="note" placeholder="Способ + комментарий (Kaspi перевод / наличные / ИП…)" className="rounded-lg border border-black/15 p-2" />
          <button type="submit" className="rounded-full bg-black px-4 py-2 font-semibold text-white">💰 Оплата получена → выдать доступ</button>
        </form>
        <form action={grantPlanAction} className="mt-4 flex items-end gap-2 border-t border-black/10 pt-3">
          <select name="userId" className="flex-1 rounded-lg border border-black/15 p-2" required>
            <option value="">— юзер —</option>
            {rows.map((r) => (
              <option key={r.id} value={r.id}>{r.email}</option>
            ))}
          </select>
          <select name="package" className="rounded-lg border border-black/15 p-2">
            <option value="trial">триал 3д</option>
            <option value="1m">1м</option>
            <option value="3m">3м</option>
            <option value="6m">6м</option>
          </select>
          <button type="submit" className="rounded-full bg-black/80 px-3 py-2 text-white">Выдать без оплаты</button>
        </form>
        <form action={revokePlanAction} className="mt-3 flex items-end gap-2 border-t border-black/10 pt-3">
          <select name="userId" className="flex-1 rounded-lg border border-black/15 p-2" required>
            <option value="">— юзер —</option>
            {rows.map((r) => (
              <option key={r.id} value={r.id}>{r.email}</option>
            ))}
          </select>
          <button type="submit" className="rounded-full bg-red-600 px-3 py-2 text-white">Отозвать доступ</button>
        </form>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-4">
        <h2 className="font-bold">Книга продаж (последние 50)</h2>
        <table className="mt-2 w-full text-left text-xs">
          <thead className="font-semibold text-black/50">
            <tr><th className="py-1">Когда</th><th>Юзер</th><th>Пакет</th><th>Сумма</th><th>Провайдер</th><th>Статус</th></tr>
          </thead>
          <tbody>
            {(payments ?? []).map((pm, i) => (
              <tr key={i} className="border-t border-black/5">
                <td className="py-1.5">{(pm.paid_at ?? pm.created_at)?.slice(0, 10)}</td>
                <td>{emailOf.get(pm.user_id as string) ?? (pm.user_id as string).slice(0, 8)}</td>
                <td>{pm.package_id as string}</td>
                <td>{Math.round(((pm.amount_minor as number) ?? 0) / 100)} {(pm.currency as string)?.toUpperCase()}</td>
                <td>{pm.provider as string}{pm.note ? ` · ${pm.note}` : ""}</td>
                <td className={pm.status === "paid" ? "text-green-700" : "text-black/50"}>{pm.status as string}</td>
              </tr>
            ))}
            {(payments ?? []).length === 0 && (
              <tr><td colSpan={6} className="py-3 text-black/40">оплат ещё нет</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------- Сломанное -------------------------------- */

async function BrokenTab({ admin }: { admin: NonNullable<ReturnType<typeof createAdminClient>> }) {
  const today = new Date().toISOString().slice(0, 10);
  const [voiceNull, usage, briefs, rejected, attemptsAll] = await Promise.all([
    admin.from("voice_sessions").select("user_id, started_at, seconds, transcript").is("report", null).order("started_at", { ascending: false }),
    admin.from("ai_usage").select("user_id, used").eq("day", today).eq("feature", "motivator"),
    admin.from("coach_messages").select("user_id").eq("channel", "proactive").gte("created_at", `${today}T00:00:00Z`),
    admin.from("generated_tasks").select("id, topic, level, qa, created_at").eq("status", "rejected").order("created_at", { ascending: false }).limit(20),
    admin.from("attempts").select("question_id, is_correct").eq("is_self_reported", false).limit(10000),
  ]);

  // брифы: квота сожжена, а заметки за день нет → AI-вызов пропал
  const briefed = new Set((briefs.data ?? []).map((b) => b.user_id as string));
  const lostBriefs = (usage.data ?? []).filter((u) => (u.used as number) > 0 && !briefed.has(u.user_id as string));

  // задания с аномальной статистикой: точность <20% при ≥20 попытках
  const byQ = new Map<string, { n: number; correct: number }>();
  for (const a of attemptsAll.data ?? []) {
    const cur = byQ.get(a.question_id as string) ?? { n: 0, correct: 0 };
    cur.n += 1;
    if (a.is_correct) cur.correct += 1;
    byQ.set(a.question_id as string, cur);
  }
  const anomalies = [...byQ.entries()]
    .filter(([, s]) => s.n >= 20 && s.correct / s.n < 0.2)
    .map(([id, s]) => ({ id, ...s }));

  const box = (title: string, ok: boolean, children: React.ReactNode) => (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <h2 className="font-bold">{ok ? "✅" : "🔴"} {title}</h2>
      <div className="mt-2 text-xs">{children}</div>
    </div>
  );

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {box(
        `Голосовые без разбора: ${(voiceNull.data ?? []).length}`,
        (voiceNull.data ?? []).length === 0,
        (voiceNull.data ?? []).slice(0, 10).map((v, i) => (
          <div key={i} className="border-t border-black/5 py-1">
            {(v.started_at as string)?.slice(0, 16)} · {v.seconds as number}с ·{" "}
            {((v.transcript as { conversation_id?: string })?.conversation_id ?? "без id").slice(0, 30)} — дозреет ретраем/вебхуком/бэкфиллом
          </div>
        )),
      )}
      {box(
        `Потерянные брифы сегодня: ${lostBriefs.length}`,
        lostBriefs.length === 0,
        lostBriefs.map((u, i) => (
          <div key={i} className="border-t border-black/5 py-1">
            {(u.user_id as string).slice(0, 8)}… — motivator-квота сожжена ({u.used as number}), заметки в памяти нет (AI null / язык / факт-чек)
          </div>
        )),
      )}
      {box(
        `Задания с аномальной точностью (<20% при 20+): ${anomalies.length}`,
        anomalies.length === 0,
        anomalies.map((a) => (
          <div key={a.id} className="border-t border-black/5 py-1">
            {a.id} — {a.correct}/{a.n} верных: либо тема адская, либо задание кривое
          </div>
        )),
      )}
      {box(
        `Отклонено QA-судьёй (последние): ${(rejected.data ?? []).length}`,
        true,
        (rejected.data ?? []).map((r, i) => (
          <div key={i} className="border-t border-black/5 py-1">
            {(r.created_at as string)?.slice(0, 10)} · {r.topic as string} ({r.level as string}) —{" "}
            {(((r.qa as { problems?: string[] })?.problems ?? []).join("; ") || "флаги QA").slice(0, 120)}
          </div>
        )),
      )}
      <div className="rounded-2xl border border-black/10 bg-white p-4 lg:col-span-2">
        <h2 className="font-bold">📝 Контент без нейтив-ревью</h2>
        <p className="mt-1 text-xs text-black/60">
          Весь банк content/tomer и диагностики — author: ai-draft, reviewedBy: null (файлы в репо). UI помечает
          честно («создаются AI»); нейтив-ревью по чек-листу DESIGN-CONTENT-TOMER §4 — за тобой.
        </p>
      </div>
    </div>
  );
}

/* --------------------------------- Фидбек --------------------------------- */

async function FeedbackTab({ admin }: { admin: NonNullable<ReturnType<typeof createAdminClient>> }) {
  const { data, error } = await admin
    .from("feedback")
    .select("user_id, message, page, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  return (
    <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4">
      <h2 className="font-bold">Обратная связь</h2>
      {error && <p className="mt-2 text-xs text-amber-700">Таблица feedback недоступна — применена ли миграция 0016?</p>}
      <div className="mt-2 text-xs">
        {(data ?? []).map((f, i) => (
          <div key={i} className="border-t border-black/5 py-2">
            <div className="text-black/50">
              {(f.created_at as string)?.slice(0, 16)} · {(f.user_id as string).slice(0, 8)}… · {f.page as string}
            </div>
            <div className="mt-0.5 whitespace-pre-wrap">{f.message as string}</div>
          </div>
        ))}
        {(data ?? []).length === 0 && !error && <p className="py-2 text-black/40">пока пусто</p>}
      </div>
    </div>
  );
}
