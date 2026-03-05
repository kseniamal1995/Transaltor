"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { SUPPORTED_LANGUAGES, getFlagUrl, getLanguageName, getLangSelectMaxWidth } from "@/lib/languages";
import { t, getLocale } from "@/lib/strings";

interface LanguagePairBlockProps {
  sourceLang: string;
  targetLang: string;
  onSourceChange: (code: string) => void;
  onTargetChange: (code: string) => void;
  onSwap: () => void;
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

const DROPDOWN_EXCLUDED = new Set(["auto", "st"]);

const ruCollator = new Intl.Collator("ru");

function FlagIcon({ code, ariaHidden = true }: { code: string; ariaHidden?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const url = getFlagUrl(code);
  const placeholder = (
    <span className="inline-flex shrink-0 w-5 h-5 rounded-full bg-[var(--color-border)]" aria-hidden={ariaHidden} />
  );

  if (!mounted) return placeholder;
  if (!url) {
    return (
      <span className="inline-flex items-center justify-center shrink-0 w-5 h-5 text-[20px] leading-none" aria-hidden={ariaHidden}>
        🌐
      </span>
    );
  }
  return (
    <img
      src={url}
      alt=""
      className="shrink-0 w-5 h-5 rounded-full"
      width={20}
      height={20}
      aria-hidden={ariaHidden}
    />
  );
}

function LangSelect({
  value,
  onChange,
  options,
  ariaLabel,
  dropdownId = "lang-dropdown",
  maxWidth,
}: {
  value: string;
  onChange: (code: string) => void;
  options: { code: string; name: string }[];
  ariaLabel: string;
  dropdownId?: string;
  maxWidth: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownRect, setDropdownRect] = useState<{ rect: DOMRect; openUp: boolean; containerWidth: number; containerLeft: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const filteredOptions = options
    .filter((o) => !DROPDOWN_EXCLUDED.has(o.code) && o.name.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => ruCollator.compare(a.name, b.name));

  const [cols, setCols] = useState(3);
  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth >= 768) setCols(3);
      else if (window.innerWidth >= 640) setCols(2);
      else setCols(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const rows = filteredOptions.length > 0 ? Math.ceil(filteredOptions.length / cols) : 0;

  const displayValue = DROPDOWN_EXCLUDED.has(value) ? "en" : value;
  const selectedOption = options.find((o) => o.code === displayValue) ?? options.find((o) => !DROPDOWN_EXCLUDED.has(o.code)) ?? options[0];

  const updateDropdownPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || !open) return;
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < 360 && spaceAbove > spaceBelow;
    const card = trigger.closest<HTMLElement>("[data-lang-card]");
    const containerWidth = card?.offsetWidth ?? Math.min(600, window.innerWidth - 48);
    const containerLeft = card ? card.getBoundingClientRect().left : Math.max(12, rect.left + rect.width / 2 - containerWidth / 2);
    setDropdownRect({ rect, openUp, containerWidth, containerLeft });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    if (trigger) {
      updateDropdownPosition();
      setSearch("");
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [open, updateDropdownPosition]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", updateDropdownPosition, true);
    window.addEventListener("resize", updateDropdownPosition);
    return () => {
      window.removeEventListener("scroll", updateDropdownPosition, true);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [open, updateDropdownPosition]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      const dropdown = document.getElementById(dropdownId);
      if (dropdown?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, dropdownId]);

  useEffect(() => {
    if (open) {
      const idx = filteredOptions.findIndex((o) => o.code === displayValue);
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  }, [open, displayValue, filteredOptions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        setOpen(false);
        break;
      case "ArrowDown": {
        e.preventDefault();
        setFocusedIndex((i) => (i < filteredOptions.length - 1 ? i + 1 : 0));
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        setFocusedIndex((i) => (i > 0 ? i - 1 : filteredOptions.length - 1));
        break;
      }
      case "Enter": {
        e.preventDefault();
        const idx = focusedIndex >= 0 ? focusedIndex : 0;
        const option = filteredOptions[idx];
        if (option) {
          onChange(option.code);
          setOpen(false);
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <div
      className="flex items-center gap-2 w-fit min-w-0 justify-center"
      style={{ maxWidth }}
    >
      <span className="hidden min-[601px]:inline shrink-0">
        <FlagIcon code={displayValue} />
      </span>
      <div
        className="inline-flex shrink-0 min-w-0"
        style={{ maxWidth }}
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          onKeyDown={handleKeyDown}
          className="flex items-center gap-1.5 py-1 bg-transparent text-sm font-semibold text-text cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded md:text-base"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-activedescendant={open && filteredOptions[Math.max(0, focusedIndex)] ? `lang-option-${filteredOptions[Math.max(0, focusedIndex)].code}` : undefined}
        >
          <span className="min-w-0 truncate text-left">{selectedOption.name}</span>
          <ChevronDownIcon className="w-4 h-4 shrink-0 text-text-muted" />
        </button>

        {open &&
          dropdownRect &&
          createPortal(
            <div
              id={dropdownId}
              role="listbox"
              aria-label={ariaLabel}
              className={`fixed z-[100] bg-surface border border-border overflow-hidden flex flex-col shadow-[0_6px_20px_rgb(0_0_0_/_0.08),0_8px_8px_rgb(0_0_0_/_0.05)] ${dropdownRect.openUp ? "rounded-t-xl" : "rounded-b-xl"}`}
              style={{
                top: dropdownRect.openUp
                  ? "auto"
                  : dropdownRect.rect.bottom + 8,
                bottom: dropdownRect.openUp
                  ? window.innerHeight - dropdownRect.rect.top + 8
                  : "auto",
                left: dropdownRect.containerLeft,
                width: dropdownRect.containerWidth,
                maxHeight: "min(360px, calc(100vh - 80px))",
              }}
            >
              <div className="p-2 border-b border-border shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-border)]/30 rounded-lg">
                  <SearchIcon className="w-4 h-4 shrink-0 text-text-muted" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setOpen(false);
                      else if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
                        e.preventDefault();
                        handleKeyDown(e as unknown as React.KeyboardEvent<HTMLButtonElement>);
                      }
                    }}
                    placeholder={t("lang_search_placeholder")}
                    className="flex-1 min-w-0 bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
                    aria-label={t("lang_search_placeholder")}
                  />
                </div>
              </div>
              <ul
                className="overflow-auto p-2 grid gap-0"
                style={{
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gridTemplateRows: rows > 0 ? `repeat(${rows}, auto)` : "auto",
                  gridAutoFlow: "column",
                }}
              >
                {filteredOptions.length === 0 ? (
                  <li className="col-span-full px-4 py-3 text-sm text-text-secondary">{t("lang_search_empty")}</li>
                ) : (
                  filteredOptions.map((option, i) => (
                    <li
                      key={option.code}
                      id={`lang-option-${option.code}`}
                      role="option"
                      aria-selected={option.code === displayValue}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors rounded-lg ${
                        option.code === displayValue
                          ? "bg-primary-muted text-text font-semibold"
                          : "text-text hover:bg-[var(--color-border)]/30"
                      } ${i === focusedIndex ? "bg-[var(--color-border)]/50" : ""}`}
                      onClick={() => {
                        onChange(option.code);
                        setOpen(false);
                      }}
                      onMouseEnter={() => setFocusedIndex(i)}
                    >
                      <FlagIcon code={option.code} />
                      <span className="min-w-0 truncate">{option.name}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}

export function LanguagePairBlock({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
}: LanguagePairBlockProps) {
  const locale = getLocale();
  const maxWidth = getLangSelectMaxWidth(locale);
  const sourceOptions = SUPPORTED_LANGUAGES.map((l) => ({
    code: l.code,
    name: l.code === "auto" ? t("lang_auto") : getLanguageName(l.code, locale),
  })).sort((a, b) => ruCollator.compare(a.name, b.name));
  const targetOptions = SUPPORTED_LANGUAGES.filter((l) => l.code !== "auto")
    .map((l) => ({ code: l.code, name: getLanguageName(l.code, locale) }))
    .sort((a, b) => ruCollator.compare(a.name, b.name));

  return (
    <div
      className="flex items-center gap-4 sm:gap-6 p-4 border-b border-border h-[54px]"
      aria-label="Выбор языков перевода"
    >
      <div className="flex-1 flex justify-end min-w-0">
      <LangSelect
        value={sourceLang}
        onChange={onSourceChange}
        options={sourceOptions}
        ariaLabel={t("lang_source_label")}
        dropdownId="lang-dropdown-source"
        maxWidth={maxWidth}
      />
      </div>

      <button
        type="button"
        onClick={onSwap}
        className="flex-shrink-0 p-1 text-primary hover:text-primary-hover transition-colors"
        aria-label={t("lang_swap_aria")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M16 3l4 4-4 4" />
          <path d="M20 7H4" />
          <path d="M8 21l-4-4 4-4" />
          <path d="M4 17h16" />
        </svg>
      </button>

      <div className="flex-1 flex justify-start min-w-0">
      <LangSelect
        value={targetLang}
        onChange={onTargetChange}
        options={targetOptions}
        ariaLabel={t("lang_target_label")}
        dropdownId="lang-dropdown-target"
        maxWidth={maxWidth}
      />
      </div>
    </div>
  );
}
