export function ArrowRightIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.52856 2.86192C7.7889 2.60157 8.21101 2.60157 8.47136 2.86192L13.138 7.52859C13.3984 7.78893 13.3984 8.21105 13.138 8.47139L8.47136 13.1381C8.21101 13.3984 7.7889 13.3984 7.52856 13.1381C7.26821 12.8777 7.26821 12.4556 7.52856 12.1953L11.0572 8.66666H3.33329C2.9651 8.66666 2.66663 8.36818 2.66663 7.99999C2.66663 7.6318 2.9651 7.33332 3.33329 7.33332H11.0572L7.52856 3.80473C7.26821 3.54438 7.26821 3.12227 7.52856 2.86192Z"
        fill="currentColor"
      />
    </svg>
  );
}
