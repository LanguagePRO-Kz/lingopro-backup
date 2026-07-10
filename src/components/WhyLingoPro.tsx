"use client";

import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { SectionHeading } from "./ui/SectionHeading";
import { StaggerGroup, StaggerItem, Reveal } from "./ui/Reveal";
import { GraduationCap, Wallet, Clock, Crosshair, BadgeCheck } from "lucide-react";

/*
 * «Почему LingoPRO» — аргументы выгоды перед блоком цен. Все утверждения
 * честные, без выдуманных цифр; конкретные суммы (стоимость года foundation,
 * цена репетитора) добавим, когда основатель даст реальные данные —
 * слоты: тексты карточек ниже.
 * Foundation-аргумент — самый заметный (карточка на всю ширину).
 */

type Card = { title: string; text: string };
type Content = {
  eyebrow: string;
  title: string;
  subtitle: string;
  featured: Card;
  cards: [Card, Card, Card, Card];
};

const CONTENT: { ru: Content; en: Content; tr: Content; kk: Content } = {
  ru: {
    eyebrow: "Почему LingoPRO",
    title: "Зачем это тебе",
    subtitle: "Пять честных причин готовиться с нами.",
    featured: {
      title: "Не теряй год на foundation",
      text: "Сдай TÖMER заранее — и поступай в вуз сразу, без подготовительного года. Это целый год твоей жизни, который можно не отдавать.",
    },
    cards: [
      { title: "Дешевле репетитора", text: "AI-преподаватель на связи 24/7 — без почасовой оплаты и ожидания следующего занятия." },
      { title: "Занимайся когда удобно", text: "Без расписания и созвонов: ночью, утром, в перерыве — платформа всегда ждёт тебя." },
      { title: "Учи только свои пробелы", text: "Диагностика находит слабые места — ты не тратишь время на то, что уже знаешь." },
      { title: "Проверенная методика", text: "Методика нашей школы Language PRO — теперь в AI-платформе." },
    ],
  },
  en: {
    eyebrow: "Why LingoPRO",
    title: "What's in it for you",
    subtitle: "Five honest reasons to prepare with us.",
    featured: {
      title: "Don't lose a year to foundation",
      text: "Pass TÖMER ahead of time and enroll right away — no preparatory year. That's a whole year of your life you get to keep.",
    },
    cards: [
      { title: "Cheaper than a tutor", text: "An AI teacher on call 24/7 — no hourly rates, no waiting for the next lesson." },
      { title: "Study when it suits you", text: "No schedules or calls: at night, in the morning, on a break — the platform is always there." },
      { title: "Learn only your gaps", text: "The diagnostic finds your weak spots — you don't waste time on what you already know." },
      { title: "A proven method", text: "Our Language PRO school method — now in an AI platform." },
    ],
  },
  tr: {
    eyebrow: "Neden LingoPRO",
    title: "Sana ne kazandırır",
    subtitle: "Bizimle hazırlanmak için beş dürüst neden.",
    featured: {
      title: "Hazırlık yılını (foundation) kaybetme",
      text: "TÖMER'i önceden geç, üniversiteye hemen başla — hazırlık yılı olmadan. Bu, hayatından vermek zorunda olmadığın koca bir yıl.",
    },
    cards: [
      { title: "Özel öğretmenden daha uygun", text: "AI öğretmen 7/24 yanında — saat ücreti yok, sıradaki dersi beklemek yok." },
      { title: "Sana uyan zamanda çalış", text: "Program ve görüşme yok: gece, sabah, molada — platform hep seni bekliyor." },
      { title: "Sadece kendi eksiklerini öğren", text: "Teşhis zayıf noktalarını bulur — bildiğin şeye zaman harcamazsın." },
      { title: "Kanıtlanmış metot", text: "Language PRO okulumuzun metodu — artık AI platformunda." },
    ],
  },
  kk: {
    eyebrow: "Неге LingoPRO",
    title: "Саған не береді",
    subtitle: "Бізбен дайындалудың бес адал себебі.",
    featured: {
      title: "Foundation-ға бір жыл жоғалтпа",
      text: "TÖMER-ді алдын ала тапсыр да, университетке бірден түс — дайындық жылынсыз. Бұл — өмірден бермеуге болатын тұтас бір жыл.",
    },
    cards: [
      { title: "Репетитордан арзан", text: "AI-мұғалім 24/7 қасыңда — сағаттық ақысыз, келесі сабақты күтпейсің." },
      { title: "Ыңғайлы уақытта оқы", text: "Кестесіз және қоңыраусыз: түнде, таңертең, үзілісте — платформа әрқашан дайын." },
      { title: "Тек өз олқылықтарыңды үйрен", text: "Диагностика әлсіз тұстарыңды табады — білетініңе уақыт жұмсамайсың." },
      { title: "Тексерілген әдістеме", text: "Language PRO мектебіміздің әдістемесі — енді AI-платформада." },
    ],
  },
};

const CARD_ICONS = [Wallet, Clock, Crosshair, BadgeCheck];

export function WhyLingoPro() {
  const { locale } = useI18n();
  const c = pick(locale, CONTENT);

  return (
    <section id="why" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} />

        {/* главный аргумент — foundation, на всю ширину */}
        <Reveal className="mt-12">
          <div className="relative overflow-hidden rounded-3xl px-7 py-8 sm:px-10 sm:py-10">
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{ background: "linear-gradient(120deg, #6d5bff, #5b8cff 55%, #19c6b3)" }}
            />
            <div aria-hidden className="dot-grid absolute inset-0 -z-10 opacity-20" />
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white">
                <GraduationCap size={30} />
              </span>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{c.featured.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">{c.featured.text}</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* остальные аргументы */}
        <StaggerGroup className="mt-6 grid gap-5 sm:grid-cols-2">
          {c.cards.map((card, i) => {
            const Icon = CARD_ICONS[i];
            return (
              <StaggerItem key={card.title}>
                <div className="glass card-glow flex h-full items-start gap-4 rounded-3xl p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                    <Icon size={22} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-[var(--color-foreground)]">{card.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">{card.text}</p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
