"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

type Q = { q: string; options: string[]; answer: number };
type RText = {
  id: string;
  title: string;
  level: string;
  group: "a" | "b1" | "b2" | "c1";
  min: number;
  text: string;
  tr: { ru: string; en: string; kk: string };
  questions: Q[];
};

const TEXTS: RText[] = [
  {
    id: "ahmet", title: "Ahmet'in Günlük Hayatı", level: "A1", group: "a", min: 3,
    text: "Ahmet her sabah saat yedide kalkar. Kahvaltıdan sonra okula gider. Akşam ailesiyle yemek yer ve erken yatar.",
    tr: { ru: "Ахмет каждое утро встаёт в семь. После завтрака идёт в школу. Вечером ужинает с семьёй и рано ложится.", en: "Ahmet gets up at seven every morning. After breakfast he goes to school. In the evening he eats with his family and goes to bed early.", kk: "Ахмет әр таңда жетіде тұрады. Таңғы астан кейін мектепке барады. Кешке отбасымен тамақтанып, ерте жатады." },
    questions: [
      { q: "Ahmet saat kaçta kalkar?", options: ["Altıda", "Yedide", "Sekizde"], answer: 1 },
      { q: "Kahvaltıdan sonra nereye gider?", options: ["Okula", "İşe", "Parka"], answer: 0 },
      { q: "Akşam kiminle yemek yer?", options: ["Arkadaşıyla", "Yalnız", "Ailesiyle"], answer: 2 },
    ],
  },
  {
    id: "istanbul", title: "İstanbul'da Bir Gün", level: "A2", group: "a", min: 5,
    text: "Dün İstanbul'a gittik. Önce Sultanahmet'i gezdik, sonra bir lokantada balık yedik. Akşam vapurla Boğaz'ı gördük. Çok güzel bir gündü.",
    tr: { ru: "Вчера мы поехали в Стамбул. Сначала погуляли по Султанахмету, потом поели рыбу в ресторане. Вечером с парома увидели Босфор. Это был прекрасный день.", en: "Yesterday we went to Istanbul. First we toured Sultanahmet, then ate fish at a restaurant. In the evening we saw the Bosphorus from a ferry. It was a lovely day.", kk: "Кеше Стамбулға бардық. Алдымен Сұлтанахметті араладық, сосын мейрамханада балық жедік. Кешке паромнан Босфорды көрдік. Тамаша күн болды." },
    questions: [
      { q: "İlk önce nereyi gezdiler?", options: ["Boğaz'ı", "Sultanahmet'i", "Çarşı'yı"], answer: 1 },
      { q: "Lokantada ne yediler?", options: ["Balık", "Köfte", "Pizza"], answer: 0 },
      { q: "Boğaz'ı neyle gördüler?", options: ["Otobüsle", "Vapurla", "Arabayla"], answer: 1 },
    ],
  },
  {
    id: "mutfak", title: "Türk Mutfağı", level: "B1", group: "b1", min: 7,
    text: "Türk mutfağı dünyanın en zengin mutfaklarından biridir. Her bölgenin kendine özgü yemekleri vardır. Kebap, dolma ve baklava en bilinen lezzetlerdendir. Türkler yemeği aileyle paylaşmayı sever.",
    tr: { ru: "Турецкая кухня — одна из самых богатых в мире. У каждого региона свои блюда. Кебаб, долма и баклава — самые известные. Турки любят делить еду с семьёй.", en: "Turkish cuisine is one of the richest in the world. Each region has its own dishes. Kebab, dolma and baklava are the best known. Turks love to share food with family.", kk: "Түрік асханасы әлемдегі ең бай асханалардың бірі. Әр аймақтың өз тағамдары бар. Кебаб, долма мен баклава ең танымал. Түріктер тамақты отбасымен бөлісуді жақсы көреді." },
    questions: [
      { q: "Türk mutfağı nasıl bir mutfaktır?", options: ["Fakir", "Zengin", "Sıradan"], answer: 1 },
      { q: "Hangisi en bilinen lezzetlerden değildir?", options: ["Kebap", "Baklava", "Sushi"], answer: 2 },
      { q: "Türkler yemeği nasıl sever?", options: ["Yalnız yemeyi", "Aileyle paylaşmayı", "Ayakta yemeyi"], answer: 1 },
    ],
  },
  {
    id: "isinma", title: "Küresel Isınma", level: "B2", group: "b2", min: 10,
    text: "Küresel ısınma günümüzün en büyük sorunlarından biridir. Ormanların azalması ve fabrikaların artması sıcaklıkları yükseltiyor. Uzmanlar, gerekli önlemler alınmazsa gelecekte ciddi sorunlar yaşanacağını söylüyor.",
    tr: { ru: "Глобальное потепление — одна из крупнейших проблем современности. Сокращение лесов и рост числа заводов повышают температуру. Эксперты говорят, что без мер в будущем будут серьёзные проблемы.", en: "Global warming is one of today's biggest problems. Shrinking forests and growing factories raise temperatures. Experts say that without measures, serious problems will arise in the future.", kk: "Жаһандық жылыну — бүгінгі ең үлкен мәселелердің бірі. Ормандардың азаюы мен зауыттардың көбеюі температураны көтереді. Сарапшылар шара қолданбаса, болашақта ауыр мәселелер болатынын айтады." },
    questions: [
      { q: "Sıcaklıkları ne yükseltiyor?", options: ["Ormanların artması", "Fabrikaların artması", "Yağmurlar"], answer: 1 },
      { q: "Uzmanlar ne söylüyor?", options: ["Sorun yok", "Önlem gerekmez", "Önlem alınmazsa sorun olur"], answer: 2 },
      { q: "Metnin konusu nedir?", options: ["Küresel ısınma", "Türk mutfağı", "Tatil"], answer: 0 },
    ],
  },
  {
    id: "egitim", title: "Eğitimin Geleceği", level: "C1", group: "c1", min: 10,
    text: "Teknolojinin gelişmesiyle eğitim anlayışı kökten değişmektedir. Yapay zekâ destekli platformlar, öğrencilere kişiselleştirilmiş bir öğrenme deneyimi sunmaktadır. Ancak bazı uzmanlar, yüz yüze etkileşimin yerini hiçbir teknolojinin tutamayacağını savunmaktadır.",
    tr: { ru: "С развитием технологий представление об образовании коренным образом меняется. Платформы на основе ИИ дают персонализированный опыт обучения. Однако некоторые эксперты считают, что живое общение незаменимо.", en: "With advancing technology, the idea of education is fundamentally changing. AI-powered platforms offer students a personalised learning experience. Yet some experts argue no technology can replace face-to-face interaction.", kk: "Технология дамыған сайын білім туралы түсінік түбегейлі өзгеруде. ЖИ негізіндегі платформалар жекелендірілген оқу тәжірибесін ұсынады. Алайда кейбір сарапшылар тікелей қарым-қатынасты ешбір технология алмастыра алмайды дейді." },
    questions: [
      { q: "Eğitimi ne değiştiriyor?", options: ["Teknoloji", "Hava durumu", "Nüfus"], answer: 0 },
      { q: "Yapay zekâ platformları ne sunuyor?", options: ["Standart eğitim", "Kişiselleştirilmiş deneyim", "Ücretsiz kitap"], answer: 1 },
      { q: "Bazı uzmanlar neyi savunuyor?", options: ["Teknoloji her şeydir", "Yüz yüze etkileşim önemlidir", "Eğitim gereksizdir"], answer: 1 },
    ],
  },
];

