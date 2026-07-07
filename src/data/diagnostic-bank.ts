/**
 * Diagnostic v2 question bank (DESIGN-DIAGNOSTIC-V2 §2).
 *
 * Stages:
 *   router  — 6 questions × 5 levels (A1–C1), every item topic-tagged; feeds
 *             the adaptive staircase in src/lib/diagnostic/engine.ts and the
 *             per-topic gap map / mastery seeding.
 *   dinleme — 2 audio sets × 4 questions per level (A2/B1/B2). Audio files are
 *             generated once from `transcript` by scripts/generate-diagnostic-audio.mts
 *             into public/audio/diagnostic/. Speaker labels (AHU:/FATİH:) map
 *             to the voice registry in src/lib/ai/voices.ts.
 *   okuma   — 2 texts × 5 questions per level (A2/B1/B2).
 *   yazma   — 2 prompts per level (A2–C1); AI-reviewed, never client-scored.
 *
 * Content status: AI-drafted, pending native review (DESIGN-CONTENT-TOMER §4
 * checklist). Question `level` values are a first calibration — adjust from
 * real solve-rate stats once `answers` accumulate.
 */

import type { Level, Localized } from "@/lib/quiz";

/** Bank levels exclude A0 — the staircase floor is A1. */
export type BankLevel = Exclude<Level, "A0">;

export type BankItem = {
  /** "r-b1-04" = stage-level-number */
  id: string;
  stage: "router" | "dinleme" | "okuma";
  level: BankLevel;
  /** Topic id from src/lib/ai/topics.ts; "other" allowed for comprehension items */
  topic: string;
  /** Turkish prompt (shown in every locale) */
  prompt: string;
  /** Meaning hint for ru/en/kk (router A1–A2 only — comprehension stages must not translate) */
  hint?: Localized;
  options: string[];
  answer: number;
  /** dinleme only: which audio set this question belongs to */
  audioId?: string;
  /** okuma only: which text this question belongs to */
  textId?: string;
};

export type BankAudio = {
  id: string;
  level: BankLevel;
  /** Public path of the generated mp3 */
  src: string;
  /** Line-per-utterance script; "AHU:" / "FATİH:" prefixes select the TTS voice */
  transcript: string;
};

export type BankText = {
  id: string;
  level: BankLevel;
  title: string;
  body: string;
};

export type YazmaPrompt = {
  id: string;
  level: BankLevel;
  prompt: string;
  hint: Localized;
  minSentences: number;
};

/* ================================ ROUTER ================================= */
/* 6 per level. Every question tests exactly one registry topic. */

