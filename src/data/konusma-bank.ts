/**
 * Банк Konuşma-симуляции (Блок 5) — 4 части реального формата устного
 * TÖMER, темы по уровням из официальной структуры LanguageCert AÜ TÖMER
 * TürkYet. ФОРМУЛИРОВКИ ПОЛНОСТЬЮ НАШИ — официальные материалы под
 * копирайтом и не копируются; совпадают только тематические категории
 * (публикуемый факт о формате).
 *
 * Контент турецкий: симуляция идёт только на турецком, без переводов и
 * подсказок (это проверка, не урок — лестница поддержки отключена).
 * Уровень юнитов держит лексика/грамматика: A2 — настоящее/прошедшее,
 * быт; B1 — опыт и планы; B2 — аргументация; C1 — абстракция и
 * эмоционально нагруженные ситуации.
 */

export type KonusmaLevel = "A2" | "B1" | "B2" | "C1";

/** Bölüm 1: категория называется ВСЛУХ («Şimdi, Spor»), затем вопросы. */
export type KonusmaCategory = { id: string; nameTr: string; questionsTr: string[] };

/** Bölüm 2: ролевые. Тип A — экзаменатор начинает; тип B — СТУДЕНТ
 * начинает сам (карточка велит: «Konuşmayı SEN başlat»). */
export type KonusmaRoleplay = {
  id: string;
  type: "A" | "B";
  /** брифинг-карточка студенту (видна на экране, как на экзамене в руках) */
  situationTr: string;
  /** роль агента — уходит в сценарий сессии */
  examinerRoleTr: string;
  /** только тип A: стартовая реплика экзаменатора */
  openingTr?: string;
};

/** Bölüm 3: дискуссия по карточке — тема + тезисы-опора, 20с подготовки. */
export type KonusmaDiscussion = { id: string; topicTr: string; bulletsTr: string[] };

/** Bölüm 4: монолог до 2 минут (30с на заметки) + доп. вопросы. */
export type KonusmaMonologue = { id: string; topicTr: string; followUpsTr: string[] };

export type KonusmaLevelBank = {
  bolum1: KonusmaCategory[];
  bolum2: KonusmaRoleplay[];
  bolum3: KonusmaDiscussion[];
  bolum4: KonusmaMonologue[];
};

