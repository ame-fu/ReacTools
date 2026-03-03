"use client";

import React from "react";
import { parse as parseYaml } from "yaml";
import { FormatTransformer, type ValidationRule } from "@/components/FormatTransformer";
import { useI18n } from "@/lib/i18n/context";

function transformer(value: string) {
  try {
    const obj = parseYaml(value, { merge: true });
    return obj ? JSON.stringify(obj, null, 3) : "";
  } catch {
    return "";
  }
}

export function YamlToJsonConverter() {
  const { t } = useI18n();
  const rules: ValidationRule[] = React.useMemo(
    () => [
      {
        message: t("tools.yaml-to-json-converter.invalidYaml"),
        validator: (value: string) => {
          if (value.trim() === "") return true;
          try {
            parseYaml(value);
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
      inputLabel={t("tools.yaml-to-json-converter.inputLabel")}
      inputPlaceholder={t("tools.yaml-to-json-converter.inputPlaceholder")}
      outputLabel={t("tools.yaml-to-json-converter.outputLabel")}
      inputValidationRules={rules}
      transformer={transformer}
    />
  );
}

