/**
 * Listening bank — transcripts (audio comes later) reusing the ReadingTask type.
 * Dialogues and monologues with 5 comprehension questions each.
 * Being filled in batches; more transcripts are appended on request.
 */

import type { ReadingTask } from "./types";

export const LISTENING_TASKS: ReadingTask[] = [
  /* ------------------------------ A1 – A2 ------------------------------- */
  {
    id: "l-a1-01", level: "A1", topic: "Restoranda sipariş",
    title: "Restoranda Sipariş Verme",
    text: "Garson: Hoş geldiniz! Ne sipariş etmek istersiniz?\nMüşteri: Merhaba. Bir mercimek çorbası ve tavuklu pilav alabilir miyim?\nGarson: Tabii. İçecek ne istersiniz?\nMüşteri: Bir bardak ayran lütfen.\nGarson: Tatlı ister misiniz?\nMüşteri: Şimdilik istemiyorum, teşekkürler.\nGarson: Hemen getiriyorum efendim.",
    questions: [
      { id: "l-a1-01-q1", level: "A1", topic: "Detay", question: "Müşteri ne çorbası istiyor?", options: ["Mercimek", "Domates", "Tavuk", "Sebze"], correctAnswer: 0, explanation: "«Bir mercimek çorbası … alabilir miyim?» — чечевичный суп." },
      { id: "l-a1-01-q2", level: "A1", topic: "Detay", question: "Müşteri ne içecek istiyor?", options: ["Ayran", "Çay", "Kola", "Su"], correctAnswer: 0, explanation: "«Bir bardak ayran lütfen»." },
      { id: "l-a1-01-q3", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Müşteri tatlı istiyor.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«Şimdilik istemiyorum» — десерт не заказывает." },
      { id: "l-a1-01-q4", level: "A1", topic: "Detay", question: "Konuşma nerede geçiyor?", options: ["Restoranda", "Okulda", "Hastanede", "Markette"], correctAnswer: 0, explanation: "Официант и клиент — в ресторане." },
      { id: "l-a1-01-q5", level: "A1", topic: "Detay", question: "Müşteri pilavı nasıl istiyor?", options: ["Tavuklu", "Etli", "Sebzeli", "Sade"], correctAnswer: 0, explanation: "«tavuklu pilav» — плов с курицей." },
    ],
  },
  {
    id: "l-a1-02", level: "A1", topic: "Yol sorma",
    title: "Yol Sorma",
    text: "Turist: Affedersiniz, en yakın metro istasyonu nerede?\nKadın: Düz gidin, sonra ilk sokaktan sağa dönün. İstasyon orada.\nTurist: Ne kadar uzak?\nKadın: Yürüyerek beş dakika.\nTurist: Çok teşekkür ederim.\nKadın: Rica ederim, iyi günler.",
    questions: [
      { id: "l-a1-02-q1", level: "A1", topic: "Detay", question: "Turist neyi soruyor?", options: ["Metro istasyonunu", "Hastaneyi", "Oteli", "Restoranı"], correctAnswer: 0, explanation: "«en yakın metro istasyonu nerede?»." },
      { id: "l-a1-02-q2", level: "A1", topic: "Detay", question: "İlk sokaktan ne tarafa dönmeli?", options: ["Sağa", "Sola", "Geriye", "Düz"], correctAnswer: 0, explanation: "«ilk sokaktan sağa dönün»." },
      { id: "l-a1-02-q3", level: "A1", topic: "Detay", question: "İstasyon ne kadar uzakta?", options: ["Beş dakika", "On dakika", "Yarım saat", "Bir saat"], correctAnswer: 0, explanation: "«Yürüyerek beş dakika»." },
      { id: "l-a1-02-q4", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «İstasyona araba gerekiyor.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "Можно дойти пешком за 5 минут — машина не нужна." },
      { id: "l-a1-02-q5", level: "A1", topic: "Çıkarım", question: "Kadın turiste karşı nasıl?", options: ["Yardımsever", "Kaba", "İlgisiz", "Sinirli"], correctAnswer: 0, explanation: "Она вежливо объясняет дорогу — приветлива." },
    ],
  },
  {
    id: "l-a1-03", level: "A1", topic: "Tanışma",
    title: "İlk Tanışma",
    text: "Deniz: Merhaba, ben Deniz. Sen kimsin?\nMaria: Merhaba Deniz, ben Maria. İspanya'dan geldim.\nDeniz: Memnun oldum Maria. Türkçeyi nerede öğrendin?\nMaria: Bir dil kursunda öğreniyorum. Altı aydır çalışıyorum.\nDeniz: Çok güzel konuşuyorsun!\nMaria: Teşekkür ederim, ama daha çok pratik yapmam lazım.",
    questions: [
      { id: "l-a1-03-q1", level: "A1", topic: "Detay", question: "Maria nereden geldi?", options: ["İspanya'dan", "İtalya'dan", "Fransa'dan", "Almanya'dan"], correctAnswer: 0, explanation: "«İspanya'dan geldim»." },
      { id: "l-a1-03-q2", level: "A1", topic: "Detay", question: "Maria Türkçeyi nerede öğreniyor?", options: ["Dil kursunda", "Okulda", "Evde", "İşte"], correctAnswer: 0, explanation: "«Bir dil kursunda öğreniyorum»." },
      { id: "l-a1-03-q3", level: "A1", topic: "Detay", question: "Maria ne kadardır Türkçe çalışıyor?", options: ["Altı aydır", "Bir yıldır", "İki aydır", "Üç haftadır"], correctAnswer: 0, explanation: "«Altı aydır çalışıyorum»." },
      { id: "l-a1-03-q4", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Maria pratik yapmak istemiyor.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«daha çok pratik yapmam lazım» — хочет больше практики." },
      { id: "l-a1-03-q5", level: "A1", topic: "Detay", question: "Deniz, Maria'nın Türkçesi için ne diyor?", options: ["Çok güzel konuşuyor", "Kötü konuşuyor", "Hiç anlamıyor", "Yavaş konuşuyor"], correctAnswer: 0, explanation: "«Çok güzel konuşuyorsun!»." },
    ],
  },
  {
    id: "l-a1-04", level: "A1", topic: "Alışveriş",
    title: "Markette",
    text: "Müşteri: Merhaba, ekmek nerede?\nGörevli: İkinci reyonda, sağ tarafta.\nMüşteri: Teşekkürler. Süt de var mı?\nGörevli: Evet, buzdolabında. Yarım litre ve bir litre var.\nMüşteri: Bir litre süt alayım. Hepsi ne kadar?\nGörevli: Toplam kırk lira.",
    questions: [
      { id: "l-a1-04-q1", level: "A1", topic: "Detay", question: "Müşteri önce neyi soruyor?", options: ["Ekmeği", "Sütü", "Peyniri", "Suyu"], correctAnswer: 0, explanation: "«ekmek nerede?» — сначала о хлебе." },
      { id: "l-a1-04-q2", level: "A1", topic: "Detay", question: "Süt nerede?", options: ["Buzdolabında", "Rafta", "Kasada", "Reyonda"], correctAnswer: 0, explanation: "«Evet, buzdolabında»." },
      { id: "l-a1-04-q3", level: "A1", topic: "Detay", question: "Müşteri ne kadar süt alıyor?", options: ["Bir litre", "Yarım litre", "İki litre", "Hiç"], correctAnswer: 0, explanation: "«Bir litre süt alayım»." },
      { id: "l-a1-04-q4", level: "A1", topic: "Detay", question: "Toplam ne kadar ödeyecek?", options: ["Kırk lira", "On lira", "Yüz lira", "Yirmi lira"], correctAnswer: 0, explanation: "«Toplam kırk lira»." },
      { id: "l-a1-04-q5", level: "A1", topic: "Detay", question: "Ekmek hangi reyonda?", options: ["İkinci", "Birinci", "Üçüncü", "Dördüncü"], correctAnswer: 0, explanation: "«İkinci reyonda, sağ tarafta»." },
    ],
  },
  {
    id: "l-a2-01", level: "A2", topic: "Doktor randevusu",
    title: "Doktorda",
    text: "Doktor: Geçmiş olsun, şikâyetiniz nedir?\nHasta: İki gündür başım ağrıyor ve biraz ateşim var.\nDoktor: Boğazınız ağrıyor mu?\nHasta: Evet, özellikle yutkunurken.\nDoktor: Grip olmuşsunuz. Size ilaç yazıyorum. Bol su için ve dinlenin.\nHasta: İşe gidebilir miyim?\nDoktor: Bugün ve yarın evde kalmanızı öneririm.",
    questions: [
      { id: "l-a2-01-q1", level: "A2", topic: "Detay", question: "Hastanın şikâyeti ne?", options: ["Baş ağrısı ve ateş", "Karın ağrısı", "Diş ağrısı", "Göz ağrısı"], correctAnswer: 0, explanation: "«başım ağrıyor ve biraz ateşim var»." },
      { id: "l-a2-01-q2", level: "A2", topic: "Detay", question: "Doktora göre hasta ne olmuş?", options: ["Grip", "Zatürre", "Alerji", "Migren"], correctAnswer: 0, explanation: "«Grip olmuşsunuz»." },
      { id: "l-a2-01-q3", level: "A2", topic: "Detay", question: "Doktor ne öneriyor?", options: ["Bol su içmek ve dinlenmek", "Spor yapmak", "Çok yemek", "Çalışmak"], correctAnswer: 0, explanation: "«Bol su için ve dinlenin»." },
      { id: "l-a2-01-q4", level: "A2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Hasta bugün işe gidebilir.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«evde kalmanızı öneririm» — лучше остаться дома." },
      { id: "l-a2-01-q5", level: "A2", topic: "Detay", question: "Boğazı ne zaman ağrıyor?", options: ["Yutkunurken", "Konuşurken", "Uyurken", "Gülerken"], correctAnswer: 0, explanation: "«özellikle yutkunurken»." },
    ],
  },
  {
    id: "l-a2-02", level: "A2", topic: "Telefon konuşması",
    title: "Sinema Planı",
    text: "Ali: Alo Zeynep, bu akşam sinemaya gidelim mi?\nZeynep: Olur, hangi filme?\nAli: Yeni bir komedi filmi var. Saat sekizde başlıyor.\nZeynep: Güzel. Nerede buluşalım?\nAli: Sinemanın önünde, yedi buçukta.\nZeynep: Tamam, biletleri sen mi alıyorsun?\nAli: Evet, ben internetten alırım.",
    questions: [
      { id: "l-a2-02-q1", level: "A2", topic: "Detay", question: "Ali ne teklif ediyor?", options: ["Sinemaya gitmeyi", "Yemeğe çıkmayı", "Maça gitmeyi", "Ders çalışmayı"], correctAnswer: 0, explanation: "«bu akşam sinemaya gidelim mi?»." },
      { id: "l-a2-02-q2", level: "A2", topic: "Detay", question: "Film ne türünde?", options: ["Komedi", "Korku", "Dram", "Belgesel"], correctAnswer: 0, explanation: "«Yeni bir komedi filmi var»." },
      { id: "l-a2-02-q3", level: "A2", topic: "Detay", question: "Saat kaçta buluşacaklar?", options: ["Yedi buçukta", "Sekizde", "Yedide", "Dokuzda"], correctAnswer: 0, explanation: "«Sinemanın önünde, yedi buçukta»." },
      { id: "l-a2-02-q4", level: "A2", topic: "Detay", question: "Biletleri kim alıyor?", options: ["Ali", "Zeynep", "İkisi birlikte", "Kimse"], correctAnswer: 0, explanation: "«ben internetten alırım» — Али." },
      { id: "l-a2-02-q5", level: "A2", topic: "Detay", question: "Film saat kaçta başlıyor?", options: ["Sekizde", "Yedi buçukta", "Dokuzda", "Yedide"], correctAnswer: 0, explanation: "«Saat sekizde başlıyor»." },
    ],
  },
  {
    id: "l-a2-03", level: "A2", topic: "Otelde",
    title: "Otel Rezervasyonu",
    text: "Resepsiyon: İyi günler, nasıl yardımcı olabilirim?\nMüşteri: İki kişilik bir oda istiyorum, üç gece için.\nResepsiyon: Tabii. Denize bakan bir odamız var. Gecesi sekiz yüz lira.\nMüşteri: Kahvaltı dahil mi?\nResepsiyon: Evet, kahvaltı fiyata dahil.\nMüşteri: Harika, o zaman rezervasyon yapalım.",
    questions: [
      { id: "l-a2-03-q1", level: "A2", topic: "Detay", question: "Müşteri kaç gece kalacak?", options: ["Üç gece", "Bir gece", "İki gece", "Bir hafta"], correctAnswer: 0, explanation: "«üç gece için»." },
      { id: "l-a2-03-q2", level: "A2", topic: "Detay", question: "Oda nereye bakıyor?", options: ["Denize", "Dağa", "Bahçeye", "Yola"], correctAnswer: 0, explanation: "«Denize bakan bir odamız var»." },
      { id: "l-a2-03-q3", level: "A2", topic: "Detay", question: "Bir gecenin fiyatı ne kadar?", options: ["Sekiz yüz lira", "Beş yüz lira", "Bin lira", "Üç yüz lira"], correctAnswer: 0, explanation: "«Gecesi sekiz yüz lira»." },
      { id: "l-a2-03-q4", level: "A2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Kahvaltı ayrı ücretlidir.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«kahvaltı fiyata dahil» — завтрак включён." },
      { id: "l-a2-03-q5", level: "A2", topic: "Detay", question: "Müşteri kaç kişilik oda istiyor?", options: ["İki kişilik", "Tek kişilik", "Üç kişilik", "Dört kişilik"], correctAnswer: 0, explanation: "«İki kişilik bir oda»." },
    ],
  },
  {
    id: "l-a2-04", level: "A2", topic: "Hava durumu",
    title: "Hafta Sonu Hava Durumu",
    text: "Spiker: İşte hafta sonu hava durumu. Cumartesi günü hava güneşli olacak, sıcaklık yirmi beş derece. Pazar günü ise öğleden sonra yağmur bekleniyor. Sıcaklık on sekiz dereceye düşecek. Denize gitmek isteyenler için cumartesi daha uygun. Şemsiyenizi pazar günü yanınıza almayı unutmayın.",
    questions: [
      { id: "l-a2-04-q1", level: "A2", topic: "Detay", question: "Cumartesi hava nasıl olacak?", options: ["Güneşli", "Yağmurlu", "Karlı", "Sisli"], correctAnswer: 0, explanation: "«Cumartesi günü hava güneşli olacak»." },
      { id: "l-a2-04-q2", level: "A2", topic: "Detay", question: "Pazar günü ne bekleniyor?", options: ["Yağmur", "Kar", "Fırtına", "Sıcak hava"], correctAnswer: 0, explanation: "«Pazar günü … yağmur bekleniyor»." },
      { id: "l-a2-04-q3", level: "A2", topic: "Detay", question: "Cumartesi sıcaklık kaç derece?", options: ["Yirmi beş", "On sekiz", "Otuz", "On"], correctAnswer: 0, explanation: "«sıcaklık yirmi beş derece»." },
      { id: "l-a2-04-q4", level: "A2", topic: "Çıkarım", question: "Denize gitmek için hangi gün daha uygun?", options: ["Cumartesi", "Pazar", "İkisi de", "Hiçbiri"], correctAnswer: 0, explanation: "«denize gitmek isteyenler için cumartesi daha uygun»." },
      { id: "l-a2-04-q5", level: "A2", topic: "Çıkarım", question: "Pazar günü ne almak gerekli?", options: ["Şemsiye", "Şapka", "Güneş gözlüğü", "Mont"], correctAnswer: 0, explanation: "«Şemsiyenizi pazar günü … almayı unutmayın»." },
    ],
  },
  {
    id: "l-a2-05", level: "A2", topic: "İş yeri",
    title: "İşe Geç Kalma",
    text: "Müdür: Günaydın Burak, bugün yine geç kaldın.\nBurak: Özür dilerim, otobüs çok kalabalıktı ve trafiğe takıldık.\nMüdür: Anlıyorum ama bu hafta üçüncü oldu. Daha erken çıkman gerekiyor.\nBurak: Haklısınız. Yarından itibaren bir saat erken kalkacağım.\nMüdür: Güzel. Şimdi hemen işe başla, toplantı on dakika sonra.",
    questions: [
      { id: "l-a2-05-q1", level: "A2", topic: "Detay", question: "Burak'ın sorunu ne?", options: ["İşe geç kalması", "Hasta olması", "İzin istemesi", "İstifa etmesi"], correctAnswer: 0, explanation: "«bugün yine geç kaldın»." },
      { id: "l-a2-05-q2", level: "A2", topic: "Detay", question: "Burak neden geç kaldı?", options: ["Trafik ve kalabalık otobüs", "Uyuyakalma", "Hava durumu", "Araba arızası"], correctAnswer: 0, explanation: "«otobüs çok kalabalıktı ve trafiğe takıldık»." },
      { id: "l-a2-05-q3", level: "A2", topic: "Detay", question: "Bu hafta kaçıncı kez geç kaldı?", options: ["Üçüncü", "Birinci", "İkinci", "Beşinci"], correctAnswer: 0, explanation: "«bu hafta üçüncü oldu»." },
      { id: "l-a2-05-q4", level: "A2", topic: "Detay", question: "Burak ne yapmaya karar veriyor?", options: ["Erken kalkmaya", "İşi bırakmaya", "Araba almaya", "Taşınmaya"], correctAnswer: 0, explanation: "«bir saat erken kalkacağım»." },
      { id: "l-a2-05-q5", level: "A2", topic: "Detay", question: "Toplantı ne zaman?", options: ["On dakika sonra", "Bir saat sonra", "Yarın", "Öğleden sonra"], correctAnswer: 0, explanation: "«toplantı on dakika sonra»." },
    ],
  },
  {
    id: "l-a2-06", level: "A2", topic: "Günlük plan",
    title: "Hafta Sonu Planı",
    text: "Elif: Cumartesi ne yapıyorsun?\nCan: Sabah spora gideceğim, sonra annemlere uğrayacağım. Sen?\nElif: Ben arkadaşlarla pikniğe gideceğiz. İstersen sen de gel.\nCan: Çok isterdim ama akşam yemeğe misafir gelecek.\nElif: O zaman pazar günü kahve içelim mi?\nCan: Olur, pazar müsaitim.",
    questions: [
      { id: "l-a2-06-q1", level: "A2", topic: "Detay", question: "Can cumartesi sabah ne yapacak?", options: ["Spora gidecek", "Pikniğe gidecek", "Çalışacak", "Uyuyacak"], correctAnswer: 0, explanation: "«Sabah spora gideceğim»." },
      { id: "l-a2-06-q2", level: "A2", topic: "Detay", question: "Elif cumartesi ne yapacak?", options: ["Pikniğe gidecek", "Spora gidecek", "Evde kalacak", "Çalışacak"], correctAnswer: 0, explanation: "«arkadaşlarla pikniğe gideceğiz»." },
      { id: "l-a2-06-q3", level: "A2", topic: "Detay", question: "Can neden piknik teklifini kabul etmiyor?", options: ["Akşam misafir gelecek", "Hasta", "Parası yok", "İstemiyor"], correctAnswer: 0, explanation: "«akşam yemeğe misafir gelecek»." },
      { id: "l-a2-06-q4", level: "A2", topic: "Detay", question: "Pazar günü ne yapacaklar?", options: ["Kahve içecekler", "Sinemaya gidecekler", "Pikniğe gidecekler", "Çalışacaklar"], correctAnswer: 0, explanation: "«pazar günü kahve içelim mi?»." },
      { id: "l-a2-06-q5", level: "A2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Can pazar günü meşgul.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«pazar müsaitim» — в воскресенье свободен." },
    ],
  },

  /* ------------------------------ B1 – B2 ------------------------------- */
  {
    id: "l-b1-01", level: "B1", topic: "Röportaj",
    title: "Bir Sporcuyla Röportaj",
    text: "Sunucu: Bugün genç yüzücümüz Selin ile birlikteyiz. Selin, bu başarıyı nasıl elde ettin?\nSelin: Açıkçası çok çalıştım. Günde beş saat antrenman yapıyorum ve beslenmeme çok dikkat ediyorum.\nSunucu: Peki en zor anın hangisiydi?\nSelin: Geçen yıl bir sakatlık yaşadım. Üç ay yüzemedim, bu beni çok üzdü. Ama pes etmedim.\nSunucu: Genç sporculara ne tavsiye edersin?\nSelin: Sabırlı olsunlar ve hayallerinden vazgeçmesinler. Başarı bir günde gelmiyor.",
    questions: [
      { id: "l-b1-01-q1", level: "B1", topic: "Detay", question: "Selin'in mesleği nedir?", options: ["Yüzücü", "Koşucu", "Futbolcu", "Boksör"], correctAnswer: 0, explanation: "«genç yüzücümüz Selin»." },
      { id: "l-b1-01-q2", level: "B1", topic: "Detay", question: "Selin günde kaç saat antrenman yapıyor?", options: ["Beş saat", "İki saat", "Üç saat", "Sekiz saat"], correctAnswer: 0, explanation: "«Günde beş saat antrenman yapıyorum»." },
      { id: "l-b1-01-q3", level: "B1", topic: "Detay", question: "Selin'in en zor anı neydi?", options: ["Sakatlık yaşaması", "Yarışı kaybetmesi", "Antrenör değiştirmesi", "Şehir değiştirmesi"], correctAnswer: 0, explanation: "«bir sakatlık yaşadım. Üç ay yüzemedim»." },
      { id: "l-b1-01-q4", level: "B1", topic: "Çıkarım", question: "Selin gençlere ne tavsiye ediyor?", options: ["Sabırlı olmayı ve pes etmemeyi", "Çok dinlenmeyi", "Hızlı kazanmayı", "Risk almamayı"], correctAnswer: 0, explanation: "«Sabırlı olsunlar ve hayallerinden vazgeçmesinler»." },
      { id: "l-b1-01-q5", level: "B1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Selin sakatlık sonrası pes etti.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«Ama pes etmedim» — не сдалась." },
    ],
  },
  {
    id: "l-b1-02", level: "B1", topic: "Haber bülteni",
    title: "Akşam Haberleri",
    text: "Sunucu: İyi akşamlar. Bugünün önemli gelişmeleri şöyle: Şehrimizde yeni açılan metro hattı bugün hizmete girdi. Yetkililer, bu hattın günde yaklaşık iki yüz bin yolcuya hizmet vereceğini açıkladı. Ayrıca belediye, gelecek ay şehir merkezinde büyük bir kütüphane açacağını duyurdu. Hava durumuna gelince; yarın sıcaklıkların mevsim normallerinin üzerinde seyretmesi bekleniyor.",
    questions: [
      { id: "l-b1-02-q1", level: "B1", topic: "Detay", question: "Bugün ne hizmete girdi?", options: ["Yeni metro hattı", "Yeni havalimanı", "Yeni hastane", "Yeni köprü"], correctAnswer: 0, explanation: "«yeni açılan metro hattı bugün hizmete girdi»." },
      { id: "l-b1-02-q2", level: "B1", topic: "Detay", question: "Metro günde kaç yolcuya hizmet verecek?", options: ["Yaklaşık iki yüz bin", "Elli bin", "Bir milyon", "On bin"], correctAnswer: 0, explanation: "«günde yaklaşık iki yüz bin yolcu»." },
      { id: "l-b1-02-q3", level: "B1", topic: "Detay", question: "Belediye gelecek ay ne açacak?", options: ["Kütüphane", "Stadyum", "Okul", "Park"], correctAnswer: 0, explanation: "«büyük bir kütüphane açacağını duyurdu»." },
      { id: "l-b1-02-q4", level: "B1", topic: "Detay", question: "Yarın hava nasıl olacak?", options: ["Mevsim normallerinin üzerinde sıcak", "Çok soğuk", "Karlı", "Fırtınalı"], correctAnswer: 0, explanation: "«sıcaklıkların mevsim normallerinin üzerinde seyretmesi bekleniyor»." },
      { id: "l-b1-02-q5", level: "B1", topic: "Çıkarım", question: "Bu metin ne tür bir konuşmadır?", options: ["Haber bülteni", "Reklam", "Röportaj", "Ders"], correctAnswer: 0, explanation: "Диктор зачитывает новости — это новостной выпуск." },
    ],
  },
  {
    id: "l-b1-03", level: "B1", topic: "Üniversite",
    title: "Kayıt Danışmanlığı",
    text: "Öğrenci: Merhaba, yeni kayıt oldum ama dersleri nasıl seçeceğimi bilmiyorum.\nDanışman: Hoş geldin. İlk dönem zorunlu dersler otomatik tanımlanıyor. Sadece bir seçmeli ders eklemen gerekiyor.\nÖğrenci: Hangi seçmelileri önerirsiniz?\nDanışman: İlgi alanına bağlı. İletişim becerilerini geliştirmek istiyorsan 'Etkili Sunum' dersi çok faydalı.\nÖğrenci: Kulağa güzel geliyor. Nasıl kaydolurum?\nDanışman: Sistemden online seçebilirsin, son tarih cuma günü.",
    questions: [
      { id: "l-b1-03-q1", level: "B1", topic: "Detay", question: "Öğrencinin sorunu ne?", options: ["Ders seçmeyi bilmiyor", "Para sorunu var", "Yurt arıyor", "Kayıt yaptıramadı"], correctAnswer: 0, explanation: "«dersleri nasıl seçeceğimi bilmiyorum»." },
      { id: "l-b1-03-q2", level: "B1", topic: "Detay", question: "Zorunlu dersler nasıl tanımlanıyor?", options: ["Otomatik", "Elle", "Danışman tarafından", "Hiç"], correctAnswer: 0, explanation: "«zorunlu dersler otomatik tanımlanıyor»." },
      { id: "l-b1-03-q3", level: "B1", topic: "Detay", question: "Danışman hangi seçmeli dersi öneriyor?", options: ["Etkili Sunum", "Matematik", "Tarih", "Kimya"], correctAnswer: 0, explanation: "«'Etkili Sunum' dersi çok faydalı»." },
      { id: "l-b1-03-q4", level: "B1", topic: "Detay", question: "Ders seçiminin son tarihi ne zaman?", options: ["Cuma", "Pazartesi", "Çarşamba", "Pazar"], correctAnswer: 0, explanation: "«son tarih cuma günü»." },
      { id: "l-b1-03-q5", level: "B1", topic: "Çıkarım", question: "Öğrenci seçmeli dersi nasıl seçecek?", options: ["Online sistemden", "Telefonla", "Posta ile", "Danışmanın ofisinde"], correctAnswer: 0, explanation: "«Sistemden online seçebilirsin»." },
    ],
  },
  {
    id: "l-b1-04", level: "B1", topic: "Radyo programı",
    title: "Sağlık Köşesi",
    text: "Sunucu: Bugünkü sağlık köşemizde uyku konusunu ele alıyoruz. Uzmanımız Dr. Kaya, yetişkinlerin günde kaç saat uyuması gerekiyor?\nDr. Kaya: Yetişkinler için ideal süre yedi ile dokuz saat arasıdır. Yetersiz uyku, dikkat dağınıklığına ve hâlsizliğe yol açar.\nSunucu: İyi bir uyku için ne öneriyorsunuz?\nDr. Kaya: Yatmadan önce telefon kullanmamak çok önemli. Ayrıca her gün aynı saatte yatmak vücudu düzene sokar.\nSunucu: Çok teşekkürler doktor.",
    questions: [
      { id: "l-b1-04-q1", level: "B1", topic: "Detay", question: "Programın konusu ne?", options: ["Uyku", "Beslenme", "Spor", "Stres"], correctAnswer: 0, explanation: "«bugünkü … köşemizde uyku konusunu ele alıyoruz»." },
      { id: "l-b1-04-q2", level: "B1", topic: "Detay", question: "Yetişkinler kaç saat uyumalı?", options: ["Yedi-dokuz saat", "Dört-beş saat", "On-on iki saat", "Üç-dört saat"], correctAnswer: 0, explanation: "«yedi ile dokuz saat arasıdır»." },
      { id: "l-b1-04-q3", level: "B1", topic: "Detay", question: "Yetersiz uyku neye yol açar?", options: ["Dikkat dağınıklığı ve hâlsizlik", "Kilo verme", "Daha çok enerji", "İyi ruh hâli"], correctAnswer: 0, explanation: "«dikkat dağınıklığına ve hâlsizliğe yol açar»." },
      { id: "l-b1-04-q4", level: "B1", topic: "Çıkarım", question: "Doktor yatmadan önce neyi önermiyor?", options: ["Telefon kullanmayı", "Su içmeyi", "Kitap okumayı", "Erken yatmayı"], correctAnswer: 0, explanation: "«Yatmadan önce telefon kullanmamak çok önemli»." },
      { id: "l-b1-04-q5", level: "B1", topic: "Detay", question: "Vücudu düzene sokmak için ne yapmalı?", options: ["Her gün aynı saatte yatmak", "Geç yatmak", "Çok kahve içmek", "Gündüz uyumak"], correctAnswer: 0, explanation: "«her gün aynı saatte yatmak vücudu düzene sokar»." },
    ],
  },
  {
    id: "l-b2-01", level: "B2", topic: "Üniversite dersi",
    title: "Çevre Ekonomisi Dersi",
    text: "Hocam: Bugün yenilenebilir enerjinin ekonomik boyutunu konuşacağız. Güneş ve rüzgâr enerjisine yapılan yatırımlar başlangıçta pahalı görünebilir; ancak uzun vadede hem çevreye hem de bütçeye katkı sağlar. Fosil yakıtların aksine bu kaynaklar tükenmez. Üstelik son yıllarda teknolojinin gelişmesiyle güneş panellerinin maliyeti ciddi şekilde düştü. Bir diğer önemli nokta da bu sektörün yeni istihdam alanları yaratmasıdır. Yani yenilenebilir enerji, yalnızca bir çevre meselesi değil, aynı zamanda bir ekonomik fırsattır.",
    questions: [
      { id: "l-b2-01-q1", level: "B2", topic: "Detay", question: "Dersin konusu nedir?", options: ["Yenilenebilir enerjinin ekonomik boyutu", "Hava kirliliği", "Tarım", "Turizm"], correctAnswer: 0, explanation: "«yenilenebilir enerjinin ekonomik boyutunu konuşacağız»." },
      { id: "l-b2-01-q2", level: "B2", topic: "Detay", question: "Bu kaynakların fosil yakıtlardan farkı ne?", options: ["Tükenmez olmaları", "Daha kirli olmaları", "Daha pahalı olmaları", "Bulunamamaları"], correctAnswer: 0, explanation: "«Fosil yakıtların aksine bu kaynaklar tükenmez»." },
      { id: "l-b2-01-q3", level: "B2", topic: "Detay", question: "Güneş panellerinin maliyeti neden düştü?", options: ["Teknolojinin gelişmesiyle", "Talebin azalmasıyla", "Devlet yasağıyla", "Üretimin durmasıyla"], correctAnswer: 0, explanation: "«teknolojinin gelişmesiyle … maliyeti ciddi şekilde düştü»." },
      { id: "l-b2-01-q4", level: "B2", topic: "Çıkarım", question: "Sektörün bir ekonomik faydası nedir?", options: ["Yeni istihdam yaratması", "Vergileri artırması", "Enerjiyi pahalandırması", "İhracatı durdurması"], correctAnswer: 0, explanation: "«yeni istihdam alanları yaratmasıdır»." },
      { id: "l-b2-01-q5", level: "B2", topic: "Çıkarım", question: "Hocaya göre yenilenebilir enerji nedir?", options: ["Hem çevre hem ekonomik fırsat", "Sadece çevre meselesi", "Sadece maliyet", "Gereksiz bir yatırım"], correctAnswer: 0, explanation: "«yalnızca bir çevre meselesi değil, aynı zamanda bir ekonomik fırsattır»." },
    ],
  },
  {
    id: "l-b2-02", level: "B2", topic: "Röportaj",
    title: "Bir Yazarla Söyleşi",
    text: "Sunucu: Yeni romanınız büyük ilgi gördü. İlham kaynağınız neydi?\nYazar: Aslında çocukluğumun geçtiği küçük kasaba. Orada dinlediğim hikâyeler hâlâ aklımda.\nSunucu: Yazmak sizin için zor mu?\nYazar: Bazen çok zor. Bir cümleyi günlerce düşündüğüm oluyor. Ama yazmadan da duramıyorum.\nSunucu: Genç yazarlara önerileriniz neler?\nYazar: Çok okusunlar ve her gün, az da olsa, yazsınlar. Disiplin yetenekten daha önemlidir.\nSunucu: Değerli sözleriniz için teşekkürler.",
    questions: [
      { id: "l-b2-02-q1", level: "B2", topic: "Detay", question: "Yazarın ilham kaynağı ne?", options: ["Çocukluğunun kasabası", "Büyük şehir", "Yurt dışı gezileri", "Başka romanlar"], correctAnswer: 0, explanation: "«çocukluğumun geçtiği küçük kasaba»." },
      { id: "l-b2-02-q2", level: "B2", topic: "Çıkarım", question: "Yazar için yazmak nasıl bir şey?", options: ["Zor ama vazgeçilmez", "Çok kolay", "Sıkıcı", "Anlamsız"], correctAnswer: 0, explanation: "«Bazen çok zor … Ama yazmadan da duramıyorum»." },
      { id: "l-b2-02-q3", level: "B2", topic: "Detay", question: "Genç yazarlara ilk önerisi ne?", options: ["Çok okumak", "Az yazmak", "Hızlı yazmak", "Taklit etmek"], correctAnswer: 0, explanation: "«Çok okusunlar»." },
      { id: "l-b2-02-q4", level: "B2", topic: "Çıkarım", question: "Yazara göre yetenekten daha önemli olan nedir?", options: ["Disiplin", "Şans", "Para", "Ün"], correctAnswer: 0, explanation: "«Disiplin yetenekten daha önemlidir»." },
      { id: "l-b2-02-q5", level: "B2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Yazar her gün yazmayı öneriyor.»", options: ["Doğru", "Yanlış"], correctAnswer: 0, explanation: "«her gün, az da olsa, yazsınlar» — да." },
    ],
  },

  /* -------------------------------- C1 ---------------------------------- */
  {
    id: "l-c1-01", level: "C1", topic: "Konferans",
    title: "Dijital Çağda Mahremiyet",
    text: "Konuşmacı: Bugün sizlere dijital çağda mahremiyetin giderek nasıl kırılgan hâle geldiğinden söz etmek istiyorum. Akıllı telefonlar, arama motorları ve sosyal medya platformları, kullanıcıların farkında bile olmadığı muazzam bir veri yığınını sürekli topluyor. Bu veriler ticari amaçlarla işlenmekte, hatta kimi zaman üçüncü taraflarla paylaşılmaktadır. Sorun şu ki, kullanıcılar çoğu zaman okumadan kabul ettikleri sözleşmelerle bu duruma rıza gösteriyor. Mahremiyetin korunması yalnızca bireysel bir tedbir meselesi değildir; aynı zamanda güçlü yasal düzenlemeler ve şeffaf kurumsal politikalar gerektirir. Aksi takdirde, sözde 'ücretsiz' hizmetlerin gerçek bedelini kişisel özgürlüğümüzle ödeme riskiyle karşı karşıya kalırız.",
    questions: [
      { id: "l-c1-01-q1", level: "C1", topic: "Detay", question: "Konuşmanın ana teması nedir?", options: ["Dijital çağda mahremiyet", "Yapay zekâ", "Ekonomik kriz", "Eğitim reformu"], correctAnswer: 0, explanation: "«dijital çağda mahremiyetin … kırılgan hâle geldiğinden»." },
      { id: "l-c1-01-q2", level: "C1", topic: "Detay", question: "Toplanan veriler ne amaçla işleniyor?", options: ["Ticari amaçlarla", "Eğitim amacıyla", "Hiçbir amaçla", "Sadece güvenlik için"], correctAnswer: 0, explanation: "«Bu veriler ticari amaçlarla işlenmekte»." },
      { id: "l-c1-01-q3", level: "C1", topic: "Çıkarım", question: "Kullanıcılar bu duruma nasıl rıza gösteriyor?", options: ["Okumadan sözleşme kabul ederek", "Açıkça reddederek", "Dava açarak", "Hizmeti kullanmayarak"], correctAnswer: 0, explanation: "«okumadan kabul ettikleri sözleşmelerle … rıza gösteriyor»." },
      { id: "l-c1-01-q4", level: "C1", topic: "Çıkarım", question: "Konuşmacıya göre mahremiyet neyi gerektirir?", options: ["Yasal düzenleme ve şeffaf politikalar", "Sadece bireysel dikkat", "Teknolojiden tamamen kaçınma", "Daha fazla reklam"], correctAnswer: 0, explanation: "«güçlü yasal düzenlemeler ve şeffaf kurumsal politikalar gerektirir»." },
      { id: "l-c1-01-q5", level: "C1", topic: "Çıkarım", question: "'Ücretsiz' hizmetlerin gerçek bedeli nedir?", options: ["Kişisel özgürlük", "Aylık ücret", "Reklam izleme", "Zaman kaybı"], correctAnswer: 0, explanation: "«gerçek bedelini kişisel özgürlüğümüzle ödeme riski»." },
    ],
  },
  {
    id: "l-c1-02", level: "C1", topic: "Panel",
    title: "Şehirlerin Geleceği",
    text: "Moderatör: Panelimizin konusu geleceğin şehirleri. Sayın hocam, akıllı şehirler gerçekten çözüm mü?\nUzman: Akıllı şehir teknolojileri trafiği, enerji tüketimini ve atık yönetimini optimize edebilir. Ancak teknolojiyi tek başına bir kurtarıcı olarak görmek yanıltıcıdır. Asıl mesele, bu teknolojilerin tüm vatandaşlara eşit biçimde fayda sağlayıp sağlamayacağıdır. Eğer dijital altyapıya erişim sınırlı kalırsa, mevcut eşitsizlikler daha da derinleşebilir. Dolayısıyla geleceğin şehirlerini tasarlarken teknolojiyi değil, insanı merkeze almalıyız. Sürdürülebilirlik ve kapsayıcılık olmadan hiçbir şehir gerçekten 'akıllı' sayılamaz.",
    questions: [
      { id: "l-c1-02-q1", level: "C1", topic: "Detay", question: "Akıllı şehir teknolojileri neyi optimize edebilir?", options: ["Trafik, enerji ve atık yönetimini", "Sadece eğitimi", "Yalnızca turizmi", "Tarımı"], correctAnswer: 0, explanation: "«trafiği, enerji tüketimini ve atık yönetimini optimize edebilir»." },
      { id: "l-c1-02-q2", level: "C1", topic: "Çıkarım", question: "Uzmana göre teknolojiyi nasıl görmek yanıltıcıdır?", options: ["Tek başına kurtarıcı olarak", "Yararlı bir araç olarak", "Pahalı olarak", "Geçici olarak"], correctAnswer: 0, explanation: "«teknolojiyi tek başına bir kurtarıcı olarak görmek yanıltıcıdır»." },
      { id: "l-c1-02-q3", level: "C1", topic: "Çıkarım", question: "Dijital altyapıya erişim sınırlı kalırsa ne olur?", options: ["Eşitsizlikler derinleşebilir", "Herkes zenginleşir", "Trafik biter", "Şehirler küçülür"], correctAnswer: 0, explanation: "«mevcut eşitsizlikler daha da derinleşebilir»." },
      { id: "l-c1-02-q4", level: "C1", topic: "Çıkarım", question: "Geleceğin şehirlerinde ne merkeze alınmalı?", options: ["İnsan", "Teknoloji", "Ekonomi", "Otomobil"], correctAnswer: 0, explanation: "«teknolojiyi değil, insanı merkeze almalıyız»." },
      { id: "l-c1-02-q5", level: "C1", topic: "Detay", question: "Bir şehrin gerçekten 'akıllı' sayılması için ne gerekir?", options: ["Sürdürülebilirlik ve kapsayıcılık", "Çok sayıda kamera", "Yüksek binalar", "Geniş yollar"], correctAnswer: 0, explanation: "«Sürdürülebilirlik ve kapsayıcılık olmadan … 'akıllı' sayılamaz»." },
    ],
  },

  /* --------------------------- A1 (devam) --------------------------- */
  {
    id: "l-a1-05", level: "A1", topic: "Eczanede",
    title: "Eczanede",
    text: "Müşteri: Merhaba, baş ağrısı için bir ilaç var mı?\nEczacı: Tabii, bu ağrı kesiciyi kullanabilirsiniz.\nMüşteri: Günde kaç kez içmeliyim?\nEczacı: Yemekten sonra günde iki kez.\nMüşteri: Teşekkürler. Ne kadar?\nEczacı: Altmış lira.",
    questions: [
      { id: "l-a1-05-q1", level: "A1", topic: "Detay", question: "Müşteri ne için ilaç istiyor?", options: ["Baş ağrısı", "Diş ağrısı", "Karın ağrısı", "Öksürük"], correctAnswer: 0, explanation: "«baş ağrısı için bir ilaç»." },
      { id: "l-a1-05-q2", level: "A1", topic: "Detay", question: "İlacı günde kaç kez içmeli?", options: ["İki kez", "Bir kez", "Üç kez", "Dört kez"], correctAnswer: 0, explanation: "«günde iki kez»." },
      { id: "l-a1-05-q3", level: "A1", topic: "Detay", question: "İlaç ne zaman içilmeli?", options: ["Yemekten sonra", "Yemekten önce", "Aç karnına", "Gece"], correctAnswer: 0, explanation: "«Yemekten sonra»." },
      { id: "l-a1-05-q4", level: "A1", topic: "Detay", question: "İlaç ne kadar?", options: ["Altmış lira", "Otuz lira", "Yüz lira", "On lira"], correctAnswer: 0, explanation: "«Altmış lira»." },
      { id: "l-a1-05-q5", level: "A1", topic: "Detay", question: "Konuşma nerede geçiyor?", options: ["Eczanede", "Hastanede", "Markette", "Okulda"], correctAnswer: 0, explanation: "Аптекарь и клиент — в аптеке." },
    ],
  },
  {
    id: "l-a1-06", level: "A1", topic: "Telefonda",
    title: "Randevu Alma",
    text: "Görevli: Berber salonu, buyurun.\nMüşteri: Merhaba, yarın için randevu almak istiyorum.\nGörevli: Saat kaçta uygun?\nMüşteri: Öğleden sonra üçte olur mu?\nGörevli: Tabii, adınız nedir?\nMüşteri: Murat. Teşekkürler.",
    questions: [
      { id: "l-a1-06-q1", level: "A1", topic: "Detay", question: "Müşteri nereyi arıyor?", options: ["Berber salonunu", "Hastaneyi", "Oteli", "Restoranı"], correctAnswer: 0, explanation: "«Berber salonu, buyurun»." },
      { id: "l-a1-06-q2", level: "A1", topic: "Detay", question: "Ne zaman için randevu istiyor?", options: ["Yarın", "Bugün", "Gelecek hafta", "Bu akşam"], correctAnswer: 0, explanation: "«yarın için randevu»." },
      { id: "l-a1-06-q3", level: "A1", topic: "Detay", question: "Saat kaçta randevu alıyor?", options: ["Üçte", "İkide", "Dörtte", "Beşte"], correctAnswer: 0, explanation: "«öğleden sonra üçte»." },
      { id: "l-a1-06-q4", level: "A1", topic: "Detay", question: "Müşterinin adı ne?", options: ["Murat", "Ahmet", "Ali", "Can"], correctAnswer: 0, explanation: "«Murat»." },
      { id: "l-a1-06-q5", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Randevu sabah saatinde.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«öğleden sonra üçte» — после полудня." },
    ],
  },

  /* --------------------------- A2 (devam) --------------------------- */
  {
    id: "l-a2-07", level: "A2", topic: "Tren istasyonunda",
    title: "Bilet Almak",
    text: "Yolcu: İyi günler, Ankara'ya bir bilet lütfen.\nGörevli: Hangi saatte gitmek istiyorsunuz?\nYolcu: Mümkünse öğleden önce.\nGörevli: Saat onda bir tren var. Tek yön mü, gidiş-dönüş mü?\nYolcu: Gidiş-dönüş olsun. Dönüş pazar günü.\nGörevli: Toplam üç yüz lira. Peronu birden binebilirsiniz.",
    questions: [
      { id: "l-a2-07-q1", level: "A2", topic: "Detay", question: "Yolcu nereye gitmek istiyor?", options: ["Ankara'ya", "İstanbul'a", "İzmir'e", "Bursa'ya"], correctAnswer: 0, explanation: "«Ankara'ya bir bilet»." },
      { id: "l-a2-07-q2", level: "A2", topic: "Detay", question: "Tren saat kaçta?", options: ["Onda", "Dokuzda", "On birde", "Sekizde"], correctAnswer: 0, explanation: "«Saat onda bir tren var»." },
      { id: "l-a2-07-q3", level: "A2", topic: "Detay", question: "Yolcu nasıl bir bilet alıyor?", options: ["Gidiş-dönüş", "Tek yön", "Aylık", "Öğrenci"], correctAnswer: 0, explanation: "«Gidiş-dönüş olsun»." },
      { id: "l-a2-07-q4", level: "A2", topic: "Detay", question: "Dönüş ne zaman?", options: ["Pazar günü", "Cumartesi", "Cuma", "Pazartesi"], correctAnswer: 0, explanation: "«Dönüş pazar günü»." },
      { id: "l-a2-07-q5", level: "A2", topic: "Detay", question: "Toplam ücret ne kadar?", options: ["Üç yüz lira", "İki yüz lira", "Beş yüz lira", "Yüz lira"], correctAnswer: 0, explanation: "«Toplam üç yüz lira»." },
    ],
  },
  {
    id: "l-a2-08", level: "A2", topic: "Komşularla",
    title: "Yeni Komşu",
    text: "Ayşe: Merhaba, ben üst kata yeni taşındım. Adım Ayşe.\nHasan: Hoş geldiniz! Ben Hasan, yan dairede oturuyorum.\nAyşe: Teşekkürler. Buralarda market var mı?\nHasan: Evet, köşede bir market ve karşıda da bir fırın var.\nAyşe: Harika. Çöpü nereye atıyoruz?\nHasan: Bina çıkışının solunda konteyner var.",
    questions: [
      { id: "l-a2-08-q1", level: "A2", topic: "Detay", question: "Ayşe nereye taşındı?", options: ["Üst kata", "Alt kata", "Yan binaya", "Karşı eve"], correctAnswer: 0, explanation: "«üst kata yeni taşındım»." },
      { id: "l-a2-08-q2", level: "A2", topic: "Detay", question: "Hasan nerede oturuyor?", options: ["Yan dairede", "Üst katta", "Alt katta", "Karşı binada"], correctAnswer: 0, explanation: "«yan dairede oturuyorum»." },
      { id: "l-a2-08-q3", level: "A2", topic: "Detay", question: "Karşıda ne var?", options: ["Fırın", "Okul", "Hastane", "Park"], correctAnswer: 0, explanation: "«karşıda da bir fırın var»." },
      { id: "l-a2-08-q4", level: "A2", topic: "Detay", question: "Çöp konteyneri nerede?", options: ["Bina çıkışının solunda", "Sağda", "Üst katta", "Markette"], correctAnswer: 0, explanation: "«Bina çıkışının solunda»." },
      { id: "l-a2-08-q5", level: "A2", topic: "Çıkarım", question: "Hasan komşusuna karşı nasıl?", options: ["Yardımsever", "İlgisiz", "Kaba", "Sinirli"], correctAnswer: 0, explanation: "Он приветствует и помогает — дружелюбен." },
    ],
  },

  /* --------------------------- B1 (devam) --------------------------- */
  {
    id: "l-b1-05", level: "B1", topic: "Radyo programı",
    title: "Kitap Kulübü",
    text: "Sunucu: Bu haftaki kitap kulübümüzde konuğumuz bir kütüphaneci. Hoş geldiniz! İnsanları daha çok okumaya nasıl teşvik edebiliriz?\nKonuk: Teşekkürler. Bence en önemli şey, okumayı bir zorunluluk değil, keyif hâline getirmek. Küçük yaşta çocuklara sesli kitap okumak çok etkili.\nSunucu: Dijital kitaplar hakkında ne düşünüyorsunuz?\nKonuk: Dijital kitaplar erişimi kolaylaştırıyor. Ama basılı kitabın kokusu ve hissi bambaşka. İkisi de değerli.\nSunucu: Çok teşekkürler.",
    questions: [
      { id: "l-b1-05-q1", level: "B1", topic: "Detay", question: "Programın konuğu kim?", options: ["Bir kütüphaneci", "Bir doktor", "Bir sporcu", "Bir aşçı"], correctAnswer: 0, explanation: "«konuğumuz bir kütüphaneci»." },
      { id: "l-b1-05-q2", level: "B1", topic: "Çıkarım", question: "Konuğa göre en önemli şey nedir?", options: ["Okumayı keyfe dönüştürmek", "Çok kitap almak", "Hızlı okumak", "Sınav yapmak"], correctAnswer: 0, explanation: "«okumayı … keyif hâline getirmek»." },
      { id: "l-b1-05-q3", level: "B1", topic: "Detay", question: "Çocuklar için ne etkili?", options: ["Sesli kitap okumak", "Televizyon", "Telefon", "Oyun"], correctAnswer: 0, explanation: "«çocuklara sesli kitap okumak çok etkili»." },
      { id: "l-b1-05-q4", level: "B1", topic: "Detay", question: "Dijital kitaplar neyi kolaylaştırıyor?", options: ["Erişimi", "Yazmayı", "Uyumayı", "Yemeyi"], correctAnswer: 0, explanation: "«erişimi kolaylaştırıyor»." },
      { id: "l-b1-05-q5", level: "B1", topic: "Çıkarım", question: "Konuk dijital ve basılı kitap için ne diyor?", options: ["İkisi de değerli", "Sadece dijital iyi", "Sadece basılı iyi", "İkisi de gereksiz"], correctAnswer: 0, explanation: "«İkisi de değerli»." },
    ],
  },
  {
    id: "l-b1-06", level: "B1", topic: "Röportaj",
    title: "Bir Gönüllüyle Söyleşi",
    text: "Sunucu: Üç yıldır bir hayvan barınağında gönüllüsünüz. Sizi buna iten neydi?\nGönüllü: Sokak hayvanlarına her zaman ilgim vardı. Bir gün barınağı ziyaret ettim ve yardım etmek istedim.\nSunucu: Genellikle ne tür işler yapıyorsunuz?\nGönüllü: Hayvanları besliyoruz, kafesleri temizliyoruz ve onlara sahip arıyoruz.\nSunucu: Başkalarına ne tavsiye edersiniz?\nGönüllü: Az da olsa zaman ayırsınlar. Küçük bir yardım bile büyük fark yaratır.",
    questions: [
      { id: "l-b1-06-q1", level: "B1", topic: "Detay", question: "Kişi nerede gönüllü?", options: ["Hayvan barınağında", "Hastanede", "Okulda", "Kütüphanede"], correctAnswer: 0, explanation: "«bir hayvan barınağında gönüllüsünüz»." },
      { id: "l-b1-06-q2", level: "B1", topic: "Detay", question: "Kaç yıldır gönüllü?", options: ["Üç yıl", "Bir yıl", "Beş yıl", "On yıl"], correctAnswer: 0, explanation: "«Üç yıldır … gönüllüsünüz»." },
      { id: "l-b1-06-q3", level: "B1", topic: "Detay", question: "Hangi işi yapmıyor?", options: ["Yemek pişirme", "Besleme", "Temizlik", "Sahip arama"], correctAnswer: 0, explanation: "Названы: besleme, temizlik, sahip arama; готовки нет." },
      { id: "l-b1-06-q4", level: "B1", topic: "Çıkarım", question: "Gönüllü ne tavsiye ediyor?", options: ["Az da olsa zaman ayırmayı", "Para vermeyi", "Hayvan almayı", "Hiçbir şey"], correctAnswer: 0, explanation: "«Az da olsa zaman ayırsınlar»." },
      { id: "l-b1-06-q5", level: "B1", topic: "Çıkarım", question: "«Küçük bir yardım bile büyük fark yaratır» ne anlama gelir?", options: ["Küçük katkılar önemlidir", "Yardım gereksizdir", "Sadece büyük yardım işe yarar", "Yardım zordur"], correctAnswer: 0, explanation: "Малая помощь тоже значима." },
    ],
  },

  /* --------------------------- B2 (devam) --------------------------- */
  {
    id: "l-b2-03", level: "B2", topic: "Haber analizi",
    title: "Elektrikli Araçlar",
    text: "Sunucu: Son yıllarda elektrikli araçlara olan ilgi hızla artıyor. Uzmanımıza soruyoruz: bu gerçek bir dönüşüm mü?\nUzman: Kesinlikle. Birçok ülke benzinli araç satışını kademeli olarak yasaklamayı planlıyor. Elektrikli araçlar hem daha sessiz hem de çevreye daha az zarar veriyor.\nSunucu: Peki engeller neler?\nUzman: En büyük sorun şarj istasyonlarının yetersizliği ve bataryaların yüksek maliyeti. Ancak teknoloji geliştikçe fiyatların düşmesi bekleniyor.\nSunucu: Yani gelecek elektrikli mi?\nUzman: Büyük olasılıkla, evet.",
    questions: [
      { id: "l-b2-03-q1", level: "B2", topic: "Detay", question: "Neye olan ilgi artıyor?", options: ["Elektrikli araçlara", "Benzinli araçlara", "Bisikletlere", "Trenlere"], correctAnswer: 0, explanation: "«elektrikli araçlara olan ilgi hızla artıyor»." },
      { id: "l-b2-03-q2", level: "B2", topic: "Detay", question: "Birçok ülke neyi planlıyor?", options: ["Benzinli araç satışını yasaklamayı", "Daha çok benzin üretmeyi", "Araçları ücretsiz yapmayı", "Yolları kapatmayı"], correctAnswer: 0, explanation: "«benzinli araç satışını … yasaklamayı planlıyor»." },
      { id: "l-b2-03-q3", level: "B2", topic: "Detay", question: "Elektrikli araçların bir avantajı nedir?", options: ["Daha sessiz olmaları", "Daha pahalı olmaları", "Daha gürültülü olmaları", "Daha kirli olmaları"], correctAnswer: 0, explanation: "«daha sessiz hem de çevreye daha az zarar»." },
      { id: "l-b2-03-q4", level: "B2", topic: "Detay", question: "En büyük engel nedir?", options: ["Şarj istasyonu yetersizliği ve batarya maliyeti", "Renk seçenekleri", "Sürücü sayısı", "Yol genişliği"], correctAnswer: 0, explanation: "«şarj istasyonlarının yetersizliği ve bataryaların yüksek maliyeti»." },
      { id: "l-b2-03-q5", level: "B2", topic: "Çıkarım", question: "Uzmana göre gelecek nasıl?", options: ["Büyük olasılıkla elektrikli", "Tamamen benzinli", "Araçsız", "Belirsiz"], correctAnswer: 0, explanation: "«Büyük olasılıkla, evet»." },
    ],
  },

  /* --------------------------- C1 (devam) --------------------------- */
  {
    id: "l-c1-03", level: "C1", topic: "Akademik konuşma",
    title: "Eleştirel Düşünme",
    text: "Konuşmacı: Bilgiye her zamankinden daha kolay eriştiğimiz bu çağda, asıl mesele bilgiye ulaşmak değil, onu doğru değerlendirmektir. Eleştirel düşünme, karşılaştığımız her iddiayı sorgulama, kanıtları tartma ve önyargılarımızın farkına varma becerisidir. Maalesef bu beceri çoğu eğitim sisteminde yeterince geliştirilmiyor; öğrencilerden çoğu zaman bilgiyi ezberlemeleri isteniyor, oysa onu sorgulamaları beklenmiyor. Oysa demokratik bir toplumun sağlıklı işleyebilmesi, bireylerin manipülasyona karşı koyabilen, bağımsız düşünebilen yurttaşlar olmasına bağlıdır. Bu nedenle eleştirel düşünmeyi öğretmek, bir lüks değil, bir zorunluluktur.",
    questions: [
      { id: "l-c1-03-q1", level: "C1", topic: "Çıkarım", question: "Bu çağda asıl mesele nedir?", options: ["Bilgiyi doğru değerlendirmek", "Bilgiye ulaşmak", "Bilgi üretmek", "Bilgiyi saklamak"], correctAnswer: 0, explanation: "«asıl mesele … onu doğru değerlendirmektir»." },
      { id: "l-c1-03-q2", level: "C1", topic: "Detay", question: "Eleştirel düşünme nedir?", options: ["İddiaları sorgulama ve kanıt tartma", "Hızlı okuma", "Ezberleme", "Not alma"], correctAnswer: 0, explanation: "«her iddiayı sorgulama, kanıtları tartma»." },
      { id: "l-c1-03-q3", level: "C1", topic: "Çıkarım", question: "Eğitim sistemlerindeki sorun nedir?", options: ["Ezbere yöneltmesi", "Çok sorgulatması", "Az ödev vermesi", "Çok kitap okutması"], correctAnswer: 0, explanation: "«bilgiyi ezberlemeleri isteniyor, … sorgulamaları beklenmiyor»." },
      { id: "l-c1-03-q4", level: "C1", topic: "Çıkarım", question: "Sağlıklı demokrasi neye bağlı?", options: ["Bağımsız düşünebilen yurttaşlara", "Daha çok yasaya", "Daha çok teknolojiye", "Daha çok medyaya"], correctAnswer: 0, explanation: "«bağımsız düşünebilen yurttaşlar olmasına bağlıdır»." },
      { id: "l-c1-03-q5", level: "C1", topic: "Çıkarım", question: "Konuşmacıya göre eleştirel düşünme öğretmek nedir?", options: ["Bir zorunluluk", "Bir lüks", "Gereksiz", "İmkânsız"], correctAnswer: 0, explanation: "«bir lüks değil, bir zorunluluktur»." },
    ],
  },

  /* --------------------------- Batch 3 --------------------------- */
  {
    id: "l-a1-07", level: "A1", topic: "Otobüste",
    title: "Otobüste",
    text: "Yolcu: Affedersiniz, bu otobüs merkeze gidiyor mu?\nŞoför: Evet, gidiyor.\nYolcu: Bilet ne kadar?\nŞoför: On beş lira.\nYolcu: Merkeze kaç durak var?\nŞoför: Beş durak sonra ineceksiniz.",
    questions: [
      { id: "l-a1-07-q1", level: "A1", topic: "Detay", question: "Otobüs nereye gidiyor?", options: ["Merkeze", "Havaalanına", "Köye", "Sahile"], correctAnswer: 0, explanation: "«bu otobüs merkeze gidiyor mu? — Evet»." },
      { id: "l-a1-07-q2", level: "A1", topic: "Detay", question: "Bilet ne kadar?", options: ["On beş lira", "On lira", "Yirmi lira", "Beş lira"], correctAnswer: 0, explanation: "«On beş lira»." },
      { id: "l-a1-07-q3", level: "A1", topic: "Detay", question: "Kaç durak sonra inecek?", options: ["Beş", "Üç", "Yedi", "İki"], correctAnswer: 0, explanation: "«Beş durak sonra ineceksiniz»." },
      { id: "l-a1-07-q4", level: "A1", topic: "Detay", question: "Yolcu kiminle konuşuyor?", options: ["Şoförle", "Garsonla", "Doktorla", "Öğretmenle"], correctAnswer: 0, explanation: "Водитель отвечает — это шофёр." },
      { id: "l-a1-07-q5", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Otobüs merkeze gitmiyor.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«Evet, gidiyor»." },
    ],
  },
  {
    id: "l-a2-09", level: "A2", topic: "İş görüşmesi",
    title: "Kısa İş Görüşmesi",
    text: "İşveren: Merhaba, lütfen kendinizden bahsedin.\nAday: Merhaba. Ben Selin, yirmi altı yaşındayım. İki yıl bir kafede garson olarak çalıştım.\nİşveren: Neden bizimle çalışmak istiyorsunuz?\nAday: Müşterilerle iletişimi seviyorum ve burada gelişebileceğimi düşünüyorum.\nİşveren: Hafta sonları çalışabilir misiniz?\nAday: Evet, esnek bir programım var.\nİşveren: Teşekkürler, size yarın dönüş yapacağız.",
    questions: [
      { id: "l-a2-09-q1", level: "A2", topic: "Detay", question: "Aday daha önce nerede çalıştı?", options: ["Bir kafede", "Bir okulda", "Bir hastanede", "Bir bankada"], correctAnswer: 0, explanation: "«bir kafede garson olarak çalıştım»." },
      { id: "l-a2-09-q2", level: "A2", topic: "Detay", question: "Kaç yıl deneyimi var?", options: ["İki yıl", "Bir yıl", "Üç yıl", "Beş yıl"], correctAnswer: 0, explanation: "«İki yıl … çalıştım»." },
      { id: "l-a2-09-q3", level: "A2", topic: "Çıkarım", question: "Aday neyi seviyor?", options: ["Müşterilerle iletişimi", "Yalnız çalışmayı", "Geç kalmayı", "Seyahati"], correctAnswer: 0, explanation: "«Müşterilerle iletişimi seviyorum»." },
      { id: "l-a2-09-q4", level: "A2", topic: "Detay", question: "Hafta sonları çalışabilir mi?", options: ["Evet", "Hayır", "Bilmiyor", "Bazen"], correctAnswer: 0, explanation: "«Evet, esnek bir programım var»." },
      { id: "l-a2-09-q5", level: "A2", topic: "Detay", question: "İşveren ne zaman dönüş yapacak?", options: ["Yarın", "Bugün", "Gelecek ay", "Hiç"], correctAnswer: 0, explanation: "«size yarın dönüş yapacağız»." },
    ],
  },
  {
    id: "l-b1-07", level: "B1", topic: "Podcast",
    title: "Zaman Yönetimi Üzerine",
    text: "Sunucu: Bugünkü bölümde zaman yönetimini konuşuyoruz. Konuğumuz bir verimlilik uzmanı. Neden bu kadar çok insan zamanını iyi kullanamıyor?\nUzman: Çünkü çoğu kişi önceliklerini belirlemiyor. Her işi aynı anda yapmaya çalışmak yorucudur ve verimi düşürür.\nSunucu: Ne öneriyorsunuz?\nUzman: Güne başlamadan önce en önemli üç işi yazın ve önce onları bitirin. Ayrıca telefon bildirimlerini kapatmak dikkat dağınıklığını ciddi şekilde azaltır.\nSunucu: Harika tavsiyeler, teşekkürler.",
    questions: [
      { id: "l-b1-07-q1", level: "B1", topic: "Detay", question: "Bölümün konusu nedir?", options: ["Zaman yönetimi", "Beslenme", "Spor", "Seyahat"], correctAnswer: 0, explanation: "«zaman yönetimini konuşuyoruz»." },
      { id: "l-b1-07-q2", level: "B1", topic: "Çıkarım", question: "İnsanlar neden zamanını iyi kullanamıyor?", options: ["Öncelik belirlemediği için", "Çok uyuduğu için", "Az çalıştığı için", "Tatil yaptığı için"], correctAnswer: 0, explanation: "«çoğu kişi önceliklerini belirlemiyor»." },
      { id: "l-b1-07-q3", level: "B1", topic: "Detay", question: "Uzman güne nasıl başlamayı öneriyor?", options: ["En önemli üç işi yazarak", "Telefona bakarak", "Geç kalkarak", "Hiç plan yapmadan"], correctAnswer: 0, explanation: "«en önemli üç işi yazın»." },
      { id: "l-b1-07-q4", level: "B1", topic: "Detay", question: "Dikkat dağınıklığını ne azaltır?", options: ["Bildirimleri kapatmak", "Çok kahve içmek", "Müzik açmak", "Geç yatmak"], correctAnswer: 0, explanation: "«telefon bildirimlerini kapatmak dikkat dağınıklığını … azaltır»." },
      { id: "l-b1-07-q5", level: "B1", topic: "Çıkarım", question: "Aynı anda her işi yapmak nasıldır?", options: ["Yorucu ve verimsiz", "Kolay", "Hızlı", "Faydalı"], correctAnswer: 0, explanation: "«yorucudur ve verimi düşürür»." },
    ],
  },
  {
    id: "l-b1-08", level: "B1", topic: "Haber",
    title: "Kitap Festivali Haberi",
    text: "Spiker: Şehrimizde bu hafta sonu büyük bir kitap festivali düzenleniyor. Festivalde yüzden fazla yayınevi yer alacak. Ziyaretçiler yazarlarla tanışabil, imza alabilecek ve atölyelere katılabilecek. Giriş ücretsiz. Etkinlik cumartesi ve pazar günü saat ona kadar açık olacak. Düzenleyiciler, geçen yıl elli bin kişinin festivale katıldığını belirtti.",
    questions: [
      { id: "l-b1-08-q1", level: "B1", topic: "Detay", question: "Hafta sonu ne düzenleniyor?", options: ["Kitap festivali", "Müzik konseri", "Spor müsabakası", "Yemek fuarı"], correctAnswer: 0, explanation: "«büyük bir kitap festivali düzenleniyor»." },
      { id: "l-b1-08-q2", level: "B1", topic: "Detay", question: "Kaç yayınevi katılacak?", options: ["Yüzden fazla", "On", "Elli", "Beş"], correctAnswer: 0, explanation: "«yüzden fazla yayınevi»." },
      { id: "l-b1-08-q3", level: "B1", topic: "Detay", question: "Giriş ne kadar?", options: ["Ücretsiz", "Yüz lira", "Elli lira", "Yirmi lira"], correctAnswer: 0, explanation: "«Giriş ücretsiz»." },
      { id: "l-b1-08-q4", level: "B1", topic: "Detay", question: "Ziyaretçiler ne yapabilecek?", options: ["Yazarlarla tanışıp imza alabilecek", "Sadece kitap satacak", "Film izleyecek", "Yemek pişirecek"], correctAnswer: 0, explanation: "«yazarlarla tanışabil, imza alabilecek»." },
      { id: "l-b1-08-q5", level: "B1", topic: "Detay", question: "Geçen yıl kaç kişi katıldı?", options: ["Elli bin", "Beş bin", "Yüz bin", "On bin"], correctAnswer: 0, explanation: "«geçen yıl elli bin kişinin … katıldığını»." },
    ],
  },
  {
    id: "l-b2-04", level: "B2", topic: "Panel",
    title: "Beslenme ve Alışkanlıklar",
    text: "Moderatör: Sayın doktor, sağlıklı beslenme konusunda en sık yapılan hata nedir?\nDoktor: En sık hata, öğün atlamaktır. Özellikle kahvaltıyı atlayan kişiler gün içinde daha çok abur cubur tüketiyor.\nModeratör: İşlenmiş gıdalar hakkında ne dersiniz?\nDoktor: İşlenmiş gıdalar pratik görünse de yüksek oranda şeker ve tuz içeriyor. Mümkün olduğunca taze ve mevsiminde besinleri tercih etmeliyiz.\nModeratör: Su tüketimi de önemli, değil mi?\nDoktor: Kesinlikle. Susamayı beklemeden düzenli su içmek gerekir.",
    questions: [
      { id: "l-b2-04-q1", level: "B2", topic: "Detay", question: "En sık yapılan beslenme hatası nedir?", options: ["Öğün atlamak", "Çok su içmek", "Sebze yemek", "Erken yemek"], correctAnswer: 0, explanation: "«En sık hata, öğün atlamaktır»." },
      { id: "l-b2-04-q2", level: "B2", topic: "Çıkarım", question: "Kahvaltıyı atlayanlar ne yapıyor?", options: ["Daha çok abur cubur tüketiyor", "Daha az yiyor", "Daha çok su içiyor", "Daha çok uyuyor"], correctAnswer: 0, explanation: "«gün içinde daha çok abur cubur tüketiyor»." },
      { id: "l-b2-04-q3", level: "B2", topic: "Detay", question: "İşlenmiş gıdalar ne içeriyor?", options: ["Yüksek şeker ve tuz", "Çok vitamin", "Çok su", "Hiçbir şey"], correctAnswer: 0, explanation: "«yüksek oranda şeker ve tuz içeriyor»." },
      { id: "l-b2-04-q4", level: "B2", topic: "Çıkarım", question: "Doktor neyi tercih etmemizi öneriyor?", options: ["Taze ve mevsiminde besinler", "Hazır yemekler", "Şekerli içecekler", "Konserve"], correctAnswer: 0, explanation: "«taze ve mevsiminde besinleri tercih etmeliyiz»." },
      { id: "l-b2-04-q5", level: "B2", topic: "Detay", question: "Su nasıl içilmeli?", options: ["Susamayı beklemeden düzenli", "Sadece susayınca", "Sadece sabah", "Hiç"], correctAnswer: 0, explanation: "«Susamayı beklemeden düzenli su içmek»." },
    ],
  },
  {
    id: "l-c1-04", level: "C1", topic: "Konferans",
    title: "Sürdürülebilir Tüketim",
    text: "Konuşmacı: Modern ekonomiler büyümeyi sürekli artan tüketim üzerine kurmuştur; oysa gezegenin kaynakları sınırlıdır. 'Sürdürülebilir tüketim' kavramı, ihtiyaçlarımızı gelecek nesillerin haklarını gözeterek karşılamayı ifade eder. Bu yalnızca bireysel tercihlerle sınırlı değildir; üreticilerin de daha dayanıklı, onarılabilir ve geri dönüştürülebilir ürünler tasarlaması gerekir. Ne yazık ki 'planlı eskitme' denilen, ürünlerin bilinçli olarak kısa ömürlü tasarlanması yaygın bir uygulamadır. Gerçek bir dönüşüm için hem tüketim kültürümüzü hem de üretim anlayışımızı kökten sorgulamamız şarttır.",
    questions: [
      { id: "l-c1-04-q1", level: "C1", topic: "Çıkarım", question: "Modern ekonomiler büyümeyi neye dayandırıyor?", options: ["Artan tüketime", "Azalan nüfusa", "Tasarrufa", "Tarıma"], correctAnswer: 0, explanation: "«sürekli artan tüketim üzerine kurmuştur»." },
      { id: "l-c1-04-q2", level: "C1", topic: "Detay", question: "Sürdürülebilir tüketim neyi gözetir?", options: ["Gelecek nesillerin haklarını", "Sadece bugünü", "Sadece kârı", "Hızı"], correctAnswer: 0, explanation: "«gelecek nesillerin haklarını gözeterek»." },
      { id: "l-c1-04-q3", level: "C1", topic: "Çıkarım", question: "Üreticiler nasıl ürünler tasarlamalı?", options: ["Dayanıklı, onarılabilir, geri dönüştürülebilir", "Kısa ömürlü", "Pahalı", "Tek kullanımlık"], correctAnswer: 0, explanation: "«daha dayanıklı, onarılabilir ve geri dönüştürülebilir»." },
      { id: "l-c1-04-q4", level: "C1", topic: "Detay", question: "'Planlı eskitme' nedir?", options: ["Ürünlerin bilinçli olarak kısa ömürlü tasarlanması", "Ürünlerin ucuzlaması", "Ürünlerin geri alınması", "Ürünlerin onarılması"], correctAnswer: 0, explanation: "«ürünlerin bilinçli olarak kısa ömürlü tasarlanması»." },
      { id: "l-c1-04-q5", level: "C1", topic: "Çıkarım", question: "Gerçek dönüşüm için ne şart?", options: ["Tüketim ve üretim anlayışını sorgulamak", "Daha çok üretmek", "Daha çok satmak", "Hiçbir şey"], correctAnswer: 0, explanation: "«tüketim kültürümüzü hem de üretim anlayışımızı kökten sorgulamamız şart»." },
    ],
  },

  /* --------------------------- Batch 4 --------------------------- */
  {
    id: "l-a1-08", level: "A1", topic: "Lokantada hesap",
    title: "Hesap Lütfen",
    text: "Müşteri: Garson bey, hesabı alabilir miyim?\nGarson: Tabii, hemen getiriyorum. Toplam yüz yirmi lira.\nMüşteri: Kartla ödeyebilir miyim?\nGarson: Elbette, buyurun.\nMüşteri: Yemekler çok güzeldi, teşekkürler.\nGarson: Afiyet olsun, yine bekleriz.",
    questions: [
      { id: "l-a1-08-q1", level: "A1", topic: "Detay", question: "Müşteri ne istiyor?", options: ["Hesabı", "Menüyü", "Su", "Tatlı"], correctAnswer: 0, explanation: "«hesabı alabilir miyim?»." },
      { id: "l-a1-08-q2", level: "A1", topic: "Detay", question: "Toplam ne kadar?", options: ["Yüz yirmi lira", "Yüz lira", "Elli lira", "İki yüz lira"], correctAnswer: 0, explanation: "«Toplam yüz yirmi lira»." },
      { id: "l-a1-08-q3", level: "A1", topic: "Detay", question: "Müşteri nasıl ödüyor?", options: ["Kartla", "Nakit", "Çekle", "Telefonla"], correctAnswer: 0, explanation: "«Kartla ödeyebilir miyim? — Elbette»." },
      { id: "l-a1-08-q4", level: "A1", topic: "Çıkarım", question: "Müşteri yemekleri nasıl buldu?", options: ["Çok güzel", "Kötü", "Tuzlu", "Soğuk"], correctAnswer: 0, explanation: "«Yemekler çok güzeldi»." },
      { id: "l-a1-08-q5", level: "A1", topic: "Detay", question: "Konuşma nerede geçiyor?", options: ["Lokantada", "Otelde", "Markette", "Bankada"], correctAnswer: 0, explanation: "Официант и счёт — в ресторане." },
    ],
  },
  {
    id: "l-a2-10", level: "A2", topic: "Kayıp eşya",
    title: "Çantamı Kaybettim",
    text: "Yolcu: Merhaba, otobüste çantamı unuttum. Bulundu mu?\nGörevli: Nasıl bir çanta?\nYolcu: Siyah, küçük bir sırt çantası. İçinde bir kitap ve cüzdan vardı.\nGörevli: Bir dakika bakayım… Evet, bir siyah çanta getirdiler.\nYolcu: Çok sevindim! Nasıl alabilirim?\nGörevli: Kimliğinizi gösterin, hemen teslim edeyim.",
    questions: [
      { id: "l-a2-10-q1", level: "A2", topic: "Detay", question: "Yolcu nerede çantasını unuttu?", options: ["Otobüste", "Trende", "Markette", "Evde"], correctAnswer: 0, explanation: "«otobüste çantamı unuttum»." },
      { id: "l-a2-10-q2", level: "A2", topic: "Detay", question: "Çanta nasıl bir çanta?", options: ["Siyah sırt çantası", "Kırmızı el çantası", "Mavi bavul", "Beyaz poşet"], correctAnswer: 0, explanation: "«Siyah, küçük bir sırt çantası»." },
      { id: "l-a2-10-q3", level: "A2", topic: "Detay", question: "İçinde ne vardı?", options: ["Kitap ve cüzdan", "Telefon ve anahtar", "Para ve pasaport", "Hiçbir şey"], correctAnswer: 0, explanation: "«İçinde bir kitap ve cüzdan vardı»." },
      { id: "l-a2-10-q4", level: "A2", topic: "Detay", question: "Çanta bulundu mu?", options: ["Evet", "Hayır", "Belli değil", "Kayıp"], correctAnswer: 0, explanation: "«Evet, bir siyah çanta getirdiler»." },
      { id: "l-a2-10-q5", level: "A2", topic: "Detay", question: "Çantayı almak için ne gerekiyor?", options: ["Kimlik göstermek", "Para ödemek", "Form doldurmak", "Beklemek"], correctAnswer: 0, explanation: "«Kimliğinizi gösterin»." },
    ],
  },
  {
    id: "l-b1-09", level: "B1", topic: "Röportaj",
    title: "Bir Müzisyenle Söyleşi",
    text: "Sunucu: Müziğe ne zaman başladınız?\nMüzisyen: Yedi yaşında piyano çalmaya başladım. Annem de müzik öğretmeniydi.\nSunucu: İlham kaynağınız nedir?\nMüzisyen: Günlük hayat. Bir sokakta yürürken bile aklıma bir melodi gelebiliyor.\nSunucu: Genç müzisyenlere ne söylersiniz?\nMüzisyen: Çok dinlesinler ve her gün çalışsınlar. Yetenek önemli ama düzenli çalışma her şeyi değiştirir.\nSunucu: Teşekkür ederiz.",
    questions: [
      { id: "l-b1-09-q1", level: "B1", topic: "Detay", question: "Müzisyen kaç yaşında başladı?", options: ["Yedi", "On", "Beş", "On iki"], correctAnswer: 0, explanation: "«Yedi yaşında piyano çalmaya başladım»." },
      { id: "l-b1-09-q2", level: "B1", topic: "Detay", question: "Annesi neydi?", options: ["Müzik öğretmeni", "Doktor", "Mühendis", "Ressam"], correctAnswer: 0, explanation: "«Annem de müzik öğretmeniydi»." },
      { id: "l-b1-09-q3", level: "B1", topic: "Detay", question: "İlham kaynağı nedir?", options: ["Günlük hayat", "Diğer şarkılar", "Kitaplar", "Filmler"], correctAnswer: 0, explanation: "«İlham kaynağınız … Günlük hayat»." },
      { id: "l-b1-09-q4", level: "B1", topic: "Çıkarım", question: "Gençlere ne tavsiye ediyor?", options: ["Çok dinleyip her gün çalışmayı", "Az çalışmayı", "Sadece yeteneğe güvenmeyi", "Taklit etmeyi"], correctAnswer: 0, explanation: "«Çok dinlesinler ve her gün çalışsınlar»." },
      { id: "l-b1-09-q5", level: "B1", topic: "Çıkarım", question: "Müzisyene göre her şeyi ne değiştirir?", options: ["Düzenli çalışma", "Şans", "Para", "Ün"], correctAnswer: 0, explanation: "«düzenli çalışma her şeyi değiştirir»." },
    ],
  },
  {
    id: "l-b1-10", level: "B1", topic: "Anons",
    title: "Havaalanı Anonsu",
    text: "Anons: Sayın yolcular, İstanbul'a gidecek olan TK1234 sefer sayılı uçağımızın yolcuları lütfen dikkat. Uçağımız hava koşulları nedeniyle kırk dakika gecikmeli kalkacaktır. Yeni kalkış saatimiz on dört otuztur. Yolcularımızın on dört sıfır sıfırda biniş kapısı B12'de hazır bulunmaları rica olunur. Anlayışınız için teşekkür ederiz.",
    questions: [
      { id: "l-b1-10-q1", level: "B1", topic: "Detay", question: "Uçak nereye gidiyor?", options: ["İstanbul'a", "Ankara'ya", "İzmir'e", "Antalya'ya"], correctAnswer: 0, explanation: "«İstanbul'a gidecek olan … uçağımız»." },
      { id: "l-b1-10-q2", level: "B1", topic: "Detay", question: "Uçak neden gecikiyor?", options: ["Hava koşulları nedeniyle", "Teknik arıza", "Yolcu eksikliği", "Grev"], correctAnswer: 0, explanation: "«hava koşulları nedeniyle … gecikmeli»." },
      { id: "l-b1-10-q3", level: "B1", topic: "Detay", question: "Ne kadar gecikme var?", options: ["Kırk dakika", "Bir saat", "Yirmi dakika", "İki saat"], correctAnswer: 0, explanation: "«kırk dakika gecikmeli»." },
      { id: "l-b1-10-q4", level: "B1", topic: "Detay", question: "Yeni kalkış saati nedir?", options: ["14:30", "14:00", "13:30", "15:00"], correctAnswer: 0, explanation: "«Yeni kalkış saatimiz on dört otuz»." },
      { id: "l-b1-10-q5", level: "B1", topic: "Detay", question: "Biniş kapısı hangisi?", options: ["B12", "A12", "B21", "C12"], correctAnswer: 0, explanation: "«biniş kapısı B12'de»." },
    ],
  },
  {
    id: "l-b2-05", level: "B2", topic: "Üniversite dersi",
    title: "Tarih Dersi: İpek Yolu",
    text: "Hocam: Bugün İpek Yolu'ndan bahsedeceğiz. İpek Yolu, yalnızca bir ticaret güzergâhı değildi; aynı zamanda kültürlerin, dinlerin ve fikirlerin de taşındığı bir köprüydü. Çin'den başlayıp Avrupa'ya uzanan bu yol boyunca ipek, baharat ve değerli taşlar taşınırdı. Ancak belki de en önemli alışveriş, mallar değil, bilgiydi. Kâğıt yapımı, pusula gibi buluşlar bu yol sayesinde dünyaya yayıldı. İpek Yolu, küreselleşmenin çok eski bir biçimi olarak görülebilir.",
    questions: [
      { id: "l-b2-05-q1", level: "B2", topic: "Detay", question: "İpek Yolu sadece ne değildi?", options: ["Bir ticaret güzergâhı", "Bir nehir", "Bir şehir", "Bir dağ"], correctAnswer: 0, explanation: "«yalnızca bir ticaret güzergâhı değildi»." },
      { id: "l-b2-05-q2", level: "B2", topic: "Detay", question: "Yol nereden nereye uzanıyordu?", options: ["Çin'den Avrupa'ya", "Afrika'dan Asya'ya", "Amerika'dan Çin'e", "Avrupa'dan Afrika'ya"], correctAnswer: 0, explanation: "«Çin'den başlayıp Avrupa'ya uzanan»." },
      { id: "l-b2-05-q3", level: "B2", topic: "Çıkarım", question: "Hocaya göre en önemli alışveriş neydi?", options: ["Bilgi", "İpek", "Baharat", "Altın"], correctAnswer: 0, explanation: "«en önemli alışveriş, mallar değil, bilgiydi»." },
      { id: "l-b2-05-q4", level: "B2", topic: "Detay", question: "Hangi buluş bu yolla yayıldı?", options: ["Kâğıt yapımı ve pusula", "Telefon", "Otomobil", "Elektrik"], correctAnswer: 0, explanation: "«Kâğıt yapımı, pusula gibi buluşlar»." },
      { id: "l-b2-05-q5", level: "B2", topic: "Çıkarım", question: "İpek Yolu neyin eski biçimi sayılır?", options: ["Küreselleşmenin", "Savaşın", "Tarımın", "Sanayinin"], correctAnswer: 0, explanation: "«küreselleşmenin çok eski bir biçimi»." },
    ],
  },
  {
    id: "l-c1-05", level: "C1", topic: "Panel",
    title: "Medya Okuryazarlığı",
    text: "Moderatör: Sayın hocam, medya okuryazarlığı neden bu kadar kritik hâle geldi?\nUzman: Çünkü artık herkes bir içerik üreticisi. Eskiden bilgi, editoryal denetimden geçen sınırlı kaynaklardan gelirdi; bugün ise doğrulanmamış milyonlarca içerik anında dolaşıma giriyor. Medya okuryazarlığı, bu içeriklerin ardındaki niyeti, kaynağı ve olası önyargıları görebilme yetisidir.\nModeratör: Bunu nasıl geliştirebiliriz?\nUzman: Eğitimle. Öğrencilere küçük yaştan itibaren bir haberi sorgulamayı, kaynak teyit etmeyi öğretmeliyiz. Ancak bu, ömür boyu süren bir beceridir; yalnızca gençleri değil, her yaştan bireyi ilgilendirir.",
    questions: [
      { id: "l-c1-05-q1", level: "C1", topic: "Çıkarım", question: "Medya okuryazarlığı neden kritik oldu?", options: ["Herkes içerik üreticisi olduğu için", "İnternet pahalı olduğu için", "Gazeteler kapandığı için", "Kitaplar arttığı için"], correctAnswer: 0, explanation: "«artık herkes bir içerik üreticisi»." },
      { id: "l-c1-05-q2", level: "C1", topic: "Detay", question: "Eskiden bilgi nereden gelirdi?", options: ["Editoryal denetimden geçen sınırlı kaynaklardan", "Sosyal medyadan", "Herkesten", "Hiçbir yerden"], correctAnswer: 0, explanation: "«editoryal denetimden geçen sınırlı kaynaklardan»." },
      { id: "l-c1-05-q3", level: "C1", topic: "Detay", question: "Medya okuryazarlığı hangi yetidir?", options: ["Niyet, kaynak ve önyargıyı görme", "Hızlı yazma", "Çok paylaşma", "Ezberleme"], correctAnswer: 0, explanation: "«ardındaki niyeti, kaynağı ve olası önyargıları görebilme yetisidir»." },
      { id: "l-c1-05-q4", level: "C1", topic: "Çıkarım", question: "Bu beceri nasıl geliştirilir?", options: ["Eğitimle", "Yasakla", "Para ile", "Beklemekle"], correctAnswer: 0, explanation: "«Eğitimle»." },
      { id: "l-c1-05-q5", level: "C1", topic: "Çıkarım", question: "Bu beceri kimi ilgilendirir?", options: ["Her yaştan bireyi", "Sadece gençleri", "Sadece gazetecileri", "Sadece öğretmenleri"], correctAnswer: 0, explanation: "«her yaştan bireyi ilgilendirir»." },
    ],
  },

  /* --------------------------- Batch 5 --------------------------- */
  {
    id: "l-a1-09", level: "A1", topic: "Tanışma",
    title: "Sınıfta Tanışma",
    text: "Öğretmen: Merhaba, ben yeni öğretmeniniz. Adım Deniz.\nÖğrenci: Merhaba öğretmenim. Ben Lina.\nÖğretmen: Memnun oldum Lina. Nerelisin?\nÖğrenci: Almanya'dan geldim ama annem Türk.\nÖğretmen: Çok güzel. Türkçeyi neden öğreniyorsun?\nÖğrenci: Akrabalarımla daha iyi konuşmak için.",
    questions: [
      { id: "l-a1-09-q1", level: "A1", topic: "Detay", question: "Öğretmenin adı ne?", options: ["Deniz", "Lina", "Ali", "Ayşe"], correctAnswer: 0, explanation: "«Adım Deniz»." },
      { id: "l-a1-09-q2", level: "A1", topic: "Detay", question: "Lina nereden geldi?", options: ["Almanya'dan", "Fransa'dan", "Türkiye'den", "İtalya'dan"], correctAnswer: 0, explanation: "«Almanya'dan geldim»." },
      { id: "l-a1-09-q3", level: "A1", topic: "Detay", question: "Lina'nın annesi nereli?", options: ["Türk", "Alman", "Fransız", "İtalyan"], correctAnswer: 0, explanation: "«annem Türk»." },
      { id: "l-a1-09-q4", level: "A1", topic: "Çıkarım", question: "Lina neden Türkçe öğreniyor?", options: ["Akrabalarıyla konuşmak için", "İş için", "Sınav için", "Tatil için"], correctAnswer: 0, explanation: "«Akrabalarımla daha iyi konuşmak için»." },
      { id: "l-a1-09-q5", level: "A1", topic: "Detay", question: "Konuşma nerede geçiyor?", options: ["Sınıfta", "Evde", "Markette", "Parkta"], correctAnswer: 0, explanation: "Учитель и ученик — в классе." },
    ],
  },
  {
    id: "l-a2-11", level: "A2", topic: "Alışveriş",
    title: "Kıyafet Mağazasında",
    text: "Müşteri: Merhaba, bu kazağın başka rengi var mı?\nGörevli: Evet, mavi ve siyah da var. Hangi bedeni istiyorsunuz?\nMüşteri: Medium lütfen. Deneyebilir miyim?\nGörevli: Tabii, kabinler şu tarafta.\nMüşteri: Mavisini aldım, çok beğendim. Fiyatı ne kadar?\nGörevli: İndirimde, iki yüz lira.",
    questions: [
      { id: "l-a2-11-q1", level: "A2", topic: "Detay", question: "Müşteri ne arıyor?", options: ["Kazağın başka rengini", "Ayakkabı", "Pantolon", "Çanta"], correctAnswer: 0, explanation: "«bu kazağın başka rengi var mı?»." },
      { id: "l-a2-11-q2", level: "A2", topic: "Detay", question: "Hangi renkler var?", options: ["Mavi ve siyah", "Kırmızı ve yeşil", "Sarı ve beyaz", "Mor ve pembe"], correctAnswer: 0, explanation: "«mavi ve siyah da var»." },
      { id: "l-a2-11-q3", level: "A2", topic: "Detay", question: "Müşteri hangi bedeni istiyor?", options: ["Medium", "Small", "Large", "XL"], correctAnswer: 0, explanation: "«Medium lütfen»." },
      { id: "l-a2-11-q4", level: "A2", topic: "Detay", question: "Hangi rengi aldı?", options: ["Mavi", "Siyah", "Kırmızı", "Hiçbiri"], correctAnswer: 0, explanation: "«Mavisini aldım»." },
      { id: "l-a2-11-q5", level: "A2", topic: "Detay", question: "Kazak ne kadar?", options: ["İki yüz lira", "Yüz lira", "Üç yüz lira", "Elli lira"], correctAnswer: 0, explanation: "«İndirimde, iki yüz lira»." },
    ],
  },
  {
    id: "l-a2-12", level: "A2", topic: "Günlük plan",
    title: "Akşam Yemeği Daveti",
    text: "Selin: Cumartesi akşamı bize gelir misin? Küçük bir yemek yapıyorum.\nKaan: Memnuniyetle! Ne getireyim?\nSelin: Hiçbir şey getirme, sadece kendin gel. Ama tatlı seversen…\nKaan: O zaman bir tatlı alırım. Saat kaçta?\nSelin: Sekiz gibi. Birkaç arkadaş daha gelecek.\nKaan: Harika, görüşürüz.",
    questions: [
      { id: "l-a2-12-q1", level: "A2", topic: "Detay", question: "Selin ne zaman davet ediyor?", options: ["Cumartesi akşamı", "Pazar öğlen", "Cuma sabahı", "Pazartesi"], correctAnswer: 0, explanation: "«Cumartesi akşamı bize gelir misin?»." },
      { id: "l-a2-12-q2", level: "A2", topic: "Detay", question: "Selin ne yapıyor?", options: ["Yemek", "Parti", "Toplantı", "Sınav"], correctAnswer: 0, explanation: "«Küçük bir yemek yapıyorum»." },
      { id: "l-a2-12-q3", level: "A2", topic: "Detay", question: "Kaan ne getirecek?", options: ["Tatlı", "İçecek", "Hiçbir şey", "Çiçek"], correctAnswer: 0, explanation: "«bir tatlı alırım»." },
      { id: "l-a2-12-q4", level: "A2", topic: "Detay", question: "Saat kaçta?", options: ["Sekiz gibi", "Yedi", "Dokuz", "Altı"], correctAnswer: 0, explanation: "«Sekiz gibi»." },
      { id: "l-a2-12-q5", level: "A2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Sadece Kaan gelecek.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«Birkaç arkadaş daha gelecek»." },
    ],
  },
  {
    id: "l-b1-11", level: "B1", topic: "Radyo programı",
    title: "Şehir Bisikleti Projesi",
    text: "Sunucu: Belediyemizden yeni bir haber var. Konuğumuz proje sorumlusu. Bu bisiklet projesi nasıl işliyor?\nKonuk: Şehrin farklı noktalarına bisiklet istasyonları kurduk. İnsanlar uygulamadan bir bisiklet kiralayıp istediği istasyona bırakabiliyor.\nSunucu: Ücret nasıl?\nKonuk: İlk yarım saat ücretsiz. Sonrası çok uygun. Amacımız hem trafiği azaltmak hem de sağlıklı ulaşımı teşvik etmek.\nSunucu: Şimdiye kadar ilgi nasıl?\nKonuk: Beklediğimizden çok daha fazla. İlk ayda on bin kayıt aldık.",
    questions: [
      { id: "l-b1-11-q1", level: "B1", topic: "Detay", question: "Proje neyle ilgili?", options: ["Şehir bisikleti", "Metro", "Park", "Köprü"], correctAnswer: 0, explanation: "«bisiklet projesi»." },
      { id: "l-b1-11-q2", level: "B1", topic: "Detay", question: "Bisiklet nasıl kiralanıyor?", options: ["Uygulamadan", "Bilet gişesinden", "Telefonla", "Postayla"], correctAnswer: 0, explanation: "«uygulamadan bir bisiklet kiralayıp»." },
      { id: "l-b1-11-q3", level: "B1", topic: "Detay", question: "İlk yarım saat ne kadar?", options: ["Ücretsiz", "On lira", "Yüz lira", "Beş lira"], correctAnswer: 0, explanation: "«İlk yarım saat ücretsiz»." },
      { id: "l-b1-11-q4", level: "B1", topic: "Çıkarım", question: "Projenin amacı nedir?", options: ["Trafiği azaltmak ve sağlıklı ulaşım", "Para kazanmak", "Reklam yapmak", "Turist çekmek"], correctAnswer: 0, explanation: "«trafiği azaltmak hem de sağlıklı ulaşımı teşvik etmek»." },
      { id: "l-b1-11-q5", level: "B1", topic: "Detay", question: "İlk ayda kaç kayıt aldılar?", options: ["On bin", "Bin", "Yüz", "Yüz bin"], correctAnswer: 0, explanation: "«İlk ayda on bin kayıt aldık»." },
    ],
  },
  {
    id: "l-b1-12", level: "B1", topic: "Üniversite dersi",
    title: "Sunum Becerileri",
    text: "Hocam: Bugün etkili sunum yapmanın inceliklerini konuşacağız. İyi bir sunum, güçlü bir başlangıçla başlar. Dinleyicinin dikkatini ilk otuz saniyede çekmelisiniz. İkincisi, slaytlarınızı metinle doldurmayın; görseller her zaman daha akılda kalıcıdır. Üçüncüsü, prova yapın. En iyi konuşmacılar bile defalarca alıştırma yapar. Son olarak, göz teması kurun ve dinleyiciye bir hikâye anlatır gibi konuşun.",
    questions: [
      { id: "l-b1-12-q1", level: "B1", topic: "Detay", question: "İyi bir sunum nasıl başlar?", options: ["Güçlü bir başlangıçla", "Bir özürle", "Bir soruyla", "Sessizlikle"], correctAnswer: 0, explanation: "«güçlü bir başlangıçla başlar»." },
      { id: "l-b1-12-q2", level: "B1", topic: "Detay", question: "Dikkat ne zaman çekilmeli?", options: ["İlk otuz saniyede", "Sonunda", "Ortada", "Hiç"], correctAnswer: 0, explanation: "«ilk otuz saniyede çekmelisiniz»." },
      { id: "l-b1-12-q3", level: "B1", topic: "Çıkarım", question: "Slaytlar hakkında ne öneriliyor?", options: ["Metinle doldurmamak", "Çok yazı koymak", "Hiç görsel kullanmamak", "Renk kullanmamak"], correctAnswer: 0, explanation: "«slaytlarınızı metinle doldurmayın; görseller … akılda kalıcı»." },
      { id: "l-b1-12-q4", level: "B1", topic: "Detay", question: "İyi konuşmacılar ne yapar?", options: ["Defalarca prova yapar", "Hiç hazırlanmaz", "Slayt okur", "Hızlı konuşur"], correctAnswer: 0, explanation: "«defalarca alıştırma yapar»." },
      { id: "l-b1-12-q5", level: "B1", topic: "Detay", question: "Dinleyiciyle nasıl konuşulmalı?", options: ["Hikâye anlatır gibi", "Sıkıcı bir şekilde", "Çok hızlı", "Fısıldayarak"], correctAnswer: 0, explanation: "«bir hikâye anlatır gibi konuşun»." },
    ],
  },
  {
    id: "l-b2-06", level: "B2", topic: "Röportaj",
    title: "Bir Girişimciyle Söyleşi",
    text: "Sunucu: Şirketinizi sıfırdan kurdunuz. En büyük zorluk neydi?\nGirişimci: Başlangıçta kimse fikrimize inanmadı. Yatırım bulmak çok zordu. Birçok kapı yüzümüze kapandı.\nSunucu: Pes etmeyi hiç düşündünüz mü?\nGirişimci: Açıkçası evet. Ama bir başarısızlığın son değil, bir ders olduğunu öğrendim. Hatalarımızdan en çok şeyi öğrendik.\nSunucu: Yeni girişimcilere tavsiyeniz?\nGirişimci: Müşteriyi dinleyin. Ürününüzü onların gerçek ihtiyacına göre şekillendirin.",
    questions: [
      { id: "l-b2-06-q1", level: "B2", topic: "Detay", question: "Başlangıçtaki en büyük zorluk neydi?", options: ["Yatırım bulmak", "Ofis kiralamak", "Çalışan bulmak", "Reklam yapmak"], correctAnswer: 0, explanation: "«Yatırım bulmak çok zordu»." },
      { id: "l-b2-06-q2", level: "B2", topic: "Çıkarım", question: "Girişimci başarısızlık hakkında ne öğrendi?", options: ["Son değil, bir ders olduğunu", "Her şeyin bittiğini", "Önemsiz olduğunu", "Kaçınılmaz olduğunu"], correctAnswer: 0, explanation: "«başarısızlığın son değil, bir ders olduğunu»." },
      { id: "l-b2-06-q3", level: "B2", topic: "Detay", question: "En çok neyden öğrendiler?", options: ["Hatalarından", "Kitaplardan", "Rakiplerden", "Şanstan"], correctAnswer: 0, explanation: "«Hatalarımızdan en çok şeyi öğrendik»." },
      { id: "l-b2-06-q4", level: "B2", topic: "Çıkarım", question: "Yeni girişimcilere ne tavsiye ediyor?", options: ["Müşteriyi dinlemeyi", "Hızlı büyümeyi", "Çok harcamayı", "Risk almamayı"], correctAnswer: 0, explanation: "«Müşteriyi dinleyin»." },
      { id: "l-b2-06-q5", level: "B2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Herkes fikrine hemen inandı.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«kimse fikrimize inanmadı»." },
    ],
  },
  {
    id: "l-b2-07", level: "B2", topic: "Haber analizi",
    title: "Dijital Detoks",
    text: "Spiker: Son yıllarda 'dijital detoks' kavramı giderek popülerleşiyor. Uzmanlarımıza göre, sürekli bildirim akışı beynimizi yoruyor ve odaklanma süremizi kısaltıyor. Bazı oteller, misafirlerine telefonsuz tatil paketleri sunmaya başladı bile. Araştırmalar, ekran molası veren kişilerin daha iyi uyuduğunu ve kendilerini daha sakin hissettiğini gösteriyor. Ancak uzmanlar, amacın teknolojiyi tamamen reddetmek değil, onunla sağlıklı bir ilişki kurmak olduğunu vurguluyor.",
    questions: [
      { id: "l-b2-07-q1", level: "B2", topic: "Detay", question: "Hangi kavram popülerleşiyor?", options: ["Dijital detoks", "Hızlı moda", "Uzaktan çalışma", "Akıllı ev"], correctAnswer: 0, explanation: "«'dijital detoks' kavramı … popülerleşiyor»." },
      { id: "l-b2-07-q2", level: "B2", topic: "Çıkarım", question: "Sürekli bildirim ne yapıyor?", options: ["Beyni yorup odağı kısaltıyor", "Hafızayı güçlendiriyor", "Uykuyu artırıyor", "Hiçbir şey"], correctAnswer: 0, explanation: "«beynimizi yoruyor ve odaklanma süremizi kısaltıyor»." },
      { id: "l-b2-07-q3", level: "B2", topic: "Detay", question: "Bazı oteller ne sunuyor?", options: ["Telefonsuz tatil paketleri", "Ücretsiz internet", "Daha çok ekran", "Bilgisayar"], correctAnswer: 0, explanation: "«telefonsuz tatil paketleri sunmaya başladı»." },
      { id: "l-b2-07-q4", level: "B2", topic: "Detay", question: "Ekran molası verenler nasıl hissediyor?", options: ["Daha sakin ve iyi uyuyor", "Daha gergin", "Daha yorgun", "Aynı"], correctAnswer: 0, explanation: "«daha iyi uyuduğunu ve … daha sakin hissettiğini»." },
      { id: "l-b2-07-q5", level: "B2", topic: "Çıkarım", question: "Uzmanlara göre amaç nedir?", options: ["Teknolojiyle sağlıklı ilişki kurmak", "Teknolojiyi tamamen reddetmek", "Daha çok ekran", "Hiç telefon kullanmamak"], correctAnswer: 0, explanation: "«onunla sağlıklı bir ilişki kurmak»." },
    ],
  },
  {
    id: "l-c1-06", level: "C1", topic: "Konferans",
    title: "Şehirlerde Biyoçeşitlilik",
    text: "Konuşmacı: Şehirleri genellikle betonla, doğayı ise onun dışında bir yerde hayal ederiz. Oysa kentler, şaşırtıcı derecede zengin bir biyoçeşitliliğe ev sahipliği yapabilir. Parklar, çatı bahçeleri ve hatta yol kenarındaki bitkiler, kuşlar ve böcekler için yaşam alanı sunar. Sorun şu ki, plansız kentleşme bu kırılgan ekosistemleri yok ediyor. Oysa biraz farkındalıkla, kent planlamasına doğayı dâhil etmek mümkün. Yeşil koridorlar oluşturmak, yerel bitki türlerini tercih etmek ve böcek dostu alanlar yaratmak, hem ekolojik hem de psikolojik açıdan kentleri daha yaşanabilir kılar.",
    questions: [
      { id: "l-c1-06-q1", level: "C1", topic: "Çıkarım", question: "Konuşmacının çürüttüğü yaygın inanış nedir?", options: ["Doğanın şehirlerin dışında olduğu", "Şehirlerin temiz olduğu", "Parkların gereksizliği", "Betonun faydası"], correctAnswer: 0, explanation: "«doğayı … onun dışında bir yerde hayal ederiz. Oysa kentler … biyoçeşitliliğe ev sahipliği yapabilir»." },
      { id: "l-c1-06-q2", level: "C1", topic: "Detay", question: "Kentlerde hangileri yaşam alanı sunar?", options: ["Parklar ve çatı bahçeleri", "Sadece ormanlar", "Sadece nehirler", "Hiçbiri"], correctAnswer: 0, explanation: "«Parklar, çatı bahçeleri ve hatta yol kenarındaki bitkiler»." },
      { id: "l-c1-06-q3", level: "C1", topic: "Çıkarım", question: "Bu ekosistemleri ne yok ediyor?", options: ["Plansız kentleşme", "Yağmur", "Turistler", "Parklar"], correctAnswer: 0, explanation: "«plansız kentleşme bu kırılgan ekosistemleri yok ediyor»." },
      { id: "l-c1-06-q4", level: "C1", topic: "Detay", question: "Hangi öneri sunuluyor?", options: ["Yeşil koridorlar ve yerel türler", "Daha çok beton", "Daha az park", "Böcek ilaçları"], correctAnswer: 0, explanation: "«Yeşil koridorlar oluşturmak, yerel bitki türlerini tercih etmek»." },
      { id: "l-c1-06-q5", level: "C1", topic: "Çıkarım", question: "Bu önlemler kentleri nasıl yapar?", options: ["Daha yaşanabilir", "Daha pahalı", "Daha kalabalık", "Daha gürültülü"], correctAnswer: 0, explanation: "«kentleri daha yaşanabilir kılar»." },
    ],
  },
  {
    id: "l-c1-07", level: "C1", topic: "Akademik konuşma",
    title: "Belleğin Yanılgıları",
    text: "Konuşmacı: Belleğimizin, geçmişi bir video kaydı gibi sadakatle sakladığını düşünme eğilimindeyiz. Oysa bilişsel bilim bize tam tersini gösteriyor: bellek, her hatırlayışta yeniden inşa edilen, kırılgan ve değişken bir süreçtir. Bir olayı her anımsadığımızda, onu aslında biraz değiştiririz; sonraki bilgiler, duygular ve hatta başkalarının anlatımları anılarımıza sızar. Bu nedenle 'sahte anılar' şaşırtıcı derecede yaygındır; insanlar hiç yaşamadıkları olayları büyük bir kesinlikle hatırlayabilir. Bu bulgu, özellikle hukuk alanında, görgü tanığı ifadelerine duyduğumuz güveni yeniden sorgulamamızı gerektiriyor.",
    questions: [
      { id: "l-c1-07-q1", level: "C1", topic: "Çıkarım", question: "Belleğe dair yaygın yanlış inanış nedir?", options: ["Video gibi sadık olduğu", "Hiç çalışmadığı", "Çok hızlı olduğu", "Önemsiz olduğu"], correctAnswer: 0, explanation: "«geçmişi bir video kaydı gibi sadakatle sakladığını düşünme eğilimi»." },
      { id: "l-c1-07-q2", level: "C1", topic: "Detay", question: "Bilişsel bilime göre bellek nasıldır?", options: ["Yeniden inşa edilen, değişken", "Sabit ve kusursuz", "Sınırsız", "Kalıcı"], correctAnswer: 0, explanation: "«her hatırlayışta yeniden inşa edilen, kırılgan ve değişken»." },
      { id: "l-c1-07-q3", level: "C1", topic: "Çıkarım", question: "Bir olayı hatırladığımızda ne olur?", options: ["Onu biraz değiştiririz", "Aynen korunur", "Tamamen silinir", "Güçlenir"], correctAnswer: 0, explanation: "«onu aslında biraz değiştiririz»." },
      { id: "l-c1-07-q4", level: "C1", topic: "Detay", question: "'Sahte anılar' hakkında ne söyleniyor?", options: ["Şaşırtıcı derecede yaygın", "Çok nadir", "İmkânsız", "Zararsız"], correctAnswer: 0, explanation: "«'sahte anılar' şaşırtıcı derecede yaygındır»." },
      { id: "l-c1-07-q5", level: "C1", topic: "Çıkarım", question: "Bu bulgu hangi alanda önemli?", options: ["Hukukta (görgü tanığı)", "Sporda", "Tarımda", "Mimaride"], correctAnswer: 0, explanation: "«hukuk alanında, görgü tanığı ifadelerine duyduğumuz güveni … sorgulamamızı gerektiriyor»." },
    ],
  },

  /* --------------------------- Batch 6 --------------------------- */
  {
    id: "l-a1-10", level: "A1", topic: "Saat sorma",
    title: "Saat Kaç?",
    text: "Ali: Affedersin, saat kaç?\nMerve: Saat üç buçuk.\nAli: Teşekkürler. Otobüs ne zaman geliyor?\nMerve: Sanırım dört gibi.\nAli: Yarım saatimiz var o zaman.\nMerve: Evet, istersen bir çay içelim.",
    questions: [
      { id: "l-a1-10-q1", level: "A1", topic: "Detay", question: "Saat kaç?", options: ["Üç buçuk", "Dört", "Beş", "İki"], correctAnswer: 0, explanation: "«Saat üç buçuk»." },
      { id: "l-a1-10-q2", level: "A1", topic: "Detay", question: "Otobüs ne zaman geliyor?", options: ["Dört gibi", "Üçte", "Beşte", "Hemen"], correctAnswer: 0, explanation: "«dört gibi»." },
      { id: "l-a1-10-q3", level: "A1", topic: "Detay", question: "Ne kadar zamanları var?", options: ["Yarım saat", "Bir saat", "İki saat", "Hiç"], correctAnswer: 0, explanation: "«Yarım saatimiz var»." },
      { id: "l-a1-10-q4", level: "A1", topic: "Detay", question: "Merve ne öneriyor?", options: ["Çay içmeyi", "Yürümeyi", "Eve gitmeyi", "Yemek yemeyi"], correctAnswer: 0, explanation: "«bir çay içelim»." },
      { id: "l-a1-10-q5", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Otobüs hemen geliyor.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«dört gibi» — позже, не сразу." },
    ],
  },
  {
    id: "l-a2-13", level: "A2", topic: "Bankada",
    title: "Hesap Açma",
    text: "Müşteri: Merhaba, hesap açmak istiyorum.\nGörevli: Tabii, kimliğiniz yanınızda mı?\nMüşteri: Evet, buyurun.\nGörevli: Maaş hesabı mı yoksa vadeli hesap mı?\nMüşteri: Maaş hesabı olsun. Banka kartı da verilecek mi?\nGörevli: Evet, kartınız bir hafta içinde adresinize gelecek.",
    questions: [
      { id: "l-a2-13-q1", level: "A2", topic: "Detay", question: "Müşteri ne yapmak istiyor?", options: ["Hesap açmak", "Para çekmek", "Kredi almak", "Şikâyet etmek"], correctAnswer: 0, explanation: "«hesap açmak istiyorum»." },
      { id: "l-a2-13-q2", level: "A2", topic: "Detay", question: "Görevli ne istiyor?", options: ["Kimlik", "Para", "İmza defteri", "Fotoğraf"], correctAnswer: 0, explanation: "«kimliğiniz yanınızda mı?»." },
      { id: "l-a2-13-q3", level: "A2", topic: "Detay", question: "Müşteri hangi hesabı açıyor?", options: ["Maaş hesabı", "Vadeli hesap", "Döviz hesabı", "Hiçbiri"], correctAnswer: 0, explanation: "«Maaş hesabı olsun»." },
      { id: "l-a2-13-q4", level: "A2", topic: "Detay", question: "Kart ne zaman gelecek?", options: ["Bir hafta içinde", "Hemen", "Bir ay sonra", "Yarın"], correctAnswer: 0, explanation: "«bir hafta içinde adresinize gelecek»." },
      { id: "l-a2-13-q5", level: "A2", topic: "Detay", question: "Banka kartı verilecek mi?", options: ["Evet", "Hayır", "Belli değil", "Ücretli"], correctAnswer: 0, explanation: "«Evet, kartınız … gelecek»." },
    ],
  },
  {
    id: "l-a2-14", level: "A2", topic: "Seyahat acentesi",
    title: "Tatil Planı",
    text: "Müşteri: Merhaba, yaz için uygun bir tatil arıyorum.\nGörevli: Deniz mi yoksa doğa mı tercih edersiniz?\nMüşteri: Deniz olsun, ama çok kalabalık olmasın.\nGörevli: O zaman size sakin bir sahil kasabası öneririm. Beş gece, kahvaltı dahil.\nMüşteri: Fiyatı uygun mu?\nGörevli: Erken rezervasyon indirimi var, oldukça uygun.",
    questions: [
      { id: "l-a2-14-q1", level: "A2", topic: "Detay", question: "Müşteri ne arıyor?", options: ["Yaz tatili", "İş", "Ev", "Araba"], correctAnswer: 0, explanation: "«yaz için uygun bir tatil»." },
      { id: "l-a2-14-q2", level: "A2", topic: "Detay", question: "Neyi tercih ediyor?", options: ["Deniz", "Doğa", "Dağ", "Şehir"], correctAnswer: 0, explanation: "«Deniz olsun»." },
      { id: "l-a2-14-q3", level: "A2", topic: "Detay", question: "Nasıl bir yer istiyor?", options: ["Kalabalık olmayan", "Çok kalabalık", "Pahalı", "Uzak"], correctAnswer: 0, explanation: "«çok kalabalık olmasın»." },
      { id: "l-a2-14-q4", level: "A2", topic: "Detay", question: "Kaç gece öneriliyor?", options: ["Beş gece", "Üç gece", "Bir hafta", "On gece"], correctAnswer: 0, explanation: "«Beş gece, kahvaltı dahil»." },
      { id: "l-a2-14-q5", level: "A2", topic: "Detay", question: "Neden fiyat uygun?", options: ["Erken rezervasyon indirimi", "Tatil bitti", "Yer kötü", "Sezon dışı"], correctAnswer: 0, explanation: "«Erken rezervasyon indirimi var»." },
    ],
  },
  {
    id: "l-b1-13", level: "B1", topic: "Röportaj",
    title: "Bir Aşçıyla Söyleşi",
    text: "Sunucu: Yıllardır ünlü bir restoranda baş aşçısınız. Bu mesleğe nasıl başladınız?\nAşçı: Çocukken anneannemin mutfağında büyüdüm. Yemek yapmak benim için her zaman bir sevgi göstergesiydi.\nSunucu: İyi bir yemeğin sırrı nedir?\nAşçı: Taze ve kaliteli malzeme. Karmaşık tarifler her zaman daha iyi değildir; bazen basit bir yemek en çok mutluluğu verir.\nSunucu: Genç aşçılara ne söylersiniz?\nAşçı: Sabırlı olsunlar ve denemekten korkmasınlar. Mutfak, sürekli öğrenilen bir yerdir.",
    questions: [
      { id: "l-b1-13-q1", level: "B1", topic: "Detay", question: "Konuğun mesleği nedir?", options: ["Baş aşçı", "Garson", "Müzisyen", "Doktor"], correctAnswer: 0, explanation: "«baş aşçısınız»." },
      { id: "l-b1-13-q2", level: "B1", topic: "Detay", question: "Nerede büyüdü?", options: ["Anneannesinin mutfağında", "Bir okulda", "Yurt dışında", "Bir restoranda"], correctAnswer: 0, explanation: "«anneannemin mutfağında büyüdüm»." },
      { id: "l-b1-13-q3", level: "B1", topic: "Detay", question: "İyi yemeğin sırrı nedir?", options: ["Taze ve kaliteli malzeme", "Pahalı tabak", "Karmaşık tarif", "Çok baharat"], correctAnswer: 0, explanation: "«Taze ve kaliteli malzeme»." },
      { id: "l-b1-13-q4", level: "B1", topic: "Çıkarım", question: "Karmaşık tarifler hakkında ne diyor?", options: ["Her zaman daha iyi değil", "En iyisi", "Gerekli", "Tek yol"], correctAnswer: 0, explanation: "«Karmaşık tarifler her zaman daha iyi değildir»." },
      { id: "l-b1-13-q5", level: "B1", topic: "Çıkarım", question: "Gençlere ne tavsiye ediyor?", options: ["Sabırlı olup denemeyi", "Acele etmeyi", "Risk almamayı", "Vazgeçmeyi"], correctAnswer: 0, explanation: "«Sabırlı olsunlar ve denemekten korkmasınlar»." },
    ],
  },
  {
    id: "l-b1-14", level: "B1", topic: "Duyuru",
    title: "Belediye Park Duyurusu",
    text: "Anons: Değerli hemşehrilerimiz, şehir merkezindeki Cumhuriyet Parkı, yenileme çalışmaları nedeniyle önümüzdeki iki hafta boyunca kapalı olacaktır. Bu süreçte yeni oyun alanları, yürüyüş yolları ve bisiklet parkurları eklenecektir. Çalışmalar tamamlandığında parkımız çok daha modern ve yeşil bir görünüme kavuşacak. Anlayışınız için teşekkür eder, açılış törenine tüm vatandaşlarımızı bekleriz.",
    questions: [
      { id: "l-b1-14-q1", level: "B1", topic: "Detay", question: "Hangi park kapanıyor?", options: ["Cumhuriyet Parkı", "Atatürk Parkı", "Sahil Parkı", "Millet Bahçesi"], correctAnswer: 0, explanation: "«Cumhuriyet Parkı … kapalı olacaktır»." },
      { id: "l-b1-14-q2", level: "B1", topic: "Detay", question: "Neden kapanıyor?", options: ["Yenileme çalışmaları", "Hava durumu", "Etkinlik", "Tehlike"], correctAnswer: 0, explanation: "«yenileme çalışmaları nedeniyle»." },
      { id: "l-b1-14-q3", level: "B1", topic: "Detay", question: "Ne kadar süre kapalı?", options: ["İki hafta", "Bir gün", "Bir ay", "Bir yıl"], correctAnswer: 0, explanation: "«iki hafta boyunca kapalı»." },
      { id: "l-b1-14-q4", level: "B1", topic: "Detay", question: "Ne eklenecek?", options: ["Oyun alanı ve bisiklet parkuru", "Otopark", "Bina", "Mağaza"], correctAnswer: 0, explanation: "«yeni oyun alanları, yürüyüş yolları ve bisiklet parkurları»." },
      { id: "l-b1-14-q5", level: "B1", topic: "Çıkarım", question: "Sonunda park nasıl olacak?", options: ["Daha modern ve yeşil", "Daha küçük", "Daha eski", "Kapalı"], correctAnswer: 0, explanation: "«çok daha modern ve yeşil bir görünüme»." },
    ],
  },
  {
    id: "l-b1-15", level: "B1", topic: "Podcast",
    title: "Para Biriktirme İpuçları",
    text: "Sunucu: Bugün tasarruf konusunu konuşuyoruz. Birçok kişi ay sonunu zor getiriyor. Ne öneriyorsunuz?\nUzman: İlk adım, harcamaları takip etmektir. Nereye ne kadar para gittiğini bilmeden tasarruf edemezsiniz. İkincisi, maaş gelir gelmez belli bir miktarı kenara ayırın; harcadıktan sonra kalanı biriktirmeye çalışmak nadiren işe yarar.\nSunucu: Küçük harcamalar da önemli mi?\nUzman: Kesinlikle. Her gün alınan bir kahve bile ay sonunda büyük bir tutar olabilir.\nSunucu: Çok yararlı, teşekkürler.",
    questions: [
      { id: "l-b1-15-q1", level: "B1", topic: "Detay", question: "Konu nedir?", options: ["Tasarruf", "Yatırım", "Seyahat", "Sağlık"], correctAnswer: 0, explanation: "«tasarruf konusunu konuşuyoruz»." },
      { id: "l-b1-15-q2", level: "B1", topic: "Detay", question: "İlk adım nedir?", options: ["Harcamaları takip etmek", "Kredi almak", "Daha çok çalışmak", "Harcamak"], correctAnswer: 0, explanation: "«İlk adım, harcamaları takip etmektir»." },
      { id: "l-b1-15-q3", level: "B1", topic: "Çıkarım", question: "Para ne zaman kenara ayrılmalı?", options: ["Maaş gelir gelmez", "Ay sonunda", "Harcadıktan sonra", "Hiç"], correctAnswer: 0, explanation: "«maaş gelir gelmez belli bir miktarı kenara ayırın»." },
      { id: "l-b1-15-q4", level: "B1", topic: "Çıkarım", question: "Kalanı biriktirmek nasıl?", options: ["Nadiren işe yarar", "Her zaman iyi", "Tek yol", "Kolay"], correctAnswer: 0, explanation: "«kalanı biriktirmeye çalışmak nadiren işe yarar»." },
      { id: "l-b1-15-q5", level: "B1", topic: "Detay", question: "Küçük harcamalar hakkında ne deniyor?", options: ["Ay sonunda büyük tutar olabilir", "Önemsizdir", "Hiç etkilemez", "İyidir"], correctAnswer: 0, explanation: "«ay sonunda büyük bir tutar olabilir»." },
    ],
  },
  {
    id: "l-b2-08", level: "B2", topic: "Üniversite dersi",
    title: "İklim ve Okyanuslar",
    text: "Hocam: Bugün okyanusların iklim üzerindeki rolünü ele alacağız. Okyanuslar, atmosferdeki karbondioksitin büyük bir kısmını emerek gezegeni dengeler; bu yüzden onlara çoğu zaman 'dünyanın akciğerleri' denir. Ancak bu emilim bedelsiz değil. Karbondioksit suda çözündüğünde okyanuslar asitleşiyor ve bu, mercan resifleri ile deniz canlıları için ciddi bir tehdit oluşturuyor. Yani okyanuslar bizi koruyor, ama biz onları korumadıkça bu denge bozulacak. Okyanus sağlığı, doğrudan kendi geleceğimizle bağlantılıdır.",
    questions: [
      { id: "l-b2-08-q1", level: "B2", topic: "Detay", question: "Okyanuslar neyi emiyor?", options: ["Karbondioksiti", "Oksijeni", "Tuzu", "Işığı"], correctAnswer: 0, explanation: "«karbondioksitin büyük bir kısmını emerek»." },
      { id: "l-b2-08-q2", level: "B2", topic: "Detay", question: "Okyanuslara ne deniyor?", options: ["Dünyanın akciğerleri", "Dünyanın kalbi", "Dünyanın gözü", "Dünyanın eli"], correctAnswer: 0, explanation: "«'dünyanın akciğerleri' denir»." },
      { id: "l-b2-08-q3", level: "B2", topic: "Çıkarım", question: "Karbondioksit çözününce ne olur?", options: ["Okyanuslar asitleşiyor", "Su tatlanıyor", "Deniz ısınmıyor", "Hiçbir şey"], correctAnswer: 0, explanation: "«okyanuslar asitleşiyor»." },
      { id: "l-b2-08-q4", level: "B2", topic: "Detay", question: "Bu neyi tehdit ediyor?", options: ["Mercan resifleri ve deniz canlıları", "Dağları", "Ormanları", "Çölleri"], correctAnswer: 0, explanation: "«mercan resifleri ile deniz canlıları için ciddi bir tehdit»." },
      { id: "l-b2-08-q5", level: "B2", topic: "Çıkarım", question: "Okyanus sağlığı neyle bağlantılı?", options: ["Kendi geleceğimizle", "Sadece balıkçılıkla", "Turizmle", "Hiçbir şeyle"], correctAnswer: 0, explanation: "«doğrudan kendi geleceğimizle bağlantılıdır»." },
    ],
  },
  {
    id: "l-b2-09", level: "B2", topic: "Röportaj",
    title: "Bir Yazılımcıyla Söyleşi",
    text: "Sunucu: Yazılım sektörü çok hızlı değişiyor. Güncel kalmak zor değil mi?\nYazılımcı: Çok zor. Bugün öğrendiğiniz bir teknoloji birkaç yıl sonra eskiyebiliyor. Bu yüzden sürekli öğrenmek bu mesleğin bir parçası.\nSunucu: Bu alana girmek isteyenlere ne önerirsiniz?\nYazılımcı: Sadece kod yazmayı değil, problem çözmeyi öğrensinler. Asıl önemli olan, bir soruna mantıklı yaklaşabilmek.\nSunucu: Yapay zekâ işinizi tehdit ediyor mu?\nYazılımcı: Tam tersine, iyi bir araç. Ama onu doğru kullanmayı bilmek gerekiyor.",
    questions: [
      { id: "l-b2-09-q1", level: "B2", topic: "Detay", question: "Yazılım sektörü nasıl?", options: ["Çok hızlı değişiyor", "Hiç değişmiyor", "Yavaş", "Durgun"], correctAnswer: 0, explanation: "«çok hızlı değişiyor»." },
      { id: "l-b2-09-q2", level: "B2", topic: "Çıkarım", question: "Neden sürekli öğrenmek gerekiyor?", options: ["Teknoloji eskiyebiliyor", "Maaş için", "Eğlence için", "Zorunlu olduğu için"], correctAnswer: 0, explanation: "«birkaç yıl sonra eskiyebiliyor»." },
      { id: "l-b2-09-q3", level: "B2", topic: "Detay", question: "Neyi öğrenmeyi öneriyor?", options: ["Problem çözmeyi", "Sadece kod yazmayı", "Hızlı yazmayı", "Ezberlemeyi"], correctAnswer: 0, explanation: "«problem çözmeyi öğrensinler»." },
      { id: "l-b2-09-q4", level: "B2", topic: "Çıkarım", question: "Yapay zekâ hakkında ne düşünüyor?", options: ["İyi bir araç", "Büyük tehdit", "Gereksiz", "Tehlikeli"], correctAnswer: 0, explanation: "«Tam tersine, iyi bir araç»." },
      { id: "l-b2-09-q5", level: "B2", topic: "Detay", question: "Yapay zekâ için ne gerekiyor?", options: ["Doğru kullanmayı bilmek", "Hiç kullanmamak", "Korkmak", "Yasaklamak"], correctAnswer: 0, explanation: "«onu doğru kullanmayı bilmek gerekiyor»." },
    ],
  },
  {
    id: "l-b2-10", level: "B2", topic: "Haber analizi",
    title: "Sürdürülebilir Turizm",
    text: "Spiker: Popüler turizm bölgeleri, son yıllarda 'aşırı turizm' sorunuyla mücadele ediyor. Çok sayıda ziyaretçi, yerel halkın yaşam kalitesini düşürüyor ve doğal alanlara zarar veriyor. Bazı şehirler bu nedenle günlük ziyaretçi sayısını sınırlamaya başladı. Uzmanlar, çözümün turizmi tamamen durdurmak değil, daha sürdürülebilir bir modele geçmek olduğunu söylüyor. Bu da ziyaretçileri yılın farklı dönemlerine yaymayı ve yerel ekonomiye gerçek katkı sağlayan turizm biçimlerini desteklemeyi içeriyor.",
    questions: [
      { id: "l-b2-10-q1", level: "B2", topic: "Detay", question: "Hangi sorun yaşanıyor?", options: ["Aşırı turizm", "Turist eksikliği", "Yüksek fiyat", "Kötü hava"], correctAnswer: 0, explanation: "«'aşırı turizm' sorunuyla mücadele»." },
      { id: "l-b2-10-q2", level: "B2", topic: "Çıkarım", question: "Çok ziyaretçi neye zarar veriyor?", options: ["Yaşam kalitesi ve doğaya", "Sadece otellere", "Ekonomiye", "Hiçbir şeye"], correctAnswer: 0, explanation: "«yaşam kalitesini düşürüyor ve doğal alanlara zarar»." },
      { id: "l-b2-10-q3", level: "B2", topic: "Detay", question: "Bazı şehirler ne yaptı?", options: ["Ziyaretçi sayısını sınırladı", "Turizmi durdurdu", "Otelleri kapattı", "Hiçbir şey"], correctAnswer: 0, explanation: "«günlük ziyaretçi sayısını sınırlamaya başladı»." },
      { id: "l-b2-10-q4", level: "B2", topic: "Çıkarım", question: "Uzmanlara göre çözüm nedir?", options: ["Sürdürülebilir modele geçmek", "Turizmi bitirmek", "Daha çok turist", "Fiyat artışı"], correctAnswer: 0, explanation: "«daha sürdürülebilir bir modele geçmek»." },
      { id: "l-b2-10-q5", level: "B2", topic: "Detay", question: "Bu model neyi içeriyor?", options: ["Ziyaretçileri yıla yaymayı", "Sadece yazın turizmi", "Daha çok otel", "Ucuz bilet"], correctAnswer: 0, explanation: "«ziyaretçileri yılın farklı dönemlerine yaymayı»." },
    ],
  },
  {
    id: "l-c1-08", level: "C1", topic: "Konferans",
    title: "Algoritmik Önyargı",
    text: "Konuşmacı: Yapay zekâ sistemlerinin tarafsız olduğu yönünde yaygın bir yanılgı var. Oysa bu sistemler, kendilerine sunulan verilerle eğitilir ve eğer bu veriler toplumdaki mevcut önyargıları taşıyorsa, yapay zekâ da bu önyargıları öğrenir, hatta pekiştirir. Örneğin, geçmiş işe alım verileriyle eğitilen bir sistem, geçmişteki ayrımcı kalıpları sürdürebilir. Bu nedenle 'algoritmik önyargı', adalet açısından ciddi bir tehdittir. Çözüm, hem verileri dikkatle denetlemekten hem de bu sistemleri tasarlayan ekiplerin çeşitliliğini artırmaktan geçer. Teknoloji, onu yaratan insanların değerlerini yansıtır.",
    questions: [
      { id: "l-c1-08-q1", level: "C1", topic: "Çıkarım", question: "Yaygın yanılgı nedir?", options: ["Yapay zekânın tarafsız olduğu", "Yapay zekânın yavaş olduğu", "Verinin gereksizliği", "Teknolojinin kötülüğü"], correctAnswer: 0, explanation: "«tarafsız olduğu yönünde yaygın bir yanılgı»." },
      { id: "l-c1-08-q2", level: "C1", topic: "Detay", question: "Sistemler neyle eğitilir?", options: ["Verilerle", "Duygularla", "Kurallarla", "Şansla"], correctAnswer: 0, explanation: "«kendilerine sunulan verilerle eğitilir»." },
      { id: "l-c1-08-q3", level: "C1", topic: "Çıkarım", question: "Veri önyargılıysa ne olur?", options: ["Yapay zekâ önyargıyı öğrenir", "Veri düzelir", "Sistem durur", "Hiçbir şey"], correctAnswer: 0, explanation: "«yapay zekâ da bu önyargıları öğrenir, hatta pekiştirir»." },
      { id: "l-c1-08-q4", level: "C1", topic: "Detay", question: "Çözüm neyi içeriyor?", options: ["Veri denetimi ve ekip çeşitliliği", "Daha çok veri", "Daha hızlı sistem", "Hiçbir şey"], correctAnswer: 0, explanation: "«verileri dikkatle denetlemekten … ekiplerin çeşitliliğini artırmaktan»." },
      { id: "l-c1-08-q5", level: "C1", topic: "Çıkarım", question: "Teknoloji neyi yansıtır?", options: ["Onu yaratanların değerlerini", "Sadece sayıları", "Doğayı", "Geleceği"], correctAnswer: 0, explanation: "«onu yaratan insanların değerlerini yansıtır»." },
    ],
  },
  {
    id: "l-c1-09", level: "C1", topic: "Panel",
    title: "Kültürlerarası İletişim",
    text: "Moderatör: Küreselleşen dünyada farklı kültürlerden insanlarla çalışmak sıradanlaştı. Bu neden bu kadar zorlayıcı olabiliyor?\nUzman: Çünkü iletişim yalnızca kelimelerden ibaret değil. Bir kültürde son derece kibar sayılan bir davranış, başka bir kültürde kaba algılanabilir. Örneğin, bazı kültürlerde doğrudan 'hayır' demek nezaketsizlik sayılırken, bazılarında açıklık erdem kabul edilir. Bu farkları bilmemek, iyi niyetli insanlar arasında bile yanlış anlamalara yol açar. Asıl önemli olan, kendi kültürel varsayımlarımızın evrensel olmadığının farkına varmak ve merakla, yargılamadan dinlemektir.",
    questions: [
      { id: "l-c1-09-q1", level: "C1", topic: "Çıkarım", question: "İletişim neyden ibaret değil?", options: ["Sadece kelimelerden", "Sadece jestlerden", "Sadece yazıdan", "Hiçbir şeyden"], correctAnswer: 0, explanation: "«iletişim yalnızca kelimelerden ibaret değil»." },
      { id: "l-c1-09-q2", level: "C1", topic: "Çıkarım", question: "Bir davranış kültüre göre nasıl olabilir?", options: ["Bir yerde kibar, başka yerde kaba", "Her yerde aynı", "Her zaman kaba", "Her zaman kibar"], correctAnswer: 0, explanation: "«bir kültürde … kibar … başka bir kültürde kaba algılanabilir»." },
      { id: "l-c1-09-q3", level: "C1", topic: "Detay", question: "'Hayır' demek bazı kültürlerde nasıl?", options: ["Nezaketsizlik sayılır", "Her zaman iyi", "Zorunlu", "Komik"], correctAnswer: 0, explanation: "«doğrudan 'hayır' demek nezaketsizlik sayılırken»." },
      { id: "l-c1-09-q4", level: "C1", topic: "Çıkarım", question: "Farkları bilmemek neye yol açar?", options: ["Yanlış anlamalara", "Daha iyi iletişime", "Zenginliğe", "Hiçbir şeye"], correctAnswer: 0, explanation: "«yanlış anlamalara yol açar»." },
      { id: "l-c1-09-q5", level: "C1", topic: "Çıkarım", question: "Asıl önemli olan nedir?", options: ["Varsayımların evrensel olmadığını fark etmek", "Herkesi değiştirmek", "Kendi kültürünü dayatmak", "Konuşmamak"], correctAnswer: 0, explanation: "«kendi kültürel varsayımlarımızın evrensel olmadığının farkına varmak»." },
    ],
  },
  {
    id: "l-c1-10", level: "C1", topic: "Akademik konuşma",
    title: "Dil ve Düşünce",
    text: "Konuşmacı: Konuştuğumuz dil, düşünme biçimimizi etkiler mi? Bu, dil biliminin en büyüleyici sorularından biridir. Bazı dillerde geleceğe dair ayrı bir zaman kipi yokken, bazılarında vardır; araştırmalar, bu farkın insanların tasarruf ve planlama alışkanlıklarını bile etkileyebileceğini öne sürüyor. Yine, bazı diller yön belirtmek için 'sağ-sol' yerine 'kuzey-güney' gibi mutlak yönler kullanır ve bu dilleri konuşanların mekânsal yönelimleri olağanüstü gelişmiştir. Bu, dilin yalnızca düşünceyi ifade eden bir araç değil, aynı zamanda onu biçimlendiren bir güç olabileceğini düşündürüyor.",
    questions: [
      { id: "l-c1-10-q1", level: "C1", topic: "Çıkarım", question: "Dil biliminin büyüleyici sorusu nedir?", options: ["Dilin düşünmeyi etkileyip etkilemediği", "Kaç dil olduğu", "En eski dil", "En kolay dil"], correctAnswer: 0, explanation: "«Konuştuğumuz dil, düşünme biçimimizi etkiler mi?»." },
      { id: "l-c1-10-q2", level: "C1", topic: "Detay", question: "Gelecek kipi farkı neyi etkileyebilir?", options: ["Tasarruf ve planlamayı", "Boyu", "Sağlığı", "Rengi"], correctAnswer: 0, explanation: "«tasarruf ve planlama alışkanlıklarını bile etkileyebileceğini»." },
      { id: "l-c1-10-q3", level: "C1", topic: "Detay", question: "Bazı diller yön için ne kullanır?", options: ["Mutlak yönler (kuzey-güney)", "Sadece sağ-sol", "Renkler", "Sayılar"], correctAnswer: 0, explanation: "«'kuzey-güney' gibi mutlak yönler kullanır»." },
      { id: "l-c1-10-q4", level: "C1", topic: "Çıkarım", question: "Bu dilleri konuşanlarda ne gelişmiş?", options: ["Mekânsal yönelim", "Müzik kulağı", "Görme", "Hafıza"], correctAnswer: 0, explanation: "«mekânsal yönelimleri olağanüstü gelişmiştir»." },
      { id: "l-c1-10-q5", level: "C1", topic: "Çıkarım", question: "Dil ne olabilir?", options: ["Düşünceyi biçimlendiren bir güç", "Sadece bir araç", "Önemsiz", "Bir engel"], correctAnswer: 0, explanation: "«onu biçimlendiren bir güç olabileceğini»." },
    ],
  },

  /* --------------------------- Batch 7 --------------------------- */
  {
    id: "l-a2-15", level: "A2", topic: "Sağlık",
    title: "Eczane Tavsiyesi",
    text: "Eczacı: Buyurun, nasıl yardımcı olabilirim?\nMüşteri: Birkaç gündür uykusuzluk çekiyorum.\nEczacı: Akşamları kahve içiyor musunuz?\nMüşteri: Evet, hatta gece bile içiyorum.\nEczacı: Sorun büyük olasılıkla bu. Öğleden sonra kafeini kesmeyi deneyin. Ayrıca yatmadan önce ılık bir bardak süt iyi gelebilir.\nMüşteri: Tamam, deneyeceğim. Teşekkürler.",
    questions: [
      { id: "l-a2-15-q1", level: "A2", topic: "Detay", question: "Müşterinin sorunu nedir?", options: ["Uykusuzluk", "Baş ağrısı", "Öksürük", "Ateş"], correctAnswer: 0, explanation: "«uykusuzluk çekiyorum»." },
      { id: "l-a2-15-q2", level: "A2", topic: "Detay", question: "Müşteri ne zaman kahve içiyor?", options: ["Gece bile", "Sadece sabah", "Hiç", "Öğlen"], correctAnswer: 0, explanation: "«gece bile içiyorum»." },
      { id: "l-a2-15-q3", level: "A2", topic: "Çıkarım", question: "Eczacıya göre sorunun nedeni ne?", options: ["Kafein", "Hava", "Yemek", "Spor"], correctAnswer: 0, explanation: "«Sorun büyük olasılıkla bu» (kahve/kafein)." },
      { id: "l-a2-15-q4", level: "A2", topic: "Detay", question: "Eczacı ne öneriyor?", options: ["Öğleden sonra kafeini kesmeyi", "Daha çok kahve", "İlaç almayı", "Spor yapmamayı"], correctAnswer: 0, explanation: "«Öğleden sonra kafeini kesmeyi deneyin»." },
      { id: "l-a2-15-q5", level: "A2", topic: "Detay", question: "Yatmadan önce ne iyi gelebilir?", options: ["Ilık süt", "Soğuk kola", "Çay", "Su"], correctAnswer: 0, explanation: "«ılık bir bardak süt iyi gelebilir»." },
    ],
  },
  {
    id: "l-b1-16", level: "B1", topic: "Röportaj",
    title: "Bir Öğretmenle Söyleşi",
    text: "Sunucu: Yirmi yıldır öğretmensiniz. Bu meslekte sizi ayakta tutan nedir?\nÖğretmen: Öğrencilerin gözündeki o 'anladım' ışığı. Bir konunun anlaşıldığı anı görmek paha biçilemez.\nSunucu: Eğitim sizce nasıl değişti?\nÖğretmen: Artık bilgi her yerde. Bu yüzden işimiz bilgiyi aktarmaktan çok, öğrencilere nasıl düşüneceklerini öğretmek.\nSunucu: Genç öğretmenlere tavsiyeniz?\nÖğretmen: Her öğrencinin farklı olduğunu unutmasınlar. Sabır ve sevgi, en güçlü öğretim araçlarıdır.",
    questions: [
      { id: "l-b1-16-q1", level: "B1", topic: "Detay", question: "Öğretmeni ayakta tutan nedir?", options: ["Öğrencinin 'anladım' anı", "Maaş", "Tatiller", "Ün"], correctAnswer: 0, explanation: "«o 'anladım' ışığı»." },
      { id: "l-b1-16-q2", level: "B1", topic: "Çıkarım", question: "Eğitim nasıl değişti?", options: ["Bilgi artık her yerde", "Daha zor oldu", "Hiç değişmedi", "Ücretsiz oldu"], correctAnswer: 0, explanation: "«Artık bilgi her yerde»." },
      { id: "l-b1-16-q3", level: "B1", topic: "Çıkarım", question: "Öğretmenin asıl işi ne oldu?", options: ["Nasıl düşüneceklerini öğretmek", "Bilgi ezberletmek", "Sınav yapmak", "Not vermek"], correctAnswer: 0, explanation: "«nasıl düşüneceklerini öğretmek»." },
      { id: "l-b1-16-q4", level: "B1", topic: "Detay", question: "Genç öğretmenlere ne hatırlatıyor?", options: ["Her öğrencinin farklı olduğunu", "Hızlı olmayı", "Sert olmayı", "Az çalışmayı"], correctAnswer: 0, explanation: "«Her öğrencinin farklı olduğunu unutmasınlar»." },
      { id: "l-b1-16-q5", level: "B1", topic: "Detay", question: "En güçlü öğretim araçları neler?", options: ["Sabır ve sevgi", "Para ve güç", "Hız ve baskı", "Teknoloji"], correctAnswer: 0, explanation: "«Sabır ve sevgi, en güçlü öğretim araçlarıdır»." },
    ],
  },
  {
    id: "l-b2-11", level: "B2", topic: "Haber analizi",
    title: "Şehir Merkezinde Yayalaştırma",
    text: "Spiker: Birçok Avrupa şehri, merkezlerini araç trafiğine kapatarak yaya bölgelerine dönüştürüyor. Başlangıçta esnaf, müşteri kaybedeceği endişesiyle bu karara karşı çıkmıştı. Ancak sonuçlar tam tersini gösterdi: yayalaştırılan caddelerde insanlar daha çok vakit geçiriyor, dolayısıyla işletmelerin cirosu arttı. Ayrıca hava kalitesi yükseldi ve gürültü azaldı. Uzmanlar, arabalara değil insanlara öncelik veren şehirlerin daha yaşanabilir olduğunu vurguluyor.",
    questions: [
      { id: "l-b2-11-q1", level: "B2", topic: "Detay", question: "Şehirler merkezlerini neye dönüştürüyor?", options: ["Yaya bölgelerine", "Otoparka", "Sanayiye", "Konuta"], correctAnswer: 0, explanation: "«yaya bölgelerine dönüştürüyor»." },
      { id: "l-b2-11-q2", level: "B2", topic: "Detay", question: "Esnaf başta neden karşı çıktı?", options: ["Müşteri kaybı endişesi", "Vergi", "Gürültü", "Kira"], correctAnswer: 0, explanation: "«müşteri kaybedeceği endişesiyle»." },
      { id: "l-b2-11-q3", level: "B2", topic: "Çıkarım", question: "Sonuç ne oldu?", options: ["Ciro arttı", "İşletmeler kapandı", "Trafik arttı", "Hiçbir şey"], correctAnswer: 0, explanation: "«işletmelerin cirosu arttı»." },
      { id: "l-b2-11-q4", level: "B2", topic: "Detay", question: "Başka hangi iyileşme oldu?", options: ["Hava kalitesi yükseldi", "Fiyatlar arttı", "Gürültü arttı", "Nüfus azaldı"], correctAnswer: 0, explanation: "«hava kalitesi yükseldi ve gürültü azaldı»." },
      { id: "l-b2-11-q5", level: "B2", topic: "Çıkarım", question: "Uzmanlara göre hangi şehirler yaşanabilir?", options: ["İnsanlara öncelik verenler", "Arabalara öncelik verenler", "Büyük olanlar", "Sessiz olanlar"], correctAnswer: 0, explanation: "«insanlara öncelik veren şehirlerin daha yaşanabilir»." },
    ],
  },
  {
    id: "l-b2-12", level: "B2", topic: "Üniversite dersi",
    title: "Davranışsal Ekonomi",
    text: "Hocam: Klasik ekonomi, insanların her zaman mantıklı kararlar verdiğini varsayar. Oysa davranışsal ekonomi bize tam tersini gösteriyor: kararlarımız çoğu zaman duygulardan, alışkanlıklardan ve zihinsel kısa yollardan etkilenir. Örneğin, bir ürün 'yüzde elli indirimli' diye sunulduğunda, gerçekten ihtiyacımız olmasa bile satın alma eğilimimiz artar. Şirketler bu psikolojik eğilimleri çok iyi bilir ve kullanır. Bu nedenle bilinçli bir tüketici olmak, kendi kararlarımızın ardındaki gerçek nedenleri sorgulamayı gerektirir.",
    questions: [
      { id: "l-b2-12-q1", level: "B2", topic: "Detay", question: "Klasik ekonomi neyi varsayar?", options: ["İnsanların mantıklı karar verdiğini", "İnsanların duygusal olduğunu", "Kararların rastgele olduğunu", "Hiçbir şey"], correctAnswer: 0, explanation: "«her zaman mantıklı kararlar verdiğini varsayar»." },
      { id: "l-b2-12-q2", level: "B2", topic: "Çıkarım", question: "Davranışsal ekonomi ne gösteriyor?", options: ["Kararların duygulardan etkilendiğini", "Ekonominin kolay olduğunu", "İnsanların hep haklı olduğunu", "Hiçbir şey"], correctAnswer: 0, explanation: "«kararlarımız çoğu zaman duygulardan … etkilenir»." },
      { id: "l-b2-12-q3", level: "B2", topic: "Detay", question: "İndirim örneği neyi gösteriyor?", options: ["İhtiyaç olmasa da satın alma eğilimi", "İndirimlerin kötülüğü", "Fiyatların düşmesi", "Hiçbir şey"], correctAnswer: 0, explanation: "«ihtiyacımız olmasa bile satın alma eğilimimiz artar»." },
      { id: "l-b2-12-q4", level: "B2", topic: "Çıkarım", question: "Şirketler bu eğilimleri ne yapıyor?", options: ["Biliyor ve kullanıyor", "Görmezden geliyor", "Yasaklıyor", "Bilmiyor"], correctAnswer: 0, explanation: "«çok iyi bilir ve kullanır»." },
      { id: "l-b2-12-q5", level: "B2", topic: "Çıkarım", question: "Bilinçli tüketici ne yapmalı?", options: ["Kararların nedenlerini sorgulamalı", "Daha çok almalı", "Hiç düşünmemeli", "İndirimleri kovalamalı"], correctAnswer: 0, explanation: "«kararlarımızın ardındaki gerçek nedenleri sorgulamayı gerektirir»." },
    ],
  },
  {
    id: "l-c1-11", level: "C1", topic: "Konferans",
    title: "Demokraside Katılım",
    text: "Konuşmacı: Demokrasi, yalnızca birkaç yılda bir sandığa gitmekten ibaret değildir. Sağlıklı bir demokrasi, vatandaşların seçimler arasındaki dönemde de aktif olmasını gerektirir: kamuoyu oluşturmak, yerel kararlara katılmak, sivil toplum kuruluşlarında yer almak. Ne yazık ki birçok toplumda siyasi katılım, giderek bir 'seyircilik' hâline geliyor; insanlar siyaseti uzaktan izliyor ama sürece dâhil olmuyor. Oysa demokrasi, kullanılmadıkça körelen bir kas gibidir. Onu canlı tutmanın yolu, sürekli ve etkin yurttaş katılımından geçer.",
    questions: [
      { id: "l-c1-11-q1", level: "C1", topic: "Çıkarım", question: "Demokrasi neyden ibaret değildir?", options: ["Sadece oy vermekten", "Tartışmaktan", "Katılmaktan", "Düşünmekten"], correctAnswer: 0, explanation: "«yalnızca birkaç yılda bir sandığa gitmekten ibaret değildir»." },
      { id: "l-c1-11-q2", level: "C1", topic: "Detay", question: "Sağlıklı demokrasi neyi gerektirir?", options: ["Seçimler arası aktif olmayı", "Sessiz kalmayı", "Sadece eleştirmeyi", "Hiçbir şeyi"], correctAnswer: 0, explanation: "«seçimler arasındaki dönemde de aktif olmasını»." },
      { id: "l-c1-11-q3", level: "C1", topic: "Çıkarım", question: "Siyasi katılım neye dönüşüyor?", options: ["Seyirciliğe", "Liderliğe", "Uzmanlığa", "Coşkuya"], correctAnswer: 0, explanation: "«bir 'seyircilik' hâline geliyor»." },
      { id: "l-c1-11-q4", level: "C1", topic: "Çıkarım", question: "Demokrasi neye benzetiliyor?", options: ["Kullanılmazsa körelen bir kasa", "Bir makineye", "Bir ağaca", "Bir nehre"], correctAnswer: 0, explanation: "«kullanılmadıkça körelen bir kas gibidir»." },
      { id: "l-c1-11-q5", level: "C1", topic: "Çıkarım", question: "Onu canlı tutmanın yolu nedir?", options: ["Etkin yurttaş katılımı", "Daha çok yasa", "Daha az seçim", "Sessizlik"], correctAnswer: 0, explanation: "«sürekli ve etkin yurttaş katılımından geçer»." },
    ],
  },
  {
    id: "l-c1-12", level: "C1", topic: "Panel",
    title: "Sanatın İşlevi",
    text: "Moderatör: Sanat lüks mü, yoksa ihtiyaç mı? Sıkça sorulan bir soru.\nUzman: Bence kesinlikle bir ihtiyaç. Sanat, insanın kendini ve dünyayı anlamlandırma çabasının en derin ifadelerinden biridir. Zor zamanlarda bile insanlar şarkı söyledi, resim yaptı, hikâye anlattı. Sanat aynı zamanda eleştirel bir aynadır; topluma kendi çelişkilerini gösterir, rahatsız eder ve düşünmeye zorlar. Bu yüzden baskıcı yönetimler ilk olarak sanatçıları susturmaya çalışır. Sanatı yalnızca dekoratif bir süs olarak görmek, onun dönüştürücü gücünü görmezden gelmektir.",
    questions: [
      { id: "l-c1-12-q1", level: "C1", topic: "Çıkarım", question: "Uzmana göre sanat nedir?", options: ["Bir ihtiyaç", "Bir lüks", "Bir süs", "Bir oyun"], correctAnswer: 0, explanation: "«kesinlikle bir ihtiyaç»." },
      { id: "l-c1-12-q2", level: "C1", topic: "Detay", question: "Zor zamanlarda insanlar ne yaptı?", options: ["Şarkı söyledi, resim yaptı", "Sanatı bıraktı", "Sustu", "Hiçbir şey"], correctAnswer: 0, explanation: "«insanlar şarkı söyledi, resim yaptı, hikâye anlattı»." },
      { id: "l-c1-12-q3", level: "C1", topic: "Çıkarım", question: "Sanat nasıl bir aynadır?", options: ["Eleştirel", "Kırık", "Sessiz", "Boş"], correctAnswer: 0, explanation: "«eleştirel bir aynadır»." },
      { id: "l-c1-12-q4", level: "C1", topic: "Çıkarım", question: "Baskıcı yönetimler ilk ne yapar?", options: ["Sanatçıları susturmaya çalışır", "Sanatı destekler", "Müze açar", "Hiçbir şey"], correctAnswer: 0, explanation: "«ilk olarak sanatçıları susturmaya çalışır»." },
      { id: "l-c1-12-q5", level: "C1", topic: "Çıkarım", question: "Sanatı süs olarak görmek nedir?", options: ["Dönüştürücü gücünü görmezden gelmek", "Doğru bakış", "Saygı", "Övgü"], correctAnswer: 0, explanation: "«dönüştürücü gücünü görmezden gelmektir»." },
    ],
  },
  {
    id: "l-c1-13", level: "C1", topic: "Akademik konuşma",
    title: "Bilim İletişimi",
    text: "Konuşmacı: Bilim insanlarının yalnızca iyi araştırma yapması artık yeterli değil; bulgularını topluma anlaşılır biçimde aktarabilmeleri de gerekiyor. Karmaşık bir konuyu, doğruluğundan ödün vermeden basitçe anlatabilmek başlı başına bir yetenektir. Maalesef akademik dil çoğu zaman halktan kopuktur ve bu boşluk, yanlış bilgilerin yayılmasına zemin hazırlar. İyi bir bilim iletişimcisi, merak uyandırır, kavramları günlük hayattan örneklerle bağlar ve en önemlisi, belirsizliği dürüstçe kabul eder. Çünkü bilim, kesin cevaplardan çok, doğru soruları sorma sanatıdır.",
    questions: [
      { id: "l-c1-13-q1", level: "C1", topic: "Çıkarım", question: "Bilim insanları için artık ne gerekiyor?", options: ["Bulguları topluma aktarmak", "Sadece araştırma", "Daha çok yayın", "Sessizlik"], correctAnswer: 0, explanation: "«bulgularını topluma anlaşılır biçimde aktarabilmeleri»." },
      { id: "l-c1-13-q2", level: "C1", topic: "Detay", question: "Karmaşık konuyu nasıl anlatmak yetenektir?", options: ["Doğruluktan ödün vermeden basitçe", "Çok karmaşık", "Hiç anlatmadan", "Yanlış"], correctAnswer: 0, explanation: "«doğruluğundan ödün vermeden basitçe anlatabilmek»." },
      { id: "l-c1-13-q3", level: "C1", topic: "Çıkarım", question: "Akademik dilin kopukluğu neye zemin hazırlar?", options: ["Yanlış bilgilerin yayılmasına", "Daha iyi eğitime", "Bilime güvene", "Hiçbir şeye"], correctAnswer: 0, explanation: "«yanlış bilgilerin yayılmasına zemin hazırlar»." },
      { id: "l-c1-13-q4", level: "C1", topic: "Detay", question: "İyi bir bilim iletişimcisi ne yapar?", options: ["Merak uyandırır ve örnekler verir", "Sıkar", "Karmaşık konuşur", "Belirsizliği gizler"], correctAnswer: 0, explanation: "«merak uyandırır, kavramları günlük hayattan örneklerle bağlar»." },
      { id: "l-c1-13-q5", level: "C1", topic: "Çıkarım", question: "Konuşmacıya göre bilim nedir?", options: ["Doğru soruları sorma sanatı", "Kesin cevaplar", "Ezber", "Bir inanç"], correctAnswer: 0, explanation: "«doğru soruları sorma sanatıdır»." },
    ],
  },
  {
    id: "l-c1-14", level: "C1", topic: "Konferans",
    title: "Gözetim Toplumu",
    text: "Konuşmacı: Güvenlik kameraları, yüz tanıma sistemleri ve dijital izleme araçları, kamusal alanı giderek daha fazla gözetim altına alıyor. Savunucuları, bu teknolojilerin suçu azalttığını ve güvenliği artırdığını ileri sürer. Ancak burada ince bir denge söz konusu: Her hareketimizin kaydedildiği bir toplumda, gerçek anlamda özgür olabilir miyiz? Tarih bize, sınırsız gözetim yetkisinin kolayca kötüye kullanılabileceğini gösteriyor. Güvenlik ile özgürlük arasındaki bu gerilim, basit bir 'ya o ya bu' meselesi değildir; demokratik denetim ve şeffaflıkla yönetilmesi gereken sürekli bir müzakeredir.",
    questions: [
      { id: "l-c1-14-q1", level: "C1", topic: "Detay", question: "Hangi araçlar kamusal alanı gözetliyor?", options: ["Kamera ve yüz tanıma", "Sadece telefonlar", "Gazeteler", "Radyolar"], correctAnswer: 0, explanation: "«Güvenlik kameraları, yüz tanıma sistemleri»." },
      { id: "l-c1-14-q2", level: "C1", topic: "Çıkarım", question: "Savunucular ne ileri sürüyor?", options: ["Suçu azaltıp güvenliği artırdığını", "Özgürlüğü artırdığını", "Gereksiz olduğunu", "Pahalı olduğunu"], correctAnswer: 0, explanation: "«suçu azalttığını ve güvenliği artırdığını»." },
      { id: "l-c1-14-q3", level: "C1", topic: "Çıkarım", question: "Konuşmacının sorduğu soru nedir?", options: ["Her hareket kaydedilirse özgür müyüz", "Kameralar pahalı mı", "Suç nedir", "Teknoloji iyi mi"], correctAnswer: 0, explanation: "«gerçek anlamda özgür olabilir miyiz?»." },
      { id: "l-c1-14-q4", level: "C1", topic: "Detay", question: "Tarih ne gösteriyor?", options: ["Gözetim yetkisinin kötüye kullanılabileceğini", "Güvenliğin imkânsız olduğunu", "Teknolojinin durduğunu", "Hiçbir şey"], correctAnswer: 0, explanation: "«kolayca kötüye kullanılabileceğini gösteriyor»." },
      { id: "l-c1-14-q5", level: "C1", topic: "Çıkarım", question: "Güvenlik-özgürlük gerilimi nedir?", options: ["Sürekli bir müzakere", "Basit bir seçim", "Çözümsüz", "Önemsiz"], correctAnswer: 0, explanation: "«demokratik denetim ve şeffaflıkla yönetilmesi gereken sürekli bir müzakeredir»." },
    ],
  },
  {
    id: "l-c1-15", level: "C1", topic: "Panel",
    title: "İşin Geleceği",
    text: "Moderatör: Otomasyon birçok işi değiştiriyor. Geleceğin iş dünyası nasıl olacak?\nUzman: Bazı meslekler ortadan kalkacak, ama yenileri doğacak; tarih boyunca hep böyle oldu. Asıl değişim, becerilerde olacak. Tekrara dayalı işler makinelere devredilirken, yaratıcılık, eleştirel düşünme ve duygusal zekâ gibi insana özgü beceriler değer kazanacak. Bu nedenle eğitim sistemleri, öğrencileri belirli bir mesleğe değil, sürekli öğrenmeye ve değişime uyum sağlamaya hazırlamalı. Geleceğin en değerli çalışanı, en çok bilen değil, en hızlı öğrenen olacak.",
    questions: [
      { id: "l-c1-15-q1", level: "C1", topic: "Çıkarım", question: "Otomasyonla meslekler ne olacak?", options: ["Bazıları kalkacak, yenileri doğacak", "Hepsi kalkacak", "Hiçbiri değişmeyecek", "Hepsi aynı kalacak"], correctAnswer: 0, explanation: "«Bazı meslekler ortadan kalkacak, ama yenileri doğacak»." },
      { id: "l-c1-15-q2", level: "C1", topic: "Çıkarım", question: "Asıl değişim nerede olacak?", options: ["Becerilerde", "Maaşlarda", "Şehirlerde", "Dillerde"], correctAnswer: 0, explanation: "«Asıl değişim, becerilerde olacak»." },
      { id: "l-c1-15-q3", level: "C1", topic: "Detay", question: "Hangi beceriler değer kazanacak?", options: ["Yaratıcılık ve duygusal zekâ", "Tekrara dayalı işler", "Ezber", "Hız"], correctAnswer: 0, explanation: "«yaratıcılık, eleştirel düşünme ve duygusal zekâ»." },
      { id: "l-c1-15-q4", level: "C1", topic: "Çıkarım", question: "Eğitim öğrencileri neye hazırlamalı?", options: ["Sürekli öğrenmeye", "Tek bir mesleğe", "Sınavlara", "Ezbere"], correctAnswer: 0, explanation: "«sürekli öğrenmeye ve değişime uyum sağlamaya»." },
      { id: "l-c1-15-q5", level: "C1", topic: "Çıkarım", question: "Geleceğin en değerli çalışanı kim?", options: ["En hızlı öğrenen", "En çok bilen", "En çok çalışan", "En genç"], correctAnswer: 0, explanation: "«en çok bilen değil, en hızlı öğrenen»." },
    ],
  },
  {
    id: "l-c1-16", level: "C1", topic: "Akademik konuşma",
    title: "Nostalji ve Bellek",
    text: "Konuşmacı: Nostalji, uzun süre olumsuz, hatta hastalıklı bir duygu olarak görülmüştür. Oysa son araştırmalar, geçmişe duyulan bu tatlı özlemin aslında ruh sağlığımız için faydalı olabileceğini ortaya koyuyor. Nostalji, zor zamanlarda bize bir süreklilik ve anlam duygusu verir; yalnız hissettiğimizde, sevdiklerimizle paylaştığımız anıları hatırlamak bizi yeniden onlara bağlar. Ancak bir tuzak da var: Geçmişi olduğundan daha güzel hatırlama eğilimi, bizi bugünü gerçekçi değerlendirmekten alıkoyabilir. Sağlıklı olan, geçmişten güç almak, ama onun esiri olmamaktır.",
    questions: [
      { id: "l-c1-16-q1", level: "C1", topic: "Çıkarım", question: "Nostalji uzun süre nasıl görülmüştür?", options: ["Olumsuz bir duygu", "Olumlu bir güç", "Önemsiz", "Bir hastalık değil"], correctAnswer: 0, explanation: "«olumsuz, hatta hastalıklı bir duygu olarak görülmüştür»." },
      { id: "l-c1-16-q2", level: "C1", topic: "Detay", question: "Son araştırmalar ne gösteriyor?", options: ["Ruh sağlığı için faydalı olabileceğini", "Zararlı olduğunu", "Etkisiz olduğunu", "Hiçbir şey"], correctAnswer: 0, explanation: "«ruh sağlığımız için faydalı olabileceğini»." },
      { id: "l-c1-16-q3", level: "C1", topic: "Çıkarım", question: "Nostalji zor zamanlarda ne verir?", options: ["Süreklilik ve anlam duygusu", "Korku", "Yalnızlık", "Öfke"], correctAnswer: 0, explanation: "«bir süreklilik ve anlam duygusu verir»." },
      { id: "l-c1-16-q4", level: "C1", topic: "Detay", question: "Tuzak nedir?", options: ["Geçmişi olduğundan güzel hatırlamak", "Geçmişi unutmak", "Çok hatırlamak", "Hiç düşünmemek"], correctAnswer: 0, explanation: "«Geçmişi olduğundan daha güzel hatırlama eğilimi»." },
      { id: "l-c1-16-q5", level: "C1", topic: "Çıkarım", question: "Sağlıklı olan nedir?", options: ["Geçmişten güç almak ama esiri olmamak", "Geçmişte yaşamak", "Geçmişi reddetmek", "Sadece geleceğe bakmak"], correctAnswer: 0, explanation: "«geçmişten güç almak, ama onun esiri olmamaktır»." },
    ],
  },

  /* --------------------------- Batch 8 (listening tamam) --------------------------- */
  {
    id: "l-b1-17", level: "B1", topic: "Podcast",
    title: "Dil Öğrenme Üzerine",
    text: "Sunucu: Birçok kişi yıllarca bir dil öğrenmeye çalışıyor ama ilerleyemiyor. Sebep ne?\nUzman: Çoğunlukla sürekli ders çalışmak ama hiç kullanmamak. Dil, bir bisiklet gibidir; sadece kitap okuyarak öğrenilmez, kullanarak öğrenilir.\nSunucu: Peki ne önerirsiniz?\nUzman: Her gün az da olsa o dile maruz kalın: dizi izleyin, şarkı dinleyin, kendi kendinize konuşun. Hata yapmaktan korkmayın; hata, öğrenmenin doğal bir parçasıdır.\nSunucu: Çok değerli, teşekkürler.",
    questions: [
      { id: "l-b1-17-q1", level: "B1", topic: "Çıkarım", question: "İnsanlar neden ilerleyemiyor?", options: ["Çalışıp hiç kullanmadığı için", "Çok kullandığı için", "Tatil yaptığı için", "Hızlı olduğu için"], correctAnswer: 0, explanation: "«sürekli ders çalışmak ama hiç kullanmamak»." },
      { id: "l-b1-17-q2", level: "B1", topic: "Çıkarım", question: "Dil neye benzetiliyor?", options: ["Bisiklete", "Kitaba", "Arabaya", "Eve"], correctAnswer: 0, explanation: "«Dil, bir bisiklet gibidir»." },
      { id: "l-b1-17-q3", level: "B1", topic: "Detay", question: "Dil nasıl öğrenilir?", options: ["Kullanarak", "Sadece okuyarak", "Sadece dinleyerek", "Ezberleyerek"], correctAnswer: 0, explanation: "«kullanarak öğrenilir»." },
      { id: "l-b1-17-q4", level: "B1", topic: "Detay", question: "Uzman ne öneriyor?", options: ["Her gün dile maruz kalmayı", "Yılda bir çalışmayı", "Hiç hata yapmamayı", "Sadece kitap okumayı"], correctAnswer: 0, explanation: "«Her gün az da olsa o dile maruz kalın»." },
      { id: "l-b1-17-q5", level: "B1", topic: "Çıkarım", question: "Hata hakkında ne söyleniyor?", options: ["Öğrenmenin doğal parçası", "Kötü bir şey", "Kaçınılmalı", "Önemsiz"], correctAnswer: 0, explanation: "«hata, öğrenmenin doğal bir parçasıdır»." },
    ],
  },
  {
    id: "l-b2-13", level: "B2", topic: "Röportaj",
    title: "Bir Gazeteciyle Söyleşi",
    text: "Sunucu: Dijital çağda gazetecilik nasıl değişti?\nGazeteci: Haber artık saniyeler içinde yayılıyor. Bu hız, bazen doğruluğun önüne geçebiliyor. Bizim için en büyük sınav, hızlı olmakla doğru olmak arasında denge kurmak.\nSunucu: Sosyal medya işinizi kolaylaştırdı mı, zorlaştırdı mı?\nGazeteci: İkisi de. Bilgiye ulaşmak kolaylaştı, ama yanlış bilgiyi ayıklamak büyük bir emek istiyor.\nSunucu: Okuyuculara tavsiyeniz?\nGazeteci: Tek bir kaynağa güvenmesinler. Bir haberi paylaşmadan önce doğrulasınlar.",
    questions: [
      { id: "l-b2-13-q1", level: "B2", topic: "Detay", question: "Haber artık nasıl yayılıyor?", options: ["Saniyeler içinde", "Günlerce", "Yavaşça", "Hiç"], correctAnswer: 0, explanation: "«saniyeler içinde yayılıyor»." },
      { id: "l-b2-13-q2", level: "B2", topic: "Çıkarım", question: "En büyük sınav nedir?", options: ["Hız ile doğruluk dengesi", "Para kazanmak", "Çok yazmak", "Ün"], correctAnswer: 0, explanation: "«hızlı olmakla doğru olmak arasında denge»." },
      { id: "l-b2-13-q3", level: "B2", topic: "Çıkarım", question: "Sosyal medya nasıl etkiledi?", options: ["Hem kolaylaştırdı hem zorlaştırdı", "Sadece kolaylaştırdı", "Sadece zorlaştırdı", "Etkilemedi"], correctAnswer: 0, explanation: "«İkisi de»." },
      { id: "l-b2-13-q4", level: "B2", topic: "Detay", question: "Ne büyük emek istiyor?", options: ["Yanlış bilgiyi ayıklamak", "Yazı yazmak", "Fotoğraf çekmek", "Röportaj yapmak"], correctAnswer: 0, explanation: "«yanlış bilgiyi ayıklamak büyük bir emek istiyor»." },
      { id: "l-b2-13-q5", level: "B2", topic: "Çıkarım", question: "Okuyuculara ne tavsiye ediyor?", options: ["Tek kaynağa güvenmemeyi", "Hemen paylaşmayı", "Sadece sosyal medyayı", "Hiç okumamayı"], correctAnswer: 0, explanation: "«Tek bir kaynağa güvenmesinler»." },
    ],
  },
  {
    id: "l-c1-17", level: "C1", topic: "Akademik konuşma",
    title: "Özgür İrade Tartışması",
    text: "Konuşmacı: Kararlarımızı gerçekten özgürce mi veriyoruz, yoksa onlar genetik yapımız, geçmişimiz ve çevremiz tarafından mı belirleniyor? Bu, felsefenin en eski ve en çetin sorularından biridir. Bazı nörobilimciler, beynimizin bir kararı, biz bilinçli olarak fark etmeden saniyeler önce verdiğini öne sürüyor. Bu bulgu, özgür iradenin bir yanılsama olabileceğini düşündürüyor. Ancak karşıt görüştekiler, böyle bir sonucun ahlaki sorumluluğu tamamen ortadan kaldıracağını ve toplumsal düzeni temelden sarsacağını savunur. Belki de mesele, mutlak özgürlük değil, seçeneklerimiz içinde anlamlı tercihler yapabilme kapasitemizdir.",
    questions: [
      { id: "l-c1-17-q1", level: "C1", topic: "Çıkarım", question: "Tartışmanın sorusu nedir?", options: ["Kararların özgür mü belirlenmiş mi olduğu", "Beynin büyüklüğü", "Genlerin sayısı", "Çevrenin rengi"], correctAnswer: 0, explanation: "«özgürce mi … yoksa … belirleniyor?»." },
      { id: "l-c1-17-q2", level: "C1", topic: "Detay", question: "Bazı nörobilimciler ne öne sürüyor?", options: ["Beyin kararı önce verir", "Karar yoktur", "Beyin yavaştır", "Hiçbir şey"], correctAnswer: 0, explanation: "«beynimizin bir kararı … saniyeler önce verdiğini»." },
      { id: "l-c1-17-q3", level: "C1", topic: "Çıkarım", question: "Bu bulgu neyi düşündürüyor?", options: ["Özgür iradenin yanılsama olabileceğini", "Özgürlüğün kesinliğini", "Beynin önemsizliğini", "Hiçbir şey"], correctAnswer: 0, explanation: "«özgür iradenin bir yanılsama olabileceğini»." },
      { id: "l-c1-17-q4", level: "C1", topic: "Çıkarım", question: "Karşıt görüş neyi savunuyor?", options: ["Ahlaki sorumluluğun kalkacağını", "Bilimin yanlışlığını", "Beynin hızını", "Hiçbir şeyi"], correctAnswer: 0, explanation: "«ahlaki sorumluluğu tamamen ortadan kaldıracağını»." },
      { id: "l-c1-17-q5", level: "C1", topic: "Çıkarım", question: "Konuşmacının önerdiği bakış nedir?", options: ["Anlamlı tercihler yapma kapasitesi", "Mutlak özgürlük", "Hiçbir seçim", "Tam belirlenmişlik"], correctAnswer: 0, explanation: "«seçeneklerimiz içinde anlamlı tercihler yapabilme kapasitemizdir»." },
    ],
  },
  {
    id: "l-c1-18", level: "C1", topic: "Konferans",
    title: "Mimari ve İnsan",
    text: "Konuşmacı: İçinde yaşadığımız mekânlar, ruh hâlimizi sandığımızdan çok daha derinden etkiler. Karanlık, dar ve havasız bir koridor bizi sıkarken; ferah, aydınlık ve yeşille iç içe bir alan huzur verir. Maalesef modern kentleşmede mimari, çoğu zaman estetik ve insani ihtiyaçlardan çok maliyet ve verimlilik üzerine kuruluyor. Oysa iyi tasarlanmış okullar öğrenmeyi, iyi tasarlanmış hastaneler iyileşmeyi destekler. Mimarlık yalnızca bina yapmak değil, insan deneyimini şekillendirmektir. Bu nedenle yapılarımızı tasarlarken sormamız gereken soru şudur: Bu mekân, içinde yaşayan insanı nasıl hissettirecek?",
    questions: [
      { id: "l-c1-18-q1", level: "C1", topic: "Çıkarım", question: "Mekânlar neyi etkiler?", options: ["Ruh hâlimizi", "Sadece sağlığımızı", "Sadece boyumuzu", "Hiçbir şeyi"], correctAnswer: 0, explanation: "«ruh hâlimizi … derinden etkiler»." },
      { id: "l-c1-18-q2", level: "C1", topic: "Detay", question: "Ferah, aydınlık alan ne verir?", options: ["Huzur", "Stres", "Korku", "Yorgunluk"], correctAnswer: 0, explanation: "«ferah, aydınlık … bir alan huzur verir»." },
      { id: "l-c1-18-q3", level: "C1", topic: "Çıkarım", question: "Modern mimari çoğunlukla neye dayanıyor?", options: ["Maliyet ve verimlilik", "Estetik", "İnsani ihtiyaçlar", "Doğa"], correctAnswer: 0, explanation: "«maliyet ve verimlilik üzerine kuruluyor»." },
      { id: "l-c1-18-q4", level: "C1", topic: "Detay", question: "İyi tasarlanmış okul neyi destekler?", options: ["Öğrenmeyi", "Uykuyu", "Ticareti", "Hiçbir şeyi"], correctAnswer: 0, explanation: "«iyi tasarlanmış okullar öğrenmeyi … destekler»." },
      { id: "l-c1-18-q5", level: "C1", topic: "Çıkarım", question: "Mimarlık nedir?", options: ["İnsan deneyimini şekillendirmek", "Sadece bina yapmak", "Para kazanmak", "Süslemek"], correctAnswer: 0, explanation: "«insan deneyimini şekillendirmektir»." },
    ],
  },
  {
    id: "l-c1-19", level: "C1", topic: "Panel",
    title: "Sporun Toplumsal Değeri",
    text: "Moderatör: Spor, sadece bir eğlence mi yoksa daha fazlası mı?\nUzman: Çok daha fazlası. Spor, disiplin, takım ruhu ve başarısızlıkla başa çıkmayı öğretir. Çocuklar bir maçı kaybettiklerinde, hayatın da her zaman adil olmadığını ama yeniden denemenin değerli olduğunu öğrenir. Toplumsal düzeyde ise spor, farklı kökenlerden insanları ortak bir tutku etrafında birleştirir. Ne yazık ki günümüzde spor giderek ticarileşiyor ve bu saf değerlerin bir kısmı gölgede kalabiliyor. Yine de bir mahalle sahasında oynanan basit bir maç, sporun gerçek ruhunu hâlâ canlı tutuyor.",
    questions: [
      { id: "l-c1-19-q1", level: "C1", topic: "Çıkarım", question: "Uzmana göre spor nedir?", options: ["Eğlenceden çok daha fazlası", "Sadece eğlence", "Bir iş", "Önemsiz"], correctAnswer: 0, explanation: "«Çok daha fazlası»." },
      { id: "l-c1-19-q2", level: "C1", topic: "Detay", question: "Spor ne öğretir?", options: ["Disiplin ve takım ruhu", "Sadece kazanmayı", "Yalnızlığı", "Hız"], correctAnswer: 0, explanation: "«disiplin, takım ruhu ve başarısızlıkla başa çıkmayı»." },
      { id: "l-c1-19-q3", level: "C1", topic: "Çıkarım", question: "Çocuklar yenildiğinde ne öğrenir?", options: ["Yeniden denemenin değerini", "Vazgeçmeyi", "Kızmayı", "Hiçbir şey"], correctAnswer: 0, explanation: "«yeniden denemenin değerli olduğunu öğrenir»." },
      { id: "l-c1-19-q4", level: "C1", topic: "Detay", question: "Toplumsal düzeyde spor ne yapar?", options: ["Farklı insanları birleştirir", "İnsanları ayırır", "Rekabeti bitirir", "Hiçbir şey"], correctAnswer: 0, explanation: "«farklı kökenlerden insanları … birleştirir»." },
      { id: "l-c1-19-q5", level: "C1", topic: "Çıkarım", question: "Sporun saf değerlerini ne gölgeleyebiliyor?", options: ["Ticarileşme", "Çocuklar", "Mahalle sahaları", "Takım ruhu"], correctAnswer: 0, explanation: "«spor giderek ticarileşiyor ve bu saf değerlerin bir kısmı gölgede kalabiliyor»." },
    ],
  },
  {
    id: "l-c1-20", level: "C1", topic: "Akademik konuşma",
    title: "Bağırsak ve Beyin",
    text: "Konuşmacı: Son yıllarda bilim, 'bağırsak-beyin ekseni' adı verilen şaşırtıcı bir bağlantıyı keşfetti. Bağırsaklarımızda yaşayan trilyonlarca mikroorganizma, yalnızca sindirimi değil, ruh hâlimizi ve hatta düşüncelerimizi bile etkiliyor olabilir. Araştırmalar, bu mikrobiyom dengesinin bozulmasının kaygı ve depresyon gibi durumlarla ilişkili olduğunu gösteriyor. Bu da, sağlıklı beslenmenin yalnızca bedenimiz için değil, zihinsel sağlığımız için de kritik olduğu anlamına geliyor. Yani 'ne yediğimiz', büyük ölçüde 'nasıl hissettiğimizi' belirliyor olabilir.",
    questions: [
      { id: "l-c1-20-q1", level: "C1", topic: "Detay", question: "Bilim hangi bağlantıyı keşfetti?", options: ["Bağırsak-beyin ekseni", "Kalp-akciğer", "Göz-el", "Hiçbiri"], correctAnswer: 0, explanation: "«'bağırsak-beyin ekseni' adı verilen … bağlantı»." },
      { id: "l-c1-20-q2", level: "C1", topic: "Çıkarım", question: "Mikroorganizmalar neyi etkiliyor olabilir?", options: ["Ruh hâli ve düşünceleri", "Sadece sindirimi", "Sadece kemikleri", "Hiçbir şeyi"], correctAnswer: 0, explanation: "«ruh hâlimizi ve hatta düşüncelerimizi bile etkiliyor»." },
      { id: "l-c1-20-q3", level: "C1", topic: "Detay", question: "Mikrobiyom dengesizliği neyle ilişkili?", options: ["Kaygı ve depresyon", "Boy uzaması", "Görme", "Hız"], correctAnswer: 0, explanation: "«kaygı ve depresyon gibi durumlarla ilişkili»." },
      { id: "l-c1-20-q4", level: "C1", topic: "Çıkarım", question: "Sağlıklı beslenme ne için kritik?", options: ["Beden ve zihinsel sağlık için", "Sadece beden için", "Sadece zihin için", "Hiçbir şey için"], correctAnswer: 0, explanation: "«bedenimiz için değil, zihinsel sağlığımız için de kritik»." },
      { id: "l-c1-20-q5", level: "C1", topic: "Çıkarım", question: "'Ne yediğimiz' neyi belirliyor olabilir?", options: ["Nasıl hissettiğimizi", "Nerede yaşadığımızı", "Ne kadar uyuduğumuzu", "Hiçbir şeyi"], correctAnswer: 0, explanation: "«'nasıl hissettiğimizi' belirliyor olabilir»." },
    ],
  },
  {
    id: "l-c1-21", level: "C1", topic: "Konferans",
    title: "Küresel Tedarik Zincirleri",
    text: "Konuşmacı: Elimizdeki sıradan bir telefon bile, onlarca ülkeden gelen parçaların bir araya gelmesiyle üretiliyor. Bu küresel tedarik zincirleri, üretimi ucuzlatıp ürün çeşitliliğini artırdı. Ancak son yıllarda yaşadığımız krizler, bu sistemin ne kadar kırılgan olduğunu da gösterdi: Dünyanın bir ucundaki bir aksaklık, diğer ucundaki üretimi durdurabiliyor. Bu nedenle birçok şirket, tek bir ülkeye bağımlılığı azaltmaya ve üretimi çeşitlendirmeye yöneliyor. Verimlilik ile dayanıklılık arasındaki bu denge, küresel ekonominin geleceğini belirleyecek.",
    questions: [
      { id: "l-c1-21-q1", level: "C1", topic: "Çıkarım", question: "Sıradan bir telefon nasıl üretiliyor?", options: ["Onlarca ülkeden parçalarla", "Tek bir fabrikada", "Elde", "Hiçbir yerde"], correctAnswer: 0, explanation: "«onlarca ülkeden gelen parçaların bir araya gelmesiyle»." },
      { id: "l-c1-21-q2", level: "C1", topic: "Detay", question: "Tedarik zincirleri ne sağladı?", options: ["Ucuz üretim ve çeşitlilik", "Pahalı üretim", "Az ürün", "Yavaşlık"], correctAnswer: 0, explanation: "«üretimi ucuzlatıp ürün çeşitliliğini artırdı»." },
      { id: "l-c1-21-q3", level: "C1", topic: "Çıkarım", question: "Krizler neyi gösterdi?", options: ["Sistemin kırılgan olduğunu", "Sistemin mükemmel olduğunu", "Üretimin durduğunu", "Hiçbir şey"], correctAnswer: 0, explanation: "«ne kadar kırılgan olduğunu da gösterdi»." },
      { id: "l-c1-21-q4", level: "C1", topic: "Detay", question: "Şirketler neye yöneliyor?", options: ["Üretimi çeşitlendirmeye", "Tek ülkeye bağlanmaya", "Üretimi durdurmaya", "Hiçbir şeye"], correctAnswer: 0, explanation: "«üretimi çeşitlendirmeye yöneliyor»." },
      { id: "l-c1-21-q5", level: "C1", topic: "Çıkarım", question: "Geleceği ne belirleyecek?", options: ["Verimlilik-dayanıklılık dengesi", "Sadece fiyat", "Sadece hız", "Reklam"], correctAnswer: 0, explanation: "«Verimlilik ile dayanıklılık arasındaki bu denge»." },
    ],
  },
  {
    id: "l-c1-22", level: "C1", topic: "Akademik konuşma",
    title: "Ertelemenin Psikolojisi",
    text: "Konuşmacı: Erteleme, çoğu zaman tembellik olarak görülür; oysa araştırmalar bunun aslında bir duygu yönetimi sorunu olduğunu gösteriyor. Bir görevi ertelediğimizde, genellikle o görevin uyandırdığı kaygı, sıkıntı ya da başarısızlık korkusundan kaçarız. Kısa vadede rahatlarız, ama uzun vadede stres katlanarak artar. İşin sırrı, görevi küçük ve yönetilebilir adımlara bölmek ve kendimize karşı acımasız değil, anlayışlı olmaktır. İlginç bir şekilde, kendini suçlamak ertelemeyi azaltmaz, aksine artırır. Şefkatli bir öz disiplin, en etkili çözümdür.",
    questions: [
      { id: "l-c1-22-q1", level: "C1", topic: "Çıkarım", question: "Erteleme aslında nedir?", options: ["Bir duygu yönetimi sorunu", "Sadece tembellik", "Bir hastalık", "Bir yetenek"], correctAnswer: 0, explanation: "«bir duygu yönetimi sorunu olduğunu»." },
      { id: "l-c1-22-q2", level: "C1", topic: "Çıkarım", question: "Ertelediğimizde neden kaçarız?", options: ["Kaygı ve başarısızlık korkusundan", "Mutluluktan", "Enerjiden", "Hiçbir şeyden"], correctAnswer: 0, explanation: "«kaygı, sıkıntı ya da başarısızlık korkusundan kaçarız»." },
      { id: "l-c1-22-q3", level: "C1", topic: "Detay", question: "Uzun vadede ne olur?", options: ["Stres katlanarak artar", "Stres biter", "Görev kaybolur", "Rahatlarız"], correctAnswer: 0, explanation: "«uzun vadede stres katlanarak artar»." },
      { id: "l-c1-22-q4", level: "C1", topic: "Detay", question: "İşin sırrı nedir?", options: ["Görevi küçük adımlara bölmek", "Daha çok ertelemek", "Kendini suçlamak", "Hiçbir şey"], correctAnswer: 0, explanation: "«görevi küçük ve yönetilebilir adımlara bölmek»." },
      { id: "l-c1-22-q5", level: "C1", topic: "Çıkarım", question: "Kendini suçlamak ne yapar?", options: ["Ertelemeyi artırır", "Ertelemeyi bitirir", "Yardımcı olur", "Etkisizdir"], correctAnswer: 0, explanation: "«kendini suçlamak … aksine artırır»." },
    ],
  },
  {
    id: "l-c1-23", level: "C1", topic: "Konferans",
    title: "Biyoçeşitlilik Kaybı",
    text: "Konuşmacı: Gezegenimiz, türlerin doğal olandan yüzlerce kat daha hızlı yok olduğu bir dönemden geçiyor. Bu, kimi bilim insanlarının 'altıncı kitlesel yok oluş' dediği bir süreç. Çoğu insan, biyoçeşitliliği yalnızca egzotik hayvanların korunması olarak görür; oysa mesele çok daha temeldir. Arılardan toprak bakterilerine kadar her tür, yiyecek üretiminden iklim düzenlemesine uzanan karmaşık bir ağın parçasıdır. Bir türün kaybı, bu ağda öngöremediğimiz çöküşlere yol açabilir. Doğayı korumak, romantik bir tercih değil; kendi varlığımızı sürdürmenin bir koşuludur.",
    questions: [
      { id: "l-c1-23-q1", level: "C1", topic: "Çıkarım", question: "Gezegen nasıl bir dönemden geçiyor?", options: ["Türlerin hızla yok olduğu", "Türlerin arttığı", "Hiçbir değişiklik", "Türlerin değişmediği"], correctAnswer: 0, explanation: "«doğal olandan yüzlerce kat daha hızlı yok olduğu»." },
      { id: "l-c1-23-q2", level: "C1", topic: "Detay", question: "Bilim insanları buna ne diyor?", options: ["Altıncı kitlesel yok oluş", "Yeni başlangıç", "Doğal döngü", "Hiçbir şey"], correctAnswer: 0, explanation: "«'altıncı kitlesel yok oluş' dediği»." },
      { id: "l-c1-23-q3", level: "C1", topic: "Çıkarım", question: "Çoğu insan biyoçeşitliliği nasıl görüyor?", options: ["Sadece egzotik hayvanların korunması", "Temel bir mesele", "Önemsiz", "Bir ağ"], correctAnswer: 0, explanation: "«yalnızca egzotik hayvanların korunması olarak görür»." },
      { id: "l-c1-23-q4", level: "C1", topic: "Detay", question: "Her tür neyin parçası?", options: ["Karmaşık bir ağın", "Bir listenin", "Bir müzenin", "Hiçbir şeyin"], correctAnswer: 0, explanation: "«karmaşık bir ağın parçasıdır»." },
      { id: "l-c1-23-q5", level: "C1", topic: "Çıkarım", question: "Doğayı korumak nedir?", options: ["Varlığımızı sürdürmenin koşulu", "Romantik bir tercih", "Bir lüks", "Gereksiz"], correctAnswer: 0, explanation: "«kendi varlığımızı sürdürmenin bir koşuludur»." },
    ],
  },
  {
    id: "l-c1-24", level: "C1", topic: "Panel",
    title: "Dijital Miras",
    text: "Moderatör: Öldüğümüzde dijital varlıklarımıza ne oluyor? Fotoğraflar, mesajlar, sosyal medya hesapları…\nUzman: Bu, hukukun henüz tam olarak çözemediği yeni bir alan. Eskiden mirası somut nesneler oluştururdu; bugün ise hayatımızın büyük kısmı bulutlarda saklanıyor. Bazı platformlar 'anma hesabı' gibi çözümler sunsa da, çoğu insan dijital varlıkları için bir plan yapmıyor. Bu durum, geride kalanlar için hem duygusal hem de pratik zorluklar yaratıyor. Belki de yakında, tıpkı geleneksel bir vasiyet gibi, 'dijital vasiyet' de hayatımızın normal bir parçası olacak.",
    questions: [
      { id: "l-c1-24-q1", level: "C1", topic: "Çıkarım", question: "Tartışılan konu nedir?", options: ["Ölünce dijital varlıklara ne olduğu", "Para kazanmak", "Telefon almak", "Seyahat"], correctAnswer: 0, explanation: "«dijital varlıklarımıza ne oluyor?»." },
      { id: "l-c1-24-q2", level: "C1", topic: "Detay", question: "Bu alan nasıl bir alan?", options: ["Hukukun çözemediği yeni bir alan", "Eski bir konu", "Çözülmüş bir mesele", "Önemsiz"], correctAnswer: 0, explanation: "«hukukun henüz tam olarak çözemediği yeni bir alan»." },
      { id: "l-c1-24-q3", level: "C1", topic: "Çıkarım", question: "Eskiden mirası ne oluştururdu?", options: ["Somut nesneler", "Veriler", "Hesaplar", "Fotoğraflar"], correctAnswer: 0, explanation: "«mirası somut nesneler oluştururdu»." },
      { id: "l-c1-24-q4", level: "C1", topic: "Detay", question: "Çoğu insan ne yapmıyor?", options: ["Dijital varlıkları için plan", "Fotoğraf çekmiyor", "Hesap açmıyor", "Mesaj atmıyor"], correctAnswer: 0, explanation: "«çoğu insan dijital varlıkları için bir plan yapmıyor»." },
      { id: "l-c1-24-q5", level: "C1", topic: "Çıkarım", question: "Gelecekte ne normalleşebilir?", options: ["Dijital vasiyet", "Kâğıt mektup", "Sözlü miras", "Hiçbir şey"], correctAnswer: 0, explanation: "«'dijital vasiyet' de hayatımızın normal bir parçası olacak»." },
    ],
  },
  {
    id: "l-c1-25", level: "C1", topic: "Akademik konuşma",
    title: "Merakın Değeri",
    text: "Konuşmacı: Eğitim sistemleri çoğu zaman 'doğru cevabı' ödüllendirir, ama asıl değerli olan 'iyi soruyu' sorabilmektir. Tarihteki en büyük buluşlar, hazır cevapları kabul eden değil, herkesin doğru saydığı şeyleri merakla sorgulayan zihinlerden doğdu. Ne yazık ki çocukların doğuştan gelen o sınırsız merakı, yıllar içinde sınav kaygısı ve 'hata yapma korkusu' altında sönükleşebiliyor. Oysa merak, beslendiğinde ömür boyu süren bir öğrenme tutkusuna dönüşür. Bir toplumu ileri taşıyan, ezberlenmiş bilgilerin miktarı değil, sorulan soruların cesaretidir.",
    questions: [
      { id: "l-c1-25-q1", level: "C1", topic: "Çıkarım", question: "Asıl değerli olan nedir?", options: ["İyi soruyu sorabilmek", "Doğru cevabı bilmek", "Çok ezberlemek", "Hızlı olmak"], correctAnswer: 0, explanation: "«asıl değerli olan 'iyi soruyu' sorabilmektir»." },
      { id: "l-c1-25-q2", level: "C1", topic: "Çıkarım", question: "Büyük buluşlar hangi zihinlerden doğdu?", options: ["Sorgulayan zihinlerden", "Cevabı kabul edenlerden", "Sessiz olanlardan", "Hızlı olanlardan"], correctAnswer: 0, explanation: "«herkesin doğru saydığı şeyleri merakla sorgulayan zihinlerden»." },
      { id: "l-c1-25-q3", level: "C1", topic: "Detay", question: "Çocukların merakını ne sönükleştiriyor?", options: ["Sınav kaygısı ve hata korkusu", "Oyunlar", "Kitaplar", "Merak"], correctAnswer: 0, explanation: "«sınav kaygısı ve 'hata yapma korkusu' altında sönükleşebiliyor»." },
      { id: "l-c1-25-q4", level: "C1", topic: "Çıkarım", question: "Merak beslendiğinde neye dönüşür?", options: ["Ömür boyu öğrenme tutkusuna", "Bir yüke", "Sıkıntıya", "Hiçbir şeye"], correctAnswer: 0, explanation: "«ömür boyu süren bir öğrenme tutkusuna dönüşür»." },
      { id: "l-c1-25-q5", level: "C1", topic: "Çıkarım", question: "Toplumu ileri taşıyan nedir?", options: ["Sorulan soruların cesareti", "Ezberlenmiş bilgi miktarı", "Sınav sayısı", "Doğru cevaplar"], correctAnswer: 0, explanation: "«sorulan soruların cesaretidir»." },
    ],
  },
];

export const LISTENING_BY_LEVEL = (lvl: ReadingTask["level"]) =>
  LISTENING_TASKS.filter((t) => t.level === lvl);
