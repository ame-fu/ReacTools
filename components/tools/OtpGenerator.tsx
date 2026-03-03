"use client";

import React from "react";
import { Card, Button, Progress, Form } from "antd";
import QRCode from "qrcode";
import {
  generateSecret,
  generateTOTP,
  buildKeyUri,
  base32toHex,
  getCounterFromTime,
} from "@/lib/otp.service";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function useTimestamp(intervalMs: number = 1000) {
  const [now, setNow] = React.useState(0);
  React.useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function OtpGenerator() {
  const { t } = useI18n();
  const now = useTimestamp(500);
  const [secret, setSecret] = React.useState(() => generateSecret());
  const [qrDataUrl, setQrDataUrl] = React.useState("");

  const tokens = React.useMemo(
    () => ({
      previous: generateTOTP(secret, now - 30000),
      current: generateTOTP(secret, now),
      next: generateTOTP(secret, now + 30000),
    }),
    [secret, now],
  );

  const keyUri = React.useMemo(() => buildKeyUri({ secret }), [secret]);
  const interval = (now / 1000) % 30;

  React.useEffect(() => {
    if (!secret) return;
    QRCode.toDataURL(keyUri, { width: 210 }).then(setQrDataUrl).catch(() => setQrDataUrl(""));
  }, [keyUri, secret]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div style={{ maxWidth: 350, display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <Form layout="vertical">
            <Form.Item>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <InputCopyable
                    value={secret}
                    onChange={setSecret}
                    label={t("tools.otp-generator.secret")}
                    placeholder={t("tools.otp-generator.secretPlaceholder")}
                  />
                </div>
                <Button
                  onClick={() => setSecret(generateSecret())}
                  title={t("common.refresh")}
                >
                  ↻
                </Button>
              </div>
            </Form.Item>
          </Form>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
              <span>{t("tools.otp-generator.previous")}</span>
              <span style={{ fontWeight: 600 }}>{t("tools.otp-generator.currentOtp")}</span>
              <span>{t("tools.otp-generator.next")}</span>
            </div>
            <div style={{ display: "flex", border: "1px solid #d9d9d9", borderRadius: 4, overflow: "hidden" }}>
              <Button style={{ flex: 1, borderRadius: 0, fontFamily: "monospace", height: 48 }} onClick={() => copy(tokens.previous)}>
                {tokens.previous}
              </Button>
              <Button type="primary" style={{ flex: 1, borderLeft: "1px solid #d9d9d9", borderRight: "1px solid #d9d9d9", fontFamily: "monospace", fontSize: 20, height: 48 }} onClick={() => copy(tokens.current)}>
                {tokens.current}
              </Button>
              <Button style={{ flex: 1, borderRadius: 0, fontFamily: "monospace", height: 48 }} onClick={() => copy(tokens.next)}>
                {tokens.next}
              </Button>
            </div>
            <Progress percent={(100 * interval) / 30} showInfo={false} style={{ marginTop: 8 }} />
            <div style={{ textAlign: "center", fontSize: 14 }}>
              {t("tools.otp-generator.nextIn").replace("{seconds}", String(Math.floor(30 - interval)).padStart(2, "0"))}
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {qrDataUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={qrDataUrl} alt="QR Code" width={210} height={210} />
            )}
            <Button href={keyUri} target="_blank" rel="noopener noreferrer">
              {t("tools.otp-generator.openKeyUri")}
            </Button>
          </div>
        </Card>
      </div>
      <div style={{ maxWidth: 350, display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <Form layout="vertical">
            <Form.Item>
              <InputCopyable
                value={base32toHex(secret)}
                readOnly
                label={t("tools.otp-generator.secretHex")}
                placeholder={t("tools.otp-generator.secretHexPlaceholder")}
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>
            <Form.Item>
              <InputCopyable
                value={String(Math.floor(now / 1000))}
                readOnly
                label={t("tools.otp-generator.epoch")}
                placeholder={t("tools.otp-generator.epochPlaceholder")}
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>
            <Form.Item>
              <InputCopyable
                value={String(getCounterFromTime(now, 30))}
                readOnly
                label={t("tools.otp-generator.iterationCount")}
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <InputCopyable
                value={getCounterFromTime(now, 30).toString(16).padStart(16, "0")}
                readOnly
                label={t("tools.otp-generator.countPaddedHex")}
                style={{ fontFamily: "monospace" }}
              />
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
