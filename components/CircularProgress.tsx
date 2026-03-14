interface CircularProgressProps {
  /** 0–100 */
  percent: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * Круговой индикатор прогресса изучения.
 * Акцент — primary (зелёный), трек — tertiary.
 */
export function CircularProgress({
  percent,
  size = 64,
  strokeWidth = 5,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clampedPercent / 100) * circumference;
  const center = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden
    >
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--color-tertiary)"
        strokeWidth={strokeWidth}
      />
      {/* Fill */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: "stroke-dashoffset 0.3s ease" }}
      />
      {/* Percentage text */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.22}
        fill="var(--color-text-secondary)"
        fontFamily="var(--font-sans)"
      >
        {clampedPercent}%
      </text>
    </svg>
  );
}
