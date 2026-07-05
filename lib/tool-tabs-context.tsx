"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "reac-tools-open-tabs";
const MAX_TABS = 20;

function loadStoredTabs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) && parsed.every((x) => typeof x === "string") ? parsed : [];
  } catch {
    return [];
  }
}

function saveTabs(tabs: string[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  } catch {
    // ignore
  }
}

interface ToolTabsContextValue {
  openTabs: string[];
  addTab: (path: string) => void;
  removeTab: (path: string) => void;
}

const ToolTabsContext = createContext<ToolTabsContextValue | null>(null);

export function ToolTabsProvider({ children }: { children: React.ReactNode }) {
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const skipNextSaveRef = useRef(true);

  useEffect(() => {
    setOpenTabs(loadStoredTabs());
  }, []);

  useEffect(() => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    saveTabs(openTabs);
  }, [openTabs]);

  const addTab = useCallback((path: string) => {
    setOpenTabs((prev) => {
      const next = prev.includes(path) ? prev : [path, ...prev].slice(0, MAX_TABS);
      return next;
    });
  }, []);

  const removeTab = useCallback((path: string) => {
    setOpenTabs((prev) => prev.filter((p) => p !== path));
  }, []);

  const value = useMemo(
    () => ({ openTabs, addTab, removeTab }),
    [openTabs, addTab, removeTab],
  );

  return (
    <ToolTabsContext.Provider value={value}>
      {children}
    </ToolTabsContext.Provider>
  );
}

export function useToolTabs(): ToolTabsContextValue {
  const ctx = useContext(ToolTabsContext);
  if (!ctx) throw new Error("useToolTabs must be used within ToolTabsProvider");
  return ctx;
}
