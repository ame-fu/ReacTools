"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { generateId } from "./uuid";

const STORAGE_KEY = "reac-tools-sprites";

export interface SpriteItem {
  id: string;
  color: string;
  width: number;
  height: number;
}

export interface SpritePosition {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

export interface SpriteConfig {
  visible: boolean;
  sprites: SpriteItem[];
  /** 精灵组整体位置，百分比 0-100，渲染时取较小边 */
  spritePosition?: SpritePosition;
  /** 是否开启随机一言（在随机精灵头顶弹出） */
  hitokotoEnabled?: boolean;
}

const DEFAULT_CONFIG: SpriteConfig = {
  visible: false,
  sprites: [],
  spritePosition: { top: 50, left: 50 },
};

function loadConfig(): SpriteConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as SpriteConfig;
    if (!parsed.sprites || !Array.isArray(parsed.sprites)) return DEFAULT_CONFIG;
    const pos = parsed.spritePosition;
    return {
      visible: Boolean(parsed.visible),
      hitokotoEnabled: parsed.hitokotoEnabled !== false,
      sprites: parsed.sprites.slice(0, 9).map((s) => ({
        id: s.id ?? generateId(),
        color: s.color ?? "#7dd3fc",
        width: Number(s.width) || 80,
        height: Number(s.height) || 80,
      })),
      spritePosition: (() => {
        if (!pos || typeof pos !== "object") return { top: 50, left: 50 };
        const t = "top" in pos && typeof pos.top === "number" ? pos.top : "bottom" in pos && typeof pos.bottom === "number" ? 100 - pos.bottom : 50;
        const l = "left" in pos && typeof pos.left === "number" ? pos.left : "right" in pos && typeof pos.right === "number" ? 100 - pos.right : 50;
        const top = Math.max(0, Math.min(100, t));
        const left = Math.max(0, Math.min(100, l));
        return {
          ...(top <= 50 ? { top } : { bottom: 100 - top }),
          ...(left <= 50 ? { left } : { right: 100 - left }),
        };
      })(),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function saveConfig(config: SpriteConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

const SpriteContext = createContext<{
  config: SpriteConfig;
  setVisible: (v: boolean) => void;
  setSprites: (sprites: SpriteItem[]) => void;
  updateSpritePosition: (pos: SpritePosition) => void;
  addSprite: () => void;
  updateSprite: (id: string, patch: Partial<SpriteItem>) => void;
  removeSprite: (id: string) => void;
  saveConfig: (next: SpriteConfig) => void;
} | null>(null);

const COLORS = ["#7dd3fc", "#a78bfa", "#f472b6", "#86efac", "#fde047", "#fdba74"];

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function SpriteProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SpriteConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    queueMicrotask(() => setConfig(loadConfig()));
  }, []);

  const persist = useCallback((next: SpriteConfig) => {
    setConfig(next);
    saveConfig(next);
  }, []);

  const setVisible = useCallback(
    (v: boolean) => persist({ ...config, visible: v }),
    [config, persist],
  );

  const setSprites = useCallback(
    (sprites: SpriteItem[]) => persist({ ...config, sprites: sprites.slice(0, 9) }),
    [config, persist],
  );

  const updateSpritePosition = useCallback(
    (pos: SpritePosition) =>
      persist({
        ...config,
        spritePosition: pos,
      }),
    [config, persist],
  );

  const addSprite = useCallback(() => {
    if (config.sprites.length >= 9) return;
    const newOne: SpriteItem = {
      id: generateId(),
      color: randomColor(),
      width: 60 + Math.floor(Math.random() * 40),
      height: 60 + Math.floor(Math.random() * 40),
    };
    persist({ ...config, sprites: [...config.sprites, newOne] });
  }, [config, persist]);

  const updateSprite = useCallback(
    (id: string, patch: Partial<SpriteItem>) => {
      const sprites = config.sprites.map((s) =>
        s.id === id ? { ...s, ...patch } : s,
      );
      persist({ ...config, sprites });
    },
    [config, persist],
  );

  const removeSprite = useCallback(
    (id: string) => {
      persist({
        ...config,
        sprites: config.sprites.filter((s) => s.id !== id),
      });
    },
    [config, persist],
  );

  const saveConfigFromModal = useCallback(
    (next: SpriteConfig) => {
      persist(next);
    },
    [persist],
  );

  return (
    <SpriteContext.Provider
      value={{
        config,
        setVisible,
        setSprites,
        updateSpritePosition,
        addSprite,
        updateSprite,
        removeSprite,
        saveConfig: saveConfigFromModal,
      }}
    >
      {children}
    </SpriteContext.Provider>
  );
}

export function useSprite() {
  const ctx = useContext(SpriteContext);
  if (!ctx) throw new Error("useSprite must be used within SpriteProvider");
  return ctx;
}
