"use client";

import React from "react";
import { Card, InputNumber, Select, Button } from "antd";
import { ulid } from "ulid";
import { TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

type Format = "raw" | "json";

export function UlidGenerator() {
  const { t } = useI18n();
  const [amount, setAmount] = React.useState(1);
  const [format, setFormat] = React.useState<Format>("raw");
  const [ulids, setUlids] = React.useState("");

  const regenerate = React.useCallback(() => {
    const ids = Array.from({ length: amount }, () => ulid());
    setUlids(
      format === "json" ? JSON.stringify(ids, null, 2) : ids.join("\n"),
    );
  }, [amount, format]);

  React.useEffect(() => {
    regenerate();
  }, [regenerate]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ width: 80 }}>{t("tools.ulid-generator.quantity")}:</span>
          <InputNumber
            min={1}
            max={100}
            value={amount}
            onChange={(v) => setAmount(v ?? 1)}
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ width: 80 }}>{t("tools.ulid-generator.format")}:</span>
          <Select<Format>
            value={format}
            onChange={setFormat}
            style={{ width: 120 }}
            options={[
              { label: t("tools.ulid-generator.formatRaw"), value: "raw" },
              { label: t("tools.ulid-generator.formatJson"), value: "json" },
            ]}
          />
        </div>
      </Card>

      <Card>
        <TextareaCopyable
          value={ulids}
          rows={8}
          style={{ fontFamily: "monospace", overflow: "auto" }}
        />
      </Card>

      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        <Button onClick={regenerate}>{t("common.refresh")}</Button>
      </div>
    </div>
  );
}
