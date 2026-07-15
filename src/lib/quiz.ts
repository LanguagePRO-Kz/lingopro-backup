/**
 * Diagnostic shared types, scoring thresholds and quiz UI translations.
 *
 * v3 (DESIGN-DIAGNOSTIC-V2): the flow lives in src/app/quiz/page.tsx on top
 * of src/data/diagnostic-bank.ts + src/lib/diagnostic/engine.ts. QuizResult
 * carries honest /25 sections; Konuşma stays pending until the first live
 * lesson. The old GRAMMAR/VOCAB/READING banks below are kept ONLY for the
 * public /mock page and older saved results.
 */

import type { Locale } from "./i18n";
import type { WritingReview } from "./ai/prompts/writing-review";

export type Localized = Record<Locale, string>;
export type Level = "A0" | "A1" | "A2" | "B1" | "B2" | "C1";
export type ModuleId = "grammar" | "vocab" | "reading" | "listening" | "writing" | "speaking";

export type MCQuestion = {
  level: Level;
  /** Turkish prompt, shown in every language */
  prompt: string;
  /** Meaning hint shown under the prompt for ru/en/kk (hidden for tr) */
  hint?: Localized;
  /** Short skill tag (e.g. "Present tense") */
  tag?: Localized;
  /** Topic id from src/lib/ai/topics.ts — links the answer to mastery */
  topic?: string;
  /** Turkish/universal options; ignored if `opts` is given */
  options?: string[];
  /** Locale-specific options (used for translation questions) */
  opts?: Record<Locale, string[]>;
  answer: number;
};

/* ------------------------- Legacy module content -------------------------- */
/* Used only by the public /mock page now; the diagnostic reads
   src/data/diagnostic-bank.ts. */

export const GRAMMAR: MCQuestion[] = [
  {
    level: "A1",
    prompt: "Ahmet her gün saat yedide ___.",
    hint: {
      ru: "Ахмет каждый день в семь часов ___ (встаёт).",
      en: "Ahmet ___ at seven every day (gets up).",
      tr: "",
      kk: "Ахмет күн сайын жетіде ___ (тұрады).",
    },
    tag: { ru: "Настоящее время", en: "Present tense", tr: "Şimdiki zaman", kk: "Осы шақ" },
    topic: "present_iyor",
    options: ["kalkıyor", "kalktı", "kalkacak", "kalkmış"],
    answer: 0,
  },
  {
    level: "A2",
    prompt: "Dün akşam sinemaya ___.",
    hint: {
      ru: "Вчера вечером в кино ___ (сходил).",
      en: "Last night I ___ to the cinema (went).",
      tr: "",
      kk: "Кеше кешке киноға ___ (бардым).",
    },
    tag: { ru: "Прошедшее время -di", en: "Past tense -di", tr: "Görülen geçmiş zaman", kk: "Өткен шақ -di" },
    topic: "past_di_mis",
    options: ["gidiyorum", "gideceğim", "gittim", "gidiyordum"],
    answer: 2,
  },
  {
    level: "B1",
    prompt: "«Eve gideceğim. Yemek pişireceğim.» — tek cümle yapınız:",
    hint: {
      ru: "Объедините в одно предложение: «Пойду домой. Приготовлю еду.»",
      en: "Combine into one sentence: “I'll go home. I'll cook.”",
      tr: "",
      kk: "Бір сөйлемге біріктіріңіз: «Үйге барамын. Тамақ пісіремін.»",
    },
    tag: { ru: "Объединение предложений", en: "Joining clauses", tr: "Cümle birleştirme", kk: "Сөйлемдерді біріктіру" },
    topic: "converbs",
    options: [
      "Eve giderken yemek pişireceğim",
      "Eve gidince yemek pişireceğim",
      "Eve gitmeden yemek pişireceğim",
      "Eve gideli yemek pişireceğim",
    ],
    answer: 1,
  },
  {
    level: "B2",
    prompt: "Selma saat dörtte iş___ çık___.",
    hint: {
      ru: "Сельма в четыре часа с работы выходит.",
      en: "Selma leaves work at four o'clock.",
      tr: "",
      kk: "Сельма сағат төртте жұмыстан шығады.",
    },
    tag: { ru: "Суффиксы падежей", en: "Case suffixes", tr: "Hâl ekleri", kk: "Септік жалғаулары" },
    topic: "ablative",
    options: ["-e / -ıyorum", "-te / -ıyor", "-ten / -ıyor", "-den / -mıyor"],
    answer: 2,
  },
  {
    level: "C1",
    prompt: "Duyduğuma ___ Burak ile Aslı ___.",
    hint: {
      ru: "Как я слышал, Бурак с Аслы поссорились.",
      en: "From what I heard, Burak and Aslı had a fight.",
      tr: "",
      kk: "Естуімше, Бұрак пен Аслы ұрысып қалыпты.",
    },
    tag: { ru: "Косвенная речь", en: "Reported speech", tr: "Dolaylı anlatım", kk: "Жанама сөз" },
    topic: "reported_speech",
    options: ["ait / kavga etti", "göre / kavga etmiş", "ki / kavga edecek", "kadar / kavga ediyor"],
    answer: 1,
  },
];

export const VOCAB: MCQuestion[] = [
  {
    level: "A1",
    prompt: "«Hastane» ne demek?",
    hint: { ru: "Что означает слово «Hastane»?", en: "What does “Hastane” mean?", tr: "", kk: "«Hastane» сөзі нені білдіреді?" },
    opts: {
      ru: ["Школа", "Аптека", "Больница", "Магазин"],
      en: ["School", "Pharmacy", "Hospital", "Store"],
      tr: ["Okul", "Eczane", "Hastane", "Mağaza"],
      kk: ["Мектеп", "Дәріхана", "Аурухана", "Дүкен"],
    },
    answer: 2,
  },
  {
    level: "A2",
    prompt: "Haftanın günleri: Pazartesi, Salı, ___, Perşembe, Cuma, Cumartesi, Pazar",
    hint: { ru: "Дни недели: понедельник, вторник, ___, четверг…", en: "Days of the week: Monday, Tuesday, ___, Thursday…", tr: "", kk: "Апта күндері: дүйсенбі, сейсенбі, ___, бейсенбі…" },
    options: ["Çarşamba", "Ocak", "Mart", "Mayıs"],
    answer: 0,
  },
  {
    level: "B1",
    prompt: "«Başvuru» ne demek?",
    hint: { ru: "Что означает слово «Başvuru»?", en: "What does “Başvuru” mean?", tr: "", kk: "«Başvuru» сөзі нені білдіреді?" },
    opts: {
      ru: ["Заявление", "Начало", "Голова", "Успех"],
      en: ["Application", "Beginning", "Head", "Success"],
      tr: ["Başvuru", "Başlangıç", "Baş", "Başarı"],
      kk: ["Өтініш", "Бастау", "Бас", "Жетістік"],
    },
    answer: 0,
  },
  {
    level: "B1",
    prompt: "Bu konuda bir ___ almamız gerekiyor.",
    hint: { ru: "Нам нужно принять ___ (решение) по этому вопросу.", en: "We need to take a ___ (decision) on this.", tr: "", kk: "Бұл мәселе бойынша ___ (шешім) қабылдауымыз керек." },
    options: ["yemek", "karar", "hediye", "bilet"],
    answer: 1,
  },
  {
    level: "B2",
    prompt: "Yarınki maçı izlemeyi ___",
    topic: "collocations",
    tag: { ru: "Идиомы", en: "Idioms", tr: "Deyimler", kk: "Идиомалар" },
    hint: { ru: "Завтрашний матч жду с нетерпением (подберите идиому).", en: "I'm looking forward to tomorrow's match (pick the idiom).", tr: "", kk: "Ертеңгі матчты асыға күтемін (идиоманы таңдаңыз)." },
    options: ["can kulağıyla dinliyorum", "dört gözle bekliyorum", "can çekişiyorum", "eteklerim tutuşuyor"],
    answer: 1,
  },
];

