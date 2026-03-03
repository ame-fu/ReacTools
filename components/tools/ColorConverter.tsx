"use client";

import React from "react";
import { Card, Input, ColorPicker } from "antd";
import type { Color } from "antd/es/color-picker";
import { colord, extend, type Colord } from "colord";
import cmykPlugin from "colord/plugins/cmyk";
import hwbPlugin from "colord/plugins/hwb";
import namesPlugin from "colord/plugins/names";
import lchPlugin from "colord/plugins/lch";
import { useI18n } from "@/lib/i18n/context";

extend([cmykPlugin, hwbPlugin, namesPlugin, lchPlugin]);

type FieldKey = "hex" | "rgb" | "hsl" | "hwb" | "lch" | "cmyk" | "name";

type ColordWithPlugins = Colord & {
  toHwbString?: () => string;
  toLchString?: () => string;
  toCmykString?: () => string;
};

function formatters(value: Colord) {
  const v = value as ColordWithPlugins;
  return {
    hex: value.toHex(),
    rgb: value.toRgbString(),
    hsl: value.toHslString(),
    hwb: v.toHwbString?.() ?? value.toHslString(),
    lch: v.toLchString?.() ?? value.toHslString(),
    cmyk: v.toCmykString?.() ?? value.toRgbString(),
    name: value.toName({ closest: true }) ?? "Unknown",
  };
}

function ColorConverterRow({
  labelKey,
  children,
  t,
}: {
  labelKey: string;
  children: React.ReactNode;
  t: (key: string) => string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 8 }}>
      <div style={{ width: 120, textAlign: "right", opacity: 0.85 }}>
        {t(labelKey)}:
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

export function ColorConverter() {
  const { t } = useI18n();
  const [base, setBase] = React.useState<Colord>(() =>
    colord("#1677ff"),
  );
  const [fields, setFields] = React.useState(() => formatters(base));
  const [invalid, setInvalid] = React.useState<Partial<Record<FieldKey, boolean>>>({});

  React.useEffect(() => {
    setFields(formatters(base));
    setInvalid({});
  }, [base]);

  const updateFromText = (key: FieldKey, value: string) => {
    if (key === "name") return;
    const parsed = colord(value);
    if (!parsed.isValid()) {
      setInvalid((prev) => ({ ...prev, [key]: true }));
      return;
    }
    setInvalid((prev) => ({ ...prev, [key]: false }));
    setBase(parsed);
  };

  const updateFromPicker = (_color: Color, hex: string) => {
    const parsed = colord(hex);
    if (parsed.isValid()) setBase(parsed);
  };

  return (
    <Card>
      <ColorConverterRow labelKey="tools.color-converter.labels.picker" t={t}>
        <ColorPicker
          value={fields.hex}
          onChange={updateFromPicker}
          showText
        />
      </ColorConverterRow>

      <ColorConverterRow labelKey="tools.color-converter.labels.hex" t={t}>
        <Input
          value={fields.hex}
          onChange={(e) => {
            const v = e.target.value;
            setFields((prev) => ({ ...prev, hex: v }));
            updateFromText("hex", v);
          }}
          placeholder={t("tools.color-converter.placeholders.hex")}
          status={invalid.hex ? "error" : undefined}
        />
      </ColorConverterRow>

      <ColorConverterRow labelKey="tools.color-converter.labels.rgb" t={t}>
        <Input
          value={fields.rgb}
          onChange={(e) => {
            const v = e.target.value;
            setFields((prev) => ({ ...prev, rgb: v }));
            updateFromText("rgb", v);
          }}
          placeholder={t("tools.color-converter.placeholders.rgb")}
          status={invalid.rgb ? "error" : undefined}
        />
      </ColorConverterRow>

      <ColorConverterRow labelKey="tools.color-converter.labels.hsl" t={t}>
        <Input
          value={fields.hsl}
          onChange={(e) => {
            const v = e.target.value;
            setFields((prev) => ({ ...prev, hsl: v }));
            updateFromText("hsl", v);
          }}
          placeholder={t("tools.color-converter.placeholders.hsl")}
          status={invalid.hsl ? "error" : undefined}
        />
      </ColorConverterRow>

      <ColorConverterRow labelKey="tools.color-converter.labels.hwb" t={t}>
        <Input
          value={fields.hwb}
          onChange={(e) => {
            const v = e.target.value;
            setFields((prev) => ({ ...prev, hwb: v }));
            updateFromText("hwb", v);
          }}
          placeholder={t("tools.color-converter.placeholders.hwb")}
          status={invalid.hwb ? "error" : undefined}
        />
      </ColorConverterRow>

      <ColorConverterRow labelKey="tools.color-converter.labels.lch" t={t}>
        <Input
          value={fields.lch}
          onChange={(e) => {
            const v = e.target.value;
            setFields((prev) => ({ ...prev, lch: v }));
            updateFromText("lch", v);
          }}
          placeholder={t("tools.color-converter.placeholders.lch")}
          status={invalid.lch ? "error" : undefined}
        />
      </ColorConverterRow>

      <ColorConverterRow labelKey="tools.color-converter.labels.cmyk" t={t}>
        <Input
          value={fields.cmyk}
          onChange={(e) => {
            const v = e.target.value;
            setFields((prev) => ({ ...prev, cmyk: v }));
            updateFromText("cmyk", v);
          }}
          placeholder={t("tools.color-converter.placeholders.cmyk")}
          status={invalid.cmyk ? "error" : undefined}
        />
      </ColorConverterRow>

      <ColorConverterRow labelKey="tools.color-converter.labels.name" t={t}>
        <Input
          value={fields.name}
          readOnly
          placeholder={t("tools.color-converter.placeholders.name")}
        />
      </ColorConverterRow>
    </Card>
  );
}

