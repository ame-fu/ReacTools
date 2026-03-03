"use client";

import React from "react";
import { Card } from "antd";
import { InputCopyable, TextareaCopyable } from "@/components/ui";

export interface ValidationRule {
  message: string;
  validator: (value: string) => boolean;
}

interface FormatTransformerProps {
  transformer: (value: string) => string;
  inputValidationRules?: ValidationRule[];
  inputLabel?: string;
  inputPlaceholder?: string;
  inputDefault?: string;
  outputLabel?: string;
}

export function FormatTransformer({
  transformer,
  inputValidationRules = [],
  inputLabel = "Input",
  inputDefault = "",
  inputPlaceholder = "Input...",
  outputLabel = "Output",
}: FormatTransformerProps) {
  const [input, setInput] = React.useState(inputDefault);

  const firstError = React.useMemo(() => {
    for (const rule of inputValidationRules) {
      if (!rule.validator(input)) return rule.message;
    }
    return null;
  }, [input, inputValidationRules]);

  const output = React.useMemo(() => transformer(input), [input, transformer]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card title={inputLabel}>
        <InputCopyable
          value={input}
          onChange={(v) => setInput(v)}
          placeholder={inputPlaceholder}
          multiline
          rows={16}
          style={{ fontFamily: "monospace" }}
          status={firstError ? "error" : undefined}
        />
        {firstError && (
          <div style={{ marginTop: 8, color: "#ff4d4f" }}>{firstError}</div>
        )}
      </Card>

      <Card title={outputLabel}>
        <TextareaCopyable
          value={output}
          rows={16}
          style={{ fontFamily: "monospace" }}
        />
      </Card>
    </div>
  );
}

