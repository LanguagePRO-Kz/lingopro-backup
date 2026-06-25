"use client";

import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { useExam } from "@/lib/exam-context";
import { Reveal } from "./ui/Reveal";

type Review = { name: string; city: string; level: string; text: string };
type Content = { heading: string; ratingLabel: string; reviews: Review[] };

const CONTENT: { ru: Content; en: Content; tr: Content; kk: Content } = {
  ru: {
    heading: "Отзывы студентов",
    ratingLabel: "средняя оценка студентов",
    reviews: [
      { name: "Айгерим", city: "Алматы", level: "B2", text: "Диагностика честно показала уровень, а план реально подстраивался под мой график. За 2 месяца подтянула грамматику." },
      { name: "Тимур", city: "Ташкент", level: "B1", text: "Speaking-практика — топ. Раньше боялся говорить, сейчас спокойно отвечаю на пробных." },
      { name: "Дария", city: "Астана", level: "C1", text: "AI-преподаватель объясняет ошибки понятнее, чем многие учебники. Очень помогло с падежами." },
      { name: "Бекзат", city: "Бишкек", level: "B2", text: "Пробные экзамены в формате TÖMER убрали стресс. На реальном уже знал, чего ждать." },
      { name: "Камилла", city: "Баку", level: "B1", text: "Нравится система серий и XP — реально мотивирует заниматься каждый день." },
      { name: "Артём", city: "Алматы", level: "B2", text: "Проверка письма с объяснениями — то, чего не хватало. Виден прогресс по неделям." },
    ],
  },
  en: {
    heading: "Student reviews",
    ratingLabel: "average student rating",
    reviews: [
      { name: "Aigerim", city: "Almaty", level: "B2", text: "The diagnostic honestly showed my level, and the plan really adapted to my schedule. In 2 months I improved my grammar." },
      { name: "Timur", city: "Tashkent", level: "B1", text: "Speaking practice is top. I used to be afraid to talk, now I answer calmly on mocks." },
      { name: "Daria", city: "Astana", level: "C1", text: "The AI tutor explains mistakes more clearly than many textbooks. It really helped with cases." },
      { name: "Bekzat", city: "Bishkek", level: "B2", text: "Mock exams in the TÖMER format removed the stress. At the real one I already knew what to expect." },
      { name: "Kamilla", city: "Baku", level: "B1", text: "I love the streaks and XP — it really motivates me to study every day." },
      { name: "Artyom", city: "Almaty", level: "B2", text: "Writing review with explanations was exactly what I was missing. You can see weekly progress." },
    ],
  },
  tr: {
    heading: "Öğrenci yorumları",
    ratingLabel: "ortalama öğrenci puanı",
    reviews: [
      { name: "Aigerim", city: "Almatı", level: "B2", text: "Tanı seviyemi dürüstçe gösterdi ve plan programıma gerçekten uyum sağladı. 2 ayda dil bilgimi geliştirdim." },
      { name: "Timur", city: "Taşkent", level: "B1", text: "Konuşma pratiği harika. Eskiden konuşmaktan korkardım, şimdi denemelerde rahatça cevap veriyorum." },
      { name: "Daria", city: "Astana", level: "C1", text: "AI öğretmen hataları çoğu kitaptan daha net açıklıyor. Hâl ekleriyle çok yardımcı oldu." },
      { name: "Bekzat", city: "Bişkek", level: "B2", text: "TÖMER formatındaki denemeler stresi aldı. Gerçeğinde ne bekleyeceğimi biliyordum." },
      { name: "Kamilla", city: "Bakü", level: "B1", text: "Seri ve XP sistemini seviyorum — her gün çalışmak için gerçekten motive ediyor." },
      { name: "Artyom", city: "Almatı", level: "B2", text: "Açıklamalı yazma değerlendirmesi tam ihtiyacım olan şeydi. Haftalık ilerleme görünüyor." },
    ],
  },
  kk: {
    heading: "Студенттер пікірлері",
    ratingLabel: "студенттердің орташа бағасы",
    reviews: [
      { name: "Айгерім", city: "Алматы", level: "B2", text: "Диагностика деңгейімді шынайы көрсетті, жоспар кестеме нақты бейімделді. 2 айда грамматиканы жақсарттым." },
      { name: "Тимур", city: "Ташкент", level: "B1", text: "Speaking практикасы — керемет. Бұрын сөйлеуден қорқатынмын, енді сынақтарда еркін жауап беремін." },
      { name: "Дария", city: "Астана", level: "C1", text: "AI-мұғалім қателерді көп оқулықтан түсінікті түсіндіреді. Септіктерге қатты көмектесті." },
      { name: "Бекзат", city: "Бішкек", level: "B2", text: "TÖMER форматындағы сынақтар стрессті азайтты. Нақты емтиханда не күтерімді білдім." },
      { name: "Камилла", city: "Баку", level: "B1", text: "Серия мен XP жүйесі ұнайды — күн сайын оқуға шынымен ынталандырады." },
      { name: "Артём", city: "Алматы", level: "B2", text: "Түсіндірмесі бар жазбаны тексеру — жетіспей тұрған нәрсе еді. Апта сайынғы прогресс көрінеді." },
    ],
  },
};

const GRADIENTS = [
  "from-[#6d5bff] to-[#5b8cff]",
  "from-[#19c6b3] to-[#5b8cff]",
  "from-[#5b8cff] to-[#6d5bff]",
  "from-[#6d5bff] to-[#19c6b3]",
  "from-[#5b8cff] to-[#19c6b3]",
  "from-[#19c6b3] to-[#6d5bff]",
];

export function Reviews() {
  const { locale } = useI18n();
  const { exam } = useExam();
  const c = pick(locale, CONTENT);

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.heading}</h2>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[var(--color-brand-3)]">★★★★★</span>
            <span className="text-sm font-semibold text-[var(--color-foreground)]">4.8</span>
            <span className="text-sm text-[var(--color-muted)]">{c.ratingLabel}</span>
          </div>
        </Reveal>

        {/* horizontal scroll on mobile, grid on desktop */}
        <Reveal className="mt-12">
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:overflow-visible">
            {c.reviews.map((r, i) => (
              <article
                key={r.name + r.city}
                className="glass flex w-[85%] shrink-0 snap-start flex-col gap-4 rounded-3xl p-6 sm:w-[60%] lg:w-auto"
              >
                <p className="text-sm leading-relaxed text-[var(--color-foreground)]">“{r.text}”</p>
                <div className="mt-auto flex items-center gap-3 border-t border-black/[0.06] pt-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} text-sm font-bold text-white`}
                  >
                    {r.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[var(--color-foreground)]">{r.name}</div>
                    <div className="text-xs text-[var(--color-muted)]">{r.city}</div>
                  </div>
                  <span className="rounded-full bg-[var(--color-brand-2)]/15 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-brand-2)]">
                    {exam.name} · {r.level}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
