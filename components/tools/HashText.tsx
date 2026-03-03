"use client";

import React from "react";
import { Card, Select, Row, Col, Form } from "antd";
import CryptoJS, {
  MD5,
  RIPEMD160,
  SHA1,
  SHA224,
  SHA256,
  SHA3,
  SHA384,
  SHA512,
  enc,
} from "crypto-js";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function convertHexToBin(hex: string) {
  return hex
    .trim()
    .split("")
    .map((byte) => Number.parseInt(byte, 16).toString(2).padStart(4, "0"))
    .join("");
}

type Encoding = "Hex" | "Base64" | "Base64url" | "Bin";

function formatWithEncoding(words: CryptoJS.lib.WordArray, encoding: Encoding): string {
  if (encoding === "Bin") {
    return convertHexToBin(words.toString(enc.Hex));
  }
  if (encoding === "Base64url") {
    return words.toString(enc.Base64url);
  }
  const encoder = enc[encoding as keyof typeof enc];
  return words.toString(encoder);
}

const ALGOS = {
  MD5,
  SHA1,
  SHA256,
  SHA224,
  SHA512,
  SHA384,
  SHA3,
  RIPEMD160,
} as const;

type AlgoName = keyof typeof ALGOS;

const ENCODING_LABELS: Record<Encoding, string> = {
  Bin: "encodingBin",
  Hex: "encodingHex",
  Base64: "encodingBase64",
  Base64url: "encodingBase64url",
};

export function HashText() {
  const { t } = useI18n();
  const [clearText, setClearText] = React.useState("");
  const [encoding, setEncoding] = React.useState<Encoding>("Hex");

  const hashValue = (algo: AlgoName) =>
    formatWithEncoding(ALGOS[algo](clearText) as unknown as CryptoJS.lib.WordArray, encoding);

  return (
    <Card>
      <Form layout="vertical">
        <Form.Item>
          <InputCopyable
            value={clearText}
            onChange={setClearText}
            label={t("tools.hash-text.inputLabel")}
            placeholder={t("tools.hash-text.inputPlaceholder")}
            multiline
            rows={3}
          />
        </Form.Item>

        <Form.Item label={t("tools.hash-text.digestEncoding")}>
          <Select<Encoding>
            value={encoding}
            onChange={setEncoding}
            style={{ width: 320 }}
            options={[
              { label: t(`tools.hash-text.${ENCODING_LABELS.Bin}`), value: "Bin" },
              { label: t(`tools.hash-text.${ENCODING_LABELS.Hex}`), value: "Hex" },
              { label: t(`tools.hash-text.${ENCODING_LABELS.Base64}`), value: "Base64" },
              {
                label: t(`tools.hash-text.${ENCODING_LABELS.Base64url}`),
                value: "Base64url",
              },
            ]}
          />
        </Form.Item>

        {(Object.keys(ALGOS) as AlgoName[]).map((algo) => (
          <Form.Item key={algo} style={{ marginBottom: 8 }}>
            <Row gutter={8} align="middle">
              <Col flex="0 0 120px">{algo}</Col>
              <Col flex="auto">
                <InputCopyable
                  value={hashValue(algo)}
                  readOnly
                  style={{ fontFamily: "monospace" }}
                />
              </Col>
            </Row>
          </Form.Item>
        ))}
      </Form>
    </Card>
  );
}
