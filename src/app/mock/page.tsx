import { redirect } from "next/navigation";

/**
 * The public mini-test was the old v1 quiz bank and didn't match its own
 * «Пробный TÖMER» promise (UX-audit #12). The diagnostic IS our public
 * test; real mocks live in the cabinet at /dashboard/mock.
 */
export default function PublicMockPage() {
  redirect("/quiz");
}
