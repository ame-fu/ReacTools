"use client";

import React, { useEffect, useRef, useState } from "react";
import type { SpriteItem } from "@/lib/sprite-context";

interface PageSpriteProps {
  item: SpriteItem;
  x: number;
  y: number;
  offsetY?: number;
  zIndex: number;
  wrapperSize?: number;
  bounceKey?: number;
}

export function PageSprite({
  item,
  x,
  y,
  offsetY = 0,
  zIndex,
  wrapperSize,
  bounceKey = 0,
}: PageSpriteProps) {
  const [eyeAngle, setEyeAngle] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const spriteSize = Math.min(item.width, item.height);
  const eyeSizePct = Math.max(20, Math.min(32, (spriteSize / 80) * 26));
  const eyeSize = `${eyeSizePct}%`;
  const pupilSizePct = 42;
  const maxPupilOffset = (spriteSize * (eyeSizePct / 100) / 2) * (1 - pupilSizePct / 100);
  const rawEx = Math.cos(eyeAngle) * 4;
  const rawEy = Math.sin(eyeAngle) * 4;
  const dist = Math.sqrt(rawEx * rawEx + rawEy * rawEy);
  const scale = dist > maxPupilOffset && dist > 0 ? maxPupilOffset / dist : 1;
  const ex = rawEx * scale;
  const ey = rawEy * scale;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        setEyeAngle(Math.atan2(e.clientY - cy, e.clientX - cx));
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const isInWrapper = wrapperSize != null;
  const posStyle = isInWrapper
    ? { left: `${x}%`, top: `${y}%`, transform: `translate(-50%, calc(-50% + ${offsetY}px))` }
    : { left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" };

  const anim =
    bounceKey > 0
      ? `sprite-bounce-${item.id} 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) 1`
      : "none";
  const shadowAnim =
    bounceKey > 0 ? `sprite-shadow-${item.id} 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) 1` : "none";

  return (
    <div
      ref={containerRef}
      role="presentation"
      style={{
        position: isInWrapper ? "absolute" : "fixed",
        ...posStyle,
        width: item.width,
        height: item.height,
        touchAction: "none",
        zIndex,
      }}
    >
      <style>{`
        @keyframes sprite-bounce-${item.id} {
          0% { transform: translateY(0) scale(1, 1); }
          18% { transform: translateY(-14px) scale(1, 1); }
          22% { transform: translateY(0) scale(1.14, 0.72); }
          28% { transform: translateY(0) scale(1.02, 0.96); }
          32% { transform: translateY(0) scale(0.98, 1.05); }
          36% { transform: translateY(0) scale(1.08, 0.88); }
          42% { transform: translateY(0) scale(1.01, 0.98); }
          46% { transform: translateY(0) scale(0.99, 1.02); }
          50% { transform: translateY(0) scale(1.03, 0.94); }
          56% { transform: translateY(0) scale(1, 1); }
          100% { transform: translateY(0) scale(1, 1); }
        }
        @keyframes sprite-shadow-${item.id} {
          0% { transform: translate(-50%, 0) scale(1); opacity: 0.35; }
          16% { transform: translate(-50%, 0) scale(0.5); opacity: 0.1; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 0.35; }
        }
      `}</style>
      {isInWrapper && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -spriteSize * 0.05,
            width: spriteSize * 0.85,
            height: spriteSize * 0.18,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.2)",
            filter: "blur(2px)",
            transform: "translate(-50%, 0)",
            animation: shadowAnim,
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
      )}
      <div
        style={{
          width: "100%",
          height: "100%",
          clipPath: "url(#sprite-jelly-clip)",
          background: item.color,
          boxShadow:
            "inset -10px -10px 24px rgba(255,255,255,0.5), inset 10px 10px 24px rgba(0,0,0,0.1), inset 0 0 28px rgba(255,255,255,0.2), inset 0 0 0 1px rgba(255,255,255,0.15)",
          position: "relative",
          animation: anim,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "28%",
            top: "32%",
            width: eyeSize,
            height: eyeSize,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: `${pupilSizePct}%`,
              height: `${pupilSizePct}%`,
              borderRadius: "50%",
              background: "#1f2937",
              transform: `translate(${ex}px, ${ey}px)`,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: "54%",
            top: "32%",
            width: eyeSize,
            height: eyeSize,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: `${pupilSizePct}%`,
              height: `${pupilSizePct}%`,
              borderRadius: "50%",
              background: "#1f2937",
              transform: `translate(${ex}px, ${ey}px)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
