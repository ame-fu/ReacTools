"use client";

import React from "react";
import {
  formatISO,
  formatISO9075,
  formatRFC3339,
  formatRFC7231,
  fromUnixTime,
  getTime,
  getUnixTime,
  isDate,
  isValid,
  parseISO,
} from "date-fns";
import { Card, Select, Form } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

type ToDateMapper = (value: string) => Date;

type FormatId =
  | "jsLocale"
  | "iso8601"
  | "iso9075"
  | "rfc3339"
  | "rfc7231"
  | "unixTimestamp"
  | "timestamp"
  | "utcFormat"
  | "mongoObjectId"
  | "excelDateTime";

interface DateFormat {
  id: FormatId;
  fromDate: (date: Date) => string;
  toDate: ToDateMapper;
  formatMatcher: (value: string) => boolean;
}

const ISO8601_REGEX =
  /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
const ISO9075_REGEX =
  /^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})(\.[0-9]{1,6})?(([+-])([0-9]{2}):([0-9]{2})|Z)?$/;
const RFC3339_REGEX =
  /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(\.[0-9]{1,9})?(([+-])([0-9]{2}):([0-9]{2})|Z)$/;
const RFC7231_REGEX =
  /^[A-Za-z]{3},\s[0-9]{2}\s[A-Za-z]{3}\s[0-9]{4}\s[0-9]{2}:[0-9]{2}:[0-9]{2}\sGMT$/;
const EXCEL_FORMAT_REGEX = /^-?\d+(\.\d+)?$/;

function dateToExcelFormat(date: Date) {
  return String(date.getTime() / (1000 * 60 * 60 * 24) + 25569);
}

function excelFormatToDate(excelFormat: string | number) {
  return new Date((Number(excelFormat) - 25569) * 86400 * 1000);
}

function isUTCDateString(date: string) {
  try {
    return new Date(date).toUTCString() === date;
  } catch {
    return false;
  }
}

function createRegexMatcher(regex: RegExp) {
  return (value: string) => value != null && regex.test(value);
}

const isISO8601DateTimeString = createRegexMatcher(ISO8601_REGEX);
const isISO9075DateString = createRegexMatcher(ISO9075_REGEX);
const isRFC3339DateString = createRegexMatcher(RFC3339_REGEX);
const isRFC7231DateString = createRegexMatcher(RFC7231_REGEX);
const isUnixTimestamp = createRegexMatcher(/^[0-9]{1,10}$/);
const isTimestamp = createRegexMatcher(/^[0-9]{1,13}$/);
const isMongoObjectId = createRegexMatcher(/^[0-9a-fA-F]{24}$/);
const isExcelFormat = createRegexMatcher(EXCEL_FORMAT_REGEX);

export function DateConverter() {
  const { t } = useI18n();
  const [inputDate, setInputDate] = React.useState("");
  const toDate: ToDateMapper = (date) => new Date(date);

  const formats: DateFormat[] = React.useMemo(
    () => [
      {
        id: "jsLocale",
        fromDate: (date: Date) => date.toString(),
        toDate,
        formatMatcher: () => false,
      },
      {
        id: "iso8601",
        fromDate: formatISO,
        toDate: parseISO,
        formatMatcher: isISO8601DateTimeString,
      },
      {
        id: "iso9075",
        fromDate: formatISO9075,
        toDate: parseISO,
        formatMatcher: isISO9075DateString,
      },
      {
        id: "rfc3339",
        fromDate: formatRFC3339,
        toDate,
        formatMatcher: isRFC3339DateString,
      },
      {
        id: "rfc7231",
        fromDate: formatRFC7231,
        toDate,
        formatMatcher: isRFC7231DateString,
      },
      {
        id: "unixTimestamp",
        fromDate: (date: Date) => String(getUnixTime(date)),
        toDate: (sec: string) => fromUnixTime(+sec),
        formatMatcher: isUnixTimestamp,
      },
      {
        id: "timestamp",
        fromDate: (date: Date) => String(getTime(date)),
        toDate: (ms: string) => new Date(+ms),
        formatMatcher: isTimestamp,
      },
      {
        id: "utcFormat",
        fromDate: (date: Date) => date.toUTCString(),
        toDate,
        formatMatcher: isUTCDateString,
      },
      {
        id: "mongoObjectId",
        fromDate: (date: Date) =>
          `${Math.floor(date.getTime() / 1000).toString(16)}0000000000000000`,
        toDate: (objectId: string) =>
          new Date(Number.parseInt(objectId.substring(0, 8), 16) * 1000),
        formatMatcher: isMongoObjectId,
      },
      {
        id: "excelDateTime",
        fromDate: dateToExcelFormat,
        toDate: excelFormatToDate,
        formatMatcher: isExcelFormat,
      },
    ],
    [],
  );

  const [formatIndex, setFormatIndex] = React.useState<number>(6);
  const [now, setNow] = React.useState<Date>(() => new Date(0));

  React.useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const normalizedDate = React.useMemo(() => {
    if (!inputDate) return now;
    try {
      return formats[formatIndex].toDate(inputDate);
    } catch {
      return undefined;
    }
  }, [formats, formatIndex, inputDate, now]);

  const isInputValid = React.useMemo(() => {
    if (inputDate === "") return true;
    try {
      const maybeDate = formats[formatIndex].toDate(inputDate);
      return isDate(maybeDate) && isValid(maybeDate);
    } catch {
      return false;
    }
  }, [formats, formatIndex, inputDate]);

  const onDateInputChanged = (value: string) => {
    setInputDate(value);
    const matchingIndex = formats.findIndex((f) => f.formatMatcher(value));
    if (matchingIndex !== -1) {
      setFormatIndex(matchingIndex);
    }
  };

  const formatDateUsing = (formatter: (d: Date) => string) => {
    if (!normalizedDate || !isInputValid) return "";
    try {
      return formatter(normalizedDate);
    } catch {
      return "";
    }
  };

  return (
    <Card>
      <Form layout="vertical">
        <Form.Item
          style={{ marginBottom: 12 }}
          validateStatus={!isInputValid ? "error" : undefined}
          help={!isInputValid ? t("tools.date-converter.invalidDateMessage") : undefined}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <InputCopyable
                value={inputDate}
                onChange={(v) => onDateInputChanged(v)}
                placeholder={t("tools.date-converter.placeholder")}
                status={!isInputValid ? "error" : undefined}
              />
            </div>
            <Select
              value={formatIndex}
              onChange={(v) => setFormatIndex(v)}
              style={{ flex: "0 0 220px" }}
              options={formats.map((f, i) => ({
                label: t(`tools.date-converter.formats.${f.id}`),
                value: i,
              }))}
            />
          </div>
        </Form.Item>

        <Form.Item style={{ marginBottom: 8 }}>
          <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />
        </Form.Item>

        {formats.map((f) => (
          <Form.Item key={f.id} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ width: 180, textAlign: "right", opacity: 0.85 }}>
                {t(`tools.date-converter.formats.${f.id}`)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <InputCopyable
                  value={formatDateUsing(f.fromDate)}
                  readOnly
                  placeholder={t("tools.date-converter.invalidPlaceholder")}
                  style={{ fontFamily: "monospace" }}
                />
              </div>
            </div>
          </Form.Item>
        ))}
      </Form>
    </Card>
  );
}

