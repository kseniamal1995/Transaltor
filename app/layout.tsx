import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { ClerkUserSync } from "@/components/ClerkUserSync";

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
    <ClerkProvider>
      <html lang="ru" className="h-full">
        <body className="min-h-screen h-full bg-gray-50 text-gray-900 antialiased">
          <ClerkUserSync>
            <main className="min-h-screen pb-20">{children}</main>
            <BottomNav />
          </ClerkUserSync>
        </body>
      </html>
    </ClerkProvider>
  );
}
