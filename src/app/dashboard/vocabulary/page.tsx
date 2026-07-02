"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n, type Locale } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { VOCABULARY } from "@/data/vocabulary";

type Status = "learned" | "review" | "new";
type Level = "A1" | "A2" | "B1" | "B2" | "C1";
type Source = "reading" | "listening" | "writing" | "speaking" | "feedback" | "manual";
type Word = { w: string; ru: string; en: string; kk: string; level: Level; status: Status; source: Source };

const STATUSES: Status[] = ["learned", "review", "new"];
const SOURCES: Source[] = ["reading", "listening", "writing", "speaking", "feedback", "manual"];

// Real 400-word bank (src/data/vocabulary.ts). The data model carries one
// translation, so it is shown for every locale; status/source stay demo-cyclic.
const WORDS: Word[] = VOCABULARY.map((v, i) => ({
  w: v.word,
  ru: v.translation,
  en: v.translation,
  kk: v.translation,
  level: v.level,
  status: STATUSES[i % 3],
  source: SOURCES[i % 6],
}));

const STATUS_ICON: Record<Status, string> = { learned: "✅", review: "🔄", new: "🆕" };

function tr(word: Word, locale: Locale) {
  return locale === "en" ? word.en : locale === "kk" ? word.kk : word.ru;
}