export const ROUTER: BankItem[] = [
  /* ---------- A1 ---------- */
  {
    id: "r-a1-01", stage: "router", level: "A1", topic: "present_iyor",
    prompt: "Ben şimdi kitap ___.",
    hint: { ru: "Я сейчас читаю книгу.", en: "I am reading a book right now.", tr: "", kk: "Мен қазір кітап оқып жатырмын." },
    options: ["okuyorum", "okudum", "okuyacağım", "okurum"], answer: 0,
  },
  {
    id: "r-a1-02", stage: "router", level: "A1", topic: "var_yok",
    prompt: "Evde süt ___. Markete gidelim.",
    hint: { ru: "Дома нет молока. Пойдём в магазин.", en: "There is no milk at home. Let's go to the store.", tr: "", kk: "Үйде сүт жоқ. Дүкенге барайық." },
    options: ["yok", "değil", "hayır", "olmaz"], answer: 0,
  },
  {
    id: "r-a1-03", stage: "router", level: "A1", topic: "locative_dative",
    prompt: "Ailem ___ yaşıyor.",
    hint: { ru: "Моя семья живёт в Стамбуле.", en: "My family lives in Istanbul.", tr: "", kk: "Отбасым Ыстанбұлда тұрады." },
    options: ["İstanbul'da", "İstanbul'a", "İstanbul'dan", "İstanbul'u"], answer: 0,
  },
  {
    id: "r-a1-04", stage: "router", level: "A1", topic: "plural_suffix",
    prompt: "___ çantada.",
    hint: { ru: "Книги в сумке.", en: "The books are in the bag.", tr: "", kk: "Кітаптар сөмкеде." },
    options: ["Kitaplar", "Kitapler", "Kitapılar", "Kitapları"], answer: 0,
  },
  {
    id: "r-a1-05", stage: "router", level: "A1", topic: "question_particle",
    prompt: "Sen öğrenci ___?",
    hint: { ru: "Ты студент?", en: "Are you a student?", tr: "", kk: "Сен оқушысың ба?" },
    options: ["misin", "mısın", "musun", "müsün"], answer: 0,
  },
  {
    id: "r-a1-06", stage: "router", level: "A1", topic: "past_di_mis",
    prompt: "Dün akşam sinemaya ___.",
    hint: { ru: "Вчера вечером я сходил в кино.", en: "I went to the cinema last night.", tr: "", kk: "Кеше кешке киноға бардым." },
    options: ["gittim", "gidiyorum", "gideceğim", "giderim"], answer: 0,
  },

  /* ---------- A2 ---------- */
  {
    id: "r-a2-01", stage: "router", level: "A2", topic: "izafet",
    prompt: "Ali'nin ___ çok yeni.",
    hint: { ru: "Машина Али совсем новая.", en: "Ali's car is brand new.", tr: "", kk: "Әлидің көлігі жап-жаңа." },
    options: ["arabası", "arabaı", "arabasi", "araban"], answer: 0,
  },
  {
    id: "r-a2-02", stage: "router", level: "A2", topic: "future_acak",
    prompt: "Yarın hava çok güzel ___.",
    hint: { ru: "Завтра погода будет очень хорошей.", en: "The weather will be very nice tomorrow.", tr: "", kk: "Ертең ауа райы өте жақсы болады." },
    options: ["olacak", "oluyor", "oldu", "olur muydu"], answer: 0,
  },
  {
    id: "r-a2-03", stage: "router", level: "A2", topic: "aorist_general",
    prompt: "Su 100 derecede ___.",
    hint: { ru: "Вода кипит при 100 градусах (общий факт).", en: "Water boils at 100 degrees (a general fact).", tr: "", kk: "Су 100 градуста қайнайды (жалпы факт)." },
    options: ["kaynar", "kaynıyor", "kaynadı", "kaynayacak"], answer: 0,
  },
  {
    id: "r-a2-04", stage: "router", level: "A2", topic: "abilitative",
    prompt: "Üzgünüm, yarın toplantıya ___. (imkânım yok)",
    hint: { ru: "К сожалению, я не смогу прийти на завтрашнюю встречу.", en: "Sorry, I won't be able to come to tomorrow's meeting.", tr: "", kk: "Өкінішке қарай, ертеңгі жиналысқа келе алмаймын." },
    options: ["gelemem", "gelmem", "gelmedim", "gelmeyecektim"], answer: 0,
  },
  {
    id: "r-a2-05", stage: "router", level: "A2", topic: "necessity_meli",
    prompt: "Sınav yarın; bu akşam ders ___.",
    hint: { ru: "Экзамен завтра; сегодня вечером я должен заниматься.", en: "The exam is tomorrow; I must study tonight.", tr: "", kk: "Емтихан ертең; бүгін кешке сабақ оқуым керек." },
    options: ["çalışmalıyım", "çalıştım", "çalışsam", "çalışıyordum"], answer: 0,
  },
  {
    id: "r-a2-06", stage: "router", level: "A2", topic: "postpositions",
    prompt: "Bana ___ bu film çok güzel.",
    hint: { ru: "По-моему, этот фильм очень хороший.", en: "In my opinion, this film is very good.", tr: "", kk: "Меніңше, бұл фильм өте жақсы." },
    options: ["göre", "kadar", "için", "gibi"], answer: 0,
  },

  /* ---------- B1 ---------- */
  {
    id: "r-b1-01", stage: "router", level: "B1", topic: "converbs",
    prompt: "Müzik ___ ders çalışıyorum.",
    options: ["dinleyerek", "dinlediğinde", "dinlemeden önce", "dinlenip"], answer: 0,
  },
  {
    id: "r-b1-02", stage: "router", level: "B1", topic: "participles",
    prompt: "Masada ___ kitap benim.",
    options: ["duran", "durduğu", "durulmuş", "durarak"], answer: 0,
  },
  {
    id: "r-b1-03", stage: "router", level: "B1", topic: "conditionals",
    prompt: "Yağmur ___ pikniğe gitmeyeceğiz.",
    options: ["yağarsa", "yağsaydı", "yağdıkça", "yağmasına rağmen"], answer: 0,
  },
  {
    id: "r-b1-04", stage: "router", level: "B1", topic: "noun_clauses",
    prompt: "Ali'nin yarın ___ biliyorum.",
    options: ["geleceğini", "gelecek", "gelmesine", "geldiğinden"], answer: 0,
  },
  {
    id: "r-b1-05", stage: "router", level: "B1", topic: "while_ken",
    prompt: "Ben ___ bu parkta oynardım.",
    options: ["çocukken", "çocukta", "çocuğa göre", "çocuktan beri"], answer: 0,
  },
  {
    id: "r-b1-06", stage: "router", level: "B1", topic: "reported_speech",
    prompt: "Ayşe bana yarın İzmir'e ___ söyledi.",
    options: ["gideceğini", "gidecek", "gitti diye mi", "gidilmesini"], answer: 0,
  },

  /* ---------- B2 ---------- */
  {
    id: "r-b2-01", stage: "router", level: "B2", topic: "passive_voice",
    prompt: "Bu köprü 1973'te inşa ___.",
    options: ["edildi", "etti", "edindi", "ettirdi"], answer: 0,
  },
  {
    id: "r-b2-02", stage: "router", level: "B2", topic: "causative_voice",
    prompt: "Saçlarımı dün kuaförde ___.",
    options: ["kestirdim", "kestim", "kesildim", "kesiştim"], answer: 0,
  },
  {
    id: "r-b2-03", stage: "router", level: "B2", topic: "reflexive_reciprocal",
    prompt: "Yıllar sonra sokakta eski bir arkadaşımla ___.",
    options: ["karşılaştık", "karşıladık", "karşılandık", "karşılattık"], answer: 0,
  },
  {
    id: "r-b2-04", stage: "router", level: "B2", topic: "relative_ki",
    prompt: "O kadar yorgundum ___ akşam yemeği yemeden uyudum.",
    options: ["ki", "diye", "için", "kadar"], answer: 0,
  },
  {
    id: "r-b2-05", stage: "router", level: "B2", topic: "collocations",
    prompt: "Bu ilaç baş ağrısına çok iyi ___.",
    options: ["gelir", "yapar", "olur", "eder"], answer: 0,
  },
  {
    id: "r-b2-06", stage: "router", level: "B2", topic: "word_order",
    prompt: "Hangi cümle kurallı (doğru dizilişli) bir cümledir?",
    options: [
      "Ali dün akşam bize harika bir yemek pişirdi.",
      "Ali pişirdi dün akşam bize harika bir yemek.",
      "Dün akşam harika bir yemek Ali pişirdi bize.",
      "Ali dün akşam harika bir pişirdi yemek bize.",
    ],
    answer: 0,
  },

  /* ---------- C1 ---------- */
  {
    id: "r-c1-01", stage: "router", level: "C1", topic: "discourse_connectors",
    prompt: "Proje çok başarılıydı; ___, bütçeyi aşmadan tamamlandı.",
    options: ["üstelik", "oysa", "yoksa", "meğer"], answer: 0,
  },
  {
    id: "r-c1-02", stage: "router", level: "C1", topic: "nominalization_advanced",
    prompt: "Toplantının ___ yeni haberim oldu.",
    options: ["ertelendiğinden", "ertelenmesinden", "erteleyeceğinden", "ertelenmişinden"], answer: 0,
  },
  {
    id: "r-c1-03", stage: "router", level: "C1", topic: "register_style",
    prompt: "Resmî bir dilekçede hangisi uygundur?",
    options: [
      "Gereğini arz ederim.",
      "Hadi bunu halledin artık.",
      "Bi' bakarsanız sevinirim.",
      "Bunu yapın lütfen ya.",
    ],
    answer: 0,
  },
  {
    id: "r-c1-04", stage: "router", level: "C1", topic: "discourse_connectors",
    prompt: "___ çok çalıştıysa da sınavı geçemedi.",
    options: ["Her ne kadar", "Nitekim", "Dolayısıyla", "Madem"], answer: 0,
  },
  {
    id: "r-c1-05", stage: "router", level: "C1", topic: "collocations",
    prompt: "Bu konuyu tekrar açman hiç doğru değildi; resmen yaraya tuz ___.",
    options: ["bastın", "ektin", "attın", "serptin"], answer: 0,
  },
  {
    id: "r-c1-06", stage: "router", level: "C1", topic: "nominalization_advanced",
    prompt: "Sorunun çözümü, tarafların birbirine güven ___ bağlıdır.",
    options: ["duymasına", "duyduğuna", "duyacağına", "duyulmasına"], answer: 0,
  },
];

