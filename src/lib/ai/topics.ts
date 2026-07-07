/**
 * Topic registry — the backbone of the AI core (RECON-2 §1.3, §2.1).
 * Diagnostics tag questions with these ids, AI feedback maps every error to
 * one (enforced via the prompt's enum), topic_mastery and the study plan key
 * off them. Ids match the bake-off set where one existed.
 *
 * kkParallel: the same concept in Kazakh grammar, shown to KK users
 * (founder decision 07.07.2026 — "түрік тілін қазақ тілі арқылы үйрен").
 */

export type TopicLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type Topic = {
  id: string;
  level: TopicLevel;
  label: { ru: string; en: string; tr: string; kk: string };
  /** Direct Kazakh-grammar parallel, in Kazakh (only where one exists). */
  kkParallel?: string;
};

export const TOPICS: Topic[] = [
  // --- A1 ---
  { id: "vowel_harmony", level: "A1", label: { ru: "Гармония гласных", en: "Vowel harmony", tr: "Ünlü uyumu", kk: "Дауысты дыбыс үндестігі" }, kkParallel: "үндестік заңы — қазақшадағыдай" },
  { id: "copula_person", level: "A1", label: { ru: "Аффиксы сказуемости", en: "Personal predicate endings", tr: "Ek fiil / kişi ekleri", kk: "Жіктік жалғау" }, kkParallel: "жіктік жалғау (мен оқушымын)" },
  { id: "plural_suffix", level: "A1", label: { ru: "Множественное число -lar/-ler", en: "Plural -lar/-ler", tr: "Çoğul eki", kk: "Көптік жалғау" }, kkParallel: "көптік жалғау -лар/-лер" },
  { id: "numerals_plural", level: "A1", label: { ru: "Числительное + ед. число", en: "Numeral + singular noun", tr: "Sayıdan sonra tekil", kk: "Сан есім + жекеше" }, kkParallel: "сан есімнен кейін зат есім жекеше — қазақшадағыдай (үш бала)" },
  { id: "var_yok", level: "A1", label: { ru: "Конструкции var/yok", en: "var/yok existence", tr: "var/yok", kk: "var/yok құрылымы" }, kkParallel: "бар/жоқ — бірдей құрылым" },
  { id: "question_particle", level: "A1", label: { ru: "Вопросительная частица mI", en: "Question particle mI", tr: "Soru eki mI", kk: "Сұраулық шылау" }, kkParallel: "ма/ме, ба/бе сұраулық шылауы" },
  { id: "present_iyor", level: "A1", label: { ru: "Настоящее время -Iyor", en: "Present continuous -Iyor", tr: "Şimdiki zaman", kk: "-Iyor осы шағы" }, kkParallel: "нақ осы шақ (жатыр/отыр)" },
  { id: "past_di_mis", level: "A1", label: { ru: "Прошедшее -DI и -mIş", en: "Past -DI vs -mIş", tr: "-DI'li / -mIş'li geçmiş", kk: "-DI мен -mIş өткен шақтары" }, kkParallel: "жедел өткен шақ -ды; -mIş ≈ бұрынғы өткен шақ -ыпты" },
  { id: "locative_dative", level: "A1", label: { ru: "Локатив -DA и датив -(y)A", en: "Locative vs dative", tr: "Bulunma / yönelme hâli", kk: "Жатыс пен барыс септік" }, kkParallel: "жатыс септік -да/-де, барыс септік -ға/-ге" },
  { id: "ablative", level: "A1", label: { ru: "Аблатив -DAn", en: "Ablative -DAn", tr: "Ayrılma hâli", kk: "Шығыс септік" }, kkParallel: "шығыс септік -дан/-ден" },
  { id: "accusative", level: "A1", label: { ru: "Аккузатив -(y)I", en: "Accusative -(y)I", tr: "Belirtme hâli", kk: "Табыс септік" }, kkParallel: "табыс септік -ны/-ні" },
  { id: "buffer_letters", level: "A1", label: { ru: "Соединительные y/n/s", en: "Buffer letters y/n/s", tr: "Kaynaştırma harfleri", kk: "Дәнекер дыбыстар" } },

  // --- A2 ---
  { id: "izafet", level: "A2", label: { ru: "Изафет (притяжательные цепочки)", en: "Izafet (possessive chains)", tr: "İsim tamlaması", kk: "Изафет тіркесі" }, kkParallel: "ілік септік + тәуелдік жалғау (баланың кітабы)" },
  { id: "future_acak", level: "A2", label: { ru: "Будущее время -AcAk", en: "Future -AcAk", tr: "Gelecek zaman", kk: "-AcAk келер шағы" }, kkParallel: "келер шақ" },
  { id: "aorist_general", level: "A2", label: { ru: "Аорист (широкое время)", en: "Aorist (general tense)", tr: "Geniş zaman", kk: "Ауыспалы осы шақ (аорист)" }, kkParallel: "ауыспалы осы/келер шақ -а/-е/-й" },
  { id: "imperative_optative", level: "A2", label: { ru: "Повелительное и желательное", en: "Imperative & optative", tr: "Emir / istek kipi", kk: "Бұйрық және қалау рай" }, kkParallel: "бұйрық рай, қалау рай" },
  { id: "abilitative", level: "A2", label: { ru: "Возможность -(y)Abil / -(y)AmA", en: "Ability -(y)Abil", tr: "Yeterlilik fiili", kk: "-Abil мүмкіндік етістігі" }, kkParallel: "«алу» көмекші етістігі (бара аламын)" },
  { id: "necessity_meli", level: "A2", label: { ru: "Долженствование -mAlI", en: "Necessity -mAlI", tr: "Gereklilik kipi", kk: "-mAlI міндеттілік" }, kkParallel: "≈ «керек» / «-у(ы) керек»" },
  { id: "comparatives", level: "A2", label: { ru: "Сравнительные конструкции", en: "Comparatives", tr: "Karşılaştırma", kk: "Салыстыру құрылымдары" }, kkParallel: "-ырақ/-ірек; «-дан гөрі / қарағанда»" },
  { id: "postpositions", level: "A2", label: { ru: "Послелоги (göre, kadar, için…)", en: "Postpositions", tr: "Edatlar", kk: "Септеулік шылаулар" }, kkParallel: "септеулік шылаулар (сәйкес, дейін, үшін)" },
  { id: "verbal_nouns", level: "A2", label: { ru: "Глагольные имена -mA/-mAk", en: "Verbal nouns -mA/-mAk", tr: "İsim-fiiller", kk: "Тұйық етістік" }, kkParallel: "тұйық етістік -у (оқу, жазу)" },
  { id: "yok_degil", level: "A2", label: { ru: "Отрицание: yok vs değil", en: "Negation: yok vs değil", tr: "yok / değil ayrımı", kk: "yok пен değil айырмасы" }, kkParallel: "жоқ / емес айырмасы — бірдей логика" },
  { id: "orthography_punctuation", level: "A2", label: { ru: "Орфография и пунктуация", en: "Spelling & punctuation", tr: "Yazım ve noktalama", kk: "Емле және тыныс белгілері" } },

  // --- B1 ---
  { id: "verb_case_government", level: "B1", label: { ru: "Управление глаголов (başlamak + датив…)", en: "Verb case government", tr: "Fiillerin hâl yönetimi", kk: "Етістіктің септік меңгеруі" } },
  { id: "case_government", level: "B1", label: { ru: "Управление имён и прилагательных", en: "Nominal case government", tr: "İsim/sıfatların hâl yönetimi", kk: "Есім сөздердің септік меңгеруі" } },
  { id: "converbs", level: "B1", label: { ru: "Деепричастия -Ip / -ArAk", en: "Converbs -Ip / -ArAk", tr: "Zarf-fiiller (-ıp, -arak)", kk: "Көсемшелер" }, kkParallel: "көсемше -ып/-іп, -а/-е — қазақшадағыдай" },
  { id: "while_ken", level: "B1", label: { ru: "Конструкция -ken", en: "-ken clauses", tr: "-ken yapısı", kk: "-ken құрылымы" }, kkParallel: "≈ -ғанда / -й отырып" },
  { id: "participles", level: "B1", label: { ru: "Причастия -An / -DIK", en: "Participles -An / -DIK", tr: "Sıfat-fiiller", kk: "Есімшелер" }, kkParallel: "есімше -ған/-ген, -атын/-етін" },
  { id: "noun_clauses", level: "B1", label: { ru: "Придаточные с -DIK/-mA (генитив субъекта)", en: "Noun clauses -DIK/-mA", tr: "İsim cümlecikleri", kk: "-DIK бағыныңқы сөйлемдері" } },
  { id: "subordinate_clauses", level: "B1", label: { ru: "Причина/цель: -DIğI için, -mAk için", en: "Reason/purpose clauses", tr: "Neden/amaç yan cümleleri", kk: "Себеп/мақсат бағыныңқылары" } },
  { id: "conditionals", level: "B1", label: { ru: "Условные -sA (реальные и нереальные)", en: "Conditionals -sA", tr: "Şart kipi", kk: "Шартты рай" }, kkParallel: "шартты рай -са/-се — қазақшадағыдай" },
  { id: "negative_concord", level: "B1", label: { ru: "Отрицательное согласование (hiç kimse…)", en: "Negative concord", tr: "Olumsuzluk uyumu", kk: "Болымсыздық үйлесімі" }, kkParallel: "ешкім… -мАйды — қос болымсыздық" },
  { id: "reported_speech", level: "B1", label: { ru: "Передача чужой речи (diye, -DIğInI söylemek)", en: "Reported speech", tr: "Dolaylı anlatım", kk: "Төл сөз бен төлеу сөз" } },

  // --- B2 ---
  { id: "passive_voice", level: "B2", label: { ru: "Страдательный залог", en: "Passive voice", tr: "Edilgen çatı", kk: "Ырықсыз етіс" }, kkParallel: "ырықсыз етіс -ыл/-іл — қазақшадағыдай" },
  { id: "causative_voice", level: "B2", label: { ru: "Понудительный залог", en: "Causative voice", tr: "Ettirgen çatı", kk: "Өзгелік етіс" }, kkParallel: "өзгелік етіс -дыр/-дір, -қыз/-кіз" },
  { id: "reflexive_reciprocal", level: "B2", label: { ru: "Возвратный и взаимный залоги", en: "Reflexive & reciprocal voice", tr: "Dönüşlü / işteş çatı", kk: "Өздік және ортақ етіс" }, kkParallel: "өздік етіс -ын/-ін, ортақ етіс -ыс/-іс" },
  { id: "relative_ki", level: "B2", label: { ru: "Союз ki и относительные обороты", en: "ki clauses", tr: "ki'li yapılar", kk: "ki шылауының қолданысы" } },
  { id: "word_order", level: "B2", label: { ru: "Порядок слов и логическое ударение", en: "Word order & emphasis", tr: "Söz dizimi ve vurgu", kk: "Сөз тәртібі мен ой екпіні" } },
  { id: "collocations", level: "B2", label: { ru: "Коллокации и устойчивые сочетания", en: "Collocations", tr: "Eşdizimler", kk: "Тұрақты тіркестер" } },
  { id: "calques_collocations", level: "B2", label: { ru: "Кальки с родного языка", en: "L1 calques", tr: "Ana dilden kopya yapılar", kk: "Ана тілден калька" } },

  // --- C1 ---
  { id: "discourse_connectors", level: "C1", label: { ru: "Дискурсивные связки и союзы", en: "Discourse connectors", tr: "Söylem bağlaçları", kk: "Мәтін байланыстырғыштары" } },
  { id: "nominalization_advanced", level: "C1", label: { ru: "Сложная номинализация", en: "Advanced nominalization", tr: "İleri adlaştırma", kk: "Күрделі заттандыру" } },
  { id: "register_style", level: "C1", label: { ru: "Регистр и стиль (resmî/samimi)", en: "Register & style", tr: "Üslup ve kayıt", kk: "Стиль мен ресмилік деңгейі" } },

  // fallback
  { id: "other", level: "A1", label: { ru: "Другое", en: "Other", tr: "Diğer", kk: "Басқа" } },
];

export const TOPIC_IDS = TOPICS.map((t) => t.id);

const byId = new Map(TOPICS.map((t) => [t.id, t]));

export function topicById(id: string): Topic | undefined {
  return byId.get(id);
}

/** Coerce an AI-returned topic to a known id ("other" when unknown). */
export function normalizeTopicId(id: unknown): string {
  return typeof id === "string" && byId.has(id) ? id : "other";
}
