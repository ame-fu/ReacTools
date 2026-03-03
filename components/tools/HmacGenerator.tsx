"use client";

import React from "react";
import { Card, Select, Form } from "antd";
import CryptoJS, {
  HmacMD5,
  HmacRIPEMD160,
  HmacSHA1,
  HmacSHA224,
  HmacSHA256,
  HmacSHA3,
  HmacSHA384,
  HmacSHA512,
  enc,
} from "crypto-js";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
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
  MD5: HmacMD5,
  RIPEMD160: HmacRIPEMD160,
  SHA1: HmacSHA1,
  SHA3: HmacSHA3,
  SHA224: HmacSHA224,
  SHA256: HmacSHA256,
  SHA384: HmacSHA384,
  SHA512: HmacSHA512,
} as const;

type AlgoName = keyof typeof ALGOS;

const ENCODING_LABELS: Record<Encoding, string> = {
  Bin: "encodingBin",
  Hex: "encodingHex",
  Base64: "encodingBase64",
  Base64url: "encodingBase64url",
};

export function HmacGenerator() {
  const { t } = useI18n();
  const [plainText, setPlainText] = React.useState("");
  const [secret, setSecret] = React.useState("");
  const [hashFunction, setHashFunction] = React.useState<AlgoName>("SHA256");
  const [encoding, setEncoding] = React.useState<Encoding>("Hex");

  const hmac = React.useMemo(
    () =>
      formatWithEncoding(
        ALGOS[hashFunction](plainText, secret) as unknown as CryptoJS.lib.WordArray,
        encoding,
      ),
    [encoding, hashFunction, plainText, secret],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={plainText}
              onChange={setPlainText}
              label={t("tools.hmac-generator.plainTextLabel")}
              placeholder={t("tools.hmac-generator.plainTextPlaceholder")}
              multiline
              rows={3}
            />
          </Form.Item>

          <Form.Item>
            <InputCopyable
              value={secret}
              onChange={setSecret}
              label={t("tools.hmac-generator.secretKey")}
              placeholder={t("tools.hmac-generator.secretPlaceholder")}
            />
          </Form.Item>

          <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <Form.Item label={t("tools.hmac-generator.hashFunction")}>
                <Select<AlgoName>
                  value={hashFunction}
                  onChange={setHashFunction}
                  options={(Object.keys(ALGOS) as AlgoName[]).map((label) => ({
                    label,
                    value: label,
                  }))}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <Form.Item label={t("tools.hmac-generator.outputEncoding")}>
                <Select<Encoding>
                  value={encoding}
                  onChange={setEncoding}
                  options={[
                    { label: t(`tools.hmac-generator.${ENCODING_LABELS.Bin}`), value: "Bin" },
                    { label: t(`tools.hmac-generator.${ENCODING_LABELS.Hex}`), value: "Hex" },
                    { label: t(`tools.hmac-generator.${ENCODING_LABELS.Base64}`), value: "Base64" },
                    {
                      label: t(`tools.hmac-generator.${ENCODING_LABELS.Base64url}`),
                      value: "Base64url",
                    },
                  ]}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item style={{ marginTop: 12 }}>
            <TextareaCopyable
              value={hmac}
              rows={2}
              label={t("tools.hmac-generator.hmacOutput")}
              placeholder={t("tools.hmac-generator.hmacPlaceholder")}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