/* ================================ DINLEME ================================ */

export const DINLEME_AUDIO: BankAudio[] = [
  {
    id: "d-a2-01", level: "A2", src: "/audio/diagnostic/d-a2-01.mp3",
    transcript:
      "AHU: Merhaba Elif, ben Zeynep. Yarın akşam evimde küçük bir doğum günü partisi yapıyorum. Saat yedide başlıyor. Annem büyük bir pasta yapacak, kardeşim de müzik hazırlıyor. Lütfen gel, çok eğleneceğiz. Gelirken bir şey getirme, sadece kendin gel. Yalnız biz geçen ay taşındık; yeni adresimizi sana mesaj olarak göndereceğim. Yarın akşam görüşürüz!",
  },
  {
    id: "d-a2-02", level: "A2", src: "/audio/diagnostic/d-a2-02.mp3",
    transcript: [
      "FATİH: Merhaba, hoş geldiniz. Ne istersiniz?",
      "AHU: Merhaba. Bir kilo domates istiyorum. Taze mi?",
      "FATİH: Çok taze, bugün geldi. Başka bir şey?",
      "AHU: Elmalar kaça?",
      "FATİH: Kilosu kırk lira.",
      "AHU: Biraz pahalı. Yarım kilo alayım. Bir de iki tane limon lütfen.",
      "FATİH: Tabii. Hepsi doksan lira.",
      "AHU: Buyurun. Teşekkürler, iyi günler!",
      "FATİH: Ben teşekkür ederim, yine bekleriz.",
    ].join("\n"),
  },
  {
    id: "d-b1-01", level: "B1", src: "/audio/diagnostic/d-b1-01.mp3",
    transcript: [
      "AHU: Fatih, hafta sonu için bir planın var mı?",
      "FATİH: Aslında yok. Sen ne yapmayı düşünüyorsun?",
      "AHU: Cumartesi sabahı Adalar'a gitmek istiyorum. Hava güzel olacakmış.",
      "FATİH: İyi fikir! Vapurla mı gideceğiz?",
      "AHU: Evet, Kabataş'tan dokuz vapuruna binelim. Adada bisiklet kiralayabiliriz.",
      "FATİH: Ben bisiklete binmeyi pek beceremiyorum ama yürümeyi severim.",
      "AHU: O zaman sen yürürsün, ben bisiklete binerim. Öğle yemeğini deniz kenarındaki balıkçıda yeriz.",
      "FATİH: Anlaştık. Yalnız akşam erken dönmemiz lazım, pazartesi sınavım var.",
      "AHU: Merak etme, son vapurla döneriz.",
    ].join("\n"),
  },
  {
    id: "d-b1-02", level: "B1", src: "/audio/diagnostic/d-b1-02.mp3",
    transcript:
      "FATİH: Değerli öğrenciler, dikkatinize! Üniversite kütüphanemiz gelecek hafta pazartesi gününden itibaren yaz çalışma saatlerine geçiyor. Kütüphane hafta içi sabah dokuzdan akşam yediye kadar açık olacak. Hafta sonları ise sadece cumartesi günü, saat ondan dörde kadar hizmet vereceğiz. Sınav dönemi boyunca üçüncü kattaki sessiz çalışma salonu yirmi dört saat açık kalacak. Ödünç aldığınız kitapları zamanında iade etmeyi unutmayın; aksi hâlde günlük beş lira ceza ödemeniz gerekiyor. Hepinize başarılar dileriz.",
  },
  {
    id: "d-b2-01", level: "B2", src: "/audio/diagnostic/d-b2-01.mp3",
    transcript: [
      "FATİH: Buyurun, oturun lütfen. Özgeçmişinizi inceledim. Üç yıl bir reklam ajansında çalışmışsınız.",
      "AHU: Evet, orada sosyal medya projelerini yürütüyordum. Ekibimle birlikte birçok markanın kampanyasını yönettik.",
      "FATİH: Peki neden işinizden ayrıldınız?",
      "AHU: Ajans İzmir'e taşındı; ben ailemden dolayı İstanbul'da kalmak zorundaydım. Ayrıca kendimi geliştirebileceğim daha büyük bir şirkette çalışmak istiyordum.",
      "FATİH: Bizde tempo oldukça yüksek. Zaman baskısı altında çalışmaya alışkın mısınız?",
      "AHU: Kesinlikle. Son projemizi normal süresinin yarısında teslim ettik. Baskı altında daha verimli çalıştığımı söyleyebilirim.",
      "FATİH: Güzel. Maaş beklentinizi öğrenebilir miyim?",
      "AHU: Sektör ortalamasının biraz üzerinde bir teklif beklediğimi açıkça söylemeliyim; çünkü yanımda hazır bir müşteri ağı da getiriyorum.",
      "FATİH: Anlıyorum. Önümüzdeki hafta size dönüş yaparız.",
    ].join("\n"),
  },
  {
    id: "d-b2-02", level: "B2", src: "/audio/diagnostic/d-b2-02.mp3",
    transcript:
      "AHU: İstanbul Teknik Üniversitesi'ndeki bir grup araştırmacı, deniz suyunu içme suyuna dönüştüren taşınabilir bir cihaz geliştirdi. Güneş enerjisiyle çalışan cihaz, saatte yaklaşık on litre temiz su üretebiliyor. Araştırma ekibinin başındaki Profesör Deniz Arslan, cihazın özellikle kuraklıktan etkilenen kıyı bölgeleri için tasarlandığını belirtti. Seri üretime gelecek yıl geçilmesi planlanıyor; ancak ekip, fiyatın ilk aşamada yüksek olacağını kabul ediyor. Uzmanlar, benzer teknolojilerin yaygınlaşması hâlinde su kıtlığı sorununun önemli ölçüde hafifleyebileceği görüşünde.",
  },
];

