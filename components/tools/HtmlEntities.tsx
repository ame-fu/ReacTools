"use client";

import React from "react";
import { Card, Form } from "antd";
import { escape, unescape } from "lodash";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

export function HtmlEntities() {
  const { t } = useI18n();
  const [escapeInput, setEscapeInput] = React.useState("<title>IT Tool</title>");
  const [unescapeInput, setUnescapeInput] = React.useState("&lt;title&gt;IT Tool&lt;/title&gt;");

  const escapeOutput = React.useMemo(() => escape(escapeInput), [escapeInput]);
  const unescapeOutput = React.useMemo(() => unescape(unescapeInput), [unescapeInput]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title={t("tools.html-entities.escape")}>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={escapeInput}
              onChange={setEscapeInput}
              label={t("tools.html-entities.yourString")}
              placeholder={t("tools.html-entities.escapePlaceholder")}
              multiline
              rows={3}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
          <Form.Item>
            <TextareaCopyable
              value={escapeOutput}
              rows={3}
              label={t("tools.html-entities.escapedOutput")}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        </Form>
      </Card>
      <Card title={t("tools.html-entities.unescape")}>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={unescapeInput}
              onChange={setUnescapeInput}
              label={t("tools.html-entities.escapedInput")}
              placeholder={t("tools.html-entities.unescapePlaceholder")}
              multiline
              rows={3}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
          <Form.Item>
            <TextareaCopyable
              value={unescapeOutput}
              rows={3}
              label={t("tools.html-entities.unescapedOutput")}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
