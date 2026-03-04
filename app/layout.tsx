import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { GuestUserSync } from "@/components/GuestUserSync";
import { AppHeader } from "@/components/AppHeader";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Карточки для изучения слов",
  description: "PWA для изучения иностранных слов с карточками",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// ВРЕМЕННО: Clerk отключён. GuestUserSync даёт гостевой userId для колод/истории.
// Чтобы вернуть Clerk: добавь ClerkProvider, замени GuestUserSync на ClerkUserSync
// (ClerkUserSync при логине перезапишет CURRENT_USER реальным userId).
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`h-full ${manrope.variable}`}>
      <body className="min-h-screen h-full bg-[var(--color-background)] text-[var(--color-text)] antialiased font-sans">
        <GuestUserSync>
          <AppHeader />
          <main className="min-h-screen">{children}</main>
        </GuestUserSync>
      </body>
    </html>
  );
}