export const DINLEME: BankItem[] = [
  /* d-a2-01 — telefon mesajı */
  { id: "d-a2-01-q1", stage: "dinleme", level: "A2", topic: "other", audioId: "d-a2-01",
    prompt: "Zeynep yarın akşam ne yapıyor?",
    options: ["Doğum günü partisi", "Düğün", "Piknik", "Sinema gecesi"], answer: 0 },
  { id: "d-a2-01-q2", stage: "dinleme", level: "A2", topic: "other", audioId: "d-a2-01",
    prompt: "Parti saat kaçta başlıyor?",
    options: ["Yedide", "Altıda", "Sekizde", "Dokuzda"], answer: 0 },
  { id: "d-a2-01-q3", stage: "dinleme", level: "A2", topic: "other", audioId: "d-a2-01",
    prompt: "Pastayı kim yapacak?",
    options: ["Zeynep'in annesi", "Zeynep", "Elif", "Zeynep'in kardeşi"], answer: 0 },
  { id: "d-a2-01-q4", stage: "dinleme", level: "A2", topic: "other", audioId: "d-a2-01",
    prompt: "Zeynep, Elif'e ne gönderecek?",
    options: ["Yeni adresini", "Parti fotoğraflarını", "Hediye listesini", "Pasta tarifini"], answer: 0 },

  /* d-a2-02 — manavda */
  { id: "d-a2-02-q1", stage: "dinleme", level: "A2", topic: "other", audioId: "d-a2-02",
    prompt: "Bu konuşma nerede geçiyor?",
    options: ["Manavda", "Eczanede", "Lokantada", "Kitapçıda"], answer: 0 },
  { id: "d-a2-02-q2", stage: "dinleme", level: "A2", topic: "other", audioId: "d-a2-02",
    prompt: "Domatesler ne zaman gelmiş?",
    options: ["Bugün", "Dün", "Geçen hafta", "Üç gün önce"], answer: 0 },
  { id: "d-a2-02-q3", stage: "dinleme", level: "A2", topic: "other", audioId: "d-a2-02",
    prompt: "Kadın ne kadar elma alıyor?",
    options: ["Yarım kilo", "Bir kilo", "İki kilo", "Hiç almıyor"], answer: 0 },
  { id: "d-a2-02-q4", stage: "dinleme", level: "A2", topic: "other", audioId: "d-a2-02",
    prompt: "Kadın toplam ne kadar ödüyor?",
    options: ["Doksan lira", "Kırk lira", "Elli lira", "Yüz lira"], answer: 0 },

  /* d-b1-01 — hafta sonu planı */
  { id: "d-b1-01-q1", stage: "dinleme", level: "B1", topic: "other", audioId: "d-b1-01",
    prompt: "Ahu hafta sonu nereye gitmek istiyor?",
    options: ["Adalar'a", "Kapadokya'ya", "İzmir'e", "Alışveriş merkezine"], answer: 0 },
  { id: "d-b1-01-q2", stage: "dinleme", level: "B1", topic: "other", audioId: "d-b1-01",
    prompt: "Fatih neden bisiklete binmek istemiyor?",
    options: ["İyi binemiyor", "Pahalı buluyor", "Çok yorgun", "Bisikletleri beğenmiyor"], answer: 0 },
  { id: "d-b1-01-q3", stage: "dinleme", level: "B1", topic: "other", audioId: "d-b1-01",
    prompt: "Öğle yemeğini nerede yiyecekler?",
    options: ["Deniz kenarındaki balıkçıda", "Vapurda", "Evde", "Üniversite yemekhanesinde"], answer: 0 },
  { id: "d-b1-01-q4", stage: "dinleme", level: "B1", topic: "other", audioId: "d-b1-01",
    prompt: "Neden erken dönmeleri gerekiyor?",
    options: ["Fatih'in sınavı var", "Vapur seferleri bitiyor", "Hava bozacak", "Ahu çalışacak"], answer: 0 },

  /* d-b1-02 — kütüphane duyurusu */
  { id: "d-b1-02-q1", stage: "dinleme", level: "B1", topic: "other", audioId: "d-b1-02",
    prompt: "Bu duyuru ne hakkında?",
    options: ["Kütüphanenin yaz çalışma saatleri", "Yeni kitapların tanıtımı", "Sınav sonuçları", "Üniversite kayıtları"], answer: 0 },
  { id: "d-b1-02-q2", stage: "dinleme", level: "B1", topic: "other", audioId: "d-b1-02",
    prompt: "Kütüphane hafta içi saat kaça kadar açık olacak?",
    options: ["Akşam yediye kadar", "Akşam dokuza kadar", "Öğlen dörde kadar", "Yirmi dört saat"], answer: 0 },
  { id: "d-b1-02-q3", stage: "dinleme", level: "B1", topic: "other", audioId: "d-b1-02",
    prompt: "Sınav döneminde ne yirmi dört saat açık kalacak?",
    options: ["Sessiz çalışma salonu", "Bütün kütüphane", "Kafeterya", "Bilgisayar laboratuvarı"], answer: 0 },
  { id: "d-b1-02-q4", stage: "dinleme", level: "B1", topic: "other", audioId: "d-b1-02",
    prompt: "Kitabı geç iade eden ne yapmak zorunda?",
    options: ["Günlük beş lira ceza ödemek", "Yeni kitap almak", "Dilekçe yazmak", "Üye kartını iade etmek"], answer: 0 },

  /* d-b2-01 — iş görüşmesi */
  { id: "d-b2-01-q1", stage: "dinleme", level: "B2", topic: "other", audioId: "d-b2-01",
    prompt: "Kadın daha önce nerede çalışmış?",
    options: ["Bir reklam ajansında", "Bir bankada", "Bir üniversitede", "Bir televizyon kanalında"], answer: 0 },
  { id: "d-b2-01-q2", stage: "dinleme", level: "B2", topic: "other", audioId: "d-b2-01",
    prompt: "İşinden ayrılma sebeplerinden biri nedir?",
    options: ["Ajansın başka şehre taşınması", "Maaşının düşürülmesi", "Ekibiyle anlaşamaması", "İşten çıkarılması"], answer: 0 },
  { id: "d-b2-01-q3", stage: "dinleme", level: "B2", topic: "other", audioId: "d-b2-01",
    prompt: "Kadın zaman baskısı hakkında ne söylüyor?",
    options: ["Baskı altında daha verimli çalıştığını", "Baskıdan hoşlanmadığını", "Hiç deneyimi olmadığını", "Ek ücret istediğini"], answer: 0 },
  { id: "d-b2-01-q4", stage: "dinleme", level: "B2", topic: "other", audioId: "d-b2-01",
    prompt: "Maaş konusunda kadının beklentisi nedir?",
    options: ["Sektör ortalamasının üzerinde bir teklif", "Ortalama bir maaş", "Önceki maaşının aynısı", "Maaş konusunda kararsız"], answer: 0 },

  /* d-b2-02 — haber */
  { id: "d-b2-02-q1", stage: "dinleme", level: "B2", topic: "other", audioId: "d-b2-02",
    prompt: "Geliştirilen cihaz ne yapıyor?",
    options: ["Deniz suyunu içme suyuna dönüştürüyor", "Havadan elektrik üretiyor", "Yağmur suyu topluyor", "Suyu ısıtıyor"], answer: 0 },
  { id: "d-b2-02-q2", stage: "dinleme", level: "B2", topic: "other", audioId: "d-b2-02",
    prompt: "Cihaz hangi enerjiyle çalışıyor?",
    options: ["Güneş enerjisiyle", "Rüzgâr enerjisiyle", "Pille", "Elektrik şebekesiyle"], answer: 0 },
  { id: "d-b2-02-q3", stage: "dinleme", level: "B2", topic: "other", audioId: "d-b2-02",
    prompt: "Cihaz özellikle kimler için tasarlandı?",
    options: ["Kuraklıktan etkilenen kıyı bölgeleri için", "Büyük şehirler için", "Dağ köyleri için", "Fabrikalar için"], answer: 0 },
  { id: "d-b2-02-q4", stage: "dinleme", level: "B2", topic: "other", audioId: "d-b2-02",
    prompt: "Seri üretime ne zaman geçilmesi planlanıyor?",
    options: ["Gelecek yıl", "Bu yıl", "Beş yıl sonra", "Henüz belli değil"], answer: 0 },
];

