"use client";

import React from "react";
import { Input } from "antd";
import { CopyButton } from "./CopyButton";
import { useI18n } from "@/lib/i18n/context";

export interface TextareaCopyableProps {
  value: string;
  placeholder?: string;
  rows?: number;
  label?: string;
  style?: React.CSSProperties;
  className?: string;
  /** 复制按钮位置：与 InputCopyable 一致时为内嵌 */
  copyPlacement?: "top-right" | "outside" | "none";
  /** 紧凑模式，去除底部外边距 */
  compact?: boolean;
  /** 控制复制按钮等尺寸（文本域高度仍由 rows 控制） */
  size?: "small" | "middle" | "large";
}

/**
 * 复刻 it-tools-main TextareaCopyable：只读多行文本 + 复制按钮，i18n 同 CopyButton
 */
export function TextareaCopyable({
  value,
  placeholder,
  rows = 6,
  label,
  style,
  className,
  copyPlacement = "top-right",
}: TextareaCopyableProps) {
  const { t } = useI18n();
  return (
    <div className={className}>
      {label && (
        <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
          {label}
        </label>
      )}
      <div className="relative w-full">
        <Input.TextArea
          value={value}
          readOnly
          placeholder={placeholder}
          rows={rows}
          style={{ width: "100%", paddingRight: copyPlacement === "top-right" ? 40 : undefined, ...style }}
        />
        {copyPlacement === "top-right" && (
          <div className="absolute top-2 right-2 z-10">
            <CopyButton value={value} size="small" variant="text" circle />
          </div>
        )}
      </div>
      {copyPlacement === "outside" && (
        <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
          <CopyButton value={value}>{t("common.copyToClipboard")}</CopyButton>
        </div>
      )}
    </div>
  );
}
