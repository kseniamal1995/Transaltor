import type { ReactNode, MouseEvent } from "react";

const VARIANT_STYLES = {
  default: "p-[6px] text-text-secondary hover:bg-tertiary",
  primary: "p-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white",
  secondary: "p-[6px] bg-surface border border-border text-text-secondary hover:border-border-hover hover:text-text",
} as const;

type IconButtonVariant = keyof typeof VARIANT_STYLES;

interface IconButtonProps {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  ariaLabel: string;
  variant?: IconButtonVariant;
  title?: string;
  disabled?: boolean;
  className?: string;
}

export function IconButton({ onClick, children, ariaLabel, variant = "default", title, disabled, className = "" }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      className={`rounded-xl disabled:opacity-50 transition-colors ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
