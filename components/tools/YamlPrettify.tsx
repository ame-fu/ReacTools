"use client";

import React from "react";
import { Card, Switch, InputNumber, Form } from "antd";
import YAML from "yaml";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const STORAGE_RAW = "yaml-prettify:raw-yaml";
const STORAGE_INDENT = "yaml-prettify:indent-size";
const STORAGE_SORT = "yaml-prettify:sort-keys";

export function YamlPrettify() {
  const { t } = useI18n();
  const [rawYaml, setRawYaml] = React.useState(() => {
    if (typeof localStorage === "undefined") return "";
    return localStorage.getItem(STORAGE_RAW) ?? "";
  });
  const [indentSize, setIndentSize] = React.useState(() => {
    if (typeof localStorage === "undefined") return 2;
    const v = localStorage.getItem(STORAGE_INDENT);
    return v ? parseInt(v, 10) : 2;
  });
  const [sortKeys, setSortKeys] = React.useState(() => {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(STORAGE_SORT) === "true";
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RAW, rawYaml);
      localStorage.setItem(STORAGE_INDENT, String(indentSize));
      localStorage.setItem(STORAGE_SORT, String(sortKeys));
    } catch {
      // ignore
    }
  }, [rawYaml, indentSize, sortKeys]);

  const { output: cleanYaml, error } = React.useMemo(() => {
    if (!rawYaml.trim()) {
      return { output: "", error: null as string | null };
    }
    try {
      const parsed = YAML.parse(rawYaml);
      return {
        output: YAML.stringify(parsed, { sortMapEntries: sortKeys, indent: indentSize }),
        error: null,
      };
    } catch {
      return { output: "", error: t("tools.yaml-prettify.errorInvalid") };
    }
  }, [rawYaml, sortKeys, indentSize, t]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-4 max-w-[600px] mx-auto">
        <label className="flex items-center gap-2">
          <span className="w-24">{t("tools.yaml-prettify.sortKeys")}</span>
          <Switch checked={sortKeys} onChange={setSortKeys} />
        </label>
        <label className="flex items-center gap-2">
          <span className="w-24">{t("tools.yaml-prettify.indentSize")}</span>
          <InputNumber min={1} max={10} value={indentSize} onChange={(v) => setIndentSize(v ?? 2)} className="w-24" />
        </label>
      </div>
      <Card>
        <Form layout="vertical">
          <Form.Item validateStatus={error ? "error" : undefined} help={error || undefined}>
            <InputCopyable
              value={rawYaml}
              onChange={setRawYaml}
              label={t("tools.yaml-prettify.labelRaw")}
              placeholder={t("tools.yaml-prettify.placeholderRaw")}
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
            <TextareaCopyable value={cleanYaml} rows={20} style={{ fontFamily: "monospace" }} label={t("tools.yaml-prettify.labelPrettified")} />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
