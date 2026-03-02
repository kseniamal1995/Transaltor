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
  const percent = total > 0 ? Math.round((learned / total) * 100) : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600 min-w-[3rem]">
        {learned}/{total}
      </span>
    </div>
  );
}
