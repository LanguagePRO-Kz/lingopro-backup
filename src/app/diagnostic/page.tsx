import { redirect } from "next/navigation";

// Legacy route — diagnostics now live at /quiz.
export default function DiagnosticRedirect() {
  redirect("/quiz");
}
