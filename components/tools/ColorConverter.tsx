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
import { InputCopyable } from "@/components/ui";

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

/** 标签在上方，与工具页表单规范一致 */
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
    <div style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 6, fontWeight: 500, opacity: 0.9 }}>
        {t(labelKey)}
      </div>
      {children}
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
        <InputCopyable
          value={fields.hex}
          onChange={(v) => {
            setFields((prev) => ({ ...prev, hex: v }));
            updateFromText("hex", v);
          }}
          placeholder={t("tools.color-converter.placeholders.hex")}
          status={invalid.hex ? "error" : undefined}
        />
      </ColorConverterRow>

      <ColorConverterRow labelKey="tools.color-converter.labels.rgb" t={t}>
        <InputCopyable
          value={fields.rgb}
          onChange={(v) => {
            setFields((prev) => ({ ...prev, rgb: v }));
            updateFromText("rgb", v);
          }}
          placeholder={t("tools.color-converter.placeholders.rgb")}
          status={invalid.rgb ? "error" : undefined}
        />
      </ColorConverterRow>

      <ColorConverterRow labelKey="tools.color-converter.labels.hsl" t={t}>
        <InputCopyable
          value={fields.hsl}
          onChange={(v) => {
            setFields((prev) => ({ ...prev, hsl: v }));
            updateFromText("hsl", v);
          }}
          placeholder={t("tools.color-converter.placeholders.hsl")}
          status={invalid.hsl ? "error" : undefined}
        />
      </ColorConverterRow>

      <ColorConverterRow labelKey="tools.color-converter.labels.hwb" t={t}>
        <InputCopyable
          value={fields.hwb}
          onChange={(v) => {
            setFields((prev) => ({ ...prev, hwb: v }));
            updateFromText("hwb", v);
          }}
          placeholder={t("tools.color-converter.placeholders.hwb")}
          status={invalid.hwb ? "error" : undefined}
        />
      </ColorConverterRow>

      <ColorConverterRow labelKey="tools.color-converter.labels.lch" t={t}>
        <InputCopyable
          value={fields.lch}
          onChange={(v) => {
            setFields((prev) => ({ ...prev, lch: v }));
            updateFromText("lch", v);
          }}
          placeholder={t("tools.color-converter.placeholders.lch")}
          status={invalid.lch ? "error" : undefined}
        />
      </ColorConverterRow>

      <ColorConverterRow labelKey="tools.color-converter.labels.cmyk" t={t}>
        <InputCopyable
          value={fields.cmyk}
          onChange={(v) => {
            setFields((prev) => ({ ...prev, cmyk: v }));
            updateFromText("cmyk", v);
          }}
          placeholder={t("tools.color-converter.placeholders.cmyk")}
          status={invalid.cmyk ? "error" : undefined}
        />
      </ColorConverterRow>

      <ColorConverterRow labelKey="tools.color-converter.labels.name" t={t}>
        <InputCopyable
          value={fields.name}
          readOnly
          placeholder={t("tools.color-converter.placeholders.name")}
        />
      </ColorConverterRow>
    </Card>
  );
}

