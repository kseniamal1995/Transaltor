export function EmptyStateIllustration({ className }: { className?: string }) {
  return (
    <img
      src="/empty-state.svg"
      alt=""
      aria-hidden="true"
      className={className}
      draggable={false}
    />
  );
}
