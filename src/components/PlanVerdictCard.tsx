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
 * settings, dashboard checkpoint). Coach tone, never a lie.
 *
 * Founder methodology (07.2026): OWNING a level and PASSING the exam are two
 * different axes. Proficiency grows slowly (hours ladder); exam-format
 * readiness (task types, strategies, timing) trains fast and genuinely
 * raises the odds of scoring above one's "pure" level. The verdict never
 * says "C1 impossible" — it forecasts BOTH axes:
 *
 *   scenario A (date can move / no exact date): honest "full proficiency
 *   doesn't fit" + three REAL alternatives — pace / target / date;
 *   scenario B (locked date): no "postpone" — proficiency forecast + format
 *   readiness + a mobilization plan aimed at passing the test.
 */

const T = {
  ru: {
    unknown: (m: number, lvl: string, tgt: string, months: number, need: number) =>
      `При ${m} мин/день путь ${lvl} → ${tgt} — примерно ${months} мес честной работы (~${need} ч). Поставь дату экзамена — посчитаю точно.`,
    ok: (need: number, have: number) =>
      `Успеваешь. Нужно ~${need} ч работы, твой ресурс до экзамена ~${have} ч. Запас есть — главное, держи темп.`,
    tight: (need: number, have: number) =>
      `Впритык: ~${need} ч работы при ресурсе ~${have} ч. Реально — но без пропусков: план дня, каждый день.`,
    aHead: (m: number, lvl: string, tgt: string, need: number, have: number, months: number) =>
      `Честно: при ${m} мин/день выйти на полное владение ${tgt} к этой дате не получится — нужно ~${need} ч, ресурс ~${have} ч (обычно это ~${months} мес). Варианты — выбирай:`,
    aPace: (pace: number) => `Поднять темп до ${pace} мин/день — тогда успеваешь к своей дате.`,
    aPaceNo: (tgt: string) => `Даже 2 часа в день не дадут полного владения ${tgt} к этой дате — темпом это не решить.`,
    aTarget: `Цель B2 к этой дате — реально. Для учёбы и работы B2 обычно достаточно.`,
    aDate: (d: string) => `Оставить темп и цель, но сдвинуть дату: реалистично — ${d}.`,
    aFormat:
      `И честно про сам экзамен: сдать тест — отдельный навык. Формат, стратегии и тайминг натаскиваются быстро и повышают шансы сдать выше «чистого» уровня — в плане это пробники и разборы.`,
    bHead: (lvl: string, tgt: string, days: number, months: number) =>
      `Дата зафиксирована — работаем на максимум. Скажу как есть: полное владение ${tgt} за ${days} дней нереально (обычно ~${months} мес). Но сдача экзамена — отдельный навык: формат, стратегии, тайм-менеджмент. Целенаправленная натаска реально повышает шансы. Честный расклад по двум осям:`,
    bReach: (reach: string) => `Владение к экзамену: реально выйти на уверенный ${reach}.`,
    bReachNext: (reach: string, next: string) =>
      `Владение к экзамену: уверенный ${reach}, при полной дисциплине — подступ к ${next}.`,
    bReachPart: (next: string) => `Владение к экзамену: заметная часть пути к ${next} — честно, без сказок.`,
    bFormatFull:
      `Формат экзамена: успеешь отработать полностью — все секции, типы заданий, тайминг. Это твой главный рычаг на баллы.`,
    bFormatPart: (pct: number) =>
      `Формат экзамена: успеешь отработать ~${pct}% — фокус на самые весомые типы заданий. Каждый пробник добавляет к шансам.`,
    bPace: (pace: number, tgt: string) => `Дотянуть владение до ${tgt} — это ${pace} мин/день, каждый день.`,
    bPaceMax: `Максимальный реальный темп — 120 мин/день: до полного владения он не дотянет, но поднимет и уровень, и готовность к формату.`,
    bPaceAtMax: `Темп уже на максимуме (120 мин/день) — дальше решают дисциплина, пробники и слабые темы.`,
    bMust: "Без чего не получится: план дня — каждый день · 3 голосовых урока в неделю · пробники по расписанию · повторение слабых тем — в их день.",
    compact: (reach: string, m: number) =>
      `Дата зафиксирована · честный прогноз: владение — ${reach}, формат экзамена — отрабатываем в плане. Темп ${m} мин/день, каждый день на счету.`,
    apply: "Выбрать",
  },
  en: {
    unknown: (m: number, lvl: string, tgt: string, months: number, need: number) =>
      `At ${m} min/day, ${lvl} → ${tgt} is roughly ${months} months of honest work (~${need} h). Set an exam date and I'll do the exact math.`,
    ok: (need: number, have: number) =>
      `You're on track. ~${need} h of work needed, ~${have} h of realistic resource before the exam. There's margin — just keep the pace.`,
    tight: (need: number, have: number) =>
      `Tight: ~${need} h of work against ~${have} h of resource. Doable — but no skipped days: the daily plan, every day.`,
    aHead: (m: number, lvl: string, tgt: string, need: number, have: number, months: number) =>
      `Honestly: at ${m} min/day, full ${tgt} proficiency doesn't fit this date — ~${need} h needed, ~${have} h available (usually ~${months} months). Real options — your call:`,
    aPace: (pace: number) => `Raise the pace to ${pace} min/day — then you make your date.`,
    aPaceNo: (tgt: string) => `Even 2 hours a day won't buy full ${tgt} proficiency by this date — pace alone can't solve it.`,
    aTarget: `Target B2 by this date — realistic. For study and work, B2 is usually enough.`,
    aDate: (d: string) => `Keep the pace and the goal, move the date: realistically — ${d}.`,
    aFormat:
      `And honestly about the exam itself: passing the test is a separate skill. Format, strategies and timing train fast and raise your odds of scoring above your "pure" level — that's the mocks and reviews in your plan.`,
    bHead: (lvl: string, tgt: string, days: number, months: number) =>
      `The date is locked — so we go all in. Straight talk: full ${tgt} proficiency in ${days} days is unrealistic (usually ~${months} months). But passing the exam is a separate skill: format, strategies, time management — targeted training genuinely raises your odds. The honest picture, both axes:`,
    bReach: (reach: string) => `Proficiency by the exam: a solid ${reach} is realistic.`,
    bReachNext: (reach: string, next: string) =>
      `Proficiency by the exam: a solid ${reach}; with full discipline — closing in on ${next}.`,
    bReachPart: (next: string) => `Proficiency by the exam: a good part of the road to ${next} — honestly, no fairy tales.`,
    bFormatFull:
      `Exam format: you have time to master it fully — every section, task type and the timing. That's your main lever for points.`,
    bFormatPart: (pct: number) =>
      `Exam format: you can cover ~${pct}% — focus on the highest-weight task types. Every mock adds to your odds.`,
    bPace: (pace: number, tgt: string) => `Pushing proficiency to ${tgt} takes ${pace} min/day, every day.`,
    bPaceMax: `The maximum realistic pace is 120 min/day: it won't buy full proficiency, but it lifts both your level and your format readiness.`,
    bPaceAtMax: `You're already at the maximum pace (120 min/day) — from here it's discipline, mocks and weak topics.`,
    bMust: "Non-negotiables: the daily plan — every day · 3 voice lessons a week · mocks on schedule · weak-topic reviews on their day.",
    compact: (reach: string, m: number) =>
      `Date locked · honest forecast: proficiency — ${reach}, exam format — trained in the plan. Pace ${m} min/day, every day counts.`,
    apply: "Apply",
  },
  tr: {
    unknown: (m: number, lvl: string, tgt: string, months: number, need: number) =>
      `Günde ${m} dk ile ${lvl} → ${tgt} yolu yaklaşık ${months} ay dürüst çalışma demek (~${need} saat). Sınav tarihini belirle, kesin hesabı yapayım.`,
    ok: (need: number, have: number) =>
      `Yetişiyorsun. ~${need} saatlik iş var, sınava kadar gerçekçi kaynağın ~${have} saat. Pay var — yeter ki tempoyu koru.`,
    tight: (need: number, have: number) =>
      `Sıkışık: ~${have} saatlik kaynağa karşı ~${need} saatlik iş. Olur — ama gün kaçırmadan: günün planı, her gün.`,
    aHead: (m: number, lvl: string, tgt: string, need: number, have: number, months: number) =>
      `Dürüstçe: günde ${m} dk ile bu tarihe kadar TAM ${tgt} hâkimiyeti olmaz — ~${need} saat gerek, ~${have} saat var (genelde ~${months} ay). Gerçek seçenekler — karar senin:`,
    aPace: (pace: number) => `Tempoyu günde ${pace} dakikaya çıkar — o zaman tarihine yetişirsin.`,
    aPaceNo: (tgt: string) => `Günde 2 saat bile bu tarihe kadar tam ${tgt} hâkimiyeti getirmez — bunu tempo çözmez.`,
    aTarget: `Bu tarihe kadar B2 hedefi — gerçekçi. Eğitim ve iş için B2 genelde yeterli.`,
    aDate: (d: string) => `Tempoyu ve hedefi koru, tarihi kaydır: gerçekçi olan — ${d}.`,
    aFormat:
      `Sınavın kendisi hakkında da dürüst olalım: sınavı GEÇMEK ayrı bir beceridir. Format, strateji ve zamanlama hızla öğrenilir ve "saf" seviyenin üstünde puan alma şansını artırır — plandaki denemeler ve analizler bunun için.`,
    bHead: (lvl: string, tgt: string, days: number, months: number) =>
      `Tarih kesin — o zaman maksimum çalışıyoruz. Açık konuşayım: ${days} günde TAM ${tgt} hâkimiyeti gerçekçi değil (genelde ~${months} ay). Ama sınavı geçmek ayrı bir beceri: format, strateji, zaman yönetimi — hedefli çalışma şansı gerçekten artırır. İki eksende dürüst tablo:`,
    bReach: (reach: string) => `Sınava kadar hâkimiyet: sağlam bir ${reach} gerçekçi.`,
    bReachNext: (reach: string, next: string) =>
      `Sınava kadar hâkimiyet: sağlam ${reach}; tam disiplinle ${next} seviyesine yaklaşırsın.`,
    bReachPart: (next: string) => `Sınava kadar hâkimiyet: ${next} yolunun önemli bir kısmı — dürüstçe, masal yok.`,
    bFormatFull:
      `Sınav formatı: tamamını çalışmaya vaktin var — tüm bölümler, soru tipleri, zamanlama. Puan için ana kaldıracın bu.`,
    bFormatPart: (pct: number) =>
      `Sınav formatı: ~%${pct}'ini çalışabilirsin — en ağırlıklı soru tiplerine odaklan. Her deneme şansı artırır.`,
    bPace: (pace: number, tgt: string) => `Hâkimiyeti ${tgt} seviyesine taşımak: günde ${pace} dk, her gün.`,
    bPaceMax: `Gerçekçi maksimum tempo günde 120 dk: tam hâkimiyet getirmez ama hem seviyeyi hem format hazırlığını yükseltir.`,
    bPaceAtMax: `Tempo zaten maksimumda (günde 120 dk) — bundan sonrası disiplin, denemeler ve zayıf konular.`,
    bMust: "Olmazsa olmazlar: günün planı — her gün · haftada 3 sesli ders · programındaki denemeler · zayıf konu tekrarları — kendi gününde.",
    compact: (reach: string, m: number) =>
      `Tarih kesin · dürüst tahmin: hâkimiyet — ${reach}, sınav formatı — planda çalışılıyor. Tempo günde ${m} dk, her gün sayılır.`,
    apply: "Uygula",
  },
  kk: {
    unknown: (m: number, lvl: string, tgt: string, months: number, need: number) =>
      `Күніне ${m} минутпен ${lvl} → ${tgt} жолы — шамамен ${months} ай адал жұмыс (~${need} сағат). Емтихан күнін қой — нақтысын есептеп беремін.`,
    ok: (need: number, have: number) =>
      `Үлгересің. ~${need} сағат жұмыс керек, емтиханға дейінгі нақты қорың ~${have} сағат. Қор бар — бастысы, қарқынды ұста.`,
    tight: (need: number, have: number) =>
      `Тығыз: ~${have} сағат қорға ~${need} сағат жұмыс. Болады — бірақ бір күн де жібермей: күн жоспары, күн сайын.`,
    aHead: (m: number, lvl: string, tgt: string, need: number, have: number, months: number) =>
      `Шынын айтқанда: күніне ${m} минутпен бұл күнге дейін ${tgt} деңгейін ТОЛЫҚ меңгеру мүмкін емес — ~${need} сағат керек, ~${have} сағат бар (әдетте ~${months} ай). Нақты нұсқалар — таңдау сенікі:`,
    aPace: (pace: number) => `Қарқынды күніне ${pace} минутқа көтер — сонда өз күніңе үлгересің.`,
    aPaceNo: (tgt: string) => `Күніне 2 сағат та бұл күнге дейін ${tgt} деңгейін толық меңгертпейді — мұны қарқын шешпейді.`,
    aTarget: `Бұл күнге дейін B2 мақсаты — нақты қол жетімді. Оқу мен жұмысқа әдетте B2 жеткілікті.`,
    aDate: (d: string) => `Қарқын мен мақсатты сақтап, күнді жылжыт: шынайысы — ${d}.`,
    aFormat:
      `Емтиханның өзі туралы да шынын айтайын: тестті ТАПСЫРУ — бөлек дағды. Формат, стратегия мен таймингті тез үйренуге болады, бұл «таза» деңгейден жоғары балл алу мүмкіндігін арттырады — жоспардағы сынамалар мен талдаулар сол үшін.`,
    bHead: (lvl: string, tgt: string, days: number, months: number) =>
      `Күн бекітілген — демек максимум жұмыс істейміз. Ашығын айтайын: ${days} күнде ${tgt} деңгейін ТОЛЫҚ меңгеру мүмкін емес (әдетте ~${months} ай). Бірақ емтихан тапсыру — бөлек дағды: формат, стратегия, тайм-менеджмент — мақсатты дайындық мүмкіндікті шынымен арттырады. Екі бағыт бойынша адал көрініс:`,
    bReach: (reach: string) => `Емтиханға дейінгі деңгей: нық ${reach} — нақты қол жетімді.`,
    bReachNext: (reach: string, next: string) =>
      `Емтиханға дейінгі деңгей: нық ${reach}; толық тәртіппен ${next} деңгейіне жақындайсың.`,
    bReachPart: (next: string) => `Емтиханға дейінгі деңгей: ${next} жолының едәуір бөлігі — адал, ертегісіз.`,
    bFormatFull:
      `Емтихан форматы: толық меңгеруге уақыт бар — барлық бөлімдер, тапсырма түрлері, тайминг. Балл үшін басты тұтқаң — осы.`,
    bFormatPart: (pct: number) =>
      `Емтихан форматы: ~${pct}%-ын меңгеріп үлгересің — ең салмақты тапсырма түрлеріне шоғырлан. Әр сынама мүмкіндікті арттырады.`,
    bPace: (pace: number, tgt: string) => `Деңгейді ${tgt}-ге жеткізу үшін: күніне ${pace} минут, күн сайын.`,
    bPaceMax: `Нақты максимум қарқын — күніне 120 минут: толық меңгеруге жеткізбейді, бірақ деңгейді де, форматқа дайындықты да көтереді.`,
    bPaceAtMax: `Қарқын онсыз да максимумда (күніне 120 минут) — әрі қарай тәртіп, сынамалар мен әлсіз тақырыптар шешеді.`,
    bMust: "Онсыз болмайды: күн жоспары — күн сайын · аптасына 3 дауысты сабақ · кесте бойынша сынамалар · әлсіз тақырыптарды қайталау — өз күнінде.",
    compact: (reach: string, m: number) =>
      `Күн бекітілген · адал болжам: деңгей — ${reach}, емтихан форматы — жоспарда пысықталады. Қарқын күніне ${m} минут, әр күн есепте.`,
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

  // forecast wording pieces (scenario B)
  const ahead = stepsAhead(level, targetLevel);
  const nextAfterReach: Level | null = plan.reachableLevel
    ? (ahead[ahead.indexOf(plan.reachableLevel) + 1] ?? null)
    : (ahead[0] ?? null);
  const reachLabel = plan.reachableLevel ?? null;

  const tone =
    plan.verdict === "notEnough"
      ? "bg-[#dc2626]/[0.08] text-[#b91c1c]"
      : plan.verdict === "tight"
        ? "bg-[#d97706]/10 text-[#92400e]"
        : plan.verdict === "ok"
          ? "bg-[#16a34a]/[0.08] text-[#15803d]"
          : "bg-black/[0.04] text-[var(--color-muted)]";

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
    return <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${tone}`}>{c.unknown(minutesDaily, level, targetLevel, plan.monthsNeeded, plan.needHours)}</div>;
  }

  if (plan.verdict === "ok" || plan.verdict === "tight") {
    return (
      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${tone}`}>
        {plan.verdict === "ok" ? "✅ " : "⚠️ "}
        {plan.verdict === "ok" ? c.ok(plan.needHours, plan.haveHours) : c.tight(plan.needHours, plan.haveHours)}
      </div>
    );
  }

  /* ------------------------- notEnough: A or B ------------------------- */

  if (!fixed) {
    // scenario A — the date can move: honest "full proficiency doesn't fit"
    // + real choices; passing the test itself is a separate, faster skill
    return (
      <div className={`flex flex-col gap-2.5 rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${tone}`}>
        <p>{c.aHead(minutesDaily, level, targetLevel, plan.needHours, plan.haveHours, plan.monthsNeeded)}</p>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-white/50 px-3 py-2">
          <span>⏱ {paceFits ? c.aPace(paceUp!) : c.aPaceNo(targetLevel)}</span>
          {paceFits && onApplyMinutes && <ApplyBtn label={c.apply} onClick={() => onApplyMinutes(paceUp!)} />}
        </div>
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
        <p className="text-xs opacity-90">{c.aFormat}</p>
      </div>
    );
  }

  // scenario B — locked date: no "postpone"; forecast BOTH axes (proficiency
  // + exam-format readiness) and mobilize toward passing the test
  return (
    <div className={`flex flex-col gap-2.5 rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${tone}`}>
      <p>{c.bHead(level, targetLevel, plan.daysLeft ?? 0, plan.monthsNeeded)}</p>
      <p className="font-semibold">
        📈{" "}
        {reachLabel
          ? plan.nextStepShare >= 0.4 && nextAfterReach
            ? c.bReachNext(reachLabel, nextAfterReach)
            : c.bReach(reachLabel)
          : c.bReachPart(nextAfterReach ?? targetLevel)}
      </p>
      <p className="font-semibold">
        🎯 {(plan.formatReadiness ?? 0) >= 100 ? c.bFormatFull : c.bFormatPart(Math.max(5, plan.formatReadiness ?? 0))}
      </p>
      <div className="flex items-center justify-between gap-3 rounded-xl bg-white/50 px-3 py-2">
        <span>
          ⏱{" "}
          {paceFits
            ? c.bPace(paceUp!, targetLevel)
            : minutesDaily < MAX_SUSTAINABLE_MINUTES
              ? c.bPaceMax
              : c.bPaceAtMax}
        </span>
        {paceFits && onApplyMinutes && <ApplyBtn label={c.apply} onClick={() => onApplyMinutes(paceUp!)} />}
        {!paceFits && minutesDaily < MAX_SUSTAINABLE_MINUTES && onApplyMinutes && (
          <ApplyBtn label={c.apply} onClick={() => onApplyMinutes(MAX_SUSTAINABLE_MINUTES)} />
        )}
      </div>
      <p className="text-xs opacity-90">{c.bMust}</p>
    </div>
  );
}
