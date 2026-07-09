"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { daysToExam, fetchExamPlan } from "@/lib/exam-plan";
import { PlanVerdictCard } from "@/components/PlanVerdictCard";
import type { StudentLevel } from "@/lib/plan/feasibility";

/**
 * Dashboard checkpoint — the honest forecast line in the plan header when
 * the exam date is LOCKED and the goal doesn't fit (mobilization mode).
 * Self-fetching so the dashboard's hot path stays untouched; renders
 * nothing in every other state (PlanVerdictCard compact guards it too).
 */
export function PlanCheckpoint() {
  const [input, setInput] = useState<{
    level: StudentLevel;
    targetLevel: "B2" | "C1";
    minutesDaily: number;
    daysLeft: number | null;
    flexible: boolean | null;
    mastered: string[];
  } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const p = await fetchExamPlan();
      if (!p || !active) return;
      // only the locked-exact-date case can ever render — skip the rest
      if (p.examDateMode !== "exact" || p.examDateFlexible !== false) return;
      const { data } = await createClient().from("topic_mastery").select("topic").gte("strength", 60);
      if (!active) return;
      setInput({
        level: (p.level === "A0" ? "A0" : ((p.level as StudentLevel | null) ?? "A1")) as StudentLevel,
        targetLevel: p.targetLevel,
        minutesDaily: p.minutesDaily ?? 30,
        daysLeft: daysToExam(p),
        flexible: p.examDateFlexible ?? null,
        mastered: (data ?? []).map((r) => r.topic as string),
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!input) return null;
  return (
    <div className="mt-4">
      <PlanVerdictCard
        compact
        level={input.level}
        targetLevel={input.targetLevel}
        minutesDaily={input.minutesDaily}
        daysLeft={input.daysLeft}
        examDateFlexible={input.flexible}
        masteredTopics={input.mastered}
      />
    </div>
  );
}
