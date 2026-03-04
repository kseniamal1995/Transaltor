"use client";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Единый стиль заголовка и подзаголовка по макету Figma:
 * - gap 12px между заголовком и подзаголовком
 * - заголовок: 32px, text
 * - подзаголовок: 16px, font-medium, text-secondary
 */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 text-center w-full">
      <h1 className="text-3xl font-semibold text-text leading-normal">
        {title}
      </h1>
      {subtitle && (
        <p className="text-base font-medium text-text-secondary leading-normal">
          {subtitle}
        </p>
      )}
    </header>
  );
}
