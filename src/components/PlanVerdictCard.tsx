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
 * settings, dashboard checkpoint). Coach tone, never a lie:
 *
 *   scenario A (date can move / no exact date): when the goal doesn't fit,
 *   three REAL alternatives — pace / target / date, as buttons when the
 *   parent can apply them;
 *   scenario B (locked date): no "postpone" — an honest forecast of what IS
 *   reachable plus a mobilization plan.
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
      `Честно: при ${m} мин/день путь ${lvl} → ${tgt} к этой дате не выходит — нужно ~${need} ч, ресурс ~${have} ч. Обычно это ~${months} мес работы. Варианты — выбирай:`,
    aPace: (pace: number) => `Поднять темп до ${pace} мин/день — тогда успеваешь к своей дате.`,
    aPaceNo: (tgt: string) => `Даже 4 часа в день не дадут ${tgt} к этой дате — темпом это не решить.`,
    aTarget: `Цель B2 к этой дате — реально. Для учёбы и работы B2 обычно достаточно.`,
    aDate: (d: string) => `Оставить темп и цель, но сдвинуть дату: реалистично — ${d}.`,
    bHead: (lvl: string, tgt: string, days: number, months: number) =>
      `Дата зафиксирована — работаем на максимум. Скажу как есть: ${lvl} → ${tgt} за ${days} дней — крайне амбициозно, обычно нужно ~${months} мес. Гарантий нет, многое зависит от тебя. Честный расклад:`,
    bReach: (reach: string) => `К экзамену реально выйти на уверенный ${reach}.`,
    bReachNext: (reach: string, next: string) =>
      `К экзамену реально выйти на уверенный ${reach}, а при полной дисциплине — подступиться к ${next}.`,
    bReachPart: (next: string) => `К экзамену реально пройти заметную часть пути к ${next} — прогноз честный, без сказок.`,
    bPace: (pace: number, tgt: string) => `Хочешь дотянуться до ${tgt} — нужно ${pace} мин/день, каждый день.`,
    bPaceNo: (tgt: string) => `Даже при 240 мин/день ${tgt} к этой дате не выходит — фокус на максимум достижимого.`,
    bMust: "Без чего не получится: план дня — каждый день · 3 голосовых урока в неделю · повторение слабых тем — в их день.",
    compact: (reach: string, m: number) =>
      `Дата зафиксирована · честный прогноз к экзамену: ${reach}. План — на максимум: ${m} мин/день, каждый день на счету.`,
    apply: "Выбрать",
    minPerDay: "мин/день",
  },
  en: {
    unknown: (m: number, lvl: string, tgt: string, months: number, need: number) =>
      `At ${m} min/day, ${lvl} → ${tgt} is roughly ${months} months of honest work (~${need} h). Set an exam date and I'll do the exact math.`,
    ok: (need: number, have: number) =>
      `You're on track. ~${need} h of work needed, ~${have} h of realistic resource before the exam. There's margin — just keep the pace.`,
    tight: (need: number, have: number) =>
      `Tight: ~${need} h of work against ~${have} h of resource. Doable — but no skipped days: the daily plan, every day.`,
    aHead: (m: number, lvl: string, tgt: string, need: number, have: number, months: number) =>
      `Honestly: at ${m} min/day, ${lvl} → ${tgt} doesn't fit this date — ~${need} h needed, ~${have} h available. This path usually takes ~${months} months. Real options — your call:`,
    aPace: (pace: number) => `Raise the pace to ${pace} min/day — then you make your date.`,
    aPaceNo: (tgt: string) => `Even 4 hours a day won't reach ${tgt} by this date — pace alone can't solve it.`,
    aTarget: `Target B2 by this date — realistic. For study and work, B2 is usually enough.`,
    aDate: (d: string) => `Keep the pace and the goal, move the date: realistically — ${d}.`,
    bHead: (lvl: string, tgt: string, days: number, months: number) =>
      `The date is locked — so we go all in. Straight talk: ${lvl} → ${tgt} in ${days} days is extremely ambitious; it usually takes ~${months} months. No guarantees — a lot depends on you. The honest picture:`,
    bReach: (reach: string) => `By the exam you can realistically reach a solid ${reach}.`,
    bReachNext: (reach: string, next: string) =>
      `By the exam you can realistically reach a solid ${reach} — and with full discipline, close in on ${next}.`,
    bReachPart: (next: string) => `By the exam you can realistically cover a good part of the road to ${next} — an honest forecast, no fairy tales.`,
    bPace: (pace: number, tgt: string) => `Want a real shot at ${tgt}? That takes ${pace} min/day, every day.`,
    bPaceNo: (tgt: string) => `Even at 240 min/day, ${tgt} doesn't fit this date — focus on the reachable maximum.`,
    bMust: "Non-negotiables: the daily plan — every day · 3 voice lessons a week · weak-topic reviews on their day.",
    compact: (reach: string, m: number) =>
      `Date locked · honest exam forecast: ${reach}. The plan runs at maximum: ${m} min/day, every day counts.`,
    apply: "Apply",
    minPerDay: "min/day",
  },
  tr: {
    unknown: (m: number, lvl: string, tgt: string, months: number, need: number) =>
      `Günde ${m} dk ile ${lvl} → ${tgt} yolu yaklaşık ${months} ay dürüst çalışma demek (~${need} saat). Sınav tarihini belirle, kesin hesabı yapayım.`,
    ok: (need: number, have: number) =>
      `Yetişiyorsun. ~${need} saatlik iş var, sınava kadar gerçekçi kaynağın ~${have} saat. Pay var — yeter ki tempoyu koru.`,
    tight: (need: number, have: number) =>
      `Sıkışık: ~${have} saatlik kaynağa karşı ~${need} saatlik iş. Olur — ama gün kaçırmadan: günün planı, her gün.`,
    aHead: (m: number, lvl: string, tgt: string, need: number, have: number, months: number) =>
      `Dürüstçe: günde ${m} dk ile ${lvl} → ${tgt} bu tarihe sığmıyor — ~${need} saat gerek, ~${have} saat var. Bu yol genelde ~${months} ay sürer. Gerçek seçenekler — karar senin:`,
    aPace: (pace: number) => `Tempoyu günde ${pace} dakikaya çıkar — o zaman tarihine yetişirsin.`,
    aPaceNo: (tgt: string) => `Günde 4 saat bile bu tarihe kadar ${tgt} getirmez — bunu tempo çözmez.`,
    aTarget: `Bu tarihe kadar B2 hedefi — gerçekçi. Eğitim ve iş için B2 genelde yeterli.`,
    aDate: (d: string) => `Tempoyu ve hedefi koru, tarihi kaydır: gerçekçi olan — ${d}.`,
    bHead: (lvl: string, tgt: string, days: number, months: number) =>
      `Tarih kesin — o zaman maksimum çalışıyoruz. Açık konuşayım: ${days} günde ${lvl} → ${tgt} son derece iddialı; genelde ~${months} ay gerekir. Garanti yok — çoğu sana bağlı. Dürüst tablo:`,
    bReach: (reach: string) => `Sınava kadar sağlam bir ${reach} seviyesine çıkmak gerçekçi.`,
    bReachNext: (reach: string, next: string) =>
      `Sınava kadar sağlam bir ${reach} gerçekçi; tam disiplinle ${next} seviyesine yaklaşırsın.`,
    bReachPart: (next: string) => `Sınava kadar ${next} yolunun önemli bir kısmını almak gerçekçi — dürüst tahmin, masal yok.`,
    bPace: (pace: number, tgt: string) => `${tgt} için gerçek bir şans istiyorsan: günde ${pace} dk, her gün.`,
    bPaceNo: (tgt: string) => `Günde 240 dk ile bile ${tgt} bu tarihe sığmıyor — ulaşılabilir maksimuma odaklan.`,
    bMust: "Olmazsa olmazlar: günün planı — her gün · haftada 3 sesli ders · zayıf konu tekrarları — kendi gününde.",
    compact: (reach: string, m: number) =>
      `Tarih kesin · dürüst sınav tahmini: ${reach}. Plan maksimumda: günde ${m} dk, her gün sayılır.`,
    apply: "Uygula",
    minPerDay: "dk/gün",
  },
  kk: {
    unknown: (m: number, lvl: string, tgt: string, months: number, need: number) =>
      `Күніне ${m} минутпен ${lvl} → ${tgt} жолы — шамамен ${months} ай адал жұмыс (~${need} сағат). Емтихан күнін қой — нақтысын есептеп беремін.`,
    ok: (need: number, have: number) =>
      `Үлгересің. ~${need} сағат жұмыс керек, емтиханға дейінгі нақты қорың ~${have} сағат. Қор бар — бастысы, қарқынды ұста.`,
    tight: (need: number, have: number) =>
      `Тығыз: ~${have} сағат қорға ~${need} сағат жұмыс. Болады — бірақ бір күн де жібермей: күн жоспары, күн сайын.`,
    aHead: (m: number, lvl: string, tgt: string, need: number, have: number, months: number) =>
      `Шынын айтқанда: күніне ${m} минутпен ${lvl} → ${tgt} бұл күнге сыймайды — ~${need} сағат керек, ~${have} сағат бар. Бұл жол әдетте ~${months} айға созылады. Нақты нұсқалар — таңдау сенікі:`,
    aPace: (pace: number) => `Қарқынды күніне ${pace} минутқа көтер — сонда өз күніңе үлгересің.`,
    aPaceNo: (tgt: string) => `Күніне 4 сағат та бұл күнге дейін ${tgt} бермейді — мұны қарқын шешпейді.`,
    aTarget: `Бұл күнге дейін B2 мақсаты — нақты қол жетімді. Оқу мен жұмысқа әдетте B2 жеткілікті.`,
    aDate: (d: string) => `Қарқын мен мақсатты сақтап, күнді жылжыт: шынайысы — ${d}.`,
    bHead: (lvl: string, tgt: string, days: number, months: number) =>
      `Күн бекітілген — демек максимум жұмыс істейміз. Ашығын айтайын: ${days} күнде ${lvl} → ${tgt} — өте өршіл, әдетте ~${months} ай керек. Кепілдік жоқ — көбі өзіңе байланысты. Адал көрініс:`,
    bReach: (reach: string) => `Емтиханға дейін нық ${reach} деңгейіне шығу — нақты қол жетімді.`,
    bReachNext: (reach: string, next: string) =>
      `Емтиханға дейін нық ${reach} — нақты; толық тәртіппен ${next} деңгейіне жақындайсың.`,
    bReachPart: (next: string) => `Емтиханға дейін ${next} жолының едәуір бөлігін жүріп өту — нақты болжам, ертегісіз.`,
    bPace: (pace: number, tgt: string) => `${tgt} үшін нақты мүмкіндік керек пе — күніне ${pace} минут, күн сайын.`,
    bPaceNo: (tgt: string) => `Күніне 240 минутпен де ${tgt} бұл күнге сыймайды — қол жетімді максимумға шоғырлан.`,
    bMust: "Онсыз болмайды: күн жоспары — күн сайын · аптасына 3 дауысты сабақ · әлсіз тақырыптарды қайталау — өз күнінде.",
    compact: (reach: string, m: number) =>
      `Күн бекітілген · емтиханға адал болжам: ${reach}. Жоспар — максимумда: күніне ${m} минут, әр күн есепте.`,
    apply: "Таңдау",
    minPerDay: "мин/күн",
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
    // scenario A — the date can move: honest "doesn't fit" + real choices
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
      </div>
    );
  }

  // scenario B — locked date: no "postpone", mobilization + honest forecast
  return (
    <div className={`flex flex-col gap-2.5 rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${tone}`}>
      <p>{c.bHead(level, targetLevel, plan.daysLeft ?? 0, plan.monthsNeeded)}</p>
      <p className="font-semibold">
        🎯{" "}
        {reachLabel
          ? plan.nextStepShare >= 0.4 && nextAfterReach
            ? c.bReachNext(reachLabel, nextAfterReach)
            : c.bReach(reachLabel)
          : c.bReachPart(nextAfterReach ?? targetLevel)}
      </p>
      <div className="flex items-center justify-between gap-3 rounded-xl bg-white/50 px-3 py-2">
        <span>⏱ {paceFits ? c.bPace(paceUp!, targetLevel) : c.bPaceNo(targetLevel)}</span>
        {paceFits && onApplyMinutes && <ApplyBtn label={c.apply} onClick={() => onApplyMinutes(paceUp!)} />}
      </div>
      <p className="text-xs opacity-90">{c.bMust}</p>
    </div>
  );
}
