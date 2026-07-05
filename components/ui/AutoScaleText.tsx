"use client";

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";

export type AutoScaleAlign = "left" | "center" | "right";

export function AutoScaleText({
  children,
  align = "center",
  minScale = 0.6,
  className,
  style,
}: {
  children: React.ReactNode;
  align?: AutoScaleAlign;
  minScale?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const [scale, setScale] = useState(1);

  const origin = useMemo(() => {
    if (align === "left") return "left center";
    if (align === "right") return "right center";
    return "center center";
  }, [align]);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return;

    const measure = () => {
      const cw = wrapper.clientWidth;
      // Prefer scrollWidth to reflect unwrapped inline width
      const iw = inner.scrollWidth;
      if (!cw || !iw) {
        setScale(1);
        return;
      }
      const next = Math.min(1, cw / iw);
      setScale((prev) => (Math.abs(prev - next) < 0.01 ? prev : next));
    };

    measure();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measure())
        : null;
    ro?.observe(wrapper);
    ro?.observe(inner);

    return () => ro?.disconnect();
  }, [children]);

  const appliedScale = Math.max(minScale, scale);

  return (
    <span
      ref={wrapperRef}
      className={className}
      style={{
        display: "inline-block",
        maxWidth: "100%",
        overflow: "hidden",
        verticalAlign: "middle",
        textAlign: align,
        ...style,
      }}
    >
      <span
        ref={innerRef}
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          transform: `scale(${appliedScale})`,
          transformOrigin: origin,
        }}
      >
        {children}
      </span>
    </span>
  );
}

