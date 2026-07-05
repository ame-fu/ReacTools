"use client";

import React from "react";
import { Card, Switch, Select, Input, Form, Space } from "antd";
import { FormatTransformer } from "@/components/FormatTransformer";
import { useI18n } from "@/lib/i18n/context";

type SortOrder = "asc" | "desc" | null;

interface ConvertOptions {
  lowerCase: boolean;
  trimItems: boolean;
  itemPrefix: string;
  itemSuffix: string;
  listPrefix: string;
  listSuffix: string;
  reverseList: boolean;
  sortList: SortOrder;
  removeDuplicates: boolean;
  separator: string;
  keepLineBreaks: boolean;
}

const STORAGE_KEY = "list-converter:conversionConfig";

function uniq(list: string[]) {
  return Array.from(new Set(list));
}

function convert(list: string, options: ConvertOptions): string {
  const lineBreak = options.keepLineBreaks ? "\n" : "";
  let text = list;
  if (options.lowerCase) text = text.toLowerCase();

  let parts = text.split("\n");
  if (options.removeDuplicates) parts = uniq(parts);
  if (options.reverseList) parts = [...parts].reverse();
  if (options.sortList) {
    parts = [...parts].sort((a, b) => {
      const aa = a.toLowerCase();
      const bb = b.toLowerCase();
      if (aa < bb) return options.sortList === "asc" ? -1 : 1;
      if (aa > bb) return options.sortList === "asc" ? 1 : -1;
      return 0;
    });
  }

  parts = parts
    .map((p) => (options.trimItems ? p.trim() : p))
    .filter((p) => p !== "")
    .map((p) => options.itemPrefix + p + options.itemSuffix);

  const joined = parts.join(options.separator + lineBreak);
  return [options.listPrefix, joined, options.listSuffix].join(lineBreak);
}

export function ListConverter() {
  const { t } = useI18n();
  const [config, setConfig] = React.useState<ConvertOptions>(() => {
    if (typeof window === "undefined") {
      return {
        lowerCase: false,
        trimItems: true,
        removeDuplicates: true,
        keepLineBreaks: false,
        itemPrefix: "",
        itemSuffix: "",
        listPrefix: "",
        listSuffix: "",
        reverseList: false,
        sortList: null,
        separator: ", ",
      };
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) throw new Error("no");
      return JSON.parse(raw) as ConvertOptions;
    } catch {
      return {
        lowerCase: false,
        trimItems: true,
        removeDuplicates: true,
        keepLineBreaks: false,
        itemPrefix: "",
        itemSuffix: "",
        listPrefix: "",
        listSuffix: "",
        reverseList: false,
        sortList: null,
        separator: ", ",
      };
    }
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const sortOrderOptions = [
    { label: t("tools.list-converter.sortAscending"), value: "asc" },
    { label: t("tools.list-converter.sortDescending"), value: "desc" },
  ];

  const transformer = React.useCallback(
    (value: string) => convert(value, config),
    [config],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ minWidth: 280 }}>
            <Form layout="vertical">
              <Form.Item label={t("tools.list-converter.trimItems")}>
                <Switch
                  checked={config.trimItems}
                  onChange={(v) => setConfig((c) => ({ ...c, trimItems: v }))}
                />
              </Form.Item>
              <Form.Item label={t("tools.list-converter.removeDuplicates")}>
                <Switch
                  checked={config.removeDuplicates}
                  onChange={(v) =>
                    setConfig((c) => ({ ...c, removeDuplicates: v }))
                  }
                />
              </Form.Item>
              <Form.Item label={t("tools.list-converter.convertToLowercase")}>
                <Switch
                  checked={config.lowerCase}
                  onChange={(v) => setConfig((c) => ({ ...c, lowerCase: v }))}
                />
              </Form.Item>
              <Form.Item label={t("tools.list-converter.keepLineBreaks")}>
                <Switch
                  checked={config.keepLineBreaks}
                  onChange={(v) =>
                    setConfig((c) => ({ ...c, keepLineBreaks: v }))
                  }
                />
              </Form.Item>
            </Form>
          </div>

          <div style={{ flex: 1, minWidth: 320 }}>
            <Form layout="vertical">
              <Form.Item label={t("tools.list-converter.sortList")}>
                <Select
                  allowClear
                  value={config.sortList ?? undefined}
                  onChange={(v) =>
                    setConfig((c) => ({
                      ...c,
                      sortList: (v as SortOrder) ?? null,
                    }))
                  }
                  options={sortOrderOptions}
                  disabled={config.reverseList}
                  placeholder={t("tools.list-converter.sortPlaceholder")}
                />
              </Form.Item>
              <Form.Item label={t("tools.list-converter.separator")}>
                <Input
                  value={config.separator}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, separator: e.target.value }))
                  }
                  placeholder=","
                />
              </Form.Item>

              <Form.Item label={t("tools.list-converter.wrapItem")}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    style={{ width: "50%" }}
                    value={config.itemPrefix}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, itemPrefix: e.target.value }))
                    }
                    placeholder={t("tools.list-converter.itemPrefix")}
                  />
                  <Input
                    style={{ width: "50%" }}
                    value={config.itemSuffix}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, itemSuffix: e.target.value }))
                    }
                    placeholder={t("tools.list-converter.itemSuffix")}
                  />
                </Space.Compact>
              </Form.Item>

              <Form.Item label={t("tools.list-converter.wrapList")}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    style={{ width: "50%" }}
                    value={config.listPrefix}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, listPrefix: e.target.value }))
                    }
                    placeholder={t("tools.list-converter.listPrefix")}
                  />
                  <Input
                    style={{ width: "50%" }}
                    value={config.listSuffix}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, listSuffix: e.target.value }))
                    }
                    placeholder={t("tools.list-converter.listSuffix")}
                  />
                </Space.Compact>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>

      <FormatTransformer
        inputLabel={t("tools.list-converter.inputLabel")}
        inputPlaceholder={t("tools.list-converter.inputPlaceholder")}
        outputLabel={t("tools.list-converter.outputLabel")}
        transformer={transformer}
      />
    </div>
  );
}