export const READING_TEXT =
  "Türkiye'de dört mevsim yaşanırdı. Ancak son yıllarda küresel ısınma nedeniyle ilkbahar ve sonbahar mevsimleri kısaldı. Artık neredeyse altı ay kış, altı ay yaz yaşıyoruz.\n\nUzmanlar, ormanlık alanlar bu hızla azalmaya devam ederse kış mevsiminde sıcaklığın yaklaşık 10 derece artacağını söylüyor. İklim değişikliğinin esas sebebi ise biz insanlarız. Gerekli tedbirler alınmazsa belki de 10 yıl sonra bahar mevsimini bilmeyen nesiller yetişecek.";

export const READING: MCQuestion[] = [
  {
    level: "B1",
    prompt: "Metne göre hangi mevsimler artık kısaldı?",
    hint: { ru: "Согласно тексту, какие сезоны теперь стали короче?", en: "According to the text, which seasons have become shorter?", tr: "", kk: "Мәтінге сәйкес қай мезгілдер қысқарды?" },
    options: ["Kış ve yaz", "İlkbahar ve sonbahar", "Yaz ve sonbahar", "Kış ve ilkbahar"],
    answer: 1,
  },
  {
    level: "B1",
    prompt: "Sıcaklığın artmasının sebebi nedir?",
    hint: { ru: "В чём причина повышения температуры?", en: "What is the cause of rising temperature?", tr: "", kk: "Температураның көтерілу себебі неде?" },
    options: ["Ormanlık alanların artması", "Ormanlık alanların azalması", "Yağmurların çoğalması", "Rüzgârın artması"],
    answer: 1,
  },
  {
    level: "B2",
    prompt: "Metne göre aşağıdakilerden hangisi doğrudur?",
    hint: { ru: "Какое из утверждений верно согласно тексту?", en: "Which statement is correct according to the text?", tr: "", kk: "Мәтінге сәйкес қай тұжырым дұрыс?" },
    options: [
      "Türkiye'de artık üç mevsim yaşanıyor",
      "Sıcaklık 10 derece düştü",
      "Uzmanlar gelecekte sıcaklığın artacağını söylüyor",
      "Ormanlık alanlar artıyor",
    ],
    answer: 2,
  },
  {
    level: "B2",
    prompt: "«Gerekli tedbirler alınmazsa» ne anlama geliyor?",
    hint: { ru: "Что означает «Gerekli tedbirler alınmazsa»?", en: "What does “Gerekli tedbirler alınmazsa” mean?", tr: "", kk: "«Gerekli tedbirler alınmazsa» нені білдіреді?" },
    options: ["Tedbirler zaten alındı", "Eğer önlem alınmazsa", "Tedbirler gereksiz", "Herkes tedbir alıyor"],
    answer: 1,
  },
];

/* ------------------------------- Modules meta ------------------------------ */

export const MODULES: { id: ModuleId; emoji: string; name: Localized; minutes: number }[] = [
  { id: "grammar", emoji: "📝", name: { ru: "Грамматика", en: "Grammar", tr: "Dil bilgisi", kk: "Грамматика" }, minutes: 3 },
  { id: "vocab", emoji: "📚", name: { ru: "Лексика", en: "Vocabulary", tr: "Kelime", kk: "Лексика" }, minutes: 3 },
  { id: "reading", emoji: "📖", name: { ru: "Чтение", en: "Reading", tr: "Okuma", kk: "Оқу" }, minutes: 4 },
  { id: "listening", emoji: "🎧", name: { ru: "Аудирование", en: "Listening", tr: "Dinleme", kk: "Тыңдалым" }, minutes: 4 },
  { id: "writing", emoji: "✍️", name: { ru: "Письмо", en: "Writing", tr: "Yazma", kk: "Жазу" }, minutes: 5 },
  { id: "speaking", emoji: "🎤", name: { ru: "Говорение", en: "Speaking", tr: "Konuşma", kk: "Сөйлеу" }, minutes: 5 },
];

/* -------------------------------- Scoring --------------------------------- */

