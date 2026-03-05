import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { GuestUserSync } from "@/components/GuestUserSync";
import { ClerkUserSync } from "@/components/ClerkUserSync";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`h-full ${manrope.variable}`}>
      <body className="min-h-screen h-full bg-[var(--color-background)] text-[var(--color-text)] antialiased font-sans">
        <ClerkProvider>
          <ClerkUserSync>
            <GuestUserSync>
              <AppHeader />
              <main className="min-h-screen">{children}</main>
            </GuestUserSync>
          </ClerkUserSync>
        </ClerkProvider>
      </body>
    </html>
  );
}
