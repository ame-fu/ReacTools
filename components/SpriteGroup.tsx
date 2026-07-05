"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { SpriteConfig, SpritePosition } from "@/lib/sprite-context";
import { getSpriteGridPosition } from "@/lib/sprite-layout";
import { PageSprite } from "./PageSprite";

const WRAPPER_SIZE = 150;
const BOUNCE_INTERVAL_MS = 120;
const BOUNCE_DURATION_MS = 700;
const HITOKOTO_API = "https://v1.hitokoto.cn/?encode=json";
const HITOKOTO_MIN_INTERVAL_MS = 8000;
const HITOKOTO_MAX_INTERVAL_MS = 25000;
const HITOKOTO_TYPING_INTERVAL_MS = 70;
const HITOKOTO_LAST_CHAR_HOLD_MS = 600;
const HITOKOTO_IDLE_BEFORE_FADE_MS = 5000;
const HITOKOTO_FADE_DURATION_MS = 400;
/** 将存储的位置格式转为 (top, left) 中心坐标，用于拖拽计算 */
function toCenterPosition(pos: SpritePosition | undefined): { top: number; left: number } {
  if (!pos) return { top: 50, left: 50 };
  const p = pos as Record<string, number>;
  const top = p.bottom != null ? 100 - p.bottom : (p.top ?? 50);
  const left = p.right != null ? 100 - p.right : (p.left ?? 50);
  return { top: Math.max(0, Math.min(100, top)), left: Math.max(0, Math.min(100, left)) };
}

/** 将中心坐标转为较小值存储格式 */
function toStoredPosition(top: number, left: number): SpritePosition {
  return {
    ...(top <= 50 ? { top } : { bottom: 100 - top }),
    ...(left <= 50 ? { left } : { right: 100 - left }),
  };
}

interface SpriteGroupProps {
  config: SpriteConfig;
  onPositionChange: (pos: SpritePosition) => void;
}

