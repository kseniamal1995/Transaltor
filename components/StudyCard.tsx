"use client";

interface StudyCardProps {
  foreign: string;
  translation: string;
  isFlipped: boolean;
  onFlip: () => void;
  swipeOffset?: number;
  className?: string;
}

export function StudyCard({
  foreign,
  translation,
  isFlipped,
  onFlip,
  swipeOffset = 0,
  className = "",
}: StudyCardProps) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className={`block w-full min-h-[220px] touch-none select-none text-left ${className}`}
      aria-label={isFlipped ? "Показать слово" : "Показать перевод"}
    >
      <div
        className="relative w-full min-h-[220px]"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 ? "transform 0.3s ease-out" : "none",
        }}
      >
        <div
          className="w-full min-h-[220px] flex flex-col items-center justify-center p-6 rounded-xl border-2 shadow-lg"
          style={{
            backgroundColor: isFlipped ? "#eff6ff" : "white",
            borderColor: isFlipped ? "#93c5fd" : "#e5e7eb",
          }}
        >
          {!isFlipped ? (
            <>
              <p className="text-2xl font-semibold text-gray-900 text-center">
                {foreign}
              </p>
              <p className="mt-3 text-sm text-gray-500">
                Нажмите, чтобы перевернуть
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-medium text-gray-900 text-center">
                {translation}
              </p>
              <p className="mt-3 text-sm text-gray-500">
                Свайп вправо ✓ выучено · влево ✗ ещё раз
              </p>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
