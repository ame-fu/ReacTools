"use client";

import React from "react";
import { Button, Form } from "antd";
import { normalizeEmail } from "email-normalizer";
import { InputCopyable, TextareaCopyable } from "@/components/ui";

export function EmailNormalizer() {
  const [emails, setEmails] = React.useState("");

  const normalizedEmails = React.useMemo(() => {
    if (!emails) return "";
    return emails
      .split("\n")
      .map((email) => {
        try {
          return normalizeEmail({ email });
        } catch {
          return `Unable to parse email: ${email}`;
        }
      })
      .join("\n");
  }, [emails]);

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
        <Form.Item label="Raw emails to normalize">
          <InputCopyable
            value={emails}
            onChange={setEmails}
            placeholder="Put your emails here (one per line)..."
            multiline
            rows={3}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>

        <Form.Item label="Normalized emails">
          <TextareaCopyable
            value={normalizedEmails}
            rows={3}
            placeholder="Normalized emails will appear here..."
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
            <Button onClick={() => setEmails("")}>Clear emails</Button>
            <Button onClick={handleCopy} disabled={!normalizedEmails}>
              Copy normalized emails
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

