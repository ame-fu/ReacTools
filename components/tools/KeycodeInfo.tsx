"use client";

import React from "react";
import { Card, Form } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

export function KeycodeInfo() {
  const { t } = useI18n();
  const [event, setEvent] = React.useState<KeyboardEvent | null>(null);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => setEvent(e);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const fields = React.useMemo(() => {
    if (!event) return [];
    return [
      { label: t("tools.keycode-info.key"), value: event.key },
      { label: t("tools.keycode-info.keycode"), value: String(event.keyCode) },
      { label: t("tools.keycode-info.code"), value: event.code },
      { label: t("tools.keycode-info.location"), value: String(event.location) },
      {
        label: t("tools.keycode-info.modifiers"),
        value: [event.metaKey && "Meta", event.shiftKey && "Shift", event.ctrlKey && "Ctrl", event.altKey && "Alt"].filter(Boolean).join(" + ") || "None",
      },
    ];
  }, [event, t]);

  return (
    <div>
      <Card style={{ textAlign: "center", padding: "48px 24px", marginBottom: 16 }}>
        {event ? <div style={{ fontSize: 32, marginBottom: 8 }}>{event.key}</div> : null}
        <span style={{ opacity: 0.7 }}>{t("tools.keycode-info.pressHint")}</span>
      </Card>
      {fields.length > 0 && (
        <Form layout="vertical">
          {fields.map(({ label, value }, i) => (
            <Form.Item key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <label style={{ width: 150, flexShrink: 0, textAlign: "right", fontSize: 14 }}>{label}</label>
                <InputCopyable
                  value={value}
                  readOnly
                  style={{ fontFamily: "monospace", flex: 1 }}
                />
              </div>
            </Form.Item>
          ))}
        </Form>
      )}
    </div>
  );
}
