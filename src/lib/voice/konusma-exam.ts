/**
 * Konuşma-симуляция (Блок 5): сэмплер сессии из банка + сценарий для агента.
 *
 * Сэмплер детерминирован сидом, исключает юниты прошлой симуляции
 * (анти-повтор: id прошлой сессии приезжают из transcript->konusma_used_ids).
 * Сценарий уходит агенту ЦЕЛИКОМ в существующий слот {{mode_instructions}} —
 * промпт агента не меняется, пересинк не нужен.
 */

import {
  KONUSMA_BANK,
  type KonusmaCategory,
  type KonusmaDiscussion,
  type KonusmaLevel,
  type KonusmaMonologue,
  type KonusmaRoleplay,
} from "@/data/konusma-bank";
import { konusmaTiming, type ExamFormat } from "@/lib/exam/format";

export type KonusmaSessionPlan = {
  level: KonusmaLevel;
  /** суммарное время — наша оценка, не публикуемый факт (UI: «yaklaşık») */
  approx: boolean;
  partSeconds: [number, number, number, number];
  prepSeconds: { bolum3: number; bolum4: number };
  /** Bölüm 1: 2 категории (называются вслух) по 2-3 вопроса */
  bolum1: { nameTr: string; questionsTr: string[] }[];
  bolum2: { roleA: KonusmaRoleplay; roleB: KonusmaRoleplay };
  bolum3: KonusmaDiscussion;
  /** Bölüm 4: 3 темы на выбор студента */
  bolum4: KonusmaMonologue[];
  usedIds: string[];
};

/** mulberry32 — маленький детерминированный PRNG. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Выбор n элементов: сначала не-использованные, добор — из использованных. */
function pick<T extends { id: string }>(list: T[], n: number, rand: () => number, exclude: Set<string>): T[] {
  const fresh = list.filter((x) => !exclude.has(x.id));
  const used = list.filter((x) => exclude.has(x.id));
  const pool = [...fresh];
  for (const u of used) pool.push(u); // добор из старых, если свежих мало
  const out: T[] = [];
  const src = [...pool];
  while (out.length < n && src.length) {
    // свежие идут первыми блоком — размешиваем ВНУТРИ блока свежих
    const freshLeft = src.filter((x) => !exclude.has(x.id)).length;
    const span = freshLeft > 0 ? freshLeft : src.length;
    const idx = Math.floor(rand() * span);
    out.push(src.splice(idx, 1)[0]);
  }
  return out;
}

export function buildKonusmaPlan(args: {
  level: KonusmaLevel;
  format: ExamFormat;
  seed: number;
  excludeIds?: string[];
}): KonusmaSessionPlan {
  const bank = KONUSMA_BANK[args.level];
  const timing = konusmaTiming(args.format);
  const rand = rng(args.seed);
  const exclude = new Set(args.excludeIds ?? []);

  const cats = pick(bank.bolum1, 2, rand, exclude);
  const bolum1 = cats.map((c: KonusmaCategory) => ({
    nameTr: c.nameTr,
    questionsTr: pick(
      c.questionsTr.map((q, i) => ({ id: `${c.id}#${i}`, q })),
      3,
      rand,
      new Set<string>(),
    ).map((x) => x.q),
  }));
  const roleA = pick(bank.bolum2.filter((r) => r.type === "A"), 1, rand, exclude)[0];
  const roleB = pick(bank.bolum2.filter((r) => r.type === "B"), 1, rand, exclude)[0];
  const bolum3 = pick(bank.bolum3, 1, rand, exclude)[0];
  const bolum4 = pick(bank.bolum4, 3, rand, exclude);

  return {
    level: args.level,
    approx: timing.approxLevels.includes(args.level),
    partSeconds: timing.partSeconds[args.level],
    prepSeconds: { bolum3: timing.prepSeconds.bolum3, bolum4: timing.prepSeconds.bolum4 },
    bolum1,
    bolum2: { roleA, roleB },
    bolum3,
    bolum4,
    usedIds: [...cats.map((c) => c.id), roleA.id, roleB.id, bolum3.id, ...bolum4.map((m) => m.id)],
  };
}

const mmss = (s: number) => `${Math.floor(s / 60)} dakika${s % 60 ? ` ${s % 60} saniye` : ""}`;

