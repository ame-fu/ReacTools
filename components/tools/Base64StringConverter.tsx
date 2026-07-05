"use client";

import React from "react";
import { Card, Switch } from "antd";
import { CopyButton, InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function textToBase64(
  text: string,
  options?: { makeUrlSafe?: boolean },
): string {
  if (typeof window === "undefined") return "";
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
  if (typeof window === "undefined") return "";
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
      return { output: "", error: t("tools.base64-string-converter.invalidBase64") };
    }
  }, [base64Input, decodeUrlSafe, t]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card title={t("tools.base64-string-converter.stringToBase64")}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ marginRight: 8 }}>{t("tools.base64-string-converter.encodeUrlSafe")}</span>
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
          placeholder={t("tools.base64-string-converter.inputPlaceholder")}
          style={{ marginBottom: 12 }}
        />

        <TextareaCopyable
          value={base64Output}
          rows={5}
          placeholder={t("tools.base64-string-converter.outputPlaceholder")}
          style={{ marginBottom: 12 }}
        />

        <div style={{ display: "flex", justifyContent: "center" }}>
          <CopyButton value={base64Output}>{t("common.copyToClipboard")}</CopyButton>
        </div>
      </Card>

      <Card title={t("tools.base64-string-converter.base64ToString")}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ marginRight: 8 }}>{t("tools.base64-string-converter.decodeUrlSafe")}</span>
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
          placeholder={t("tools.base64-string-converter.base64InputPlaceholder")}
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
          placeholder={t("tools.base64-string-converter.decodedPlaceholder")}
          style={{ marginBottom: 12 }}
        />

        <div style={{ display: "flex", justifyContent: "center" }}>
          <CopyButton value={textOutput}>{t("common.copyToClipboard")}</CopyButton>
        </div>
      </Card>
    </div>
  );
}

