"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
  icon?: ReactNode;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  trigger: ReactNode;
  align?: "left" | "right";
}

export function DropdownMenu({ items, trigger, align = "right" }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>

      {open && (
        <ul
          role="menu"
          className={`absolute top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-lg py-1 min-w-[250px] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item) => (
            <li key={item.label} role="menuitem">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                  item.variant === "destructive"
                    ? "text-[var(--color-error)] hover:bg-red-50"
                    : "text-text hover:bg-surface-secondary"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
