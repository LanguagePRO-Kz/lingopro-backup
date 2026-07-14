"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import type { Level } from "@/data/types";
import {
  assessPlan,
  paceChoiceFor,
  stepsAhead,
  MAX_SUSTAINABLE_MINUTES,
  type StudentLevel,
} from "@/lib/plan/feasibility";

/**
 * The honest plan verdict — one card for every surface (diagnostic result,
 * settings, dashboard checkpoint).
 *
 * Founder methodology (07.2026): OWNING a level ≠ PASSING the exam, and the
 * PRESENTATION leads with the real, motivating goal — passing. The big first
 * line mobilizes ("срок сжатый, но для подготовки к сдаче реальный");
 * proficiency math (~780 h / ~41 мес) lives in a small "почему так"
 * expander, never in the student's face. Scenario B (locked date) never
 * offers "postpone"; scenario A offers calm alternatives.
 */

const T = {
  ru: {
    unknown: (m: number, lvl: string, tgt: string, months: number, need: number) =>
      `При ${m} мин/день путь ${lvl} → ${tgt} — примерно ${months} мес честной работы (~${need} ч). Поставь дату экзамена — посчитаю точно.`,
    ok: (need: number, have: number) =>
      `Успеваешь. Нужно ~${need} ч работы, твой ресурс до экзамена ~${have} ч. Запас есть — главное, держи темп.`,
    tight: (need: number, have: number) =>
      `Впритык: ~${need} ч работы при ресурсе ~${have} ч. Реально — но без пропусков: план дня, каждый день.`,
    /* -------- scenario B: locked date → mobilize toward PASSING -------- */
    bLead: "Срок сжатый — но для подготовки к сдаче реальный. Погнали!",
    bBody: (tgt: string, days: number) =>
      `Полное владение ${tgt} за ${days} дней не выйдет — это годы, и это нормально. Задача другая: натаскать тебя на формат TÖMER, закрыть слабые темы и выжать максимум баллов на экзамене.`,
    bPlan: (m: number) =>
      `Интенсив под сдачу: ${m} мин/день · пробники по расписанию · слабые темы — в свой день.`,
    bPaceUp: (pace: number) => `Поднять до ${pace} мин/день — успеешь заметно больше к дате.`,
    bPaceTo120: "Включить максимум — 120 мин/день: каждая минута работает и на уровень, и на формат.",
    bPaceMaxed: "Темп уже на максимуме (120 мин/день) — дальше решают дисциплина и пробники.",
    /* -------- scenario A: movable date → calm real choices -------- */
    aLead: "Подготовим к сдаче по максимуму.",
    aBody: (tgt: string) =>
      `Полное владение ${tgt} к этой дате не успеть — но сдача экзамена это отдельный навык: формат и типовые задания натаскиваются быстрее, чем язык, и повышают шансы сдать выше «чистого» уровня. Как действуем — выбирай:`,
    aStay: "Остаться на своей дате — интенсив под сдачу: пробники и слабые темы.",
    aPace: (pace: number) => `Поднять темп до ${pace} мин/день — успеешь заметно больше.`,
    aTarget: "Цель B2 к этой дате — реально успеть. Для учёбы и работы B2 обычно достаточно.",
    aDate: (d: string) => `Не горит? Можно сдвинуть дату — комфортно к ${d}.`,
    /* -------- shared -------- */
    axisReach: (reach: string) => `владение — уверенный ${reach}`,
    axisReachNext: (reach: string, next: string) => `владение — уверенный ${reach}, при полной дисциплине подступ к ${next}`,
    axisReachPart: (next: string) => `владение — часть пути к ${next}`,
    axisFormatFull: "формат экзамена — отработаешь полностью",
    axisFormatPart: (pct: number) => `формат экзамена — ~${pct}%, фокус на весомые типы заданий`,
    forecastPrefix: "Честный прогноз к экзамену:",
    whyTitle: "Почему так — математика",
    whyBody: (tgt: string, need: number, have: number, months: number) =>
      `Полное владение ${tgt} — это ~${need} ч работы, твой реальный ресурс до даты — ~${have} ч (обычно такой путь занимает ~${months} мес). Поэтому цель плана — сдать экзамен, а не «выучить всё».`,
    compact: (reach: string, m: number) =>
      `Дата зафиксирована · курс на сдачу: формат + слабые темы, ${m} мин/день. Честный прогноз владения: ${reach}.`,
    apply: "Выбрать",
  },
  en: {
    unknown: (m: number, lvl: string, tgt: string, months: number, need: number) =>
      `At ${m} min/day, ${lvl} → ${tgt} is roughly ${months} months of honest work (~${need} h). Set an exam date and I'll do the exact math.`,
    ok: (need: number, have: number) =>
      `You're on track. ~${need} h of work needed, ~${have} h of realistic resource before the exam. There's margin — just keep the pace.`,
    tight: (need: number, have: number) =>
      `Tight: ~${need} h of work against ~${have} h of resource. Doable — but no skipped days: the daily plan, every day.`,
    bLead: "The timeline is short — but real for getting you ready to PASS. Let's go!",
    bBody: (tgt: string, days: number) =>
      `Full ${tgt} proficiency won't happen in ${days} days — that takes years, and that's fine. The job is different: train you on the TÖMER format, close the weak topics and squeeze the maximum score out of exam day.`,
    bPlan: (m: number) =>
      `The passing intensive: ${m} min/day · mocks on schedule · weak topics on their day.`,
    bPaceUp: (pace: number) => `Raise to ${pace} min/day — you'll cover notably more by the date.`,
    bPaceTo120: "Switch to the maximum — 120 min/day: every minute works on both your level and the format.",
    bPaceMaxed: "You're already at the maximum pace (120 min/day) — from here it's discipline and mocks.",
    aLead: "We'll get you exam-ready to the maximum.",
    aBody: (tgt: string) =>
      `Full ${tgt} proficiency won't fit this date — but passing is a separate skill: the format and typical tasks train faster than the language itself and raise your odds of scoring above your "pure" level. Your call on how we play it:`,
    aStay: "Keep your date — the passing intensive: mocks and weak topics.",
    aPace: (pace: number) => `Raise the pace to ${pace} min/day — you'll cover notably more.`,
    aTarget: "Target B2 by this date — realistically doable. For study and work, B2 is usually enough.",
    aDate: (d: string) => `No rush? The date can move — comfortable by ${d}.`,
    axisReach: (reach: string) => `proficiency — a solid ${reach}`,
    axisReachNext: (reach: string, next: string) => `proficiency — a solid ${reach}, closing in on ${next} with full discipline`,
    axisReachPart: (next: string) => `proficiency — part of the road to ${next}`,
    axisFormatFull: "exam format — fully trained",
    axisFormatPart: (pct: number) => `exam format — ~${pct}%, focused on the highest-weight task types`,
    forecastPrefix: "Honest forecast for exam day:",
    whyTitle: "Why — the math",
    whyBody: (tgt: string, need: number, have: number, months: number) =>
      `Full ${tgt} proficiency is ~${need} h of work; your realistic resource before the date is ~${have} h (this road usually takes ~${months} months). That's why the plan's goal is passing the exam, not "learning everything".`,
    compact: (reach: string, m: number) =>
      `Date locked · course set on passing: format + weak topics, ${m} min/day. Honest proficiency forecast: ${reach}.`,
    apply: "Apply",
  },
  tr: {
    unknown: (m: number, lvl: string, tgt: string, months: number, need: number) =>
      `Günde ${m} dk ile ${lvl} → ${tgt} yolu yaklaşık ${months} ay dürüst çalışma demek (~${need} saat). Sınav tarihini belirle, kesin hesabı yapayım.`,
    ok: (need: number, have: number) =>
      `Yetişiyorsun. ~${need} saatlik iş var, sınava kadar gerçekçi kaynağın ~${have} saat. Pay var — yeter ki tempoyu koru.`,
    tight: (need: number, have: number) =>
      `Sıkışık: ~${have} saatlik kaynağa karşı ~${need} saatlik iş. Olur — ama gün kaçırmadan: günün planı, her gün.`,
    bLead: "Süre kısa — ama sınavı GEÇMEYE hazırlanmak için gerçekçi. Haydi!",
    bBody: (tgt: string, days: number) =>
      `${days} günde tam ${tgt} hâkimiyeti olmaz — o yıllar ister, bu da normal. Görev farklı: seni TÖMER formatına hazırlamak, zayıf konuları kapatmak ve sınav günü maksimum puanı almak.`,
    bPlan: (m: number) =>
      `Geçiş yoğun programı: günde ${m} dk · programında denemeler · zayıf konular kendi gününde.`,
    bPaceUp: (pace: number) => `Günde ${pace} dakikaya çıkar — tarihe kadar belirgin şekilde fazlasını alırsın.`,
    bPaceTo120: "Maksimuma geç — günde 120 dk: her dakika hem seviyeye hem formata çalışır.",
    bPaceMaxed: "Tempo zaten maksimumda (günde 120 dk) — bundan sonrası disiplin ve denemeler.",
    aLead: "Seni sınava maksimum düzeyde hazırlayacağız.",
    aBody: (tgt: string) =>
      `Bu tarihe kadar tam ${tgt} hâkimiyeti yetişmez — ama sınavı geçmek ayrı bir beceridir: format ve tipik görevler dilin kendisinden hızlı öğrenilir ve "saf" seviyenin üstünde puan alma şansını artırır. Nasıl oynayacağımız senin kararın:`,
    aStay: "Tarihinde kal — geçiş yoğun programı: denemeler ve zayıf konular.",
    aPace: (pace: number) => `Tempoyu günde ${pace} dakikaya çıkar — belirgin şekilde fazlasını alırsın.`,
    aTarget: "Bu tarihe kadar B2 hedefi — gerçekçi. Eğitim ve iş için B2 genelde yeterli.",
    aDate: (d: string) => `Acelesi yok mu? Tarih kayabilir — ${d} rahat olur.`,
    axisReach: (reach: string) => `hâkimiyet — sağlam ${reach}`,
    axisReachNext: (reach: string, next: string) => `hâkimiyet — sağlam ${reach}, tam disiplinle ${next} yakın`,
    axisReachPart: (next: string) => `hâkimiyet — ${next} yolunun bir kısmı`,
    axisFormatFull: "sınav formatı — tamamen çalışılmış olur",
    axisFormatPart: (pct: number) => `sınav formatı — ~%${pct}, en ağırlıklı soru tiplerine odaklı`,
    forecastPrefix: "Sınav günü için dürüst tahmin:",
    whyTitle: "Neden — matematik",
    whyBody: (tgt: string, need: number, have: number, months: number) =>
      `Tam ${tgt} hâkimiyeti ~${need} saatlik iş; tarihe kadar gerçekçi kaynağın ~${have} saat (bu yol genelde ~${months} ay sürer). Bu yüzden planın hedefi sınavı geçmek — "her şeyi öğrenmek" değil.`,
    compact: (reach: string, m: number) =>
      `Tarih kesin · rota geçişe ayarlı: format + zayıf konular, günde ${m} dk. Dürüst hâkimiyet tahmini: ${reach}.`,
    apply: "Uygula",
  },
  kk: {
    unknown: (m: number, lvl: string, tgt: string, months: number, need: number) =>
      `Күніне ${m} минутпен ${lvl} → ${tgt} жолы — шамамен ${months} ай адал жұмыс (~${need} сағат). Емтихан күнін қой — нақтысын есептеп беремін.`,
    ok: (need: number, have: number) =>
      `Үлгересің. ~${need} сағат жұмыс керек, емтиханға дейінгі нақты қорың ~${have} сағат. Қор бар — бастысы, қарқынды ұста.`,
    tight: (need: number, have: number) =>
      `Тығыз: ~${have} сағат қорға ~${need} сағат жұмыс. Болады — бірақ бір күн де жібермей: күн жоспары, күн сайын.`,
    bLead: "Мерзім қысқа — бірақ ТАПСЫРУҒА дайындалуға жетеді. Кеттік!",
    bBody: (tgt: string, days: number) =>
      `${days} күнде ${tgt} деңгейін толық меңгеру мүмкін емес — оған жылдар керек, бұл қалыпты. Міндет басқа: сені TÖMER форматына баулу, әлсіз тақырыптарды жабу және емтихан күні максимум балл жинау.`,
    bPlan: (m: number) =>
      `Тапсыруға арналған интенсив: күніне ${m} минут · кесте бойынша сынамалар · әлсіз тақырыптар өз күнінде.`,
    bPaceUp: (pace: number) => `Күніне ${pace} минутқа көтер — күнге дейін едәуір көп үлгересің.`,
    bPaceTo120: "Максимумды қос — күніне 120 минут: әр минут деңгейге де, форматқа да жұмыс істейді.",
    bPaceMaxed: "Қарқын онсыз да максимумда (күніне 120 минут) — әрі қарай тәртіп пен сынамалар шешеді.",
    aLead: "Тапсыруға максимум дайындаймыз.",
    aBody: (tgt: string) =>
      `Бұл күнге дейін ${tgt} деңгейін толық меңгеру үлгермейді — бірақ емтихан тапсыру бөлек дағды: формат пен типтік тапсырмалар тілдің өзінен тезірек үйреніледі және «таза» деңгейден жоғары балл алу мүмкіндігін арттырады. Қалай жүреміз — таңдау сенікі:`,
    aStay: "Өз күніңде қал — тапсыруға интенсив: сынамалар мен әлсіз тақырыптар.",
    aPace: (pace: number) => `Қарқынды күніне ${pace} минутқа көтер — едәуір көп үлгересің.`,
    aTarget: "Бұл күнге дейін B2 мақсаты — нақты үлгеруге болады. Оқу мен жұмысқа әдетте B2 жеткілікті.",
    aDate: (d: string) => `Асығыс емес пе? Күнді жылжытуға болады — ${d} қолайлы.`,
    axisReach: (reach: string) => `деңгей — нық ${reach}`,
    axisReachNext: (reach: string, next: string) => `деңгей — нық ${reach}, толық тәртіппен ${next} жақын`,
    axisReachPart: (next: string) => `деңгей — ${next} жолының бір бөлігі`,
    axisFormatFull: "емтихан форматы — толық пысықталады",
    axisFormatPart: (pct: number) => `емтихан форматы — ~${pct}%, ең салмақты тапсырма түрлеріне назар`,
    forecastPrefix: "Емтихан күніне адал болжам:",
    whyTitle: "Неге бұлай — математика",
    whyBody: (tgt: string, need: number, have: number, months: number) =>
      `${tgt} деңгейін толық меңгеру — ~${need} сағат жұмыс; күнге дейінгі нақты қорың — ~${have} сағат (бұл жол әдетте ~${months} айға созылады). Сондықтан жоспардың мақсаты — емтихан тапсыру, «бәрін үйрену» емес.`,
    compact: (reach: string, m: number) =>
      `Күн бекітілген · бағыт — тапсыру: формат + әлсіз тақырыптар, күніне ${m} минут. Деңгей бойынша адал болжам: ${reach}.`,
    apply: "Таңдау",
  },
};

function ApplyBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--color-brand)] shadow-sm transition-colors hover:bg-white"
    >
      {label} →
    </button>
  );
}

export function PlanVerdictCard({
  level,
  targetLevel,
  minutesDaily,
  daysLeft,
  examDateFlexible,
  masteredTopics,
  compact,
  onApplyMinutes,
  onApplyDate,
  onApplyTarget,
}: {
  level: StudentLevel;
  targetLevel: "B2" | "C1";
  minutesDaily: number;
  daysLeft: number | null;
  /** false = the date is locked (scenario B); true/undefined/null = movable */
  examDateFlexible?: boolean | null;
  masteredTopics?: string[];
  /** dashboard checkpoint: one tight forecast line, no option buttons */
  compact?: boolean;
  onApplyMinutes?: (m: number) => void;
  onApplyDate?: (iso: string) => void;
  onApplyTarget?: () => void;
}) {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const kkNative = locale === "kk";

  const plan = useMemo(
    () => assessPlan({ level, targetLevel, masteredTopics, minutesDaily, daysLeft, kkNative }),
    [level, targetLevel, masteredTopics, minutesDaily, daysLeft, kkNative],
  );
  // alternative Б: does B2 fit where C1 doesn't?
  const planB2 = useMemo(
    () =>
      targetLevel === "C1"
        ? assessPlan({ level, targetLevel: "B2", masteredTopics, minutesDaily, daysLeft, kkNative })
        : null,
    [level, targetLevel, masteredTopics, minutesDaily, daysLeft, kkNative],
  );

  const fixed = daysLeft != null && examDateFlexible === false;
  const paceUp = plan.minutesNeeded != null ? paceChoiceFor(plan.minutesNeeded) : null;
  const paceFits = paceUp != null && paceUp <= MAX_SUSTAINABLE_MINUTES && paceUp > minutesDaily;

  // forecast wording pieces
  const ahead = stepsAhead(level, targetLevel);
  const nextAfterReach: Level | null = plan.reachableLevel
    ? (ahead[ahead.indexOf(plan.reachableLevel) + 1] ?? null)
    : (ahead[0] ?? null);
  const reachLabel = plan.reachableLevel ?? null;
  const axisReach = reachLabel
    ? plan.nextStepShare >= 0.4 && nextAfterReach
      ? c.axisReachNext(reachLabel, nextAfterReach)
      : c.axisReach(reachLabel)
    : c.axisReachPart(nextAfterReach ?? targetLevel);
  const axisFormat =
    (plan.formatReadiness ?? 0) >= 100 ? c.axisFormatFull : c.axisFormatPart(Math.max(5, plan.formatReadiness ?? 0));

  if (compact) {
    // dashboard checkpoint: only worth the space when the date is locked and
    // the plan runs in mobilization mode — otherwise stay silent
    if (!fixed || plan.verdict !== "notEnough") return null;
    const reach = reachLabel ? `${reachLabel}${plan.nextStepShare >= 0.4 ? "+" : ""}` : `→ ${nextAfterReach ?? targetLevel}`;
    return (
      <div className="rounded-2xl bg-[#d97706]/10 px-4 py-3 text-sm leading-relaxed text-[#92400e]">
        🎯 {c.compact(reach, minutesDaily)}
      </div>
    );
  }

  if (plan.verdict === "unknown") {
    return <div className="rounded-2xl bg-black/[0.04] px-4 py-3 text-sm leading-relaxed text-[var(--color-muted)]">{c.unknown(minutesDaily, level, targetLevel, plan.monthsNeeded, plan.needHours)}</div>;
  }

  if (plan.verdict === "ok" || plan.verdict === "tight") {
    return (
      <div
        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          plan.verdict === "ok" ? "bg-[#16a34a]/[0.08] text-[#15803d]" : "bg-[#d97706]/10 text-[#92400e]"
        }`}
      >
        {plan.verdict === "ok" ? "✅ " : "⚠️ "}
        {plan.verdict === "ok" ? c.ok(plan.needHours, plan.haveHours) : c.tight(plan.needHours, plan.haveHours)}
      </div>
    );
  }

  /* -------------- notEnough: the goal is PASSING, lead with it -------------- */
  // founder: the big first line MOTIVATES toward passing; the proficiency
  // math is honest but lives in a small expander, never in the face

  const whyExpander = (
    <details className="text-xs opacity-80">
      <summary className="cursor-pointer font-medium">{c.whyTitle}</summary>
      <p className="mt-1 leading-relaxed">{c.whyBody(targetLevel, plan.needHours, plan.haveHours, plan.monthsNeeded)}</p>
    </details>
  );

  const forecastLine = (
    <p className="text-xs opacity-90">
      {c.forecastPrefix} 📈 {axisReach} · 🎯 {axisFormat}
    </p>
  );

  const paceRow = (paceText: (pace: number) => string, to120Text: string, maxedText: string) =>
    paceFits ? (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-white/50 px-3 py-2">
        <span>⏱ {paceText(paceUp!)}</span>
        {onApplyMinutes && <ApplyBtn label={c.apply} onClick={() => onApplyMinutes(paceUp!)} />}
      </div>
    ) : minutesDaily < MAX_SUSTAINABLE_MINUTES ? (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-white/50 px-3 py-2">
        <span>⏱ {to120Text}</span>
        {onApplyMinutes && <ApplyBtn label={c.apply} onClick={() => onApplyMinutes(MAX_SUSTAINABLE_MINUTES)} />}
      </div>
    ) : (
      <p className="text-xs opacity-90">⏱ {maxedText}</p>
    );

  if (fixed) {
    // scenario B — locked date: mobilization toward passing, no "postpone"
    return (
      <div className="flex flex-col gap-2.5 rounded-2xl bg-[#d97706]/10 px-4 py-3.5 text-sm leading-relaxed text-[#92400e]">
        <p className="text-base font-bold">🚀 {c.bLead}</p>
        <p>{c.bBody(targetLevel, plan.daysLeft ?? 0)}</p>
        <div className="rounded-xl bg-white/50 px-3 py-2 font-medium">📋 {c.bPlan(minutesDaily)}</div>
        {paceRow(c.bPaceUp, c.bPaceTo120, c.bPaceMaxed)}
        {forecastLine}
        {whyExpander}
      </div>
    );
  }

  // scenario A — the date can move: same passing-first lead, calm options
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl bg-[#d97706]/10 px-4 py-3.5 text-sm leading-relaxed text-[#92400e]">
      <p className="text-base font-bold">🚀 {c.aLead}</p>
      <p>{c.aBody(targetLevel)}</p>
      <div className="rounded-xl bg-white/50 px-3 py-2">📋 {c.aStay}</div>
      {paceFits && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-white/50 px-3 py-2">
          <span>⏱ {c.aPace(paceUp!)}</span>
          {onApplyMinutes && <ApplyBtn label={c.apply} onClick={() => onApplyMinutes(paceUp!)} />}
        </div>
      )}
      {planB2 && planB2.verdict !== "notEnough" && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-white/50 px-3 py-2">
          <span>🎯 {c.aTarget}</span>
          {onApplyTarget && <ApplyBtn label={c.apply} onClick={onApplyTarget} />}
        </div>
      )}
      {plan.dateNeeded && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-white/50 px-3 py-2">
          <span>📅 {c.aDate(plan.dateNeeded)}</span>
          {onApplyDate && <ApplyBtn label={c.apply} onClick={() => onApplyDate(plan.dateNeeded!)} />}
        </div>
      )}
      {forecastLine}
      {whyExpander}
    </div>
  );
}
