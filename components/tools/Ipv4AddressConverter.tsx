"use client";

import React from "react";
import { Divider, Form, Input } from "antd";
import { useI18n } from "@/lib/i18n/context";

function isValidIpv4(ip: string) {
  const cleanIp = ip.trim();
  return /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(cleanIp);
}

function ipv4ToInt(ip: string) {
  if (!isValidIpv4(ip)) {
    return 0;
  }
  return ip
    .trim()
    .split(".")
    .reduce((acc, part, index) => acc + Number(part) * 256 ** (3 - index), 0);
}

function convertBase({
  value,
  fromBase,
  toBase,
}: {
  value: string;
  fromBase: number;
  toBase: number;
}) {
  const range = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/".split(
    "",
  );
  const fromRange = range.slice(0, fromBase);
  const toRange = range.slice(0, toBase);
  let decValue = value
    .split("")
    .reverse()
    .reduce((carry: bigint, digit: string, index: number) => {
      if (!fromRange.includes(digit)) {
        throw new Error(`Invalid digit "${digit}" for base ${fromBase}.`);
      }
      return (
        carry +
        BigInt(fromRange.indexOf(digit)) * BigInt(fromBase) ** BigInt(index)
      );
    }, BigInt(0));

  let newValue = "";
  while (decValue > BigInt(0)) {
    newValue = toRange[Number(decValue % BigInt(toBase))] + newValue;
    decValue = (decValue - (decValue % BigInt(toBase))) / BigInt(toBase);
  }
  return newValue || "0";
}

function ipv4ToIpv6(ip: string, prefix = "0000:0000:0000:0000:0000:ffff:") {
  if (!isValidIpv4(ip)) {
    return "";
  }
  const parts = ip
    .trim()
    .split(".")
    .map((part) => Number.parseInt(part, 10).toString(16).padStart(2, "0"));
  const blocks = [
    `${parts[0]}${parts[1]}`,
    `${parts[2]}${parts[3]}`,
  ].join(":");
  return `${prefix}${blocks}`;
}

const slug = "ipv4-address-converter";

export function Ipv4AddressConverter() {
  const { t } = useI18n();
  const [rawIp, setRawIp] = React.useState("192.168.1.1");

  const isValid = React.useMemo(() => isValidIpv4(rawIp), [rawIp]);

  const sections = React.useMemo(() => {
    const ipInDecimal = ipv4ToInt(rawIp);
    const valueStr = String(ipInDecimal);

    const safeConvert = (toBase: number) => {
      try {
        return convertBase({ value: valueStr, fromBase: 10, toBase });
      } catch {
        return "";
      }
    };

    return [
      { label: t(`tools.${slug}.decimal`) + ":", value: String(ipInDecimal) },
      { label: t(`tools.${slug}.hexadecimal`) + ":", value: safeConvert(16).toUpperCase() },
      { label: t(`tools.${slug}.binary`) + ":", value: safeConvert(2) },
      { label: t(`tools.${slug}.ipv6`) + ":", value: ipv4ToIpv6(rawIp) },
      { label: t(`tools.${slug}.ipv6Short`) + ":", value: ipv4ToIpv6(rawIp, "::ffff:") },
    ];
  }, [rawIp, t]);

  const effectiveSections = isValid
    ? sections
    : sections.map((s) => ({ ...s, value: "" }));

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label={t(`tools.${slug}.labelAddress`)}>
          <Input
            value={rawIp}
            onChange={(e) => setRawIp(e.target.value)}
            placeholder={t(`tools.${slug}.placeholderAddress`)}
            status={isValid ? undefined : "error"}
          />
        </Form.Item>

        <Divider />

        {effectiveSections.map(({ label, value }) => (
          <Form.Item key={label} label={label.replace(":", "")}>
            <Input
              value={value}
              readOnly
              placeholder={t(`tools.${slug}.setCorrect`)}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        ))}
      </Form>
    </div>
  );
}

