"use client";

/**
 * Decorative full-bleed background: soft light aurora blobs, faint grid and
 * a subtle noise texture. Purely cosmetic — aria-hidden and pointer-events: none.
 */
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base wash: milky white drifting into a faint sky tint */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, #ffffff 0%, #f4f6fb 45%, #eef1f8 100%)",
        }}
      />
      <div
        className="aurora animate-float-slow"
        style={{
          top: "-12%",
          left: "-6%",
          width: "44rem",
          height: "44rem",
          opacity: 0.5,
          background: "radial-gradient(circle at 30% 30%, #6d5bff, transparent 62%)",
        }}
      />
      <div
        className="aurora animate-float-slow"
        style={{
          top: "16%",
          right: "-12%",
          width: "40rem",
          height: "40rem",
          animationDelay: "-4s",
          opacity: 0.45,
          background: "radial-gradient(circle at 60% 40%, #19c6b3, transparent 62%)",
        }}
      />
      <div
        className="aurora animate-float-slow"
        style={{
          bottom: "-18%",
          left: "22%",
          width: "42rem",
          height: "42rem",
          animationDelay: "-8s",
          opacity: 0.3,
          background: "radial-gradient(circle at 50% 50%, #5b8cff, transparent 62%)",
        }}
      />
      <div className="grid-overlay absolute inset-0" />
      <div className="noise absolute inset-0 opacity-[0.02] mix-blend-multiply" />
    </div>
  );
}
