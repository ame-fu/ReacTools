"use client";

import React from "react";
import { Card, Form, Alert } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const MIN_ARABIC_TO_ROMAN = 1;
const MAX_ARABIC_TO_ROMAN = 3999;

function arabicToRoman(num: number) {
  if (num < MIN_ARABIC_TO_ROMAN || num > MAX_ARABIC_TO_ROMAN) return "";
  const lookup: Record<string, number> = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = "";
  for (const key of Object.keys(lookup)) {
    while (num >= lookup[key]) {
      roman += key;
      num -= lookup[key];
    }
  }
  return roman;
}

const ROMAN_NUMBER_REGEX =
  /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

function isValidRomanNumber(romanNumber: string) {
  return ROMAN_NUMBER_REGEX.test(romanNumber);
}

function romanToArabic(s: string) {
  if (!isValidRomanNumber(s)) return null;
  const map: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };
  return [...s].reduce((r, c, i) => {
    const next = map[s[i + 1]];
    const curr = map[c];
    return next > curr ? r - curr : r + curr;
  }, 0);
}

export function RomanNumeralConverter() {
  const { t } = useI18n();
  const [arabic, setArabic] = React.useState("42");
  const [roman, setRoman] = React.useState("XLII");
  const arabicNum = parseInt(arabic, 10);
  const arabicValid = !Number.isNaN(arabicNum) && arabicNum >= MIN_ARABIC_TO_ROMAN && arabicNum <= MAX_ARABIC_TO_ROMAN;
  const romanValid = isValidRomanNumber(roman) || roman === "";

  const handleArabicChange = (v: string) => {
    setArabic(v);
    const n = parseInt(v, 10);
    if (!Number.isNaN(n) && n >= MIN_ARABIC_TO_ROMAN && n <= MAX_ARABIC_TO_ROMAN) {
      setRoman(arabicToRoman(n));
    }
  };

  const handleRomanChange = (v: string) => {
    const upper = v.toUpperCase();
    setRoman(upper);
    if (isValidRomanNumber(upper)) {
      const num = romanToArabic(upper);
      if (num != null) setArabic(String(num));
    }
  };

  const arabicError = arabic !== "" && !arabicValid
    ? t("tools.roman-numeral-converter.rangeError")
        .replace("{min}", String(MIN_ARABIC_TO_ROMAN))
        .replace("{max}", String(MAX_ARABIC_TO_ROMAN))
    : null;

  return (
    <Card title={t("tools.roman-numeral-converter.title")}>
      <Form layout="vertical" style={{ marginBottom: 16 }}>
        <Form.Item label={t("tools.roman-numeral-converter.arabicToRoman")}>
          <InputCopyable
            value={arabic}
            onChange={handleArabicChange}
            status={arabicError ? "error" : undefined}
            style={{ fontFamily: "monospace" }}
          />
          {arabicError && (
            <Alert type="error" title={arabicError} showIcon style={{ marginTop: 8 }} />
          )}
        </Form.Item>
        <Form.Item label={t("tools.roman-numeral-converter.romanToArabic")}>
          <InputCopyable
            value={roman}
            onChange={handleRomanChange}
            status={!romanValid ? "error" : undefined}
            style={{ fontFamily: "monospace" }}
          />
          {!romanValid && roman !== "" && (
            <Alert type="error" title={t("tools.roman-numeral-converter.invalidRoman")} showIcon style={{ marginTop: 8 }} />
          )}
        </Form.Item>
      </Form>
      <div
        style={{
          padding: 12,
          background: "var(--ant-color-fill-quaternary)",
          borderRadius: 8,
          fontSize: 13,
          color: "var(--ant-color-text-secondary)",
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>罗马数字简介</div>
        <p style={{ margin: "0 0 8px 0" }}>
          罗马数字是古罗马使用的记数系统，由 7 个基本符号组成：I(1)、V(5)、X(10)、L(50)、C(100)、D(500)、M(1000)。规则：左减右加，同一数字最多连续出现 3 次。
        </p>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>对照表</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <tbody>
            <tr><td>I</td><td>1</td><td>V</td><td>5</td><td>X</td><td>10</td></tr>
            <tr><td>L</td><td>50</td><td>C</td><td>100</td><td>D</td><td>500</td></tr>
            <tr><td>M</td><td colSpan={5}>1000</td></tr>
            <tr><td>IV</td><td>4</td><td>IX</td><td>9</td><td>XL</td><td>40</td></tr>
            <tr><td>XC</td><td>90</td><td>CD</td><td>400</td><td>CM</td><td>900</td></tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

