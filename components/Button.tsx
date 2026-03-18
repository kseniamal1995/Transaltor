import type { ReactNode, MouseEvent } from "react";

const VARIANT_STYLES = {
  primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
  secondary: "bg-transparent border border-border hover:border-border-hover text-text-secondary hover:bg-surface-secondary",
  link: "bg-transparent text-text-secondary hover:text-text",
} as const;

const SIZE_STYLES = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-base",
  lg: "px-4 py-3 text-base",
} as const;

type ButtonVariant = keyof typeof VARIANT_STYLES;
type ButtonSize = keyof typeof SIZE_STYLES;

export function getButtonClassName(variant: ButtonVariant = "primary", size: ButtonSize = "md", className = "") {
  return `rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`.trim();
}

interface ButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  ariaLabel?: string;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  type = "button",
  className = "",
  ariaLabel,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={getButtonClassName(variant, size, className)}
    >
      {children}
    </button>
  );
}
