"use client";

import { useUser } from "@clerk/nextjs";
import { STORAGE_KEYS } from "@/lib/constants";

/** Синхронизирует Clerk userId в localStorage для совместимости с существующим storage */
export function ClerkUserSync({ children }: { children: React.ReactNode }) {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user && typeof window !== "undefined") {
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_USER,
      JSON.stringify({ id: user.id })
    );
  }

  return <>{children}</>;
}
