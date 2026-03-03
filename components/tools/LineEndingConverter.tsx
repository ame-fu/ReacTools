"use client";

import React from "react";
import { Button, Form, Input } from "antd";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const CR = "\r";
const LF = "\n";
const CRLF = "\r\n";

type LineEnding = "CRLF" | "LF" | "CR";

const LINE_ENDING_KEYS: { value: LineEnding; labelKey: string; char: string }[] = [
  { value: "CRLF", labelKey: "crlf", char: CRLF },
  { value: "LF", labelKey: "lf", char: LF },
  { value: "CR", labelKey: "cr", char: CR },
];

function detectLineEnding(str: string): LineEnding | null {
  if (str.includes(CRLF)) return "CRLF";
  if (str.includes(LF)) return "LF";
  if (str.includes(CR)) return "CR";
  return null;
}

function convertLineEnding(str: string, to: LineEnding): string {
  const toChar = LINE_ENDING_KEYS.find((e) => e.value === to)?.char ?? LF;
  return str
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n/g, toChar);
}

export function LineEndingConverter() {
  const { t } = useI18n();
  const [input, setInput] = React.useState("line1\nline2\nline3");
  const [outputEnding, setOutputEnding] = React.useState<LineEnding>("CRLF");

  const output = React.useMemo(
    () => convertLineEnding(input, outputEnding),
    [input, outputEnding],
  );
  const detected = React.useMemo(() => detectLineEnding(input), [input]);

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label={t("tools.line-ending-converter.inputLabel")}>
          <InputCopyable
            value={input}
            onChange={setInput}
            multiline
            rows={6}
            placeholder={t("tools.line-ending-converter.inputPlaceholder")}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>

        <Form.Item label={t("tools.line-ending-converter.detectedLabel")}>
          <Input
            value={detected ?? t("tools.line-ending-converter.detectedUnknown")}
            readOnly
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>

        <Form.Item label={t("tools.line-ending-converter.outputEndingLabel")}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {LINE_ENDING_KEYS.map(({ value, labelKey }) => (
              <Button
                key={value}
                type={outputEnding === value ? "primary" : "default"}
                onClick={() => setOutputEnding(value)}
              >
                {t(`tools.line-ending-converter.${labelKey}`)}
              </Button>
            ))}
          </div>
        </Form.Item>

        <Form.Item label={t("tools.line-ending-converter.outputLabel")}>
          <TextareaCopyable
            value={output}
            rows={6}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>
      </Form>
    </div>
  );
}
