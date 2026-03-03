"use client";

import React from "react";
import { Card, Upload, Alert, Descriptions, Collapse } from "antd";
import type { UploadProps } from "antd";
import { TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

interface SignatureInfo {
  verified: boolean;
  authenticity: boolean;
  integrity: boolean;
  expired: boolean;
  meta: {
    certs: Array<{
      clientCertificate?: boolean;
      issuedBy: {
        commonName: string;
        organizationalUnitName?: string;
        organizationName: string;
        countryName?: string;
        localityName?: string;
        stateOrProvinceName?: string;
      };
      issuedTo: {
        commonName: string;
        serialNumber?: string;
        organizationalUnitName?: string;
        organizationName: string;
        countryName?: string;
        localityName?: string;
        stateOrProvinceName?: string;
      };
      validityPeriod: {
        notBefore: string;
        notAfter: string;
      };
      pemCertificate: string;
    }>;
    signatureMeta: {
      reason: string;
      contactInfo: string | null;
      location: string;
      name: string | null;
    };
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function PdfSignatureChecker() {
  const { t } = useI18n();
  const [signatures, setSignatures] = React.useState<SignatureInfo[]>([]);
  const [status, setStatus] = React.useState<
    "idle" | "parsed" | "error" | "loading"
  >("idle");
  const [file, setFile] = React.useState<File | null>(null);

  const handleUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setStatus("loading");
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      const res = await fetch("/api/verify-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setSignatures([]);
        setStatus("error");
      } else {
        setSignatures(Array.isArray(data.signatures) ? data.signatures : []);
        setStatus("parsed");
      }
    } catch {
      setSignatures([]);
      setStatus("error");
    }
    return false; // prevent default upload
  };

  const uploadProps: UploadProps = {
    accept: ".pdf",
    maxCount: 1,
    beforeUpload: handleUpload,
    showUploadList: false,
  };

  return (
    <div>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <Upload.Dragger {...uploadProps}>
          <p>{t("tools.pdf-signature-checker.uploadHint")}</p>
        </Upload.Dragger>

        {file && (
          <Card style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600 }}>{file.name}</div>
            <div>{formatBytes(file.size)}</div>
          </Card>
        )}

        {status === "error" && (
          <Alert
            style={{ marginTop: 16 }}
            message={t("tools.pdf-signature-checker.noSignatures")}
            type="warning"
          />
        )}
      </div>

      {status === "parsed" && signatures.length > 0 && (
        <div style={{ marginTop: 24 }}>
          {signatures.map((signature, index) => (
            <Card
              key={index}
              title={t("tools.pdf-signature-checker.signatureTitle").replace("{index}", String(index + 1))}
              style={{ marginBottom: 16 }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label={t("tools.pdf-signature-checker.verified")}>
                  {signature.verified ? t("tools.pdf-signature-checker.yes") : t("tools.pdf-signature-checker.no")}
                </Descriptions.Item>
                <Descriptions.Item label={t("tools.pdf-signature-checker.authenticity")}>
                  {signature.authenticity ? t("tools.pdf-signature-checker.yes") : t("tools.pdf-signature-checker.no")}
                </Descriptions.Item>
                <Descriptions.Item label={t("tools.pdf-signature-checker.integrity")}>
                  {signature.integrity ? t("tools.pdf-signature-checker.yes") : t("tools.pdf-signature-checker.no")}
                </Descriptions.Item>
                <Descriptions.Item label={t("tools.pdf-signature-checker.expired")}>
                  {signature.expired ? t("tools.pdf-signature-checker.yes") : t("tools.pdf-signature-checker.no")}
                </Descriptions.Item>
              </Descriptions>

              {signature.meta.certs.map((cert, certIndex) => (
                <Collapse
                  key={certIndex}
                  style={{ marginTop: 12 }}
                  items={[
                    {
                      key: certIndex,
                      label: t("tools.pdf-signature-checker.certificateTitle").replace("{index}", String(certIndex + 1)),
                      children: (
                        <div>
                          <Descriptions column={1} size="small">
                            <Descriptions.Item label={t("tools.pdf-signature-checker.validityNotBefore")}>
                              {new Date(
                                cert.validityPeriod.notBefore,
                              ).toLocaleString()}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("tools.pdf-signature-checker.validityNotAfter")}>
                              {new Date(
                                cert.validityPeriod.notAfter,
                              ).toLocaleString()}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("tools.pdf-signature-checker.issuedByCommonName")}>
                              {cert.issuedBy.commonName}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("tools.pdf-signature-checker.issuedByOrganization")}>
                              {cert.issuedBy.organizationName}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("tools.pdf-signature-checker.issuedToCommonName")}>
                              {cert.issuedTo.commonName}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("tools.pdf-signature-checker.issuedToOrganization")}>
                              {cert.issuedTo.organizationName}
                            </Descriptions.Item>
                          </Descriptions>
                          <div style={{ marginTop: 8 }}>
                            <TextareaCopyable
                              value={cert.pemCertificate}
                              rows={8}
                              label={t("tools.pdf-signature-checker.pemCertificate")}
                              style={{
                                fontSize: 11,
                                maxHeight: 200,
                                fontFamily: "monospace",
                              }}
                            />
                          </div>
                        </div>
                      ),
                    },
                  ]}
                />
              ))}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
