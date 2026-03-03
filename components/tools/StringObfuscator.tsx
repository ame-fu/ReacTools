"use client";

import React from "react";
import { Col, Form, InputNumber, Row, Switch } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function obfuscateString(
  str: string,
  {
    replacementChar = "*",
    keepFirst = 4,
    keepLast = 0,
    keepSpace = true,
  }: {
    replacementChar?: string;
    keepFirst?: number;
    keepLast?: number;
    keepSpace?: boolean;
  } = {},
): string {
  return str
    .split("")
    .map((char, index, array) => {
      if (keepSpace && char === " ") {
        return char;
      }
      return index < keepFirst || index >= array.length - keepLast
        ? char
        : replacementChar;
    })
    .join("");
}

export function StringObfuscator() {
  const { t } = useI18n();
  const [str, setStr] = React.useState("Lorem ipsum dolor sit amet");
  const [keepFirst, setKeepFirst] = React.useState<number>(4);
  const [keepLast, setKeepLast] = React.useState<number>(4);
  const [keepSpace, setKeepSpace] = React.useState<boolean>(true);

  const obfuscated = React.useMemo(
    () =>
      obfuscateString(str, {
        keepFirst,
        keepLast,
        keepSpace,
      }),
    [str, keepFirst, keepLast, keepSpace],
  );

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label={t("tools.string-obfuscator.inputPlaceholder")}>
          <InputCopyable
            value={str}
            onChange={(v) => setStr(v)}
            placeholder={t("tools.string-obfuscator.inputPlaceholder")}
            multiline
            rows={4}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item label={t("tools.string-obfuscator.keepFirst")}>
              <InputNumber
                min={0}
                value={keepFirst}
                onChange={(v) => setKeepFirst(v ?? 0)}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item label={t("tools.string-obfuscator.keepLast")}>
              <InputNumber
                min={0}
                value={keepLast}
                onChange={(v) => setKeepLast(v ?? 0)}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item label={t("tools.string-obfuscator.keepSpaces")}>
              <Switch checked={keepSpace} onChange={setKeepSpace} />
            </Form.Item>
          </Col>
        </Row>

        {obfuscated && (
          <Form.Item label={t("tools.string-obfuscator.outputLabel")}>
            <InputCopyable
              value={obfuscated}
              readOnly
              style={{ fontFamily: "monospace", wordBreak: "break-all" }}
            />
          </Form.Item>
        )}
      </Form>
    </div>
  );
}

