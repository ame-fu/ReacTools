"use client";

import React from "react";
import { Card, Switch, Slider, Button, Form } from "antd";
import { TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function shuffleString(str: string): string {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

function createToken({
  withUppercase = true,
  withLowercase = true,
  withNumbers = true,
  withSymbols = false,
  length = 64,
}: {
  withUppercase?: boolean;
  withLowercase?: boolean;
  withNumbers?: boolean;
  withSymbols?: boolean;
  length?: number;
}) {
  const allAlphabet = [
    withUppercase ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "",
    withLowercase ? "abcdefghijklmnopqrstuvwxyz" : "",
    withNumbers ? "0123456789" : "",
    withSymbols ? ".,;:!?./-\"'#{([-|\\@)]=}*+" : "",
  ].join("");

  if (!allAlphabet) return "";
  return shuffleString(allAlphabet.repeat(Math.max(length, 1))).substring(
    0,
    length,
  );
}

export function TokenGenerator() {
  const { t } = useI18n();
  const [length, setLength] = React.useState(64);
  const [withUppercase, setWithUppercase] = React.useState(true);
  const [withLowercase, setWithLowercase] = React.useState(true);
  const [withNumbers, setWithNumbers] = React.useState(true);
  const [withSymbols, setWithSymbols] = React.useState(false);
  const [token, setToken] = React.useState("");

  const regenerate = React.useCallback(() => {
    setToken(
      createToken({
        length,
        withUppercase,
        withLowercase,
        withNumbers,
        withSymbols,
      }),
    );
  }, [length, withLowercase, withNumbers, withSymbols, withUppercase]);

  React.useEffect(() => {
    regenerate();
  }, [regenerate]);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
      <Form.Item label={t("tools.token-generator.uppercase")} style={{ marginBottom: 0 }}>
        <Switch checked={withUppercase} onChange={setWithUppercase} />
      </Form.Item>
      <Form.Item label={t("tools.token-generator.lowercase")} style={{ marginBottom: 0 }}>
        <Switch checked={withLowercase} onChange={setWithLowercase} />
      </Form.Item>
      <Form.Item label={t("tools.token-generator.numbers")} style={{ marginBottom: 0 }}>
        <Switch checked={withNumbers} onChange={setWithNumbers} />
      </Form.Item>
      <Form.Item label={t("tools.token-generator.symbols")} style={{ marginBottom: 0 }}>
        <Switch checked={withSymbols} onChange={setWithSymbols} />
      </Form.Item>
      </div>

      <Form.Item
        label={`${t("tools.token-generator.length")} (${length})`}
        style={{ marginTop: 16 }}
      >
        <Slider
          min={1}
          max={512}
          step={1}
          value={length}
          onChange={(v) => setLength(v)}
        />
      </Form.Item>

      <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
        <TextareaCopyable
          value={token}
          rows={3}
          placeholder={t("tools.token-generator.tokenPlaceholder")}
          style={{ textAlign: "center", fontFamily: "monospace" }}
        />
      </Form.Item>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 12 }}>
        <Button onClick={regenerate}>{t("tools.token-generator.button.refresh")}</Button>
      </div>
    </Card>
  );
}