/* ================================= OKUMA ================================= */

export const OKUMA_TEXTS: BankText[] = [
  {
    id: "o-a2-01", level: "A2", title: "Murat'ın Günü",
    body:
      "Merhaba! Benim adım Murat. Ankara'da yaşıyorum ve bir hastanede hemşire olarak çalışıyorum. Sabahları çok erken kalkıyorum çünkü işim saat yedide başlıyor. Öğle yemeğini genellikle hastanenin yemekhanesinde yiyorum. Akşamları eve dönünce spor yapıyorum ve dizi izliyorum. Hafta sonları çalışmıyorum. Cumartesi günleri annemi ziyaret ediyorum, pazar günleri ise arkadaşlarımla futbol oynuyorum. İşim yorucu ama insanlara yardım etmeyi çok seviyorum.",
  },
  {
    id: "o-a2-02", level: "A2", title: "Kiralık Daire",
    body:
      "KİRALIK DAİRE — Kadıköy'de, metro istasyonuna beş dakika yürüme mesafesinde, üçüncü katta, iki oda bir salon daire. Dairede eşya yoktur. Bina yenidir ve asansör vardır. Aylık kira 18.000 lira, ayrıca iki aylık depozito alınır. Evcil hayvan kabul edilmez. Daireyi görmek için hafta içi 10.00–18.00 arasında Ali Bey'i arayınız: 0532 111 22 33.",
  },
  {
    id: "o-b1-01", level: "B1", title: "İyi Bir Uyku İçin",
    body:
      "Uzmanlara göre yetişkin bir insanın günde ortalama yedi ile dokuz saat arasında uyuması gerekiyor. Ancak yapılan araştırmalar, şehirlerde yaşayan insanların çoğunun altı saatten az uyuduğunu gösteriyor. Uykusuzluğun en önemli sebeplerinden biri, yatmadan önce telefon ve bilgisayar ekranına bakmak. Ekranlardan yayılan mavi ışık, beynimize «hâlâ gündüz» mesajı veriyor ve uykuya dalmamızı geciktiriyor. Uyku uzmanı Doktor Kaya, yatmadan en az bir saat önce bütün ekranların kapatılmasını öneriyor. Bunun yerine kitap okumak ya da hafif müzik dinlemek, vücudu uykuya hazırlıyor. Düzenli uyuyan insanların hem daha mutlu hem de daha başarılı olduğu biliniyor.",
  },
  {
    id: "o-b1-02", level: "B1", title: "Kapadokya",
    body:
      "Kapadokya, Türkiye'nin en çok ziyaret edilen bölgelerinden biridir. Milyonlarca yıl önce yanardağlardan çıkan küller, rüzgâr ve yağmurun etkisiyle bugünkü ilginç kayalıkları oluşturmuştur. İnsanlar bu yumuşak kayaların içine evler, kiliseler ve hatta yeraltı şehirleri yapmıştır. Bölgeye gelen turistlerin en sevdiği etkinlik, gün doğarken yapılan balon turudur. Balonlar sabah çok erken havalanır çünkü o saatlerde rüzgâr sakindir. Tur yaklaşık bir saat sürer ve önceden yer ayırtmak gerekir; çünkü özellikle yaz aylarında balonlara büyük ilgi vardır. Uzmanlar, bölgeyi görmek için en uygun mevsimin ilkbahar ve sonbahar olduğunu söylüyor.",
  },
  {
    id: "o-b2-01", level: "B2", title: "Uzaktan Çalışma",
    body:
      "Salgın döneminde yaygınlaşan uzaktan çalışma, bugün pek çok şirkette kalıcı hâle geldi. Çalışanların önemli bir bölümü, işe gidip gelmek için harcadıkları zamandan tasarruf ettikleri için bu modelden memnun. Ancak madalyonun bir de öteki yüzü var. İş ve özel hayat arasındaki sınırın belirsizleşmesi, birçok kişide «her an çalışıyor olma» hissine yol açıyor. Ayrıca yöneticiler, ekip ruhunun zayıfladığından ve işe yeni başlayanların şirket kültürünü öğrenmekte zorlandığından şikâyet ediyor. Bu yüzden şirketlerin çoğu, haftanın birkaç günü ofise gelmeyi zorunlu tutan karma modele yöneliyor. Araştırmalar ise verimliliğin çalışma yerinden çok, işin doğru planlanmasına bağlı olduğunu ortaya koyuyor.",
  },
  {
    id: "o-b2-02", level: "B2", title: "Kâğıt mı, Ekran mı?",
    body:
      "Elektronik kitapların yaygınlaşması, basılı kitabın geleceği hakkında hararetli tartışmalara yol açtı. E-kitap savunucuları, binlerce kitabı tek bir cihazda taşıyabilmenin ve istenilen kitaba saniyeler içinde ulaşabilmenin büyük kolaylık olduğunu vurguluyor. Üstelik e-kitaplar, kâğıt tüketimini azalttığı için çevre dostu olarak da görülüyor. Buna karşılık basılı kitap tutkunları, kâğıdın kokusunun ve sayfa çevirme hissinin yerini hiçbir ekranın tutamayacağını söylüyor. Bilim insanlarının bu tartışmaya katkısı ise düşündürücü: Yapılan deneyler, ekrandan okuyan kişilerin metindeki ayrıntıları, kâğıttan okuyanlara göre daha zor hatırladığını gösteriyor. Yine de uzmanlar kesin bir yargıya varmaktan kaçınıyor; çünkü sonuçlar okuyucunun alışkanlıklarına göre değişebiliyor. Görünen o ki iki format, uzun süre yan yana yaşamaya devam edecek.",
  },
];

