"use client";

import React from "react";
import { Card, Switch } from "antd";
import { CopyButton, InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function textToBase64(
  text: string,
  options?: { makeUrlSafe?: boolean },
): string {
  const encoded = window.btoa(text);
  if (options?.makeUrlSafe) {
    return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return encoded;
}

function base64ToText(
  b64: string,
  options?: { makeUrlSafe?: boolean },
): string {
  let value = b64;
  if (options?.makeUrlSafe) {
    value = value.replace(/-/g, "+").replace(/_/g, "/");
    while (value.length % 4 !== 0) {
      value += "=";
    }
  }
  return window.atob(value);
}

export function Base64StringConverter() {
  const { t } = useI18n();
  const [encodeUrlSafe, setEncodeUrlSafe] = React.useState(false);
  const [decodeUrlSafe, setDecodeUrlSafe] = React.useState(false);

  const [textInput, setTextInput] = React.useState("");
  const base64Output = React.useMemo(
    () => textToBase64(textInput, { makeUrlSafe: encodeUrlSafe }),
    [textInput, encodeUrlSafe],
  );

  const [base64Input, setBase64Input] = React.useState("");
  const { output: textOutput, error: b64Error } = React.useMemo(() => {
    if (!base64Input.trim()) {
      return { output: "", error: null as string | null };
    }
    try {
      const decoded = base64ToText(base64Input.trim(), {
        makeUrlSafe: decodeUrlSafe,
      });
      return { output: decoded, error: null };
    } catch {
      return { output: "", error: "Invalid base64 string" };
    }
  }, [base64Input, decodeUrlSafe]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card title="String to base64">
        <div style={{ marginBottom: 8 }}>
          <span style={{ marginRight: 8 }}>Encode URL safe</span>
          <Switch
            checked={encodeUrlSafe}
            onChange={setEncodeUrlSafe}
          />
        </div>

        <InputCopyable
          value={textInput}
          onChange={setTextInput}
          multiline
          rows={5}
          placeholder="Put your string here..."
          style={{ marginBottom: 12 }}
        />

        <TextareaCopyable
          value={base64Output}
          rows={5}
          placeholder="The base64 encoding of your string will be here"
          style={{ marginBottom: 12 }}
        />

        <div style={{ display: "flex", justifyContent: "center" }}>
          <CopyButton value={base64Output}>{t("common.copyToClipboard")}</CopyButton>
        </div>
      </Card>

      <Card title="Base64 to string">
        <div style={{ marginBottom: 8 }}>
          <span style={{ marginRight: 8 }}>Decode URL safe</span>
          <Switch
            checked={decodeUrlSafe}
            onChange={setDecodeUrlSafe}
          />
        </div>

        <InputCopyable
          value={base64Input}
          onChange={setBase64Input}
          multiline
          rows={5}
          placeholder="Your base64 string..."
          status={b64Error ? "error" : undefined}
          style={{ marginBottom: 8 }}
        />

        {b64Error && (
          <div style={{ color: "#ff4d4f", marginBottom: 8 }}>
            {b64Error}
          </div>
        )}

        <TextareaCopyable
          value={textOutput}
          rows={5}
          placeholder="The decoded string will be here"
          style={{ marginBottom: 12 }}
        />

        <div style={{ display: "flex", justifyContent: "center" }}>
          <CopyButton value={textOutput}>{t("common.copyToClipboard")}</CopyButton>
        </div>
      </Card>
    </div>
  );
}

