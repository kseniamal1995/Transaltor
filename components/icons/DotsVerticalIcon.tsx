interface DotsVerticalIconProps {
  size?: number;
  className?: string;
}

export function DotsVerticalIcon({ size = 20, className }: DotsVerticalIconProps) {
  const r = size * 0.1;
  const cx = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <circle cx={cx} cy={size * 0.2} r={r} />
      <circle cx={cx} cy={size * 0.5} r={r} />
      <circle cx={cx} cy={size * 0.8} r={r} />
    </svg>
  );
}
