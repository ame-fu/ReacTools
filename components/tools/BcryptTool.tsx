"use client";

import React from "react";
import { Card, InputNumber, Form } from "antd";
import { compareSync, hashSync } from "bcryptjs";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

export function BcryptTool() {
  const { t } = useI18n();
  const [input, setInput] = React.useState("");
  const [saltCount, setSaltCount] = React.useState(10);
  const [compareString, setCompareString] = React.useState("");
  const [compareHash, setCompareHash] = React.useState("");

  const hashed = React.useMemo(
    () => (input ? hashSync(input, saltCount) : ""),
    [input, saltCount],
  );

  const compareMatch = React.useMemo(() => {
    if (!compareString || !compareHash) return false;
    try {
      return compareSync(compareString, compareHash);
    } catch {
      return false;
    }
  }, [compareString, compareHash]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title={t("tools.bcrypt.hash")}>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={input}
              onChange={setInput}
              label={t("tools.bcrypt.yourString")}
              placeholder={t("tools.bcrypt.stringPlaceholder")}
            />
          </Form.Item>

          <Form.Item label={t("tools.bcrypt.saltCount")}>
            <InputNumber
              value={saltCount}
              onChange={(v) => setSaltCount(v ?? 10)}
              min={0}
              max={100}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item>
            <InputCopyable
              value={hashed}
              readOnly
              style={{ textAlign: "center" }}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title={t("tools.bcrypt.compare")}>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={compareString}
              onChange={setCompareString}
              label={t("tools.bcrypt.yourString")}
              placeholder={t("tools.bcrypt.compareStringPlaceholder")}
            />
          </Form.Item>

          <Form.Item>
            <InputCopyable
              value={compareHash}
              onChange={setCompareHash}
              label={t("tools.bcrypt.yourHash")}
              placeholder={t("tools.bcrypt.hashPlaceholder")}
            />
          </Form.Item>

          <Form.Item label={t("tools.bcrypt.doTheyMatch")} style={{ marginBottom: 0 }}>
            <div
              style={{
                color: compareMatch ? "#52c41a" : "#ff4d4f",
                fontWeight: 500,
              }}
            >
              {compareMatch ? t("tools.bcrypt.yes") : t("tools.bcrypt.no")}
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
