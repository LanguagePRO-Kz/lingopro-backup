"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useExam } from "@/lib/exam-context";
import { useI18n, type Locale } from "@/lib/i18n";
import { pick, plural } from "@/lib/localized";
import {
  ANALYSIS,
  LEVEL_ORDER,
  MODULES,
  PLANS,
  levelIndex,
  qt,
  clearProgress,
  clearResult,
  type ModuleId,
  type QuizResult,
} from "@/lib/quiz";

function barColor(percent: number) {
  if (percent >= 70) return { from: "#16a34a", to: "#22c55e" };
  if (percent >= 40) return { from: "#d97706", to: "#f59e0b" };
  return { from: "#dc2626", to: "#ef4444" };
}

function moduleMeta(id: ModuleId) {
  return MODULES.find((m) => m.id === id)!;
}

/* ------------------------------- Skill bar -------------------------------- */
function SkillBar({
  id,
  percent,
  level,
  delay,
  locale,
}: {
  id: ModuleId;
  percent: number;
  level: string;
  delay: number;
  locale: Locale;
}) {
  const m = moduleMeta(id);
  const c = barColor(percent);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-[var(--color-foreground)]">
          <span>{m.emoji}</span>
          {m.name[locale]}
        </span>
        <span className="text-[var(--color-muted)]">
          {percent}% · <span className="font-semibold text-[var(--color-foreground)]">{level}</span>
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(to right, ${c.from}, ${c.to})` }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.9, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ------------------------------- Accordion -------------------------------- */
function ModuleAccordion({
  id,
  percent,
  level,
  words,
  locale,
  defaultOpen,
}: {
  id: ModuleId;
  percent: number;
  level: string;
  words: number;
  locale: Locale;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const m = moduleMeta(id);
  const a = ANALYSIS[id];
  const c = barColor(percent);

  // RU needs proper numeral agreement ("232 слова", not "232 слов");
  // other locales don't inflect the noun after a number here.
  const inject = (t: string) =>
    locale === "ru"
      ? t.replace("{words} слов", plural(words, "слово", "слова", "слов")).replace("{words}", String(words))
      : t.replace("{words}", String(words));

  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-black/[0.02]"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-[var(--color-foreground)] sm:text-base">
          <span>{m.emoji}</span>
          {m.name[locale]}
          <span
            className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
            style={{ background: `linear-gradient(to right, ${c.from}, ${c.to})` }}
          >
            {percent}% · {level}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-[var(--color-muted)]"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 border-t border-black/[0.06] px-5 py-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-2)]">
                  {qt(locale, "knowsTitle")}
                </div>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {a.knows.map((k) => (
                    <li key={k.ru} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]">
                      <span className="text-[var(--color-brand-2)]">✅</span>
                      {k[locale]}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#d97706]">
                  {qt(locale, "gapsTitle")}
                </div>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {a.gaps.map((g) => (
                    <li key={g.ru} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]">
                      <span>❌</span>
                      {inject(g[locale])}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-[var(--color-brand)]/[0.05] p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)]">
                  {qt(locale, "todoTitle")}
                </div>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {a.todo.map((d) => (
                    <li key={d.ru} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]">
                      <span className="text-[var(--color-brand)]">→</span>
                      {d[locale]}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 inline-block rounded-full bg-[var(--color-brand)]/12 px-3 py-1 text-xs font-semibold text-[var(--color-brand)]">
                  {a.progress[locale]}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ Result view ------------------------------ */
/** The full diagnostic result UI. Shared by /results and /quiz/result. */
export function ResultView({ result }: { result: QuizResult }) {
  const { exam } = useExam();
  const { locale } = useI18n();
  const router = useRouter();

  // full reset: a fresh diagnostic always starts at module 1
  function retake() {
    clearProgress();
    clearResult();
    router.push("/quiz");
  }

  const C = 2 * Math.PI * 52;
  const plan = PLANS[result.plan];
  const highRisk = result.overall < 65;

  // ordered worst → best for the breakdown
  const orderedSkills = result.byWeakness.map((id) => result.skills.find((s) => s.id === id)!);

  // comparison markers (index over A0..C1)
  const youIdx = levelIndex(result.level);
  const pct = (i: number) => (i / (LEVEL_ORDER.length - 1)) * 100;

  return (
    <div className="w-full max-w-3xl py-4">
      {/* ============ 1. Overall level ============ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-7 text-center sm:p-9"
      >
        <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          {qt(locale, "yourLevel")} {exam.name}
        </span>
        <div className="relative mx-auto mt-4 h-44 w-44">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(16,24,40,0.08)" strokeWidth="10" />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="url(#rg)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C * (1 - result.overall / 100) }}
              transition={{ duration: 1.3, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#6d5bff" />
                <stop offset="1" stopColor="#19c6b3" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-gradient text-5xl font-bold">{result.level}</span>
            <span className="mt-1 text-sm font-medium text-[var(--color-foreground)]">{result.overall}/100</span>
            <span className="text-[11px] text-[var(--color-muted)]">{qt(locale, "correct")}</span>
          </div>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/[0.04] px-4 py-2 text-sm">
          <span className="text-[var(--color-muted)]">{qt(locale, "predicted")} {exam.name}:</span>
          <span className="font-bold text-[var(--color-foreground)]">≈ {result.predictedScore} / 100</span>
        </div>
      </motion.div>

      {/* ============ 2. Skill breakdown ============ */}
      <div className="glass mt-6 flex flex-col gap-5 rounded-3xl p-7">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{qt(locale, "skills")}</h2>
        {result.skills.map((s, i) => (
          <SkillBar key={s.id} id={s.id} percent={s.percent} level={s.level} delay={i * 0.12} locale={locale} />
        ))}
      </div>

      {/* ============ 3. Detailed breakdown ============ */}
      <div className="mt-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-foreground)]">{qt(locale, "detailTitle")}</h2>
        <div className="flex flex-col gap-3">
          {orderedSkills.map((s, i) => (
            <ModuleAccordion
              key={s.id}
              id={s.id}
              percent={s.percent}
              level={s.level}
              words={result.writingWords}
              locale={locale}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      </div>

      {/* ============ 4. Exam forecast ============ */}
      <div className="border-gradient mt-6 rounded-3xl p-7">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
          {qt(locale, "forecastTitle")} {exam.name}
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#dc2626]/25 bg-[#dc2626]/[0.05] p-4">
            <div className="text-xs font-medium text-[var(--color-muted)]">{qt(locale, "ifNow")}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#dc2626]" />
              <span className="text-sm text-[var(--color-foreground)]">
                {qt(locale, "likelyResult")}:{" "}
                <span className="font-bold">{result.level}</span> · {qt(locale, "readinessWord")}{" "}
                <span className="font-bold">{result.overall}%</span>
              </span>
            </div>
            {highRisk && <div className="mt-2 text-xs text-[#b91c1c]">{qt(locale, "riskText")}</div>}
          </div>

          <div className="rounded-2xl border border-[#16a34a]/25 bg-[#16a34a]/[0.05] p-4">
            <div className="text-xs font-medium text-[var(--color-muted)]">{qt(locale, "afterPrep")}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#16a34a]" />
              <span className="text-sm text-[var(--color-foreground)]">
                {qt(locale, "expectedResult")}: <span className="font-bold">C1</span>
              </span>
            </div>
            <div className="mt-2 text-xs text-[var(--color-muted)]">
              {qt(locale, "termWord")}: {plan.desc[locale]}
            </div>
          </div>
        </div>

        {/* progress to C1 */}
        <div className="mt-6">
          <div className="relative h-2.5 w-full rounded-full bg-black/[0.06]">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(8, pct(youIdx))}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <div
              className="absolute -top-1 -translate-x-1/2 rounded-full border-2 border-white bg-[var(--color-brand)] shadow"
              style={{ left: `${Math.max(4, pct(youIdx))}%`, height: 18, width: 18 }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-[var(--color-muted)]">
            <span>{result.level} · {qt(locale, "nowLabel")}</span>
            <span>{qt(locale, "m1")}</span>
            <span>{qt(locale, "m3")}</span>
            <span className="font-semibold text-[var(--color-brand)]">C1</span>
          </div>
        </div>
      </div>

      {/* ============ 5. Personal plan ============ */}
      <div className="glass mt-6 rounded-3xl p-7">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{qt(locale, "planToC1")}</h2>
        <div className="mt-3 rounded-2xl bg-gradient-to-br from-[var(--color-brand)]/[0.08] to-[var(--color-brand-2)]/[0.08] p-5">
          <div className="text-xl font-bold text-[var(--color-foreground)]">{plan.title[locale]}</div>
          <div className="mt-1 text-sm font-medium text-[var(--color-brand)]">
            {result.level} → C1 · {plan.desc[locale]}
          </div>

          <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            {qt(locale, "stagesTitle")}
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            {plan.stages.map((st, i) => (
              <motion.div
                key={st.ru}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-sm text-[var(--color-foreground)]">{st[locale]}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ 6. Comparison ============ */}
      <div className="glass mt-6 rounded-3xl p-7">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{qt(locale, "compareTitle")}</h2>

        <div className="relative mt-12 mb-10">
          {/* scale */}
          <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-[#dc2626] via-[#f59e0b] to-[#16a34a]" />
          <div className="mt-2 flex justify-between text-[11px] font-medium text-[var(--color-muted)]">
            {LEVEL_ORDER.map((lv) => (
              <span key={lv}>{lv}</span>
            ))}
          </div>

          {/* you (above) */}
          <div
            className="absolute -top-9 -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${pct(youIdx)}%` }}
          >
            <div className="rounded-full bg-[var(--color-brand)] px-2.5 py-1 text-[11px] font-bold text-white shadow">
              {qt(locale, "youHere")}
            </div>
            <div className="mx-auto h-2 w-0.5 bg-[var(--color-brand)]" />
          </div>

          {/* average student (below) */}
          <div
            className="absolute top-7 -translate-x-1/2 whitespace-nowrap text-center"
            style={{ left: `${pct(2)}%` }}
          >
            <div className="mx-auto h-2 w-0.5 bg-[var(--color-muted)]" />
            <div className="mt-0.5 text-[10px] text-[var(--color-muted)]">{qt(locale, "avgStudent")}</div>
          </div>

          {/* needed for exam (below, right) */}
          <div
            className="absolute top-7 -translate-x-1/2 whitespace-nowrap text-center"
            style={{ left: `${pct(LEVEL_ORDER.length - 1)}%` }}
          >
            <div className="mx-auto h-2 w-0.5 bg-[#16a34a]" />
            <div className="mt-0.5 text-[10px] font-medium text-[#16a34a]">
              {qt(locale, "neededFor")} {exam.name}
            </div>
          </div>
        </div>

        <p className="rounded-xl bg-[var(--color-brand)]/[0.05] px-4 py-3 text-sm text-[var(--color-foreground)]">
          {qt(locale, "compareNote")}
        </p>
      </div>

      {/* ============ 7. CTA ============ */}
      <div className="mt-7">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/pricing" className="btn-primary flex-1 rounded-full px-6 py-4 text-center text-sm">
            {pick(locale, { ru: "Выбрать тариф", en: "Choose a plan", tr: "Plan seç", kk: "Тариф таңдау" })} →
          </Link>
          <button type="button" onClick={retake} className="btn-ghost flex-1 rounded-full px-6 py-4 text-center text-sm font-medium">
            {qt(locale, "retake")}
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-[var(--color-muted)]">🎁 {qt(locale, "discountNote")}</p>
      </div>
    </div>
  );
}
