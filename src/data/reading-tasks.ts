/**
 * Reading bank — Turkish texts with comprehension questions.
 * Each task: title + text + 5 questions (D/Y or çoktan seçmeli) + synonym pairs.
 * NOTE: this file is being filled level by level; more texts are appended on request.
 */

import type { ReadingTask } from "./types";

export const READING_TASKS: ReadingTask[] = [
  /* --------------------------------- A1 --------------------------------- */
  {
    id: "r-a1-01", level: "A1", topic: "Tanışma",
    title: "Ailem",
    text: "Benim adım Elif. Ankara'da yaşıyorum. Ailem dört kişi: annem, babam, küçük kardeşim ve ben. Babam doktor, annem öğretmen. Kardeşimin adı Can, o yedi yaşında ve ilkokula gidiyor. Biz küçük bir evde oturuyoruz. Evimizde bir bahçe var. Hafta sonları bahçede oturuyoruz ve çay içiyoruz. Ben turuncu rengi çok seviyorum. Kardeşim ise futbolu seviyor.",
    questions: [
      { id: "r-a1-01-q1", level: "A1", topic: "Detay", question: "Elif nerede yaşıyor?", options: ["Ankara'da", "İstanbul'da", "İzmir'de", "Bursa'da"], correctAnswer: 0, explanation: "В тексте: «Ankara'da yaşıyorum» — Элиф живёт в Анкаре." },
      { id: "r-a1-01-q2", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Elif'in ailesi dört kişidir.»", options: ["Doğru", "Yanlış"], correctAnswer: 0, explanation: "«Ailem dört kişi» — семья из четырёх человек. Верно." },
      { id: "r-a1-01-q3", level: "A1", topic: "Detay", question: "Elif'in babası ne iş yapıyor?", options: ["Doktor", "Öğretmen", "Mühendis", "Polis"], correctAnswer: 0, explanation: "«Babam doktor» — отец врач." },
      { id: "r-a1-01-q4", level: "A1", topic: "Detay", question: "Can kaç yaşında?", options: ["Yedi", "Beş", "On", "Dokuz"], correctAnswer: 0, explanation: "«o yedi yaşında» — Джану семь лет." },
      { id: "r-a1-01-q5", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Evlerinde bahçe yok.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«Evimizde bir bahçe var» — сад есть, поэтому утверждение неверно." },
    ],
    synonyms: [
      { word: "ev", synonym: "konut" },
      { word: "küçük", synonym: "ufak" },
      { word: "sevmek", synonym: "hoşlanmak" },
    ],
  },
  {
    id: "r-a1-02", level: "A1", topic: "Günlük rutin",
    title: "Bir Günüm",
    text: "Her gün saat yedide kalkıyorum. Önce yüzümü yıkıyorum, sonra kahvaltı yapıyorum. Kahvaltıda peynir, ekmek ve çay var. Saat sekizde evden çıkıyorum ve otobüsle işe gidiyorum. Öğlen arkadaşlarımla yemek yiyorum. Akşam saat altıda eve dönüyorum. Akşam yemeğinden sonra biraz televizyon izliyorum ve kitap okuyorum. Saat on birde yatıyorum.",
    questions: [
      { id: "r-a1-02-q1", level: "A1", topic: "Detay", question: "Kişi saat kaçta kalkıyor?", options: ["Yedide", "Altıda", "Sekizde", "Dokuzda"], correctAnswer: 0, explanation: "«saat yedide kalkıyorum» — встаёт в семь." },
      { id: "r-a1-02-q2", level: "A1", topic: "Detay", question: "İşe nasıl gidiyor?", options: ["Otobüsle", "Arabayla", "Yürüyerek", "Trenle"], correctAnswer: 0, explanation: "«otobüsle işe gidiyorum» — на автобусе." },
      { id: "r-a1-02-q3", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Kahvaltıda peynir yiyor.»", options: ["Doğru", "Yanlış"], correctAnswer: 0, explanation: "«Kahvaltıda peynir, ekmek ve çay var» — да, сыр на завтрак." },
      { id: "r-a1-02-q4", level: "A1", topic: "Detay", question: "Akşam eve saat kaçta dönüyor?", options: ["Altıda", "Yedide", "Beşte", "On birde"], correctAnswer: 0, explanation: "«Akşam saat altıda eve dönüyorum» — возвращается в шесть." },
      { id: "r-a1-02-q5", level: "A1", topic: "Detay", question: "Yatmadan önce ne yapıyor?", options: ["Kitap okuyor", "Spor yapıyor", "Yemek pişiriyor", "Müzik dinliyor"], correctAnswer: 0, explanation: "«kitap okuyorum. Saat on birde yatıyorum» — перед сном читает книгу." },
    ],
    synonyms: [
      { word: "kalkmak", synonym: "uyanmak" },
      { word: "dönmek", synonym: "geri gelmek" },
      { word: "izlemek", synonym: "seyretmek" },
    ],
  },

  /* --------------------------------- A2 --------------------------------- */
  {
    id: "r-a2-01", level: "A2", topic: "Şehir",
    title: "Yaşadığım Şehir",
    text: "İzmir, Türkiye'nin batısında, deniz kenarında büyük bir şehirdir. Havası ılıman, insanları çok sıcakkanlıdır. Şehirde tarihî yerler, müzeler ve güzel parklar vardır. Yazın hava çok sıcak olur, bu yüzden insanlar denize gider. Kışın ise hava genellikle yağmurlu geçer. İzmir'de toplu taşıma oldukça gelişmiştir; metro, otobüs ve vapurla her yere kolayca ulaşabilirsiniz. Ben bu şehri özellikle deniz manzarası için seviyorum.",
    questions: [
      { id: "r-a2-01-q1", level: "A2", topic: "Detay", question: "İzmir Türkiye'nin neresindedir?", options: ["Batısında", "Doğusunda", "Kuzeyinde", "Ortasında"], correctAnswer: 0, explanation: "«Türkiye'nin batısında» — на западе Турции." },
      { id: "r-a2-01-q2", level: "A2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «İzmir deniz kenarında değildir.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«deniz kenarında büyük bir şehirdir» — у моря, утверждение неверно." },
      { id: "r-a2-01-q3", level: "A2", topic: "Detay", question: "Yazın insanlar genellikle nereye gider?", options: ["Denize", "Dağa", "Müzeye", "Ormana"], correctAnswer: 0, explanation: "«insanlar denize gider» — летом на море." },
      { id: "r-a2-01-q4", level: "A2", topic: "Detay", question: "Metinde hangi ulaşım aracı geçmiyor?", options: ["Uçak", "Metro", "Otobüs", "Vapur"], correctAnswer: 0, explanation: "Упомянуты metro, otobüs, vapur; самолёт (uçak) не назван." },
      { id: "r-a2-01-q5", level: "A2", topic: "Çıkarım", question: "Yazar İzmir'i en çok neden seviyor?", options: ["Deniz manzarası için", "Müzeleri için", "Yağmuru için", "Metrosu için"], correctAnswer: 0, explanation: "«deniz manzarası için seviyorum» — за вид на море." },
    ],
    synonyms: [
      { word: "ılıman", synonym: "yumuşak" },
      { word: "ulaşmak", synonym: "varmak" },
      { word: "gelişmiş", synonym: "ileri" },
    ],
  },
  {
    id: "r-a2-02", level: "A2", topic: "Sağlıklı yaşam",
    title: "Sağlıklı Beslenme",
    text: "Sağlıklı yaşamak için dengeli beslenmek çok önemlidir. Her gün sebze ve meyve yemeliyiz. Çok şekerli ve yağlı yiyeceklerden uzak durmalıyız. Ayrıca bol su içmek vücudumuz için faydalıdır. Uzmanlar günde en az iki litre su içmeyi öneriyor. Düzenli spor yapmak da sağlığımızı korur. Haftada üç gün yürüyüş yapmak bile yeterlidir. Yeterli uyku uyumak ise hem bedenimizi hem zihnimizi dinlendirir.",
    questions: [
      { id: "r-a2-02-q1", level: "A2", topic: "Detay", question: "Her gün ne yememiz öneriliyor?", options: ["Sebze ve meyve", "Şeker ve yağ", "Sadece et", "Sadece ekmek"], correctAnswer: 0, explanation: "«Her gün sebze ve meyve yemeliyiz»." },
      { id: "r-a2-02-q2", level: "A2", topic: "Detay", question: "Uzmanlar günde ne kadar su öneriyor?", options: ["En az iki litre", "Yarım litre", "Beş litre", "Bir bardak"], correctAnswer: 0, explanation: "«günde en az iki litre su» — минимум два литра." },
      { id: "r-a2-02-q3", level: "A2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Haftada üç gün yürüyüş yeterlidir.»", options: ["Doğru", "Yanlış"], correctAnswer: 0, explanation: "«Haftada üç gün yürüyüş yapmak bile yeterlidir» — верно." },
      { id: "r-a2-02-q4", level: "A2", topic: "Çıkarım", question: "Metne göre neyden uzak durmalıyız?", options: ["Şekerli ve yağlı yiyeceklerden", "Sudan", "Sebzeden", "Uykudan"], correctAnswer: 0, explanation: "«şekerli ve yağlı yiyeceklerden uzak durmalıyız»." },
      { id: "r-a2-02-q5", level: "A2", topic: "Detay", question: "Yeterli uyku neyi dinlendirir?", options: ["Beden ve zihni", "Sadece bedeni", "Sadece zihni", "Hiçbir şeyi"], correctAnswer: 0, explanation: "«hem bedenimizi hem zihnimizi dinlendirir»." },
    ],
    synonyms: [
      { word: "faydalı", synonym: "yararlı" },
      { word: "korumak", synonym: "muhafaza etmek" },
      { word: "düzenli", synonym: "muntazam" },
    ],
  },

  /* --------------------------------- B1 --------------------------------- */
  {
    id: "r-b1-01", level: "B1", topic: "Eğitim",
    title: "Türkiye'de Üniversite Eğitimi",
    text: "Türkiye'de üniversiteye girmek isteyen öğrenciler merkezî bir sınava girer. Bu sınav her yıl milyonlarca öğrencinin katıldığı zorlu bir aşamadır. Öğrenciler aldıkları puana göre devlet ya da vakıf üniversitelerini tercih ederler. Devlet üniversiteleri genellikle ücretsizdir; vakıf üniversiteleri ise ücretlidir ancak daha küçük sınıflarda eğitim sunar. Son yıllarda yabancı öğrenci sayısı da hızla artmaktadır. Birçok üniversite, uluslararası öğrenciler için Türkçe hazırlık programları açmıştır. Bu programlar sayesinde öğrenciler hem dili öğrenir hem de kültüre uyum sağlar.",
    questions: [
      { id: "r-b1-01-q1", level: "B1", topic: "Detay", question: "Üniversiteye girmek için öğrenciler ne yapar?", options: ["Merkezî bir sınava girer", "Mülakata katılır", "Sadece başvuru yapar", "Yurt dışına gider"], correctAnswer: 0, explanation: "«merkezî bir sınava girer» — сдают центральный экзамен." },
      { id: "r-b1-01-q2", level: "B1", topic: "Detay", question: "Vakıf üniversiteleri hakkında ne söyleniyor?", options: ["Ücretlidir ama sınıflar küçüktür", "Tamamen ücretsizdir", "Sadece yabancılar içindir", "Sınav istemez"], correctAnswer: 0, explanation: "«vakıf üniversiteleri ise ücretlidir ancak daha küçük sınıflarda eğitim sunar»." },
      { id: "r-b1-01-q3", level: "B1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Yabancı öğrenci sayısı azalıyor.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«yabancı öğrenci sayısı da hızla artmaktadır» — растёт, значит неверно." },
      { id: "r-b1-01-q4", level: "B1", topic: "Detay", question: "Hazırlık programları öğrencilere ne sağlar?", options: ["Dili öğrenir ve kültüre uyum sağlar", "Para kazandırır", "Sınavdan muaf tutar", "Diploma verir"], correctAnswer: 0, explanation: "«hem dili öğrenir hem de kültüre uyum sağlar»." },
      { id: "r-b1-01-q5", level: "B1", topic: "Çıkarım", question: "Metnin ana konusu nedir?", options: ["Türkiye'de üniversite eğitimi", "Türk mutfağı", "İklim değişikliği", "Spor etkinlikleri"], correctAnswer: 0, explanation: "Весь текст о высшем образовании в Турции." },
    ],
    synonyms: [
      { word: "zorlu", synonym: "çetin" },
      { word: "tercih etmek", synonym: "seçmek" },
      { word: "artmak", synonym: "çoğalmak" },
    ],
  },
  {
    id: "r-b1-02", level: "B1", topic: "Teknoloji",
    title: "İnternet ve Günlük Hayat",
    text: "İnternet, son yirmi yılda hayatımızı kökten değiştirdi. Artık alışveriş yapmak, fatura ödemek veya bir doktordan randevu almak için evden çıkmamıza gerek yok. Öğrenciler dersleri çevrim içi takip edebiliyor, çalışanlar evden iş yapabiliyor. Ancak internetin bazı olumsuz yönleri de var. Uzun süre ekran karşısında kalmak göz sağlığını bozabilir ve insanları hareketsizliğe itebilir. Ayrıca sosyal medyada geçirilen fazla zaman, gerçek hayattaki ilişkileri zayıflatabilir. Bu yüzden interneti bilinçli ve dengeli kullanmak gerekir.",
    questions: [
      { id: "r-b1-02-q1", level: "B1", topic: "Detay", question: "Metne göre internet sayesinde ne yapabiliyoruz?", options: ["Evden fatura ödeyebiliyoruz", "Daha çok uyuyabiliyoruz", "Daha az okuyoruz", "Yemek pişiremiyoruz"], correctAnswer: 0, explanation: "«fatura ödemek … için evden çıkmamıza gerek yok»." },
      { id: "r-b1-02-q2", level: "B1", topic: "Detay", question: "İnternetin olumsuz yönlerinden biri nedir?", options: ["Göz sağlığını bozabilir", "Suyu kirletir", "Havayı temizler", "Uykuyu artırır"], correctAnswer: 0, explanation: "«göz sağlığını bozabilir ve insanları hareketsizliğe itebilir»." },
      { id: "r-b1-02-q3", level: "B1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Sosyal medya gerçek ilişkileri güçlendirir.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "В тексте сказано, что чрезмерное время в соцсетях «ilişkileri zayıflatabilir» — ослабляет." },
      { id: "r-b1-02-q4", level: "B1", topic: "Çıkarım", question: "Yazara göre interneti nasıl kullanmalıyız?", options: ["Bilinçli ve dengeli", "Mümkün olduğunca çok", "Hiç kullanmadan", "Sadece gece"], correctAnswer: 0, explanation: "«interneti bilinçli ve dengeli kullanmak gerekir»." },
      { id: "r-b1-02-q5", level: "B1", topic: "Detay", question: "Çalışanlar internet sayesinde ne yapabiliyor?", options: ["Evden iş yapabiliyor", "Hiç çalışmıyor", "Sadece tatil yapıyor", "Daha az kazanıyor"], correctAnswer: 0, explanation: "«çalışanlar evden iş yapabiliyor»." },
    ],
    synonyms: [
      { word: "değiştirmek", synonym: "dönüştürmek" },
      { word: "olumsuz", synonym: "negatif" },
      { word: "zayıflatmak", synonym: "güçsüzleştirmek" },
    ],
  },
  {
    id: "r-b1-03", level: "B1", topic: "Gelenekler",
    title: "Türk Çay Kültürü",
    text: "Çay, Türk kültürünün ayrılmaz bir parçasıdır. Türkiye'de çay, sabahtan akşama kadar her ortamda içilir. Misafir geldiğinde ona ilk olarak çay ikram edilir; bu, bir nezaket göstergesidir. Çay, ince belli bardaklarda servis edilir ve genellikle şekerle içilir. Karadeniz Bölgesi, Türkiye'nin en önemli çay üretim merkezidir. Özellikle Rize ili, çay bahçeleriyle ünlüdür. Çay yalnızca bir içecek değil, aynı zamanda sohbetin ve dostluğun da simgesidir. İnsanlar çay içerken konuşur, dertleşir ve birbirine yakınlaşır.",
    questions: [
      { id: "r-b1-03-q1", level: "B1", topic: "Detay", question: "Misafire ilk olarak ne ikram edilir?", options: ["Çay", "Kahve", "Su", "Tatlı"], correctAnswer: 0, explanation: "«ona ilk olarak çay ikram edilir»." },
      { id: "r-b1-03-q2", level: "B1", topic: "Detay", question: "Türkiye'nin en önemli çay üretim merkezi neresidir?", options: ["Karadeniz Bölgesi", "Akdeniz Bölgesi", "İç Anadolu", "Marmara"], correctAnswer: 0, explanation: "«Karadeniz Bölgesi, … en önemli çay üretim merkezidir»." },
      { id: "r-b1-03-q3", level: "B1", topic: "Detay", question: "Hangi il çay bahçeleriyle ünlüdür?", options: ["Rize", "Antalya", "Konya", "Edirne"], correctAnswer: 0, explanation: "«özellikle Rize ili, çay bahçeleriyle ünlüdür»." },
      { id: "r-b1-03-q4", level: "B1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Çay sadece sabahları içilir.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«sabahtan akşama kadar her ortamda içilir» — пьют целый день, неверно." },
      { id: "r-b1-03-q5", level: "B1", topic: "Çıkarım", question: "Metne göre çay neyin simgesidir?", options: ["Sohbet ve dostluğun", "Zenginliğin", "Yarışın", "Yalnızlığın"], correctAnswer: 0, explanation: "«sohbetin ve dostluğun da simgesidir»." },
    ],
    synonyms: [
      { word: "ayrılmaz", synonym: "vazgeçilmez" },
      { word: "ikram etmek", synonym: "sunmak" },
      { word: "simge", synonym: "sembol" },
    ],
  },

  /* --------------------------------- B2 --------------------------------- */
  {
    id: "r-b2-01", level: "B2", topic: "Çevre",
    title: "Şehirlerde Yeşil Alanların Önemi",
    text: "Hızlı kentleşme, dünyanın birçok büyük şehrinde yeşil alanların giderek azalmasına yol açmaktadır. Oysa parklar ve bahçeler, kentsel yaşamın vazgeçilmez unsurlarındandır. Yeşil alanlar yalnızca şehre estetik bir görünüm kazandırmakla kalmaz, aynı zamanda havayı temizler ve sıcaklığı düşürür. Araştırmalar, ağaçlarla kaplı bölgelerde hava kirliliğinin belirgin biçimde azaldığını göstermektedir. Bunun yanı sıra yeşil alanlar, insanların stresini azaltarak ruh sağlığına katkıda bulunur. Bu nedenle şehir planlamacılarının, yeni yapılaşma projelerinde yeşil alanlara öncelik vermesi büyük önem taşımaktadır.",
    questions: [
      { id: "r-b2-01-q1", level: "B2", topic: "Detay", question: "Hızlı kentleşmenin sonucu nedir?", options: ["Yeşil alanların azalması", "Nüfusun azalması", "Havanın temizlenmesi", "Parkların çoğalması"], correctAnswer: 0, explanation: "«yeşil alanların giderek azalmasına yol açmaktadır»." },
      { id: "r-b2-01-q2", level: "B2", topic: "Detay", question: "Araştırmalar neyi gösteriyor?", options: ["Ağaçlı bölgelerde kirliliğin azaldığını", "Şehirlerin büyüdüğünü", "Suyun kirlendiğini", "Nüfusun arttığını"], correctAnswer: 0, explanation: "«ağaçlarla kaplı bölgelerde hava kirliliğinin … azaldığını»." },
      { id: "r-b2-01-q3", level: "B2", topic: "Çıkarım", question: "Yeşil alanların ruh sağlığına katkısı nasıl olur?", options: ["Stresi azaltarak", "Geliri artırarak", "Gürültüyü çoğaltarak", "Trafiği hızlandırarak"], correctAnswer: 0, explanation: "«insanların stresini azaltarak ruh sağlığına katkıda bulunur»." },
      { id: "r-b2-01-q4", level: "B2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Yeşil alanlar sıcaklığı artırır.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«sıcaklığı düşürür» — снижают температуру, утверждение неверно." },
      { id: "r-b2-01-q5", level: "B2", topic: "Çıkarım", question: "Yazar şehir planlamacılarından ne istiyor?", options: ["Yeşil alanlara öncelik vermelerini", "Daha çok bina yapmalarını", "Parkları kapatmalarını", "Ağaçları kesmelerini"], correctAnswer: 0, explanation: "«yeşil alanlara öncelik vermesi büyük önem taşımaktadır»." },
    ],
    synonyms: [
      { word: "vazgeçilmez", synonym: "olmazsa olmaz" },
      { word: "belirgin", synonym: "açık" },
      { word: "katkıda bulunmak", synonym: "yardımcı olmak" },
    ],
  },
  {
    id: "r-b2-02", level: "B2", topic: "Toplum",
    title: "Kitap Okuma Alışkanlığı",
    text: "Günümüzde dijital cihazların yaygınlaşmasıyla birlikte kitap okuma alışkanlığının azaldığı sıkça dile getirilmektedir. Birçok insan, boş zamanlarını telefon ekranına bakarak geçirmeyi tercih ediyor. Ancak okumak, hayal gücünü geliştiren ve kelime dağarcığını zenginleştiren eşsiz bir etkinliktir. Düzenli okuyan kişiler, olaylara daha geniş bir açıdan bakabilir ve eleştirel düşünme becerisi kazanır. Okuma alışkanlığının küçük yaşta kazandırılması özellikle önemlidir; çünkü çocuklukta edinilen alışkanlıklar ömür boyu sürer. Bu nedenle ailelerin ve okulların çocukları kitapla buluşturması gerekir.",
    questions: [
      { id: "r-b2-02-q1", level: "B2", topic: "Detay", question: "Kitap okuma alışkanlığının azalmasının nedeni nedir?", options: ["Dijital cihazların yaygınlaşması", "Kitapların pahalanması", "Kütüphanelerin artması", "Havaların soğuması"], correctAnswer: 0, explanation: "«dijital cihazların yaygınlaşmasıyla … azaldığı»." },
      { id: "r-b2-02-q2", level: "B2", topic: "Detay", question: "Okumak neyi zenginleştirir?", options: ["Kelime dağarcığını", "Banka hesabını", "Trafiği", "Hava kalitesini"], correctAnswer: 0, explanation: "«kelime dağarcığını zenginleştiren eşsiz bir etkinliktir»." },
      { id: "r-b2-02-q3", level: "B2", topic: "Çıkarım", question: "Düzenli okuyan kişiler hangi beceriyi kazanır?", options: ["Eleştirel düşünme", "Hızlı koşma", "Daha çok uyuma", "Para biriktirme"], correctAnswer: 0, explanation: "«eleştirel düşünme becerisi kazanır»." },
      { id: "r-b2-02-q4", level: "B2", topic: "Detay", question: "Okuma alışkanlığı ne zaman kazandırılmalı?", options: ["Küçük yaşta", "Emeklilikte", "Üniversitede", "Hiçbir zaman"], correctAnswer: 0, explanation: "«küçük yaşta kazandırılması özellikle önemlidir»." },
      { id: "r-b2-02-q5", level: "B2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Çocuklukta edinilen alışkanlıklar çabuk unutulur.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«çocuklukta edinilen alışkanlıklar ömür boyu sürer» — сохраняются на всю жизнь." },
    ],
    synonyms: [
      { word: "yaygınlaşmak", synonym: "yayılmak" },
      { word: "eşsiz", synonym: "benzersiz" },
      { word: "edinmek", synonym: "kazanmak" },
    ],
  },

  /* --------------------------------- C1 --------------------------------- */
  {
    id: "r-c1-01", level: "C1", topic: "Bilim ve teknoloji",
    title: "Yapay Zekânın Toplumsal Etkileri",
    text: "Yapay zekâ teknolojileri, son yıllarda baş döndürücü bir hızla gelişerek yalnızca bilim dünyasını değil, gündelik yaşamın hemen her alanını dönüştürmektedir. Sağlıktan eğitime, ulaşımdan üretime kadar pek çok sektörde yapay zekâ uygulamaları verimliliği artırmakta ve insan hatasını en aza indirmektedir. Ne var ki bu hızlı dönüşüm, beraberinde önemli soruları da getirmektedir. Otomasyonun yaygınlaşması, belirli mesleklerin ortadan kalkmasına yol açabilir; bu durum, işsizlik ve gelir adaletsizliği gibi toplumsal sorunları derinleştirme riski taşır. Bunun yanı sıra, kişisel verilerin toplanması ve kullanılması, mahremiyetin korunması konusunda ciddi endişeler doğurmaktadır. Dolayısıyla teknolojik ilerlemenin etik ilkelerle dengelenmesi, geleceğin en kritik meselelerinden biri hâline gelmiştir. Uzmanlara göre, yapay zekânın insanlığın yararına kullanılabilmesi için saydam ve denetlenebilir yasal düzenlemelere ihtiyaç vardır.",
    questions: [
      { id: "r-c1-01-q1", level: "C1", topic: "Detay", question: "Yapay zekâ hangi alanları dönüştürüyor?", options: ["Gündelik yaşamın hemen her alanını", "Yalnızca eğitimi", "Sadece bilim dünyasını", "Yalnızca ulaşımı"], correctAnswer: 0, explanation: "«gündelik yaşamın hemen her alanını dönüştürmektedir»." },
      { id: "r-c1-01-q2", level: "C1", topic: "Çıkarım", question: "Otomasyonun yaygınlaşması neye yol açabilir?", options: ["Bazı mesleklerin ortadan kalkmasına", "Nüfusun azalmasına", "İklimin değişmesine", "Eğitimin ücretsiz olmasına"], correctAnswer: 0, explanation: "«belirli mesleklerin ortadan kalkmasına yol açabilir»." },
      { id: "r-c1-01-q3", level: "C1", topic: "Detay", question: "Kişisel verilerin kullanımı hangi endişeyi doğuruyor?", options: ["Mahremiyetin korunması", "Trafiğin artması", "Suyun kirlenmesi", "Enflasyonun düşmesi"], correctAnswer: 0, explanation: "«mahremiyetin korunması konusunda ciddi endişeler doğurmaktadır»." },
      { id: "r-c1-01-q4", level: "C1", topic: "Çıkarım", question: "Yazara göre geleceğin kritik meselesi nedir?", options: ["İlerlemenin etik ilkelerle dengelenmesi", "Daha hızlı bilgisayarlar üretmek", "İnternetin yasaklanması", "Robotların durdurulması"], correctAnswer: 0, explanation: "«teknolojik ilerlemenin etik ilkelerle dengelenmesi … kritik meselelerinden biri»." },
      { id: "r-c1-01-q5", level: "C1", topic: "Detay", question: "Uzmanlara göre neye ihtiyaç vardır?", options: ["Saydam ve denetlenebilir yasal düzenlemelere", "Daha az araştırmaya", "Daha fazla reklama", "Yeni binalara"], correctAnswer: 0, explanation: "«saydam ve denetlenebilir yasal düzenlemelere ihtiyaç vardır»." },
    ],
    synonyms: [
      { word: "dönüştürmek", synonym: "değiştirmek" },
      { word: "verimlilik", synonym: "üretkenlik" },
      { word: "endişe", synonym: "kaygı" },
    ],
  },

  /* --------------------------- A1 (devam) --------------------------- */
  {
    id: "r-a1-03", level: "A1", topic: "Hobi",
    title: "Benim Hobilerim",
    text: "Boş zamanlarımda kitap okumayı çok severim. Hafta sonları arkadaşlarımla parka giderim ve bisiklete binerim. Bazen evde müzik dinlerim. En sevdiğim hobi ise resim yapmak. Her akşam yarım saat resim yaparım. Bu beni çok mutlu ediyor.",
    questions: [
      { id: "r-a1-03-q1", level: "A1", topic: "Detay", question: "Boş zamanında en çok ne yapmayı sever?", options: ["Kitap okumayı", "Yemek yapmayı", "Uyumayı", "Çalışmayı"], correctAnswer: 0, explanation: "«kitap okumayı çok severim»." },
      { id: "r-a1-03-q2", level: "A1", topic: "Detay", question: "Hafta sonu arkadaşlarıyla nereye gider?", options: ["Parka", "Okula", "Markete", "Sinemaya"], correctAnswer: 0, explanation: "«arkadaşlarımla parka giderim»." },
      { id: "r-a1-03-q3", level: "A1", topic: "Detay", question: "En sevdiği hobi nedir?", options: ["Resim yapmak", "Yüzmek", "Koşmak", "Dans etmek"], correctAnswer: 0, explanation: "«En sevdiğim hobi ise resim yapmak»." },
      { id: "r-a1-03-q4", level: "A1", topic: "Detay", question: "Her akşam ne kadar resim yapar?", options: ["Yarım saat", "Bir saat", "İki saat", "On dakika"], correctAnswer: 0, explanation: "«Her akşam yarım saat resim yaparım»." },
      { id: "r-a1-03-q5", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Resim yapmak onu mutsuz ediyor.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«Bu beni çok mutlu ediyor» — делает счастливым." },
    ],
    synonyms: [
      { word: "sevmek", synonym: "hoşlanmak" },
      { word: "boş zaman", synonym: "serbest zaman" },
      { word: "mutlu", synonym: "sevinçli" },
    ],
  },
  {
    id: "r-a1-04", level: "A1", topic: "Hava durumu",
    title: "Bugün Hava Nasıl?",
    text: "Bugün hava çok güzel. Güneş parlıyor ve gökyüzü mavi. Sıcaklık yirmi derece. İnsanlar parkta yürüyor. Çocuklar dışarıda oynuyor. Ben de bugün dışarı çıkacağım. Akşam belki hava biraz serin olur, bu yüzden yanıma bir ceket alacağım.",
    questions: [
      { id: "r-a1-04-q1", level: "A1", topic: "Detay", question: "Bugün hava nasıl?", options: ["Güzel", "Yağmurlu", "Karlı", "Sisli"], correctAnswer: 0, explanation: "«Bugün hava çok güzel»." },
      { id: "r-a1-04-q2", level: "A1", topic: "Detay", question: "Sıcaklık kaç derece?", options: ["Yirmi", "On", "Otuz", "Beş"], correctAnswer: 0, explanation: "«Sıcaklık yirmi derece»." },
      { id: "r-a1-04-q3", level: "A1", topic: "Detay", question: "Çocuklar ne yapıyor?", options: ["Dışarıda oynuyor", "Ders çalışıyor", "Uyuyor", "Yemek yiyor"], correctAnswer: 0, explanation: "«Çocuklar dışarıda oynuyor»." },
      { id: "r-a1-04-q4", level: "A1", topic: "Detay", question: "Akşam için yanına ne alacak?", options: ["Ceket", "Şemsiye", "Şapka", "Çanta"], correctAnswer: 0, explanation: "«yanıma bir ceket alacağım»." },
      { id: "r-a1-04-q5", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Gökyüzü bulutlu.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«gökyüzü mavi» — небо синее, ясно." },
    ],
    synonyms: [
      { word: "güzel", synonym: "hoş" },
      { word: "serin", synonym: "soğukça" },
      { word: "parlamak", synonym: "ışıldamak" },
    ],
  },
  {
    id: "r-a1-05", level: "A1", topic: "Yemek",
    title: "Kahvaltı",
    text: "Türkiye'de kahvaltı çok önemlidir. Sabah sofrada peynir, zeytin, domates, salatalık ve bal olur. Yanında taze ekmek ve sıcak çay içilir. Hafta sonu kahvaltısı daha uzun ve keyiflidir. Aile birlikte oturur ve sohbet eder. Ben en çok bal ile ekmeği severim.",
    questions: [
      { id: "r-a1-05-q1", level: "A1", topic: "Detay", question: "Kahvaltıda ne içilir?", options: ["Sıcak çay", "Soğuk kola", "Meyve suyu", "Ayran"], correctAnswer: 0, explanation: "«sıcak çay içilir»." },
      { id: "r-a1-05-q2", level: "A1", topic: "Detay", question: "Sofrada hangisi yoktur?", options: ["Pizza", "Peynir", "Zeytin", "Bal"], correctAnswer: 0, explanation: "Перечислены peynir, zeytin, domates, salatalık, bal; пиццы нет." },
      { id: "r-a1-05-q3", level: "A1", topic: "Detay", question: "Hafta sonu kahvaltısı nasıldır?", options: ["Uzun ve keyifli", "Kısa", "Yorucu", "Pahalı"], correctAnswer: 0, explanation: "«daha uzun ve keyiflidir»." },
      { id: "r-a1-05-q4", level: "A1", topic: "Detay", question: "Yazar en çok neyi sever?", options: ["Bal ile ekmek", "Peynir", "Zeytin", "Çay"], correctAnswer: 0, explanation: "«en çok bal ile ekmeği severim»." },
      { id: "r-a1-05-q5", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Türkiye'de kahvaltı önemsizdir.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«kahvaltı çok önemlidir»." },
    ],
    synonyms: [
      { word: "önemli", synonym: "mühim" },
      { word: "keyifli", synonym: "zevkli" },
      { word: "sohbet etmek", synonym: "konuşmak" },
    ],
  },

  /* --------------------------- A2 (devam) --------------------------- */
  {
    id: "r-a2-03", level: "A2", topic: "Seyahat",
    title: "Kapadokya Gezisi",
    text: "Geçen yaz ailemle Kapadokya'ya gittik. Orası gerçekten büyüleyici bir yer. Peri bacaları çok ilginçti. Sabah erken kalkıp balon turuna katıldık. Gökyüzünden manzara nefes kesiciydi. Ayrıca yer altı şehirlerini gezdik ve yerel yemekler tattık. Bu gezi hayatımızın en güzel tatillerinden biriydi.",
    questions: [
      { id: "r-a2-03-q1", level: "A2", topic: "Detay", question: "Aile nereye gitti?", options: ["Kapadokya'ya", "Antalya'ya", "İzmir'e", "Bursa'ya"], correctAnswer: 0, explanation: "«Kapadokya'ya gittik»." },
      { id: "r-a2-03-q2", level: "A2", topic: "Detay", question: "Sabah neye katıldılar?", options: ["Balon turuna", "Tekne turuna", "Şehir turuna", "Müze turuna"], correctAnswer: 0, explanation: "«balon turuna katıldık»." },
      { id: "r-a2-03-q3", level: "A2", topic: "Detay", question: "Ne tattılar?", options: ["Yerel yemekler", "Deniz ürünleri", "Tatlılar", "İçecekler"], correctAnswer: 0, explanation: "«yerel yemekler tattık»." },
      { id: "r-a2-03-q4", level: "A2", topic: "Çıkarım", question: "Yazara göre gezi nasıldı?", options: ["Çok güzeldi", "Sıkıcıydı", "Kötüydü", "Sıradandı"], correctAnswer: 0, explanation: "«en güzel tatillerinden biriydi»." },
      { id: "r-a2-03-q5", level: "A2", topic: "Detay", question: "Kapadokya'da neyi ilginç buldu?", options: ["Peri bacalarını", "Plajları", "Alışveriş merkezlerini", "Stadyumları"], correctAnswer: 0, explanation: "«Peri bacaları çok ilginçti»." },
    ],
    synonyms: [
      { word: "büyüleyici", synonym: "etkileyici" },
      { word: "nefes kesici", synonym: "muhteşem" },
      { word: "gezmek", synonym: "dolaşmak" },
    ],
  },
  {
    id: "r-a2-04", level: "A2", topic: "İş",
    title: "Yeni Bir İş",
    text: "Geçen ay yeni bir işe başladım. Bir teknoloji şirketinde çalışıyorum. İlk günler biraz zordu çünkü her şey yeniydi. Ama iş arkadaşlarım çok yardımcı oldu. Şimdi işimi çok seviyorum. Her gün yeni şeyler öğreniyorum. Ofis evime yakın, bu yüzden işe yürüyerek gidiyorum.",
    questions: [
      { id: "r-a2-04-q1", level: "A2", topic: "Detay", question: "Nerede çalışıyor?", options: ["Teknoloji şirketinde", "Hastanede", "Okulda", "Restoranda"], correctAnswer: 0, explanation: "«Bir teknoloji şirketinde çalışıyorum»." },
      { id: "r-a2-04-q2", level: "A2", topic: "Detay", question: "İlk günler neden zordu?", options: ["Her şey yeniydi", "İş çok kolaydı", "Maaş azdı", "Ofis uzaktı"], correctAnswer: 0, explanation: "«her şey yeniydi»." },
      { id: "r-a2-04-q3", level: "A2", topic: "Detay", question: "Kim yardımcı oldu?", options: ["İş arkadaşları", "Ailesi", "Komşuları", "Öğretmenleri"], correctAnswer: 0, explanation: "«iş arkadaşlarım çok yardımcı oldu»." },
      { id: "r-a2-04-q4", level: "A2", topic: "Detay", question: "İşe nasıl gidiyor?", options: ["Yürüyerek", "Otobüsle", "Arabayla", "Metroyla"], correctAnswer: 0, explanation: "«işe yürüyerek gidiyorum»." },
      { id: "r-a2-04-q5", level: "A2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Artık işini sevmiyor.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«Şimdi işimi çok seviyorum»." },
    ],
    synonyms: [
      { word: "zor", synonym: "güç" },
      { word: "yardımcı olmak", synonym: "destek olmak" },
      { word: "yakın", synonym: "uzak olmayan" },
    ],
  },
  {
    id: "r-a2-05", level: "A2", topic: "Spor",
    title: "Sabah Sporu",
    text: "Sağlıklı kalmak için her sabah spor yapıyorum. Genellikle parkta koşuyorum veya yürüyüş yapıyorum. Bazen evde basit egzersizler de yapıyorum. Spor bana enerji veriyor ve günüme iyi başlıyorum. Arkadaşım da bana katıldı; artık birlikte spor yapmak daha eğlenceli.",
    questions: [
      { id: "r-a2-05-q1", level: "A2", topic: "Detay", question: "Ne zaman spor yapıyor?", options: ["Her sabah", "Her akşam", "Hafta sonu", "Ayda bir"], correctAnswer: 0, explanation: "«her sabah spor yapıyorum»." },
      { id: "r-a2-05-q2", level: "A2", topic: "Detay", question: "Parkta genellikle ne yapıyor?", options: ["Koşuyor veya yürüyor", "Yüzüyor", "Bisiklete biniyor", "Top oynuyor"], correctAnswer: 0, explanation: "«parkta koşuyorum veya yürüyüş yapıyorum»." },
      { id: "r-a2-05-q3", level: "A2", topic: "Çıkarım", question: "Spor ona ne veriyor?", options: ["Enerji", "Para", "Uyku", "Stres"], correctAnswer: 0, explanation: "«Spor bana enerji veriyor»." },
      { id: "r-a2-05-q4", level: "A2", topic: "Detay", question: "Kim ona katıldı?", options: ["Arkadaşı", "Kardeşi", "Annesi", "Komşusu"], correctAnswer: 0, explanation: "«Arkadaşım da bana katıldı»." },
      { id: "r-a2-05-q5", level: "A2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Birlikte spor yapmak daha eğlenceli.»", options: ["Doğru", "Yanlış"], correctAnswer: 0, explanation: "«birlikte spor yapmak daha eğlenceli»." },
    ],
    synonyms: [
      { word: "sağlıklı", synonym: "sıhhatli" },
      { word: "eğlenceli", synonym: "zevkli" },
      { word: "enerji", synonym: "güç" },
    ],
  },

  /* --------------------------- B1 (devam) --------------------------- */
  {
    id: "r-b1-04", level: "B1", topic: "Teknoloji",
    title: "Akıllı Telefonlar",
    text: "Akıllı telefonlar hayatımızın vazgeçilmez bir parçası oldu. Onlarla haberleşiyor, alışveriş yapıyor, yol buluyor ve hatta çalışıyoruz. Ancak bu cihazlara aşırı bağımlılık bazı sorunlar da getiriyor. Birçok kişi telefonu olmadan kendini huzursuz hissediyor. Uzmanlar, ekran süresini sınırlamayı ve gerçek hayattaki ilişkilere zaman ayırmayı öneriyor. Dengeli kullanım en doğru yoldur.",
    questions: [
      { id: "r-b1-04-q1", level: "B1", topic: "Detay", question: "Akıllı telefonlarla neler yapıyoruz?", options: ["Haberleşme, alışveriş, yol bulma", "Sadece oyun oynama", "Sadece arama", "Hiçbir şey"], correctAnswer: 0, explanation: "«haberleşiyor, alışveriş yapıyor, yol buluyor»." },
      { id: "r-b1-04-q2", level: "B1", topic: "Detay", question: "Aşırı bağımlılık ne getiriyor?", options: ["Bazı sorunlar", "Daha çok para", "Daha iyi sağlık", "Hiçbir şey"], correctAnswer: 0, explanation: "«bazı sorunlar da getiriyor»." },
      { id: "r-b1-04-q3", level: "B1", topic: "Detay", question: "Uzmanlar ne öneriyor?", options: ["Ekran süresini sınırlamayı", "Daha çok telefon kullanmayı", "Telefonu atmayı", "Hiçbir şey"], correctAnswer: 0, explanation: "«ekran süresini sınırlamayı … öneriyor»." },
      { id: "r-b1-04-q4", level: "B1", topic: "Çıkarım", question: "Yazara göre en doğru yol nedir?", options: ["Dengeli kullanım", "Hiç kullanmamak", "Sürekli kullanmak", "Gizli kullanmak"], correctAnswer: 0, explanation: "«Dengeli kullanım en doğru yoldur»." },
      { id: "r-b1-04-q5", level: "B1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Telefonsuz birçok kişi huzursuz oluyor.»", options: ["Doğru", "Yanlış"], correctAnswer: 0, explanation: "«telefonu olmadan kendini huzursuz hissediyor»." },
    ],
    synonyms: [
      { word: "vazgeçilmez", synonym: "olmazsa olmaz" },
      { word: "huzursuz", synonym: "rahatsız" },
      { word: "sınırlamak", synonym: "kısıtlamak" },
    ],
  },
  {
    id: "r-b1-05", level: "B1", topic: "Sağlık",
    title: "Su İçmenin Önemi",
    text: "Su, vücudumuzun düzgün çalışması için hayati öneme sahiptir. Vücudumuzun büyük bir kısmı sudan oluşur. Yeterince su içmek cildi sağlıklı tutar, sindirime yardımcı olur ve yorgunluğu azaltır. Birçok insan gün içinde yeterince su içmeyi unutuyor. Yanınızda her zaman bir su şişesi bulundurmak iyi bir alışkanlıktır. Kahve ve çay suyun yerini tutmaz.",
    questions: [
      { id: "r-b1-05-q1", level: "B1", topic: "Detay", question: "Su neye yardımcı olur?", options: ["Sindirime", "Uykuya", "Hız kazanmaya", "Para biriktirmeye"], correctAnswer: 0, explanation: "«sindirime yardımcı olur»." },
      { id: "r-b1-05-q2", level: "B1", topic: "Detay", question: "Su içmek cilde ne yapar?", options: ["Sağlıklı tutar", "Kurutur", "Zarar verir", "Etkilemez"], correctAnswer: 0, explanation: "«cildi sağlıklı tutar»." },
      { id: "r-b1-05-q3", level: "B1", topic: "Çıkarım", question: "İyi bir alışkanlık nedir?", options: ["Yanında su şişesi bulundurmak", "Çok kahve içmek", "Az hareket etmek", "Geç yatmak"], correctAnswer: 0, explanation: "«bir su şişesi bulundurmak iyi bir alışkanlıktır»." },
      { id: "r-b1-05-q4", level: "B1", topic: "Detay", question: "Kahve ve çay hakkında ne söyleniyor?", options: ["Suyun yerini tutmaz", "Sudan daha iyidir", "Su kadar faydalıdır", "Hiç içilmemeli"], correctAnswer: 0, explanation: "«Kahve ve çay suyun yerini tutmaz»." },
      { id: "r-b1-05-q5", level: "B1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Su yorgunluğu artırır.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«yorgunluğu azaltır» — уменьшает." },
    ],
    synonyms: [
      { word: "hayati", synonym: "yaşamsal" },
      { word: "azaltmak", synonym: "düşürmek" },
      { word: "alışkanlık", synonym: "huy" },
    ],
  },

  /* --------------------------- B2 (devam) --------------------------- */
  {
    id: "r-b2-03", level: "B2", topic: "Toplum",
    title: "Uzaktan Çalışma",
    text: "Pandemiyle birlikte uzaktan çalışma birçok sektörde yaygınlaştı. Bu çalışma biçiminin hem avantajları hem de dezavantajları bulunuyor. Çalışanlar yol masraflarından tasarruf ediyor ve zamanlarını daha esnek planlayabiliyor. Öte yandan, ev ortamında dikkat dağınıklığı yaşamak ya da iş ile özel hayatı ayırmakta zorlanmak mümkün. Şirketler ise ofis giderlerini azaltırken ekip içi iletişimi sürdürmenin yollarını arıyor. Geleceğin çalışma modeli muhtemelen ofis ve uzaktan çalışmanın bir karışımı olacak.",
    questions: [
      { id: "r-b2-03-q1", level: "B2", topic: "Detay", question: "Uzaktan çalışma ne zaman yaygınlaştı?", options: ["Pandemiyle birlikte", "On yıl önce", "Hiç yaygınlaşmadı", "Geçen hafta"], correctAnswer: 0, explanation: "«Pandemiyle birlikte … yaygınlaştı»." },
      { id: "r-b2-03-q2", level: "B2", topic: "Detay", question: "Çalışanlar için bir avantaj nedir?", options: ["Yol masrafından tasarruf", "Daha az maaş", "Daha çok yol", "Sabit saatler"], correctAnswer: 0, explanation: "«yol masraflarından tasarruf ediyor»." },
      { id: "r-b2-03-q3", level: "B2", topic: "Çıkarım", question: "Bir dezavantajı nedir?", options: ["Dikkat dağınıklığı", "Daha çok enerji", "Yüksek maaş", "Kısa yol"], correctAnswer: 0, explanation: "«ev ortamında dikkat dağınıklığı yaşamak»." },
      { id: "r-b2-03-q4", level: "B2", topic: "Detay", question: "Şirketler neyi azaltıyor?", options: ["Ofis giderlerini", "Maaşları artırıyor", "Çalışan sayısını", "Tatilleri"], correctAnswer: 0, explanation: "«ofis giderlerini azaltırken»." },
      { id: "r-b2-03-q5", level: "B2", topic: "Çıkarım", question: "Geleceğin modeli nasıl olacak?", options: ["Ofis ve uzaktan karışımı", "Tamamen ofis", "Tamamen uzaktan", "Çalışma olmayacak"], correctAnswer: 0, explanation: "«ofis ve uzaktan çalışmanın bir karışımı»." },
    ],
    synonyms: [
      { word: "yaygınlaşmak", synonym: "yayılmak" },
      { word: "esnek", synonym: "elastik" },
      { word: "tasarruf etmek", synonym: "biriktirmek" },
    ],
  },
  {
    id: "r-b2-04", level: "B2", topic: "Kültür",
    title: "Müzenin Toplumdaki Yeri",
    text: "Müzeler, bir toplumun geçmişini ve kültürel mirasını gelecek nesillere aktaran önemli kurumlardır. Sadece eski eserleri sergilemekle kalmaz, aynı zamanda eğitim işlevi de görürler. Son yıllarda müzeler dijital teknolojilerden yararlanarak ziyaretçilere daha etkileşimli deneyimler sunmaya başladı. Sanal turlar sayesinde insanlar dünyanın öbür ucundaki bir müzeyi evlerinden gezebiliyor. Yine de pek çok kişi, bir eserin önünde durmanın verdiği hissin hiçbir ekrana sığmayacağını düşünüyor.",
    questions: [
      { id: "r-b2-04-q1", level: "B2", topic: "Detay", question: "Müzeler neyi gelecek nesillere aktarır?", options: ["Kültürel mirası", "Parayı", "Teknolojiyi", "Modayı"], correctAnswer: 0, explanation: "«kültürel mirasını gelecek nesillere aktaran»." },
      { id: "r-b2-04-q2", level: "B2", topic: "Detay", question: "Sergilemenin yanında müzeler hangi işlevi görür?", options: ["Eğitim", "Ticaret", "Spor", "Eğlence"], correctAnswer: 0, explanation: "«eğitim işlevi de görürler»." },
      { id: "r-b2-04-q3", level: "B2", topic: "Detay", question: "Sanal turlar neyi sağlıyor?", options: ["Uzaktaki müzeyi gezmeyi", "Bilet satmayı", "Eser satmayı", "Yemek yemeyi"], correctAnswer: 0, explanation: "«dünyanın öbür ucundaki bir müzeyi evlerinden gezebiliyor»." },
      { id: "r-b2-04-q4", level: "B2", topic: "Çıkarım", question: "Birçok kişi neyi düşünüyor?", options: ["Eser önünde durmanın hissi ekrana sığmaz", "Sanal tur yeterlidir", "Müzeler gereksizdir", "Teknoloji kötüdür"], correctAnswer: 0, explanation: "«bir eserin önünde durmanın verdiği his … hiçbir ekrana sığmayacağı»." },
      { id: "r-b2-04-q5", level: "B2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Müzeler dijital teknolojiyi hiç kullanmıyor.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«dijital teknolojilerden yararlanarak» — используют." },
    ],
    synonyms: [
      { word: "aktarmak", synonym: "iletmek" },
      { word: "etkileşimli", synonym: "interaktif" },
      { word: "miras", synonym: "kalıt" },
    ],
  },

  /* --------------------------- C1 (devam) --------------------------- */
  {
    id: "r-c1-02", level: "C1", topic: "Toplum sorunları",
    title: "Kentsel Yalnızlık",
    text: "Modern kentlerin kalabalık caddelerinde, milyonlarca insanın arasında paradoksal bir biçimde yalnızlık giderek yaygınlaşmaktadır. Geleneksel toplumlarda güçlü olan komşuluk ve akrabalık bağları, kentleşmeyle birlikte zayıflamıştır. İnsanlar aynı apartmanda yıllarca yaşamasına rağmen birbirini tanımamaktadır. Dijital iletişim, yüz yüze ilişkilerin yerini tutmakta yetersiz kalmakta; sosyal medyadaki yüzlerce 'arkadaş', gerçek bir dostun boşluğunu dolduramamaktadır. Uzmanlara göre bu durum, ruh sağlığı sorunlarının artmasında önemli bir etkendir. Çözüm, kent yaşamında topluluk duygusunu yeniden inşa edecek ortak alanlar ve etkinlikler yaratmaktan geçmektedir.",
    questions: [
      { id: "r-c1-02-q1", level: "C1", topic: "Çıkarım", question: "Metindeki paradoks nedir?", options: ["Kalabalıkta yalnızlık", "Sessizlikte gürültü", "Zenginlikte yoksulluk", "Hızda yavaşlık"], correctAnswer: 0, explanation: "«milyonlarca insanın arasında … yalnızlık»." },
      { id: "r-c1-02-q2", level: "C1", topic: "Detay", question: "Kentleşmeyle hangi bağlar zayıfladı?", options: ["Komşuluk ve akrabalık", "Ticari bağlar", "Siyasi bağlar", "Hiçbiri"], correctAnswer: 0, explanation: "«komşuluk ve akrabalık bağları … zayıflamıştır»." },
      { id: "r-c1-02-q3", level: "C1", topic: "Çıkarım", question: "Dijital iletişim hakkında ne söyleniyor?", options: ["Yüz yüze ilişkilerin yerini tutamıyor", "Her sorunu çözüyor", "Yalnızlığı bitiriyor", "Gereksizdir"], correctAnswer: 0, explanation: "«yüz yüze ilişkilerin yerini tutmakta yetersiz»." },
      { id: "r-c1-02-q4", level: "C1", topic: "Detay", question: "Bu durum neyin artmasında etkendir?", options: ["Ruh sağlığı sorunları", "Ekonomik büyüme", "Nüfus artışı", "Trafik"], correctAnswer: 0, explanation: "«ruh sağlığı sorunlarının artmasında önemli bir etken»." },
      { id: "r-c1-02-q5", level: "C1", topic: "Çıkarım", question: "Önerilen çözüm nedir?", options: ["Topluluk duygusunu yeniden inşa etmek", "Şehirleri büyütmek", "Daha çok teknoloji", "Göçü artırmak"], correctAnswer: 0, explanation: "«topluluk duygusunu yeniden inşa edecek ortak alanlar»." },
    ],
    synonyms: [
      { word: "yaygınlaşmak", synonym: "artmak" },
      { word: "zayıflamak", synonym: "güçsüzleşmek" },
      { word: "yetersiz", synonym: "eksik" },
    ],
  },

  /* --------------------------- Batch 3 --------------------------- */
  {
    id: "r-a1-06", level: "A1", topic: "Gezi",
    title: "Hayvanat Bahçesinde",
    text: "Geçen pazar hayvanat bahçesine gittik. Orada birçok hayvan gördük. Aslanlar çok büyüktü ve maymunlar çok komikti. Çocuklar fillere bayıldı. Öğlen sandviç yedik ve dondurma aldık. Akşam yorgun ama mutlu eve döndük.",
    questions: [
      { id: "r-a1-06-q1", level: "A1", topic: "Detay", question: "Nereye gittiler?", options: ["Hayvanat bahçesine", "Sinemaya", "Denize", "Müzeye"], correctAnswer: 0, explanation: "«hayvanat bahçesine gittik»." },
      { id: "r-a1-06-q2", level: "A1", topic: "Detay", question: "Hangi hayvan komikti?", options: ["Maymunlar", "Aslanlar", "Filler", "Kuşlar"], correctAnswer: 0, explanation: "«maymunlar çok komikti»." },
      { id: "r-a1-06-q3", level: "A1", topic: "Detay", question: "Çocuklar neye bayıldı?", options: ["Fillere", "Aslanlara", "Yılanlara", "Balıklara"], correctAnswer: 0, explanation: "«Çocuklar fillere bayıldı»." },
      { id: "r-a1-06-q4", level: "A1", topic: "Detay", question: "Öğlen ne yediler?", options: ["Sandviç", "Pizza", "Çorba", "Makarna"], correctAnswer: 0, explanation: "«Öğlen sandviç yedik»." },
      { id: "r-a1-06-q5", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Eve üzgün döndüler.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«yorgun ama mutlu eve döndük»." },
    ],
    synonyms: [
      { word: "komik", synonym: "eğlenceli" },
      { word: "bayılmak", synonym: "çok sevmek" },
      { word: "yorgun", synonym: "bitkin" },
    ],
  },
  {
    id: "r-a2-06", level: "A2", topic: "Alışveriş",
    title: "İnternetten Alışveriş",
    text: "Bugünlerde birçok insan internetten alışveriş yapıyor. İnternetten alışveriş çok kolay: evden çıkmadan istediğiniz ürünü seçip sipariş verebilirsiniz. Ürünler birkaç gün içinde kapınıza gelir. Ancak bazen ürün resimde göründüğü gibi olmayabilir. Bu yüzden satıcı yorumlarını okumak önemlidir.",
    questions: [
      { id: "r-a2-06-q1", level: "A2", topic: "Detay", question: "Birçok insan nereden alışveriş yapıyor?", options: ["İnternetten", "Pazardan", "Kapıdan", "Fabrikadan"], correctAnswer: 0, explanation: "«internetten alışveriş yapıyor»." },
      { id: "r-a2-06-q2", level: "A2", topic: "Detay", question: "Ürünler ne zaman gelir?", options: ["Birkaç gün içinde", "Bir ay sonra", "Aynı saat", "Hiç gelmez"], correctAnswer: 0, explanation: "«birkaç gün içinde kapınıza gelir»." },
      { id: "r-a2-06-q3", level: "A2", topic: "Çıkarım", question: "Olası bir sorun nedir?", options: ["Ürün resimdeki gibi olmayabilir", "Çok ucuz olması", "Hızlı gelmesi", "Kolay olması"], correctAnswer: 0, explanation: "«ürün resimde göründüğü gibi olmayabilir»." },
      { id: "r-a2-06-q4", level: "A2", topic: "Çıkarım", question: "Ne yapmak önemlidir?", options: ["Satıcı yorumlarını okumak", "Hemen almak", "Hiç düşünmemek", "Telefonu kapatmak"], correctAnswer: 0, explanation: "«satıcı yorumlarını okumak önemlidir»." },
      { id: "r-a2-06-q5", level: "A2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «İnternetten alışveriş için evden çıkmak gerekir.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«evden çıkmadan … sipariş verebilirsiniz»." },
    ],
    synonyms: [
      { word: "kolay", synonym: "basit" },
      { word: "sipariş vermek", synonym: "ısmarlamak" },
      { word: "ürün", synonym: "mal" },
    ],
  },
  {
    id: "r-b1-06", level: "B1", topic: "Çevre",
    title: "Geri Dönüşüm",
    text: "Geri dönüşüm, kullanılmış malzemelerin yeniden işlenerek tekrar kullanılabilir hâle getirilmesidir. Kâğıt, cam, plastik ve metal en sık geri dönüştürülen maddelerdir. Geri dönüşüm doğal kaynakları korur, enerji tasarrufu sağlar ve çöp miktarını azaltır. Her birey atıklarını ayrı kutulara atarak bu sürece katkıda bulunabilir. Küçük bir alışkanlık, gezegenimiz için büyük bir fark yaratır.",
    questions: [
      { id: "r-b1-06-q1", level: "B1", topic: "Detay", question: "Geri dönüşüm nedir?", options: ["Malzemeleri yeniden kullanılabilir yapmak", "Çöpü yakmak", "Yeni ürün almak", "Atıkları gömmek"], correctAnswer: 0, explanation: "«yeniden işlenerek tekrar kullanılabilir hâle getirilmesi»." },
      { id: "r-b1-06-q2", level: "B1", topic: "Detay", question: "Hangisi sık geri dönüştürülür?", options: ["Cam", "Yemek", "Su", "Toprak"], correctAnswer: 0, explanation: "«Kâğıt, cam, plastik ve metal»." },
      { id: "r-b1-06-q3", level: "B1", topic: "Detay", question: "Geri dönüşüm neyi azaltır?", options: ["Çöp miktarını", "Ağaç sayısını", "Suyu", "Havayı"], correctAnswer: 0, explanation: "«çöp miktarını azaltır»." },
      { id: "r-b1-06-q4", level: "B1", topic: "Çıkarım", question: "Birey nasıl katkıda bulunur?", options: ["Atıkları ayrı kutulara atarak", "Daha çok tüketerek", "Çöpü sokağa atarak", "Hiçbir şey yapmadan"], correctAnswer: 0, explanation: "«atıklarını ayrı kutulara atarak»." },
      { id: "r-b1-06-q5", level: "B1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Geri dönüşüm enerji tasarrufu sağlar.»", options: ["Doğru", "Yanlış"], correctAnswer: 0, explanation: "«enerji tasarrufu sağlar»." },
    ],
    synonyms: [
      { word: "korumak", synonym: "muhafaza etmek" },
      { word: "azaltmak", synonym: "düşürmek" },
      { word: "katkıda bulunmak", synonym: "destek olmak" },
    ],
  },
  {
    id: "r-b1-07", level: "B1", topic: "Sağlık",
    title: "Sınav Kaygısı",
    text: "Sınav kaygısı, öğrencilerin sıkça yaşadığı bir durumdur. Az miktarda heyecan kişiyi motive edebilir; ancak aşırı kaygı performansı olumsuz etkiler. Kaygıyı azaltmak için düzenli çalışmak, yeterince uyumak ve sınavdan önce derin nefes almak faydalıdır. Ayrıca her şeyi son güne bırakmamak çok önemlidir. Unutmayın ki bir sınav, hayatınızın tamamını belirlemez.",
    questions: [
      { id: "r-b1-07-q1", level: "B1", topic: "Detay", question: "Az miktarda heyecan ne yapar?", options: ["Motive eder", "Uyutur", "Hasta eder", "Engeller"], correctAnswer: 0, explanation: "«Az miktarda heyecan kişiyi motive edebilir»." },
      { id: "r-b1-07-q2", level: "B1", topic: "Detay", question: "Aşırı kaygı neyi etkiler?", options: ["Performansı", "Havayı", "Fiyatları", "Uykuyu artırır"], correctAnswer: 0, explanation: "«aşırı kaygı performansı olumsuz etkiler»." },
      { id: "r-b1-07-q3", level: "B1", topic: "Detay", question: "Kaygıyı azaltmak için ne faydalı?", options: ["Düzenli çalışmak ve uyumak", "Hiç uyumamak", "Son güne bırakmak", "Çok kahve içmek"], correctAnswer: 0, explanation: "«düzenli çalışmak, yeterince uyumak»." },
      { id: "r-b1-07-q4", level: "B1", topic: "Çıkarım", question: "Neyi yapmamak önemlidir?", options: ["Her şeyi son güne bırakmak", "Erken başlamak", "Plan yapmak", "Nefes almak"], correctAnswer: 0, explanation: "«her şeyi son güne bırakmamak çok önemlidir»." },
      { id: "r-b1-07-q5", level: "B1", topic: "Çıkarım", question: "Metnin son mesajı nedir?", options: ["Bir sınav her şeyi belirlemez", "Sınavlar gereksizdir", "Kaygı iyidir", "Uyku önemsizdir"], correctAnswer: 0, explanation: "«bir sınav, hayatınızın tamamını belirlemez»." },
    ],
    synonyms: [
      { word: "kaygı", synonym: "endişe" },
      { word: "faydalı", synonym: "yararlı" },
      { word: "performans", synonym: "başarım" },
    ],
  },
  {
    id: "r-b2-05", level: "B2", topic: "Toplum",
    title: "Sosyal Medya ve Gençler",
    text: "Sosyal medya, günümüz gençlerinin hayatında merkezî bir yer tutuyor. Bu platformlar, arkadaşlarla iletişim kurmayı ve bilgiye ulaşmayı kolaylaştırıyor. Ancak sürekli karşılaştırma yapma eğilimi, gençlerde özgüven sorunlarına yol açabiliyor. İnsanların yalnızca en mutlu anlarını paylaştığı bir ortamda, kendi hayatını yetersiz görmek kolaydır. Uzmanlar, ekran karşısında geçirilen süreyi dengelemenin ve çevrim dışı etkinliklere zaman ayırmanın önemini vurguluyor.",
    questions: [
      { id: "r-b2-05-q1", level: "B2", topic: "Detay", question: "Sosyal medya neyi kolaylaştırıyor?", options: ["İletişim ve bilgiye ulaşmayı", "Uyumayı", "Yemek yapmayı", "Spor yapmayı"], correctAnswer: 0, explanation: "«iletişim kurmayı ve bilgiye ulaşmayı kolaylaştırıyor»." },
      { id: "r-b2-05-q2", level: "B2", topic: "Çıkarım", question: "Hangi eğilim soruna yol açıyor?", options: ["Sürekli karşılaştırma", "Çok okuma", "Az paylaşım", "Erken yatma"], correctAnswer: 0, explanation: "«sürekli karşılaştırma yapma eğilimi … sorunlarına yol açabiliyor»." },
      { id: "r-b2-05-q3", level: "B2", topic: "Çıkarım", question: "İnsanlar genellikle ne paylaşıyor?", options: ["En mutlu anlarını", "Sıkıntılarını", "Hatalarını", "Her şeyi"], correctAnswer: 0, explanation: "«yalnızca en mutlu anlarını paylaştığı»." },
      { id: "r-b2-05-q4", level: "B2", topic: "Detay", question: "Uzmanlar neyi vurguluyor?", options: ["Ekran süresini dengelemeyi", "Daha çok paylaşımı", "Hiç kullanmamayı", "Daha çok takipçiyi"], correctAnswer: 0, explanation: "«ekran karşısında geçirilen süreyi dengelemenin … önemini»." },
      { id: "r-b2-05-q5", level: "B2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Sosyal medyanın hiçbir faydası yoktur.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "Текст называет и пользу (общение, доступ к информации)." },
    ],
    synonyms: [
      { word: "merkezî", synonym: "başat" },
      { word: "eğilim", synonym: "yönelim" },
      { word: "vurgulamak", synonym: "altını çizmek" },
    ],
  },
  {
    id: "r-b2-06", level: "B2", topic: "Çevre",
    title: "Şehir Tarımı",
    text: "Büyük şehirlerde son yıllarda 'şehir tarımı' giderek yaygınlaşıyor. İnsanlar balkonlarında, çatılarda ve ortak bahçelerde kendi sebzelerini yetiştiriyor. Bu uygulamanın birçok faydası var: taze ve sağlıklı gıdaya erişim, stres azaltma ve komşular arasında dayanışma. Ayrıca yeşil alanların artması, şehirdeki hava kalitesine de olumlu katkı sağlıyor. Bazı belediyeler bu girişimleri destekleyerek boş arazileri topluluk bahçelerine dönüştürüyor.",
    questions: [
      { id: "r-b2-06-q1", level: "B2", topic: "Detay", question: "Şehir tarımı nerede yapılıyor?", options: ["Balkon, çatı ve ortak bahçelerde", "Sadece köylerde", "Fabrikalarda", "Denizde"], correctAnswer: 0, explanation: "«balkonlarında, çatılarda ve ortak bahçelerde»." },
      { id: "r-b2-06-q2", level: "B2", topic: "Detay", question: "Bir faydası nedir?", options: ["Taze gıdaya erişim", "Daha çok trafik", "Daha çok gürültü", "Yüksek kira"], correctAnswer: 0, explanation: "«taze ve sağlıklı gıdaya erişim»." },
      { id: "r-b2-06-q3", level: "B2", topic: "Çıkarım", question: "Yeşil alanların artması neye katkı sağlıyor?", options: ["Hava kalitesine", "Gürültüye", "Trafiğe", "Çöpe"], correctAnswer: 0, explanation: "«hava kalitesine de olumlu katkı»." },
      { id: "r-b2-06-q4", level: "B2", topic: "Detay", question: "Bazı belediyeler ne yapıyor?", options: ["Boş arazileri topluluk bahçesine dönüştürüyor", "Bahçeleri kapatıyor", "Vergi artırıyor", "Hiçbir şey"], correctAnswer: 0, explanation: "«boş arazileri topluluk bahçelerine dönüştürüyor»." },
      { id: "r-b2-06-q5", level: "B2", topic: "Çıkarım", question: "Şehir tarımı komşular arasında neyi artırıyor?", options: ["Dayanışmayı", "Rekabeti", "Mesafeyi", "Gürültüyü"], correctAnswer: 0, explanation: "«komşular arasında dayanışma»." },
    ],
    synonyms: [
      { word: "yaygınlaşmak", synonym: "yayılmak" },
      { word: "yetiştirmek", synonym: "büyütmek" },
      { word: "dayanışma", synonym: "yardımlaşma" },
    ],
  },
  {
    id: "r-c1-03", level: "C1", topic: "Sanat ve teknoloji",
    title: "Yapay Zekâ ve Sanat",
    text: "Yapay zekânın resim, müzik ve edebiyat üretebilmesi, sanatın doğasına ilişkin köklü tartışmaları yeniden alevlendirmiştir. Bir algoritmanın saniyeler içinde ürettiği bir tablo gerçekten 'sanat' sayılabilir mi? Savunucular, yapay zekânın yalnızca bir araç olduğunu, tıpkı fırça ya da kamera gibi sanatçının hizmetinde bulunduğunu öne sürer. Karşıt görüşe göre ise sanat, insan deneyiminin, duygusunun ve niyetinin bir ifadesidir; dolayısıyla bilinçten yoksun bir makinenin ürettiği şey, ne kadar estetik olursa olsun, gerçek anlamda sanat değildir. Bu tartışma, aslında 'yaratıcılık' kavramını ve insanın biricikliğini sorgulamamıza yol açmaktadır.",
    questions: [
      { id: "r-c1-03-q1", level: "C1", topic: "Detay", question: "Yapay zekâ neyi üretebiliyor?", options: ["Resim, müzik ve edebiyat", "Sadece resim", "Sadece müzik", "Hiçbir şey"], correctAnswer: 0, explanation: "«resim, müzik ve edebiyat üretebilmesi»." },
      { id: "r-c1-03-q2", level: "C1", topic: "Çıkarım", question: "Savunuculara göre yapay zekâ nedir?", options: ["Bir araç", "Bir sanatçı", "Bir tehdit", "Bir oyuncak"], correctAnswer: 0, explanation: "«yalnızca bir araç olduğunu … öne sürer»." },
      { id: "r-c1-03-q3", level: "C1", topic: "Çıkarım", question: "Karşıt görüşe göre sanat nedir?", options: ["İnsan deneyimi ve duygusunun ifadesi", "Sadece estetik", "Bir hesaplama", "Bir kopya"], correctAnswer: 0, explanation: "«insan deneyiminin, duygusunun ve niyetinin bir ifadesidir»." },
      { id: "r-c1-03-q4", level: "C1", topic: "Çıkarım", question: "Karşıt görüş makineyi nasıl niteliyor?", options: ["Bilinçten yoksun", "Çok yaratıcı", "Duygusal", "Üstün"], correctAnswer: 0, explanation: "«bilinçten yoksun bir makine»." },
      { id: "r-c1-03-q5", level: "C1", topic: "Çıkarım", question: "Bu tartışma neyi sorgulatıyor?", options: ["Yaratıcılık kavramını ve insanın biricikliğini", "Sadece fiyatları", "Teknoloji hızını", "Müze sayısını"], correctAnswer: 0, explanation: "«'yaratıcılık' kavramını ve insanın biricikliğini sorgulamamıza»." },
    ],
    synonyms: [
      { word: "alevlendirmek", synonym: "körüklemek" },
      { word: "biriciklik", synonym: "eşsizlik" },
      { word: "estetik", synonym: "güzellik" },
    ],
  },
  {
    id: "r-c1-04", level: "C1", topic: "Dil ve kültür",
    title: "Dillerin Yok Oluşu",
    text: "Dünya genelinde konuşulan binlerce dilden önemli bir kısmı, bu yüzyılın sonuna kadar yok olma tehlikesiyle karşı karşıyadır. Bir dil öldüğünde, yalnızca kelimeler değil; o dilin taşıdığı dünya görüşü, sözlü gelenekler ve nesiller boyu biriken bilgi de kaybolur. Küreselleşme ve baskın dillerin yaygınlaşması, küçük toplulukların ana dillerini terk etmesine neden olmaktadır. Dil bilimciler, tehlikedeki dilleri belgelemek ve canlandırmak için yoğun çaba harcıyor. Ancak bir dilin gerçekten yaşaması, ancak yeni nesillerin onu günlük hayatta kullanmasıyla mümkündür.",
    questions: [
      { id: "r-c1-04-q1", level: "C1", topic: "Detay", question: "Binlerce dilin bir kısmını ne bekliyor?", options: ["Yok olma tehlikesi", "Hızlı yayılma", "Resmî olma", "Hiçbir değişiklik"], correctAnswer: 0, explanation: "«yok olma tehlikesiyle karşı karşıyadır»." },
      { id: "r-c1-04-q2", level: "C1", topic: "Çıkarım", question: "Bir dil öldüğünde başka ne kaybolur?", options: ["Dünya görüşü ve sözlü gelenekler", "Sadece harfler", "Para", "Topraklar"], correctAnswer: 0, explanation: "«dünya görüşü, sözlü gelenekler ve … bilgi de kaybolur»." },
      { id: "r-c1-04-q3", level: "C1", topic: "Detay", question: "Küçük toplulukları ne etkiliyor?", options: ["Küreselleşme ve baskın diller", "Yağmurlar", "Spor", "Müzik"], correctAnswer: 0, explanation: "«Küreselleşme ve baskın dillerin yaygınlaşması»." },
      { id: "r-c1-04-q4", level: "C1", topic: "Detay", question: "Dil bilimciler ne yapıyor?", options: ["Dilleri belgeleyip canlandırıyor", "Dilleri yasaklıyor", "Hiçbir şey", "Yeni dil icat ediyor"], correctAnswer: 0, explanation: "«tehlikedeki dilleri belgelemek ve canlandırmak»." },
      { id: "r-c1-04-q5", level: "C1", topic: "Çıkarım", question: "Bir dil gerçekte nasıl yaşar?", options: ["Yeni nesiller günlük hayatta kullanırsa", "Sözlüğe yazılırsa", "Müzeye konulursa", "Tercüme edilirse"], correctAnswer: 0, explanation: "«yeni nesillerin onu günlük hayatta kullanmasıyla»." },
    ],
    synonyms: [
      { word: "baskın", synonym: "egemen" },
      { word: "canlandırmak", synonym: "diriltmek" },
      { word: "terk etmek", synonym: "bırakmak" },
    ],
  },

  /* --------------------------- Batch 4 --------------------------- */
  {
    id: "r-a1-07", level: "A1", topic: "Kutlama",
    title: "Doğum Günü Partisi",
    text: "Yarın benim doğum günüm. Küçük bir parti yapacağım. Arkadaşlarımı evime davet ettim. Annem güzel bir pasta yapacak. Salonu balonlarla süsledik. Müzik dinleyeceğiz ve oyunlar oynayacağız. Çok heyecanlıyım.",
    questions: [
      { id: "r-a1-07-q1", level: "A1", topic: "Detay", question: "Yarın ne var?", options: ["Doğum günü", "Sınav", "Tatil", "Toplantı"], correctAnswer: 0, explanation: "«yarın benim doğum günüm»." },
      { id: "r-a1-07-q2", level: "A1", topic: "Detay", question: "Kimi davet etti?", options: ["Arkadaşlarını", "Öğretmenini", "Komşusunu", "Patronunu"], correctAnswer: 0, explanation: "«Arkadaşlarımı … davet ettim»." },
      { id: "r-a1-07-q3", level: "A1", topic: "Detay", question: "Pastayı kim yapacak?", options: ["Annesi", "Babası", "Kardeşi", "Kendisi"], correctAnswer: 0, explanation: "«Annem güzel bir pasta yapacak»." },
      { id: "r-a1-07-q4", level: "A1", topic: "Detay", question: "Salonu neyle süslediler?", options: ["Balonlarla", "Çiçeklerle", "Kâğıtlarla", "Resimlerle"], correctAnswer: 0, explanation: "«Salonu balonlarla süsledik»." },
      { id: "r-a1-07-q5", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Partide müzik olmayacak.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«Müzik dinleyeceğiz»." },
    ],
    synonyms: [
      { word: "davet etmek", synonym: "çağırmak" },
      { word: "süslemek", synonym: "donatmak" },
      { word: "heyecanlı", synonym: "coşkulu" },
    ],
  },
  {
    id: "r-a2-07", level: "A2", topic: "Ulaşım",
    title: "Toplu Taşıma",
    text: "Büyük şehirlerde toplu taşıma çok önemlidir. Metro, otobüs ve tramvay her gün milyonlarca insanı taşır. Toplu taşıma kullanmak hem ucuz hem de çevre dostudur. Özel araba yerine otobüse binmek trafiği azaltır. Ben her gün işe metroyla gidiyorum çünkü çok hızlı ve rahat.",
    questions: [
      { id: "r-a2-07-q1", level: "A2", topic: "Detay", question: "Toplu taşıma günde kaç kişiyi taşır?", options: ["Milyonlarca", "Yüzlerce", "Onlarca", "Birkaç"], correctAnswer: 0, explanation: "«milyonlarca insanı taşır»." },
      { id: "r-a2-07-q2", level: "A2", topic: "Çıkarım", question: "Toplu taşımanın bir avantajı nedir?", options: ["Çevre dostu olması", "Pahalı olması", "Yavaş olması", "Kirletmesi"], correctAnswer: 0, explanation: "«hem ucuz hem de çevre dostudur»." },
      { id: "r-a2-07-q3", level: "A2", topic: "Detay", question: "Otobüse binmek neyi azaltır?", options: ["Trafiği", "Parayı", "Hızı", "Yolcuyu"], correctAnswer: 0, explanation: "«otobüse binmek trafiği azaltır»." },
      { id: "r-a2-07-q4", level: "A2", topic: "Detay", question: "Yazar işe nasıl gidiyor?", options: ["Metroyla", "Arabayla", "Yürüyerek", "Bisikletle"], correctAnswer: 0, explanation: "«işe metroyla gidiyorum»." },
      { id: "r-a2-07-q5", level: "A2", topic: "Detay", question: "Yazar metroyu neden seviyor?", options: ["Hızlı ve rahat olduğu için", "Pahalı olduğu için", "Boş olduğu için", "Yavaş olduğu için"], correctAnswer: 0, explanation: "«çok hızlı ve rahat»." },
    ],
    synonyms: [
      { word: "taşımak", synonym: "götürmek" },
      { word: "ucuz", synonym: "hesaplı" },
      { word: "rahat", synonym: "konforlu" },
    ],
  },
  {
    id: "r-b1-08", level: "B1", topic: "Sağlık",
    title: "Düzenli Uyku",
    text: "İyi bir uyku, sağlıklı yaşamın temel taşlarından biridir. Uyku sırasında vücudumuz kendini onarır ve beynimiz gün içinde öğrendiklerimizi düzenler. Yetersiz uyku, dikkat eksikliğine, sinirliliğe ve bağışıklığın zayıflamasına neden olabilir. İyi uyumak için her gün aynı saatte yatmak, yatmadan önce ekranlardan uzak durmak ve odayı karanlık tutmak önerilir.",
    questions: [
      { id: "r-b1-08-q1", level: "B1", topic: "Detay", question: "Uyku sırasında beyin ne yapar?", options: ["Öğrenilenleri düzenler", "Tamamen durur", "Yeni dil öğrenir", "Çalışmaz"], correctAnswer: 0, explanation: "«beynimiz … öğrendiklerimizi düzenler»." },
      { id: "r-b1-08-q2", level: "B1", topic: "Detay", question: "Yetersiz uyku neye neden olur?", options: ["Dikkat eksikliği ve sinirlilik", "Daha çok enerji", "İyi ruh hâli", "Hızlı düşünme"], correctAnswer: 0, explanation: "«dikkat eksikliğine, sinirliliğe …»." },
      { id: "r-b1-08-q3", level: "B1", topic: "Detay", question: "İyi uyumak için ne önerilir?", options: ["Her gün aynı saatte yatmak", "Geç yatmak", "Ekrana bakmak", "Işığı açık tutmak"], correctAnswer: 0, explanation: "«her gün aynı saatte yatmak»." },
      { id: "r-b1-08-q4", level: "B1", topic: "Detay", question: "Yatmadan önce neyden uzak durmalı?", options: ["Ekranlardan", "Kitaptan", "Sudan", "Yataktan"], correctAnswer: 0, explanation: "«ekranlardan uzak durmak»." },
      { id: "r-b1-08-q5", level: "B1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Uyku bağışıklığı etkilemez.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«bağışıklığın zayıflamasına neden olabilir»." },
    ],
    synonyms: [
      { word: "onarmak", synonym: "tamir etmek" },
      { word: "yetersiz", synonym: "eksik" },
      { word: "önermek", synonym: "tavsiye etmek" },
    ],
  },
  {
    id: "r-b1-09", level: "B1", topic: "Kültür",
    title: "Yerel Pazarlar",
    text: "Türkiye'de haftada bir kurulan yerel pazarlar, alışverişin yanı sıra bir sosyal buluşma yeridir. Pazarlarda taze meyve, sebze, peynir ve baharatlar uygun fiyata bulunur. Satıcılar müşterileriyle sohbet eder, hatta pazarlık yapılır. Süpermarketlere göre ürünler genellikle daha tazedir çünkü doğrudan üreticiden gelir. Birçok kişi için pazar günü, hem alışveriş hem de geleneksel bir keyiftir.",
    questions: [
      { id: "r-b1-09-q1", level: "B1", topic: "Detay", question: "Yerel pazarlar ne sıklıkla kurulur?", options: ["Haftada bir", "Her gün", "Ayda bir", "Yılda bir"], correctAnswer: 0, explanation: "«haftada bir kurulan»." },
      { id: "r-b1-09-q2", level: "B1", topic: "Detay", question: "Pazarda ne bulunur?", options: ["Taze meyve ve sebze", "Sadece kıyafet", "Sadece elektronik", "Mobilya"], correctAnswer: 0, explanation: "«taze meyve, sebze, peynir ve baharatlar»." },
      { id: "r-b1-09-q3", level: "B1", topic: "Çıkarım", question: "Ürünler neden daha taze?", options: ["Doğrudan üreticiden geldiği için", "Pahalı olduğu için", "İthal olduğu için", "Eski olduğu için"], correctAnswer: 0, explanation: "«doğrudan üreticiden gelir»." },
      { id: "r-b1-09-q4", level: "B1", topic: "Detay", question: "Satıcılar müşterilerle ne yapar?", options: ["Sohbet eder ve pazarlık yapar", "Hiç konuşmaz", "Kavga eder", "Yemek yapar"], correctAnswer: 0, explanation: "«Satıcılar müşterileriyle sohbet eder, … pazarlık yapılır»." },
      { id: "r-b1-09-q5", level: "B1", topic: "Çıkarım", question: "Pazar, birçok kişi için ne ifade eder?", options: ["Alışveriş ve geleneksel keyif", "Sadece iş", "Bir zorunluluk", "Bir tatil"], correctAnswer: 0, explanation: "«hem alışveriş hem de geleneksel bir keyiftir»." },
    ],
    synonyms: [
      { word: "uygun", synonym: "elverişli" },
      { word: "pazarlık", synonym: "fiyat tartışması" },
      { word: "keyif", synonym: "zevk" },
    ],
  },
  {
    id: "r-b2-07", level: "B2", topic: "Eğitim",
    title: "Online Eğitimin Geleceği",
    text: "Salgın döneminde zorunlu hâle gelen online eğitim, kalıcı bir dönüşümün de önünü açtı. Bugün birçok üniversite, derslerini hem yüz yüze hem çevrim içi sunan 'karma' modeli benimsiyor. Online eğitim, coğrafi engelleri ortadan kaldırarak dünyanın her yerinden öğrencinin nitelikli derslere ulaşmasını sağlıyor. Ancak bu modelin başarısı, güçlü bir internet altyapısına ve öğrencinin öz disiplinine bağlı. Etkileşim eksikliği ve dikkat dağınıklığı, hâlâ aşılması gereken sorunlar arasında.",
    questions: [
      { id: "r-b2-07-q1", level: "B2", topic: "Detay", question: "Salgın döneminde ne zorunlu hâle geldi?", options: ["Online eğitim", "Yüz yüze eğitim", "Sınavlar", "Tatiller"], correctAnswer: 0, explanation: "«zorunlu hâle gelen online eğitim»." },
      { id: "r-b2-07-q2", level: "B2", topic: "Detay", question: "Üniversiteler hangi modeli benimsiyor?", options: ["Karma model", "Sadece online", "Sadece yüz yüze", "Hiçbiri"], correctAnswer: 0, explanation: "«'karma' modeli benimsiyor»." },
      { id: "r-b2-07-q3", level: "B2", topic: "Çıkarım", question: "Online eğitim neyi ortadan kaldırıyor?", options: ["Coğrafi engelleri", "İnterneti", "Öğretmenleri", "Sınavları"], correctAnswer: 0, explanation: "«coğrafi engelleri ortadan kaldırarak»." },
      { id: "r-b2-07-q4", level: "B2", topic: "Detay", question: "Bu modelin başarısı neye bağlı?", options: ["İnternet altyapısı ve öz disiplin", "Sadece paraya", "Sadece öğretmene", "Hava durumuna"], correctAnswer: 0, explanation: "«güçlü bir internet altyapısına ve öğrencinin öz disiplinine bağlı»." },
      { id: "r-b2-07-q5", level: "B2", topic: "Detay", question: "Hâlâ aşılması gereken sorun nedir?", options: ["Etkileşim eksikliği", "Düşük fiyat", "Çok öğrenci", "Fazla ders"], correctAnswer: 0, explanation: "«Etkileşim eksikliği ve dikkat dağınıklığı»." },
    ],
    synonyms: [
      { word: "kalıcı", synonym: "sürekli" },
      { word: "benimsemek", synonym: "kabul etmek" },
      { word: "aşmak", synonym: "üstesinden gelmek" },
    ],
  },
  {
    id: "r-b2-08", level: "B2", topic: "Çevre",
    title: "Plastik Kirliliği",
    text: "Plastik, ucuz ve dayanıklı olması nedeniyle hayatımızın her alanına girdi. Ancak bu dayanıklılık, doğada yüzlerce yıl yok olmaması anlamına da geliyor. Her yıl milyonlarca ton plastik atık okyanuslara karışıyor ve deniz canlılarına büyük zarar veriyor. Tek kullanımlık plastikleri azaltmak, alternatif malzemelere yönelmek ve geri dönüşümü artırmak bu sorunla mücadelede atılabilecek önemli adımlardır. Bireysel çabalar kadar, üreticilerin ve devletlerin sorumluluğu da büyüktür.",
    questions: [
      { id: "r-b2-08-q1", level: "B2", topic: "Çıkarım", question: "Plastik neden her alana girdi?", options: ["Ucuz ve dayanıklı olduğu için", "Pahalı olduğu için", "Nadir olduğu için", "Güzel olduğu için"], correctAnswer: 0, explanation: "«ucuz ve dayanıklı olması nedeniyle»." },
      { id: "r-b2-08-q2", level: "B2", topic: "Detay", question: "Dayanıklılık neyi getiriyor?", options: ["Doğada yüzlerce yıl yok olmamasını", "Hızlı çözünmeyi", "Kolay yanmayı", "Ucuzluğu"], correctAnswer: 0, explanation: "«doğada yüzlerce yıl yok olmaması»." },
      { id: "r-b2-08-q3", level: "B2", topic: "Detay", question: "Plastik atıklar nereye karışıyor?", options: ["Okyanuslara", "Dağlara", "Çöllere", "Uzaya"], correctAnswer: 0, explanation: "«okyanuslara karışıyor»." },
      { id: "r-b2-08-q4", level: "B2", topic: "Detay", question: "Hangisi önemli bir adımdır?", options: ["Tek kullanımlık plastiği azaltmak", "Daha çok plastik üretmek", "Atıkları denize atmak", "Geri dönüşümü durdurmak"], correctAnswer: 0, explanation: "«Tek kullanımlık plastikleri azaltmak»." },
      { id: "r-b2-08-q5", level: "B2", topic: "Çıkarım", question: "Sorumluluk kime ait?", options: ["Bireyler, üreticiler ve devletler", "Sadece bireyler", "Sadece devletler", "Hiç kimse"], correctAnswer: 0, explanation: "«Bireysel çabalar kadar, üreticilerin ve devletlerin sorumluluğu da büyüktür»." },
    ],
    synonyms: [
      { word: "dayanıklı", synonym: "sağlam" },
      { word: "zarar vermek", synonym: "hasar vermek" },
      { word: "azaltmak", synonym: "düşürmek" },
    ],
  },
  {
    id: "r-c1-05", level: "C1", topic: "Ekonomi ve toplum",
    title: "Beyin Göçü",
    text: "Nitelikli iş gücünün, daha iyi imkânlar arayışıyla kendi ülkesini terk edip gelişmiş ülkelere yerleşmesine 'beyin göçü' denir. Doktorlar, mühendisler ve bilim insanları, çoğu zaman daha yüksek ücret, gelişmiş araştırma olanakları ve istikrarlı bir yaşam için göç eder. Bu durum, göç alan ülkeler için bir kazanç olsa da, göç veren ülkeler açısından ciddi bir kayıp anlamına gelir; çünkü bu ülkeler, yetiştirdiği uzmanların bilgi ve emeğinden yararlanamaz. Beyin göçünü tersine çevirmenin yolu, yalnızca maaşları artırmaktan değil, aynı zamanda liyakate dayalı, üretken ve özgür bir çalışma ortamı yaratmaktan geçer.",
    questions: [
      { id: "r-c1-05-q1", level: "C1", topic: "Detay", question: "'Beyin göçü' nedir?", options: ["Nitelikli iş gücünün gelişmiş ülkelere göçü", "Turistlerin gezisi", "Öğrenci değişimi", "Mevsimlik göç"], correctAnswer: 0, explanation: "«Nitelikli iş gücünün … gelişmiş ülkelere yerleşmesine»." },
      { id: "r-c1-05-q2", level: "C1", topic: "Detay", question: "Hangi meslekler örnek veriliyor?", options: ["Doktor, mühendis, bilim insanı", "Çiftçi, balıkçı", "Şoför, garson", "Berber, terzi"], correctAnswer: 0, explanation: "«Doktorlar, mühendisler ve bilim insanları»." },
      { id: "r-c1-05-q3", level: "C1", topic: "Çıkarım", question: "Göç veren ülke için bu ne anlama gelir?", options: ["Ciddi bir kayıp", "Büyük kazanç", "Hiçbir şey", "Nüfus artışı"], correctAnswer: 0, explanation: "«göç veren ülkeler açısından ciddi bir kayıp»." },
      { id: "r-c1-05-q4", level: "C1", topic: "Çıkarım", question: "İnsanlar neden göç ediyor?", options: ["Yüksek ücret ve gelişmiş olanaklar", "Kötü hava", "Sıkıntı", "Tatil"], correctAnswer: 0, explanation: "«daha yüksek ücret, gelişmiş araştırma olanakları …»." },
      { id: "r-c1-05-q5", level: "C1", topic: "Çıkarım", question: "Beyin göçünü tersine çevirmenin yolu nedir?", options: ["Liyakate dayalı, özgür çalışma ortamı", "Sadece maaş artışı", "Sınırları kapatmak", "Göçü yasaklamak"], correctAnswer: 0, explanation: "«liyakate dayalı, üretken ve özgür bir çalışma ortamı yaratmaktan geçer»." },
    ],
    synonyms: [
      { word: "nitelikli", synonym: "vasıflı" },
      { word: "istikrarlı", synonym: "kararlı" },
      { word: "liyakat", synonym: "hak ediş" },
    ],
  },
  {
    id: "r-c1-06", level: "C1", topic: "Medya",
    title: "Bilgi Kirliliği",
    text: "Dijital çağ, bilgiye erişimi olağanüstü kolaylaştırırken beraberinde 'bilgi kirliliği' denilen yeni bir sorunu da getirdi. Sosyal medyada her gün milyonlarca içerik üretiliyor; ancak bunların önemli bir kısmı yanlış, eksik ya da kasıtlı olarak çarpıtılmış bilgilerden oluşuyor. Sansasyonel başlıklar, doğru haberlerden çok daha hızlı yayılıyor. Bu ortamda doğruyu yanlıştan ayırt edebilmek, eskiye kıyasla çok daha fazla çaba gerektiriyor. Bilinçli bir okur, bir bilgiyi paylaşmadan önce kaynağını sorgulamalı, farklı kaynaklarla karşılaştırmalı ve duygusal tepkilerine kapılmadan değerlendirmelidir.",
    questions: [
      { id: "r-c1-06-q1", level: "C1", topic: "Çıkarım", question: "Dijital çağ hangi yeni sorunu getirdi?", options: ["Bilgi kirliliği", "Su kıtlığı", "Trafik", "İşsizlik"], correctAnswer: 0, explanation: "«'bilgi kirliliği' denilen yeni bir sorunu da getirdi»." },
      { id: "r-c1-06-q2", level: "C1", topic: "Detay", question: "İçeriklerin önemli kısmı nasıl?", options: ["Yanlış veya çarpıtılmış", "Tamamen doğru", "Resmî", "Bilimsel"], correctAnswer: 0, explanation: "«yanlış, eksik ya da kasıtlı olarak çarpıtılmış»." },
      { id: "r-c1-06-q3", level: "C1", topic: "Çıkarım", question: "Ne daha hızlı yayılıyor?", options: ["Sansasyonel başlıklar", "Doğru haberler", "Bilimsel makaleler", "Kitaplar"], correctAnswer: 0, explanation: "«Sansasyonel başlıklar, doğru haberlerden çok daha hızlı yayılıyor»." },
      { id: "r-c1-06-q4", level: "C1", topic: "Çıkarım", question: "Bilinçli okur paylaşmadan önce ne yapmalı?", options: ["Kaynağını sorgulamalı", "Hemen paylaşmalı", "Görmezden gelmeli", "Silmeli"], correctAnswer: 0, explanation: "«kaynağını sorgulamalı, farklı kaynaklarla karşılaştırmalı»." },
      { id: "r-c1-06-q5", level: "C1", topic: "Çıkarım", question: "Okur nasıl değerlendirmeli?", options: ["Duygusal tepkilere kapılmadan", "Sadece duygularıyla", "Hızlıca", "Başlığa bakarak"], correctAnswer: 0, explanation: "«duygusal tepkilerine kapılmadan değerlendirmelidir»." },
    ],
    synonyms: [
      { word: "çarpıtmak", synonym: "saptırmak" },
      { word: "sorgulamak", synonym: "irdelemek" },
      { word: "ayırt etmek", synonym: "fark etmek" },
    ],
  },

  /* --------------------------- Batch 5 --------------------------- */
  {
    id: "r-a1-08", level: "A1", topic: "Günlük hayat",
    title: "Marketten Sonra",
    text: "Bugün annemle markete gittik. Ekmek, süt, peynir ve meyve aldık. Market evimize yakın. Eve dönerken yağmur başladı ama şemsiyemiz vardı. Eve gelince çay yaptık ve birlikte oturduk. Güzel bir gündü.",
    questions: [
      { id: "r-a1-08-q1", level: "A1", topic: "Detay", question: "Kiminle markete gittiler?", options: ["Annesiyle", "Babasıyla", "Arkadaşıyla", "Yalnız"], correctAnswer: 0, explanation: "«annemle markete gittik»." },
      { id: "r-a1-08-q2", level: "A1", topic: "Detay", question: "Ne almadılar?", options: ["Et", "Ekmek", "Süt", "Meyve"], correctAnswer: 0, explanation: "Купили ekmek, süt, peynir, meyve; мяса нет." },
      { id: "r-a1-08-q3", level: "A1", topic: "Detay", question: "Eve dönerken ne oldu?", options: ["Yağmur başladı", "Kar yağdı", "Güneş açtı", "Rüzgâr çıktı"], correctAnswer: 0, explanation: "«yağmur başladı»." },
      { id: "r-a1-08-q4", level: "A1", topic: "Detay", question: "Eve gelince ne yaptılar?", options: ["Çay yaptılar", "Uyudular", "Çıktılar", "Çalıştılar"], correctAnswer: 0, explanation: "«Eve gelince çay yaptık»." },
      { id: "r-a1-08-q5", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Market eve uzak.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«Market evimize yakın»." },
    ],
    synonyms: [
      { word: "yakın", synonym: "uzak olmayan" },
      { word: "başlamak", synonym: "başlangıç yapmak" },
      { word: "birlikte", synonym: "beraber" },
    ],
  },
  {
    id: "r-a2-08", level: "A2", topic: "Sağlık",
    title: "Doktora Gitmek",
    text: "Geçen hafta kendimi iyi hissetmedim. Başım ağrıyordu ve hâlsizdim. Bu yüzden doktora gittim. Doktor beni muayene etti ve dinlenmem gerektiğini söyledi. Bana ilaç yazdı ve bol su içmemi tavsiye etti. Birkaç gün sonra kendimi çok daha iyi hissettim.",
    questions: [
      { id: "r-a2-08-q1", level: "A2", topic: "Detay", question: "Yazarın şikâyeti neydi?", options: ["Baş ağrısı ve hâlsizlik", "Karın ağrısı", "Diş ağrısı", "Öksürük"], correctAnswer: 0, explanation: "«Başım ağrıyordu ve hâlsizdim»." },
      { id: "r-a2-08-q2", level: "A2", topic: "Detay", question: "Doktor ne söyledi?", options: ["Dinlenmesi gerektiğini", "Çalışması gerektiğini", "Spor yapmasını", "Seyahat etmesini"], correctAnswer: 0, explanation: "«dinlenmem gerektiğini söyledi»." },
      { id: "r-a2-08-q3", level: "A2", topic: "Detay", question: "Doktor ne tavsiye etti?", options: ["Bol su içmeyi", "Çok yemeyi", "Geç yatmayı", "Kahve içmeyi"], correctAnswer: 0, explanation: "«bol su içmemi tavsiye etti»." },
      { id: "r-a2-08-q4", level: "A2", topic: "Detay", question: "Birkaç gün sonra ne oldu?", options: ["Daha iyi hissetti", "Daha kötü oldu", "Hastaneye yattı", "Hiç değişmedi"], correctAnswer: 0, explanation: "«kendimi çok daha iyi hissettim»." },
      { id: "r-a2-08-q5", level: "A2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Doktor ilaç yazmadı.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«Bana ilaç yazdı»." },
    ],
    synonyms: [
      { word: "hâlsiz", synonym: "yorgun" },
      { word: "muayene etmek", synonym: "kontrol etmek" },
      { word: "tavsiye etmek", synonym: "önermek" },
    ],
  },
  {
    id: "r-b1-10", level: "B1", topic: "Çalışma hayatı",
    title: "Takım Çalışması",
    text: "Bir işyerinde başarı, çoğu zaman bireysel yeteneklerden çok takım çalışmasına bağlıdır. İyi bir ekip, üyelerinin güçlü yönlerini birleştirir ve zayıf yönlerini tamamlar. Açık iletişim, takım çalışmasının temelidir; herkes fikrini rahatça söyleyebilmelidir. Anlaşmazlıklar normaldir, ancak saygı çerçevesinde çözülmelidir. Ortak bir hedefe birlikte yürümek, hem işi kolaylaştırır hem de çalışanları motive eder.",
    questions: [
      { id: "r-b1-10-q1", level: "B1", topic: "Çıkarım", question: "İşyerinde başarı neye bağlıdır?", options: ["Takım çalışmasına", "Sadece bireysel yeteneğe", "Şansa", "Paraya"], correctAnswer: 0, explanation: "«bireysel yeteneklerden çok takım çalışmasına bağlıdır»." },
      { id: "r-b1-10-q2", level: "B1", topic: "Detay", question: "İyi bir ekip ne yapar?", options: ["Güçlü yönleri birleştirir", "Üyeleri ayırır", "Sadece eleştirir", "Hiçbir şey"], correctAnswer: 0, explanation: "«güçlü yönlerini birleştirir»." },
      { id: "r-b1-10-q3", level: "B1", topic: "Detay", question: "Takım çalışmasının temeli nedir?", options: ["Açık iletişim", "Sessizlik", "Rekabet", "Yarış"], correctAnswer: 0, explanation: "«Açık iletişim, takım çalışmasının temelidir»." },
      { id: "r-b1-10-q4", level: "B1", topic: "Çıkarım", question: "Anlaşmazlıklar nasıl çözülmeli?", options: ["Saygı çerçevesinde", "Kavgayla", "Görmezden gelerek", "Ayrılarak"], correctAnswer: 0, explanation: "«saygı çerçevesinde çözülmelidir»." },
      { id: "r-b1-10-q5", level: "B1", topic: "Çıkarım", question: "Ortak hedefe yürümek ne sağlar?", options: ["İşi kolaylaştırır ve motive eder", "Stresi artırır", "Zaman kaybettirir", "İşi zorlaştırır"], correctAnswer: 0, explanation: "«işi kolaylaştırır hem de çalışanları motive eder»." },
    ],
    synonyms: [
      { word: "birleştirmek", synonym: "bir araya getirmek" },
      { word: "tamamlamak", synonym: "bütünlemek" },
      { word: "anlaşmazlık", synonym: "uyuşmazlık" },
    ],
  },
  {
    id: "r-b1-11", level: "B1", topic: "Seyahat",
    title: "Sorumlu Turizm",
    text: "Seyahat etmek harika bir deneyimdir, ancak gittiğimiz yerlere karşı sorumluluklarımız da vardır. Sorumlu turizm, yerel kültüre saygı göstermeyi, doğayı korumayı ve yerel ekonomiye katkıda bulunmayı içerir. Örneğin, yerel işletmelerden alışveriş yapmak ve çöplerimizi doğaya bırakmamak basit ama etkili davranışlardır. Bir turist olarak bıraktığımız iz, ziyaret ettiğimiz yer için ya bir armağan ya da bir yük olabilir.",
    questions: [
      { id: "r-b1-11-q1", level: "B1", topic: "Detay", question: "Sorumlu turizm neyi içerir?", options: ["Yerel kültüre saygı ve doğayı korumayı", "Sadece eğlenceyi", "Çok harcamayı", "Hızlı gezmeyi"], correctAnswer: 0, explanation: "«yerel kültüre saygı göstermeyi, doğayı korumayı»." },
      { id: "r-b1-11-q2", level: "B1", topic: "Detay", question: "Hangisi etkili bir davranıştır?", options: ["Yerel işletmeden alışveriş", "Çöp bırakmak", "Gürültü yapmak", "Pazarlık etmemek"], correctAnswer: 0, explanation: "«yerel işletmelerden alışveriş yapmak»." },
      { id: "r-b1-11-q3", level: "B1", topic: "Çıkarım", question: "Turistin bıraktığı iz ne olabilir?", options: ["Armağan ya da yük", "Sadece zarar", "Sadece fayda", "Hiçbir şey"], correctAnswer: 0, explanation: "«ya bir armağan ya da bir yük olabilir»." },
      { id: "r-b1-11-q4", level: "B1", topic: "Çıkarım", question: "Doğaya ne bırakmamalıyız?", options: ["Çöp", "Para", "Fikir", "İz"], correctAnswer: 0, explanation: "«çöplerimizi doğaya bırakmamak»." },
      { id: "r-b1-11-q5", level: "B1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Turistlerin sorumluluğu yoktur.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«sorumluluklarımız da vardır»." },
    ],
    synonyms: [
      { word: "sorumluluk", synonym: "yükümlülük" },
      { word: "katkıda bulunmak", synonym: "destek olmak" },
      { word: "armağan", synonym: "hediye" },
    ],
  },
  {
    id: "r-b2-09", level: "B2", topic: "Bilim",
    title: "Uykunun Bilimi",
    text: "Bilim insanları, uykunun beyin sağlığı için sandığımızdan çok daha kritik olduğunu ortaya koyuyor. Uyku sırasında beyin, gün boyunca biriken zararlı atık maddeleri temizler ve hafızayı güçlendirir. Kronik uykusuzluğun, uzun vadede odaklanma sorunlarından bağışıklık zayıflığına kadar pek çok soruna yol açtığı biliniyor. Modern yaşamın getirdiği yapay ışık ve ekran kullanımı, vücudun doğal uyku ritmini bozuyor. Uzmanlar, kaliteli uyku için karanlık, sessiz ve serin bir ortamın önemini vurguluyor.",
    questions: [
      { id: "r-b2-09-q1", level: "B2", topic: "Detay", question: "Uyku sırasında beyin ne yapar?", options: ["Zararlı atıkları temizler", "Tamamen kapanır", "Daha çok yorulur", "Hiçbir şey"], correctAnswer: 0, explanation: "«zararlı atık maddeleri temizler»." },
      { id: "r-b2-09-q2", level: "B2", topic: "Çıkarım", question: "Kronik uykusuzluk neye yol açar?", options: ["Odaklanma ve bağışıklık sorunlarına", "Daha iyi hafızaya", "Daha çok enerjiye", "Hiçbir şeye"], correctAnswer: 0, explanation: "«odaklanma sorunlarından bağışıklık zayıflığına»." },
      { id: "r-b2-09-q3", level: "B2", topic: "Detay", question: "Doğal uyku ritmini ne bozuyor?", options: ["Yapay ışık ve ekranlar", "Karanlık", "Sessizlik", "Serinlik"], correctAnswer: 0, explanation: "«yapay ışık ve ekran kullanımı … bozuyor»." },
      { id: "r-b2-09-q4", level: "B2", topic: "Detay", question: "Kaliteli uyku için nasıl bir ortam gerekir?", options: ["Karanlık, sessiz, serin", "Aydınlık ve gürültülü", "Sıcak", "Kalabalık"], correctAnswer: 0, explanation: "«karanlık, sessiz ve serin bir ortam»." },
      { id: "r-b2-09-q5", level: "B2", topic: "Çıkarım", question: "Metnin ana fikri nedir?", options: ["Uyku beyin sağlığı için kritiktir", "Uyku önemsizdir", "Ekranlar faydalıdır", "Az uyku iyidir"], correctAnswer: 0, explanation: "«uykunun beyin sağlığı için … kritik olduğunu»." },
    ],
    synonyms: [
      { word: "kritik", synonym: "hayati" },
      { word: "biriken", synonym: "toplanan" },
      { word: "bozmak", synonym: "aksatmak" },
    ],
  },
  {
    id: "r-c1-07", level: "C1", topic: "Felsefe",
    title: "Mutluluk Üzerine",
    text: "İnsanlık tarihi boyunca filozoflar, mutluluğun ne olduğu ve nasıl elde edilebileceği sorusu üzerinde düşünmüştür. Kimileri için mutluluk, hazların peşinden koşmaktır; kimileri içinse erdemli bir yaşam sürmenin doğal sonucudur. Modern psikoloji ise mutluluğu anlık bir duygu olarak değil, anlamlı ilişkiler, kişisel gelişim ve bir amaç duygusuyla beslenen kalıcı bir tatmin hâli olarak tanımlama eğilimindedir. İlginç olan şu ki, mutluluğu doğrudan hedeflemek çoğu zaman onu yakalamayı zorlaştırır; mutluluk, anlamlı bir hayatın peşinden adeta bir gölge gibi gelir.",
    questions: [
      { id: "r-c1-07-q1", level: "C1", topic: "Detay", question: "Filozoflar ne üzerinde düşünmüştür?", options: ["Mutluluğun ne olduğu", "Paranın değeri", "Savaşın nedeni", "Dilin kökeni"], correctAnswer: 0, explanation: "«mutluluğun ne olduğu … üzerinde düşünmüştür»." },
      { id: "r-c1-07-q2", level: "C1", topic: "Çıkarım", question: "Bazılarına göre mutluluk nedir?", options: ["Hazların peşinden koşmak", "Çok çalışmak", "Yalnız kalmak", "Para biriktirmek"], correctAnswer: 0, explanation: "«mutluluk, hazların peşinden koşmaktır»." },
      { id: "r-c1-07-q3", level: "C1", topic: "Detay", question: "Modern psikoloji mutluluğu nasıl tanımlıyor?", options: ["Kalıcı bir tatmin hâli", "Anlık bir duygu", "Bir hayal", "Bir hastalık"], correctAnswer: 0, explanation: "«kalıcı bir tatmin hâli olarak tanımlama eğiliminde»." },
      { id: "r-c1-07-q4", level: "C1", topic: "Detay", question: "Mutluluğu neler besler?", options: ["Anlamlı ilişkiler ve amaç duygusu", "Sadece para", "Sadece haz", "Yalnızlık"], correctAnswer: 0, explanation: "«anlamlı ilişkiler, kişisel gelişim ve bir amaç duygusu»." },
      { id: "r-c1-07-q5", level: "C1", topic: "Çıkarım", question: "Mutluluğu doğrudan hedeflemek nasıldır?", options: ["Onu yakalamayı zorlaştırır", "Onu kolaylaştırır", "Etkisizdir", "Tek yoldur"], correctAnswer: 0, explanation: "«doğrudan hedeflemek … onu yakalamayı zorlaştırır»." },
    ],
    synonyms: [
      { word: "haz", synonym: "zevk" },
      { word: "erdemli", synonym: "faziletli" },
      { word: "kalıcı", synonym: "sürekli" },
    ],
  },
  {
    id: "r-c1-08", level: "C1", topic: "Ekonomi",
    title: "Paylaşım Ekonomisi",
    text: "Son on yılda yükselen 'paylaşım ekonomisi', sahip olmak yerine erişmeyi önceleyen yeni bir tüketim anlayışını temsil ediyor. Araç, ev ve hatta iş gücünün dijital platformlar aracılığıyla paylaşıldığı bu modelde, atıl kaynaklar daha verimli kullanılıyor. Savunucuları, bu sistemin hem çevresel açıdan sürdürülebilir hem de ekonomik açıdan kapsayıcı olduğunu ileri sürüyor. Eleştirmenler ise düzenlemeden yoksun bu platformların güvencesiz çalışma koşulları yarattığına ve geleneksel sektörleri haksız rekabete sürüklediğine dikkat çekiyor. Modelin geleceği, kâr arayışı ile kamu yararı arasında kurulacak dengeye bağlı görünüyor.",
    questions: [
      { id: "r-c1-08-q1", level: "C1", topic: "Detay", question: "Paylaşım ekonomisi neyi önceliyor?", options: ["Sahip olmak yerine erişmeyi", "Çok üretmeyi", "Biriktirmeyi", "Tek kullanımı"], correctAnswer: 0, explanation: "«sahip olmak yerine erişmeyi önceleyen»." },
      { id: "r-c1-08-q2", level: "C1", topic: "Detay", question: "Bu modelde ne paylaşılıyor?", options: ["Araç, ev ve iş gücü", "Sadece para", "Sadece yiyecek", "Hiçbir şey"], correctAnswer: 0, explanation: "«Araç, ev ve hatta iş gücünün … paylaşıldığı»." },
      { id: "r-c1-08-q3", level: "C1", topic: "Çıkarım", question: "Savunucular ne ileri sürüyor?", options: ["Sürdürülebilir ve kapsayıcı olduğunu", "Zararlı olduğunu", "Eski olduğunu", "Pahalı olduğunu"], correctAnswer: 0, explanation: "«çevresel açıdan sürdürülebilir hem de … kapsayıcı»." },
      { id: "r-c1-08-q4", level: "C1", topic: "Çıkarım", question: "Eleştirmenler neye dikkat çekiyor?", options: ["Güvencesiz çalışma koşullarına", "Düşük fiyatlara", "Yüksek kaliteye", "Hızlı teslimata"], correctAnswer: 0, explanation: "«güvencesiz çalışma koşulları yarattığına»." },
      { id: "r-c1-08-q5", level: "C1", topic: "Çıkarım", question: "Modelin geleceği neye bağlı?", options: ["Kâr ve kamu yararı dengesine", "Reklama", "Nüfusa", "Hava durumuna"], correctAnswer: 0, explanation: "«kâr arayışı ile kamu yararı arasında kurulacak dengeye»." },
    ],
    synonyms: [
      { word: "atıl", synonym: "kullanılmayan" },
      { word: "kapsayıcı", synonym: "kuşatıcı" },
      { word: "güvencesiz", synonym: "garantisiz" },
    ],
  },
  {
    id: "r-c1-09", level: "C1", topic: "Çevre politikaları",
    title: "Enerji Dönüşümü",
    text: "Fosil yakıtlardan yenilenebilir kaynaklara geçiş, çağımızın en büyük teknolojik ve siyasi meydan okumalarından biridir. Güneş ve rüzgâr enerjisinin maliyeti hızla düşse de, bu kaynakların kesintili doğası ciddi bir depolama sorunu yaratmaktadır. Güneş her zaman parlamaz, rüzgâr her zaman esmez; dolayısıyla enerjinin verimli biçimde depolanabilmesi hayati önem taşır. Ayrıca bu dönüşüm, kömür madenciliği gibi sektörlerde çalışan milyonlarca insanın geçim kaynağını da etkileyecektir. Adil bir enerji dönüşümü, yalnızca teknolojik değil, aynı zamanda toplumsal bir planlama gerektirir.",
    questions: [
      { id: "r-c1-09-q1", level: "C1", topic: "Detay", question: "Çağımızın büyük meydan okuması nedir?", options: ["Yenilenebilir kaynaklara geçiş", "Nüfus artışı", "Şehirleşme", "Turizm"], correctAnswer: 0, explanation: "«yenilenebilir kaynaklara geçiş … meydan okumalarından biri»." },
      { id: "r-c1-09-q2", level: "C1", topic: "Çıkarım", question: "Bu kaynakların temel sorunu nedir?", options: ["Kesintili doğası ve depolama", "Çok pahalı olması", "Bulunamaması", "Kirletmesi"], correctAnswer: 0, explanation: "«kesintili doğası ciddi bir depolama sorunu yaratmaktadır»." },
      { id: "r-c1-09-q3", level: "C1", topic: "Detay", question: "Neden depolama hayatidir?", options: ["Güneş ve rüzgâr her zaman olmaz", "Enerji ucuzdur", "Talep yoktur", "Kaynak sınırsızdır"], correctAnswer: 0, explanation: "«Güneş her zaman parlamaz, rüzgâr her zaman esmez»." },
      { id: "r-c1-09-q4", level: "C1", topic: "Çıkarım", question: "Dönüşüm hangi sektör çalışanlarını etkiler?", options: ["Kömür madenciliği", "Turizm", "Eğitim", "Sağlık"], correctAnswer: 0, explanation: "«kömür madenciliği gibi sektörlerde çalışan milyonlarca insan»." },
      { id: "r-c1-09-q5", level: "C1", topic: "Çıkarım", question: "Adil dönüşüm ne gerektirir?", options: ["Toplumsal planlama", "Sadece teknoloji", "Daha çok kömür", "Hiçbir şey"], correctAnswer: 0, explanation: "«yalnızca teknolojik değil, aynı zamanda toplumsal bir planlama»." },
    ],
    synonyms: [
      { word: "meydan okuma", synonym: "zorluk" },
      { word: "kesintili", synonym: "süreksiz" },
      { word: "geçim kaynağı", synonym: "ekmek kapısı" },
    ],
  },
  {
    id: "r-c1-10", level: "C1", topic: "Toplum",
    title: "Gönüllülüğün Gücü",
    text: "Gönüllülük, modern toplumların görünmez ama vazgeçilmez bir dayanağıdır. Maddi bir karşılık beklemeden başkalarının iyiliği için çalışan bireyler, devletin ya da piyasanın yetişemediği boşlukları doldurur. Araştırmalar, gönüllülüğün yalnızca yardım edilenlere değil, yardım edenlere de büyük fayda sağladığını gösteriyor: gönüllüler daha düşük stres düzeyleri ve daha güçlü bir aidiyet duygusu bildiriyor. Ne var ki gönüllülüğün sürdürülebilir olması için kurumsal destek şarttır; iyi niyet tek başına yeterli değildir. Toplum, gönüllü emeğini takdir eden ve koruyan yapılar kurmadıkça, bu değerli kaynak zamanla tükenebilir.",
    questions: [
      { id: "r-c1-10-q1", level: "C1", topic: "Çıkarım", question: "Gönüllüler hangi boşlukları doldurur?", options: ["Devletin ve piyasanın yetişemediği", "Sadece ailenin", "Sadece okulun", "Hiçbirini"], correctAnswer: 0, explanation: "«devletin ya da piyasanın yetişemediği boşlukları»." },
      { id: "r-c1-10-q2", level: "C1", topic: "Detay", question: "Gönüllülük kime fayda sağlar?", options: ["Hem yardım edilene hem edene", "Sadece yardım edilene", "Sadece devlete", "Hiç kimseye"], correctAnswer: 0, explanation: "«yardım edilenlere değil, yardım edenlere de büyük fayda»." },
      { id: "r-c1-10-q3", level: "C1", topic: "Detay", question: "Gönüllüler ne bildiriyor?", options: ["Düşük stres ve güçlü aidiyet", "Yüksek stres", "Yalnızlık", "Hiçbir şey"], correctAnswer: 0, explanation: "«daha düşük stres düzeyleri ve daha güçlü bir aidiyet duygusu»." },
      { id: "r-c1-10-q4", level: "C1", topic: "Çıkarım", question: "Sürdürülebilirlik için ne şart?", options: ["Kurumsal destek", "Sadece iyi niyet", "Daha çok para", "Reklam"], correctAnswer: 0, explanation: "«kurumsal destek şarttır; iyi niyet tek başına yeterli değildir»." },
      { id: "r-c1-10-q5", level: "C1", topic: "Çıkarım", question: "Yapılar kurulmazsa ne olur?", options: ["Bu kaynak tükenebilir", "Sonsuza dek sürer", "Para artar", "Hiçbir şey"], correctAnswer: 0, explanation: "«bu değerli kaynak zamanla tükenebilir»." },
    ],
    synonyms: [
      { word: "vazgeçilmez", synonym: "olmazsa olmaz" },
      { word: "aidiyet", synonym: "ait olma" },
      { word: "takdir etmek", synonym: "değer vermek" },
    ],
  },

  /* --------------------------- Batch 6 (reading tamam) --------------------------- */
  {
    id: "r-a1-09", level: "A1", topic: "Hobi",
    title: "Müzik Sevgisi",
    text: "Ben müziği çok seviyorum. Her gün okuldan sonra gitar çalıyorum. Annem bana geçen yıl bir gitar aldı. Şimdi birkaç şarkı çalabiliyorum. Arkadaşlarım da müzik seviyor. Bazen birlikte şarkı söylüyoruz. Müzik beni mutlu ediyor.",
    questions: [
      { id: "r-a1-09-q1", level: "A1", topic: "Detay", question: "Okuldan sonra ne yapıyor?", options: ["Gitar çalıyor", "Yüzüyor", "Uyuyor", "Çalışıyor"], correctAnswer: 0, explanation: "«okuldan sonra gitar çalıyorum»." },
      { id: "r-a1-09-q2", level: "A1", topic: "Detay", question: "Gitarı kim aldı?", options: ["Annesi", "Babası", "Arkadaşı", "Kendisi"], correctAnswer: 0, explanation: "«Annem bana … bir gitar aldı»." },
      { id: "r-a1-09-q3", level: "A1", topic: "Detay", question: "Arkadaşlarıyla ne yapıyor?", options: ["Şarkı söylüyor", "Resim yapıyor", "Koşuyor", "Yemek yapıyor"], correctAnswer: 0, explanation: "«birlikte şarkı söylüyoruz»." },
      { id: "r-a1-09-q4", level: "A1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Hiç şarkı çalamıyor.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«birkaç şarkı çalabiliyorum»." },
      { id: "r-a1-09-q5", level: "A1", topic: "Çıkarım", question: "Müzik onu nasıl yapıyor?", options: ["Mutlu", "Üzgün", "Yorgun", "Sinirli"], correctAnswer: 0, explanation: "«Müzik beni mutlu ediyor»." },
    ],
    synonyms: [
      { word: "sevmek", synonym: "hoşlanmak" },
      { word: "almak", synonym: "satın almak" },
      { word: "mutlu", synonym: "sevinçli" },
    ],
  },
  {
    id: "r-a2-09", level: "A2", topic: "Günlük hayat",
    title: "Ev Taşıma",
    text: "Geçen ay yeni bir eve taşındık. Eski evimiz küçüktü, bu yüzden daha büyük bir ev aradık. Yeni evimizin üç odası ve geniş bir balkonu var. Taşınmak çok yorucuydu; bütün eşyaları kutulara koyduk. Ama şimdi çok mutluyuz. Yeni komşularımız da çok cana yakın.",
    questions: [
      { id: "r-a2-09-q1", level: "A2", topic: "Detay", question: "Neden yeni ev aradılar?", options: ["Eski ev küçüktü", "Ev pahalıydı", "İş değişti", "Komşular kötüydü"], correctAnswer: 0, explanation: "«Eski evimiz küçüktü»." },
      { id: "r-a2-09-q2", level: "A2", topic: "Detay", question: "Yeni evin kaç odası var?", options: ["Üç", "İki", "Dört", "Beş"], correctAnswer: 0, explanation: "«üç odası … var»." },
      { id: "r-a2-09-q3", level: "A2", topic: "Detay", question: "Taşınmak nasıldı?", options: ["Yorucu", "Kolay", "Eğlenceli", "Hızlı"], correctAnswer: 0, explanation: "«Taşınmak çok yorucuydu»." },
      { id: "r-a2-09-q4", level: "A2", topic: "Detay", question: "Yeni komşular nasıl?", options: ["Cana yakın", "Soğuk", "Gürültülü", "Kaba"], correctAnswer: 0, explanation: "«komşularımız da çok cana yakın»." },
      { id: "r-a2-09-q5", level: "A2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Yeni evde balkon yok.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«geniş bir balkonu var»." },
    ],
    synonyms: [
      { word: "taşınmak", synonym: "göçmek" },
      { word: "geniş", synonym: "büyük" },
      { word: "cana yakın", synonym: "sıcakkanlı" },
    ],
  },
  {
    id: "r-b1-12", level: "B1", topic: "Çevre",
    title: "Su Tasarrufu",
    text: "Temiz su, dünyanın en değerli kaynaklarından biridir, ancak çoğu zaman onu boşa harcıyoruz. Diş fırçalarken musluğu kapatmak, kısa duş almak ve damlayan muslukları tamir etmek günlük hayatta su tasarrufu sağlayan basit yollardır. Tarımda ve sanayide ise çok daha büyük miktarda su kullanılıyor. Gelecekte su kıtlığının ciddi bir sorun hâline gelmemesi için herkesin bu konuda bilinçli davranması gerekiyor.",
    questions: [
      { id: "r-b1-12-q1", level: "B1", topic: "Detay", question: "Su tasarrufu için ne yapılabilir?", options: ["Musluğu kapatmak ve kısa duş", "Uzun duş almak", "Musluğu açık bırakmak", "Hiçbir şey"], correctAnswer: 0, explanation: "«musluğu kapatmak, kısa duş almak»." },
      { id: "r-b1-12-q2", level: "B1", topic: "Detay", question: "Nerede daha çok su kullanılıyor?", options: ["Tarımda ve sanayide", "Sadece evlerde", "Okullarda", "Parklarda"], correctAnswer: 0, explanation: "«Tarımda ve sanayide … çok daha büyük miktarda»." },
      { id: "r-b1-12-q3", level: "B1", topic: "Çıkarım", question: "Gelecekte hangi sorun olabilir?", options: ["Su kıtlığı", "Su bolluğu", "Çok yağmur", "Sel"], correctAnswer: 0, explanation: "«su kıtlığının ciddi bir sorun hâline gelmemesi»." },
      { id: "r-b1-12-q4", level: "B1", topic: "Detay", question: "Damlayan musluk için ne yapmalı?", options: ["Tamir etmek", "Görmezden gelmek", "Açmak", "Kırmak"], correctAnswer: 0, explanation: "«damlayan muslukları tamir etmek»." },
      { id: "r-b1-12-q5", level: "B1", topic: "Çıkarım", question: "Herkes nasıl davranmalı?", options: ["Bilinçli", "Dikkatsiz", "İlgisiz", "Hızlı"], correctAnswer: 0, explanation: "«herkesin bu konuda bilinçli davranması gerekiyor»." },
    ],
    synonyms: [
      { word: "değerli", synonym: "kıymetli" },
      { word: "boşa harcamak", synonym: "israf etmek" },
      { word: "kıtlık", synonym: "yokluk" },
    ],
  },
  {
    id: "r-b1-13", level: "B1", topic: "Toplum",
    title: "Komşuluk İlişkileri",
    text: "Eskiden insanlar komşularını yakından tanır, dertlerini paylaşır ve zor zamanlarda birbirine destek olurdu. Bugün, özellikle büyük şehirlerde, komşuluk ilişkileri oldukça zayıfladı. Birçok kişi yıllardır aynı binada oturduğu insanların adını bile bilmiyor. Oysa iyi komşuluk, kendimizi daha güvende ve daha az yalnız hissetmemizi sağlar. Bir merhaba demek, küçük bir yardımda bulunmak bu ilişkileri yeniden canlandırabilir.",
    questions: [
      { id: "r-b1-13-q1", level: "B1", topic: "Detay", question: "Eskiden insanlar komşularıyla ne yapardı?", options: ["Dertlerini paylaşırdı", "Hiç konuşmazdı", "Kavga ederdi", "Taşınırdı"], correctAnswer: 0, explanation: "«dertlerini paylaşır ve … destek olurdu»." },
      { id: "r-b1-13-q2", level: "B1", topic: "Detay", question: "Bugün komşuluk ilişkileri nasıl?", options: ["Zayıfladı", "Güçlendi", "Aynı kaldı", "Yok oldu"], correctAnswer: 0, explanation: "«komşuluk ilişkileri oldukça zayıfladı»." },
      { id: "r-b1-13-q3", level: "B1", topic: "Çıkarım", question: "İyi komşuluk ne sağlar?", options: ["Güven ve daha az yalnızlık", "Daha çok para", "Daha çok iş", "Stres"], correctAnswer: 0, explanation: "«daha güvende ve daha az yalnız hissetmemizi sağlar»." },
      { id: "r-b1-13-q4", level: "B1", topic: "Detay", question: "İlişkiler nasıl canlanabilir?", options: ["Bir merhaba demek ve yardım", "Uzak durmak", "Görmezden gelmek", "Taşınmak"], correctAnswer: 0, explanation: "«Bir merhaba demek, küçük bir yardımda bulunmak»." },
      { id: "r-b1-13-q5", level: "B1", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Herkes komşusunu iyi tanıyor.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«insanların adını bile bilmiyor»." },
    ],
    synonyms: [
      { word: "zayıflamak", synonym: "güçsüzleşmek" },
      { word: "destek olmak", synonym: "yardım etmek" },
      { word: "canlandırmak", synonym: "diriltmek" },
    ],
  },
  {
    id: "r-b2-10", level: "B2", topic: "Bilim",
    title: "Uzay Araştırmalarının Faydaları",
    text: "Uzay araştırmalarına harcanan paranın dünyadaki sorunlara ayrılması gerektiğini savunanlar var. Ancak uzay çalışmaları, günlük hayatımızı doğrudan etkileyen birçok teknolojinin doğmasını sağladı. GPS, hava durumu tahminleri, su arıtma sistemleri ve hatta bazı tıbbi cihazlar, uzay teknolojilerinin bir ürünüdür. Ayrıca uzay araştırmaları, insanlığın ortak merakını besler ve uluslararası iş birliğini teşvik eder. Yani uzaya bakmak, aslında kendimizi ve gezegenimizi daha iyi anlamamıza yardımcı olur.",
    questions: [
      { id: "r-b2-10-q1", level: "B2", topic: "Çıkarım", question: "Bazıları neyi savunuyor?", options: ["Paranın dünyadaki sorunlara ayrılmasını", "Daha çok uzay parası", "Uzayın yasaklanmasını", "Hiçbir şeyi"], correctAnswer: 0, explanation: "«paranın dünyadaki sorunlara ayrılması gerektiğini savunanlar»." },
      { id: "r-b2-10-q2", level: "B2", topic: "Detay", question: "Hangisi uzay teknolojisinin ürünü?", options: ["GPS", "Tekerlek", "Ateş", "Kâğıt"], correctAnswer: 0, explanation: "«GPS, hava durumu tahminleri … bir ürünüdür»." },
      { id: "r-b2-10-q3", level: "B2", topic: "Detay", question: "Uzay araştırmaları neyi teşvik eder?", options: ["Uluslararası iş birliğini", "Savaşı", "Rekabeti", "İzolasyonu"], correctAnswer: 0, explanation: "«uluslararası iş birliğini teşvik eder»." },
      { id: "r-b2-10-q4", level: "B2", topic: "Çıkarım", question: "Uzaya bakmak neye yardımcı olur?", options: ["Kendimizi ve gezegeni anlamaya", "Para kazanmaya", "Unutmaya", "Hiçbir şeye"], correctAnswer: 0, explanation: "«kendimizi ve gezegenimizi daha iyi anlamamıza»." },
      { id: "r-b2-10-q5", level: "B2", topic: "Doğru/Yanlış", question: "Doğru mu, yanlış mı? «Uzay çalışmaları günlük hayata etki etmez.»", options: ["Doğru", "Yanlış"], correctAnswer: 1, explanation: "«günlük hayatımızı doğrudan etkileyen birçok teknoloji»." },
    ],
    synonyms: [
      { word: "savunmak", synonym: "müdafaa etmek" },
      { word: "teşvik etmek", synonym: "özendirmek" },
      { word: "merak", synonym: "ilgi" },
    ],
  },
  {
    id: "r-b2-11", level: "B2", topic: "Kültür",
    title: "Sinemanın Gücü",
    text: "Sinema, yalnızca bir eğlence aracı değil, aynı zamanda güçlü bir kültürel ve toplumsal araçtır. İyi bir film, bizi hiç tanımadığımız insanların hayatına sokar, farklı bakış açılarını anlamamızı sağlar ve empati duygumuzu geliştirir. Tarih boyunca birçok film, toplumsal sorunlara dikkat çekerek değişimin habercisi olmuştur. Elbette sinema ticari bir sektördür ve bazen yalnızca kâr amacı güder. Ancak en kalıcı filmler, bizi düşündüren ve duygularımıza dokunanlardır.",
    questions: [
      { id: "r-b2-11-q1", level: "B2", topic: "Çıkarım", question: "Sinema sadece ne değildir?", options: ["Bir eğlence aracı", "Bir sanat", "Bir sektör", "Bir araç"], correctAnswer: 0, explanation: "«yalnızca bir eğlence aracı değil»." },
      { id: "r-b2-11-q2", level: "B2", topic: "Detay", question: "İyi bir film neyi geliştirir?", options: ["Empati duygusunu", "Fiziksel gücü", "Hızı", "Para kazanmayı"], correctAnswer: 0, explanation: "«empati duygumuzu geliştirir»." },
      { id: "r-b2-11-q3", level: "B2", topic: "Detay", question: "Birçok film tarihte ne olmuştur?", options: ["Değişimin habercisi", "Bir engel", "Bir hata", "Önemsiz"], correctAnswer: 0, explanation: "«değişimin habercisi olmuştur»." },
      { id: "r-b2-11-q4", level: "B2", topic: "Çıkarım", question: "Sinemanın bir gerçeği nedir?", options: ["Ticari bir sektör olması", "Hiç para kazanmaması", "Ücretsiz olması", "Yasak olması"], correctAnswer: 0, explanation: "«sinema ticari bir sektördür»." },
      { id: "r-b2-11-q5", level: "B2", topic: "Çıkarım", question: "En kalıcı filmler nasıldır?", options: ["Düşündüren ve duygulandıran", "Sadece komik", "Sadece pahalı", "Kısa"], correctAnswer: 0, explanation: "«bizi düşündüren ve duygularımıza dokunanlardır»." },
    ],
    synonyms: [
      { word: "geliştirmek", synonym: "güçlendirmek" },
      { word: "haberci", synonym: "müjdeci" },
      { word: "kalıcı", synonym: "sürekli" },
    ],
  },
  {
    id: "r-c1-11", level: "C1", topic: "Eğitim",
    title: "Eğitimde Fırsat Eşitliği",
    text: "Eğitim, çoğu zaman 'toplumsal eşitliğin en büyük aracı' olarak övülür; oysa pratikte, mevcut eşitsizlikleri pekiştiren bir mekanizmaya dönüşebilmektedir. Varlıklı ailelerin çocukları nitelikli okullara, özel derslere ve zengin kültürel olanaklara erişirken, dezavantajlı bölgelerde yaşayan çocuklar temel kaynaklardan dahi yoksun kalabiliyor. Bu durum, yeteneğin değil, doğulan ailenin başarıyı belirlediği bir döngü yaratır. Gerçek bir fırsat eşitliği için yalnızca okula erişimi sağlamak yetmez; eğitimin niteliğini her bölgede eşitleyecek kapsamlı politikalara ihtiyaç vardır.",
    questions: [
      { id: "r-c1-11-q1", level: "C1", topic: "Çıkarım", question: "Eğitim nasıl övülür?", options: ["Toplumsal eşitliğin aracı olarak", "Bir eğlence olarak", "Bir yük olarak", "Gereksiz olarak"], correctAnswer: 0, explanation: "«'toplumsal eşitliğin en büyük aracı' olarak övülür»." },
      { id: "r-c1-11-q2", level: "C1", topic: "Çıkarım", question: "Pratikte neye dönüşebilir?", options: ["Eşitsizliği pekiştiren mekanizmaya", "Eğlenceye", "Bir oyuna", "Hiçbir şeye"], correctAnswer: 0, explanation: "«eşitsizlikleri pekiştiren bir mekanizmaya dönüşebilmekte»." },
      { id: "r-c1-11-q3", level: "C1", topic: "Detay", question: "Varlıklı çocuklar neye erişiyor?", options: ["Nitelikli okul ve özel derslere", "Hiçbir şeye", "Sadece kitaplara", "Az kaynağa"], correctAnswer: 0, explanation: "«nitelikli okullara, özel derslere … erişirken»." },
      { id: "r-c1-11-q4", level: "C1", topic: "Çıkarım", question: "Bu döngüde başarıyı ne belirler?", options: ["Doğulan aile", "Sadece yetenek", "Şans", "Yaş"], correctAnswer: 0, explanation: "«doğulan ailenin başarıyı belirlediği bir döngü»." },
      { id: "r-c1-11-q5", level: "C1", topic: "Çıkarım", question: "Gerçek fırsat eşitliği için ne gerekir?", options: ["Eğitimin niteliğini eşitleyen politikalar", "Sadece okula erişim", "Daha çok sınav", "Hiçbir şey"], correctAnswer: 0, explanation: "«eğitimin niteliğini her bölgede eşitleyecek kapsamlı politikalara»." },
    ],
    synonyms: [
      { word: "pekiştirmek", synonym: "güçlendirmek" },
      { word: "yoksun", synonym: "mahrum" },
      { word: "döngü", synonym: "çevrim" },
    ],
  },
  {
    id: "r-c1-12", level: "C1", topic: "Sağlık",
    title: "Tele-tıp",
    text: "Tele-tıp, yani uzaktan sağlık hizmeti, son yıllarda hızla yaygınlaşan bir uygulamadır. Hastalar, doktorlarıyla video aracılığıyla görüşebiliyor, reçetelerini dijital olarak alabiliyor. Bu sistem özellikle kırsal bölgelerde yaşayan ve uzman doktora erişimi sınırlı olan kişiler için büyük bir kolaylık sağlıyor. Ancak tele-tıbbın sınırları da var: fiziksel muayene gerektiren durumlarda yetersiz kalabiliyor ve doktor-hasta arasındaki insani bağı zayıflatabiliyor. En verimli model, uzaktan ve yüz yüze hizmeti akıllıca birleştiren bir yaklaşım olacaktır.",
    questions: [
      { id: "r-c1-12-q1", level: "C1", topic: "Detay", question: "Tele-tıp nedir?", options: ["Uzaktan sağlık hizmeti", "Yeni bir ilaç", "Bir hastane", "Bir cihaz"], correctAnswer: 0, explanation: "«uzaktan sağlık hizmeti»." },
      { id: "r-c1-12-q2", level: "C1", topic: "Detay", question: "Hastalar doktorla nasıl görüşüyor?", options: ["Video aracılığıyla", "Mektupla", "Sadece telefonla", "Hiç"], correctAnswer: 0, explanation: "«video aracılığıyla görüşebiliyor»." },
      { id: "r-c1-12-q3", level: "C1", topic: "Çıkarım", question: "Kimler için büyük kolaylık?", options: ["Kırsal bölgedekiler", "Sadece şehirdekiler", "Doktorlar", "Hiç kimse"], correctAnswer: 0, explanation: "«kırsal bölgelerde yaşayan … kişiler için büyük bir kolaylık»." },
      { id: "r-c1-12-q4", level: "C1", topic: "Detay", question: "Tele-tıbbın bir sınırı nedir?", options: ["Fiziksel muayenede yetersizlik", "Çok pahalı olması", "Hiç işe yaramaması", "Yasak olması"], correctAnswer: 0, explanation: "«fiziksel muayene gerektiren durumlarda yetersiz kalabiliyor»." },
      { id: "r-c1-12-q5", level: "C1", topic: "Çıkarım", question: "En verimli model nedir?", options: ["Uzaktan ve yüz yüzeyi birleştirmek", "Sadece uzaktan", "Sadece yüz yüze", "Hiçbiri"], correctAnswer: 0, explanation: "«uzaktan ve yüz yüze hizmeti akıllıca birleştiren»." },
    ],
    synonyms: [
      { word: "yaygınlaşmak", synonym: "yayılmak" },
      { word: "sınır", synonym: "kısıt" },
      { word: "verimli", synonym: "etkili" },
    ],
  },
  {
    id: "r-c1-13", level: "C1", topic: "Toplum",
    title: "Yaşlanan Nüfus",
    text: "Dünyanın birçok gelişmiş ülkesi, ortalama yaşam süresinin uzaması ve doğum oranlarının düşmesiyle birlikte hızla yaşlanan bir nüfusla karşı karşıya. Bu demografik dönüşüm, emeklilik sistemleri ve sağlık hizmetleri üzerinde büyük bir baskı yaratıyor; çünkü çalışan nüfus azalırken, bakıma ihtiyaç duyan kişi sayısı artıyor. Bazı ülkeler bu soruna göçle, bazıları ise doğumu teşvik eden politikalarla çözüm arıyor. Ancak yaşlanmayı yalnızca bir sorun olarak görmek de yanıltıcıdır; deneyimli ve sağlıklı yaşlılar, topluma hâlâ büyük katkılar sunabilir.",
    questions: [
      { id: "r-c1-13-q1", level: "C1", topic: "Detay", question: "Nüfus neden yaşlanıyor?", options: ["Yaşam süresi uzadı, doğum azaldı", "Göç arttı", "Savaş çıktı", "Şehirler büyüdü"], correctAnswer: 0, explanation: "«yaşam süresinin uzaması ve doğum oranlarının düşmesiyle»." },
      { id: "r-c1-13-q2", level: "C1", topic: "Çıkarım", question: "Bu dönüşüm neyi zorluyor?", options: ["Emeklilik ve sağlık sistemlerini", "Okulları", "Yolları", "Parkları"], correctAnswer: 0, explanation: "«emeklilik sistemleri ve sağlık hizmetleri üzerinde büyük bir baskı»." },
      { id: "r-c1-13-q3", level: "C1", topic: "Çıkarım", question: "Neden baskı oluşuyor?", options: ["Çalışan azalırken bakım ihtiyacı artıyor", "Para çok", "Doktor çok", "Okul az"], correctAnswer: 0, explanation: "«çalışan nüfus azalırken, bakıma ihtiyaç duyan kişi sayısı artıyor»." },
      { id: "r-c1-13-q4", level: "C1", topic: "Detay", question: "Ülkeler nasıl çözüm arıyor?", options: ["Göç ve doğumu teşvik", "Sadece vergiyle", "Hiçbir şey yapmadan", "Sınırları kapatarak"], correctAnswer: 0, explanation: "«göçle, bazıları ise doğumu teşvik eden politikalarla»." },
      { id: "r-c1-13-q5", level: "C1", topic: "Çıkarım", question: "Yaşlanmayı sadece sorun görmek nasıldır?", options: ["Yanıltıcı", "Doğru", "Zorunlu", "Faydalı"], correctAnswer: 0, explanation: "«yalnızca bir sorun olarak görmek de yanıltıcıdır»." },
    ],
    synonyms: [
      { word: "dönüşüm", synonym: "değişim" },
      { word: "baskı", synonym: "yük" },
      { word: "katkı", synonym: "fayda" },
    ],
  },
  {
    id: "r-c1-14", level: "C1", topic: "Teknoloji",
    title: "Algoritmaların Görünmez Etkisi",
    text: "Günlük hayatımızın büyük bölümü, artık fark etmediğimiz algoritmalar tarafından şekillendiriliyor. Hangi haberi okuyacağımız, hangi videoyu izleyeceğimiz, hatta hangi ürünü satın alacağımız, bizi tanıdığını iddia eden karmaşık sistemler tarafından yönlendiriliyor. Bu sistemler, kişiselleştirme adı altında bize yalnızca hoşumuza gidecek içerikleri sunarak bir 'filtre balonu' oluşturabiliyor. Sonuçta, farklı görüşlerle karşılaşma ihtimalimiz azalıyor ve dünya görüşümüz giderek daralıyor. Bu görünmez etkinin farkında olmak, dijital çağda özgür iradeyi korumanın ilk adımıdır.",
    questions: [
      { id: "r-c1-14-q1", level: "C1", topic: "Çıkarım", question: "Günlük hayatımızı ne şekillendiriyor?", options: ["Fark etmediğimiz algoritmalar", "Sadece biz", "Devlet", "Doğa"], correctAnswer: 0, explanation: "«fark etmediğimiz algoritmalar tarafından şekillendiriliyor»." },
      { id: "r-c1-14-q2", level: "C1", topic: "Detay", question: "Sistemler ne adı altında içerik sunuyor?", options: ["Kişiselleştirme", "Eğitim", "Reklam", "Haber"], correctAnswer: 0, explanation: "«kişiselleştirme adı altında»." },
      { id: "r-c1-14-q3", level: "C1", topic: "Detay", question: "Ne oluşturuluyor?", options: ["Filtre balonu", "Yeni dil", "Daha çok haber", "Boşluk"], correctAnswer: 0, explanation: "«bir 'filtre balonu' oluşturabiliyor»." },
      { id: "r-c1-14-q4", level: "C1", topic: "Çıkarım", question: "Sonuçta ne oluyor?", options: ["Dünya görüşümüz daralıyor", "Genişliyor", "Değişmiyor", "Güçleniyor"], correctAnswer: 0, explanation: "«dünya görüşümüz giderek daralıyor»." },
      { id: "r-c1-14-q5", level: "C1", topic: "Çıkarım", question: "Özgür iradeyi korumanın ilk adımı nedir?", options: ["Bu etkinin farkında olmak", "Telefonu atmak", "İnterneti kapatmak", "Hiçbir şey"], correctAnswer: 0, explanation: "«farkında olmak … ilk adımıdır»." },
    ],
    synonyms: [
      { word: "şekillendirmek", synonym: "biçimlendirmek" },
      { word: "daralmak", synonym: "küçülmek" },
      { word: "görünmez", synonym: "fark edilmez" },
    ],
  },
  {
    id: "r-c1-15", level: "C1", topic: "Çevre politikaları",
    title: "Şehirlerde Hava Kalitesi",
    text: "Hava kirliliği, özellikle yoğun trafiğe ve sanayiye sahip büyük şehirlerde sessiz bir sağlık krizine dönüşmüş durumda. Dünya Sağlık Örgütü'ne göre kirli hava, her yıl milyonlarca erken ölüme neden oluyor. Çözüm, yalnızca bireysel önlemlerle sınırlı değil; toplu taşımayı yaygınlaştırmak, sanayi emisyonlarını sıkı biçimde denetlemek ve yeşil alanları artırmak gibi sistemli politikalar gerekiyor. Bazı şehirler, araç trafiğini sınırlayan 'düşük emisyon bölgeleri' uygulamasıyla kayda değer iyileşmeler elde etti. Temiz hava, bir ayrıcalık değil, temel bir haktır.",
    questions: [
      { id: "r-c1-15-q1", level: "C1", topic: "Çıkarım", question: "Hava kirliliği neye dönüştü?", options: ["Sessiz bir sağlık krizine", "Bir eğlenceye", "Bir fırsata", "Önemsiz bir konuya"], correctAnswer: 0, explanation: "«sessiz bir sağlık krizine dönüşmüş»." },
      { id: "r-c1-15-q2", level: "C1", topic: "Detay", question: "DSÖ'ye göre kirli hava ne yapıyor?", options: ["Milyonlarca erken ölüme neden oluyor", "Hiçbir şey", "Az etkiliyor", "Sağlığı koruyor"], correctAnswer: 0, explanation: "«her yıl milyonlarca erken ölüme neden oluyor»." },
      { id: "r-c1-15-q3", level: "C1", topic: "Detay", question: "Hangi sistemli politika öneriliyor?", options: ["Toplu taşımayı yaygınlaştırmak", "Daha çok araba", "Sanayiyi artırmak", "Yeşili azaltmak"], correctAnswer: 0, explanation: "«toplu taşımayı yaygınlaştırmak … gibi sistemli politikalar»." },
      { id: "r-c1-15-q4", level: "C1", topic: "Detay", question: "Bazı şehirler ne uyguladı?", options: ["Düşük emisyon bölgeleri", "Daha çok yol", "Ücretsiz benzin", "Araç teşviki"], correctAnswer: 0, explanation: "«'düşük emisyon bölgeleri' uygulamasıyla»." },
      { id: "r-c1-15-q5", level: "C1", topic: "Çıkarım", question: "Temiz hava nedir?", options: ["Temel bir hak", "Bir ayrıcalık", "Bir lüks", "Bir hayal"], correctAnswer: 0, explanation: "«bir ayrıcalık değil, temel bir haktır»." },
    ],
    synonyms: [
      { word: "denetlemek", synonym: "kontrol etmek" },
      { word: "kayda değer", synonym: "önemli" },
      { word: "ayrıcalık", synonym: "imtiyaz" },
    ],
  },
  {
    id: "r-c1-16", level: "C1", topic: "Ekonomi",
    title: "Asgari Gelir Tartışması",
    text: "Otomasyonun giderek daha fazla işi ortadan kaldırdığı bir çağda, 'evrensel temel gelir' fikri ciddi biçimde tartışılıyor. Bu öneriye göre, devlet her vatandaşa, çalışıp çalışmadığına bakmaksızın düzenli ve koşulsuz bir gelir sağlamalıdır. Savunucular, bunun yoksulluğu azaltacağını ve insanlara anlamlı işler ya da eğitim için özgürlük tanıyacağını ileri sürer. Eleştirmenler ise maliyetinin sürdürülemez olduğunu ve çalışma motivasyonunu düşürebileceğini savunur. Sınırlı ölçekli deneyler karışık sonuçlar verse de, bu tartışma işin ve değerin geleceğine dair köklü soruları gündeme getiriyor.",
    questions: [
      { id: "r-c1-16-q1", level: "C1", topic: "Detay", question: "Hangi fikir tartışılıyor?", options: ["Evrensel temel gelir", "Daha çok vergi", "Daha az maaş", "Emeklilik yaşı"], correctAnswer: 0, explanation: "«'evrensel temel gelir' fikri … tartışılıyor»." },
      { id: "r-c1-16-q2", level: "C1", topic: "Detay", question: "Bu gelir nasıl olmalı?", options: ["Düzenli ve koşulsuz", "Sadece çalışanlara", "Bir kerelik", "Vergiye bağlı"], correctAnswer: 0, explanation: "«düzenli ve koşulsuz bir gelir»." },
      { id: "r-c1-16-q3", level: "C1", topic: "Çıkarım", question: "Savunucular ne ileri sürüyor?", options: ["Yoksulluğu azaltacağını", "İşsizliği artıracağını", "Vergileri düşüreceğini", "Hiçbir şey"], correctAnswer: 0, explanation: "«yoksulluğu azaltacağını ve … özgürlük tanıyacağını»." },
      { id: "r-c1-16-q4", level: "C1", topic: "Çıkarım", question: "Eleştirmenler neyi savunuyor?", options: ["Maliyetin sürdürülemez olduğunu", "Çok ucuz olduğunu", "Herkesi zengin edeceğini", "Gereksiz olmadığını"], correctAnswer: 0, explanation: "«maliyetinin sürdürülemez olduğunu ve çalışma motivasyonunu düşürebileceğini»." },
      { id: "r-c1-16-q5", level: "C1", topic: "Çıkarım", question: "Bu tartışma neyi gündeme getiriyor?", options: ["İşin ve değerin geleceğini", "Hava durumunu", "Spor sonuçlarını", "Trafiği"], correctAnswer: 0, explanation: "«işin ve değerin geleceğine dair köklü soruları»." },
    ],
    synonyms: [
      { word: "koşulsuz", synonym: "şartsız" },
      { word: "sürdürülemez", synonym: "kalıcı olmayan" },
      { word: "köklü", synonym: "derin" },
    ],
  },
  {
    id: "r-c1-17", level: "C1", topic: "Kültür",
    title: "Çeviri ve Kültür",
    text: "Çeviri, çoğu zaman bir dildeki kelimeleri başka bir dile aktarmak olarak basitçe tanımlanır; oysa gerçekte çok daha karmaşık ve yaratıcı bir süreçtir. İyi bir çevirmen, yalnızca kelimeleri değil, metnin ardındaki kültürel bağlamı, mizahı, deyimleri ve duygu tonunu da aktarmak zorundadır. Bir dilde son derece doğal olan bir ifade, başka bir dilde anlamsız ya da komik kaçabilir. Bu yüzden çeviri, bir tür kültürlerarası köprü kurma sanatıdır. Edebiyat çevirmenleri, çoğu zaman 'görünmez' kalsalar da, dünya kültürünün birbirini tanımasında kilit bir rol oynarlar.",
    questions: [
      { id: "r-c1-17-q1", level: "C1", topic: "Çıkarım", question: "Çeviri basitçe nasıl tanımlanır?", options: ["Kelimeleri başka dile aktarmak", "Yeni dil yaratmak", "Kitap yazmak", "Resim yapmak"], correctAnswer: 0, explanation: "«kelimeleri başka bir dile aktarmak olarak basitçe tanımlanır»." },
      { id: "r-c1-17-q2", level: "C1", topic: "Detay", question: "İyi bir çevirmen başka neyi aktarır?", options: ["Kültürel bağlam ve duygu tonunu", "Sadece harfleri", "Sadece sayıları", "Hiçbir şey"], correctAnswer: 0, explanation: "«kültürel bağlamı, mizahı, deyimleri ve duygu tonunu»." },
      { id: "r-c1-17-q3", level: "C1", topic: "Çıkarım", question: "Bir ifade başka dilde nasıl kaçabilir?", options: ["Anlamsız ya da komik", "Daha güzel", "Daha uzun", "Aynı"], correctAnswer: 0, explanation: "«anlamsız ya da komik kaçabilir»." },
      { id: "r-c1-17-q4", level: "C1", topic: "Çıkarım", question: "Çeviri ne tür bir sanattır?", options: ["Kültürlerarası köprü kurma", "Resim", "Müzik", "Mimari"], correctAnswer: 0, explanation: "«kültürlerarası köprü kurma sanatıdır»." },
      { id: "r-c1-17-q5", level: "C1", topic: "Detay", question: "Edebiyat çevirmenleri nasıl bir rol oynar?", options: ["Kilit bir rol", "Önemsiz bir rol", "Hiçbir rol", "Zararlı bir rol"], correctAnswer: 0, explanation: "«kilit bir rol oynarlar»." },
    ],
    synonyms: [
      { word: "aktarmak", synonym: "iletmek" },
      { word: "karmaşık", synonym: "girift" },
      { word: "kilit", synonym: "anahtar" },
    ],
  },
  {
    id: "r-c1-18", level: "C1", topic: "Bilim",
    title: "Bilimsel Şüphecilik",
    text: "Bilimin gücü, kesin doğrulara sahip olmasından değil, kendi sonuçlarını sürekli sorgulama ve gerektiğinde düzeltme yeteneğinden kaynaklanır. Bir teori, ne kadar köklü olursa olsun, yeni ve daha güçlü kanıtlar karşısında değişebilir; işte bu esneklik, bilimi bir inanç sisteminden ayıran temel özelliktir. Ne yazık ki kamuoyunda 'teori' kelimesi çoğu zaman 'tahmin' ile karıştırılır; oysa bilimsel bir teori, sayısız gözlem ve deneyle desteklenen, en güvenilir açıklamadır. Sağlıklı bir şüphecilik, her şeyi reddetmek değil, iddiaları kanıt ölçüsünde tartmaktır.",
    questions: [
      { id: "r-c1-18-q1", level: "C1", topic: "Çıkarım", question: "Bilimin gücü neyden kaynaklanır?", options: ["Kendini sorgulama yeteneğinden", "Kesin doğrulardan", "Otoriteden", "İnançtan"], correctAnswer: 0, explanation: "«kendi sonuçlarını sürekli sorgulama ve … düzeltme yeteneğinden»." },
      { id: "r-c1-18-q2", level: "C1", topic: "Çıkarım", question: "Bir teori ne karşısında değişebilir?", options: ["Yeni ve güçlü kanıtlar", "Eski fikirler", "Çoğunluk oyu", "Hiçbir şey"], correctAnswer: 0, explanation: "«yeni ve daha güçlü kanıtlar karşısında değişebilir»." },
      { id: "r-c1-18-q3", level: "C1", topic: "Çıkarım", question: "Esneklik bilimi neyden ayırır?", options: ["İnanç sisteminden", "Sanattan", "Tarihten", "Edebiyattan"], correctAnswer: 0, explanation: "«bilimi bir inanç sisteminden ayıran temel özelliktir»." },
      { id: "r-c1-18-q4", level: "C1", topic: "Detay", question: "Kamuoyunda 'teori' neyle karıştırılır?", options: ["Tahminle", "Kanıtla", "Deneyle", "Gerçekle"], correctAnswer: 0, explanation: "«'teori' kelimesi çoğu zaman 'tahmin' ile karıştırılır»." },
      { id: "r-c1-18-q5", level: "C1", topic: "Çıkarım", question: "Sağlıklı şüphecilik nedir?", options: ["İddiaları kanıt ölçüsünde tartmak", "Her şeyi reddetmek", "Her şeye inanmak", "Sorgulamamak"], correctAnswer: 0, explanation: "«her şeyi reddetmek değil, iddiaları kanıt ölçüsünde tartmaktır»." },
    ],
    synonyms: [
      { word: "sorgulamak", synonym: "irdelemek" },
      { word: "esneklik", synonym: "elastikiyet" },
      { word: "güvenilir", synonym: "itimat edilir" },
    ],
  },
];

export const READING_BY_LEVEL = (lvl: ReadingTask["level"]) =>
  READING_TASKS.filter((t) => t.level === lvl);
