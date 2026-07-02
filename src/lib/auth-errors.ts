/**
 * Maps Supabase auth error messages to friendly Russian copy shown under the
 * login / register forms. Matches by substring so wording tweaks upstream
 * still resolve; unknown errors fall back to a generic Russian message.
 */
const MAP: { match: string; ru: string }[] = [
  { match: "Invalid login credentials", ru: "Неверный email или пароль" },
  { match: "already registered", ru: "Этот email уже зарегистрирован" },
  { match: "Password should be at least 6 characters", ru: "Пароль минимум 6 символов" },
  { match: "Unable to validate email address", ru: "Введите корректный email" },
  { match: "Email rate limit exceeded", ru: "Слишком много попыток. Подождите немного" },
  { match: "Email not confirmed", ru: "Подтвердите email — мы отправили письмо на вашу почту" },
];

export function authErrorRu(message: string | null | undefined): string {
  if (!message) return "Что-то пошло не так. Попробуйте ещё раз";
  const hit = MAP.find((m) => message.toLowerCase().includes(m.match.toLowerCase()));
  return hit ? hit.ru : "Что-то пошло не так. Попробуйте ещё раз";
}

/** True when the error is a Supabase rate limit ("too many requests"). */
export function isRateLimit(message: string | null | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes("rate limit") || m.includes("too many") || m.includes("429");
}
