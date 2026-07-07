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
import { clearStashedExamPlan, loadStashedExamPlan, saveExamPlanToProfile } from "@/lib/exam-plan";
import { awardXp, XP } from "@/lib/xp";

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

      // profile wins if present; otherwise migrate the local (anonymous) result
      let final = profile?.quiz_result ?? null;
      if (!final && local) {
        final = local;
        await saveProfileResult(local);
      }

      if (final) {
        saveResult(final); // keep the fast localStorage cache warm
        // one-time XP for completing the diagnostic (dedup_key → never doubles)
        void awardXp("diagnostic", XP.DIAGNOSTIC, { dedupKey: "diagnostic", metadata: { level: final.level } });
        // seed the error memory so the first voice lesson has a personal focus
        void seedMasteryFromDiagnostic(final);

        // v3: onboarding minutes → profile (plan engine input)
        if (final.version === 3 && final.minutesDaily) {
          void supabase
            .from("profiles")
            .update({ study_minutes_daily: final.minutesDaily })
            .eq("id", user.id);
        }
      }

      // persist the onboarding goal/date choice (block D)
      const stashed = loadStashedExamPlan();
      if (stashed) {
        await saveExamPlanToProfile(stashed);
        clearStashedExamPlan();
      }

      if (cancelled) return;
      setResult(final);
      setStatus("ready");

      if (!final || final.version !== 3) return;

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

  if (status === "loading") {
    return (
      <PageShell>
        <div className="h-8 w-8 animate-spin-slow rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </PageShell>
    );
  }

  if (!result) {
    // authed but no result anywhere → send them to take the diagnostic
    router.replace("/quiz");
    return (
      <PageShell>
        <div className="h-8 w-8 animate-spin-slow rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ResultView result={result} yazmaChecking={yazmaChecking} />
    </PageShell>
  );
}
