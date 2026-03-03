"use client";

import React from "react";
import { Card, InputNumber, Alert, Form } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function convertBase({
  value,
  fromBase,
  toBase,
}: {
  value: string;
  fromBase: number;
  toBase: number;
}) {
  const range = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/".split(
    "",
  );
  const fromRange = range.slice(0, fromBase);
  const toRange = range.slice(0, toBase);
  let decValue = value
    .split("")
    .reverse()
    .reduce((carry: bigint, digit: string, index: number) => {
      if (!fromRange.includes(digit)) {
        throw new Error(`Invalid digit "${digit}" for base ${fromBase}.`);
      }
      return (
        carry +
        BigInt(fromRange.indexOf(digit)) * BigInt(fromBase) ** BigInt(index)
      );
    }, BigInt(0));

  let newValue = "";
  while (decValue > BigInt(0)) {
    newValue = toRange[Number(decValue % BigInt(toBase))] + newValue;
    decValue = (decValue - (decValue % BigInt(toBase))) / BigInt(toBase);
  }
  return newValue || "0";
}

function tryConvert(value: string, fromBase: number, toBase: number) {
  try {
    return convertBase({ value, fromBase, toBase });
  } catch {
    return "";
  }
}

const OUTPUTS = [
  { id: "binary" as const, toBase: 2 },
  { id: "octal" as const, toBase: 8 },
  { id: "decimal" as const, toBase: 10 },
  { id: "hexadecimal" as const, toBase: 16 },
  { id: "base64" as const, toBase: 64 },
];

export function BaseConverter() {
  const { t } = useI18n();
  const [input, setInput] = React.useState("42");
  const [inputBase, setInputBase] = React.useState(10);
  const [outputBase, setOutputBase] = React.useState(42);

  const error = React.useMemo(() => {
    try {
      convertBase({ value: input, fromBase: inputBase, toBase: outputBase });
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Invalid input.";
    }
  }, [input, inputBase, outputBase]);

  return (
    <Card>
      <Form layout="vertical">
        <Form.Item style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 110, textAlign: "right", opacity: 0.85 }}>
              {t("tools.base-converter.inputLabel")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <InputCopyable
                value={input}
                onChange={(v) => setInput(v)}
                placeholder={t("tools.base-converter.inputPlaceholder")}
                style={{ fontFamily: "monospace" }}
              />
            </div>
          </div>
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 110, textAlign: "right", opacity: 0.85 }}>
              {t("tools.base-converter.inputBaseLabel")}
            </div>
            <InputNumber
              value={inputBase}
              onChange={(v) => setInputBase(v ?? 10)}
              min={2}
              max={64}
              placeholder={t("tools.base-converter.inputBasePlaceholder")}
              style={{ flex: 1, maxWidth: 200 }}
            />
          </div>
        </Form.Item>

        {error && (
          <Form.Item style={{ marginBottom: 12 }}>
            <Alert type="error" message={error} showIcon />
          </Form.Item>
        )}

        <Form.Item style={{ marginBottom: 8 }}>
          <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />
        </Form.Item>

        {OUTPUTS.map(({ id, toBase }) => (
          <Form.Item key={id} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ width: 170, textAlign: "right", opacity: 0.85 }}>
                {t(`tools.base-converter.formats.${id}`)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <InputCopyable
                  value={tryConvert(input, inputBase, toBase)}
                  readOnly
                  placeholder={t(`tools.base-converter.placeholders.${id}`)}
                  style={{ fontFamily: "monospace" }}
                />
              </div>
            </div>
          </Form.Item>
        ))}

        <Form.Item style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 170, textAlign: "right", opacity: 0.85 }}>
              {t("tools.base-converter.customBaseLabel")}
            </div>
            <InputNumber
              value={outputBase}
              onChange={(v) => setOutputBase(v ?? 2)}
              min={2}
              max={64}
              style={{ width: 160 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <InputCopyable
                value={tryConvert(input, inputBase, outputBase)}
                readOnly
                placeholder={t("tools.base-converter.customPlaceholder").replace(
                  "{base}",
                  String(outputBase),
                )}
                style={{ fontFamily: "monospace" }}
              />
            </div>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}

