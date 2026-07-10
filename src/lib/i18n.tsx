"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const LOCALES = ["en", "ru", "tr", "kk"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, { native: string; flag: string }> = {
  ru: { native: "Русский", flag: "🇷🇺" },
  kk: { native: "Қазақша", flag: "🇰🇿" },
  en: { native: "English", flag: "🇬🇧" },
  tr: { native: "Türkçe", flag: "🇹🇷" },
};

/* ------------------------------------------------------------------ */
/* Russian is the source of truth; other locales must match its shape  */
/* ------------------------------------------------------------------ */

const ru = {
  nav: {
    features: "Возможности",
    how: "Как это работает",
    pricing: "Тарифы",
    faq: "Вопросы",
    login: "Войти",
    signup: "Регистрация",
    cta: "Диагностика",
  },
  hero: {
    badge: "AI-подготовка к языковым экзаменам",
    titleLead: "Подготовься к",
    titleHi: "TÖMER",
    titleTail: "с персональным AI-преподавателем",
    subtitle:
      "Пройди диагностику уровня, получи честный план под твою цель и дату экзамена — программа ежедневно адаптируется под твой прогресс.",
    primary: "Пройти бесплатную диагностику",
    secondary: "Посмотреть, как это работает",
    stats: [
      { value: "Честный план", label: "под твою цель и дату экзамена" },
      { value: "AI 24/7", label: "преподаватель всегда на связи" },
      { value: "TÖMER", label: "турецкий язык — уже доступно" },
    ],
    orbCurrent: "Турецкий · TÖMER",
    orbHint: "Двигай мышью",
  },
  exams: {
    title: "Языки и экзамены",
    subtitle:
      "Начинаем с турецкого и экзамена TÖMER. Остальные направления готовим к запуску.",
    available: "Доступно сейчас",
    soon: "Скоро",
    items: [
      { lang: "Турецкий", exam: "TÖMER", status: "available" },
      { lang: "Корейский", exam: "TOPIK", status: "soon" },
      { lang: "Китайский", exam: "HSK", status: "soon" },
      { lang: "Японский", exam: "JLPT", status: "soon" },
    ],
  },
  how: {
    title: "Как это работает",
    subtitle: "Три шага от диагностики до уверенной сдачи экзамена.",
    steps: [
      {
        n: "01",
        title: "Диагностика уровня",
        text: "AI оценивает твои навыки чтения, аудирования, лексики и грамматики и определяет точку старта.",
      },
      {
        n: "02",
        title: "Честный план",
        text: "Получаешь план под твою цель и дату экзамена: ежедневные задачи и реальный срок — без обещаний «C1 за месяц».",
      },
      {
        n: "03",
        title: "Занятия с AI-преподавателем",
        text: "Ahu объясняет, тренирует Speaking и Writing и каждый день перестраивает план под твои результаты: слабое подтягивается, сильное закрепляется.",
      },
    ],
  },
  features: {
    title: "Всё для подготовки в одной платформе",
    subtitle:
      "AI-инструменты закрывают каждый навык, который проверяет экзамен — от грамматики до произношения.",
    items: [
      {
        tag: "Диагностика",
        title: "AI-диагностика уровня языка",
        text: "Быстрый адаптивный тест определяет твой реальный уровень по навыкам и строит карту пробелов.",
      },
      {
        tag: "Преподаватель",
        title: "AI-преподаватель",
        text: "Объясняет правила, отвечает на вопросы и ведёт тебя по программе как личный наставник 24/7.",
      },
      {
        tag: "Speaking",
        title: "Разговорная практика и анализ произношения",
        text: "Говори вслух, а AI оценивает беглость, интонацию и произношение и подсказывает, что улучшить.",
      },
      {
        tag: "Writing",
        title: "Проверка письменных заданий",
        text: "Сдаёшь эссе и письма — получаешь разбор по критериям экзамена с конкретными правками.",
      },
      {
        tag: "Mock",
        title: "Пробный экзамен TÖMER",
        text: "Полный пробник в формате экзамена с таймером, секциями и подробным разбором результата.",
      },
      {
        tag: "Дисциплина",
        title: "AI-ментор для дисциплины",
        text: "Следит за расписанием, напоминает о занятиях и помогает не сходить с дистанции.",
      },
      {
        tag: "Мотивация",
        title: "Помощник по мотивации и снижению стресса",
        text: "Поддерживает в трудные дни и помогает справиться с экзаменационным волнением.",
      },
    ],
  },
  plan: {
    title: "Персональный план подготовки",
    subtitle:
      "Выбери срок — система рассчитает ежедневную нагрузку под твою цель и текущий уровень.",
    durations: [
      { id: "30", label: "30 дней", desc: "Интенсив перед экзаменом" },
      { id: "60", label: "60 дней", desc: "Сбалансированный темп" },
      { id: "90", label: "90 дней", desc: "Спокойная глубокая подготовка" },
    ],
    bullets: [
      "Ежедневные задачи по чтению, аудированию, лексике и грамматике",
      "Автоматическая корректировка плана по результатам",
      "Контроль прогресса по каждому навыку",
      "Чёткая цель на каждую неделю до экзамена",
    ],
    metricLoad: "Нагрузка в день",
    metricFocus: "Фокус недели",
    focusValue: "Грамматика и аудирование",
  },
  leaderboard: {
    title: "Рейтинг студентов",
    subtitle:
      "Сравнивай прогресс с другими — по личным очкам, городу и стране. Здоровая конкуренция помогает держать темп.",
    tabs: [
      { id: "progress", label: "По прогрессу" },
      { id: "city", label: "По городу" },
      { id: "country", label: "По стране" },
    ],
    you: "Это ты",
    xp: "XP",
    note: "Данные на иллюстрации — пример того, как выглядит рейтинг.",
  },
  gamification: {
    title: "XP, уровни и достижения",
    subtitle:
      "Каждое занятие приносит очки. Серии дней, уровни и лиги превращают подготовку в привычку.",
    cards: [
      { title: "Очки опыта (XP)", text: "Начисляются за уроки, практику и пробники." },
      { title: "Уровни", text: "Растут вместе с твоими навыками и объёмом работы." },
      { title: "Достижения", text: "Награды за важные шаги и личные рекорды." },
      { title: "Серии дней", text: "Держи streak — занимайся каждый день без пропусков." },
      { title: "Лиги", text: "Поднимайся в более сильные лиги вместе с другими." },
    ],
    streakLabel: "Серия",
    streakDays: "дней подряд",
    levelLabel: "Уровень",
    leagueLabel: "Лига",
    leagueValue: "Сапфировая",
  },
  certificates: {
    title: "Студенты нашей методики — с сертификатами TÖMER",
    subtitle: "Реальные сертификаты студентов нашей онлайн-школы языковых курсов Language PRO. Теперь эта методика — в платформе.",
    certWord: "Сертификат",
    studentWord: "Студент",
    levelWord: "Уровень",
  },
  dashboard: {
    title: "Твой личный кабинет",
    subtitle:
      "Весь прогресс, рекомендации и следующее занятие — на одном экране.",
    progressTitle: "Готовность к экзамену",
    skills: [
      { name: "Чтение", value: 72 },
      { name: "Аудирование", value: 58 },
      { name: "Лексика", value: 81 },
      { name: "Грамматика", value: 64 },
    ],
    recoTitle: "Рекомендации на сегодня",
    reco: [
      "Повторить 12 слов из вчерашнего урока",
      "Пройти аудирование: диалоги уровня A2",
      "Сдать письменное задание на проверку",
    ],
    nextLesson: "Следующее занятие",
    nextLessonValue: "Грамматика · падежи",
    daysLeft: "до экзамена",
    daysLeftValue: "47 дней",
  },
  pricing: {
    title: "Тарифы",
    subtitle: "Начни бесплатно. Переходи на платный тариф, когда будешь готов ускориться.",
    period: "/ мес",
    popular: "Популярный",
    cta: "Выбрать",
    ctaFree: "Начать бесплатно",
    plans: [
      {
        id: "free",
        name: "Free",
        price: "0 ₽",
        desc: "Чтобы попробовать и пройти диагностику.",
        features: [
          "AI-диагностика уровня",
          "Ограниченные ежедневные задачи",
          "Базовый прогресс и XP",
        ],
      },
      {
        id: "premium",
        name: "Premium",
        price: "1 490 ₽",
        desc: "Полноценная подготовка с адаптивным планом.",
        features: [
          "Персональный план под твою цель",
          "AI-преподаватель 24/7",
          "Разговорная практика и анализ произношения",
          "Проверка письменных заданий",
        ],
      },
      {
        id: "pro",
        name: "Pro",
        price: "2 990 ₽",
        desc: "Максимум возможностей и пробные экзамены.",
        features: [
          "Всё из Premium",
          "Безлимитные пробные экзамены TÖMER",
          "AI-ментор дисциплины и мотивации",
          "Приоритетная скорость проверки",
        ],
      },
    ],
  },
  faq: {
    title: "Частые вопросы",
    subtitle: "Не нашёл ответ — напиши нам, поможем разобраться.",
    items: [
      {
        q: "Какие языки и экзамены доступны сейчас?",
        a: "Сейчас доступен турецкий язык и подготовка к экзамену TÖMER. TOPIK, HSK, JLPT и другие направления готовятся к запуску.",
      },
      {
        q: "Как работает диагностика уровня?",
        a: "Это короткий адаптивный тест: AI оценивает твои навыки и определяет точку старта, чтобы построить персональный план.",
      },
      {
        q: "Чем отличаются планы на 30, 60 и 90 дней?",
        a: "Сроком и ежедневной нагрузкой. Чем меньше срок — тем интенсивнее программа. Система сама рассчитывает темп под твою цель.",
      },
      {
        q: "Связан ли LingoPRO с TÖMER официально?",
        a: "Нет. LingoPRO не аффилирован с TÖMER — мы готовим к экзамену по его открытому формату и критериям оценки.",
      },
      {
        q: "Можно ли пользоваться бесплатно?",
        a: "Да. Тариф Free позволяет пройти диагностику и попробовать платформу. Расширенные возможности — на Premium и Pro.",
      },
    ],
  },
  finalCta: {
    title: "Начни с бесплатной диагностики",
    subtitle:
      "Узнай свой уровень за несколько минут и получи первый персональный план подготовки к TÖMER.",
    primary: "Пройти бесплатную диагностику",
    secondary: "Создать аккаунт",
  },
  footer: {
    tagline: "AI-платформа подготовки к международным языковым экзаменам.",
    product: "Продукт",
    company: "Компания",
    legal: "Правовое",
    links: {
      features: "Возможности",
      pricing: "Тарифы",
      diagnostic: "Диагностика",
      faq: "Вопросы",
      about: "О нас",
      contact: "Контакты",
      privacy: "Конфиденциальность",
      terms: "Условия",
    },
    rights: "Все права защищены.",
    disclaimer:
      "LingoPRO — независимая платформа подготовки, не аффилированная с TÖMER. Названия экзаменов принадлежат соответствующим правообладателям.",
  },
  pages: {
    back: "На главную",
    diagnostic: {
      title: "Бесплатная диагностика уровня",
      subtitle:
        "Ответь на несколько вопросов — AI оценит уровень и предложит персональный план. Демо-версия флоу.",
      start: "Начать диагностику",
      question: "Вопрос",
      of: "из",
      next: "Далее",
      finish: "Завершить",
      doneTitle: "Диагностика пройдена",
      doneText:
        "В полной версии здесь появится твой уровень и персональный план. Создай аккаунт, чтобы сохранить результат.",
      createAccount: "Создать аккаунт",
    },
    signup: {
      title: "Создать аккаунт",
      subtitle: "Начни подготовку к TÖMER с персональным AI-преподавателем.",
      name: "Имя",
      email: "Email",
      password: "Пароль",
      submit: "Зарегистрироваться",
      haveAccount: "Уже есть аккаунт?",
      login: "Войти",
      demo: "Это демо-форма — данные никуда не отправляются.",
    },
    login: {
      title: "С возвращением",
      subtitle: "Войди, чтобы продолжить подготовку.",
      email: "Email",
      password: "Пароль",
      submit: "Войти",
      noAccount: "Нет аккаунта?",
      signup: "Регистрация",
      demo: "Это демо-форма — данные никуда не отправляются.",
    },
    b2b: {
      title: "LingoPRO для языковых школ и компаний",
      subtitle: "Подготовьте ваших студентов к международным языковым экзаменам с помощью AI-платформы",
      benefitAccessTitle: "Групповой доступ",
      benefitAccessText: "Управление аккаунтами студентов из одной панели",
      benefitAnalyticsTitle: "Аналитика прогресса",
      benefitAnalyticsText: "Отслеживание результатов и активности каждого студента",
      benefitPlansTitle: "Гибкие тарифы",
      benefitPlansText: "Специальные условия для школ от 10 студентов",
      formTitle: "Оставить заявку",
      school: "Название школы",
      schoolPh: "Например: Lingua Center",
      contact: "Имя контактного лица",
      contactPh: "Имя и фамилия",
      email: "Email",
      phone: "Телефон",
      students: "Количество студентов",
      submit: "Оставить заявку",
      sending: "Отправляем…",
      errRequired: "Заполните название школы и имя контактного лица.",
      errEmail: "Введите корректный email.",
      success: "Спасибо! Мы свяжемся с вами в течение 24 часов.",
    },
  },
};

