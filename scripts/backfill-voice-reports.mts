/**
 * Бэкфилл сломанных голосовых сессий: строки voice_sessions с report IS NULL
 * (зафиксированы старым settle-роутом с пустым транскриптом) дозревают из
 * API ElevenLabs — транскрипт перечитывается по conversation_id, разбор
 * генерируется тем же конвейером, что и живой settle (maturePendingReport:
 * UPDATE строки + error_events + attempts + карточка в ленту Ahu).
 *
 * ⚠️ С флагом --apply ПИШЕТ В БД, НА КОТОРУЮ СМОТРИТ .env.local, и тратит
 * AI-вызовы (по одному на сессию с реальной речью). Без флага — read-only
 * отчёт: что лежит в ElevenLabs и что произойдёт.
 *
 * Run: npx tsx scripts/backfill-voice-reports.mts [--apply]
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// env ДО импорта конвейера (lib/ai читает ключи из process.env)
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
for (const [k, v] of Object.entries(env)) process.env[k] ??= v as string;

const { fetchConversation, isFinalized, maturePendingReport, studentLineCount, transcriptLines } = await import(
  "../src/lib/voice/report"
);

const apply = process.argv.includes("--apply");
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("ELEVENLABS_API_KEY не найден в .env.local");
  process.exit(1);
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

async function main() {
  console.log(`БД: ${process.env.NEXT_PUBLIC_SUPABASE_URL} · режим: ${apply ? "APPLY (пишет!)" : "dry-run"}\n`);

  const { data: sessions, error } = await admin
    .from("voice_sessions")
    .select("id, user_id, seconds, started_at, transcript, report")
    .is("report", null)
    .order("started_at", { ascending: true });
  if (error) throw error;
  if (!sessions?.length) {
    console.log("Сломанных сессий (report IS NULL) нет.");
    return;
  }
  console.log(`Сессий с report IS NULL: ${sessions.length}\n`);

  let ready = 0, tooShort = 0, pending = 0, failed = 0;
  for (const s of sessions) {
    const convId = (s.transcript as { conversation_id?: string } | null)?.conversation_id ?? "";
    const label = `${(s.started_at as string)?.slice(0, 16)} · ${s.seconds}с · ${convId || "БЕЗ conversation_id"}`;
    if (!convId) {
      console.log(`✗ ${label} — дозреть невозможно (нет id разговора)`);
      failed++;
      continue;
    }
    const conv = await fetchConversation(convId, apiKey!);
    if (!conv) {
      console.log(`✗ ${label} — разговор не найден в ElevenLabs (удалён по ретенции?)`);
      failed++;
      continue;
    }
    const lines = transcriptLines(conv);
    const info = `status=${conv.status}, реплик студента=${studentLineCount(lines)}, всего строк=${lines.length}`;

    if (!apply) {
      const would = !isFinalized(conv)
        ? "останется pending (запись не финализирована)"
        : studentLineCount(lines) < 2
          ? "→ too_short (терминально)"
          : "→ ГЕНЕРАЦИЯ РАЗБОРА";
      console.log(`· ${label} — ${info} — ${would}`);
      continue;
    }

    const { data: genderRow } = await admin
      .from("profiles")
      .select("gender")
      .eq("id", s.user_id as string)
      .maybeSingle();
    const { state, report } = await maturePendingReport(admin, {
      sessionId: s.id as string,
      userId: s.user_id as string,
      conversationId: convId,
      conv,
      gender: (genderRow?.gender as "female" | "male" | null) ?? null,
      minutes: Math.ceil(((s.seconds as number | null) ?? 0) / 60),
    });
    if (state === "ready") ready++;
    else if (state === "too_short") tooShort++;
    else if (state === "pending_transcript") pending++;
    else failed++;
    console.log(
      `${state === "ready" ? "✓" : state === "too_short" ? "○" : "✗"} ${label} — ${info} — ${state}` +
        (report?.valid ? ` (ошибок: ${report.errors.length}, тем: ${report.topics_worked.length})` : ""),
    );
  }

  if (apply) {
    console.log(`\nИтог: разбор построен=${ready}, too_short=${tooShort}, ещё pending=${pending}, не дозрели=${failed}`);
  }
}

await main();
