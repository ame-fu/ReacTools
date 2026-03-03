"use client";

import React from "react";
import { Card, List, Typography, Form } from "antd";
import {
  extractIBAN,
  friendlyFormatIBAN,
  isQRIBAN,
  validateIBAN,
  ValidationErrorsIBAN,
} from "ibantools";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const { Text } = Typography;

type IbanErrorCode = (typeof ValidationErrorsIBAN)[keyof typeof ValidationErrorsIBAN];

const ibanErrorToMessage: Record<IbanErrorCode, string> = {
  [ValidationErrorsIBAN.NoIBANProvided]: "No IBAN provided",
  [ValidationErrorsIBAN.NoIBANCountry]: "No IBAN country",
  [ValidationErrorsIBAN.WrongBBANLength]: "Wrong BBAN length",
  [ValidationErrorsIBAN.WrongBBANFormat]: "Wrong BBAN format",
  [ValidationErrorsIBAN.ChecksumNotNumber]: "Checksum is not a number",
  [ValidationErrorsIBAN.WrongIBANChecksum]: "Wrong IBAN checksum",
  [ValidationErrorsIBAN.WrongAccountBankBranchChecksum]:
    "Wrong account bank branch checksum",
  [ValidationErrorsIBAN.QRIBANNotAllowed]: "QR-IBAN not allowed",
};

function getFriendlyErrors(errorCodes: ValidationErrorsIBAN[]) {
  return errorCodes
    .map((code) => ibanErrorToMessage[code as IbanErrorCode])
    .filter(Boolean);
}

interface IbanInfoItem {
  label: string;
  value?: string | boolean | string[];
}

export function IbanValidatorAndParser() {
  const { t } = useI18n();
  const [rawIban, setRawIban] = React.useState("");

  const ibanInfo = React.useMemo<IbanInfoItem[]>(() => {
    const iban = rawIban.toUpperCase().replace(/\s/g, "").replace(/-/g, "");
    if (iban === "") return [];

    const { valid, errorCodes } = validateIBAN(iban);
    const { countryCode, bban } = extractIBAN(iban);
    const errors = getFriendlyErrors(errorCodes);

    const result: IbanInfoItem[] = [
      {
        label: t("tools.iban-validator-and-parser.isValid"),
        value: valid,
      },
    ];

    if (errors.length > 0) {
      result.push({
        label: t("tools.iban-validator-and-parser.ibanErrors"),
        value: errors,
      });
    }

    result.push(
      {
        label: t("tools.iban-validator-and-parser.isQrIban"),
        value: isQRIBAN(iban),
      },
      {
        label: t("tools.iban-validator-and-parser.countryCode"),
        value: countryCode,
      },
      {
        label: t("tools.iban-validator-and-parser.bban"),
        value: bban,
      },
      {
        label: t("tools.iban-validator-and-parser.friendlyFormat"),
        value: friendlyFormatIBAN(iban) ?? "",
      },
    );

    return result;
  }, [rawIban, t]);

  const ibanExamples = React.useMemo(
    () => [
      "FR7630006000011234567890189",
      "DE89370400440532013000",
      "GB29NWBK60161331926819",
    ],
    [],
  );

  return (
    <div>
      <Form layout="vertical">
        <Form.Item>
          <InputCopyable
            value={rawIban}
            onChange={setRawIban}
            placeholder={t("tools.iban-validator-and-parser.inputPlaceholder")}
          />
        </Form.Item>
      </Form>

      {ibanInfo.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <List
            dataSource={ibanInfo}
            renderItem={(item) => (
              <List.Item>
                <div style={{ width: "40%", fontWeight: 500 }}>
                  {item.label}
                </div>
                <div style={{ width: "60%" }}>
                  {Array.isArray(item.value) ? (
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      {item.value.map((v) => (
                        <li key={v}>{v}</li>
                      ))}
                    </ul>
                  ) : typeof item.value === "boolean" ? (
                    <Text>{item.value ? "true" : "false"}</Text>
                  ) : item.value ? (
                    <Text>{item.value}</Text>
                  ) : (
                    <Text type="secondary">—</Text>
                  )}
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}

      <Card title={t("tools.iban-validator-and-parser.validExamples")} style={{ marginTop: 16 }}>
        {ibanExamples.map((iban) => (
          <div key={iban} style={{ marginBottom: 8 }}>
            <Text code>{friendlyFormatIBAN(iban)}</Text>
          </div>
        ))}
      </Card>
    </div>
  );
}
