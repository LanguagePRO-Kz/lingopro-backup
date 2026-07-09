"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ResultView } from "@/components/ResultView";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { fetchProfile, saveProfileResult } from "@/lib/profile";
import { loadResult, saveResult, type QuizResult } from "@/lib/quiz";
import { seedMasteryFromDiagnostic } from "@/lib/ai/diagnostic-seed";
import { withYazmaReview } from "@/lib/diagnostic/engine";
import { attachKonusmaScore } from "@/lib/diagnostic/result";
import { validateWritingReview } from "@/lib/ai/prompts/writing-review";
import { YAZMA_PROMPTS } from "@/data/diagnostic-bank";
import { clearStashedExamPlan, daysToExam, fetchExamPlan, loadStashedExamPlan, saveExamPlanToProfile, saveStudyMinutes, type ExamPlan } from "@/lib/exam-plan";
import { awardXp, XP } from "@/lib/xp";
import { PlanVerdictCard } from "@/components/PlanVerdictCard";

/**
 * Post-diagnostic result page. Requires auth (→ /login otherwise). The
 * diagnostic is taken anonymously and cached in localStorage; on the first
 * authed visit here we (1) migrate the result into profiles.quiz_result,
 * (2) seed the error memory, (3) persist onboarding choices (goal/date/
 * minutes), (4) run the deferred Yazma AI review (v3), and (5) attach the
 * Konuşma score once a reviewed live lesson exists.
 */
export default function QuizResultPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [yazmaChecking, setYazmaChecking] = useState(false);
  // goal/date context for the honest plan verdict (stash on a fresh
  // diagnostic, profile on a retake visit)
  const [examPlan, setExamPlan] = useState<ExamPlan | null>(null);
  // pace override after "raise the pace" is applied from the verdict card
  const [minutesOverride, setMinutesOverride] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const profile = await fetchProfile();
      const local = loadResult();

      // newest attempt wins (a retake's local cache can be fresher than the
      // profile if the write raced); a local-only result gets migrated
      const remote = profile?.quiz_result ?? null;
      let final = remote;
      if (local && (!remote || (local.takenAt ?? 0) > (remote.takenAt ?? 0))) {
        final = local;
        await saveProfileResult(local);
      }

      if (!final) {
        // no result in the profile OR locally → the diagnostic wasn't finished
        router.replace("/quiz");
        return;
      }

      saveResult(final); // keep the fast localStorage cache warm
      // one-time XP for completing the diagnostic (dedup_key → never doubles)
      void awardXp("diagnostic", XP.DIAGNOSTIC, { dedupKey: "diagnostic", metadata: { level: final.level } });
      // seed the error memory so the first voice lesson has a personal focus
      void seedMasteryFromDiagnostic(final);

      // v3: onboarding minutes → profile BEFORE the dashboard can generate a
      // route (awaited: the route inputs must see the real minutes, not 30)
      if (final.version === 3 && final.minutesDaily) {
        await supabase.from("profiles").update({ study_minutes_daily: final.minutesDaily }).eq("id", user.id);
        // ISOLATED: gender arrives with migration 0006 — bundled into the
        // update above, a missing column would 400 the minutes write too
        if (final.gender) {
          void supabase.from("profiles").update({ gender: final.gender }).eq("id", user.id).then();
        }
      }

      // persist the onboarding goal/date choice (block D)
      const stashed = loadStashedExamPlan();
      if (stashed) {
        await saveExamPlanToProfile(stashed);
        clearStashedExamPlan();
        if (!cancelled) setExamPlan(stashed);
      } else {
        // retake visit — the choice already lives in the profile
        void fetchExamPlan().then((p) => {
          if (p && !cancelled) setExamPlan(p);
        });
      }

      if (cancelled) return;
      setResult(final);
      setStatus("ready");

      if (final.version !== 3) return;

      // Konuşma: attach from the first reviewed live lesson (retake visits)
      if (final.sections?.konusma == null) {
        void attachKonusmaScore().then((updated) => {
          if (updated && !cancelled) setResult(updated);
        });
      }

      // deferred Yazma review (diagnostic quota 2/day; see DESIGN-DIAGNOSTIC-V2 §4)
      if (final.writingText && !final.yazmaReview) {
        setYazmaChecking(true);
        try {
          const taskPrompt = YAZMA_PROMPTS.find((p) => p.id === final.yazmaPromptId)?.prompt;
          const res = await fetch("/api/ai/diagnostic-writing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: final.writingText, taskPrompt, feedbackLang: locale }),
          });
          if (res.ok) {
            const data = (await res.json()) as { review?: unknown };
            const review = validateWritingReview(data.review);
            if (review) {
              const updated = withYazmaReview(final, review);
              await saveProfileResult(updated);
              saveResult(updated);
              if (!cancelled) setResult(updated);
            }
          }
          // non-ok (quota/budget/ai down) → stay pending; the next visit retries
        } catch {
          /* network error → stay pending */
        } finally {
          if (!cancelled) setYazmaChecking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, locale]);

  // while loading OR while the effect redirects (no result) — just a spinner;
  // navigation happens in the effect, never during render
  if (status === "loading" || !result) {
    return (
      <PageShell>
        <div className="h-8 w-8 animate-spin-slow rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </PageShell>
    );
  }

  // honest plan verdict, right under the level (founder: the verdict comes
  // BEFORE the route). Mastery credit deliberately omitted here — the seed
  // just landed; settings shows the credited version later. The buttons SAVE
  // for real (founder bug: the verdict said "интенсив" while the plan kept
  // building 30-min days) — the dashboard rebuilds route + day on next open.
  const applyExamPlan = async (next: ExamPlan) => {
    await saveExamPlanToProfile(next);
    setExamPlan(next);
  };
  const verdict = examPlan ? (
    <PlanVerdictCard
      level={result.routerLevel ?? result.level}
      targetLevel={examPlan.targetLevel}
      minutesDaily={minutesOverride ?? result.minutesDaily ?? 30}
      daysLeft={
        examPlan.examDateMode === "exact"
          ? daysToExam(examPlan)
          : examPlan.examDateMode === "approx" && examPlan.examHorizonMonths
            ? examPlan.examHorizonMonths * 30
            : null
      }
      examDateFlexible={examPlan.examDateMode === "exact" ? (examPlan.examDateFlexible ?? true) : true}
      onApplyMinutes={(m) => {
        void saveStudyMinutes(m).then(() => {
          try {
            window.sessionStorage.removeItem("lp:route-requested"); // route regen on next dashboard open
          } catch {
            /* ignore */
          }
        });
        setMinutesOverride(m);
      }}
      onApplyTarget={() => void applyExamPlan({ ...examPlan, targetLevel: "B2" })}
      onApplyDate={(d) => void applyExamPlan({ ...examPlan, examDateMode: "exact", examDate: d, examDateFlexible: examPlan.examDateFlexible ?? true })}
    />
  ) : null;

  return (
    <PageShell>
      <ResultView result={result} yazmaChecking={yazmaChecking} planVerdict={verdict} />
    </PageShell>
  );
}