export type Dict = typeof ru;

/* ------------------------------------------------------------------ */

const kk: Dict = {
  nav: {
    features: "Мүмкіндіктер",
    how: "Қалай жұмыс істейді",
    pricing: "Тарифтер",
    faq: "Сұрақтар",
    login: "Кіру",
    signup: "Тіркелу",
    cta: "Диагностика",
  },
  hero: {
    badge: "Тіл емтихандарына AI-дайындық",
    titleLead: "Дайындал:",
    titleHi: "TÖMER",
    titleTail: "жеке AI-оқытушымен",
    subtitle:
      "Деңгей диагностикасынан өт, мақсатың мен емтихан күніне сай адал жоспар ал — бағдарлама прогресіңе күн сайын бейімделеді.",
    primary: "Тегін диагностикадан өту",
    secondary: "Қалай жұмыс істейтінін көру",
    stats: [
      { value: "Адал жоспар", label: "мақсатың мен күніңе сай" },
      { value: "AI 24/7", label: "оқытушы әрқашан желіде" },
      { value: "TÖMER", label: "түрік тілі — қазірдің өзінде" },
    ],
    orbCurrent: "Түрік · TÖMER",
    orbHint: "Тінтуірді қозғал",
  },
  exams: {
    title: "Тілдер мен емтихандар",
    subtitle:
      "Түрік тілі мен TÖMER емтиханынан бастаймыз. Қалған бағыттарды іске қосуға дайындап жатырмыз.",
    available: "Қазір қолжетімді",
    soon: "Жақында",
    items: [
      { lang: "Түрік", exam: "TÖMER", status: "available" },
      { lang: "Корей", exam: "TOPIK", status: "soon" },
      { lang: "Қытай", exam: "HSK", status: "soon" },
      { lang: "Жапон", exam: "JLPT", status: "soon" },
    ],
  },
  how: {
    title: "Қалай жұмыс істейді",
    subtitle: "Диагностикадан сенімді тапсыруға дейін үш қадам.",
    steps: [
      {
        n: "01",
        title: "Деңгей диагностикасы",
        text: "AI оқу, тыңдалым, лексика мен грамматика дағдыларыңды бағалап, бастау нүктесін анықтайды.",
      },
      {
        n: "02",
        title: "Адал жоспар",
        text: "Мақсатың мен емтихан күніне сай жоспар аласың: күнделікті тапсырмалар және нақты мерзім — «бір айда C1» деген уәдесіз.",
      },
      {
        n: "03",
        title: "AI-мұғаліммен сабақтар",
        text: "Ahu түсіндіреді, Speaking пен Writing-ті жаттықтырады және жоспарды күн сайын нәтижеңе қарай қайта құрады: әлсізі күшейтіледі, мықтысы бекітіледі.",
      },
    ],
  },
  features: {
    title: "Дайындыққа қажеттінің бәрі бір платформада",
    subtitle:
      "AI-құралдар емтихан тексеретін әр дағдыны қамтиды — грамматикадан айтылымға дейін.",
    items: [
      {
        tag: "Диагностика",
        title: "AI тіл деңгейінің диагностикасы",
        text: "Жылдам бейімделгіш тест нақты деңгейіңді анықтап, олқылықтар картасын құрады.",
      },
      {
        tag: "Оқытушы",
        title: "AI-оқытушы",
        text: "Ережелерді түсіндіреді, сұрақтарға жауап береді және бағдарлама бойынша 24/7 жетелейді.",
      },
      {
        tag: "Speaking",
        title: "Сөйлеу практикасы және айтылым талдауы",
        text: "Дауыстап сөйле, ал AI еркіндік пен айтылымды бағалап, нені жақсартуды ұсынады.",
      },
      {
        tag: "Writing",
        title: "Жазба тапсырмаларын тексеру",
        text: "Эссе мен хат тапсыр — емтихан критерийлері бойынша нақты түзетулермен талдау ал.",
      },
      {
        tag: "Mock",
        title: "TÖMER сынақ емтиханы",
        text: "Таймері, бөлімдері және толық талдауы бар емтихан форматындағы толық сынақ.",
      },
      {
        tag: "Тәртіп",
        title: "Тәртіпке арналған AI-ментор",
        text: "Кестені бақылайды, сабақтарды еске салады және жолдан таймауға көмектеседі.",
      },
      {
        tag: "Мотивация",
        title: "Мотивация мен стресті азайту көмекшісі",
        text: "Қиын күндерде қолдайды және емтихан алаңдаушылығын жеңуге көмектеседі.",
      },
    ],
  },
  plan: {
    title: "Жеке дайындық жоспары",
    subtitle:
      "Мерзімді таңда — жүйе мақсатың мен деңгейіңе сай күнделікті жүктемені есептейді.",
    durations: [
      { id: "30", label: "30 күн", desc: "Емтихан алдындағы интенсив" },
      { id: "60", label: "60 күн", desc: "Теңгерімді қарқын" },
      { id: "90", label: "90 күн", desc: "Тыныш әрі терең дайындық" },
    ],
    bullets: [
      "Оқу, тыңдалым, лексика мен грамматика бойынша күнделікті тапсырмалар",
      "Нәтижеге қарай жоспарды автоматты түрде түзету",
      "Әр дағды бойынша прогресті бақылау",
      "Емтиханға дейінгі әр аптаға нақты мақсат",
    ],
    metricLoad: "Күндік жүктеме",
    metricFocus: "Апта фокусы",
    focusValue: "Грамматика мен тыңдалым",
  },
  leaderboard: {
    title: "Студенттер рейтингі",
    subtitle:
      "Прогресіңді басқалармен салыстыр — жеке ұпай, қала және ел бойынша. Дені сау бәсеке қарқынды ұстауға көмектеседі.",
    tabs: [
      { id: "progress", label: "Прогресс бойынша" },
      { id: "city", label: "Қала бойынша" },
      { id: "country", label: "Ел бойынша" },
    ],
    you: "Бұл сенсің",
    xp: "XP",
    note: "Иллюстрациядағы деректер — рейтингтің көрінісінің мысалы.",
  },
  gamification: {
    title: "XP, деңгейлер және жетістіктер",
    subtitle:
      "Әр сабақ ұпай әкеледі. Күндер сериясы, деңгейлер мен лигалар дайындықты әдетке айналдырады.",
    cards: [
      { title: "Тәжірибе ұпайы (XP)", text: "Сабақ, практика мен сынақ үшін есептеледі." },
      { title: "Деңгейлер", text: "Дағдың мен жұмыс көлеміне қарай өседі." },
      { title: "Жетістіктер", text: "Маңызды қадамдар мен жеке рекордтар үшін марапат." },
      { title: "Күндер сериясы", text: "Streak ұста — күн сайын үзіліссіз дайындал." },
      { title: "Лигалар", text: "Басқалармен бірге күштірек лигаларға көтеріл." },
    ],
    streakLabel: "Серия",
    streakDays: "күн қатарынан",
    levelLabel: "Деңгей",
    leagueLabel: "Лига",
    leagueValue: "Сапфир",
  },
  certificates: {
    title: "Біздің әдістеменің студенттері — TÖMER сертификаттарымен",
    subtitle: "Тіл курстарының онлайн мектебі Language PRO студенттерінің нақты сертификаттары. Енді осы әдістеме — платформада.",
    certWord: "Сертификат",
    studentWord: "Студент",
    levelWord: "Деңгей",
  },
  dashboard: {
    title: "Сенің жеке кабинетің",
    subtitle: "Бүкіл прогресс, ұсыныстар мен келесі сабақ — бір экранда.",
    progressTitle: "Емтиханға дайындық",
    skills: [
      { name: "Оқу", value: 72 },
      { name: "Тыңдалым", value: 58 },
      { name: "Лексика", value: 81 },
      { name: "Грамматика", value: 64 },
    ],
    recoTitle: "Бүгінге ұсыныстар",
    reco: [
      "Кешегі сабақтан 12 сөзді қайтала",
      "Тыңдалымнан өт: A2 деңгейіндегі диалогтар",
      "Жазба тапсырманы тексеруге тапсыр",
    ],
    nextLesson: "Келесі сабақ",
    nextLessonValue: "Грамматика · септіктер",
    daysLeft: "емтиханға дейін",
    daysLeftValue: "47 күн",
  },
  pricing: {
    title: "Тарифтер",
    subtitle: "Тегін баста. Жылдамдатуға дайын болғанда ақылы тарифке көш.",
    period: "/ ай",
    popular: "Танымал",
    cta: "Таңдау",
    ctaFree: "Тегін бастау",
    plans: [
      {
        id: "free",
        name: "Free",
        price: "0 ₸",
        desc: "Көру және диагностикадан өту үшін.",
        features: [
          "AI деңгей диагностикасы",
          "Шектеулі күнделікті тапсырмалар",
          "Базалық прогресс пен XP",
        ],
      },
      {
        id: "premium",
        name: "Premium",
        price: "7 900 ₸",
        desc: "Бейімделетін жоспармен толыққанды дайындық.",
        features: [
          "Мақсатыңа сай жеке жоспар",
          "Шексіз AI-оқытушы",
          "Сөйлеу практикасы және айтылым талдауы",
          "Жазба тапсырмаларын тексеру",
        ],
      },
      {
        id: "pro",
        name: "Pro",
        price: "14 900 ₸",
        desc: "Барынша мүмкіндік пен сынақ емтихандары.",
        features: [
          "Premium-ның бәрі",
          "Шексіз TÖMER сынақ емтихандары",
          "Тәртіп пен мотивацияның AI-менторы",
          "Тексерудің басым жылдамдығы",
        ],
      },
    ],
  },
  faq: {
    title: "Жиі қойылатын сұрақтар",
    subtitle: "Жауап таппадың ба — бізге жаз, көмектесеміз.",
    items: [
      {
        q: "Қазір қандай тілдер мен емтихандар қолжетімді?",
        a: "Қазір түрік тілі мен TÖMER емтиханына дайындық қолжетімді. TOPIK, HSK, JLPT және басқа бағыттар іске қосуға дайындалуда.",
      },
      {
        q: "Деңгей диагностикасы қалай жұмыс істейді?",
        a: "Бұл қысқа бейімделгіш тест: AI дағдыларыңды бағалап, жеке жоспар құру үшін бастау нүктесін анықтайды.",
      },
      {
        q: "30, 60 және 90 күндік жоспарлардың айырмашылығы неде?",
        a: "Мерзімі мен күнделікті жүктемесінде. Мерзім қысқа болса — бағдарлама қарқынды. Жүйе қарқынды мақсатыңа қарай есептейді.",
      },
      {
        q: "LingoPRO TÖMER-мен ресми байланысты ма?",
        a: "Жоқ. LingoPRO TÖMER-мен аффилиирленбеген — біз емтиханның ашық форматы мен бағалау критерийлері бойынша дайындаймыз.",
      },
      {
        q: "Тегін пайдалануға бола ма?",
        a: "Иә. Free тарифі диагностикадан өтуге және платформаны байқауға мүмкіндік береді. Кеңейтілген мүмкіндіктер — Premium мен Pro-да.",
      },
    ],
  },
  finalCta: {
    title: "Тегін диагностикадан баста",
    subtitle:
      "Деңгейіңді бірнеше минутта біл және TÖMER-ге дайындықтың алғашқы жеке жоспарын ал.",
    primary: "Тегін диагностикадан өту",
    secondary: "Аккаунт құру",
  },
  footer: {
    tagline: "Халықаралық тіл емтихандарына AI-дайындық платформасы.",
    product: "Өнім",
    company: "Компания",
    legal: "Құқықтық",
    links: {
      features: "Мүмкіндіктер",
      pricing: "Тарифтер",
      diagnostic: "Диагностика",
      faq: "Сұрақтар",
      about: "Біз туралы",
      contact: "Байланыс",
      privacy: "Құпиялылық",
      terms: "Шарттар",
    },
    rights: "Барлық құқық қорғалған.",
    disclaimer:
      "LingoPRO — TÖMER-мен аффилиирленбеген тәуелсіз дайындық платформасы. Емтихан атаулары тиісті құқық иелеріне тиесілі.",
  },
  pages: {
    back: "Басты бетке",
    diagnostic: {
      title: "Тегін деңгей диагностикасы",
      subtitle:
        "Бірнеше сұраққа жауап бер — AI деңгейіңді бағалап, жеке жоспар ұсынады. Флоудың демо нұсқасы.",
      start: "Диагностиканы бастау",
      question: "Сұрақ",
      of: "/",
      next: "Әрі қарай",
      finish: "Аяқтау",
      doneTitle: "Диагностика аяқталды",
      doneText:
        "Толық нұсқада мұнда деңгейің мен жеке жоспарың пайда болады. Нәтижені сақтау үшін аккаунт құр.",
      createAccount: "Аккаунт құру",
    },
    signup: {
      title: "Аккаунт құру",
      subtitle: "TÖMER-ге дайындықты жеке AI-оқытушымен баста.",
      name: "Аты",
      email: "Email",
      password: "Құпиясөз",
      submit: "Тіркелу",
      haveAccount: "Аккаунтың бар ма?",
      login: "Кіру",
      demo: "Бұл демо-форма — деректер ешқайда жіберілмейді.",
    },
    login: {
      title: "Қайта оралуыңмен",
      subtitle: "Дайындықты жалғастыру үшін кір.",
      email: "Email",
      password: "Құпиясөз",
      submit: "Кіру",
      noAccount: "Аккаунт жоқ па?",
      signup: "Тіркелу",
      demo: "Бұл демо-форма — деректер ешқайда жіберілмейді.",
    },
    b2b: {
      title: "Тіл мектептері мен компаниялар үшін LingoPRO",
      subtitle: "Студенттеріңізді AI-платформа арқылы халықаралық тілдік емтихандарға дайындаңыз",
      benefitAccessTitle: "Топтық қол жеткізу",
      benefitAccessText: "Студенттердің аккаунттарын бір панельден басқарыңыз",
      benefitAnalyticsTitle: "Прогресс аналитикасы",
      benefitAnalyticsText: "Әр студенттің нәтижелері мен белсенділігін қадағалаңыз",
      benefitPlansTitle: "Икемді тарифтер",
      benefitPlansText: "10+ студенті бар мектептерге арнайы шарттар",
      formTitle: "Өтінім қалдыру",
      school: "Мектеп атауы",
      schoolPh: "Мысалы: Lingua Center",
      contact: "Байланыс тұлғасының аты",
      contactPh: "Аты-жөні",
      email: "Email",
      phone: "Телефон",
      students: "Студенттер саны",
      submit: "Өтінім қалдыру",
      sending: "Жіберілуде…",
      errRequired: "Мектеп атауы мен байланыс тұлғасын толтырыңыз.",
      errEmail: "Дұрыс email енгізіңіз.",
      success: "Рахмет! 24 сағат ішінде сізбен байланысамыз.",
    },
  },
};

