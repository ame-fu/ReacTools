"use client";

import React from "react";
import MarkdownIt from "markdown-it";
import { Card, Divider, Button } from "antd";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

export function MarkdownToHtml() {
  const { t } = useI18n();
  const [inputMarkdown, setInputMarkdown] = React.useState("");
  const outputHtml = React.useMemo(() => {
    const md = new MarkdownIt();
    return md.render(inputMarkdown);
  }, [inputMarkdown]);

  const printHtml = () => {
    const w = window.open();
    if (w == null) return;
    w.document.body.innerHTML = outputHtml;
    w.print();
  };

  return (
    <div>
      <Card>
        <InputCopyable
          value={inputMarkdown}
          onChange={(v) => setInputMarkdown(v)}
          label={t("tools.markdown-to-html.inputLabel")}
          placeholder={t("tools.markdown-to-html.inputPlaceholder")}
          multiline
          rows={8}
          style={{ fontFamily: "monospace" }}
        />

        <Divider />

        <TextareaCopyable
          value={outputHtml}
          rows={10}
          label={t("tools.markdown-to-html.outputLabel")}
          style={{ fontFamily: "monospace" }}
        />

        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Button onClick={printHtml} disabled={!outputHtml}>
            {t("tools.markdown-to-html.printPdf")}
          </Button>
        </div>
      </Card>
    </div>
  );
}

