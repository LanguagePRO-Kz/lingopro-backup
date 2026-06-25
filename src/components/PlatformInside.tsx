"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick, term } from "@/lib/localized";
import { Reveal } from "./ui/Reveal";

type TabId = "tutor" | "plan" | "exam" | "feedback" | "stats" | "vocab";

type Content = { title: string; subtitle: string; cta: string; tabs: { id: TabId; label: string; path: string }[] };

const CONTENT: { ru: Content; en: Content; tr: Content; kk: Content } = {
  ru: {
    title: "Взгляни на платформу изнутри",
    subtitle: "Реальные экраны продукта — переключай вкладки.",
    cta: "Начать подготовку →",
    tabs: [
      { id: "tutor", label: "AI-преподаватель", path: "tutor" },
      { id: "plan", label: "Персональный план", path: "plan" },
      { id: "exam", label: "Пробный TÖMER", path: "mock-exam" },
      { id: "feedback", label: "Детальный фидбек", path: "feedback" },
      { id: "stats", label: "Статистика", path: "stats" },
      { id: "vocab", label: "Словарь", path: "vocabulary" },
    ],
  },
  en: {
    title: "Take a look inside the platform",
    subtitle: "Real product screens — switch the tabs.",
    cta: "Start preparing →",
    tabs: [
      { id: "tutor", label: "AI tutor", path: "tutor" },
      { id: "plan", label: "Personal plan", path: "plan" },
      { id: "exam", label: "Mock TÖMER", path: "mock-exam" },
      { id: "feedback", label: "Detailed feedback", path: "feedback" },
      { id: "stats", label: "Statistics", path: "stats" },
      { id: "vocab", label: "Vocabulary", path: "vocabulary" },
    ],
  },
  tr: {
    title: "Platforma içeriden bak",
    subtitle: "Gerçek ürün ekranları — sekmeleri değiştir.",
    cta: "Hazırlığa başla →",
    tabs: [
      { id: "tutor", label: "AI öğretmen", path: "tutor" },
      { id: "plan", label: "Kişisel plan", path: "plan" },
      { id: "exam", label: "Deneme TÖMER", path: "mock-exam" },
      { id: "feedback", label: "Ayrıntılı geri bildirim", path: "feedback" },
      { id: "stats", label: "İstatistik", path: "stats" },
      { id: "vocab", label: "Sözlük", path: "vocabulary" },
    ],
  },
  kk: {
    title: "Платформаға іштен қара",
    subtitle: "Нақты өнім экрандары — қойындыларды ауыстыр.",
    cta: "Дайындықты бастау →",
    tabs: [
      { id: "tutor", label: "AI-мұғалім", path: "tutor" },
      { id: "plan", label: "Жеке жоспар", path: "plan" },
      { id: "exam", label: "Сынақ TÖMER", path: "mock-exam" },
      { id: "feedback", label: "Толық кері байланыс", path: "feedback" },
      { id: "stats", label: "Статистика", path: "stats" },
      { id: "vocab", label: "Сөздік", path: "vocabulary" },
    ],
  },
};

