"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n, type Locale } from "@/lib/i18n";
import { pick } from "@/lib/localized";

type Loc = Record<Locale, string>;
type Ex = { q: string; options: string[]; answer: number };
type GTopic = { id: string; name: Loc; rule: Loc; examples: string[]; ex: Ex[] };

const GROUPS: { id: string; label: string; topics: GTopic[] }[] = [
  {
    id: "a",
    label: "A1–A2",
    topics: [
      {
        id: "present",
        name: { ru: "Настоящее время (-yor)", en: "Present tense (-yor)", tr: "Şimdiki zaman (-yor)", kk: "Осы шақ (-yor)" },
        rule: { ru: "Суффикс -yor показывает действие в процессе: gel-iyor (идёт), oku-yor (читает).", en: "The -yor suffix marks an ongoing action: gel-iyor (is coming), oku-yor (is reading).", tr: "-yor eki sürmekte olan eylemi gösterir: geliyor, okuyor.", kk: "-yor жұрнағы жалғасып жатқан әрекетті білдіреді: geliyor, okuyor." },
        examples: ["Ben kitap okuyorum.", "O şimdi geliyor."],
        ex: [
          { q: "Ben okula gid___.", options: ["iyorum", "dim", "ecek"], answer: 0 },
          { q: "Onlar yemek ye___.", options: ["di", "iyor", "ecek"], answer: 1 },
          { q: "Sen ne yap___?", options: ["ıyorsun", "tın", "acaksın"], answer: 0 },
        ],
      },
      {
        id: "past",
        name: { ru: "Прошедшее время (-di)", en: "Past tense (-di)", tr: "Görülen geçmiş zaman (-di)", kk: "Өткен шақ (-di)" },
        rule: { ru: "Суффикс -di обозначает завершённое действие: git-ti (ушёл), gör-dü (увидел).", en: "The -di suffix marks a completed action: git-ti (went), gör-dü (saw).", tr: "-di eki tamamlanmış eylemi gösterir: gitti, gördü.", kk: "-di жұрнағы аяқталған әрекетті білдіреді: gitti, gördü." },
        examples: ["Dün sinemaya gittim.", "O beni gördü."],
        ex: [
          { q: "Dün akşam eve geç gel___.", options: ["iyorum", "dim", "ecek"], answer: 1 },
          { q: "O kitabı oku___.", options: ["du", "yor", "acak"], answer: 0 },
          { q: "Biz maçı izle___.", options: ["dik", "yoruz", "yeceğiz"], answer: 0 },
        ],
      },
      {
        id: "future",
        name: { ru: "Будущее время (-ecek)", en: "Future tense (-ecek)", tr: "Gelecek zaman (-ecek)", kk: "Келер шақ (-ecek)" },
        rule: { ru: "Суффикс -ecek/-acak обозначает будущее: gel-ecek (придёт), yap-acak (сделает).", en: "The -ecek/-acak suffix marks the future: gel-ecek (will come).", tr: "-ecek/-acak eki gelecek zamanı gösterir: gelecek, yapacak.", kk: "-ecek/-acak жұрнағы келер шақты білдіреді: gelecek, yapacak." },
        examples: ["Yarın geleceğim.", "O sınava girecek."],
        ex: [
          { q: "Yarın seni ara___.", options: ["dım", "yorum", "yacağım"], answer: 2 },
          { q: "Onlar tatile gid___.", options: ["ecek", "di", "iyor"], answer: 0 },
          { q: "Biz yarın çalış___.", options: ["acağız", "tık", "ıyoruz"], answer: 0 },
        ],
      },
      {
        id: "cases",
        name: { ru: "Падежи (-e, -de, -den)", en: "Cases (-e, -de, -den)", tr: "Hâller (-e, -de, -den)", kk: "Септіктер (-e, -de, -den)" },
        rule: { ru: "-e (куда), -de (где), -den (откуда): eve (домой), evde (дома), evden (из дома).", en: "-e (to), -de (at), -den (from): eve (home), evde (at home), evden (from home).", tr: "-e (yönelme), -de (bulunma), -den (ayrılma): eve, evde, evden.", kk: "-e (барыс), -de (жатыс), -den (шығыс): eve, evde, evden." },
        examples: ["Okula gidiyorum.", "Evde kaldım.", "İşten geliyorum."],
        ex: [
          { q: "Ben okul___ gidiyorum.", options: ["a", "da", "dan"], answer: 0 },
          { q: "Kitap masa___ duruyor.", options: ["ya", "da", "dan"], answer: 1 },
          { q: "O iş___ çıktı.", options: ["e", "te", "ten"], answer: 2 },
        ],
      },
      {
        id: "plural",
        name: { ru: "Множественное число (-ler, -lar)", en: "Plural (-ler, -lar)", tr: "Çoğul (-ler, -lar)", kk: "Көпше (-ler, -lar)" },
        rule: { ru: "-ler/-lar по гармонии гласных: ev-ler (дома), kitap-lar (книги).", en: "-ler/-lar by vowel harmony: ev-ler (houses), kitap-lar (books).", tr: "-ler/-lar ünlü uyumuna göre: evler, kitaplar.", kk: "-ler/-lar дауысты үндестігі бойынша: evler, kitaplar." },
        examples: ["Öğrenciler geldi.", "Arabalar hızlı."],
        ex: [
          { q: "İki kitap → kitap___.", options: ["lar", "ler", "lür"], answer: 0 },
          { q: "Üç ev → ev___.", options: ["lar", "ler", "lür"], answer: 1 },
          { q: "Çok çiçek → çiçek___.", options: ["lar", "ler", "lor"], answer: 1 },
        ],
      },
      {
        id: "negation",
        name: { ru: "Отрицание (değil, -me/-ma)", en: "Negation (değil, -me/-ma)", tr: "Olumsuzluk (değil, -me/-ma)", kk: "Болымсыздық (değil, -me/-ma)" },
        rule: { ru: "değil отрицает именное сказуемое; -me/-ma — глагол: gelmiyorum (не иду).", en: "değil negates nouns; -me/-ma negates verbs: gelmiyorum (I'm not coming).", tr: "değil ad cümlesini, -me/-ma fiili olumsuz yapar: gelmiyorum.", kk: "değil есім баяндауышты, -me/-ma етістікті болымсыз етеді: gelmiyorum." },
        examples: ["Ben öğrenci değilim.", "Bugün gelmiyorum."],
        ex: [
          { q: "Ben yorgun ___.", options: ["değilim", "yorum", "dim"], answer: 0 },
          { q: "O bugün gel___yor.", options: ["mi", "me", "ma"], answer: 0 },
          { q: "Biz orada ___.", options: ["değiliz", "yoruz", "dik"], answer: 0 },
        ],
      },
    ],
  },
  {
    id: "b",
    label: "B1–B2",
    topics: [
      {
        id: "conditional",
        name: { ru: "Условное наклонение (-se/-sa)", en: "Conditional (-se/-sa)", tr: "Şart kipi (-se/-sa)", kk: "Шартты рай (-se/-sa)" },
        rule: { ru: "-se/-sa = «если»: gelir-se (если придёт), olur-sa (если будет).", en: "-se/-sa = “if”: gelir-se (if he comes), olur-sa (if it happens).", tr: "-se/-sa «eğer» anlamı verir: gelirse, olursa.", kk: "-se/-sa «егер» мағынасын береді: gelirse, olursa." },
        examples: ["Hava güzel olursa gezeriz.", "Çalışırsan başarırsın."],
        ex: [
          { q: "Yağmur yağar___ evde kalırız.", options: ["sa", "dı", "yor"], answer: 0 },
          { q: "Çok çalışır___ kazanırsın.", options: ["sen", "din", "ecek"], answer: 0 },
          { q: "Vaktin ol___ gel.", options: ["ursa", "du", "acak"], answer: 0 },
        ],
      },
      {
        id: "participles",
        name: { ru: "Причастия", en: "Participles", tr: "Ortaçlar (sıfat-fiil)", kk: "Есімше" },
        rule: { ru: "Причастия -an/-en, -dik, -ecek превращают глагол в определение: gelen adam (пришедший человек).", en: "Participles -an/-en, -dik, -ecek turn verbs into modifiers: gelen adam (the man who came).", tr: "Ortaçlar (-an/-en, -dik, -ecek) fiili sıfat yapar: gelen adam.", kk: "Есімше (-an/-en, -dik, -ecek) етістікті анықтауышқа айналдырады: gelen adam." },
        examples: ["Koşan çocuk düştü.", "Okuduğum kitap güzeldi."],
        ex: [
          { q: "Gel___ adam benim babam.", options: ["en", "di", "ecek"], answer: 0 },
          { q: "Oku___ım kitap ilginçti.", options: ["duğ", "yor", "acak"], answer: 0 },
          { q: "Yarın gel___ misafirler.", options: ["ecek", "di", "miş"], answer: 0 },
        ],
      },
      {
        id: "reported",
        name: { ru: "Косвенная речь (-miş)", en: "Reported speech (-miş)", tr: "Öğrenilen geçmiş (-miş)", kk: "Жанама сөз (-miş)" },
        rule: { ru: "-miş передаёт пересказ/слух: gelmiş (говорят, пришёл).", en: "-miş conveys hearsay: gelmiş (apparently he came).", tr: "-miş duyulan/aktarılan eylemi gösterir: gelmiş.", kk: "-miş естілген/баяндалған әрекетті білдіреді: gelmiş." },
        examples: ["Ali gelmiş.", "Hava çok soğukmuş."],
        ex: [
          { q: "Duyduğuma göre o git___.", options: ["miş", "ti", "yor"], answer: 0 },
          { q: "Onlar evi sat___.", options: ["mış", "tı", "acak"], answer: 0 },
          { q: "Hava soğuk___.", options: ["muş", "tu", "yor"], answer: 0 },
        ],
      },
      {
        id: "compound",
        name: { ru: "Составные времена", en: "Compound tenses", tr: "Birleşik zamanlar", kk: "Күрделі шақтар" },
        rule: { ru: "İdi/imiş добавляют второй слой времени: geliyordu (он шёл тогда).", en: "İdi/imiş add a second time layer: geliyordu (he was coming).", tr: "İdi/imiş ikinci bir zaman katmanı ekler: geliyordu.", kk: "İdi/imiş екінші уақыт қабатын қосады: geliyordu." },
        examples: ["Ben okuyordum.", "O gelmişti."],
        ex: [
          { q: "Ben o sırada uyu___.", options: ["yordum", "dum", "muşum"], answer: 0 },
          { q: "O ben gelmeden git___.", options: ["mişti", "iyor", "ecek"], answer: 0 },
          { q: "Biz bunu konuş___.", options: ["muştuk", "uyoruz", "acağız"], answer: 0 },
        ],
      },
      {
        id: "passive",
        name: { ru: "Пассивный залог", en: "Passive voice", tr: "Edilgen çatı", kk: "Ырықсыз етіс" },
        rule: { ru: "-il/-in делает глагол страдательным: yapıldı (было сделано), yazıldı (написано).", en: "-il/-in makes the verb passive: yapıldı (was done), yazıldı (was written).", tr: "-il/-in fiili edilgen yapar: yapıldı, yazıldı.", kk: "-il/-in етістікті ырықсыз етеді: yapıldı, yazıldı." },
        examples: ["Ev satıldı.", "Mektup yazıldı."],
        ex: [
          { q: "Kapı aç___.", options: ["ıldı", "tı", "ıyor"], answer: 0 },
          { q: "Yemek pişir___.", options: ["ildi", "di", "ecek"], answer: 0 },
          { q: "Bu kitap çok oku___.", options: ["nuyor", "du", "acak"], answer: 0 },
        ],
      },
    ],
  },
];

