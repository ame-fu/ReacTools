"use client";

import React from "react";
import { Button, Card, Form } from "antd";
import { evaluate } from "mathjs";
import { InputCopyable } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";

export function MathEvaluator() {
  const { t } = useI18n();
  const [expression, setExpression] = React.useState("");

  const result = React.useMemo(() => {
    if (!expression.trim()) return "";
    try {
      const value = evaluate(expression);
      return value != null ? String(value) : "";
    } catch {
      return "";
    }
  }, [expression]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <Form layout="vertical">
        <Form.Item label={t("tools.math-evaluator.labelExpression")}>
          <InputCopyable
            value={expression}
            onChange={setExpression}
            placeholder={t("tools.math-evaluator.placeholderExpression")}
            multiline
            rows={3}
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>

        {result !== "" && (
          <Form.Item label={t("tools.math-evaluator.labelResult")}>
            <Card
              extra={
                <Button size="small" onClick={handleCopy}>
                  {t("tools.math-evaluator.buttonCopy")}
                </Button>
              }
            >
              <span style={{ fontFamily: "monospace" }}>{result}</span>
            </Card>
          </Form.Item>
        )}
      </Form>
    </div>
  );
}
