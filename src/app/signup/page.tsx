import { redirect } from "next/navigation";

// Legacy route — sign-up now lives at /register.
export default function SignupRedirect() {
  redirect("/register");
}
