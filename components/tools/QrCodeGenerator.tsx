"use client";

import React from "react";
import { Button, Card, Col, Form, Input, Row, Select } from "antd";
import QRCode, {
  type QRCodeErrorCorrectionLevel,
  type QRCodeToDataURLOptions,
} from "qrcode";
import { InputCopyable } from "@/components/ui";

type Level = "low" | "medium" | "quartile" | "high";

const LEVEL_MAP: Record<Level, QRCodeErrorCorrectionLevel> = {
  low: "L",
  medium: "M",
  quartile: "Q",
  high: "H",
};

async function generateQrCode(
  text: string,
  foreground: string,
  background: string,
  level: Level,
  options?: QRCodeToDataURLOptions,
): Promise<string> {
  if (!text.trim()) return "";
  return QRCode.toDataURL(text.trim(), {
    color: {
      dark: foreground,
      light: background,
      ...(options?.color ?? {}),
    },
    errorCorrectionLevel: LEVEL_MAP[level],
    ...options,
  });
}

export function QrCodeGenerator() {
  const [foreground, setForeground] = React.useState("#000000ff");
  const [background, setBackground] = React.useState("#ffffffff");
  const [level, setLevel] = React.useState<Level>("medium");
  const [text, setText] = React.useState("https://it-tools.tech");
  const [qr, setQr] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const regenerate = React.useCallback(async () => {
    setLoading(true);
    try {
      const dataUrl = await generateQrCode(
        text,
        foreground,
        background,
        level,
        { width: 1024 },
      );
      setQr(dataUrl);
    } catch {
      setQr("");
    } finally {
      setLoading(false);
    }
  }, [background, foreground, level, text]);

  React.useEffect(() => {
    void regenerate();
  }, [regenerate]);

  const download = React.useCallback(() => {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = "qr-code.png";
    a.click();
  }, [qr]);

  return (
    <Card>
      <Form layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Form.Item label="Text">
              <InputCopyable
                value={text}
                onChange={setText}
                placeholder="Your link or text..."
                multiline
                rows={2}
              />
            </Form.Item>

            <Form.Item label="Foreground color">
              <Input
                type="color"
                value={foreground.slice(0, 7)}
                onChange={(e) =>
                  setForeground(`${e.target.value}${foreground.slice(7) || "ff"}`)
                }
                style={{ width: 80, padding: 0, border: "none" }}
              />
            </Form.Item>

            <Form.Item label="Background color">
              <Input
                type="color"
                value={background.slice(0, 7)}
                onChange={(e) =>
                  setBackground(`${e.target.value}${background.slice(7) || "ff"}`)
                }
                style={{ width: 80, padding: 0, border: "none" }}
              />
            </Form.Item>

            <Form.Item label="Error resistance">
              <Select<Level>
                value={level}
                onChange={(v) => setLevel(v)}
                options={[
                  { label: "low", value: "low" },
                  { label: "medium", value: "medium" },
                  { label: "quartile", value: "quartile" },
                  { label: "high", value: "high" },
                ]}
                style={{ width: 200 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Preview">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {qr ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr} alt="qr-code" width={200} />
                ) : (
                  <div style={{ opacity: 0.6 }}>No QR code</div>
                )}
                <Button
                  type="primary"
                  onClick={download}
                  disabled={!qr}
                  loading={loading}
                >
                  Download qr-code
                </Button>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

