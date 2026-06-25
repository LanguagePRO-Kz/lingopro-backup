"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useI18n, type Locale } from "@/lib/i18n";
import { pick } from "@/lib/localized";

function speakSeq(lines: string[], onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  lines.forEach((line, i) => {
    const u = new SpeechSynthesisUtterance(line);
    u.lang = "tr-TR";
    u.rate = 0.9;
    if (i === lines.length - 1 && onEnd) u.onend = onEnd;
    window.speechSynthesis.speak(u);
  });
}

type Q = { q: string; options: string[]; answer: number };
type Ex = { id: string; title: string; level: string; min: number; lines: string[]; questions: Q[] };

const EXERCISES: Ex[] = [
  {
    id: "shop", title: "Mağazada", level: "A2", min: 4,
    lines: ["— Merhaba, bu gömlek kaç para?", "— İki yüz lira efendim.", "— Biraz pahalı, indirim var mı?", "— Sizin için yüz seksen olsun."],
    questions: [
      { q: "Gömlek kaç para?", options: ["100 lira", "180 lira", "200 lira"], answer: 2 },
      { q: "İndirimli fiyat ne kadar?", options: ["180 lira", "150 lira", "200 lira"], answer: 0 },
    ],
  },
  {
    id: "cafe", title: "Kafede", level: "A2", min: 4,
    lines: ["— Ne içmek istersiniz?", "— Bir çay lütfen.", "— Yanında bir şey ister misiniz?", "— Hayır, teşekkürler."],
    questions: [
      { q: "Müşteri ne içmek istiyor?", options: ["Kahve", "Çay", "Su"], answer: 1 },
      { q: "Yanında bir şey istiyor mu?", options: ["Evet", "Hayır", "Bilmiyor"], answer: 1 },
    ],
  },
  {
    id: "directions", title: "Yol tarifi", level: "B1", min: 5,
    lines: ["— Affedersiniz, postane nerede?", "— Düz gidin, sonra sağa dönün.", "— Ne kadar uzak?", "— Yaklaşık beş dakika yürüyün."],
    questions: [
      { q: "Postane için nereye dönmeli?", options: ["Sola", "Sağa", "Geriye"], answer: 1 },
      { q: "Ne kadar yürümeli?", options: ["5 dakika", "10 dakika", "15 dakika"], answer: 0 },
    ],
  },
  {
    id: "phone", title: "Telefon görüşmesi", level: "B1", min: 5,
    lines: ["— Alo, Ali orada mı?", "— Hayır, şu an dışarıda.", "— Ne zaman döner?", "— Akşam saat yedide döner."],
    questions: [
      { q: "Ali şu an nerede?", options: ["Evde", "Dışarıda", "İşte"], answer: 1 },
      { q: "Ali ne zaman döner?", options: ["Saat 5'te", "Saat 7'de", "Yarın"], answer: 1 },
    ],
  },
  {
    id: "weather", title: "Hava durumu", level: "B2", min: 6,
    lines: ["Bugün hava parçalı bulutlu olacak.", "Sıcaklık yirmi beş derece civarında.", "Akşam saatlerinde yağmur bekleniyor.", "Yarın hava daha güneşli olacak."],
    questions: [
      { q: "Bugün akşam ne bekleniyor?", options: ["Kar", "Yağmur", "Rüzgâr"], answer: 1 },
      { q: "Yarın hava nasıl olacak?", options: ["Yağmurlu", "Güneşli", "Bulutlu"], answer: 1 },
    ],
  },
];

const T = {
  ru: { title: "Тренировка аудирования", sub: "Слушай турецкую речь и отвечай на вопросы", min: "мин", back: "К списку", play: "Прослушать", playing: "Воспроизведение…", showText: "Показать текст", hideText: "Скрыть текст", correct: "Верно!", wrong: "Неверно", answer: "Правильный ответ" },
  en: { title: "Listening practice", sub: "Listen to Turkish speech and answer", min: "min", back: "To list", play: "Play audio", playing: "Playing…", showText: "Show transcript", hideText: "Hide transcript", correct: "Correct!", wrong: "Wrong", answer: "Correct answer" },
  tr: { title: "Dinleme pratiği", sub: "Türkçe dinle ve soruları cevapla", min: "dk", back: "Listeye dön", play: "Dinle", playing: "Çalıyor…", showText: "Metni göster", hideText: "Metni gizle", correct: "Doğru!", wrong: "Yanlış", answer: "Doğru cevap" },
  kk: { title: "Тыңдалым жаттығуы", sub: "Түрік тілін тыңда да жауап бер", min: "мин", back: "Тізімге", play: "Тыңдау", playing: "Ойнатылуда…", showText: "Мәтінді көрсету", hideText: "Мәтінді жасыру", correct: "Дұрыс!", wrong: "Қате", answer: "Дұрыс жауап" },
};

