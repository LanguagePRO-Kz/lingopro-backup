/**
 * Стратегии сдачи (Фаза 7.6) — то, что ускоряет СДАЧУ, а не знание языка:
 * распределение времени, исключение вариантов, структура эссе под барем,
 * тактика двух прослушиваний, типовые ловушки по типам вопросов
 * (detail/inference/main_idea/not_true — типизация нашего банка).
 *
 * Честность: это общие тактики тестосдачи, собранные AI, а не «секреты
 * конкретного центра» — дисклеймер показывается в UI. Тактики отработаны
 * на наших пробниках с реальным таймингом (Фаза 7.2).
 */

import type { Locale } from "@/lib/i18n";

export type StrategyBlock = {
  id: string;
  emoji: string;
  title: Record<Locale, string>;
  tips: Record<Locale, string[]>;
};

export const STRATEGY_DISCLAIMER: Record<Locale, string> = {
  ru: "Это общие тактики сдачи, собранные AI, — не регламент конкретного центра. Отрабатывай их на пробниках с таймером: тактика без тренировки не работает.",
  en: "These are general test-taking tactics compiled by AI — not any centre's official rules. Drill them in timed mocks: an unpractised tactic doesn't work.",
  tr: "Bunlar yapay zekânın derlediği genel sınav taktikleridir — bir merkezin resmî kuralları değildir. Süreli denemelerde çalıştır: alıştırılmamış taktik işe yaramaz.",
  kk: "Бұл — AI жинақтаған жалпы тапсыру тактикалары, нақты орталықтың ресми ережесі емес. Оларды таймермен сынамаларда жаттықтыр: жаттықпаған тактика жұмыс істемейді.",
};

