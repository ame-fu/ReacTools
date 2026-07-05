"use client";

import React from "react";
import { Card, Form } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const defaultUrl = "https://me:pwd@it-tools.tech:3000/url-parser?key1=value&key2=value2#the-hash";

function parseUrl(url: string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

const PROPERTY_KEYS: { key: keyof URL; i18nKey: string }[] = [
  { key: "protocol", i18nKey: "protocol" },
  { key: "username", i18nKey: "username" },
  { key: "password", i18nKey: "password" },
  { key: "hostname", i18nKey: "hostname" },
  { key: "port", i18nKey: "port" },
  { key: "pathname", i18nKey: "path" },
  { key: "search", i18nKey: "params" },
];

export function UrlParser() {
  const { t } = useI18n();
  const [urlToParse, setUrlToParse] = React.useState(defaultUrl);
  const urlParsed = React.useMemo(() => parseUrl(urlToParse), [urlToParse]);

  return (
    <Card>
      <Form layout="vertical">
        <Form.Item>
          <InputCopyable
            value={urlToParse}
            onChange={setUrlToParse}
            label={t("tools.url-parser.inputLabel")}
            placeholder={t("tools.url-parser.inputPlaceholder")}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 8 }}>
          <div style={{ borderTop: "1px solid #f0f0f0" }} />
        </Form.Item>
        {PROPERTY_KEYS.map(({ key, i18nKey }) => (
          <Form.Item key={key} label={t(`tools.url-parser.${i18nKey}`)} style={{ marginBottom: 8 }}>
            <InputCopyable
              value={(urlParsed?.[key] as string) ?? ""}
              readOnly
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        ))}
        {urlParsed &&
          Array.from(urlParsed.searchParams.entries()).map(([k, v]) => (
            <Form.Item key={k} label="→" style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <InputCopyable value={k} readOnly style={{ fontFamily: "monospace" }} />
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <InputCopyable value={v} readOnly style={{ fontFamily: "monospace" }} />
                </div>
              </div>
            </Form.Item>
          ))}
      </Form>
    </Card>
  );
}
