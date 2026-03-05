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
      <h1 className="text-2xl font-semibold text-text leading-normal md:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm font-medium text-text-secondary leading-normal md:text-base">
          {subtitle}
        </p>
      )}
    </header>
  );
}
