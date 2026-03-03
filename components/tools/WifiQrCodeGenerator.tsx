"use client";

import React from "react";
import { Button, Card, Checkbox, Col, Form, Input, Row, Select } from "antd";
import QRCode, { type QRCodeToDataURLOptions } from "qrcode";

const wifiEncryptions = ["nopass", "WPA", "WEP", "WPA2-EAP"] as const;
type WifiEncryption = (typeof wifiEncryptions)[number];

const ENCRYPTION_OPTIONS: { label: string; value: WifiEncryption }[] =
  wifiEncryptions.map((v) => ({
    label: v === "nopass" ? "No password" : v === "WPA" ? "WPA/WPA2" : v,
    value: v,
  }));

const EAPMethods = [
  "MD5",
  "POTP",
  "GTC",
  "TLS",
  "IKEv2",
  "SIM",
  "AKA",
  "AKA'",
  "TTLS",
  "PWD",
  "LEAP",
  "PSK",
  "FAST",
  "TEAP",
  "EKE",
  "NOOB",
  "PEAP",
] as const;
type EAPMethod = (typeof EAPMethods)[number];

const EAPPhase2Methods = ["None", "MSCHAPV2"] as const;
type EAPPhase2Method = (typeof EAPPhase2Methods)[number];

function escapeString(str: string) {
  return str.replace(/([\\;,:"])/g, "\\$1");
}

interface GetQrCodeTextOptions {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  eapMethod: EAPMethod | undefined;
  isHiddenSSID: boolean;
  eapAnonymous: boolean;
  eapIdentity: string;
  eapPhase2Method: EAPPhase2Method | undefined;
}

function getQrCodeText(options: GetQrCodeTextOptions): string | null {
  const {
    ssid,
    password,
    encryption,
    eapMethod,
    isHiddenSSID,
    eapAnonymous,
    eapIdentity,
    eapPhase2Method,
  } = options;
  if (!ssid) return null;

  if (encryption === "nopass") {
    return `WIFI:S:${escapeString(ssid)};;`;
  }

  if (encryption !== "WPA2-EAP" && password) {
    return `WIFI:S:${escapeString(ssid)};T:${encryption};P:${escapeString(
      password,
    )};${isHiddenSSID ? "H:true" : ""};`;
  }

  if (encryption === "WPA2-EAP" && password && eapMethod) {
    if (!eapIdentity && !eapAnonymous) {
      return null;
    }
    if (eapMethod === "PEAP" && !eapPhase2Method) {
      return null;
    }

    const identity = eapAnonymous
      ? "A:anon"
      : `I:${escapeString(eapIdentity)}`;
    const phase2 =
      eapPhase2Method && eapPhase2Method !== "None"
        ? `PH2:${eapPhase2Method};`
        : "";

    return `WIFI:S:${escapeString(ssid)};T:WPA2-EAP;P:${escapeString(
      password,
    )};E:${eapMethod};${phase2}${identity};${
      isHiddenSSID ? "H:true" : ""
    };`;
  }

  return null;
}

async function generateWifiQr(
  text: string | null,
  foreground: string,
  background: string,
  options?: QRCodeToDataURLOptions,
): Promise<string> {
  if (!text) return "";
  return QRCode.toDataURL(text.trim(), {
    color: {
      dark: foreground,
      light: background,
      ...(options?.color ?? {}),
    },
    errorCorrectionLevel: "M",
    ...options,
  });
}

export function WifiQrCodeGenerator() {
  const [foreground, setForeground] = React.useState("#000000ff");
  const [background, setBackground] = React.useState("#ffffffff");

  const [ssid, setSsid] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [encryption, setEncryption] = React.useState<WifiEncryption>("WPA");
  const [isHiddenSSID, setIsHiddenSSID] = React.useState(false);
  const [eapAnonymous, setEapAnonymous] = React.useState(false);
  const [eapIdentity, setEapIdentity] = React.useState("");
  const [eapMethod, setEapMethod] = React.useState<EAPMethod | undefined>();
  const [eapPhase2Method, setEapPhase2Method] =
    React.useState<EAPPhase2Method | undefined>();

  const [qr, setQr] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const regenerate = React.useCallback(async () => {
    setLoading(true);
    try {
      const text = getQrCodeText({
        ssid,
        password,
        encryption,
        eapMethod,
        isHiddenSSID,
        eapAnonymous,
        eapIdentity,
        eapPhase2Method,
      });
      const dataUrl = await generateWifiQr(text, foreground, background, {
        width: 1024,
      });
      setQr(dataUrl);
    } catch {
      setQr("");
    } finally {
      setLoading(false);
    }
  }, [
    background,
    eapAnonymous,
    eapIdentity,
    eapMethod,
    eapPhase2Method,
    encryption,
    foreground,
    isHiddenSSID,
    password,
    ssid,
  ]);

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

  const showPassword = encryption !== "nopass";
  const showEap = encryption === "WPA2-EAP";

  return (
    <Card>
      <Form layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Form.Item label="Encryption method">
              <Select<WifiEncryption>
                value={encryption}
                onChange={(v) => setEncryption(v)}
                style={{ width: 220 }}
                options={ENCRYPTION_OPTIONS}
              />
            </Form.Item>

            <Form.Item label="SSID">
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <Input
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="Your WiFi SSID..."
                  style={{ flex: 1, minWidth: 160 }}
                />
                <Checkbox
                  checked={isHiddenSSID}
                  onChange={(e) => setIsHiddenSSID(e.target.checked)}
                >
                  Hidden SSID
                </Checkbox>
              </div>
            </Form.Item>

            {showPassword && (
              <Form.Item label="Password">
                <Input.Password
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your WiFi Password..."
                />
              </Form.Item>
            )}

            {showEap && (
              <>
                <Form.Item label="EAP method">
                  <Select<EAPMethod>
                    value={eapMethod}
                    onChange={(v) => setEapMethod(v)}
                    style={{ width: "100%", minWidth: 200 }}
                    options={EAPMethods.map((m) => ({
                      label: m,
                      value: m,
                    }))}
                    allowClear
                    showSearch
                  />
                </Form.Item>

                <Form.Item label="Identity">
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <Input
                      value={eapIdentity}
                      onChange={(e) => setEapIdentity(e.target.value)}
                      placeholder="Your EAP Identity..."
                      style={{ flex: 1, minWidth: 160 }}
                    />
                    <Checkbox
                      checked={eapAnonymous}
                      onChange={(e) => setEapAnonymous(e.target.checked)}
                    >
                      Anonymous?
                    </Checkbox>
                  </div>
                </Form.Item>

                <Form.Item label="EAP Phase 2 method">
                  <Select<EAPPhase2Method>
                    value={eapPhase2Method}
                    onChange={(v) => setEapPhase2Method(v)}
                    style={{ width: "100%", minWidth: 200 }}
                    options={EAPPhase2Methods.map((m) => ({
                      label: m,
                      value: m,
                    }))}
                    allowClear
                    showSearch
                  />
                </Form.Item>
              </>
            )}

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
          </Col>

          <Col xs={24} md={8}>
            {qr && (
              <Form.Item label="Preview">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr} alt="wifi-qrcode" width={200} />
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
            )}
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

