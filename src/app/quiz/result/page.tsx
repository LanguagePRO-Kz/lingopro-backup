"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ResultView } from "@/components/ResultView";
import { createClient } from "@/lib/supabase/client";
import { fetchProfile, saveProfileResult } from "@/lib/profile";
import { loadResult, saveResult, type QuizResult } from "@/lib/quiz";
import { awardXp, XP } from "@/lib/xp";

/**
 * Post-diagnostic result page. Requires auth (→ /login otherwise). The
 * diagnostic is taken anonymously and cached in localStorage; on the first
 * authed visit here we migrate that result into Supabase (profiles.quiz_result)
 * so it survives across devices. If the profile already has a result we use it.
 */
export default function QuizResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await createClient().auth.getUser();

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
      }

      if (cancelled) return;
      setResult(final);
      setStatus("ready");
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

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
      <ResultView result={result} />
    </PageShell>
  );
}
