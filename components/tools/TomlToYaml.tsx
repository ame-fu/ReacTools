"use client";

import React from "react";
import { parse as parseToml } from "@iarna/toml";
import { stringify as stringifyYaml } from "yaml";
import { FormatTransformer, type ValidationRule } from "@/components/FormatTransformer";
import { useI18n } from "@/lib/i18n/context";

const transformer = (value: string) => {
  if (value.trim() === "") return "";
  try {
    return stringifyYaml(parseToml(value));
  } catch {
    return "";
  }
};

export function TomlToYaml() {
  const { t } = useI18n();
  const rules: ValidationRule[] = React.useMemo(
    () => [
      {
        message: t("tools.toml-to-yaml.invalidToml"),
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
      inputLabel={t("tools.toml-to-yaml.inputLabel")}
      inputPlaceholder={t("tools.toml-to-yaml.inputPlaceholder")}
      outputLabel={t("tools.toml-to-yaml.outputLabel")}
      inputValidationRules={rules}
      transformer={transformer}
    />
  );
}

