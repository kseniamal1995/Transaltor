"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { XIcon } from "./icons/XIcon";
import { CheckIcon } from "./icons/CheckIcon";

type ToastVariant = "success" | "error";

interface ToastState {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-sm:left-4 max-sm:right-4 max-sm:bottom-20">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-xl shadow-lg animate-slide-in-right"
            >
              <span className={`shrink-0 ${toast.variant === "error" ? "text-[var(--color-error)]" : "text-[var(--color-primary)]"}`}>
                {toast.variant === "error" ? <XIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
              </span>
              <p className="text-sm font-medium text-text flex-1 min-w-0">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 p-1 text-text-secondary hover:text-text transition-colors rounded-lg"
                aria-label="Close"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
