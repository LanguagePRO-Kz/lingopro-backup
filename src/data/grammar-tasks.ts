/**
 * Grammar bank — 80 fill-in-the-blank questions, 16 per CEFR level.
 * Turkish sentence + 4 options + correct index + Russian explanation.
 */

import type { Question } from "./types";

export const GRAMMAR_TASKS: Question[] = [
  /* ------------------------------- A1 (16) ------------------------------- */
  {
    id: "g-a1-01", level: "A1", topic: "Yönelme hâli (-e/-a)",
    question: "Ahmet her gün okul___ gidiyor.",
    options: ["-a", "-da", "-dan", "-ın"], correctAnswer: 0,
    explanation: "Глагол «gitmek» (идти) требует направительного падежа -e/-a: okula gitmek — «ходить в школу».",
  },
  {
    id: "g-a1-02", level: "A1", topic: "var / yok",
    question: "Masada iki kitap ___.",
    options: ["var", "yok", "değil", "mi"], correctAnswer: 0,
    explanation: "«var» означает наличие («есть»). На столе есть две книги — Masada iki kitap var.",
  },
  {
    id: "g-a1-03", level: "A1", topic: "Şimdiki zaman (-ıyor)",
    question: "Ben şimdi kitap oku___.",
    options: ["-yorum", "-dum", "-acağım", "-muşum"], correctAnswer: 0,
    explanation: "Настоящее длительное время -ıyor + личное окончание -um: okuyorum — «я (сейчас) читаю».",
  },
  {
    id: "g-a1-04", level: "A1", topic: "İşaret sıfatı (bu/şu/o)",
    question: "___ kadın benim annem.",
    options: ["Bu", "Ben", "Sen", "Biz"], correctAnswer: 0,
    explanation: "«bu» — указательное «эта/этот» перед существительным: bu kadın — «эта женщина».",
  },
  {
    id: "g-a1-05", level: "A1", topic: "Sayı + isim",
    question: "Ben üç ___ aldım.",
    options: ["kitap", "kitaplar", "kitapları", "kitaba"], correctAnswer: 0,
    explanation: "После числительного существительное стоит в единственном числе: üç kitap — «три книги».",
  },
  {
    id: "g-a1-06", level: "A1", topic: "Bulunma hâli (-de/-da)",
    question: "Kalem çanta___.",
    options: ["-da", "-ya", "-dan", "-yı"], correctAnswer: 0,
    explanation: "Местный падеж -de/-da отвечает на вопрос «где»: çantada — «в сумке».",
  },
  {
    id: "g-a1-07", level: "A1", topic: "Çıkma hâli (-den/-dan)",
    question: "Okul___ eve geldim.",
    options: ["-dan", "-a", "-da", "-ın"], correctAnswer: 0,
    explanation: "Исходный падеж -den/-dan означает «откуда»: okuldan — «из школы».",
  },
  {
    id: "g-a1-08", level: "A1", topic: "Belirtme hâli (-ı/-i)",
    question: "Ben kitab___ okudum.",
    options: ["-ı", "-a", "-da", "-dan"], correctAnswer: 0,
    explanation: "Винительный падеж -ı/-i ставится у определённого объекта: kitabı okudum — «я прочитал (эту) книгу».",
  },
  {
    id: "g-a1-09", level: "A1", topic: "yok",
    question: "Evde kimse ___.",
    options: ["yok", "var", "değil", "mi"], correctAnswer: 0,
    explanation: "«yok» — отсутствие. Evde kimse yok — «дома никого нет».",
  },
  {
    id: "g-a1-10", level: "A1", topic: "Soru sözcüğü (nerede)",
    question: "Sen ___ yaşıyorsun?",
    options: ["nerede", "ne", "kim", "kaç"], correctAnswer: 0,
    explanation: "«nerede» — «где». Sen nerede yaşıyorsun? — «Где ты живёшь?».",
  },
  {
    id: "g-a1-11", level: "A1", topic: "Soru sözcüğü (ne)",
    question: "Şimdi ___ yapıyorsun?",
    options: ["ne", "nerede", "kim", "kaç"], correctAnswer: 0,
    explanation: "«ne» — «что». Ne yapıyorsun? — «Что ты делаешь?».",
  },
  {
    id: "g-a1-12", level: "A1", topic: "Şimdiki zaman çoğul",
    question: "Onlar şimdi ders çalış___.",
    options: ["-ıyorlar", "-tılar", "-acaklar", "-mışlar"], correctAnswer: 0,
    explanation: "Настоящее время для «onlar»: основа + -ıyor + -lar: çalışıyorlar — «они занимаются».",
  },
  {
    id: "g-a1-13", level: "A1", topic: "Bulunma hâli",
    question: "Annem mutfak___ yemek yapıyor.",
    options: ["-ta", "-a", "-tan", "-ın"], correctAnswer: 0,
    explanation: "После глухой согласной местный падеж принимает форму -ta: mutfakta — «на кухне».",
  },
  {
    id: "g-a1-14", level: "A1", topic: "İyelik eki (benim)",
    question: "Bu benim ___.",
    options: ["evim", "ev", "evi", "eve"], correctAnswer: 0,
    explanation: "Притяжательность 1-го лица: ev + -im = evim — «мой дом».",
  },
  {
    id: "g-a1-15", level: "A1", topic: "Ek-fiil (-sin)",
    question: "Sen nereli___?",
    options: ["-sin", "-im", "-iz", "-ler"], correctAnswer: 0,
    explanation: "Личное окончание 2-го лица -sin: nerelisin? — «откуда ты?».",
  },
  {
    id: "g-a1-16", level: "A1", topic: "Ek-fiil (-yım)",
    question: "Ben yirmi yaşında___.",
    options: ["-yım", "-sın", "-yız", "-lar"], correctAnswer: 0,
    explanation: "«быть» в 1-м лице ед.ч.: yaşındayım — «мне … лет (я в возрасте …)».",
  },

  /* ------------------------------- A2 (16) ------------------------------- */
  {
    id: "g-a2-01", level: "A2", topic: "Görülen geçmiş zaman (-dı)",
    question: "Dün sinemaya git___.",
    options: ["-tim", "-iyorum", "-eceğim", "-erim"], correctAnswer: 0,
    explanation: "Прошедшее категорическое -dı: после глухой -t → gittim — «я (вчера) ходил».",
  },
  {
    id: "g-a2-02", level: "A2", topic: "Öğrenilen geçmiş (-mış)",
    question: "Duydum ki Ali evlen___.",
    options: ["-miş", "-di", "-ecek", "-iyor"], correctAnswer: 0,
    explanation: "Прошедшее на -mış передаёт пересказ/услышанное: evlenmiş — «(говорят) он женился».",
  },
  {
    id: "g-a2-03", level: "A2", topic: "Gelecek zaman (-acak)",
    question: "Yarın seni ara___.",
    options: ["-yacağım", "-dım", "-yordum", "-mışım"], correctAnswer: 0,
    explanation: "Будущее время -acak + -ım: arayacağım — «я позвоню тебе завтра».",
  },
  {
    id: "g-a2-04", level: "A2", topic: "Yeterlilik (-ebilmek)",
    question: "Ben biraz Türkçe konuş___.",
    options: ["-abiliyorum", "-malıyım", "-dım", "-acağım"], correctAnswer: 0,
    explanation: "Способность -abilmek: konuşabiliyorum — «я могу немного говорить по-турецки».",
  },
  {
    id: "g-a2-05", level: "A2", topic: "Karşılaştırma (daha)",
    question: "Bu araba ötekinden ___ hızlı.",
    options: ["daha", "en", "pek az", "kadar"], correctAnswer: 0,
    explanation: "Сравнительная степень образуется словом «daha»: daha hızlı — «быстрее».",
  },
  {
    id: "g-a2-06", level: "A2", topic: "Üstünlük (en)",
    question: "O, sınıfın ___ çalışkan öğrencisi.",
    options: ["en", "daha", "çok", "pek"], correctAnswer: 0,
    explanation: "Превосходная степень — словом «en»: en çalışkan — «самый трудолюбивый».",
  },
  {
    id: "g-a2-07", level: "A2", topic: "Edat (için)",
    question: "Sağlık ___ spor yapıyorum.",
    options: ["için", "gibi", "kadar", "ile"], correctAnswer: 0,
    explanation: "Послелог «için» — «ради/для»: sağlık için — «ради здоровья».",
  },
  {
    id: "g-a2-08", level: "A2", topic: "Edat (gibi)",
    question: "O, bir melek ___ güzel.",
    options: ["gibi", "için", "kadar", "ile"], correctAnswer: 0,
    explanation: "«gibi» — «как, подобно»: melek gibi — «как ангел».",
  },
  {
    id: "g-a2-09", level: "A2", topic: "Edat (ile)",
    question: "Okula otobüs ___ gidiyorum.",
    options: ["ile", "için", "gibi", "kadar"], correctAnswer: 0,
    explanation: "«ile» указывает на средство: otobüs ile (otobüsle) — «на автобусе».",
  },
  {
    id: "g-a2-10", level: "A2", topic: "Edat (kadar)",
    question: "Sabahtan akşama ___ çalıştım.",
    options: ["kadar", "için", "gibi", "ile"], correctAnswer: 0,
    explanation: "«kadar» здесь обозначает предел: akşama kadar — «до вечера».",
  },
  {
    id: "g-a2-11", level: "A2", topic: "Geçmiş olumsuz",
    question: "Dün hasta olduğum için okula git___.",
    options: ["-medim", "-meyeceğim", "-miyorum", "-emem"], correctAnswer: 0,
    explanation: "Отрицание прошедшего времени -me + -dim: gitmedim — «я не ходил».",
  },
  {
    id: "g-a2-12", level: "A2", topic: "Yönelme + gelecek",
    question: "Gelecek yıl üniversite___ başlayacağım.",
    options: ["-ye", "-de", "-den", "-nin"], correctAnswer: 0,
    explanation: "«başlamak» управляет направительным падежом: üniversiteye başlamak — «начать (учёбу в) университете».",
  },
  {
    id: "g-a2-13", level: "A2", topic: "-mış (uzak geçmiş)",
    question: "Eskiden burada büyük bir okul var___.",
    options: ["-mış", "-dı", "-acak", "-ıyor"], correctAnswer: 0,
    explanation: "varmış — «(говорят/раньше) была»: -mış передаёт сведения о далёком прошлом.",
  },
  {
    id: "g-a2-14", level: "A2", topic: "Yeterlilik olumsuz",
    question: "Bugün gel___, çünkü çok meşgulüm.",
    options: ["-emem", "-medim", "-meliyim", "-iyorum"], correctAnswer: 0,
    explanation: "Невозможность -ememek: gelemem — «я не могу прийти».",
  },
  {
    id: "g-a2-15", level: "A2", topic: "Gereklilik (-malı)",
    question: "Yarın sınav var, ders çalış___.",
    options: ["-malıyım", "-abilirim", "-dım", "-mışım"], correctAnswer: 0,
    explanation: "Долженствование -malı/-meli: çalışmalıyım — «я должен заниматься».",
  },
  {
    id: "g-a2-16", level: "A2", topic: "Eşitlik (kadar)",
    question: "Kardeşim de benim ___ uzun boylu.",
    options: ["kadar", "daha", "en", "gibi"], correctAnswer: 0,
    explanation: "«… kadar» при равенстве: benim kadar uzun — «такой же высокий, как я».",
  },

  /* ------------------------------- B1 (16) ------------------------------- */
  {
    id: "g-b1-01", level: "B1", topic: "Bağlaç (çünkü)",
    question: "Dışarı çıkmadım ___ hava çok soğuktu.",
    options: ["çünkü", "ama", "oysa", "yoksa"], correctAnswer: 0,
    explanation: "«çünkü» вводит причину: «потому что было очень холодно».",
  },
  {
    id: "g-b1-02", level: "B1", topic: "Bağlaç (ama)",
    question: "Çok yorgunum ___ işi bitirmem gerekiyor.",
    options: ["ama", "çünkü", "öyleyse", "yoksa"], correctAnswer: 0,
    explanation: "«ama» выражает противопоставление: «но мне нужно закончить работу».",
  },
  {
    id: "g-b1-03", level: "B1", topic: "Zarf-fiil (-erek)",
    question: "Müzik dinle___ ders çalışıyorum.",
    options: ["-yerek", "-meden", "-ince", "-dikten sonra"], correctAnswer: 0,
    explanation: "-arak/-erek обозначает способ/одновременность: dinleyerek — «слушая (музыку)».",
  },
  {
    id: "g-b1-04", level: "B1", topic: "Zarf-fiil (-ince)",
    question: "Eve gel___ beni hemen ara.",
    options: ["-ince", "-erek", "-meden", "-dikten"], correctAnswer: 0,
    explanation: "-ınca/-ince — «когда»: gelince — «когда придёшь».",
  },
  {
    id: "g-b1-05", level: "B1", topic: "Zarf-fiil (-meden)",
    question: "Kahvaltı yap___ evden çıktım.",
    options: ["-madan", "-arak", "-ınca", "-dıktan sonra"], correctAnswer: 0,
    explanation: "-meden/-madan — «не сделав»: yapmadan — «не позавтракав».",
  },
  {
    id: "g-b1-06", level: "B1", topic: "Zarf-fiil (-dıktan sonra)",
    question: "Ödevimi bitir___ dışarı çıkacağım.",
    options: ["-dikten sonra", "-meden", "-erek", "-ince"], correctAnswer: 0,
    explanation: "-dıktan sonra — «после того как»: bitirdikten sonra — «после того как закончу».",
  },
  {
    id: "g-b1-07", level: "B1", topic: "Dolaylı anlatım (göre)",
    question: "Duyduğuma ___ Burak ile Aslı kavga etmiş.",
    options: ["göre", "kadar", "için", "gibi"], correctAnswer: 0,
    explanation: "«duyduğuma göre» — «насколько я слышал»; с -mış передаётся чужая речь.",
  },
  {
    id: "g-b1-08", level: "B1", topic: "Şart kipi (-sa)",
    question: "Yeterli param ol___ yeni bir telefon alırdım.",
    options: ["-sa", "-ınca", "-arak", "-dıkça"], correctAnswer: 0,
    explanation: "Условие -sa/-se: param olsa — «если бы у меня были деньги».",
  },
  {
    id: "g-b1-09", level: "B1", topic: "Bağlaç (oysa)",
    question: "Onu zengin sanıyordum ___ çok mütevazı yaşıyormuş.",
    options: ["oysa", "çünkü", "öyleyse", "yoksa"], correctAnswer: 0,
    explanation: "«oysa» — «однако/а на самом деле», вводит контраст с ожиданием.",
  },
  {
    id: "g-b1-10", level: "B1", topic: "Bağlaç (yoksa)",
    question: "Acele et ___ treni kaçıracağız.",
    options: ["yoksa", "çünkü", "oysa", "ama"], correctAnswer: 0,
    explanation: "«yoksa» — «иначе/а не то»: «поторопись, иначе опоздаем на поезд».",
  },
  {
    id: "g-b1-11", level: "B1", topic: "Bağlaç (öyleyse)",
    question: "Çok yorgunsun, ___ biraz dinlen.",
    options: ["öyleyse", "çünkü", "oysa", "yoksa"], correctAnswer: 0,
    explanation: "«öyleyse» — «тогда/в таком случае», вводит вывод.",
  },
  {
    id: "g-b1-12", level: "B1", topic: "Zarf-fiil (-arak)",
    question: "Çocuk koş___ annesinin yanına gitti.",
    options: ["-arak", "-madan", "-ınca", "-dıktan sonra"], correctAnswer: 0,
    explanation: "koşarak — «бегом/побежав»: способ действия через -arak.",
  },
  {
    id: "g-b1-13", level: "B1", topic: "Dolaylı anlatım (bakılırsa)",
    question: "Söylediğine ___ yarın işe gelmeyecekmiş.",
    options: ["bakılırsa", "kadar", "için", "gibi"], correctAnswer: 0,
    explanation: "«söylediğine bakılırsa» — «судя по тому, что он говорит».",
  },
  {
    id: "g-b1-14", level: "B1", topic: "Zarf-fiil (-ünce)",
    question: "Onu karşımda gör___ çok şaşırdım.",
    options: ["-ünce", "-meden", "-erek", "-dıkça"], correctAnswer: 0,
    explanation: "görmek → görünce — «увидев/когда увидел» (гармония гласных -ünce).",
  },
  {
    id: "g-b1-15", level: "B1", topic: "Şart (-sa)",
    question: "Yarın yağmur yağar___ pikniğe gitmeyiz.",
    options: ["-sa", "-ınca", "-arak", "-madan"], correctAnswer: 0,
    explanation: "Реальное условие: yağarsa — «если пойдёт дождь».",
  },
  {
    id: "g-b1-16", level: "B1", topic: "Bağlaç (ama / yine de)",
    question: "Otobüse geç kaldım ___ yine de işe yetiştim.",
    options: ["ama", "çünkü", "yoksa", "öyleyse"], correctAnswer: 0,
    explanation: "«ama … yine de» — «но всё же»: противопоставление с уступкой.",
  },

  /* ------------------------------- B2 (16) ------------------------------- */
  {
    id: "g-b2-01", level: "B2", topic: "Edilgen çatı (-ıl)",
    question: "Bu köprü 1990 yılında ___.",
    options: ["yapıldı", "yaptı", "yapacak", "yapıyor"], correctAnswer: 0,
    explanation: "Страдательный залог -ıl: yapıldı — «был построен» (исполнитель не назван).",
  },
  {
    id: "g-b2-02", level: "B2", topic: "Edilgen + gelecek",
    question: "Sınav sonuçları yarın ___.",
    options: ["açıklanacak", "açıklayacak", "açıkladı", "açıklıyor"], correctAnswer: 0,
    explanation: "açıklanacak — «будут объявлены»: пассив -n + будущее -acak.",
  },
  {
    id: "g-b2-03", level: "B2", topic: "Deyim (dört gözle beklemek)",
    question: "Tatili ___ bekliyorum.",
    options: ["dört gözle", "göz yumarak", "kulak vererek", "el atarak"], correctAnswer: 0,
    explanation: "Идиома «dört gözle beklemek» — «ждать с большим нетерпением».",
  },
  {
    id: "g-b2-04", level: "B2", topic: "Deyim (can atmak)",
    question: "O işe girmek için resmen ___.",
    options: ["can atıyor", "göz yumuyor", "kulak asmıyor", "el çekiyor"], correctAnswer: 0,
    explanation: "«can atmak» — «страстно желать, рваться (что-то сделать)».",
  },
  {
    id: "g-b2-05", level: "B2", topic: "Deyim (göz yummak)",
    question: "Yöneticiler bu hataya uzun süre ___.",
    options: ["göz yumdu", "can attı", "dört gözle baktı", "kulak verdi"], correctAnswer: 0,
    explanation: "«göz yummak» — «закрывать глаза (на что-то), не замечать намеренно».",
  },
  {
    id: "g-b2-06", level: "B2", topic: "Edilgen (geçmiş)",
    question: "Toplantıda bu konu hakkında çok ___.",
    options: ["konuşuldu", "konuştu", "konuşacak", "konuşuyor"], correctAnswer: 0,
    explanation: "Безличный пассив: konuşuldu — «(на собрании) много говорили (об этом)».",
  },
  {
    id: "g-b2-07", level: "B2", topic: "Edilgen (bilinmektedir)",
    question: "Sigaranın sağlığa zararlı olduğu herkesçe ___.",
    options: ["bilinmektedir", "biliyor", "bilecek", "bildi"], correctAnswer: 0,
    explanation: "Книжный пассив -maktadır: bilinmektedir — «известно (всем)».",
  },
  {
    id: "g-b2-08", level: "B2", topic: "Edilgen (bekleniyor)",
    question: "Hafta sonu hava sıcaklığının artması ___.",
    options: ["bekleniyor", "bekliyor", "bekledi", "bekleyecek"], correctAnswer: 0,
    explanation: "bekleniyor — «ожидается»: пассив от beklemek.",
  },
  {
    id: "g-b2-09", level: "B2", topic: "Deyim (kulak misafiri olmak)",
    question: "İstemeden de olsa konuşmalarına ___ oldum.",
    options: ["kulak misafiri", "göz hapsi", "el ayak", "baş başa"], correctAnswer: 0,
    explanation: "«kulak misafiri olmak» — «случайно услышать чужой разговор».",
  },
  {
    id: "g-b2-10", level: "B2", topic: "Anlatım bozukluğu",
    question: "Hangi cümlede anlatım bozukluğu yoktur?",
    options: [
      "İki saat boyunca onu bekledim.",
      "İki saat boyunca süreyle onu bekledim.",
      "İki saatlik boyunca onu bekledim.",
      "İki saat kadar süre boyunca onu bekledim.",
    ], correctAnswer: 0,
    explanation: "«boyunca» уже значит «в течение», добавлять «süreyle» — это плеоназм. Верно: İki saat boyunca bekledim.",
  },
  {
    id: "g-b2-11", level: "B2", topic: "Edilgen (-ıl)",
    question: "Kapı rüzgârın etkisiyle birden ___.",
    options: ["açıldı", "açtı", "açacak", "açıyor"], correctAnswer: 0,
    explanation: "açıldı — «открылась/была открыта»: пассив подчёркивает, что действие произошло само.",
  },
  {
    id: "g-b2-12", level: "B2", topic: "Deyim (ağzı kulaklarına varmak)",
    question: "Hediyeyi görünce sevinçten ___.",
    options: ["ağzı kulaklarına vardı", "eli ayağı tutmadı", "gözü korktu", "kafası karıştı"], correctAnswer: 0,
    explanation: "«ağzı kulaklarına varmak» — «расплыться в улыбке от радости».",
  },
  {
    id: "g-b2-13", level: "B2", topic: "Ad-fiil (-dığını)",
    question: "Onun dün İstanbul'a gel___ sonradan öğrendim.",
    options: ["-diğini", "-mesini", "-erek", "-ince"], correctAnswer: 0,
    explanation: "Придаточное дополнение с -dık: geldiğini öğrendim — «узнал, что он приехал».",
  },
  {
    id: "g-b2-14", level: "B2", topic: "Ad-fiil (-acağını)",
    question: "Yarın sınav ol___ daha yeni öğrendim.",
    options: ["-acağını", "-duğunu", "-masını", "-arak"], correctAnswer: 0,
    explanation: "Будущее в придаточном с -acak: olacağını öğrendim — «узнал, что будет (экзамен)».",
  },
  {
    id: "g-b2-15", level: "B2", topic: "Deyim (burnu havada)",
    question: "Çok kibirli biri; her zaman ___ dolaşıyor.",
    options: ["burnu havada", "eli açık", "yüreği geniş", "ayağı yere basan"], correctAnswer: 0,
    explanation: "«burnu havada» — «задирать нос, держаться высокомерно».",
  },
  {
    id: "g-b2-16", level: "B2", topic: "Edilgen (geniş zaman)",
    question: "Bu yöresel yemek nasıl ___?",
    options: ["yapılır", "yapar", "yapacak", "yapıyor"], correctAnswer: 0,
    explanation: "Безличный пассив настоящего-общего времени: yapılır — «как (это) готовится».",
  },

  /* ------------------------------- C1 (16) ------------------------------- */
  {
    id: "g-c1-01", level: "C1", topic: "Bağlaç (her ne kadar … -sa da)",
    question: "___ çok çalışsa da sınavı geçemedi.",
    options: ["Her ne kadar", "Ne var ki", "Madem", "Oysa"], correctAnswer: 0,
    explanation: "«her ne kadar … -sa da» — «хотя/несмотря на то что …, всё же …».",
  },
  {
    id: "g-c1-02", level: "C1", topic: "Bağlaç (ne var ki)",
    question: "Plan kâğıt üzerinde mükemmeldi; ___ uygulamada başarısız oldu.",
    options: ["ne var ki", "her ne kadar", "madem", "şayet"], correctAnswer: 0,
    explanation: "«ne var ki» — «однако, но вот» — вводит неожиданное противоречие.",
  },
  {
    id: "g-c1-03", level: "C1", topic: "Bağlaç (-dığı sürece)",
    question: "Sen yanımda ol___ hiçbir zorluktan korkmam.",
    options: ["-duğun sürece", "-acağı kadar", "-masına karşın", "-madan"], correctAnswer: 0,
    explanation: "«-dığı sürece» — «пока/до тех пор пока»: olduğun sürece — «пока ты рядом».",
  },
  {
    id: "g-c1-04", level: "C1", topic: "Cümle birleştirme (-ince)",
    question: "«Eve gideceğim. Yemek pişireceğim.» cümleleri en uygun şekilde nasıl birleşir?",
    options: [
      "Eve gidince yemek pişireceğim.",
      "Eve giderek yemek pişireceğim.",
      "Eve gitmeden yemek pişireceğim.",
      "Eve gittikçe yemek pişireceğim.",
    ], correctAnswer: 0,
    explanation: "-ince связывает два последовательных действия: «когда приду домой — приготовлю еду».",
  },
  {
    id: "g-c1-05", level: "C1", topic: "İsim-fiil (-mak özne)",
    question: "Erken ___ sağlık açısından oldukça faydalıdır.",
    options: ["kalkmak", "kalkarak", "kalkınca", "kalktıkça"], correctAnswer: 0,
    explanation: "Инфинитив -mak в роли подлежащего: «Рано вставать — полезно для здоровья».",
  },
  {
    id: "g-c1-06", level: "C1", topic: "Sıfat-fiil (-an)",
    question: "Köşede sessizce otur___ öğrenci sınıf birincisiymiş.",
    options: ["-an", "-dığı", "-mak", "-arak"], correctAnswer: 0,
    explanation: "Причастие -an определяет существительное: oturan öğrenci — «сидящий ученик».",
  },
  {
    id: "g-c1-07", level: "C1", topic: "Zarf-fiil (-dıkça)",
    question: "Zaman geç___ aralarındaki anlaşmazlık daha da derinleşti.",
    options: ["-tikçe", "-ince", "-erek", "-meden"], correctAnswer: 0,
    explanation: "«-dıkça» — «по мере того как»: geçtikçe — «по мере того как шло время».",
  },
  {
    id: "g-c1-08", level: "C1", topic: "Bağlaç (-masına rağmen)",
    question: "Çok yorgun ol___ projeyi tamamlamaktan vazgeçmedi.",
    options: ["-masına rağmen", "-duğu için", "-arak", "-ınca"], correctAnswer: 0,
    explanation: "«-masına rağmen» — «несмотря на то что»: olmasına rağmen — «несмотря на усталость».",
  },
  {
    id: "g-c1-09", level: "C1", topic: "Paragraf tamamlama",
    question: "«Küresel ısınma, çağımızın en ciddi sorunlarından biridir. ___» Boşluğa anlamca en uygun cümle hangisidir?",
    options: [
      "Bu nedenle ülkeler ortak ve acil önlemler almak zorundadır.",
      "Çünkü dün hava oldukça güzeldi.",
      "Ancak kediler son derece sevimli hayvanlardır.",
      "Örneğin futbol dünyada çok popüler bir spordur.",
    ], correctAnswer: 0,
    explanation: "Продолжение должно логически развивать тему потепления — вариант про совместные срочные меры.",
  },
  {
    id: "g-c1-10", level: "C1", topic: "Akademik edilgen",
    question: "Araştırmada elde edilen bulgular kısaca şöyle ___:",
    options: ["özetlenebilir", "özetler", "özetledi", "özetliyor"], correctAnswer: 0,
    explanation: "Книжная безличная конструкция: özetlenebilir — «могут быть кратко изложены».",
  },
  {
    id: "g-c1-11", level: "C1", topic: "Bağlaç (-dığı takdirde)",
    question: "Başvurunuz kabul edil___ tarafınıza bilgi verilecektir.",
    options: ["-diği takdirde", "-erek", "-ince kadar", "-meden"], correctAnswer: 0,
    explanation: "«-dığı takdirde» — «в случае если»: kabul edildiği takdirde — «в случае одобрения».",
  },
  {
    id: "g-c1-12", level: "C1", topic: "Bağlaç (dolayısıyla)",
    question: "Talep beklenmedik ölçüde arttı; ___ fiyatlar hızla yükseldi.",
    options: ["dolayısıyla", "oysa", "her ne kadar", "meğer"], correctAnswer: 0,
    explanation: "«dolayısıyla» — «следовательно/в результате», вводит следствие.",
  },
  {
    id: "g-c1-13", level: "C1", topic: "Bağlaç (gerek … gerek(se))",
    question: "Bu karar ___ ekonomik ___ toplumsal açıdan büyük önem taşıyor.",
    options: ["gerek … gerekse", "hem … ya", "ne … ne", "ya … veya"], correctAnswer: 0,
    explanation: "«gerek … gerek(se)» — «как …, так и …»: и с экономической, и с социальной точки зрения.",
  },
  {
    id: "g-c1-14", level: "C1", topic: "Bağlaç (ne … ne)",
    question: "Toplantıya ___ müdür ___ sekreter katıldı; bu yüzden karar ertelendi.",
    options: ["ne … ne", "hem … hem", "gerek … gerek", "ya … ya"], correctAnswer: 0,
    explanation: "«ne … ne» — «ни …, ни …»: глагол ставится в утвердительной форме, но смысл отрицательный.",
  },
  {
    id: "g-c1-15", level: "C1", topic: "İsim-fiil (-ması)",
    question: "Onun bu denli başarılı ol___ hepimizi gururlandırdı.",
    options: ["-ması", "-arak", "-ınca", "-dıkça"], correctAnswer: 0,
    explanation: "Субстантивация -ma + притяж.: olması — «то, что он(а) (столь) успешен(на)» как подлежащее.",
  },
  {
    id: "g-c1-16", level: "C1", topic: "Cümle birleştirme (-ması)",
    question: "«Hava kirliliği artıyor. İnsan sağlığı tehdit altında.» en uygun birleşim hangisidir?",
    options: [
      "Hava kirliliğinin artması insan sağlığını tehdit etmektedir.",
      "Hava kirliliği artarak insan sağlığını tehdit eder.",
      "Hava kirliliği artınca insan sağlığı tehdit eder.",
      "Hava kirliliği arttıkça insan sağlığını tehdit etti.",
    ], correctAnswer: 0,
    explanation: "Субстантивированное подлежащее: «Рост загрязнения воздуха угрожает здоровью человека».",
  },
];

export const GRAMMAR_BY_LEVEL = (lvl: Question["level"]) =>
  GRAMMAR_TASKS.filter((q) => q.level === lvl);
