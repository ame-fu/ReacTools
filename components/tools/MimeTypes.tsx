"use client";

import React from "react";
import { Card, Select, Table, Tag } from "antd";
import { types as extensionToMimeType, extensions as mimeTypeToExtension } from "mime-types";
import { useI18n } from "@/lib/i18n/context";

const mimeToExtensionsOptions = Object.keys(mimeTypeToExtension).map((label) => ({ label, value: label }));
const extensionToMimeTypeOptions = Object.keys(extensionToMimeType).map((ext) => ({
  label: `.${ext}`,
  value: ext,
}));

const mimeInfos = Object.entries(mimeTypeToExtension).map(([mimeType, extensions]) => ({ mimeType, extensions }));

export function MimeTypes() {
  const { t } = useI18n();
  const [selectedMimeType, setSelectedMimeType] = React.useState<string | undefined>(undefined);
  const [selectedExtension, setSelectedExtension] = React.useState<string | undefined>(undefined);

  const extensionsFound = React.useMemo(() => {
    if (!selectedMimeType) return [];
    const v = mimeTypeToExtension[selectedMimeType];
    return Array.isArray(v) ? v : v ? [v] : [];
  }, [selectedMimeType]);
  const mimeTypeFound = selectedExtension ? (extensionToMimeType[selectedExtension] ?? "") : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 0 }}>{t("tools.mime-types.mimeToExt")}</h2>
        <p style={{ opacity: 0.8, fontSize: 14 }}>{t("tools.mime-types.mimeToExtDesc")}</p>
        <Select
          placeholder={t("tools.mime-types.mimePlaceholder")}
          value={selectedMimeType}
          onChange={setSelectedMimeType}
          options={mimeToExtensionsOptions}
          showSearch
          filterOption={(input, opt) => (opt?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          style={{ width: "100%", margin: "16px 0" }}
          allowClear
        />
        {extensionsFound.length > 0 && (
          <div>
            {t("tools.mime-types.extensionsOf")} <Tag>{selectedMimeType}</Tag> {t("tools.mime-types.mimeType")}:
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {extensionsFound.map((ext) => (
                <Tag key={ext} color="blue">
                  .{ext}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </Card>
      <Card>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 0 }}>{t("tools.mime-types.extToMime")}</h2>
        <p style={{ opacity: 0.8, fontSize: 14 }}>{t("tools.mime-types.extToMimeDesc")}</p>
        <Select
          placeholder={t("tools.mime-types.extPlaceholder")}
          value={selectedExtension}
          onChange={setSelectedExtension}
          options={extensionToMimeTypeOptions}
          showSearch
          filterOption={(input, opt) => (opt?.label ?? "").toLowerCase().includes(input.toLowerCase())}
          style={{ width: "100%", margin: "16px 0" }}
          allowClear
        />
        {selectedExtension && (
          <div>
            {t("tools.mime-types.mimeAssociated")} <Tag>{selectedExtension}</Tag>:
            <div style={{ marginTop: 8 }}>
              <Tag color="blue">{mimeTypeFound}</Tag>
            </div>
          </div>
        )}
      </Card>
      <div>
        <Table
          dataSource={mimeInfos}
          rowKey="mimeType"
          pagination={{ pageSize: 15 }}
          size="small"
          columns={[
            { title: t("tools.mime-types.mimeTypes"), dataIndex: "mimeType", key: "mimeType", width: "40%" },
            {
              title: t("tools.mime-types.extensions"),
              dataIndex: "extensions",
              key: "extensions",
              render: (exts: string[]) => (
                <span style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {exts.map((e) => (
                    <Tag key={e}>.{e}</Tag>
                  ))}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
