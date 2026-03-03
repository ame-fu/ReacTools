"use client";

import React from "react";
import { Card, Form } from "antd";
import slugify from "@sindresorhus/slugify";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function safeSlugify(s: string): string {
  try {
    return slugify(s);
  } catch {
    return "";
  }
}

export function SlugifyString() {
  const { t } = useI18n();
  const [input, setInput] = React.useState("");
  const slug = React.useMemo(() => safeSlugify(input), [input]);

  return (
    <div>
      <Card>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={input}
              onChange={setInput}
              label={t("tools.slugify-string.inputLabel")}
              placeholder={t("tools.slugify-string.inputPlaceholder")}
              multiline
              rows={3}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
          <Form.Item>
            <TextareaCopyable
              value={slug}
              rows={3}
              label={t("tools.slugify-string.outputLabel")}
              placeholder={t("tools.slugify-string.outputPlaceholder")}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
