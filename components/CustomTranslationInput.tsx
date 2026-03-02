"use client";

interface CustomTranslationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function CustomTranslationInput({
  value,
  onChange,
  placeholder = "Свой перевод (необязательно)",
  label = "Свой перевод",
}: CustomTranslationInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="custom-translation" className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id="custom-translation"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