export function levelFromScore(n: number): Level {
  if (n <= 20) return "A0";
  if (n <= 35) return "A1";
  if (n <= 50) return "A2";
  if (n <= 65) return "B1";
  if (n <= 80) return "B2";
  return "C1";
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/* -------------------------------- Result ---------------------------------- */

export type SkillScore = { id: ModuleId; percent: number; level: Level };

/** One answered question — the raw material for an honest breakdown. */
export type AnswerRecord = {
  module: ModuleId;
  /** Bank question id (v3+) — ties the record to attempts / the item bank */
  id?: string;
  prompt: string;
  /** Topic id from src/lib/ai/topics.ts, when the question is tagged */
  topic?: string;
  tag?: Localized;
  level: Level;
  correct: boolean;
  /** Студент нажал «Не знаю»: незнание ≠ угадывание (correct всегда false) */
  skipped?: boolean;
  /** Выбранный вариант в ОРИГИНАЛЬНОМ порядке банка (v3+) — сервер судит сам */
  selected?: number;
  /** The correct option's text (locale-resolved at answer time) */
  correctAnswer: string;
};

/** Honest /25 section scores; null = not measured yet (Yazma → AI, Konuşma → first live lesson). */
export type ResultSections = {
  dinleme: number | null;
  okuma: number | null;
  yazma: number | null;
  konusma: number | null;
};

export type QuizResult = {
  level: Level;
  /** Share of correct answers across the KNOWN sections, 0–100 */
  overall: number;
  /** Honest ballpark (= overall); the UI presents it as a range, not a promise */
  predictedScore: number;
  /** Legacy per-module bars; on v3 results an approximation for old consumers */
  skills: SkillScore[];
  strengths: ModuleId[];
  weaknesses: ModuleId[];
  /** Module ids sorted worst → best, for the plan/breakdown order */
  byWeakness: ModuleId[];
  plan: "beginner" | "a2" | "advanced";
  writingWords: number;
  takenAt: number;
  /** Per-question answers (absent on results saved before this field existed) */
  answers?: AnswerRecord[];

  /* ----- v3 (DESIGN-DIAGNOSTIC-V2 §5); absent on older saved results ----- */
  version?: 3;
  /** Working level found by the adaptive staircase */
  routerLevel?: Level;
  sections?: ResultSections;
  /** Sum of the non-null sections (max 25 × known count) */
  totalKnown?: number;
  /** Yazma essay text, kept until the deferred AI review runs post-login */
  writingText?: string;
  yazmaPromptId?: string;
  yazmaReview?: WritingReview;
  /** Daily study minutes chosen in onboarding (15/30/45/60) */
  minutesDaily?: number;
  /** asked once in onboarding; null = prefer not to say */
  gender?: "female" | "male" | null;
};

export const LEVEL_ORDER: Level[] = ["A0", "A1", "A2", "B1", "B2", "C1"];
export function levelIndex(level: Level): number {
  return Math.max(0, LEVEL_ORDER.indexOf(level));
}

const RESULT_KEY = "lingopro:quizResult";

/**
 * Валидатор формы результата на ГРАНИЦАХ (localStorage, profiles.quiz_result).
 * Битый/частичный объект = результата НЕТ (правило 1.3), а не «почти результат»:
 * страницы обращаются к PLANS[result.plan].title и result.skills без защиты,
 * и один неполный JSONB кладёт /pricing и /quiz/result белым экраном.
 * Все 52 живых результата в проде эту форму проходят (проверено 14.07.2026).
 */
export function sanitizeResult(raw: unknown): QuizResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.level !== "string" || !LEVEL_ORDER.includes(r.level as Level)) return null;
  if (typeof r.plan !== "string" || !(r.plan in PLANS)) return null;
  if (typeof r.overall !== "number" || !Number.isFinite(r.overall)) return null;
  if (!Array.isArray(r.skills)) return null;
  return raw as QuizResult;
}

export function saveResult(r: QuizResult) {
  try {
    window.localStorage.setItem(RESULT_KEY, JSON.stringify(r));
  } catch {
    /* ignore storage errors */
  }
}

