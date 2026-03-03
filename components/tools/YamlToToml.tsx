"use client";

import React from "react";
import { stringify as stringifyToml } from "@iarna/toml";
import { parse as parseYaml } from "yaml";
import { FormatTransformer, type ValidationRule } from "@/components/FormatTransformer";
import { useI18n } from "@/lib/i18n/context";

const transformer = (value: string) => {
  if (value.trim() === "") return "";
  try {
    const toml = [stringifyToml(parseYaml(value))].flat().join("\n").trim();
    return toml;
  } catch {
    return "";
  }
};

export function YamlToToml() {
  const { t } = useI18n();
  const rules: ValidationRule[] = React.useMemo(
    () => [
      {
        message: t("tools.yaml-to-toml.invalidYaml"),
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
      inputLabel={t("tools.yaml-to-toml.inputLabel")}
      inputPlaceholder={t("tools.yaml-to-toml.inputPlaceholder")}
      outputLabel={t("tools.yaml-to-toml.outputLabel")}
      inputValidationRules={rules}
      transformer={transformer}
    />
  );
}