const TABS = [
  { id: "a", label: "A1–A2" },
  { id: "b1", label: "B1" },
  { id: "b2", label: "B2" },
  { id: "c1", label: "C1" },
] as const;

const T = {
  ru: { title: "Тренировка чтения", min: "мин", back: "К текстам", showTr: "Показать перевод", hideTr: "Скрыть перевод", correct: "Верно!", wrong: "Неверно", answer: "Правильный ответ" },
  en: { title: "Reading practice", min: "min", back: "To texts", showTr: "Show translation", hideTr: "Hide translation", correct: "Correct!", wrong: "Wrong", answer: "Correct answer" },
  tr: { title: "Okuma pratiği", min: "dk", back: "Metinlere dön", showTr: "Çeviriyi göster", hideTr: "Çeviriyi gizle", correct: "Doğru!", wrong: "Yanlış", answer: "Doğru cevap" },
  kk: { title: "Оқу жаттығуы", min: "мин", back: "Мәтіндерге", showTr: "Аударманы көрсету", hideTr: "Аударманы жасыру", correct: "Дұрыс!", wrong: "Қате", answer: "Дұрыс жауап" },
};

export default function ReadingPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("a");
  const [active, setActive] = useState<RText | null>(null);

  if (active) return <Reader text={active} c={c} locale={locale} onBack={() => setActive(null)} />;

  const list = TEXTS.filter((t) => t.group === tab);

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>

      <div className="mt-5 flex gap-2">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            type="button"
            onClick={() => setTab(tb.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === tb.id ? "bg-[var(--color-brand)] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {list.map((t) => (
          <button key={t.id} type="button" onClick={() => setActive(t)} className="glass flex items-center justify-between rounded-2xl p-4 text-left transition-shadow hover:shadow-md">
            <span className="flex items-center gap-3">
              <span className="text-lg">📖</span>
              <span className="text-sm font-medium text-[var(--color-foreground)]">{t.title}</span>
            </span>
            <span className="text-xs text-[var(--color-muted)]">{t.level} · {t.min} {c.min}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Reader({ text, c, locale, onBack }: { text: RText; c: (typeof T)["ru"]; locale: keyof typeof T; onBack: () => void }) {
  const [showTr, setShowTr] = useState(false);
  const [picked, setPicked] = useState<(number | null)[]>(() => Array(text.questions.length).fill(null));

  return (
    <div>
      <button type="button" onClick={onBack} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">← {c.back}</button>

      <div className="glass mt-4 rounded-3xl p-6">
        <h2 className="text-lg font-bold text-[var(--color-foreground)]">{text.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-foreground)]">{text.text}</p>

        {locale !== "tr" && (
          <>
            <button type="button" onClick={() => setShowTr((s) => !s)} className="mt-3 text-xs font-medium text-[var(--color-brand)] hover:underline">
              {showTr ? c.hideTr : c.showTr}
            </button>
            {showTr && (
              <p className="mt-2 rounded-xl bg-black/[0.03] p-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {text.tr[locale as "ru" | "en" | "kk"]}
              </p>
            )}
          </>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {text.questions.map((q, qi) => {
          const sel = picked[qi];
          return (
            <div key={qi} className="glass rounded-2xl p-5">
              <div className="text-sm font-semibold text-[var(--color-foreground)]">{q.q}</div>
              <div className="mt-3 grid gap-2">
                {q.options.map((opt, oi) => {
                  const answered = sel !== null;
                  const isCorrect = oi === q.answer;
                  const isPicked = oi === sel;
                  let cls = "border-black/[0.08] bg-black/[0.02] text-[var(--color-foreground)] hover:border-black/[0.16]";
                  if (answered && isCorrect) cls = "border-[#16a34a] bg-[#16a34a]/[0.08] text-[var(--color-foreground)]";
                  else if (answered && isPicked) cls = "border-[#dc2626] bg-[#dc2626]/[0.06] text-[var(--color-foreground)]";
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={answered}
                      onClick={() => setPicked((p) => p.map((v, j) => (j === qi ? oi : v)))}
                      className={`rounded-xl border px-4 py-2.5 text-left text-sm transition-all disabled:cursor-default ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {sel !== null && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs font-medium">
                  {sel === q.answer ? (
                    <span className="text-[#16a34a]">✅ {c.correct}</span>
                  ) : (
                    <span className="text-[#dc2626]">❌ {c.wrong} · {c.answer}: {q.options[q.answer]}</span>
                  )}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
