"use client";

import React from "react";
import { Card } from "antd";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function convertTextToUnicode(text: string) {
  return text
    .split("")
    .map((value) => `&#${value.charCodeAt(0)};`)
    .join("");
}

function convertUnicodeToText(unicodeStr: string) {
  return unicodeStr.replace(/&#(\d+);/g, (_match, dec) =>
    String.fromCharCode(Number(dec)),
  );
}

export function TextToUnicode() {
  const { t } = useI18n();
  const [inputText, setInputText] = React.useState("");
  const unicodeFromText = React.useMemo(
    () => (inputText.trim() === "" ? "" : convertTextToUnicode(inputText)),
    [inputText],
  );

  const [inputUnicode, setInputUnicode] = React.useState("");
  const textFromUnicode = React.useMemo(
    () =>
      inputUnicode.trim() === "" ? "" : convertUnicodeToText(inputUnicode),
    [inputUnicode],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title={t("tools.text-to-unicode.textToUnicode")}>
        <InputCopyable
          value={inputText}
          onChange={(v) => setInputText(v)}
          placeholder={t("tools.text-to-unicode.textPlaceholder")}
          multiline
          rows={4}
        />
        <TextareaCopyable
          value={unicodeFromText}
          rows={4}
          placeholder={t("tools.text-to-unicode.unicodeOutputPlaceholder")}
          style={{ fontFamily: "monospace", marginTop: 8 }}
        />
      </Card>

      <Card title={t("tools.text-to-unicode.unicodeToText")}>
        <InputCopyable
          value={inputUnicode}
          onChange={(v) => setInputUnicode(v)}
          placeholder={t("tools.text-to-unicode.unicodePlaceholder")}
          multiline
          rows={4}
          style={{ fontFamily: "monospace" }}
        />
        <TextareaCopyable
          value={textFromUnicode}
          rows={4}
          placeholder={t("tools.text-to-unicode.textOutputPlaceholder")}
          style={{ marginTop: 8 }}
        />
      </Card>
    </div>
  );
}

