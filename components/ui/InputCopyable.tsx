"use client";

import React from "react";
import { Input } from "antd";
import { CopyButton } from "./CopyButton";

export interface InputCopyableProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  multiline?: boolean;
  rows?: number;
  id?: string;
  label?: string;
  style?: React.CSSProperties;
  className?: string;
  /** 校验状态 */
  status?: "error" | "warning";
  /** 控制内部 antd Input 高度 */
  size?: "small" | "middle" | "large";
}

/**
 * antd 规范的输入框 + 复制后缀，边距由父级（如 Form.Item）控制。
 */
export function InputCopyable({
  value,
  onChange,
  placeholder,
  readOnly = false,
  multiline = false,
  rows = 3,
  id,
  label,
  style,
  className,
  status,
  size = "middle",
}: InputCopyableProps) {
  const copySuffix = (
    <CopyButton value={value} size="small" variant="text" circle />
  );

  if (multiline) {
    return (
      <div className={`${className ?? ""} relative`}>
        {label && (
          <label htmlFor={id} style={{ display: "block", fontWeight: 500 }}>
            {label}
          </label>
        )}
        <div className="relative w-full">
          <Input.TextArea
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            rows={rows}
            status={status}
            style={{ width: "100%", paddingRight: 40, ...style }}
          />
          <div className="absolute top-2 right-2 z-10">
            {copySuffix}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} style={{ display: "block", fontWeight: 500 }}>
          {label}
        </label>
      )}
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        status={status}
        size={size}
        style={style}
        suffix={copySuffix}
      />
    </div>
  );
}
