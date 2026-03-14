"use client";

import { useState } from "react";
import { t } from "@/lib/strings";
import { IconButton } from "./IconButton";

const LANG_MAP: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-BR",
  ru: "ru-RU",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
};

interface SpeakButtonProps {
  text: string;
  lang?: string;
  iconOnly?: boolean;
}

export function SpeakButton({ text, lang = "en", iconOnly = false }: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  function handleSpeak() {
    if (!text.trim() || typeof window === "undefined") return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[lang] ?? lang;
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  if (iconOnly) {
    return (
      <IconButton
        onClick={handleSpeak}
        disabled={isSpeaking}
        ariaLabel={t("study_speak_aria")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-5 h-5 ${isSpeaking ? "text-primary" : ""}`}
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      </IconButton>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSpeak}
      disabled={isSpeaking}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary bg-surface border border-border rounded-xl hover:bg-surface-secondary disabled:opacity-50 transition-colors"
      aria-label={t("study_speak_aria")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-5 h-5 ${isSpeaking ? "text-primary" : ""}`}
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
      {t("study_speak_aria")}
    </button>
  );
}
