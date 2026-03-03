"use client";

import React, { useState, useCallback } from "react";
import { Button, Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { useI18n } from "@/lib/i18n/context";

export interface CopyButtonProps {
  value: string;
  onCopy?: () => void;
  size?: "small" | "middle" | "large";
  circle?: boolean;
  variant?: "text" | "default";
  children?: React.ReactNode;
  className?: string;
}

/**
 * 复刻 it-tools-main InputCopyable 的复制逻辑：点击复制 value，tooltip 显示「复制到剪贴板」/「已复制!」i18n
 */
export function CopyButton({
  value,
  onCopy,
  size = "small",
  circle = false,
  variant = "text",
  children,
  className,
}: CopyButtonProps) {
  const { t } = useI18n();
  const [justCopied, setJustCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setJustCopied(true);
      onCopy?.();
      setTimeout(() => setJustCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [value, onCopy]);

  const tooltipTitle = justCopied ? t("common.copied") : t("common.copyToClipboard");

  return (
    <Tooltip title={tooltipTitle}>
      <Button
        type={variant}
        size={size}
        shape={circle ? "circle" : "default"}
        icon={children ? undefined : <CopyOutlined />}
        onClick={handleCopy}
        disabled={!value}
        className={className}
      >
        {children}
      </Button>
    </Tooltip>
  );
}