const T = {
  ru: { title: "Грамматика турецкого", rule: "Правило", examples: "Примеры", done: "выполнено", check: "Проверь себя" },
  en: { title: "Turkish grammar", rule: "Rule", examples: "Examples", done: "done", check: "Check yourself" },
  tr: { title: "Türkçe dil bilgisi", rule: "Kural", examples: "Örnekler", done: "tamamlandı", check: "Kendini test et" },
  kk: { title: "Түрік грамматикасы", rule: "Ереже", examples: "Мысалдар", done: "орындалды", check: "Өзіңді тексер" },
};

export default function GrammarPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>

      <div className="mt-6 flex flex-col gap-6">
        {GROUPS.map((g) => (
          <div key={g.id}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{g.label}</div>
            <div className="flex flex-col gap-2">
              {g.topics.map((topic) => (
                <Topic key={topic.id} topic={topic} c={c} locale={locale} open={open === topic.id} onToggle={() => setOpen(open === topic.id ? null : topic.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Topic({ topic, c, locale, open, onToggle }: { topic: GTopic; c: (typeof T)["ru"]; locale: Locale; open: boolean; onToggle: () => void }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => Array(topic.ex.length).fill(null));
  const doneCount = picked.filter((p, i) => p === topic.ex[i].answer).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white/60">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-black/[0.02]">
        <span className="text-sm font-semibold text-[var(--color-foreground)]">{topic.name[locale]}</span>
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--color-brand)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-brand)]">{doneCount}/{topic.ex.length} {c.done}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-[var(--color-muted)]">▾</motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} className="overflow-hidden">
            <div className="border-t border-black/[0.06] px-5 py-5">
              <div className="rounded-xl bg-[var(--color-brand)]/[0.05] p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)]">{c.rule}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-foreground)]">{topic.rule[locale]}</p>
                <div className="mt-2 flex flex-col gap-0.5">
                  {topic.examples.map((e) => (
                    <span key={e} className="text-sm text-[var(--color-muted)]">• {e}</span>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{c.check}</div>
              <div className="mt-3 flex flex-col gap-3">
                {topic.ex.map((ex, ei) => {
                  const sel = picked[ei];
                  return (
                    <div key={ei}>
                      <div className="text-sm font-medium text-[var(--color-foreground)]">{ex.q}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {ex.options.map((opt, oi) => {
                          const answered = sel !== null;
                          let cls = "border-black/[0.1] bg-black/[0.02] text-[var(--color-foreground)] hover:border-black/[0.18]";
                          if (answered && oi === ex.answer) cls = "border-[#16a34a] bg-[#16a34a]/[0.08]";
                          else if (answered && oi === sel) cls = "border-[#dc2626] bg-[#dc2626]/[0.06]";
                          return (
                            <button key={oi} type="button" disabled={answered} onClick={() => setPicked((p) => p.map((v, j) => (j === ei ? oi : v)))} className={`rounded-lg border px-3 py-1.5 text-sm transition-all disabled:cursor-default ${cls}`}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
