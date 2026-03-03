"use client";

import React from "react";
import { Card, Table, Form } from "antd";
import { jwtDecode } from "jwt-decode";
import type { JwtHeader, JwtPayload } from "jwt-decode";
import { ALGORITHM_DESCRIPTIONS, CLAIM_DESCRIPTIONS } from "@/lib/jwt-parser.constants";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const defaultJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return String(value);
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function getFriendlyValue(claim: string, value: unknown): string | undefined {
  if (["exp", "nbf", "iat"].includes(claim)) {
    if (value == null) return undefined;
    const date = new Date(Number(value) * 1000);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }
  if (claim === "alg" && typeof value === "string") return ALGORITHM_DESCRIPTIONS[value];
  return undefined;
}

interface ClaimRow {
  claim: string;
  claimDescription?: string;
  value: string;
  friendlyValue?: string;
}

function decodeJwt(jwt: string): { header: ClaimRow[]; payload: ClaimRow[] } {
  const rawHeader = jwtDecode<JwtHeader>(jwt, { header: true }) as Record<string, unknown>;
  const rawPayload = jwtDecode<JwtPayload>(jwt) as Record<string, unknown>;

  const toRows = (raw: Record<string, unknown>): ClaimRow[] =>
    Object.entries(raw).map(([claim, value]) => ({
      claim,
      claimDescription: CLAIM_DESCRIPTIONS[claim],
      value: formatValue(value),
      friendlyValue: getFriendlyValue(claim, value),
    }));

  return {
    header: toRows(rawHeader),
    payload: toRows(rawPayload),
  };
}

export function JwtParser() {
  const { t } = useI18n();
  const [rawJwt, setRawJwt] = React.useState(defaultJwt);
  const { decoded, error } = React.useMemo(() => {
    if (!rawJwt.trim()) return { decoded: null, error: null as string | null };
    try {
      return { decoded: decodeJwt(rawJwt.trim()), error: null };
    } catch (e) {
      return { decoded: null, error: e instanceof Error ? e.message : "Invalid JWT" };
    }
  }, [rawJwt]);

  return (
    <Card>
      <Form layout="vertical">
        <Form.Item
          validateStatus={error ? "error" : undefined}
          help={error || undefined}
        >
          <InputCopyable
            value={rawJwt}
            onChange={setRawJwt}
            label={t("tools.jwt-parser.inputLabel")}
            placeholder={t("tools.jwt-parser.inputPlaceholder")}
            multiline
            rows={5}
            style={{ fontFamily: "monospace" }}
            status={error ? "error" : undefined}
          />
        </Form.Item>
      {decoded && (
        <>
          <div style={{ textAlign: "center", fontWeight: 600, marginBottom: 8 }}>{t("tools.jwt-parser.header")}</div>
          <Table
            dataSource={decoded.header.map((r, i) => ({ ...r, key: `h-${i}` }))}
            pagination={false}
            columns={[
              {
                title: t("tools.jwt-parser.claim"),
                key: "claim",
                render: (_: unknown, row: ClaimRow) => (
                  <span>
                    <strong>{row.claim}</strong>
                    {row.claimDescription && <span style={{ opacity: 0.7, marginLeft: 8 }}>({row.claimDescription})</span>}
                  </span>
                ),
              },
              {
                title: t("tools.jwt-parser.value"),
                key: "value",
                render: (_: unknown, row: ClaimRow) => (
                  <span style={{ wordBreak: "break-all" }}>
                    {row.value}
                    {row.friendlyValue && <span style={{ opacity: 0.7, marginLeft: 8 }}>({row.friendlyValue})</span>}
                  </span>
                ),
              },
            ]}
          />
          <div style={{ textAlign: "center", fontWeight: 600, margin: "16px 0 8px" }}>{t("tools.jwt-parser.payload")}</div>
          <Table
            dataSource={decoded.payload.map((r, i) => ({ ...r, key: `p-${i}` }))}
            pagination={false}
            columns={[
              {
                title: t("tools.jwt-parser.claim"),
                key: "claim",
                render: (_: unknown, row: ClaimRow) => (
                  <span>
                    <strong>{row.claim}</strong>
                    {row.claimDescription && <span style={{ opacity: 0.7, marginLeft: 8 }}>({row.claimDescription})</span>}
                  </span>
                ),
              },
              {
                title: t("tools.jwt-parser.value"),
                key: "value",
                render: (_: unknown, row: ClaimRow) => (
                  <span style={{ wordBreak: "break-all" }}>
                    {row.value}
                    {row.friendlyValue && <span style={{ opacity: 0.7, marginLeft: 8 }}>({row.friendlyValue})</span>}
                  </span>
                ),
              },
            ]}
          />
        </>
      )}
      </Form>
    </Card>
  );
}
