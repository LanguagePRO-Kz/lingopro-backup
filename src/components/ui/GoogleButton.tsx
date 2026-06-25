"use client";

/** Google auth button — visual placeholder until real OAuth is wired up. */
export function GoogleButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-black/[0.12] bg-white px-6 py-3.5 text-sm font-medium text-[var(--color-foreground)] shadow-sm transition-all hover:border-black/[0.2] hover:shadow-md"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z" fill="#34A853" />
        <path d="M3.97 10.72A5.4 5.4 0 013.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 000 9c0 1.45.35 2.82.96 4.05l3.01-2.33z" fill="#FBBC05" />
        <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.99 8.99 0 009 0 9 9 0 00.96 4.95L3.97 7.28C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335" />
      </svg>
      {label}
    </button>
  );
}