function Chrome({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div className="border-gradient overflow-hidden rounded-[1.6rem] p-2.5">
      <div className="rounded-[1.3rem] bg-white">
        <div className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 flex-1 truncate rounded-md bg-black/[0.04] px-3 py-1 text-xs text-[var(--color-muted)]">
            lingopro.app/{path}
          </span>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function Mock({ id, path }: { id: TabId; path: string }) {
  return (
    <Chrome path={path}>
      {id === "tutor" && <TutorMock />}
      {id === "plan" && <PlanMock />}
      {id === "exam" && <ExamMock />}
      {id === "feedback" && <FeedbackMock />}
      {id === "stats" && <StatsMock />}
      {id === "vocab" && <VocabMock />}
    </Chrome>
  );
}

function TutorMock() {
  const { locale } = useI18n();
  const m = pick(locale, {
    ru: {
      q: "Объясни разницу: «gidiyorum» и «gittim»?",
      a1: "«gidiyorum» — настоящее время («иду сейчас»), «gittim» — прошедшее («я пошёл»). Суффикс -di = прошедшее.",
      a2: "Попробуй: «Dün okula ___» 🙂",
    },
    en: {
      q: "Explain the difference: «gidiyorum» vs «gittim»?",
      a1: "«gidiyorum» is present («I'm going now»), «gittim» is past («I went»). The suffix -di = past.",
      a2: "Try: «Dün okula ___» 🙂",
    },
    tr: {
      q: "Farkı açıkla: «gidiyorum» ve «gittim»?",
      a1: "«gidiyorum» şimdiki zaman, «gittim» geçmiş zaman. -di eki = geçmiş zaman.",
      a2: "Dene: «Dün okula ___» 🙂",
    },
    kk: {
      q: "Айырмашылықты түсіндір: «gidiyorum» және «gittim»?",
      a1: "«gidiyorum» — осы шақ («қазір барамын»), «gittim» — өткен шақ («бардым»). -di жұрнағы = өткен шақ.",
      a2: "Байқап көр: «Dün okula ___» 🙂",
    },
  });
  return (
    <div className="mx-auto flex max-w-md flex-col gap-3 text-sm">
      <div className="max-w-[80%] self-start rounded-2xl rounded-tl-sm bg-black/[0.04] px-3.5 py-2.5 text-[var(--color-foreground)]">
        {m.q}
      </div>
      <div className="max-w-[85%] self-end rounded-2xl rounded-tr-sm bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-3)] px-3.5 py-2.5 text-white">
        {m.a1}
      </div>
      <div className="max-w-[85%] self-end rounded-2xl rounded-tr-sm bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-3)] px-3.5 py-2.5 text-white">
        {m.a2}
      </div>
    </div>
  );
}

function PlanMock() {
  const { locale } = useI18n();
  const items = pick(locale, {
    ru: ["Грамматика: падежи", "Лексика: 15 слов", "Аудирование: диалог"],
    en: ["Grammar: cases", "Vocabulary: 15 words", "Listening: dialogue"],
    tr: ["Dil bilgisi: hâl ekleri", "Kelime: 15 sözcük", "Dinleme: diyalog"],
    kk: ["Грамматика: септіктер", "Лексика: 15 сөз", "Тыңдалым: диалог"],
  });
  const skills = [[term(locale, "reading"), 72], [term(locale, "listening"), 58], [term(locale, "vocab"), 81]] as const;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4">
        <div className="text-[11px] uppercase tracking-wide text-[var(--color-muted)]">{term(locale, "todayPlan")}</div>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {items.map((t) => (
            <li key={t} className="flex items-center gap-2 text-[var(--color-foreground)]">
              <span className="h-4 w-4 rounded-md border border-[var(--color-brand-2)]/60 text-[var(--color-brand-2)]" />
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4">
        {skills.map(([n, v]) => (
          <div key={n}>
            <div className="mb-1 flex justify-between text-xs text-[var(--color-muted)]">
              <span>{n}</span>
              <span>{v}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]" style={{ width: `${v}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExamMock() {
  const { locale } = useI18n();
  const mods = [
    [term(locale, "reading"), 100],
    [term(locale, "listening"), 70],
    [term(locale, "writing"), 30],
    [term(locale, "speaking"), 0],
  ] as const;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[11px] text-[var(--color-muted)]">{term(locale, "module")} 2 / 4</span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-foreground)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-red)]" /> 18:24
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {mods.map(([n, p]) => (
          <div key={n} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-[13px] text-[var(--color-muted)]">{n}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/[0.05]">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]" style={{ width: `${p}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="border-gradient mt-4 rounded-xl px-3.5 py-3">
        <div className="text-[11px] uppercase tracking-wide text-[var(--color-muted)]">{term(locale, "forecast")}</div>
        <div className="mt-0.5 text-base font-bold text-[var(--color-foreground)]">≈ B1 · {term(locale, "readiness")} 68%</div>
      </div>
    </div>
  );
}

function FeedbackMock() {
  const { locale } = useI18n();
  const crit = [
    [term(locale, "content"), 4],
    [term(locale, "grammar"), 3],
    [term(locale, "vocab"), 4],
    [term(locale, "coherence"), 4],
  ] as const;
  const m = pick(locale, {
    ru: {
      total: "Итог: B1 · 15 / 20 баллов",
      err1: " — нужно прошедшее время (-di), т.к. dün = вчера",
      err2: " — причинная связь",
      reco: "Повтори тему: прошедшее время -di / -miş. Сделай 5 упражнений на закрепление.",
    },
    en: {
      total: "Total: B1 · 15 / 20 points",
      err1: " — past tense (-di) is needed, since dün = yesterday",
      err2: " — causal link",
      reco: "Review the topic: past tense -di / -miş. Do 5 practice exercises.",
    },
    tr: {
      total: "Sonuç: B1 · 15 / 20 puan",
      err1: " — geçmiş zaman (-di) gerekir, çünkü dün = dün",
      err2: " — neden bağlantısı",
      reco: "Konuyu tekrar et: geçmiş zaman -di / -miş. 5 pekiştirme alıştırması yap.",
    },
    kk: {
      total: "Қорытынды: B1 · 15 / 20 ұпай",
      err1: " — өткен шақ (-di) керек, өйткені dün = кеше",
      err2: " — себеп байланысы",
      reco: "Тақырыпты қайтала: өткен шақ -di / -miş. 5 бекіту жаттығуын жаса.",
    },
  });
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <div className="rounded-2xl bg-black/[0.03] px-4 py-3 text-sm leading-relaxed text-[var(--color-foreground)]">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-[var(--color-muted)]">{term(locale, "studentAnswer")}</div>
          Ben dün okula <span className="text-[var(--color-red)] line-through">gidiyorum</span>, çünkü sınav{" "}
          <span className="text-[var(--color-red)] line-through">vardı</span>.
        </div>
        <div className="flex flex-col gap-2.5">
          {crit.map(([n, s]) => (
            <div key={n} className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-foreground)]">{n}</span>
              <span className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((d) => (
                  <span key={d} className={`h-2 w-2 rounded-full ${d <= s ? "bg-[var(--color-brand)]" : "bg-black/[0.1]"}`} />
                ))}
              </span>
            </div>
          ))}
          <div className="mt-1 rounded-xl bg-[var(--color-brand-2)]/[0.1] px-3 py-2 text-sm font-semibold text-[var(--color-foreground)]">
            {m.total}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-2xl border border-[var(--color-red)]/20 bg-[var(--color-red)]/[0.05] p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-red)]">{term(locale, "errorsLabel")}</div>
          <ul className="flex flex-col gap-2 text-[13px] leading-relaxed text-[var(--color-foreground)]">
            <li>
              <b>gidiyorum → gittim</b>
              {m.err1}
            </li>
            <li>
              <b>vardı → olduğu için</b>
              {m.err2}
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border-gradient p-4">
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-brand)]">
            <span>✦</span> {term(locale, "aiReco")}
          </div>
          <p className="text-[13px] leading-relaxed text-[var(--color-foreground)]">{m.reco}</p>
        </div>
      </div>
    </div>
  );
}

