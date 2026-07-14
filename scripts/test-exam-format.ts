/**
 * Контракты движка формата экзамена (Фаза 7): пороги — параметр центра,
 * слабое звено топит, непубликуемые пороги не превращаются в «провал»,
 * TYS не обещает балл. Run: npm run test:exam
 */

import { EXAM_FORMATS, examFormat, examVerdict, sectionTimeLimit } from "../src/lib/exam/format";

let failures = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failures += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const S = (d: number, o: number, y: number, k: number) => ({ dinleme: d, okuma: o, yazma: y, konusma: k });

console.log("\ntomer_generic (60→B2, 75→C1):");
{
  const f = EXAM_FORMATS.tomer_generic;
  check("75 ровно → C1", examVerdict(f, S(19, 19, 19, 18)).outcome === "passed_c1");
  check("60 ровно → B2", examVerdict(f, S(15, 15, 15, 15)).outcome === "passed_b2");
  check("59 → failed", examVerdict(f, S(15, 15, 15, 14)).outcome === "failed");
  check("не все секции → incomplete (итог не выносится)", examVerdict(f, { dinleme: 20, okuma: 20 }).outcome === "incomplete");
}

console.log("\ntomer_bayburt (минимум 60% по КАЖДОЙ секции):");
{
  const f = EXAM_FORMATS.tomer_bayburt;
  // сумма 80 — а говорение 9/25 при минимуме 15: ЭКЗАМЕН НЕ СДАН
  const v = examVerdict(f, S(24, 24, 23, 9));
  check("80/100 с konusma 9/25 → failed_min (слабое звено топит)", v.outcome === "failed_min", v.outcome);
  check("слабое звено названо", v.weakSections.length === 1 && v.weakSections[0] === "konusma");
  check("все ≥15 и сумма 62 → passed_b2", examVerdict(f, S(16, 16, 15, 15)).outcome === "passed_b2");
  check("минимум цел и сумма 76 → passed_c1", examVerdict(f, S(19, 19, 19, 19)).outcome === "passed_c1");
}

console.log("\ntomer_sakarya (C1=85, провал <50, B2 не публикуется):");
{
  const f = EXAM_FORMATS.tomer_sakarya;
  check("85 → C1", examVerdict(f, S(22, 21, 21, 21)).outcome === "passed_c1");
  check("49 → failed (ниже провальной черты)", examVerdict(f, S(12, 12, 13, 12)).outcome === "failed");
  // 50–84: порог B2 центр НЕ публикует — «провал» был бы враньём
  check("70 → unclear_threshold (не «провал» и не выдуманный B2)", examVerdict(f, S(18, 18, 17, 17)).outcome === "unclear_threshold");
}

console.log("\ntys (Modern Test Theory — балл не обещаем):");
{
  const f = EXAM_FORMATS.tys;
  check("любой полный счёт → no_promise", examVerdict(f, S(25, 25, 25, 25)).outcome === "no_promise");
}

console.log("\nтайминг и реестр:");
{
  const f = EXAM_FORMATS.tomer_generic;
  check("MC-бюджет = вопросы × темп (5 okuma → 550с)", sectionTimeLimit(f, "okuma", 5) === 550);
  check("yazma-бюджет = задания × темп (2 → 50 мин)", sectionTimeLimit(f, "yazma", 2) === 3000);
  check("konusma без письменного таймера (живая сессия)", sectionTimeLimit(f, "konusma", 1) === null);
  check("незнакомый пресет откатывается на generic", examFormat("nope").slug === "tomer_generic");
  check("TYS-темп из документа: okuma 90с/вопрос (60 мин / 40)", EXAM_FORMATS.tys.perQuestionSeconds.okuma === 90);
}

console.log(failures === 0 ? "\nВСЕ ТЕСТЫ ЗЕЛЁНЫЕ" : `\nПРОВАЛОВ: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
