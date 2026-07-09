"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { createClient } from "@/lib/supabase/client";
import { daysToExam, fetchExamPlan } from "@/lib/exam-plan";
import { topicsForSpan } from "@/lib/plan/route";
import { contentLevel } from "@/lib/daily-plan";

/**
 * Live facts row under the dashboard greeting (motivator block 1).
 * Every chip is a REAL number — exam countdown from the profile date,
 * streak from daily_progress, topics closed inside the actual route span.
 * A chip with no real data behind it simply doesn't render (no generic
 * "молодец" — founder's honesty condition).
 */

const T = {
  ru: {
    exam: (d: number) => `📅 До экзамена: ${d} ${d % 10 === 1 && d % 100 !== 11 ? "день" : [2, 3, 4].includes(d % 10) && ![12, 13, 14].includes(d % 100) ? "дня" : "дней"}`,
    streak: (n: number) => `🔥 ${n} ${[2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? "дня" : n % 10 === 1 && n % 100 !== 11 ? "день" : "дней"} подряд`,
    topics: (done: number, all: number, tgt: string) => `📈 Темы до ${tgt}: ${done} из ${all}`,
  },
  en: {
    exam: (d: number) => `📅 Exam in ${d} ${d === 1 ? "day" : "days"}`,
    streak: (n: number) => `🔥 ${n} ${n === 1 ? "day" : "days"} in a row`,
    topics: (done: number, all: number, tgt: string) => `📈 Topics to ${tgt}: ${done} of ${all}`,
  },
  tr: {
    exam: (d: number) => `📅 Sınava ${d} gün`,
    streak: (n: number) => `🔥 Üst üste ${n} gün`,
    topics: (done: number, all: number, tgt: string) => `📈 ${tgt} yolundaki konular: ${done}/${all}`,
  },
  kk: {
    exam: (d: number) => `📅 Емтиханға ${d} күн`,
    streak: (n: number) => `🔥 Қатарынан ${n} күн`,
    topics: (done: number, all: number, tgt: string) => `📈 ${tgt} жолындағы тақырыптар: ${done}/${all}`,
  },
};

export function LiveFacts({ streak, levelRaw }: { streak: number; levelRaw: string }) {
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [examDays, setExamDays] = useState<number | null>(null);
  const [topics, setTopics] = useState<{ done: number; all: number; target: string } | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const p = await fetchExamPlan();
      if (!p || !active) return;
      setExamDays(daysToExam(p));
      const span = topicsForSpan(contentLevel(levelRaw), p.targetLevel);
      if (span.length === 0) return;
      const { data, error } = await createClient().from("topic_mastery").select("topic").gte("strength", 60);
      if (error || !active) return;
      const mastered = new Set((data ?? []).map((r) => r.topic as string));
      setTopics({ done: span.filter((t) => mastered.has(t)).length, all: span.length, target: p.targetLevel });
    })();
    return () => {
      active = false;
    };
  }, [levelRaw]);

  const chips: string[] = [];
  if (examDays != null) chips.push(c.exam(examDays));
  if (streak >= 2) chips.push(c.streak(streak));
  if (topics) chips.push(c.topics(topics.done, topics.all, topics.target));
  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span key={chip} className="rounded-full bg-black/[0.04] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-foreground)]">
          {chip}
        </span>
      ))}
    </div>
  );
}
