"use client";

/** Apple auth button. `disabled` dims it and shows a small "soon" badge. */
export function AppleButton({
  label,
  onClick,
  disabled = false,
  badge,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled && badge ? badge : undefined}
      aria-disabled={disabled}
      className={`flex w-full items-center justify-center gap-3 rounded-full bg-black px-6 py-3.5 text-sm font-medium text-white shadow-sm transition-all ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-black/85 hover:shadow-md"
      }`}
    >
      <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" aria-hidden>
        <path d="M13.2 9.55c-.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.43.73-3.06.73-.63 0-1.6-.71-2.64-.69-1.36.02-2.61.79-3.31 2-1.41 2.45-.36 6.07 1.01 8.06.67.97 1.47 2.06 2.51 2.02 1.01-.04 1.39-.65 2.61-.65 1.21 0 1.56.65 2.63.63 1.09-.02 1.78-.99 2.45-1.97.77-1.13 1.09-2.22 1.1-2.28-.02-.01-2.11-.81-2.13-3.2zM11.2 3.56c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.21-.52.6-.97 1.56-.85 2.48.9.07 1.83-.46 2.39-1.13z" />
      </svg>
      {label}
      {disabled && badge && (
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
