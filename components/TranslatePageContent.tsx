"use client";

import { useState, useEffect, useCallback } from "react";
import {
  addToHistory,
  createDeck,
  getCurrentUser,
  getDecksForUser,
  saveCard,
} from "@/lib/storage";
import {
  detectLanguage,
  sanitizeDetectedForShortText,
} from "@/lib/languages";
import { translate } from "@/lib/translate";
import { STORAGE_KEYS } from "@/lib/constants";
import { TranslateInput } from "./TranslateInput";
import { TranslateResult } from "./TranslateResult";
import { SaveCardForm } from "./SaveCardForm";
import { LanguagePairBlock } from "./LanguagePairBlock";
import { PageHeader } from "./PageHeader";
import { t } from "@/lib/strings";

const MIN_CHARS_TO_TRANSLATE = 2;

function getStoredLastTargetLang(): string {
  if (typeof window === "undefined") return "ru";
  const stored = localStorage.getItem(STORAGE_KEYS.LAST_TARGET_LANG);
  return stored && stored !== "auto" ? stored : "ru";
}

function setStoredLastTargetLang(lang: string) {
  if (typeof window === "undefined") return;
  if (lang !== "auto") {
    localStorage.setItem(STORAGE_KEYS.LAST_TARGET_LANG, lang);
  }
}

function getLangPair(sourceLang: string, targetLang: string): string {
  return `${sourceLang}|${targetLang}`;
}

export function TranslatePageContent() {
  const [inputValue, setInputValue] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState(() => getStoredLastTargetLang());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<string>("en");
  const [decks, setDecks] = useState<{ id: string; name: string; createdAt: string }[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [customTranslation, setCustomTranslation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user.id) {
      const userDecks = getDecksForUser(user.id);
      setDecks(userDecks);
      setSelectedDeckId((prev) => {
        const valid = userDecks.some((d) => d.id === prev);
        return valid ? prev : userDecks[0]?.id ?? "";
      });
    }
  }, []);

  const doTranslate = useCallback(async (text: string, from: string, to: string) => {
    const langPair = getLangPair(from, to);
    return translate(text, langPair);
  }, []);

  const runTranslate = useCallback(
    async (trimmed: string) => {
      if (!trimmed) {
        setTranslatedText(null);
        setSourceText(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSourceText(trimmed);

      try {
        const detected = sourceLang === "auto" ? await detectLanguage(trimmed) : sourceLang;
        const result = await doTranslate(trimmed, detected, targetLang);
        const lang = sanitizeDetectedForShortText(trimmed, result.sourceLanguage);
        const langToSave = lang === "auto" ? "en" : lang;

        setTranslatedText(result.translatedText);
        setDetectedLang(langToSave);
        if (sourceLang === "auto") {
          setSourceLang(langToSave);
        }

        const user = getCurrentUser();
        if (user.id) {
          addToHistory(user.id, {
            foreign: trimmed,
            translation: result.translatedText,
            foreignLanguage: langToSave,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("translate_error"));
        setTranslatedText(null);
      } finally {
        setIsLoading(false);
      }
    },
    [sourceLang, targetLang, doTranslate]
  );

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setTranslatedText(null);
      setSourceText(null);
      setError(null);
      return;
    }
    if (trimmed.length < MIN_CHARS_TO_TRANSLATE) return;

    const timer = setTimeout(() => {
      runTranslate(trimmed);
    }, 900);

    return () => clearTimeout(timer);
  }, [inputValue, runTranslate]);

  function handleSwap() {
    const newTarget = sourceLang === "auto" ? (detectedLang === "auto" ? "en" : detectedLang) : sourceLang;
    setSourceLang(targetLang);
    setTargetLang(newTarget);
    setStoredLastTargetLang(newTarget);
    if (sourceText && translatedText) {
      setInputValue(translatedText);
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  }

  async function handleSourceChange(newSource: string) {
    setSourceLang(newSource);
    if (sourceText && inputValue.trim()) {
      setIsLoading(true);
      setError(null);
      try {
        const from = newSource === "auto" ? await detectLanguage(sourceText) : newSource;
        const result = await doTranslate(sourceText, from, targetLang);
        const lang = newSource === "auto"
          ? sanitizeDetectedForShortText(sourceText, result.sourceLanguage)
          : newSource;
        setTranslatedText(result.translatedText);
        setDetectedLang(lang === "auto" ? "en" : lang);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("translate_error"));
      } finally {
        setIsLoading(false);
      }
    }
  }

  async function handleTargetChange(newTarget: string) {
    setTargetLang(newTarget);
    setStoredLastTargetLang(newTarget);
    if (sourceText && inputValue.trim()) {
      setIsLoading(true);
      setError(null);
      try {
        const from = sourceLang === "auto" ? await detectLanguage(sourceText) : sourceLang;
        const result = await doTranslate(sourceText, from, newTarget);
        setTranslatedText(result.translatedText);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("translate_error"));
      } finally {
        setIsLoading(false);
      }
    }
  }

  function handleSaveCard() {
    if (!sourceText || !translatedText) return;

    const user = getCurrentUser();
    if (!user.id) return;

    setIsSaving(true);
    setSavedMessage(null);

    try {
      saveCard(user.id, {
        foreign: sourceText,
        translation: translatedText,
        customTranslation: customTranslation.trim() || undefined,
        foreignLanguage: detectedLang,
        deckIds: [selectedDeckId],
      });
      setSavedMessage(t("card_saved"));
      setCustomTranslation("");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="px-8 py-6 max-w-[600px] mx-auto flex flex-col gap-12">
      <PageHeader
        title={t("translate_hero")}
        subtitle={t("translate_subtitle")}
      />

      <div className="flex flex-col gap-10">
        <div className="bg-surface border border-border rounded-xl overflow-hidden" data-lang-card>
          <LanguagePairBlock
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={handleSourceChange}
            onTargetChange={handleTargetChange}
            onSwap={handleSwap}
          />
          <TranslateInput
            value={inputValue}
            onChange={setInputValue}
            onTranslate={() => {
              const trimmed = inputValue.trim();
              if (trimmed.length >= MIN_CHARS_TO_TRANSLATE) runTranslate(trimmed);
            }}
            disabled={isLoading}
            placeholder={t("translate_placeholder")}
          />
        </div>

        <TranslateResult
          isLoading={isLoading}
          error={error}
          translatedText={translatedText}
          sourceText={sourceText ?? undefined}
        />

        {translatedText && sourceText && decks.length > 0 && (
          <>
            {savedMessage && (
              <p className="text-sm text-green-600 font-medium">{savedMessage}</p>
            )}
            <SaveCardForm
              foreign={sourceText}
              defaultTranslation={translatedText}
              decks={decks}
              selectedDeckId={selectedDeckId}
              onDeckChange={setSelectedDeckId}
              onCreateDeck={(name) => createDeck(getCurrentUser().id, name)}
              onDeckCreated={(deck) => setDecks((prev) => [...prev, deck])}
              customTranslation={customTranslation}
              onCustomTranslationChange={setCustomTranslation}
              onSave={handleSaveCard}
              isSaving={isSaving}
            />
          </>
        )}
      </div>
    </div>
  );
}
