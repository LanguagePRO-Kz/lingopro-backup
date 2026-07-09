import { redirect } from "next/navigation";

/**
 * Orphan page (UX-audit #14): nothing linked here and it duplicated
 * /quiz/result without the Yazma/Konuşma statuses — one result view,
 * one source of truth.
 */
export default function ResultsPage() {
  redirect("/quiz/result");
}