const T = {
  ru: {
    title: "Словарь",
    bannerKicker: "ЕЖЕДНЕВНОЕ ПОВТОРЕНИЕ", bannerTitle: "Интервальное повторение",
    bannerText: "Система отслеживает, что вы знаете. Слова, которые забываются — показываются чаще. Слова, которые запомнились — реже.",
    startReview: "Начать повторение", allReviewed: "Всё повторено", toReview: "слов к повторению",
    modes: ["Узнавание", "Воспроизведение", "Смешанный"],
    modeHint: "Узнавание: видите слово — вспоминаете значение. Лучше для чтения и аудирования.",
    search: "Поиск слов...", allLevels: "Все уровни", allSources: "Все источники",
    sources: { reading: "Чтение", listening: "Аудирование", writing: "Письмо", speaking: "Говорение", feedback: "Фидбек", manual: "Вручную" },
    total: "всего карточек", add: "Добавить слово", addWord: "Слово (тур.)", addTr: "Перевод", save: "Сохранить", cancel: "Отмена",
    reveal: "Показать перевод", know: "Знаю", repeat: "Повторить", hard: "Сложно", reviewed: "повторено", finished: "Готово! 🎉", back: "К списку",
  },
  en: {
    title: "Vocabulary",
    bannerKicker: "DAILY REVIEW", bannerTitle: "Spaced repetition",
    bannerText: "The system tracks what you know. Words you forget show up more often; words you've learned, less often.",
    startReview: "Start review", allReviewed: "All reviewed", toReview: "words to review",
    modes: ["Recognition", "Production", "Mixed"],
    modeHint: "Recognition: see the word — recall the meaning. Best for reading and listening.",
    search: "Search words...", allLevels: "All levels", allSources: "All sources",
    sources: { reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking", feedback: "Feedback", manual: "Manual" },
    total: "cards total", add: "Add word", addWord: "Word (TR)", addTr: "Translation", save: "Save", cancel: "Cancel",
    reveal: "Show translation", know: "I know", repeat: "Repeat", hard: "Hard", reviewed: "reviewed", finished: "Done! 🎉", back: "To list",
  },
  tr: {
    title: "Sözlük",
    bannerKicker: "GÜNLÜK TEKRAR", bannerTitle: "Aralıklı tekrar",
    bannerText: "Sistem ne bildiğini takip eder. Unuttuğun kelimeler daha sık, öğrendiklerin daha seyrek gösterilir.",
    startReview: "Tekrara başla", allReviewed: "Hepsi tekrarlandı", toReview: "kelime tekrara",
    modes: ["Tanıma", "Üretim", "Karışık"],
    modeHint: "Tanıma: kelimeyi gör — anlamını hatırla. Okuma ve dinleme için ideal.",
    search: "Kelime ara...", allLevels: "Tüm seviyeler", allSources: "Tüm kaynaklar",
    sources: { reading: "Okuma", listening: "Dinleme", writing: "Yazma", speaking: "Konuşma", feedback: "Geri bildirim", manual: "Manuel" },
    total: "toplam kart", add: "Kelime ekle", addWord: "Kelime (TR)", addTr: "Çeviri", save: "Kaydet", cancel: "İptal",
    reveal: "Çeviriyi göster", know: "Biliyorum", repeat: "Tekrar", hard: "Zor", reviewed: "tekrarlandı", finished: "Bitti! 🎉", back: "Listeye dön",
  },
  kk: {
    title: "Сөздік",
    bannerKicker: "КҮНДЕЛІКТІ ҚАЙТАЛАУ", bannerTitle: "Аралық қайталау",
    bannerText: "Жүйе нені білетіңді бақылайды. Ұмытылатын сөздер жиі, есте қалғандары сирек көрсетіледі.",
    startReview: "Қайталауды бастау", allReviewed: "Бәрі қайталанды", toReview: "сөз қайталауға",
    modes: ["Тану", "Жаңғырту", "Аралас"],
    modeHint: "Тану: сөзді көресің — мағынасын еске түсіресің. Оқу мен тыңдалымға қолайлы.",
    search: "Сөз іздеу...", allLevels: "Барлық деңгей", allSources: "Барлық дереккөз",
    sources: { reading: "Оқу", listening: "Тыңдалым", writing: "Жазу", speaking: "Сөйлеу", feedback: "Кері байланыс", manual: "Қолмен" },
    total: "барлық карта", add: "Сөз қосу", addWord: "Сөз (тур.)", addTr: "Аударма", save: "Сақтау", cancel: "Болдырмау",
    reveal: "Аударманы көрсету", know: "Білемін", repeat: "Қайталау", hard: "Қиын", reviewed: "қайталанды", finished: "Дайын! 🎉", back: "Тізімге",
  },
};

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

export default function VocabularyPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [words, setWords] = useState<Word[]>(WORDS);
  const [mode, setMode] = useState(0);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<Level | "all">("all");
  const [source, setSource] = useState<Source | "all">("all");
  const [reviewing, setReviewing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newW, setNewW] = useState("");
  const [newT, setNewT] = useState("");

  const filtered = useMemo(
    () =>
      words.filter((w) => {
        const byLevel = level === "all" || w.level === level;
        const bySource = source === "all" || w.source === source;
        const byQuery = !query || w.w.toLowerCase().includes(query.toLowerCase()) || tr(w, locale).toLowerCase().includes(query.toLowerCase());
        return byLevel && bySource && byQuery;
      }),
    [words, level, source, query, locale],
  );

  const reviewCount = words.filter((w) => w.status === "review").length;

  function addWord() {
    if (!newW.trim() || !newT.trim()) return;
    setWords((prev) => [{ w: newW.trim(), ru: newT.trim(), en: newT.trim(), kk: newT.trim(), level: "A1", status: "new", source: "manual" }, ...prev]);
    setNewW("");
    setNewT("");
    setAdding(false);
  }

  if (reviewing) return <Flashcards words={filtered.length ? filtered : words} c={c} locale={locale} onBack={() => setReviewing(false)} />;

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>

      {/* spaced-repetition banner */}
      <div className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#ec4899] to-[#8b5cf6] p-6 text-white">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">{c.bannerKicker}</div>
        <div className="mt-1 text-xl font-bold">{c.bannerTitle}</div>
        <p className="mt-2 max-w-xl text-sm text-white/85">{c.bannerText}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setReviewing(true)} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#8b5cf6]">
            {c.startReview}
          </button>
          <span className="text-sm text-white/80">{reviewCount > 0 ? `${reviewCount} ${c.toReview}` : c.allReviewed}</span>
        </div>
      </div>

      {/* modes */}
      <div className="mt-5 flex flex-wrap gap-2">
        {c.modes.map((m, i) => (
          <button key={m} type="button" onClick={() => setMode(i)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${mode === i ? "bg-[var(--color-brand)] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}>{m}</button>
        ))}
      </div>
      <p className="mt-2 text-xs text-[var(--color-muted)]">{c.modeHint}</p>

      {/* search */}
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.search} className="mt-4 w-full rounded-full border border-black/[0.1] bg-white px-5 py-3 text-sm outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15" />

      {/* level filters */}
      <div className="mt-3 flex flex-wrap gap-2">
        <FilterBtn active={level === "all"} onClick={() => setLevel("all")}>{c.allLevels}</FilterBtn>
        {LEVELS.map((l) => (
          <FilterBtn key={l} active={level === l} onClick={() => setLevel(l)}>{l}</FilterBtn>
        ))}
      </div>
      {/* source filters */}
      <div className="mt-2 flex flex-wrap gap-2">
        <FilterBtn active={source === "all"} onClick={() => setSource("all")}>{c.allSources}</FilterBtn>
        {SOURCES.map((s) => (
          <FilterBtn key={s} active={source === s} onClick={() => setSource(s)}>{c.sources[s]}</FilterBtn>
        ))}
      </div>

      {/* counter + add */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-[var(--color-muted)]">{filtered.length} {c.total}</span>
        <button type="button" onClick={() => setAdding((a) => !a)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand)] text-lg text-white transition-transform hover:scale-105" aria-label={c.add}>+</button>
      </div>

      {/* add form */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-black/[0.07] bg-black/[0.02] p-3">
              <input value={newW} onChange={(e) => setNewW(e.target.value)} placeholder={c.addWord} className="min-w-0 flex-1 rounded-xl border border-black/[0.1] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]" />
              <input value={newT} onChange={(e) => setNewT(e.target.value)} placeholder={c.addTr} className="min-w-0 flex-1 rounded-xl border border-black/[0.1] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]" />
              <button type="button" onClick={addWord} className="btn-primary rounded-full px-4 py-2 text-sm">{c.save}</button>
              <button type="button" onClick={() => setAdding(false)} className="text-sm text-[var(--color-muted)]">{c.cancel}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* list */}
      <div className="mt-4 flex flex-col gap-2.5">
        {filtered.map((w) => (
          <div key={w.w} className="glass flex items-center justify-between rounded-2xl px-4 py-3.5">
            <div className="min-w-0">
              <span className="text-sm font-semibold text-[var(--color-foreground)]">{w.w}</span>
              <span className="text-sm text-[var(--color-muted)]"> — {tr(w, locale)}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xs">
              <span className="rounded-full bg-black/[0.05] px-2 py-0.5 font-semibold text-[var(--color-brand-2)]">{w.level}</span>
              <span className="text-[var(--color-muted)]">{STATUS_ICON[w.status]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-[var(--color-brand)]/12 text-[var(--color-brand)]" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}>
      {children}
    </button>
  );
}

function Flashcards({ words, c, locale, onBack }: { words: Word[]; c: (typeof T)[Locale]; locale: Locale; onBack: () => void }) {
  const deck = useMemo(() => words.slice(0, 20), [words]);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  function answer() {
    setRevealed(false);
    if (i + 1 >= deck.length) setDone(true);
    else setI((x) => x + 1);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm text-center">
        <div className="glass rounded-3xl p-8">
          <div className="text-3xl">🎉</div>
          <div className="mt-3 text-lg font-bold">{c.finished}</div>
          <button type="button" onClick={onBack} className="btn-primary mt-6 rounded-full px-6 py-3 text-sm">{c.back}</button>
        </div>
      </div>
    );
  }

  const w = deck[i];

  return (
    <div className="mx-auto max-w-sm">
      <button type="button" onClick={onBack} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">← {c.back}</button>
      <div className="mt-3 text-center text-xs text-[var(--color-muted)]">{i + 1}/{deck.length} {c.reviewed}</div>

      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="glass mt-3 flex min-h-[200px] flex-col items-center justify-center rounded-3xl p-8 text-center">
          <div className="text-3xl font-bold text-[var(--color-foreground)]">{w.w}</div>
          <span className="mt-2 rounded-full bg-black/[0.05] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-brand-2)]">{w.level}</span>
          {revealed && <div className="mt-4 text-lg text-[var(--color-brand)]">{tr(w, locale)}</div>}
        </motion.div>
      </AnimatePresence>

      {!revealed ? (
        <button type="button" onClick={() => setRevealed(true)} className="btn-primary mt-5 w-full rounded-full px-6 py-3 text-sm">{c.reveal}</button>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-2">
          <button type="button" onClick={answer} className="rounded-full bg-[#16a34a]/12 px-3 py-3 text-sm font-semibold text-[#16a34a] transition-colors hover:bg-[#16a34a]/20">✅ {c.know}</button>
          <button type="button" onClick={answer} className="rounded-full bg-[#f59e0b]/12 px-3 py-3 text-sm font-semibold text-[#d97706] transition-colors hover:bg-[#f59e0b]/20">🔄 {c.repeat}</button>
          <button type="button" onClick={answer} className="rounded-full bg-[#dc2626]/12 px-3 py-3 text-sm font-semibold text-[#dc2626] transition-colors hover:bg-[#dc2626]/20">❌ {c.hard}</button>
        </div>
      )}
    </div>
  );
}
