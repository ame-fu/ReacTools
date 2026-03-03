"use client";

import React from "react";
import { Card, Form } from "antd";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

function generateNumeronym(word: string): string {
  const wordLength = word.length;
  if (wordLength <= 3) {
    return word;
  }
  const first = word.at(0) ?? "";
  const last = word.at(-1) ?? "";
  return `${first}${wordLength - 2}${last}`;
}

export function NumeronymGenerator() {
  const { t } = useI18n();
  const [word, setWord] = React.useState("");

  const numeronym = React.useMemo(
    () => generateNumeronym(word),
    [word],
  );

  return (
    <Card>
      <Form layout="vertical">
        <Form.Item label={t("tools.numeronym-generator.inputPlaceholder")}>
          <InputCopyable
            value={word}
            onChange={(v) => setWord(v)}
            placeholder={t("tools.numeronym-generator.inputPlaceholder")}
          />
        </Form.Item>

        <Form.Item label={t("tools.numeronym-generator.outputPlaceholder")}>
          <InputCopyable
            value={numeronym}
            readOnly
            placeholder={t("tools.numeronym-generator.outputPlaceholder")}
          />
        </Form.Item>
      </Form>
    </Card>
  );
}

