"use client";

import React from "react";
import { Card, Input, Form } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function textToBase64(text: string): string {
  return window.btoa(text);
}

export function BasicAuthGenerator() {
  const { t } = useI18n();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const header = React.useMemo(
    () =>
      `Authorization: Basic ${textToBase64(`${username}:${password}`)}`,
    [username, password],
  );

  return (
    <div>
      <Form layout="vertical">
        <Form.Item>
          <InputCopyable
            value={username}
            onChange={setUsername}
            placeholder={t("tools.basic-auth-generator.usernamePlaceholder")}
          />
        </Form.Item>
        <Form.Item>
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("tools.basic-auth-generator.passwordPlaceholder")}
          />
        </Form.Item>
      </Form>

      <Card>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={header}
              readOnly
              label={t("tools.basic-auth-generator.authHeaderLabel")}
              style={{
                fontFamily: "monospace",
                fontSize: 17,
              }}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
