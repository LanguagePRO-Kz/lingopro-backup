/**
 * Контракт-тесты голосового конвейера (Фаза 2): терминальное состояние —
 * только при реальных данных; report IS NULL дозревает, а не замораживается.
 *
 * Run: npm run test:voice   (npx tsx scripts/test-voice.ts)
 */

import { readFileSync } from "node:fs";

import { isFinalized, studentLineCount, tooShortReport, transcriptLines } from "../src/lib/voice/report";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failures += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}
const src = (p: string) => readFileSync(p, "utf8");

console.log("\nЧистые функции конвейера:");
{
  check("isFinalized: done → true", isFinalized({ status: "done" }));
  check("isFinalized: failed → true", isFinalized({ status: "failed" }));
  check("isFinalized: processing → false (duration НЕ признак готовности)", !isFinalized({ status: "processing", metadata: { call_duration_secs: 181 } }));
  check("isFinalized: нет статуса → false", !isFinalized({}));

  const lines = transcriptLines({
    transcript: [
      { role: "user", message: "Merhaba" },
      { role: "agent", message: "Hoş geldin!" },
      { role: "user", message: "   " },
      { role: "user", message: null },
    ],
  });
  check("transcriptLines фильтрует пустые/null-реплики", lines.length === 2);
  check("transcriptLines: user → student", lines[0].role === "student" && lines[1].role === "teacher");
  check("studentLineCount считает только студента", studentLineCount(lines) === 1);

  const short = tooShortReport();
  check("tooShortReport: терминальная отметка вместо NULL", short.valid === false && short.invalid_reason === "too_short");
}

console.log("\nSettle-роут (/api/voice/session/end):");
{
  const route = src("src/app/api/voice/session/end/route.ts");
  check("поллинг ждёт ТЕРМИНАЛЬНЫЙ статус (isFinalized)", route.includes("if (conv && isFinalized(conv)) break;"));
  check("старый duration-шорткат готовности удалён", !route.includes('conv.status === "failed" || (conv.metadata?.call_duration_secs ?? 0) > 0'));
  check("идемпотентность дозревает report IS NULL (maturePendingReport)", route.includes("maturePendingReport"));
  check("ответ несёт reportState (три честных состояния клиента)", route.includes("reportState"));
  check("too_short терминален только при финализированной записи", route.includes("if (finalized)"));
  check("разбор пишет attempts (source='voice_lesson')", route.includes("persistSpeakingAttempts"));
}

console.log("\nВебхук ElevenLabs:");
{
  const hook = src("src/app/api/voice/webhook/elevenlabs/route.ts");
  check("подпись проверяется constant-time (timingSafeEqual)", hook.includes("timingSafeEqual"));
  check("обрабатывается только post_call_transcription", hook.includes('payload.type !== "post_call_transcription"'));
  check("чужой agent_id отсеивается", hook.includes("ELEVENLABS_AGENT_ID"));
  check("без строки сессии НЕ создаёт запись (биллинг только клиентским settle)", hook.includes("no_session_yet"));
  check("уже разобранную сессию не трогает", hook.includes("already_reported"));
  check("без секрета честный 501, не тихий провал", hook.includes("webhook_not_configured"));
}

console.log("\nКлиент (live-страница) и статистика:");
{
  const live = src("src/app/dashboard/speaking/live/page.tsx");
  check("рабочая кнопка повтора (retryReport)", live.includes("async function retryReport()"));
  check("три честных состояния вместо одной заглушки", live.includes("reportPendingT") && live.includes("reportFailedT") && live.includes("reportNone"));
  check("too_short — единственный путь к «слишком коротким»", live.includes('=== "too_short"'));

  const stats = src("src/lib/hooks/useStats.ts");
  check("useStats: speaking считается из attempts", stats.includes('["reading", "listening", "speaking"]'));
  check("useStats: нет попыток → null («—»), не ноль", stats.includes("pct(attemptAcc.speaking) ?? avg(acc.speaking)"));
}

console.log("\nБэкфилл:");
{
  const bf = src("scripts/backfill-voice-reports.mts");
  check("dry-run по умолчанию, запись только с --apply", bf.includes('process.argv.includes("--apply")'));
  check("использует общий конвейер (maturePendingReport)", bf.includes("maturePendingReport"));
}

console.log(failures === 0 ? "\nВСЕ ТЕСТЫ ЗЕЛЁНЫЕ" : `\nПРОВАЛОВ: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
