"use client";

import React from "react";
import { Card, Select, Table, Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumber,
  type CountryCode,
} from "libphonenumber-js/max";
import lookup from "country-code-lookup";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

interface DetailRow {
  key: string;
  label: string;
  value?: string;
}

const BOOLEAN_LABEL: Record<"true" | "false", string> = {
  true: "Yes",
  false: "No",
};

function booleanToHumanReadable(v: boolean | undefined): string | undefined {
  if (v == null) return undefined;
  return BOOLEAN_LABEL[String(v) as "true" | "false"];
}

const typeToLabel: Record<string, string> = {
  MOBILE: "Mobile",
  FIXED_LINE: "Fixed line",
  FIXED_LINE_OR_MOBILE: "Fixed line or mobile",
  PERSONAL_NUMBER: "Personal number",
  PREMIUM_RATE: "Premium rate",
  SHARED_COST: "Shared cost",
  TOLL_FREE: "Toll free",
  UAN: "Universal access number",
  VOICEMAIL: "Voicemail",
  VOIP: "VoIP",
  PAGER: "Pager",
};

function formatTypeToHumanReadable(type: string | undefined): string | undefined {
  if (!type) return undefined;
  return typeToLabel[type] ?? type;
}

function getFullCountryName(countryCode: string | undefined) {
  if (!countryCode) return undefined;
  return lookup.byIso(countryCode)?.country || countryCode;
}

function getDefaultCountryCode(): CountryCode {
  if (typeof window === "undefined") {
    return "FR";
  }
  const locale = window.navigator.language || "";
  const code = locale.split("-")[1]?.toUpperCase();
  if (!code) return "FR";
  return (lookup.byIso(code)?.iso2 ?? "FR") as CountryCode;
}

function safeParsePhoneNumber(
  raw: string,
  defaultCountry: CountryCode,
): ReturnType<typeof parsePhoneNumber> | undefined {
  try {
    return parsePhoneNumber(raw, defaultCountry);
  } catch {
    return undefined;
  }
}

const COUNTRIES_OPTIONS = getCountries().map((code) => ({
  label: `${lookup.byIso(code)?.country || code} (+${getCountryCallingCode(
    code,
  )})`,
  value: code,
}));

export function PhoneParserAndFormatter() {
  const { t } = useI18n();
  const [rawPhone, setRawPhone] = React.useState("");
  const [defaultCountryCode, setDefaultCountryCode] = React.useState<
    CountryCode
  >(() => getDefaultCountryCode());
  const [hasValidationError, setHasValidationError] = React.useState(false);

  React.useEffect(() => {
    if (rawPhone === "") {
      setHasValidationError(false);
      return;
    }
    const isValidPattern = /^[0-9 +\-()]+$/.test(rawPhone);
    setHasValidationError(!isValidPattern);
  }, [rawPhone]);

  const parsedDetails = React.useMemo<DetailRow[] | undefined>(() => {
    if (hasValidationError || rawPhone === "") {
      return undefined;
    }

    const parsed = safeParsePhoneNumber(rawPhone, defaultCountryCode);
    if (!parsed) return undefined;

    const rows: DetailRow[] = [
      {
        key: "countryCode",
        label: "Country",
        value: parsed.country || undefined,
      },
      {
        key: "countryName",
        label: "Country",
        value: getFullCountryName(parsed.country),
      },
      {
        key: "callingCode",
        label: "Country calling code",
        value: parsed.countryCallingCode || undefined,
      },
      {
        key: "isValid",
        label: "Is valid?",
        value: booleanToHumanReadable(parsed.isValid()),
      },
      {
        key: "isPossible",
        label: "Is possible?",
        value: booleanToHumanReadable(parsed.isPossible()),
      },
      {
        key: "type",
        label: "Type",
        value: formatTypeToHumanReadable(parsed.getType() as string | undefined),
      },
      {
        key: "intl",
        label: "International format",
        value: parsed.formatInternational(),
      },
      {
        key: "national",
        label: "National format",
        value: parsed.formatNational(),
      },
      {
        key: "e164",
        label: "E.164 format",
        value: parsed.format("E.164"),
      },
      {
        key: "rfc3966",
        label: "RFC3966 format",
        value: parsed.format("RFC3966"),
      },
    ];

    return rows;
  }, [rawPhone, defaultCountryCode, hasValidationError]);

  const columns: ColumnsType<DetailRow> = [
    {
      title: t("tools.phone-parser-and-formatter.field"),
      dataIndex: "label",
      key: "label",
      width: 200,
    },
    {
      title: t("tools.phone-parser-and-formatter.value"),
      dataIndex: "value",
      key: "value",
      render: (value: string | undefined) =>
        value ? (
          <span>{value}</span>
        ) : (
          <span style={{ opacity: 0.7 }}>{t("tools.phone-parser-and-formatter.unknown")}</span>
        ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label={t("tools.phone-parser-and-formatter.defaultCountry")}>
            <Select
              showSearch
              style={{ width: "100%", maxWidth: 400 }}
              options={COUNTRIES_OPTIONS}
              value={defaultCountryCode}
              onChange={(value) => setDefaultCountryCode(value as CountryCode)}
              filterOption={(input, option) =>
                (option?.label as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item
            validateStatus={hasValidationError ? "error" : undefined}
            help={hasValidationError ? t("tools.phone-parser-and-formatter.invalidPhone") : undefined}
          >
            <InputCopyable
              value={rawPhone}
              onChange={setRawPhone}
              label={t("tools.phone-parser-and-formatter.phoneLabel")}
              placeholder={t("tools.phone-parser-and-formatter.phonePlaceholder")}
              status={hasValidationError ? "error" : undefined}
            />
          </Form.Item>
        </Form>
      </Card>

      {parsedDetails && (
        <Card>
          <Table<DetailRow>
            dataSource={parsedDetails}
            columns={columns}
            rowKey={(row) => row.key}
            pagination={false}
            size="small"
          />
        </Card>
      )}
    </div>
  );
}
