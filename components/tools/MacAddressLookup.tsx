"use client";

import React from "react";
import { Button, Card, Form, Input } from "antd";
import db from "oui-data";
import { useI18n } from "@/lib/i18n/context";

function normalizeMac(value: string) {
  return value.trim().replace(/[.:-]/g, "").toUpperCase().substring(0, 6);
}

function isValidMac(mac: string) {
  const cleaned = mac.trim();
  return /^[0-9a-fA-F:. -]{2,}$/.test(cleaned);
}

const slug = "mac-address-lookup";

export function MacAddressLookup() {
  const { t } = useI18n();
  const [macAddress, setMacAddress] = React.useState("20:37:06:12:34:56");
  const [copied, setCopied] = React.useState(false);

  const details = React.useMemo(() => {
    try {
      const key = normalizeMac(macAddress);
      const record = (db as Record<string, string>)[key];
      return record as string | undefined;
    } catch {
      return undefined;
    }
  }, [macAddress]);

  const valid = React.useMemo(() => isValidMac(macAddress), [macAddress]);

  const handleCopy = async () => {
    if (!details) return;
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label={t(`tools.${slug}.labelMac`)}>
          <Input
            value={macAddress}
            onChange={(e) => setMacAddress(e.target.value)}
            size="large"
            placeholder={t(`tools.${slug}.placeholderMac`)}
            status={valid ? undefined : "error"}
            autoComplete="off"
            spellCheck={false}
          />
        </Form.Item>

        <Form.Item label={t(`tools.${slug}.labelVendor`)}>
          <Card>
            {details ? (
              details.split("\n").map((line, index) => (
                <div key={`${line}-${index}`}>{line}</div>
              ))
            ) : (
              <div style={{ fontStyle: "italic", opacity: 0.6 }}>
                {t(`tools.${slug}.unknownVendor`)}
              </div>
            )}
          </Card>
        </Form.Item>

        <Form.Item>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button onClick={handleCopy} disabled={!details}>
              {copied ? t(`tools.${slug}.copied`) : t(`tools.${slug}.buttonCopy`)}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

