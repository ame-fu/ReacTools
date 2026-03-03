"use client";

import React from "react";
import { Card } from "antd";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function convertTextToAsciiBinary(text: string, separator = " ") {
  return text
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(separator);
}

function convertAsciiBinaryToText(binary: string) {
  const cleanBinary = binary.replace(/[^01]/g, "");
  if (cleanBinary.length % 8) {
    throw new Error("Invalid binary string");
  }
  return cleanBinary
    .split(/(\d{8})/)
    .filter(Boolean)
    .map((b) => String.fromCharCode(Number.parseInt(b, 2)))
    .join("");
}

export function TextToBinary() {
  const { t } = useI18n();
  const [inputText, setInputText] = React.useState("");
  const binaryFromText = React.useMemo(
    () => convertTextToAsciiBinary(inputText),
    [inputText],
  );

  const [inputBinary, setInputBinary] = React.useState("");
  const { textFromBinary, binaryError } = React.useMemo(() => {
    if (!inputBinary) return { textFromBinary: "", binaryError: null as string | null };
    try {
      return {
        textFromBinary: convertAsciiBinaryToText(inputBinary),
        binaryError: null,
      };
    } catch {
      return {
        textFromBinary: "",
        binaryError: t("tools.text-to-binary.binaryError"),
      };
    }
  }, [inputBinary, t]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title={t("tools.text-to-binary.textToBinary")}>
        <InputCopyable
          value={inputText}
          onChange={(v) => setInputText(v)}
          placeholder={t("tools.text-to-binary.textPlaceholder")}
          multiline
          rows={4}
        />
        <TextareaCopyable
          value={binaryFromText}
          rows={4}
          placeholder={t("tools.text-to-binary.binaryOutputPlaceholder")}
          style={{ fontFamily: "monospace", marginTop: 8 }}
        />
      </Card>

      <Card title={t("tools.text-to-binary.binaryToText")}>
        <InputCopyable
          value={inputBinary}
          onChange={(v) => setInputBinary(v)}
          placeholder={t("tools.text-to-binary.binaryPlaceholder")}
          multiline
          rows={4}
          style={{ fontFamily: "monospace" }}
          status={binaryError ? "error" : undefined}
        />
        {binaryError && (
          <div style={{ color: "#ff4d4f", marginTop: 8 }}>{binaryError}</div>
        )}
        <TextareaCopyable
          value={textFromBinary}
          rows={4}
          placeholder={t("tools.text-to-binary.textOutputPlaceholder")}
          style={{ marginTop: 8 }}
        />
      </Card>
    </div>
  );
}

