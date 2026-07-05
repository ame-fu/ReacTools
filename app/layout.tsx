import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./antd-reset-layer.css";
import "./globals.css";
import AppLayout from "../components/AppLayout";
import ThemeScript from "../components/ThemeScript";
import { ThemeProvider } from "../lib/theme-context";
import { I18nProvider } from "../lib/i18n/context";
import { FavoritesProvider } from "../lib/favorites-context";
import { SpriteProvider } from "../lib/sprite-context";
import { ToolTabsProvider } from "../lib/tool-tabs-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReacTools",
  description: "ReacTools - Handy online tools for developers (React/Next.js port)",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeScript />
        <ThemeProvider>
          <I18nProvider>
            <FavoritesProvider>
              <SpriteProvider>
                <ToolTabsProvider>
                  <AppLayout>{children}</AppLayout>
                </ToolTabsProvider>
              </SpriteProvider>
            </FavoritesProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
