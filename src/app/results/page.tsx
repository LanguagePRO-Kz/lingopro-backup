"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { ResultView } from "@/components/ResultView";
import { useI18n } from "@/lib/i18n";
import { loadResult, qt, type QuizResult } from "@/lib/quiz";

export default function ResultsPage() {
  const { locale } = useI18n();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setResult(loadResult());
    setReady(true);
  }, []);

  if (ready && !result) {
    return (
      <PageShell>
        <div className="glass-strong w-full max-w-md rounded-3xl p-8 text-center">
          <h1 className="text-xl font-bold tracking-tight">{qt(locale, "noResult")}</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{qt(locale, "noResultText")}</p>
          <Link href="/quiz" className="btn-primary mt-6 inline-block rounded-full px-6 py-3.5 text-sm">
            {qt(locale, "goQuiz")}
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!result) {
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
