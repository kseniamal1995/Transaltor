"use client";

import { t } from "@/lib/strings";
import { FORM_INPUT_CLASSES, FORM_LABEL_CLASSES } from "@/lib/ui-classes";

interface CustomTranslationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function CustomTranslationInput({
  value,
  onChange,
  placeholder = t("card_custom_placeholder"),
  label = t("card_custom_label"),
}: CustomTranslationInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="custom-translation" className={FORM_LABEL_CLASSES}>
        {label}
      </label>
      <input
        id="custom-translation"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={FORM_INPUT_CLASSES}
      />
    </div>
  );
}
