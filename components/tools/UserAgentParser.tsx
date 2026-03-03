"use client";

import React from "react";
import { Card, Form } from "antd";
import { UAParser } from "ua-parser-js";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

const sections = [
  {
    headingKey: "browser",
    content: [
      { label: "Name", getValue: (r: UAParser.IResult) => r.browser.name, undefinedFallback: "No browser name available" },
      { label: "Version", getValue: (r: UAParser.IResult) => r.browser.version, undefinedFallback: "No browser version available" },
    ],
  },
  {
    headingKey: "engine",
    content: [
      { label: "Name", getValue: (r: UAParser.IResult) => r.engine.name, undefinedFallback: "No engine name available" },
      { label: "Version", getValue: (r: UAParser.IResult) => r.engine.version, undefinedFallback: "No engine version available" },
    ],
  },
  {
    headingKey: "os",
    content: [
      { label: "Name", getValue: (r: UAParser.IResult) => r.os.name, undefinedFallback: "No OS name available" },
      { label: "Version", getValue: (r: UAParser.IResult) => r.os.version, undefinedFallback: "No OS version available" },
    ],
  },
  {
    headingKey: "device",
    content: [
      { label: "Model", getValue: (r: UAParser.IResult) => r.device.model, undefinedFallback: "No device model available" },
      { label: "Type", getValue: (r: UAParser.IResult) => r.device.type, undefinedFallback: "No device type available" },
      { label: "Vendor", getValue: (r: UAParser.IResult) => r.device.vendor, undefinedFallback: "No device vendor available" },
    ],
  },
  {
    headingKey: "cpu",
    content: [
      { label: "Architecture", getValue: (r: UAParser.IResult) => r.cpu.architecture, undefinedFallback: "No CPU architecture available" },
    ],
  },
];

function getUserAgentInfo(ua: string): UAParser.IResult {
  if (ua.trim().length === 0) {
    return { ua: "", browser: {}, cpu: {}, device: {}, engine: {}, os: {} } as UAParser.IResult;
  }
  return new UAParser(ua.trim()).getResult();
}

export function UserAgentParser() {
  const { t } = useI18n();
  const [ua, setUa] = React.useState(typeof navigator !== "undefined" ? navigator.userAgent : "");
  const result = React.useMemo(() => {
    try {
      return getUserAgentInfo(ua);
    } catch {
      return undefined;
    }
  }, [ua]);

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item>
            <InputCopyable
              value={ua}
              onChange={setUa}
              label={t("tools.user-agent-parser.inputLabel")}
              placeholder={t("tools.user-agent-parser.inputPlaceholder")}
              multiline
              rows={2}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        </Form>
      </Card>
      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {sections.map((section) => (
            <Card key={section.headingKey} title={t(`tools.user-agent-parser.${section.headingKey}`)} size="small">
              <dl style={{ margin: 0 }}>
                {section.content.map(({ label, getValue, undefinedFallback }) => (
                  <div key={label} style={{ marginBottom: 8 }}>
                    <dt style={{ fontSize: 14, opacity: 0.8, marginBottom: 2 }}>{label}</dt>
                    <dd style={{ margin: 0, fontFamily: "monospace" }}>{getValue(result) ?? undefinedFallback}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
