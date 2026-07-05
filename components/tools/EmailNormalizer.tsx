"use client";

import React from "react";
import { Button, Form } from "antd";
import { normalizeEmail } from "email-normalizer";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

export function EmailNormalizer() {
  const { t } = useI18n();
  const [emails, setEmails] = React.useState("");

  const normalizedEmails = React.useMemo(() => {
    if (!emails) return "";
    return emails
      .split("\n")
      .map((email) => {
        try {
          return normalizeEmail({ email });
        } catch {
          return t("tools.email-normalizer.errorParse").replace("{email}", email);
        }
      })
      .join("\n");
  }, [emails, t]);

  const handleCopy = async () => {
    if (!normalizedEmails) return;
    try {
      await navigator.clipboard.writeText(normalizedEmails);
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label={t("tools.email-normalizer.labelRaw")}>
          <InputCopyable
            value={emails}
            onChange={setEmails}
            placeholder={t("tools.email-normalizer.placeholderRaw")}
            multiline
            rows={3}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>

        <Form.Item label={t("tools.email-normalizer.labelNormalized")}>
          <TextareaCopyable
            value={normalizedEmails}
            rows={3}
            placeholder={t("tools.email-normalizer.placeholderNormalized")}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>

        <Form.Item>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Button onClick={() => setEmails("")}>{t("tools.email-normalizer.buttonClear")}</Button>
            <Button onClick={handleCopy} disabled={!normalizedEmails}>
              {t("tools.email-normalizer.buttonCopy")}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

