"use client";

import React from "react";
import { Card, Select, Alert, Form } from "antd";
import { AES, RC4, Rabbit, TripleDES, enc } from "crypto-js";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const ALGOS = { AES, TripleDES, Rabbit, RC4 } as const;
type AlgoName = keyof typeof ALGOS;

export function Encryption() {
  const { t } = useI18n();
  const [cypherInput, setCypherInput] = React.useState(
    "Lorem ipsum dolor sit amet",
  );
  const [cypherAlgo, setCypherAlgo] = React.useState<AlgoName>("AES");
  const [cypherSecret, setCypherSecret] = React.useState("my secret key");

  const [decryptInput, setDecryptInput] = React.useState(
    "U2FsdGVkX1/EC3+6P5dbbkZ3e1kQ5o2yzuU0NHTjmrKnLBEwreV489Kr0DIB+uBs",
  );
  const [decryptAlgo, setDecryptAlgo] = React.useState<AlgoName>("AES");
  const [decryptSecret, setDecryptSecret] = React.useState("my secret key");

  const cypherOutput = React.useMemo(
    () =>
      ALGOS[cypherAlgo].encrypt(cypherInput, cypherSecret).toString(),
    [cypherAlgo, cypherInput, cypherSecret],
  );

  const [decryptOutput, setDecryptOutput] = React.useState("");
  const [decryptError, setDecryptError] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const decrypted = ALGOS[decryptAlgo]
        .decrypt(decryptInput, decryptSecret)
        .toString(enc.Utf8);
      setDecryptOutput(decrypted);
      setDecryptError(null);
    } catch {
      setDecryptOutput("");
      setDecryptError("decryptError");
    }
  }, [decryptAlgo, decryptInput, decryptSecret]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title={t("tools.encryption.encrypt")}>
        <Form layout="vertical">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <Form.Item>
                <InputCopyable
                  value={cypherInput}
                  onChange={setCypherInput}
                  label={t("tools.encryption.yourText")}
                  placeholder={t("tools.encryption.encryptPlaceholder")}
                  multiline
                  rows={4}
                  style={{ fontFamily: "monospace" }}
                />
              </Form.Item>
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <Form.Item>
                <InputCopyable
                  value={cypherSecret}
                  onChange={setCypherSecret}
                  label={t("tools.encryption.secretKey")}
                />
              </Form.Item>
              <Form.Item label={t("tools.encryption.algorithm")}>
                <Select<AlgoName>
                  value={cypherAlgo}
                  onChange={setCypherAlgo}
                  options={(Object.keys(ALGOS) as AlgoName[]).map((label) => ({
                    label,
                    value: label,
                  }))}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>
          </div>
          <Form.Item style={{ marginTop: 16 }}>
            <TextareaCopyable
              value={cypherOutput}
              rows={3}
              label={t("tools.encryption.encryptedOutput")}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title={t("tools.encryption.decrypt")}>
        <Form layout="vertical">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <Form.Item>
                <InputCopyable
                  value={decryptInput}
                  onChange={setDecryptInput}
                  label={t("tools.encryption.encryptedInput")}
                  placeholder={t("tools.encryption.decryptPlaceholder")}
                  multiline
                  rows={4}
                  style={{ fontFamily: "monospace" }}
                />
              </Form.Item>
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <Form.Item>
                <InputCopyable
                  value={decryptSecret}
                  onChange={setDecryptSecret}
                  label={t("tools.encryption.secretKey")}
                />
              </Form.Item>
              <Form.Item label={t("tools.encryption.algorithm")}>
                <Select<AlgoName>
                  value={decryptAlgo}
                  onChange={setDecryptAlgo}
                  options={(Object.keys(ALGOS) as AlgoName[]).map((label) => ({
                    label,
                    value: label,
                  }))}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>
          </div>

          {decryptError && (
            <Form.Item style={{ marginTop: 16 }}>
              <Alert
                type="error"
                title={t("tools.encryption.decryptErrorTitle")}
                description={t("tools.encryption.decryptError")}
              />
            </Form.Item>
          )}

          {!decryptError && (
            <Form.Item style={{ marginTop: 16 }}>
              <TextareaCopyable
                value={decryptOutput}
                rows={3}
                label={t("tools.encryption.decryptedOutput")}
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>
          )}
        </Form>
      </Card>
    </div>
  );
}
