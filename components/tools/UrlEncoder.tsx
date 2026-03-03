"use client";

import React from "react";
import { Card, Form } from "antd";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function safeEncode(s: string): string {
  try {
    return encodeURIComponent(s);
  } catch {
    return "";
  }
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return "";
  }
}

export function UrlEncoder() {
  const { t } = useI18n();
  const [encodeInput, setEncodeInput] = React.useState("Hello world :)");
  const [decodeInput, setDecodeInput] = React.useState("Hello%20world%20%3A)");

  const encodeOutput = React.useMemo(() => safeEncode(encodeInput), [encodeInput]);
  const decodeOutput = React.useMemo(() => safeDecode(decodeInput), [decodeInput]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title={t("tools.url-encoder.encode")}>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={encodeInput}
              onChange={setEncodeInput}
              label={t("tools.url-encoder.yourString")}
              placeholder={t("tools.url-encoder.encodePlaceholder")}
              multiline
              rows={2}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
          <Form.Item>
            <TextareaCopyable
              value={encodeOutput}
              rows={2}
              label={t("tools.url-encoder.encodedOutput")}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        </Form>
      </Card>
      <Card title={t("tools.url-encoder.decode")}>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={decodeInput}
              onChange={setDecodeInput}
              label={t("tools.url-encoder.encodedInput")}
              placeholder={t("tools.url-encoder.decodePlaceholder")}
              multiline
              rows={2}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
          <Form.Item>
            <TextareaCopyable
              value={decodeOutput}
              rows={2}
              label={t("tools.url-encoder.decodedOutput")}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
