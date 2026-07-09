"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

type Content = { eyebrow: string; title: string; subtitle: string; items: { q: string; a: string }[] };

const CONTENT: { ru: Content; en: Content; tr: Content; kk: Content } = {
  ru: {
    eyebrow: "Вопросы",
    title: "Частые вопросы",
    subtitle: "Коротко о главном — без громких обещаний.",
    items: [
      {
        q: "Чем LingoPRO отличается от других платформ?",
        a: "Большинство платформ — это просто тесты. У нас AI разбирает каждый ответ, строит честный план под твою цель и дату экзамена, адаптирует программу под слабые зоны и ведёт тебя до самой сдачи.",
      },
      {
        q: "Точно ли AI оценивает как реальный экзаменатор?",
        a: "Все задания и критерии оценки построены строго по формату TÖMER. На Writing и Speaking ты получаешь детальный разбор по экзаменационным критериям с конкретными рекомендациями — что и как исправить.",
      },
      {
        q: "Можно ли подготовиться с нуля?",
        a: "Да. Платформа строит маршрут с нуля до C1 и честно считает срок под твой темп — без сказок про «C1 за месяц». Пройди бесплатную диагностику и увидишь свой реальный срок.",
      },
      {
        q: "Какие экзамены доступны?",
        a: "Сейчас — TÖMER (турецкий). TOPIK, HSK и JLPT — следующие на очереди.",
      },
      {
        q: "Это подписка с автосписанием?",
        a: "Нет. Ты берёшь пакет на 1, 3 или 6 месяцев — разовая оплата, ничего не списывается автоматически. Закончился срок — сам решаешь, продлевать или нет.",
      },
      {
        q: "LingoPRO — официальный партнёр TÖMER?",
        a: "Нет, мы не аффилированы с TÖMER и не выдаём сертификаты. Мы делаем другое: задания, структура и критерии оценки построены строго по формату экзамена — ты тренируешься в тех же условиях, что встретишь на сдаче.",
      },
    ],
  },
  en: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    subtitle: "The essentials — without overblown promises.",
    items: [
      { q: "How is LingoPRO different from other platforms?", a: "Most platforms are just tests. Our AI breaks down every answer, builds an honest plan around your goal and exam date, adapts the program to your weak areas and walks you all the way to exam day." },
      { q: "Does the AI really score like a real examiner?", a: "Every task and scoring rubric is built strictly around the TÖMER format. For Writing and Speaking you get a detailed criterion-by-criterion breakdown with concrete fixes." },
      { q: "Can I prepare from scratch?", a: "Yes. The platform builds a route from zero to C1 and honestly computes the timeline for your pace — no “C1 in a month” fairy tales. Take the free diagnostic and see your real timeline." },
      { q: "Which exams are available?", a: "TÖMER (Turkish) is available now. TOPIK, HSK and JLPT are next in line." },
      { q: "Is this an auto-renewing subscription?", a: "No. You get a 1, 3 or 6-month package — a one-time payment, nothing is charged automatically. When it ends, renewing is your call." },
      { q: "Is LingoPRO an official TÖMER partner?", a: "No — we're not affiliated with TÖMER and we don't issue certificates. What we do: tasks, structure and scoring criteria built strictly around the exam format, so you train in the same conditions you'll face on exam day." },
    ],
  },
  tr: {
    eyebrow: "SSS",
    title: "Sık sorulan sorular",
    subtitle: "Önemli noktalar — abartılı vaatler olmadan.",
    items: [
      { q: "LingoPRO diğer platformlardan nasıl farklı?", a: "Çoğu platform sadece testtir. Bizim AI her cevabı analiz eder, hedefine ve sınav tarihine göre dürüst bir plan kurar, programı zayıf alanlarına uyarlar ve seni sınav gününe kadar götürür." },
      { q: "AI gerçekten gerçek bir sınav görevlisi gibi mi puanlıyor?", a: "Tüm görevler ve puanlama kriterleri birebir TÖMER formatına göre kurulmuştur. Writing ve Speaking'de kriter bazında ayrıntılı bir analiz ve somut düzeltme önerileri alırsın." },
      { q: "Sıfırdan hazırlanabilir miyim?", a: "Evet. Platform sıfırdan C1'e bir rota kurar ve süreyi temposuna göre dürüstçe hesaplar — “bir ayda C1” masalı yok. Ücretsiz teşhisi tamamla, gerçek süreni gör." },
      { q: "Hangi sınavlar mevcut?", a: "Şu anda TÖMER (Türkçe) mevcut. Sırada TOPIK, HSK ve JLPT var." },
      { q: "Bu otomatik yenilenen bir abonelik mi?", a: "Hayır. 1, 3 veya 6 aylık bir paket alırsın — tek seferlik ödeme, otomatik tahsilat yok. Süre bitince uzatıp uzatmamak senin kararın." },
      { q: "LingoPRO resmi bir TÖMER ortağı mı?", a: "Hayır — TÖMER ile bağlantılı değiliz ve sertifika vermiyoruz. Yaptığımız şu: görevler, yapı ve puanlama kriterleri birebir sınav formatına göre kurulu — sınav günü karşılaşacağın koşullarda çalışırsın." },
    ],
  },
  kk: {
    eyebrow: "Сұрақтар",
    title: "Жиі қойылатын сұрақтар",
    subtitle: "Ең бастысы туралы қысқаша — артық уәдесіз.",
    items: [
      { q: "LingoPRO басқа платформалардан несімен ерекшеленеді?", a: "Көп платформа — жай тесттер. Бізде AI әр жауапты талдайды, мақсатың мен емтихан күніне сай адал жоспар құрады, бағдарламаны әлсіз тұстарыңа бейімдейді және емтихан күніне дейін жетелейді." },
      { q: "AI шынымен нағыз емтихан қабылдаушыдай бағалай ма?", a: "Барлық тапсырмалар мен бағалау критерийлері қатаң түрде TÖMER форматына сай құрылған. Writing және Speaking бойынша критерийлер негізінде егжей-тегжейлі талдау мен нақты ұсыныстар аласың." },
      { q: "Нөлден дайындалуға бола ма?", a: "Иә. Платформа нөлден C1-ге дейін маршрут құрады және мерзімді қарқыныңа қарай адал есептейді — «бір айда C1» деген ертегісіз. Тегін диагностикадан өт — нақты мерзіміңді көресің." },
      { q: "Қандай емтихандар қолжетімді?", a: "Қазір — TÖMER (түрік). Кезекте TOPIK, HSK және JLPT." },
      { q: "Бұл автотөлемді жазылым ба?", a: "Жоқ. 1, 3 немесе 6 айлық пакет аласың — бір реттік төлем, ештеңе автоматты түрде шегерілмейді. Мерзім біткенде ұзарту-ұзартпау — өз шешімің." },
      { q: "LingoPRO — TÖMER-дің ресми серіктесі ме?", a: "Жоқ — біз TÖMER-мен аффилиирленбегенбіз және сертификат бермейміз. Біздің ісіміз: тапсырмалар, құрылым және бағалау критерийлері емтихан форматына қатаң сай — емтихандағыдай жағдайда жаттығасың." },
    ],
  },
};

export function FAQ() {
  const { locale } = useI18n();
  const c = pick(locale, CONTENT);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} />

        <Reveal className="mt-12 flex flex-col gap-3">
          {c.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="glass overflow-hidden rounded-2xl">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-[var(--color-foreground)] sm:text-base">{item.q}</span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/[0.04] text-[var(--color-brand)] transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--color-muted)]">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