export const OKUMA: BankItem[] = [
  /* o-a2-01 */
  { id: "o-a2-01-q1", stage: "okuma", level: "A2", topic: "other", textId: "o-a2-01",
    prompt: "Murat nerede çalışıyor?",
    options: ["Hastanede", "Okulda", "Bankada", "Lokantada"], answer: 0 },
  { id: "o-a2-01-q2", stage: "okuma", level: "A2", topic: "other", textId: "o-a2-01",
    prompt: "Murat'ın işi saat kaçta başlıyor?",
    options: ["Yedide", "Sekizde", "Dokuzda", "Altıda"], answer: 0 },
  { id: "o-a2-01-q3", stage: "okuma", level: "A2", topic: "other", textId: "o-a2-01",
    prompt: "Murat öğle yemeğini genellikle nerede yiyor?",
    options: ["Hastanenin yemekhanesinde", "Evde", "Restoranda", "Annesinde"], answer: 0 },
  { id: "o-a2-01-q4", stage: "okuma", level: "A2", topic: "other", textId: "o-a2-01",
    prompt: "Murat cumartesi günleri ne yapıyor?",
    options: ["Annesini ziyaret ediyor", "Futbol oynuyor", "Çalışıyor", "Dizi izliyor"], answer: 0 },
  { id: "o-a2-01-q5", stage: "okuma", level: "A2", topic: "other", textId: "o-a2-01",
    prompt: "Murat işi hakkında ne düşünüyor?",
    options: ["Yorucu ama seviyor", "Sıkıcı buluyor", "Kolay buluyor", "Değiştirmek istiyor"], answer: 0 },

  /* o-a2-02 */
  { id: "o-a2-02-q1", stage: "okuma", level: "A2", topic: "other", textId: "o-a2-02",
    prompt: "Bu ilan ne hakkında?",
    options: ["Kiralık bir daire", "Satılık bir araba", "İş ilanı", "Kayıp ilanı"], answer: 0 },
  { id: "o-a2-02-q2", stage: "okuma", level: "A2", topic: "other", textId: "o-a2-02",
    prompt: "Daire metroya ne kadar uzaklıkta?",
    options: ["Beş dakika yürüme mesafesinde", "On dakika otobüsle", "Yarım saat yürüme", "Metroya çok uzak"], answer: 0 },
  { id: "o-a2-02-q3", stage: "okuma", level: "A2", topic: "other", textId: "o-a2-02",
    prompt: "Dairede eşya var mı?",
    options: ["Hayır, daire boş", "Evet, tamamen eşyalı", "Sadece mutfak eşyalı", "İlanda yazmıyor"], answer: 0 },
  { id: "o-a2-02-q4", stage: "okuma", level: "A2", topic: "other", textId: "o-a2-02",
    prompt: "Depozito ne kadar?",
    options: ["İki aylık kira tutarı", "Bir aylık kira tutarı", "18.000 lira", "Depozito yok"], answer: 0 },
  { id: "o-a2-02-q5", stage: "okuma", level: "A2", topic: "other", textId: "o-a2-02",
    prompt: "İlana göre hangisi doğrudur?",
    options: ["Evcil hayvan kabul edilmiyor", "Bina eskidir", "Asansör yoktur", "Daire birinci kattadır"], answer: 0 },

  /* o-b1-01 */
  { id: "o-b1-01-q1", stage: "okuma", level: "B1", topic: "other", textId: "o-b1-01",
    prompt: "Uzmanlara göre yetişkin bir insan günde kaç saat uyumalı?",
    options: ["Yedi ile dokuz saat arasında", "Altı saatten az", "En az on saat", "Beş saat yeterli"], answer: 0 },
  { id: "o-b1-01-q2", stage: "okuma", level: "B1", topic: "other", textId: "o-b1-01",
    prompt: "Uykusuzluğun en önemli sebeplerinden biri nedir?",
    options: ["Yatmadan önce ekrana bakmak", "Geç yemek yemek", "Az spor yapmak", "Kahve içmek"], answer: 0 },
  { id: "o-b1-01-q3", stage: "okuma", level: "B1", topic: "other", textId: "o-b1-01",
    prompt: "Mavi ışık beynimize hangi mesajı veriyor?",
    options: ["«Hâlâ gündüz»", "«Uyku zamanı»", "«Dinlenmelisin»", "«Karanlık oldu»"], answer: 0 },
  { id: "o-b1-01-q4", stage: "okuma", level: "B1", topic: "other", textId: "o-b1-01",
    prompt: "Doktor Kaya ne öneriyor?",
    options: ["Yatmadan bir saat önce ekranları kapatmayı", "Uyku ilacı kullanmayı", "Geç yatmayı", "Sabah koşusu yapmayı"], answer: 0 },
  { id: "o-b1-01-q5", stage: "okuma", level: "B1", topic: "other", textId: "o-b1-01",
    prompt: "Metne göre düzenli uyuyan insanlar nasıldır?",
    options: ["Daha mutlu ve başarılı", "Daha yorgun", "Daha sinirli", "Daha yavaş"], answer: 0 },

  /* o-b1-02 */
  { id: "o-b1-02-q1", stage: "okuma", level: "B1", topic: "other", textId: "o-b1-02",
    prompt: "Kapadokya'daki kayalıklar nasıl oluşmuştur?",
    options: ["Yanardağ külleri, rüzgâr ve yağmurla", "Deniz suyunun çekilmesiyle", "İnsan eliyle", "Depremlerle"], answer: 0 },
  { id: "o-b1-02-q2", stage: "okuma", level: "B1", topic: "other", textId: "o-b1-02",
    prompt: "İnsanlar kayaların içine neler yapmıştır?",
    options: ["Evler, kiliseler ve yeraltı şehirleri", "Sadece depolar", "Oteller ve restoranlar", "Yollar ve köprüler"], answer: 0 },
  { id: "o-b1-02-q3", stage: "okuma", level: "B1", topic: "other", textId: "o-b1-02",
    prompt: "Balonlar neden sabah çok erken havalanır?",
    options: ["O saatlerde rüzgâr sakin olduğu için", "Bilet daha ucuz olduğu için", "Turistler erken kalktığı için", "Öğlen çok sıcak olduğu için"], answer: 0 },
  { id: "o-b1-02-q4", stage: "okuma", level: "B1", topic: "other", textId: "o-b1-02",
    prompt: "Balon turu için ne yapmak gerekir?",
    options: ["Önceden yer ayırtmak", "Sağlık raporu almak", "Rehber tutmak", "Özel kıyafet giymek"], answer: 0 },
  { id: "o-b1-02-q5", stage: "okuma", level: "B1", topic: "other", textId: "o-b1-02",
    prompt: "Bölgeyi görmek için en uygun mevsimler hangileridir?",
    options: ["İlkbahar ve sonbahar", "Yaz ve kış", "Sadece yaz", "Sadece kış"], answer: 0 },

  /* o-b2-01 */
  { id: "o-b2-01-q1", stage: "okuma", level: "B2", topic: "other", textId: "o-b2-01",
    prompt: "Çalışanlar uzaktan çalışmadan neden memnun?",
    options: ["Yolda geçen zamandan tasarruf ettikleri için", "Daha çok maaş aldıkları için", "Daha az çalıştıkları için", "Tatil günleri arttığı için"], answer: 0 },
  { id: "o-b2-01-q2", stage: "okuma", level: "B2", topic: "other", textId: "o-b2-01",
    prompt: "«Madalyonun öteki yüzü» ifadesiyle ne kastediliyor?",
    options: ["Modelin olumsuz yanları", "Şirketin kâr durumu", "Çalışanların maaşları", "Yeni bir ödül sistemi"], answer: 0 },
  { id: "o-b2-01-q3", stage: "okuma", level: "B2", topic: "other", textId: "o-b2-01",
    prompt: "Yöneticilerin şikâyetlerinden biri nedir?",
    options: ["Ekip ruhunun zayıflaması", "Ofis kiralarının artması", "Toplantıların uzaması", "Çalışanların istifa etmesi"], answer: 0 },
  { id: "o-b2-01-q4", stage: "okuma", level: "B2", topic: "other", textId: "o-b2-01",
    prompt: "Şirketlerin çoğu hangi modele yöneliyor?",
    options: ["Karma modele", "Tam uzaktan çalışmaya", "Tam ofis düzenine", "Dört günlük haftaya"], answer: 0 },
  { id: "o-b2-01-q5", stage: "okuma", level: "B2", topic: "other", textId: "o-b2-01",
    prompt: "Araştırmalara göre verimlilik esas olarak neye bağlıdır?",
    options: ["İşin doğru planlanmasına", "Çalışma yerine", "Çalışma saatlerinin uzunluğuna", "Maaşın yüksekliğine"], answer: 0 },

  /* o-b2-02 */
  { id: "o-b2-02-q1", stage: "okuma", level: "B2", topic: "other", textId: "o-b2-02",
    prompt: "E-kitap savunucularının vurguladığı avantaj nedir?",
    options: ["Binlerce kitabı tek cihazda taşıyabilmek", "E-kitapların daha ucuz olması", "Gözleri yormamaları", "Daha hızlı okunmaları"], answer: 0 },
  { id: "o-b2-02-q2", stage: "okuma", level: "B2", topic: "other", textId: "o-b2-02",
    prompt: "E-kitaplar neden çevre dostu olarak görülüyor?",
    options: ["Kâğıt tüketimini azalttığı için", "Az elektrik harcadığı için", "Geri dönüştürüldüğü için", "Nakliye gerektirmediği için"], answer: 0 },
  { id: "o-b2-02-q3", stage: "okuma", level: "B2", topic: "other", textId: "o-b2-02",
    prompt: "Deneyler ne göstermiştir?",
    options: ["Ekrandan okuyanların ayrıntıları daha zor hatırladığını", "E-kitap okuyanların daha hızlı olduğunu", "Kâğıttan okumanın gözü yorduğunu", "İki format arasında fark olmadığını"], answer: 0 },
  { id: "o-b2-02-q4", stage: "okuma", level: "B2", topic: "other", textId: "o-b2-02",
    prompt: "Uzmanlar neden kesin bir yargıya varmıyor?",
    options: ["Sonuçlar okuyucunun alışkanlıklarına göre değiştiği için", "Deneyler henüz bitmediği için", "Yayınevleri karşı çıktığı için", "Teknoloji çok hızlı değiştiği için"], answer: 0 },
  { id: "o-b2-02-q5", stage: "okuma", level: "B2", topic: "other", textId: "o-b2-02",
    prompt: "Metnin genel sonucu nedir?",
    options: ["İki format uzun süre birlikte var olacak", "Basılı kitap yok olacak", "E-kitaplar yasaklanacak", "Okuma alışkanlığı bitiyor"], answer: 0 },
];

