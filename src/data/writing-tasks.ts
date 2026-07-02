/**
 * Writing bank — 50 TÖMER-style writing prompts.
 * Turkish prompt + Russian translation + min words + 20-point rubric.
 * Lower-level tasks include a short sample answer in Turkish.
 */

import type { WritingTask } from "./types";
import { WRITING_CRITERIA } from "./types";

const C = WRITING_CRITERIA;

export const WRITING_TASKS: WritingTask[] = [
  /* ----------------------------- A1 – A2 (15) ---------------------------- */
  {
    id: "w-a1-01", level: "A1", title: "Kendini tanıtma",
    prompt: "Kendinizi tanıtan kısa bir metin yazınız. Adınız, yaşınız, nereli olduğunuz ve mesleğiniz hakkında bilgi verin.",
    promptRu: "Напишите короткий текст-знакомство. Расскажите своё имя, возраст, откуда вы и кем работаете.",
    minWords: 80, criteria: C,
    sampleAnswer: "Merhaba! Benim adım Ayşe. Yirmi beş yaşındayım ve Ankara'da yaşıyorum. Aslında İzmirliyim ama üç yıldır Ankara'dayım. Bir okulda İngilizce öğretmeniyim. Boş zamanlarımda kitap okumayı ve yürüyüş yapmayı seviyorum. Küçük bir ailem var: annem, babam ve bir kız kardeşim. Tanıştığımıza memnun oldum.",
  },
  {
    id: "w-a1-02", level: "A1", title: "Tatil kartpostalı",
    prompt: "Bir arkadaşınıza tatilden bir kartpostal yazınız. Nerede olduğunuzu ve neler yaptığınızı anlatın.",
    promptRu: "Напишите другу открытку с отдыха. Расскажите, где вы и чем занимаетесь.",
    minWords: 80, criteria: C,
    sampleAnswer: "Sevgili Mert, ben şu an Antalya'dayım. Hava çok güzel ve deniz harika. Her sabah denize giriyorum, öğleden sonra ise şehri geziyorum. Dün eski bir kaleyi gezdim, çok beğendim. Yemekler de çok lezzetli. Keşke sen de burada olsaydın. Görüşmek üzere! Sevgiler, Ayşe.",
  },
  {
    id: "w-a1-03", level: "A1", title: "Günlük rutin",
    prompt: "Bir gününüzü anlatınız. Sabah kalktığınızdan akşam yattığınıza kadar neler yaptığınızı yazın.",
    promptRu: "Опишите свой день — от утреннего подъёма до отхода ко сну.",
    minWords: 90, criteria: C,
  },
  {
    id: "w-a1-04", level: "A1", title: "Sevdiğiniz yemek",
    prompt: "Sevdiğiniz bir yemeği ve nasıl yapıldığını kısaca anlatınız.",
    promptRu: "Опишите любимое блюдо и кратко расскажите, как оно готовится.",
    minWords: 90, criteria: C,
  },
  {
    id: "w-a1-05", level: "A1", title: "Ailem",
    prompt: "Aileniz hakkında bir metin yazınız. Aile üyelerinizi ve onların mesleklerini tanıtın.",
    promptRu: "Напишите текст о своей семье. Представьте членов семьи и их профессии.",
    minWords: 80, criteria: C,
  },
  {
    id: "w-a1-06", level: "A1", title: "Odanız",
    prompt: "Odanızı tarif ediniz. Odanızda hangi eşyalar var ve nerede duruyorlar?",
    promptRu: "Опишите свою комнату. Какие вещи в ней есть и где они находятся?",
    minWords: 80, criteria: C,
  },
  {
    id: "w-a2-01", level: "A2", title: "Şehrinizi anlatın",
    prompt: "Yaşadığınız şehri tanıtan bir metin yazınız. Şehrin özelliklerinden, gezilecek yerlerinden ve insanlarından bahsedin.",
    promptRu: "Напишите текст о городе, в котором живёте: особенности, что посмотреть, какие люди.",
    minWords: 100, criteria: C,
  },
  {
    id: "w-a2-02", level: "A2", title: "Hafta sonu planı",
    prompt: "Bu hafta sonu için planlarınızı yazınız. Nereye gideceksiniz, kiminle ve neler yapacaksınız?",
    promptRu: "Опишите планы на эти выходные: куда пойдёте, с кем и что будете делать.",
    minWords: 100, criteria: C,
  },
  {
    id: "w-a2-03", level: "A2", title: "Davet mektubu",
    prompt: "Bir arkadaşınızı doğum gününüze davet eden bir mektup yazınız. Tarih, saat ve yer bilgisini de ekleyin.",
    promptRu: "Напишите письмо-приглашение другу на свой день рождения. Укажите дату, время и место.",
    minWords: 100, criteria: C,
  },
  {
    id: "w-a2-04", level: "A2", title: "En sevdiğiniz mevsim",
    prompt: "En sevdiğiniz mevsimi ve nedenlerini anlatınız. O mevsimde neler yapmayı seversiniz?",
    promptRu: "Расскажите о любимом времени года и почему. Что вы любите делать в этот сезон?",
    minWords: 100, criteria: C,
  },
  {
    id: "w-a2-05", level: "A2", title: "Alışveriş deneyimi",
    prompt: "Son alışverişinizi anlatınız. Nereye gittiniz, ne aldınız ve neler hissettiniz?",
    promptRu: "Опишите свой последний поход за покупками: куда ходили, что купили, что чувствовали.",
    minWords: 100, criteria: C,
  },
  {
    id: "w-a2-06", level: "A2", title: "Bir gezi anısı",
    prompt: "Unutamadığınız bir geziyi anlatınız. Nereye gittiniz ve sizi en çok ne etkiledi?",
    promptRu: "Опишите незабываемую поездку: куда ездили и что вас больше всего впечатлило.",
    minWords: 100, criteria: C,
  },
  {
    id: "w-a2-07", level: "A2", title: "Hobileriniz",
    prompt: "Hobilerinizi anlatınız. Bu hobilere ne zaman başladınız ve neden seviyorsunuz?",
    promptRu: "Расскажите о своих хобби: когда начали ими заниматься и почему любите.",
    minWords: 90, criteria: C,
  },
  {
    id: "w-a2-08", level: "A2", title: "Sağlıklı bir gün",
    prompt: "Sağlıklı bir gününüzü anlatınız. Ne yediniz, ne kadar hareket ettiniz ve nasıl dinlendiniz?",
    promptRu: "Опишите свой здоровый день: что ели, сколько двигались и как отдыхали.",
    minWords: 100, criteria: C,
  },
  {
    id: "w-a2-09", level: "A2", title: "Geleceğe dair planlar",
    prompt: "Gelecekle ilgili hayallerinizi ve planlarınızı yazınız. Beş yıl sonra kendinizi nerede görüyorsunuz?",
    promptRu: "Напишите о своих мечтах и планах на будущее. Где вы видите себя через пять лет?",
    minWords: 100, criteria: C,
  },

  /* ----------------------------- B1 – B2 (20) ---------------------------- */
  {
    id: "w-b1-01", level: "B1", title: "Sosyal medya",
    prompt: "Sosyal medyanın olumlu ve olumsuz yönlerini tartışan bir kompozisyon yazınız. Kendi görüşünüzü de belirtin.",
    promptRu: "Напишите сочинение о плюсах и минусах соцсетей. Выскажите своё мнение.",
    minWords: 200, criteria: C,
  },
  {
    id: "w-b1-02", level: "B1", title: "Meslek seçimi",
    prompt: "Meslek seçimi yaparken nelere dikkat edilmesi gerektiğini anlatan bir yazı yazınız.",
    promptRu: "Напишите текст о том, на что нужно обращать внимание при выборе профессии.",
    minWords: 200, criteria: C,
  },
  {
    id: "w-b1-03", level: "B1", title: "Büyük şehirde yaşamak",
    prompt: "Büyük şehirde yaşamanın avantajlarını ve dezavantajlarını karşılaştıran bir kompozisyon yazınız.",
    promptRu: "Сравните преимущества и недостатки жизни в большом городе.",
    minWords: 220, criteria: C,
  },
  {
    id: "w-b1-04", level: "B1", title: "Uzaktan eğitim",
    prompt: "Uzaktan eğitim mi yoksa yüz yüze eğitim mi daha etkilidir? Görüşünüzü gerekçelerle açıklayınız.",
    promptRu: "Что эффективнее — дистанционное или очное обучение? Обоснуйте своё мнение.",
    minWords: 220, criteria: C,
  },
  {
    id: "w-b1-05", level: "B1", title: "Teknolojinin etkisi",
    prompt: "Teknolojinin günlük hayatımıza etkilerini anlatan bir kompozisyon yazınız.",
    promptRu: "Напишите сочинение о влиянии технологий на нашу повседневную жизнь.",
    minWords: 200, criteria: C,
  },
  {
    id: "w-b1-06", level: "B1", title: "Sağlıklı yaşam",
    prompt: "Sağlıklı bir yaşam için neler yapmamız gerektiğini açıklayan bir yazı yazınız.",
    promptRu: "Напишите текст о том, что нужно делать для здорового образа жизни.",
    minWords: 200, criteria: C,
  },
  {
    id: "w-b1-07", level: "B1", title: "Çevre kirliliği",
    prompt: "Çevre kirliliğinin sebeplerini ve olası çözümlerini tartışan bir kompozisyon yazınız.",
    promptRu: "Обсудите причины загрязнения окружающей среды и возможные решения.",
    minWords: 220, criteria: C,
  },
  {
    id: "w-b1-08", level: "B1", title: "Kitap okumanın faydaları",
    prompt: "Kitap okumanın insana kazandırdıklarını anlatan bir yazı yazınız.",
    promptRu: "Напишите текст о том, что даёт человеку чтение книг.",
    minWords: 200, criteria: C,
  },
  {
    id: "w-b1-09", level: "B1", title: "Sporun önemi",
    prompt: "Düzenli spor yapmanın bedensel ve ruhsal faydalarını anlatınız.",
    promptRu: "Опишите физическую и психологическую пользу регулярных занятий спортом.",
    minWords: 200, criteria: C,
  },
  {
    id: "w-b1-10", level: "B1", title: "İnternetten alışveriş",
    prompt: "İnternetten alışveriş mi yoksa mağazadan alışveriş mi daha avantajlıdır? Karşılaştırınız.",
    promptRu: "Что выгоднее — покупки в интернете или в магазине? Сравните.",
    minWords: 220, criteria: C,
  },
  {
    id: "w-b2-01", level: "B2", title: "Teknoloji bağımlılığı",
    prompt: "Gençlerde artan teknoloji bağımlılığının nedenlerini ve sonuçlarını değerlendiren bir kompozisyon yazınız.",
    promptRu: "Оцените причины и последствия растущей технозависимости среди молодёжи.",
    minWords: 250, criteria: C,
  },
  {
    id: "w-b2-02", level: "B2", title: "Şehir mi köy mü?",
    prompt: "Şehir hayatı ile köy hayatını çeşitli yönlerden karşılaştıran bir yazı yazınız ve tercihinizi belirtin.",
    promptRu: "Сравните городскую и сельскую жизнь с разных сторон и укажите свой выбор.",
    minWords: 250, criteria: C,
  },
  {
    id: "w-b2-03", level: "B2", title: "Turizm ve ekonomi",
    prompt: "Turizmin bir ülkenin ekonomisine katkılarını ve olası olumsuz etkilerini tartışınız.",
    promptRu: "Обсудите вклад туризма в экономику страны и его возможные отрицательные последствия.",
    minWords: 250, criteria: C,
  },
  {
    id: "w-b2-04", level: "B2", title: "Yabancı dil öğrenmek",
    prompt: "Yabancı dil öğrenmenin bireysel ve toplumsal önemini açıklayan bir kompozisyon yazınız.",
    promptRu: "Объясните индивидуальную и общественную значимость изучения иностранных языков.",
    minWords: 230, criteria: C,
  },
  {
    id: "w-b2-05", level: "B2", title: "Geleneksel ve modern yaşam",
    prompt: "Geleneksel yaşam ile modern yaşamı karşılaştıran ve aralarındaki dengeyi tartışan bir yazı yazınız.",
    promptRu: "Сравните традиционный и современный уклад жизни и обсудите баланс между ними.",
    minWords: 250, criteria: C,
  },
  {
    id: "w-b2-06", level: "B2", title: "Medyanın etkisi",
    prompt: "Medyanın toplum üzerindeki etkilerini olumlu ve olumsuz yönleriyle değerlendiriniz.",
    promptRu: "Оцените влияние СМИ на общество с положительных и отрицательных сторон.",
    minWords: 250, criteria: C,
  },
  {
    id: "w-b2-07", level: "B2", title: "Gençlerin iş bulma sorunu",
    prompt: "Genç nüfusun iş bulma konusunda yaşadığı zorlukları ve çözüm önerilerini tartışınız.",
    promptRu: "Обсудите трудности молодёжи с трудоустройством и предложите решения.",
    minWords: 250, criteria: C,
  },
  {
    id: "w-b2-08", level: "B2", title: "Sağlıkta teknoloji",
    prompt: "Teknolojinin sağlık sektöründeki rolünü ve getirdiği yenilikleri anlatan bir yazı yazınız.",
    promptRu: "Опишите роль технологий в сфере здравоохранения и их нововведения.",
    minWords: 230, criteria: C,
  },
  {
    id: "w-b2-09", level: "B2", title: "Tüketim ve israf",
    prompt: "Aşırı tüketim alışkanlıklarının yol açtığı israfı ve bunu önlemenin yollarını tartışınız.",
    promptRu: "Обсудите расточительство из-за чрезмерного потребления и способы его предотвращения.",
    minWords: 250, criteria: C,
  },
  {
    id: "w-b2-10", level: "B2", title: "Gönüllülük",
    prompt: "Gönüllülük çalışmalarının birey ve toplum açısından önemini değerlendiren bir kompozisyon yazınız.",
    promptRu: "Оцените значимость волонтёрства для личности и общества.",
    minWords: 230, criteria: C,
  },

  /* -------------------------------- C1 (15) ----------------------------- */
  {
    id: "w-c1-01", level: "C1", title: "Küreselleşme",
    prompt: "Küreselleşmenin toplumlar, kültürler ve ekonomiler üzerindeki etkilerini eleştirel bir bakış açısıyla tartışınız.",
    promptRu: "Критически обсудите влияние глобализации на общества, культуры и экономику.",
    minWords: 280, criteria: C,
  },
  {
    id: "w-c1-02", level: "C1", title: "Yapay zekânın geleceği",
    prompt: "Yapay zekânın gelecekte iş hayatı ve insan ilişkileri üzerindeki olası etkilerini değerlendiren bir deneme yazınız.",
    promptRu: "Напишите эссе о возможном влиянии ИИ на сферу труда и человеческие отношения в будущем.",
    minWords: 280, criteria: C,
  },
  {
    id: "w-c1-03", level: "C1", title: "Göç ve kültürel uyum",
    prompt: "Göçün toplumsal sonuçlarını ve göçmenlerin kültürel uyum sürecini analiz eden bir metin yazınız.",
    promptRu: "Проанализируйте социальные последствия миграции и процесс культурной адаптации мигрантов.",
    minWords: 280, criteria: C,
  },
  {
    id: "w-c1-04", level: "C1", title: "İklim değişikliği ve sorumluluk",
    prompt: "İklim değişikliğiyle mücadelede bireysel ve kurumsal sorumlulukları tartışan bir deneme yazınız.",
    promptRu: "Обсудите индивидуальную и институциональную ответственность в борьбе с изменением климата.",
    minWords: 280, criteria: C,
  },
  {
    id: "w-c1-05", level: "C1", title: "Eğitim reformu",
    prompt: "Günümüz eğitim sisteminin eksiklerini ve gereken reformları gerekçeleriyle ele alan bir yazı yazınız.",
    promptRu: "Рассмотрите недостатки современной системы образования и необходимые реформы с обоснованием.",
    minWords: 280, criteria: C,
  },
  {
    id: "w-c1-06", level: "C1", title: "Sosyal medya ve demokrasi",
    prompt: "Sosyal medyanın kamuoyu oluşturma ve demokratik süreçler üzerindeki etkisini tartışınız.",
    promptRu: "Обсудите влияние соцсетей на формирование общественного мнения и демократические процессы.",
    minWords: 280, criteria: C,
  },
  {
    id: "w-c1-07", level: "C1", title: "Bilim ve etik",
    prompt: "Bilimsel ilerleme ile etik ilkeler arasındaki gerilimi örneklerle tartışan bir deneme yazınız.",
    promptRu: "Обсудите с примерами напряжение между научным прогрессом и этическими принципами.",
    minWords: 280, criteria: C,
  },
  {
    id: "w-c1-08", level: "C1", title: "Kentleşmenin sonuçları",
    prompt: "Hızlı kentleşmenin çevresel ve toplumsal sonuçlarını çözüm önerileriyle birlikte değerlendiriniz.",
    promptRu: "Оцените экологические и социальные последствия быстрой урбанизации с предложениями решений.",
    minWords: 280, criteria: C,
  },
  {
    id: "w-c1-09", level: "C1", title: "Kültürel mirasın korunması",
    prompt: "Kültürel mirasın korunmasının önemini ve karşılaşılan zorlukları ele alan bir metin yazınız.",
    promptRu: "Рассмотрите важность сохранения культурного наследия и связанные с этим трудности.",
    minWords: 270, criteria: C,
  },
  {
    id: "w-c1-10", level: "C1", title: "Ekonomik eşitsizlik",
    prompt: "Ekonomik eşitsizliğin toplumsal yansımalarını ve azaltılması için izlenebilecek politikaları tartışınız.",
    promptRu: "Обсудите социальные последствия экономического неравенства и политику его снижения.",
    minWords: 280, criteria: C,
  },
  {
    id: "w-c1-11", level: "C1", title: "Medya okuryazarlığı",
    prompt: "Bilgi çağında medya okuryazarlığının neden vazgeçilmez bir beceri olduğunu açıklayınız.",
    promptRu: "Объясните, почему в эпоху информации медиаграмотность стала незаменимым навыком.",
    minWords: 270, criteria: C,
  },
  {
    id: "w-c1-12", level: "C1", title: "Sürdürülebilir kalkınma",
    prompt: "Sürdürülebilir kalkınmanın gelecek nesiller için önemini ve uygulama zorluklarını tartışınız.",
    promptRu: "Обсудите важность устойчивого развития для будущих поколений и трудности его реализации.",
    minWords: 280, criteria: C,
  },
  {
    id: "w-c1-13", level: "C1", title: "Özgürlük ve düzen",
    prompt: "Bireysel özgürlük ile toplumsal düzen arasındaki dengeyi felsefi bir bakışla ele alınız.",
    promptRu: "Рассмотрите с философской точки зрения баланс между личной свободой и общественным порядком.",
    minWords: 280, criteria: C,
  },
  {
    id: "w-c1-14", level: "C1", title: "Teknoloji ve istihdam",
    prompt: "Otomasyon ve yapay zekânın istihdam yapısı üzerindeki dönüştürücü etkilerini değerlendiriniz.",
    promptRu: "Оцените преобразующее влияние автоматизации и ИИ на структуру занятости.",
    minWords: 280, criteria: C,
  },
  {
    id: "w-c1-15", level: "C1", title: "Sanatın işlevi",
    prompt: "Sanatın bireysel ve toplumsal yaşamdaki işlevini örneklerle tartışan bir deneme yazınız.",
    promptRu: "Напишите эссе о функции искусства в жизни личности и общества с примерами.",
    minWords: 270, criteria: C,
  },
];

export const WRITING_BY_LEVEL = (lvl: WritingTask["level"]) =>
  WRITING_TASKS.filter((t) => t.level === lvl);
