/** SVG logo: hip/pelvis in sage, "LCEA" text in lavender to match app palette. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Pelvis outline with transparent center - pastel green (sage) */}
      <path
        fillRule="evenodd"
        d="M60 5 C28 5 8 24 8 44 C8 60 20 76 36 82 L36 90 C36 94 42 96 50 96 L70 96 C78 96 84 94 84 90 L84 82 C100 76 112 60 112 44 C112 24 92 5 60 5 Z M60 14 C86 14 102 28 102 44 C102 58 92 70 78 74 L78 84 L52 84 L52 74 C38 70 28 58 28 44 C28 28 34 14 60 14 Z"
        fill="var(--sage)"
      />
      {/* LCEA text - lavender */}
      <text
        x="60"
        y="56"
        textAnchor="middle"
        fill="var(--lavender)"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fontSize="26"
      >
        LCEA
      </text>
    </svg>
  );
}
