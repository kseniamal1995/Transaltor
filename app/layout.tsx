import type { Metadata } from "next";
import { Manrope, Zen_Antique } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ruRU } from "@clerk/localizations";
import "./globals.css";
import { ClerkUserSync } from "@/components/ClerkUserSync";
import { AppHeader } from "@/components/AppHeader";
import { ToastProvider } from "@/components/Toast";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope" });
const zenAntique = Zen_Antique({ subsets: ["latin"], weight: "400", variable: "--font-zen-antique" });

export const metadata: Metadata = {
  title: "Карточки для изучения слов",
  description: "PWA для изучения иностранных слов с карточками",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ruRU}>
      <html lang="ru" className={`h-full ${manrope.variable} ${zenAntique.variable}`}>
        <body className="min-h-screen h-full bg-[var(--color-background)] text-[var(--color-text)] antialiased font-sans">
          <ClerkUserSync>
            <ToastProvider>
              <AppHeader />
              <main className="min-h-screen pb-12">{children}</main>
            </ToastProvider>
          </ClerkUserSync>
        </body>
      </html>
    </ClerkProvider>
  );
}