const en: Dict = {
  nav: {
    features: "Features",
    how: "How it works",
    pricing: "Pricing",
    faq: "FAQ",
    login: "Log in",
    signup: "Sign up",
    cta: "Diagnostic",
  },
  hero: {
    badge: "AI prep for language exams",
    titleLead: "Prepare for",
    titleHi: "TÖMER",
    titleTail: "with a personal AI tutor",
    subtitle:
      "Take a level diagnostic, get an honest plan built around your goal and exam date — the program adapts to your progress every single day.",
    primary: "Take the free diagnostic",
    secondary: "See how it works",
    stats: [
      { value: "Honest plan", label: "built for your goal and date" },
      { value: "AI 24/7", label: "tutor always available" },
      { value: "TÖMER", label: "Turkish — available now" },
    ],
    orbCurrent: "Turkish · TÖMER",
    orbHint: "Move your mouse",
  },
  exams: {
    title: "Languages & exams",
    subtitle:
      "We start with Turkish and the TÖMER exam. Other tracks are coming soon.",
    available: "Available now",
    soon: "Soon",
    items: [
      { lang: "Turkish", exam: "TÖMER", status: "available" },
      { lang: "Korean", exam: "TOPIK", status: "soon" },
      { lang: "Chinese", exam: "HSK", status: "soon" },
      { lang: "Japanese", exam: "JLPT", status: "soon" },
    ],
  },
  how: {
    title: "How it works",
    subtitle: "Three steps from diagnostic to a confident exam day.",
    steps: [
      {
        n: "01",
        title: "Level diagnostic",
        text: "AI assesses your reading, listening, vocabulary and grammar and defines your starting point.",
      },
      {
        n: "02",
        title: "An honest plan",
        text: "Get a plan built around your goal and exam date: daily tasks and a realistic timeline — no “C1 in a month” promises.",
      },
      {
        n: "03",
        title: "Lessons with your AI tutor",
        text: "Ahu explains, drills your Speaking and Writing, and rebuilds the plan daily from your results — weak topics get reinforced, strong ones locked in.",
      },
    ],
  },
  features: {
    title: "Everything you need in one platform",
    subtitle:
      "AI tools cover every skill the exam tests — from grammar to pronunciation.",
    items: [
      {
        tag: "Diagnostic",
        title: "AI level diagnostic",
        text: "A fast adaptive test finds your real level across skills and maps your gaps.",
      },
      {
        tag: "Tutor",
        title: "AI tutor",
        text: "Explains rules, answers questions and guides you through the program like a personal mentor, 24/7.",
      },
      {
        tag: "Speaking",
        title: "Speaking practice & pronunciation analysis",
        text: "Speak out loud and AI scores your fluency, intonation and pronunciation with tips to improve.",
      },
      {
        tag: "Writing",
        title: "Writing task review",
        text: "Submit essays and letters — get feedback by exam criteria with concrete corrections.",
      },
      {
        tag: "Mock",
        title: "TÖMER mock exam",
        text: "A full mock in exam format with timer, sections and a detailed result breakdown.",
      },
      {
        tag: "Discipline",
        title: "AI mentor for discipline",
        text: "Tracks your schedule, reminds you to study and helps you stay on track.",
      },
      {
        tag: "Motivation",
        title: "Motivation & stress-relief helper",
        text: "Supports you on hard days and helps you handle exam anxiety.",
      },
    ],
  },
  plan: {
    title: "Your personal study plan",
    subtitle:
      "Pick a timeframe — the system calculates your daily load for your goal and level.",
    durations: [
      { id: "30", label: "30 days", desc: "Pre-exam intensive" },
      { id: "60", label: "60 days", desc: "Balanced pace" },
      { id: "90", label: "90 days", desc: "Calm, deep preparation" },
    ],
    bullets: [
      "Daily tasks across reading, listening, vocabulary and grammar",
      "Automatic plan adjustments based on results",
      "Progress tracking for every skill",
      "A clear goal for each week until the exam",
    ],
    metricLoad: "Daily load",
    metricFocus: "Weekly focus",
    focusValue: "Grammar & listening",
  },
  leaderboard: {
    title: "Student leaderboard",
    subtitle:
      "Compare progress with others — by personal points, city and country. Healthy competition keeps you going.",
    tabs: [
      { id: "progress", label: "By progress" },
      { id: "city", label: "By city" },
      { id: "country", label: "By country" },
    ],
    you: "This is you",
    xp: "XP",
    note: "Numbers shown are an illustration of how the leaderboard looks.",
  },
  gamification: {
    title: "XP, levels and achievements",
    subtitle:
      "Every session earns points. Day streaks, levels and leagues turn prep into a habit.",
    cards: [
      { title: "Experience points (XP)", text: "Earned for lessons, practice and mocks." },
      { title: "Levels", text: "Grow with your skills and the work you put in." },
      { title: "Achievements", text: "Rewards for milestones and personal records." },
      { title: "Day streaks", text: "Keep your streak — study every day without gaps." },
      { title: "Leagues", text: "Climb into stronger leagues alongside others." },
    ],
    streakLabel: "Streak",
    streakDays: "days in a row",
    levelLabel: "Level",
    leagueLabel: "League",
    leagueValue: "Sapphire",
  },
  certificates: {
    title: "Our method's students — with TÖMER certificates",
    subtitle: "Real certificates earned by students of Language PRO, our online language school. That same method now powers this platform.",
    certWord: "Certificate",
    studentWord: "Student",
    levelWord: "Level",
  },
  dashboard: {
    title: "Your dashboard",
    subtitle: "All your progress, recommendations and next lesson on one screen.",
    progressTitle: "Exam readiness",
    skills: [
      { name: "Reading", value: 72 },
      { name: "Listening", value: 58 },
      { name: "Vocabulary", value: 81 },
      { name: "Grammar", value: 64 },
    ],
    recoTitle: "Today's recommendations",
    reco: [
      "Review 12 words from yesterday's lesson",
      "Do a listening: A2-level dialogues",
      "Submit a writing task for review",
    ],
    nextLesson: "Next lesson",
    nextLessonValue: "Grammar · cases",
    daysLeft: "until the exam",
    daysLeftValue: "47 days",
  },
  pricing: {
    title: "Pricing",
    subtitle: "Start free. Upgrade when you're ready to move faster.",
    period: "/ mo",
    popular: "Popular",
    cta: "Choose",
    ctaFree: "Start free",
    plans: [
      {
        id: "free",
        name: "Free",
        price: "$0",
        desc: "To try it out and take the diagnostic.",
        features: [
          "AI level diagnostic",
          "Limited daily tasks",
          "Basic progress and XP",
        ],
      },
      {
        id: "premium",
        name: "Premium",
        price: "$15",
        desc: "Full preparation with an adaptive plan.",
        features: [
          "Personal plan built for your goal",
          "AI tutor 24/7",
          "Speaking practice & pronunciation analysis",
          "Writing task review",
        ],
      },
      {
        id: "pro",
        name: "Pro",
        price: "$29",
        desc: "Everything plus mock exams.",
        features: [
          "Everything in Premium",
          "Unlimited TÖMER mock exams",
          "AI mentor for discipline & motivation",
          "Priority review speed",
        ],
      },
    ],
  },
  faq: {
    title: "Frequently asked questions",
    subtitle: "Didn't find an answer? Reach out — we'll help.",
    items: [
      {
        q: "Which languages and exams are available now?",
        a: "Right now Turkish and TÖMER prep are available. TOPIK, HSK, JLPT and other tracks are coming soon.",
      },
      {
        q: "How does the level diagnostic work?",
        a: "It's a short adaptive test: AI assesses your skills and defines a starting point to build your personal plan.",
      },
      {
        q: "How do the 30, 60 and 90-day plans differ?",
        a: "By duration and daily load. The shorter the timeframe, the more intensive the program. The system sets the pace for your goal.",
      },
      {
        q: "Is LingoPRO officially affiliated with TÖMER?",
        a: "No. LingoPRO is not affiliated with TÖMER — we prepare you for the exam based on its public format and scoring criteria.",
      },
      {
        q: "Can I use it for free?",
        a: "Yes. The Free plan lets you take the diagnostic and try the platform. Advanced features are on Premium and Pro.",
      },
    ],
  },
  finalCta: {
    title: "Start with a free diagnostic",
    subtitle:
      "Find your level in minutes and get your first personal TÖMER prep plan.",
    primary: "Take the free diagnostic",
    secondary: "Create an account",
  },
  footer: {
    tagline: "AI platform for preparing for international language exams.",
    product: "Product",
    company: "Company",
    legal: "Legal",
    links: {
      features: "Features",
      pricing: "Pricing",
      diagnostic: "Diagnostic",
      faq: "FAQ",
      about: "About",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms",
    },
    rights: "All rights reserved.",
    disclaimer:
      "LingoPRO is an independent prep platform, not affiliated with TÖMER. Exam names belong to their respective owners.",
  },
  pages: {
    back: "Back home",
    diagnostic: {
      title: "Free level diagnostic",
      subtitle:
        "Answer a few questions — AI estimates your level and suggests a personal plan. Demo flow.",
      start: "Start the diagnostic",
      question: "Question",
      of: "of",
      next: "Next",
      finish: "Finish",
      doneTitle: "Diagnostic complete",
      doneText:
        "In the full version your level and personal plan appear here. Create an account to save your result.",
      createAccount: "Create an account",
    },
    signup: {
      title: "Create an account",
      subtitle: "Start preparing for TÖMER with a personal AI tutor.",
      name: "Name",
      email: "Email",
      password: "Password",
      submit: "Sign up",
      haveAccount: "Already have an account?",
      login: "Log in",
      demo: "This is a demo form — no data is sent anywhere.",
    },
    login: {
      title: "Welcome back",
      subtitle: "Log in to continue your preparation.",
      email: "Email",
      password: "Password",
      submit: "Log in",
      noAccount: "No account?",
      signup: "Sign up",
      demo: "This is a demo form — no data is sent anywhere.",
    },
    b2b: {
      title: "LingoPRO for Language Schools and Companies",
      subtitle: "Prepare your students for international language exams with an AI platform",
      benefitAccessTitle: "Group Access",
      benefitAccessText: "Manage student accounts from a single dashboard",
      benefitAnalyticsTitle: "Progress Analytics",
      benefitAnalyticsText: "Track results and activity of each student",
      benefitPlansTitle: "Flexible Plans",
      benefitPlansText: "Special conditions for schools with 10+ students",
      formTitle: "Leave a request",
      school: "School name",
      schoolPh: "e.g. Lingua Center",
      contact: "Contact person name",
      contactPh: "First and last name",
      email: "Email",
      phone: "Phone",
      students: "Number of students",
      submit: "Leave a request",
      sending: "Sending…",
      errRequired: "Please fill in the school name and contact person.",
      errEmail: "Please enter a valid email.",
      success: "Thank you! We'll get in touch within 24 hours.",
    },
  },
};

