/**
 * Shared email sign-up flow for the post-quiz gate and the /register page.
 *
 * Goal: never leave the user stuck on "check your email". We sign them up and,
 * if email confirmation is enabled (no session returned), immediately sign in
 * with the same credentials. Once a session exists we migrate the anonymous
 * diagnostic result from localStorage into Supabase and clear the local copy.
 */

import { createClient } from "@/lib/supabase/client";
import { saveProfileResult } from "@/lib/profile";
import { loadResult, clearResult } from "@/lib/quiz";

export type SignUpOutcome =
  | { ok: true }
  | { ok: false; error: string };

export async function signUpAndSync(
  email: string,
  password: string,
  fullName: string,
): Promise<SignUpOutcome> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) return { ok: false, error: error.message };

  // If confirmation is enabled there's no session yet — sign in right away.
  let session = data.session;
  if (!session) {
    const signIn = await supabase.auth.signInWithPassword({ email, password });
    if (signIn.error) return { ok: false, error: signIn.error.message };
    session = signIn.data.session;
  }

  if (!session) return { ok: false, error: "No session after sign up" };

  // Persist the diagnostic result to the profile, then drop the local cache.
  const local = loadResult();
  if (local) {
    await saveProfileResult(local);
    clearResult();
  }

  return { ok: true };
}
