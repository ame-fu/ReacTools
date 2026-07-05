"use client";

import React from "react";
import {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  kebabCase,
  noCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase,
  trainCase,
} from "change-case";
import { Card, Input, Form } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

export function CaseConverter() {
  const { t } = useI18n();
  const [input, setInput] = React.useState("lorem ipsum dolor sit amet");

  const formats = React.useMemo(
    () => [
      { id: "lowercase", value: input.toLocaleLowerCase() },
      { id: "uppercase", value: input.toLocaleUpperCase() },
      { id: "camelcase", value: camelCase(input) },
      { id: "capitalcase", value: capitalCase(input) },
      { id: "constantcase", value: constantCase(input) },
      { id: "dotcase", value: dotCase(input) },
      { id: "headercase", value: trainCase(input) },
      { id: "nocase", value: noCase(input) },
      { id: "paramcase", value: kebabCase(input) },
      { id: "pascalcase", value: pascalCase(input) },
      { id: "pathcase", value: pathCase(input) },
      { id: "sentencecase", value: sentenceCase(input) },
      { id: "snakecase", value: snakeCase(input) },
      {
        id: "mockingcase",
        value: input
          .split("")
          .map((char, index) =>
            index % 2 === 0 ? char.toUpperCase() : char.toLowerCase(),
          )
          .join(""),
      },
    ],
    [input],
  );

  return (
    <Card>
      <Form layout="vertical">
        <Form.Item label={t("tools.case-converter.inputLabel")} style={{ marginBottom: 12 }}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("tools.case-converter.inputPlaceholder")}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 8 }}>
          <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />
        </Form.Item>

        {formats.map((f) => (
          <Form.Item key={f.id} label={t(`tools.case-converter.formats.${f.id}`)} style={{ marginBottom: 8 }}>
            <InputCopyable value={f.value} readOnly />
          </Form.Item>
        ))}
      </Form>
    </Card>
  );
}

