"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { messages, type Locale } from "./messages";

const STORAGE_KEY = "reac-tools-locale";

function detectBrowserLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const navigatorLang = window.navigator.language || "";
  const lang = navigatorLang.toLowerCase().slice(0, 2);
  const candidates: string[] = [];
  if (lang) {
    candidates.push(lang);
    if (lang === "zh") candidates.push("zh");
    if (lang === "en") candidates.push("en");
  }
  candidates.push("zh");

  for (const code of candidates) {
    if (code in messages) return code as Locale;
  }
  return "zh";
}

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in messages) return stored as Locale;
  return detectBrowserLocale();
}

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  availableLocales: Locale[];
  t: (key: string) => string;
} | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    queueMicrotask(() => setLocaleState(getStoredLocale()));
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    const dict = messages[locale] as Record<string, string>;
    const enDict = messages.en as Record<string, string>;
    return dict[key] ?? enDict[key] ?? key;
  };

  const availableLocales = Object.keys(messages) as Locale[];

  return (
    <I18nContext.Provider value={{ locale, setLocale, availableLocales, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
