"use client";

import React from "react";
import {
  Card,
  Input,
  Button,
  Divider,
  Upload,
  UploadProps,
  Alert,
} from "antd";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function isValidBase64(str: string): boolean {
  if (!str) return false;
  try {
    // atob 会在非法时抛错
    // 同时允许带 data: 前缀
    const cleaned = str.trim();
    const base64 = cleaned.includes(",") ? cleaned.split(",")[1] : cleaned;
    window.atob(base64);
    return true;
  } catch {
    return false;
  }
}

function getMimeTypeFromBase64(base64String: string): string | undefined {
  const match = base64String.match(/^data:(.+?);base64,/);
  return match?.[1];
}

function getExtensionFromMimeType(mimeType: string): string | undefined {
  if (!mimeType) return undefined;
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "application/pdf": "pdf",
    "text/plain": "txt",
  };
  return map[mimeType] ?? mimeType.split("/")[1];
}

export function Base64FileConverter() {
  const { t } = useI18n();
  const [fileName, setFileName] = React.useState("file");
  const [fileExtension, setFileExtension] = React.useState("");
  const [base64Input, setBase64Input] = React.useState("");
  const [b64Error, setB64Error] = React.useState<string | null>(null);
  const [fileBase64, setFileBase64] = React.useState("");

  React.useEffect(() => {
    if (!base64Input.trim()) {
      setB64Error(null);
      return;
    }
    const valid = isValidBase64(base64Input.trim());
    setB64Error(valid ? null : "Invalid base 64 string");
    if (valid) {
      const mimeType = getMimeTypeFromBase64(base64Input.trim());
      if (mimeType) {
        const ext = getExtensionFromMimeType(mimeType);
        if (ext) {
          setFileExtension((prev) => prev || ext);
        }
      }
    }
  }, [base64Input]);

  const handlePreview = () => {
    if (b64Error || !base64Input.trim()) return;
    try {
      const cleaned = base64Input.trim();
      const src = cleaned.startsWith("data:")
        ? cleaned
        : `data:image/*;base64,${cleaned}`;
      const img = new Image();
      img.src = src;
      img.style.maxWidth = "100%";
      img.style.maxHeight = "400px";
      const container = document.getElementById("previewContainer");
      if (container) {
        container.innerHTML = "";
        container.appendChild(img);
      }
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    if (b64Error || !base64Input.trim()) return;
    try {
      const cleaned = base64Input.trim();
      const parts = cleaned.split(",");
      const base64Data = parts.length > 1 ? parts[1] : parts[0];
      const mimeType =
        getMimeTypeFromBase64(cleaned) ?? "application/octet-stream";
      const byteCharacters = window.atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i += 1) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ext = fileExtension || getExtensionFromMimeType(mimeType) || "bin";
      a.href = url;
      a.download = `${fileName || "file"}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    showUploadList: false,
    customRequest: () => {},
    onChange(info) {
      const file = info.file.originFileObj as File | undefined;
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setFileBase64(result);
        }
      };
      reader.readAsDataURL(file);
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card title={t("tools.base64-file-converter.base64ToFile")}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ marginBottom: 4 }}>{t("tools.base64-file-converter.fileName")}</div>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder={t("tools.base64-file-converter.fileNamePlaceholder")}
            />
          </div>
          <div>
            <div style={{ marginBottom: 4 }}>{t("tools.base64-file-converter.extension")}</div>
            <Input
              value={fileExtension}
              onChange={(e) => setFileExtension(e.target.value)}
              placeholder={t("tools.base64-file-converter.extensionPlaceholder")}
            />
          </div>
        </div>

        <InputCopyable
          value={base64Input}
          onChange={(v) => setBase64Input(v)}
          multiline
          rows={5}
          placeholder={t("tools.base64-file-converter.base64Placeholder")}
        />

        {b64Error && (
          <Alert
            style={{ marginTop: 8 }}
            type="error"
            title={b64Error}
            showIcon
          />
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "16px 0",
          }}
        >
          <div id="previewContainer" />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Button
            disabled={!base64Input || !!b64Error}
            onClick={handlePreview}
          >
            {t("tools.base64-file-converter.previewImage")}
          </Button>
          <Button
            disabled={!base64Input || !!b64Error}
            onClick={handleDownload}
          >
            {t("tools.base64-file-converter.downloadFile")}
          </Button>
        </div>
      </Card>

      <Card title={t("tools.base64-file-converter.fileToBase64")}>
        <Upload.Dragger {...uploadProps}>
          <p className="ant-upload-text">
            {t("tools.base64-file-converter.uploadHint")}
          </p>
        </Upload.Dragger>

        <Divider />

        <TextareaCopyable
          value={fileBase64}
          rows={5}
          placeholder={t("tools.base64-file-converter.fileOutputPlaceholder")}
          style={{ margin: "8px 0" }}
        />
      </Card>
    </div>
  );
}

