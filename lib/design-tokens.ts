/**
 * Design Tokens — JS/TS экспорт
 * Синхронизировано с lib/design-tokens.css
 */

export const tokens = {
  colors: {
    primary: "var(--color-primary)",
    primaryHover: "var(--color-primary-hover)",
    primaryMuted: "var(--color-primary-muted)",
    background: "var(--color-background)",
    surface: "var(--color-surface)",
    border: "var(--color-border)",
    text: "var(--color-text)",
    textSecondary: "var(--color-text-secondary)",
    textMuted: "var(--color-text-muted)",
    success: "var(--color-success)",
    error: "var(--color-error)",
    warning: "var(--color-warning)",
  },
  space: {
    1: "var(--space-1)",
    2: "var(--space-2)",
    3: "var(--space-3)",
    4: "var(--space-4)",
    5: "var(--space-5)",
    6: "var(--space-6)",
    8: "var(--space-8)",
    10: "var(--space-10)",
    12: "var(--space-12)",
    16: "var(--space-16)",
    20: "var(--space-20)",
  },
  typography: {
    fontSans: "var(--font-sans)",
    fontMono: "var(--font-mono)",
    xs: "var(--text-xs)",
    sm: "var(--text-sm)",
    base: "var(--text-base)",
    lg: "var(--text-lg)",
    xl: "var(--text-xl)",
    "2xl": "var(--text-2xl)",
    "3xl": "var(--text-3xl)",
    normal: "var(--font-normal)",
    medium: "var(--font-medium)",
    semibold: "var(--font-semibold)",
    bold: "var(--font-bold)",
    leadingTight: "var(--leading-tight)",
    leadingNormal: "var(--leading-normal)",
    leadingRelaxed: "var(--leading-relaxed)",
  },
  radius: {
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
    full: "var(--radius-full)",
  },
  shadow: {
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
  },
} as const;
