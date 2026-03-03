"use client";

import React from "react";
import convert from "xml-js";
import { FormatTransformer, type ValidationRule } from "@/components/FormatTransformer";
import { useI18n } from "@/lib/i18n/context";

function isValidXml(value: string) {
  if (value.trim() === "") return true;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(value, "application/xml");
    return doc.getElementsByTagName("parsererror").length === 0;
  } catch {
    return false;
  }
}

const defaultValue = `<a x="1.234" y="It's"/>`;

function transformer(value: string) {
  try {
    return JSON.stringify(convert.xml2js(value, { compact: true }), null, 2);
  } catch {
    return "";
  }
}

export function XmlToJson() {
  const { t } = useI18n();
  const rules: ValidationRule[] = React.useMemo(
    () => [
      {
        message: t("tools.xml-to-json.invalidXml"),
        validator: isValidXml,
      },
    ],
    [t],
  );
  return (
    <FormatTransformer
      inputLabel={t("tools.xml-to-json.inputLabel")}
      inputDefault={defaultValue}
      inputPlaceholder={t("tools.xml-to-json.inputPlaceholder")}
      outputLabel={t("tools.xml-to-json.outputLabel")}
      inputValidationRules={rules}
      transformer={transformer}
    />
  );
}

