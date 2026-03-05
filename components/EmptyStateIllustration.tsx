/**
 * Иллюстрация для empty state (пустая папка с документами).
 * Inline SVG, 72×72px.
 */
export function EmptyStateIllustration({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 72 72"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M14 26h44v32H14V26z" />
      <path d="M20 26V20a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v6" />
      <path d="M24 38h24M24 46h16" strokeWidth="1.5" opacity={0.6} />
    </svg>
  );
}