/**
 * Сценарий сессии для агента — вклеивается в {{mode_instructions}}.
 * Жёсткие правила симуляции: только турецкий, никакой лестницы/переводов/
 * исправлений по ходу; фиксированные МАРКЕРЫ подготовки — клиент ловит их
 * в транскрипте и открывает карточку/заметки с таймером.
 */
export function konusmaScript(plan: KonusmaSessionPlan): string {
  const [p1, p2, p3, p4] = plan.partSeconds;
  const b1 = plan.bolum1
    .map((c) => `  Kategori «${c.nameTr}» — önce YÜKSEK SESLE söyle: «Şimdi, ${c.nameTr}». Sorular:\n${c.questionsTr.map((q) => `   - ${q}`).join("\n")}`)
    .join("\n");
  const { roleA, roleB } = plan.bolum2;
  return `TÖMER KONUŞMA SINAV SİMÜLASYONU (${plan.level}). SEN SINAV DEĞERLENDİRİCİSİSİN: resmî ama sıcak. SADECE TÜRKÇE — çeviri, ipucu, dil değiştirme, ders anlatma YASAK. Öğrencinin hatalarını DERS SIRASINDA DÜZELTME — sınavda düzeltilmez, yazılı değerlendirme sonra yapılır. Cevaplar arasında kısa doğal tepkiler ver («Teşekkürler», «Anladım», «İlginç») — sessiz kalma. Destek merdiveni bu oturumda KAPALI.

BÖLÜM 1 — Konular üzerine sorular (${mmss(p1)}):
Kısa tanışma (ad, nereden). Sonra iki kategori:
${b1}

BÖLÜM 2 — Rol oyunları (${mmss(p2)}), iki durum:
1) SEN BAŞLATIRSIN. Senin rolün: ${roleA.examinerRoleTr}
   Açılış cümlen (aynen söyle): «${roleA.openingTr ?? ""}»
   Yaklaşık iki karşılıklı alışverişten sonra teşekkür et ve geç.
2) ÖĞRENCİ BAŞLATIR. Önce TAM ŞU cümleyi söyle: «Şimdi ikinci durum. Kartı oku — bu sefer konuşmayı SEN başlatacaksın. Hazır olunca başla.» Sonra SUS ve öğrencinin başlamasını BEKLE — sen başlatma. Senin rolün: ${roleB.examinerRoleTr}

BÖLÜM 3 — Karttan tartışma (${mmss(p3)}):
Önce TAM ŞU cümleyi söyle: «Şimdi Bölüm 3. Sana bir kart vereceğim. Konu: ${plan.bolum3.topicTr}. Yirmi saniye düşün.» Sonra SUS — öğrenci «Hazırım» diyene kadar BEKLE.
Tartışma konusu: ${plan.bolum3.topicTr}
Karttaki noktalar: ${plan.bolum3.bulletsTr.join(" · ")}
Bu bir TARTIŞMADIR, soru-cevap değil: sen de KARŞI görüş savun, itiraz et, öğrenciyi gerekçe göstermeye zorla.

BÖLÜM 4 — Uzun konuşma (${mmss(p4)}):
Önce TAM ŞU cümleyi söyle: «Son bölüm. Üç konudan birini seç. Otuz saniye not alabilirsin.» Konuları YÜKSEK SESLE say:
${plan.bolum4.map((m, i) => ` ${i + 1}) ${m.topicTr}`).join("\n")}
Öğrenci «Hazırım» deyip konusunu söyleyince: iki dakikaya kadar KESİNTİSİZ konuşmasına izin ver — ASLA sözünü kesme, kısa duraksamalarda bekle. «Bitirdim» deyince ya da konuşması doğal olarak bitince seçtiği konuya göre ek sorular sor (o konunun ek soruları):
${plan.bolum4.map((m) => `  «${m.topicTr}»: ${m.followUpsTr.join(" | ")}`).join("\n")}

GEÇİŞLER: «Süre doldu, sonraki bölüme geç» mesajı gelirse yarım kalan cevabı nazikçe topla ve SONRAKİ bölüme geç. Sınav bitince kısa teşekkür et — puan ya da değerlendirme SÖYLEME, yazılı rapor sonra gelir.`;
}
