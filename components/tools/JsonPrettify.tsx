"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";
import { Card, Form, InputNumber, Switch } from "antd";
import { formatJson } from "@/lib/json-prettify.models";
import { InputCopyable, TextareaCopyable } from "@/components/ui";

const STORAGE_RAW = "json-prettify:raw-json";
const STORAGE_INDENT = "json-prettify:indent-size";
const STORAGE_SORT = "json-prettify:sort-keys";

export function JsonPrettify() {
  const { t } = useI18n();
  const [rawJson, setRawJson] = React.useState(() => {
    if (typeof localStorage === "undefined") return '{"hello": "world", "foo": "bar"}';
    return localStorage.getItem(STORAGE_RAW) ?? '{"hello": "world", "foo": "bar"}';
  });
  const [indentSize, setIndentSize] = React.useState(() => {
    if (typeof localStorage === "undefined") return 3;
    const v = localStorage.getItem(STORAGE_INDENT);
    return v ? parseInt(v, 10) : 3;
  });
  const [sortKeys, setSortKeys] = React.useState(() => {
    if (typeof localStorage === "undefined") return true;
    return localStorage.getItem(STORAGE_SORT) !== "false";
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RAW, rawJson);
      localStorage.setItem(STORAGE_INDENT, String(indentSize));
      localStorage.setItem(STORAGE_SORT, String(sortKeys));
    } catch {
      // ignore
    }
  }, [rawJson, indentSize, sortKeys]);

  const { output: cleanJson, error } = React.useMemo(() => {
    if (!rawJson.trim()) {
      return { output: "", error: null as string | null };
    }
    try {
      const out = formatJson(rawJson, sortKeys, indentSize);
      return { output: out, error: null };
    } catch {
      return { output: "", error: t("tools.json-prettify.errorInvalid") };
    }
  }, [rawJson, sortKeys, indentSize, t]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-4 max-w-[600px] mx-auto">
        <label className="flex items-center gap-2">
          <span className="w-24">{t("tools.json-prettify.sortKeys")}</span>
          <Switch checked={sortKeys} onChange={setSortKeys} />
        </label>
        <label className="flex items-center gap-2">
          <span className="w-24">{t("tools.json-prettify.indentSize")}</span>
          <InputNumber min={0} max={10} value={indentSize} onChange={(v) => setIndentSize(v ?? 3)} className="w-24" />
        </label>
      </div>
      <Card>
        <Form layout="vertical">
          <Form.Item validateStatus={error ? "error" : undefined} help={error || undefined}>
            <InputCopyable
              value={rawJson}
              onChange={setRawJson}
              label={t("tools.json-prettify.labelRaw")}
              placeholder={t("tools.json-prettify.placeholderRaw")}
              multiline
              rows={20}
              className="font-mono"
              status={error ? "error" : undefined}
            />
          </Form.Item>
        </Form>
      </Card>
      <Card>
        <Form layout="vertical">
          <Form.Item>
            <TextareaCopyable value={cleanJson} rows={20} style={{ fontFamily: "monospace" }} label={t("tools.json-prettify.labelPrettified")} />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
