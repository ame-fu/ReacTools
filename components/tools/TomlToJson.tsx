"use client";

import React from "react";
import { parse as parseToml } from "@iarna/toml";
import { FormatTransformer, type ValidationRule } from "@/components/FormatTransformer";
import { useI18n } from "@/lib/i18n/context";

const transformer = (value: string) => {
  if (value.trim() === "") return "";
  try {
    return JSON.stringify(parseToml(value), null, 3);
  } catch {
    return "";
  }
};

export function TomlToJson() {
  const { t } = useI18n();
  const rules: ValidationRule[] = React.useMemo(
    () => [
      {
        message: t("tools.toml-to-json.invalidToml"),
        validator: (value: string) => {
          if (value.trim() === "") return true;
          try {
            parseToml(value);
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
      inputLabel={t("tools.toml-to-json.inputLabel")}
      inputPlaceholder={t("tools.toml-to-json.inputPlaceholder")}
      outputLabel={t("tools.toml-to-json.outputLabel")}
      inputValidationRules={rules}
      transformer={transformer}
    />
  );
}

