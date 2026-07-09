/**
 * Live pipeline check for the post-lesson written review (founder item 2):
 * a realistic ~2.5-minute transcript goes through the SAME code path as
 * /api/voice/session/end (buildVoiceReviewSystem → callAI voice_review →
 * validateVoiceReport) in all four interface languages. Asserts the report
 * is valid and complete, and prints the generated text so a native speaker
 * can eyeball the language quality.
 *
 * Run: npm run test:voice   (real AI calls — uses .env.local keys)
 */

import { readFileSync } from "node:fs";

// .env.local into process.env BEFORE the lib reads keys (values never printed)
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const i = line.indexOf("=");
  if (i > 0 && !line.startsWith("#")) {
    const k = line.slice(0, i).trim();
    if (!process.env[k]) process.env[k] = line.slice(i + 1).trim();
  }
}

// realistic Bölüm 1→2 lesson, B1 student with typical planted errors:
// izafet (annemin araba→arabası), accusative (kitap→kitabı okudum), aorist
// vs present, dative (okula), conditional word order
const TRANSCRIPT: { role: "teacher" | "student"; text: string }[] = [
  { role: "teacher", text: "Merhaba! Bugün nasılsın? Biraz kendinden bahseder misin?" },
  { role: "student", text: "Merhaba hocam, iyiyim. Ben Almatı'dan geliyorum ve iki yıl Türkçe öğreniyorum." },
  { role: "teacher", text: "Çok güzel! Ailenle mi yaşıyorsun?" },
  { role: "student", text: "Evet, annem ve babam ile yaşıyorum. Annemin araba var, her gün beni üniversiteye götürüyor." },
  { role: "teacher", text: "Anlıyorum. Peki boş zamanlarında ne yapmayı seversin?" },
  { role: "student", text: "Kitap okumak çok seviyorum. Geçen hafta bir tarihi roman okudum, çok ilginçti." },
  { role: "teacher", text: "Hangi romanı okudun?" },
  { role: "student", text: "Adı hatırlamıyorum ama Osmanlı zamanında geçiyordu. Ben her akşam kitap okuyorum yatmadan önce." },
  { role: "teacher", text: "Harika bir alışkanlık. Şimdi biraz şehrinden bahset: Almatı nasıl bir şehir?" },
  { role: "student", text: "Almatı çok büyük ve güzel şehir. Dağlar var yakında, kışın kayak yapabilirsin." },
  { role: "student", text: "Şehirde çok park var. İnsanlar hafta sonu parklara gidiyorlar ve piknik yapıyorlar." },
  { role: "teacher", text: "Kulağa hoş geliyor. Sen en çok nereyi seviyorsun şehirde?" },
  { role: "student", text: "Ben en çok Medeu'yu seviyorum. Orası çok yüksek, buz pateni yapmak için dünyada en iyi yerlerden biri." },
  { role: "teacher", text: "Oraya nasıl gidiyorsun?" },
  { role: "student", text: "Otobüs ile gidiyorum ama bazen arkadaşım beni arabayla götürüyor. Eğer hava güzel olacak, bu hafta sonu tekrar gideceğim." },
  { role: "teacher", text: "Peki gelecek planların neler? Neden Türkçe öğreniyorsun?" },
  { role: "student", text: "Ben İstanbul'da üniversite okumak istiyorum. Onun için TÖMER sınavı geçmek lazım. Her gün ders çalışıyorum bu hedef için." },
  { role: "teacher", text: "Çok kararlısın, bu güzel. Sınavdan sonra hangi bölümü okumak istiyorsun?" },
  { role: "student", text: "Mühendislik okumak istiyorum, bilgisayar mühendislik. Türkiye'de eğitim kalitesi çok iyi diye duydum." },
  { role: "teacher", text: "Başarılar diliyorum! Bugün güzel konuştuk." },
  { role: "student", text: "Teşekkür ederim hocam. Sizinle konuşmak her zaman çok faydalı benim için." },
];

// optional arg narrows the run to one language: npm run test:voice -- ru
const ALL_LANGS = ["ru", "en", "tr", "kk"] as const;
const LANGS = ALL_LANGS.includes(process.argv[2] as (typeof ALL_LANGS)[number])
  ? [process.argv[2] as (typeof ALL_LANGS)[number]]
  : ALL_LANGS;

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failures += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  const { callAI } = await import("../src/lib/ai/client");
  const { buildVoiceReviewSystem, buildVoiceReviewUserMessage, validateVoiceReport } = await import(
    "../src/lib/ai/prompts/voice-review"
  );

  for (const lang of LANGS) {
    console.log(`\n=== ${lang.toUpperCase()} ===`);
    const result = await callAI({
      task: "voice_review",
      feedbackLang: lang,
      system: buildVoiceReviewSystem(lang),
      messages: [
        {
          role: "user",
          content: buildVoiceReviewUserMessage({
            transcriptLines: TRANSCRIPT,
            lessonFocusTr: "İyelik ekleri (izafet), Belirtme hâli",
            level: "B1",
            targetLevel: "C1",
          }),
        },
      ],
      maxTokens: 12000,
      json: true,
      thinking: true,
    });
    const report = result ? validateVoiceReport(result.parsed) : null;

    check(`${lang}: report parsed`, !!report);
    if (!report) continue;
    check(`${lang}: valid = true (transcript is long enough)`, report.valid, report.invalid_reason ?? "");
    if (!report.valid) continue;
    check(`${lang}: summary present`, report.summary.length > 20);
    const crits = ["fluency", "grammar", "vocab", "coherence"] as const;
    check(
      `${lang}: 4 criteria with comments`,
      crits.every((k) => report.criteria[k].comment.length > 5 && report.criteria[k].score >= 0 && report.criteria[k].score <= 5),
    );
    check(`${lang}: found the planted errors (≥2)`, report.errors.length >= 2, `got ${report.errors.length}`);
    check(`${lang}: next steps (1-3)`, report.next_steps.length >= 1 && report.next_steps.length <= 3);
    check(
      `${lang}: no markdown in text fields`,
      ![report.summary, ...report.next_steps, ...crits.map((k) => report.criteria[k].comment)].some((t) => /[*#`]|^- /m.test(t)),
    );

    // for the native reviewer's eyes:
    console.log(`  — summary: ${report.summary}`);
    for (const e of report.errors.slice(0, 3)) {
      console.log(`  — hata: "${e.quote}" → "${e.correction}" · ${e.rule} · ${e.explanation}`);
    }
    for (const s of report.next_steps) console.log(`  — adım: ${s}`);
  }

  console.log(failures ? `\n${failures} FAILED` : "\nall passed");
  process.exit(failures ? 1 : 0);
}

void main();
