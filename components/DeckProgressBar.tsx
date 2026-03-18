"use client";

interface DeckProgressBarProps {
  learned: number;
  total: number;
  className?: string;
}

export function DeckProgressBar({
  learned,
  total,
  className = "",
}: DeckProgressBarProps) {
  const percent = total > 0 ? Math.min(100, Math.round((learned / total) * 100)) : 0;
  const radius = 24;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * percent) / 100;

  return (
    <div className={`shrink-0 flex flex-col ${className}`}>
      <div
        className="relative inline-flex items-center justify-center shrink-0"
        style={{ width: 56, height: 56 }}
        role="progressbar"
        aria-valuenow={learned}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${percent}%`}
      >
        <svg
          width={56}
          height={56}
          viewBox="0 0 56 56"
          className="text-[var(--color-tertiary)]"
        >
          <circle
            className="stroke-current"
            strokeWidth={strokeWidth}
            fill="transparent"
            cx="28"
            cy="28"
            r={radius}
          />
          <circle
            className="text-[var(--color-primary)]"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            cx="28"
            cy="28"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.3s ease-out" }}
          />
        </svg>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-text leading-none">
          {percent}%
        </span>
      </div>
    </div>
  );
}
