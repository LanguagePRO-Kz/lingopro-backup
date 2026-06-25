export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="lp-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c5cff" />
          <stop offset="0.5" stopColor="#5b8cff" />
          <stop offset="1" stopColor="#4ee0d6" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#lp-grad)" />
      <rect x="2" y="2" width="36" height="36" rx="11" fill="black" fillOpacity="0.15" />
      <path
        d="M14 11v18h11"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="27" cy="14" r="2.6" fill="white" />
    </svg>
  );
}
