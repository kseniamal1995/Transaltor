"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/sign-in", "/sign-up"];

export function ClerkUserSync({ children }: { children: React.ReactNode }) {
  const { isLoaded, user } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!isLoaded) return;
    if (!user && !isPublic) {
      router.replace("/sign-in");
    }
  }, [isLoaded, user?.id, isPublic, router]);

  if (!isLoaded) return null;
  if (!user && !isPublic) return null;

  return <>{children}</>;
}
