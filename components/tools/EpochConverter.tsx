"use client";

import React from "react";
import { Form, Radio, Button } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";
import { formatISO } from "date-fns";

type Unit = "ms" | "s";

function parseEpoch(value: string, unit: Unit): number | null {
  const trimmed = value.trim();
  if (!trimmed || !/^-?\d+$/.test(trimmed)) return null;
  const n = Number.parseInt(trimmed, 10);
  if (unit === "s") return n * 1000;
  return n;
}

function formatDate(ms: number): { local: string; utc: string } {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return { local: "", utc: "" };
  return {
    local: formatISO(d),
    utc: d.toISOString(),
  };
}

export function EpochConverter() {
  const { t } = useI18n();
  const [epochInput, setEpochInput] = React.useState("");
  const [unit, setUnit] = React.useState<Unit>("ms");

  const result = React.useMemo(() => {
    const ms = parseEpoch(epochInput, unit);
    if (ms === null) return null;
    return { ms, ...formatDate(ms) };
  }, [epochInput, unit]);

  const setNow = () => {
    setUnit("ms");
    setEpochInput(String(Date.now()));
  };

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label={t("tools.epoch-converter.timestampLabel")}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <InputCopyable
              value={epochInput}
              onChange={setEpochInput}
              placeholder={
                unit === "ms"
                  ? t("tools.epoch-converter.timestampPlaceholderMs")
                  : t("tools.epoch-converter.timestampPlaceholderSec")
              }
              style={{ flex: 1, minWidth: 180, fontFamily: "monospace" }}
            />
            <Radio.Group value={unit} onChange={(e) => setUnit(e.target.value)}>
              <Radio.Button value="ms">{t("tools.epoch-converter.milliseconds")}</Radio.Button>
              <Radio.Button value="s">{t("tools.epoch-converter.seconds")}</Radio.Button>
            </Radio.Group>
            <Button onClick={setNow}>{t("tools.epoch-converter.currentTime")}</Button>
          </div>
        </Form.Item>

        {result && (
          <>
            <Form.Item label={t("tools.epoch-converter.localLabel")}>
              <InputCopyable
                value={result.local}
                readOnly
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>
            <Form.Item label={t("tools.epoch-converter.utcLabel")}>
              <InputCopyable
                value={result.utc}
                readOnly
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>
            <Form.Item label={t("tools.epoch-converter.otherUnitLabel")}>
              <InputCopyable
                value={unit === "ms" ? String(Math.floor(result.ms / 1000)) : String(result.ms)}
                readOnly
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>
          </>
        )}
      </Form>
    </div>
  );
}
