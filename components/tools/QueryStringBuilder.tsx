"use client";

import React from "react";
import { Button, Card, Form, Input } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function parseQueryString(search: string): Array<{ key: string; value: string }> {
  if (!search.trim()) return [];
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const list: Array<{ key: string; value: string }> = [];
  params.forEach((value, key) => list.push({ key, value }));
  return list;
}

function buildQueryString(pairs: Array<{ key: string; value: string }>): string {
  const params = new URLSearchParams();
  pairs.forEach(({ key, value }) => {
    if (key.trim() !== "") params.append(key.trim(), value);
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

const DEFAULT_PAIRS = [
  { key: "page", value: "1" },
  { key: "size", value: "10" },
  { key: "q", value: "" },
];

export function QueryStringBuilder() {
  const { t } = useI18n();
  const [queryInput, setQueryInput] = React.useState("?page=1&size=10&q=hello");
  const [pairs, setPairs] = React.useState<Array<{ key: string; value: string }>>(DEFAULT_PAIRS);

  const parsed = React.useMemo(() => parseQueryString(queryInput), [queryInput]);
  const builtQuery = React.useMemo(() => buildQueryString(pairs), [pairs]);

  const updatePair = (index: number, field: "key" | "value", value: string) => {
    setPairs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const addPair = () => {
    setPairs((prev) => [...prev, { key: "", value: "" }]);
  };

  const removePair = (index: number) => {
    setPairs((prev) => prev.filter((_, i) => i !== index));
  };

  const fillFromParsed = () => {
    if (parsed.length > 0) setPairs(parsed.map((p) => ({ ...p })));
  };

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label={t("tools.query-string-builder.queryLabel")}>
          <InputCopyable
            value={queryInput}
            onChange={setQueryInput}
            placeholder={t("tools.query-string-builder.queryPlaceholder")}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>

        <Form.Item>
          <Button onClick={fillFromParsed} disabled={parsed.length === 0}>
            {t("tools.query-string-builder.fillFromQuery")}
          </Button>
        </Form.Item>

        <Form.Item label={t("tools.query-string-builder.keyValueListLabel")}>
          <Card size="small">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pairs.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Input
                    placeholder={t("tools.query-string-builder.keyPlaceholder")}
                    value={p.key}
                    onChange={(e) => updatePair(i, "key", e.target.value)}
                    style={{ width: 160, fontFamily: "monospace" }}
                  />
                  <Input
                    placeholder={t("tools.query-string-builder.valuePlaceholder")}
                    value={p.value}
                    onChange={(e) => updatePair(i, "value", e.target.value)}
                    style={{ flex: 1, fontFamily: "monospace" }}
                  />
                  <Button type="text" danger onClick={() => removePair(i)}>
                    {t("tools.query-string-builder.removeParam")}
                  </Button>
                </div>
              ))}
              <Button type="dashed" onClick={addPair}>
                {t("tools.query-string-builder.addParam")}
              </Button>
            </div>
          </Card>
        </Form.Item>

        <Form.Item label={t("tools.query-string-builder.builtQueryLabel")}>
          <InputCopyable
            value={builtQuery}
            readOnly
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>
      </Form>
    </div>
  );
}
