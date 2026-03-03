"use client";

import React from "react";
import convert from "xml-js";
import JSON5 from "json5";
import { FormatTransformer, type ValidationRule } from "@/components/FormatTransformer";
import { useI18n } from "@/lib/i18n/context";

const defaultValue = `{"a":{"_attributes":{"x":"1.234","y":"It's"}}}`;

function transformer(value: string) {
  try {
    return convert.js2xml(JSON5.parse(value), { compact: true });
  } catch {
    return "";
  }
}

export function JsonToXml() {
  const { t } = useI18n();
  const rules: ValidationRule[] = React.useMemo(
    () => [
      {
        message: t("tools.json-to-xml.invalidJson"),
        validator: (v: string) => {
          if (v.trim() === "") return true;
          try {
            JSON5.parse(v);
            return true;
          } catch {
            return false;
          }
        },
      },
    ],
    [t],
  );
  return (
    <FormatTransformer
      inputLabel={t("tools.json-to-xml.inputLabel")}
      inputDefault={defaultValue}
      inputPlaceholder={t("tools.json-to-xml.inputPlaceholder")}
      outputLabel={t("tools.json-to-xml.outputLabel")}
      inputValidationRules={rules}
      transformer={transformer}
    />
  );
}