export const STRATEGIES: StrategyBlock[] = [
  {
    id: "timing",
    emoji: "⏱",
    title: { ru: "Распределение времени", en: "Time management", tr: "Zaman yönetimi", kk: "Уақытты бөлу" },
    tips: {
      ru: [
        "Посчитай бюджет на вопрос ДО секции (время ÷ вопросы) и держи темп: застрял на 2× бюджета — отметь любой ответ, поставь метку и иди дальше.",
        "Пустых ответов не оставляй никогда: штрафа за ошибку нет, а «не успел» и «не знал» стоят одинаково — ноль.",
        "В чтении сначала прочитай ВОПРОСЫ, потом текст — будешь читать целенаправленно, а не пересказывать себе всё.",
        "Последние 2-3 минуты секции — только на проверку отмеченных вопросов, не на новые.",
      ],
      en: [
        "Compute your per-question budget BEFORE the section (time ÷ questions) and hold the pace: stuck at 2× budget — mark any answer, flag it, move on.",
        "Never leave blanks: there's no wrong-answer penalty, so 'ran out of time' and 'didn't know' cost the same — zero.",
        "In reading, read the QUESTIONS first, then the text — you'll read with purpose instead of retelling everything to yourself.",
        "The last 2-3 minutes of a section are for reviewing flagged questions only, not new ones.",
      ],
      tr: [
        "Bölümden ÖNCE soru başına bütçeni hesapla (süre ÷ soru) ve tempoyu koru: bütçenin 2 katında takıldıysan — bir cevap işaretle, not al, devam et.",
        "Asla boş bırakma: yanlış cevap cezası yok — «yetişemedim» ile «bilmiyordum» aynı şeye mal olur: sıfır.",
        "Okumada önce SORULARI oku, sonra metni — her şeyi kendine anlatmak yerine hedefli okursun.",
        "Bölümün son 2-3 dakikası yalnızca işaretli soruları kontrol etmek için — yenilerine değil.",
      ],
      kk: [
        "Бөлімге дейін бір сұрақтың бюджетін есепте (уақыт ÷ сұрақ) және қарқынды ұста: бюджеттің 2 есесінде тұрып қалсаң — кез келген жауапты белгіле де, әрі қарай жүр.",
        "Ешқашан бос қалдырма: қате үшін айыппұл жоқ — «үлгермедім» мен «білмедім» бірдей тұрады: нөл.",
        "Оқылымда алдымен СҰРАҚТАРДЫ оқы, сосын мәтінді — бәрін өзіңе айтып бермей, мақсатты оқисың.",
        "Бөлімнің соңғы 2-3 минуты — тек белгіленген сұрақтарды тексеруге, жаңасына емес.",
      ],
    },
  },
  {
    id: "elimination",
    emoji: "🎯",
    title: { ru: "Исключение вариантов (MC)", en: "Answer elimination (MC)", tr: "Şık eleme", kk: "Нұсқаларды алып тастау" },
    tips: {
      ru: [
        "Работай на вычёркивание: два варианта почти всегда отпадают сразу — дальше выбираешь из двух, это 50% даже при незнании.",
        "Вариант со словами «всегда, никогда, все, только» чаще неверен — тексты редко утверждают абсолюты.",
        "Вариант, дословно повторяющий кусок текста, — приманка: правильный обычно ПЕРЕФРАЗИРУЕТ мысль.",
        "Два варианта означают одно и то же? Оба неверны — правильный ответ один по построению.",
      ],
      en: [
        "Work by crossing out: two options almost always die immediately — then you pick from two, a 50% shot even blind.",
        "Options with 'always, never, all, only' are usually wrong — texts rarely state absolutes.",
        "An option that repeats the text word-for-word is bait: the correct one usually PARAPHRASES the idea.",
        "Two options mean the same thing? Both are wrong — there is exactly one key by construction.",
      ],
      tr: [
        "Eleyerek çalış: iki şık neredeyse her zaman hemen düşer — kalan ikisinden seçersin, bilmesen bile %50.",
        "«Her zaman, asla, hepsi, sadece» içeren şık genelde yanlıştır — metinler nadiren mutlak konuşur.",
        "Metni kelimesi kelimesine tekrarlayan şık tuzaktır: doğru şık genellikle fikri BAŞKA SÖZLERLE anlatır.",
        "İki şık aynı anlama mı geliyor? İkisi de yanlış — doğru cevap yapı gereği tektir.",
      ],
      kk: [
        "Сызып тастап жұмыс істе: екі нұсқа әрдайым дерлік бірден түсіп қалады — қалған екеуінен таңдайсың, білмесең де 50%.",
        "«Әрқашан, ешқашан, бәрі, тек» деген сөзі бар нұсқа көбіне қате — мәтіндер абсолютті сирек айтады.",
        "Мәтінді сөзбе-сөз қайталайтын нұсқа — қақпан: дұрысы ойды БАСҚА СӨЗБЕН береді.",
        "Екі нұсқа бір мағынаны білдіре ме? Екеуі де қате — дұрыс жауап құрылымы бойынша біреу.",
      ],
    },
  },
  {
    id: "essay",
    emoji: "✍️",
    title: { ru: "Эссе под барем", en: "Essay for the rubric", tr: "Barem için kompozisyon", kk: "Барем үшін эссе" },
    tips: {
      ru: [
        "Баллы дают за 4 вещи: раскрытие задания, связность, грамматику, лексику. Красота мысли отдельно не оценивается — закрой все 4.",
        "Каркас всегда один: вступление (тезис) → 2 абзаца развития (по аргументу + примеру) → вывод. Каркас пишется за 2 минуты ДО текста.",
        "Соблюдай лимит слов из задания: меньше — срежут за нераскрытие, сильно больше — плодишь ошибки без прибавки баллов.",
        "Используй связки (çünkü, bu yüzden, ayrıca, sonuç olarak) — связность это отдельный критерий, её видно сразу.",
        "Не рискуй конструкциями, в которых не уверен: простое правильное предложение дороже сложного с ошибкой.",
      ],
      en: [
        "Points come from 4 things: task coverage, coherence, grammar, vocabulary. Beautiful ideas score nothing by themselves — cover all 4.",
        "One skeleton always works: intro (thesis) → 2 body paragraphs (argument + example each) → conclusion. Write the skeleton in 2 minutes BEFORE the text.",
        "Respect the word limit: under it — cut for incompleteness; far over it — you breed errors with no extra points.",
        "Use connectors (çünkü, bu yüzden, ayrıca, sonuç olarak) — coherence is a separate criterion and it's instantly visible.",
        "Don't gamble on structures you're unsure of: a simple correct sentence beats a complex broken one.",
      ],
      tr: [
        "Puan 4 şeyden gelir: görevi karşılama, tutarlılık, dil bilgisi, kelime. Fikrin güzelliği tek başına puan getirmez — dördünü de kapat.",
        "İskelet hep aynı: giriş (tez) → 2 gelişme paragrafı (argüman + örnek) → sonuç. İskeleti metinden ÖNCE 2 dakikada yaz.",
        "Kelime sınırına uy: altında kalırsan eksikten kırpılır, çok aşarsan puan kazanmadan hata üretirsin.",
        "Bağlaçları kullan (çünkü, bu yüzden, ayrıca, sonuç olarak) — tutarlılık ayrı bir ölçüttür ve hemen görülür.",
        "Emin olmadığın yapıyla kumar oynama: basit doğru cümle, karmaşık yanlıştan değerlidir.",
      ],
      kk: [
        "Балл 4 нәрседен келеді: тапсырманы ашу, байланыстылық, грамматика, лексика. Ойдың әдемілігі бөлек бағаланбайды — төртеуін де жап.",
        "Қаңқа әрқашан біреу: кіріспе (тезис) → 2 дамыту абзацы (аргумент + мысал) → қорытынды. Қаңқаны мәтіннен БҰРЫН 2 минутта жаз.",
        "Сөз лимитін сақта: кем болса — ашылмағаны үшін кеседі, тым көп болса — балл қоспай қате көбейтесің.",
        "Байланыстырғыштарды қолдан (çünkü, bu yüzden, ayrıca, sonuç olarak) — байланыстылық бөлек өлшем, бірден көрінеді.",
        "Сенімсіз құрылымға тәуекел етпе: қарапайым дұрыс сөйлем күрделі қатеден қымбат.",
      ],
    },
  },
  {
    id: "listening",
    emoji: "🎧",
    title: { ru: "Аудирование: два прослушивания", en: "Listening: two plays", tr: "Dinleme: iki dinleme", kk: "Тыңдалым: екі рет тыңдау" },
    tips: {
      ru: [
        "До первого прослушивания пробеги вопросы: будешь знать, ЧТО ловить (имена, числа, места, причины).",
        "Первое прослушивание — общий смысл + черновые ответы. Второе — только проверка спорных, не слушай всё заново с нуля.",
        "Числа, даты и имена записывай сразу при звучании — они спрашиваются почти всегда и забываются первыми.",
        "Не понял слово — не залипай: контекст следующих фраз обычно отвечает за него.",
      ],
      en: [
        "Skim the questions before the first play: you'll know WHAT to catch (names, numbers, places, reasons).",
        "First play — overall meaning + draft answers. Second — verify the doubtful ones only, don't re-listen from scratch.",
        "Write numbers, dates and names the moment they sound — they're almost always asked and forgotten first.",
        "Missed a word — don't freeze: the next phrases' context usually covers it.",
      ],
      tr: [
        "İlk dinlemeden önce sorulara göz at: NEYİ yakalayacağını bilirsin (isim, sayı, yer, sebep).",
        "İlk dinleme — genel anlam + taslak cevaplar. İkincisi — sadece şüphelileri doğrula, baştan dinleme.",
        "Sayı, tarih ve isimleri duyduğun anda yaz — neredeyse hep sorulur ve ilk unutulan onlardır.",
        "Bir kelimeyi kaçırdın — takılma: sonraki cümlelerin bağlamı genelde onu karşılar.",
      ],
      kk: [
        "Бірінші тыңдаудан бұрын сұрақтарды шолып шық: НЕНІ аулау керегін білесің (есім, сан, жер, себеп).",
        "Бірінші тыңдау — жалпы мағына + шимай жауаптар. Екіншісі — тек күмәндіні тексеру, басынан қайта тыңдама.",
        "Сан, күн және есімдерді естіген сәтте жаз — олар әрдайым дерлік сұралады және бірінші ұмытылады.",
        "Бір сөзді түсінбедің — қатып қалма: келесі сөйлемдердің контексі әдетте оны жабады.",
      ],
    },
  },
  {
    id: "traps",
    emoji: "🪤",
    title: { ru: "Ловушки по типам вопросов", en: "Traps by question type", tr: "Soru tipine göre tuzaklar", kk: "Сұрақ түріне қарай қақпандар" },
    tips: {
      ru: [
        "Детальный вопрос (metne göre…): ответ обязан опираться на КОНКРЕТНОЕ место текста — найди его пальцем, не отвечай по памяти.",
        "Вывод (çıkarılabilir…): правильный ответ логически следует из текста, но НЕ написан в нём дословно; слишком смелые обобщения — мимо.",
        "Главная мысль (ana fikir): ищи то, что покрывает ВЕСЬ текст; вариант про одну деталь абзаца — классическая приманка.",
        "Вопрос-отрицание (değildir / yanlıştır / DEĞİL): три варианта в тексте ЕСТЬ, ищешь тот, которого НЕТ — перечитай вопрос дважды, глаз проскакивает отрицание.",
      ],
      en: [
        "Detail question (metne göre…): the answer must rest on a SPECIFIC spot in the text — find it with your finger, don't answer from memory.",
        "Inference (çıkarılabilir…): the right answer follows logically from the text but is NOT written verbatim; overly bold generalisations miss.",
        "Main idea (ana fikir): look for what covers the WHOLE text; an option about one paragraph's detail is the classic bait.",
        "Negative question (değildir / yanlıştır / DEĞİL): three options ARE in the text, you hunt the one that ISN'T — read the question twice, eyes skip negations.",
      ],
      tr: [
        "Ayrıntı sorusu (metne göre…): cevap metnin SOMUT bir yerine dayanmalı — parmağınla bul, hafızadan cevaplama.",
        "Çıkarım (çıkarılabilir…): doğru cevap metinden mantıkça çıkar ama metinde aynen YAZMAZ; fazla cesur genellemeler eler.",
        "Ana fikir: metnin TAMAMINI kapsayanı ara; tek paragrafın ayrıntısını anlatan şık klasik tuzaktır.",
        "Olumsuz soru (değildir / yanlıştır / DEĞİL): üç şık metinde VAR, sen OLMAYANI arıyorsun — soruyu iki kez oku, göz olumsuzu atlar.",
      ],
      kk: [
        "Деталь сұрағы (metne göre…): жауап мәтіннің НАҚТЫ жеріне сүйенуі тиіс — саусағыңмен тап, жадыдан жауап берме.",
        "Қорытынды (çıkarılabilir…): дұрыс жауап мәтіннен логикамен шығады, бірақ сөзбе-сөз ЖАЗЫЛМАҒАН; тым батыл жалпылау — қате.",
        "Негізгі ой (ana fikir): БҮКІЛ мәтінді қамтитынды ізде; бір абзац детальіне құрылған нұсқа — классикалық қақпан.",
        "Терістеу сұрағы (değildir / yanlıştır / DEĞİL): үш нұсқа мәтінде БАР, сен ЖОҚ біреуін іздейсің — сұрақты екі рет оқы, көз терістеуді өткізіп жібереді.",
      ],
    },
  },
];