export default function ListeningPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [active, setActive] = useState<Ex | null>(null);

  if (active) return <Player ex={active} c={c} onBack={() => setActive(null)} />;

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{c.sub}</p>
      <div className="mt-5 flex flex-col gap-3">
        {EXERCISES.map((e) => (
          <button key={e.id} type="button" onClick={() => setActive(e)} className="glass flex items-center justify-between rounded-2xl p-4 text-left transition-shadow hover:shadow-md">
            <span className="flex items-center gap-3">
              <span className="text-lg">🎧</span>
              <span className="text-sm font-medium text-[var(--color-foreground)]">{e.title}</span>
            </span>
            <span className="text-xs text-[var(--color-muted)]">{e.level} · {e.min} {c.min}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Player({ ex, c, onBack }: { ex: Ex; c: (typeof T)[Locale]; onBack: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [showText, setShowText] = useState(false);
  const [picked, setPicked] = useState<(number | null)[]>(() => Array(ex.questions.length).fill(null));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      window.speechSynthesis?.cancel();
    };
  }, []);

  function play() {
    setPlaying(true);
    speakSeq(ex.lines, () => mounted.current && setPlaying(false));
  }

  return (
    <div>
      <button type="button" onClick={onBack} className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]">← {c.back}</button>

      <div className="glass mt-4 rounded-3xl p-6 text-center">
        <h2 className="text-lg font-bold text-[var(--color-foreground)]">🎧 {ex.title}</h2>
        <button
          type="button"
          onClick={play}
          className="mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-2xl text-white shadow-[0_12px_40px_-8px_rgba(109,91,255,0.6)] transition-transform active:scale-95"
        >
          {playing ? "⏸" : "▶"}
        </button>
        <div className="mt-3 text-xs text-[var(--color-muted)]">{playing ? c.playing : c.play}</div>

        <button type="button" onClick={() => setShowText((s) => !s)} className="mt-3 text-xs font-medium text-[var(--color-brand)] hover:underline">
          {showText ? c.hideText : c.showText}
        </button>
        {showText && (
          <div className="mt-2 rounded-xl bg-black/[0.03] p-3 text-left text-sm leading-relaxed text-[var(--color-foreground)]">
            {ex.lines.map((l, i) => <p key={i}>{l}</p>)}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {ex.questions.map((q, qi) => {
          const sel = picked[qi];
          return (
            <div key={qi} className="glass rounded-2xl p-5">
              <div className="text-sm font-semibold text-[var(--color-foreground)]">{q.q}</div>
              <div className="mt-3 grid gap-2">
                {q.options.map((opt, oi) => {
                  const answered = sel !== null;
                  let cls = "border-black/[0.08] bg-black/[0.02] text-[var(--color-foreground)] hover:border-black/[0.16]";
                  if (answered && oi === q.answer) cls = "border-[#16a34a] bg-[#16a34a]/[0.08]";
                  else if (answered && oi === sel) cls = "border-[#dc2626] bg-[#dc2626]/[0.06]";
                  return (
                    <button key={oi} type="button" disabled={answered} onClick={() => setPicked((p) => p.map((v, j) => (j === qi ? oi : v)))} className={`rounded-xl border px-4 py-2.5 text-left text-sm transition-all disabled:cursor-default ${cls}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {sel !== null && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs font-medium">
                  {sel === q.answer ? <span className="text-[#16a34a]">✅ {c.correct}</span> : <span className="text-[#dc2626]">❌ {c.wrong} · {c.answer}: {q.options[q.answer]}</span>}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
