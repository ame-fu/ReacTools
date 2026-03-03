"use client";

import React from "react";
import { Form } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function parsePart(s: string): number | string {
  const n = Number.parseInt(s, 10);
  if (String(n) === s && !Number.isNaN(n)) return n;
  return s;
}

function compareParts(a: (number | string)[], b: (number | string)[]): number {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (typeof x !== typeof y) {
      return typeof x === "number" ? -1 : 1;
    }
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return 0;
}

function parseVersion(v: string): (number | string)[] | null {
  const trimmed = v.trim();
  if (!trimmed) return null;
  const noPrefix = trimmed.replace(/^v/i, "");
  const parts = noPrefix.split(/[.-]/);
  return parts.map(parsePart);
}

function compare(v1: string, v2: string): -1 | 0 | 1 {
  const a = parseVersion(v1);
  const b = parseVersion(v2);
  if (!a || !b) return 0;
  const cmp = compareParts(a, b);
  return cmp < 0 ? -1 : cmp > 0 ? 1 : 0;
}

export function SemVerComparator() {
  const { t } = useI18n();
  const [versionA, setVersionA] = React.useState("1.2.3");
  const [versionB, setVersionB] = React.useState("1.2.4");

  const result = React.useMemo(() => {
    const cmp = compare(versionA, versionB);
    if (cmp < 0) return `${versionA} < ${versionB}`;
    if (cmp > 0) return `${versionA} > ${versionB}`;
    return `${versionA} = ${versionB}`;
  }, [versionA, versionB]);

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label={t("tools.semver-comparator.versionA")}>
          <InputCopyable
            value={versionA}
            onChange={setVersionA}
            placeholder={t("tools.semver-comparator.versionAPlaceholder")}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>
        <Form.Item label={t("tools.semver-comparator.versionB")}>
          <InputCopyable
            value={versionB}
            onChange={setVersionB}
            placeholder={t("tools.semver-comparator.versionBPlaceholder")}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>
        <Form.Item label={t("tools.semver-comparator.resultLabel")}>
          <InputCopyable value={result} readOnly style={{ fontFamily: "monospace" }} />
        </Form.Item>
      </Form>
    </div>
  );
}