/* ================================= YAZMA ================================= */

export const YAZMA_PROMPTS: YazmaPrompt[] = [
  {
    id: "y-a2-01", level: "A2", minSentences: 5,
    prompt: "Bir arkadaşınıza kısa bir mesaj yazın: Hafta sonu ne yapacaksınız? Onu nereye davet ediyorsunuz? (En az 5 cümle)",
    hint: {
      ru: "Напишите другу короткое сообщение: что будете делать на выходных? Куда его приглашаете? Минимум 5 предложений.",
      en: "Write a short message to a friend: what will you do this weekend? Where are you inviting them? At least 5 sentences.",
      tr: "",
      kk: "Досыңызға қысқа хабарлама жазыңыз: демалыс күндері не істейсіз? Оны қайда шақырасыз? Кемінде 5 сөйлем.",
    },
  },
  {
    id: "y-a2-02", level: "A2", minSentences: 5,
    prompt: "Kendinizi tanıtın: Nerede yaşıyorsunuz? Ne iş yapıyorsunuz? Boş zamanlarınızda neler yapıyorsunuz? (En az 5 cümle)",
    hint: {
      ru: "Расскажите о себе: где живёте? Кем работаете? Что делаете в свободное время? Минимум 5 предложений.",
      en: "Introduce yourself: where do you live? What do you do? What do you do in your free time? At least 5 sentences.",
      tr: "",
      kk: "Өзіңіз туралы айтыңыз: қайда тұрасыз? Не істейсіз? Бос уақытта немен айналысасыз? Кемінде 5 сөйлем.",
    },
  },
  {
    id: "y-b1-01", level: "B1", minSentences: 8,
    prompt: "«Büyük şehirde yaşamak mı, küçük şehirde yaşamak mı daha iyi?» Düşüncenizi sebepleriyle yazın. (En az 8 cümle)",
    hint: {
      ru: "«Где лучше жить — в большом городе или в маленьком?» Изложите мнение с аргументами. Минимум 8 предложений.",
      en: "“Is it better to live in a big city or a small town?” Give your opinion with reasons. At least 8 sentences.",
      tr: "",
      kk: "«Үлкен қалада тұрған дұрыс па, әлде кіші қалада ма?» Пікіріңізді дәлелдермен жазыңыз. Кемінде 8 сөйлем.",
    },
  },
  {
    id: "y-b1-02", level: "B1", minSentences: 8,
    prompt: "Hayatınızı değiştiren bir olayı anlatın: Ne oldu? Bu olaydan sonra neler değişti? (En az 8 cümle)",
    hint: {
      ru: "Опишите событие, изменившее вашу жизнь: что произошло? Что изменилось после? Минимум 8 предложений.",
      en: "Describe an event that changed your life: what happened? What changed afterwards? At least 8 sentences.",
      tr: "",
      kk: "Өміріңізді өзгерткен оқиғаны сипаттаңыз: не болды? Одан кейін не өзгерді? Кемінде 8 сөйлем.",
    },
  },
  {
    id: "y-b2-01", level: "B2", minSentences: 10,
    prompt: "«Sosyal medya insanları birbirine yaklaştırıyor mu, yoksa uzaklaştırıyor mu?» Görüşünüzü örneklerle savunun. (En az 120 kelime)",
    hint: {
      ru: "«Соцсети сближают людей или отдаляют?» Защитите свою позицию с примерами. Минимум 120 слов.",
      en: "“Does social media bring people closer or push them apart?” Defend your view with examples. At least 120 words.",
      tr: "",
      kk: "«Әлеуметтік желілер адамдарды жақындастыра ма, әлде алшақтата ма?» Пікіріңізді мысалдармен қорғаңыз. Кемінде 120 сөз.",
    },
  },
  {
    id: "y-b2-02", level: "B2", minSentences: 10,
    prompt: "«Teknoloji eğitimin kalitesini artırıyor mu?» Karşıt görüşe de değinerek kendi düşüncenizi açıklayın. (En az 120 kelime)",
    hint: {
      ru: "«Повышают ли технологии качество образования?» Изложите свою позицию, упомянув и противоположную. Минимум 120 слов.",
      en: "“Does technology improve the quality of education?” Explain your view, addressing the opposing one too. At least 120 words.",
      tr: "",
      kk: "«Технология білім сапасын арттыра ма?» Қарсы пікірге де тоқталып, өз ойыңызды түсіндіріңіз. Кемінде 120 сөз.",
    },
  },
  {
    id: "y-c1-01", level: "C1", minSentences: 12,
    prompt: "«Bir toplumun gelişmişliği, bireylerine sunduğu fırsat eşitliğiyle ölçülür.» Bu görüşü değerlendiriniz. (En az 180 kelime)",
    hint: {
      ru: "«Развитость общества измеряется равенством возможностей». Оцените это утверждение. Минимум 180 слов.",
      en: "“A society's development is measured by the equality of opportunity it offers.” Evaluate this view. At least 180 words.",
      tr: "",
      kk: "«Қоғамның дамуы мүмкіндіктер теңдігімен өлшенеді». Осы пікірге баға беріңіз. Кемінде 180 сөз.",
    },
  },
  {
    id: "y-c1-02", level: "C1", minSentences: 12,
    prompt: "«Yapay zekâ, insan yaratıcılığının yerini alabilir mi?» Farklı bakış açılarını karşılaştırarak kendi tezinizi savununuz. (En az 180 kelime)",
    hint: {
      ru: "«Может ли ИИ заменить человеческое творчество?» Сравните разные точки зрения и защитите свой тезис. Минимум 180 слов.",
      en: "“Can AI replace human creativity?” Compare different perspectives and defend your thesis. At least 180 words.",
      tr: "",
      kk: "«Жасанды интеллект адам шығармашылығын алмастыра ала ма?» Түрлі көзқарастарды салыстырып, өз тезисіңізді қорғаңыз. Кемінде 180 сөз.",
    },
  },
];

/* ------------------------------- Accessors ------------------------------- */

export function routerByLevel(level: BankLevel): BankItem[] {
  return ROUTER.filter((q) => q.level === level);
}

/** Dinleme sets of one level, grouped as { audio, questions } (bank order). */
export function dinlemeSets(level: BankLevel): { audio: BankAudio; questions: BankItem[] }[] {
  return DINLEME_AUDIO.filter((a) => a.level === level).map((audio) => ({
    audio,
    questions: DINLEME.filter((q) => q.audioId === audio.id),
  }));
}

/** Okuma sets of one level, grouped as { text, questions } (bank order). */
export function okumaSets(level: BankLevel): { text: BankText; questions: BankItem[] }[] {
  return OKUMA_TEXTS.filter((t) => t.level === level).map((text) => ({
    text,
    questions: OKUMA.filter((q) => q.textId === text.id),
  }));
}

export function yazmaByLevel(level: BankLevel): YazmaPrompt[] {
  return YAZMA_PROMPTS.filter((p) => p.level === level);
}
