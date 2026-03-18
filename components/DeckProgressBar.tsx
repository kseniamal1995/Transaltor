"use client";

interface DeckProgressBarProps {
  learned: number;
  total: number;
  size?: "sm" | "md";
  className?: string;
}

export function DeckProgressBar({
  learned,
  total,
  size = "md",
  className = "",
}: DeckProgressBarProps) {
  const percent = total > 0 ? Math.min(100, Math.round((learned / total) * 100)) : 0;

  const isSm = size === "sm";
  const svgSize = isSm ? 32 : 56;
  const radius = isSm ? 13 : 24;
  const strokeWidth = isSm ? 3 : 4;
  const center = svgSize / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * percent) / 100;

  return (
    <div className={`shrink-0 flex items-center ${isSm ? "gap-2" : "flex-col"} ${className}`}>
      <div
        className="relative inline-flex items-center justify-center shrink-0"
        style={{ width: svgSize, height: svgSize }}
        role="progressbar"
        aria-valuenow={learned}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${percent}%`}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="text-[var(--color-tertiary)]"
        >
          <circle
            className="stroke-current"
            strokeWidth={strokeWidth}
            fill="transparent"
            cx={center}
            cy={center}
            r={radius}
          />
          <circle
            className="text-[var(--color-primary)]"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            cx={center}
            cy={center}
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.3s ease-out" }}
          />
        </svg>
        {!isSm && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-text leading-none">
            {percent}%
          </span>
        )}
      </div>
      {isSm && (
        <span className="text-sm text-text-secondary">
          {percent}%
        </span>
      )}
    </div>
  );
}
