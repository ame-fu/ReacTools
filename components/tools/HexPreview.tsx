"use client";

import React from "react";
import { Card } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const BORDER_GRAY = "#f0f0f0";
const INDEX_BG_GRAY = "#f0f0f0";
const BORDER_HOVER = "#91caff";
const BG_HOVER = "#e6f4ff";
const INDEX_BG_HOVER = "#bae0ff";
const BORDER_SELECTED = "#1677ff";
const BG_SELECTED = "#e6f4ff";
const INDEX_BG_SELECTED = "#91caff";

/** Split normalized hex string into chunks of 2; last chunk may be 1 char. */
function hexChunks(hex: string): string[] {
  const list: string[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    list.push(hex.slice(i, i + 2));
  }
  return list;
}

export function HexPreview() {
  const { t } = useI18n();
  const [raw, setRaw] = React.useState("");
  const [selectedSet, setSelectedSet] = React.useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const normalized = React.useMemo(() => {
    return raw.replace(/[^0-9a-fA-F]/g, "");
  }, [raw]);

  const chunks = React.useMemo(() => hexChunks(normalized), [normalized]);

  /** 仅允许 0-9、a-f、A-F 和空白，否则视为非法 */
  const isInvalidHex = React.useMemo(() => {
    const trimmed = raw.trim();
    if (!trimmed) return false;
    return /[^0-9a-fA-F\s]/.test(raw);
  }, [raw]);

  React.useEffect(() => {
    setSelectedSet(new Set());
  }, [raw]);

  const toggleSelected = React.useCallback((index: number) => {
    setSelectedSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const handleCopy = React.useCallback((text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card>
        <div style={{ marginBottom: 12 }}>
          <InputCopyable
            value={raw}
            onChange={setRaw}
            multiline
            rows={4}
            placeholder={t("tools.hex-preview.inputPlaceholder")}
            status={isInvalidHex ? "error" : undefined}
          />
          {isInvalidHex && (
            <div style={{ marginTop: 6, color: "var(--ant-color-error)", fontSize: 12 }}>
              {t("tools.hex-preview.invalidHexHint")}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            alignContent: "flex-start",
          }}
        >
          {chunks.map((cell, index) => {
            const isSelected = selectedSet.has(index);
            const isHovered = hoveredIndex === index;
            const borderColor = isSelected ? BORDER_SELECTED : isHovered ? BORDER_HOVER : BORDER_GRAY;
            const bgColor = isSelected ? BG_SELECTED : isHovered ? BG_HOVER : "var(--ant-color-bg-container, #fff)";
            const indexBg = isSelected ? INDEX_BG_SELECTED : isHovered ? INDEX_BG_HOVER : INDEX_BG_GRAY;
            const hexText = cell.toUpperCase();
            return (
              <div
                key={`${index}-${cell}`}
                role="button"
                tabIndex={0}
                onClick={() => toggleSelected(index)}
                onDoubleClick={() => handleCopy(hexText)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSelected(index);
                  }
                }}
                style={{
                  border: `1px solid ${borderColor}`,
                  borderRadius: 6,
                  padding: 0,
                  minWidth: 40,
                  textAlign: "center",
                  fontSize: 12,
                  lineHeight: 1.3,
                  background: bgColor,
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    fontSize: 10,
                    lineHeight: 1.2,
                    color: "#000",
                    background: indexBg,
                    padding: "2px 0",
                    textAlign: "center",
                    transition: "background 0.15s",
                  }}
                >
                  {index}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    padding: "6px 8px",
                  }}
                >
                  {hexText}
                </div>
              </div>
            );
          })}
        </div>
        {chunks.length === 0 && normalized.length === 0 && raw.trim() !== "" && (
          <div style={{ marginTop: 8, color: "var(--ant-color-text-secondary)", fontSize: 12 }}>
            {t("tools.hex-preview.noHexHint")}
          </div>
        )}
      </Card>
    </div>
  );
}
