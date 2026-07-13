/**
 * Маппинг свободных topic-строк из банков заданий (src/data/*-tasks.ts) на
 * канонические id реестра тем (src/lib/ai/topics.ts). Без него точность по
 * темам разваливается на два пространства имён: attempts писал бы
 * «Şimdiki zaman (-ıyor)», а ядро агента читает `present_iyor`.
 *
 * Правила:
 *  - маппим только при СОВПАДЕНИИ концепта; натяжка запрещена;
 *  - нет канона → явный null («тема неизвестна»), НЕ 'other' — правило
 *    продукта: отсутствие данных ≠ данные;
 *  - каждая topic-строка банка ОБЯЗАНА присутствовать в словаре — тест
 *    test:attempts валит сборку при появлении новой немаппированной темы.
 */

import { TOPIC_IDS } from "@/lib/ai/topics";

/** null = в реестре нет соответствующего концепта (честно «без темы»). */
export const GRAMMAR_TOPIC_MAP: Record<string, string | null> = {
  // --- A1: падежи, связки, базовые времена ---
  "Yönelme hâli (-e/-a)": "locative_dative",
  "Bulunma hâli (-de/-da)": "locative_dative",
  "Bulunma hâli": "locative_dative",
  "Belirtme hâli (-ı/-i)": "accusative",
  "Çıkma hâli (-den/-dan)": "ablative",
  "var / yok": "var_yok",
  "yok": "var_yok",
  "Ek-fiil (-yım)": "copula_person",
  "Ek-fiil (-sin)": "copula_person",
  "Sayı + isim": "numerals_plural",
  "Şimdiki zaman (-ıyor)": "present_iyor",
  "Şimdiki zaman çoğul": "present_iyor",
  "İyelik eki (benim)": "izafet",
  // вопросительные слова (ne/nerede) и указательные bu/şu/o в реестре
  // отсутствуют (question_particle — только частица mI); честный null
  "Soru sözcüğü (ne)": null,
  "Soru sözcüğü (nerede)": null,
  "İşaret sıfatı (bu/şu/o)": null,

  // --- A2: времена, модальность, послелоги, сравнение ---
  "-mış (uzak geçmiş)": "past_di_mis",
  "Öğrenilen geçmiş (-mış)": "past_di_mis",
  "Görülen geçmiş zaman (-dı)": "past_di_mis",
  "Geçmiş olumsuz": "past_di_mis",
  "Gelecek zaman (-acak)": "future_acak",
  "Yönelme + gelecek": "future_acak",
  "Gereklilik (-malı)": "necessity_meli",
  "Yeterlilik (-ebilmek)": "abilitative",
  "Yeterlilik olumsuz": "abilitative",
  "Edat (gibi)": "postpositions",
  "Edat (ile)": "postpositions",
  "Edat (için)": "postpositions",
  "Edat (kadar)": "postpositions",
  "Eşitlik (kadar)": "comparatives",
  "Karşılaştırma (daha)": "comparatives",
  "Üstünlük (en)": "comparatives",

  // --- B1: деепричастия, условие, союзы, косвенная речь ---
  "Zarf-fiil (-arak)": "converbs",
  "Zarf-fiil (-erek)": "converbs",
  "Zarf-fiil (-ince)": "converbs",
  "Zarf-fiil (-ünce)": "converbs",
  "Zarf-fiil (-meden)": "converbs",
  "Zarf-fiil (-dıktan sonra)": "converbs",
  "Zarf-fiil (-dıkça)": "converbs",
  "Şart (-sa)": "conditionals",
  "Şart kipi (-sa)": "conditionals",
  "Bağlaç (ama)": "discourse_connectors",
  "Bağlaç (ama / yine de)": "discourse_connectors",
  "Bağlaç (oysa)": "discourse_connectors",
  "Bağlaç (yoksa)": "discourse_connectors",
  "Bağlaç (çünkü)": "discourse_connectors",
  "Bağlaç (öyleyse)": "discourse_connectors",
  "Dolaylı anlatım (bakılırsa)": "reported_speech",
  "Dolaylı anlatım (göre)": "reported_speech",

  // --- B2: залоги, придаточные, идиомы ---
  "Edilgen (-ıl)": "passive_voice",
  "Edilgen çatı (-ıl)": "passive_voice",
  "Edilgen (geçmiş)": "passive_voice",
  "Edilgen (geniş zaman)": "passive_voice",
  "Edilgen (bekleniyor)": "passive_voice",
  "Edilgen (bilinmektedir)": "passive_voice",
  "Edilgen + gelecek": "passive_voice",
  "Akademik edilgen": "passive_voice",
  "Ad-fiil (-dığını)": "noun_clauses",
  "Ad-fiil (-acağını)": "noun_clauses",
  "Deyim (ağzı kulaklarına varmak)": "collocations",
  "Deyim (burnu havada)": "collocations",
  "Deyim (can atmak)": "collocations",
  "Deyim (dört gözle beklemek)": "collocations",
  "Deyim (göz yummak)": "collocations",
  "Deyim (kulak misafiri olmak)": "collocations",
  // «нарушение выражения» — стилистический разбор без канона в реестре
  "Anlatım bozukluğu": null,

  // --- C1: связки, номинализация, причастия ---
  "Bağlaç (-dığı sürece)": "discourse_connectors",
  "Bağlaç (-dığı takdirde)": "discourse_connectors",
  "Bağlaç (-masına rağmen)": "discourse_connectors",
  "Bağlaç (dolayısıyla)": "discourse_connectors",
  "Bağlaç (gerek … gerek(se))": "discourse_connectors",
  "Bağlaç (her ne kadar … -sa da)": "discourse_connectors",
  "Bağlaç (ne var ki)": "discourse_connectors",
  "Bağlaç (ne … ne)": "negative_concord",
  "Cümle birleştirme (-ince)": "converbs",
  "Cümle birleştirme (-ması)": "nominalization_advanced",
  "İsim-fiil (-mak özne)": "verbal_nouns",
  "İsim-fiil (-ması)": "verbal_nouns",
  "Sıfat-fiil (-an)": "participles",
  // заполнение параграфа — навык чтения, не грамматическая тема
  "Paragraf tamamlama": null,
};

const KNOWN_IDS = new Set(TOPIC_IDS);

/**
 * Канонический id темы для строки из банка заданий.
 * Неизвестная строка → null (и тест тотальности её поймает).
 */
export function canonicalTopic(raw: string): string | null {
  const mapped = GRAMMAR_TOPIC_MAP[raw];
  if (!mapped) return null;
  return KNOWN_IDS.has(mapped) ? mapped : null;
}