export function loadResult(): QuizResult | null {
  try {
    const raw = window.localStorage.getItem(RESULT_KEY);
    return raw ? sanitizeResult(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** Drop the cached result once it lives safely in Supabase. */
export function clearResult() {
  try {
    window.localStorage.removeItem(RESULT_KEY);
  } catch {
    /* ignore storage errors */
  }
}

/* --------------------------- In-progress persistence --------------------- */
/**
 * Coarse quiz progress so a page refresh doesn't drop the user back to the
 * onboarding. Completed stages keep their aggregates; the ACTIVE stage
 * restarts from its first question (stage internals — selected options,
 * audio play counts — aren't lifted here). The router state is fully
 * serializable, so a refresh mid-router resumes exactly where it stopped.
 */
export type StageId = "router" | "dinleme" | "okuma" | "yazma";

export type QuizProgress = {
  v: 3;
  phase: "onboarding" | "stage";
  onbStep: number;
  stage: StageId;
  /** Serialized staircase (see src/lib/diagnostic/engine.ts RouterState) */
  router: unknown | null;
  /** Set once the router stage completes */
  routerLevel: Level | null;
  seed: number;
  minutesDaily: number | null;
  gender?: "female" | "male" | null;
  answers: AnswerRecord[];
  dinleme: { correct: number; total: number } | null;
  okuma: { correct: number; total: number } | null;
};

const PROGRESS_KEY = "lingopro:quizProgress";

export function saveProgress(p: QuizProgress) {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* ignore storage errors */
  }
}

export function loadProgress(): QuizProgress | null {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    const p = raw ? (JSON.parse(raw) as QuizProgress) : null;
    // pre-v3 snapshots (module-based flow) can't be resumed — start fresh
    return p && p.v === 3 ? p : null;
  } catch {
    return null;
  }
}

export function clearProgress() {
  try {
    window.localStorage.removeItem(PROGRESS_KEY);
    // a fresh run gets fresh audio plays; WITHIN a run the counters survive
    // any refresh (exam honesty — see AudioPlayer in quiz/page.tsx)
    for (const key of Object.keys(window.sessionStorage)) {
      if (key.startsWith("lingopro:plays:")) window.sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore storage errors */
  }
}

/* ----------------------------- UI translations ---------------------------- */

const T = {
  // onboarding
  step: { ru: "Шаг", en: "Step", tr: "Adım", kk: "Қадам" },
  onbExam: { ru: "Какой экзамен ты готовишь?", en: "Which exam are you preparing for?", tr: "Hangi sınava hazırlanıyorsun?", kk: "Қай емтиханға дайындалудасың?" },
  onbLevel: { ru: "Как оцениваешь свой уровень?", en: "How would you rate your level?", tr: "Seviyeni nasıl değerlendirirsin?", kk: "Деңгейіңді қалай бағалайсың?" },
  onbWhen: { ru: "Когда планируешь сдавать", en: "When do you plan to take", tr: "Ne zaman gireceksin", kk: "Қашан тапсырмақсың" },
  choose: { ru: "Выбрать", en: "Choose", tr: "Seç", kk: "Таңдау" },
  soon: { ru: "Скоро", en: "Soon", tr: "Yakında", kk: "Жақында" },
  back: { ru: "Назад", en: "Back", tr: "Geri", kk: "Артқа" },
  // self-level options
  lvBeginner: { ru: "Начинающий", en: "Beginner", tr: "Başlangıç", kk: "Бастаушы" },
  lvBasic: { ru: "Базовый", en: "Basic", tr: "Temel", kk: "Базалық" },
  lvMid: { ru: "Средний", en: "Intermediate", tr: "Orta", kk: "Орта" },
  lvAdvanced: { ru: "Продвинутый", en: "Advanced", tr: "İleri", kk: "Жоғары" },
  lvUnknown: { ru: "Не знаю — определите за меня", en: "Not sure — assess me", tr: "Bilmiyorum — siz belirleyin", kk: "Білмеймін — өзіңіз анықтаңыз" },
  // goal (B2 / C1 — the only two TÖMER certificate levels)
  onbGoal: { ru: "Какой сертификат тебе нужен?", en: "Which certificate do you need?", tr: "Hangi sertifikaya ihtiyacın var?", kk: "Саған қай сертификат керек?" },
  goalB2: { ru: "Для учёбы и работы — самый частый выбор", en: "For study and work — the most common choice", tr: "Eğitim ve iş için — en yaygın seçim", kk: "Оқу мен жұмысқа — ең жиі таңдау" },
  goalC1: { ru: "Максимальный уровень — медицина, академия", en: "The top level — medicine, academia", tr: "En üst seviye — tıp, akademi", kk: "Ең жоғары деңгей — медицина, академия" },
  goalThreshold: { ru: "порог", en: "threshold", tr: "baraj", kk: "шек" },
  // timeline
  tl1: { ru: "Через ~1 месяц", en: "In ~1 month", tr: "~1 ay içinde", kk: "~1 айдан кейін" },
  tl3: { ru: "Через ~3 месяца", en: "In ~3 months", tr: "~3 ay içinde", kk: "~3 айдан кейін" },
  tl6: { ru: "Через ~6 месяцев", en: "In ~6 months", tr: "~6 ay içinde", kk: "~6 айдан кейін" },
  tlOpen: { ru: "Пока не решил", en: "Not decided yet", tr: "Henüz kararsızım", kk: "Әлі шешкен жоқпын" },
  tlExact: { ru: "Знаю точную дату", en: "I know the exact date", tr: "Kesin tarihi biliyorum", kk: "Нақты күнін білемін" },
  tlPickDate: { ru: "Выбери дату экзамена", en: "Pick your exam date", tr: "Sınav tarihini seç", kk: "Емтихан күнін таңда" },
  tlConfirm: { ru: "Подтвердить", en: "Confirm", tr: "Onayla", kk: "Растау" },
  // locked vs movable exam date → honest plan scenario B vs A
  tlFlexQ: {
    ru: "Эту дату можно перенести, если понадобится?",
    en: "Can this date move if needed?",
    tr: "Gerekirse bu tarih ertelenebilir mi?",
    kk: "Қажет болса, бұл күнді ауыстыруға бола ма?",
  },
  tlFlex: { ru: "Да, могу перенести", en: "Yes, I can move it", tr: "Evet, erteleyebilirim", kk: "Иә, ауыстыра аламын" },
  tlFixed: { ru: "Нет, дата жёсткая — уже есть запись", en: "No, it's locked — I'm registered", tr: "Hayır, kesin — kaydım var", kk: "Жоқ, бекітілген — тіркеліп қойғанмын" },
  // minutes per day (onboarding)
  onbMinutes: { ru: "Сколько минут в день готов заниматься?", en: "How many minutes a day can you study?", tr: "Günde kaç dakika çalışabilirsin?", kk: "Күніне қанша минут айналыса аласың?" },
  minutesNote: {
    ru: "От этого зависит длина дневного плана. Можно изменить в настройках в любой момент.",
    en: "This sets the length of your daily plan. You can change it in settings anytime.",
    tr: "Günlük planın uzunluğu buna göre belirlenir. Ayarlardan istediğin zaman değiştirebilirsin.",
    kk: "Күнделікті жоспардың ұзақтығы осыған байланысты. Баптаулардан кез келген уақытта өзгертуге болады.",
  },
  min15: { ru: "Лёгкий", en: "Light", tr: "Hafif", kk: "Жеңіл" },
  min30: { ru: "Стабильный", en: "Steady", tr: "Düzenli", kk: "Тұрақты" },
  min45: { ru: "Уверенный", en: "Confident", tr: "Yoğun", kk: "Сенімді" },
  min60: { ru: "Интенсив", en: "Intensive", tr: "Çok yoğun", kk: "Интенсив" },
  min90: { ru: "Усиленный", en: "Boosted", tr: "Takviyeli", kk: "Күшейтілген" },
  min120: { ru: "Максимум", en: "Maximum", tr: "Maksimum", kk: "Максимум" },
  minPerDay: { ru: "мин/день", en: "min/day", tr: "dk/gün", kk: "мин/күн" },
  monthsShort: { ru: "мес", en: "mo", tr: "ay", kk: "ай" },
  // v3 stages
  stRouter: { ru: "Определение уровня", en: "Level check", tr: "Seviye belirleme", kk: "Деңгейді анықтау" },
  stDinleme: { ru: "Аудирование", en: "Listening", tr: "Dinleme", kk: "Тыңдалым" },
  stOkuma: { ru: "Чтение", en: "Reading", tr: "Okuma", kk: "Оқылым" },
  stYazma: { ru: "Письмо", en: "Writing", tr: "Yazma", kk: "Жазылым" },
  stKonusma: { ru: "Говорение", en: "Speaking", tr: "Konuşma", kk: "Сөйлесім" },
  stage: { ru: "Этап", en: "Stage", tr: "Aşama", kk: "Кезең" },
  routerIntro: {
    ru: "Адаптивный тест: вопросы подстраиваются под твои ответы. Отвечай честно — «не знаю» лучше угадывания.",
    en: "Adaptive test: questions adjust to your answers. Answer honestly — skipping beats guessing.",
    tr: "Uyarlanabilir test: sorular cevaplarına göre ayarlanır. Dürüst cevapla.",
    kk: "Бейімделгіш тест: сұрақтар жауаптарыңа қарай өзгереді. Шынайы жауап бер.",
  },
  // пропуск и возврат (незнание ≠ угадывание — агент их различает)
  skip: { ru: "Не знаю — дальше", en: "I don't know — next", tr: "Bilmiyorum — geç", kk: "Білмеймін — келесі" },
  backQ: { ru: "← Назад", en: "← Back", tr: "← Geri", kk: "← Артқа" },
  // dinleme audio player
  play: { ru: "Прослушать", en: "Play", tr: "Dinle", kk: "Тыңдау" },
  playing: { ru: "Играет…", en: "Playing…", tr: "Çalıyor…", kk: "Ойнап тұр…" },
  playsLeft: { ru: "Осталось прослушиваний", en: "Plays left", tr: "Kalan dinleme hakkı", kk: "Қалған тыңдау саны" },
  audioRule: {
    ru: "Как на экзамене: максимум два прослушивания",
    en: "Exam rules: two plays maximum",
    tr: "Sınavdaki gibi: en fazla iki dinleme",
    kk: "Емтихандағыдай: ең көбі екі рет тыңдау",
  },
  // yazma
  yazmaAiNote: {
    ru: "Эссе проверит AI-экзаменатор по критериям TÖMER — балл появится на странице результата.",
    en: "An AI examiner will review the essay against TÖMER criteria — the score appears on the result page.",
    tr: "Kompozisyonu yapay zekâ TÖMER ölçütlerine göre değerlendirecek — puan sonuç sayfasında görünecek.",
    kk: "Эссені AI-емтихан алушы TÖMER өлшемдері бойынша тексереді — балл нәтиже бетінде шығады.",
  },
  // v3 result view
  secTitle: { ru: "Секции TÖMER", en: "TÖMER sections", tr: "TÖMER bölümleri", kk: "TÖMER бөлімдері" },
  ofSections: { ru: "по секциям", en: "across sections", tr: "bölüm toplamı", kk: "бөлімдер бойынша" },
  konusmaPending: {
    ru: "Оценим за 2-минутную голосовую пробу с AI-преподавателем",
    en: "Assessed in a 2-minute voice probe with the AI teacher",
    tr: "AI öğretmenle 2 dakikalık konuşma denemesinde değerlendirilecek",
    kk: "AI ұстазбен 2 минуттық дауыс сынамасында бағаланады",
  },
  konusmaCta: { ru: "Пройти пробу (2 мин)", en: "Take the probe (2 min)", tr: "Denemeye başla (2 dk)", kk: "Сынамадан өту (2 мин)" },
  yazmaChecking: { ru: "AI-экзаменатор проверяет эссе…", en: "The AI examiner is reviewing the essay…", tr: "Yapay zekâ kompozisyonu değerlendiriyor…", kk: "AI эссені тексеріп жатыр…" },
  yazmaPendingAuth: {
    ru: "Балл за письмо появится после проверки AI-экзаменатором",
    en: "The writing score appears after the AI review",
    tr: "Yazma puanı yapay zekâ incelemesinden sonra görünecek",
    kk: "Жазылым баллы AI тексерісінен кейін шығады",
  },
  // честные исходы проверки: молчаливый вечный прочерк — враньё (правило 1.3)
  yazmaQuota: {
    ru: "Лимит AI-проверок диагностики на сегодня исчерпан. Эссе сохранено — проверим при следующем заходе.",
    en: "Today's diagnostic AI-review limit is used up. Your essay is saved — we'll review it on your next visit.",
    tr: "Bugünkü tanılama AI inceleme limiti doldu. Kompozisyonun kayıtlı — bir sonraki girişte inceleyeceğiz.",
    kk: "Бүгінгі диагностикалық AI тексеру лимиті бітті. Эссең сақтаулы — келесі кіргенде тексереміз.",
  },
  yazmaFailed: {
    ru: "Проверка не прошла — AI-сервис не ответил. Эссе сохранено, попробуй ещё раз.",
    en: "The review didn't go through — the AI service didn't respond. Your essay is saved, try again.",
    tr: "İnceleme tamamlanamadı — AI servisi yanıt vermedi. Kompozisyonun kayıtlı, tekrar dene.",
    kk: "Тексеру өтпеді — AI қызметі жауап бермеді. Эссең сақтаулы, қайта көр.",
  },
  yazmaRetry: { ru: "Проверить ещё раз", en: "Retry the review", tr: "Tekrar dene", kk: "Қайта тексеру" },
  cefrCapNote: {
    ru: "Уровень C1 подтверждается только пробным экзаменом — диагностика показывает до B2+.",
    en: "C1 is confirmed only by a mock exam — the diagnostic measures up to B2+.",
    tr: "C1 seviyesi yalnızca deneme sınavıyla doğrulanır — teşhis en çok B2+ gösterir.",
    kk: "C1 деңгейі тек сынақ емтиханмен расталады — диагностика B2+ дейін көрсетеді.",
  },
  gapsFound: { ru: "Найденные пробелы по темам", en: "Topic gaps found", tr: "Tespit edilen konu eksikleri", kk: "Табылған тақырып олқылықтары" },
  mainErrors: { ru: "Главные ошибки в эссе", en: "Key essay errors", tr: "Kompozisyondaki ana hatalar", kk: "Эссенің негізгі қателері" },
  // transition
  moduleDone: { ru: "завершён", en: "completed", tr: "tamamlandı", kk: "аяқталды" },
  nextModule: { ru: "Следующий", en: "Next", tr: "Sıradaki", kk: "Келесі" },
  estTime: { ru: "Примерное время", en: "Approx. time", tr: "Tahmini süre", kk: "Шамамен уақыт" },
  min: { ru: "мин", en: "min", tr: "dk", kk: "мин" },
  continue: { ru: "Продолжить", en: "Continue", tr: "Devam et", kk: "Жалғастыру" },
  startDiagnostic: { ru: "Начать диагностику", en: "Start the diagnostic", tr: "Teşhise başla", kk: "Диагностиканы бастау" },
  // quiz common
  module: { ru: "Модуль", en: "Module", tr: "Modül", kk: "Модуль" },
  question: { ru: "Вопрос", en: "Question", tr: "Soru", kk: "Сұрақ" },
  next: { ru: "Далее", en: "Next", tr: "İleri", kk: "Келесі" },
  finish: { ru: "Узнать результат", en: "See result", tr: "Sonucu gör", kk: "Нәтижені көру" },
  timeLeft: { ru: "Осталось", en: "Left", tr: "Kalan", kk: "Қалды" },
  // writing
  wordsLabel: { ru: "слов", en: "words", tr: "kelime", kk: "сөз" },
  minSentences: { ru: "Минимум 5 предложений", en: "At least 5 sentences", tr: "En az 5 cümle", kk: "Кемінде 5 сөйлем" },
  writePlaceholder: { ru: "Напишите ваш ответ на турецком…", en: "Write your answer in Turkish…", tr: "Cevabınızı Türkçe yazın…", kk: "Жауабыңызды түрікше жазыңыз…" },
  // speaking — AI audio dialogue
  aiSpeaking: { ru: "AI говорит…", en: "AI is speaking…", tr: "AI konuşuyor…", kk: "AI сөйлеп тұр…" },
  listeningYou: { ru: "Слушаю тебя…", en: "Listening to you…", tr: "Seni dinliyorum…", kk: "Сені тыңдап тұрмын…" },
  processing: { ru: "Обрабатываю…", en: "Processing…", tr: "İşleniyor…", kk: "Өңделуде…" },
  tapAnswer: { ru: "Нажми, чтобы ответить", en: "Tap to answer", tr: "Cevaplamak için bas", kk: "Жауап беру үшін бас" },
  micStop: { ru: "Остановить запись", en: "Stop recording", tr: "Kaydı durdur", kk: "Жазуды тоқтату" },
  listenAgain: { ru: "Прослушать ещё раз", en: "Listen again", tr: "Tekrar dinle", kk: "Қайта тыңдау" },
  answerSaved: { ru: "Ответ записан", en: "Answer saved", tr: "Cevap kaydedildi", kk: "Жауап сақталды" },
  speakNoMic: {
    ru: "Ваш браузер не поддерживает запись голоса. Напишите ваш ответ текстом.",
    en: "Your browser doesn't support voice recording. Type your answer instead.",
    tr: "Tarayıcınız ses kaydını desteklemiyor. Cevabınızı yazın.",
    kk: "Браузеріңіз дауыс жазуды қолдамайды. Жауабыңызды жазыңыз.",
  },
  nextQuestion: { ru: "Следующий вопрос", en: "Next question", tr: "Sıradaki soru", kk: "Келесі сұрақ" },
  // results
  yourLevel: { ru: "Твой уровень", en: "Your level", tr: "Seviyen", kk: "Деңгейің" },
  correct: { ru: "общий балл", en: "overall score", tr: "genel puan", kk: "жалпы балл" },
  predicted: { ru: "Предполагаемый балл", en: "Predicted score", tr: "Tahmini puan", kk: "Болжамды балл" },
  skills: { ru: "Разбивка по навыкам", en: "Skill breakdown", tr: "Beceri dağılımı", kk: "Дағдылар бойынша" },
  strengthsTitle: { ru: "Сильные стороны", en: "Strengths", tr: "Güçlü yönler", kk: "Күшті жақтар" },
  weakTitle: { ru: "Слабые зоны", en: "Areas to improve", tr: "Gelişim alanları", kk: "Әлсіз тұстар" },
  planTitle: { ru: "Рекомендуемый план", en: "Recommended plan", tr: "Önerilen plan", kk: "Ұсынылатын жоспар" },
  startPrep: { ru: "Начать подготовку", en: "Start preparing", tr: "Hazırlığa başla", kk: "Дайындықты бастау" },
  retake: { ru: "Пройти диагностику ещё раз", en: "Retake the diagnostic", tr: "Teşhisi tekrar geç", kk: "Диагностиканы қайта өту" },
  noResult: { ru: "Сначала пройди диагностику", en: "Take the diagnostic first", tr: "Önce teşhisi geç", kk: "Алдымен диагностикадан өт" },
  noResultText: { ru: "Чтобы увидеть результат, нужно пройти все 5 модулей.", en: "Complete all 5 modules to see your result.", tr: "Sonucu görmek için 5 modülü tamamla.", kk: "Нәтижені көру үшін 5 модульді аяқта." },
  goQuiz: { ru: "Пройти диагностику", en: "Take the diagnostic", tr: "Teşhise başla", kk: "Диагностикадан өту" },
  // detailed breakdown
  detailTitle: { ru: "Подробный разбор диагностики", en: "Detailed diagnostic breakdown", tr: "Ayrıntılı teşhis analizi", kk: "Толық диагностика талдауы" },
  v2UpsellText: {
    ru: "Формат диагностики обновился: теперь она даёт баллы по секциям TÖMER (/25), найденные пробелы и конкретные рекомендации. Этот результат — старого формата.",
    en: "The diagnostic has been upgraded: it now scores each TÖMER section (/25) and shows found gaps plus concrete recommendations. This result is from the old format.",
    tr: "Teşhis yenilendi: artık her TÖMER bölümünü (/25) puanlıyor, eksikleri ve somut önerileri gösteriyor. Bu sonuç eski formattan.",
    kk: "Диагностика жаңарды: енді әр TÖMER бөліміне (/25) балл қойып, олқылықтар мен нақты ұсыныстар береді. Бұл нәтиже ескі форматта.",
  },
  v2UpsellCta: {
    ru: "Пройти обновлённую диагностику",
    en: "Take the upgraded diagnostic",
    tr: "Yenilenen teşhise gir",
    kk: "Жаңарған диагностикадан өту",
  },
  knowsTitle: { ru: "Что ты знаешь:", en: "What you know:", tr: "Bildiklerin:", kk: "Нені білесің:" },
  gapsTitle: { ru: "Где пробелы:", en: "Where the gaps are:", tr: "Eksiklerin nerede:", kk: "Олқылықтар қайда:" },
  todoTitle: { ru: "Что делать:", en: "What to do:", tr: "Ne yapmalı:", kk: "Не істеу керек:" },
  // forecast
  forecastTitle: { ru: "Прогноз результата на", en: "Result forecast for", tr: "Sonuç tahmini:", kk: "Нәтиже болжамы:" },
  ifNow: { ru: "Если сдашь сейчас:", en: "If you take it now:", tr: "Şimdi girersen:", kk: "Қазір тапсырсаң:" },
  likelyResult: { ru: "Вероятный результат", en: "Likely result", tr: "Olası sonuç", kk: "Ықтимал нәтиже" },
  readinessWord: { ru: "готовность", en: "readiness", tr: "hazırlık", kk: "дайындық" },
  riskText: { ru: "Высокий риск не сдать на нужный балл", en: "High risk of missing the required score", tr: "Gereken puanı alamama riski yüksek", kk: "Қажетті баллды алмау қаупі жоғары" },
  afterPrep: { ru: "После подготовки на платформе:", en: "After preparing on the platform:", tr: "Platformda hazırlandıktan sonra:", kk: "Платформада дайындалғаннан кейін:" },
  expectedResult: { ru: "Ожидаемый результат", en: "Expected result", tr: "Beklenen sonuç", kk: "Күтілетін нәтиже" },
  termWord: { ru: "Срок", en: "Timeline", tr: "Süre", kk: "Мерзім" },
  nowLabel: { ru: "сейчас", en: "now", tr: "şimdi", kk: "қазір" },
  m1: { ru: "через 1 мес", en: "in 1 mo", tr: "1 ay sonra", kk: "1 айда" },
  m3: { ru: "через 3 мес", en: "in 3 mo", tr: "3 ay sonra", kk: "3 айда" },
  // plan
  planToC1: { ru: "Твой персональный план до C1", en: "Your personal plan to C1", tr: "C1'e kadar kişisel planın", kk: "C1-ге дейінгі жеке жоспарың" },
  stagesTitle: { ru: "Этапы", en: "Stages", tr: "Aşamalar", kk: "Кезеңдер" },
  // comparison
  compareTitle: { ru: "Твой уровень на шкале TÖMER", en: "Your level on the TÖMER scale", tr: "TÖMER ölçeğindeki seviyeniz", kk: "TÖMER шәкіліндегі деңгейің" },
  youHere: { ru: "Ты здесь", en: "You", tr: "Sen", kk: "Сен" },
  neededFor: { ru: "Нужно для", en: "Needed for", tr: "Gereken:", kk: "Қажет:" },
  // honest breakdown / forecast
  approxNote: {
    ru: "Ориентировочная оценка по короткой диагностике. Точный балл покажет первый пробный экзамен.",
    en: "A ballpark based on a short diagnostic. Your first mock exam will show the precise score.",
    tr: "Kısa teşhise dayalı yaklaşık değerlendirme. Kesin puanı ilk deneme sınavı gösterir.",
    kk: "Қысқа диагностикаға негізделген шамамен баға. Нақты баллды алғашқы сынақ емтиханы көрсетеді.",
  },
  thresholdsNote: {
    ru: "Порог сертификата TÖMER: 60/100 — B2, 75/100 — C1.",
    en: "TÖMER certificate thresholds: 60/100 — B2, 75/100 — C1.",
    tr: "TÖMER sertifika barajı: 60/100 — B2, 75/100 — C1.",
    kk: "TÖMER сертификат шегі: 60/100 — B2, 75/100 — C1.",
  },
  prelimWriting: {
    ru: "Предварительная оценка по объёму и структуре ответа. Точную проверку по критериям TÖMER сделает AI-преподаватель в кабинете (раздел «Письмо»).",
    en: "A preliminary estimate from answer length and structure. The AI teacher gives a precise TÖMER-criteria review in the Writing section.",
    tr: "Cevabın uzunluğuna ve yapısına dayalı ön değerlendirme. Kesin TÖMER ölçütlü incelemeyi panelde AI öğretmen yapar (Yazma bölümü).",
    kk: "Жауап көлемі мен құрылымына негізделген алдын ала баға. Нақты TÖMER өлшемді тексеруді кабинетте AI ұстаз жасайды (Жазу бөлімі).",
  },
  prelimSpeaking: {
    ru: "Предварительная оценка. Точный уровень говорения определит первый живой урок с AI-преподавателем.",
    en: "A preliminary estimate. Your first live lesson with the AI teacher will assess speaking precisely.",
    tr: "Ön değerlendirme. Konuşma seviyeni ilk canlı AI dersi kesin olarak belirler.",
    kk: "Алдын ала баға. Сөйлеу деңгейіңді AI ұстазбен алғашқы жанды сабақ нақты анықтайды.",
  },
  noDetail: {
    ru: "Детальный разбор появится после следующего прохождения диагностики.",
    en: "A detailed breakdown will appear after your next diagnostic run.",
    tr: "Ayrıntılı analiz bir sonraki teşhiste görünecek.",
    kk: "Толық талдау келесі диагностикадан кейін шығады.",
  },
  correctAnswerWord: { ru: "правильный ответ", en: "correct answer", tr: "doğru cevap", kk: "дұрыс жауап" },
  focusNote: {
    ru: "Эти темы автоматически попадут в фокус твоих уроков с AI-преподавателем.",
    en: "These topics automatically become the focus of your AI-teacher lessons.",
    tr: "Bu konular AI öğretmen derslerinin odağına otomatik eklenir.",
    kk: "Бұл тақырыптар AI ұстаз сабақтарының фокусына автоматты түрде қосылады.",
  },
  targetRange: { ru: "После подготовки", en: "After preparation", tr: "Hazırlıktan sonra", kk: "Дайындықтан кейін" },
  // CTA note
  onbGender: { ru: "Как к тебе обращаться?", en: "How should we address you?", tr: "Sana nasıl hitap edelim?", kk: "Саған қалай жүгінейік?" },
  genderNote: { ru: "Нужно только для правильных обращений — «готова» или «готов».", en: "Used only for correct grammatical address.", tr: "Yalnızca doğru hitap biçimleri için gerekli.", kk: "Тек дұрыс жүгіну үшін қажет." },
  genderF: { ru: "Я девушка", en: "Female", tr: "Kadın", kk: "Қыз/әйелмін" },
  genderM: { ru: "Я парень", en: "Male", tr: "Erkek", kk: "Жігіт/ер адаммын" },
  genderSkip: { ru: "Не указывать", en: "Prefer not to say", tr: "Belirtmek istemiyorum", kk: "Көрсетпеймін" },
  discountNote: {
    ru: "Пройди диагностику → получи скидку 30% на любой пакет",
    en: "Take the diagnostic → get 30% off any package",
    tr: "Teşhisi geç → her pakette %30 indirim kazan",
    kk: "Диагностикадан өт → кез келген пакетке 30% жеңілдік ал",
  },
} as const;

export type QuizTKey = keyof typeof T;
export function qt(locale: Locale, key: QuizTKey): string {
  return T[key][locale] ?? T[key].ru;
}

/* Strength / weakness phrasing per module */
const STRENGTH: Record<ModuleId, Localized> = {
  grammar: { ru: "Грамматика — уверенная база времён и падежей", en: "Grammar — solid tenses and cases", tr: "Dil bilgisi — sağlam zaman ve hâl bilgisi", kk: "Грамматика — шақтар мен септіктер мықты" },
  vocab: { ru: "Лексика — хороший словарный запас", en: "Vocabulary — good range of words", tr: "Kelime — geniş kelime dağarcığı", kk: "Лексика — сөздік қоры жақсы" },
  reading: { ru: "Чтение — хорошо понимаешь тексты", en: "Reading — strong text comprehension", tr: "Okuma — metinleri iyi anlıyorsun", kk: "Оқу — мәтінді жақсы түсінесің" },
  listening: { ru: "Аудирование — хорошо понимаешь на слух", en: "Listening — strong aural comprehension", tr: "Dinleme — dinlediğini iyi anlıyorsun", kk: "Тыңдалым — естігеніңді жақсы түсінесің" },
  writing: { ru: "Письмо — складно строишь предложения", en: "Writing — coherent sentences", tr: "Yazma — tutarlı cümleler", kk: "Жазу — сөйлемдерді жатық құрасың" },
  speaking: { ru: "Говорение — уверенно отвечаешь устно", en: "Speaking — confident spoken answers", tr: "Konuşma — akıcı sözlü cevaplar", kk: "Сөйлеу — ауызша сенімді жауап бересің" },
};

const WEAKNESS: Record<ModuleId, Localized> = {
  grammar: { ru: "Грамматика — повтори времена и падежные окончания", en: "Grammar — review tenses and case endings", tr: "Dil bilgisi — zaman ve hâl eklerini tekrar et", kk: "Грамматика — шақтар мен септіктерді қайтала" },
  vocab: { ru: "Лексика — расширяй активный словарь", en: "Vocabulary — grow your active vocabulary", tr: "Kelime — kelime dağarcığını genişlet", kk: "Лексика — белсенді сөздігіңді кеңейт" },
  reading: { ru: "Чтение — тренируй понимание текстов", en: "Reading — practise comprehension", tr: "Okuma — anlama pratiği yap", kk: "Оқу — мәтінді түсінуді жаттық" },
  listening: { ru: "Аудирование — тренируй понимание на слух", en: "Listening — practise aural comprehension", tr: "Dinleme — dinleme pratiği yap", kk: "Тыңдалым — естіп түсінуді жаттық" },
  writing: { ru: "Письмо — тренируй структуру предложений", en: "Writing — work on sentence structure", tr: "Yazma — cümle yapısı üzerine çalış", kk: "Жазу — сөйлем құрылымын жаттық" },
  speaking: { ru: "Говорение — нужна разговорная практика", en: "Speaking — needs more practice", tr: "Konuşma — daha çok pratik gerek", kk: "Сөйлеу — сөйлеу тәжірибесі қажет" },
};

export function strengthText(id: ModuleId, locale: Locale): string {
  return STRENGTH[id][locale] ?? STRENGTH[id].ru;
}
export function weaknessText(id: ModuleId, locale: Locale): string {
  return WEAKNESS[id][locale] ?? WEAKNESS[id].ru;
}

export const PLANS: Record<
  QuizResult["plan"],
  { title: Localized; desc: Localized; months: Localized; stages: Localized[] }
> = {
  beginner: {
    title: { ru: "С нуля до сертификата", en: "From zero to certificate", tr: "Sıfırdan sertifikaya", kk: "Нөлден сертификатқа" },
    desc: { ru: "6–12 месяцев · ~30 мин/день", en: "6–12 months · ~30 min/day", tr: "6–12 ay · ~30 dk/gün", kk: "6–12 ай · ~30 мин/күн" },
    months: { ru: "6–12 месяцев", en: "6–12 months", tr: "6–12 ay", kk: "6–12 ай" },
    stages: [
      { ru: "Месяц 1–2: Алфавит, базовая грамматика, 300 слов", en: "Month 1–2: Alphabet, basic grammar, 300 words", tr: "Ay 1–2: Alfabe, temel dil bilgisi, 300 kelime", kk: "1–2 ай: Әліппе, негізгі грамматика, 300 сөз" },
      { ru: "Месяц 3–4: Времена, падежи, 800 слов, простые тексты", en: "Month 3–4: Tenses, cases, 800 words, simple texts", tr: "Ay 3–4: Zamanlar, hâller, 800 kelime, basit metinler", kk: "3–4 ай: Шақтар, септіктер, 800 сөз, қарапайым мәтіндер" },
      { ru: "Месяц 5–8: Чтение статей, эссе, разговорная практика", en: "Month 5–8: Reading articles, essays, speaking practice", tr: "Ay 5–8: Makale okuma, kompozisyon, konuşma pratiği", kk: "5–8 ай: Мақала оқу, эссе, сөйлеу тәжірибесі" },
      { ru: "Месяц 9–12: Пробные TÖMER, шлифовка слабых зон", en: "Month 9–12: Mock TÖMER, polishing weak areas", tr: "Ay 9–12: Deneme TÖMER, zayıf alanları cilalama", kk: "9–12 ай: Сынақ TÖMER, әлсіз тұстарды жетілдіру" },
    ],
  },
  a2: {
    title: { ru: "Уверенная подготовка", en: "Confident preparation", tr: "Emin adımlarla hazırlık", kk: "Сенімді дайындық" },
    desc: { ru: "3–5 месяцев · ~45 мин/день", en: "3–5 months · ~45 min/day", tr: "3–5 ay · ~45 dk/gün", kk: "3–5 ай · ~45 мин/күн" },
    months: { ru: "3–5 месяцев", en: "3–5 months", tr: "3–5 ay", kk: "3–5 ай" },
    stages: [
      { ru: "Месяц 1: Закрыть пробелы в грамматике, словарь до 1500 слов", en: "Month 1: Close grammar gaps, vocabulary up to 1500 words", tr: "Ay 1: Dil bilgisi eksiklerini kapat, 1500 kelimeye çık", kk: "1 ай: Грамматика олқылықтарын жабу, сөздік 1500 сөзге дейін" },
      { ru: "Месяц 2–3: Чтение, аудирование, эссе по формату TÖMER", en: "Month 2–3: Reading, listening, TÖMER-format essays", tr: "Ay 2–3: Okuma, dinleme, TÖMER formatında kompozisyon", kk: "2–3 ай: Оқу, тыңдалым, TÖMER форматындағы эссе" },
      { ru: "Месяц 4–5: Пробные экзамены, интенсив по слабым зонам", en: "Month 4–5: Mock exams, intensive on weak areas", tr: "Ay 4–5: Deneme sınavları, zayıf alanlarda yoğunlaşma", kk: "4–5 ай: Сынақ емтихандар, әлсіз тұстарға интенсив" },
    ],
  },
  advanced: {
    title: { ru: "Финальный рывок", en: "Final sprint", tr: "Son düzlük", kk: "Соңғы серпіліс" },
    desc: { ru: "4–6 недель · ~60 мин/день", en: "4–6 weeks · ~60 min/day", tr: "4–6 hafta · ~60 dk/gün", kk: "4–6 апта · ~60 мин/күн" },
    months: { ru: "4–6 недель", en: "4–6 weeks", tr: "4–6 hafta", kk: "4–6 апта" },
    stages: [
      { ru: "Неделя 1–2: Пробный TÖMER, определить слабые зоны", en: "Week 1–2: Mock TÖMER, identify weak areas", tr: "Hafta 1–2: Deneme TÖMER, zayıf alanları belirle", kk: "1–2 апта: Сынақ TÖMER, әлсіз тұстарды анықтау" },
      { ru: "Неделя 3–4: Интенсив по слабым навыкам", en: "Week 3–4: Intensive on weak skills", tr: "Hafta 3–4: Zayıf becerilerde yoğunlaşma", kk: "3–4 апта: Әлсіз дағдыларға интенсив" },
      { ru: "Неделя 5–6: Финальные пробники, отработка тайминга", en: "Week 5–6: Final mocks, timing practice", tr: "Hafta 5–6: Son denemeler, zamanlama pratiği", kk: "5–6 апта: Қорытынды сынақтар, тайминг жаттығуы" },
    ],
  },
};