export function SpriteGroup({ config, onPositionChange }: SpriteGroupProps) {
  const [drag, setDrag] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [bounceAnims, setBounceAnims] = useState<{ id: number; start: number }[]>([]);
  const [hitokotoSpriteIndex, setHitokotoSpriteIndex] = useState<number | null>(null);
  const [hitokotoFullText, setHitokotoFullText] = useState<string>("");
  const [hitokotoDisplayedLength, setHitokotoDisplayedLength] = useState(0);
  const [hitokotoLastCharHighlight, setHitokotoLastCharHighlight] = useState(true);
  const [hitokotoFade, setHitokotoFade] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const animIdRef = useRef(0);

  const { top, left } = toCenterPosition(config.spritePosition);

  const [, setTick] = useState(0);
  const [animNow, setAnimNow] = useState(() => Date.now());

  const hitokotoTimeoutRef = useRef<number | null>(null);
  const hitokotoTimersRef = useRef<{ clear: () => void }>({ clear: () => {} });

  useEffect(() => {
    if (!config.visible || !config.hitokotoEnabled || config.sprites.length === 0) return;

    const clearTimers = () => {
      hitokotoTimersRef.current.clear();
    };

    const scheduleNext = () => {
      const delay =
        HITOKOTO_MIN_INTERVAL_MS +
        Math.random() * (HITOKOTO_MAX_INTERVAL_MS - HITOKOTO_MIN_INTERVAL_MS);
      hitokotoTimeoutRef.current = window.setTimeout(() => {
        clearTimers();
        const index = Math.floor(Math.random() * config.sprites.length);
        setHitokotoSpriteIndex(index);
        setHitokotoFullText("");
        setHitokotoDisplayedLength(0);
        setHitokotoLastCharHighlight(true);
        setHitokotoFade(false);

        fetch(HITOKOTO_API)
          .then((r) => r.json())
          .then((data: { hitokoto?: string }) => {
            const text = (data.hitokoto ?? "").trim();
            setHitokotoFullText(text);
            if (text.length === 0) {
              setHitokotoFade(true);
              const t = window.setTimeout(() => {
                setHitokotoSpriteIndex(null);
                setHitokotoFullText("");
                setHitokotoDisplayedLength(0);
                setHitokotoFade(false);
                scheduleNext();
              }, HITOKOTO_FADE_DURATION_MS);
              hitokotoTimersRef.current.clear = () => clearTimeout(t);
              return;
            }
            let len = 0;
            const intervalId = window.setInterval(() => {
              len += 1;
              setHitokotoDisplayedLength(len);
              if (len >= text.length) {
                window.clearInterval(intervalId);
                const holdT = window.setTimeout(() => setHitokotoLastCharHighlight(false), HITOKOTO_LAST_CHAR_HOLD_MS);
                const fadeT = window.setTimeout(() => setHitokotoFade(true), HITOKOTO_IDLE_BEFORE_FADE_MS);
                const closeT = window.setTimeout(() => {
                  setHitokotoSpriteIndex(null);
                  setHitokotoFullText("");
                  setHitokotoDisplayedLength(0);
                  setHitokotoLastCharHighlight(true);
                  setHitokotoFade(false);
                  scheduleNext();
                }, HITOKOTO_IDLE_BEFORE_FADE_MS + HITOKOTO_FADE_DURATION_MS);
                hitokotoTimersRef.current.clear = () => {
                  clearTimeout(holdT);
                  clearTimeout(fadeT);
                  clearTimeout(closeT);
                };
              }
            }, HITOKOTO_TYPING_INTERVAL_MS);
            hitokotoTimersRef.current.clear = () => {
              window.clearInterval(intervalId);
            };
          })
          .catch(() => {
            setHitokotoFade(true);
            const t = window.setTimeout(() => {
              setHitokotoSpriteIndex(null);
              setHitokotoFullText("");
              setHitokotoDisplayedLength(0);
              setHitokotoFade(false);
              scheduleNext();
            }, HITOKOTO_FADE_DURATION_MS);
            hitokotoTimersRef.current.clear = () => clearTimeout(t);
          });
      }, delay);
    };

    scheduleNext();
    return () => {
      if (hitokotoTimeoutRef.current) clearTimeout(hitokotoTimeoutRef.current);
      clearTimers();
    };
  }, [config.visible, config.hitokotoEnabled, config.sprites.length]);

  const hasMovedRef = useRef(false);
  const [justDragged, setJustDragged] = useState(false);
  const prevDragRef = useRef(drag);
  useEffect(() => {
    if (prevDragRef.current && !drag && hasMovedRef.current) {
      queueMicrotask(() => setJustDragged(true));
    }
    prevDragRef.current = drag;
  }, [drag]);

  const handleClick = useCallback(() => {
    if (justDragged) {
      setJustDragged(false);
      return;
    }
    const now = Date.now();
    animIdRef.current += 1;
    const id = animIdRef.current;
    setBounceAnims((prev) => [...prev, { id, start: now }]);
    const totalDuration = config.sprites.length * BOUNCE_INTERVAL_MS + BOUNCE_DURATION_MS;
    setTimeout(() => {
      setBounceAnims((prev) => prev.filter((a) => a.id !== id));
    }, totalDuration);
  }, [config.sprites.length, justDragged]);

  useEffect(() => {
    if (bounceAnims.length === 0) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setAnimNow(Date.now());
    }, 50);
    return () => clearInterval(interval);
  }, [bounceAnims.length]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (!wrapperRef.current) return;
      hasMovedRef.current = false;
      const rect = wrapperRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setOffset({
        x: e.clientX - cx,
        y: e.clientY - cy,
      });
      setDrag(true);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      hasMovedRef.current = true;
      const px = (e.clientX - offset.x) / window.innerWidth;
      const py = (e.clientY - offset.y) / window.innerHeight;
      const newLeft = Math.max(0, Math.min(100, px * 100));
      const newTop = Math.max(0, Math.min(100, py * 100));
      onPositionChange(toStoredPosition(newTop, newLeft));
    },
    [offset, onPositionChange],
  );

  const handlePointerUp = useCallback(() => {
    setDrag(false);
  }, []);

  React.useEffect(() => {
    if (!drag) return;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [drag, handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={wrapperRef}
      role="presentation"
      style={{
        position: "fixed",
        left: `${left}%`,
        top: `${top}%`,
        width: WRAPPER_SIZE,
        height: WRAPPER_SIZE,
        transform: "translate(-50%, -50%)",
        cursor: drag ? "grabbing" : "grab",
        touchAction: "none",
        zIndex: 49,
        pointerEvents: "auto",
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleClick}
    >
      {config.sprites.map((item, index) => {
        const scale = WRAPPER_SIZE / 320;
        const scaledItem = { ...item, width: item.width * scale, height: item.height * scale };
        const { x, y, offsetY } = getSpriteGridPosition(index, scaledItem.height);
        const bounceMatch = bounceAnims
          .filter(
            (a) =>
              animNow >= a.start + index * BOUNCE_INTERVAL_MS &&
              animNow < a.start + index * BOUNCE_INTERVAL_MS + BOUNCE_DURATION_MS
          )
          .sort((a, b) => b.start - a.start)[0];
        const bounceKey = bounceMatch ? bounceMatch.id : 0;
        return (
          <PageSprite
            key={item.id}
            item={scaledItem}
            x={x}
            y={y}
            offsetY={offsetY}
            zIndex={50 + (config.sprites.length - 1 - index)}
            wrapperSize={WRAPPER_SIZE}
            bounceKey={bounceKey}
          />
        );
      })}
      {hitokotoSpriteIndex != null && config.sprites[hitokotoSpriteIndex] && (() => {
        const scale = WRAPPER_SIZE / 320;
        const item = config.sprites[hitokotoSpriteIndex];
        const scaledItem = { ...item, width: item.width * scale, height: item.height * scale };
        const { x, y, offsetY } = getSpriteGridPosition(hitokotoSpriteIndex, scaledItem.height);
        const spriteTopPx = (y / 100) * WRAPPER_SIZE + offsetY - scaledItem.height / 2;
        const dialogBottomPx = spriteTopPx - 10;
        const defaultColor = "var(--ant-color-text)";
        const spriteColor = item.color;
        const visible = hitokotoFullText.slice(0, hitokotoDisplayedLength);
        const showLoading = hitokotoFullText === "" && hitokotoDisplayedLength === 0;
        return (
          <div
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${Math.max(0, dialogBottomPx)}px`,
              transform: "translate(-50%, -100%)",
              padding: "6px 10px",
              width: WRAPPER_SIZE,
              maxWidth: WRAPPER_SIZE,
              maxHeight: WRAPPER_SIZE,
              boxSizing: "border-box",
              background: "#fff",
              borderRadius: 8,
              border: `2px solid ${spriteColor}`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              fontSize: 12,
              lineHeight: 1.4,
              color: defaultColor,
              zIndex: 60,
              opacity: hitokotoFade ? 0 : 1,
              transition: `opacity ${HITOKOTO_FADE_DURATION_MS}ms ease-out`,
              overflow: "hidden",
              wordBreak: "break-all",
            }}
          >
            {showLoading ? (
              "..."
            ) : (() => {
              const chars = Array.from(visible);
              const prevChars = chars.slice(0, -1);
              const lastChar = chars.length > 0 ? chars[chars.length - 1] : "";
              return (
                <>
                  {prevChars.map((ch, i) => (
                    <span key={i} style={{ color: defaultColor }}>
                      {ch}
                    </span>
                  ))}
                  {lastChar ? (
                    <span
                      style={{
                        color: hitokotoLastCharHighlight ? spriteColor : defaultColor,
                        transition: "color 0.15s ease-out",
                      }}
                    >
                      {lastChar}
                    </span>
                  ) : null}
                </>
              );
            })()}
          </div>
        );
      })()}
    </div>
  );
}
