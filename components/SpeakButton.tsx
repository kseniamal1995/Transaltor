"use client";

import { useState } from "react";

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
}

export function SpeakButton({ text, lang = "en" }: SpeakButtonProps) {
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

  return (
    <button
      type="button"
      onClick={handleSpeak}
      disabled={isSpeaking}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
      aria-label="Произнести"
    >
      <span className="text-lg">{isSpeaking ? "🔊" : "🔈"}</span>
      Произнести
    </button>
  );
}
