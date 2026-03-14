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
import {
  canTranslate,
  incrementGuestUsage,
  getRemainingTranslations,
} from "@/lib/usageLimit";
import { TranslateInput } from "./TranslateInput";
import { TranslateResult } from "./TranslateResult";
import { SaveCardForm } from "./SaveCardForm";
import { LanguagePairBlock } from "./LanguagePairBlock";
import { PageHeader } from "./PageHeader";
import { TranslationLimitBanner } from "./TranslationLimitBanner";
import { t } from "@/lib/strings";
import { PAGE_LAYOUT_CLASSES } from "@/lib/ui-classes";

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
  const isLoggedIn = false;

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
  const [remaining, setRemaining] = useState<number>(() => getRemainingTranslations(isLoggedIn));

  // Обновлять остаток при изменении статуса авторизации
  useEffect(() => {
    setRemaining(getRemainingTranslations(isLoggedIn));
  }, [isLoggedIn]);

  // Загрузка словарей. Повторяем с задержкой: GuestUserSync/ClerkUserSync могут ещё не успеть установить user.
  useEffect(() => {
    function loadDecks() {
      const user = getCurrentUser();
      if (user.id) {
        const userDecks = getDecksForUser(user.id);
        setDecks(userDecks);
        setSelectedDeckId((prev) => {
          const valid = userDecks.some((d) => d.id === prev);
          return valid ? prev : userDecks[0]?.id ?? "";
        });
      }
    }
    loadDecks();
    const t1 = setTimeout(loadDecks, 150);
    const t2 = setTimeout(loadDecks, 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
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

      if (!canTranslate(isLoggedIn)) {
        setError(t("limit_reached_error").replace("{n}", String(20)));
        setRemaining(0);
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
        setCustomTranslation("");
        if (sourceLang === "auto") {
          setSourceLang(langToSave);
        }

        if (!isLoggedIn) {
          incrementGuestUsage();
          setRemaining(getRemainingTranslations(false));
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
      setCustomTranslation("");
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

  async function runTranslateOnLangChange(
    translateFn: () => Promise<{ translatedText: string }>
  ) {
    if (!sourceText || !inputValue.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await translateFn();
      setTranslatedText(result.translatedText);
      setCustomTranslation("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("translate_error"));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSourceChange(newSource: string) {
    setSourceLang(newSource);
    await runTranslateOnLangChange(async () => {
      const from = newSource === "auto" ? await detectLanguage(sourceText!) : newSource;
      const result = await doTranslate(sourceText!, from, targetLang);
      const lang = newSource === "auto"
        ? sanitizeDetectedForShortText(sourceText!, result.sourceLanguage)
        : newSource;
      setDetectedLang(lang === "auto" ? "en" : lang);
      return result;
    });
  }

  async function handleTargetChange(newTarget: string) {
    setTargetLang(newTarget);
    setStoredLastTargetLang(newTarget);
    await runTranslateOnLangChange(async () => {
      const from = sourceLang === "auto" ? await detectLanguage(sourceText!) : sourceLang;
      return doTranslate(sourceText!, from, newTarget);
    });
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
    <div className={`${PAGE_LAYOUT_CLASSES} gap-4 md:gap-10`}>
      <PageHeader
        title={t("translate_hero")}
        subtitle={t("translate_subtitle")}
      />

      <div className="flex flex-col gap-4">
        <div className="border border-border rounded-2xl px-3 pb-3" data-lang-card>
          <LanguagePairBlock
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={handleSourceChange}
            onTargetChange={handleTargetChange}
            onSwap={handleSwap}
          />
          <div className="flex flex-col gap-3">
            <div className="bg-surface border border-border rounded-xl min-h-[132px]">
              <TranslateInput
                value={inputValue}
                onChange={setInputValue}
                onTranslate={() => {
                  const trimmed = inputValue.trim();
                  if (trimmed.length >= MIN_CHARS_TO_TRANSLATE) runTranslate(trimmed);
                }}
                disabled={isLoading}
                placeholder={t("translate_placeholder")}
                lang={sourceLang}
              />
            </div>

            <TranslateResult
              isLoading={isLoading}
              error={error}
              translatedText={translatedText}
              customTranslation={customTranslation}
              onCustomTranslationChange={setCustomTranslation}
              onRetry={() => {
                const trimmed = inputValue.trim();
                if (trimmed.length >= MIN_CHARS_TO_TRANSLATE) runTranslate(trimmed);
              }}
              lang={targetLang}
            />
          </div>
        </div>

        {!isLoggedIn && <TranslationLimitBanner remaining={remaining} />}

        {translatedText && sourceText && decks.length > 0 && (
          <>
            {savedMessage && (
              <p className="text-sm text-[var(--color-success)] font-medium">{savedMessage}</p>
            )}
            <SaveCardForm
              key={`${sourceText}-${translatedText}`}
              decks={decks}
              selectedDeckId={selectedDeckId}
              onDeckChange={setSelectedDeckId}
              onCreateDeck={(name) => createDeck(getCurrentUser().id, name)}
              onDeckCreated={(deck) => setDecks((prev) => [...prev, deck])}
              onSave={handleSaveCard}
              isSaving={isSaving}
            />
          </>
        )}
      </div>
    </div>
  );
}
