/**
 * TÖMER (TDYS) diagnostic — 5 skill modules, ~20 minutes total.
 * Grammar + Vocabulary (MC), Reading (text + MC), Writing (free text, client
 * scoring) and Speaking (mic/text, client scoring). Each module yields a 0–100
 * score; the overall level is the honest average of the five.
 */

import type { Locale } from "./i18n";

export type Localized = Record<Locale, string>;
export type Level = "A0" | "A1" | "A2" | "B1" | "B2" | "C1";
export type ModuleId = "grammar" | "vocab" | "reading" | "writing" | "speaking";

export type MCQuestion = {
  level: Level;
  /** Turkish prompt, shown in every language */
  prompt: string;
  /** Meaning hint shown under the prompt for ru/en/kk (hidden for tr) */
  hint?: Localized;
  /** Short skill tag (e.g. "Present tense") */
  tag?: Localized;
  /** Turkish/universal options; ignored if `opts` is given */
  options?: string[];
  /** Locale-specific options (used for translation questions) */
  opts?: Record<Locale, string[]>;
  answer: number;
};

export type SpeakingPrompt = {
  level: Level;
  prompt: string;
  hint: Localized;
};

/* ----------------------------- Module content ----------------------------- */

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

export const WRITING = {
  prompt:
    "Türkiye'de hangi şehirde yaşamak istersiniz? Neden? Bu şehri neden seçtiniz? En az 5 cümle yazınız.",
  hint: {
    ru: "В каком городе Турции хотели бы жить? Почему? Напишите минимум 5 предложений.",
    en: "Which city in Turkey would you like to live in? Why? Write at least 5 sentences.",
    tr: "",
    kk: "Түркияның қай қаласында тұрғыңыз келеді? Неліктен? Кемінде 5 сөйлем жазыңыз.",
  } as Localized,
};

export const SPEAKING: SpeakingPrompt[] = [
  {
    level: "A1",
    prompt: "Bugün ne yediniz? Kahvaltıda ne vardı?",
    hint: { ru: "Что вы сегодня ели? Что было на завтрак?", en: "What did you eat today? What was for breakfast?", tr: "", kk: "Бүгін не жедіңіз? Таңғы асқа не болды?" },
  },
  {
    level: "A2",
    prompt: "Hafta sonu genellikle ne yapıyorsunuz? Bize anlatın.",
    hint: { ru: "Что обычно делаете на выходных? Расскажите.", en: "What do you usually do on weekends? Tell us.", tr: "", kk: "Демалыс күндері әдетте не істейсіз? Айтып беріңіз." },
  },
  {
    level: "B1",
    prompt: "Türkiye'de hangi şehirde yaşamak istersiniz? Neden?",
    hint: { ru: "В каком городе Турции хотели бы жить? Почему?", en: "Which city in Turkey would you like to live in? Why?", tr: "", kk: "Түркияның қай қаласында тұрғыңыз келеді? Неліктен?" },
  },
  {
    level: "B1",
    prompt: "Sizce online eğitim mi, geleneksel eğitim mi daha iyi? Nedenini açıklayın.",
    hint: { ru: "Онлайн или традиционное образование лучше? Объясните почему.", en: "Online or traditional education — which is better? Explain why.", tr: "", kk: "Онлайн оқу ма, дәстүрлі оқу ма? Себебін түсіндіріңіз." },
  },
  {
    level: "B2",
    prompt: "Ülkenizdeki bir problemi anlatın ve bu probleme çözüm öneriniz nedir?",
    hint: { ru: "Опишите проблему в вашей стране и предложите решение.", en: "Describe a problem in your country and suggest a solution.", tr: "", kk: "Еліңіздегі бір мәселені сипаттаңыз және оған шешім ұсыныңыз." },
  },
];

/* ------------------------------- Modules meta ------------------------------ */

