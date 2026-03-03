"use client";

import React from "react";
import { Card, InputNumber, Button } from "antd";
import { pki } from "node-forge";
import { TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

interface KeyPairResult {
  publicKeyPem: string;
  privateKeyPem: string;
}

function generateKeyPair(bits: number): Promise<KeyPairResult> {
  return new Promise((resolve, reject) => {
    pki.rsa.generateKeyPair({ bits }, (err, keyPair) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        publicKeyPem: pki.publicKeyToPem(keyPair.publicKey),
        privateKeyPem: pki.privateKeyToPem(keyPair.privateKey),
      });
    });
  });
}

export function RsaKeyPairGenerator() {
  const { t } = useI18n();
  const [bits, setBits] = React.useState(2048);
  const [certs, setCerts] = React.useState<KeyPairResult>({
    publicKeyPem: "",
    privateKeyPem: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const bitsValid =
    bits >= 256 && bits <= 16384 && bits % 8 === 0;

  const regenerate = React.useCallback(async () => {
    if (!bitsValid) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateKeyPair(bits);
      setCerts(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate key pair");
      setCerts({ publicKeyPem: "", privateKeyPem: "" });
    } finally {
      setLoading(false);
    }
  }, [bits, bitsValid]);

  React.useEffect(() => {
    if (bitsValid) void regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
  }, []);

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto",
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span style={{ marginRight: 8 }}>{t("tools.rsa-key-pair-generator.bits")}:</span>
            <InputNumber
              value={bits}
              onChange={(v) => setBits(v ?? 2048)}
              min={256}
              max={16384}
              step={8}
              status={bitsValid ? undefined : "error"}
            />
          </div>
          <Button onClick={regenerate} loading={loading} disabled={!bitsValid}>
            {t("tools.rsa-key-pair-generator.refreshKeyPair")}
          </Button>
        </div>
        {!bitsValid && (
          <div style={{ color: "#ff4d4f", marginTop: 8 }}>
            {t("tools.rsa-key-pair-generator.bitsError")}
          </div>
        )}
        {error && (
          <div style={{ color: "#ff4d4f", marginTop: 8 }}>{error}</div>
        )}
      </Card>

      <Card title={t("tools.rsa-key-pair-generator.publicKey")} style={{ marginBottom: 16 }}>
        <TextareaCopyable
          value={certs.publicKeyPem}
          rows={8}
          style={{ fontFamily: "monospace", fontSize: 12 }}
        />
      </Card>

      <Card title={t("tools.rsa-key-pair-generator.privateKey")}>
        <TextareaCopyable
          value={certs.privateKeyPem}
          rows={12}
          style={{ fontFamily: "monospace", fontSize: 12 }}
        />
      </Card>
    </div>
  );
}
