"use client";

interface TranslateInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onTranslate?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TranslateInput({
  value,
  onChange,
  onBlur,
  onTranslate,
  disabled = false,
  placeholder = "Введите слово или фразу...",
}: TranslateInputProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onTranslate?.();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="translate-input" className="sr-only">
        Текст для перевода
      </label>
      <textarea
        id="translate-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="w-full min-h-[120px] h-[fit-content] px-4 py-3 text-base border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );
}
