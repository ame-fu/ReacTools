"use client";

import React from "react";
import { stringify as stringifyYaml } from "yaml";
import JSON5 from "json5";
import { FormatTransformer, type ValidationRule } from "@/components/FormatTransformer";
import { useI18n } from "@/lib/i18n/context";

const transformer = (value: string) => {
  if (value.trim() === "") return "";
  try {
    return stringifyYaml(JSON5.parse(value));
  } catch {
    return "";
  }
};

export function JsonToYamlConverter() {
  const { t } = useI18n();
  const rules: ValidationRule[] = React.useMemo(
    () => [
      {
        message: t("tools.json-to-yaml-converter.invalidJson"),
        validator: (value: string) => {
          if (value.trim() === "") return true;
          try {
            JSON5.parse(value);
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
      inputLabel={t("tools.json-to-yaml-converter.inputLabel")}
      inputPlaceholder={t("tools.json-to-yaml-converter.inputPlaceholder")}
      outputLabel={t("tools.json-to-yaml-converter.outputLabel")}
      inputValidationRules={rules}
      transformer={transformer}
    />
  );
}