export const MODULES: { id: ModuleId; emoji: string; name: Localized; minutes: number }[] = [
  { id: "grammar", emoji: "📝", name: { ru: "Грамматика", en: "Grammar", tr: "Dil bilgisi", kk: "Грамматика" }, minutes: 3 },
  { id: "vocab", emoji: "📚", name: { ru: "Лексика", en: "Vocabulary", tr: "Kelime", kk: "Лексика" }, minutes: 3 },
  { id: "reading", emoji: "📖", name: { ru: "Чтение", en: "Reading", tr: "Okuma", kk: "Оқу" }, minutes: 4 },
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

/** Percent of correct MC answers (each question weighed equally). */
export function scoreMC(answers: (number | null)[], questions: MCQuestion[]): number {
  const correct = questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
  return Math.round((correct / questions.length) * 100);
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Writing score from word count + small bonuses for punctuation / TR letters. */
export function scoreWriting(text: string): number {
  const words = countWords(text);
  let base: number;
  if (words <= 5) base = 10;
  else if (words <= 15) base = 30;
  else if (words <= 30) base = 50;
  else if (words <= 50) base = 70;
  else if (words <= 80) base = 85;
  else base = 95;

  let bonus = 0;
  if (/[.!?]/.test(text)) bonus += 5;
  if (/[A-ZÇĞİÖŞÜ]/.test(text)) bonus += 5;
  if (/[şçğıöüŞÇĞİÖÜ]/.test(text)) bonus += 5;

  return Math.min(100, base + bonus);
}

/** Score one spoken answer from its recognised word count (text fallback). */
export function scoreSpeakingAnswer(words: number): number {
  if (words <= 3) return 10;
  if (words <= 8) return 30;
  if (words <= 15) return 50;
  if (words <= 25) return 70;
  if (words <= 40) return 85;
  return 95;
}

/** Score one spoken answer from its recorded duration in seconds. */
export function scoreSpeakingDuration(seconds: number): number {
  if (seconds < 3) return 10;
  if (seconds < 8) return 30;
  if (seconds < 15) return 50;
  if (seconds < 25) return 70;
  if (seconds < 40) return 85;
  return 95;
}

/* -------------------------------- Result ---------------------------------- */

export type SkillScore = { id: ModuleId; percent: number; level: Level };

export type QuizResult = {
  level: Level;
  overall: number;
  predictedScore: number;
  skills: SkillScore[];
  strengths: ModuleId[];
  weaknesses: ModuleId[];
  /** Module ids sorted worst → best, for the detailed breakdown order */
  byWeakness: ModuleId[];
  plan: "beginner" | "a2" | "advanced";
  writingWords: number;
  takenAt: number;
};

/** Build the full result from each module's 0–100 score. */
export function computeResult(
  scores: Record<ModuleId, number>,
  extras?: { writingWords?: number },
): QuizResult {
  const skills: SkillScore[] = MODULES.map((m) => ({
    id: m.id,
    percent: Math.round(scores[m.id] ?? 0),
    level: levelFromScore(scores[m.id] ?? 0),
  }));

  const overall = Math.round(skills.reduce((s, k) => s + k.percent, 0) / skills.length);
  const level = levelFromScore(overall);

  const sorted = [...skills].sort((a, b) => b.percent - a.percent);
  const byWeakness = [...skills].sort((a, b) => a.percent - b.percent).map((s) => s.id);
  const strengths = sorted.filter((s) => s.percent >= 50).slice(0, 2).map((s) => s.id);
  const weaknesses = byWeakness.slice(0, 2);

  const plan: QuizResult["plan"] =
    overall < 30 ? "beginner" : overall <= 60 ? "a2" : "advanced";

  return {
    level,
    overall,
    predictedScore: Math.round(40 + overall * 0.55),
    skills,
    strengths: strengths.length ? strengths : [sorted[0].id],
    weaknesses,
    byWeakness,
    plan,
    writingWords: extras?.writingWords ?? 0,
    takenAt: Date.now(),
  };
}

export const LEVEL_ORDER: Level[] = ["A0", "A1", "A2", "B1", "B2", "C1"];
export function levelIndex(level: Level): number {
  return Math.max(0, LEVEL_ORDER.indexOf(level));
}

const RESULT_KEY = "lingopro:quizResult";

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
    return raw ? (JSON.parse(raw) as QuizResult) : null;
  } catch {
    return null;
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
  // timeline
  tl1: { ru: "Через 1 месяц", en: "In 1 month", tr: "1 ay içinde", kk: "1 айдан кейін" },
  tl3: { ru: "Через 3 месяца", en: "In 3 months", tr: "3 ay içinde", kk: "3 айдан кейін" },
  tl6: { ru: "Через 6 месяцев", en: "In 6 months", tr: "6 ay içinde", kk: "6 айдан кейін" },
  tlOpen: { ru: "Пока не решил", en: "Not decided yet", tr: "Henüz kararsızım", kk: "Әлі шешкен жоқпын" },
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
  compareTitle: { ru: "Как ты выглядишь на фоне других", en: "How you compare to others", tr: "Diğerlerine göre durumun", kk: "Басқалармен салыстырғанда" },
  youHere: { ru: "Ты здесь", en: "You", tr: "Sen", kk: "Сен" },
  avgStudent: { ru: "Средний студент", en: "Average student", tr: "Ortalama öğrenci", kk: "Орташа студент" },
  neededFor: { ru: "Нужно для", en: "Needed for", tr: "Gereken:", kk: "Қажет:" },
  compareNote: {
    ru: "68% студентов начинают с похожего уровня и достигают C1 за 4 месяца подготовки",
    en: "68% of students start at a similar level and reach C1 within 4 months of prep",
    tr: "Öğrencilerin %68'i benzer seviyeden başlayıp 4 ayda C1'e ulaşıyor",
    kk: "Студенттердің 68%-ы ұқсас деңгейден бастап, 4 айда C1-ге жетеді",
  },
  // CTA note
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
  writing: { ru: "Письмо — складно строишь предложения", en: "Writing — coherent sentences", tr: "Yazma — tutarlı cümleler", kk: "Жазу — сөйлемдерді жатық құрасың" },
  speaking: { ru: "Говорение — уверенно отвечаешь устно", en: "Speaking — confident spoken answers", tr: "Konuşma — akıcı sözlü cevaplar", kk: "Сөйлеу — ауызша сенімді жауап бересің" },
};

const WEAKNESS: Record<ModuleId, Localized> = {
  grammar: { ru: "Грамматика — повтори времена и падежные окончания", en: "Grammar — review tenses and case endings", tr: "Dil bilgisi — zaman ve hâl eklerini tekrar et", kk: "Грамматика — шақтар мен септіктерді қайтала" },
  vocab: { ru: "Лексика — расширяй активный словарь", en: "Vocabulary — grow your active vocabulary", tr: "Kelime — kelime dağarcığını genişlet", kk: "Лексика — белсенді сөздігіңді кеңейт" },
  reading: { ru: "Чтение — тренируй понимание текстов", en: "Reading — practise comprehension", tr: "Okuma — anlama pratiği yap", kk: "Оқу — мәтінді түсінуді жаттық" },
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

/* ---------------------- Per-module detailed analysis ---------------------- */
export type AnalysisBlock = {
  knows: Localized[];
  gaps: Localized[];
  todo: Localized[];
  progress: Localized;
};

export const ANALYSIS: Record<ModuleId, AnalysisBlock> = {
  grammar: {
    knows: [
      { ru: "Настоящее время (-yor) — правильно", en: "Present tense (-yor) — correct", tr: "Şimdiki zaman (-yor) — doğru", kk: "Осы шақ (-yor) — дұрыс" },
      { ru: "Прошедшее время (-di) — правильно", en: "Past tense (-di) — correct", tr: "Görülen geçmiş zaman (-di) — doğru", kk: "Өткен шақ (-di) — дұрыс" },
    ],
    gaps: [
      { ru: "Суффиксы падежей (-den, -ten, -e, -a) — путаешь исходный и дательный падежи. Одна из самых частых ошибок на TÖMER.", en: "Case suffixes (-den, -ten, -e, -a) — you confuse the ablative and dative. One of the most common TÖMER mistakes.", tr: "Hâl ekleri (-den, -ten, -e, -a) — ayrılma ve yönelme hâlini karıştırıyorsun. TÖMER'de en sık yapılan hatalardan.", kk: "Септік жалғаулары (-den, -ten, -e, -a) — шығыс пен барыс септігін шатастырасың. TÖMER-дегі ең жиі қателердің бірі." },
      { ru: "Косвенная речь (göre, -miş) — нужно разобрать конструкции пересказа.", en: "Reported speech (göre, -miş) — you need to study retelling constructions.", tr: "Dolaylı anlatım (göre, -miş) — aktarma yapılarını çalışman gerek.", kk: "Жанама сөз (göre, -miş) — баяндау құрылымдарын талдау керек." },
    ],
    todo: [
      { ru: "Пройди тему «Падежи в турецком» — 3 урока", en: "Study the “Turkish cases” topic — 3 lessons", tr: "«Türkçe hâller» konusunu çalış — 3 ders", kk: "«Түрік септіктері» тақырыбын өт — 3 сабақ" },
      { ru: "Сделай 20 упражнений на суффиксы", en: "Do 20 suffix exercises", tr: "20 ek alıştırması yap", kk: "Жалғауларға 20 жаттығу жаса" },
    ],
    progress: { ru: "Ожидаемый прогресс: +15% за 2 недели", en: "Expected progress: +15% in 2 weeks", tr: "Beklenen ilerleme: 2 haftada +%15", kk: "Күтілетін ілгерілеу: 2 аптада +15%" },
  },
  vocab: {
    knows: [
      { ru: "Базовые слова (A1–A2) — хорошая база", en: "Basic words (A1–A2) — a good base", tr: "Temel kelimeler (A1–A2) — iyi bir temel", kk: "Негізгі сөздер (A1–A2) — жақсы база" },
      { ru: "Дни недели, еда, бытовые слова", en: "Days of the week, food, everyday words", tr: "Haftanın günleri, yemek, günlük kelimeler", kk: "Апта күндері, тамақ, тұрмыстық сөздер" },
    ],
    gaps: [
      { ru: "Абстрактная лексика (başvuru, karar) — не хватает словаря уровня B1+", en: "Abstract vocabulary (başvuru, karar) — missing B1+ level words", tr: "Soyut kelimeler (başvuru, karar) — B1+ seviye kelime eksik", kk: "Абстрактты лексика (başvuru, karar) — B1+ деңгейіндегі сөздер жетіспейді" },
      { ru: "Идиомы и устойчивые выражения — часто встречаются в секции чтения TÖMER", en: "Idioms and set phrases — common in the TÖMER reading section", tr: "Deyimler ve kalıp ifadeler — TÖMER okuma bölümünde sık çıkar", kk: "Идиомалар мен тұрақты тіркестер — TÖMER оқу бөлімінде жиі кездеседі" },
    ],
    todo: [
      { ru: "Учи 15 новых слов в день по карточкам", en: "Learn 15 new words a day with flashcards", tr: "Kartlarla günde 15 yeni kelime öğren", kk: "Карточкамен күніне 15 жаңа сөз үйрен" },
      { ru: "Фокус: слова уровня B1 из топ-500", en: "Focus: B1-level words from the top 500", tr: "Odak: top-500 içindeki B1 seviye kelimeler", kk: "Назар: топ-500 ішіндегі B1 деңгейлі сөздер" },
    ],
    progress: { ru: "Ожидаемый прогресс: +20% за 3 недели", en: "Expected progress: +20% in 3 weeks", tr: "Beklenen ilerleme: 3 haftada +%20", kk: "Күтілетін ілгерілеу: 3 аптада +20%" },
  },
  reading: {
    knows: [
      { ru: "Понимание основной мысли текста", en: "Grasping the main idea of a text", tr: "Metnin ana fikrini anlama", kk: "Мәтіннің негізгі ойын түсіну" },
      { ru: "Поиск конкретной информации", en: "Finding specific information", tr: "Belirli bilgiyi bulma", kk: "Нақты ақпаратты табу" },
    ],
    gaps: [
      { ru: "Интерпретация — не можешь определить скрытый смысл выражений", en: "Interpretation — you miss the hidden meaning of phrases", tr: "Yorumlama — ifadelerin gizli anlamını yakalayamıyorsun", kk: "Интерпретация — тіркестердің астарлы мағынасын аша алмайсың" },
      { ru: "Сложные конструкции — теряешься в длинных предложениях с причастными оборотами", en: "Complex structures — you get lost in long sentences with participle clauses", tr: "Karmaşık yapılar — ortaçlı uzun cümlelerde kayboluyorsun", kk: "Күрделі құрылымдар — есімшелі ұзын сөйлемдерде шатасасың" },
    ],
    todo: [
      { ru: "Читай 1 статью на турецком в день", en: "Read 1 Turkish article a day", tr: "Günde 1 Türkçe makale oku", kk: "Күніне 1 түрік мақаласын оқы" },
      { ru: "После прочтения отвечай на 3 вопроса по содержанию", en: "After reading, answer 3 comprehension questions", tr: "Okuduktan sonra 3 anlama sorusu cevapla", kk: "Оқығаннан кейін 3 мазмұндық сұраққа жауап бер" },
    ],
    progress: { ru: "Ожидаемый прогресс: +10% за 2 недели", en: "Expected progress: +10% in 2 weeks", tr: "Beklenen ilerleme: 2 haftada +%10", kk: "Күтілетін ілгерілеу: 2 аптада +10%" },
  },
  writing: {
    knows: [
      { ru: "Можешь составить простые предложения", en: "You can form simple sentences", tr: "Basit cümleler kurabiliyorsun", kk: "Қарапайым сөйлемдер құра аласың" },
      { ru: "Используешь базовую структуру", en: "You use a basic structure", tr: "Temel yapıyı kullanıyorsun", kk: "Негізгі құрылымды қолданасың" },
    ],
    gaps: [
      { ru: "Объём — для TÖMER нужно минимум 250 слов, ты написал {words} слов", en: "Length — TÖMER needs at least 250 words; you wrote {words}", tr: "Uzunluk — TÖMER en az 250 kelime ister; sen {words} kelime yazdın", kk: "Көлем — TÖMER үшін кемінде 250 сөз қажет, сен {words} сөз жаздың" },
      { ru: "Структура эссе — введение, аргументы, заключение", en: "Essay structure — intro, arguments, conclusion", tr: "Kompozisyon yapısı — giriş, gelişme, sonuç", kk: "Эссе құрылымы — кіріспе, дәйектер, қорытынды" },
      { ru: "Связующие слова (çünkü, ancak, ayrıca, bu nedenle) — не используешь", en: "Linking words (çünkü, ancak, ayrıca, bu nedenle) — you don't use them", tr: "Bağlaçlar (çünkü, ancak, ayrıca, bu nedenle) — kullanmıyorsun", kk: "Жалғаулық сөздер (çünkü, ancak, ayrıca, bu nedenle) — қолданбайсың" },
    ],
    todo: [
      { ru: "Пиши 1 мини-эссе в день (100+ слов)", en: "Write 1 mini-essay a day (100+ words)", tr: "Günde 1 mini kompozisyon yaz (100+ kelime)", kk: "Күніне 1 шағын эссе жаз (100+ сөз)" },
      { ru: "Используй шаблон: тезис → 2 аргумента → вывод", en: "Use the template: thesis → 2 arguments → conclusion", tr: "Şablon kullan: tez → 2 argüman → sonuç", kk: "Үлгіні қолдан: тезис → 2 дәйек → қорытынды" },
      { ru: "Выучи 10 связующих слов", en: "Learn 10 linking words", tr: "10 bağlaç öğren", kk: "10 жалғаулық сөз үйрен" },
    ],
    progress: { ru: "Ожидаемый прогресс: +25% за 3 недели", en: "Expected progress: +25% in 3 weeks", tr: "Beklenen ilerleme: 3 haftada +%25", kk: "Күтілетін ілгерілеу: 3 аптада +25%" },
  },
  speaking: {
    knows: [
      { ru: "Можешь отвечать на простые вопросы", en: "You can answer simple questions", tr: "Basit sorulara cevap verebiliyorsun", kk: "Қарапайым сұрақтарға жауап бере аласың" },
      { ru: "Базовое произношение понятно", en: "Your basic pronunciation is clear", tr: "Temel telaffuzun anlaşılır", kk: "Негізгі айтылымың түсінікті" },
    ],
    gaps: [
      { ru: "Длина ответов — на TÖMER нужно говорить 1–2 минуты на каждый вопрос", en: "Answer length — TÖMER expects 1–2 minutes per question", tr: "Cevap uzunluğu — TÖMER her soru için 1–2 dakika ister", kk: "Жауап ұзақтығы — TÖMER әр сұраққа 1–2 минут талап етеді" },
      { ru: "Аргументация — не объясняешь «почему»", en: "Reasoning — you don't explain “why”", tr: "Gerekçelendirme — «neden» açıklamıyorsun", kk: "Дәйектеу — «неге» екенін түсіндірмейсің" },
      { ru: "Сложная лексика в речи — используешь только базовые слова", en: "Advanced vocabulary in speech — you use only basic words", tr: "Konuşmada ileri kelime — sadece temel kelimeler kullanıyorsun", kk: "Сөйлеудегі күрделі лексика — тек негізгі сөздерді қолданасың" },
    ],
    todo: [
      { ru: "Говори вслух 10 минут в день на турецком", en: "Speak Turkish out loud 10 minutes a day", tr: "Günde 10 dakika sesli Türkçe konuş", kk: "Күніне 10 минут түрікше дауыстап сөйле" },
      { ru: "Отвечай: ответ → объясни почему → приведи пример", en: "Answer: response → explain why → give an example", tr: "Cevapla: cevap → nedenini açıkla → örnek ver", kk: "Жауап бер: жауап → себебін түсіндір → мысал келтір" },
      { ru: "Записывай себя и слушай", en: "Record yourself and listen back", tr: "Kendini kaydet ve dinle", kk: "Өзіңді жазып ал да тыңда" },
    ],
    progress: { ru: "Ожидаемый прогресс: +15% за 4 недели", en: "Expected progress: +15% in 4 weeks", tr: "Beklenen ilerleme: 4 haftada +%15", kk: "Күтілетін ілгерілеу: 4 аптада +15%" },
  },
};