function StatsMock() {
  const { locale } = useI18n();
  const heading = pick(locale, {
    ru: "Прогресс за 7 недель",
    en: "Progress over 7 weeks",
    tr: "7 haftalık ilerleme",
    kk: "7 апталық прогресс",
  });
  const data = [30, 38, 42, 50, 58, 65, 71];
  const W = 300;
  const H = 150;
  const padX = 12;
  const padTop = 18;
  const padBottom = 26;
  const step = (W - padX * 2) / (data.length - 1);
  const x = (i: number) => padX + i * step;
  const y = (v: number) => padTop + (1 - v / 100) * (H - padTop - padBottom);
  const line = data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1).toFixed(1)},${H - padBottom} L${x(0).toFixed(1)},${H - padBottom} Z`;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-[var(--color-foreground)]">{heading}</span>
        <span className="text-xs font-medium text-[var(--color-brand-2)]">+41%</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={heading}>
        <defs>
          <linearGradient id="stat-line" x1="0" y1="0" x2={W} y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6d5bff" />
            <stop offset="1" stopColor="#19c6b3" />
          </linearGradient>
          <linearGradient id="stat-area" x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
            <stop stopColor="#6d5bff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#19c6b3" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#stat-area)" />
        <motion.path
          d={line}
          fill="none"
          stroke="url(#stat-line)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {data.map((v, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(v)} r="4" fill="#fff" stroke="#6d5bff" strokeWidth="2" />
            <text x={x(i)} y={H - 8} textAnchor="middle" className="fill-[var(--color-muted)] text-[9px]">
              {term(locale, "weekShort")}
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function VocabMock() {
  const { locale } = useI18n();
  const words = ["kütüphane", "başvuru", "gelişmek", "sınav", "yeterlilik"];
  const levels = ["A2", "B1", "B1", "A2", "B2"];
  const meanings = pick(locale, {
    ru: ["библиотека", "заявление", "развиваться", "экзамен", "квалификация"],
    en: ["library", "application", "to develop", "exam", "proficiency"],
    tr: ["kitaplık", "müracaat", "ilerlemek", "deneme", "ehliyet"],
    kk: ["кітапхана", "өтініш", "дамыту", "емтихан", "біліктілік"],
  });
  return (
    <ul className="mx-auto flex max-w-md flex-col gap-2">
      {words.map((w, i) => (
        <li key={w} className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-black/[0.02] px-3.5 py-2.5 text-sm">
          <span className="font-semibold text-[var(--color-foreground)]">{w}</span>
          <span className="text-[var(--color-muted)]">{meanings[i]}</span>
          <span className="rounded-full bg-[var(--color-brand)]/[0.1] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-brand)]">{levels[i]}</span>
        </li>
      ))}
    </ul>
  );
}

export function PlatformInside() {
  const { locale } = useI18n();
  const c = pick(locale, CONTENT);
  const [active, setActive] = useState<TabId>("tutor");
  const tab = c.tabs.find((t) => t.id === active) ?? c.tabs[0];

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{c.title}</h2>
          <p className="mt-4 text-base text-[var(--color-muted)]">{c.subtitle}</p>
        </Reveal>

        <Reveal className="mt-10">
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {c.tabs.map((t) => {
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(t.id)}
                  aria-pressed={isActive}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="platform-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative mx-auto max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Mock id={active} path={tab.path} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/quiz" className="btn-primary rounded-full px-7 py-3.5 text-sm">
              {c.cta}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
