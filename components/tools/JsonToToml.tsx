"use client";

import React from "react";
import { stringify as stringifyToml } from "@iarna/toml";
import JSON5 from "json5";
import { FormatTransformer, type ValidationRule } from "@/components/FormatTransformer";
import { useI18n } from "@/lib/i18n/context";

const transformer = (value: string) => {
  if (value.trim() === "") return "";
  try {
    const toml = [stringifyToml(JSON5.parse(value))].flat().join("\n").trim();
    return toml;
  } catch {
    return "";
  }
};

export function JsonToToml() {
  const { t } = useI18n();
  const rules: ValidationRule[] = React.useMemo(
    () => [
      {
        message: t("tools.json-to-toml.invalidJson"),
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
      inputLabel={t("tools.json-to-toml.inputLabel")}
      inputPlaceholder={t("tools.json-to-toml.inputPlaceholder")}
      outputLabel={t("tools.json-to-toml.outputLabel")}
      inputValidationRules={rules}
      transformer={transformer}
    />
  );
}

