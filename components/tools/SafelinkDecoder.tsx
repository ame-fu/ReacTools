"use client";

import React from "react";
import { Card, Form } from "antd";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function decodeSafeLinksURL(safeLinksUrl: string): string {
  if (!safeLinksUrl.match(/\.safelinks\.protection\.outlook\.com/)) {
    throw new Error("Invalid SafeLinks URL provided");
  }
  return new URL(safeLinksUrl).searchParams.get("url") ?? "";
}

export function SafelinkDecoder() {
  const { t } = useI18n();
  const [input, setInput] = React.useState("");
  const output = React.useMemo(() => {
    if (!input.trim()) return "";
    try {
      return decodeSafeLinksURL(input.trim());
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  }, [input]);

  return (
    <div>
      <Card>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={input}
              onChange={setInput}
              label={t("tools.safelink-decoder.inputLabel")}
              placeholder={t("tools.safelink-decoder.inputPlaceholder")}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <div style={{ borderTop: "1px solid #f0f0f0" }} />
          </Form.Item>
          <Form.Item>
            <TextareaCopyable
              value={output}
              rows={4}
              label={t("tools.safelink-decoder.outputLabel")}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