const tr: Dict = {
  nav: {
    features: "Özellikler",
    how: "Nasıl çalışır",
    pricing: "Fiyatlar",
    faq: "SSS",
    login: "Giriş",
    signup: "Kayıt ol",
    cta: "Diagnostik",
  },
  hero: {
    badge: "Dil sınavları için AI hazırlığı",
    titleLead: "Hazırlan:",
    titleHi: "TÖMER",
    titleTail: "kişisel AI öğretmenle",
    subtitle:
      "Seviye diagnostiğini geç, hedefine ve sınav tarihine göre dürüst bir plan al — program ilerlemene her gün uyum sağlar.",
    primary: "Ücretsiz diagnostiği başlat",
    secondary: "Nasıl çalıştığını gör",
    stats: [
      { value: "Dürüst plan", label: "hedefine ve tarihine göre" },
      { value: "AI 24/7", label: "öğretmen her zaman yanında" },
      { value: "TÖMER", label: "Türkçe — şimdi mevcut" },
    ],
    orbCurrent: "Türkçe · TÖMER",
    orbHint: "Fareyi hareket ettir",
  },
  exams: {
    title: "Diller ve sınavlar",
    subtitle:
      "Türkçe ve TÖMER sınavıyla başlıyoruz. Diğer diller yakında geliyor.",
    available: "Şimdi mevcut",
    soon: "Yakında",
    items: [
      { lang: "Türkçe", exam: "TÖMER", status: "available" },
      { lang: "Korece", exam: "TOPIK", status: "soon" },
      { lang: "Çince", exam: "HSK", status: "soon" },
      { lang: "Japonca", exam: "JLPT", status: "soon" },
    ],
  },
  how: {
    title: "Nasıl çalışır",
    subtitle: "Diagnostikten emin bir sınav gününe üç adım.",
    steps: [
      {
        n: "01",
        title: "Seviye diagnostiği",
        text: "AI okuma, dinleme, kelime ve dilbilgisi becerilerini değerlendirir ve başlangıç noktanı belirler.",
      },
      {
        n: "02",
        title: "Dürüst bir plan",
        text: "Hedefine ve sınav tarihine göre bir plan al: günlük görevler ve gerçekçi bir süre — “bir ayda C1” vaadi yok.",
      },
      {
        n: "03",
        title: "AI öğretmenle dersler",
        text: "Ahu anlatır, Speaking ve Writing'ini çalıştırır ve planı her gün sonuçlarına göre yeniden kurar — zayıf konular güçlenir, güçlüler pekişir.",
      },
    ],
  },
  features: {
    title: "Hazırlık için her şey tek platformda",
    subtitle:
      "AI araçları sınavın ölçtüğü her beceriyi kapsar — dilbilgisinden telaffuza.",
    items: [
      {
        tag: "Diagnostik",
        title: "AI seviye diagnostiği",
        text: "Hızlı uyarlanabilir bir test gerçek seviyeni bulur ve eksiklerini haritalar.",
      },
      {
        tag: "Öğretmen",
        title: "AI öğretmen",
        text: "Kuralları açıklar, sorularını yanıtlar ve programda kişisel bir mentor gibi 7/24 yönlendirir.",
      },
      {
        tag: "Speaking",
        title: "Konuşma pratiği ve telaffuz analizi",
        text: "Yüksek sesle konuş, AI akıcılığını ve telaffuzunu değerlendirip neyi geliştireceğini söyler.",
      },
      {
        tag: "Writing",
        title: "Yazılı görev kontrolü",
        text: "Kompozisyon ve mektup gönder — sınav kriterlerine göre somut düzeltmelerle geri bildirim al.",
      },
      {
        tag: "Mock",
        title: "TÖMER deneme sınavı",
        text: "Zamanlayıcı, bölümler ve ayrıntılı sonuç analiziyle sınav formatında tam bir deneme.",
      },
      {
        tag: "Disiplin",
        title: "Disiplin için AI mentor",
        text: "Programını takip eder, derslerini hatırlatır ve yoldan çıkmamana yardım eder.",
      },
      {
        tag: "Motivasyon",
        title: "Motivasyon ve stres azaltma yardımcısı",
        text: "Zor günlerde seni destekler ve sınav kaygısıyla baş etmene yardımcı olur.",
      },
    ],
  },
  plan: {
    title: "Kişisel çalışma planın",
    subtitle:
      "Bir süre seç — sistem hedefin ve seviyen için günlük yükü hesaplar.",
    durations: [
      { id: "30", label: "30 gün", desc: "Sınav öncesi yoğun" },
      { id: "60", label: "60 gün", desc: "Dengeli tempo" },
      { id: "90", label: "90 gün", desc: "Sakin, derin hazırlık" },
    ],
    bullets: [
      "Okuma, dinleme, kelime ve dilbilgisi için günlük görevler",
      "Sonuçlara göre otomatik plan ayarlaması",
      "Her beceri için ilerleme takibi",
      "Sınava kadar her hafta için net bir hedef",
    ],
    metricLoad: "Günlük yük",
    metricFocus: "Haftanın odağı",
    focusValue: "Dilbilgisi ve dinleme",
  },
  leaderboard: {
    title: "Öğrenci sıralaması",
    subtitle:
      "İlerlemeni başkalarıyla karşılaştır — kişisel puan, şehir ve ülkeye göre. Sağlıklı rekabet temponu korur.",
    tabs: [
      { id: "progress", label: "İlerlemeye göre" },
      { id: "city", label: "Şehre göre" },
      { id: "country", label: "Ülkeye göre" },
    ],
    you: "Bu sensin",
    xp: "XP",
    note: "Gösterilen sayılar sıralamanın nasıl göründüğüne dair bir örnektir.",
  },
  gamification: {
    title: "XP, seviyeler ve başarılar",
    subtitle:
      "Her oturum puan kazandırır. Gün serileri, seviyeler ve ligler hazırlığı alışkanlığa dönüştürür.",
    cards: [
      { title: "Deneyim puanı (XP)", text: "Dersler, pratik ve denemeler için kazanılır." },
      { title: "Seviyeler", text: "Becerilerin ve emeğinle birlikte büyür." },
      { title: "Başarılar", text: "Kilometre taşları ve kişisel rekorlar için ödüller." },
      { title: "Gün serileri", text: "Serini koru — her gün boşluksuz çalış." },
      { title: "Ligler", text: "Başkalarıyla birlikte daha güçlü liglere yüksel." },
    ],
    streakLabel: "Seri",
    streakDays: "gün üst üste",
    levelLabel: "Seviye",
    leagueLabel: "Lig",
    leagueValue: "Safir",
  },
  certificates: {
    title: "Metodumuzun öğrencileri — TÖMER belgeleriyle",
    subtitle: "Online dil kursu okulumuz Language PRO öğrencilerinin gerçek belgeleri. Aynı metot artık bu platformda.",
    certWord: "Sertifika",
    studentWord: "Öğrenci",
    levelWord: "Seviye",
  },
  dashboard: {
    title: "Kişisel panelin",
    subtitle: "Tüm ilerlemen, önerilerin ve sonraki dersin tek ekranda.",
    progressTitle: "Sınava hazırlık",
    skills: [
      { name: "Okuma", value: 72 },
      { name: "Dinleme", value: 58 },
      { name: "Kelime", value: 81 },
      { name: "Dilbilgisi", value: 64 },
    ],
    recoTitle: "Bugünün önerileri",
    reco: [
      "Dünkü dersten 12 kelimeyi tekrarla",
      "Bir dinleme yap: A2 seviyesi diyaloglar",
      "Bir yazılı görevi kontrole gönder",
    ],
    nextLesson: "Sonraki ders",
    nextLessonValue: "Dilbilgisi · durumlar",
    daysLeft: "sınava kalan",
    daysLeftValue: "47 gün",
  },
  pricing: {
    title: "Fiyatlar",
    subtitle: "Ücretsiz başla. Hızlanmaya hazır olduğunda yükselt.",
    period: "/ ay",
    popular: "Popüler",
    cta: "Seç",
    ctaFree: "Ücretsiz başla",
    plans: [
      {
        id: "free",
        name: "Free",
        price: "0 ₺",
        desc: "Denemek ve diagnostiği geçmek için.",
        features: [
          "AI seviye diagnostiği",
          "Sınırlı günlük görevler",
          "Temel ilerleme ve XP",
        ],
      },
      {
        id: "premium",
        name: "Premium",
        price: "499 ₺",
        desc: "Uyarlanabilir planla tam hazırlık.",
        features: [
          "Hedefine göre kişisel plan",
          "7/24 AI öğretmen",
          "Konuşma pratiği ve telaffuz analizi",
          "Yazılı görev kontrolü",
        ],
      },
      {
        id: "pro",
        name: "Pro",
        price: "999 ₺",
        desc: "Her şey ve deneme sınavları.",
        features: [
          "Premium'daki her şey",
          "Sınırsız TÖMER deneme sınavı",
          "Disiplin ve motivasyon için AI mentor",
          "Öncelikli kontrol hızı",
        ],
      },
    ],
  },
  faq: {
    title: "Sık sorulan sorular",
    subtitle: "Cevap bulamadın mı? Bize yaz — yardımcı oluruz.",
    items: [
      {
        q: "Şu anda hangi diller ve sınavlar mevcut?",
        a: "Şu anda Türkçe ve TÖMER hazırlığı mevcut. TOPIK, HSK, JLPT ve diğer diller yakında geliyor.",
      },
      {
        q: "Seviye diagnostiği nasıl çalışır?",
        a: "Kısa, uyarlanabilir bir testtir: AI becerilerini değerlendirir ve kişisel plan için bir başlangıç noktası belirler.",
      },
      {
        q: "30, 60 ve 90 günlük planlar nasıl farklı?",
        a: "Süre ve günlük yükle. Süre ne kadar kısaysa program o kadar yoğun. Sistem tempoyu hedefine göre ayarlar.",
      },
      {
        q: "LingoPRO TÖMER ile resmi olarak bağlantılı mı?",
        a: "Hayır. LingoPRO, TÖMER ile bağlantılı değildir — sınava, herkese açık formatı ve puanlama kriterlerine göre hazırlarız.",
      },
      {
        q: "Ücretsiz kullanabilir miyim?",
        a: "Evet. Free planı diagnostiği geçmene ve platformu denemene izin verir. Gelişmiş özellikler Premium ve Pro'dadır.",
      },
    ],
  },
  finalCta: {
    title: "Ücretsiz diagnostikle başla",
    subtitle:
      "Seviyeni dakikalar içinde öğren ve ilk kişisel TÖMER hazırlık planını al.",
    primary: "Ücretsiz diagnostiği başlat",
    secondary: "Hesap oluştur",
  },
  footer: {
    tagline: "Uluslararası dil sınavlarına hazırlık için AI platformu.",
    product: "Ürün",
    company: "Şirket",
    legal: "Yasal",
    links: {
      features: "Özellikler",
      pricing: "Fiyatlar",
      diagnostic: "Diagnostik",
      faq: "SSS",
      about: "Hakkımızda",
      contact: "İletişim",
      privacy: "Gizlilik",
      terms: "Koşullar",
    },
    rights: "Tüm hakları saklıdır.",
    disclaimer:
      "LingoPRO, TÖMER ile bağlantısı olmayan bağımsız bir hazırlık platformudur. Sınav adları ilgili sahiplerine aittir.",
  },
  pages: {
    back: "Ana sayfa",
    diagnostic: {
      title: "Ücretsiz seviye diagnostiği",
      subtitle:
        "Birkaç soru yanıtla — AI seviyeni tahmin eder ve kişisel bir plan önerir. Demo akış.",
      start: "Diagnostiği başlat",
      question: "Soru",
      of: "/",
      next: "İleri",
      finish: "Bitir",
      doneTitle: "Diagnostik tamamlandı",
      doneText:
        "Tam sürümde seviyen ve kişisel planın burada görünür. Sonucunu kaydetmek için bir hesap oluştur.",
      createAccount: "Hesap oluştur",
    },
    signup: {
      title: "Hesap oluştur",
      subtitle: "Kişisel AI öğretmenle TÖMER'e hazırlanmaya başla.",
      name: "Ad",
      email: "Email",
      password: "Şifre",
      submit: "Kayıt ol",
      haveAccount: "Zaten hesabın var mı?",
      login: "Giriş",
      demo: "Bu bir demo formdur — hiçbir veri gönderilmez.",
    },
    login: {
      title: "Tekrar hoş geldin",
      subtitle: "Hazırlığa devam etmek için giriş yap.",
      email: "Email",
      password: "Şifre",
      submit: "Giriş",
      noAccount: "Hesabın yok mu?",
      signup: "Kayıt ol",
      demo: "Bu bir demo formdur — hiçbir veri gönderilmez.",
    },
    b2b: {
      title: "Dil Okulları ve Şirketler için LingoPRO",
      subtitle: "Öğrencilerinizi AI platformuyla uluslararası dil sınavlarına hazırlayın",
      benefitAccessTitle: "Toplu Erişim",
      benefitAccessText: "Öğrenci hesaplarını tek panelden yönetin",
      benefitAnalyticsTitle: "İlerleme Analitiği",
      benefitAnalyticsText: "Her öğrencinin sonuçlarını ve aktivitesini takip edin",
      benefitPlansTitle: "Esnek Tarifeler",
      benefitPlansText: "10+ öğrenci olan okullar için özel koşullar",
      formTitle: "Başvuru bırakın",
      school: "Okul adı",
      schoolPh: "Örn: Lingua Center",
      contact: "İletişim kişisinin adı",
      contactPh: "Ad ve soyad",
      email: "Email",
      phone: "Telefon",
      students: "Öğrenci sayısı",
      submit: "Başvuru bırakın",
      sending: "Gönderiliyor…",
      errRequired: "Lütfen okul adını ve iletişim kişisini doldurun.",
      errEmail: "Lütfen geçerli bir email girin.",
      success: "Teşekkürler! 24 saat içinde sizinle iletişime geçeceğiz.",
    },
  },
};

export const DICTS: Record<Locale, Dict> = { ru, kk, en, tr };

/* ------------------------------------------------------------------ */

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "lingopro-locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  // Default to English; only a previously saved choice overrides it.
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    // Client-only read of the persisted locale after hydration.
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    const resolved = stored && LOCALES.includes(stored) ? stored : "en";
    document.documentElement.lang = resolved;
    if (resolved !== "en") setLocaleState(resolved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  };

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t: DICTS[locale] }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
