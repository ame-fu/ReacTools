"use client";

import React from "react";
import { Card, Select, InputNumber, Button, Form } from "antd";
import {
  v1 as generateUuidV1,
  v3 as generateUuidV3,
  v4 as generateUuidV4,
  v5 as generateUuidV5,
  NIL as nilUuid,
} from "uuid";
import { InputCopyable, TextareaCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const VERSIONS = ["NIL", "v1", "v3", "v4", "v5"] as const;
type Version = (typeof VERSIONS)[number];

const NAMESPACES: Record<string, string> = {
  DNS: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  URL: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  OID: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  X500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
};

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string) {
  if (value === nilUuid) return true;
  return uuidRegex.test(value);
}

export function UuidGenerator() {
  const { t } = useI18n();
  const [version, setVersion] = React.useState<Version>("v4");
  const [count, setCount] = React.useState(1);
  const [namespace, setNamespace] = React.useState(NAMESPACES.URL);
  const [name, setName] = React.useState("");
  const [uuids, setUuids] = React.useState("");

  const regenerate = React.useCallback(() => {
    const list = Array.from({ length: count }, (_, index) => {
      switch (version) {
        case "NIL":
          return nilUuid;
        case "v1":
          return generateUuidV1({
            clockseq: index,
            msecs: Date.now(),
            nsecs: Math.floor(Math.random() * 10000),
            node: new Uint8Array(
              Array.from({ length: 6 }, () =>
                Math.floor(Math.random() * 256),
              ),
            ),
          });
        case "v3":
          return generateUuidV3(name || " ", namespace);
        case "v4":
          return generateUuidV4();
        case "v5":
          return generateUuidV5(name || " ", namespace);
        default:
          return generateUuidV4();
      }
    });
    setUuids(list.join("\n"));
  }, [count, name, namespace, version]);

  React.useEffect(() => {
    regenerate();
  }, [regenerate]);

  const namespaceValid = isValidUuid(namespace);

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 8 }}>{t("tools.uuid-generator.version")}</div>
        <Form layout="vertical">
          <Form.Item>
            <Select<Version>
              value={version}
              onChange={setVersion}
              options={VERSIONS.map((v) => ({ label: v, value: v }))}
              style={{ width: 120 }}
            />
          </Form.Item>

          <Form.Item label={t("tools.uuid-generator.quantity")}>
            <InputNumber
              value={count}
              onChange={(v) => setCount(v ?? 1)}
              min={1}
              max={50}
              style={{ width: "100%" }}
            />
          </Form.Item>

          {(version === "v3" || version === "v5") && (
            <>
              <Form.Item label={t("tools.uuid-generator.namespacePreset")}>
                <Select<string>
                  value={
                    Object.entries(NAMESPACES).find(([, v]) => v === namespace)?.[0] ??
                    ""
                  }
                  onChange={(key) => setNamespace(NAMESPACES[key] ?? namespace)}
                  options={Object.entries(NAMESPACES).map(([k, v]) => ({
                    label: `${k} (${v.slice(0, 8)}...)`,
                    value: k,
                  }))}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item label={t("tools.uuid-generator.namespaceCustom")}>
                <InputCopyable
                  value={namespace}
                  onChange={setNamespace}
                  placeholder={t("tools.uuid-generator.namespacePlaceholder")}
                  status={namespaceValid ? undefined : "error"}
                />
              </Form.Item>
              <Form.Item label={t("tools.uuid-generator.name")} style={{ marginBottom: 16 }}>
                <InputCopyable
                  value={name}
                  onChange={setName}
                  placeholder={t("tools.uuid-generator.namePlaceholder")}
                />
              </Form.Item>
            </>
          )}

          <Form.Item style={{ marginBottom: 16 }}>
            <TextareaCopyable
              value={uuids}
              rows={4}
              style={{
                textAlign: "center",
                fontFamily: "monospace",
              }}
            />
          </Form.Item>
        </Form>

        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <Button onClick={regenerate}>{t("common.refresh")}</Button>
        </div>
      </Card>
    </div>
  );
}