export const KONUSMA_BANK: Record<KonusmaLevel, KonusmaLevelBank> = {
  /* ============================== A2 ============================== */
  /* личные данные · семья · быт — простые времена, знакомая лексика */
  A2: {
    bolum1: [
      { id: "a2_kisisel", nameTr: "Kişisel bilgiler", questionsTr: [
        "Kendini kısaca tanıtır mısın? Adın ne, kaç yaşındasın?",
        "Nerede yaşıyorsun? Şehrini seviyor musun?",
        "Ne iş yapıyorsun ya da ne okuyorsun?",
        "Hangi dilleri konuşuyorsun?",
        "Neden Türkçe öğreniyorsun?",
      ] },
      { id: "a2_aile", nameTr: "Aile", questionsTr: [
        "Ailen kaç kişi? Kimler var?",
        "Ailenle birlikte mi yaşıyorsun?",
        "Kardeşin var mı? Ne yapıyorlar?",
        "Ailende en çok kiminle vakit geçiriyorsun?",
        "Hafta sonları ailenle ne yaparsınız?",
      ] },
      { id: "a2_gunluk", nameTr: "Günlük hayat", questionsTr: [
        "Sabahları saat kaçta kalkıyorsun?",
        "Kahvaltıda genellikle ne yersin?",
        "Günün nasıl geçiyor? Kısaca anlatır mısın?",
        "Akşamları ne yapmayı seviyorsun?",
        "Hafta sonu ne yaptın?",
      ] },
      { id: "a2_ev", nameTr: "Ev ve mahalle", questionsTr: [
        "Evin nasıl? Kaç odası var?",
        "Mahallende neler var? Market, park var mı?",
        "Evde en çok hangi odayı seviyorsun? Neden?",
        "Ev işlerinden hangilerini sen yapıyorsun?",
        "Komşularınla görüşüyor musun?",
      ] },
      { id: "a2_yemek", nameTr: "Yemek", questionsTr: [
        "En sevdiğin yemek ne?",
        "Yemek yapmayı biliyor musun? Ne yapıyorsun?",
        "Türk yemeklerinden ne denedin?",
        "Evde mi yersin, dışarıda mı? Neden?",
        "Çay mı içersin, kahve mi?",
      ] },
    ],
    bolum2: [
      { id: "a2_rp_market", type: "A",
        situationTr: "Marketteki kasadasın. Kasiyer sana poşet isteyip istemediğini soruyor. Cevap ver ve ekmeğin fiyatını sor.",
        examinerRoleTr: "Sen market kasiyerisin. Öğrenciye poşet isteyip istemediğini sor, ekmeğin fiyatını söyle (15 lira).",
        openingTr: "Merhaba, hoş geldiniz. Poşet ister misiniz?" },
      { id: "a2_rp_komsu", type: "A",
        situationTr: "Yeni komşun kapına geldi ve kendini tanıtıyor. Sen de kendini tanıt ve onu çaya davet et.",
        examinerRoleTr: "Sen yeni taşınan komşusun. Kendini tanıt ve nereden geldiğini söyle.",
        openingTr: "Merhaba! Ben yeni komşunuz. Dün yan daireye taşındık." },
      { id: "a2_rp_gec", type: "A",
        situationTr: "Arkadaşın seni akşam yemeğine çağırıyor ama o gün işin var. Özür dile ve başka bir gün öner.",
        examinerRoleTr: "Sen öğrencinin arkadaşısın. Onu cumartesi akşamı evine yemeğe davet et.",
        openingTr: "Selam! Cumartesi akşamı bize yemeğe gelir misin?" },
      { id: "a2_rp_kafe", type: "B",
        situationTr: "Kafedesin. Garson henüz gelmedi. Garsonu çağır, bir çay ve bir tost sipariş et, fiyatı sor. Konuşmayı SEN başlat.",
        examinerRoleTr: "Sen kafede garsonsun. Öğrenci seni çağırınca siparişi al; çay 20 lira, tost 50 lira." },
      { id: "a2_rp_yol", type: "B",
        situationTr: "Sokaktasın ve eczane arıyorsun. Yoldan geçen birine sor: eczane nerede, yürüyerek kaç dakika? Konuşmayı SEN başlat.",
        examinerRoleTr: "Sen yoldan geçen birisin. Eczanenin yerini tarif et: iki sokak ileride, sağda, yürüyerek beş dakika." },
      { id: "a2_rp_otobus", type: "B",
        situationTr: "Otobüs durağındasın. Yanındaki kişiye hangi otobüsün merkeze gittiğini ve ne zaman geleceğini sor. Konuşmayı SEN başlat.",
        examinerRoleTr: "Sen durakta bekleyen birisin. 12 numaralı otobüs merkeze gider, on dakikada bir gelir — bunu söyle." },
    ],
    bolum3: [
      { id: "a2_d_ev_yemek", topicTr: "Evde yemek mi, dışarıda yemek mi?", bulletsTr: [
        "fiyat — hangisi daha ucuz?", "zaman — yemek yapmak uzun sürüyor mu?", "sağlık — hangisi daha sağlıklı?", "lezzet — hangisi daha güzel?",
      ] },
      { id: "a2_d_sehir_koy", topicTr: "Şehirde yaşamak mı, köyde yaşamak mı?", bulletsTr: [
        "iş ve okul imkânları", "temiz hava ve doğa", "trafik ve gürültü", "aile ve komşuluk",
      ] },
      { id: "a2_d_yaz_kis", topicTr: "Yaz mı daha güzel, kış mı?", bulletsTr: [
        "hava ve giyim", "tatil imkânları", "yapılan aktiviteler", "sağlık — sıcak mı zor, soğuk mu?",
      ] },
      { id: "a2_d_telefon", topicTr: "Telefon: faydalı mı, zararlı mı?", bulletsTr: [
        "iletişim — aile ve arkadaşlar", "zaman — ne kadar kullanıyoruz?", "ders ve iş için fayda", "göz ve uyku sağlığı",
      ] },
    ],
    bolum4: [
      { id: "a2_m_gun", topicTr: "Benim bir günüm", followUpsTr: [
        "Günün en sevdiğin saati hangisi? Neden?", "Hafta sonu günlerin farklı mı geçiyor?", "Gününde neyi değiştirmek isterdin?",
      ] },
      { id: "a2_m_sehir", topicTr: "Yaşadığım şehir", followUpsTr: [
        "Şehrinde en çok nereyi seviyorsun?", "Misafirine şehrinde neyi gösterirsin?", "Başka bir şehirde yaşamak ister miydin?",
      ] },
      { id: "a2_m_arkadas", topicTr: "En yakın arkadaşım", followUpsTr: [
        "Arkadaşınla nasıl tanıştınız?", "Birlikte ne yapmayı seviyorsunuz?", "İyi bir arkadaş nasıl olmalı?",
      ] },
      { id: "a2_m_tatil", topicTr: "Geçen tatilim", followUpsTr: [
        "Tatilde en çok ne hoşuna gitti?", "Kiminle gittin?", "Bir sonraki tatilde nereye gitmek istiyorsun?",
      ] },
      { id: "a2_m_hobi", topicTr: "Boş zamanlarımda ne yapıyorum", followUpsTr: [
        "Bu hobiye nasıl başladın?", "Haftada kaç saat ayırıyorsun?", "Yeni bir hobi denemek ister misin?",
      ] },
      { id: "a2_m_yemekgun", topicTr: "Sevdiğim bir yemek ve nasıl yapılır", followUpsTr: [
        "Bu yemeği kimden öğrendin?", "Ne zaman yapıyorsun?", "Türk mutfağından ne denemek istersin?",
      ] },
    ],
  },

  /* ============================== B1 ============================== */
  /* телевидение · путешествия · распорядок — опыт, планы, сравнение */
  B1: {
    bolum1: [
      { id: "b1_tv", nameTr: "Televizyon ve diziler", questionsTr: [
        "Televizyon izliyor musun? Neler izliyorsun?",
        "Türk dizisi izledin mi? Nasıl buldun?",
        "Haberleri nereden takip ediyorsun?",
        "Sence insanlar çok mu televizyon izliyor?",
        "Bir program yapsan, ne hakkında olurdu?",
      ] },
      { id: "b1_seyahat", nameTr: "Seyahat", questionsTr: [
        "Şimdiye kadar nereleri gezdin?",
        "En güzel seyahatin hangisiydi? Neden?",
        "Yalnız mı seyahat etmeyi seversin, arkadaşla mı?",
        "Türkiye'de nereyi görmek istiyorsun?",
        "Seyahate çıkmadan önce nasıl hazırlanırsın?",
      ] },
      { id: "b1_gunluk", nameTr: "Günlük düzen", questionsTr: [
        "Haftalık programın nasıl? Anlatır mısın?",
        "Zamanını iyi kullandığını düşünüyor musun?",
        "Sabah insanı mısın, akşam insanı mı?",
        "Yoğun bir günden sonra nasıl dinlenirsin?",
        "Düzenli spor yapıyor musun? Neden?",
      ] },
      { id: "b1_okul_is", nameTr: "Okul ve iş", questionsTr: [
        "İşini ya da bölümünü neden seçtin?",
        "Bir gününde neler yapıyorsun? Anlat.",
        "Gelecekte hangi işi yapmak istiyorsun?",
        "Uzaktan çalışmak hakkında ne düşünüyorsun?",
        "İş ve özel hayat dengesi sence önemli mi?",
      ] },
      { id: "b1_teknoloji", nameTr: "Teknoloji ve internet", questionsTr: [
        "İnterneti en çok ne için kullanıyorsun?",
        "Sosyal medya kullanıyor musun? Hangilerini?",
        "Telefonsuz bir gün geçirebilir misin?",
        "Online alışveriş yapıyor musun? Neden?",
        "Teknoloji hayatımızı nasıl değiştirdi?",
      ] },
    ],
    bolum2: [
      { id: "b1_rp_otel", type: "A",
        situationTr: "Otele giriş yapıyorsun ama rezervasyonun sistemde görünmüyor. Durumu açıkla ve çözüm iste.",
        examinerRoleTr: "Sen otel resepsiyonistisin. Önce rezervasyonu bulamadığını söyle; öğrenci açıklayınca başka bir oda öner.",
        openingTr: "Hoş geldiniz. Adınıza rezervasyon göremiyorum, emin misiniz?" },
      { id: "b1_rp_iade", type: "A",
        situationTr: "Mağazadan aldığın ayakkabı küçük geldi. Satıcı seni karşılıyor. Değişim ya da iade iste.",
        examinerRoleTr: "Sen mağaza çalışanısın. Önce fiş sor, sonra değişim öner; aynı numara yoksa iade kabul et.",
        openingTr: "Merhaba, hoş geldiniz. Size nasıl yardımcı olabilirim?" },
      { id: "b1_rp_davet", type: "A",
        situationTr: "İş arkadaşın seni hafta sonu pikniğe davet ediyor ama o gün ailenle planın var. Nazikçe reddet ve başka bir öneri yap.",
        examinerRoleTr: "Sen iş arkadaşısın. Cumartesi pikniğe davet et, ısrarcı ol ama kırıcı olma.",
        openingTr: "Bu cumartesi hep birlikte pikniğe gidiyoruz, sen de gel!" },
      { id: "b1_rp_kayip", type: "B",
        situationTr: "Otobüste çantanı unuttun. Otobüs firmasının ofisine geldin. Durumu anlat: hangi sefer, çanta nasıl, içinde ne var. Konuşmayı SEN başlat.",
        examinerRoleTr: "Sen otobüs firması görevlisisin. Sefer saatini ve çantanın tarifini sor, kayıt oluştur, telefon numarası iste." },
      { id: "b1_rp_kurs", type: "B",
        situationTr: "Bir spor salonuna geldin. Üyelik hakkında bilgi al: fiyat, saatler, deneme dersi var mı. Konuşmayı SEN başlat.",
        examinerRoleTr: "Sen spor salonu görevlisisin. Aylık üyelik 2000 lira, salon 07:00-23:00 açık, ilk ders ücretsiz — sorulunca söyle." },
      { id: "b1_rp_randevu", type: "B",
        situationTr: "Arkadaşın hasta ama Türkçesi zayıf. Onun için doktordan telefonla randevu al: şikâyeti söyle, uygun gün ve saat iste. Konuşmayı SEN başlat.",
        examinerRoleTr: "Sen klinik sekreterisin. Şikâyeti ve hastanın adını sor; yarın 14:30'u öner." },
    ],
    bolum3: [
      { id: "b1_d_online", topicTr: "Online alışveriş mi, mağazadan alışveriş mi?", bulletsTr: [
        "fiyat ve indirimler", "deneme ve iade kolaylığı", "zaman kazancı", "kargo bekleme ve riskler",
      ] },
      { id: "b1_d_yalniz", topicTr: "Yalnız seyahat mi, grupla seyahat mi?", bulletsTr: [
        "özgürlük ve kendi programın", "güvenlik", "maliyet paylaşımı", "yeni insanlarla tanışma",
      ] },
      { id: "b1_d_dizi", topicTr: "Diziler: iyi bir dinlenme mi, zaman kaybı mı?", bulletsTr: [
        "dil öğrenmeye katkısı", "bağımlılık ve uyku", "aileyle ortak vakit", "kitap okumaya etkisi",
      ] },
      { id: "b1_d_erken", topicTr: "Erken kalkmak mı, geç yatmak mı daha verimli?", bulletsTr: [
        "sabah sessizliği ve enerji", "gece yaratıcılığı", "iş ve okul saatleri", "sağlık üzerindeki etkisi",
      ] },
    ],
    bolum4: [
      { id: "b1_m_seyahat", topicTr: "Unutamadığım bir seyahat", followUpsTr: [
        "Bu seyahatte seni en çok ne şaşırttı?", "Tekrar gitsen neyi farklı yapardın?", "Oraya gitmek isteyene ne tavsiye edersin?",
      ] },
      { id: "b1_m_aliskanlik", topicTr: "Bırakmak ya da kazanmak istediğim bir alışkanlık", followUpsTr: [
        "Bu alışkanlık hayatını nasıl etkiliyor?", "Şimdiye kadar ne denedin?", "Sence alışkanlık değiştirmek neden zor?",
      ] },
      { id: "b1_m_dil", topicTr: "Türkçe öğrenme yolculuğum", followUpsTr: [
        "En zor kısmı ne oldu?", "Hangi yöntem sende en iyi çalışıyor?", "Bir yıl sonra Türkçen nasıl olsun istiyorsun?",
      ] },
      { id: "b1_m_dizi_film", topicTr: "Herkese önerdiğim bir film ya da dizi", followUpsTr: [
        "Bu yapımı özel yapan ne?", "Kimlere önermezsin?", "Kitabı mı iyidir, filmi mi — sence?",
      ] },
      { id: "b1_m_taninmis", topicTr: "Tanışmak istediğim bir insan", followUpsTr: [
        "Ona ilk hangi soruyu sorardın?", "Neden bu kişi?", "Ünlü olmak sence nasıl bir şey?",
      ] },
      { id: "b1_m_gelecek", topicTr: "Beş yıl sonraki hayatım", followUpsTr: [
        "Bu hedefe nasıl hazırlanıyorsun?", "En büyük engel ne olabilir?", "Planlar değişirse üzülür müsün?",
      ] },
    ],
  },

  /* ============================== B2 ============================== */
  /* spor · alışveriş · sağlık · para ve ekonomi · ev hayatı; монологи:
     yaşadığın yer · teknoloji · doğa — аргументация и позиция */
  B2: {
    bolum1: [
      { id: "b2_spor", nameTr: "Spor", questionsTr: [
        "Spor hayatında nasıl bir yer tutuyor?",
        "Takım sporları mı bireysel sporlar mı sana göre? Neden?",
        "Profesyonel sporcuların kazandığı paralar hakkında ne düşünüyorsun?",
        "Spor izlemek mi, yapmak mı? Hangisi sence daha değerli?",
        "Çocuklara hangi yaşta spor yaptırılmalı sence?",
      ] },
      { id: "b2_alisveris", nameTr: "Alışveriş", questionsTr: [
        "Alışveriş alışkanlıkların nasıl? Planlı mısın, anlık mı?",
        "İndirim dönemleri gerçekten kazançlı mı sence?",
        "Markalı ürünlere fazla para vermek mantıklı mı?",
        "Alışveriş insanlar için neden bir eğlenceye dönüştü?",
        "İkinci el ürün alır mısın? Neden?",
      ] },
      { id: "b2_saglik", nameTr: "Sağlık", questionsTr: [
        "Sağlıklı yaşamak için neler yapıyorsun?",
        "İnsanlar neden sağlıksız yemeyi tercih ediyor sence?",
        "Uyku düzeni ile verimlilik arasında nasıl bir bağ var?",
        "Sence stres modern hayatın hastalığı mı?",
        "Devlet, vatandaşların sağlığı için ne kadar sorumlu olmalı?",
      ] },
      { id: "b2_para", nameTr: "Para ve ekonomi", questionsTr: [
        "Para biriktirebiliyor musun? Sence bu neden zor?",
        "Gençler para yönetimini nerede öğrenmeli?",
        "Kredi kartı: kolaylık mı, tuzak mı?",
        "Mutluluk ve para arasında nasıl bir ilişki var sence?",
        "Fiyatlar artınca alışkanlıkların değişti mi?",
      ] },
      { id: "b2_ev", nameTr: "Ev hayatı", questionsTr: [
        "Ev işleri ailede nasıl paylaşılmalı?",
        "Kirada oturmak mı, ev sahibi olmak mı? Neden?",
        "Ev arkadaşıyla yaşamanın zorlukları neler?",
        "Evden çalışmak ev hayatını nasıl etkiliyor?",
        "İdeal eviniz nasıl olurdu? Nerede olurdu?",
      ] },
    ],
    bolum2: [
      { id: "b2_rp_fatura", type: "A",
        situationTr: "Telefon operatörünün müşteri hizmetleri seni arıyor: faturana ek ücret yansımış. İtiraz et, açıklama ve iade iste.",
        examinerRoleTr: "Sen operatör temsilcisisin. Ek ücretin 'premium servis aboneliği'nden geldiğini söyle; öğrenci itiraz ederse iade sürecini başlat.",
        openingTr: "İyi günler, faturanızla ilgili aramıştım. Bu ay 180 lira ek servis ücreti görünüyor." },
      { id: "b2_rp_komsu_ses", type: "A",
        situationTr: "Üst kat komşun kapına geldi: dün geceki sesten şikâyetçi. Aslında ses senden değildi. Durumu sakin bir şekilde açıkla ve çözüm öner.",
        examinerRoleTr: "Sen üst kat komşususun. Dün geceki müzik sesinden şikâyet et; öğrenci açıklayınca birlikte kaynağı düşünmeyi kabul et.",
        openingTr: "Kusura bakmayın ama dün gece saat ikiye kadar müzik sesi geldi, uyuyamadık." },
      { id: "b2_rp_toplanti", type: "A",
        situationTr: "Yöneticin, hafta sonu fazla mesaiye kalmanı istiyor ama önemli bir aile planın var. Durumu açıkla ve alternatif çözüm öner.",
        examinerRoleTr: "Sen yöneticisin. Pazar günü rapor bitmeli, yardım gerekli — bunu söyle ama makul alternatife açık ol.",
        openingTr: "Pazar günü rapor teslimimiz var, senin de gelmen gerekiyor." },
      { id: "b2_rp_araba", type: "B",
        situationTr: "Araba kiralama ofisindesin. Hafta sonu için otomatik vitesli bir araba kiralamak istiyorsun. Fiyatı, depozitoyu ve iade saatini öğren. Konuşmayı SEN başlat.",
        examinerRoleTr: "Sen araba kiralama görevlisisin. Otomatik araç günlük 3500 lira, depozito 5000 lira, iade pazartesi 10:00'a kadar — sorulunca söyle; ehliyet yaşını sor." },
      { id: "b2_rp_sikayet", type: "B",
        situationTr: "İnternetten aldığın ürün bozuk çıktı, satıcı iade talebini iki kez reddetti. Müşteri hizmetlerini ara: durumu anlat, kararlı ol, çözüm iste. Konuşmayı SEN başlat.",
        examinerRoleTr: "Sen müşteri hizmetleri temsilcisisin. Önce prosedür gereği reddetmeye çalış; öğrenci kararlı olursa iadeyi onayla." },
      { id: "b2_rp_kayit", type: "B",
        situationTr: "Arkadaşını bir Türkçe kursuna kaydettirmek istiyorsun. Kurs merkezini ara: seviyeleri, ücreti ve başlangıç tarihini öğren, kaydı yaptır. Konuşmayı SEN başlat.",
        examinerRoleTr: "Sen kurs merkezi görevlisisin. B1 kuru 15 Ekim'de başlıyor, 8000 lira; kayıt için ad-soyad ve telefon iste." },
    ],
    bolum3: [
      { id: "b2_d_online_egitim", topicTr: "Online eğitim geleneksel eğitimin yerini alabilir mi?", bulletsTr: [
        "erişim — herkes her yerden", "disiplin ve motivasyon", "sosyal gelişim ve arkadaşlık", "uygulamalı dersler ve sınavlar", "maliyet",
      ] },
      { id: "b2_d_nakit", topicTr: "Nakitsiz toplum: iyi mi, riskli mi?", bulletsTr: [
        "hız ve kolaylık", "harcama kontrolü", "yaşlılar ve teknolojiye uzak insanlar", "gizlilik ve takip", "sistem çökerse ne olur?",
      ] },
      { id: "b2_d_sehir_spor", topicTr: "Belediyeler ücretsiz spor alanlarına para harcamalı mı?", bulletsTr: [
        "halk sağlığına etkisi", "bütçenin başka ihtiyaçları", "gençleri kötü alışkanlıklardan koruma", "bakım ve güvenlik maliyeti",
      ] },
      { id: "b2_d_fastfood", topicTr: "Hazır gıdaya ek vergi konulmalı mı?", bulletsTr: [
        "sağlık maliyetlerini azaltma", "kişisel özgürlük", "düşük gelirliye etkisi", "üreticilerin sorumluluğu", "vergi gerçekten caydırır mı?",
      ] },
    ],
    bolum4: [
      { id: "b2_m_yer", topicTr: "Yaşadığım yer: neden burası, artıları ve eksileri", followUpsTr: [
        "Şehrinde bir şeyi değiştirme gücün olsa ne yapardın?", "Büyük şehir hayatı insanı nasıl değiştiriyor?", "Emekliliğinde nerede yaşamak isterdin?",
      ] },
      { id: "b2_m_teknoloji", topicTr: "Teknolojinin hayatımdaki yeri: kazandırdıkları ve kaybettirdikleri", followUpsTr: [
        "Hangi teknolojiden vazgeçemezsin?", "Çocuklara ekran sınırı konulmalı mı?", "Yapay zekâ işleri elimizden alır mı sence?",
      ] },
      { id: "b2_m_doga", topicTr: "Doğa ve ben: doğayla ilişkim, çevre için yaptıklarım", followUpsTr: [
        "Çevre için bireysel çaba gerçekten fark yaratır mı?", "Şehir insanı doğadan koptu mu?", "Gelecek nesillere nasıl bir doğa bırakacağız?",
      ] },
      { id: "b2_m_basari", topicTr: "Benim için başarı ne demek", followUpsTr: [
        "Başarı ölçülebilir mi?", "Başarısızlık insana ne öğretir?", "Toplumun başarı tanımı seninkiyle uyuşuyor mu?",
      ] },
      { id: "b2_m_para_mutluluk", topicTr: "Para mutluluk getirir mi: benim cevabım", followUpsTr: [
        "Paranın satın alamayacağı ilk şey ne?", "Piyango sana çıksa hayatın değişir miydi?", "Az parayla mutlu olmak mümkün mü?",
      ] },
      { id: "b2_m_gelenek", topicTr: "Ülkemden koruyalım dediğim bir gelenek", followUpsTr: [
        "Bu gelenek neden kaybolmaya başladı?", "Gelenekler değişime direnmeli mi?", "Türkiye'de benzer bir gelenek gördün mü?",
      ] },
    ],
  },

  /* ============================== C1 ============================== */
  /* abstraksiyon + аргументация; ролевые с эмоциональной нагрузкой */
  C1: {
    bolum1: [
      { id: "c1_toplum", nameTr: "Toplum ve değerler", questionsTr: [
        "Toplumsal değerler nesilden nesile nasıl değişiyor?",
        "Bireysellik ile toplumsal dayanışma çelişir mi?",
        "Bir toplumun gelişmişliğini neye göre ölçersin?",
        "Gelenek ile modernlik arasında gerilim kaçınılmaz mı?",
        "Göç, bir toplumu nasıl dönüştürür?",
      ] },
      { id: "c1_medya", nameTr: "Medya ve bilgi", questionsTr: [
        "Bilgi kirliliği çağında doğruya nasıl ulaşırız?",
        "Sosyal medya kamuoyunu yönlendiriyor mu?",
        "Haber okurken hangi kriterlere dikkat edersin?",
        "İfade özgürlüğünün sınırı olmalı mı?",
        "Algoritmaların bize gösterdikleri dünyayı daraltıyor mu?",
      ] },
      { id: "c1_egitim", nameTr: "Eğitim felsefesi", questionsTr: [
        "Eğitimin amacı meslek mi kazandırmak, insan mı yetiştirmek?",
        "Sınav odaklı sistemler yaratıcılığı öldürür mü?",
        "Herkes üniversiteye gitmeli mi?",
        "Hayat boyu öğrenme gerçekçi bir ideal mi?",
        "Öğretmenin yapay zekâyla değişen rolü hakkında ne düşünüyorsun?",
      ] },
      { id: "c1_etik", nameTr: "Etik ikilemler", questionsTr: [
        "İyi bir amaç için küçük bir yalan söylenebilir mi?",
        "Teknoloji şirketleri verilerimizden sorumlu mu, biz mi?",
        "Zenginlik yeniden dağıtılmalı mı? Nasıl?",
        "Hayvan deneyleri hangi şartlarda kabul edilebilir?",
        "Gelecek nesillere karşı bugünkü sorumluluğumuz ne?",
      ] },
      { id: "c1_calisma", nameTr: "Çalışma hayatının geleceği", questionsTr: [
        "Dört günlük çalışma haftası verimliliği artırır mı?",
        "Kariyer mi, anlam mı: iş seçiminde ne öncelikli olmalı?",
        "Otomasyon işsizliği mi getirir, yeni meslekleri mi?",
        "Uzaktan çalışma şirket kültürünü nasıl etkiledi?",
        "Emeklilik kavramı gelecekte de var olacak mı?",
      ] },
    ],
    bolum2: [
      { id: "c1_rp_pasaport", type: "B",
        situationTr: "Yurt dışındasın ve pasaportunu kaybettin. Konsolosluğu aradın. Durumu anlat: nerede, ne zaman, uçağın iki gün sonra. Sakin ama ısrarcı ol; acil çözüm iste. Konuşmayı SEN başlat.",
        examinerRoleTr: "Sen konsolosluk görevlisisin. Prosedür gereği normal süre bir hafta — önce bunu söyle; öğrenci durumu iyi anlatırsa acil geçici belge randevusu ver (yarın 09:00)." },
      { id: "c1_rp_iflas", type: "A",
        situationTr: "Yakın arkadaşın işletmesinin battığını ve borç içinde olduğunu sana açıyor. Onu dinle, duygusal destek ver ve somut bir yol öner — ama vaaz verme.",
        examinerRoleTr: "Sen iflas eden arkadaşsın. Utanç ve çaresizlik içindesin, kimseye söyleyemedin. Öğrenci iyi dinlerse yavaş yavaş açıl.",
        openingTr: "Sana bir şey söylemem lazım ama… kimseye söylemedim daha. Dükkânı kapattık. Battık." },
      { id: "c1_rp_cocuk", type: "A",
        situationTr: "Komşun, ergen oğlunun içine kapandığını, odasından çıkmadığını anlatıyor ve senden fikir istiyor. Empatiyle dinle, sorular sor, bir uzmana yönlendirmeyi nazikçe dile getir.",
        examinerRoleTr: "Sen endişeli ebeveynsin. Oğlun üç aydır içine kapanık, notları düştü; 'ergenlik mi, ciddi mi bilmiyorum' de.",
        openingTr: "Bir dakikan var mı? Oğlum hakkında… Üç aydır odasından çıkmıyor, konuşmuyor bizimle. Ne yapacağımı bilmiyorum." },
      { id: "c1_rp_miras", type: "A",
        situationTr: "Kardeşin, aile evinin satılmasını istiyor; sen evin kalmasından yanasın. Tartışma kızışmadan pozisyonunu savun ve orta yol ara.",
        examinerRoleTr: "Sen kardeşsin. Ev boş duruyor, masrafı çok, satılsın istiyorsun. Mantıklı argümanlar getir ama uzlaşmaya kapalı olma.",
        openingTr: "Bak, bu evi konuşmamız lazım. Boş duruyor, vergisi, bakımı… Satalım artık diyorum." },
      { id: "c1_rp_itiraz", type: "B",
        situationTr: "Üniversitedeki hocan, ödevine haksız yere düşük not verdi; kriterlere göre daha yüksek hak ettiğini düşünüyorsun. Ofisine geldin. Saygılı ama net bir şekilde itirazını sun. Konuşmayı SEN başlat.",
        examinerRoleTr: "Sen öğretim üyesisin. Önce notu savun; öğrenci kriterlere somut atıf yaparsa ödevi yeniden değerlendirmeyi kabul et." },
      { id: "c1_rp_ihbar", type: "B",
        situationTr: "İş yerinde bir meslektaşının güvenlik kurallarını ihlal ettiğini gördün; biri zarar görebilir. Yöneticinle konuş: durumu anlat ama meslektaşını hedef göstermeden, sistemsel çözüm iste. Konuşmayı SEN başlat.",
        examinerRoleTr: "Sen yöneticisin. Önce 'abartıyor olmayasın' diye hafifse; öğrenci ciddiyeti anlatırsa denetim ve eğitim sözü ver." },
    ],
    bolum3: [
      { id: "c1_d_ai_sanat", topicTr: "Yapay zekâ ürünü eserler sanat sayılır mı?", bulletsTr: [
        "yaratıcılık nedir — niyet mi, sonuç mu?", "insan emeğinin değeri", "sanatçıların geçimi ve telif", "yeni bir araç mı, rakip mi?", "izleyici farkı hissediyor mu?",
      ] },
      { id: "c1_d_sansur", topicTr: "Zararlı içerik: denetim mi, özgürlük mü?", bulletsTr: [
        "kimin zararlı dediği belirleyici", "çocukların korunması", "sansürün kaygan zemini", "platformların sorumluluğu", "eleştirel düşünce eğitimi alternatif mi?",
      ] },
      { id: "c1_d_kariyer_aile", topicTr: "Modern hayatta kariyer ve aile dengesi bir yanılsama mı?", bulletsTr: [
        "zaman herkese eşit ama talepler değil", "toplumsal beklentiler ve suçluluk", "işverenin rolü ve esneklik", "çocuk sahibi olma yaşının yükselmesi", "denge yerine dönemsel öncelik?",
      ] },
      { id: "c1_d_uzay", topicTr: "Dünyada sorunlar dururken uzay araştırmalarına kaynak ayrılmalı mı?", bulletsTr: [
        "teknolojik yan kazanımlar", "önceliklendirme etiği", "uzun vadeli insanlık sigortası", "özel şirketler mi, devletler mi?", "ilham ve bilim kültürü",
      ] },
    ],
    bolum4: [
      { id: "c1_m_karar", topicTr: "Hayatımı değiştiren bir karar ve bedeli", followUpsTr: [
        "O karara bugün baksan aynı şeyi yapar mıydın?", "Kararlarımızı ne kadar özgür veriyoruz sence?", "Pişmanlık işe yarar bir duygu mu?",
      ] },
      { id: "c1_m_adalet", topicTr: "Tanık olduğum bir haksızlık ve bana öğrettikleri", followUpsTr: [
        "Müdahale etmekle etmemek arasındaki çizgi nerede?", "Adalet duygusu doğuştan mı gelir?", "Küçük haksızlıklar büyüklerini besler mi?",
      ] },
      { id: "c1_m_kimlik", topicTr: "Dil ve kimlik: yeni bir dil insanı değiştirir mi", followUpsTr: [
        "Türkçe konuşurken farklı biri misin?", "Ana dilinde ifade edemediğin bir duygu var mı?", "Çok dillilik dünyaya bakışı nasıl etkiler?",
      ] },
      { id: "c1_m_yalnizlik", topicTr: "Yalnızlık: modern çağın salgını mı, seçim mi", followUpsTr: [
        "Kalabalık içinde yalnızlık nasıl mümkün oluyor?", "Teknoloji yalnızlığı azaltıyor mu, derinleştiriyor mu?", "Yalnız kalmayı bilmek bir beceri mi?",
      ] },
      { id: "c1_m_miras_deger", topicTr: "Gelecek nesillere bırakmak istediğim değer", followUpsTr: [
        "Bu değeri sana kim ya da ne kazandırdı?", "Değerler öğretilebilir mi, yaşanarak mı geçer?", "Hangi değerimizin kaybolmasından korkuyorsun?",
      ] },
      { id: "c1_m_basarisizlik", topicTr: "Bana en çok şey öğreten başarısızlığım", followUpsTr: [
        "O dönemde sana ne söylenseydi işe yarardı?", "Toplum başarısızlığa neden bu kadar acımasız?", "Başarısızlık korkusu seni hâlâ durduruyor mu?",
      ] },
    ],
  },
};
